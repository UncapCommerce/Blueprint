// Uncap GO — customer portal. Passwordless (email + 6-digit code) sign-in
// for company contacts; view + signature only. The top navigation is fully
// static and identical for every client: Company / Discovery / Blueprint /
// Delivery / Growth.
const { useState, useEffect } = React;

// Local narrow-viewport hook (the portal doesn't load the shared _hooks.jsx).
function useIsNarrow() {
  const [narrow, setNarrow] = useState(typeof window !== 'undefined' && window.innerWidth <= 720);
  useEffect(() => {
    const on = () => setNarrow(window.innerWidth <= 720);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return narrow;
}

// Company-folder URLs: every client lives at /<companyId>/<tab>. The
// worker serves the discovery experience and blueprint proposal directly
// at their folder paths when they exist; this shell renders everything
// else (and the not-ready fallbacks for those two).
const PATH_MATCH = window.location.pathname.match(/^\/([a-z0-9-]+)\/(company|estimate|discovery|blueprint|onboarding|delivery|growth)\/?$/);
const URL_SLUG = PATH_MATCH ? PATH_MATCH[1] : '';
const URL_TAB = PATH_MATCH ? PATH_MATCH[2] : 'company';

function PortalApp() {
  const [state, setState] = useState('loading'); // loading | login | portal
  const [me, setMe] = useState(null);

  const load = async () => {
    try {
      // Pass the URL's company slug so an Uncap admin (no portal session) can
      // preview this company's hub exactly as the customer sees it.
      const resp = await fetch('/api/portal/me' + (URL_SLUG ? '?company=' + encodeURIComponent(URL_SLUG) : ''), { credentials: 'same-origin' });
      const data = await resp.json();
      if (resp.ok && data.ok) {
        // Everyone lands inside their own company folder.
        if (!PATH_MATCH || data.company.id !== URL_SLUG) {
          window.location.replace('/' + encodeURIComponent(data.company.id) + '/company');
          return;
        }
        setMe(data); setState('portal');
        return;
      }
    } catch (_) {}
    setState('login');
  };
  useEffect(() => { load(); }, []);

  if (state === 'loading') {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)', fontSize: 11, letterSpacing: '0.12em', color: '#707070' }}>LOADING…</div>;
  }
  if (state === 'login') return <PortalLogin onSignedIn={load}/>;
  return <Portal me={me} onSignOut={async () => {
    try { await fetch('/api/portal/logout', { method: 'POST', credentials: 'same-origin' }); } catch (_) {}
    window.location.replace('/');
  }}/>;
}

// ── Login ─────────────────────────────────────────────────────────────────
function PortalLogin({ onSignedIn }) {
  const [step, setStep] = useState('email'); // email | code
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const post = async (path, body) => {
    const resp = await fetch(path, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || data.ok === false) throw new Error(data.error || 'Something went wrong. Try again.');
    return data;
  };
  const requestCode = async () => {
    setErr(''); setBusy(true);
    try { await post('/api/portal/request-code', { email: email.trim() }); setStep('code'); }
    catch (e) { setErr(e.message); }
    setBusy(false);
  };
  const verify = async () => {
    setErr(''); setBusy(true);
    try { await post('/api/portal/verify', { email: email.trim(), code: code.trim() }); await onSignedIn(); }
    catch (e) { setErr(e.message); }
    setBusy(false);
  };

  const input = { width: '100%', padding: '13px 14px', border: '1px solid #C9C7C0', borderRadius: 5, fontSize: 15, background: '#FFFFFF', outline: 'none', color: '#0A0A0A', boxSizing: 'border-box' };
  const button = { width: '100%', marginTop: 12, border: 'none', background: '#0A0A0A', color: '#FFFFFF', borderRadius: 5, padding: '13px 16px', fontSize: 14.5, fontWeight: 650, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1 };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: 420, maxWidth: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
          <img src="/assets/uncap-logo-black.svg" alt="Uncap" style={{ height: 22, display: 'block' }}/>
          <span style={{ width: 1, height: 22, background: '#C9C7C0' }}></span>
          <span style={{ fontFamily: 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)', fontSize: 10, letterSpacing: '0.12em', color: '#707070' }}>HUB</span>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E4E1D8', borderRadius: 8, padding: 28 }}>
          {step === 'email' ? (
            <>
              <div style={{ fontFamily: 'var(--font-display, "Inter Display", Inter, sans-serif)', fontSize: 22, fontWeight: 750, letterSpacing: '-0.02em' }}>Sign in to your Hub.</div>
              <div style={{ fontSize: 14, color: '#4D4D4D', lineHeight: 1.55, marginTop: 8 }}>Enter your work email and we&#39;ll send you a six-digit code. No password needed.</div>
              <div style={{ marginTop: 18 }}>
                <input style={input} type="email" placeholder="you@company.com" value={email} autoFocus
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && email.trim()) requestCode(); }}/>
                <button style={button} disabled={busy} onClick={requestCode}>{busy ? 'Sending…' : 'Email me a code'}</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: 'var(--font-display, "Inter Display", Inter, sans-serif)', fontSize: 22, fontWeight: 750, letterSpacing: '-0.02em' }}>Check your inbox.</div>
              <div style={{ fontSize: 14, color: '#4D4D4D', lineHeight: 1.55, marginTop: 8 }}>If <b>{email.trim()}</b> has Hub access, a six-digit code is on its way. It expires in 10 minutes.</div>
              <div style={{ marginTop: 18 }}>
                <input style={{ ...input, fontFamily: 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)', letterSpacing: '0.35em', textAlign: 'center' }} inputMode="numeric" maxLength={6} placeholder="000000" value={code} autoFocus
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => { if (e.key === 'Enter' && code.trim().length === 6) verify(); }}/>
                <button style={button} disabled={busy} onClick={verify}>{busy ? 'Checking…' : 'Sign in'}</button>
                <div style={{ marginTop: 12, fontSize: 12.5, color: '#707070', textAlign: 'center', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setStep('email'); setCode(''); setErr(''); }}>Use a different email</div>
              </div>
            </>
          )}
          {err ? <div style={{ marginTop: 12, fontSize: 13, color: '#B5322B' }}>{err}</div> : null}
        </div>
        <div style={{ fontFamily: 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)', fontSize: 10, letterSpacing: '0.08em', color: '#9A9A9A', marginTop: 16, textAlign: 'center' }}>UNCAP · GO.UNCAP.COM</div>
      </div>
    </div>
  );
}

// ── Portal shell ──────────────────────────────────────────────────────────
// The landing ("Overview") keeps the /company URL slug so existing links and
// the admin "Open Hub" button still resolve. The rest map slug === lowercase.
const TABS = [
  { key: 'Overview',   slug: 'company' },
  { key: 'Estimate',   slug: 'estimate' },
  { key: 'Discovery',  slug: 'discovery' },
  { key: 'Blueprint',  slug: 'blueprint' },
  { key: 'Onboarding', slug: 'onboarding' },
];
const slugForTab = (key) => (TABS.find((t) => t.key === key) || TABS[0]).slug;
const tabForSlug = (slug) => (TABS.find((t) => t.slug === slug) || TABS[0]).key;

function Portal({ me, onSignOut }) {
  const co = me.company || {};
  const [tab, setTabState] = useState(tabForSlug(URL_TAB));
  // Every tab switches in place under the fixed toolbar; the discovery
  // and blueprint experiences load framed below it, so the customer never
  // leaves the shell (or their session).
  const setTab = (t) => {
    setTabState(t);
    try { window.history.replaceState(null, '', '/' + co.id + '/' + slugForTab(t)); } catch (_) {}
  };
  const framed = (tab === 'Discovery' && me.discovery) || (tab === 'Blueprint' && me.blueprint);

  const MONO = 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)';
  const isMobile = useIsNarrow();
  const logo = (
    <div onClick={() => setTab('Overview')} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto', cursor: 'pointer' }}>
      <img src="/assets/uncap-logo-white.svg" alt="Uncap" style={{ height: 13, display: 'block' }}/>
      <span style={{ width: 1, height: 14, background: '#4D4D4D' }}></span>
      <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.12em', color: '#9A9A9A' }}>HUB</span>
      {me.preview ? <span style={{ marginLeft: 4, fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color: '#0A0A0A', background: 'var(--uc-signal, #E8FF52)', borderRadius: 3, padding: '2px 6px' }}>PREVIEW</span> : null}
    </div>
  );
  const tabBtn = (t) => (
    <button key={t.key} onClick={() => setTab(t.key)}
      style={{ border: 'none', background: tab === t.key ? '#FFFFFF' : 'transparent', color: tab === t.key ? '#0A0A0A' : '#D4D2CC', borderRadius: 4, padding: '4px 11px', fontSize: 12, fontWeight: tab === t.key ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'background 180ms, color 180ms' }}>{t.key}</button>
  );
  const signOutBtn = (
    <button onClick={onSignOut} style={{ border: '1px solid #4D4D4D', background: 'transparent', color: '#FFFFFF', borderRadius: 4, padding: '3px 9px', fontSize: 10.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>Sign out</button>
  );
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: '0 0 auto', background: '#0A0A0A', zIndex: 50 }}>
        {isMobile ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, height: 44, padding: '0 14px' }}>
              {logo}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span style={{ fontSize: 11.5, fontWeight: 650, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130 }}>{co.name || ''}</span>
                {signOutBtn}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '0 10px 8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {TABS.map(tabBtn)}
            </div>
          </>
        ) : (
          <div style={{ width: '100%', boxSizing: 'border-box', height: 34, display: 'flex', alignItems: 'center', gap: 16, padding: '0 16px' }}>
            {logo}
            <div style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', gap: 2, overflowX: 'auto' }}>
              {TABS.map(tabBtn)}
            </div>
            <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11.5, fontWeight: 650, color: '#FFFFFF', whiteSpace: 'nowrap' }}>{co.name || ''}</span>
              <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.04em', color: '#9A9A9A', whiteSpace: 'nowrap' }}>{me.email}</span>
              {signOutBtn}
            </div>
          </div>
        )}
      </div>

      {framed ? (
        <iframe title={tab} src={'/' + co.id + '/' + slugForTab(tab) + '/app'}
          style={{ flex: '1 1 auto', width: '100%', border: 'none', display: 'block', background: '#F2EFE7' }}/>
      ) : (
        <div style={{ flex: '1 1 auto', overflowY: 'auto' }}>
          <div style={{ maxWidth: 1180, width: '100%', margin: '0 auto', padding: '30px 24px 60px', boxSizing: 'border-box' }}>
            {tab === 'Overview' && <OverviewTab me={me}/>}
            {tab === 'Estimate' && <StatusPage eyebrow="ESTIMATE" title="Coming soon" note="Your estimate will live here. We're putting this together and will share it with you shortly."/>}
            {tab === 'Discovery' && <DiscoveryTab me={me}/>}
            {tab === 'Blueprint' && <BlueprintTab me={me}/>}
            {tab === 'Onboarding' && <StatusPage eyebrow="ONBOARDING" title="Coming soon" note="Once your blueprint is approved, your kickoff details, access checklist, and project start plan will appear here."/>}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPage({ eyebrow, title, note }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E4E1D8', borderRadius: 8, minHeight: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 }}>
      <div style={{ fontFamily: 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)', fontSize: 11, letterSpacing: '0.14em', color: '#9A9A9A' }}>{eyebrow}</div>
      <div style={{ fontFamily: 'var(--font-display, "Inter Display", Inter, sans-serif)', fontSize: 30, fontWeight: 750, letterSpacing: '-0.02em', marginTop: 12 }}>{title}</div>
      <div style={{ fontSize: 14.5, color: '#4D4D4D', lineHeight: 1.6, marginTop: 10, maxWidth: 460 }}>{note}</div>
    </div>
  );
}

// ── Overview (landing): sales process + company info ──────────────────────
const DISP = 'var(--font-display, "Inter Display", Inter, sans-serif)';
const MONO = 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)';
const SIGNAL = '#E8FF4E';

// The engagement stages, in order. A stage is "done" when its position is at
// or below the company's current furthest stage, derived from what exists:
// signed blueprint → Onboarding, viewable blueprint → Blueprint, discovery →
// Discovery, otherwise Alignment. (Estimate has no signal yet, so it simply
// checks off once we've progressed past it.)
const PROCESS_STEPS = [
  { n: 1, label: 'Alignment',  desc: 'Goals, scope, and fit confirmed.' },
  { n: 2, label: 'Estimate',   desc: 'Ballpark investment and timeline.' },
  { n: 3, label: 'Discovery',  desc: 'Deep dive into your systems and requirements.' },
  { n: 4, label: 'Blueprint',  desc: 'Your fixed-scope proposal to review and approve.' },
  { n: 5, label: 'Onboarding', desc: 'Kickoff, access, and project start.' },
];

function InfoRow({ label, value }) {
  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.12em', color: '#9A9A9A' }}>{label}</div>
      <div style={{ fontSize: 14, color: '#1A1A1A', marginTop: 3, wordBreak: 'break-word' }}>{value}</div>
    </div>
  );
}

function OverviewTab({ me }) {
  const co = me.company || {};
  const narrow = useIsNarrow();
  const card = { background: '#FFFFFF', border: '1px solid #E4E1D8', borderRadius: 8, padding: 26 };
  const eyebrow = { fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.14em', color: '#9A9A9A' };
  const stage = me.signed ? 5 : me.blueprint ? 4 : me.discovery ? 3 : 1;
  const site = co.storeUrl ? (/^https?:\/\//.test(co.storeUrl) ? co.storeUrl : 'https://' + co.storeUrl) : '';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : '2fr 1fr', gap: 20, alignItems: 'start' }}>
      {/* 2/3 — sales process */}
      <div style={card}>
        <div style={eyebrow}>YOUR ENGAGEMENT</div>
        <div style={{ fontFamily: DISP, fontSize: 24, fontWeight: 750, letterSpacing: '-0.02em', marginTop: 8, marginBottom: 24 }}>The path to launch</div>
        <div>
          {PROCESS_STEPS.map((s, i) => {
            const done = s.n <= stage;
            const current = s.n === stage;
            const last = i === PROCESS_STEPS.length - 1;
            return (
              <div key={s.n} style={{ display: 'grid', gridTemplateColumns: '32px 1fr', columnGap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flex: '0 0 auto', boxSizing: 'border-box',
                    background: done ? SIGNAL : '#FFFFFF', border: done ? '1px solid ' + SIGNAL : '1px solid #D9D6CD',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: MONO, fontSize: 12, fontWeight: 700, color: done ? '#0A0A0A' : '#9A9A9A'
                  }}>
                    {done
                      ? <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2 6 L5 9 L10 3" stroke="#0A0A0A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : s.n}
                  </div>
                  {!last ? <div style={{ width: 2, flex: '1 1 auto', minHeight: 24, background: s.n < stage ? SIGNAL : '#E4E1D8', marginTop: 3, marginBottom: 3 }}/> : null}
                </div>
                <div style={{ paddingBottom: last ? 0 : 20, paddingTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: DISP, fontSize: 16.5, fontWeight: 700, letterSpacing: '-0.01em', color: done ? '#0A0A0A' : '#9A9A9A' }}>{s.label}</span>
                    {current ? <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#0A0A0A', background: SIGNAL, borderRadius: 3, padding: '2px 7px' }}>CURRENT</span> : null}
                    {done && !current ? <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#2E7D32' }}>DONE</span> : null}
                  </div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.5, color: done ? '#4D4D4D' : '#9A9A9A', marginTop: 3 }}>{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 1/3 — company info + contacts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={card}>
          {co.hasLogo ? <img src={'/api/company/logo?id=' + encodeURIComponent(co.id)} alt="" style={{ height: 42, maxWidth: 180, objectFit: 'contain', display: 'block', marginBottom: 14 }}/> : null}
          <div style={{ fontFamily: DISP, fontSize: 22, fontWeight: 750, letterSpacing: '-0.02em' }}>{co.name}</div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {site ? <InfoRow label="WEBSITE" value={<a href={site} target="_blank" rel="noreferrer" style={{ color: '#1A1A1A', textDecoration: 'underline' }}>{co.storeUrl}</a>}/> : null}
            {co.address ? <InfoRow label="ADDRESS" value={co.address}/> : null}
            {co.leadContact ? <InfoRow label="CONTACT" value={<span>{co.leadContact.name || co.leadContact.email}{co.leadContact.email && co.leadContact.name ? <span style={{ display: 'block', fontSize: 12.5, color: '#707070', marginTop: 1 }}>{co.leadContact.email}</span> : null}</span>}/> : null}
          </div>
        </div>

        <div style={card}>
          <div style={eyebrow}>CONTACTS</div>
          <div style={{ marginTop: 14 }}>
            {co.leadContact ? <Contact c={co.leadContact} lead/> : null}
            {(co.contacts || []).map((c) => <Contact key={c.email} c={c}/>)}
            {!co.leadContact && (co.contacts || []).length === 0 ? <div style={{ fontSize: 14, color: '#707070' }}>No contacts on file.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Contact({ c, lead }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F2EFE7' }}>
      <span style={{ width: 34, height: 34, borderRadius: '50%', background: lead ? '#0A0A0A' : '#F2EFE7', color: lead ? '#E8FF4E' : '#4D4D4D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flex: '0 0 auto' }}>
        {(c.name || c.email || '?').trim()[0].toUpperCase()}
      </span>
      <div style={{ flex: '1 1 auto', minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 650 }}>{c.name || c.email}{lead ? <span style={{ fontFamily: 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)', fontSize: 9, letterSpacing: '0.08em', color: '#707070', marginLeft: 8 }}>LEAD</span> : null}</div>
        <div style={{ fontSize: 12.5, color: '#707070', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{[c.title, c.email].filter(Boolean).join(' · ')}</div>
      </div>
    </div>
  );
}

// ── Discovery / Blueprint tabs ────────────────────────────────────────────
function DiscoveryTab({ me }) {
  if (!me.discovery) {
    return <StatusPage eyebrow="DISCOVERY" title="Completed manually" note="This discovery was completed manually with your Uncap team. There is nothing you need to do here."/>;
  }
  const done = me.discovery.status === 'complete';
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E4E1D8', borderRadius: 8, minHeight: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 }}>
      <div style={{ fontFamily: 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)', fontSize: 11, letterSpacing: '0.14em', color: '#9A9A9A' }}>DISCOVERY</div>
      <div style={{ fontFamily: 'var(--font-display, "Inter Display", Inter, sans-serif)', fontSize: 30, fontWeight: 750, letterSpacing: '-0.02em', marginTop: 12 }}>{done ? 'Your discovery is complete.' : 'Your discovery is ready.'}</div>
      <div style={{ fontSize: 14.5, color: '#4D4D4D', lineHeight: 1.6, marginTop: 10, maxWidth: 460 }}>
        {done ? 'Review your answers any time. Your Uncap team is turning them into your blueprint.' : 'Walk through it with your Uncap team, or review and complete your answers any time.'}
      </div>
      <a href={me.discovery.url} style={{ marginTop: 22, background: '#0A0A0A', color: '#FFFFFF', borderRadius: 5, padding: '13px 24px', fontSize: 14.5, fontWeight: 650, textDecoration: 'none' }}>Open your discovery →</a>
    </div>
  );
}

function BlueprintTab({ me }) {
  if (!me.blueprint) {
    return <StatusPage eyebrow="BLUEPRINT" title="Under Review" note="Your blueprint is being crafted from your discovery. It will unlock here the moment it is ready."/>;
  }
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E4E1D8', borderRadius: 8, minHeight: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 }}>
      <div style={{ fontFamily: 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)', fontSize: 11, letterSpacing: '0.14em', color: '#9A9A9A' }}>BLUEPRINT</div>
      <div style={{ fontFamily: 'var(--font-display, "Inter Display", Inter, sans-serif)', fontSize: 30, fontWeight: 750, letterSpacing: '-0.02em', marginTop: 12 }}>Your blueprint is ready.</div>
      <div style={{ fontSize: 14.5, color: '#4D4D4D', lineHeight: 1.6, marginTop: 10, maxWidth: 460 }}>Review the proposal, then approve and sign right on the page when you are ready to kick off.</div>
      <a href={me.blueprint.url} style={{ marginTop: 22, background: '#0A0A0A', color: '#FFFFFF', borderRadius: 5, padding: '13px 24px', fontSize: 14.5, fontWeight: 650, textDecoration: 'none' }}>Open your blueprint →</a>
    </div>
  );
}
