// ── Admin toolbar — only visible for the Uncap team ──────────────────────
// Self-mounting script. Reads window.__bpToken + window.__blueprintId, asks
// /api/auth/session who the current viewer is, and if they're flagged as
// admin or selfTest (any @uncap.com email), pins a small toolbar to the
// top-right corner. Clicking the toolbar's "Activity" button opens a panel
// listing every viewer of this blueprint with timestamp, IP, country/city,
// and user-agent — plus every signature record on the same timeline.
//
// External clients (gmail addresses etc.) never see the toolbar — the
// /api/auth/session response says selfTest:false, so render() short-
// circuits before anything mounts.
// ─────────────────────────────────────────────────────────────────────────

(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.__bpAdminToolbarMounted) return;
  window.__bpAdminToolbarMounted = true;

  const STYLE_ID = 'bp-admin-toolbar-styles';
  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
      .bp-adm-bar { position: fixed; top: 14px; right: 14px; z-index: 9000; display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(10,10,10,0.92); color: #FFFFFF; border: 1px solid #2B2B2B; border-radius: 999px; box-shadow: 0 12px 28px -16px rgba(0,0,0,0.6); font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; backdrop-filter: blur(6px); }
      .bp-adm-bar .bp-adm-dot { width: 7px; height: 7px; border-radius: 999px; background: #E8FF52; box-shadow: 0 0 0 0 rgba(232,255,82,0.6); animation: bp-adm-pulse 2.4s ease-out infinite; }
      @keyframes bp-adm-pulse { 0% { box-shadow: 0 0 0 0 rgba(232,255,82,0.6); } 70% { box-shadow: 0 0 0 8px rgba(232,255,82,0); } 100% { box-shadow: 0 0 0 0 rgba(232,255,82,0); } }
      .bp-adm-bar .bp-adm-label { font-weight: 700; }
      .bp-adm-bar .bp-adm-action { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: #E8FF52; color: #0A0A0A; font-weight: 700; border: none; cursor: pointer; font-family: inherit; font-size: inherit; letter-spacing: inherit; text-transform: inherit; }
      .bp-adm-bar .bp-adm-action:hover { background: #FFFFFF; }
      .bp-adm-bar .bp-adm-action.is-secondary { background: transparent; color: #FFFFFF; border: 1px solid rgba(255,255,255,0.3); }
      .bp-adm-bar .bp-adm-action.is-secondary:hover { border-color: #FFFFFF; background: rgba(255,255,255,0.08); }
      .bp-adm-bar .bp-adm-close { background: transparent; color: rgba(255,255,255,0.55); border: none; cursor: pointer; padding: 2px 6px; font-family: inherit; font-size: 13px; line-height: 1; }
      .bp-adm-bar .bp-adm-close:hover { color: #FFFFFF; }

      .bp-adm-print-wrap { position: relative; }
      .bp-adm-print-menu { position: absolute; top: calc(100% + 8px); right: 0; min-width: 240px; background: #0A0A0A; color: #FFFFFF; border: 1px solid #2B2B2B; border-radius: 10px; padding: 6px; box-shadow: 0 18px 40px -18px rgba(0,0,0,0.7); display: flex; flex-direction: column; gap: 2px; font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace); font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; }
      .bp-adm-print-menu button { background: transparent; border: none; color: #FFFFFF; text-align: left; padding: 9px 11px; border-radius: 6px; cursor: pointer; font-family: inherit; font-size: inherit; letter-spacing: inherit; text-transform: inherit; display: flex; flex-direction: column; gap: 3px; align-items: flex-start; }
      .bp-adm-print-menu button:hover { background: rgba(232,255,82,0.12); color: #E8FF52; }
      .bp-adm-print-menu button .bp-adm-print-sub { font-size: 9px; letter-spacing: 0.04em; text-transform: none; opacity: 0.6; font-weight: 500; }

      .bp-adm-modal { position: fixed; inset: 0; z-index: 9001; background: rgba(10,10,10,0.6); display: flex; align-items: flex-start; justify-content: center; padding: 56px 20px 24px; overflow-y: auto; }
      .bp-adm-modal .bp-adm-card { width: 100%; max-width: 920px; background: #FFFFFF; color: #15161B; border-radius: 12px; border: 1px solid #0A0A0A; box-shadow: 0 36px 80px -36px rgba(10,10,10,0.55); overflow: hidden; }
      .bp-adm-card .bp-adm-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid #E4E5EA; font-family: var(--font-sans, Inter, -apple-system, sans-serif); }
      .bp-adm-card .bp-adm-head .bp-adm-title { font-weight: 700; font-size: 15px; letter-spacing: -0.01em; }
      .bp-adm-card .bp-adm-head .bp-adm-sub { font-family: var(--font-mono, ui-monospace); font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; color: #6A6E7A; margin-top: 2px; }
      .bp-adm-card .bp-adm-x { background: transparent; border: 1px solid #E4E5EA; border-radius: 999px; width: 30px; height: 30px; cursor: pointer; font-size: 14px; line-height: 1; color: #6A6E7A; }
      .bp-adm-card .bp-adm-x:hover { color: #0A0A0A; border-color: #0A0A0A; }
      .bp-adm-card .bp-adm-body { max-height: 65vh; overflow-y: auto; padding: 0; font-family: var(--font-sans, Inter, sans-serif); font-size: 13px; }
      .bp-adm-card table { width: 100%; border-collapse: collapse; }
      .bp-adm-card th, .bp-adm-card td { text-align: left; padding: 10px 14px; border-bottom: 1px solid #EEF0F4; vertical-align: top; }
      .bp-adm-card th { background: #FAFAFB; font-family: var(--font-mono, ui-monospace); font-size: 9.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #6A6E7A; position: sticky; top: 0; }
      .bp-adm-card .bp-adm-tag { display: inline-block; padding: 2px 8px; border-radius: 999px; font-family: var(--font-mono, ui-monospace); font-size: 9.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
      .bp-adm-card .bp-adm-tag.t-view { background: #EEF0FE; color: #3A44C4; }
      .bp-adm-card .bp-adm-tag.t-sign { background: #DFFCE6; color: #064E2E; }
      .bp-adm-card .bp-adm-meta { font-family: var(--font-mono, ui-monospace); font-size: 11.5px; color: #15161B; }
      .bp-adm-card .bp-adm-faint { color: #6A6E7A; }
      .bp-adm-card .bp-adm-empty { padding: 48px 22px; text-align: center; color: #6A6E7A; }
      .bp-adm-card .bp-adm-loading { padding: 28px 22px; text-align: center; color: #6A6E7A; }
      .bp-adm-card .bp-adm-ua { font-size: 11px; color: #6A6E7A; max-width: 320px; word-break: break-word; }

      /* Print pages injected by the admin toolbar Print menu. The injected
         MSA block (.bp-adm-msa-injected) is hidden on screen and only
         revealed in the relevant print mode. */
      .bp-adm-msa-injected { display: none; }

      @media print {
        /* Always strip the toolbar + activity modal during print. */
        .bp-adm-bar, .bp-adm-modal { display: none !important; }

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

  function fmtWhen(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function fmtLocation(ev) {
    const parts = [ev.city, ev.region, ev.country].filter(Boolean);
    return parts.length ? parts.join(', ') : (ev.country || '');
  }
  function shortUA(ua) {
    if (!ua) return '';
    // Strip the noisy bits; keep platform + browser hint.
    const m = ua.match(/\(([^)]+)\)/);
    const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera|Mobile)\/[\d.]+/);
    return [(m && m[1]) || '', browser ? browser[0] : ''].filter(Boolean).join(' · ').slice(0, 120);
  }

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
  async function fetchAccessLog(token, blueprintId) {
    const resp = await fetch('/api/auth/admin/access-log', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token, blueprintId }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || !data.ok) throw new Error(data.error || 'Failed to load activity');
    return data.events || [];
  }

  function renderModal(events, blueprintId, onClose) {
    const wrap = document.createElement('div');
    wrap.className = 'bp-adm-modal';
    wrap.addEventListener('click', (e) => { if (e.target === wrap) onClose(); });

    const card = document.createElement('div');
    card.className = 'bp-adm-card';
    wrap.appendChild(card);

    const head = document.createElement('div');
    head.className = 'bp-adm-head';
    head.innerHTML = `
      <div>
        <div class="bp-adm-title">Activity · /${blueprintId}/</div>
        <div class="bp-adm-sub">${events.length} event${events.length === 1 ? '' : 's'} · newest first · last 365 days</div>
      </div>
      <button type="button" class="bp-adm-x" aria-label="Close">✕</button>`;
    head.querySelector('.bp-adm-x').addEventListener('click', onClose);
    card.appendChild(head);

    const body = document.createElement('div');
    body.className = 'bp-adm-body';
    card.appendChild(body);

    if (!events.length) {
      body.innerHTML = '<div class="bp-adm-empty">No activity recorded yet.</div>';
    } else {
      const escapeHtml = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      const rows = events.map((ev) => {
        const when = fmtWhen(ev.verifiedAt || ev.signedAt);
        const loc  = fmtLocation(ev);
        const tag  = ev.type === 'sign'
          ? '<span class="bp-adm-tag t-sign">Signed</span>'
          : '<span class="bp-adm-tag t-view">Viewed</span>';
        const signerInfo = ev.type === 'sign' && (ev.name || ev.title)
          ? `<div class="bp-adm-faint" style="margin-top:4px;font-size:11.5px;">${escapeHtml(ev.name || '')}${ev.title ? ' · ' + escapeHtml(ev.title) : ''}</div>`
          : '';
        return `
          <tr>
            <td>${tag}</td>
            <td>
              <div>${escapeHtml(ev.email || '')}</div>
              ${signerInfo}
            </td>
            <td class="bp-adm-meta">${escapeHtml(when)}</td>
            <td class="bp-adm-meta">${escapeHtml(ev.ip || '')}</td>
            <td class="bp-adm-meta">${escapeHtml(loc)}</td>
            <td class="bp-adm-ua">${escapeHtml(shortUA(ev.userAgent || ''))}</td>
          </tr>`;
      }).join('');
      body.innerHTML = `
        <table>
          <thead>
            <tr><th>Type</th><th>Email</th><th>Time</th><th>IP</th><th>Location</th><th>Agent</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`;
    }

    document.body.appendChild(wrap);
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    };
  }

  // ── Print helpers ─────────────────────────────────────────────────────
  // Two print modes triggered from the toolbar's Print dropdown:
  //  - 'delivery' : print everything except nav, signature popup, toolbar
  //  - 'shopify'  : print only the named sections + the Master Services
  //                 Agreement appended as the last page set
  function printDeliveryDocument() {
    document.body.classList.add('bp-print-delivery');
    const cleanup = () => {
      document.body.classList.remove('bp-print-delivery');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    setTimeout(cleanup, 60_000);
    requestAnimationFrame(() => { try { window.print(); } catch (_) { cleanup(); } });
  }

  function printShopifyPartnerDocument() {
    if (!(window.React && window.ReactDOM && window.UncapMSA)) {
      alert('Could not load the Master Services Agreement. Try the Print agreement button inside the Approve & kickoff popup instead.');
      return;
    }
    // Render UncapMSA into a hidden block we'll append to body — print
    // CSS reveals it in Shopify-partner mode.
    const wrap = document.createElement('div');
    wrap.className = 'bp-adm-msa-injected';
    document.body.appendChild(wrap);

    const brand = (window.__brand && window.__brand.name) || '';
    const el = window.React.createElement(window.UncapMSA, { company: brand, name: '', title: '' });
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

  function renderToolbar(session, token, blueprintId) {
    ensureStyles();
    const bar = document.createElement('div');
    bar.className = 'bp-adm-bar';
    bar.innerHTML =
      '<span class="bp-adm-dot"></span>' +
      '<span class="bp-adm-label">Internal</span>' +
      '<button type="button" class="bp-adm-action" data-act="activity">Activity</button>' +
      '<span class="bp-adm-print-wrap">' +
        '<button type="button" class="bp-adm-action is-secondary" data-act="print" aria-haspopup="true" aria-expanded="false">Print ▾</button>' +
      '</span>' +
      '<button type="button" class="bp-adm-close" aria-label="Hide toolbar">×</button>';
    document.body.appendChild(bar);

    const activityBtn = bar.querySelector('[data-act="activity"]');
    const printBtn    = bar.querySelector('[data-act="print"]');
    const printWrap   = bar.querySelector('.bp-adm-print-wrap');
    const closeBtn    = bar.querySelector('.bp-adm-close');

    let modalCleanup = null;
    let printMenuEl  = null;

    function closePrintMenu() {
      if (printMenuEl && printMenuEl.parentNode) printMenuEl.parentNode.removeChild(printMenuEl);
      printMenuEl = null;
      printBtn.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', onDocClickOutside, true);
      window.removeEventListener('keydown', onEsc);
    }
    function onDocClickOutside(e) {
      if (printWrap.contains(e.target)) return;
      closePrintMenu();
    }
    function onEsc(e) { if (e.key === 'Escape') closePrintMenu(); }
    function openPrintMenu() {
      if (printMenuEl) { closePrintMenu(); return; }
      printMenuEl = document.createElement('div');
      printMenuEl.className = 'bp-adm-print-menu';
      printMenuEl.innerHTML =
        '<button type="button" data-mode="delivery">For Delivery Team' +
          '<span class="bp-adm-print-sub">Whole document · no terms · no nav</span>' +
        '</button>' +
        '<button type="button" data-mode="shopify">For Shopify Partner Program' +
          '<span class="bp-adm-print-sub">Intro · Scope · Architecture · Unified · Integrated · Migration · Delivery · Investment + MSA</span>' +
        '</button>';
      printMenuEl.querySelector('[data-mode="delivery"]').addEventListener('click', () => {
        closePrintMenu();
        printDeliveryDocument();
      });
      printMenuEl.querySelector('[data-mode="shopify"]').addEventListener('click', () => {
        closePrintMenu();
        printShopifyPartnerDocument();
      });
      printWrap.appendChild(printMenuEl);
      printBtn.setAttribute('aria-expanded', 'true');
      // Defer the click listener so the click that opened the menu doesn't
      // immediately close it.
      setTimeout(() => document.addEventListener('click', onDocClickOutside, true), 0);
      window.addEventListener('keydown', onEsc);
    }

    activityBtn.addEventListener('click', async () => {
      const original = activityBtn.textContent;
      activityBtn.textContent = 'Loading…';
      activityBtn.disabled = true;
      try {
        const events = await fetchAccessLog(token, blueprintId);
        if (modalCleanup) modalCleanup();
        modalCleanup = renderModal(events, blueprintId, () => { if (modalCleanup) modalCleanup(); modalCleanup = null; });
      } catch (err) {
        alert('Could not load activity: ' + (err && err.message || 'unknown error'));
      } finally {
        activityBtn.textContent = original;
        activityBtn.disabled = false;
      }
    });

    printBtn.addEventListener('click', (e) => { e.stopPropagation(); openPrintMenu(); });

    closeBtn.addEventListener('click', () => {
      if (modalCleanup) modalCleanup();
      closePrintMenu();
      if (bar.parentNode) bar.parentNode.removeChild(bar);
    });
  }

  async function init() {
    const token = window.__bpToken;
    const blueprintId = window.__blueprintId;
    if (!token || !blueprintId) return;
    const session = await fetchSession(token);
    if (!session) return;
    if (!session.admin && !session.selfTest) return;
    renderToolbar(session, token, blueprintId);
  }

  // window.__bpToken may not be set yet when this script first runs (the
  // Gate sets it asynchronously after the user enters their code). Poll
  // briefly until it appears, or give up after 60 seconds.
  let attempts = 0;
  function tryInit() {
    if (window.__bpToken && window.__blueprintId) { init(); return; }
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
