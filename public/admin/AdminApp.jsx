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
    // Square icon-only variant of btnGhost — Preview/Share/Activity don't
    // need a text label, just a tooltip (title attr) for a11y/clarity.
    btnIcon: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, padding: 0, flexShrink: 0, background: T.paper, color: T.fg1, border: `1px solid ${T.line}`, borderRadius: 999, cursor: 'pointer' },
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

  // ── path router ───────────────────────────────────────────────────────
  // Real paths (/blueprints, /discoveries) instead of #/ hash routes, so
  // the URL is bookmarkable and shareable. Workers Static Assets is
  // configured with not_found_handling = single-page-application, so any
  // path that isn't a real static asset (including these) falls back to
  // this same index.html, which re-mounts AdminApp and this parses the
  // pathname straight back to the right route.
  function parseRoute() {
    const seg = window.location.pathname.split('/').filter(Boolean)[0];
    if (seg === 'discoveries') return 'discoveries';
    if (seg === 'blueprints') return 'blueprints';
    return 'home';
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
    const pill = (it) => {
      const path = it.id === 'home' ? '/' : '/' + it.id;
      return (
        <a key={it.id} href={path} onClick={navClick(path)} style={{
          padding: '7px 14px', borderRadius: 999, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
          fontFamily: T.sans, fontSize: 13.5, fontWeight: 600, lineHeight: 1,
          color: route === it.id ? T.black : T.fg2,
          background: route === it.id ? T.signal : 'transparent',
          border: route === it.id ? `1px solid ${T.black}` : '1px solid transparent',
        }}>{it.l}</a>
      );
    };
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
          <a href="/" onClick={navClick('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/assets/uncap-logo-black.svg" alt="Uncap" style={{ height: 20, width: 'auto', display: 'block' }}/>
            <span style={{ ...S.eyebrow, color: T.fg1 }}>GO</span>
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

  // Multi-select of Attio people, rendered as removable chips. Excludes
  // whatever email is currently the Client Lead so the same person can't
  // be picked twice.
  function AssociatedContactsPicker({ contacts, onChange, excludeEmail }) {
    const add = (person) => {
      if (!person.email) return;
      if (excludeEmail && person.email === excludeEmail) return;
      if (contacts.some((c) => c.email === person.email)) return;
      onChange([...contacts, { attioId: person.attioId, name: person.name, email: person.email }]);
    };
    const remove = (email) => onChange(contacts.filter((c) => c.email !== email));

    return (
      <div>
        <label style={S.label}>Associated contacts</label>
        <AttioTypeahead kind="people" placeholder="Search Attio contacts to add…" onPick={add}/>
        {contacts.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {contacts.map((c) => (
              <span key={c.email} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 6px 5px 10px',
                background: T.cream, border: `1px solid ${T.line}`, borderRadius: 999,
                fontFamily: T.sans, fontSize: 12.5, color: T.fg1,
              }}>
                {c.name || c.email}
                <button type="button" aria-label={'Remove ' + (c.name || c.email)} onClick={() => remove(c.email)}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: 999, border: 'none', background: T.line, color: T.fg1, cursor: 'pointer', fontSize: 11, lineHeight: 1, padding: 0 }}>✕</button>
              </span>
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

  // Required single-select Client Lead field — same pattern as CompanyPicker.
  function LeadContactPicker({ contact, onPick, onClear }) {
    return (
      <div>
        <label style={S.label}>Lead contact</label>
        {contact ? (
          <SelectedCard title={contact.name || contact.email} sub={contact.email} onClear={onClear}/>
        ) : (
          <AttioTypeahead kind="people" placeholder="Search Attio contacts…" onPick={onPick}/>
        )}
      </div>
    );
  }

  // ── Discoveries ──────────────────────────────────────────────────────
  const DISC_PAGE_SIZE = 10;
  function Discoveries() {
    const isMobile = useIsMobile();
    const [rows, setRows] = useState(null);
    const [showNew, setShowNew] = useState(() => new URLSearchParams(window.location.search).get('new') === '1');
    const [transcriptFor, setTranscriptFor] = useState(null);
    const [copied, setCopied] = useState('');
    const [page, setPage] = useState(1);
    const [error, setError] = useState('');

    const shareUrl = (r) => `${window.location.origin}/discovery/${r.handle}/`;
    const copyUrl = async (r) => {
      try { await navigator.clipboard.writeText(shareUrl(r)); }
      catch (_) { window.prompt('Copy the discovery link:', shareUrl(r)); }
      setCopied(r.id);
      setTimeout(() => setCopied(''), 1600);
    };

    const discActions = (r) => (
      <span style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
        <a href={'/discovery/' + r.handle + '/'} target="_blank" rel="noreferrer" title="Open discovery" aria-label="Open discovery"
          style={{ ...S.btnIcon, textDecoration: 'none' }}><IconEye/></a>
        <button type="button" title={copied === r.id ? 'Copied ✓' : 'Copy link'} aria-label="Copy link" style={S.btnIcon} onClick={() => copyUrl(r)}>
          {copied === r.id ? <IconCheck/> : <IconShare/>}
        </button>
        <button type="button" style={S.btnGhost} onClick={() => setTranscriptFor(r)}>Transcript</button>
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
            // Discovery Experience to run the session on the call.
            if (d && d.handle) { window.location.href = '/discovery/' + d.handle + '/'; return; }
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
    const [company, setCompany] = useState(null);       // {attioId, name, domain, address}
    const [website, setWebsite] = useState('');          // seeded from Attio, editable for this record only
    const [address, setAddress] = useState('');
    const [leadContact, setLeadContact] = useState(null); // {attioId, name, email}
    const [associatedContacts, setAssociatedContacts] = useState([]);
    const [expiresAt, setExpiresAt] = useState('');
    const [busy, setBusy]       = useState(false);
    const [error, setError]     = useState('');

    const pickCompany = (c) => {
      setCompany(c);
      setWebsite(c.domain || '');
      setAddress(c.address || '');
    };
    const clearCompany = () => { setCompany(null); setWebsite(''); setAddress(''); };

    const save = async (e) => {
      e.preventDefault();
      if (!company) { setError('Pick a company from Attio'); return; }
      if (!leadContact) { setError('Pick a Client Lead from Attio'); return; }
      setBusy(true); setError('');
      try {
        const d = await api('/api/admin/discoveries', {
          method: 'POST',
          body: JSON.stringify({
            company: company.name, companyAttioId: company.attioId,
            website: website.trim(), address: address.trim(),
            leadContact, associatedContacts, expiresAt,
          }),
        });
        onSaved(d.discovery || null);
      } catch (err) { setError(err.message); setBusy(false); }
    };

    return (
      <Modal title="New discovery" sub="Company + contacts from Attio · technical questions come next phase" onClose={onClose}>
        <form onSubmit={save} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CompanyPicker company={company} onPick={pickCompany} onClear={clearCompany}/>
          {company && (
            <>
              <Field label="Website" value={website} onChange={setWebsite} placeholder="acme.com"/>
              <Field label="Address" value={address} onChange={setAddress} placeholder="100 Main St, Chicago, IL"/>
            </>
          )}
          <LeadContactPicker contact={leadContact} onPick={setLeadContact} onClear={() => setLeadContact(null)}/>
          <AssociatedContactsPicker contacts={associatedContacts} onChange={setAssociatedContacts} excludeEmail={leadContact && leadContact.email}/>
          <Field label="Expiration date (valid through)" type="date" value={expiresAt} onChange={setExpiresAt}/>
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

    const setChannel = async (bp, channel) => {
      try {
        await api('/api/admin/blueprint-meta', { method: 'POST', body: JSON.stringify({ blueprintId: bp.id, channel }) });
        load();
      } catch (err) { setError(err.message); }
    };
    const channelCell = (bp) => (
      <select value={bp.channel || ''} onChange={(e) => setChannel(bp, e.target.value)}
        style={{ ...S.input, width: 'auto', padding: '5px 8px', fontSize: 12, cursor: 'pointer' }}>
        <option value="">—</option>
        {BP_CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
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

    const shareUrl = (bp) => `${window.location.origin}/blueprint/${bp.id}/`;
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
    const rowActions = (bp) => (
      <span style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
        <a href={'/blueprint/' + bp.id + '/'} target="_blank" rel="noreferrer" title="Preview" aria-label="Preview"
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
                  onClick={() => { setPrintFor(null); window.open('/blueprint/' + bp.id + '/?bpPrint=' + mode, '_blank'); }}
                  style={{ background: 'transparent', border: 'none', color: '#fff', textAlign: 'left', padding: '9px 11px', borderRadius: 6, cursor: 'pointer', fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {l}
                  <span style={{ fontSize: 9, letterSpacing: '0.02em', textTransform: 'none', opacity: 0.6, fontWeight: 500 }}>{sub}</span>
                </button>
              ))}
            </span>,
            document.body
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
    const [company, setCompany] = useState(null);       // {attioId, name, domain, address}
    const [website, setWebsite] = useState('');          // seeded from Attio, editable for this blueprint only
    const [address, setAddress] = useState('');
    const [leadContact, setLeadContact] = useState(null); // {attioId, name, email}
    const [associatedContacts, setAssociatedContacts] = useState([]);
    const [expiresAt, setExpiresAt]     = useState('');
    const [channel, setChannelSel]      = useState('');
    const [busy, setBusy]               = useState(false);
    const [error, setError]             = useState('');

    const pickCompany = (c) => {
      setCompany(c);
      setWebsite(c.domain || '');
      setAddress(c.address || '');
    };
    const clearCompany = () => { setCompany(null); setWebsite(''); setAddress(''); };

    const save = async (e) => {
      e.preventDefault();
      if (!company) { setError('Pick a company from Attio'); return; }
      if (!leadContact) { setError('Pick a Client Lead from Attio'); return; }
      setBusy(true); setError('');
      try {
        await api('/api/admin/blueprints', {
          method: 'POST',
          body: JSON.stringify({
            companyName: company.name, companyAttioId: company.attioId,
            website: website.trim(), address: address.trim(),
            leadContact, associatedContacts, expiresAt, channel,
          }),
        });
        onSaved();
      } catch (err) { setError(err.message); setBusy(false); }
    };

    return (
      <Modal title="New blueprint" sub="Saved as a draft · template generation is the next phase" onClose={onClose} width={560}>
        <form onSubmit={save} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CompanyPicker company={company} onPick={pickCompany} onClear={clearCompany}/>
          {company && (
            <>
              <Field label="Client website" value={website} onChange={setWebsite} placeholder="acme.com"/>
              <Field label="Company address" value={address} onChange={setAddress} placeholder="100 Main St, Chicago, IL"/>
            </>
          )}
          <LeadContactPicker contact={leadContact} onPick={setLeadContact} onClear={() => setLeadContact(null)}/>
          <AssociatedContactsPicker contacts={associatedContacts} onChange={setAssociatedContacts} excludeEmail={leadContact && leadContact.email}/>
          {(leadContact || associatedContacts.length > 0) && (
            <div style={{ padding: '10px 12px', background: '#EEF0FE', border: '1px solid #C3C9F5', borderRadius: 8, fontFamily: T.sans, fontSize: 12.5, color: '#3A44C4' }}>
              This blueprint will be restricted to {[leadContact, ...associatedContacts].filter(Boolean).length} email{[leadContact, ...associatedContacts].filter(Boolean).length === 1 ? '' : 's'} — only they (and the Uncap team) will be able to view it.
            </div>
          )}
          <div>
            <div style={S.label}>Channel</div>
            <select value={channel} onChange={(e) => setChannelSel(e.target.value)} style={{ ...S.input, cursor: 'pointer' }}>
              <option value="">Select a channel…</option>
              {BP_CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
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
                  const path = ev.entity === 'discovery' ? '/discoveries' : '/blueprints';
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
        {route === 'discoveries' ? <Discoveries/> : route === 'blueprints' ? <Blueprints me={me}/> : <Home/>}
      </div>
    );
  }

  window.AdminApp = AdminApp;
})();
