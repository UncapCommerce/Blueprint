// Cloudflare Worker entry point.
// Three blueprint-auth endpoints + a static-asset fallback.
//
//   POST /api/auth/request-code  →  { email, blueprintId }
//     Generates a 6-digit code, stashes it in KV with a 10-minute TTL,
//     emails it via Cloudflare's send_email binding.
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
//
//   POST /api/auth/my-signature  →  { token }
//     Returns the caller's own signature record, if any, keyed by their
//     exact session token — lets a client who just signed download their
//     own signed copy without needing admin/self-test privileges.

import { EmailMessage } from "cloudflare:email";

const CODE_TTL_SECONDS    = 10 * 60;       // 10 minutes
const SESSION_TTL_SECONDS = 24 * 60 * 60;  // 24 hours

// Per-blueprint email allowlists. If a blueprintId appears here, only the
// listed addresses can request a passcode. Anyone else gets a 403. The
// @uncap.com team override applies above this check, so internal team
// members can still see every blueprint.
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
  // every external address gets a 403 while the @uncap.com override
  // continues to bypass the check above.
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
    if (url.pathname === '/api/auth/my-signature' && request.method === 'POST') {
      return handleMySignature(request, env);
    }

    // ── Admin application API (Google-authenticated Uncap team) ──────────
    if (url.pathname === '/api/admin/config' && request.method === 'GET') {
      return handleAdminConfig(env);
    }
    if (url.pathname === '/api/admin/google-login' && request.method === 'POST') {
      return handleGoogleLogin(request, env);
    }
    if (url.pathname === '/api/admin/me' && request.method === 'GET') {
      return handleAdminMe(request, env);
    }
    if (url.pathname === '/api/admin/logout' && request.method === 'POST') {
      return handleAdminLogout(request, env);
    }
    if (url.pathname === '/api/admin/blueprints' && request.method === 'GET') {
      return handleAdminBlueprints(request, env);
    }
    if (url.pathname === '/api/admin/blueprints' && request.method === 'POST') {
      return handleAdminCreateBlueprint(request, env);
    }
    if (url.pathname === '/api/admin/blueprint-meta' && request.method === 'POST') {
      return handleAdminBlueprintMeta(request, env);
    }
    if (url.pathname === '/api/admin/access-log' && request.method === 'GET') {
      return handleAdminAccessLog(request, env);
    }
    if (url.pathname === '/api/admin/bp-token' && request.method === 'POST') {
      return handleAdminBpToken(request, env);
    }
    if (url.pathname === '/api/admin/discoveries' && request.method === 'GET') {
      return handleAdminListDiscoveries(request, env);
    }
    if (url.pathname === '/api/admin/discoveries' && request.method === 'POST') {
      return handleAdminCreateDiscovery(request, env);
    }
    if (url.pathname === '/api/admin/blueprint-tos' && request.method === 'GET') {
      return handleAdminGetTos(request, env);
    }
    if (url.pathname === '/api/admin/blueprint-tos' && request.method === 'POST') {
      return handleAdminSaveTos(request, env);
    }
    // Public read so a blueprint page itself (sign modal, print modes) can
    // pull the current custom Terms of Service text — not sensitive, just
    // legal copy, so no session is required here.
    if (url.pathname === '/api/blueprint-tos' && request.method === 'GET') {
      return handlePublicTos(request, env);
    }

    // Disabled blueprints: block the page document for anyone without an
    // admin session. Only fires on the blueprint index paths themselves,
    // so regular asset traffic never pays the KV lookup.
    if (request.method === 'GET') {
      const m = url.pathname.match(/^\/([A-Za-z0-9-]+)\/(?:index\.html)?$/);
      const entry = m && BLUEPRINT_REGISTRY.find((b) => b.dir === m[1]);
      if (entry) {
        const meta = await getBpMeta(env, entry.id);
        if (meta.disabled) {
          const adminSess = await getAdminSession(request, env);
          if (!adminSess) return disabledBlueprintPage();
        }
      }
    }

    return env.ASSETS.fetch(request);
  },
};

function disabledBlueprintPage() {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex,nofollow"/><title>Uncap Blueprint</title>
<style>html,body{margin:0;height:100%;background:#F2EFE7;-webkit-font-smoothing:antialiased}
body{display:flex;align-items:center;justify-content:center;font-family:Inter,-apple-system,sans-serif;color:#0A0A0A}
.card{max-width:420px;padding:40px 32px;text-align:center}
.eyebrow{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#8A8780;margin-bottom:14px}
h1{font-size:24px;letter-spacing:-.02em;margin:0 0 10px}p{font-size:14.5px;line-height:1.55;color:#4A4A4A;margin:0}</style>
</head><body><div class="card"><div class="eyebrow">Uncap Blueprint</div>
<h1>This proposal is no longer available.</h1>
<p>The link has been deactivated. If you believe this is a mistake, contact your Uncap lead or email hey@uncap.com.</p>
</div></body></html>`;
  return new Response(html, { status: 403, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}

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

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) {
    return json(400, { ok: false, error: 'Enter a valid email' });
  }
  const email = emailRaw.toLowerCase();

  // Uncap team override: anyone with an @uncap.com email can view every
  // Blueprint, regardless of per-blueprint allowlists below. Same flow
  // as any other client (6-digit code, etc.) — they just aren't gated.
  const isUncapTeam = email.endsWith('@uncap.com');

  // Disabled blueprints reject client logins outright (set from the
  // admin app). The team can still get in to review.
  const bpMeta = await getBpMeta(env, blueprintId);
  if (bpMeta.disabled && !isUncapTeam) {
    return json(403, { ok: false, error: 'This proposal is no longer available.' });
  }

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

  // Mirror the request-code disabled check: a code issued moments before
  // the blueprint was disabled must not still mint a session.
  const bpMeta = await getBpMeta(env, blueprintId);
  if (bpMeta.disabled && !email.endsWith('@uncap.com')) {
    return json(403, { ok: false, error: 'This proposal is no longer available.' });
  }

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

  // Persist an access-log record so the admin app can show every client
  // login, with timestamp + IP + Cloudflare-derived location + UA.
  // 1-year TTL is plenty for audit purposes. Key shape lets us list
  // by blueprintId prefix and sort by timestamp descending. Uncap team
  // logins (selfTest) are not tracked — the activity log is for client
  // views only.
  if (!selfTest) {
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
  }

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

  const events = await listBlueprintEvents(env, blueprintId);
  return json(200, { ok: true, blueprintId, events });
}

// Lets a signer fetch their own signature record so they can download a
// signed copy without any admin privilege — the signature record is keyed
// by the exact session token that signed it (signature:<blueprintId>:<token>),
// so this can only ever return the caller's own signature, never anyone
// else's.
async function handleMySignature(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const token = (body.token || '').toString().trim();
  if (!token) return json(400, { ok: false, error: 'Missing token' });

  const raw = await env.BLUEPRINT_AUTH.get(`session:${token}`);
  if (!raw) return json(401, { ok: false, error: 'Session expired' });
  const sess = JSON.parse(raw);

  const sigRaw = await env.BLUEPRINT_AUTH.get(`signature:${sess.blueprintId}:${token}`);
  if (!sigRaw) return json(200, { ok: true, signature: null });
  try {
    return json(200, { ok: true, signature: JSON.parse(sigRaw) });
  } catch {
    return json(200, { ok: true, signature: null });
  }
}

// List up to 200 events of each type for a blueprint — verification
// events and signature events merged, newest-first. KV keys for access
// events are prefixed with the inverted timestamp so a plain prefix scan
// returns them already sorted; signature events don't carry the inverted
// prefix (the existing key shape stays stable for audit), so we sort
// in-memory.
async function listBlueprintEvents(env, blueprintId) {
  const [accessList, signList] = await Promise.all([
    env.BLUEPRINT_AUTH.list({ prefix: `access:${blueprintId}:`, limit: 200 }),
    env.BLUEPRINT_AUTH.list({ prefix: `signature:${blueprintId}:`, limit: 200 }),
  ]);

  const accessEvents = await Promise.all(
    accessList.keys.map((k) => env.BLUEPRINT_AUTH.get(k.name).then((v) => {
      if (!v) return null;
      try {
        const rec = JSON.parse(v);
        // Uncap team logins aren't tracked anymore; hide the ones
        // recorded before that change too.
        if (rec.selfTest || (rec.email || '').endsWith('@uncap.com')) return null;
        return { type: 'view', ...rec };
      } catch { return null; }
    }))
  );
  const signEvents = await Promise.all(
    signList.keys.map((k) => env.BLUEPRINT_AUTH.get(k.name).then((v) => {
      if (!v) return null;
      try { return { type: 'sign', ...JSON.parse(v) }; } catch { return null; }
    }))
  );

  return [...accessEvents.filter(Boolean), ...signEvents.filter(Boolean)]
    .sort((a, b) => {
      const ta = new Date(a.verifiedAt || a.signedAt || 0).getTime();
      const tb = new Date(b.verifiedAt || b.signedAt || 0).getTime();
      return tb - ta;
    });
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

  // Best-effort rollup so the admin app's blueprint list can show signed
  // status with a single get instead of a prefix scan per blueprint.
  const rollup = env.BLUEPRINT_AUTH.put(
    `bpsigned:${sess.blueprintId}`,
    JSON.stringify(record),
    { expirationTtl: 60 * 60 * 24 * 365 }
  ).catch(() => {});
  if (ctx && ctx.waitUntil) ctx.waitUntil(rollup);

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
// Admin application — Google-authenticated area for the Uncap team.
//
// The root page (blueprint.uncap.com/) is the admin app. Sign-in is Google
// Identity Services: the page posts Google's ID token (a JWT) here, we
// verify the signature against Google's JWKS, require a verified
// @uncap.com address, and mint a KV-backed session carried by an HttpOnly
// bp_admin cookie. Because the cookie is scoped to the whole origin, the
// per-client blueprint gates can also mint preview sessions from it
// (POST /api/admin/bp-token), letting the team open any blueprint without
// the email-code step.
// ----------------------------------------------------------------------------

const ADMIN_SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Google OAuth "Web application" Client ID. This is a public identifier
// (it ships in the login page HTML anyway), so hardcoding is safe — and
// necessary, because deploys run `wrangler deploy --keep-vars`, meaning
// wrangler.toml var edits never reach the running worker. A
// GOOGLE_CLIENT_ID var set in the Cloudflare dashboard wins over this.
const GOOGLE_CLIENT_ID_FALLBACK = '';

function getGoogleClientId(env) {
  return ((env.GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID_FALLBACK) + '').trim();
}

// Registry of shipped blueprints (the static folders under public/).
// Drafts created from the admin app live in KV under bp:<slug> and are
// appended to this list by handleAdminBlueprints.
const BLUEPRINT_REGISTRY = [
  { id: 'mitutoyo',         dir: 'Mitutoyo',         name: 'Mitutoyo',          num: '001' },
  { id: 'wichelt',          dir: 'wichelt',          name: 'Wichelt Imports',   num: '002' },
  { id: 'elevateoralcare',  dir: 'ElevateOralCare',  name: 'Elevate Oral Care', num: '003' },
  { id: 'valveman',         dir: 'ValveMan',         name: 'ValveMan',          num: '004' },
  { id: 'benami',           dir: 'Ben-Ami',          name: 'Ben-Ami',           num: '005' },
  { id: 'anatomywarehouse', dir: 'AnatomyWarehouse', name: 'Anatomy Warehouse', num: '006' },
  { id: 'sperscientific',   dir: 'SperScientific',   name: 'Sper Scientific',   num: '007' },
  { id: 'gpscity',          dir: 'GPSCity',          name: 'GPS City',          num: '008' },
  { id: 'tucsonalternator', dir: 'TucsonAlternator', name: 'Tucson Alternator', num: '009' },
  { id: 'elycattleman',     dir: 'ElyCattleman',     name: 'Ely Cattleman',     num: '010' },
  { id: 'vivo',             dir: 'VIVO',             name: 'VIVO',              num: '011' },
];

function getCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  const m = header.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? m[1] : '';
}

// Cheap CSRF guard for cookie-authenticated mutations: browsers attach an
// Origin header to cross-site POSTs, so reject anything not from our host.
function sameOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; }
  catch { return false; }
}

async function getAdminSession(request, env) {
  const token = getCookie(request, 'bp_admin');
  if (!/^[a-f0-9]{48}$/.test(token)) return null;
  const raw = await env.BLUEPRINT_AUTH.get(`admin_session:${token}`);
  if (!raw) return null;
  try { return { token, ...JSON.parse(raw) }; } catch { return null; }
}

function handleAdminConfig(env) {
  return json(200, { ok: true, googleClientId: getGoogleClientId(env) });
}

// Per-blueprint operational metadata (bpmeta:<id>): expiration date and
// the disabled switch. Applies to shipped blueprints and drafts alike.
async function getBpMeta(env, id) {
  const raw = await env.BLUEPRINT_AUTH.get(`bpmeta:${id}`);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

// expiresAt is a YYYY-MM-DD date; the blueprint stays valid through the
// end of that day (UTC).
function isBpExpired(meta) {
  if (!meta || !meta.expiresAt) return false;
  const t = Date.parse(meta.expiresAt + 'T23:59:59Z');
  return Number.isFinite(t) && Date.now() > t;
}

async function handleAdminBlueprintMeta(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });

  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  const id = normalizeBlueprintId(body.blueprintId);
  const known = BLUEPRINT_REGISTRY.some((b) => b.id === id) || !!(await env.BLUEPRINT_AUTH.get(`bp:${id}`));
  if (!known) return json(404, { ok: false, error: 'Unknown blueprint' });

  const meta = await getBpMeta(env, id);
  if (typeof body.expiresAt !== 'undefined') {
    const expiresAt = (body.expiresAt || '').toString().trim();
    if (expiresAt && !/^\d{4}-\d{2}-\d{2}$/.test(expiresAt)) {
      return json(400, { ok: false, error: 'Expiration must be a YYYY-MM-DD date' });
    }
    meta.expiresAt = expiresAt;
  }
  if (typeof body.disabled !== 'undefined') {
    meta.disabled = !!body.disabled;
  }
  meta.updatedAt = new Date().toISOString();
  meta.updatedBy = sess.email;

  await env.BLUEPRINT_AUTH.put(`bpmeta:${id}`, JSON.stringify(meta));
  return json(200, { ok: true, meta: { expiresAt: meta.expiresAt || '', disabled: !!meta.disabled, expired: isBpExpired(meta) } });
}

// Per-blueprint Terms of Service override (bptos:<id>): a single plain-text
// block that, when set, replaces the standard Master Services Agreement
// body wherever that blueprint's terms are shown (sign modal, print
// modes). Empty/unset means "use the standard MSA text" — nothing changes
// for a blueprint that's never had this edited.
async function handleAdminGetTos(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  const id = normalizeBlueprintId(new URL(request.url).searchParams.get('bp'));
  const text = (await env.BLUEPRINT_AUTH.get(`bptos:${id}`)) || '';
  return json(200, { ok: true, blueprintId: id, text });
}

async function handleAdminSaveTos(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });

  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  const id = normalizeBlueprintId(body.blueprintId);
  const known = BLUEPRINT_REGISTRY.some((b) => b.id === id) || !!(await env.BLUEPRINT_AUTH.get(`bp:${id}`));
  if (!known) return json(404, { ok: false, error: 'Unknown blueprint' });

  const text = (body.text || '').toString().slice(0, 50_000);
  if (text) {
    await env.BLUEPRINT_AUTH.put(`bptos:${id}`, text);
  } else {
    await env.BLUEPRINT_AUTH.delete(`bptos:${id}`);
  }
  return json(200, { ok: true, blueprintId: id, text });
}

async function handlePublicTos(request, env) {
  const id = normalizeBlueprintId(new URL(request.url).searchParams.get('bp'));
  const text = (await env.BLUEPRINT_AUTH.get(`bptos:${id}`)) || '';
  return json(200, { ok: true, blueprintId: id, text });
}

// In-memory JWKS cache. Workers isolates live long enough that this saves
// a Google fetch on most logins; a kid miss forces a refresh so key
// rotation self-heals.
let googleJwks = { keys: null, fetchedAt: 0 };

function b64urlToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : '';
  const bin = atob(s + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function verifyGoogleIdToken(credential, clientId) {
  const parts = (credential || '').split('.');
  if (parts.length !== 3) throw new Error('Malformed credential');
  const dec = new TextDecoder();
  const header  = JSON.parse(dec.decode(b64urlToBytes(parts[0])));
  const payload = JSON.parse(dec.decode(b64urlToBytes(parts[1])));

  const now = Date.now();
  const stale = !googleJwks.keys || now - googleJwks.fetchedAt > 60 * 60 * 1000;
  const kidMissing = googleJwks.keys && !googleJwks.keys.some((k) => k.kid === header.kid);
  if (stale || kidMissing) {
    const resp = await fetch('https://www.googleapis.com/oauth2/v3/certs');
    if (!resp.ok) throw new Error('Could not fetch Google signing keys');
    const jwks = await resp.json();
    googleJwks = { keys: jwks.keys || [], fetchedAt: now };
  }
  const jwk = googleJwks.keys.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error('Unknown signing key');

  const key = await crypto.subtle.importKey(
    'jwk', jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['verify']
  );
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5', key,
    b64urlToBytes(parts[2]),
    new TextEncoder().encode(parts[0] + '.' + parts[1])
  );
  if (!valid) throw new Error('Invalid signature');

  if (payload.aud !== clientId) throw new Error('Token audience mismatch');
  if (payload.iss !== 'https://accounts.google.com' && payload.iss !== 'accounts.google.com') {
    throw new Error('Unexpected token issuer');
  }
  if ((payload.exp || 0) * 1000 < now - 60_000) throw new Error('Token expired');
  if (!payload.email || payload.email_verified !== true) throw new Error('Email not verified');
  return payload;
}

async function handleGoogleLogin(request, env) {
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });
  const clientId = getGoogleClientId(env);
  if (!clientId) return json(503, { ok: false, error: 'Google login is not configured yet' });

  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  let payload;
  try { payload = await verifyGoogleIdToken((body.credential || '').toString(), clientId); }
  catch (err) { return json(401, { ok: false, error: err.message || 'Could not verify Google sign-in' }); }

  const email = payload.email.toLowerCase();
  if (!email.endsWith('@uncap.com')) {
    return json(403, { ok: false, error: 'Reserved for the Uncap team (@uncap.com).' });
  }

  const token = genToken();
  await env.BLUEPRINT_AUTH.put(
    `admin_session:${token}`,
    JSON.stringify({ email, name: payload.name || '', picture: payload.picture || '', ts: Date.now() }),
    { expirationTtl: ADMIN_SESSION_TTL_SECONDS }
  );

  return new Response(JSON.stringify({ ok: true, email, name: payload.name || '', picture: payload.picture || '' }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'set-cookie': `bp_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${ADMIN_SESSION_TTL_SECONDS}`,
    },
  });
}

async function handleAdminMe(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  return json(200, { ok: true, email: sess.email, name: sess.name || '', picture: sess.picture || '' });
}

async function handleAdminLogout(request, env) {
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });
  const token = getCookie(request, 'bp_admin');
  if (/^[a-f0-9]{48}$/.test(token)) {
    await env.BLUEPRINT_AUTH.delete(`admin_session:${token}`).catch(() => {});
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'set-cookie': 'bp_admin=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    },
  });
}

// List every blueprint (shipped registry + KV drafts) with its signature
// status. Signature status prefers the bpsigned:<id> rollup that
// handleSign maintains; older signatures that predate the rollup fall
// back to a prefix scan.
async function handleAdminBlueprints(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });

  const items = BLUEPRINT_REGISTRY.map((bp) => ({ ...bp, kind: 'live', signature: null }));

  const draftList = await env.BLUEPRINT_AUTH.list({ prefix: 'bp:', limit: 100 });
  const draftRecs = await Promise.all(draftList.keys.map((k) => env.BLUEPRINT_AUTH.get(k.name)));
  for (const raw of draftRecs) {
    if (!raw) continue;
    try {
      const rec = JSON.parse(raw);
      items.push({
        id: rec.id, dir: '', name: rec.name, num: '', kind: 'draft', signature: null,
        website: rec.website || '', leadClient: rec.leadClient || '', address: rec.address || '',
        createdAt: rec.createdAt || '', createdBy: rec.createdBy || '',
      });
    } catch { /* skip corrupt record */ }
  }

  await Promise.all(items.map(async (i) => {
    const meta = await getBpMeta(env, i.id);
    i.expiresAt = meta.expiresAt || '';
    i.disabled  = !!meta.disabled;
    i.expired   = isBpExpired(meta);

    if (i.kind !== 'live') return;
    const rollup = await env.BLUEPRINT_AUTH.get(`bpsigned:${i.id}`);
    if (rollup) { try { i.signature = JSON.parse(rollup); return; } catch { /* fall through */ } }
    const list = await env.BLUEPRINT_AUTH.list({ prefix: `signature:${i.id}:`, limit: 10 });
    if (!list.keys.length) return;
    const recs = (await Promise.all(list.keys.slice(0, 5).map((k) => env.BLUEPRINT_AUTH.get(k.name))))
      .filter(Boolean)
      .map((v) => { try { return JSON.parse(v); } catch { return null; } })
      .filter(Boolean)
      .sort((a, b) => new Date(b.signedAt || 0) - new Date(a.signedAt || 0));
    i.signature = recs[0] || null;
  }));

  return json(200, { ok: true, blueprints: items });
}

// Save a new-blueprint request. Phase 1 records it as a draft in KV; the
// template generator that clones AnatomyWarehouse into a live page is the
// next phase and will consume these records.
async function handleAdminCreateBlueprint(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });

  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  const name       = (body.companyName || '').toString().trim().slice(0, 200);
  const website    = (body.website     || '').toString().trim().slice(0, 300);
  const leadClient = (body.leadClient  || '').toString().trim().slice(0, 200);
  const address    = (body.address     || '').toString().trim().slice(0, 300);
  const expiresAt  = (body.expiresAt   || '').toString().trim();
  if (!name)    return json(400, { ok: false, error: 'Company name is required' });
  if (!website) return json(400, { ok: false, error: 'Client website is required' });
  if (expiresAt && !/^\d{4}-\d{2}-\d{2}$/.test(expiresAt)) {
    return json(400, { ok: false, error: 'Expiration must be a YYYY-MM-DD date' });
  }

  const slug = normalizeBlueprintId(name);
  if (BLUEPRINT_REGISTRY.some((b) => b.id === slug)) {
    return json(409, { ok: false, error: `A blueprint with the id "${slug}" already exists` });
  }
  if (await env.BLUEPRINT_AUTH.get(`bp:${slug}`)) {
    return json(409, { ok: false, error: `A draft with the id "${slug}" already exists` });
  }

  const rec = {
    id: slug, name, website, leadClient, address,
    status: 'draft',
    createdAt: new Date().toISOString(),
    createdBy: sess.email,
  };
  await env.BLUEPRINT_AUTH.put(`bp:${slug}`, JSON.stringify(rec));
  if (expiresAt) {
    await env.BLUEPRINT_AUTH.put(`bpmeta:${slug}`, JSON.stringify({
      expiresAt, disabled: false,
      updatedAt: rec.createdAt, updatedBy: sess.email,
    }));
  }
  return json(200, { ok: true, blueprint: rec });
}

// Cookie-authenticated variant of the access log for the admin app.
async function handleAdminAccessLog(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  const blueprintId = normalizeBlueprintId(new URL(request.url).searchParams.get('bp'));
  const events = await listBlueprintEvents(env, blueprintId);
  return json(200, { ok: true, blueprintId, events });
}

// Mint a blueprint preview session from the admin cookie so the team can
// open any blueprint without the email gate. admin:true means the session
// writes no signature records and fires no notifications — previews stay
// out of the audit trail, matching the old passcode behaviour.
async function handleAdminBpToken(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });

  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const blueprintId = normalizeBlueprintId(body.blueprintId);

  const token = genToken();
  await env.BLUEPRINT_AUTH.put(
    `session:${token}`,
    JSON.stringify({ email: sess.email, admin: true, selfTest: true, blueprintId, ts: Date.now() }),
    { expirationTtl: SESSION_TTL_SECONDS }
  );
  return json(200, { ok: true, token });
}

async function handleAdminListDiscoveries(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });

  // discovery:<inverted-ts>:<rand> — the inverted timestamp makes a plain
  // prefix scan return newest-first.
  const list = await env.BLUEPRINT_AUTH.list({ prefix: 'discovery:', limit: 200 });
  const discoveries = (await Promise.all(list.keys.map(async (k) => {
    const raw = await env.BLUEPRINT_AUTH.get(k.name);
    if (!raw) return null;
    try { return { id: k.name.slice('discovery:'.length), ...JSON.parse(raw) }; }
    catch { return null; }
  }))).filter(Boolean);

  return json(200, { ok: true, discoveries });
}

async function handleAdminCreateDiscovery(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });

  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  const company = (body.company || '').toString().trim().slice(0, 200);
  const client  = (body.client  || '').toString().trim().slice(0, 200);
  const address = (body.address || '').toString().trim().slice(0, 300);
  const website = (body.website || '').toString().trim().slice(0, 300);
  if (!company) return json(400, { ok: false, error: 'Company is required' });

  const ts = Date.now();
  const id = `${(9_999_999_999_999 - ts).toString(36).padStart(10, '0')}:${genRandSlug()}`;
  const rec = {
    company, client, address, website,
    status: 'new',
    createdAt: new Date(ts).toISOString(),
    createdBy: sess.email,
  };
  await env.BLUEPRINT_AUTH.put(`discovery:${id}`, JSON.stringify(rec));
  return json(200, { ok: true, discovery: { id, ...rec } });
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
