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
    card: { background: T.paper, border: `1px solid ${T.line}`, borderRadius: 8, boxShadow: 'none' },
    btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px', fontFamily: T.sans, fontSize: 14, fontWeight: 650, lineHeight: 1, background: T.black, color: '#fff', border: '1px solid ' + T.black, borderRadius: 6, cursor: 'pointer' },
    btnLime: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px', fontFamily: T.sans, fontSize: 14, fontWeight: 650, lineHeight: 1, background: T.black, color: '#fff', border: '1px solid ' + T.black, borderRadius: 6, cursor: 'pointer' },
    btnGhost: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 14px', fontFamily: T.sans, fontSize: 13, fontWeight: 600, lineHeight: 1, background: 'transparent', color: T.fg2, border: `1px solid ${T.line}`, borderRadius: 6, cursor: 'pointer' },
    // 16px keeps iOS Safari from auto-zooming the page when an input is focused.
    input: { width: '100%', boxSizing: 'border-box', padding: '12px 14px', fontFamily: T.sans, fontSize: 16, color: T.fg1, background: T.cream, border: `1px solid ${T.line}`, borderRadius: 6, outline: 'none' },
    label: { fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.fg3, display: 'block', marginBottom: 6 },
    th: { textAlign: 'left', padding: '10px 14px', borderBottom: `1px solid ${T.line}`, fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.fg3, background: '#FAFAF7', whiteSpace: 'nowrap' },
    td: { textAlign: 'left', padding: '12px 14px', borderBottom: `1px solid ${T.line}`, fontFamily: T.sans, fontSize: 13.5, color: T.fg1, verticalAlign: 'top' },
    // Square icon-only variant of btnGhost — Preview/Share/Activity don't
    // need a text label, just a tooltip (title attr) for a11y/clarity.
    btnIcon: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, padding: 0, flexShrink: 0, background: T.paper, color: T.fg1, border: `1px solid ${T.line}`, borderRadius: 6, cursor: 'pointer' },
  };

  const iconProps = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const IconEye = () => (
    <svg {...iconProps}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>
  );
  const IconShare = () => (
    <svg {...iconProps}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
  );
  const IconActivity = () => (
    <svg {...iconProps}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  );
  const IconCheck = () => (
    <svg {...iconProps} strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>
  );
  const IconTrash = () => (
    <svg {...iconProps}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
  );

  // ── path router ───────────────────────────────────────────────────────
  // Real paths (/blueprints, /discoveries) instead of #/ hash routes, so
  // the URL is bookmarkable and shareable. Workers Static Assets is
  // configured with not_found_handling = single-page-application, so any
  // path that isn't a real static asset (including these) falls back to
  // this same index.html, which re-mounts AdminApp and this parses the
  // pathname straight back to the right route.
  function parseRoute() {
    const segs = window.location.pathname.split('/').filter(Boolean);
    const base = segs[0] === 'admin' ? segs.slice(1) : segs;
    if (base[0] === 'company' && base[1]) return 'company-profile';
    if (base[0] === 'blueprint' && base[1]) return 'blueprint-editor';
    if (base[0] === 'discoveries') return 'discoveries';
    if (base[0] === 'blueprints') return 'blueprints';
    if (base[0] === 'companies') return 'companies';
    if (base[0] === 'projects') return 'projects';
    if (base[0] === 'retainers') return 'retainers';
    if (base[0] === 'revenues' && base[1] === 'fixed') return 'rev-fixed';
    if (base[0] === 'revenues' && base[1] === 'recurring') return 'rev-recurring';
    if (base[0] === 'revenues' && base[1] === 'apps') return 'rev-apps';
    if (base[0] === 'revenues' && base[1] === 'referrals') return 'rev-referrals';
    if (base[0] === 'revenues') return 'revenues';
    if (base[0] === 'dashboard') return 'dashboard';
    if (base[0] === 'users') return 'users';
    return 'home';
  }
  function routeCompanyId() {
    const segs = window.location.pathname.split('/').filter(Boolean);
    const base = segs[0] === 'admin' ? segs.slice(1) : segs;
    return base[0] === 'company' ? (base[1] || '') : '';
  }
  function routeBlueprintId() {
    const segs = window.location.pathname.split('/').filter(Boolean);
    const base = segs[0] === 'admin' ? segs.slice(1) : segs;
    return base[0] === 'blueprint' ? (base[1] || '') : '';
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
  // Open a blueprint/discovery framed inside the admin shell (toolbar stays
  // on top). Modified clicks fall through to the real href / new tab.
  function previewClick(url, title) {
    return (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('bp:preview', { detail: { url, title } }));
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
  // Pill styling shared by plain nav links and dropdown triggers.
  function navPillStyle(on) {
    return {
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 11px', borderRadius: 4, border: 'none', cursor: 'pointer',
      textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
      fontFamily: T.sans, fontSize: 12, fontWeight: on ? 700 : 500, lineHeight: 1,
      color: on ? '#0A0A0A' : '#D4D2CC',
      background: on ? '#FFFFFF' : 'transparent',
      transition: 'background 180ms, color 180ms',
    };
  }

  // A top-nav dropdown: a trigger pill that opens a dark panel of sub-links.
  function NavMenu({ label, items, active }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const on = items.some((it) => it.id === active);
    useEffect(() => {
      if (!open) return;
      const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      document.addEventListener('mousedown', onDoc);
      return () => document.removeEventListener('mousedown', onDoc);
    }, [open]);
    // Close whenever the route changes (a sub-link was chosen).
    useEffect(() => { setOpen(false); }, [active]);
    return (
      <span ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
        <button type="button" onClick={() => setOpen((o) => !o)} style={navPillStyle(on)}>
          {label} <span style={{ opacity: 0.55, fontSize: 9 }}>▾</span>
        </button>
        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 60,
            background: '#141414', border: '1px solid #2A2A2A', borderRadius: 8, padding: 5,
            minWidth: 176, display: 'flex', flexDirection: 'column', gap: 1,
            boxShadow: '0 16px 40px -18px rgba(0,0,0,0.85)',
          }}>
            {items.map((it) => {
              const sel = it.id === active;
              return (
                <a key={it.id} href={it.path} onClick={(e) => { setOpen(false); navClick(it.path)(e); }} style={{
                  padding: '8px 11px', borderRadius: 5, textDecoration: 'none', whiteSpace: 'nowrap',
                  fontFamily: T.sans, fontSize: 12.5, fontWeight: sel ? 700 : 500, lineHeight: 1,
                  color: sel ? '#0A0A0A' : '#E6E4DE', background: sel ? T.signal : 'transparent',
                }}>{it.l}</a>
              );
            })}
          </div>
        )}
      </span>
    );
  }

  function TopBar({ me, route, onLogout }) {
    const MONO = 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)';
    const isMobile = useIsMobile();

    // Sub-navs per section (the second row). Sales/Services land on their first
    // sub-page; Revenues lands on its Overview page.
    const SUB = {
      sales: [
        { id: 'companies',   l: 'Companies',   path: '/admin/companies' },
        { id: 'discoveries', l: 'Discoveries', path: '/admin/discoveries' },
        { id: 'blueprints',  l: 'Blueprints',  path: '/admin/blueprints' },
      ],
      services: [
        { id: 'projects',  l: 'Projects',  path: '/admin/projects' },
        { id: 'retainers', l: 'Retainers', path: '/admin/retainers' },
      ],
      revenues: [
        { id: 'revenues',      l: 'Overview',   path: '/admin/revenues' },
        { id: 'rev-fixed',     l: 'Projects',   path: '/admin/revenues/fixed' },
        { id: 'rev-recurring', l: 'Recurring',  path: '/admin/revenues/recurring' },
        { id: 'rev-apps',      l: 'Apps',        path: '/admin/revenues/apps' },
        { id: 'rev-referrals', l: 'Referrals',  path: '/admin/revenues/referrals' },
      ],
    };
    // First row. Clicking a section lands on its main page; its match[] maps
    // routes back to the owning section.
    const SECTIONS = [
      { id: 'activities', l: 'Activities', path: '/admin', match: ['home'] },
      { id: 'sales', l: 'Sales', path: '/admin/companies', match: ['companies', 'discoveries', 'blueprints', 'company-profile', 'blueprint-editor'] },
      { id: 'services', l: 'Services', path: '/admin/projects', match: ['projects', 'retainers'] },
      ...(me.isSuper ? [{ id: 'revenues', l: 'Revenues', path: '/admin/revenues', match: ['revenues', 'rev-fixed', 'rev-recurring', 'rev-apps', 'rev-referrals'] }] : []),
      { id: 'dashboard', l: 'Dashboard', path: '/admin/dashboard', match: ['dashboard'] },
      ...(me.isSuper ? [{ id: 'users', l: 'Users', path: '/admin/users', match: ['users'] }] : []),
    ];
    const activeSection = SECTIONS.find((s) => s.match.includes(route)) || SECTIONS[0];
    const subs = SUB[activeSection.id] || [];

    const sectionPill = (s) => (
      <a key={s.id} href={s.path} onClick={navClick(s.path)} style={navPillStyle(activeSection.id === s.id)}>{s.l}</a>
    );
    const subPill = (it) => (
      <a key={it.id} href={it.path} onClick={navClick(it.path)} style={{
        padding: '4px 11px', borderRadius: 4, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
        fontFamily: T.sans, fontSize: 12, fontWeight: route === it.id ? 700 : 500, lineHeight: 1,
        color: route === it.id ? '#0A0A0A' : '#C9C7C1', background: route === it.id ? T.signal : 'transparent',
      }}>{it.l}</a>
    );

    const brand = (
      <a href="/admin" onClick={navClick('/admin')} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flex: '0 0 auto' }}>
        <img src="/assets/uncap-logo-white.svg" alt="Uncap" style={{ height: 14, width: 'auto', display: 'block' }}/>
        <span style={{ width: 1, height: 14, background: '#4D4D4D' }}></span>
        <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.12em', color: '#9A9A9A' }}>OS</span>
      </a>
    );
    const account = (
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        {me.picture
          ? <img src={me.picture} alt="" referrerPolicy="no-referrer" style={{ width: 22, height: 22, borderRadius: 999, border: '1px solid #4D4D4D' }}/>
          : <span style={{ width: 22, height: 22, borderRadius: 999, background: T.signal, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 10, fontWeight: 700, color: '#0A0A0A' }}>{(me.email || '?')[0].toUpperCase()}</span>}
        {!isMobile && <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.04em', color: '#9A9A9A', whiteSpace: 'nowrap' }}>{me.email}</span>}
        <button type="button" onClick={onLogout} style={{ border: '1px solid #4D4D4D', background: 'transparent', color: '#FFFFFF', borderRadius: 4, padding: '3px 9px', fontSize: 10.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Sign out</button>
      </div>
    );
    const scroll = { overflowX: 'auto', WebkitOverflowScrolling: 'touch' };

    return (
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#0A0A0A' }}>
        {/* Row 1 — sections */}
        <div style={{ boxSizing: 'border-box', minHeight: isMobile ? 46 : 40, display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 16, padding: isMobile ? '0 14px' : '0 16px' }}>
          {brand}
          {!isMobile && (
            <nav style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', gap: 4, overflow: 'visible' }}>
              {SECTIONS.map(sectionPill)}
            </nav>
          )}
          {account}
        </div>
        {isMobile && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 10px 6px', ...scroll }}>
            {SECTIONS.map(sectionPill)}
          </nav>
        )}
        {/* Row 2 — sub-navs of the active section */}
        {subs.length > 0 && (
          <div style={{ background: '#161616', borderTop: '1px solid #242424' }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4, padding: isMobile ? '7px 10px' : '7px 16px', ...scroll }}>
              {subs.map(subPill)}
            </nav>
          </div>
        )}
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

  // Placeholder for sections that are navigable but not yet designed
  // (Services, Revenues, Dashboard). Keeps the nav functional end to end.
  function SectionStub({ eyebrow, title, note }) {
    return (
      <Page>
        <PageHead eyebrow={eyebrow} title={title}/>
        <div style={{ ...S.card, padding: 40, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...S.eyebrow, marginBottom: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: T.signal }}/>Coming soon
          </div>
          <div style={{ fontFamily: T.sans, fontSize: 14.5, lineHeight: 1.6, color: T.fg2, maxWidth: 520, margin: '0 auto' }}>{note}</div>
        </div>
      </Page>
    );
  }

  // ── Revenues > Recurring (Shopify paid orders) ───────────────────────
  function RecurringRevenue() {
    const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const presetRange = (p) => {
      const now = new Date(), y = now.getFullYear(), m = now.getMonth();
      let from, to = now;
      if (p === 'day') { from = new Date(y, m, now.getDate()); to = new Date(y, m, now.getDate()); }
      else if (p === 'quarter') { from = new Date(y, Math.floor(m / 3) * 3, 1); }
      else if (p === 'year') { from = new Date(y, 0, 1); to = new Date(y, 11, 31); }
      else if (p === 'ytd') { from = new Date(y, 0, 1); }
      else { from = new Date(y, m, 1); } // month (default)
      return { from: ymd(from), to: ymd(to) };
    };
    const PRESETS = [['day', 'Day'], ['month', 'Month'], ['quarter', 'Quarter'], ['year', 'Year'], ['ytd', 'YTD'], ['custom', 'Custom']];

    const [preset, setPreset] = useState('month');
    const [range, setRange] = useState(() => presetRange('month'));
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    const pickPreset = (p) => { setPreset(p); if (p !== 'custom') setRange(presetRange(p)); };
    const setCustom = (k, v) => { if (v) setRange((r) => ({ ...r, [k]: v })); };

    useEffect(() => {
      let dead = false; setData(null); setError('');
      api(`/api/admin/revenue/recurring?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`)
        .then((d) => { if (!dead) setData(d); })
        .catch((e) => { if (!dead) { setError(e.message); setData({}); } });
      return () => { dead = true; };
    }, [range.from, range.to]);

    const money = (n, cur) => { try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur || 'USD' }).format(n || 0); } catch (_) { return '$' + (n || 0).toFixed(2); } };
    const fmtDate = (s) => { if (!s) return ''; const d = new Date(s); return isNaN(d.getTime()) ? s.slice(0, 10) : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); };
    const statChip = (label, value) => (
      <div style={{ ...S.card, padding: '16px 20px', minWidth: 150 }}>
        <div style={S.eyebrow}>{label}</div>
        <div style={{ fontFamily: T.hero, fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', color: T.fg1, marginTop: 6 }}>{value}</div>
      </div>
    );

    return (
      <Page>
        <PageHead eyebrow="Revenues" title="Recurring"/>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
          {PRESETS.map(([id, l]) => (
            <button key={id} type="button" onClick={() => pickPreset(id)}
              style={{ ...(preset === id ? S.btn : S.btnGhost), padding: '7px 13px', fontSize: 12.5 }}>{l}</button>
          ))}
          {preset === 'custom' && (
            <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <input type="date" value={range.from} onChange={(e) => setCustom('from', e.target.value)} style={{ ...S.input, width: 'auto', padding: '7px 10px', fontSize: 13 }}/>
              <span style={{ color: T.fg3, fontFamily: T.mono, fontSize: 12 }}>to</span>
              <input type="date" value={range.to} onChange={(e) => setCustom('to', e.target.value)} style={{ ...S.input, width: 'auto', padding: '7px 10px', fontSize: 13 }}/>
            </span>
          )}
        </div>

        {data === null ? (
          <div style={{ ...S.card, padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>Loading…</div>
        ) : data.connected === false ? (
          <div style={{ ...S.card, padding: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...S.eyebrow, marginBottom: 12 }}><span style={{ width: 6, height: 6, borderRadius: 999, background: '#E8C36A' }}/>Shopify not connected</div>
            {data.canConnect ? (
              <>
                <div style={{ fontFamily: T.sans, fontSize: 14.5, lineHeight: 1.6, color: T.fg2, maxWidth: 640, marginBottom: 18 }}>
                  Shopify is configured. Click Connect to authorize read-only access to your orders once, then Recurring revenue lists every paid order with a link to Shopify and totals for the selected range.
                </div>
                <a href="/api/shopify/install" style={{ ...S.btn, textDecoration: 'none', display: 'inline-block' }}>Connect Shopify</a>
              </>
            ) : (
              <>
                <div style={{ fontFamily: T.sans, fontSize: 14.5, lineHeight: 1.6, color: T.fg2, maxWidth: 640 }}>
                  Recurring revenue reads paid orders from Shopify. Add these as Cloudflare vars/secrets, then reload. A <b>Connect Shopify</b> button appears here once the first three are set.
                </div>
                {data.have && (
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[['SHOPIFY_SHOP_DOMAIN', data.have.domain, true], ['SHOPIFY_CLIENT_ID', data.have.clientId, true], ['SHOPIFY_CLIENT_SECRET', data.have.clientSecret, true], ['SHOPIFY_STORE_HANDLE', data.have.handle, false]].map(([k, present, req]) => (
                      <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: T.mono, fontSize: 12.5 }}>
                        <span style={{ width: 16, textAlign: 'center', color: present ? '#0A7A3B' : (req ? '#B3261E' : '#9A8A5A') }}>{present ? '✓' : '✗'}</span>
                        <span style={{ color: present ? T.fg2 : T.fg1, fontWeight: present ? 500 : 700 }}>{k}</span>
                        <span style={{ color: T.fg3, fontSize: 11 }}>{present ? 'detected' : (req ? 'missing (required)' : 'missing (optional, for order links)')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            )}
          </div>
        ) : (error || data.ok === false) ? (
          <div style={{ ...S.card, padding: 28 }}>
            <div style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 15, color: T.fg1, marginBottom: 6 }}>Couldn&rsquo;t reach Shopify</div>
            <div style={{ fontFamily: T.mono, fontSize: 12, color: '#B3261E', wordBreak: 'break-word' }}>{error || data.error}</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
              {statChip('Total collected', money(data.total, data.currency))}
              {statChip('Orders', data.count)}
              <div style={{ ...S.card, padding: '16px 20px', minWidth: 170 }}>
                <div style={S.eyebrow}>Range</div>
                <div style={{ fontFamily: T.mono, fontSize: 13, color: T.fg2, marginTop: 12 }}>{data.from} → {data.to}</div>
              </div>
            </div>
            {data.truncated && (
              <div style={{ marginBottom: 12, fontFamily: T.mono, fontSize: 11.5, color: '#6A4E00', background: '#FDF6E3', border: '1px solid #E8C36A', borderRadius: 6, padding: '8px 12px' }}>
                Showing the first batch of orders for this range; narrow the dates for a complete total.
              </div>
            )}
            {data.orders.length === 0 ? (
              <div style={{ ...S.card, padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>No paid orders in this range.</div>
            ) : (
              <div style={{ ...S.card, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>
                      <th style={S.th}>Date</th><th style={S.th}>Order</th><th style={S.th}>Customer</th><th style={{ ...S.th, textAlign: 'right' }}>Amount</th><th style={S.th}>Status</th><th style={{ ...S.th, textAlign: 'right' }}>Shopify</th>
                    </tr></thead>
                    <tbody>
                      {data.orders.map((o) => (
                        <tr key={o.id}>
                          <td style={{ ...S.td, whiteSpace: 'nowrap', fontFamily: T.mono, fontSize: 12.5 }}>{fmtDate(o.date)}</td>
                          <td style={{ ...S.td, fontWeight: 700 }}>{o.name}</td>
                          <td style={S.td}>{o.customer || '—'}</td>
                          <td style={{ ...S.td, textAlign: 'right', fontFamily: T.mono, whiteSpace: 'nowrap' }}>{money(o.amount, o.currency)}</td>
                          <td style={S.td}><span style={{ fontFamily: T.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', background: '#DFFCE6', color: '#064E2E', borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap' }}>{o.status}</span></td>
                          <td style={{ ...S.td, textAlign: 'right', whiteSpace: 'nowrap' }}><a href={o.adminUrl} target="_blank" rel="noreferrer" style={{ ...S.btnGhost, textDecoration: 'none', padding: '5px 10px', fontSize: 12 }}>Open ↗</a></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </Page>
    );
  }

  // ── Revenues > Fixed (QuickBooks invoices + payments) ────────────────
  function FixedRevenue() {
    const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const presetRange = (p) => {
      const now = new Date(), y = now.getFullYear(), m = now.getMonth();
      let from, to = now;
      if (p === 'day') { from = new Date(y, m, now.getDate()); to = new Date(y, m, now.getDate()); }
      else if (p === 'quarter') { from = new Date(y, Math.floor(m / 3) * 3, 1); }
      else if (p === 'year') { from = new Date(y, 0, 1); to = new Date(y, 11, 31); }
      else if (p === 'ytd') { from = new Date(y, 0, 1); }
      else { from = new Date(y, m, 1); }
      return { from: ymd(from), to: ymd(to) };
    };
    const PRESETS = [['day', 'Day'], ['month', 'Month'], ['quarter', 'Quarter'], ['year', 'Year'], ['ytd', 'YTD'], ['custom', 'Custom']];

    const [preset, setPreset] = useState('month');
    const [range, setRange] = useState(() => presetRange('month'));
    const [kind, setKind] = useState('payments');
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    const pickPreset = (p) => { setPreset(p); if (p !== 'custom') setRange(presetRange(p)); };
    const setCustom = (k, v) => { if (v) setRange((r) => ({ ...r, [k]: v })); };

    useEffect(() => {
      let dead = false; setData(null); setError('');
      api(`/api/admin/revenue/fixed?kind=${kind}&from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`)
        .then((d) => { if (!dead) setData(d); })
        .catch((e) => { if (!dead) { setError(e.message); setData({}); } });
      return () => { dead = true; };
    }, [range.from, range.to, kind]);

    const money = (n, cur) => { try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur || 'USD' }).format(n || 0); } catch (_) { return '$' + (n || 0).toFixed(2); } };
    const fmtDate = (s) => { if (!s) return ''; const d = new Date(s); return isNaN(d.getTime()) ? s.slice(0, 10) : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); };
    const invoices = kind === 'invoices';

    return (
      <Page>
        <PageHead eyebrow="Revenues" title="Projects"/>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
          {[['payments', 'Payments'], ['invoices', 'Invoices']].map(([id, l]) => (
            <button key={id} type="button" onClick={() => setKind(id)}
              style={{ ...(kind === id ? S.btn : S.btnGhost), padding: '7px 15px', fontSize: 12.5 }}>{l}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
          {PRESETS.map(([id, l]) => (
            <button key={id} type="button" onClick={() => pickPreset(id)}
              style={{ ...(preset === id ? S.btn : S.btnGhost), padding: '7px 13px', fontSize: 12.5 }}>{l}</button>
          ))}
          {preset === 'custom' && (
            <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <input type="date" value={range.from} onChange={(e) => setCustom('from', e.target.value)} style={{ ...S.input, width: 'auto', padding: '7px 10px', fontSize: 13 }}/>
              <span style={{ color: T.fg3, fontFamily: T.mono, fontSize: 12 }}>to</span>
              <input type="date" value={range.to} onChange={(e) => setCustom('to', e.target.value)} style={{ ...S.input, width: 'auto', padding: '7px 10px', fontSize: 13 }}/>
            </span>
          )}
        </div>

        {data === null ? (
          <div style={{ ...S.card, padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>Loading…</div>
        ) : data.connected === false ? (
          <div style={{ ...S.card, padding: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...S.eyebrow, marginBottom: 12 }}><span style={{ width: 6, height: 6, borderRadius: 999, background: '#E8C36A' }}/>QuickBooks not connected</div>
            {data.canConnect ? (
              <>
                <div style={{ fontFamily: T.sans, fontSize: 14.5, lineHeight: 1.6, color: T.fg2, maxWidth: 640, marginBottom: 18 }}>
                  QuickBooks is configured ({data.environment}). Click Connect to authorize read access to your accounting data once; then Fixed revenue lists invoices and payments with links to QuickBooks and totals for the selected range.
                </div>
                <a href="/api/qbo/install" style={{ ...S.btn, textDecoration: 'none', display: 'inline-block' }}>Connect QuickBooks</a>
              </>
            ) : (
              <>
                <div style={{ fontFamily: T.sans, fontSize: 14.5, lineHeight: 1.6, color: T.fg2, maxWidth: 640 }}>
                  Fixed revenue syncs invoices and payments from QuickBooks Online. Add these as Cloudflare vars/secrets, then reload. A <b>Connect QuickBooks</b> button appears here once they&rsquo;re set.
                </div>
                {data.have && (
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[['QBO_CLIENT_ID', data.have.clientId], ['QBO_CLIENT_SECRET', data.have.clientSecret]].map(([k, present]) => (
                      <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: T.mono, fontSize: 12.5 }}>
                        <span style={{ width: 16, textAlign: 'center', color: present ? '#0A7A3B' : '#B3261E' }}>{present ? '✓' : '✗'}</span>
                        <span style={{ color: present ? T.fg2 : T.fg1, fontWeight: present ? 500 : 700 }}>{k}</span>
                        <span style={{ color: T.fg3, fontSize: 11 }}>{present ? 'detected' : 'missing (required)'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (error || data.ok === false) ? (
          <div style={{ ...S.card, padding: 28 }}>
            <div style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 15, color: T.fg1, marginBottom: 6 }}>Couldn&rsquo;t reach QuickBooks</div>
            <div style={{ fontFamily: T.mono, fontSize: 12, color: '#B3261E', wordBreak: 'break-word' }}>{error || data.error}</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
              <div style={{ ...S.card, padding: '16px 20px', minWidth: 180 }}>
                <div style={S.eyebrow}>{invoices ? 'Total invoiced' : 'Total collected'}</div>
                <div style={{ fontFamily: T.hero, fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', color: T.fg1, marginTop: 6 }}>{money(data.total, data.currency)}</div>
              </div>
              <div style={{ ...S.card, padding: '16px 20px', minWidth: 120 }}>
                <div style={S.eyebrow}>{invoices ? 'Invoices' : 'Payments'}</div>
                <div style={{ fontFamily: T.hero, fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', color: T.fg1, marginTop: 6 }}>{data.count}</div>
              </div>
              <div style={{ ...S.card, padding: '16px 20px', minWidth: 170 }}>
                <div style={S.eyebrow}>Range</div>
                <div style={{ fontFamily: T.mono, fontSize: 13, color: T.fg2, marginTop: 12 }}>{data.from} → {data.to}</div>
              </div>
            </div>
            {data.truncated && (
              <div style={{ marginBottom: 12, fontFamily: T.mono, fontSize: 11.5, color: '#6A4E00', background: '#FDF6E3', border: '1px solid #E8C36A', borderRadius: 6, padding: '8px 12px' }}>
                Showing the first batch for this range; narrow the dates for a complete total.
              </div>
            )}
            {data.warning && (
              <div style={{ marginBottom: 12, fontFamily: T.mono, fontSize: 11.5, color: '#8A1C1C', background: '#FDE8E8', border: '1px solid #F0A9A9', borderRadius: 6, padding: '8px 12px', wordBreak: 'break-word' }}>
                Partial data: {data.warning}
              </div>
            )}
            {data.rows.length === 0 ? (
              <div style={{ ...S.card, padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>No {invoices ? 'invoices' : 'payments'} in this range.</div>
            ) : (
              <div style={{ ...S.card, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>
                      <th style={S.th}>Date</th>
                      {invoices ? <th style={S.th}>Invoice #</th> : null}
                      <th style={S.th}>Customer</th>
                      <th style={{ ...S.th, textAlign: 'right' }}>Amount</th>
                      {invoices ? <th style={{ ...S.th, textAlign: 'right' }}>Balance</th> : null}
                      <th style={{ ...S.th, textAlign: 'right' }}>QuickBooks</th>
                    </tr></thead>
                    <tbody>
                      {data.rows.map((r) => (
                        <tr key={r.id}>
                          <td style={{ ...S.td, whiteSpace: 'nowrap', fontFamily: T.mono, fontSize: 12.5 }}>{fmtDate(r.date)}</td>
                          {invoices ? <td style={{ ...S.td, fontWeight: 700 }}>{r.docNumber || ('#' + r.id)}</td> : null}
                          <td style={S.td}>{r.customer || '—'}</td>
                          <td style={{ ...S.td, textAlign: 'right', fontFamily: T.mono, whiteSpace: 'nowrap' }}>{money(r.amount, r.currency)}</td>
                          {invoices ? <td style={{ ...S.td, textAlign: 'right', fontFamily: T.mono, whiteSpace: 'nowrap', color: r.balance ? '#B3261E' : T.fg3 }}>{r.balance != null ? money(r.balance, r.currency) : '—'}</td> : null}
                          <td style={{ ...S.td, textAlign: 'right', whiteSpace: 'nowrap' }}><a href={r.link} target="_blank" rel="noreferrer" style={{ ...S.btnGhost, textDecoration: 'none', padding: '5px 10px', fontSize: 12 }}>Open ↗</a></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </Page>
    );
  }

  // ── Revenues > Apps (Shopify Partner app earnings) ───────────────────
  function AppsRevenue() {
    const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const presetRange = (p) => {
      const now = new Date(), y = now.getFullYear(), m = now.getMonth();
      let from, to = now;
      if (p === 'day') { from = new Date(y, m, now.getDate()); to = new Date(y, m, now.getDate()); }
      else if (p === 'quarter') { from = new Date(y, Math.floor(m / 3) * 3, 1); }
      else if (p === 'year') { from = new Date(y, 0, 1); to = new Date(y, 11, 31); }
      else if (p === 'ytd') { from = new Date(y, 0, 1); }
      else { from = new Date(y, m, 1); }
      return { from: ymd(from), to: ymd(to) };
    };
    const PRESETS = [['day', 'Day'], ['month', 'Month'], ['quarter', 'Quarter'], ['year', 'Year'], ['ytd', 'YTD'], ['custom', 'Custom']];

    const [preset, setPreset] = useState('month');
    const [range, setRange] = useState(() => presetRange('month'));
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    const pickPreset = (p) => { setPreset(p); if (p !== 'custom') setRange(presetRange(p)); };
    const setCustom = (k, v) => { if (v) setRange((r) => ({ ...r, [k]: v })); };

    useEffect(() => {
      let dead = false; setData(null); setError('');
      api(`/api/admin/revenue/apps?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`)
        .then((d) => { if (!dead) setData(d); })
        .catch((e) => { if (!dead) { setError(e.message); setData({}); } });
      return () => { dead = true; };
    }, [range.from, range.to]);

    const money = (n, cur) => { try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur || 'USD' }).format(n || 0); } catch (_) { return '$' + (n || 0).toFixed(2); } };
    const fmtDate = (s) => { if (!s) return ''; const d = new Date(s); return isNaN(d.getTime()) ? s.slice(0, 10) : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); };

    return (
      <Page>
        <PageHead eyebrow="Revenues" title="Apps" action={data && data.dashboardUrl ? (
          <a href={data.dashboardUrl} target="_blank" rel="noreferrer" style={{ ...S.btnGhost, textDecoration: 'none' }}>Partner Dashboard ↗</a>
        ) : null}/>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
          {PRESETS.map(([id, l]) => (
            <button key={id} type="button" onClick={() => pickPreset(id)}
              style={{ ...(preset === id ? S.btn : S.btnGhost), padding: '7px 13px', fontSize: 12.5 }}>{l}</button>
          ))}
          {preset === 'custom' && (
            <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <input type="date" value={range.from} onChange={(e) => setCustom('from', e.target.value)} style={{ ...S.input, width: 'auto', padding: '7px 10px', fontSize: 13 }}/>
              <span style={{ color: T.fg3, fontFamily: T.mono, fontSize: 12 }}>to</span>
              <input type="date" value={range.to} onChange={(e) => setCustom('to', e.target.value)} style={{ ...S.input, width: 'auto', padding: '7px 10px', fontSize: 13 }}/>
            </span>
          )}
        </div>

        {data === null ? (
          <div style={{ ...S.card, padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>Loading…</div>
        ) : data.connected === false ? (
          <div style={{ ...S.card, padding: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...S.eyebrow, marginBottom: 12 }}><span style={{ width: 6, height: 6, borderRadius: 999, background: '#E8C36A' }}/>Partner API not connected</div>
            <div style={{ fontFamily: T.sans, fontSize: 14.5, lineHeight: 1.6, color: T.fg2, maxWidth: 640 }}>
              Apps revenue reads your app earnings from the Shopify Partner Dashboard. Create a Partner API client (Partner Dashboard → Settings → Partner API clients), then add these as Cloudflare vars/secrets and reload:
            </div>
            {data.have && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[['SHOPIFY_PARTNER_ORG_ID', data.have.orgId], ['SHOPIFY_PARTNER_TOKEN', data.have.token]].map(([k, present]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: T.mono, fontSize: 12.5 }}>
                    <span style={{ width: 16, textAlign: 'center', color: present ? '#0A7A3B' : '#B3261E' }}>{present ? '✓' : '✗'}</span>
                    <span style={{ color: present ? T.fg2 : T.fg1, fontWeight: present ? 500 : 700 }}>{k}</span>
                    <span style={{ color: T.fg3, fontSize: 11 }}>{present ? 'detected' : 'missing (required)'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (error || data.ok === false) ? (
          <div style={{ ...S.card, padding: 28 }}>
            <div style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 15, color: T.fg1, marginBottom: 6 }}>Couldn&rsquo;t reach the Partner API</div>
            <div style={{ fontFamily: T.mono, fontSize: 12, color: '#B3261E', wordBreak: 'break-word' }}>{error || data.error}</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
              <div style={{ ...S.card, padding: '16px 20px', minWidth: 180 }}>
                <div style={S.eyebrow}>Net app revenue</div>
                <div style={{ fontFamily: T.hero, fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', color: T.fg1, marginTop: 6 }}>{money(data.total, data.currency)}</div>
              </div>
              <div style={{ ...S.card, padding: '16px 20px', minWidth: 120 }}>
                <div style={S.eyebrow}>Transactions</div>
                <div style={{ fontFamily: T.hero, fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', color: T.fg1, marginTop: 6 }}>{data.count}</div>
              </div>
              <div style={{ ...S.card, padding: '16px 20px', minWidth: 170 }}>
                <div style={S.eyebrow}>Range</div>
                <div style={{ fontFamily: T.mono, fontSize: 13, color: T.fg2, marginTop: 12 }}>{data.from} → {data.to}</div>
              </div>
            </div>
            {data.truncated && (
              <div style={{ marginBottom: 12, fontFamily: T.mono, fontSize: 11.5, color: '#6A4E00', background: '#FDF6E3', border: '1px solid #E8C36A', borderRadius: 6, padding: '8px 12px' }}>
                Showing the first batch for this range; narrow the dates for a complete total.
              </div>
            )}
            {data.rows.length === 0 ? (
              <div style={{ ...S.card, padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>No app transactions in this range.</div>
            ) : (
              <div style={{ ...S.card, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>
                      <th style={S.th}>Date</th><th style={S.th}>App</th><th style={S.th}>Shop</th><th style={S.th}>Type</th><th style={{ ...S.th, textAlign: 'right' }}>Net</th>
                    </tr></thead>
                    <tbody>
                      {data.rows.map((r) => (
                        <tr key={r.id}>
                          <td style={{ ...S.td, whiteSpace: 'nowrap', fontFamily: T.mono, fontSize: 12.5 }}>{fmtDate(r.date)}</td>
                          <td style={{ ...S.td, fontWeight: 700 }}>{r.app || '—'}</td>
                          <td style={{ ...S.td, fontFamily: T.mono, fontSize: 12 }}>{r.shop || '—'}</td>
                          <td style={S.td}><span style={{ fontFamily: T.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', background: '#EEF0FE', color: '#3A44C4', borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap' }}>{r.type}</span></td>
                          <td style={{ ...S.td, textAlign: 'right', fontFamily: T.mono, whiteSpace: 'nowrap', color: r.amount < 0 ? '#B3261E' : T.fg1 }}>{money(r.amount, r.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </Page>
    );
  }

  // ── Revenues > Referrals (Shopify Partner referral payouts) ──────────
  function ReferralsRevenue() {
    const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const presetRange = (p) => {
      const now = new Date(), y = now.getFullYear(), m = now.getMonth();
      let from, to = now;
      if (p === 'day') { from = new Date(y, m, now.getDate()); to = new Date(y, m, now.getDate()); }
      else if (p === 'quarter') { from = new Date(y, Math.floor(m / 3) * 3, 1); }
      else if (p === 'year') { from = new Date(y, 0, 1); to = new Date(y, 11, 31); }
      else if (p === 'ytd') { from = new Date(y, 0, 1); }
      else { from = new Date(y, m, 1); }
      return { from: ymd(from), to: ymd(to) };
    };
    const PRESETS = [['day', 'Day'], ['month', 'Month'], ['quarter', 'Quarter'], ['year', 'Year'], ['ytd', 'YTD'], ['custom', 'Custom']];

    const [preset, setPreset] = useState('month');
    const [range, setRange] = useState(() => presetRange('month'));
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    const pickPreset = (p) => { setPreset(p); if (p !== 'custom') setRange(presetRange(p)); };
    const setCustom = (k, v) => { if (v) setRange((r) => ({ ...r, [k]: v })); };

    useEffect(() => {
      let dead = false; setData(null); setError('');
      api(`/api/admin/revenue/referrals?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`)
        .then((d) => { if (!dead) setData(d); })
        .catch((e) => { if (!dead) { setError(e.message); setData({}); } });
      return () => { dead = true; };
    }, [range.from, range.to]);

    const money = (n, cur) => { try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur || 'USD' }).format(n || 0); } catch (_) { return '$' + (n || 0).toFixed(2); } };
    const fmtDate = (s) => { if (!s) return ''; const d = new Date(s); return isNaN(d.getTime()) ? s.slice(0, 10) : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); };

    return (
      <Page>
        <PageHead eyebrow="Revenues" title="Referrals" action={data && data.dashboardUrl ? (
          <a href={data.dashboardUrl} target="_blank" rel="noreferrer" style={{ ...S.btnGhost, textDecoration: 'none' }}>Partner Dashboard ↗</a>
        ) : null}/>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
          {PRESETS.map(([id, l]) => (
            <button key={id} type="button" onClick={() => pickPreset(id)}
              style={{ ...(preset === id ? S.btn : S.btnGhost), padding: '7px 13px', fontSize: 12.5 }}>{l}</button>
          ))}
          {preset === 'custom' && (
            <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <input type="date" value={range.from} onChange={(e) => setCustom('from', e.target.value)} style={{ ...S.input, width: 'auto', padding: '7px 10px', fontSize: 13 }}/>
              <span style={{ color: T.fg3, fontFamily: T.mono, fontSize: 12 }}>to</span>
              <input type="date" value={range.to} onChange={(e) => setCustom('to', e.target.value)} style={{ ...S.input, width: 'auto', padding: '7px 10px', fontSize: 13 }}/>
            </span>
          )}
        </div>

        {data === null ? (
          <div style={{ ...S.card, padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>Loading…</div>
        ) : data.connected === false ? (
          <div style={{ ...S.card, padding: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...S.eyebrow, marginBottom: 12 }}><span style={{ width: 6, height: 6, borderRadius: 999, background: '#E8C36A' }}/>Partner API not connected</div>
            <div style={{ fontFamily: T.sans, fontSize: 14.5, lineHeight: 1.6, color: T.fg2, maxWidth: 640 }}>
              Referrals reads your referral payouts from the Shopify Partner Dashboard. It uses the same Partner API credentials as Apps: <b>SHOPIFY_PARTNER_ORG_ID</b> and <b>SHOPIFY_PARTNER_TOKEN</b>.
            </div>
          </div>
        ) : (error || data.ok === false) ? (
          <div style={{ ...S.card, padding: 28 }}>
            <div style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 15, color: T.fg1, marginBottom: 6 }}>Couldn&rsquo;t reach the Partner API</div>
            <div style={{ fontFamily: T.mono, fontSize: 12, color: '#B3261E', wordBreak: 'break-word' }}>{error || data.error}</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
              <div style={{ ...S.card, padding: '16px 20px', minWidth: 180 }}>
                <div style={S.eyebrow}>Referral payouts</div>
                <div style={{ fontFamily: T.hero, fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', color: T.fg1, marginTop: 6 }}>{money(data.total, data.currency)}</div>
              </div>
              <div style={{ ...S.card, padding: '16px 20px', minWidth: 120 }}>
                <div style={S.eyebrow}>Transactions</div>
                <div style={{ fontFamily: T.hero, fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', color: T.fg1, marginTop: 6 }}>{data.count}</div>
              </div>
              <div style={{ ...S.card, padding: '16px 20px', minWidth: 170 }}>
                <div style={S.eyebrow}>Range</div>
                <div style={{ fontFamily: T.mono, fontSize: 13, color: T.fg2, marginTop: 12 }}>{data.from} → {data.to}</div>
              </div>
            </div>
            {data.truncated && (
              <div style={{ marginBottom: 12, fontFamily: T.mono, fontSize: 11.5, color: '#6A4E00', background: '#FDF6E3', border: '1px solid #E8C36A', borderRadius: 6, padding: '8px 12px' }}>
                Showing the first batch for this range; narrow the dates for a complete total.
              </div>
            )}
            {data.rows.length === 0 ? (
              <div style={{ ...S.card, padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>No referral payouts in this range.</div>
            ) : (
              <div style={{ ...S.card, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>
                      <th style={S.th}>Date</th><th style={S.th}>Shop</th><th style={S.th}>Type</th><th style={{ ...S.th, textAlign: 'right' }}>Amount</th>
                    </tr></thead>
                    <tbody>
                      {data.rows.map((r) => (
                        <tr key={r.id}>
                          <td style={{ ...S.td, whiteSpace: 'nowrap', fontFamily: T.mono, fontSize: 12.5 }}>{fmtDate(r.date)}</td>
                          <td style={{ ...S.td, fontFamily: T.mono, fontSize: 12 }}>{r.shop || '—'}</td>
                          <td style={S.td}><span style={{ fontFamily: T.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', background: '#EEF0FE', color: '#3A44C4', borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap' }}>{r.type}</span></td>
                          <td style={{ ...S.td, textAlign: 'right', fontFamily: T.mono, whiteSpace: 'nowrap', color: r.amount < 0 ? '#B3261E' : T.fg1 }}>{money(r.amount, r.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </Page>
    );
  }

  // ── Revenues > Overview (combined totals) ────────────────────────────
  function RevenueOverview() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => {
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      let dead = false; setData(null); setError('');
      api('/api/admin/revenue/summary?today=' + today)
        .then((r) => { if (!dead) setData(r); })
        .catch((e) => { if (!dead) { setError(e.message); setData({}); } });
      return () => { dead = true; };
    }, []);
    const money = (n, cur) => { try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur || 'USD', maximumFractionDigits: 0 }).format(n || 0); } catch (_) { return '$' + Math.round(n || 0); } };
    const BLOCKS = [['This month', 'month'], ['This quarter', 'quarter'], ['This year', 'year']];
    const SRC = [['recurring', 'Recurring'], ['fixed', 'Projects'], ['apps', 'Apps'], ['referrals', 'Referrals']];

    return (
      <Page>
        <PageHead eyebrow="Revenues" title="Overview"/>
        {data === null ? (
          <div style={{ ...S.card, padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>Loading…</div>
        ) : (error || data.ok === false) ? (
          <div style={{ ...S.card, padding: 28 }}>
            <div style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 15, color: T.fg1, marginBottom: 6 }}>Couldn&rsquo;t load revenue</div>
            <div style={{ fontFamily: T.mono, fontSize: 12, color: '#B3261E', wordBreak: 'break-word' }}>{error || data.error}</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {BLOCKS.map(([label, key]) => (
                <div key={key} style={{ ...S.card, flex: '1 1 240px', padding: 'clamp(20px, 3vw, 32px)' }}>
                  <div style={S.eyebrow}>{label}</div>
                  <div style={{ fontFamily: T.hero, fontWeight: 800, fontSize: 'clamp(34px, 4.5vw, 52px)', letterSpacing: '-0.03em', lineHeight: 1, color: T.fg1, marginTop: 12 }}>{money(data[key], data.currency)}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.fg3, marginRight: 4 }}>Sources</span>
              {SRC.map(([k, l]) => {
                const s = (data.sources && data.sources[k]) || {};
                const ok = s.connected && s.ok !== false;
                const color = ok ? '#0A7A3B' : (s.connected ? '#B3261E' : '#9A8A5A');
                const label = ok ? l : (s.connected ? l + ' (error)' : l + ' (not connected)');
                return (
                  <span key={k} title={s.error || ''} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: T.mono, fontSize: 11.5, color: T.fg2, border: `1px solid ${T.line}`, borderRadius: 999, padding: '4px 10px' }}>
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: color }}/>{label}
                  </span>
                );
              })}
            </div>
            <div style={{ marginTop: 14, fontFamily: T.sans, fontSize: 13, color: T.fg3 }}>
              Combined across Recurring, Fixed, Apps, and Referrals through {data.windows ? data.windows.to : ''}. Open a sub-tab for the detail behind each number.
            </div>
          </>
        )}
      </Page>
    );
  }

  // ── Services > Retainers (Stripe payments) ───────────────────────────
  function Retainers() {
    const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const presetRange = (p) => {
      const now = new Date(), y = now.getFullYear(), m = now.getMonth();
      let from, to = now;
      if (p === 'day') { from = new Date(y, m, now.getDate()); to = new Date(y, m, now.getDate()); }
      else if (p === 'month') { from = new Date(y, m, 1); }
      else if (p === 'quarter') { from = new Date(y, Math.floor(m / 3) * 3, 1); }
      else if (p === 'year') { from = new Date(y, 0, 1); to = new Date(y, 11, 31); }
      else { from = new Date(y, 0, 1); } // ytd (default)
      return { from: ymd(from), to: ymd(to) };
    };
    const PRESETS = [['day', 'Day'], ['month', 'Month'], ['quarter', 'Quarter'], ['year', 'Year'], ['ytd', 'YTD'], ['custom', 'Custom']];

    const [preset, setPreset] = useState('ytd');
    const [range, setRange] = useState(() => presetRange('ytd'));
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    const pickPreset = (p) => { setPreset(p); if (p !== 'custom') setRange(presetRange(p)); };
    const setCustom = (k, v) => { if (v) setRange((r) => ({ ...r, [k]: v })); };

    useEffect(() => {
      let dead = false; setData(null); setError('');
      api(`/api/admin/retainers?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`)
        .then((d) => { if (!dead) setData(d); })
        .catch((e) => { if (!dead) { setError(e.message); setData({}); } });
      return () => { dead = true; };
    }, [range.from, range.to]);

    const money = (n, cur) => { try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur || 'USD' }).format(n || 0); } catch (_) { return '$' + (n || 0).toFixed(2); } };
    const fmtDate = (s) => { if (!s) return ''; const d = new Date(s); return isNaN(d.getTime()) ? s.slice(0, 10) : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); };

    return (
      <Page>
        <PageHead eyebrow="Services" title="Retainers" action={data && data.dashboardUrl ? (
          <a href={data.dashboardUrl} target="_blank" rel="noreferrer" style={{ ...S.btnGhost, textDecoration: 'none' }}>Stripe ↗</a>
        ) : null}/>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
          {PRESETS.map(([id, l]) => (
            <button key={id} type="button" onClick={() => pickPreset(id)}
              style={{ ...(preset === id ? S.btn : S.btnGhost), padding: '7px 13px', fontSize: 12.5 }}>{l}</button>
          ))}
          {preset === 'custom' && (
            <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <input type="date" value={range.from} onChange={(e) => setCustom('from', e.target.value)} style={{ ...S.input, width: 'auto', padding: '7px 10px', fontSize: 13 }}/>
              <span style={{ color: T.fg3, fontFamily: T.mono, fontSize: 12 }}>to</span>
              <input type="date" value={range.to} onChange={(e) => setCustom('to', e.target.value)} style={{ ...S.input, width: 'auto', padding: '7px 10px', fontSize: 13 }}/>
            </span>
          )}
        </div>

        {data === null ? (
          <div style={{ ...S.card, padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>Loading…</div>
        ) : data.connected === false ? (
          <div style={{ ...S.card, padding: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...S.eyebrow, marginBottom: 12 }}><span style={{ width: 6, height: 6, borderRadius: 999, background: '#E8C36A' }}/>Stripe not connected</div>
            <div style={{ fontFamily: T.sans, fontSize: 14.5, lineHeight: 1.6, color: T.fg2, maxWidth: 640 }}>
              Retainers lists payments collected in Stripe. Add your Stripe secret key as a Cloudflare secret named <b>STRIPE_SECRET_KEY</b> (starts with <b>sk_live_</b>), then reload.
            </div>
          </div>
        ) : (error || data.ok === false) ? (
          <div style={{ ...S.card, padding: 28 }}>
            <div style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 15, color: T.fg1, marginBottom: 6 }}>Couldn&rsquo;t reach Stripe</div>
            <div style={{ fontFamily: T.mono, fontSize: 12, color: '#B3261E', wordBreak: 'break-word' }}>{error || data.error}</div>
          </div>
        ) : (
          <>
            {data.test && (
              <div style={{ marginBottom: 12, fontFamily: T.mono, fontSize: 11.5, color: '#6A4E00', background: '#FDF6E3', border: '1px solid #E8C36A', borderRadius: 6, padding: '8px 12px' }}>
                Test-mode key — showing Stripe test data. Use an sk_live_ key for real payments.
              </div>
            )}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
              <div style={{ ...S.card, padding: '16px 20px', minWidth: 180 }}>
                <div style={S.eyebrow}>Collected</div>
                <div style={{ fontFamily: T.hero, fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', color: T.fg1, marginTop: 6 }}>{money(data.total, data.currency)}</div>
              </div>
              <div style={{ ...S.card, padding: '16px 20px', minWidth: 120 }}>
                <div style={S.eyebrow}>Payments</div>
                <div style={{ fontFamily: T.hero, fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', color: T.fg1, marginTop: 6 }}>{data.count}</div>
              </div>
              <div style={{ ...S.card, padding: '16px 20px', minWidth: 170 }}>
                <div style={S.eyebrow}>Range</div>
                <div style={{ fontFamily: T.mono, fontSize: 13, color: T.fg2, marginTop: 12 }}>{data.from} → {data.to}</div>
              </div>
            </div>
            {data.truncated && (
              <div style={{ marginBottom: 12, fontFamily: T.mono, fontSize: 11.5, color: '#6A4E00', background: '#FDF6E3', border: '1px solid #E8C36A', borderRadius: 6, padding: '8px 12px' }}>
                Showing the first batch for this range; narrow the dates for a complete total.
              </div>
            )}
            {data.rows.length === 0 ? (
              <div style={{ ...S.card, padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>No payments in this range.</div>
            ) : (
              <div style={{ ...S.card, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>
                      <th style={S.th}>Date</th><th style={S.th}>Customer</th><th style={S.th}>Description</th><th style={{ ...S.th, textAlign: 'right' }}>Amount</th><th style={{ ...S.th, textAlign: 'right' }}>Stripe</th>
                    </tr></thead>
                    <tbody>
                      {data.rows.map((r) => (
                        <tr key={r.id}>
                          <td style={{ ...S.td, whiteSpace: 'nowrap', fontFamily: T.mono, fontSize: 12.5 }}>{fmtDate(r.date)}</td>
                          <td style={{ ...S.td, fontWeight: 700 }}>{r.customer || '—'}</td>
                          <td style={S.td}>{r.description || '—'}</td>
                          <td style={{ ...S.td, textAlign: 'right', fontFamily: T.mono, whiteSpace: 'nowrap' }}>{money(r.amount, r.currency)}</td>
                          <td style={{ ...S.td, textAlign: 'right', whiteSpace: 'nowrap' }}><a href={r.link} target="_blank" rel="noreferrer" style={{ ...S.btnGhost, textDecoration: 'none', padding: '5px 10px', fontSize: 12 }}>Open ↗</a></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </Page>
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

  // Search-as-you-type against Attio (kind: 'companies' | 'people'), via
  // the worker's admin-authenticated proxy — the Attio token never
  // reaches the browser. Picking a result hands the raw Attio record back
  // to the caller; this component holds no selection state of its own; it's
  // just the search box + dropdown.
  function AttioTypeahead({ kind, label, placeholder, onPick, autoFocus }) {
    const [q, setQ] = useState('');
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    const boxRef = useRef(null);

    useEffect(() => {
      if (!q.trim()) { setResults([]); setOpen(false); setLoading(false); return undefined; }
      let dead = false;
      setLoading(true);
      const t = setTimeout(async () => {
        try {
          const d = await api(`/api/admin/attio/${kind}?q=${encodeURIComponent(q.trim())}`);
          if (dead) return;
          setResults(d[kind] || []);
          setFailed(false);
          setOpen(true);
        } catch (_) {
          if (dead) return;
          setResults([]); setFailed(true); setOpen(true);
        } finally {
          if (!dead) setLoading(false);
        }
      }, 280);
      return () => { dead = true; clearTimeout(t); };
    }, [q, kind]);

    useEffect(() => {
      const onDocClick = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
      document.addEventListener('click', onDocClick);
      return () => document.removeEventListener('click', onDocClick);
    }, []);

    const resultLabel = (r) => kind === 'companies'
      ? (r.domain ? `${r.name || '(unnamed)'} · ${r.domain}` : (r.name || '(unnamed)'))
      : (r.email ? `${r.name || r.email} · ${r.email}` : r.name);

    return (
      <div ref={boxRef} style={{ position: 'relative' }}>
        {label ? <label style={S.label}>{label}</label> : null}
        <input
          style={S.input}
          value={q}
          placeholder={placeholder}
          autoFocus={!!autoFocus}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => { if (results.length || failed) setOpen(true); }}
        />
        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 30,
            background: T.paper, border: `1px solid ${T.line}`, borderRadius: 8,
            boxShadow: '0 18px 40px -18px rgba(0,0,0,0.35)', maxHeight: 220, overflowY: 'auto',
          }}>
            {loading ? (
              <div style={{ padding: 12, fontFamily: T.sans, fontSize: 13, color: T.fg3 }}>Searching…</div>
            ) : failed ? (
              <div style={{ padding: 12, fontFamily: T.sans, fontSize: 13, color: T.fg3 }}>Couldn't reach Attio — check it's connected.</div>
            ) : results.length === 0 ? (
              <div style={{ padding: 12, fontFamily: T.sans, fontSize: 13, color: T.fg3 }}>No matches in Attio</div>
            ) : results.map((r) => (
              <button key={r.attioId} type="button"
                onClick={() => { onPick(r); setQ(''); setResults([]); setOpen(false); }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', background: 'transparent', border: 'none', borderBottom: `1px solid ${T.line}`, cursor: 'pointer', fontFamily: T.sans, fontSize: 13.5, color: T.fg1 }}>
                {resultLabel(r)}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Once a company/contact is picked, show a compact summary card with a
  // clear (✕) button instead of the search box — makes the required,
  // Attio-only nature of the field unambiguous (no free-text fallback).
  function SelectedCard({ title, sub, onClear }) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, padding: '10px 12px', background: T.cream, border: `1px solid ${T.line}`, borderRadius: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 13.5, color: T.fg1 }}>{title}</div>
          {sub ? <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fg3, marginTop: 3 }}>{sub}</div> : null}
        </div>
        <button type="button" aria-label="Clear" onClick={onClear}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 999, border: 'none', background: T.line, color: T.fg1, cursor: 'pointer', fontSize: 11, lineHeight: 1, padding: 0, flexShrink: 0 }}>✕</button>
      </div>
    );
  }

  // Required single-select company field: search-and-pick only, no
  // free-text fallback. Once picked, shows a read-only summary of
  // whatever website/address Attio has on file for that company.
  // Company dropdown backed by the portal's own company records — the only
  // source new discoveries and blueprints are created from.
  function PortalCompanyPicker({ company, onPick, onClear }) {
    const [list, setList] = useState(null);
    useEffect(() => { api('/api/admin/companies').then((d) => setList(d.companies || [])).catch(() => setList([])); }, []);
    if (company) return <SelectedCard title={company.name} sub={[company.storeUrl, company.address].filter(Boolean).join(' · ') || 'Hub company'} onClear={onClear}/>;
    return (
      <div>
        <label style={S.label}>Company · from your Hub companies</label>
        {list === null ? (
          <div style={{ fontFamily: T.sans, fontSize: 13, color: T.fg3, padding: '8px 2px' }}>Loading companies…</div>
        ) : list.length === 0 ? (
          <div style={{ fontFamily: T.sans, fontSize: 13, color: T.fg3, padding: '8px 2px' }}>No companies yet. Add the company under Companies first.</div>
        ) : (
          <select value="" onChange={(e) => { const co = list.find((c) => c.id === e.target.value); if (co) onPick(co); }} style={{ ...S.input, cursor: 'pointer' }}>
            <option value="">Pick a company…</option>
            {list.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>
    );
  }

  function CompanyPicker({ company, onPick, onClear }) {
    return (
      <div>
        <label style={S.label}>Company</label>
        {company ? (
          <SelectedCard title={company.name || '(unnamed)'} sub={company.attioId ? 'From Attio' : ''} onClear={onClear}/>
        ) : (
          <AttioTypeahead kind="companies" placeholder="Search Attio companies…" autoFocus onPick={onPick}/>
        )}
      </div>
    );
  }

  // ── Discoveries ──────────────────────────────────────────────────────
  const DISC_PAGE_SIZE = 10;
  function Discoveries({ me }) {
    const isMobile = useIsMobile();
    const [rows, setRows] = useState(null);
    const [showNew, setShowNew] = useState(() => new URLSearchParams(window.location.search).get('new') === '1');
    const [transcriptFor, setTranscriptFor] = useState(null);
    const [copied, setCopied] = useState('');
    const [page, setPage] = useState(1);
    const [error, setError] = useState('');

    // New company-folder URLs everywhere. Share = the portal-framed page a
    // client opens; app = the raw experience the admin previews in a frame.
    const shareUrl = (r) => `${window.location.origin}${r.companyId ? '/' + r.companyId + '/discovery' : '/discovery/' + r.handle + '/'}`;
    const appUrl = (r) => r.companyId ? '/' + r.companyId + '/discovery/app' : '/discovery/' + r.handle + '/';
    const copyUrl = async (r) => {
      try { await navigator.clipboard.writeText(shareUrl(r)); }
      catch (_) { window.prompt('Copy the discovery link:', shareUrl(r)); }
      setCopied(r.id);
      setTimeout(() => setCopied(''), 1600);
    };

    const deleteDisc = async (r) => {
      if (!window.confirm(`Delete the "${r.company}" discovery?\n\nThis permanently removes the discovery, its client link, and every recorded answer. There is no undo.`)) return;
      try {
        await api('/api/admin/discovery/delete', { method: 'POST', body: JSON.stringify({ id: r.id }) });
        load();
      } catch (err) { setError(err.message); }
    };

    const discActions = (r) => (
      <span style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
        <a href={appUrl(r)} onClick={previewClick(appUrl(r), r.company || r.handle)} target="_blank" rel="noreferrer" title="Preview discovery" aria-label="Preview discovery"
          style={{ ...S.btnIcon, textDecoration: 'none' }}><IconEye/></a>
        <button type="button" title={copied === r.id ? 'Copied ✓' : 'Copy link'} aria-label="Copy link" style={S.btnIcon} onClick={() => copyUrl(r)}>
          {copied === r.id ? <IconCheck/> : <IconShare/>}
        </button>
        <button type="button" style={S.btnGhost} onClick={() => setTranscriptFor(r)}>Transcript</button>
        {me.canDelete && (
          <button type="button" title="Delete discovery" aria-label="Delete discovery"
            style={{ ...S.btnIcon, color: '#B3261E', borderColor: '#F0A9A9' }} onClick={() => deleteDisc(r)}><IconTrash/></button>
        )}
      </span>
    );

    const load = useCallback(async () => {
      try { setRows((await api('/api/admin/discoveries')).discoveries); }
      catch (err) { setError(err.message); setRows([]); }
    }, []);
    useEffect(() => { load(); }, [load]);

    const sorted = rows ? rows.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)) : null;
    const totalPages = sorted ? Math.max(1, Math.ceil(sorted.length / DISC_PAGE_SIZE)) : 1;
    const pageSafe = Math.min(page, totalPages);
    const pageRows = sorted ? sorted.slice((pageSafe - 1) * DISC_PAGE_SIZE, pageSafe * DISC_PAGE_SIZE) : [];

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
              <div style={{ fontFamily: T.sans, fontSize: 14, color: T.fg2, marginBottom: 18 }}>Start the first one to open the discovery experience.</div>
              <button type="button" style={S.btnLime} onClick={() => setShowNew(true)}>+ New discovery</button>
            </div>
          ) : isMobile ? (
            <div>
              {pageRows.map((r) => (
                <div key={r.id} style={{ padding: '16px 16px 15px', borderBottom: `1px solid ${T.line}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                    <div style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 15, color: T.fg1 }}>{r.company}</div>
                  </div>
                  {r.client ? <div style={{ fontFamily: T.sans, fontSize: 13.5, color: T.fg2, marginTop: 3 }}>{r.client}</div> : null}
                  <div style={{ marginTop: 8 }}>{discStatusChip(r.status)}</div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={S.eyebrow}>Created</span>
                    <span style={{ fontFamily: T.mono, fontSize: 12, color: T.fg3 }}>{fmtWhen(r.createdAt)}</span>
                  </div>
                  <div style={{ marginTop: 11 }}>{discActions(r)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  <th style={S.th}>Company</th><th style={S.th}>Client</th><th style={S.th}>Status</th>
                  <th style={S.th}>Created</th><th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
                </tr></thead>
                <tbody>
                  {pageRows.map((r) => (
                    <tr key={r.id}>
                      <td style={{ ...S.td, fontWeight: 700 }}>{r.company}</td>
                      <td style={S.td}>{r.client || <span style={{ color: T.fg3 }}>—</span>}</td>
                      <td style={S.td}>{discStatusChip(r.status)}</td>
                      <td style={{ ...S.td, fontFamily: T.mono, fontSize: 12 }}>{fmtWhen(r.createdAt)}</td>
                      <td style={{ ...S.td, textAlign: 'right', whiteSpace: 'nowrap' }}>{discActions(r)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {sorted && sorted.length > DISC_PAGE_SIZE && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '16px 0 4px' }}>
            <button type="button" style={{ ...S.btnGhost, opacity: pageSafe <= 1 ? 0.5 : 1 }} disabled={pageSafe <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}>← Prev</button>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.fg3 }}>Page {pageSafe} of {totalPages}</span>
            <button type="button" style={{ ...S.btnGhost, opacity: pageSafe >= totalPages ? 0.5 : 1 }} disabled={pageSafe >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next →</button>
          </div>
        )}
        {error && <div style={{ marginTop: 12, color: '#B3261E', fontFamily: T.sans, fontSize: 13 }}>{error}</div>}

        {showNew && <NewDiscoveryModal onClose={() => setShowNew(false)}
          onSaved={(d) => {
            setShowNew(false);
            // Creating a discovery moves the admin straight into the
            // Discovery Experience (new company-folder URL) to run the call.
            if (d && (d.companyId || d.handle)) { window.location.href = d.companyId ? '/' + d.companyId + '/discovery/app' : '/discovery/' + d.handle + '/'; return; }
            load();
          }}/>}
        {transcriptFor && <TranscriptModal disc={transcriptFor} onClose={() => setTranscriptFor(null)}/>}
      </Page>
    );
  }

  const DISC_STATUS = {
    new:         { l: 'Not started', bg: '#EEF0FE', fg: '#3A44C4', bd: '#C3C9F5' },
    in_progress: { l: 'In progress', bg: '#FFF6E0', fg: '#6A4E00', bd: '#E8C36A' },
    complete:    { l: 'Complete',    bg: '#DFFCE6', fg: '#064E2E', bd: '#9BDDB0' },
  };
  function discStatusChip(status) {
    const s = DISC_STATUS[status] || DISC_STATUS.new;
    return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: s.bg, color: s.fg, border: `1px solid ${s.bd}` }}>{s.l}</span>;
  }

  // Read-only transcript: every question and its captured answer, grouped by step.
  function TranscriptModal({ disc, onClose }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const steps = window.DISCOVERY_STEPS || [];
    useEffect(() => {
      let dead = false;
      api('/api/discovery/answers?handle=' + encodeURIComponent(disc.handle))
        .then((d) => { if (!dead) setData(d); })
        .catch((e) => { if (!dead) { setError(e.message); setData({ answers: {} }); } });
      return () => { dead = true; };
    }, [disc.handle]);
    const fmt = (v) => Array.isArray(v) ? v.join(', ') : (v == null ? '' : String(v));
    const answers = (data && data.answers) || {};
    return (
      <Modal title={'Transcript · ' + disc.company} sub="Every question and answer captured" onClose={onClose} width={760}>
        <div style={{ padding: 20, maxHeight: '70vh', overflowY: 'auto' }}>
          {!data ? <div style={{ color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>Loading…</div> : (
            steps.map((st, i) => (
              <div key={st.id} style={{ marginBottom: 22 }}>
                <div style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.fg3 }}>{String(i + 1).padStart(2, '0')} · {st.label}</div>
                {st.groups.map((g) => g.questions.map((q) => {
                  const a = fmt(answers[q.id]);
                  return (
                    <div key={q.id} style={{ padding: '9px 0', borderBottom: `1px solid ${T.line}` }}>
                      <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.fg1 }}>{q.label}</div>
                      <div style={{ fontFamily: T.sans, fontSize: 13.5, color: a ? T.fg1 : T.fg3, marginTop: 2, whiteSpace: 'pre-wrap' }}>{a || '—'}</div>
                    </div>
                  );
                }))}
              </div>
            ))
          )}
          {error && <div style={{ color: '#B3261E', fontFamily: T.sans, fontSize: 13 }}>{error}</div>}
        </div>
      </Modal>
    );
  }

  function NewDiscoveryModal({ onClose, onSaved }) {
    const [company, setCompany] = useState(null);   // portal company record
    const [busy, setBusy] = useState(false);
    const [busyLabel, setBusyLabel] = useState('');
    const [error, setError] = useState('');

    // Everything comes from the company profile server-side: contacts,
    // store url, address, palette, logo. If the company carries an RFP
    // (or a technical brief), Claude analyzes it right after creation.
    const prefillDoc = company && ((company.files || []).find((f) => f.kind === 'rfp') || (company.files || []).find((f) => f.kind === 'brief'));

    const save = async (e) => {
      e.preventDefault();
      if (!company) { setError('Pick a company'); return; }
      if (!company.leadContact && !(company.contacts || []).length) { setError('This company has no contacts. Add them on the company profile first.'); return; }
      setBusy(true); setBusyLabel('Saving…'); setError('');
      try {
        const d = await api('/api/admin/discoveries', {
          method: 'POST',
          body: JSON.stringify({ companyId: company.id }),
        });
        if (prefillDoc && d.discovery) {
          setBusyLabel('Analyzing ' + (prefillDoc.kind === 'rfp' ? 'RFP' : 'brief') + '…');
          try {
            await api('/api/admin/discovery/prefill', {
              method: 'POST',
              body: JSON.stringify({ id: d.discovery.id, companyId: company.id, fid: prefillDoc.fid }),
            });
          } catch (err) {
            window.alert('The discovery was created, but document analysis failed:\n\n' + err.message);
          }
        }
        onSaved(d.discovery || null);
      } catch (err) { setError(err.message); setBusy(false); setBusyLabel(''); }
    };

    return (
      <Modal title="New discovery" sub="Pick the company. Everything else pulls from its portal profile." onClose={onClose}>
        <form onSubmit={save} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <PortalCompanyPicker company={company} onPick={setCompany} onClear={() => setCompany(null)}/>
          {company && <CompanySummary company={company} extra={prefillDoc ? ('Claude will pre-fill the questions from ' + prefillDoc.name) : ''}/>}
          {error && <div style={{ color: '#B3261E', fontFamily: T.sans, fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" style={S.btnGhost} onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" style={{ ...S.btnLime, opacity: busy ? 0.7 : 1 }} disabled={busy}>{busy ? (busyLabel || 'Saving…') : 'Create discovery'}</button>
          </div>
        </form>
      </Modal>
    );
  }

  // What the picked company brings with it, so the one-click create is
  // never a mystery box.
  function CompanySummary({ company, extra }) {
    const emails = (company.leadContact ? 1 : 0) + (company.contacts || []).length;
    const line = { display: 'flex', alignItems: 'center', gap: 8 };
    return (
      <div style={{ padding: '12px 14px', background: T.cream, border: `1px solid ${T.line}`, borderRadius: 8, fontFamily: T.sans, fontSize: 13, color: T.fg2, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={line}><b style={{ color: T.fg1 }}>Lead:</b> {company.leadContact ? (company.leadContact.name || company.leadContact.email) : 'none yet'}{emails > 1 ? ` · +${emails - 1} more contact${emails > 2 ? 's' : ''}` : ''}</div>
        <div style={line}>
          <b style={{ color: T.fg1 }}>Branding:</b>
          {company.hasLogo ? <img src={'/api/company/logo?id=' + encodeURIComponent(company.id)} alt="" style={{ height: 18, maxWidth: 90, objectFit: 'contain' }}/> : 'no logo'}
          {company.palette ? (
            <span style={{ display: 'inline-flex', gap: 4 }}>
              <span style={{ width: 14, height: 14, borderRadius: 999, background: company.palette.prime, border: `1px solid ${T.line}` }}></span>
              <span style={{ width: 14, height: 14, borderRadius: 999, background: company.palette.accent, border: `1px solid ${T.line}` }}></span>
            </span>
          ) : null}
        </div>
        {company.storeUrl ? <div style={line}><b style={{ color: T.fg1 }}>Site:</b> {company.storeUrl}</div> : null}
        {extra ? <div style={line}><b style={{ color: T.fg1 }}>Pre-fill:</b> {extra}</div> : null}
      </div>
    );
  }

  // ── Companies ────────────────────────────────────────────────────────
  // The portal's source of truth. Imported from Attio once, then owned
  // here: admins override anything, upload the logo, palette, and the
  // client documents (RFP / technical brief / other files) that both the
  // customer portal and the discovery pre-fill read from.
  const CO_FILE_KINDS = [
    ['rfp', 'RFP'],
    ['brief', 'Technical Brief'],
    ['doc', 'Documents'],
  ];

  // Send portal invites and summarize the per-recipient result for an alert.
  async function inviteToPortal(id, emails) {
    return api('/api/admin/company/invite', { method: 'POST', body: JSON.stringify(emails ? { id, emails } : { id }) });
  }
  function inviteSummary(results) {
    const ok = (results || []).filter((r) => r.ok).length;
    const fail = (results || []).filter((r) => !r.ok);
    let msg = ok + ' invite' + (ok === 1 ? '' : 's') + ' sent.';
    if (fail.length) msg += '\n\nFailed (' + fail.length + '): ' + fail.map((f) => f.email).join(', ') + '\nThese addresses must be verified Cloudflare destination addresses to receive email.';
    return msg;
  }

  function Companies({ me }) {
    const [rows, setRows] = useState(null);
    const [error, setError] = useState('');
    const [adding, setAdding] = useState(false);

    const load = async () => {
      try { setRows((await api('/api/admin/companies')).companies); }
      catch (err) { setError(err.message); setRows([]); }
    };
    useEffect(() => { load(); }, []);

    const remove = async (co) => {
      if (!window.confirm('Remove ' + co.name + ' from the Hub?\n\nTheir contacts lose Hub access and uploaded files are deleted. Discoveries and blueprints are not touched.')) return;
      try { await api('/api/admin/company/delete', { method: 'POST', body: JSON.stringify({ id: co.id }) }); load(); }
      catch (err) { window.alert(err.message); }
    };

    const invite = async (co) => {
      const n = 1 + (co.contacts || []).length;
      if (!window.confirm('Send a Hub invite to ' + co.name + "'s " + n + ' contact' + (n === 1 ? '' : 's') + '?')) return;
      try { const d = await inviteToPortal(co.id); window.alert(inviteSummary(d.results)); load(); }
      catch (err) { window.alert(err.message); }
    };

    return (
      <Page>
        <PageHead eyebrow="Hub" title="Companies" action={
          <button type="button" style={S.btnLime} onClick={() => setAdding(true)}>+ Add company</button>
        }/>
        {rows === null ? (
          <div style={{ ...S.card, padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ ...S.card, padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>
            {error || 'No companies yet. Add the first one to open the Hub to its contacts.'}
          </div>
        ) : (
          <div style={{ ...S.card, overflow: 'hidden' }}>
            {rows.map((co, i) => (
              <div key={co.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: i < rows.length - 1 ? `1px solid ${T.line}` : 'none' }}>
                <span style={{ width: 40, height: 40, borderRadius: 8, background: T.cream, border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {co.hasLogo
                    ? <img src={'/api/company/logo?id=' + encodeURIComponent(co.id) + '&t=' + encodeURIComponent(co.updatedAt || '')} alt="" style={{ maxWidth: 34, maxHeight: 30, objectFit: 'contain' }}/>
                    : <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.fg3 }}>{(co.name || '?')[0].toUpperCase()}</span>}
                </span>
                <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                  <div style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 14.5, color: T.fg1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{co.name}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fg3, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {[co.storeUrl, co.leadContact && (co.leadContact.name || co.leadContact.email), (co.files || []).length ? (co.files.length + ' file' + (co.files.length > 1 ? 's' : '')) : ''].filter(Boolean).join(' · ')}
                  </div>
                </div>
                {co.discoveryHandle ? <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.06em', background: '#EEF0FE', color: '#3A44C4', borderRadius: 999, padding: '3px 8px', flexShrink: 0 }}>DISCOVERY</span> : null}
                {co.blueprintId ? <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.06em', background: '#DFFCE6', color: '#064E2E', borderRadius: 999, padding: '3px 8px', flexShrink: 0 }}>BLUEPRINT</span> : null}
                {(co.leadContact || (co.contacts || []).length) ? (
                  <button type="button" style={{ ...S.btnGhost, flexShrink: 0 }} onClick={() => invite(co)}>Invite</button>
                ) : null}
                <a href={'/admin/company/' + co.id} onClick={navClick('/admin/company/' + co.id)} style={{ ...S.btnGhost, flexShrink: 0, textDecoration: 'none' }}>View</a>
                {me.canDelete && (
                  <button type="button" aria-label={'Delete ' + co.name} onClick={() => remove(co)}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, border: `1px solid ${T.line}`, background: 'transparent', color: '#B3261E', cursor: 'pointer', flexShrink: 0 }}><IconTrash/></button>
                )}
              </div>
            ))}
          </div>
        )}
        {adding && <AddCompanyModal onClose={() => setAdding(false)} onSaved={(co) => { setAdding(false); if (co) navigate('/admin/company/' + co.id); else load(); }}/>}
      </Page>
    );
  }

  // Import step: pick the company in Attio, contacts load automatically,
  // fill in what Attio doesn't know. Files are added on the edit screen
  // that opens right after saving.
  function AddCompanyModal({ onClose, onSaved }) {
    const [company, setCompany] = useState(null);
    const [form, setForm] = useState({ storeUrl: '', address: '', description: '', platform: '', erp: '' });
    const [contacts, setContacts] = useState([]);
    const [contactsState, setContactsState] = useState('idle');
    const [logo, setLogo] = useState(null);
    const [prime, setPrime] = useState('#2F7A47');
    const [accent, setAccent] = useState('#B8741F');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
    const readFile = (file, cb) => {
      const r = new FileReader();
      r.onload = () => { const b64 = (r.result || '').toString().split(',')[1] || ''; cb(b64, r.result); };
      r.readAsDataURL(file);
    };
    const LOGO_TYPES = { 'image/png': 1, 'image/jpeg': 1, 'image/svg+xml': 1 };
    const onLogoFile = (file) => {
      if (!file) return;
      const type = file.type === 'image/jpg' ? 'image/jpeg' : file.type;
      if (!LOGO_TYPES[type]) { setError('Logo must be an SVG, PNG, or JPG'); return; }
      if (file.size > 1_400_000) { setError('Logo must be under 1.4 MB'); return; }
      readFile(file, (b64, dataUrl) => { setLogo({ type, data: b64, name: file.name, preview: dataUrl }); setError(''); });
    };

    const pickCompany = (c) => {
      setCompany(c);
      setForm((f) => ({ ...f, storeUrl: c.domain || '', address: c.address || '' }));
      setContacts([]);
      setContactsState('loading');
      api('/api/admin/attio/company-people?companyId=' + encodeURIComponent(c.attioId))
        .then((d) => {
          setContacts((d.people || []).map((p, i) => ({ ...p, role: i === 0 ? 'lead' : 'associated' })));
          setContactsState('done');
        })
        .catch((err) => { setContactsState('error'); setError(err.message); });
    };
    const setRole = (email, role) => setContacts((list) => list.map((c) =>
      c.email === email ? { ...c, role } : (role === 'lead' && c.role === 'lead' ? { ...c, role: 'associated' } : c)
    ));
    const removeContact = (email) => setContacts((list) => list.filter((c) => c.email !== email));

    const save = async (e) => {
      e.preventDefault();
      if (!company) { setError('Pick a company from Attio'); return; }
      const lead = contacts.find((c) => c.role === 'lead') || null;
      setBusy(true); setError('');
      try {
        const d = await api('/api/admin/companies', {
          method: 'POST',
          body: JSON.stringify({
            name: company.name, attioCompanyId: company.attioId,
            storeUrl: form.storeUrl.trim(), address: form.address.trim(),
            description: form.description.trim(), platform: form.platform.trim(), erp: form.erp.trim(),
            leadContact: lead,
            contacts: contacts.filter((c) => c.role !== 'lead'),
            palette: { prime, accent },
            logo: logo ? { type: logo.type, data: logo.data } : null,
          }),
        });
        onSaved(d.company || null);
      } catch (err) { setError(err.message); setBusy(false); }
    };

    return (
      <Modal title="Add company" sub="Pull the info from Attio CRM" onClose={onClose}>
        <form onSubmit={save} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CompanyPicker company={company} onPick={pickCompany} onClear={() => { setCompany(null); setContacts([]); setContactsState('idle'); }}/>
          {company && (
            <>
              <Field label="Store URL" value={form.storeUrl} onChange={set('storeUrl')} placeholder="acme.com"/>
              <Field label="Address" value={form.address} onChange={set('address')} placeholder="100 Main St, Chicago, IL"/>
              <div>
                <label style={S.label}>Description</label>
                <textarea value={form.description} onChange={(e) => set('description')(e.target.value)} rows={3} placeholder="What they make or distribute, who buys it…"
                  style={{ ...S.input, resize: 'vertical', lineHeight: 1.5 }}/>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}><Field label="Current platform" value={form.platform} onChange={set('platform')} placeholder="e.g. Magento Open Source"/></div>
                <div style={{ flex: 1 }}><Field label="Current ERP" value={form.erp} onChange={set('erp')} placeholder="e.g. Sage X3"/></div>
              </div>
              <ContactsEditor contacts={contacts} state={contactsState} onRole={setRole} onRemove={removeContact} onAdd={(c) => setContacts((l) => l.some((x) => x.email === c.email) ? l : [...l, c])}/>
              <div>
                <label style={S.label}>Company logo</label>
                {logo ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: T.cream, border: `1px solid ${T.line}`, borderRadius: 8 }}>
                    <img src={logo.preview} alt="" style={{ height: 34, maxWidth: 140, objectFit: 'contain', display: 'block' }}/>
                    <span style={{ flex: 1, fontFamily: T.mono, fontSize: 11, color: T.fg3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{logo.name}</span>
                    <button type="button" aria-label="Remove logo" onClick={() => setLogo(null)}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 999, border: 'none', background: T.line, color: T.fg1, cursor: 'pointer', fontSize: 11, lineHeight: 1, padding: 0, flexShrink: 0 }}>✕</button>
                  </div>
                ) : (
                  <input type="file" accept=".svg,.png,.jpg,.jpeg,image/svg+xml,image/png,image/jpeg"
                    onChange={(e) => onLogoFile(e.target.files && e.target.files[0])}
                    style={{ ...S.input, padding: '10px 12px', fontSize: 13, cursor: 'pointer' }}/>
                )}
              </div>
              <div>
                <label style={S.label}>Color palette</label>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[['Prime', prime, setPrime], ['Accent', accent, setAccent]].map(([l, v, setC]) => (
                    <label key={l} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: T.cream, border: `1px solid ${T.line}`, borderRadius: 8, cursor: 'pointer' }}>
                      <input type="color" value={v} onChange={(e) => setC(e.target.value)}
                        style={{ width: 34, height: 34, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}/>
                      <span style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 13, color: T.fg1 }}>{l}</span>
                      <span style={{ marginLeft: 'auto', fontFamily: T.mono, fontSize: 11, color: T.fg3 }}>{v.toUpperCase()}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
          {error && <div style={{ color: '#B3261E', fontFamily: T.sans, fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" style={S.btnGhost} onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" style={{ ...S.btnLime, opacity: busy ? 0.7 : 1 }} disabled={busy}>{busy ? 'Saving…' : 'Add company'}</button>
          </div>
        </form>
      </Modal>
    );
  }

  // Shared contact rows: role select + remove, plus a manual add row for
  // people who are not in Attio.
  function ContactsEditor({ contacts, state, onRole, onRemove, onAdd }) {
    const [draft, setDraft] = useState({ name: '', email: '', title: '' });
    const add = () => {
      const email = draft.email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
      onAdd({ name: draft.name.trim(), email, title: draft.title.trim(), role: contacts.some((c) => c.role === 'lead') ? 'associated' : 'lead' });
      setDraft({ name: '', email: '', title: '' });
    };
    return (
      <div>
        <label style={S.label}>Contacts · they sign in to the Hub with these emails</label>
        {state === 'loading' && <div style={{ fontFamily: T.sans, fontSize: 13, color: T.fg3, padding: '8px 2px' }}>Loading contacts from Attio…</div>}
        {state === 'error' && <div style={{ fontFamily: T.sans, fontSize: 13, color: '#B3261E', padding: '8px 2px' }}>Couldn&#39;t load contacts from Attio. Add them below.</div>}
        {contacts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
            {contacts.map((c) => (
              <div key={c.email} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: T.cream, border: `1px solid ${c.role === 'lead' ? T.black : T.line}`, borderRadius: 8 }}>
                <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                  <div style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 13.5, color: T.fg1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name || c.email}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fg3, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email}{c.title ? ' · ' + c.title : ''}</div>
                </div>
                <select value={c.role} onChange={(e) => onRole(c.email, e.target.value)} aria-label={'Role for ' + (c.name || c.email)}
                  style={{ ...S.input, width: 'auto', flexShrink: 0, padding: '8px 10px', fontSize: 13, cursor: 'pointer' }}>
                  <option value="lead">Lead contact</option>
                  <option value="associated">Associated contact</option>
                </select>
                <button type="button" aria-label={'Remove ' + (c.name || c.email)} onClick={() => onRemove(c.email)}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 999, border: 'none', background: T.line, color: T.fg1, cursor: 'pointer', fontSize: 11, lineHeight: 1, padding: 0, flexShrink: 0 }}>✕</button>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Name" style={{ ...S.input, flex: 1.1, padding: '9px 10px', fontSize: 13 }}/>
          <input value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} placeholder="email@company.com" style={{ ...S.input, flex: 1.4, padding: '9px 10px', fontSize: 13 }}/>
          <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="Title" style={{ ...S.input, flex: 1, padding: '9px 10px', fontSize: 13 }}/>
          <button type="button" style={{ ...S.btnGhost, flexShrink: 0 }} onClick={add}>Add</button>
        </div>
      </div>
    );
  }

  // Full profile editor: every field is overridable, and this is where the
  // company's files live.
  // Full-page company profile (opened from the Companies list "View"
  // button). Loads the record, then renders the editable profile.
  function CompanyProfile({ id }) {
    const [initial, setInitial] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => {
      let dead = false;
      api('/api/admin/companies')
        .then((d) => { if (dead) return; const co = (d.companies || []).find((c) => c.id === id); if (co) setInitial(co); else setError('Company not found.'); })
        .catch((e) => { if (!dead) setError(e.message); });
      return () => { dead = true; };
    }, [id]);
    if (error) return (
      <Page>
        <PageHead eyebrow="Hub" title="Company" action={<a href="/admin/companies" onClick={navClick('/admin/companies')} style={{ ...S.btnGhost, textDecoration: 'none' }}>← Companies</a>}/>
        <div style={{ ...S.card, padding: 40, textAlign: 'center', color: '#B3261E', fontFamily: T.sans, fontSize: 14 }}>{error}</div>
      </Page>
    );
    if (!initial) return <Page><div style={{ ...S.card, padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>Loading…</div></Page>;
    return <CompanyEditor key={initial.id} initial={initial}/>;
  }

  function CompanyEditor({ initial }) {
    const [co, setCo] = useState(initial);
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({
      name: initial.name || '', storeUrl: initial.storeUrl || '', address: initial.address || '',
      description: initial.description || '', platform: initial.platform || '', erp: initial.erp || '',
      discoveryHandle: initial.discoveryHandle || '', blueprintId: initial.blueprintId || '',
    });
    const [contacts, setContacts] = useState(() => {
      const list = [];
      if (initial.leadContact) list.push({ ...initial.leadContact, role: 'lead' });
      for (const c of initial.contacts || []) list.push({ ...c, role: 'associated' });
      return list;
    });
    const [logoAction, setLogoAction] = useState(null); // null | {type,data,preview} | 'remove'
    const [inviteMsg, setInviteMsg] = useState('');
    const [inviting, setInviting] = useState('');
    const [prime, setPrime] = useState((initial.palette && initial.palette.prime) || '#2F7A47');
    const [accent, setAccent] = useState((initial.palette && initial.palette.accent) || '#B8741F');
    const [busy, setBusy] = useState(false);
    const [fileBusy, setFileBusy] = useState('');
    const [error, setError] = useState('');

    const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
    const readFile = (file, cb) => {
      const r = new FileReader();
      r.onload = () => { const b64 = (r.result || '').toString().split(',')[1] || ''; cb(b64, r.result); };
      r.readAsDataURL(file);
    };
    const LOGO_TYPES = { 'image/png': 1, 'image/jpeg': 1, 'image/svg+xml': 1 };
    const onLogoFile = (file) => {
      if (!file) return;
      const type = file.type === 'image/jpg' ? 'image/jpeg' : file.type;
      if (!LOGO_TYPES[type]) { setError('Logo must be an SVG, PNG, or JPG'); return; }
      if (file.size > 1_400_000) { setError('Logo must be under 1.4 MB'); return; }
      readFile(file, (b64, dataUrl) => { setLogoAction({ type, data: b64, preview: dataUrl }); setError(''); });
    };
    const setRole = (email, role) => setContacts((list) => list.map((c) =>
      c.email === email ? { ...c, role } : (role === 'lead' && c.role === 'lead' ? { ...c, role: 'associated' } : c)
    ));

    const uploadFile = (kind) => (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!file) return;
      if (file.size > 10_000_000) { setError('Files must be under 10 MB'); return; }
      setFileBusy(kind); setError('');
      readFile(file, async (b64) => {
        try {
          const d = await api('/api/admin/company/file', {
            method: 'POST',
            body: JSON.stringify({ id: co.id, kind, name: file.name, type: file.type, data: b64 }),
          });
          setCo(d.company);
        } catch (err) { setError(err.message); }
        setFileBusy('');
      });
    };
    const deleteFile = async (fid) => {
      try {
        const d = await api('/api/admin/company/file-delete', { method: 'POST', body: JSON.stringify({ id: co.id, fid }) });
        setCo(d.company);
      } catch (err) { setError(err.message); }
    };

    const save = async (e) => {
      e.preventDefault();
      const lead = contacts.find((c) => c.role === 'lead') || null;
      setBusy(true); setError(''); setSaved(false);
      try {
        const d = await api('/api/admin/company/update', {
          method: 'POST',
          body: JSON.stringify({
            id: co.id,
            name: form.name.trim(), storeUrl: form.storeUrl.trim(), address: form.address.trim(),
            description: form.description.trim(), platform: form.platform.trim(), erp: form.erp.trim(),
            attioCompanyId: co.attioCompanyId || '',
            leadContact: lead,
            contacts: contacts.filter((c) => c.role !== 'lead'),
            palette: { prime, accent },
            logo: logoAction && logoAction !== 'remove' ? { type: logoAction.type, data: logoAction.data } : null,
            removeLogo: logoAction === 'remove',
            discoveryHandle: form.discoveryHandle.trim(), blueprintId: form.blueprintId.trim(),
          }),
        });
        if (d.company) setCo(d.company);
        setLogoAction(null);
        setSaved(true);
        setBusy(false);
        setTimeout(() => setSaved(false), 2600);
      } catch (err) { setError(err.message); setBusy(false); }
    };

    const fileRow = (f) => (
      <div key={f.fid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: T.cream, border: `1px solid ${T.line}`, borderRadius: 8 }}>
        <a href={'/api/admin/company/file?id=' + encodeURIComponent(co.id) + '&fid=' + encodeURIComponent(f.fid)}
          style={{ flex: '1 1 auto', minWidth: 0, fontFamily: T.mono, fontSize: 11.5, color: T.fg1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: 'none' }}>{f.name} ↓</a>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.fg3, flexShrink: 0 }}>{f.size ? Math.max(1, Math.round(f.size / 1024)) + ' KB' : ''}</span>
        <button type="button" aria-label={'Delete ' + f.name} onClick={() => deleteFile(f.fid)}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 999, border: 'none', background: T.line, color: T.fg1, cursor: 'pointer', fontSize: 11, lineHeight: 1, padding: 0, flexShrink: 0 }}>✕</button>
      </div>
    );

    const portalUrl = '/' + co.id + '/company';
    const invites = co.invites || {};
    const inviteList = [contacts.find((c) => c.role === 'lead'), ...contacts.filter((c) => c.role !== 'lead')].filter(Boolean);
    const doInvite = async (emails) => {
      setInviting(emails ? emails[0] : 'all'); setInviteMsg('');
      try {
        const d = await inviteToPortal(co.id, emails);
        setCo((c) => ({ ...c, invites: d.invites || c.invites }));
        setInviteMsg(inviteSummary(d.results));
      } catch (err) { setInviteMsg(err.message); }
      setInviting('');
    };
    return (
      <Page>
        <PageHead eyebrow="Portal · company profile" title={co.name || 'Company'} action={
          <div style={{ display: 'flex', gap: 8 }}>
            {inviteList.length ? <button type="button" style={S.btnGhost} disabled={!!inviting} onClick={() => doInvite()}>{inviting === 'all' ? 'Sending…' : 'Invite all'}</button> : null}
            <a href={portalUrl} target="_blank" rel="noreferrer" style={{ ...S.btnGhost, textDecoration: 'none' }}>Open Hub ↗</a>
            <a href="/admin/companies" onClick={navClick('/admin/companies')} style={{ ...S.btnGhost, textDecoration: 'none' }}>← Companies</a>
          </div>
        }/>
        <div style={{ ...S.card, padding: 4 }}>
        <form onSubmit={save} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontFamily: T.sans, fontSize: 13, color: T.fg3, marginBottom: 2 }}>Everything here feeds the customer portal and new discoveries.</div>
          <Field label="Company name" value={form.name} onChange={set('name')}/>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}><Field label="Store URL" value={form.storeUrl} onChange={set('storeUrl')} placeholder="acme.com"/></div>
            <div style={{ flex: 1 }}><Field label="Address" value={form.address} onChange={set('address')} placeholder="100 Main St, Chicago, IL"/></div>
          </div>
          <div>
            <label style={S.label}>Description</label>
            <textarea value={form.description} onChange={(e) => set('description')(e.target.value)} rows={3}
              style={{ ...S.input, resize: 'vertical', lineHeight: 1.5 }}/>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}><Field label="Current platform" value={form.platform} onChange={set('platform')} placeholder="e.g. Magento Open Source"/></div>
            <div style={{ flex: 1 }}><Field label="Current ERP" value={form.erp} onChange={set('erp')} placeholder="e.g. Sage X3"/></div>
          </div>
          <ContactsEditor contacts={contacts} state="done" onRole={setRole}
            onRemove={(email) => setContacts((l) => l.filter((c) => c.email !== email))}
            onAdd={(c) => setContacts((l) => l.some((x) => x.email === c.email) ? l : [...l, c])}/>
          {inviteList.length ? (
            <div>
              <label style={S.label}>Invite to Hub · sends the Hub link; the address must be a verified Cloudflare destination</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {inviteList.map((c) => {
                  const inv = invites[c.email.toLowerCase()];
                  return (
                    <div key={c.email} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: T.cream, border: `1px solid ${T.line}`, borderRadius: 8 }}>
                      <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                        <div style={{ fontFamily: T.sans, fontWeight: 650, fontSize: 13.5, color: T.fg1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name || c.email}</div>
                        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fg3, marginTop: 2 }}>{c.email}{inv ? ' · invited ' + fmtWhen(inv.at) : ''}</div>
                      </div>
                      <button type="button" style={{ ...S.btnGhost, flexShrink: 0 }} disabled={!!inviting} onClick={() => doInvite([c.email])}>{inviting === c.email ? 'Sending…' : inv ? 'Resend' : 'Invite'}</button>
                    </div>
                  );
                })}
              </div>
              {inviteMsg ? <div style={{ fontFamily: T.sans, fontSize: 12.5, color: T.fg2, marginTop: 8, whiteSpace: 'pre-wrap' }}>{inviteMsg}</div> : null}
            </div>
          ) : null}
          <div>
            <label style={S.label}>Company logo</label>
            {logoAction && logoAction !== 'remove' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: T.cream, border: `1px solid ${T.line}`, borderRadius: 8 }}>
                <img src={logoAction.preview} alt="" style={{ height: 34, maxWidth: 140, objectFit: 'contain', display: 'block' }}/>
                <span style={{ flex: 1, fontFamily: T.mono, fontSize: 11, color: T.fg3 }}>New logo (saved on Save)</span>
                <button type="button" onClick={() => setLogoAction(null)} style={{ ...S.btnGhost, padding: '6px 10px' }}>Undo</button>
              </div>
            ) : co.hasLogo && logoAction !== 'remove' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: T.cream, border: `1px solid ${T.line}`, borderRadius: 8 }}>
                <img src={'/api/company/logo?id=' + encodeURIComponent(co.id) + '&t=' + encodeURIComponent(co.updatedAt || '')} alt="" style={{ height: 34, maxWidth: 140, objectFit: 'contain', display: 'block' }}/>
                <span style={{ flex: 1 }}></span>
                <label style={{ ...S.btnGhost, padding: '6px 10px', cursor: 'pointer' }}>Replace<input type="file" accept=".svg,.png,.jpg,.jpeg" style={{ display: 'none' }} onChange={(e) => onLogoFile(e.target.files && e.target.files[0])}/></label>
                <button type="button" onClick={() => setLogoAction('remove')} style={{ ...S.btnGhost, padding: '6px 10px', color: '#B3261E' }}>Remove</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {logoAction === 'remove' ? <span style={{ fontFamily: T.sans, fontSize: 13, color: T.fg3 }}>Logo will be removed.</span> : null}
                <input type="file" accept=".svg,.png,.jpg,.jpeg,image/svg+xml,image/png,image/jpeg"
                  onChange={(e) => onLogoFile(e.target.files && e.target.files[0])}
                  style={{ ...S.input, padding: '10px 12px', fontSize: 13, cursor: 'pointer' }}/>
              </div>
            )}
          </div>
          <div>
            <label style={S.label}>Color palette</label>
            <div style={{ display: 'flex', gap: 16 }}>
              {[['Prime', prime, setPrime], ['Accent', accent, setAccent]].map(([l, v, setC]) => (
                <label key={l} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: T.cream, border: `1px solid ${T.line}`, borderRadius: 8, cursor: 'pointer' }}>
                  <input type="color" value={v} onChange={(e) => setC(e.target.value)}
                    style={{ width: 34, height: 34, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}/>
                  <span style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 13, color: T.fg1 }}>{l}</span>
                  <span style={{ marginLeft: 'auto', fontFamily: T.mono, fontSize: 11, color: T.fg3 }}>{v.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>
          {CO_FILE_KINDS.map(([kind, label]) => {
            const files = (co.files || []).filter((f) => f.kind === kind);
            const single = kind !== 'doc';
            return (
              <div key={kind}>
                <label style={S.label}>{label}{single ? ' · one file, a new upload replaces it' : ''}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {files.map(fileRow)}
                  {(!single || files.length === 0 || true) && (
                    <label style={{ ...S.input, padding: '10px 12px', fontSize: 13, cursor: 'pointer', color: T.fg3 }}>
                      {fileBusy === kind ? 'Uploading…' : (single && files.length ? 'Replace ' + label.toLowerCase() + '…' : 'Upload ' + (single ? label.toLowerCase() : 'a document') + '…')}
                      <input type="file" style={{ display: 'none' }} disabled={!!fileBusy} onChange={uploadFile(kind)}/>
                    </label>
                  )}
                </div>
              </div>
            );
          })}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}><Field label="Discovery handle · powers the portal Discovery tab" value={form.discoveryHandle} onChange={set('discoveryHandle')} placeholder="e.g. cartoncraft"/></div>
            <div style={{ flex: 1 }}><Field label="Blueprint ID · powers the portal Blueprint tab" value={form.blueprintId} onChange={set('blueprintId')} placeholder="e.g. cartoncraftsupply"/></div>
          </div>
          {error && <div style={{ color: '#B3261E', fontFamily: T.sans, fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'flex-end', paddingTop: 4 }}>
            {saved && <span style={{ marginRight: 'auto', fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: '#2F7A47' }}>Saved ✓</span>}
            <a href="/admin/companies" onClick={navClick('/admin/companies')} style={{ ...S.btnGhost, textDecoration: 'none' }}>Back</a>
            <button type="submit" style={{ ...S.btn, opacity: busy ? 0.7 : 1 }} disabled={busy}>{busy ? 'Saving…' : 'Save company'}</button>
          </div>
        </form>
        </div>
      </Page>
    );
  }

  // ── Blueprint content editor (templated proposals) ───────────────────
  // Full-page editor for a draft blueprint's structured content. Loads via
  // /api/blueprint/content (admins see any status), generates from the linked
  // discovery, edits every section, previews framed, and marks ready.
  const EMPTY_CONTENT = {
    status: 'draft', headline: '', subhead: '', summary: '',
    objectives: [], scope: [],
    investment: { total: '', note: '', installments: [] },
    timeline: { weeks: '', note: '', phases: [] },
    team: [],
  };

  function BlueprintEditor({ id }) {
    const [name, setName] = useState('');
    const [content, setContent] = useState(null); // null = loading
    const [error, setError] = useState('');
    const [busy, setBusy] = useState('');
    const [saved, setSaved] = useState(false);

    const load = async () => {
      try {
        const d = await api('/api/blueprint/content?id=' + encodeURIComponent(id));
        setName(d.name || id);
        setContent(d.content ? { ...EMPTY_CONTENT, ...d.content } : { ...EMPTY_CONTENT });
      } catch (err) {
        if (err.status === 404) { setName(id); setContent({ ...EMPTY_CONTENT }); }
        else { setError(err.message); setContent({ ...EMPTY_CONTENT }); }
      }
    };
    useEffect(() => { load(); }, [id]);

    const set = (patch) => setContent((c) => ({ ...c, ...patch }));
    const setIn = (key, patch) => setContent((c) => ({ ...c, [key]: { ...c[key], ...patch } }));

    const save = async (nextStatus) => {
      const body = nextStatus ? { ...content, status: nextStatus } : content;
      setBusy('save'); setError(''); setSaved(false);
      try {
        const d = await api('/api/admin/blueprint/content', { method: 'POST', body: JSON.stringify({ id, content: body }) });
        setContent({ ...EMPTY_CONTENT, ...d.content });
        setSaved(true); setTimeout(() => setSaved(false), 2400);
      } catch (err) { setError(err.message); }
      setBusy('');
    };
    const generate = async () => {
      if (content && (content.headline || content.summary) && !window.confirm('Regenerate from the discovery? This replaces the current content.')) return;
      setBusy('gen'); setError('');
      try {
        const d = await api('/api/admin/blueprint/generate', { method: 'POST', body: JSON.stringify({ id }) });
        setContent({ ...EMPTY_CONTENT, ...d.content });
      } catch (err) { setError(err.message); }
      setBusy('');
    };
    const preview = () => window.dispatchEvent(new CustomEvent('bp:preview', { detail: { url: '/blueprint/' + id + '/', title: name + ' (preview)' } }));

    if (content === null) return <Page><div style={{ ...S.card, padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>Loading…</div></Page>;
    const isReady = content.status === 'ready';

    return (
      <Page>
        <PageHead eyebrow="Blueprint · content" title={name} action={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" style={S.btnGhost} disabled={!!busy} onClick={generate}>{busy === 'gen' ? 'Generating…' : '✨ Generate from discovery'}</button>
            <button type="button" style={S.btnGhost} onClick={preview}>Preview</button>
            <a href="/admin/blueprints" onClick={navClick('/admin/blueprints')} style={{ ...S.btnGhost, textDecoration: 'none' }}>← Blueprints</a>
          </div>
        }/>

        <div style={{ ...S.card, padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: isReady ? '#DFFCE6' : '#FDECC8', borderRadius: 8 }}>
            <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: isReady ? '#064E2E' : '#6A4E00' }}>{isReady ? 'READY · VISIBLE TO THE CLIENT' : 'DRAFT · HIDDEN FROM THE CLIENT'}</span>
            <button type="button" style={{ ...(isReady ? S.btnGhost : S.btn), marginLeft: 'auto', padding: '9px 16px', fontSize: 13 }} disabled={!!busy} onClick={() => save(isReady ? 'draft' : 'ready')}>
              {isReady ? 'Unpublish' : 'Save & mark ready'}
            </button>
          </div>

          <Field label="Headline" value={content.headline} onChange={(v) => set({ headline: v })}/>
          <Field label="Subhead" value={content.subhead} onChange={(v) => set({ subhead: v })}/>
          <div><label style={S.label}>Summary</label>
            <textarea value={content.summary} onChange={(e) => set({ summary: e.target.value })} rows={3} style={{ ...S.input, resize: 'vertical', lineHeight: 1.5 }}/></div>

          <ListEditor label="Objectives" items={content.objectives} onChange={(v) => set({ objectives: v })}
            fields={[['title', 'Title'], ['body', 'One sentence']]} blank={{ title: '', body: '' }}/>
          <ListEditor label="Scope" items={content.scope} onChange={(v) => set({ scope: v })}
            fields={[['title', 'Workstream'], ['body', 'One sentence']]} blank={{ title: '', body: '' }}/>

          <div>
            <label style={S.label}>Investment</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}><Field label="Total" value={content.investment.total} onChange={(v) => setIn('investment', { total: v })} placeholder="$50,000"/></div>
              <div style={{ flex: 2 }}><Field label="Note" value={content.investment.note} onChange={(v) => setIn('investment', { note: v })}/></div>
            </div>
            <div style={{ marginTop: 8 }}>
              <ListEditor label="Installments" items={content.investment.installments} onChange={(v) => setIn('investment', { installments: v })}
                fields={[['label', 'Label'], ['amount', 'Amount']]} blank={{ label: '', amount: '' }} compact/>
            </div>
          </div>

          <div>
            <label style={S.label}>Timeline</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}><Field label="Total" value={content.timeline.weeks} onChange={(v) => setIn('timeline', { weeks: v })} placeholder="16 weeks"/></div>
              <div style={{ flex: 2 }}><Field label="Note" value={content.timeline.note} onChange={(v) => setIn('timeline', { note: v })}/></div>
            </div>
            <div style={{ marginTop: 8 }}>
              <ListEditor label="Phases" items={content.timeline.phases} onChange={(v) => setIn('timeline', { phases: v })}
                fields={[['name', 'Phase'], ['weeks', 'Weeks'], ['detail', 'Detail']]} blank={{ name: '', weeks: '', detail: '' }}/>
            </div>
          </div>

          <ListEditor label="Team" items={content.team} onChange={(v) => set({ team: v })}
            fields={[['name', 'Name'], ['role', 'Role']]} blank={{ name: '', role: '' }}/>

          {error && <div style={{ color: '#B3261E', fontFamily: T.sans, fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'flex-end', borderTop: `1px solid ${T.line}`, paddingTop: 16 }}>
            {saved && <span style={{ marginRight: 'auto', fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: '#2F7A47' }}>Saved ✓</span>}
            <button type="button" style={{ ...S.btn, opacity: busy ? 0.7 : 1 }} disabled={!!busy} onClick={() => save()}>{busy === 'save' ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </Page>
    );
  }

  // Add/edit/remove rows of a small fixed-field object array.
  function ListEditor({ label, items, onChange, fields, blank, compact }) {
    const rows = Array.isArray(items) ? items : [];
    const upd = (i, k, v) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
    const inp = { ...S.input, padding: '9px 11px', fontSize: 13.5 };
    return (
      <div>
        <label style={S.label}>{label}</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              {fields.map(([k, ph]) => (
                k === 'body' || k === 'detail'
                  ? <textarea key={k} value={r[k] || ''} onChange={(e) => upd(i, k, e.target.value)} placeholder={ph} rows={2} style={{ ...inp, flex: 2, resize: 'vertical', lineHeight: 1.45 }}/>
                  : <input key={k} value={r[k] || ''} onChange={(e) => upd(i, k, e.target.value)} placeholder={ph} style={{ ...inp, flex: k === 'title' || k === 'name' ? 1.3 : 1 }}/>
              ))}
              <button type="button" aria-label="Remove" onClick={() => onChange(rows.filter((_, j) => j !== i))}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 6, border: `1px solid ${T.line}`, background: 'transparent', color: T.fg3, cursor: 'pointer', flexShrink: 0, fontSize: 13 }}>✕</button>
            </div>
          ))}
          <button type="button" style={{ ...S.btnGhost, alignSelf: 'flex-start' }} onClick={() => onChange([...rows, { ...blank }])}>+ Add {compact ? '' : label.toLowerCase().replace(/s$/, '')}</button>
        </div>
      </div>
    );
  }

  // ── Blueprints ───────────────────────────────────────────────────────
  const BP_PAGE_SIZE = 10;
  const BP_CHANNELS = ['Partner', 'Inbound', 'Outbound', 'Referral', 'Events'];

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

  function Blueprints({ me }) {
    const isMobile = useIsMobile();
    const canReopen = !!(me && (me.email || '').toLowerCase() === 'denis@uncap.com');
    const [rows, setRows] = useState(null);
    const [showNew, setShowNew] = useState(() => new URLSearchParams(window.location.search).get('new') === '1');
    const [activityBp, setActivityBp] = useState(null); // {id, name}
    const [editExpiryBp, setEditExpiryBp] = useState(null);
    const [tosBp, setTosBp] = useState(null);           // {id, name} of the row with TOS editor open
    const [printFor, setPrintFor] = useState(null);     // id of row with open print menu
    const [menuPos, setMenuPos] = useState(null);        // viewport position for the open print menu
    const printBtnRefs = useRef({});                     // bp.id -> button DOM node
    const [copied, setCopied] = useState('');
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [channelFilter, setChannelFilter] = useState('all');
    const [page, setPage] = useState(1);

    const load = useCallback(async () => {
      try { setRows(sortBlueprintsNewestFirst((await api('/api/admin/blueprints')).blueprints)); }
      catch (err) { setError(err.message); setRows([]); }
    }, []);
    useEffect(() => { load(); }, [load]);

    useEffect(() => { setPage(1); }, [search, statusFilter, channelFilter]);

    // Channel is set when the blueprint is created; the list just shows it.
    const channelCell = (bp) => (
      bp.channel
        ? <span style={{ fontFamily: T.sans, fontSize: 13, color: T.fg1 }}>{bp.channel}</span>
        : <span style={{ color: T.fg3 }}>—</span>
    );

    // The print menu is rendered in a portal (see below) so it isn't
    // clipped by the card's overflow:hidden, which is what keeps the
    // table's corners rounded instead of squared-off. Its position is
    // computed from the trigger button's own bounding box.
    useEffect(() => {
      if (!printFor) { setMenuPos(null); return; }
      const btn = printBtnRefs.current[printFor];
      if (!btn) { setMenuPos(null); return; }
      const rect = btn.getBoundingClientRect();
      setMenuPos(
        isMobile
          ? { top: rect.bottom + 6, left: rect.left }
          : { top: rect.bottom + 6, right: window.innerWidth - rect.right }
      );
      const close = () => setPrintFor(null);
      setTimeout(() => document.addEventListener('click', close), 0);
      const reposition = () => setPrintFor(null);
      window.addEventListener('scroll', reposition, true);
      window.addEventListener('resize', reposition);
      return () => {
        document.removeEventListener('click', close);
        window.removeEventListener('scroll', reposition, true);
        window.removeEventListener('resize', reposition);
      };
    }, [printFor, isMobile]);

    // New company-folder URLs. Share = the portal-framed page a client
    // opens; app = the raw proposal the admin previews / prints in a frame.
    const shareUrl = (bp) => `${window.location.origin}${bp.companyId ? '/' + bp.companyId + '/blueprint' : '/blueprint/' + bp.id + '/'}`;
    const appUrl = (bp) => bp.companyId ? '/' + bp.companyId + '/blueprint/app' : '/blueprint/' + bp.id + '/';
    const copyShare = async (bp) => {
      try { await navigator.clipboard.writeText(shareUrl(bp)); }
      catch (_) { window.prompt('Copy the client link:', shareUrl(bp)); }
      setCopied(bp.id);
      setTimeout(() => setCopied(''), 1600);
    };

    // One dropdown drives all three manual statuses. "Disabled" only sets
    // the disabled flag; "Signed"/"Open" also clear disabled so the new
    // status is actually visible (disabled otherwise takes display
    // precedence over everything else in statusChip/rowStatus).
    const setStatus = async (bp, next) => {
      const current = rowStatus(bp);
      if (next === current) return;
      if (next === 'disabled' && !window.confirm(`Disable "${bp.name}"?\n\nClients will no longer be able to open or sign in to this blueprint. The team keeps access, and you can re-enable it any time.`)) return;
      if (next === 'signed' && !window.confirm(`Mark "${bp.name}" as signed?\n\nUse this only when the client signed a physical/paper copy instead of the digital flow.`)) return;
      if (next === 'open' && current === 'signed' && !window.confirm(`Move "${bp.name}" back to Open?\n\nThis clears its recorded signature.`)) return;
      try {
        if (next === 'disabled') {
          await api('/api/admin/blueprint-meta', { method: 'POST', body: JSON.stringify({ blueprintId: bp.id, disabled: true }) });
        } else {
          if (bp.disabled) await api('/api/admin/blueprint-meta', { method: 'POST', body: JSON.stringify({ blueprintId: bp.id, disabled: false }) });
          if (next === 'signed') {
            await api('/api/admin/mark-signed', { method: 'POST', body: JSON.stringify({ blueprintId: bp.id, signed: true }) });
          } else if (bp.signature) {
            await api('/api/admin/mark-signed', { method: 'POST', body: JSON.stringify({ blueprintId: bp.id, signed: false }) });
          }
        }
        load();
      } catch (err) { setError(err.message); }
    };

    const statusChip = (bp) => {
      if (bp.disabled) return (
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: T.black, color: '#fff', border: `1px solid ${T.black}` }}>Disabled</span>
      );
      // A templated draft still hidden from the client is "Draft". Once marked
      // ready it behaves like a shipped blueprint below (Signed / Expired /
      // Live), so only the not-ready ones early-return here.
      if (bp.kind === 'draft' && bp.contentStatus !== 'ready') return (
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
      // Ready templated blueprint, live but not yet signed.
      if (bp.kind === 'draft') return (
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#DFFCE6', color: '#064E2E', border: '1px solid #9BDDB0' }}>Live</span>
      );
      return (
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#EEF0FE', color: '#3A44C4', border: '1px solid #C3C9F5' }}>Open</span>
      );
    };

    // Same precedence as statusChip, as a plain value for filtering.
    const rowStatus = (bp) => {
      if (bp.disabled) return 'disabled';
      if (bp.kind === 'draft' && bp.contentStatus !== 'ready') return 'draft';
      if (bp.signature) return 'signed';
      if (bp.expired) return 'expired';
      return 'open';
    };

    const filteredRows = useMemo(() => {
      if (!rows) return null;
      const q = search.trim().toLowerCase();
      return rows.filter((bp) => {
        if (statusFilter !== 'all' && rowStatus(bp) !== statusFilter) return false;
        if (channelFilter !== 'all' && (bp.channel || '') !== channelFilter) return false;
        if (q && !(bp.name || '').toLowerCase().includes(q)) return false;
        return true;
      });
    }, [rows, search, statusFilter, channelFilter]);

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
    const deleteBp = async (bp) => {
      if (!window.confirm(`Delete the "${bp.name}" blueprint draft?\n\nThis permanently removes the draft, its terms, signatures, and access log, and unlinks it from its company. There is no undo.`)) return;
      try {
        await api('/api/admin/blueprint/delete', { method: 'POST', body: JSON.stringify({ id: bp.id }) });
        load();
      } catch (err) { setError(err.message); }
    };

    const rowActions = (bp) => (
      <span style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
        <a href={appUrl(bp)} onClick={previewClick(appUrl(bp), bp.name || bp.id)} target="_blank" rel="noreferrer" title="Preview" aria-label="Preview"
          style={{ ...S.btnIcon, textDecoration: 'none' }}><IconEye/></a>
        <button type="button" title={copied === bp.id ? 'Copied ✓' : 'Share'} aria-label="Share" style={S.btnIcon} onClick={() => copyShare(bp)}>
          {copied === bp.id ? <IconCheck/> : <IconShare/>}
        </button>
        <button type="button" title="Activity" aria-label="Activity" style={S.btnIcon} onClick={() => setActivityBp(bp)}><IconActivity/></button>
        <select value={rowStatus(bp)} onChange={(e) => setStatus(bp, e.target.value)}
          disabled={!!bp.signature && !canReopen}
          title={bp.signature ? (canReopen ? 'Signed — you can still change it (clears the signature)' : 'Signed by the client — status is locked') : undefined}
          style={{ ...S.input, width: 'auto', padding: '6px 10px', fontSize: 12.5, cursor: (bp.signature && !canReopen) ? 'not-allowed' : 'pointer', opacity: (bp.signature && !canReopen) ? 0.6 : 1 }}>
          <option value="open">Open</option>
          <option value="signed">Signed</option>
          <option value="disabled">Disabled</option>
        </select>
        <button type="button" style={S.btnGhost} onClick={() => setTosBp(bp)}>TOS</button>
        <span style={{ position: 'relative' }}>
          <button type="button" ref={(el) => { printBtnRefs.current[bp.id] = el; }} style={S.btnGhost}
            onClick={(e) => { e.stopPropagation(); setPrintFor(printFor === bp.id ? null : bp.id); }}>Print ▾</button>
          {printFor === bp.id && menuPos && ReactDOM.createPortal(
            <span onClick={(e) => e.stopPropagation()} style={{
              position: 'fixed', top: menuPos.top, zIndex: 200, minWidth: 250,
              ...(menuPos.left != null ? { left: menuPos.left } : { right: menuPos.right }),
              background: T.black, borderRadius: 10, padding: 6,
              display: 'flex', flexDirection: 'column', gap: 2,
              boxShadow: '0 18px 40px -18px rgba(0,0,0,0.7)', textAlign: 'left',
            }}>
              {[['delivery', 'For Delivery Team', 'Whole document · no terms · no nav'],
                ['shopify', 'For Shopify Partner Program', 'Key sections + Master Services Agreement'],
                ['client', 'For the Client', 'Whole document + terms + signature audit trail']].map(([mode, l, sub]) => (
                <button key={mode} type="button"
                  onClick={() => { setPrintFor(null); window.open(appUrl(bp) + (appUrl(bp).includes('?') ? '&' : '?') + 'bpPrint=' + mode, '_blank'); }}
                  style={{ background: 'transparent', border: 'none', color: '#fff', textAlign: 'left', padding: '9px 11px', borderRadius: 6, cursor: 'pointer', fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {l}
                  <span style={{ fontSize: 9, letterSpacing: '0.02em', textTransform: 'none', opacity: 0.6, fontWeight: 500 }}>{sub}</span>
                </button>
              ))}
            </span>,
            document.body
          )}
        </span>
        {/* Templated blueprints (draft or live) keep a content editor + delete;
            shipped registry pages have neither. */}
        {bp.kind === 'draft' && (
          <a href={'/admin/blueprint/' + bp.id} onClick={navClick('/admin/blueprint/' + bp.id)} style={{ ...S.btnGhost, textDecoration: 'none' }}>Edit</a>
        )}
        {me.canDelete && bp.kind === 'draft' && (
          <button type="button" title="Delete blueprint" aria-label="Delete blueprint"
            style={{ ...S.btnIcon, color: '#B3261E', borderColor: '#F0A9A9' }} onClick={() => deleteBp(bp)}><IconTrash/></button>
        )}
      </span>
    );

    // Draft rows can't be previewed, shared, or signed yet: their one job is
    // to open the content editor, where the admin reviews and flips the
    // templated content draft -> ready (which makes it live to the client).
    // Without this the row rendered a dead "Generation - phase 2" label and
    // the publish flow was unreachable.
    const draftActions = (bp) => (
      <span style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
        <button type="button" title="Activity" aria-label="Activity" style={S.btnIcon} onClick={() => setActivityBp(bp)}><IconActivity/></button>
        <a href={'/admin/blueprint/' + bp.id} onClick={navClick('/admin/blueprint/' + bp.id)} style={{ ...S.btn, textDecoration: 'none' }}>
          {bp.contentStatus === 'ready' ? 'Edit' : 'Review & publish'}
        </a>
        {me.canDelete && (
          <button type="button" title="Delete draft" aria-label="Delete draft"
            style={{ ...S.btnIcon, color: '#B3261E', borderColor: '#F0A9A9' }} onClick={() => deleteBp(bp)}><IconTrash/></button>
        )}
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
          <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}
            style={{ ...S.input, width: 'auto', flex: '0 0 auto', padding: '9px 12px', fontSize: 14, cursor: 'pointer' }}>
            <option value="all">All channels</option>
            {BP_CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ ...S.card, overflow: 'hidden' }}>
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
                    <span style={S.eyebrow}>Channel</span>{channelCell(bp)}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={S.eyebrow}>Expires</span>{expiresCell(bp)}
                  </div>
                  <div style={{ marginTop: 11 }}>{bp.kind === 'live' || bp.contentStatus === 'ready' ? rowActions(bp) : draftActions(bp)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  <th style={S.th}>#</th><th style={S.th}>Blueprint</th><th style={S.th}>Status</th><th style={S.th}>Channel</th><th style={S.th}>Expires</th><th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
                </tr></thead>
                <tbody>
                  {pageRows.map((bp) => (
                    <tr key={bp.id}>
                      <td style={{ ...S.td, fontFamily: T.mono, fontSize: 12, color: T.fg3, whiteSpace: 'nowrap' }}>{bp.num || '—'}</td>
                      <td style={S.td}>
                        <div style={{ fontWeight: 700 }}>{bp.name}</div>
                        {bp.kind !== 'live' && (
                          <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fg3, marginTop: 3 }}>
                            {bp.website || 'template generation pending'}
                          </div>
                        )}
                      </td>
                      <td style={S.td}>{statusChip(bp)}</td>
                      <td style={S.td}>{channelCell(bp)}</td>
                      <td style={{ ...S.td, whiteSpace: 'nowrap' }}>{expiresCell(bp)}</td>
                      <td style={{ ...S.td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {bp.kind === 'live' || bp.contentStatus === 'ready' ? rowActions(bp) : draftActions(bp)}
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
        {tosBp && <TosModal bp={tosBp} onClose={() => setTosBp(null)}/>}
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

  // Simple plain-text override for a blueprint's Terms of Service. Empty
  // means "use the standard Master Services Agreement text" — this is
  // purely additive, so blueprints nobody has edited are unaffected.
  // Section-by-section TOS editor. Always shows the full current text —
  // this blueprint's own saved override if one exists, otherwise the
  // standard Master Services Agreement as a starting point — never a
  // blank box. Nothing changes on the live site until Save is clicked.
  function TosModal({ bp, onClose }) {
    const [sections, setSections] = useState([]);
    const [isDefault, setIsDefault] = useState(true);
    const [hasHardcodedTerms, setHasHardcodedTerms] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [openIndex, setOpenIndex] = useState(null);

    useEffect(() => {
      let dead = false;
      api('/api/admin/blueprint-tos?bp=' + encodeURIComponent(bp.id))
        .then((d) => {
          if (dead) return;
          setSections(d.sections || []);
          setIsDefault(!!d.isDefault);
          setHasHardcodedTerms(!!d.hasHardcodedTerms);
          setLoaded(true);
        })
        .catch((err) => { if (!dead) { setError(err.message); setLoaded(true); } });
      return () => { dead = true; };
    }, [bp.id]);

    const updateItemBody = (i, j, value) => {
      setSections((prev) => prev.map((s, idx) => (
        idx === i ? { ...s, items: s.items.map((it, jdx) => (jdx === j ? { ...it, body: value } : it)) } : s
      )));
    };

    const updateItemLabel = (i, j, value) => {
      setSections((prev) => prev.map((s, idx) => (
        idx === i ? { ...s, items: s.items.map((it, jdx) => (jdx === j ? { ...it, label: value } : it)) } : s
      )));
    };

    const updateSectionMeta = (i, field, value) => {
      setSections((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
    };

    const addItem = (i) => {
      setSections((prev) => prev.map((s, idx) => (
        idx === i ? { ...s, items: [...(s.items || []), { label: '', body: '' }] } : s
      )));
    };

    const deleteItem = (i, j) => {
      setSections((prev) => prev.map((s, idx) => (
        idx === i ? { ...s, items: s.items.filter((_, jdx) => jdx !== j) } : s
      )));
    };

    const addSection = () => {
      setSections((prev) => {
        setOpenIndex(prev.length);
        return [...prev, { num: String(prev.length + 1), title: 'New Section', items: [{ label: '', body: '' }] }];
      });
    };

    const deleteSection = (i) => {
      setSections((prev) => prev.filter((_, idx) => idx !== i));
      setOpenIndex((cur) => (cur === i ? null : cur));
    };

    const save = async () => {
      setBusy(true); setError('');
      try {
        await api('/api/admin/blueprint-tos', {
          method: 'POST',
          body: JSON.stringify({ blueprintId: bp.id, sections }),
        });
        onClose();
      } catch (err) { setError(err.message); setBusy(false); }
    };

    const revertToStandard = async () => {
      setBusy(true); setError('');
      try {
        await api('/api/admin/blueprint-tos', {
          method: 'POST',
          body: JSON.stringify({ blueprintId: bp.id, sections: [] }),
        });
        onClose();
      } catch (err) { setError(err.message); setBusy(false); }
    };

    const isTemplate = bp.id === 'anatomywarehouse';

    return (
      <Modal title={'Terms of Service · ' + bp.name}
        sub={isDefault ? 'Standard Master Services Agreement · click a section to edit it' : 'Custom terms saved for this blueprint · click a section to edit it'}
        onClose={onClose} width={760}>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isTemplate && (
            <div style={{ padding: '12px 14px', background: '#FFF6E0', border: '1px solid #E8C36A', borderRadius: 8, fontFamily: T.sans, fontSize: 13, color: '#6A4E00' }}>
              This blueprint is the master TOS template. Whatever's saved here is copied into every newly created blueprint going forward — existing blueprints are unaffected.
            </div>
          )}
          {hasHardcodedTerms && (
            <div style={{ padding: '12px 14px', background: '#FDE8E8', border: '1px solid #F0A9A9', borderRadius: 8, fontFamily: T.sans, fontSize: 13, color: '#8A1C1C' }}>
              This blueprint has custom legal terms built into its own page (different governing state, fees, liability language, etc.) that aren't reflected in the standard text below. Saving here will replace those with whatever's shown — check with engineering first.
            </div>
          )}
          {!loaded ? (
            <div style={{ padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>Loading…</div>
          ) : (
            <div style={{ maxHeight: '55vh', overflowY: 'auto', border: `1px solid ${T.line}`, borderRadius: 8 }}>
              {sections.map((s, i) => (
                <div key={i} style={{ borderBottom: i < sections.length - 1 ? `1px solid ${T.line}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'stretch' }}>
                    <button type="button" onClick={() => setOpenIndex(openIndex === i ? null : i)}
                      style={{
                        display: 'flex', flex: 1, minWidth: 0, justifyContent: 'space-between', alignItems: 'center',
                        padding: '11px 14px', background: openIndex === i ? T.cream : T.paper, border: 'none',
                        cursor: 'pointer', textAlign: 'left', fontFamily: T.sans, fontSize: 13.5, fontWeight: 600, color: T.fg1,
                      }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>§{s.num} {s.title}</span>
                      <span style={{ fontFamily: T.mono, fontSize: 13, color: T.fg3, flexShrink: 0, marginLeft: 10 }}>{openIndex === i ? '−' : '+'}</span>
                    </button>
                    <button type="button" title="Delete section" onClick={() => deleteSection(i)}
                      style={{ flexShrink: 0, width: 38, background: openIndex === i ? T.cream : T.paper, border: 'none', borderLeft: `1px solid ${T.line}`, cursor: 'pointer', color: '#B3261E', fontFamily: T.sans, fontSize: 15 }}>
                      ×
                    </button>
                  </div>
                  {openIndex === i && (
                    <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input value={s.num} onChange={(e) => updateSectionMeta(i, 'num', e.target.value)}
                          placeholder="§ num" style={{ ...S.input, width: 70, fontFamily: T.mono, fontSize: 12.5 }} />
                        <input value={s.title} onChange={(e) => updateSectionMeta(i, 'title', e.target.value)}
                          placeholder="Section title" style={{ ...S.input, flex: 1, fontFamily: T.sans, fontSize: 13 }} />
                      </div>
                      {(s.items || []).map((it, j) => (
                        <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <input value={it.label} onChange={(e) => updateItemLabel(i, j, e.target.value)}
                              placeholder="label (e.g. 2.1 or (a))"
                              style={{ ...S.input, width: 140, fontFamily: T.mono, fontSize: 11.5, fontWeight: 700, color: T.fg3, marginBottom: 4 }} />
                            <textarea
                              value={it.body}
                              onChange={(e) => updateItemBody(i, j, e.target.value)}
                              rows={Math.max(2, Math.min(8, Math.ceil(it.body.length / 90)))}
                              style={{ ...S.input, fontFamily: T.mono, fontSize: 12.5, lineHeight: 1.5, resize: 'vertical' }}
                            />
                          </div>
                          <button type="button" title="Delete point" onClick={() => deleteItem(i, j)}
                            style={{ flexShrink: 0, marginTop: 2, width: 26, height: 26, borderRadius: 6, background: 'transparent', border: `1px solid ${T.line}`, cursor: 'pointer', color: '#B3261E', fontFamily: T.sans, fontSize: 14, lineHeight: 1 }}>
                            ×
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addItem(i)}
                        style={{ ...S.btnGhost, alignSelf: 'flex-start', padding: '5px 12px', fontSize: 12.5 }}>
                        + Add point
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {loaded && (
            <button type="button" onClick={addSection} style={{ ...S.btnGhost, alignSelf: 'flex-start', padding: '6px 14px', fontSize: 13 }}>
              + Add section
            </button>
          )}
          {error && <div style={{ color: '#B3261E', fontFamily: T.sans, fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap', paddingTop: 4 }}>
            {!isDefault ? (
              <button type="button" style={{ ...S.btnGhost, marginRight: 'auto', color: '#B3261E', borderColor: '#F0A9A9' }}
                onClick={revertToStandard} disabled={busy}>Revert to standard MSA</button>
            ) : null}
            <button type="button" style={S.btnGhost} onClick={onClose} disabled={busy}>Cancel</button>
            <button type="button" style={{ ...S.btnLime, opacity: busy || !loaded ? 0.7 : 1 }} onClick={save} disabled={busy || !loaded}>
              {busy ? 'Saving…' : 'Save'}
            </button>
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
    const [company, setCompany] = useState(null);   // portal company record
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const save = async (e) => {
      e.preventDefault();
      if (!company) { setError('Pick a company'); return; }
      if (!company.leadContact && !(company.contacts || []).length) { setError('This company has no contacts. Add them on the company profile first.'); return; }
      setBusy(true); setError('');
      try {
        await api('/api/admin/blueprints', {
          method: 'POST',
          body: JSON.stringify({ companyId: company.id }),
        });
        onSaved();
      } catch (err) { setError(err.message); setBusy(false); }
    };

    return (
      <Modal title="New blueprint" sub="Pick the company. Everything else pulls from its portal profile." onClose={onClose} width={560}>
        <form onSubmit={save} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <PortalCompanyPicker company={company} onPick={setCompany} onClear={() => setCompany(null)}/>
          {company && <CompanySummary company={company} extra=""/>}
          {company && (
            <div style={{ padding: '10px 12px', background: '#EEF0FE', border: '1px solid #C3C9F5', borderRadius: 8, fontFamily: T.sans, fontSize: 12.5, color: '#3A44C4' }}>
              The blueprint will be restricted to this company&#39;s contacts — only they (and the Uncap team) will be able to view it.
            </div>
          )}
          {error && <div style={{ color: '#B3261E', fontFamily: T.sans, fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" style={S.btnGhost} onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" style={{ ...S.btnLime, opacity: busy ? 0.7 : 1 }} disabled={busy}>{busy ? 'Saving…' : 'Create blueprint'}</button>
          </div>
        </form>
      </Modal>
    );
  }

  // ── root ─────────────────────────────────────────────────────────────
  // Dashboard landing page: a cross-entity recent-activity feed (created,
  // edited, signed, status changed) across both Discoveries and Blueprints.
  // Backed by /api/admin/activity. This is what the logo and first login land on.
  const ACT_PAGE_SIZE = 50;
  function Home() {
    const isMobile = useIsMobile();
    const [events, setEvents] = useState(null);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [changesRef, setChangesRef] = useState(null);
    useEffect(() => {
      let dead = false;
      api('/api/admin/activity')
        .then((d) => { if (!dead) setEvents(d.events || []); })
        .catch((e) => { if (!dead) { setError(e.message); setEvents([]); } });
      return () => { dead = true; };
    }, []);

    const actStyle = (type) => {
      switch (type) {
        case 'created':     return { l: 'Created', bg: '#EEF0FE', fg: '#3A44C4', bd: '#C3C9F5' };
        case 'signed':      return { l: 'Signed',  bg: '#DFFCE6', fg: '#064E2E', bd: '#9BDDB0' };
        case 'edited':      return { l: 'Edited',  bg: '#FFF6E0', fg: '#6A4E00', bd: '#E8C36A' };
        case 'status':      return { l: 'Status',  bg: T.black,   fg: '#fff',    bd: T.black };
        case 'view':        return { l: 'Viewed',  bg: T.cream,   fg: T.fg2,     bd: T.line };
        case 'disc-update': return { l: 'Updated', bg: '#E8FF52', fg: '#0A0A0A', bd: T.black };
        case 'deleted':     return { l: 'Deleted', bg: '#FDE8E8', fg: '#8A1C1C', bd: '#F0A9A9' };
        default:            return { l: type || 'Event', bg: T.cream, fg: T.fg2, bd: T.line };
      }
    };

    const totalPages = events ? Math.max(1, Math.ceil(events.length / ACT_PAGE_SIZE)) : 1;
    const pageSafe = Math.min(page, totalPages);
    const pageRows = events ? events.slice((pageSafe - 1) * ACT_PAGE_SIZE, pageSafe * ACT_PAGE_SIZE) : [];

    return (
      <Page>
        <div>
          <PageHead eyebrow="Dashboard" title="Recent activity"/>
          {events === null ? (
            <div style={{ ...S.card, padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>Loading…</div>
          ) : error ? (
            <div style={{ ...S.card, padding: 24, color: '#B3261E', fontFamily: T.sans, fontSize: 14 }}>{error}</div>
          ) : events.length === 0 ? (
            <div style={{ ...S.card, padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>
              No activity yet. Creating, editing, viewing, or signing a blueprint or discovery will show up here.
            </div>
          ) : (
            <>
              <div style={{ ...S.card, overflow: 'hidden' }}>
                {pageRows.map((ev, i) => {
                  const a = actStyle(ev.type);
                  const hasChanges = ev.type === 'disc-update' && ev.ref;
                  const path = ev.entity === 'discovery' ? '/admin/discoveries' : ev.entity === 'company' ? '/admin/companies' : '/admin/blueprints';
                  const onRowClick = hasChanges
                    ? (e) => { e.preventDefault(); setChangesRef(ev.ref); }
                    : navClick(path);
                  return (
                    <a key={i} href={hasChanges ? '#' : path} onClick={onRowClick}
                      style={{ display: 'flex', gap: 10, alignItems: 'center', textDecoration: 'none',
                        padding: isMobile ? '6px 12px' : '6px 14px',
                        borderBottom: i < pageRows.length - 1 ? `1px solid ${T.line}` : 'none' }}>
                      <span style={{ flexShrink: 0, display: 'inline-block', padding: '2px 7px', borderRadius: 999,
                        fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
                        background: a.bg, color: a.fg, border: `1px solid ${a.bd}`, minWidth: 52, textAlign: 'center' }}>{a.l}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.fg1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ev.name || ev.id}
                          <span style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.fg3, marginLeft: 7 }}>
                            {ev.entity === 'discovery' ? 'Disc' : 'BP'}
                          </span>
                        </div>
                        {ev.detail ? (
                          <div style={{ fontFamily: T.sans, fontSize: 11.5, color: T.fg2, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {ev.detail}{hasChanges ? <span style={{ color: T.fg1, fontWeight: 600 }}> · view changes →</span> : null}
                          </div>
                        ) : null}
                      </div>
                      <div style={{ flexShrink: 0, textAlign: 'right', maxWidth: '42%' }}>
                        {ev.actor ? (
                          <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fg2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.actor}</div>
                        ) : null}
                        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fg3, marginTop: 1 }}>{fmtWhen(ev.ts)}</div>
                      </div>
                    </a>
                  );
                })}
              </div>
              {events.length > ACT_PAGE_SIZE && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '16px 0 4px' }}>
                  <button type="button" style={{ ...S.btnGhost, opacity: pageSafe <= 1 ? 0.5 : 1 }} disabled={pageSafe <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}>← Prev</button>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: T.fg3 }}>Page {pageSafe} of {totalPages}</span>
                  <button type="button" style={{ ...S.btnGhost, opacity: pageSafe >= totalPages ? 0.5 : 1 }} disabled={pageSafe >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
        {changesRef && <ChangesModal refId={changesRef} onClose={() => setChangesRef(null)}/>}
      </Page>
    );
  }

  // Popup showing exactly what a client changed on a discovery submit.
  function ChangesModal({ refId, onClose }) {
    const [sub, setSub] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => {
      let dead = false;
      api('/api/admin/discovery/submission?ref=' + encodeURIComponent(refId))
        .then((d) => { if (!dead) setSub(d.submission); })
        .catch((e) => { if (!dead) { setError(e.message); setSub({ changes: [] }); } });
      return () => { dead = true; };
    }, [refId]);
    const changes = (sub && sub.changes) || [];
    return (
      <Modal title={sub ? (sub.by || 'Client') + ' · ' + (sub.company || 'Discovery') : 'Discovery update'} sub={sub ? fmtWhen(sub.at) + ' · ' + changes.length + ' change' + (changes.length === 1 ? '' : 's') : 'Loading…'} onClose={onClose} width={640}>
        <div style={{ padding: 20, maxHeight: '70vh', overflowY: 'auto' }}>
          {!sub ? <div style={{ color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>Loading…</div> : changes.length === 0 ? (
            <div style={{ color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>No change detail available.</div>
          ) : changes.map((c, i) => (
            <div key={i} style={{ padding: '11px 0', borderBottom: `1px solid ${T.line}` }}>
              <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.fg1 }}>
                {c.label}
                <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: c.isNew ? '#064E2E' : '#6A4E00', marginLeft: 8 }}>{c.isNew ? 'New' : 'Changed'}</span>
              </div>
              {!c.isNew && c.before ? (
                <div style={{ fontFamily: T.sans, fontSize: 13, color: T.fg3, marginTop: 3, textDecoration: 'line-through', whiteSpace: 'pre-wrap' }}>{c.before}</div>
              ) : null}
              <div style={{ fontFamily: T.sans, fontSize: 13.5, color: T.fg1, marginTop: 3, whiteSpace: 'pre-wrap' }}>{c.after}</div>
            </div>
          ))}
          {error && <div style={{ color: '#B3261E', fontFamily: T.sans, fontSize: 13 }}>{error}</div>}
        </div>
      </Modal>
    );
  }

  function AdminApp() {
    const [me, setMe] = useState(undefined); // undefined = checking, null = signed out
    const [viewer, setViewer] = useState(null); // { url, title } — framed preview
    const route = useRoute();

    const check = useCallback(async () => {
      try { setMe(await api('/api/admin/me')); }
      catch (_) { setMe(null); }
    }, []);
    useEffect(() => { check(); }, [check]);

    // Any top-nav navigation closes an open preview so the nav always works.
    useEffect(() => { setViewer(null); }, [route]);

    // Preview buttons dispatch bp:preview; the frame opens below the toolbar
    // so the admin never leaves the shell. Esc closes it.
    useEffect(() => {
      const onPreview = (e) => setViewer(e.detail || null);
      const onKey = (e) => { if (e.key === 'Escape') setViewer(null); };
      window.addEventListener('bp:preview', onPreview);
      window.addEventListener('keydown', onKey);
      return () => { window.removeEventListener('bp:preview', onPreview); window.removeEventListener('keydown', onKey); };
    }, []);

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
    if (!me.approved) return <PendingApproval me={me} onLogout={logout}/>;

    if (viewer) {
      return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: T.cream }}>
          <TopBar me={me} route={route} onLogout={logout}/>
          <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 12, padding: '4px 14px', background: T.paper, borderBottom: `1px solid ${T.line}` }}>
            <button type="button" onClick={() => setViewer(null)} style={{ border: `1px solid ${T.line}`, background: 'transparent', color: T.fg2, borderRadius: 5, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>← Back</button>
            <span style={{ fontFamily: T.sans, fontSize: 12.5, fontWeight: 700, color: T.fg1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{viewer.title}</span>
            <a href={viewer.url} target="_blank" rel="noreferrer" style={{ marginLeft: 'auto', fontFamily: T.sans, fontSize: 11.5, fontWeight: 600, color: T.fg3, textDecoration: 'none', whiteSpace: 'nowrap' }}>Open in new tab ↗</a>
          </div>
          <iframe title={viewer.title} src={viewer.url} style={{ flex: '1 1 auto', width: '100%', border: 'none', display: 'block', background: T.cream }}/>
        </div>
      );
    }

    return (
      <div style={{ minHeight: '100vh', background: T.cream }}>
        <TopBar me={me} route={route} onLogout={logout}/>
        {route === 'users' ? (me.isSuper ? <Users/> : <Home/>)
          : route === 'company-profile' ? <CompanyProfile id={routeCompanyId()}/>
          : route === 'blueprint-editor' ? <BlueprintEditor id={routeBlueprintId()}/>
          : route === 'companies' ? <Companies me={me}/>
          : route === 'discoveries' ? <Discoveries me={me}/>
          : route === 'blueprints' ? <Blueprints me={me}/>
          : route === 'projects' ? <SectionStub eyebrow="Services" title="Projects" note="Fixed-scope client projects will live here — tracked from kickoff through delivery. Design coming next."/>
          : route === 'retainers' ? <Retainers/>
          : route === 'revenues' ? (me.isSuper ? <RevenueOverview/> : <Home/>)
          : route === 'rev-fixed' ? (me.isSuper ? <FixedRevenue/> : <Home/>)
          : route === 'rev-recurring' ? (me.isSuper ? <RecurringRevenue/> : <Home/>)
          : route === 'rev-apps' ? (me.isSuper ? <AppsRevenue/> : <Home/>)
          : route === 'rev-referrals' ? (me.isSuper ? <ReferralsRevenue/> : <Home/>)
          : route === 'dashboard' ? <SectionStub eyebrow="Overview" title="Dashboard" note="A cross-section overview of activity, sales, services, and revenue. We’ll design this in the next steps."/>
          : <Home/>}
      </div>
    );
  }

  // Signed in but not yet approved by the super admin.
  function PendingApproval({ me, onLogout }) {
    return (
      <div style={{ minHeight: '100vh', background: T.cream, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#0A0A0A' }}>
          <div style={{ height: 40, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px' }}>
            <img src="/assets/uncap-logo-white.svg" alt="Uncap" style={{ height: 14, display: 'block' }}/>
            <span style={{ fontFamily: T.mono, fontSize: 8.5, letterSpacing: '0.12em', color: '#9A9A9A' }}>ADMIN</span>
            <button type="button" onClick={onLogout} style={{ marginLeft: 'auto', border: '1px solid #4D4D4D', background: 'transparent', color: '#FFFFFF', borderRadius: 4, padding: '3px 9px', fontSize: 10.5, fontWeight: 600, cursor: 'pointer' }}>Sign out</button>
          </div>
        </div>
        <div style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ ...S.card, padding: 40, maxWidth: 460, textAlign: 'center' }}>
            <div style={{ ...S.eyebrow, color: T.fg3, justifyContent: 'center', display: 'inline-flex', marginBottom: 14 }}>Pending approval</div>
            <div style={{ fontFamily: T.hero, fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', color: T.fg1 }}>You&#39;re almost in.</div>
            <div style={{ fontFamily: T.sans, fontSize: 14.5, lineHeight: 1.6, color: T.fg2, marginTop: 12 }}>
              Your Uncap account <b>{me.email}</b> is signed in but needs approval from denis@uncap.com before you can use the dashboard. You&#39;ll have access the moment it&#39;s granted.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Users (Admin only) ───────────────────────────────────────────────
  function Users() {
    const [rows, setRows] = useState(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState('');

    const load = async () => {
      try { setRows((await api('/api/admin/users')).users); }
      catch (err) { setError(err.message); setRows([]); }
    };
    useEffect(() => { load(); }, []);

    // Assign a role ('management' | 'staff') or revoke access (role '').
    const setRole = async (u, role) => {
      if (role === u.role) return;
      if (!role && !window.confirm(`Revoke ${u.name || u.email}?\n\nThey keep their @uncap.com sign-in but lose all dashboard access until re-approved.`)) return;
      setBusy(u.email); setError('');
      try {
        await api('/api/admin/users/approve', { method: 'POST', body: JSON.stringify({ email: u.email, role, approved: !!role }) });
        await load();
      } catch (err) { setError(err.message); }
      setBusy('');
    };

    const ROLE_CHIP = {
      admin:      { l: 'ADMIN',      bg: '#0A0A0A', fg: '#E8FF52' },
      management: { l: 'MANAGEMENT', bg: '#DDE6FF', fg: '#21318C' },
      staff:      { l: 'STAFF',      bg: '#DFFCE6', fg: '#064E2E' },
      pending:    { l: 'PENDING',    bg: '#FDECC8', fg: '#6A4E00' },
    };
    const roleChip = (role) => {
      const c = ROLE_CHIP[role] || ROLE_CHIP.pending;
      return <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.06em', background: c.bg, color: c.fg, borderRadius: 999, padding: '4px 10px', flexShrink: 0 }}>{c.l}</span>;
    };

    return (
      <Page>
        <PageHead eyebrow="Admin" title="Users"/>
        <div style={{ fontFamily: T.sans, fontSize: 13.5, color: T.fg2, marginTop: -12, marginBottom: 20 }}>
          Anyone with an @uncap.com Google account can sign in, but stays <b>Pending</b> (no access) until you approve them. <b>Management</b> can delete content and reopen signed blueprints; <b>Staff</b> can create, edit, invite, and view but not delete. Only you (Admin) manage roles here.
        </div>
        {rows === null ? (
          <div style={{ ...S.card, padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ ...S.card, padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>{error || 'No users yet.'}</div>
        ) : (
          <div style={{ ...S.card, overflow: 'hidden' }}>
            {rows.map((u, i) => (
              <div key={u.email} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: i < rows.length - 1 ? `1px solid ${T.line}` : 'none' }}>
                {u.picture
                  ? <img src={u.picture} alt="" referrerPolicy="no-referrer" style={{ width: 34, height: 34, borderRadius: 999, border: `1px solid ${T.line}`, flexShrink: 0 }}/>
                  : <span style={{ width: 34, height: 34, borderRadius: 999, background: T.cream, border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg3, flexShrink: 0 }}>{(u.email || '?')[0].toUpperCase()}</span>}
                <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                  <div style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 14, color: T.fg1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name || u.email}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fg3, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}{u.lastLoginAt ? ' · last in ' + fmtWhen(u.lastLoginAt) : ' · never signed in'}</div>
                </div>
                {roleChip(u.role)}
                {u.role === 'admin' || u.locked ? null
                  : u.role === 'pending'
                    ? <span style={{ display: 'inline-flex', gap: 6, flexShrink: 0 }}>
                        <button type="button" style={{ ...S.btn, flexShrink: 0, padding: '7px 11px', fontSize: 12.5 }} disabled={busy === u.email} onClick={() => setRole(u, 'management')}>{busy === u.email ? '…' : 'Management'}</button>
                        <button type="button" style={{ ...S.btnGhost, flexShrink: 0, padding: '7px 11px', fontSize: 12.5 }} disabled={busy === u.email} onClick={() => setRole(u, 'staff')}>{busy === u.email ? '…' : 'Staff'}</button>
                      </span>
                    : <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                        <select value={u.role} onChange={(e) => setRole(u, e.target.value)} disabled={busy === u.email}
                          aria-label={'Role for ' + u.email}
                          style={{ ...S.input, width: 'auto', padding: '6px 10px', fontSize: 12.5, cursor: 'pointer' }}>
                          <option value="management">Management</option>
                          <option value="staff">Staff</option>
                        </select>
                        <button type="button" style={{ ...S.btnGhost, flexShrink: 0 }} disabled={busy === u.email} onClick={() => setRole(u, '')}>{busy === u.email ? '…' : 'Revoke'}</button>
                      </span>}
              </div>
            ))}
          </div>
        )}
        {error && rows && rows.length > 0 && <div style={{ marginTop: 12, color: '#B3261E', fontFamily: T.sans, fontSize: 13 }}>{error}</div>}
      </Page>
    );
  }

  window.AdminApp = AdminApp;
})();
