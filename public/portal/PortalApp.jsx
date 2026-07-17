// Uncap GO — customer portal. Passwordless (email + 6-digit code) sign-in
// for company contacts; view + signature only. The top navigation is fully
// static and identical for every client: Company / Discovery / Blueprint /
// Delivery / Growth.
const { useState, useEffect } = React;

function PortalApp() {
  const [state, setState] = useState('loading'); // loading | login | portal
  const [me, setMe] = useState(null);

  const load = async () => {
    try {
      const resp = await fetch('/api/portal/me', { credentials: 'same-origin' });
      const data = await resp.json();
      if (resp.ok && data.ok) { setMe(data); setState('portal'); return; }
    } catch (_) {}
    setState('login');
  };
  useEffect(() => { load(); }, []);

  if (state === 'loading') {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '0.12em', color: '#707070' }}>LOADING…</div>;
  }
  if (state === 'login') return <PortalLogin onSignedIn={load}/>;
  return <Portal me={me} onSignOut={async () => {
    try { await fetch('/api/portal/logout', { method: 'POST', credentials: 'same-origin' }); } catch (_) {}
    setMe(null); setState('login');
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
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.12em', color: '#707070' }}>CLIENT PORTAL</span>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E4E1D8', borderRadius: 8, padding: 28 }}>
          {step === 'email' ? (
            <>
              <div style={{ fontSize: 22, fontWeight: 750, letterSpacing: '-0.02em' }}>Sign in to your portal.</div>
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
              <div style={{ fontSize: 22, fontWeight: 750, letterSpacing: '-0.02em' }}>Check your inbox.</div>
              <div style={{ fontSize: 14, color: '#4D4D4D', lineHeight: 1.55, marginTop: 8 }}>If <b>{email.trim()}</b> has portal access, a six-digit code is on its way. It expires in 10 minutes.</div>
              <div style={{ marginTop: 18 }}>
                <input style={{ ...input, fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.35em', textAlign: 'center' }} inputMode="numeric" maxLength={6} placeholder="000000" value={code} autoFocus
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => { if (e.key === 'Enter' && code.trim().length === 6) verify(); }}/>
                <button style={button} disabled={busy} onClick={verify}>{busy ? 'Checking…' : 'Sign in'}</button>
                <div style={{ marginTop: 12, fontSize: 12.5, color: '#707070', textAlign: 'center', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setStep('email'); setCode(''); setErr(''); }}>Use a different email</div>
              </div>
            </>
          )}
          {err ? <div style={{ marginTop: 12, fontSize: 13, color: '#B5322B' }}>{err}</div> : null}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.08em', color: '#9A9A9A', marginTop: 16, textAlign: 'center' }}>UNCAP · GO.UNCAP.COM</div>
      </div>
    </div>
  );
}

// ── Portal shell ──────────────────────────────────────────────────────────
const TABS = ['Company', 'Discovery', 'Blueprint', 'Delivery', 'Growth'];

function Portal({ me, onSignOut }) {
  const [tab, setTab] = useState('Company');
  const co = me.company || {};

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: '0 0 auto', background: 'rgba(242,239,231,0.94)', borderBottom: '1px solid #C9C7C0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', height: 62, display: 'flex', alignItems: 'center', gap: 22, padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto' }}>
            <img src="/assets/uncap-logo-black.svg" alt="Uncap" style={{ height: 19, display: 'block' }}/>
            <span style={{ width: 1, height: 20, background: '#C9C7C0' }}></span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.12em', color: '#707070' }}>CLIENT PORTAL</span>
          </div>
          <div style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto' }}>
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ border: 'none', background: tab === t ? '#0A0A0A' : 'transparent', color: tab === t ? '#FFFFFF' : '#1A1A1A', borderRadius: 5, padding: '8px 14px', fontSize: 13.5, fontWeight: tab === t ? 650 : 500, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 180ms' }}>{t}</button>
            ))}
          </div>
          <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 650, whiteSpace: 'nowrap' }}>{co.name || ''}</span>
            <button onClick={onSignOut} style={{ border: '1px solid #C9C7C0', background: 'transparent', color: '#4D4D4D', borderRadius: 5, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Sign out</button>
          </div>
        </div>
      </div>

      <div style={{ flex: '1 1 auto', maxWidth: 1180, width: '100%', margin: '0 auto', padding: '30px 24px 60px', boxSizing: 'border-box' }}>
        {tab === 'Company' && <CompanyTab me={me}/>}
        {tab === 'Discovery' && <DiscoveryTab me={me}/>}
        {tab === 'Blueprint' && <BlueprintTab me={me}/>}
        {tab === 'Delivery' && <StatusPage eyebrow="DELIVERY" title="Under Review" note="Your delivery plan is being prepared. It will appear here as soon as it is ready."/>}
        {tab === 'Growth' && <StatusPage eyebrow="GROWTH" title="Under Review" note="Your growth program is being prepared. It will appear here as soon as it is ready."/>}
      </div>
    </div>
  );
}

function StatusPage({ eyebrow, title, note }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E4E1D8', borderRadius: 8, minHeight: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 }}>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '0.14em', color: '#9A9A9A' }}>{eyebrow}</div>
      <div style={{ fontSize: 30, fontWeight: 750, letterSpacing: '-0.02em', marginTop: 12 }}>{title}</div>
      <div style={{ fontSize: 14.5, color: '#4D4D4D', lineHeight: 1.6, marginTop: 10, maxWidth: 460 }}>{note}</div>
    </div>
  );
}

// ── Company tab ───────────────────────────────────────────────────────────
const FILE_KIND_LABEL = { rfp: 'RFP', brief: 'Technical Brief', doc: 'Document' };

function CompanyTab({ me }) {
  const co = me.company || {};
  const card = { background: '#FFFFFF', border: '1px solid #E4E1D8', borderRadius: 8, padding: 26 };
  const eyebrow = { fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, letterSpacing: '0.14em', color: '#9A9A9A' };
  const chip = { display: 'inline-block', border: '1px solid #E4E1D8', background: '#FBFAF7', borderRadius: 999, padding: '5px 12px', fontSize: 12.5, fontWeight: 600, color: '#1A1A1A', marginRight: 8, marginTop: 8 };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {co.hasLogo ? <img src={'/api/company/logo?id=' + encodeURIComponent(co.id)} alt="" style={{ height: 46, maxWidth: 190, objectFit: 'contain', display: 'block' }}/> : null}
            <div>
              <div style={{ fontSize: 26, fontWeight: 750, letterSpacing: '-0.02em' }}>{co.name}</div>
              {co.storeUrl ? <a href={/^https?:\/\//.test(co.storeUrl) ? co.storeUrl : 'https://' + co.storeUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13.5, color: '#4D4D4D' }}>{co.storeUrl}</a> : null}
            </div>
          </div>
          {co.description ? <div style={{ fontSize: 14.5, lineHeight: 1.65, color: '#4D4D4D', marginTop: 16 }}>{co.description}</div> : null}
          <div style={{ marginTop: 10 }}>
            {co.platform ? <span style={chip}>Platform · {co.platform}</span> : null}
            {co.erp ? <span style={chip}>ERP · {co.erp}</span> : null}
            {co.address ? <span style={chip}>{co.address}</span> : null}
          </div>
          {co.palette ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
              <span style={eyebrow}>BRAND PALETTE</span>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: co.palette.prime, border: '1px solid #E4E1D8' }}></span>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: co.palette.accent, border: '1px solid #E4E1D8' }}></span>
            </div>
          ) : null}
        </div>

        <div style={card}>
          <div style={eyebrow}>DOCUMENTS</div>
          {(co.files || []).length === 0 ? (
            <div style={{ fontSize: 14, color: '#707070', marginTop: 12 }}>No documents shared yet.</div>
          ) : (
            <div style={{ marginTop: 14 }}>
              {co.files.map((f) => (
                <a key={f.fid} href={'/api/portal/file?fid=' + encodeURIComponent(f.fid)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid #F2EFE7', textDecoration: 'none', color: '#0A0A0A' }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, letterSpacing: '0.08em', background: '#0A0A0A', color: '#FFFFFF', borderRadius: 4, padding: '3px 8px', flex: '0 0 auto' }}>{(FILE_KIND_LABEL[f.kind] || 'Document').toUpperCase()}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, flex: '1 1 auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                  <span style={{ fontSize: 12, color: '#9A9A9A', flex: '0 0 auto' }}>{f.size ? Math.max(1, Math.round(f.size / 1024)) + ' KB' : ''} ↓</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={card}>
        <div style={eyebrow}>YOUR TEAM</div>
        <div style={{ marginTop: 14 }}>
          {co.leadContact ? <Contact c={co.leadContact} lead/> : null}
          {(co.contacts || []).map((c) => <Contact key={c.email} c={c}/>)}
          {!co.leadContact && (co.contacts || []).length === 0 ? <div style={{ fontSize: 14, color: '#707070' }}>No contacts on file.</div> : null}
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
        <div style={{ fontSize: 14, fontWeight: 650 }}>{c.name || c.email}{lead ? <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: '0.08em', color: '#707070', marginLeft: 8 }}>LEAD</span> : null}</div>
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
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '0.14em', color: '#9A9A9A' }}>DISCOVERY</div>
      <div style={{ fontSize: 30, fontWeight: 750, letterSpacing: '-0.02em', marginTop: 12 }}>{done ? 'Your discovery is complete.' : 'Your discovery is ready.'}</div>
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
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '0.14em', color: '#9A9A9A' }}>BLUEPRINT</div>
      <div style={{ fontSize: 30, fontWeight: 750, letterSpacing: '-0.02em', marginTop: 12 }}>Your blueprint is ready.</div>
      <div style={{ fontSize: 14.5, color: '#4D4D4D', lineHeight: 1.6, marginTop: 10, maxWidth: 460 }}>Review the proposal, then approve and sign right on the page when you are ready to kick off.</div>
      <a href={me.blueprint.url} style={{ marginTop: 22, background: '#0A0A0A', color: '#FFFFFF', borderRadius: 5, padding: '13px 24px', fontSize: 14.5, fontWeight: 650, textDecoration: 'none' }}>Open your blueprint →</a>
    </div>
  );
}
