// QuizApp.jsx: Pharmacy-style full-page intake quiz
// 5 questions + confirmation. One question per screen. Auto-advance on select.

const ERP_OPTIONS = [
  {id:'netsuite',  label:'NetSuite'},
  {id:'msdyn',     label:'Microsoft Dynamics'},
  {id:'acumatica', label:'Acumatica'},
  {id:'epicor',    label:'Epicor'},
  {id:'sage',      label:'Sage'},
  {id:'sap',       label:'SAP'},
  {id:'infor',     label:'Infor'},
  {id:'odoo',      label:'Odoo'},
  {id:'other',     label:'Other / not sure'},
];

const ERP_EDITIONS = {
  netsuite:  ['Standard','Premium','Enterprise','OneWorld','Not sure'],
  msdyn:     ['Business Central','Finance & Operations (F&O)','Dynamics 365 Sales / CRM','GP (legacy)','NAV (legacy)','AX (legacy)','Not sure'],
  acumatica: ['Small Business','Advanced','Enterprise','Not sure'],
  epicor:    ['Kinetic','Prophet 21','Eclipse','BisTrack','Eagle','Not sure'],
  sage:      ['Intacct','X3','100','300','50','200','Not sure'],
  sap:       ['S/4HANA','S/4HANA Cloud','Business One','ECC','Business ByDesign','Not sure'],
  infor:     ['M3','LN','CloudSuite','SyteLine','VISUAL','Not sure'],
  odoo:      ['Community','Enterprise','Online (SaaS)','Not sure'],
  other:     null, // free text
};

const PLATFORM_OPTIONS = [
  'None (first ecommerce site)',
  'Magento / Adobe Commerce',
  'BigCommerce',
  'WooCommerce',
  'NetSuite SuiteCommerce',
  'Optimizely Commerce',
  'Salesforce Commerce Cloud',
  'SAP Commerce Cloud',
  'commercetools',
  'VTEX',
  'Custom-built',
  'Other',
];

const REVENUE_OPTIONS = [
  'Under $1M',
  '$1M – $5M',
  '$5M – $25M',
  '$25M – $100M',
  '$100M+',
];

const MODEL_OPTIONS = [
  {id:'b2b',     label:'B2B',     sub:'Manufacturer, distributor, suppliers, wholesalers'},
  {id:'b2c',     label:'B2C',     sub:'Direct-to-consumer ecommerce'},
  {id:'retail',  label:'Retail',  sub:'Brick-and-mortar, POS, in-store'},
  {id:'unified', label:'Unified', sub:'Mix of B2B, B2C, and retail in one storefront'},
];

// Accepts what people actually type ("acme.com", "www.acme.com", "https://acme.com/about"),
// returns a normalized https:// URL or '' if it doesn't look like a domain at all.
// We intentionally accept missing schemes because most people type the bare host.
function normalizeCompanyUrl(raw){
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : 'https://' + trimmed;
  try {
    const u = new URL(withScheme);
    // Require at least one dot in the hostname (rules out "localhost", "foo", etc).
    if (!/\.[a-z]{2,}$/i.test(u.hostname)) return '';
    return u.toString().replace(/\/$/, '');
  } catch (_) {
    return '';
  }
}

function makeSessionId(){
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

// Maps the URL-hash slugs that Hero.jsx uses for marketing deep links to the
// answer values the quiz stores internally. ERP keeps its short id (the same
// id the quiz uses), platforms map to the full label string.
const BUILD_PLATFORM_LABEL_BY_HASH = {
  magento:        'Magento / Adobe Commerce',
  bigcommerce:    'BigCommerce',
  woocommerce:    'WooCommerce',
  netsuite:       'NetSuite SuiteCommerce',
  optimizely:     'Optimizely Commerce',
  salesforce:     'Salesforce Commerce Cloud',
  sap:            'SAP Commerce Cloud',
  commercetools:  'commercetools',
  vtex:           'VTEX',
  custom:         'Custom-built',
};
const BUILD_ERP_IDS = new Set([
  'netsuite','msdyn','acumatica','epicor','sage','sap','infor','odoo',
]);

function parseBuildHash(raw){
  const slug = (raw || '').replace(/^#/, '').toLowerCase();
  if (!slug) return { erp: '', platform: '' };
  const match = slug.match(/^([a-z0-9]+)[-+_]([a-z0-9]+)$/);
  if (match) {
    return {
      erp:      BUILD_ERP_IDS.has(match[1]) ? match[1] : '',
      platform: BUILD_PLATFORM_LABEL_BY_HASH[match[2]] || '',
    };
  }
  // Single segment: prefer ERP (matches Hero's interpretation of /#netsuite).
  if (BUILD_ERP_IDS.has(slug)) return { erp: slug, platform: '' };
  if (BUILD_PLATFORM_LABEL_BY_HASH[slug]) return { erp: '', platform: BUILD_PLATFORM_LABEL_BY_HASH[slug] };
  return { erp: '', platform: '' };
}

// 8 input steps, then a single confirmation step at index === STEPS.length.
// Defined at module scope so the QuizApp useState initializer can compute the
// initial step / bypass set synchronously before first paint.
const STEPS = ['erp', 'edition', 'platform', 'revenue', 'model', 'name', 'email', 'company'];
const STEP_INDEX = { erp: 0, edition: 1, platform: 2, revenue: 3, model: 4, name: 5, email: 6, company: 7 };

// Reads the `?company=<url>` query param the hero's CTA forwards. Returned
// pre-normalized so the quiz can drop it straight into contact.company.
function parseCompanyQuery(){
  if (typeof window === 'undefined') return '';
  const raw = new URLSearchParams(window.location.search).get('company') || '';
  return raw ? normalizeCompanyUrl(raw) : '';
}

// Steps to skip entirely when the URL hash already provides the answer. The
// erp step is bypassed when the hash signals an ERP (we still need the edition
// step because options depend on the erp id). The platform step is bypassed
// when the hash signals a platform. The company step is bypassed when the
// hero's CTA forwarded a `?company=...` URL.
function bypassFromHint(hint){
  const set = new Set();
  if (hint && hint.erp)      set.add(STEP_INDEX.erp);
  if (hint && hint.platform) set.add(STEP_INDEX.platform);
  if (hint && hint.company)  set.add(STEP_INDEX.company);
  return set;
}
function firstNonBypassed(bypassed){
  for (let i = 0; i < STEPS.length; i++) {
    if (!bypassed.has(i)) return i;
  }
  return 0;
}

function QuizApp(){
  // Hint resolved once on first render. ERP id + platform label come from
  // the URL hash (Hero's marketing deep links); company website comes from
  // the `?company=` query param the hero's CTA forwards. All three pre-fill
  // the corresponding answer/contact field and skip the matching step.
  const initialHint = React.useMemo(() => {
    const hashHint = parseBuildHash(typeof window !== 'undefined' ? window.location.hash : '');
    return { ...hashHint, company: parseCompanyQuery() };
  }, []);
  // Set of step indices to skip. Locked in on mount so the visible step count
  // stays stable for the whole session even if the user navigates within
  // fragment anchors later.
  const [bypassed] = React.useState(() => bypassFromHint(initialHint));

  const [step, setStep] = React.useState(() => firstNonBypassed(bypassFromHint(initialHint)));
  const [answers, setAnswers] = React.useState({
    erp:      initialHint.erp      || null,
    edition:  null,
    platform: initialHint.platform || null,
    revenue:  null,
    model:    null,
  });
  const [otherErp, setOtherErp] = React.useState('');
  const [otherPlatform, setOtherPlatform] = React.useState('');
  // Contact details collected as quiz steps (5–7). Lifted to QuizApp so
  // values survive back-nav and feed the recap on the final step. Forwarded
  // to Stripe at confirm time as PaymentMethod billing_details (name/email)
  // + sent to /api/checkout/setup-complete (company).
  const [contact, setContact] = React.useState({
    name:    '',
    email:   '',
    company: initialHint.company || '',
  });
  const [emailError, setEmailError] = React.useState('');
  const [companyUrlError, setCompanyUrlError] = React.useState('');

  // Resumable-session plumbing. Every visit to /build either reuses an
  // existing `?s=<id>` (and rehydrates from Workers KV) or generates a new
  // one and replaces the URL non-destructively. State changes are saved
  // back to KV on a 400ms debounce. `sessionRestored` gates the first save
  // so we don't overwrite a real session with default empties before we've
  // had a chance to fetch.
  const sessionIdRef = React.useRef(null);
  const [sessionRestored, setSessionRestored] = React.useState(false);

  const isConfirm = step >= STEPS.length;
  const visibleTotal = STEPS.length - bypassed.size;
  const visibleStepNumber = (rawIdx) => {
    let n = 0;
    for (let i = 0; i < STEPS.length; i++) {
      if (bypassed.has(i)) continue;
      n++;
      if (i === rawIdx) return n;
    }
    return visibleTotal;
  };
  const stepLabel = (rawIdx) => `Step ${visibleStepNumber(rawIdx)} of ${visibleTotal}`;
  const firstStep = firstNonBypassed(bypassed);

  // Mount-once: read/create the session id and rehydrate state from KV.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const existing = (params.get('s') || '').toLowerCase();
      const validId = /^[0-9a-f]{16,64}$/.test(existing);

      if (validId) {
        sessionIdRef.current = existing;
        try {
          const resp = await fetch(`/api/build/session?id=${encodeURIComponent(existing)}`);
          if (!cancelled && resp.ok) {
            const data = await resp.json().catch(() => ({}));
            const s = data && data.ok && data.state;
            if (s) {
              if (Number.isFinite(s.step)) {
                // Clamp the resumed step away from any bypassed slot so we
                // never land the user back on a step the hash skipped.
                let resumed = Math.max(0, Math.min(STEPS.length, s.step));
                while (resumed < STEPS.length && bypassed.has(resumed)) resumed++;
                setStep(resumed);
              }
              if (s.answers) {
                // Hash hints win for bypassed fields: a returning visitor on
                // /#netsuite shouldn't have a previously-saved different ERP
                // resurrected onto a step they're now skipping.
                const a = {...s.answers};
                if (bypassed.has(STEP_INDEX.erp))      delete a.erp;
                if (bypassed.has(STEP_INDEX.platform)) delete a.platform;
                setAnswers(prev => ({...prev, ...a}));
              }
              if (typeof s.otherErp === 'string') setOtherErp(s.otherErp);
              if (typeof s.otherPlatform === 'string') setOtherPlatform(s.otherPlatform);
              if (s.contact) {
                // Same "hint wins for bypassed fields" rule applies to the
                // hero's `?company=` pre-fill: don't let a stale saved value
                // (or blank) overwrite the URL-provided company website.
                const c = {...s.contact};
                if (bypassed.has(STEP_INDEX.company)) delete c.company;
                setContact(prev => ({...prev, ...c}));
              }
            }
          }
        } catch {}
      } else {
        const id = makeSessionId();
        sessionIdRef.current = id;
        const newUrl = `${window.location.pathname}?s=${id}${window.location.hash}`;
        window.history.replaceState({}, '', newUrl);
      }
      if (!cancelled) setSessionRestored(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // Debounced save on every meaningful state change.
  React.useEffect(() => {
    if (!sessionRestored || !sessionIdRef.current) return;
    const t = setTimeout(() => {
      fetch('/api/build/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: sessionIdRef.current,
          state: { step, answers, otherErp, otherPlatform, contact },
        }),
      }).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [sessionRestored, step, answers, otherErp, otherPlatform, contact]);

  // Called from CardOnFile when the Stripe confirm succeeds: drop the
  // session record and strip `?s=` from the URL so a refresh after success
  // doesn't try to rehydrate a deleted record.
  const onSessionComplete = React.useCallback(() => {
    const id = sessionIdRef.current;
    if (id) {
      fetch(`/api/build/session?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
      sessionIdRef.current = null;
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const set = (key, value) => {
    setAnswers(prev => ({...prev, [key]: value}));
  };

  // Pre-fetch the PaymentIntent the instant we have all five quiz answers, so
  // the Stripe form is already ready by the time the user finishes the
  // contact steps and lands on the confirmation page.
  const setupPromiseRef = React.useRef(null);
  const startSetupIntent = (fullAnswers, fullOtherErp, fullOtherPlatform) => {
    if (setupPromiseRef.current) return;
    // If the user picked "Other" for platform, swap the literal "Other" for
    // the typed name so it lands cleanly in Stripe customer metadata + the
    // notification email.
    const merged = {
      ...fullAnswers,
      platform: fullAnswers.platform === 'Other' && fullOtherPlatform
        ? fullOtherPlatform
        : fullAnswers.platform,
    };
    setupPromiseRef.current = (async () => {
      const resp = await fetch('/api/checkout/setup-intent', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ answers: merged, otherErp: fullOtherErp }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.ok) throw new Error(data.error || `Setup failed (${resp.status})`);
      return data;
    })();
  };

  const advance = () => setStep(s => {
    let next = s + 1;
    while (next < STEPS.length && bypassed.has(next)) next++;
    return next;
  });
  const back = () => {
    // Invalidate the pre-fetched PaymentIntent only when back-nav lands the
    // user back inside the quiz answer-choosing range (steps 0–4): the
    // PaymentIntent metadata is built from those answers, so they need to
    // refire if the user can change them. Bouncing within contact /
    // confirmation steps preserves the pre-fetch.
    let prev = step - 1;
    while (prev >= firstStep && bypassed.has(prev)) prev--;
    if (prev < firstStep) return;
    if (prev < 5) setupPromiseRef.current = null;
    setStep(prev);
  };

  const setContactField = (key, value) => setContact(prev => ({...prev, [key]: value}));

  // Auto-advance helper for radio steps
  const choose = (key, value) => {
    set(key, value);
    setTimeout(advance, 220);
  };

  return (
    <div data-screen-label="Blueprint Build" style={{
      minHeight:'100vh',
      background:'var(--uc-cream)',
      color:'var(--fg-1)',
      fontFamily:'var(--font-sans)',
      display:'flex',flexDirection:'column',
    }}>
      <QuizHeader
        currentNumber={isConfirm ? visibleTotal : visibleStepNumber(step)}
        total={visibleTotal}
        onBack={back}
        canGoBack={step > firstStep}
        isConfirm={isConfirm}
      />

      <main style={{
        flex:1,
        display:'flex',
        alignItems:'flex-start',
        justifyContent:'center',
        padding:'48px 24px 96px',
      }}>
        <div style={{width:'100%',maxWidth:680}}>
          {step === 0 && (
            <Step
              eyebrow={stepLabel(0)}
              title="What ERP do you run on?"
              sub="We'll tailor the migration plan around your system of record."
            >
              <OptionGrid
                options={ERP_OPTIONS.map(o=>({value:o.id,label:o.label}))}
                selected={answers.erp}
                onChoose={(v)=>choose('erp', v)}
              />
            </Step>
          )}

          {step === 1 && (
            <Step
              eyebrow={stepLabel(1)}
              title={editionTitle(answers.erp)}
              sub="Different editions integrate very differently with Shopify."
            >
              {answers.erp === 'other' ? (
                <FreeTextStep
                  placeholder="Type your ERP name and edition…"
                  value={otherErp}
                  onChange={setOtherErp}
                  onSubmit={()=>{
                    if (otherErp.trim()) {
                      set('edition', otherErp.trim());
                      advance();
                    }
                  }}
                />
              ) : answers.erp ? (
                <OptionGrid
                  options={(ERP_EDITIONS[answers.erp] || []).map(e=>({value:e,label:e}))}
                  selected={answers.edition}
                  onChoose={(v)=>choose('edition', v)}
                  columns={2}
                />
              ) : null}
            </Step>
          )}

          {step === 2 && (
            <Step
              eyebrow={stepLabel(2)}
              title="What ecommerce platform are you on today?"
              sub="Where you're migrating from shapes the entire data plan."
            >
              {answers.platform === 'Other' ? (
                <FreeTextStep
                  placeholder="Type your platform name…"
                  value={otherPlatform}
                  onChange={setOtherPlatform}
                  onSubmit={()=>{
                    if (otherPlatform.trim()) advance();
                  }}
                />
              ) : (
                <OptionGrid
                  options={PLATFORM_OPTIONS.map(o=>({value:o,label:o}))}
                  selected={answers.platform}
                  onChoose={(v)=>{
                    if (v === 'Other') {
                      // Mark as Other; stay on step 2 to collect the typed name.
                      set('platform', v);
                    } else {
                      choose('platform', v);
                    }
                  }}
                />
              )}
            </Step>
          )}

          {step === 3 && (
            <Step
              eyebrow={stepLabel(3)}
              title="What's your annual online revenue?"
              sub="Helps us calibrate scale: catalog, traffic, B2B accounts."
            >
              <OptionGrid
                options={REVENUE_OPTIONS.map(o=>({value:o,label:o}))}
                selected={answers.revenue}
                onChoose={(v)=>choose('revenue', v)}
                columns={1}
                size="lg"
              />
            </Step>
          )}

          {step === 4 && (
            <Step
              eyebrow={stepLabel(4)}
              title="Which best describes your model?"
            >
              <OptionGrid
                options={MODEL_OPTIONS.map(o=>({value:o.id,label:o.label,sub:o.sub}))}
                selected={answers.model}
                onChoose={(v)=>{
                  startSetupIntent({...answers, model: v}, otherErp, otherPlatform);
                  choose('model', v);
                }}
                columns={1}
              />
            </Step>
          )}

          {step === 5 && (
            <Step
              eyebrow={stepLabel(5)}
              title="What's your work email?"
              sub="We'll send the Blueprint kickoff details here."
            >
              <FreeTextStep
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                value={contact.email}
                onChange={(v)=>{ if (emailError) setEmailError(''); setContactField('email', v); }}
                onSubmit={()=>{
                  const v = contact.email.trim();
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setEmailError('Enter a valid email'); return; }
                  setContactField('email', v);
                  advance();
                }}
                error={emailError}
              />
            </Step>
          )}

          {step === 6 && (
            <Step
              eyebrow={stepLabel(6)}
              title="What's your name?"
              sub="So we know who to address on the kickoff call."
            >
              <FreeTextStep
                placeholder="Full name"
                autoComplete="name"
                value={contact.name}
                onChange={(v)=>setContactField('name', v)}
                onSubmit={()=>{
                  if (contact.name.trim()) advance();
                }}
              />
            </Step>
          )}

          {step === 7 && (
            <Step
              eyebrow={stepLabel(7)}
              title="What's your company website?"
              sub="Helps us pull together a quick read on your site before the kickoff."
            >
              <FreeTextStep
                type="url"
                prefix="http://"
                placeholder=""
                autoComplete="url"
                value={contact.company}
                onChange={(v)=>{ if (companyUrlError) setCompanyUrlError(''); setContactField('company', v); }}
                onSubmit={()=>{
                  const normalized = normalizeCompanyUrl(contact.company);
                  if (!normalized) { setCompanyUrlError('Enter a valid website (eg. yourcompany.com)'); return; }
                  setContactField('company', normalized);
                  advance();
                }}
                error={companyUrlError}
              />
            </Step>
          )}

          {isConfirm && (
            <Confirmation
              answers={answers}
              otherErp={otherErp}
              otherPlatform={otherPlatform}
              contact={contact}
              setupPromiseRef={setupPromiseRef}
              onSessionComplete={onSessionComplete}
            />
          )}
        </div>
      </main>
    </div>
  );
}

/* ------- Header w/ progress ------- */
function QuizHeader({currentNumber, total, onBack, canGoBack, isConfirm}){
  // currentNumber is 1-based (e.g. 1 of 6); pct subtracts one so the first
  // step renders an empty bar instead of jumping to 1/total filled.
  const pct = isConfirm ? 100 : Math.round(((currentNumber - 1) / total) * 100);
  // Preserve the deep-link hash (#netsuite-magento etc) when bouncing back
  // to the landing page so context survives the round trip.
  const hash = window.useHash ? window.useHash() : '';
  return (
    <header style={{
      position:'sticky',top:0,zIndex:10,
      background:'rgba(242,239,231,0.92)',
      backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)',
      borderBottom:'1px solid var(--line-1)',
    }}>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'14px 24px 16px',position:'relative',display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
        {/* Back button: absolute top-left so it doesn't disrupt centering */}
        {canGoBack && (
          <button onClick={onBack} style={{
            position:'absolute',left:24,top:'50%',transform:'translateY(-50%)',
            background:'transparent',border:'none',cursor:'pointer',
            fontFamily:'var(--font-sans)',fontSize:13,fontWeight:500,color:'var(--fg-2)',
            padding:'8px 12px',borderRadius:5,
            display:'flex',alignItems:'center',gap:6,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8 3L4 7l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back
          </button>
        )}

        {/* Centered brand */}
        <a href={`/${hash}`} style={{display:'flex',alignItems:'center',gap:12,textDecoration:'none',color:'var(--fg-1)'}}>
          <img src="/assets/uncap-logo-black.svg" style={{height:20}} alt="Uncap"/>
          <span style={{height:14,width:1,background:'var(--line-1)'}}/>
          <span style={{fontFamily:'var(--font-display)',fontWeight:600,fontSize:13,letterSpacing:'-.01em'}}>Blueprint</span>
        </a>

        {/* Centered progress row */}
        <div style={{display:'flex',alignItems:'center',gap:12,width:'100%',maxWidth:520}}>
          <div style={{flex:1,height:4,background:'var(--uc-stone-200)',borderRadius:999,overflow:'hidden'}}>
            <div style={{
              width:`${pct}%`,height:'100%',
              background:'var(--uc-black)',
              transition:'width 360ms var(--ease-out)',
            }}/>
          </div>
          <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--fg-3)',letterSpacing:'.06em',whiteSpace:'nowrap'}}>
            {isConfirm ? 'COMPLETE' : `${Math.min(currentNumber, total)} / ${total}`}
          </span>
        </div>
      </div>
    </header>
  );
}

/* ------- Step layout ------- */
function Step({eyebrow, title, sub, children}){
  return (
    <div style={{
      animation:'quizFadeIn 380ms var(--ease-out) both',
    }}>
      <div className="uc-eyebrow" style={{marginBottom:14}}>{eyebrow}</div>
      <h1 style={{
        fontFamily:'var(--font-display)',fontWeight:700,
        fontSize:'clamp(32px,3.4vw,48px)',lineHeight:1.05,letterSpacing:'-.025em',
        color:'var(--fg-1)',margin:'0 0 12px',textWrap:'balance',
      }}>{title}</h1>
      {sub && (
        <p style={{
          fontFamily:'var(--font-serif)',fontStyle:'italic',
          fontSize:'clamp(17px,1.5vw,20px)',lineHeight:1.4,
          color:'var(--fg-2)',margin:'0 0 36px',maxWidth:560,
        }}>{sub}</p>
      )}
      {!sub && <div style={{height:36}}/>}
      {children}
    </div>
  );
}

/* ------- Option grid (radio-style cards) ------- */
function OptionGrid({options, selected, onChoose, columns=2, size='md'}){
  const padY = size==='lg' ? 22 : 18;
  const fontSize = size==='lg' ? 18 : 16;
  return (
    <div style={{
      display:'grid',
      gridTemplateColumns:`repeat(${columns}, 1fr)`,
      gap:12,
    }}>
      {options.map(opt=>{
        const isSel = selected === opt.value;
        return (
          <button
            key={opt.value}
            onClick={()=>onChoose(opt.value)}
            style={{
              cursor:'pointer',textAlign:'left',
              background: isSel ? 'var(--uc-black)' : '#fff',
              color: isSel ? '#fff' : 'var(--fg-1)',
              border:'1px solid', borderColor: isSel ? 'var(--uc-black)' : 'var(--line-1)',
              borderRadius:5,
              padding:`${padY}px 20px`,
              fontFamily:'var(--font-sans)',fontSize,fontWeight:500,
              display:'flex',alignItems:'center',justifyContent:'space-between',gap:14,
              transition:'all .18s var(--ease-out)',
              boxShadow: isSel ? '0 4px 12px rgba(10,10,10,0.12)' : '0 1px 2px rgba(10,10,10,0.03)',
            }}
            onMouseEnter={e=>{
              if (!isSel) {
                e.currentTarget.style.borderColor = 'var(--uc-black)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={e=>{
              if (!isSel) {
                e.currentTarget.style.borderColor = 'var(--line-1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}>
            <span style={{display:'flex',flexDirection:'column',gap:3}}>
              <span>{opt.label}</span>
              {opt.sub && <span style={{fontSize:13,fontWeight:400,opacity:.7}}>{opt.sub}</span>}
            </span>
            <span style={{
              width:22,height:22,borderRadius:999,
              border:'1.5px solid', borderColor: isSel ? '#fff' : 'var(--line-1)',
              display:'inline-flex',alignItems:'center',justifyContent:'center',
              flexShrink:0,
            }}>
              {isSel && <span style={{width:10,height:10,borderRadius:999,background:'#fff'}}/>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------- Free-text step (used for "Other" ERP and the contact steps) ------- */
// `prefix` renders a non-editable, grayed-out label inside the same bordered
// box as the input — used for the company-website step to show "http://www."
// as a persistent hint that doesn't disappear when the user starts typing.
function FreeTextStep({placeholder, value, onChange, onSubmit, type='text', autoComplete, error, prefix}){
  const errored = !!error;
  const [focused, setFocused] = React.useState(false);
  const borderColor = errored ? '#c0392b' : (focused ? 'var(--uc-black)' : 'var(--line-1)');

  // Without a prefix the input draws its own border (legacy behaviour). With
  // a prefix we wrap input + prefix in a flex row that shares the border, so
  // the two read as a single field.
  const inputBase = {
    fontSize:18,fontFamily:'var(--font-sans)',fontWeight:500,
    color:'var(--fg-1)',
    background:'#fff',
    outline:'none',
  };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {prefix ? (
        <div style={{
          display:'flex',alignItems:'stretch',
          border:`1px solid ${borderColor}`,
          borderRadius:5,
          background:'#fff',
          transition:'border-color .15s var(--ease-out)',
          overflow:'hidden',
        }}>
          <span style={{
            ...inputBase,
            padding:'18px 0 18px 20px',
            color:'var(--fg-3)',
            userSelect:'none',
            whiteSpace:'nowrap',
          }} aria-hidden="true">{prefix}</span>
          <input
            type={type}
            autoComplete={autoComplete}
            value={value}
            onChange={e=>onChange(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter') onSubmit(); }}
            placeholder={placeholder}
            autoFocus
            aria-invalid={errored ? 'true' : 'false'}
            style={{
              ...inputBase,
              flex:1,
              minWidth:0,
              padding:'18px 20px 18px 0',
              border:'none',
            }}
            onFocus={()=>setFocused(true)}
            onBlur={()=>setFocused(false)}
          />
        </div>
      ) : (
        <input
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={e=>onChange(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter') onSubmit(); }}
          placeholder={placeholder}
          autoFocus
          aria-invalid={errored ? 'true' : 'false'}
          style={{
            ...inputBase,
            width:'100%',
            padding:'18px 20px',
            border:`1px solid ${borderColor}`,
            borderRadius:5,
            transition:'border-color .15s var(--ease-out)',
          }}
          onFocus={()=>setFocused(true)}
          onBlur={()=>setFocused(false)}
        />
      )}
      {errored && (
        <div style={{fontSize:13,color:'#c0392b',fontWeight:500}}>{error}</div>
      )}
      <button
        onClick={onSubmit}
        disabled={!value.trim()}
        className="uc-btn b-primary"
        style={{alignSelf:'flex-start',marginTop:4,opacity:value.trim()?1:.4,cursor:value.trim()?'pointer':'default'}}>
        Continue <span>→</span>
      </button>
    </div>
  );
}

/* ------- Edition step title helper ------- */
function editionTitle(erpId){
  const erp = ERP_OPTIONS.find(o=>o.id===erpId);
  if (!erp) return 'Which edition?';
  if (erpId === 'other') return 'Which ERP and edition?';
  return `Which edition of ${erp.label}?`;
}

/* ------- Recap card ------- */
function recapRows(answers, otherErp, otherPlatform, contact){
  const erpName = answers.erp === 'other'
    ? (otherErp || 'Other')
    : (ERP_OPTIONS.find(o=>o.id===answers.erp)?.label || '');
  const platformName = answers.platform === 'Other'
    ? (otherPlatform || 'Other')
    : (answers.platform || '');
  const modelName = MODEL_OPTIONS.find(o=>o.id===answers.model)?.label || answers.model || '';
  return [
    {l:'Name',                  v:contact?.name    || ''},
    {l:'Company Website',       v:contact?.company || ''},
    {l:'Email',                 v:contact?.email   || ''},
    {l:'ERP',                   v:erpName},
    {l:'Edition',               v:answers.edition || ''},
    {l:'Current platform',      v:platformName},
    {l:'Annual online revenue', v:answers.revenue || ''},
    {l:'Model',                 v:modelName},
  ];
}

function RecapCard({rows}){
  return (
    <div style={{
      background:'#fff',border:'1px solid var(--uc-black)',borderRadius:5,
      padding:'8px 24px',marginBottom:28,
      boxShadow:'0 4px 16px rgba(10,10,10,0.06)',
    }}>
      {rows.map((r,i)=>(
        <div key={r.l} style={{
          display:'grid',gridTemplateColumns:'180px 1fr',gap:24,
          padding:'16px 0',
          borderTop: i===0 ? 'none' : '1px solid var(--line-1)',
          alignItems:'baseline',
        }}>
          <span style={{fontFamily:'var(--font-mono)',fontSize:11,fontWeight:600,letterSpacing:'.1em',color:'var(--fg-3)',textTransform:'uppercase'}}>{r.l}</span>
          <span style={{fontSize:16,fontWeight:500,color:'var(--fg-1)'}}>{r.v}</span>
        </div>
      ))}
    </div>
  );
}

/* ------- Final step: scoped recap + Stripe checkout ------- */
function Confirmation({answers, otherErp, otherPlatform, contact, setupPromiseRef, onSessionComplete}){
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;

  // Push the prospect into Attio the moment they hit this screen (well before
  // they actually pay). The returned Attio record id is held in a ref so the
  // payment-confirm handler can pass it back to /setup-complete, which flips
  // the stage to "Ordered". Fires once per mount; Attio failures are silent
  // (the server logs and returns null — we just won't have an id to update).
  const blueprintRecordIdRef = React.useRef(null);
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch('/api/build/attio-prospect', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            contact,
            answers: {
              ...answers,
              platform: answers.platform === 'Other' && otherPlatform ? otherPlatform : answers.platform,
            },
            otherErp,
            otherPlatform,
          }),
        });
        const data = await resp.json().catch(() => ({}));
        if (!cancelled && data && data.blueprintRecordId) {
          blueprintRecordIdRef.current = data.blueprintRecordId;
        }
      } catch (_) {
        // Non-fatal; CRM outage shouldn't block payment.
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{animation:'quizFadeIn 480ms var(--ease-out) both'}}>
      <div style={{display:'inline-flex',alignItems:'center',gap:10,padding:'6px 14px',background:'var(--uc-signal)',borderRadius:999,marginBottom:24}}>
        <span style={{width:8,height:8,borderRadius:999,background:'var(--uc-black)'}}/>
        <span style={{fontFamily:'var(--font-mono)',fontSize:11,fontWeight:700,letterSpacing:'.12em',color:'var(--uc-black)'}}>READY TO RESERVE</span>
      </div>
      <h1 style={{
        fontFamily:'var(--font-display)',fontWeight:700,
        fontSize:'clamp(36px,4vw,56px)',lineHeight:1.02,letterSpacing:'-.03em',
        color:'var(--fg-1)',margin:'0 0 14px',textWrap:'balance',
      }}>
        Your Blueprint is scoped.
      </h1>
      <p style={{
        fontFamily:'var(--font-serif)',fontStyle:'italic',
        fontSize:'clamp(20px,1.8vw,26px)',lineHeight:1.35,
        color:'var(--fg-2)',margin:'0 0 36px',maxWidth:560,letterSpacing:'-.01em',
      }}>
        $500 reservation fee. Fully refundable if we're not a fit.
      </p>

      <RecapCard rows={recapRows(answers, otherErp, otherPlatform, contact)}/>

      <CardOnFile
        answers={answers}
        otherErp={otherErp}
        otherPlatform={otherPlatform}
        contact={contact}
        isMobile={isMobile}
        setupPromiseRef={setupPromiseRef}
        blueprintRecordIdRef={blueprintRecordIdRef}
        onSessionComplete={onSessionComplete}
      />

      <div style={{
        fontSize:12,fontWeight:600,letterSpacing:'.12em',textTransform:'uppercase',
        color:'var(--fg-3)',textAlign:'center',marginBottom:24,
      }}>
        Migration Blueprint · 4 weeks · yours to keep
      </div>

      <div style={{display:'flex',gap:24,flexWrap:'wrap',fontSize:13,color:'var(--fg-3)'}}>
        <span style={{display:'inline-flex',alignItems:'center',gap:8}}>
          <Lock/> Secure Stripe payment
        </span>
        <span style={{display:'inline-flex',alignItems:'center',gap:8}}>
          <CheckSm/> $500 fully refundable if not a fit.
        </span>
        <span style={{display:'inline-flex',alignItems:'center',gap:8}}>
          <DiscountSm/> Credited toward implementation
        </span>
      </div>
    </div>
  );
}

/* ------- Stripe PaymentIntent + Payment Element ($500 reservation fee) ------- */
// `contact` is collected on the contact quiz steps and passed in via props.
// Name/email are forwarded to Stripe at confirm time as PaymentMethod
// billing_details; company is sent to setup-complete and stored as Stripe
// customer metadata + surfaced in the notify email.
function CardOnFile({answers, otherErp, otherPlatform, contact, isMobile, setupPromiseRef, blueprintRecordIdRef, onSessionComplete}){
  // Phases: loading → ready → submitting → success | error
  const [phase, setPhase] = React.useState('loading');
  const [error, setError] = React.useState('');
  const [intentId, setIntentId] = React.useState('');
  const [stripeRefs, setStripeRefs] = React.useState(null);
  const paymentRef = React.useRef(null);
  // Always-fresh reference to the confirm flow so handlers attached during
  // the one-time mount effect can still call the latest closure (which
  // captures up-to-date contact details + state setters).
  const finalizeRef = React.useRef(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Use the PaymentIntent that was pre-fetched at step 4 click if it
        // exists; otherwise (e.g. hot-reload landing straight on confirm)
        // fetch on demand.
        const data = setupPromiseRef && setupPromiseRef.current
          ? await setupPromiseRef.current
          : await (async () => {
              const merged = {
                ...answers,
                platform: answers.platform === 'Other' && otherPlatform
                  ? otherPlatform
                  : answers.platform,
              };
              const resp = await fetch('/api/checkout/setup-intent', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ answers: merged, otherErp }),
              });
              const r = await resp.json().catch(() => ({}));
              if (!resp.ok || !r.ok) throw new Error(r.error || `Setup failed (${resp.status})`);
              return r;
            })();
        if (cancelled) return;
        if (typeof window.Stripe !== 'function') {
          throw new Error('Stripe.js failed to load. Refresh the page or try again later.');
        }
        setIntentId(data.intentId);
        const stripe = window.Stripe(data.publishableKey);
        const elements = stripe.elements({
          clientSecret: data.clientSecret,
          // Show Stripe's own skeleton inside the Payment Element iframe
          // before fields are interactive: gives a consistent visual
          // while we keep our placeholder over it until `ready` fires.
          loader: 'always',
          appearance: {
            theme: 'flat',
            variables: {
              fontFamily: 'system-ui, -apple-system, "Segoe UI", Inter, Helvetica, Arial, sans-serif',
              fontSizeBase: '15px',
              colorPrimary: '#0a0a0a',
              colorText: '#0a0a0a',
              colorDanger: '#c0392b',
              borderRadius: '5px',
              spacingUnit: '4px',
            },
            rules: {
              '.Input': { border: '1px solid #e6e6e6', boxShadow: 'none' },
              '.Input:focus': { border: '1px solid #0a0a0a' },
              '.Label': { fontWeight: '600', color: '#3d3d3d' },
            },
          },
        });

        // Card Payment Element. Uses our own contact fields (collected
        // on the quiz steps) for billing details via confirmParams
        // instead of Stripe's built-ins.
        const paymentElement = elements.create('payment', {
          layout: 'tabs',
          fields: { billingDetails: { name:'never', email:'never', phone:'never', address:'never' } },
        });
        paymentElement.on('ready', () => {
          if (cancelled) return;
          setPhase('ready');
        });
        paymentElement.mount(paymentRef.current);

        setStripeRefs({ stripe, elements });
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Could not initialize payment.');
        setPhase('error');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Confirm flow: runs stripe.confirmSetup() with our collected billing
  // details, then finalises on the worker via /api/checkout/setup-complete.
  const finalize = async () => {
    if (!stripeRefs || phase === 'submitting') return;
    setPhase('submitting');
    setError('');
    const { stripe, elements } = stripeRefs;
    const { error: confirmErr, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name:  contact.name.trim(),
            email: contact.email.trim(),
          },
        },
      },
      redirect: 'if_required',
    });
    if (confirmErr) {
      setError(confirmErr.message || 'Could not process the reservation.');
      setPhase('ready');
      return;
    }
    try {
      const resp = await fetch('/api/checkout/setup-complete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          intentId: (paymentIntent && paymentIntent.id) || intentId,
          company: contact.company.trim(),
          blueprintRecordId: (blueprintRecordIdRef && blueprintRecordIdRef.current) || null,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.ok) throw new Error(data.error || `Reservation failed (${resp.status})`);
      setPhase('success');
      if (onSessionComplete) onSessionComplete();
    } catch (err) {
      setError(err.message || 'Charge went through, but we could not finalize. Email denis@uncap.com.');
      setPhase('ready');
    }
  };
  finalizeRef.current = finalize;

  if (phase === 'success') {
    return (
      <div style={{
        background:'var(--uc-black)',color:'#fff',borderRadius:5,
        padding: isMobile ? '28px 22px' : 36, marginBottom:14,
        textAlign:'center',
      }}>
        <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:48,height:48,borderRadius:999,background:'var(--uc-signal)',marginBottom:18,color:'var(--uc-black)'}}>
          <svg width="22" height="22" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7.5L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:22,letterSpacing:'-.02em',marginBottom:8}}>
          $500 reservation locked in.
        </div>
        <div style={{fontSize:14,color:'var(--uc-stone-300)',maxWidth:420,margin:'0 auto',lineHeight:1.5}}>
          We'll be in touch within one business day to schedule your fit call. If we're not a fit, we'll fully refund the $500. If we are, we'll start the Blueprint.
        </div>
      </div>
    );
  }

  const buttonDisabled = phase !== 'ready';
  const onSubmit = (e) => {
    e.preventDefault();
    finalize();
  };

  return (
    <form onSubmit={onSubmit} style={{
      background:'var(--uc-black)',color:'#fff',borderRadius:5,
      padding: isMobile ? '20px 14px' : 28, marginBottom:14,
      display:'flex',flexDirection:'column',gap:18,
    }}>
      <div style={{
        fontFamily:'var(--font-display)',fontWeight:500,
        fontSize: isMobile ? 14 : 'clamp(13px, 1.2vw, 15px)',
        lineHeight:1.4,letterSpacing:'-.005em',
        textAlign: isMobile ? 'center' : 'left',
      }}>
        Book your discovery call today.
      </div>
      <div style={{
        position:'relative',
        background:'#fff',color:'var(--fg-1)',borderRadius:5,
        padding: isMobile ? 12 : 16,
        minHeight: isMobile ? 360 : 280,
      }}>
        <div ref={paymentRef}/>
        {phase !== 'ready' && phase !== 'submitting' && (
          <div style={{
            position:'absolute', inset:0,
            background:'#fff', borderRadius:5,
            display:'flex', alignItems:'center', justifyContent:'center',
            padding: isMobile ? 12 : 16,
            fontSize:13, lineHeight:1.5, textAlign:'center',
            color: phase === 'error' && !stripeRefs ? '#c0392b' : 'var(--fg-3)',
          }}>
            {phase === 'error' && !stripeRefs
              ? error
              : 'Preparing secure payment form…'}
          </div>
        )}
      </div>

      {error && stripeRefs && (
        <div style={{fontSize:13,color:'#ffd9d4'}}>{error}</div>
      )}

      <button
        type="submit"
        className="uc-btn b-signal"
        disabled={buttonDisabled}
        style={{
          padding: isMobile ? '16px 20px' : '18px 24px',
          fontSize:16,fontWeight:600,gap:10,
          width:'100%',
          justifyContent:'center',
          whiteSpace: isMobile ? 'normal' : 'nowrap',
          opacity: buttonDisabled ? .55 : 1,
          cursor: buttonDisabled ? 'default' : 'pointer',
          border:'none',
        }}
      >
        <Lock/>
        {phase === 'submitting' ? 'Processing reservation…' : (
          <React.Fragment>
            Reserve Your Spot
            <span style={{
              marginLeft:10,
              padding:'4px 10px',
              background:'#C8E033',
              color:'var(--uc-black)',
              borderRadius:999,
              fontSize:12,
              fontWeight:700,
              letterSpacing:'.04em',
              lineHeight:1,
              whiteSpace:'nowrap',
            }}>$500 deposit</span>
          </React.Fragment>
        )}
      </button>

      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontSize:12,color:'var(--uc-stone-300)',lineHeight:1.45}}>
        $500 reservation fee charged today. Applied towards Blueprint. Fully refundable if we're not a fit on the discovery call.
      </div>
    </form>
  );
}

function Lock(){ return (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="2.5" y="6" width="9" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M4.5 6V4.2a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.3"/>
  </svg>
);}
function CheckSm(){ return (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7.5L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);}
// Small discount-tag icon: price-tag silhouette + dot accent. Sized to drop
// in alongside CheckSm in the post-Stripe payment strip.
function DiscountSm(){ return (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7.4 1.4H12.2V6.2L6.0 12.4L1.6 8L7.4 1.4Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"/>
    <circle cx="9.7" cy="4.1" r="0.9" fill="currentColor"/>
  </svg>
);}

window.QuizApp = QuizApp;
