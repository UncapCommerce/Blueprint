// Cloudflare Worker entry point.
// Dynamic routes (form + Stripe) go through here; everything else falls
// through to Workers Static Assets (the `public/` directory).

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/call' && request.method === 'POST') {
      return handleFitCall(request, env);
    }
    if (url.pathname === '/api/checkout/setup-intent' && request.method === 'POST') {
      return handleSetupIntent(request, env);
    }
    if (url.pathname === '/api/checkout/setup-complete' && request.method === 'POST') {
      return handleSetupComplete(request, env);
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
  `<td style="padding:6px 0;color:#0a0a0a;">${escapeHtml(value || '—').replace(/\n/g, '<br>')}</td></tr>`;

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
    // Don't fail the whole request just because email is unconfigured —
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

// Pulls the standard quiz answers off a request body. Used by both the fit-call
// notifier and the Stripe Customer metadata.
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
// POST /api/call
// Receives JSON: { fullName, email, phone, company, notes, answers }
// Emails the configured NOTIFY_EMAIL via Resend.
// ----------------------------------------------------------------------------
async function handleFitCall(request, env) {
  let data;
  try { data = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  const fullName = (data.fullName || '').toString().trim();
  const email    = (data.email    || '').toString().trim();
  const phone    = (data.phone    || '').toString().trim();
  const company  = (data.company  || '').toString().trim();
  const notes    = (data.notes    || '').toString().trim();
  const answers  = readAnswers(data);

  if (!fullName || !email) {
    return json(400, { ok: false, error: 'Full name and email are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(400, { ok: false, error: 'Invalid email address.' });
  }
  // Tiny honeypot: any unexpected `website` field signals a bot.
  if (data.website) {
    return json(200, { ok: true });
  }

  const subject = `Fit call request — ${fullName}${company ? ` (${company})` : ''}`;

  const html = `<!doctype html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif;color:#0a0a0a;line-height:1.5;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;">New Blueprint fit call request</h2>
    <div style="font-size:13px;color:#6b6b6b;margin-bottom:20px;">Submitted via blueprint.uncap.com/call</div>

    <h3 style="margin:24px 0 8px;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#3d3d3d;">Contact</h3>
    <table cellpadding="0" cellspacing="0" style="font-size:14px;">
      ${tableRow('Name', fullName)}
      ${tableRow('Email', email)}
      ${tableRow('Phone', phone)}
      ${tableRow('Company', company)}
    </table>

    ${notes ? `
    <h3 style="margin:24px 0 8px;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#3d3d3d;">Notes</h3>
    <div style="font-size:14px;background:#fafaf7;padding:14px;border-radius:5px;border:1px solid #e6e6e6;">${escapeHtml(notes).replace(/\n/g, '<br>')}</div>
    ` : ''}

    <h3 style="margin:24px 0 8px;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#3d3d3d;">Quiz answers</h3>
    <table cellpadding="0" cellspacing="0" style="font-size:14px;">
      ${tableRow('ERP', answers.erp)}
      ${tableRow('Edition', answers.edition)}
      ${tableRow('Current platform', answers.platform)}
      ${tableRow('Annual revenue', answers.revenue)}
      ${tableRow('Model', answers.model)}
    </table>

    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e6e6e6;font-size:12px;color:#9a9a9a;">
      Reply to this email to respond directly to ${escapeHtml(fullName)} at ${escapeHtml(email)}.
    </div>
  </div>
</body></html>`;

  const text =
    `New Blueprint fit call request\n` +
    `\n` +
    `Name:    ${fullName}\n` +
    `Email:   ${email}\n` +
    `Phone:   ${phone || '—'}\n` +
    `Company: ${company || '—'}\n` +
    (notes ? `\nNotes:\n${notes}\n` : '') +
    `\n` +
    `Quiz answers\n` +
    `------------\n` +
    `ERP:              ${answers.erp || '—'}\n` +
    `Edition:          ${answers.edition || '—'}\n` +
    `Current platform: ${answers.platform || '—'}\n` +
    `Annual revenue:   ${answers.revenue || '—'}\n` +
    `Model:            ${answers.model || '—'}\n`;

  const sent = await sendNotificationEmail(env, { subject, html, text, replyTo: email });
  if (!sent.ok) return json(502, { ok: false, error: sent.error });
  return json(200, { ok: true, id: sent.id });
}

// ----------------------------------------------------------------------------
// POST /api/checkout/setup-intent
// Creates a Stripe SetupIntent that captures a card without charging.
// Body: { answers, otherErp }
// Returns: { ok: true, clientSecret, intentId }
// ----------------------------------------------------------------------------
async function handleSetupIntent(request, env) {
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
    source:    'blueprint-quiz',
  };
  if (otherErp) metadata.other_erp = otherErp;

  try {
    const intent = await stripeFetch(env, 'setup_intents', {
      body: stripeForm({
        usage: 'off_session',
        'payment_method_types[]': 'card',
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
    return json(502, { ok: false, error: err.message || 'Could not create SetupIntent' });
  }
}

// ----------------------------------------------------------------------------
// POST /api/checkout/setup-complete
// After client-side stripe.confirmSetup() succeeds, we look up the intent,
// create a Customer (with the email Stripe collected on the PaymentElement),
// attach the PaymentMethod, link the SetupIntent, and notify Uncap.
// Body: { intentId }
// ----------------------------------------------------------------------------
async function handleSetupComplete(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  const intentId = (body.intentId || '').toString().trim();
  if (!intentId.startsWith('seti_')) {
    return json(400, { ok: false, error: 'Invalid SetupIntent id.' });
  }

  try {
    // Pull the intent + expanded payment_method so we can read billing details.
    const intent = await stripeFetch(env, `setup_intents/${encodeURIComponent(intentId)}`, {
      method: 'GET',
      query: 'expand[]=payment_method',
    });

    if (intent.status !== 'succeeded') {
      return json(409, { ok: false, error: `SetupIntent is not in a succeeded state (status=${intent.status}).` });
    }

    const pm = intent.payment_method;
    if (!pm || typeof pm === 'string') {
      return json(502, { ok: false, error: 'PaymentMethod is missing on the SetupIntent.' });
    }

    const billing = pm.billing_details || {};
    const email = (billing.email || '').toString().trim();
    const name  = (billing.name  || '').toString().trim();
    const phone = (billing.phone || '').toString().trim();

    const md = intent.metadata || {};

    // Create or upsert the Customer. Without a stored ID per browser, the
    // simplest safe path is to always create a fresh one — Stripe customer
    // dedupe is a manual cleanup task in the dashboard.
    const customer = await stripeFetch(env, 'customers', {
      body: stripeForm({
        email: email || undefined,
        name:  name  || undefined,
        phone: phone || undefined,
        metadata: md,
      }),
    });

    // Attach the PaymentMethod to the new Customer.
    await stripeFetch(env, `payment_methods/${encodeURIComponent(pm.id)}/attach`, {
      body: stripeForm({ customer: customer.id }),
    });

    // Link the SetupIntent to the Customer for clearer dashboard view.
    await stripeFetch(env, `setup_intents/${encodeURIComponent(intent.id)}`, {
      body: stripeForm({ customer: customer.id }),
    });

    // Notify Uncap. Failures here are non-fatal for the customer.
    const card = pm.card || {};
    const subject = `New card on file — ${name || email || customer.id}`;
    const customerUrl = `https://dashboard.stripe.com/customers/${customer.id}`;
    const html = `<!doctype html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif;color:#0a0a0a;line-height:1.5;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;">New Blueprint card on file</h2>
    <div style="font-size:13px;color:#6b6b6b;margin-bottom:20px;">$0 charged today. Stripe customer is ready for the post-fit-call charge.</div>

    <h3 style="margin:24px 0 8px;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#3d3d3d;">Customer</h3>
    <table cellpadding="0" cellspacing="0" style="font-size:14px;">
      ${tableRow('Name', name)}
      ${tableRow('Email', email)}
      ${tableRow('Phone', phone)}
      ${tableRow('Stripe customer', customer.id)}
      ${tableRow('Card', card.brand ? `${card.brand.toUpperCase()} ···· ${card.last4} (exp ${card.exp_month}/${card.exp_year})` : '—')}
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

    <div style="margin-top:24px;">
      <a href="${customerUrl}" style="display:inline-block;padding:10px 14px;background:#0a0a0a;color:#fff;text-decoration:none;border-radius:5px;font-size:13px;font-weight:600;">Open in Stripe →</a>
    </div>
  </div>
</body></html>`;

    const text =
      `New Blueprint card on file\n` +
      `\n` +
      `Name:    ${name || '—'}\n` +
      `Email:   ${email || '—'}\n` +
      `Phone:   ${phone || '—'}\n` +
      `Stripe:  ${customer.id}\n` +
      `Card:    ${card.brand ? `${card.brand.toUpperCase()} ···· ${card.last4} (exp ${card.exp_month}/${card.exp_year})` : '—'}\n` +
      `\n` +
      `Quiz answers\n` +
      `------------\n` +
      `ERP:              ${md.erp || '—'}\n` +
      `Edition:          ${md.edition || '—'}\n` +
      `Current platform: ${md.platform || '—'}\n` +
      `Annual revenue:   ${md.revenue || '—'}\n` +
      `Model:            ${md.model || '—'}\n` +
      (md.other_erp ? `ERP (other):      ${md.other_erp}\n` : '') +
      `\n` +
      `Open in Stripe: ${customerUrl}\n`;

    await sendNotificationEmail(env, { subject, html, text, replyTo: email || undefined });

    return json(200, { ok: true, customerId: customer.id });
  } catch (err) {
    return json(502, { ok: false, error: err.message || 'Could not finalize SetupIntent' });
  }
}
