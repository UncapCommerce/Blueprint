// ── Blueprint print hooks (formerly the admin toolbar) ───────────────────
// The floating "Internal" toolbar is gone — Activity and Print now live in
// the Blueprint admin app at the site root. This script keeps two jobs:
//
//   1. Print-quality stylesheet for every visitor (color preservation,
//      viewport-height collapse, page-break hygiene) so browser printing
//      and the admin print modes produce a clean PDF.
//
//   2. Admin-triggered print modes. The admin app opens a blueprint with
//      ?bpPrint=delivery or ?bpPrint=shopify; once the page has mounted
//      and the session resolves as admin/selfTest, the matching print
//      routine runs automatically:
//        - delivery : whole document, no nav, no signature popup
//        - shopify  : key sections + the Master Services Agreement
// ─────────────────────────────────────────────────────────────────────────

(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.__bpPrintHooksMounted) return;
  window.__bpPrintHooksMounted = true;

  // ── Print-quality stylesheet (runs for every visitor) ────────────────
  const PRINT_STYLE_ID = 'bp-print-quality-styles';
  function ensurePrintStyles() {
    if (document.getElementById(PRINT_STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = PRINT_STYLE_ID;
    s.textContent = `
      @media print {
        /* Preserve every fill, gradient, background-image, and pattern
           through the print pipeline. Without this Chrome paints the
           dark sections white. */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }

        /* Sections that anchored their height in viewport units (78vh
           on the hero, min-height: 100vh elsewhere) leave half-empty
           pages when printed. Let content size them naturally. */
        html, body { background: var(--uc-cream, #F2EFE7) !important; min-height: 0 !important; }
        section, section[data-bp-section], section#intro {
          min-height: 0 !important;
        }

        /* The fixed left-rail nav shouldn't be in the printed document.
           The signature popup is also hidden unless the Print agreement
           button explicitly armed the MSA-only mode (handled by
           UncapMSA's own rules). */
        body:not(.bp-print-msa-only) nav[style*="position: fixed"],
        body:not(.bp-print-msa-only) [role="dialog"] {
          display: none !important;
        }

        /* Don't split headlines from the paragraphs that follow them,
           and don't split signature boxes or stat cards across pages. */
        h1, h2, h3, h4 { break-after: avoid; page-break-after: avoid; }
        .msa-sigbox, .msa-clause.h, .msa-sub { break-inside: avoid; page-break-inside: avoid; }

        /* The client's own "Download signed copy" button and the team's
           floating toolbar are page chrome, never part of the document. */
        #bp-client-download-btn { display: none !important; }
        #bp-admin-toolbar { display: none !important; }

        /* Letter is the predictable default for proposals on this side
           of the Atlantic; modest margins so dark sections breathe. */
        @page { size: Letter; margin: 8mm; }
      }
    `;
    document.head.appendChild(s);
  }
  ensurePrintStyles();

  // ── Print-mode stylesheet (armed only when a mode class is set) ──────
  const MODE_STYLE_ID = 'bp-print-mode-styles';
  function ensureModeStyles() {
    if (document.getElementById(MODE_STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = MODE_STYLE_ID;
    s.textContent = `
      /* The injected MSA + audit-trail blocks are hidden on screen and
         only revealed in the print modes that use them. */
      .bp-adm-msa-injected, .bp-adm-audit-injected { display: none; }

      @media print {
        /* Mode A — Delivery Team: print the whole document. Hide nav,
           the signature popup (if open), and any orphan MSA terms
           injected by the Shopify Partner mode. */
        body.bp-print-delivery nav[style*="position: fixed"],
        body.bp-print-delivery [role="dialog"],
        body.bp-print-delivery .bp-adm-msa-injected,
        body.bp-print-delivery .uncap-msa-print-clone { display: none !important; }
        body.bp-print-delivery section[data-bp-section] { page-break-inside: auto; break-inside: auto; }

        /* Mode B — Shopify Partner Program: only the named sections +
           the Master Services Agreement at the end. */
        body.bp-print-shopify nav[style*="position: fixed"],
        body.bp-print-shopify [role="dialog"],
        body.bp-print-shopify .uncap-msa-print-clone { display: none !important; }
        body.bp-print-shopify section[data-bp-section] { display: none !important; }
        body.bp-print-shopify section[data-bp-section="intro"],
        body.bp-print-shopify section[data-bp-section="scope"],
        body.bp-print-shopify section[data-bp-section="techstack"],
        body.bp-print-shopify section[data-bp-section="b2b"],
        body.bp-print-shopify section[data-bp-section="integrations"],
        body.bp-print-shopify section[data-bp-section="migration"],
        body.bp-print-shopify section[data-bp-section="delivery"],
        body.bp-print-shopify section[data-bp-section="investment"] { display: block !important; page-break-after: always; }
        body.bp-print-shopify .bp-adm-msa-injected { display: block !important; padding: 14mm 14mm 20mm !important; background: white !important; color: black !important; }

        /* Mode C — For the Client: whole document (like delivery), plus
           the Master Services Agreement and a digital-signature audit
           trail appended at the end. */
        body.bp-print-client nav[style*="position: fixed"],
        body.bp-print-client [role="dialog"],
        body.bp-print-client .uncap-msa-print-clone { display: none !important; }
        body.bp-print-client section[data-bp-section] { page-break-inside: auto; break-inside: auto; }
        body.bp-print-client .bp-adm-msa-injected { display: block !important; padding: 14mm 14mm 20mm !important; background: white !important; color: black !important; page-break-before: always; }
        body.bp-print-client .bp-adm-audit-injected { display: block !important; padding: 14mm !important; background: white !important; color: black !important; page-break-before: always; }

        @page { size: A4; margin: 12mm 10mm; }
      }
    `;
    document.head.appendChild(s);
  }

  // ── Print routines ────────────────────────────────────────────────────
  function printDeliveryDocument() {
    ensureModeStyles();
    document.body.classList.add('bp-print-delivery');
    const cleanup = () => {
      document.body.classList.remove('bp-print-delivery');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    setTimeout(cleanup, 60_000);
    requestAnimationFrame(() => { try { window.print(); } catch (_) { cleanup(); } });
  }

  // Looks up the most recent recorded signature for this blueprint so the
  // printed MSA shows the client's actual name/title instead of a blank
  // signature line. Falls back to blank if nothing was ever signed (e.g.
  // printing before approval) or the lookup fails.
  //
  // Two paths, since this runs for both admin-triggered prints and a
  // client's own self-service download:
  //   - admin/self-test sessions can look up ANY signature for the
  //     blueprint via /api/auth/admin/access-log (dashboard-triggered
  //     prints use a freshly minted admin session, not the original
  //     signer's token).
  //   - a plain client session isn't authorised for that endpoint, so it
  //     falls back to /api/auth/my-signature, which only ever returns the
  //     caller's own signature (keyed by their exact session token).
  async function fetchLatestSignature() {
    const token = window.__bpToken;
    const blueprintId = window.__blueprintId;
    if (!token || !blueprintId) return null;
    try {
      const resp = await fetch('/api/auth/admin/access-log', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, blueprintId }),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data.ok) {
        const signEvents = (data.events || []).filter((e) => e.type === 'sign');
        if (signEvents.length) return signEvents[0]; // newest-first, per the worker
      }
    } catch (_) { /* fall through to the self-scoped lookup */ }
    try {
      const resp = await fetch('/api/auth/my-signature', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.ok) return null;
      return data.signature || null;
    } catch (_) { return null; }
  }

  // Public — no session needed, it's just legal copy — so it works for
  // both admin-triggered prints and the client's own sign modal/download.
  // Returns null (not a synthesized default) unless an admin has actually
  // saved a TOS override for this blueprint — everything else keeps
  // rendering its own terms exactly as it always has.
  async function fetchCustomSections() {
    const blueprintId = window.__blueprintId;
    if (!blueprintId) return null;
    try {
      const resp = await fetch('/api/blueprint-tos?bp=' + encodeURIComponent(blueprintId));
      const data = await resp.json().catch(() => ({}));
      return (resp.ok && data.ok && data.sections) || null;
    } catch (_) { return null; }
  }

  async function printShopifyPartnerDocument() {
    ensureModeStyles();
    if (!(window.React && window.ReactDOM && window.UncapMSA)) {
      alert('Could not load the Master Services Agreement for printing.');
      return;
    }
    // Render UncapMSA into a hidden block appended to body — print CSS
    // reveals it in Shopify-partner mode.
    const wrap = document.createElement('div');
    wrap.className = 'bp-adm-msa-injected';
    document.body.appendChild(wrap);

    const brand = (window.__brand && window.__brand.name) || '';
    const [signature, customSections] = await Promise.all([fetchLatestSignature(), fetchCustomSections()]);
    const el = window.React.createElement(window.UncapMSA, {
      company: brand,
      name: (signature && signature.name) || '',
      title: (signature && signature.title) || '',
      customSections,
    });
    const root = window.ReactDOM.createRoot(wrap);
    root.render(el);

    document.body.classList.add('bp-print-shopify');

    const cleanup = () => {
      document.body.classList.remove('bp-print-shopify');
      try { root.unmount(); } catch (_) {}
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    setTimeout(cleanup, 60_000);
    // Wait a paint so React has actually mounted the MSA before printing.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      try { window.print(); } catch (_) { cleanup(); }
    }));
  }

  const escapeHtml = (s) =>
    String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

  function formatSignedAt(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', second: '2-digit', timeZoneName: 'short',
    });
  }

  // Renders a DocuSign-style "certificate of completion" block: who signed,
  // when, and the request metadata captured at signing time. Every field
  // here comes from client-submitted or request data (name/title especially
  // are free-text from the sign form) so everything is escaped before going
  // into innerHTML.
  function auditTrailHtml(signature, blueprintId, brand) {
    if (!signature) {
      return `
        <div class="bp-adm-audit">
          <div class="bp-adm-audit-eyebrow">Digital Signature</div>
          <h2>No signature on file</h2>
          <p>This proposal has not been signed yet.</p>
        </div>`;
    }
    const rows = [
      ['Signed by', signature.name],
      ['Title', signature.title],
      ['Email', signature.email],
      ['Company', brand],
      ['Proposal', blueprintId],
      ['Date & time', formatSignedAt(signature.signedAt)],
      ['IP address', signature.ip],
      ['User agent', signature.userAgent],
    ].filter(([, v]) => v);
    return `
      <div class="bp-adm-audit">
        <div class="bp-adm-audit-eyebrow">Digital Signature · Audit Trail</div>
        <h2>Signature verification</h2>
        <p class="bp-adm-audit-intro">This document was electronically signed via the Uncap Blueprint platform. The signature event was recorded with the following details.</p>
        <div class="bp-adm-audit-grid">
          ${rows.map(([k, v]) => `
            <div class="bp-adm-audit-row">
              <span class="bp-adm-audit-k">${escapeHtml(k)}</span>
              <span class="bp-adm-audit-v">${escapeHtml(v)}</span>
            </div>`).join('')}
        </div>
      </div>`;
  }

  const AUDIT_STYLE_ID = 'bp-adm-audit-styles';
  function ensureAuditStyles() {
    if (document.getElementById(AUDIT_STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = AUDIT_STYLE_ID;
    s.textContent = `
      .bp-adm-audit { font-family: -apple-system, Inter, Arial, sans-serif; color: #0A0A0A; }
      .bp-adm-audit-eyebrow { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #707070; margin-bottom: 8px; }
      .bp-adm-audit h2 { font-size: 22px; letter-spacing: -0.02em; margin: 0 0 10px; }
      .bp-adm-audit-intro { font-size: 13px; line-height: 1.55; color: #4A4A4A; margin: 0 0 22px; max-width: 520px; }
      .bp-adm-audit-grid { border-top: 1px solid #DDD; }
      .bp-adm-audit-row { display: grid; grid-template-columns: 160px 1fr; gap: 16px; padding: 10px 0; border-bottom: 1px solid #DDD; }
      .bp-adm-audit-k { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #707070; }
      .bp-adm-audit-v { font-size: 13.5px; color: #0A0A0A; word-break: break-word; }
    `;
    document.head.appendChild(s);
  }

  async function printClientDocument() {
    ensureModeStyles();
    ensureAuditStyles();
    if (!(window.React && window.ReactDOM && window.UncapMSA)) {
      alert('Could not load the Master Services Agreement for printing.');
      return;
    }
    const brand = (window.__brand && window.__brand.name) || '';
    const blueprintId = window.__blueprintId || '';
    const [signature, customSections] = await Promise.all([fetchLatestSignature(), fetchCustomSections()]);

    const msaWrap = document.createElement('div');
    msaWrap.className = 'bp-adm-msa-injected';
    document.body.appendChild(msaWrap);
    const msaEl = window.React.createElement(window.UncapMSA, {
      company: brand,
      name: (signature && signature.name) || '',
      title: (signature && signature.title) || '',
      customSections,
    });
    const msaRoot = window.ReactDOM.createRoot(msaWrap);
    msaRoot.render(msaEl);

    const auditWrap = document.createElement('div');
    auditWrap.className = 'bp-adm-audit-injected';
    auditWrap.innerHTML = auditTrailHtml(signature, blueprintId, brand);
    document.body.appendChild(auditWrap);

    document.body.classList.add('bp-print-client');

    const cleanup = () => {
      document.body.classList.remove('bp-print-client');
      try { msaRoot.unmount(); } catch (_) {}
      if (msaWrap.parentNode) msaWrap.parentNode.removeChild(msaWrap);
      if (auditWrap.parentNode) auditWrap.parentNode.removeChild(auditWrap);
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    setTimeout(cleanup, 60_000);
    // Wait a paint so React has actually mounted the MSA before printing.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      try { window.print(); } catch (_) { cleanup(); }
    }));
  }

  // Expose for manual use from the console if ever needed.
  window.__bpPrint = { delivery: printDeliveryDocument, shopify: printShopifyPartnerDocument, client: printClientDocument };

  // ── Admin-triggered auto print (?bpPrint=delivery|shopify|client) ────
  async function fetchSession(token) {
    try {
      const resp = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.ok) return null;
      return data;
    } catch (_) { return null; }
  }

  async function maybeAutoPrint(session) {
    let mode = '';
    try { mode = new URLSearchParams(window.location.search).get('bpPrint') || ''; } catch (_) {}
    if (mode !== 'delivery' && mode !== 'shopify' && mode !== 'client') return;
    if (!session || (!session.admin && !session.selfTest)) return;

    // Give the page a beat to finish mounting sections + images, then fire.
    let waited = 0;
    const ready = () => !!document.querySelector('section[data-bp-section]');
    const fire = () => {
      if (!ready() && waited < 15_000) { waited += 500; setTimeout(fire, 500); return; }
      setTimeout(() => {
        if (mode === 'delivery') printDeliveryDocument();
        else if (mode === 'client') printClientDocument();
        else printShopifyPartnerDocument();
      }, 800);
    };
    fire();
  }

  // ── Client self-service download ──────────────────────────────────────
  // Once a client has signed, they shouldn't need to email us for a copy.
  // Checks whether the current session has its own recorded signature
  // (via the self-scoped /api/auth/my-signature — never anyone else's)
  // and, if so, shows a small floating button that triggers the same
  // "For the Client" print (whole document + terms + signature audit
  // trail) used by the admin dashboard. Admin/preview sessions never
  // have a signature under their own token (handleSign skips the KV
  // write for them), so this naturally stays hidden for admins.
  const DOWNLOAD_BTN_ID = 'bp-client-download-btn';
  async function maybeShowClientDownloadButton() {
    if (document.getElementById(DOWNLOAD_BTN_ID)) return;
    const token = window.__bpToken;
    if (!token) return;
    try {
      const resp = await fetch('/api/auth/my-signature', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.ok || !data.signature) return;
    } catch (_) { return; }

    const btn = document.createElement('button');
    btn.id = DOWNLOAD_BTN_ID;
    btn.type = 'button';
    const label = 'Download signed copy ↓';
    btn.textContent = label;
    btn.style.cssText = [
      'position:fixed', 'right:18px', 'bottom:18px', 'z-index:40',
      "font-family:ui-monospace,SFMono-Regular,Menlo,monospace",
      'font-size:11px', 'font-weight:700', 'letter-spacing:0.08em', 'text-transform:uppercase',
      'color:#0A0A0A', 'background:#F2EFE7', 'border:1px solid #0A0A0A',
      'border-radius:999px', 'padding:12px 18px', 'cursor:pointer',
      'box-shadow:0 12px 30px -14px rgba(10,10,10,0.5)',
    ].join(';');
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      btn.disabled = true;
      btn.textContent = 'Preparing…';
      Promise.resolve(printClientDocument()).finally(() => {
        btn.disabled = false;
        btn.textContent = label;
      });
    });
    document.body.appendChild(btn);
  }

  // ── Floating team toolbar ─────────────────────────────────────────────
  // Rendered only for admin/preview sessions (clients never see it): a slim
  // pill top-right with the three print modes and a hop back to the admin.
  // Blueprint pages are opened from the Pipeline, the company profile, and
  // the Blueprints list — the toolbar makes print available from all of
  // them without hunting for the list's Print menu.
  const TOOLBAR_ID = 'bp-admin-toolbar';
  function mountAdminBar(session) {
    if (!session || (!session.admin && !session.selfTest)) return;
    if (document.getElementById(TOOLBAR_ID)) return;

    const bar = document.createElement('div');
    bar.id = TOOLBAR_ID;
    bar.style.cssText = [
      'position:fixed', 'top:12px', 'right:12px', 'z-index:2000',
      'display:flex', 'align-items:center', 'gap:6px', 'flex-wrap:wrap', 'justify-content:flex-end',
      'max-width:calc(100vw - 24px)',
      'background:rgba(10,10,10,0.92)', 'backdrop-filter:blur(6px)',
      'border:1px solid #2B2B2B', 'border-radius:999px', 'padding:6px 8px 6px 14px',
      'box-shadow:0 14px 34px -16px rgba(10,10,10,0.6)',
      "font-family:ui-monospace,SFMono-Regular,Menlo,monospace", 'font-size:10px',
      'letter-spacing:0.08em', 'color:#F2EFE7',
    ].join(';');

    const label = document.createElement('span');
    label.textContent = 'UNCAP · ADMIN';
    label.style.cssText = 'font-weight:700;color:#E8FF4E;margin-right:4px;white-space:nowrap';
    bar.appendChild(label);

    const btn = (text, onClick) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = text;
      b.style.cssText = [
        'border:1px solid #4D4D4D', 'background:transparent', 'color:#F2EFE7',
        'border-radius:999px', 'padding:7px 12px', 'cursor:pointer',
        'font-family:inherit', 'font-size:10px', 'letter-spacing:0.06em', 'white-space:nowrap',
      ].join(';');
      b.addEventListener('mouseenter', () => { b.style.background = '#2B2B2B'; });
      b.addEventListener('mouseleave', () => { b.style.background = 'transparent'; });
      b.addEventListener('click', (e) => { e.preventDefault(); onClick(); });
      bar.appendChild(b);
      return b;
    };

    btn('PRINT · DELIVERY', () => printDeliveryDocument());
    btn('PRINT · SHOPIFY', () => printShopifyPartnerDocument());
    btn('PRINT · CLIENT', () => printClientDocument());

    const link = document.createElement('a');
    link.href = '/admin/blueprints';
    link.textContent = 'ADMIN ↗';
    link.style.cssText = 'color:#E8FF4E;text-decoration:none;font-weight:700;padding:7px 8px;white-space:nowrap';
    bar.appendChild(link);

    document.body.appendChild(bar);
  }

  // window.__bpToken may not be set yet when this script first runs (the
  // Gate sets it asynchronously — for admins, via the bp_admin cookie).
  // Poll briefly until it appears, or give up after 60 seconds. The session
  // is resolved once and shared by the auto-print hook and the toolbar.
  let attempts = 0;
  async function tryInit() {
    if (window.__bpToken && window.__blueprintId) {
      const session = await fetchSession(window.__bpToken);
      mountAdminBar(session);
      maybeAutoPrint(session);
      maybeShowClientDownloadButton();
      return;
    }
    attempts++;
    if (attempts > 60) return;
    setTimeout(tryInit, 1000);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }
})();
