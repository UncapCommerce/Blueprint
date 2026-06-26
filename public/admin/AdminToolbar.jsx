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
      .bp-adm-bar .bp-adm-close { background: transparent; color: rgba(255,255,255,0.55); border: none; cursor: pointer; padding: 2px 6px; font-family: inherit; font-size: 13px; line-height: 1; }
      .bp-adm-bar .bp-adm-close:hover { color: #FFFFFF; }

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
      @media print { .bp-adm-bar, .bp-adm-modal { display: none !important; } }
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

  function renderToolbar(session, token, blueprintId) {
    ensureStyles();
    const bar = document.createElement('div');
    bar.className = 'bp-adm-bar';
    bar.innerHTML = `
      <span class="bp-adm-dot"></span>
      <span class="bp-adm-label">Uncap team</span>
      <button type="button" class="bp-adm-action">Activity</button>
      <button type="button" class="bp-adm-close" aria-label="Hide toolbar">×</button>`;
    document.body.appendChild(bar);

    let cleanup = null;
    bar.querySelector('.bp-adm-action').addEventListener('click', async () => {
      const action = bar.querySelector('.bp-adm-action');
      const original = action.textContent;
      action.textContent = 'Loading…';
      action.disabled = true;
      try {
        const events = await fetchAccessLog(token, blueprintId);
        if (cleanup) cleanup();
        cleanup = renderModal(events, blueprintId, () => { if (cleanup) cleanup(); cleanup = null; });
      } catch (err) {
        alert('Could not load activity: ' + (err && err.message || 'unknown error'));
      } finally {
        action.textContent = original;
        action.disabled = false;
      }
    });
    bar.querySelector('.bp-adm-close').addEventListener('click', () => {
      if (cleanup) cleanup();
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
