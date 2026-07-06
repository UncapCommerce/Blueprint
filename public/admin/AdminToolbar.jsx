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
      /* The injected MSA block is hidden on screen and only revealed in
         the Shopify-partner print mode. */
      .bp-adm-msa-injected { display: none; }

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
      if (!resp.ok || !data.ok) return null;
      const signEvents = (data.events || []).filter((e) => e.type === 'sign');
      if (!signEvents.length) return null;
      // Events are already sorted newest-first by the worker.
      return signEvents[0];
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
    const signature = await fetchLatestSignature();
    const el = window.React.createElement(window.UncapMSA, {
      company: brand,
      name: (signature && signature.name) || '',
      title: (signature && signature.title) || '',
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

  // Expose for manual use from the console if ever needed.
  window.__bpPrint = { delivery: printDeliveryDocument, shopify: printShopifyPartnerDocument };

  // ── Admin-triggered auto print (?bpPrint=delivery|shopify) ───────────
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

  async function maybeAutoPrint() {
    let mode = '';
    try { mode = new URLSearchParams(window.location.search).get('bpPrint') || ''; } catch (_) {}
    if (mode !== 'delivery' && mode !== 'shopify') return;

    const token = window.__bpToken;
    if (!token) return;
    const session = await fetchSession(token);
    if (!session || (!session.admin && !session.selfTest)) return;

    // Give the page a beat to finish mounting sections + images, then fire.
    let waited = 0;
    const ready = () => !!document.querySelector('section[data-bp-section]');
    const fire = () => {
      if (!ready() && waited < 15_000) { waited += 500; setTimeout(fire, 500); return; }
      setTimeout(() => {
        if (mode === 'delivery') printDeliveryDocument();
        else printShopifyPartnerDocument();
      }, 800);
    };
    fire();
  }

  // window.__bpToken may not be set yet when this script first runs (the
  // Gate sets it asynchronously — for admins, via the bp_admin cookie).
  // Poll briefly until it appears, or give up after 60 seconds.
  let attempts = 0;
  function tryInit() {
    if (window.__bpToken && window.__blueprintId) { maybeAutoPrint(); return; }
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
