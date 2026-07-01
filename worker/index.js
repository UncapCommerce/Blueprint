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
//
//   POST /api/auth/sign  →  { token, name, title }
//     Records an Approve & kickoff signature. Persists a record to KV
//     under signature:<blueprintId>:<token> with a 1-year TTL, and emails
//     denis@uncap.com with the signer's name, title, email, timestamp,
//     IP, and user-agent. Admin sessions skip both the KV write and the
//     email; self-test sessions (logged-in email = NOTIFY_EMAIL) write
//     the record but skip the email.

import { EmailMessage } from "cloudflare:email";

const CODE_TTL_SECONDS    = 10 * 60;       // 10 minutes
const SESSION_TTL_SECONDS = 24 * 60 * 60;  // 24 hours

// Per-blueprint email allowlists. If a blueprintId appears here, only the
// listed addresses can request a passcode. Anyone else gets a 403. The
// admin passcode bypass and the @uncap.com team override apply above this
// check, so internal team members can still see every blueprint.
const BLUEPRINT_ALLOWLISTS = {
  benami: [
    'matthewlevy00@gmail.com',
    'benami67@gmail.com',
  ],
  anatomywarehouse: [
    'liz@anatomicalworldwide.com',
    'stuart@anatomywarehouse.com',
  ],
  // Locked to the Uncap team only. An empty allowlist is still truthy, so
  // every external address gets a 403 while the @uncap.com override and the
  // admin passcode continue to bypass the check above.
  sperscientific: [],
  gpscity: [
    'brian@gpscity.com',
    'jordan@gpscity.com',
  ],
  elycattleman: [
    'cstein@elyandwalker.com',
    'mdavis@elyandwalker.com',
  ],
  vivo: [
    'codyh@vivo-us.com',
    'jon.orns@vivo-us.com',
    'nick.stoner@vivo-us.com',
    'kristina.velpel@cknappsales.com',
  ],
};

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
    if (url.pathname === '/api/auth/sign' && request.method === 'POST') {
      return handleSign(request, env, ctx);
    }
    if (url.pathname === '/api/auth/session' && request.method === 'POST') {
      return handleSession(request, env);
    }
    if (url.pathname === '/api/auth/admin/access-log' && request.method === 'POST') {
      return handleAccessLog(request, env);
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

  // Uncap team override: anyone with an @uncap.com email can view every
  // Blueprint, regardless of per-blueprint allowlists below. Same flow
  // as any other client (6-digit code, etc.) — they just aren't gated.
  const isUncapTeam = email.endsWith('@uncap.com');

  // Per-blueprint allowlist enforcement. If this blueprint is private to a
  // named list of clients, reject any other email up front so we never even
  // generate a code for an unauthorised address. Uncap team always passes.
  const allowlist = BLUEPRINT_ALLOWLISTS[blueprintId];
  if (allowlist && !isUncapTeam && !allowlist.includes(email)) {
    return json(403, { ok: false, error: 'This proposal is restricted. Use the email it was sent to.' });
  }

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

  // "Self-test" sessions: any @uncap.com address (the internal team) gets
  // the full code-delivery experience but no notifications about itself
  // viewing or approving. Mirrors the previous NOTIFY_EMAIL-only check
  // and extends it to the rest of the team. Marks the session so
  // handleNotify and handleSign can short-circuit emails too.
  const notifyEmail = (env.NOTIFY_EMAIL || '').trim().toLowerCase();
  const selfTest    = email.endsWith('@uncap.com') || (notifyEmail && email === notifyEmail);

  const token = genToken();
  await env.BLUEPRINT_AUTH.put(
    `session:${token}`,
    JSON.stringify({ email, admin: false, selfTest, blueprintId, ts: Date.now() }),
    { expirationTtl: SESSION_TTL_SECONDS }
  );

  // Persist an access-log record so the admin toolbar can show every
  // login, with timestamp + IP + Cloudflare-derived location + UA.
  // 1-year TTL is plenty for audit purposes. Key shape lets us list
  // by blueprintId prefix and sort by timestamp descending.
  const ts        = Date.now();
  const accessKey = `access:${blueprintId}:${(9_999_999_999_999 - ts).toString(36).padStart(10, '0')}:${genRandSlug()}`;
  const cf        = request.cf || {};
  const accessRec = {
    email,
    blueprintId,
    verifiedAt: new Date(ts).toISOString(),
    ip:        request.headers.get('CF-Connecting-IP') || '',
    country:   cf.country || '',
    city:      cf.city    || '',
    region:    cf.region  || '',
    userAgent: request.headers.get('User-Agent') || '',
    selfTest, admin: false,
  };
  const accessWrite = env.BLUEPRINT_AUTH.put(
    accessKey,
    JSON.stringify(accessRec),
    { expirationTtl: 60 * 60 * 24 * 365 }
  ).catch(() => {});
  if (ctx && ctx.waitUntil) ctx.waitUntil(accessWrite);

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

function genRandSlug() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// Lightweight session lookup — the admin toolbar polls this on mount to
// decide whether to render itself, and to know what to call /admin
// endpoints with. Returns the session record minus internal fields.
async function handleSession(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const token = (body.token || '').toString().trim();
  if (!token) return json(400, { ok: false, error: 'Missing token' });

  const raw = await env.BLUEPRINT_AUTH.get(`session:${token}`);
  if (!raw) return json(401, { ok: false, error: 'Session expired' });
  const sess = JSON.parse(raw);
  return json(200, {
    ok: true,
    email:       sess.email || '',
    admin:       !!sess.admin,
    selfTest:    !!sess.selfTest,
    blueprintId: sess.blueprintId || '',
  });
}

// Returns the access log for a given blueprintId — verification events
// and signature events sorted newest-first. Only callable by admin or
// self-test sessions (the @uncap.com team override). Anyone else
// gets a 403.
async function handleAccessLog(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const token       = (body.token || '').toString().trim();
  const blueprintId = normalizeBlueprintId(body.blueprintId);
  if (!token) return json(400, { ok: false, error: 'Missing token' });

  const raw = await env.BLUEPRINT_AUTH.get(`session:${token}`);
  if (!raw) return json(401, { ok: false, error: 'Session expired' });
  const sess = JSON.parse(raw);
  if (!sess.admin && !sess.selfTest) return json(403, { ok: false, error: 'Not authorised' });

  // List up to 200 events of each type. KV keys for access events are
  // prefixed with the inverted timestamp so a plain prefix scan returns
  // them already sorted newest-first. Signature events don't carry the
  // inverted prefix (we want to keep the existing key shape stable for
  // audit), so we sort them in-memory.
  const [accessList, signList] = await Promise.all([
    env.BLUEPRINT_AUTH.list({ prefix: `access:${blueprintId}:`, limit: 200 }),
    env.BLUEPRINT_AUTH.list({ prefix: `signature:${blueprintId}:`, limit: 200 }),
  ]);

  const accessEvents = await Promise.all(
    accessList.keys.map((k) => env.BLUEPRINT_AUTH.get(k.name).then((v) => {
      if (!v) return null;
      try { return { type: 'view', ...JSON.parse(v) }; } catch { return null; }
    }))
  );
  const signEvents = await Promise.all(
    signList.keys.map((k) => env.BLUEPRINT_AUTH.get(k.name).then((v) => {
      if (!v) return null;
      try { return { type: 'sign', ...JSON.parse(v) }; } catch { return null; }
    }))
  );

  const events = [...accessEvents.filter(Boolean), ...signEvents.filter(Boolean)]
    .sort((a, b) => {
      const ta = new Date(a.verifiedAt || a.signedAt || 0).getTime();
      const tb = new Date(b.verifiedAt || b.signedAt || 0).getTime();
      return tb - ta;
    });

  return json(200, { ok: true, blueprintId, events });
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

// Records an Approve & kickoff signature. Writes a permanent KV record
// (1-year TTL) under signature:<blueprintId>:<token> and sends a richer
// notification email to denis@uncap.com that includes the signer's name,
// title, email, timestamp, IP, and user-agent.
//
// Skip rules:
//   - admin sessions   → no KV write, no email (we don't want admin
//                        previews polluting the audit log either).
//   - self-test session → KV record IS written, no email. Lets denis
//                        rehearse the full flow and verify the record
//                        without inbox spam.
async function handleSign(request, env, ctx) {
  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  const token = (body.token || '').toString().trim();
  const name  = (body.name  || '').toString().trim().slice(0, 200);
  const title = (body.title || '').toString().trim().slice(0, 200);
  if (!token)        return json(400, { ok: false, error: 'Missing token' });
  if (!name || !title) return json(400, { ok: false, error: 'Both fields required' });

  const raw = await env.BLUEPRINT_AUTH.get(`session:${token}`);
  if (!raw) return json(401, { ok: false, error: 'Session expired' });
  const sess = JSON.parse(raw);

  if (sess.admin) return json(200, { ok: true, skipped: 'admin' });

  const ip        = request.headers.get('CF-Connecting-IP') || '';
  const userAgent = request.headers.get('User-Agent') || '';
  const signedAt  = new Date().toISOString();

  const record = {
    blueprintId: sess.blueprintId,
    email:       sess.email,
    name, title,
    signedAt, ip, userAgent,
  };

  // Persist the signature record. 1-year TTL is long enough for any
  // contract follow-up; KV will lazily evict it after that.
  try {
    await env.BLUEPRINT_AUTH.put(
      `signature:${sess.blueprintId}:${token}`,
      JSON.stringify(record),
      { expirationTtl: 60 * 60 * 24 * 365 }
    );
  } catch (err) {
    return json(502, { ok: false, error: `Could not record signature: ${err.message || 'unknown'}` });
  }

  // Self-test sessions write the record but never email.
  if (sess.selfTest) return json(200, { ok: true, skipped: 'self-test' });

  const subject = `[Blueprint] ${sess.blueprintId} APPROVED by ${name} (${sess.email})`;
  const text =
    `Approval recorded for /${sess.blueprintId}/.\n\n` +
    `Signer: ${name}\n` +
    `Title:  ${title}\n` +
    `Email:  ${sess.email}\n` +
    `Time:   ${signedAt}\n` +
    `IP:     ${ip}\n` +
    `Agent:  ${userAgent}\n`;

  try {
    await notifyAdmin(env, { subject, text });
    return json(200, { ok: true });
  } catch (err) {
    // Record is already in KV; treat email failure as a 200 with a soft
    // warning so the client still gets confirmation. The signature stays.
    return json(200, { ok: true, emailError: err.message || 'send failed' });
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

// Internal recipients for every Blueprint notification (view + sign).
// Hardcoded here rather than read from env because the deploy runs with
// `wrangler deploy --keep-vars`, so wrangler.toml var edits don't take
// effect — the dashboard vars win. Any addresses set in env.NOTIFY_EMAIL
// (comma-separated) are merged in on top, deduped.
const NOTIFY_RECIPIENTS = ['denis@uncap.com', 'ryan@uncap.com'];

function notifyRecipients(env) {
  const fromEnv = (env.NOTIFY_EMAIL || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const all = [...NOTIFY_RECIPIENTS.map((s) => s.toLowerCase()), ...fromEnv];
  return [...new Set(all)];
}

async function notifyAdmin(env, { subject, text }) {
  const html = `<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>`;
  const recipients = notifyRecipients(env);
  // Cloudflare's send_email binding delivers to one envelope recipient
  // per message, so fan out one email per recipient. Use allSettled so a
  // single failed/unverified destination doesn't suppress the others.
  const results = await Promise.allSettled(
    recipients.map((to) => sendViaCloudflareEmail(env, { to, subject, text, html }))
  );
  // If every send failed, surface the first error so the caller can react.
  if (results.length && results.every((r) => r.status === 'rejected')) {
    throw results[0].reason || new Error('All notification sends failed');
  }
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
