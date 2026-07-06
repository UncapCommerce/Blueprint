// ── Blueprint admin application ───────────────────────────────────────────
// Mounted by public/index.html at the site root. Google sign-in (Uncap team
// only), then two areas: Discoveries (client discovery records), Blueprints
// (every proposal with preview / share / activity / print, plus
// new-blueprint drafts).
//
// All state lives in the worker (KV) behind /api/admin/*; the bp_admin
// HttpOnly cookie carries the session, so every fetch here uses
// credentials: 'same-origin'.
//
// Responsive: no stylesheet — components read useIsMobile() (680px) and
// swap table layouts for stacked cards, collapse the top bar to two rows,
// and keep inputs at 16px so iOS Safari doesn't auto-zoom.
// ──────────────────────────────────────────────────────────────────────────

(function () {
  const { useState, useEffect, useRef, useCallback, useMemo } = React;

  // ── shared fetch helper ──────────────────────────────────────────────
  async function api(path, opts) {
    const resp = await fetch(path, {
      credentials: 'same-origin',
      headers: opts && opts.body ? { 'content-type': 'application/json' } : undefined,
      ...opts,
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || data.ok === false) {
      const err = new Error(data.error || `Request failed (${resp.status})`);
      err.status = resp.status;
      throw err;
    }
    return data;
  }

  const fmtWhen = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // ── design tokens (inline-styled, matching the blueprint pages) ──────
  const T = {
    cream:  'var(--uc-cream, #F2EFE7)',
    paper:  'var(--uc-paper, #FFFFFF)',
    black:  'var(--uc-black, #0A0A0A)',
    signal: 'var(--uc-signal, #E8FF52)',
    line:   'var(--line-1, #E2DFD5)',
    fg1:    'var(--fg-1, #0A0A0A)',
    fg2:    'var(--fg-2, #4A4A4A)',
    fg3:    'var(--fg-3, #8A8780)',
    mono:   'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
    sans:   'var(--font-sans, Inter, -apple-system, sans-serif)',
    hero:   'var(--font-hero, Inter, -apple-system, sans-serif)',
  };

  const S = {
    eyebrow: { fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.fg3 },
    card: { background: T.paper, border: `1px solid ${T.black}`, borderRadius: 10, boxShadow: '0 18px 40px -22px rgba(10,10,10,0.25)' },
    btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', fontFamily: T.sans, fontSize: 13.5, fontWeight: 600, lineHeight: 1, background: T.black, color: '#fff', border: '1px solid ' + T.black, borderRadius: 999, cursor: 'pointer' },
    btnLime: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', fontFamily: T.sans, fontSize: 13.5, fontWeight: 700, lineHeight: 1, background: T.signal, color: T.black, border: '1px solid ' + T.black, borderRadius: 999, cursor: 'pointer' },
    btnGhost: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1, background: T.paper, color: T.fg1, border: `1px solid ${T.line}`, borderRadius: 999, cursor: 'pointer' },
    // 16px keeps iOS Safari from auto-zooming the page when an input is focused.
    input: { width: '100%', boxSizing: 'border-box', padding: '12px 14px', fontFamily: T.sans, fontSize: 16, color: T.fg1, background: T.cream, border: `1px solid ${T.line}`, borderRadius: 6, outline: 'none' },
    label: { fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.fg3, display: 'block', marginBottom: 6 },
    th: { textAlign: 'left', padding: '10px 14px', borderBottom: `1px solid ${T.line}`, fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.fg3, background: '#FAFAF7', whiteSpace: 'nowrap' },
    td: { textAlign: 'left', padding: '12px 14px', borderBottom: `1px solid ${T.line}`, fontFamily: T.sans, fontSize: 13.5, color: T.fg1, verticalAlign: 'top' },
  };

  // ── path router ───────────────────────────────────────────────────────
  // Real paths (/blueprints, /discoveries) instead of #/ hash routes, so
  // the URL is bookmarkable and shareable. Workers Static Assets is
  // configured with not_found_handling = single-page-application, so any
  // path that isn't a real static asset (including these) falls back to
  // this same index.html, which re-mounts AdminApp and this parses the
  // pathname straight back to the right route.
  function parseRoute() {
    const seg = window.location.pathname.split('/').filter(Boolean)[0];
    return seg === 'discoveries' ? 'discoveries' : 'blueprints';
  }
  // Client-side transition: pushState updates the URL without a reload,
  // then a custom event nudges every useRoute() subscriber to re-parse
  // (pushState alone doesn't fire popstate).
  function navigate(path) {
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
    window.dispatchEvent(new CustomEvent('bp:navigate'));
  }
  function useRoute() {
    const [route, setRoute] = useState(parseRoute);
    useEffect(() => {
      const onChange = () => setRoute(parseRoute());
      window.addEventListener('popstate', onChange);
      window.addEventListener('bp:navigate', onChange);
      return () => {
        window.removeEventListener('popstate', onChange);
        window.removeEventListener('bp:navigate', onChange);
      };
    }, []);
    return route;
  }
  // Left-click-only nav handler so ctrl/cmd/shift/middle-click still open
  // a new tab via the real href, instead of hijacking every click.
  function navClick(path) {
    return (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      navigate(path);
    };
  }

  // ── responsive helper ────────────────────────────────────────────────
  function useIsMobile() {
    const query = '(max-width: 680px)';
    const [mobile, setMobile] = useState(() => window.matchMedia(query).matches);
    useEffect(() => {
      const mq = window.matchMedia(query);
      const onChange = (e) => setMobile(e.matches);
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else mq.addListener(onChange);
      return () => {
        if (mq.removeEventListener) mq.removeEventListener('change', onChange);
        else mq.removeListener(onChange);
      };
    }, []);
    return mobile;
  }

  // ── login screen ─────────────────────────────────────────────────────
  function Login({ onAuthed }) {
    const btnRef = useRef(null);
    const isMobile = useIsMobile();
    const [error, setError] = useState('');
    const [configured, setConfigured] = useState(null); // null = loading

    useEffect(() => {
      let dead = false;
      (async () => {
        let clientId = '';
        try {
          const cfg = await api('/api/admin/config');
          clientId = cfg.googleClientId || '';
        } catch (_) { /* config endpoint down — treated as unconfigured */ }
        if (dead) return;
        setConfigured(!!clientId);
        if (!clientId) return;

        // Wait for the GIS script, then render Google's button.
        let tries = 0;
        const arm = () => {
          if (dead) return;
          if (!(window.google && window.google.accounts && window.google.accounts.id)) {
            if (++tries < 100) setTimeout(arm, 150);
            return;
          }
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (resp) => {
              try {
                await api('/api/admin/google-login', {
                  method: 'POST',
                  body: JSON.stringify({ credential: resp.credential }),
                });
                onAuthed();
              } catch (err) {
                setError(err.message || 'Sign-in failed');
              }
            },
          });
          if (btnRef.current) {
            window.google.accounts.id.renderButton(btnRef.current, {
              theme: 'outline', size: 'large', text: 'continue_with', shape: 'pill', width: 280,
            });
          }
        };
        arm();
      })();
      return () => { dead = true; };
    }, []);

    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.cream, padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <img src="/assets/uncap-logo-black.svg" alt="Uncap" style={{ height: 30, width: 'auto', display: 'block', margin: '0 auto 28px' }}/>
          <div style={{ ...S.card, padding: isMobile ? 26 : 36 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 22, ...S.eyebrow }}>
              <span style={{ width: 14, height: 2, background: T.signal }}/>
              Blueprint · Internal
            </div>
            <h1 style={{ margin: '0 0 10px', fontFamily: T.hero, fontWeight: 800, fontSize: 'clamp(28px, 4vw, 36px)', lineHeight: 1.04, letterSpacing: '-0.03em', color: T.fg1 }}>
              Sign in.
            </h1>
            <p style={{ margin: '0 0 26px', fontFamily: T.sans, fontSize: 14.5, lineHeight: 1.55, color: T.fg2 }}>
              The Blueprint admin is reserved for the Uncap team. Use your <strong>@uncap.com</strong> Google account.
            </p>

            {configured === false && (
              <div style={{ padding: '12px 14px', background: '#FFF6E0', border: '1px solid #E8C36A', borderRadius: 8, fontFamily: T.sans, fontSize: 13, color: '#6A4E00', marginBottom: 8 }}>
                Google sign-in isn't configured yet — the OAuth Client ID still needs to be added to the worker.
              </div>
            )}
            {configured !== false && <div ref={btnRef} style={{ display: 'flex', justifyContent: 'center', minHeight: 44 }}/>}

            {error && (
              <div style={{ marginTop: 14, fontFamily: T.mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#B3261E' }}>
                {error}
              </div>
            )}

            <div style={{ marginTop: 24, paddingTop: 18, borderTop: `1px solid ${T.line}`, ...S.eyebrow }}>
              @uncap.com accounts only
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── top navigation ───────────────────────────────────────────────────
  function TopBar({ me, route, onLogout }) {
    const isMobile = useIsMobile();
    const items = [
      { id: 'discoveries', l: 'Discoveries' },
      { id: 'blueprints',  l: 'Blueprints' },
    ];
    const pill = (it) => (
      <a key={it.id} href={'/' + it.id} onClick={navClick('/' + it.id)} style={{
        padding: '7px 14px', borderRadius: 999, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
        fontFamily: T.sans, fontSize: 13.5, fontWeight: 600, lineHeight: 1,
        color: route === it.id ? T.black : T.fg2,
        background: route === it.id ? T.signal : 'transparent',
        border: route === it.id ? `1px solid ${T.black}` : '1px solid transparent',
      }}>{it.l}</a>
    );
    return (
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: T.paper, borderBottom: `1px solid ${T.black}` }}>
        <div style={{
          maxWidth: 1160, margin: '0 auto',
          padding: isMobile ? '10px 14px 8px' : '0 20px',
          minHeight: isMobile ? 0 : 60,
          display: 'flex', alignItems: 'center',
          gap: isMobile ? 10 : 26,
          flexWrap: isMobile ? 'wrap' : 'nowrap',
        }}>
          <a href="/blueprints" onClick={navClick('/blueprints')} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/assets/uncap-logo-black.svg" alt="Uncap" style={{ height: 20, width: 'auto', display: 'block' }}/>
            <span style={{ ...S.eyebrow, color: T.fg1 }}>Blueprint</span>
          </a>

          {!isMobile && (
            <nav style={{ display: 'flex', gap: 4, marginLeft: 8 }}>{items.map(pill)}</nav>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
            {me.picture
              ? <img src={me.picture} alt="" referrerPolicy="no-referrer" style={{ width: 28, height: 28, borderRadius: 999, border: `1px solid ${T.line}` }}/>
              : <span style={{ width: 28, height: 28, borderRadius: 999, background: T.signal, border: `1px solid ${T.black}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.mono, fontSize: 11, fontWeight: 700 }}>{(me.email || '?')[0].toUpperCase()}</span>}
            {!isMobile && <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fg3, letterSpacing: '0.04em' }}>{me.email}</span>}
            <button type="button" onClick={onLogout} style={S.btnGhost}>Sign out</button>
          </div>

          {isMobile && (
            <nav style={{ width: '100%', display: 'flex', gap: 6, overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingTop: 4 }}>
              {items.map(pill)}
            </nav>
          )}
        </div>
      </header>
    );
  }

  function Page({ children }) {
    const isMobile = useIsMobile();
    return <main style={{ maxWidth: 1160, margin: '0 auto', padding: isMobile ? '22px 14px 64px' : '36px 20px 80px' }}>{children}</main>;
  }

  function PageHead({ eyebrow, title, action }) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          {eyebrow ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 10, ...S.eyebrow }}>
              <span style={{ width: 14, height: 2, background: T.signal }}/>{eyebrow}
            </div>
          ) : null}
          <h1 style={{ margin: 0, fontFamily: T.hero, fontWeight: 800, fontSize: 'clamp(26px, 3.4vw, 40px)', letterSpacing: '-0.03em', lineHeight: 1, color: T.fg1 }}>{title}</h1>
        </div>
        {action || null}
      </div>
    );
  }

  // ── modal chrome ─────────────────────────────────────────────────────
  function Modal({ title, sub, onClose, children, width }) {
    const isMobile = useIsMobile();
    useEffect(() => {
      const onKey = (e) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);
    return (
      <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(10,10,10,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: isMobile ? '16px 10px 20px' : '56px 20px 24px', overflowY: 'auto' }}>
        <div style={{ ...S.card, width: '100%', maxWidth: width || 520, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: isMobile ? '14px 16px' : '18px 22px', borderBottom: `1px solid ${T.line}` }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em', color: T.fg1 }}>{title}</div>
              {sub ? <div style={{ ...S.eyebrow, marginTop: 3 }}>{sub}</div> : null}
            </div>
            <button type="button" onClick={onClose} aria-label="Close"
              style={{ background: 'transparent', border: `1px solid ${T.line}`, borderRadius: 999, width: 32, height: 32, flexShrink: 0, cursor: 'pointer', fontSize: 14, lineHeight: 1, color: T.fg3 }}>✕</button>
          </div>
          {children}
        </div>
      </div>
    );
  }

  function Field({ label, value, onChange, placeholder, autoFocus, type }) {
    return (
      <div>
        <label style={S.label}>{label}</label>
        <input style={S.input} type={type || 'text'} value={value} placeholder={placeholder || ''} autoFocus={!!autoFocus}
          onChange={(e) => onChange(e.target.value)}/>
      </div>
    );
  }

  // ── Discoveries ──────────────────────────────────────────────────────
  function Discoveries() {
    const isMobile = useIsMobile();
    const [rows, setRows] = useState(null);
    const [showNew, setShowNew] = useState(() => new URLSearchParams(window.location.search).get('new') === '1');
    const [error, setError] = useState('');

    const load = useCallback(async () => {
      try { setRows((await api('/api/admin/discoveries')).discoveries); }
      catch (err) { setError(err.message); setRows([]); }
    }, []);
    useEffect(() => { load(); }, [load]);

    const webLink = (r) => r.website
      ? <a href={/^https?:/i.test(r.website) ? r.website : 'https://' + r.website} target="_blank" rel="noreferrer" style={{ color: T.fg1 }}>{r.website}</a>
      : <span style={{ color: T.fg3 }}>—</span>;

    return (
      <Page>
        <PageHead eyebrow="Client intake" title="Discoveries"
          action={<button type="button" style={S.btnLime} onClick={() => setShowNew(true)}>+ New</button>}/>

        <div style={{ ...S.card, overflow: 'hidden' }}>
          {rows === null ? (
            <div style={{ padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>Loading…</div>
          ) : rows.length === 0 ? (
            <div style={{ padding: '56px 24px', textAlign: 'center' }}>
              <div style={{ fontFamily: T.hero, fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', color: T.fg1, marginBottom: 8 }}>No discoveries yet.</div>
              <div style={{ fontFamily: T.sans, fontSize: 14, color: T.fg2, marginBottom: 18 }}>Start the first one — the full technical questionnaire lands in the next phase.</div>
              <button type="button" style={S.btnLime} onClick={() => setShowNew(true)}>+ New discovery</button>
            </div>
          ) : isMobile ? (
            <div>
              {rows.map((r) => (
                <div key={r.id} style={{ padding: '16px 16px 14px', borderBottom: `1px solid ${T.line}` }}>
                  <div style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 15, color: T.fg1 }}>{r.company}</div>
                  {r.client ? <div style={{ fontFamily: T.sans, fontSize: 13.5, color: T.fg2, marginTop: 3 }}>{r.client}</div> : null}
                  <div style={{ fontFamily: T.sans, fontSize: 13, marginTop: 3 }}>{webLink(r)}</div>
                  {r.address ? <div style={{ fontFamily: T.sans, fontSize: 12.5, color: T.fg3, marginTop: 3 }}>{r.address}</div> : null}
                  <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fg3, marginTop: 9 }}>
                    {fmtWhen(r.createdAt)} · {(r.createdBy || '').split('@')[0]}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  <th style={S.th}>Company</th><th style={S.th}>Client</th><th style={S.th}>Website</th>
                  <th style={S.th}>Address</th><th style={S.th}>Created</th><th style={S.th}>By</th>
                </tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td style={{ ...S.td, fontWeight: 700 }}>{r.company}</td>
                      <td style={S.td}>{r.client || <span style={{ color: T.fg3 }}>—</span>}</td>
                      <td style={S.td}>{webLink(r)}</td>
                      <td style={S.td}>{r.address || <span style={{ color: T.fg3 }}>—</span>}</td>
                      <td style={{ ...S.td, fontFamily: T.mono, fontSize: 12 }}>{fmtWhen(r.createdAt)}</td>
                      <td style={{ ...S.td, fontFamily: T.mono, fontSize: 12, color: T.fg3 }}>{(r.createdBy || '').split('@')[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {error && <div style={{ marginTop: 12, color: '#B3261E', fontFamily: T.sans, fontSize: 13 }}>{error}</div>}

        {showNew && <NewDiscoveryModal onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); load(); }}/>}
      </Page>
    );
  }

  function NewDiscoveryModal({ onClose, onSaved }) {
    const [company, setCompany] = useState('');
    const [client, setClient]   = useState('');
    const [address, setAddress] = useState('');
    const [website, setWebsite] = useState('');
    const [busy, setBusy]       = useState(false);
    const [error, setError]     = useState('');

    const save = async (e) => {
      e.preventDefault();
      if (!company.trim()) { setError('Company is required'); return; }
      setBusy(true); setError('');
      try {
        await api('/api/admin/discoveries', {
          method: 'POST',
          body: JSON.stringify({ company: company.trim(), client: client.trim(), address: address.trim(), website: website.trim() }),
        });
        onSaved();
      } catch (err) { setError(err.message); setBusy(false); }
    };

    return (
      <Modal title="New discovery" sub="Company basics · technical questions come next phase" onClose={onClose}>
        <form onSubmit={save} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Company" value={company} onChange={setCompany} placeholder="Acme Industrial Co." autoFocus/>
          <Field label="Client" value={client} onChange={setClient} placeholder="Jane Doe, Head of Ecommerce"/>
          <Field label="Address" value={address} onChange={setAddress} placeholder="100 Main St, Chicago, IL"/>
          <Field label="Website" value={website} onChange={setWebsite} placeholder="acme.com"/>
          {error && <div style={{ color: '#B3261E', fontFamily: T.sans, fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" style={S.btnGhost} onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" style={{ ...S.btnLime, opacity: busy ? 0.7 : 1 }} disabled={busy}>{busy ? 'Saving…' : 'Save discovery'}</button>
          </div>
        </form>
      </Modal>
    );
  }

  // ── Blueprints ───────────────────────────────────────────────────────
  const BP_PAGE_SIZE = 10;

  // Newest first. Drafts carry a real createdAt; the fixed live-blueprint
  // registry doesn't (they predate that field), so anything with a real
  // timestamp sorts above them, and the legacy live entries fall back to
  // `num` (assigned in creation order) descending.
  function sortBlueprintsNewestFirst(list) {
    return [...list].sort((a, b) => {
      const ad = a.createdAt ? new Date(a.createdAt).getTime() : null;
      const bd = b.createdAt ? new Date(b.createdAt).getTime() : null;
      if (ad != null && bd != null) return bd - ad;
      if (ad != null) return -1;
      if (bd != null) return 1;
      return (parseInt(b.num, 10) || 0) - (parseInt(a.num, 10) || 0);
    });
  }

  function Blueprints() {
    const isMobile = useIsMobile();
    const [rows, setRows] = useState(null);
    const [showNew, setShowNew] = useState(() => new URLSearchParams(window.location.search).get('new') === '1');
    const [activityBp, setActivityBp] = useState(null); // {id, name}
    const [editExpiryBp, setEditExpiryBp] = useState(null);
    const [printFor, setPrintFor] = useState(null);     // id of row with open print menu
    const [copied, setCopied] = useState('');
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);

    const load = useCallback(async () => {
      try { setRows(sortBlueprintsNewestFirst((await api('/api/admin/blueprints')).blueprints)); }
      catch (err) { setError(err.message); setRows([]); }
    }, []);
    useEffect(() => { load(); }, [load]);

    useEffect(() => { setPage(1); }, [search, statusFilter]);

    useEffect(() => {
      if (!printFor) return;
      const close = () => setPrintFor(null);
      setTimeout(() => document.addEventListener('click', close), 0);
      return () => document.removeEventListener('click', close);
    }, [printFor]);

    const shareUrl = (bp) => `${window.location.origin}/${bp.dir}/`;
    const copyShare = async (bp) => {
      try { await navigator.clipboard.writeText(shareUrl(bp)); }
      catch (_) { window.prompt('Copy the client link:', shareUrl(bp)); }
      setCopied(bp.id);
      setTimeout(() => setCopied(''), 1600);
    };

    const toggleDisabled = async (bp) => {
      if (!bp.disabled && !window.confirm(`Disable "${bp.name}"?\n\nClients will no longer be able to open or sign in to this blueprint. The team keeps access, and you can re-enable it any time.`)) return;
      try {
        await api('/api/admin/blueprint-meta', {
          method: 'POST',
          body: JSON.stringify({ blueprintId: bp.id, disabled: !bp.disabled }),
        });
        load();
      } catch (err) { setError(err.message); }
    };

    const statusChip = (bp) => {
      if (bp.disabled) return (
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: T.black, color: '#fff', border: `1px solid ${T.black}` }}>Disabled</span>
      );
      if (bp.kind === 'draft') return (
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#FFF6E0', color: '#6A4E00', border: '1px solid #E8C36A' }}>Draft</span>
      );
      if (bp.signature) return (
        <span>
          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#DFFCE6', color: '#064E2E', border: '1px solid #9BDDB0' }}>Signed</span>
          <span style={{ display: 'inline-block', marginLeft: 8, fontFamily: T.mono, fontSize: 10.5, color: T.fg3 }}>
            {bp.signature.name || bp.signature.email}{bp.signature.signedAt ? ' · ' + fmtWhen(bp.signature.signedAt).slice(0, 10) : ''}
          </span>
        </span>
      );
      if (bp.expired) return (
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#FDE8E8', color: '#8A1C1C', border: '1px solid #F0A9A9' }}>Expired</span>
      );
      return (
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#EEF0FE', color: '#3A44C4', border: '1px solid #C3C9F5' }}>Open</span>
      );
    };

    // Same precedence as statusChip, as a plain value for filtering.
    const rowStatus = (bp) => {
      if (bp.disabled) return 'disabled';
      if (bp.kind === 'draft') return 'draft';
      if (bp.signature) return 'signed';
      if (bp.expired) return 'expired';
      return 'open';
    };

    const filteredRows = useMemo(() => {
      if (!rows) return null;
      const q = search.trim().toLowerCase();
      return rows.filter((bp) => {
        if (statusFilter !== 'all' && rowStatus(bp) !== statusFilter) return false;
        if (q && !(bp.name || '').toLowerCase().includes(q)) return false;
        return true;
      });
    }, [rows, search, statusFilter]);

    const totalPages = filteredRows ? Math.max(1, Math.ceil(filteredRows.length / BP_PAGE_SIZE)) : 1;
    const pageSafe = Math.min(page, totalPages);
    const pageRows = filteredRows ? filteredRows.slice((pageSafe - 1) * BP_PAGE_SIZE, pageSafe * BP_PAGE_SIZE) : null;

    // Expiration date + inline edit button, shared by table and cards.
    const expiresCell = (bp) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontFamily: T.mono, fontSize: 12, color: bp.expired ? '#B3261E' : (bp.expiresAt ? T.fg1 : T.fg3) }}>
          {bp.expiresAt || '—'}
        </span>
        <button type="button" aria-label="Edit expiration" title="Edit expiration"
          onClick={() => setEditExpiryBp(bp)}
          style={{ background: 'transparent', border: `1px solid ${T.line}`, borderRadius: 999, width: 24, height: 24, cursor: 'pointer', fontSize: 11, lineHeight: 1, color: T.fg3, flexShrink: 0 }}>✎</button>
      </span>
    );

    // One actions row, shared by the desktop table and the mobile cards.
    const rowActions = (bp) => (
      <span style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
        <a href={'/' + bp.dir + '/'} target="_blank" rel="noreferrer" style={{ ...S.btnGhost, textDecoration: 'none' }}>Preview</a>
        <button type="button" style={S.btnGhost} onClick={() => copyShare(bp)}>{copied === bp.id ? 'Copied ✓' : 'Share'}</button>
        <button type="button" style={S.btnGhost} onClick={() => setActivityBp(bp)}>Activity</button>
        <button type="button" onClick={() => toggleDisabled(bp)}
          style={{ ...S.btnGhost, color: bp.disabled ? '#064E2E' : '#B3261E', borderColor: bp.disabled ? '#9BDDB0' : '#F0A9A9' }}>
          {bp.disabled ? 'Enable' : 'Disable'}
        </button>
        <span style={{ position: 'relative' }}>
          <button type="button" style={S.btnGhost} onClick={(e) => { e.stopPropagation(); setPrintFor(printFor === bp.id ? null : bp.id); }}>Print ▾</button>
          {printFor === bp.id && (
            <span style={{
              position: 'absolute', top: 'calc(100% + 6px)', zIndex: 20, minWidth: 250,
              ...(isMobile ? { left: 0 } : { right: 0 }),
              background: T.black, borderRadius: 10, padding: 6,
              display: 'flex', flexDirection: 'column', gap: 2,
              boxShadow: '0 18px 40px -18px rgba(0,0,0,0.7)', textAlign: 'left',
            }}>
              {[['delivery', 'For Delivery Team', 'Whole document · no terms · no nav'],
                ['shopify', 'For Shopify Partner Program', 'Key sections + Master Services Agreement'],
                ['client', 'For the Client', 'Whole document + terms + signature audit trail']].map(([mode, l, sub]) => (
                <button key={mode} type="button"
                  onClick={() => { setPrintFor(null); window.open('/' + bp.dir + '/?bpPrint=' + mode, '_blank'); }}
                  style={{ background: 'transparent', border: 'none', color: '#fff', textAlign: 'left', padding: '9px 11px', borderRadius: 6, cursor: 'pointer', fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {l}
                  <span style={{ fontSize: 9, letterSpacing: '0.02em', textTransform: 'none', opacity: 0.6, fontWeight: 500 }}>{sub}</span>
                </button>
              ))}
            </span>
          )}
        </span>
      </span>
    );

    return (
      <Page>
        <PageHead title="Blueprints"
          action={<button type="button" style={S.btnLime} onClick={() => setShowNew(true)}>+ New blueprint</button>}/>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            style={{ ...S.input, width: 'auto', flex: '1 1 240px', maxWidth: 320, padding: '9px 12px', fontSize: 14 }}/>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            style={{ ...S.input, width: 'auto', flex: '0 0 auto', padding: '9px 12px', fontSize: 14, cursor: 'pointer' }}>
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="signed">Signed</option>
            <option value="draft">Draft</option>
            <option value="expired">Expired</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        <div style={{ ...S.card, overflow: 'visible' }}>
          {rows === null ? (
            <div style={{ padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>Loading…</div>
          ) : filteredRows.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>
              {rows.length === 0 ? 'No blueprints yet.' : 'No blueprints match your search or filter.'}
            </div>
          ) : isMobile ? (
            <div>
              {pageRows.map((bp) => (
                <div key={bp.id} style={{ padding: '16px 16px 15px', borderBottom: `1px solid ${T.line}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                    <div style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 15, color: T.fg1 }}>{bp.name}</div>
                    <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fg3, flexShrink: 0 }}>{bp.num || 'draft'}</span>
                  </div>
                  <div style={{ marginTop: 7 }}>{statusChip(bp)}</div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={S.eyebrow}>Expires</span>{expiresCell(bp)}
                  </div>
                  {bp.kind === 'live' ? (
                    <div style={{ marginTop: 11 }}>{rowActions(bp)}</div>
                  ) : (
                    <div style={{ marginTop: 8, fontFamily: T.mono, fontSize: 10.5, color: T.fg3 }}>
                      {bp.website ? bp.website + ' · ' : ''}Generation · phase 2
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  <th style={S.th}>#</th><th style={S.th}>Blueprint</th><th style={S.th}>Status</th><th style={S.th}>Expires</th><th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
                </tr></thead>
                <tbody>
                  {pageRows.map((bp) => (
                    <tr key={bp.id}>
                      <td style={{ ...S.td, fontFamily: T.mono, fontSize: 12, color: T.fg3, whiteSpace: 'nowrap' }}>{bp.num || '—'}</td>
                      <td style={S.td}>
                        <div style={{ fontWeight: 700 }}>{bp.name}</div>
                        <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fg3, marginTop: 3 }}>
                          {bp.kind === 'live' ? '/' + bp.dir + '/' : (bp.website || 'template generation pending')}
                        </div>
                      </td>
                      <td style={S.td}>{statusChip(bp)}</td>
                      <td style={{ ...S.td, whiteSpace: 'nowrap' }}>{expiresCell(bp)}</td>
                      <td style={{ ...S.td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {bp.kind === 'live'
                          ? rowActions(bp)
                          : <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fg3 }}>Generation · phase 2</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredRows && filteredRows.length > BP_PAGE_SIZE && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '16px 0 4px' }}>
            <button type="button" style={{ ...S.btnGhost, opacity: pageSafe <= 1 ? 0.5 : 1 }} disabled={pageSafe <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}>← Prev</button>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.fg3 }}>Page {pageSafe} of {totalPages}</span>
            <button type="button" style={{ ...S.btnGhost, opacity: pageSafe >= totalPages ? 0.5 : 1 }} disabled={pageSafe >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next →</button>
          </div>
        )}
        {error && <div style={{ marginTop: 12, color: '#B3261E', fontFamily: T.sans, fontSize: 13 }}>{error}</div>}

        {activityBp && <ActivityModal bp={activityBp} onClose={() => setActivityBp(null)}/>}
        {editExpiryBp && <ExpiryModal bp={editExpiryBp} onClose={() => setEditExpiryBp(null)} onSaved={() => { setEditExpiryBp(null); load(); }}/>}
        {showNew && <NewBlueprintModal onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); load(); }}/>}
      </Page>
    );
  }

  function ExpiryModal({ bp, onClose, onSaved }) {
    const [date, setDate] = useState(bp.expiresAt || '');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const save = async (clear) => {
      setBusy(true); setError('');
      try {
        await api('/api/admin/blueprint-meta', {
          method: 'POST',
          body: JSON.stringify({ blueprintId: bp.id, expiresAt: clear ? '' : date }),
        });
        onSaved();
      } catch (err) { setError(err.message); setBusy(false); }
    };

    return (
      <Modal title={'Expiration · ' + bp.name} sub="Valid through the selected day" onClose={onClose}>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Expiration date" type="date" value={date} onChange={setDate} autoFocus/>
          {error && <div style={{ color: '#B3261E', fontFamily: T.sans, fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap', paddingTop: 4 }}>
            {bp.expiresAt ? (
              <button type="button" style={{ ...S.btnGhost, marginRight: 'auto', color: '#B3261E', borderColor: '#F0A9A9' }} onClick={() => save(true)} disabled={busy}>Remove expiration</button>
            ) : null}
            <button type="button" style={S.btnGhost} onClick={onClose} disabled={busy}>Cancel</button>
            <button type="button" style={{ ...S.btnLime, opacity: busy || !date ? 0.7 : 1 }} onClick={() => save(false)} disabled={busy || !date}>{busy ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </Modal>
    );
  }

  function ActivityModal({ bp, onClose }) {
    const isMobile = useIsMobile();
    const [events, setEvents] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => {
      let dead = false;
      api('/api/admin/access-log?bp=' + encodeURIComponent(bp.id))
        .then((d) => { if (!dead) setEvents(d.events || []); })
        .catch((err) => { if (!dead) { setError(err.message); setEvents([]); } });
      return () => { dead = true; };
    }, [bp.id]);

    const fmtLocation = (ev) => [ev.city, ev.region, ev.country].filter(Boolean).join(', ');
    const shortUA = (ua) => {
      if (!ua) return '';
      const m = ua.match(/\(([^)]+)\)/);
      const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera|Mobile)\/[\d.]+/);
      return [(m && m[1]) || '', browser ? browser[0] : ''].filter(Boolean).join(' · ').slice(0, 120);
    };

    const typeTag = (ev) => (
      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 999, fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: ev.type === 'sign' ? '#DFFCE6' : '#EEF0FE', color: ev.type === 'sign' ? '#064E2E' : '#3A44C4' }}>
        {ev.type === 'sign' ? 'Signed' : 'Viewed'}
      </span>
    );

    return (
      <Modal title={'Activity · ' + bp.name} sub={events ? `${events.length} event${events.length === 1 ? '' : 's'} · newest first · last 365 days` : 'Loading…'} onClose={onClose} width={940}>
        <div style={{ maxHeight: '68vh', overflowY: 'auto' }}>
          {events === null ? (
            <div style={{ padding: 32, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>Loading…</div>
          ) : events.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>{error || 'No activity recorded yet.'}</div>
          ) : isMobile ? (
            <div>
              {events.map((ev, i) => (
                <div key={i} style={{ padding: '14px 16px 12px', borderBottom: `1px solid ${T.line}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {typeTag(ev)}
                    <span style={{ fontFamily: T.sans, fontSize: 13.5, fontWeight: 600, color: T.fg1, wordBreak: 'break-all' }}>{ev.email || ''}</span>
                  </div>
                  {ev.type === 'sign' && (ev.name || ev.title) && (
                    <div style={{ fontFamily: T.sans, fontSize: 12.5, color: T.fg2, marginTop: 4 }}>{ev.name || ''}{ev.title ? ' · ' + ev.title : ''}</div>
                  )}
                  <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fg3, marginTop: 6 }}>
                    {fmtWhen(ev.verifiedAt || ev.signedAt)}{ev.ip ? ' · ' + ev.ip : ''}{fmtLocation(ev) ? ' · ' + fmtLocation(ev) : ''}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse' }}>
                <thead><tr>
                  <th style={S.th}>Type</th><th style={S.th}>Email</th><th style={S.th}>Time</th>
                  <th style={S.th}>IP</th><th style={S.th}>Location</th><th style={S.th}>Agent</th>
                </tr></thead>
                <tbody>
                  {events.map((ev, i) => (
                    <tr key={i}>
                      <td style={S.td}>{typeTag(ev)}</td>
                      <td style={S.td}>
                        <div>{ev.email || ''}</div>
                        {ev.type === 'sign' && (ev.name || ev.title) && (
                          <div style={{ color: T.fg3, marginTop: 3, fontSize: 11.5 }}>{ev.name || ''}{ev.title ? ' · ' + ev.title : ''}</div>
                        )}
                      </td>
                      <td style={{ ...S.td, fontFamily: T.mono, fontSize: 11.5 }}>{fmtWhen(ev.verifiedAt || ev.signedAt)}</td>
                      <td style={{ ...S.td, fontFamily: T.mono, fontSize: 11.5 }}>{ev.ip || ''}</td>
                      <td style={{ ...S.td, fontFamily: T.mono, fontSize: 11.5 }}>{fmtLocation(ev)}</td>
                      <td style={{ ...S.td, fontSize: 11, color: T.fg3, maxWidth: 300, wordBreak: 'break-word' }}>{shortUA(ev.userAgent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    );
  }

  function NewBlueprintModal({ onClose, onSaved }) {
    const [companyName, setCompanyName] = useState('');
    const [website, setWebsite]         = useState('');
    const [leadClient, setLeadClient]   = useState('');
    const [address, setAddress]         = useState('');
    const [expiresAt, setExpiresAt]     = useState('');
    const [busy, setBusy]               = useState(false);
    const [error, setError]             = useState('');

    const save = async (e) => {
      e.preventDefault();
      if (!companyName.trim() || !website.trim()) { setError('Company name and website are required'); return; }
      setBusy(true); setError('');
      try {
        await api('/api/admin/blueprints', {
          method: 'POST',
          body: JSON.stringify({
            companyName: companyName.trim(), website: website.trim(),
            leadClient: leadClient.trim(), address: address.trim(),
            expiresAt,
          }),
        });
        onSaved();
      } catch (err) { setError(err.message); setBusy(false); }
    };

    return (
      <Modal title="New blueprint" sub="Saved as a draft · template generation is the next phase" onClose={onClose}>
        <form onSubmit={save} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Company name" value={companyName} onChange={setCompanyName} placeholder="Acme Industrial Co." autoFocus/>
          <Field label="Client website" value={website} onChange={setWebsite} placeholder="acme.com"/>
          <Field label="Lead client" value={leadClient} onChange={setLeadClient} placeholder="Jane Doe, Head of Ecommerce"/>
          <Field label="Company address" value={address} onChange={setAddress} placeholder="100 Main St, Chicago, IL"/>
          <Field label="Expiration date (valid through)" type="date" value={expiresAt} onChange={setExpiresAt}/>
          {error && <div style={{ color: '#B3261E', fontFamily: T.sans, fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" style={S.btnGhost} onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" style={{ ...S.btnLime, opacity: busy ? 0.7 : 1 }} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    );
  }

  // ── root ─────────────────────────────────────────────────────────────
  function AdminApp() {
    const [me, setMe] = useState(undefined); // undefined = checking, null = signed out
    const route = useRoute();

    const check = useCallback(async () => {
      try { setMe(await api('/api/admin/me')); }
      catch (_) { setMe(null); }
    }, []);
    useEffect(() => { check(); }, [check]);

    const logout = async () => {
      try { await api('/api/admin/logout', { method: 'POST' }); } catch (_) {}
      setMe(null);
    };

    if (me === undefined) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.cream }}>
          <img src="/assets/uncap-logo-black.svg" alt="Uncap" style={{ height: 26, opacity: 0.5 }}/>
        </div>
      );
    }
    if (me === null) return <Login onAuthed={check}/>;

    return (
      <div style={{ minHeight: '100vh', background: T.cream }}>
        <TopBar me={me} route={route} onLogout={logout}/>
        {route === 'discoveries' ? <Discoveries/> : <Blueprints/>}
      </div>
    );
  }

  window.AdminApp = AdminApp;
})();
