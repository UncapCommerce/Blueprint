// Dynamic templated blueprint proposal. Renders any draft blueprint whose
// content has been generated + marked ready, from the structured content the
// worker returns (GET /api/blueprint/content). Reuses the shared MSA
// (window.UncapMSA) and the /api/auth/sign approve flow, so the sign +
// notification path is identical to the bespoke pages. Served by the worker at
// /<company>/blueprint/app (portal frame) and /blueprint/<id>/ (admin preview).
const { useState, useEffect } = React;

// Source: /blueprint/<id>/ (admin preview) or /<company>/blueprint/app (frame).
const M_ID = window.location.pathname.match(/^\/blueprint\/([a-z0-9-]+)\/?$/);
const M_CO = window.location.pathname.match(/^\/([a-z0-9-]+)\/blueprint(?:\/app)?\/?$/);
const SRC = M_ID ? { id: M_ID[1] } : M_CO ? { company: M_CO[1] } : {};

function contrastOn(hex) {
  const h = (hex || '').replace('#', '');
  if (h.length !== 6) return '#0A0A0A';
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 145 ? '#0A0A0A' : '#FFFFFF';
}

function BlueprintTemplate() {
  const [state, setState] = useState('loading'); // loading | ready | denied | empty
  const [data, setData] = useState(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const qs = SRC.id ? 'id=' + encodeURIComponent(SRC.id) : SRC.company ? 'company=' + encodeURIComponent(SRC.company) : '';
        const resp = await fetch('/api/blueprint/content?' + qs, { credentials: 'same-origin' });
        if (resp.status === 401) { setState('denied'); return; }
        if (!resp.ok) { setState('empty'); return; }
        const d = await resp.json();
        if (!d.ok || !d.content) { setState('empty'); return; }
        setData(d);
        setState('ready');
        // Mint a viewing/approve session from the admin/portal cookie.
        try {
          const t = await fetch('/api/admin/bp-token', {
            method: 'POST', credentials: 'same-origin',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ blueprintId: d.id }),
          }).then((r) => r.ok ? r.json() : null);
          if (t && t.ok && t.token) { window.__bpToken = t.token; setToken(t.token); }
        } catch (_) {}
      } catch (_) { setState('empty'); }
    })();
  }, []);

  if (state === 'loading') return <Centered mono>LOADING…</Centered>;
  if (state === 'denied') return <Centered>Please sign in to your portal to view this blueprint.</Centered>;
  if (state === 'empty') return <Centered>This blueprint is being prepared. It will appear here soon.</Centered>;

  const { name, content, branding } = data;
  const accent = (branding && branding.palette && branding.palette.accent) || '#E8FF52';
  const onAccent = contrastOn(accent);
  return <Proposal name={name} content={content} branding={branding || {}} accent={accent} onAccent={onAccent} token={token}/>;
}

function Centered({ children, mono }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30, textAlign: 'center',
      fontFamily: mono ? 'var(--font-mono, monospace)' : 'var(--font-sans, sans-serif)',
      fontSize: mono ? 11 : 15, letterSpacing: mono ? '0.12em' : 0, color: mono ? '#707070' : '#4D4D4D' }}>{children}</div>
  );
}

function Eyebrow({ children }) {
  return <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#8A8780' }}>{children}</div>;
}

function Section({ id, label, title, children, dark }) {
  return (
    <section style={{ background: dark ? '#0A0A0A' : 'transparent', color: dark ? '#FFFFFF' : '#0A0A0A' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '64px 28px' }}>
        {label ? <div style={{ marginBottom: 14, color: dark ? '#9A9A9A' : undefined }}><Eyebrow>{label}</Eyebrow></div> : null}
        {title ? <h2 style={{ margin: '0 0 26px', fontFamily: 'var(--font-display, Inter, sans-serif)', fontWeight: 800, fontSize: 'clamp(26px, 3.2vw, 40px)', letterSpacing: '-0.03em', lineHeight: 1.05 }}>{title}</h2> : null}
        {children}
      </div>
    </section>
  );
}

function CardGrid({ items, dark }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
      {items.map((it, i) => (
        <div key={i} style={{ border: '1px solid ' + (dark ? '#2B2B2B' : '#E4E1D8'), borderRadius: 10, padding: 22, background: dark ? '#141414' : '#FFFFFF' }}>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>{it.title || it.name}</div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: dark ? '#B4B2AC' : '#4D4D4D', marginTop: 8 }}>{it.body || it.detail || it.role}</div>
        </div>
      ))}
    </div>
  );
}

function Proposal({ name, content, branding, accent, onAccent, token }) {
  const c = content;
  return (
    <div>
      {/* Hero */}
      <div style={{ background: '#0A0A0A', color: '#FFFFFF' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '30px 28px 72px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minHeight: 30 }}>
            {branding.hasLogo
              ? <img src={branding.logoUrl} alt="" style={{ height: 26, maxWidth: 200, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}/>
              : <span style={{ fontFamily: 'var(--font-display, Inter, sans-serif)', fontWeight: 800, fontSize: 18 }}>{name}</span>}
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono, monospace)', fontSize: 10, letterSpacing: '0.12em', color: '#9A9A9A' }}>UNCAP BLUEPRINT</span>
          </div>
          <div style={{ marginTop: 60 }}>
            <div style={{ display: 'inline-block', background: accent, color: onAccent, fontFamily: 'var(--font-mono, monospace)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 5 }}>Proposal for {name}</div>
            <h1 style={{ margin: '20px 0 0', fontFamily: 'var(--font-hero, Inter, sans-serif)', fontWeight: 800, fontSize: 'clamp(34px, 5vw, 62px)', letterSpacing: '-0.035em', lineHeight: 1.03, maxWidth: 900 }}>{c.headline}</h1>
            {c.subhead ? <div style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontStyle: 'italic', fontSize: 'clamp(17px, 2.2vw, 22px)', color: '#C9C7C0', marginTop: 20, maxWidth: 720 }}>{c.subhead}</div> : null}
          </div>
        </div>
      </div>

      {c.summary ? (
        <Section label="Overview">
          <p style={{ fontFamily: 'var(--font-display, Inter, sans-serif)', fontSize: 'clamp(19px, 2.4vw, 26px)', lineHeight: 1.5, letterSpacing: '-0.01em', margin: 0, maxWidth: 860 }}>{c.summary}</p>
        </Section>
      ) : null}

      {c.objectives && c.objectives.length ? (
        <Section label="Objectives" title="What this project delivers"><CardGrid items={c.objectives}/></Section>
      ) : null}

      {c.scope && c.scope.length ? (
        <Section label="Scope" title="What we will build" dark><CardGrid items={c.scope} dark/></Section>
      ) : null}

      {c.investment && (c.investment.total || (c.investment.installments || []).length) ? (
        <Section label="Investment" title="The investment">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 30, alignItems: 'flex-start' }}>
            <div style={{ flex: '0 0 auto' }}>
              <div style={{ fontFamily: 'var(--font-hero, Inter, sans-serif)', fontWeight: 800, fontSize: 'clamp(40px, 6vw, 68px)', letterSpacing: '-0.03em', lineHeight: 1 }}>{c.investment.total}</div>
              {c.investment.note ? <div style={{ fontSize: 14, color: '#4D4D4D', marginTop: 10, maxWidth: 320 }}>{c.investment.note}</div> : null}
            </div>
            {(c.investment.installments || []).length ? (
              <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {c.investment.installments.map((it, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', border: '1px solid #E4E1D8', borderRadius: 8, padding: '14px 18px', background: '#FFFFFF' }}>
                    <span style={{ fontSize: 14.5, fontWeight: 600 }}>{it.label}</span>
                    <span style={{ fontFamily: 'var(--font-display, Inter, sans-serif)', fontSize: 19, fontWeight: 750 }}>{it.amount}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      {c.timeline && (c.timeline.weeks || (c.timeline.phases || []).length) ? (
        <Section label="Timeline" title={c.timeline.weeks ? c.timeline.weeks + ', start to launch' : 'Timeline'}>
          {c.timeline.note ? <div style={{ fontSize: 15, color: '#4D4D4D', marginTop: -14, marginBottom: 24 }}>{c.timeline.note}</div> : null}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 0, border: '1px solid #E4E1D8', borderRadius: 10, overflow: 'hidden' }}>
            {c.timeline.phases.map((p, i) => (
              <div key={i} style={{ padding: 22, borderLeft: i ? '1px solid #E4E1D8' : 'none' }}>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10.5, letterSpacing: '0.1em', color: '#8A8780', textTransform: 'uppercase' }}>{p.weeks}</div>
                <div style={{ fontSize: 17, fontWeight: 700, marginTop: 8 }}>{p.name}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.55, color: '#4D4D4D', marginTop: 6 }}>{p.detail}</div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {c.team && c.team.length ? (
        <Section label="Team" title="Who you work with"><CardGrid items={c.team}/></Section>
      ) : null}

      {/* Approve */}
      <div style={{ background: '#0A0A0A', color: '#FFFFFF' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '64px 28px 80px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 14px', fontFamily: 'var(--font-hero, Inter, sans-serif)', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.03em' }}>Ready to build this?</h2>
          <div style={{ fontSize: 15, color: '#C9C7C0', maxWidth: 520, margin: '0 auto 26px' }}>Approve and sign to kick off. You will get a copy and your Uncap team is notified right away.</div>
          <ApproveButton brand={name} accent={accent} onAccent={onAccent} token={token}/>
        </div>
      </div>
      <div style={{ background: '#0A0A0A', color: '#707070', fontSize: 12, textAlign: 'center', padding: '0 28px 40px' }}>© {new Date().getFullYear()} Uncap · {name}</div>
    </div>
  );
}

// Signature modal + MSA, POSTing /api/auth/sign — same contract as the bespoke
// BPApproveButton so handleSign records the signature and notifies the team.
function ApproveButton({ brand, accent, onAccent, token }) {
  const MSA = (typeof window !== 'undefined' && window.UncapMSA) || null;
  const APPROVED_KEY = 'bptmpl_approved_' + brand.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const [state, setState] = useState(() => (window.sessionStorage.getItem(APPROVED_KEY) === '1') ? 'approved' : 'idle');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    if (!name.trim() || !title.trim()) { setError('Both fields are required'); return; }
    setState('submitting'); setError('');
    try {
      const resp = await fetch('/api/auth/sign', {
        method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: window.__bpToken || token || '', name: name.trim(), title: title.trim() }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.ok) { setError(data.error || 'Could not record the signature'); setState('signing'); return; }
      try { window.sessionStorage.setItem(APPROVED_KEY, '1'); } catch (_) {}
      setState('approved');
    } catch (_) { setError('Network error, try again.'); setState('signing'); }
  };

  if (state === 'approved') {
    return <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: accent, color: onAccent, borderRadius: 6, padding: '15px 30px', fontSize: 16, fontWeight: 700 }}>Approved ✓</div>;
  }
  const btn = { background: accent, color: onAccent, border: 'none', borderRadius: 6, padding: '15px 30px', fontSize: 16, fontWeight: 700, cursor: 'pointer' };
  if (state === 'idle' || state === 'approved') {
    return <button style={btn} onClick={() => setState('signing')}>Approve &amp; kick off →</button>;
  }
  // signing | submitting → modal
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', zIndex: 500, padding: '40px 16px' }}
      onClick={() => setState('idle')}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#FFFFFF', color: '#0A0A0A', borderRadius: 10, width: 560, maxWidth: '100%', padding: 28, textAlign: 'left' }}>
        <div style={{ fontFamily: 'var(--font-display, Inter, sans-serif)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>Approve &amp; kick off</div>
        <div style={{ fontSize: 13.5, color: '#4D4D4D', marginTop: 6 }}>Sign below to approve. This binds {brand} to the Master Services Agreement as the effective date.</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" style={inp}/>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={inp}/>
        </div>
        <div style={{ marginTop: 16, maxHeight: 300, overflowY: 'auto', border: '1px solid #E4E1D8', borderRadius: 8, padding: 16 }}>
          {MSA ? <MSA company={brand} name={name.trim()} title={title.trim()}/> : <div style={{ color: '#8A8780', fontSize: 13 }}>Loading agreement…</div>}
        </div>
        {error ? <div style={{ color: '#B5322B', fontSize: 13, marginTop: 12 }}>{error}</div> : null}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <button style={{ border: '1px solid #C9C7C0', background: 'transparent', color: '#4D4D4D', borderRadius: 6, padding: '12px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }} onClick={() => setState('idle')} disabled={state === 'submitting'}>Cancel</button>
          <button style={{ ...btn, padding: '12px 22px', fontSize: 14, opacity: state === 'submitting' ? 0.7 : 1 }} onClick={submit} disabled={state === 'submitting'}>{state === 'submitting' ? 'Recording…' : 'Sign & approve'}</button>
        </div>
      </div>
    </div>
  );
}

const inp = { flex: 1, padding: '12px 14px', border: '1px solid #C9C7C0', borderRadius: 6, fontSize: 15, background: '#FDFCF9', outline: 'none', color: '#0A0A0A', boxSizing: 'border-box' };

window.BlueprintTemplate = BlueprintTemplate;
