// Cloudflare Worker entry point.
// Dynamic routes (form + Stripe) go through here; everything else falls
// through to Workers Static Assets (the `public/` directory).

import { EmailMessage } from "cloudflare:email";

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
    if (url.pathname === '/api/build/apollo-enrich' && request.method === 'POST') {
      return handleApolloEnrich(request, env);
    }
    if (url.pathname === '/api/build/attio-ping' && request.method === 'GET') {
      return handleAttioPing(request, env);
    }
    if (url.pathname === '/api/build/attio-test' && request.method === 'GET') {
      return handleAttioTest(request, env);
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

// Splits a `"Display Name <email@domain>"` value into { display, address }.
// Falls back to treating the whole input as the bare address.
function parseAddress(input) {
  const trimmed = (input || '').trim();
  if (!trimmed) return { display: '', address: '' };
  const m = trimmed.match(/^\s*(.+?)\s*<([^>]+)>\s*$/);
  if (m) return { display: m[1].replace(/^"|"$/g, ''), address: m[2].trim() };
  return { display: '', address: trimmed };
}

// Crockford-ish base64 for arbitrary UTF-8 bytes. Lets us put HTML bodies
// straight into a MIME part without worrying about line-length / encoding
// rules that quoted-printable would otherwise impose.
function b64utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/(.{76})/g, '$1\r\n');
}

// Builds a complete RFC 822 message and ships it via Cloudflare's send_email
// binding. The recipient must be a verified destination address in Email
// Routing for the zone the binding is attached to — otherwise the send
// rejects with "no matching destination address". From-display ("Blueprint
// <noreply@uncap.com>") is configured via the EMAIL_FROM var; the bare
// address must be on a zone you control for deliverability.
async function sendNotificationEmail(env, { subject, html, text, replyTo }) {
  if (!env.NOTIFY_MAIL) {
    return { ok: false, error: 'send_email binding not configured (env.NOTIFY_MAIL missing)' };
  }
  const from = parseAddress(env.EMAIL_FROM || 'Blueprint <noreply@uncap.com>');
  const to   = parseAddress(env.NOTIFY_EMAIL || 'denis@uncap.com');
  if (!from.address || !to.address) {
    return { ok: false, error: 'EMAIL_FROM or NOTIFY_EMAIL missing/invalid' };
  }

  const boundary = '----=_Part_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  const headers = [
    `From: ${from.display ? `"${from.display}" <${from.address}>` : from.address}`,
    `To: ${to.address}`,
    replyTo ? `Reply-To: ${replyTo}` : null,
    `Subject: ${subject}`,
    `Message-ID: <${crypto.randomUUID()}@${from.address.split('@')[1] || 'uncap.com'}>`,
    `Date: ${new Date().toUTCString()}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ].filter(Boolean).join('\r\n');

  const parts = [
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    b64utf8(text || ''),
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    b64utf8(html || ''),
    `--${boundary}--`,
    ``,
  ].join('\r\n');

  const raw = headers + '\r\n\r\n' + parts;

  try {
    await env.NOTIFY_MAIL.send(new EmailMessage(from.address, to.address, raw));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: `send_email failed: ${(err && err.message) || err}` };
  }
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

// Apollo returns industry as lowercase ("computer software"). Display
// surface wants "Computer Software". Cheap word-initial capitalization
// without trying to handle small-word exceptions.
function titleCase(s) {
  if (!s || typeof s !== 'string') return null;
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
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

// `name` is optional — when Apollo enrichment is available the caller passes
// the real company name; otherwise we fall back to the domain so the record
// still has a sensible label.
async function attioUpsertCompany(env, { companyUrl, name }) {
  const domain = hostFromUrl(companyUrl);
  if (!domain) return null;
  const displayName = (name || '').trim() || domain;
  const values = {
    domains: [{ domain }],
    name:    [{ value: displayName }],
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
  // Empty-string env vars mean "this attribute doesn't exist on the user's
  // Blueprint object, skip the field" — important for refs that the user
  // hasn't created. The ?? keeps the empty-string semantic distinct from
  // an unset var (which falls back to the default slug).
  const nameAttr    = env.ATTIO_BLUEPRINT_NAME_ATTR    ?? 'name';
  const detailsAttr = env.ATTIO_BLUEPRINT_DETAILS_ATTR ?? 'details';
  const personAttr  = env.ATTIO_BLUEPRINT_PERSON_ATTR  ?? 'person';
  const companyAttr = env.ATTIO_BLUEPRINT_COMPANY_ATTR ?? 'company';

  // Builds the values payload, optionally including ref attributes. We try
  // with refs first, and fall back without them on a 4xx (which usually
  // means the user hasn't created the reference attribute on Blueprint).
  function buildValues(includeRefs) {
    const v = {};
    if (name        && nameAttr)    v[nameAttr]    = [{ value: name }];
    if (detailsText && detailsAttr) v[detailsAttr] = [{ value: detailsText }];
    if (includeRefs) {
      if (personId  && personAttr)  v[personAttr]  = [{ target_object: 'people',    target_record_id: personId }];
      if (companyId && companyAttr) v[companyAttr] = [{ target_object: 'companies', target_record_id: companyId }];
    }
    return v;
  }

  async function postCreate(values) {
    const res = await attioFetch(env, `/objects/${encodeURIComponent(object)}/records`, {
      method: 'POST',
      body: JSON.stringify({ data: { values } }),
    });
    return res?.data?.id?.record_id || null;
  }

  try {
    return await postCreate(buildValues(true));
  } catch (err) {
    // Most likely cause: the Blueprint object doesn't have a `person` or
    // `company` reference attribute the user explicitly added. Retry with
    // just name + details so the record still lands.
    if (/^Attio (4\d\d)/.test(err.message)) {
      console.warn('attio: blueprint create with refs failed, retrying without:', err.message);
      return await postCreate(buildValues(false));
    }
    throw err;
  }
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

// One-shot orchestrator: upsert person + company, create blueprint. Returns
// { blueprintRecordId, personId, companyId, errors[] }. Errors are collected
// per-step so handleAttioProspect can surface them inline for debugging.
// Throwing is suppressed because Attio outages must not block payment.
async function syncBlueprintToAttio(env, { contact, answers, otherErp, otherPlatform }) {
  const errors = [];
  let personId = null;
  let companyId = null;
  let apolloEnrichment = null;

  try {
    // Person upsert + Apollo enrich run in parallel — Person doesn't need
    // Apollo, and Apollo is KV-cached so it's free on repeat visits to
    // the same domain. Company upsert is held until Apollo finishes so the
    // Companies record (and the Blueprint record's name) can use the real
    // company name when Apollo returns one.
    const [personIdOut, apolloOut] = await Promise.all([
      attioUpsertPerson(env, { name: contact.name, email: contact.email }).catch((e) => {
        const msg = `person upsert: ${e.message}`;
        console.warn('attio:', msg); errors.push(msg);
        return null;
      }),
      apolloEnrichForDomain(env, contact.company).then((r) => {
        if (r.error) { errors.push(`apollo enrich: ${r.error}`); console.warn('apollo:', r.error); }
        return r.enrichment;
      }),
    ]);
    personId = personIdOut;
    apolloEnrichment = apolloOut;

    companyId = await attioUpsertCompany(env, {
      companyUrl: contact.company,
      name: apolloEnrichment?.name || '',
    }).catch((e) => {
      const msg = `company upsert: ${e.message}`;
      console.warn('attio:', msg); errors.push(msg);
      return null;
    });

    // Blueprint record name prefers Apollo's company name, then the bare
    // domain, then contact fallbacks. So a record reads "Acme Supply" in
    // Attio instead of "acme.com" when enrichment was available.
    const recordName = apolloEnrichment?.name
      || hostFromUrl(contact.company)
      || contact.company
      || contact.name
      || contact.email
      || 'Blueprint reservation';
    const detailsText = buildBlueprintDetails({ contact, answers, otherErp, otherPlatform })
      + renderApolloDetails(apolloEnrichment);

    let blueprintRecordId = null;
    try {
      blueprintRecordId = await attioCreateBlueprint(env, {
        name: recordName, detailsText, personId, companyId,
      });
    } catch (e) {
      const msg = `blueprint create: ${e.message}`;
      console.warn('attio:', msg); errors.push(msg);
    }

    return { blueprintRecordId, personId, companyId, errors };
  } catch (err) {
    const msg = `sync wrapper: ${err.message}`;
    console.warn('attio:', msg); errors.push(msg);
    return { blueprintRecordId: null, personId, companyId, errors };
  }
}

// ----------------------------------------------------------------------------
// Apollo enrichment.
// One GET per (domain, 7-day-window), backed by Workers KV. The endpoint is
// idempotent so the client can call it from multiple places without piling
// on credit consumption. Returns a distilled object — full Apollo response
// is huge and we only need a handful of fields.
// ----------------------------------------------------------------------------
const APOLLO_CACHE_TTL_SECONDS = 60 * 60 * 24 * 7;

// Apollo's `technologies[].name` to the canonical platform label this quiz
// recognises. Used to auto-fill the platform answer when Apollo detects a
// commerce stack on the domain.
const APOLLO_PLATFORM_BY_TECH = {
  'Magento':                    'Magento / Adobe Commerce',
  'Adobe Commerce':             'Magento / Adobe Commerce',
  'BigCommerce':                'BigCommerce',
  'WooCommerce':                'WooCommerce',
  'NetSuite SuiteCommerce':     'NetSuite SuiteCommerce',
  'Optimizely':                 'Optimizely Commerce',
  'Optimizely Commerce':        'Optimizely Commerce',
  'Salesforce Commerce Cloud':  'Salesforce Commerce Cloud',
  'Demandware':                 'Salesforce Commerce Cloud',
  'SAP Commerce Cloud':         'SAP Commerce Cloud',
  'Hybris':                     'SAP Commerce Cloud',
  'commercetools':              'commercetools',
  'VTEX':                       'VTEX',
};

// Apollo `technologies[].name` to ERP id used by the quiz. Mirrors the
// id values in ERP_OPTIONS on the client.
const APOLLO_ERP_BY_TECH = {
  'NetSuite':                  'netsuite',
  'Oracle NetSuite':           'netsuite',
  'NetSuite ERP':              'netsuite',
  'NetSuite OneWorld':         'netsuite',
  'Microsoft Dynamics':        'msdyn',
  'Microsoft Dynamics 365':    'msdyn',
  'Microsoft Dynamics GP':     'msdyn',
  'Microsoft Dynamics NAV':    'msdyn',
  'Microsoft Dynamics AX':     'msdyn',
  'Dynamics 365':              'msdyn',
  'Business Central':          'msdyn',
  'Acumatica':                 'acumatica',
  'Epicor':                    'epicor',
  'Epicor Kinetic':            'epicor',
  'Epicor Prophet 21':         'epicor',
  'Sage':                      'sage',
  'Sage Intacct':              'sage',
  'Sage X3':                   'sage',
  'Sage 100':                  'sage',
  'Sage 300':                  'sage',
  'SAP':                       'sap',
  'SAP S/4HANA':               'sap',
  'SAP Business One':          'sap',
  'SAP ECC':                   'sap',
  'Infor':                     'infor',
  'Infor CloudSuite':          'infor',
  'Infor M3':                  'infor',
  'Infor LN':                  'infor',
  'Odoo':                      'odoo',
  'Odoo ERP':                  'odoo',
};

function detectPlatformFromApollo(technologies) {
  for (const t of (technologies || [])) {
    const hit = APOLLO_PLATFORM_BY_TECH[t?.name];
    if (hit) return hit;
  }
  return '';
}

function detectErpFromApollo(technologies) {
  for (const t of (technologies || [])) {
    const hit = APOLLO_ERP_BY_TECH[t?.name];
    if (hit) return hit;
  }
  return '';
}

// Returns { enrichment: {...} | null, cached: bool, error: string | null }.
// Never throws — failures degrade to null enrichment so callers can soldier
// on. Cache hit/miss surfaced for diagnostics.
//
// Cache key carries a version segment so any time the enrichment shape
// changes (added field, normalisation tweak, etc.) we can bump the version
// and stale entries become unreachable without manually purging KV.
const APOLLO_CACHE_VERSION = 'v2';
async function apolloEnrichForDomain(env, rawCompanyUrl) {
  const domain = hostFromUrl(rawCompanyUrl);
  if (!domain) return { enrichment: null, cached: false, error: 'no domain' };

  const cacheKey = `apollo:${APOLLO_CACHE_VERSION}:${domain}`;
  if (env.BUILD_SESSIONS) {
    try {
      const cached = await env.BUILD_SESSIONS.get(cacheKey, 'json');
      if (cached) return { enrichment: cached, cached: true, error: null };
    } catch (_) { /* swallow */ }
  }

  if (!env.APOLLO_API_KEY) {
    return { enrichment: null, cached: false, error: 'APOLLO_API_KEY not configured' };
  }

  try {
    const resp = await fetch(
      `https://api.apollo.io/v1/organizations/enrich?domain=${encodeURIComponent(domain)}`,
      {
        method: 'GET',
        headers: {
          'X-Api-Key': env.APOLLO_API_KEY,
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        },
      }
    );
    if (!resp.ok) {
      const detail = await resp.text().catch(() => '');
      return { enrichment: null, cached: false, error: `Apollo ${resp.status}: ${detail.slice(0, 240)}` };
    }
    const raw = await resp.json().catch(() => ({}));
    const org = raw?.organization || {};
    const technologies = Array.isArray(org.technologies) ? org.technologies.slice(0, 30) : [];

    // Focused enrichment: only the fields we actively surface to the user
    // and append to Attio Details today. Adding more later = add a line to
    // this object + the renderer below + the banner JSX in QuizApp.
    // Address prefers Apollo's pre-formatted raw_address when present
    // (most reliable on US records) and otherwise stitches the structured
    // fields together.
    const address = (org.raw_address && org.raw_address.trim())
      || [org.street_address, org.city, org.state, org.postal_code, org.country]
           .filter(Boolean).join(', ')
      || null;
    const enrichment = {
      domain,
      name:             org.name || null,
      address,
      industry:         titleCase(org.industry),
      employees:        org.estimated_num_employees || null,
      foundedYear:      org.founded_year || null,
      detectedPlatform: detectPlatformFromApollo(technologies),
      detectedErp:      detectErpFromApollo(technologies),
    };

    if (env.BUILD_SESSIONS) {
      env.BUILD_SESSIONS
        .put(cacheKey, JSON.stringify(enrichment), { expirationTtl: APOLLO_CACHE_TTL_SECONDS })
        .catch(() => {});
    }
    return { enrichment, cached: false, error: null };
  } catch (err) {
    return { enrichment: null, cached: false, error: err.message || 'fetch failed' };
  }
}

// ----------------------------------------------------------------------------
// POST /api/build/apollo-enrich
// Body: { companyUrl }
// Returns: { ok, enrichment: {...} | null, cached, error }
// Client calls this when a domain is known (from hero CTA, from quiz step 7,
// or from resume) so the rest of the experience can be tailored.
// ----------------------------------------------------------------------------
async function handleApolloEnrich(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const companyUrl = (body.companyUrl || '').toString().trim();
  const result = await apolloEnrichForDomain(env, companyUrl);
  return json(200, { ok: true, ...result });
}

// Renders Apollo enrichment as plain text, ready to drop after the quiz
// answers section in the Attio Blueprint Details rich-text field. Empty
// string if no enrichment is available.
function renderApolloDetails(enrichment) {
  if (!enrichment) return '';
  const lines = ['', '--- Apollo enrichment ---'];
  if (enrichment.name)             lines.push(`Company name: ${enrichment.name}`);
  if (enrichment.address)          lines.push(`Address: ${enrichment.address}`);
  if (enrichment.industry)         lines.push(`Industry: ${enrichment.industry}`);
  if (enrichment.employees)        lines.push(`Team size: ${enrichment.employees}`);
  if (enrichment.foundedYear)      lines.push(`Founded: ${enrichment.foundedYear}`);
  if (enrichment.detectedPlatform) lines.push(`Ecommerce platform: ${enrichment.detectedPlatform}`);
  if (enrichment.detectedErp)      lines.push(`ERP: ${enrichment.detectedErp}`);
  return lines.length > 2 ? lines.join('\n') : '';
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

  const result = await syncBlueprintToAttio(env, {
    contact, answers, otherErp, otherPlatform,
  });
  return json(200, { ok: true, ...result });
}

// ----------------------------------------------------------------------------
// GET /api/build/attio-ping
// Diagnostic: hits Attio with the configured API key and returns the raw
// status + response body so we can see whether the key is missing, scoped
// wrong, or the Blueprint object slug is mismatched. No-op for production
// traffic — invoke directly via curl.
//   ?object=people       (default) — sanity-checks key + read scope on People
//   ?object=blueprint              — verifies Blueprint object slug + scope
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// GET /api/build/attio-test
// Runs the full upsert-person + upsert-company + create-blueprint flow with
// stable dummy values (so we don't pollute Attio on each call — the People
// and Companies records collapse onto the same email/domain). Returns the
// full diagnostics object. Curl once after any Attio config change to verify
// end-to-end without going through the quiz.
// ----------------------------------------------------------------------------
async function handleAttioTest(request, env) {
  if (!env.ATTIO_API_KEY) {
    return json(503, { ok: false, step: 'config', error: 'ATTIO_API_KEY not set on the Worker' });
  }
  const result = await syncBlueprintToAttio(env, {
    contact: {
      name: 'Attio Diagnostic',
      email: 'attio-diagnostic@uncap.com',
      company: 'https://attio-diagnostic.example.com',
    },
    answers: {
      erp: 'netsuite', edition: 'OneWorld',
      platform: 'Magento / Adobe Commerce',
      revenue: '$5M – $25M', model: 'b2b',
    },
    otherErp: '',
    otherPlatform: '',
  });
  return json(200, { ok: true, ...result });
}

async function handleAttioPing(request, env) {
  if (!env.ATTIO_API_KEY) {
    return json(503, { ok: false, step: 'config', error: 'ATTIO_API_KEY not set on the Worker' });
  }
  const objectSlug = (new URL(request.url)).searchParams.get('object') || 'people';
  const path = `/v2/objects/${encodeURIComponent(objectSlug)}/attributes`;
  try {
    const resp = await fetch(`https://api.attio.com${path}`, {
      headers: { 'authorization': `Bearer ${env.ATTIO_API_KEY}` },
    });
    const text = await resp.text();
    let parsed = null;
    try { parsed = JSON.parse(text); } catch (_) { parsed = text; }
    // Returns just the slugs on success so output stays scannable.
    const slugs = (parsed && parsed.data && Array.isArray(parsed.data))
      ? parsed.data.map(a => ({ slug: a.api_slug, type: a.type, title: a.title }))
      : null;
    return json(resp.ok ? 200 : resp.status, {
      ok: resp.ok,
      object: objectSlug,
      status: resp.status,
      slugs,
      body: slugs ? undefined : parsed,
    });
  } catch (err) {
    return json(500, { ok: false, step: 'fetch', error: err.message });
  }
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
