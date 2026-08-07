/* global React, ReactDOM */
// Client-facing estimate one-pager. A faithful React port of the Uncap
// "Project Estimate" template: black header + range card, an interactive scope
// selector with a live sticky cart, a Gantt timeline, a Managed Growth plan
// comparison, and a next-step CTA. Dynamic data (client name, foundation range,
// modules + prices + pre-selection, integrations, weeks, note) comes from
// /api/estimate/content; the presentation scaffolding below is Uncap-standard.
const { useState, useEffect } = React;
const RATE = 145;

// Per-group framing copy, merged onto the groups the API returns by key.
const GROUP_META = {
  growth: { eyebrow: 'Advanced solutions', blurb: 'Growth infrastructure positioned to scale from day one.' },
  b2b:    { eyebrow: 'B2B enablement', blurb: 'Turn the storefront into a B2B channel your buyers actually use.' },
  data:   { eyebrow: 'Beyond the baseline', blurb: 'Migrate the records the standard import cannot reach.' },
  sys:    { eyebrow: 'Connect your stack', blurb: 'Sync the rest of your operational systems with the storefront.' },
};

// What every Shopify Build includes (shown under the foundation card).
const FOUNDATION_ITEMS = [
  { name: 'Commerce Blueprint', desc: 'Discovery, solution architecture, ecommerce strategy.' },
  { name: 'Shopify implementation', desc: 'Platform setup, payments, shipping, taxes.' },
  { name: 'Theme styling & config', desc: 'Header, nav, home, collection, product, cart.' },
  { name: 'Products & content migration', desc: 'Up to 1,000 products, 100 collections, 100 blogs.' },
  { name: 'App setup', desc: 'Up to 10 apps installed and configured.' },
  { name: 'Testing, QA & UAT', desc: 'Full pre-launch validation with your team.' },
  { name: 'Training & SOPs', desc: 'Team enablement and handover docs.' },
  { name: 'Launch & support', desc: 'Go-live plus post-launch coverage.' },
];

// Post-launch managed-growth retainers (separate from the build estimate).
const PLANS = [
  { id: 'core', name: 'Core', sub: 'Advisory + essentials', price: '$2,500' },
  { id: 'optimize', name: 'Optimize', sub: 'Most popular', price: '$5,000' },
  { id: 'accelerate', name: 'Accelerate', sub: 'Embedded partner', price: '$7,500+' },
];
const GROWTH_ROWS = [
  { label: 'Engagement model', v: ['Advisory-first support & essential execution', 'Operational optimization & execution', 'Embedded growth partnership'] },
  { label: 'Service capacity', v: ['15 hrs / month', '35 hrs / month', '50+ hrs / month'] },
  { label: 'Strategic planning', v: ['Monthly assessment & roadmap', 'Monthly assessment & roadmap', 'Bi-weekly strategy & planning'] },
  { label: 'Exec alignment', v: ['Video walkthrough responses', 'Allocated 1-1 office hours', 'Quarterly mastermind session'] },
  { label: 'CRO services', v: ['—', 'Essential CRO', 'Dedicated CRO, SEO/GEO & retention'] },
  { label: 'Cadence', v: ['Monthly call', 'Bi-weekly calls', 'Weekly calls'] },
  { label: 'Account management', v: ['Shared delivery team', 'Senior-led delivery', 'Dedicated account manager'] },
  { label: 'Reporting', v: ['Monthly', 'Monthly', 'Bi-weekly performance review'] },
  { label: 'Primary focus', v: ['Stability & direction', 'Lower TCO, efficiency, controlled growth', 'Velocity, experimentation & scale'] },
];

// Gantt bar shape (fractions of the total timeline).
const GANTT = [
  { name: 'Blueprint', s: 0.00, e: 0.15, bar: 'var(--uc-signal)' },
  { name: 'Design', s: 0.12, e: 0.36, bar: '#C9DE4A' },
  { name: 'Build', s: 0.30, e: 0.76, bar: '#FF8B37' },
  { name: 'Integration', s: 0.46, e: 0.86, bar: '#8A8A8A' },
  { name: 'Migrate', s: 0.46, e: 0.93, bar: 'var(--uc-stone-500)' },
  { name: 'Launch', s: 0.88, e: 1.00, bar: '#4D4D4D' },
];

const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
const hrs = (n) => Math.round(n / RATE / 5) * 5;
const priceLabel = (it) => it.low === it.high ? money(it.low) : money(it.low) + ' – ' + money(it.high);
const hoursLabel = (it) => it.low === it.high ? hrs(it.low) + ' hrs' : hrs(it.low) + '–' + hrs(it.high) + ' hrs';

function rowStyle(checked) {
  return {
    display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 18px',
    borderRadius: 10, cursor: 'pointer', transition: 'border-color 120ms, background 120ms',
    border: '1px solid ' + (checked ? 'var(--uc-black)' : 'var(--line-1)'),
    background: checked ? 'var(--uc-bone)' : 'var(--uc-paper)',
  };
}
function boxStyle(checked, round) {
  return {
    flex: '0 0 auto', width: 22, height: 22, marginTop: 1,
    borderRadius: round ? 999 : 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: checked ? 'var(--uc-black)' : 'transparent',
    border: '1.5px solid ' + (checked ? 'var(--uc-black)' : 'var(--uc-stone-500)'),
    background: checked ? 'var(--uc-signal)' : 'transparent',
  };
}
const Check = ({ w = 13 }) => (
  <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

// Shown in place of the CTA once the client approves.
const APPROVE_MSG = 'Uncap team has been notified and will get back to you with the instructions of the next step.';
function ApprovedNote() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px 18px', background: 'var(--uc-bone)', border: '1px solid var(--uc-black)', borderRadius: 12 }}>
      <span style={{ flex: '0 0 auto', width: 24, height: 24, borderRadius: 999, background: 'var(--uc-signal)', color: 'var(--uc-black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check w={13}/></span>
      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 14.5, lineHeight: 1.5, color: 'var(--fg-1)' }}>{APPROVE_MSG}</span>
    </div>
  );
}

function Eyebrow({ n, label, right, dark }) {
  const line = dark ? '#1F1F1F' : 'var(--line-1)';
  const fg = dark ? 'var(--uc-paper)' : 'var(--fg-1)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 'clamp(28px,3.6vw,44px)' }}>
      <span style={{ width: 16, height: 2, background: 'var(--uc-signal)' }}/>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: fg }}>{n}</span>
      <span style={{ width: 28, height: 1, background: line }}/>
      <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: fg }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: line }}/>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: dark ? 'var(--uc-stone-500)' : 'var(--fg-3)' }}>{right}</span>
    </div>
  );
}

function EstimateTemplate() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [selected, setSelected] = useState({});
  const [integration, setIntegration] = useState('');
  const [plan, setPlan] = useState('optimize');
  const [baseline, setBaseline] = useState({ sel: {}, integ: '' });
  const [approve, setApprove] = useState('idle'); // idle | sending | done | error
  const [approveErr, setApproveErr] = useState('');

  const cid = (window.location.pathname.match(/^\/([a-z0-9-]+)\/estimate/) || [])[1] || '';

  useEffect(() => {
    fetch('/api/estimate/content?company=' + encodeURIComponent(cid), { credentials: 'include' })
      .then((r) => r.json().then((j) => (r.ok ? j : Promise.reject(j))))
      .then((d) => {
        setData(d);
        const sel = {};
        (d.groups || []).forEach((g) => g.modules.forEach((mo) => { if (mo.preselected) sel[mo.id] = true; }));
        const integ = ((d.integrations || []).find((i) => i.preselected) || (d.integrations || []).find((i) => i.low === 0) || (d.integrations || [])[0] || {}).id || '';
        setSelected(sel); setIntegration(integ);
        if (d.growthPlan) setPlan(d.growthPlan);
        if (d.approved) setApprove('done');
        setBaseline({ sel: { ...sel }, integ });
      })
      .catch((e) => setErr((e && e.error) || 'Unable to load your estimate.'));
  }, []);

  // Approve the estimate + ask to schedule discovery. Notifies the Uncap team;
  // both CTAs share this one state so approving from either flips both.
  const approveNow = () => {
    if (approve === 'sending' || approve === 'done') return;
    setApprove('sending'); setApproveErr('');
    fetch('/api/estimate/approve', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ company: cid }) })
      .then((r) => r.json().then((j) => (r.ok && j.ok ? j : Promise.reject(j))))
      .then(() => setApprove('done'))
      .catch((e) => { setApprove('error'); setApproveErr((e && e.error) || 'Could not submit right now. Please try again.'); });
  };

  if (err) {
    return <div style={{ maxWidth: 520, margin: '80px auto', textAlign: 'center', fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--fg-2)', padding: 24 }}>{err}</div>;
  }
  if (!data) {
    // On-brand skeleton (dark header + range card + scope rows) so the page has
    // shape immediately instead of a bare "LOADING…" flash.
    const blk = (w, h, r, bg) => ({ width: w, height: h, borderRadius: r || 8, background: bg || 'rgba(0,0,0,0.06)' });
    return (
      <div style={{ background: 'var(--uc-cream)', minHeight: '100vh' }}>
        <style>{'@keyframes uSkPulse{0%,100%{opacity:.5}50%{opacity:.9}} .uSk>*{animation:uSkPulse 1.3s ease-in-out infinite}'}</style>
        <div style={{ background: 'var(--uc-black)', padding: 'clamp(28px,3vw,44px) clamp(24px,5vw,72px)' }}>
          <div className="uSk" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1.25fr) minmax(0,1fr)', gap: 'clamp(32px,5vw,72px)' }}>
            <div>
              <div style={blk('180px', '11px', 999, '#1F1F1F')}/>
              <div style={{ ...blk('62%', '46px', 10, '#1F1F1F'), marginTop: 18 }}/>
              <div style={{ ...blk('82%', '15px', 6, '#1F1F1F'), marginTop: 16 }}/>
            </div>
            <div style={{ border: '1px solid #1F1F1F', borderRadius: 10, padding: 22 }}>
              <div style={blk('120px', '11px', 999, '#1F1F1F')}/>
              <div style={{ ...blk('70%', '40px', 8, '#1F1F1F'), marginTop: 16 }}/>
              <div style={{ ...blk('50%', '12px', 6, '#1F1F1F'), marginTop: 16 }}/>
            </div>
          </div>
        </div>
        <div className="uSk" style={{ maxWidth: 1200, margin: '40px auto', padding: '0 clamp(24px,5vw,72px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[0, 1, 2, 3].map((i) => <div key={i} style={{ ...blk('100%', '70px', 10), border: '1px solid var(--line-1)' }}/>)}
        </div>
      </div>
    );
  }

  const client = data.clientName || 'Your team';
  const weeks = data.weeks || 14;
  const foundation = data.foundation || { low: 18850, high: 26100 };
  const groups = (data.groups || []).map((g) => ({ ...g, ...(GROUP_META[g.key] || { eyebrow: '', blurb: '' }) }));
  const integrations = data.integrations || [];
  const integ = integrations.find((i) => i.id === integration) || integrations[0] || { low: 0, high: 0 };

  const toggle = (id) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const allModules = groups.flatMap((g) => g.modules);

  // Running total + cart.
  let low = foundation.low, high = foundation.high;
  const cartLines = [{ key: 'foundation', name: 'Shopify Build', sub: 'ALWAYS INCLUDED', label: priceLabel(foundation), removable: false }];
  allModules.forEach((mo) => {
    if (!selected[mo.id]) return;
    low += mo.low; high += mo.high;
    cartLines.push({ key: mo.id, name: mo.name, sub: '', label: priceLabel(mo), removable: true, onRemove: () => toggle(mo.id) });
  });
  if (integ && integ.low > 0) {
    low += integ.low; high += integ.high;
    cartLines.push({ key: 'integ', name: integ.name, sub: 'ERP INTEGRATION', label: priceLabel(integ), removable: true, onRemove: () => setIntegration((integrations.find((i) => i.low === 0) || {}).id || '') });
  }
  const addonCount = allModules.filter((mo) => selected[mo.id]).length + (integ && integ.low > 0 ? 1 : 0);
  const changed = allModules.some((mo) => !!selected[mo.id] !== !!baseline.sel[mo.id]) || integration !== baseline.integ;
  const reset = () => { setSelected({ ...baseline.sel }); setIntegration(baseline.integ); };

  // Gantt geometry.
  const gantt = GANTT.map((p) => ({ name: p.name, bar: p.bar, left: (p.s * 100).toFixed(2) + '%', width: ((p.e - p.s) * 100).toFixed(2) + '%', wk: Math.max(1, Math.round(weeks * (p.e - p.s))) + ' wk' }));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ label: f === 0 ? 'Wk 1' : 'Wk ' + Math.round(weeks * f), left: (f * 100) + '%', shift: f === 0 ? 'translateX(0)' : (f === 1 ? 'translateX(-100%)' : 'translateX(-50%)') }));

  return (
    <div style={{ background: 'var(--uc-cream)', color: 'var(--fg-1)', fontFamily: 'var(--font-sans)' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <section style={{ background: 'var(--uc-black)', color: 'var(--uc-paper)', padding: 'clamp(22px,2.6vw,32px) clamp(24px,5vw,72px) clamp(32px,3.6vw,48px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(24px,3vw,40px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, paddingBottom: 20, borderBottom: '1px solid #1F1F1F' }}>
            <img src="/assets/uncap-logo-white.svg" alt="uncap" style={{ height: 22, width: 'auto', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }}/>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-stone-500)', letterSpacing: '0.02em', textAlign: 'right' }}>{data.estimateLabel || 'ESTIMATE'} &middot; BALLPARK &middot; CONFIDENTIAL</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.25fr) minmax(0,1fr)', gap: 'clamp(32px,5vw,72px)', alignItems: 'end' }} className="est-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <span style={{ width: 16, height: 2, background: 'var(--uc-signal)' }}/>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--uc-stone-500)' }}>Prepared for {client}</span>
              </div>
              <h1 style={{ margin: 0, fontFamily: 'var(--font-hero)', fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 0.88, color: 'var(--uc-paper)' }}>
                <span style={{ display: 'block', fontSize: 'clamp(34px,4.4vw,64px)' }}>{data.title ? data.title : 'Project estimate.'}</span>
              </h1>
              <p style={{ margin: 'clamp(14px,1.6vw,20px) 0 0', maxWidth: 520, fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px,1.2vw,17px)', lineHeight: 1.5, color: 'var(--uc-stone-300)' }}>
                {data.note ? data.note : <>We&rsquo;ve pre-selected the modules that match what we heard from {client}. Everything else is visible and priced &mdash; toggle any of it and the number moves with you.</>}
              </p>
            </div>
            <div style={{ border: '1px solid #1F1F1F', background: '#0F0F0F', borderRadius: 10, padding: 'clamp(18px,2vw,24px)', position: 'relative', overflow: 'hidden' }}>
              <span style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: 'var(--uc-signal)' }}/>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--uc-signal)', marginBottom: 16 }}>Estimated range</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', fontFamily: 'var(--font-hero)', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.9, color: 'var(--uc-paper)' }}>
                <span style={{ fontSize: 'clamp(30px,3.2vw,46px)' }}>${Math.round(low / 1000)}k</span>
                <span style={{ fontSize: 'clamp(18px,1.7vw,24px)', color: 'var(--uc-stone-500)' }}>&ndash;</span>
                <span style={{ fontSize: 'clamp(30px,3.2vw,46px)' }}>${Math.round(high / 1000)}k</span>
              </div>
              <div style={{ marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 1.6, color: 'var(--uc-stone-500)', letterSpacing: '0.04em' }}>
                ONE-TIME BUILD &middot; {hrs(low)}&ndash;{hrs(high)} HRS &middot; {weeks} WEEKS TO LAUNCH
              </div>
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #1F1F1F', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 12.5 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--uc-stone-500)' }}>Prepared by</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--uc-paper)' }}>{data.preparedBy || 'Uncap'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 12.5 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--uc-stone-500)' }}>Valid through</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--uc-paper)' }}>{data.validThrough || ''}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Scope selector ─────────────────────────────────────── */}
      <section style={{ background: 'var(--uc-paper)', padding: 'clamp(52px,6.5vw,96px) clamp(24px,5vw,72px)', borderTop: '1px solid var(--line-1)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Eyebrow n="01" label="Your scope" right="PRE-SELECTED BY UNCAP"/>
          <div className="est-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 380px', gap: 'clamp(32px,4vw,56px)', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(28px,3.2vw,40px)' }}>

              {/* Foundation card */}
              <div style={{ border: '1px solid var(--line-2)', borderRadius: 10, padding: 'clamp(24px,2.8vw,34px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 8 }}>Included in every build</div>
                    <h2 style={{ margin: 0, fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 'clamp(26px,2.8vw,38px)', letterSpacing: '-0.04em', lineHeight: 1 }}>Shopify Build</h2>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 4 }}>Range</div>
                    <div style={{ fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(20px,2.1vw,26px)', letterSpacing: '-0.035em', whiteSpace: 'nowrap' }}>{priceLabel(foundation)}</div>
                  </div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, background: 'var(--uc-signal)', color: 'var(--uc-black)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '5px 10px', borderRadius: 999 }}>Always included</span>
                <div className="est-cells" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px', marginTop: 24 }}>
                  {FOUNDATION_ITEMS.map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ flex: '0 0 auto', width: 20, height: 20, borderRadius: 999, background: 'var(--uc-black)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}><Check w={11}/></span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em', color: 'var(--fg-1)' }}>{f.name}</span>
                        <span style={{ display: 'block', fontFamily: 'var(--font-serif)', fontSize: 13.5, lineHeight: 1.45, color: 'var(--fg-2)', marginTop: 2 }}>{f.desc}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Module groups */}
              {groups.map((g) => (
                <div key={g.key}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 6 }}>
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 'clamp(20px,2vw,26px)', letterSpacing: '-0.035em' }}>{g.title}</h3>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>{g.eyebrow}</span>
                  </div>
                  {g.blurb ? <p style={{ margin: '0 0 18px', maxWidth: 560, fontFamily: 'var(--font-serif)', fontSize: 15, lineHeight: 1.5, color: 'var(--fg-2)' }}>{g.blurb}</p> : null}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {g.modules.map((mo) => {
                      const checked = !!selected[mo.id];
                      return (
                        <div key={mo.id} onClick={() => toggle(mo.id)} style={rowStyle(checked)}>
                          <span style={boxStyle(checked, false)}>{checked ? <Check/> : null}</span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.015em', color: 'var(--fg-1)' }}>{mo.name}</span>
                              {mo.preselected ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--uc-black)', background: 'var(--uc-signal)', borderRadius: 999, padding: '3px 8px', whiteSpace: 'nowrap' }}>In your quote</span> : null}
                            </span>
                            {mo.desc ? <span style={{ display: 'block', fontFamily: 'var(--font-serif)', fontSize: 13.5, lineHeight: 1.5, color: 'var(--fg-2)', marginTop: 4 }}>{mo.desc}</span> : null}
                          </span>
                          <span style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)' }}>{priceLabel(mo)}</span>
                            <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', marginTop: 3 }}>{hoursLabel(mo)}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* ERP integration (pick one) */}
              {integrations.length ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 6 }}>
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 'clamp(20px,2vw,26px)', letterSpacing: '-0.035em' }}>ERP integration</h3>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>Pick one approach</span>
                  </div>
                  <p style={{ margin: '0 0 18px', maxWidth: 560, fontFamily: 'var(--font-serif)', fontSize: 15, lineHeight: 1.5, color: 'var(--fg-2)' }}>Connect Shopify to the system that runs the business. We&rsquo;ve marked the approach we&rsquo;d recommend &mdash; swap it to see the difference.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {integrations.map((it) => {
                      const checked = integration === it.id;
                      return (
                        <div key={it.id} onClick={() => setIntegration(it.id)} style={rowStyle(checked)}>
                          <span style={boxStyle(checked, true)}>{checked ? <span style={{ width: 9, height: 9, borderRadius: 999, background: 'currentColor', display: 'block' }}/> : null}</span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.015em', color: 'var(--fg-1)' }}>{it.name}</span>
                              {it.preselected ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--uc-black)', background: 'var(--uc-signal)', borderRadius: 999, padding: '3px 8px', whiteSpace: 'nowrap' }}>In your quote</span> : null}
                              {it.tag ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', border: '1px solid var(--line-1)', borderRadius: 999, padding: '2px 8px', whiteSpace: 'nowrap' }}>{it.tag}</span> : null}
                            </span>
                            {it.desc ? <span style={{ display: 'block', fontFamily: 'var(--font-serif)', fontSize: 13.5, lineHeight: 1.5, color: 'var(--fg-2)', marginTop: 4 }}>{it.desc}</span> : null}
                          </span>
                          <span style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)' }}>{it.low === 0 ? 'Included' : priceLabel(it)}</span>
                            <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', marginTop: 3 }}>{it.low === 0 ? '—' : hoursLabel(it)}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Sticky cart */}
            <aside className="est-aside" style={{ position: 'sticky', top: 24 }}>
              <div style={{ border: '1px solid var(--line-2)', borderRadius: 10, overflow: 'hidden', background: 'var(--uc-paper)' }}>
                <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid var(--line-1)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 8 }}>Your estimate</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.03em' }}>Project scope</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>{addonCount === 0 ? 'Foundation only' : addonCount + ' module' + (addonCount > 1 ? 's' : '') + ' selected'}</span>
                  </div>
                </div>
                <div style={{ padding: '2px 24px' }}>
                  {cartLines.map((l) => (
                    <div key={l.key} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '13px 0', borderBottom: '1px solid var(--uc-stone-200)' }}>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--fg-1)' }}>{l.name}</span>
                        {l.sub ? <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)', marginTop: 3, letterSpacing: '0.04em' }}>{l.sub}</span> : null}
                      </span>
                      <span style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--fg-1)' }}>{l.label}</span>
                        {l.removable ? <button onClick={(e) => { e.stopPropagation(); l.onRemove(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', padding: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Remove</button> : null}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '20px 24px', background: 'var(--uc-bone)', borderTop: '1px solid var(--line-1)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-3)', marginBottom: 6 }}>Estimated total</div>
                  <div style={{ fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 28, letterSpacing: '-0.04em', lineHeight: 1.05, color: 'var(--fg-1)' }}>{money(low)} &ndash; {money(high)}</div>
                  <p style={{ margin: '10px 0 0', fontFamily: 'var(--font-serif)', fontSize: 13, lineHeight: 1.5, color: 'var(--fg-2)' }}>A range, not a quote. The fixed price is set after the Blueprint.</p>
                </div>
                {changed ? (
                  <div style={{ padding: '14px 24px', background: 'var(--uc-black)', color: 'var(--uc-paper)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--uc-signal)' }}>Changed from our scope</span>
                    <button onClick={reset} style={{ background: 'none', border: '1px solid #3A3A3A', borderRadius: 999, color: 'var(--uc-paper)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 12px' }}>Reset</button>
                  </div>
                ) : null}
                <div style={{ padding: '18px 24px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {approve === 'done' ? <ApprovedNote/> : (
                    <button type="button" onClick={approveNow} disabled={approve === 'sending'} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 14, background: 'var(--uc-black)', color: 'var(--uc-paper)', border: '1px solid var(--uc-black)', borderRadius: 999, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 15, cursor: approve === 'sending' ? 'default' : 'pointer', opacity: approve === 'sending' ? 0.7 : 1 }}>
                      {approve === 'sending' ? 'Sending…' : <>Approve &amp; Schedule Discovery <span>&rarr;</span></>}
                    </button>
                  )}
                  {approve === 'error' ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, lineHeight: 1.5, color: '#B3261E', textAlign: 'center' }}>{approveErr}</span> : null}
                  {approve !== 'done' ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, lineHeight: 1.6, color: 'var(--fg-3)', letterSpacing: '0.04em', textAlign: 'center' }}>NON-BINDING &middot; VALID 30 DAYS</span> : null}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Timeline ───────────────────────────────────────────── */}
      <section style={{ background: 'var(--uc-black)', color: 'var(--uc-paper)', padding: 'clamp(44px,5vw,72px) clamp(24px,5vw,72px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Eyebrow n="02" label="Timeline" right={weeks + ' WEEKS'} dark/>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 'clamp(22px,2.6vw,32px)' }}>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 'clamp(28px,3.4vw,48px)', letterSpacing: '-0.045em', lineHeight: 1, color: 'var(--uc-paper)' }}>
              Six workstreams. <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontStyle: 'italic', color: 'var(--uc-stone-300)' }}>No mystery months.</span>
            </h2>
          </div>
          <div className="est-scroll">
            <div style={{ display: 'grid', gridTemplateColumns: '128px minmax(0,1fr) 56px', gap: '0 16px', alignItems: 'center', minWidth: 560 }}>
              <span/>
              <div style={{ position: 'relative', height: 14, borderBottom: '1px solid #1F1F1F', paddingBottom: 8 }}>
                {ticks.map((t, i) => (<span key={i} style={{ position: 'absolute', top: 0, left: t.left, transform: t.shift, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--uc-stone-500)', whiteSpace: 'nowrap' }}>{t.label}</span>))}
              </div>
              <span/>
              {gantt.map((p, i) => (
                <React.Fragment key={i}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em', color: 'var(--uc-paper)', padding: '9px 0', whiteSpace: 'nowrap' }}>{p.name}</span>
                  <span style={{ position: 'relative', display: 'block', height: 10, margin: '9px 0', background: '#161616' }}>
                    <span style={{ position: 'absolute', top: 0, bottom: 0, left: p.left, width: p.width, background: p.bar, borderRadius: 999 }}/>
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-stone-500)', textAlign: 'right', whiteSpace: 'nowrap' }}>{p.wk}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Managed growth ─────────────────────────────────────── */}
      <section style={{ background: 'var(--uc-cream)', padding: 'clamp(48px,5.6vw,84px) clamp(24px,5vw,72px)', borderTop: '1px solid var(--line-1)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Eyebrow n="03" label="Managed growth" right="POST-LAUNCH SUPPORT"/>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)', gap: 'clamp(20px,3vw,48px)', alignItems: 'end', marginBottom: 'clamp(26px,3.2vw,40px)' }} className="est-grid">
            <h2 style={{ margin: 0, fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 'clamp(26px,3.2vw,44px)', letterSpacing: '-0.045em', lineHeight: 1 }}>
              Launch is the start. <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontStyle: 'italic' }}>Then someone has to run it.</span>
            </h2>
            <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 15, lineHeight: 1.5, color: 'var(--fg-2)' }}>Retainers start the month after go-live. Month-to-month after the first quarter &mdash; move up or down as the season demands.</p>
          </div>
          <div className="est-scroll" style={{ paddingTop: 22 }}>
            <div className="est-growth" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) repeat(3, minmax(0,1fr))', borderTop: '1px solid var(--line-2)' }}>
              <span style={{ padding: '16px 18px 14px 0', borderBottom: '1px solid var(--line-2)', display: 'flex', alignItems: 'flex-end', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>Compare</span>
              {PLANS.map((pl) => {
                const on = plan === pl.id;
                return (
                  <span key={pl.id} onClick={() => setPlan(pl.id)} style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'flex-end', cursor: 'pointer', position: 'relative', zIndex: on ? 1 : 0, padding: on ? '20px 18px 14px' : '16px 18px 14px', marginTop: on ? -18 : 0, borderBottom: '1px solid var(--line-2)', borderTop: '2px solid ' + (on ? 'var(--uc-black)' : 'transparent'), borderLeft: '2px solid ' + (on ? 'var(--uc-black)' : 'transparent'), borderRight: '2px solid ' + (on ? 'var(--uc-black)' : 'transparent'), borderRadius: on ? '10px 10px 0 0' : 0, background: on ? 'var(--uc-paper)' : 'transparent', boxShadow: on ? '0 -3px 0 var(--uc-signal) inset' : 'none' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 'clamp(19px,1.9vw,26px)', letterSpacing: '-0.035em' }}>{pl.name}</span>
                      {pl.id === (data.growthPlan || 'optimize') ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--uc-signal)', color: 'var(--uc-black)', borderRadius: 999, padding: '3px 7px' }}>Recommended</span> : null}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)' }}>{pl.sub}</span>
                  </span>
                );
              })}
              {GROWTH_ROWS.map((r, ri) => (
                <React.Fragment key={ri}>
                  <span style={{ padding: '12px 18px 12px 0', borderBottom: '1px solid var(--line-1)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '-0.005em', color: 'var(--fg-1)' }}>{r.label}</span>
                  {PLANS.map((pl, i) => {
                    const on = plan === pl.id;
                    return <span key={pl.id} style={{ padding: '12px 18px', borderBottom: '1px solid var(--line-1)', borderLeft: '2px solid ' + (on ? 'var(--uc-black)' : 'transparent'), borderRight: '2px solid ' + (on ? 'var(--uc-black)' : 'transparent'), background: on ? 'var(--uc-paper)' : 'transparent', color: on ? 'var(--fg-1)' : 'var(--fg-2)', fontWeight: on ? 500 : 400, fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.45 }}>{r.v[i]}</span>;
                  })}
                </React.Fragment>
              ))}
              <span style={{ padding: '18px 18px 8px 0', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-3)', display: 'flex', alignItems: 'center' }}>Monthly investment</span>
              {PLANS.map((pl) => {
                const on = plan === pl.id;
                return <span key={pl.id} style={{ padding: '18px 18px 8px', fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(22px,2.3vw,30px)', letterSpacing: '-0.04em', color: 'var(--fg-1)', borderLeft: '2px solid ' + (on ? 'var(--uc-black)' : 'transparent'), borderRight: '2px solid ' + (on ? 'var(--uc-black)' : 'transparent'), background: on ? 'var(--uc-paper)' : 'transparent' }}>{pl.price}<span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500, letterSpacing: 0, color: 'var(--fg-3)' }}>/mo</span></span>;
              })}
              <span/>
              {PLANS.map((pl) => {
                const on = plan === pl.id;
                return (
                  <span key={pl.id} onClick={() => setPlan(pl.id)} style={{ padding: '4px 18px 20px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', borderLeft: '2px solid ' + (on ? 'var(--uc-black)' : 'transparent'), borderRight: '2px solid ' + (on ? 'var(--uc-black)' : 'transparent'), borderBottom: '2px solid ' + (on ? 'var(--uc-black)' : 'transparent'), borderRadius: on ? '0 0 10px 10px' : 0, background: on ? 'var(--uc-paper)' : 'transparent' }}>
                    <span style={{ flex: '0 0 auto', width: 20, height: 20, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid ' + (on ? 'var(--uc-black)' : 'var(--uc-stone-500)'), background: on ? 'var(--uc-signal)' : 'transparent', color: on ? 'var(--uc-black)' : 'transparent' }}><Check w={11}/></span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-2)' }}>{on ? 'Selected' : 'Choose'}</span>
                  </span>
                );
              })}
            </div>
          </div>
          <p style={{ margin: '10px 0 0', fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.06em', color: 'var(--fg-3)' }}>RETAINER PRICING IS SEPARATE FROM THE BUILD ESTIMATE ABOVE</p>
        </div>
      </section>

      {/* ── Next step ──────────────────────────────────────────── */}
      <section style={{ background: 'var(--uc-paper)', padding: 'clamp(52px,6.5vw,96px) clamp(24px,5vw,72px) clamp(60px,7vw,104px)', borderTop: '1px solid var(--line-1)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Eyebrow n="04" label="Next step" right="DISCOVERY DEEP DIVE"/>
          <div style={{ border: '1px solid var(--line-2)', borderRadius: 10, padding: 'clamp(28px,3.6vw,52px)', display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)', gap: 'clamp(24px,4vw,56px)', alignItems: 'center' }} className="est-grid">
            <div>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 'clamp(28px,3.4vw,50px)', letterSpacing: '-0.045em', lineHeight: 0.98 }}>
                Next step is a Discovery Deep Dive. <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontStyle: 'italic' }}>Then this range becomes a price.</span>
              </h2>
              <p style={{ margin: '18px 0 0', maxWidth: 520, fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px,1.3vw,18px)', lineHeight: 1.5, color: 'var(--fg-2)' }}>A working session with your operators to pressure-test scope, data, and integration reality &mdash; then we set the fixed price.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
              {approve === 'done' ? <ApprovedNote/> : (
                <button type="button" onClick={approveNow} disabled={approve === 'sending'} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '15px 26px', background: 'var(--uc-black)', color: 'var(--uc-paper)', border: '1px solid var(--uc-black)', borderRadius: 999, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 15, cursor: approve === 'sending' ? 'default' : 'pointer', opacity: approve === 'sending' ? 0.7 : 1 }}>
                  {approve === 'sending' ? 'Sending…' : <>Approve &amp; Schedule Discovery <span>&rarr;</span></>}
                </button>
              )}
              {approve === 'error' ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, lineHeight: 1.5, color: '#B3261E' }}>{approveErr}</span> : null}
            </div>
          </div>
          <div style={{ marginTop: 'clamp(36px,4.4vw,60px)', paddingTop: 22, borderTop: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <img src="/assets/shopify-platinum-partner-black.svg" alt="Shopify Platinum Partner" style={{ height: 28, width: 'auto', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }}/>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)', letterSpacing: '0.06em', textAlign: 'right' }}>ESTIMATE FOR {(client || '').toUpperCase()} &middot; NON-BINDING &middot; VALID 30 DAYS</span>
          </div>
        </div>
      </section>
    </div>
  );
}
