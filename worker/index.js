// Cloudflare Worker entry point.
// Dynamic routes (form + Stripe) go through here; everything else falls
// through to Workers Static Assets (the `public/` directory).

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/checkout/setup-intent' && request.method === 'POST') {
      return handlePaymentIntent(request, env);
    }
    if (url.pathname === '/api/checkout/setup-complete' && request.method === 'POST') {
      return handlePaymentComplete(request, env);
    }
    if (url.pathname === '/api/build/attio-prospect' && request.method === 'POST') {
      return handleAttioProspect(request, env);
    }
    if (url.pathname === '/api/build/session' && request.method === 'GET') {
      return handleSessionGet(request, env);
    }
    if (url.pathname === '/api/build/session' && request.method === 'POST') {
      return handleSessionSave(request, env);
    }
    if (url.pathname === '/api/build/session' && request.method === 'DELETE') {
      return handleSessionDelete(request, env);
    }

    // Static assets (HTML, CSS, JSX, fonts, images) are served by the
    // ASSETS binding configured in wrangler.toml.
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
  String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

// Builds a row of `<tr>` for the notification HTML emails.
const tableRow = (label, value) =>
  `<tr><td style="padding:6px 12px 6px 0;color:#6b6b6b;font-weight:500;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td>` +
  `<td style="padding:6px 0;color:#0a0a0a;">${escapeHtml(value || '').replace(/\n/g, '<br>')}</td></tr>`;

// Stripe REST is x-www-form-urlencoded, with `metadata[key]=value` repeated.
function stripeForm(params) {
  const usp = new URLSearchParams();
  const append = (key, value) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((v, i) => append(`${key}[${i}]`, v));
    } else if (typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) append(`${key}[${k}]`, v);
    } else {
      usp.append(key, String(value));
    }
  };
  for (const [k, v] of Object.entries(params)) append(k, v);
  return usp.toString();
}

async function stripeFetch(env, path, { method = 'POST', body, query } = {}) {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY via `wrangler secret put STRIPE_SECRET_KEY`.');
  }
  const qs = query ? `?${query}` : '';
  const resp = await fetch(`https://api.stripe.com/v1/${path}${qs}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body || undefined,
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = data && data.error && data.error.message
      ? data.error.message
      : `Stripe ${path} failed (${resp.status})`;
    const err = new Error(msg);
    err.stripeStatus = resp.status;
    throw err;
  }
  return data;
}

async function sendNotificationEmail(env, { subject, html, text, replyTo }) {
  if (!env.RESEND_API_KEY) {
    // Don't fail the whole request just because email is unconfigured ,
    // the customer-facing operation already succeeded.
    return { ok: false, error: 'RESEND_API_KEY not set' };
  }
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM || 'Blueprint <onboarding@resend.dev>',
      to: [env.NOTIFY_EMAIL || 'denis@uncap.com'],
      reply_to: replyTo,
      subject,
      html,
      text,
    }),
  });
  if (!resp.ok) {
    const detail = await resp.text();
    return { ok: false, error: `Email send failed: ${detail.slice(0, 240)}` };
  }
  const result = await resp.json().catch(() => ({}));
  return { ok: true, id: result.id || null };
}

// ----------------------------------------------------------------------------
// Attio CRM sync.
// On every reservation: upsert a Person (matched by email), upsert a Company
// (matched by domain), then create a new Blueprint record linked to both.
// Stage stays empty until the customer actually pays; setup-complete patches
// it to "Ordered" once Stripe confirms the charge.
//
// All Attio failures are caught + logged at the call site so a CRM outage
// never blocks payment. Object/attribute slugs are configurable via vars
// in wrangler.toml; if you rename anything in Attio, change them there.
// ----------------------------------------------------------------------------
async function attioFetch(env, path, init = {}) {
  if (!env.ATTIO_API_KEY) throw new Error('ATTIO_API_KEY not configured');
  const resp = await fetch(`https://api.attio.com/v2${path}`, {
    ...init,
    headers: {
      'authorization': `Bearer ${env.ATTIO_API_KEY}`,
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!resp.ok) {
    const detail = await resp.text().catch(() => '');
    throw new Error(`Attio ${resp.status}: ${detail.slice(0, 240)}`);
  }
  return resp.json();
}

// Splits "Ada Lovelace" → { first: "Ada", last: "Lovelace" }. Attio's name
// attribute on the People object takes structured first/last + full name.
function splitName(full) {
  const trimmed = (full || '').trim();
  if (!trimmed) return { first: '', last: '', full: '' };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '', full: trimmed };
  return { first: parts[0], last: parts.slice(1).join(' '), full: trimmed };
}

// URL → bare host without "www.". Used as Attio company match key.
function hostFromUrl(raw) {
  try { return new URL(raw).hostname.replace(/^www\./, ''); }
  catch { return ''; }
}

async function attioUpsertPerson(env, { name, email }) {
  if (!email) return null;
  const n = splitName(name);
  const values = {
    email_addresses: [{ email_address: email }],
  };
  if (n.full) {
    values.name = [{ first_name: n.first, last_name: n.last, full_name: n.full }];
  }
  const res = await attioFetch(env, '/objects/people/records?matching_attribute=email_addresses', {
    method: 'PUT',
    body: JSON.stringify({ data: { values } }),
  });
  return res?.data?.id?.record_id || null;
}

async function attioUpsertCompany(env, { companyUrl }) {
  const domain = hostFromUrl(companyUrl);
  if (!domain) return null;
  const values = {
    domains: [{ domain }],
    name:    [{ value: domain }], // best-effort placeholder; edit in Attio anytime
  };
  const res = await attioFetch(env, '/objects/companies/records?matching_attribute=domains', {
    method: 'PUT',
    body: JSON.stringify({ data: { values } }),
  });
  return res?.data?.id?.record_id || null;
}

// Renders all collected quiz answers into a plain-text block that drops into
// the Blueprint object's Details rich-text attribute.
function buildBlueprintDetails({ contact, answers, otherErp, otherPlatform }) {
  const erp = answers.erp === 'other' || (otherErp && !answers.erp)
    ? `Other (${otherErp || '—'})`
    : (answers.erp || '');
  const platform = answers.platform === 'Other' && otherPlatform
    ? `Other (${otherPlatform})`
    : (answers.platform || '');
  return [
    `Name: ${contact.name || ''}`,
    `Email: ${contact.email || ''}`,
    `Company Website: ${contact.company || ''}`,
    '',
    `ERP: ${erp}`,
    `Edition: ${answers.edition || ''}`,
    `Current platform: ${platform}`,
    `Annual online revenue: ${answers.revenue || ''}`,
    `Business model: ${answers.model || ''}`,
  ].join('\n');
}

async function attioCreateBlueprint(env, { name, detailsText, personId, companyId }) {
  const object = env.ATTIO_BLUEPRINT_OBJECT || 'blueprint';
  const values = {};
  const nameAttr    = env.ATTIO_BLUEPRINT_NAME_ATTR    || 'name';
  const detailsAttr = env.ATTIO_BLUEPRINT_DETAILS_ATTR || 'details';
  const personAttr  = env.ATTIO_BLUEPRINT_PERSON_ATTR  || 'person';
  const companyAttr = env.ATTIO_BLUEPRINT_COMPANY_ATTR || 'company';

  if (name)        values[nameAttr]    = [{ value: name }];
  if (detailsText) values[detailsAttr] = [{ value: detailsText }];
  if (personId)    values[personAttr]  = [{ target_object: 'people',    target_record_id: personId }];
  if (companyId)   values[companyAttr] = [{ target_object: 'companies', target_record_id: companyId }];

  const res = await attioFetch(env, `/objects/${encodeURIComponent(object)}/records`, {
    method: 'POST',
    body: JSON.stringify({ data: { values } }),
  });
  return res?.data?.id?.record_id || null;
}

async function attioMarkBlueprintOrdered(env, blueprintId) {
  if (!blueprintId) return;
  const object     = env.ATTIO_BLUEPRINT_OBJECT        || 'blueprint';
  const stageAttr  = env.ATTIO_BLUEPRINT_STAGE_ATTR    || 'stage';
  const orderedStage = env.ATTIO_BLUEPRINT_STAGE_ORDERED || 'Ordered';
  await attioFetch(env, `/objects/${encodeURIComponent(object)}/records/${encodeURIComponent(blueprintId)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      data: { values: { [stageAttr]: [{ status: orderedStage }] } },
    }),
  });
}

// One-shot orchestrator: upsert person + company, create blueprint, return id.
// Failures are logged but never thrown — Attio outages must not block payment.
async function syncBlueprintToAttio(env, { contact, answers, otherErp, otherPlatform }) {
  try {
    const [personId, companyId] = await Promise.all([
      attioUpsertPerson(env, { name: contact.name, email: contact.email }).catch((e) => {
        console.warn('attio: person upsert failed:', e.message); return null;
      }),
      attioUpsertCompany(env, { companyUrl: contact.company }).catch((e) => {
        console.warn('attio: company upsert failed:', e.message); return null;
      }),
    ]);
    const recordName = contact.name
      ? `${contact.name}${contact.company ? ` — ${hostFromUrl(contact.company) || contact.company}` : ''}`
      : (contact.email || 'Blueprint reservation');
    const detailsText = buildBlueprintDetails({ contact, answers, otherErp, otherPlatform });
    const blueprintId = await attioCreateBlueprint(env, {
      name: recordName,
      detailsText,
      personId,
      companyId,
    });
    return blueprintId;
  } catch (err) {
    console.warn('attio: blueprint sync failed:', err.message);
    return null;
  }
}

// Pulls the standard quiz answers off a request body. Used to populate
// Stripe customer metadata + the post-card-on-file notification email.
function readAnswers(body) {
  const a = body.answers || {};
  return {
    erp:      (a.erp      || '').toString().trim(),
    edition:  (a.edition  || '').toString().trim(),
    platform: (a.platform || '').toString().trim(),
    revenue:  (a.revenue  || '').toString().trim(),
    model:    (a.model    || '').toString().trim(),
  };
}

// ----------------------------------------------------------------------------
// POST /api/checkout/setup-intent
// Creates a Stripe PaymentIntent for the $500 reservation fee. The card is
// saved (setup_future_usage=off_session) so the implementation rebill can
// reuse it later. Refunds are issued manually from the Stripe dashboard.
// Body: { answers, otherErp }
// Returns: { ok: true, clientSecret, intentId }
// ----------------------------------------------------------------------------
const RESERVATION_AMOUNT_CENTS = 50000;
const RESERVATION_CURRENCY     = 'usd';

async function handlePaymentIntent(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  const answers = readAnswers(body);
  const otherErp = (body.otherErp || '').toString().trim();

  const metadata = {
    erp:       answers.erp,
    edition:   answers.edition,
    platform:  answers.platform,
    revenue:   answers.revenue,
    model:     answers.model,
    source:    'blueprint-build',
  };
  if (otherErp) metadata.other_erp = otherErp;

  try {
    const intent = await stripeFetch(env, 'payment_intents', {
      body: stripeForm({
        amount:               RESERVATION_AMOUNT_CENTS,
        currency:             RESERVATION_CURRENCY,
        setup_future_usage:   'off_session',
        description:          'Blueprint reservation fee (fully refundable)',
        // Hard-pin to card only. Including Link in the allowlist lets users
        // pick a saved bank account from their Link wallet, which reads as
        // "Bank" in the UI even when the dashboard's Pay by Bank toggle is
        // off. Dropping Link removes that surface entirely. Apple Pay /
        // Google Pay still surface as wallet variants on top of `card`.
        'payment_method_types[0]': 'card',
        metadata,
      }),
    });
    if (!env.STRIPE_PUBLISHABLE_KEY) {
      return json(500, { ok: false, error: 'Stripe is not configured. Set STRIPE_PUBLISHABLE_KEY in wrangler.toml.' });
    }
    return json(200, {
      ok: true,
      clientSecret: intent.client_secret,
      intentId: intent.id,
      publishableKey: env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (err) {
    return json(502, { ok: false, error: err.message || 'Could not create PaymentIntent' });
  }
}

// ----------------------------------------------------------------------------
// POST /api/build/attio-prospect
// Called when the user lands on the Place Order screen — every quiz answer
// and contact field is in hand at that point. Creates the Attio Blueprint
// record (with linked Person + Company) at "No stage". setup-complete later
// patches the stage to "Ordered" if the customer pays.
// Body: { contact: { name, email, company }, answers, otherErp, otherPlatform }
// Returns: { ok: true, blueprintRecordId }
// ----------------------------------------------------------------------------
async function handleAttioProspect(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  const contact = {
    name:    (body?.contact?.name    || '').toString().trim(),
    email:   (body?.contact?.email   || '').toString().trim(),
    company: (body?.contact?.company || '').toString().trim(),
  };
  if (!contact.email) {
    return json(400, { ok: false, error: 'Email is required.' });
  }
  const answers = readAnswers(body);
  const otherErp = (body.otherErp || '').toString().trim();
  const otherPlatform = (body.otherPlatform || '').toString().trim();

  const blueprintRecordId = await syncBlueprintToAttio(env, {
    contact, answers, otherErp, otherPlatform,
  });
  return json(200, { ok: true, blueprintRecordId });
}

// ----------------------------------------------------------------------------
// POST /api/checkout/setup-complete
// After client-side stripe.confirmPayment() succeeds, we look up the
// PaymentIntent, create a Customer (with billing details forwarded by the
// client + the `company` we collected in our own UI), attach the saved
// PaymentMethod, link the PaymentIntent, and notify Uncap.
// Body: { intentId, company, blueprintRecordId? }
// ----------------------------------------------------------------------------
async function handlePaymentComplete(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  const intentId = (body.intentId || '').toString().trim();
  if (!intentId.startsWith('pi_')) {
    return json(400, { ok: false, error: 'Invalid PaymentIntent id.' });
  }
  const company = (body.company || '').toString().trim();
  const blueprintRecordId = (body.blueprintRecordId || '').toString().trim() || null;

  try {
    // Pull the intent + expanded payment_method so we can read billing details.
    const intent = await stripeFetch(env, `payment_intents/${encodeURIComponent(intentId)}`, {
      method: 'GET',
      query: 'expand[]=payment_method',
    });

    if (intent.status !== 'succeeded') {
      return json(409, { ok: false, error: `PaymentIntent is not in a succeeded state (status=${intent.status}).` });
    }

    const pm = intent.payment_method;
    if (!pm || typeof pm === 'string') {
      return json(502, { ok: false, error: 'PaymentMethod is missing on the PaymentIntent.' });
    }

    const billing = pm.billing_details || {};
    const email = (billing.email || '').toString().trim();
    const name  = (billing.name  || '').toString().trim();
    const phone = (billing.phone || '').toString().trim();

    const md = intent.metadata || {};

    // Create or upsert the Customer. Without a stored ID per browser, the
    // simplest safe path is to always create a fresh one: Stripe customer
    // dedupe is a manual cleanup task in the dashboard.
    const customer = await stripeFetch(env, 'customers', {
      body: stripeForm({
        email: email || undefined,
        name:  name  || undefined,
        phone: phone || undefined,
        metadata: { ...md, ...(company ? { company } : {}) },
      }),
    });

    // Attach the PaymentMethod to the new Customer so it's reusable for the
    // implementation rebill (or refund-and-rebill cycles) later.
    await stripeFetch(env, `payment_methods/${encodeURIComponent(pm.id)}/attach`, {
      body: stripeForm({ customer: customer.id }),
    });

    // Link the PaymentIntent to the Customer for clearer dashboard view.
    await stripeFetch(env, `payment_intents/${encodeURIComponent(intent.id)}`, {
      body: stripeForm({ customer: customer.id }),
    });

    // Notify Uncap. Failures here are non-fatal for the customer.
    const card = pm.card || {};
    const amountCharged = `$${(intent.amount_received / 100).toFixed(0)}`;
    const subject = `Blueprint reservation: ${name || email || customer.id}${company ? ` · ${company}` : ''}`;
    const customerUrl = `https://dashboard.stripe.com/customers/${customer.id}`;
    const intentUrl = `https://dashboard.stripe.com/payments/${intent.id}`;
    const html = `<!doctype html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif;color:#0a0a0a;line-height:1.5;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;">New Blueprint reservation</h2>
    <div style="font-size:13px;color:#6b6b6b;margin-bottom:20px;">${escapeHtml(amountCharged)} reservation fee charged. Refundable if the fit call rejects scope.</div>

    <h3 style="margin:24px 0 8px;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#3d3d3d;">Customer</h3>
    <table cellpadding="0" cellspacing="0" style="font-size:14px;">
      ${tableRow('Name', name)}
      ${tableRow('Email', email)}
      ${tableRow('Company Website', company)}
      ${tableRow('Phone', phone)}
      ${tableRow('Stripe customer', customer.id)}
      ${tableRow('Card', card.brand ? `${card.brand.toUpperCase()} ···· ${card.last4} (exp ${card.exp_month}/${card.exp_year})` : '')}
      ${tableRow('Charge', `${amountCharged} (PaymentIntent ${intent.id})`)}
    </table>

    <h3 style="margin:24px 0 8px;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#3d3d3d;">Quiz answers</h3>
    <table cellpadding="0" cellspacing="0" style="font-size:14px;">
      ${tableRow('ERP', md.erp)}
      ${tableRow('Edition', md.edition)}
      ${tableRow('Current platform', md.platform)}
      ${tableRow('Annual revenue', md.revenue)}
      ${tableRow('Model', md.model)}
      ${md.other_erp ? tableRow('ERP (other)', md.other_erp) : ''}
    </table>

    <div style="margin-top:24px;display:flex;gap:8px;flex-wrap:wrap;">
      <a href="${customerUrl}" style="display:inline-block;padding:10px 14px;background:#0a0a0a;color:#fff;text-decoration:none;border-radius:5px;font-size:13px;font-weight:600;">Open customer →</a>
      <a href="${intentUrl}" style="display:inline-block;padding:10px 14px;background:#fff;color:#0a0a0a;border:1px solid #0a0a0a;text-decoration:none;border-radius:5px;font-size:13px;font-weight:600;">Open payment →</a>
    </div>
  </div>
</body></html>`;

    const text =
      `New Blueprint reservation\n` +
      `${amountCharged} reservation fee charged (refundable if not a fit).\n` +
      `\n` +
      `Name:        ${name || ''}\n` +
      `Email:       ${email || ''}\n` +
      `Company Website: ${company || ''}\n` +
      `Phone:       ${phone || ''}\n` +
      `Stripe:  ${customer.id}\n` +
      `Card:    ${card.brand ? `${card.brand.toUpperCase()} ···· ${card.last4} (exp ${card.exp_month}/${card.exp_year})` : ''}\n` +
      `Charge:  ${amountCharged} (${intent.id})\n` +
      `\n` +
      `Quiz answers\n` +
      `------------\n` +
      `ERP:              ${md.erp || ''}\n` +
      `Edition:          ${md.edition || ''}\n` +
      `Current platform: ${md.platform || ''}\n` +
      `Annual revenue:   ${md.revenue || ''}\n` +
      `Model:            ${md.model || ''}\n` +
      (md.other_erp ? `ERP (other):      ${md.other_erp}\n` : '') +
      `\n` +
      `Customer: ${customerUrl}\n` +
      `Payment:  ${intentUrl}\n`;

    await sendNotificationEmail(env, { subject, html, text, replyTo: email || undefined });

    // Flip the Attio Blueprint record's stage to "Ordered". Non-blocking on
    // failure: the payment has already succeeded by this point, so a CRM
    // outage shouldn't surface as an error to the customer.
    if (blueprintRecordId) {
      try { await attioMarkBlueprintOrdered(env, blueprintRecordId); }
      catch (e) { console.warn('attio: stage update failed:', e.message); }
    }

    return json(200, { ok: true, customerId: customer.id });
  } catch (err) {
    return json(502, { ok: false, error: err.message || 'Could not finalize PaymentIntent' });
  }
}

// ----------------------------------------------------------------------------
// /api/build/session: resumable /build quiz sessions backed by Workers KV.
//
// The client generates a 32-char hex session id on first visit, pushes it
// into the URL as `?s=<id>`, and POSTs progress here on every state change.
// Anyone with the URL can resume: that's the point. State is small JSON
// (current step + answers + contact). No card data ever lands in KV; that
// stays with Stripe via the PaymentIntent.
//
// Sessions auto-expire after 30 days (KV TTL).
// ----------------------------------------------------------------------------
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const SESSION_ID_RE = /^[0-9a-f]{16,64}$/;
const MAX_SESSION_BYTES = 8 * 1024; // sanity cap on submitted state

function noKv() {
  return json(503, { ok: false, error: 'Session storage is not configured (BUILD_SESSIONS KV binding missing).' });
}

async function handleSessionGet(request, env) {
  if (!env.BUILD_SESSIONS) return noKv();
  const id = (new URL(request.url).searchParams.get('id') || '').toLowerCase();
  if (!SESSION_ID_RE.test(id)) {
    return json(400, { ok: false, error: 'Invalid session id.' });
  }
  const raw = await env.BUILD_SESSIONS.get(id);
  if (!raw) return json(404, { ok: false, error: 'Session not found.' });
  try {
    return json(200, { ok: true, state: JSON.parse(raw) });
  } catch {
    return json(502, { ok: false, error: 'Session payload is corrupt.' });
  }
}

async function handleSessionSave(request, env) {
  if (!env.BUILD_SESSIONS) return noKv();
  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  const id = (body.id || '').toString().toLowerCase();
  if (!SESSION_ID_RE.test(id)) {
    return json(400, { ok: false, error: 'Invalid session id.' });
  }
  const state = body.state;
  if (!state || typeof state !== 'object') {
    return json(400, { ok: false, error: 'Missing state.' });
  }
  const payload = JSON.stringify(state);
  if (payload.length > MAX_SESSION_BYTES) {
    return json(413, { ok: false, error: 'Session payload too large.' });
  }
  await env.BUILD_SESSIONS.put(id, payload, { expirationTtl: SESSION_TTL_SECONDS });
  return json(200, { ok: true });
}

async function handleSessionDelete(request, env) {
  if (!env.BUILD_SESSIONS) return noKv();
  const id = (new URL(request.url).searchParams.get('id') || '').toLowerCase();
  if (!SESSION_ID_RE.test(id)) {
    return json(400, { ok: false, error: 'Invalid session id.' });
  }
  await env.BUILD_SESSIONS.delete(id);
  return json(200, { ok: true });
}
