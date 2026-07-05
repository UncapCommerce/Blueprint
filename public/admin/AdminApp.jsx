// ── Blueprint admin application ───────────────────────────────────────────
// Mounted by public/index.html at the site root. Google sign-in (Uncap team
// only), then three areas: Home (overview), Discoveries (client discovery
// records), Blueprints (every proposal with preview / share / activity /
// print, plus new-blueprint drafts).
//
// All state lives in the worker (KV) behind /api/admin/*; the bp_admin
// HttpOnly cookie carries the session, so every fetch here uses
// credentials: 'same-origin'.
// ──────────────────────────────────────────────────────────────────────────

(function () {
  const { useState, useEffect, useRef, useCallback } = React;

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
    btnGhost: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1, background: 'transparent', color: T.fg1, border: `1px solid ${T.line}`, borderRadius: 999, cursor: 'pointer' },
    input: { width: '100%', boxSizing: 'border-box', padding: '12px 14px', fontFamily: T.sans, fontSize: 15, color: T.fg1, background: T.cream, border: `1px solid ${T.line}`, borderRadius: 6, outline: 'none' },
    label: { fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.fg3, display: 'block', marginBottom: 6 },
    th: { textAlign: 'left', padding: '10px 14px', borderBottom: `1px solid ${T.line}`, fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.fg3, background: '#FAFAF7', whiteSpace: 'nowrap' },
    td: { textAlign: 'left', padding: '12px 14px', borderBottom: `1px solid ${T.line}`, fontFamily: T.sans, fontSize: 13.5, color: T.fg1, verticalAlign: 'top' },
  };

  // ── hash router ──────────────────────────────────────────────────────
  function useRoute() {
    const parse = () => (window.location.hash.replace(/^#\/?/, '') || 'home').split('?')[0];
    const [route, setRoute] = useState(parse);
    useEffect(() => {
      const onHash = () => setRoute(parse());
      window.addEventListener('hashchange', onHash);
      return () => window.removeEventListener('hashchange', onHash);
    }, []);
    return route;
  }

  // ── login screen ─────────────────────────────────────────────────────
  function Login({ onAuthed }) {
    const btnRef = useRef(null);
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.cream, padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <img src="/assets/uncap-logo-black.svg" alt="Uncap" style={{ height: 30, width: 'auto', display: 'block', margin: '0 auto 28px' }}/>
          <div style={{ ...S.card, padding: 36 }}>
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
    const items = [
      { id: 'home',        l: 'Home' },
      { id: 'discoveries', l: 'Discoveries' },
      { id: 'blueprints',  l: 'Blueprints' },
    ];
    return (
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: T.paper, borderBottom: `1px solid ${T.black}` }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', gap: 26 }}>
          <a href="#/home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/assets/uncap-logo-black.svg" alt="Uncap" style={{ height: 20, width: 'auto', display: 'block' }}/>
            <span style={{ ...S.eyebrow, color: T.fg1 }}>Blueprint</span>
          </a>
          <nav style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
            {items.map((it) => (
              <a key={it.id} href={'#/' + it.id} style={{
                padding: '7px 14px', borderRadius: 999, textDecoration: 'none',
                fontFamily: T.sans, fontSize: 13.5, fontWeight: 600, lineHeight: 1,
                color: route === it.id ? T.black : T.fg2,
                background: route === it.id ? T.signal : 'transparent',
                border: route === it.id ? `1px solid ${T.black}` : '1px solid transparent',
              }}>{it.l}</a>
            ))}
          </nav>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            {me.picture
              ? <img src={me.picture} alt="" referrerPolicy="no-referrer" style={{ width: 28, height: 28, borderRadius: 999, border: `1px solid ${T.line}` }}/>
              : <span style={{ width: 28, height: 28, borderRadius: 999, background: T.signal, border: `1px solid ${T.black}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.mono, fontSize: 11, fontWeight: 700 }}>{(me.email || '?')[0].toUpperCase()}</span>}
            <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fg3, letterSpacing: '0.04em' }}>{me.email}</span>
            <button type="button" onClick={onLogout} style={S.btnGhost}>Sign out</button>
          </div>
        </div>
      </header>
    );
  }

  function Page({ children }) {
    return <main style={{ maxWidth: 1160, margin: '0 auto', padding: '36px 20px 80px' }}>{children}</main>;
  }

  function PageHead({ eyebrow, title, action }) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 26, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 10, ...S.eyebrow }}>
            <span style={{ width: 14, height: 2, background: T.signal }}/>{eyebrow}
          </div>
          <h1 style={{ margin: 0, fontFamily: T.hero, fontWeight: 800, fontSize: 'clamp(26px, 3.4vw, 40px)', letterSpacing: '-0.03em', lineHeight: 1, color: T.fg1 }}>{title}</h1>
        </div>
        {action || null}
      </div>
    );
  }

  // ── Home ─────────────────────────────────────────────────────────────
  function Home({ me }) {
    const [stats, setStats] = useState(null);
    useEffect(() => {
      let dead = false;
      (async () => {
        try {
          const [bps, disc] = await Promise.all([api('/api/admin/blueprints'), api('/api/admin/discoveries')]);
          if (dead) return;
          const live = bps.blueprints.filter((b) => b.kind === 'live');
          setStats({
            blueprints: live.length,
            signed: live.filter((b) => b.signature).length,
            drafts: bps.blueprints.filter((b) => b.kind === 'draft').length,
            discoveries: disc.discoveries.length,
          });
        } catch (_) { if (!dead) setStats({ blueprints: '—', signed: '—', drafts: '—', discoveries: '—' }); }
      })();
      return () => { dead = true; };
    }, []);

    const cards = [
      { v: stats ? stats.blueprints : '…', l: 'Blueprints live', href: '#/blueprints' },
      { v: stats ? stats.signed : '…', l: 'Signed', href: '#/blueprints' },
      { v: stats ? stats.drafts : '…', l: 'Drafts pending', href: '#/blueprints' },
      { v: stats ? stats.discoveries : '…', l: 'Discoveries', href: '#/discoveries' },
    ];
    const firstName = (me.name || me.email || '').split(/[ @]/)[0];
    return (
      <Page>
        <PageHead eyebrow="Overview" title={`Welcome back, ${firstName ? firstName[0].toUpperCase() + firstName.slice(1) : 'team'}.`}/>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {cards.map((c, i) => (
            <a key={i} href={c.href} style={{ ...S.card, padding: '22px 22px 18px', textDecoration: 'none', position: 'relative', overflow: 'hidden' }}>
              {i === 0 && <span style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: T.signal }}/>}
              <div style={{ fontFamily: T.hero, fontWeight: 800, fontSize: 44, letterSpacing: '-0.04em', lineHeight: 0.9, color: T.fg1 }}>{c.v}</div>
              <div style={{ marginTop: 10, ...S.eyebrow }}>{c.l}</div>
            </a>
          ))}
        </div>
        <div style={{ marginTop: 26, ...S.card, padding: 24 }}>
          <div style={{ ...S.eyebrow, marginBottom: 12 }}>Quick actions</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href="#/discoveries?new=1" style={{ ...S.btnLime, textDecoration: 'none' }}>+ New discovery</a>
            <a href="#/blueprints?new=1" style={{ ...S.btn, textDecoration: 'none' }}>+ New blueprint</a>
          </div>
        </div>
      </Page>
    );
  }

  // ── modal chrome ─────────────────────────────────────────────────────
  function Modal({ title, sub, onClose, children, width }) {
    useEffect(() => {
      const onKey = (e) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);
    return (
      <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(10,10,10,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '56px 20px 24px', overflowY: 'auto' }}>
        <div style={{ ...S.card, width: '100%', maxWidth: width || 520, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${T.line}` }}>
            <div>
              <div style={{ fontFamily: T.sans, fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em', color: T.fg1 }}>{title}</div>
              {sub ? <div style={{ ...S.eyebrow, marginTop: 3 }}>{sub}</div> : null}
            </div>
            <button type="button" onClick={onClose} aria-label="Close"
              style={{ background: 'transparent', border: `1px solid ${T.line}`, borderRadius: 999, width: 30, height: 30, cursor: 'pointer', fontSize: 14, lineHeight: 1, color: T.fg3 }}>✕</button>
          </div>
          {children}
        </div>
      </div>
    );
  }

  function Field({ label, value, onChange, placeholder, autoFocus }) {
    return (
      <div>
        <label style={S.label}>{label}</label>
        <input style={S.input} value={value} placeholder={placeholder || ''} autoFocus={!!autoFocus}
          onChange={(e) => onChange(e.target.value)}/>
      </div>
    );
  }

  // ── Discoveries ──────────────────────────────────────────────────────
  function Discoveries() {
    const [rows, setRows] = useState(null);
    const [showNew, setShowNew] = useState(() => window.location.hash.includes('new=1'));
    const [error, setError] = useState('');

    const load = useCallback(async () => {
      try { setRows((await api('/api/admin/discoveries')).discoveries); }
      catch (err) { setError(err.message); setRows([]); }
    }, []);
    useEffect(() => { load(); }, [load]);

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
                      <td style={S.td}>{r.website
                        ? <a href={/^https?:/i.test(r.website) ? r.website : 'https://' + r.website} target="_blank" rel="noreferrer" style={{ color: T.fg1 }}>{r.website}</a>
                        : <span style={{ color: T.fg3 }}>—</span>}</td>
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
        <form onSubmit={save} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
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
  function Blueprints() {
    const [rows, setRows] = useState(null);
    const [showNew, setShowNew] = useState(() => window.location.hash.includes('new=1'));
    const [activityBp, setActivityBp] = useState(null); // {id, name}
    const [printFor, setPrintFor] = useState(null);     // id of row with open print menu
    const [copied, setCopied] = useState('');
    const [error, setError] = useState('');

    const load = useCallback(async () => {
      try { setRows((await api('/api/admin/blueprints')).blueprints); }
      catch (err) { setError(err.message); setRows([]); }
    }, []);
    useEffect(() => { load(); }, [load]);

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

    const statusChip = (bp) => {
      if (bp.kind === 'draft') return (
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#FFF6E0', color: '#6A4E00', border: '1px solid #E8C36A' }}>Draft</span>
      );
      if (bp.signature) return (
        <span>
          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#DFFCE6', color: '#064E2E', border: '1px solid #9BDDB0' }}>Signed</span>
          <div style={{ marginTop: 5, fontFamily: T.mono, fontSize: 10.5, color: T.fg3 }}>
            {bp.signature.name || bp.signature.email}{bp.signature.signedAt ? ' · ' + fmtWhen(bp.signature.signedAt).slice(0, 10) : ''}
          </div>
        </span>
      );
      return (
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#EEF0F4', color: T.fg2, border: `1px solid ${T.line}` }}>Not signed</span>
      );
    };

    return (
      <Page>
        <PageHead eyebrow="Proposals" title="Blueprints"
          action={<button type="button" style={S.btnLime} onClick={() => setShowNew(true)}>+ New blueprint</button>}/>

        <div style={{ ...S.card, overflow: 'visible' }}>
          {rows === null ? (
            <div style={{ padding: 40, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>Loading…</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  <th style={S.th}>#</th><th style={S.th}>Blueprint</th><th style={S.th}>Status</th><th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
                </tr></thead>
                <tbody>
                  {rows.map((bp) => (
                    <tr key={bp.id}>
                      <td style={{ ...S.td, fontFamily: T.mono, fontSize: 12, color: T.fg3, whiteSpace: 'nowrap' }}>{bp.num || '—'}</td>
                      <td style={S.td}>
                        <div style={{ fontWeight: 700 }}>{bp.name}</div>
                        <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fg3, marginTop: 3 }}>
                          {bp.kind === 'live' ? '/' + bp.dir + '/' : (bp.website || 'template generation pending')}
                        </div>
                      </td>
                      <td style={S.td}>{statusChip(bp)}</td>
                      <td style={{ ...S.td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {bp.kind === 'live' ? (
                          <span style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', position: 'relative' }}>
                            <a href={'/' + bp.dir + '/'} target="_blank" rel="noreferrer" style={{ ...S.btnGhost, textDecoration: 'none' }}>Preview</a>
                            <button type="button" style={S.btnGhost} onClick={() => copyShare(bp)}>{copied === bp.id ? 'Copied ✓' : 'Share'}</button>
                            <button type="button" style={S.btnGhost} onClick={() => setActivityBp(bp)}>Activity</button>
                            <span style={{ position: 'relative' }}>
                              <button type="button" style={S.btnGhost} onClick={(e) => { e.stopPropagation(); setPrintFor(printFor === bp.id ? null : bp.id); }}>Print ▾</button>
                              {printFor === bp.id && (
                                <span style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 20, minWidth: 250, background: T.black, borderRadius: 10, padding: 6, display: 'flex', flexDirection: 'column', gap: 2, boxShadow: '0 18px 40px -18px rgba(0,0,0,0.7)', textAlign: 'left' }}>
                                  {[['delivery', 'For Delivery Team', 'Whole document · no terms · no nav'],
                                    ['shopify', 'For Shopify Partner Program', 'Key sections + Master Services Agreement']].map(([mode, l, sub]) => (
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
                        ) : (
                          <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fg3 }}>Generation · phase 2</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {error && <div style={{ marginTop: 12, color: '#B3261E', fontFamily: T.sans, fontSize: 13 }}>{error}</div>}

        {activityBp && <ActivityModal bp={activityBp} onClose={() => setActivityBp(null)}/>}
        {showNew && <NewBlueprintModal onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); load(); }}/>}
      </Page>
    );
  }

  function ActivityModal({ bp, onClose }) {
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

    return (
      <Modal title={'Activity · ' + bp.name} sub={events ? `${events.length} event${events.length === 1 ? '' : 's'} · newest first · last 365 days` : 'Loading…'} onClose={onClose} width={940}>
        <div style={{ maxHeight: '62vh', overflowY: 'auto' }}>
          {events === null ? (
            <div style={{ padding: 32, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>Loading…</div>
          ) : events.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: T.fg3, fontFamily: T.sans, fontSize: 14 }}>{error || 'No activity recorded yet.'}</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <th style={S.th}>Type</th><th style={S.th}>Email</th><th style={S.th}>Time</th>
                <th style={S.th}>IP</th><th style={S.th}>Location</th><th style={S.th}>Agent</th>
              </tr></thead>
              <tbody>
                {events.map((ev, i) => (
                  <tr key={i}>
                    <td style={S.td}>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 999, fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: ev.type === 'sign' ? '#DFFCE6' : '#EEF0FE', color: ev.type === 'sign' ? '#064E2E' : '#3A44C4' }}>
                        {ev.type === 'sign' ? 'Signed' : 'Viewed'}
                      </span>
                    </td>
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
          }),
        });
        onSaved();
      } catch (err) { setError(err.message); setBusy(false); }
    };

    return (
      <Modal title="New blueprint" sub="Saved as a draft · template generation is the next phase" onClose={onClose}>
        <form onSubmit={save} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Company name" value={companyName} onChange={setCompanyName} placeholder="Acme Industrial Co." autoFocus/>
          <Field label="Client website" value={website} onChange={setWebsite} placeholder="acme.com"/>
          <Field label="Lead client" value={leadClient} onChange={setLeadClient} placeholder="Jane Doe, Head of Ecommerce"/>
          <Field label="Company address" value={address} onChange={setAddress} placeholder="100 Main St, Chicago, IL"/>
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
        {route === 'discoveries' ? <Discoveries/> : route === 'blueprints' ? <Blueprints/> : <Home me={me}/>}
      </div>
    );
  }

  window.AdminApp = AdminApp;
})();
