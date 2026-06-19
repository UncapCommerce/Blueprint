// Cloudflare Worker entry point.
// Three blueprint-auth endpoints + a static-asset fallback.
//
//   POST /api/auth/request-code  →  { email, blueprintId }
//     Generates a 6-digit code, stashes it in KV with a 10-minute TTL,
//     emails it via Cloudflare's send_email binding. If the email field
//     contains the admin passcode, returns an admin session token
//     immediately (no code step, no notification).
//
//   POST /api/auth/verify  →  { email, code, blueprintId }
//     Checks the stored code, deletes it, mints a 24-hour session token,
//     and fires a "viewed" notification to denis@uncap.com.
//
//   POST /api/auth/notify  →  { token, event: 'view' | 'approve' }
//     Sends a notification to denis@uncap.com. Admin sessions skip.

import { EmailMessage } from "cloudflare:email";

const CODE_TTL_SECONDS    = 10 * 60;       // 10 minutes
const SESSION_TTL_SECONDS = 24 * 60 * 60;  // 24 hours

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/auth/request-code' && request.method === 'POST') {
      return handleRequestCode(request, env);
    }
    if (url.pathname === '/api/auth/verify' && request.method === 'POST') {
      return handleVerify(request, env, ctx);
    }
    if (url.pathname === '/api/auth/notify' && request.method === 'POST') {
      return handleNotify(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

function genCode() {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(buf[0] % 1_000_000).padStart(6, '0');
}

function genToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function normalizeBlueprintId(raw) {
  return (raw || 'unknown').toString().trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'unknown';
}

// ----------------------------------------------------------------------------
// Handlers
// ----------------------------------------------------------------------------
async function handleRequestCode(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  const emailRaw    = (body.email || '').toString().trim();
  const blueprintId = normalizeBlueprintId(body.blueprintId);
  if (!emailRaw) return json(400, { ok: false, error: 'Enter an email' });

  // Admin bypass: typing the admin passcode where the email goes returns
  // a session token straight away. No 6-digit code step, no notification.
  if (env.ADMIN_PASSCODE && emailRaw === env.ADMIN_PASSCODE) {
    const token = genToken();
    await env.BLUEPRINT_AUTH.put(
      `session:${token}`,
      JSON.stringify({ email: 'admin@uncap.com', admin: true, blueprintId, ts: Date.now() }),
      { expirationTtl: SESSION_TTL_SECONDS }
    );
    return json(200, { ok: true, admin: true, token });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) {
    return json(400, { ok: false, error: 'Enter a valid email' });
  }
  const email = emailRaw.toLowerCase();
  const code  = genCode();
  await env.BLUEPRINT_AUTH.put(
    `code:${blueprintId}:${email}`,
    code,
    { expirationTtl: CODE_TTL_SECONDS }
  );

  try {
    await sendCodeEmail(env, { to: email, code, blueprintId });
    return json(200, { ok: true });
  } catch (err) {
    return json(502, { ok: false, error: `Could not send code: ${err.message || 'unknown error'}` });
  }
}

async function handleVerify(request, env, ctx) {
  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  const email       = (body.email || '').toString().trim().toLowerCase();
  const code        = (body.code  || '').toString().trim();
  const blueprintId = normalizeBlueprintId(body.blueprintId);
  if (!email || !code) return json(400, { ok: false, error: 'Enter your code' });

  const key    = `code:${blueprintId}:${email}`;
  const stored = await env.BLUEPRINT_AUTH.get(key);
  if (!stored || stored !== code) {
    return json(401, { ok: false, error: 'Wrong code — try again or request a new one.' });
  }
  await env.BLUEPRINT_AUTH.delete(key);

  // "Self-test" sessions: when the logged-in email IS the notification
  // recipient (e.g. denis@uncap.com testing the customer flow), we want
  // the full code-delivery experience but no notifications about himself
  // viewing or approving. Marks the session so handleNotify can short-
  // circuit too.
  const notifyEmail = (env.NOTIFY_EMAIL || '').trim().toLowerCase();
  const selfTest    = notifyEmail && email === notifyEmail;

  const token = genToken();
  await env.BLUEPRINT_AUTH.put(
    `session:${token}`,
    JSON.stringify({ email, admin: false, selfTest, blueprintId, ts: Date.now() }),
    { expirationTtl: SESSION_TTL_SECONDS }
  );

  // Fire-and-forget admin notification — don't block the response on the
  // email send so the client unlocks even if the SMTP path is slow. Skip
  // entirely for self-test sessions so we don't notify ourselves.
  if (!selfTest) {
    const notify = notifyAdmin(env, {
      subject: `[Blueprint] ${blueprintId} viewed by ${email}`,
      text:    `${email} just unlocked the Blueprint at /${blueprintId}/.`,
    }).catch(() => {});
    if (ctx && ctx.waitUntil) ctx.waitUntil(notify);
  }

  return json(200, { ok: true, token });
}

async function handleNotify(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  const token = (body.token || '').toString().trim();
  const event = (body.event || '').toString().trim();
  if (!token || !event) return json(400, { ok: false, error: 'Missing token or event' });

  const raw = await env.BLUEPRINT_AUTH.get(`session:${token}`);
  if (!raw) return json(401, { ok: false, error: 'Session expired' });
  const sess = JSON.parse(raw);

  // Admins are us — don't spam denis@uncap.com with notifications on our
  // own preview clicks. Same for self-test sessions where the logged-in
  // email is denis@uncap.com itself (mirrors the skip in handleVerify).
  if (sess.admin)    return json(200, { ok: true, skipped: 'admin' });
  if (sess.selfTest) return json(200, { ok: true, skipped: 'self-test' });

  const subject = event === 'approve'
    ? `[Blueprint] ${sess.blueprintId} APPROVED by ${sess.email}`
    : `[Blueprint] ${sess.blueprintId} viewed by ${sess.email}`;
  const text = event === 'approve'
    ? `${sess.email} just clicked Approve & kickoff on /${sess.blueprintId}/.`
    : `${sess.email} just viewed /${sess.blueprintId}/.`;

  try {
    await notifyAdmin(env, { subject, text });
    return json(200, { ok: true });
  } catch (err) {
    return json(502, { ok: false, error: err.message || 'send failed' });
  }
}

// ----------------------------------------------------------------------------
// Email senders — both routes go through Cloudflare's send_email binding.
//
// Important constraint: send_email is restricted to addresses that are
// already registered + verified as destination addresses in Cloudflare
// Email Routing on the worker's zone. Sends to unverified addresses
// fail with an error from Cloudflare's side.
// ----------------------------------------------------------------------------

async function sendCodeEmail(env, { to, code, blueprintId }) {
  const subject = `Your Uncap Blueprint passcode`;
  const text =
    `Your 6-digit passcode to view the Uncap Blueprint:\n\n` +
    `${code}\n\n` +
    `Valid for 10 minutes. If you didn't request this, you can ignore the email.`;
  const html = `
    <div style="font-family:-apple-system,Inter,Arial,sans-serif;color:#0A0A0A;line-height:1.5;max-width:480px;margin:0 auto;padding:32px 24px;background:#F2EFE7;">
      <div style="font-family:monospace;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#707070;margin-bottom:24px;">Uncap Blueprint · Passcode</div>
      <p style="font-size:16px;margin:0 0 16px;">Your 6-digit passcode to view the Blueprint:</p>
      <p style="font-family:monospace;font-size:34px;letter-spacing:8px;font-weight:700;margin:0 0 24px;background:#FFFFFF;border-radius:8px;padding:20px 24px;text-align:center;color:#0A0A0A;">${escapeHtml(code)}</p>
      <p style="font-size:13px;color:#707070;margin:0;">Valid for 10 minutes. If you didn't request this, you can ignore the email.</p>
    </div>`;
  await sendViaCloudflareEmail(env, { to, subject, text, html });
}

async function notifyAdmin(env, { subject, text }) {
  const to   = env.NOTIFY_EMAIL || 'denis@uncap.com';
  const html = `<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>`;
  await sendViaCloudflareEmail(env, { to, subject, text, html });
}

async function sendViaCloudflareEmail(env, { to, subject, text, html }) {
  if (!env.NOTIFY_MAIL) {
    throw new Error('NOTIFY_MAIL binding is not configured');
  }
  const from = parseAddress(env.EMAIL_FROM || 'Uncap Blueprint <noreply@uncap.com>');
  const boundary = '----=_Part_' + crypto.randomUUID();
  const headers = [
    `From: ${from.display ? `"${from.display}" <${from.address}>` : from.address}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Message-ID: <${crypto.randomUUID()}@uncap.com>`,
    `Date: ${new Date().toUTCString()}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ].join('\r\n');
  const parts = [
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    b64utf8(text),
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    b64utf8(html),
    `--${boundary}--`,
    ``,
  ].join('\r\n');
  await env.NOTIFY_MAIL.send(new EmailMessage(from.address, to, headers + '\r\n\r\n' + parts));
}

function parseAddress(input) {
  const trimmed = (input || '').trim();
  if (!trimmed) return { display: '', address: '' };
  const m = trimmed.match(/^\s*(.+?)\s*<([^>]+)>\s*$/);
  if (m) return { display: m[1].replace(/^"|"$/g, ''), address: m[2].trim() };
  return { display: '', address: trimmed };
}

function b64utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/(.{76})/g, '$1\r\n');
}
