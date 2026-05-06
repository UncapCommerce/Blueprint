// Cloudflare Worker entry point.
// Dynamic routes (form submission) go through here; everything else falls
// through to Workers Static Assets (the `public/` directory).

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/call' && request.method === 'POST') {
      return handleFitCall(request, env);
    }

    // Static assets (HTML, CSS, JSX, fonts, images) are served by the
    // ASSETS binding configured in wrangler.toml.
    return env.ASSETS.fetch(request);
  },
};

// ----------------------------------------------------------------------------
// POST /api/call
// Receives JSON: { fullName, email, phone, company, notes, answers }
// Emails the configured NOTIFY_EMAIL via Resend.
// ----------------------------------------------------------------------------
async function handleFitCall(request, env) {
  const json = (status, body) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });

  if (!env.RESEND_API_KEY) {
    return json(500, {
      ok: false,
      error: 'Email service not configured. Set RESEND_API_KEY via `wrangler secret put RESEND_API_KEY`.',
    });
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON' });
  }

  const fullName = (data.fullName || '').toString().trim();
  const email    = (data.email    || '').toString().trim();
  const phone    = (data.phone    || '').toString().trim();
  const company  = (data.company  || '').toString().trim();
  const notes    = (data.notes    || '').toString().trim();
  const answers  = data.answers   || {};

  if (!fullName || !email) {
    return json(400, { ok: false, error: 'Full name and email are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(400, { ok: false, error: 'Invalid email address.' });
  }
  // Tiny honeypot: any unexpected `website` field signals a bot.
  if (data.website) {
    return json(200, { ok: true }); // pretend success, drop silently
  }

  const subject = `Fit call request — ${fullName}${company ? ` (${company})` : ''}`;

  const escape = (s) =>
    String(s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );

  const row = (label, value) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#6b6b6b;font-weight:500;vertical-align:top;white-space:nowrap;">${escape(label)}</td>` +
    `<td style="padding:6px 0;color:#0a0a0a;">${escape(value || '—').replace(/\n/g, '<br>')}</td></tr>`;

  const html = `<!doctype html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif;color:#0a0a0a;line-height:1.5;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;">New Blueprint fit call request</h2>
    <div style="font-size:13px;color:#6b6b6b;margin-bottom:20px;">Submitted via blueprint.uncap.com/call</div>

    <h3 style="margin:24px 0 8px;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#3d3d3d;">Contact</h3>
    <table cellpadding="0" cellspacing="0" style="font-size:14px;">
      ${row('Name', fullName)}
      ${row('Email', email)}
      ${row('Phone', phone)}
      ${row('Company', company)}
    </table>

    ${notes ? `
    <h3 style="margin:24px 0 8px;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#3d3d3d;">Notes</h3>
    <div style="font-size:14px;background:#fafaf7;padding:14px;border-radius:5px;border:1px solid #e6e6e6;">${escape(notes).replace(/\n/g, '<br>')}</div>
    ` : ''}

    <h3 style="margin:24px 0 8px;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#3d3d3d;">Quiz answers</h3>
    <table cellpadding="0" cellspacing="0" style="font-size:14px;">
      ${row('ERP', answers.erp)}
      ${row('Edition', answers.edition)}
      ${row('Current platform', answers.platform)}
      ${row('Annual revenue', answers.revenue)}
      ${row('Model', answers.model)}
    </table>

    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e6e6e6;font-size:12px;color:#9a9a9a;">
      Reply to this email to respond directly to ${escape(fullName)} at ${escape(email)}.
    </div>
  </div>
</body></html>`;

  // Plain-text fallback for inbox previews and non-HTML clients.
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

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM || 'Blueprint Fit Call <onboarding@resend.dev>',
      to: [env.NOTIFY_EMAIL || 'denis@uncap.com'],
      reply_to: email,
      subject,
      html,
      text,
    }),
  });

  if (!resp.ok) {
    const detail = await resp.text();
    return json(502, { ok: false, error: `Email send failed: ${detail.slice(0, 240)}` });
  }

  const result = await resp.json().catch(() => ({}));
  return json(200, { ok: true, id: result.id || null });
}
