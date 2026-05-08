// QuizApp.jsx — Pharmacy-style full-page intake quiz
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
  'None — first ecommerce site',
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

function QuizApp(){
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState({
    erp: null,
    edition: null,
    platform: null,
    revenue: null,
    model: null,
  });
  const [otherErp, setOtherErp] = React.useState('');
  // Contact details collected on the Application step (step 5), forwarded to
  // the Reservation step (step 6) where Stripe attaches them to the
  // PaymentMethod at confirm time. Lifted here so values survive back-nav
  // between the two confirmation sub-steps.
  const [contact, setContact] = React.useState({ name:'', email:'', company:'', phone:'' });

  // Quiz steps (5) + two confirmation sub-steps:
  //   step === STEPS.length     → Application (recap + contact form)
  //   step === STEPS.length + 1 → Reservation (Stripe card-on-file form)
  const STEPS = ['erp', 'edition', 'platform', 'revenue', 'model'];
  const isConfirm = step >= STEPS.length;
  const isApplication = step === STEPS.length;
  const isReservation = step === STEPS.length + 1;
  const totalProgress = STEPS.length;

  const set = (key, value) => {
    setAnswers(prev => ({...prev, [key]: value}));
  };

  // Pre-fetch the SetupIntent the instant we have all five answers, so the
  // Stripe form is already ready by the time the user reaches the
  // Reservation step. Discarded only when back-navigating into the quiz so
  // bouncing between Application and Reservation doesn't refetch.
  const setupPromiseRef = React.useRef(null);
  const startSetupIntent = (fullAnswers, fullOtherErp) => {
    if (setupPromiseRef.current) return;
    setupPromiseRef.current = (async () => {
      const resp = await fetch('/api/checkout/setup-intent', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ answers: fullAnswers, otherErp: fullOtherErp }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.ok) throw new Error(data.error || `Setup failed (${resp.status})`);
      return data;
    })();
  };

  const advance = () => setStep(s => s + 1);
  const back = () => {
    // Only invalidate the pre-fetched SetupIntent when crossing back from
    // Application (step 5) into the quiz — quiz answers can change. Going
    // from Reservation (step 6) → Application (step 5) keeps the intent.
    if (step === STEPS.length) setupPromiseRef.current = null;
    setStep(s => Math.max(0, s - 1));
  };

  // Auto-advance helper for radio steps
  const choose = (key, value) => {
    set(key, value);
    setTimeout(advance, 220);
  };

  return (
    <div data-screen-label="Blueprint Quiz" style={{
      minHeight:'100vh',
      background:'var(--uc-cream)',
      color:'var(--fg-1)',
      fontFamily:'var(--font-sans)',
      display:'flex',flexDirection:'column',
    }}>
      <QuizHeader
        step={step}
        total={totalProgress}
        onBack={back}
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
              eyebrow="Step 1 of 5"
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
              eyebrow="Step 2 of 5"
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
              eyebrow="Step 3 of 5"
              title="What ecommerce platform are you on today?"
              sub="Where you're migrating from shapes the entire data plan."
            >
              <OptionGrid
                options={PLATFORM_OPTIONS.map(o=>({value:o,label:o}))}
                selected={answers.platform}
                onChoose={(v)=>choose('platform', v)}
              />
            </Step>
          )}

          {step === 3 && (
            <Step
              eyebrow="Step 4 of 5"
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
              eyebrow="Step 5 of 5"
              title="Which best describes your model?"
            >
              <OptionGrid
                options={MODEL_OPTIONS.map(o=>({value:o.id,label:o.label,sub:o.sub}))}
                selected={answers.model}
                onChoose={(v)=>{
                  startSetupIntent({...answers, model: v}, otherErp);
                  choose('model', v);
                }}
                columns={1}
              />
            </Step>
          )}

          {isApplication && (
            <Application
              answers={answers}
              otherErp={otherErp}
              contact={contact}
              setContact={setContact}
              onComplete={advance}
            />
          )}

          {isReservation && (
            <Reservation
              answers={answers}
              otherErp={otherErp}
              contact={contact}
              setupPromiseRef={setupPromiseRef}
            />
          )}
        </div>
      </main>
    </div>
  );
}

/* ------- Header w/ progress ------- */
function QuizHeader({step, total, onBack, isConfirm}){
  const pct = isConfirm ? 100 : Math.round((step / total) * 100);
  return (
    <header style={{
      position:'sticky',top:0,zIndex:10,
      background:'rgba(242,239,231,0.92)',
      backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)',
      borderBottom:'1px solid var(--line-1)',
    }}>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'14px 24px 16px',position:'relative',display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
        {/* Back button — absolute top-left so it doesn't disrupt centering */}
        {step > 0 && (
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
        <a href="/" style={{display:'flex',alignItems:'center',gap:12,textDecoration:'none',color:'var(--fg-1)'}}>
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
            {isConfirm ? 'COMPLETE' : `${Math.min(step+1,total)} / ${total}`}
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

/* ------- Free-text step (used for "Other" ERP) ------- */
function FreeTextStep({placeholder, value, onChange, onSubmit}){
  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <input
        type="text"
        value={value}
        onChange={e=>onChange(e.target.value)}
        onKeyDown={e=>{ if(e.key==='Enter') onSubmit(); }}
        placeholder={placeholder}
        autoFocus
        style={{
          width:'100%',
          padding:'18px 20px',
          fontSize:18,fontFamily:'var(--font-sans)',fontWeight:500,
          color:'var(--fg-1)',
          background:'#fff',
          border:'1px solid var(--line-1)',borderRadius:5,
          outline:'none',
          transition:'border-color .15s var(--ease-out)',
        }}
        onFocus={e=>e.currentTarget.style.borderColor='var(--uc-black)'}
        onBlur={e=>e.currentTarget.style.borderColor='var(--line-1)'}
      />
      <button
        onClick={onSubmit}
        disabled={!value.trim()}
        className="uc-btn b-primary"
        style={{alignSelf:'flex-start',opacity:value.trim()?1:.4,cursor:value.trim()?'pointer':'default'}}>
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

/* ------- Recap card (shared by Application + Reservation) ------- */
function recapRows(answers, otherErp){
  const erpName = answers.erp === 'other'
    ? (otherErp || 'Other')
    : (ERP_OPTIONS.find(o=>o.id===answers.erp)?.label || '—');
  const modelName = MODEL_OPTIONS.find(o=>o.id===answers.model)?.label || answers.model || '—';
  return [
    {l:'ERP',                   v:erpName},
    {l:'Edition',               v:answers.edition || '—'},
    {l:'Current platform',      v:answers.platform || '—'},
    {l:'Annual online revenue', v:answers.revenue || '—'},
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

/* ------- Step 5: Application (recap + contact form) ------- */
function Application({answers, otherErp, contact, setContact, onComplete}){
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  const [submitAttempted, setSubmitAttempted] = React.useState(false);

  const errs = {};
  if (!contact.name.trim())    errs.name    = 'Required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) errs.email = 'Enter a valid email';
  if (!contact.company.trim()) errs.company = 'Required';
  if (!contact.phone.trim())   errs.phone   = 'Required';
  const contactValid = Object.keys(errs).length === 0;

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!contactValid) return;
    onComplete();
  };

  const field = (key, label, type, autocomplete) => {
    const showError = submitAttempted && errs[key];
    return (
      <label style={{display:'flex',flexDirection:'column',gap:6,minWidth:0}}>
        <span style={{fontSize:11,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--fg-3)',fontFamily:'var(--font-mono)'}}>{label}</span>
        <input
          type={type}
          autoComplete={autocomplete}
          value={contact[key]}
          onChange={(e)=>setContact(prev=>({...prev, [key]: e.target.value}))}
          aria-invalid={showError ? 'true' : 'false'}
          style={{
            font:'inherit', fontSize:15,
            padding:'12px 14px',
            border: `1px solid ${showError ? '#c0392b' : 'var(--line-1)'}`,
            borderRadius:5,
            background:'#fff',color:'var(--fg-1)',
            outline:'none',
            width:'100%', minHeight:44,
          }}
        />
        {showError && (
          <span style={{fontSize:12,color:'#c0392b',fontWeight:500}}>{errs[key]}</span>
        )}
      </label>
    );
  };

  return (
    <div style={{animation:'quizFadeIn 480ms var(--ease-out) both'}}>
      <div style={{display:'inline-flex',alignItems:'center',gap:10,padding:'6px 14px',background:'var(--uc-signal)',borderRadius:999,marginBottom:24}}>
        <span style={{width:8,height:8,borderRadius:999,background:'var(--uc-black)'}}/>
        <span style={{fontFamily:'var(--font-mono)',fontSize:11,fontWeight:700,letterSpacing:'.12em',color:'var(--uc-black)'}}>YOUR APPLICATION</span>
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
        A few details so we can reach you, then one last step to lock it in.
      </p>

      <RecapCard rows={recapRows(answers, otherErp)}/>

      <form onSubmit={onSubmit} style={{display:'flex',flexDirection:'column',gap:20,marginBottom:14}}>
        <div style={{
          background:'#fff', border:'1px solid var(--line-1)', borderRadius:5,
          padding: isMobile ? 16 : 24,
          display:'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: 16,
        }}>
          {field('name',    'Name',    'text',  'name')}
          {field('email',   'Email',   'email', 'email')}
          {field('company', 'Company', 'text',  'organization')}
          {field('phone',   'Phone',   'tel',   'tel')}
        </div>

        <button
          type="submit"
          className="uc-btn b-primary"
          style={{
            padding: isMobile ? '16px 20px' : '18px 24px',
            fontSize:16,fontWeight:600,gap:10,
            width:'100%',
            justifyContent:'center',
            whiteSpace: isMobile ? 'normal' : 'nowrap',
            border:'none',
          }}
        >
          Complete the application
          <span>→</span>
        </button>
      </form>

      <div style={{marginTop:48,paddingTop:24,borderTop:'1px solid var(--line-1)',fontSize:13,color:'var(--fg-3)'}}>
        Not ready? <a href="/call" style={{color:'var(--fg-1)',fontWeight:500}}>Book a 25-min fit call</a> instead.
      </div>
    </div>
  );
}

/* ------- Step 6: Reservation (Stripe card-on-file form) ------- */
function Reservation({answers, otherErp, contact, setupPromiseRef}){
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  return (
    <div style={{animation:'quizFadeIn 480ms var(--ease-out) both'}}>
      <div style={{display:'inline-flex',alignItems:'center',gap:10,padding:'6px 14px',background:'var(--uc-signal)',borderRadius:999,marginBottom:24}}>
        <span style={{width:8,height:8,borderRadius:999,background:'var(--uc-black)'}}/>
        <span style={{fontFamily:'var(--font-mono)',fontSize:11,fontWeight:700,letterSpacing:'.12em',color:'var(--uc-black)'}}>RESERVE YOUR SLOT</span>
      </div>
      <h1 style={{
        fontFamily:'var(--font-display)',fontWeight:700,
        fontSize:'clamp(36px,4vw,56px)',lineHeight:1.02,letterSpacing:'-.03em',
        color:'var(--fg-1)',margin:'0 0 14px',textWrap:'balance',
      }}>
        $0 today. Card on file.
      </h1>
      <p style={{
        fontFamily:'var(--font-serif)',fontStyle:'italic',
        fontSize:'clamp(20px,1.8vw,26px)',lineHeight:1.35,
        color:'var(--fg-2)',margin:'0 0 36px',maxWidth:560,letterSpacing:'-.01em',
      }}>
        We charge only after the introductory fit call confirms scope. Full refund if it isn't a match.
      </p>

      <CardOnFile
        answers={answers}
        otherErp={otherErp}
        contact={contact}
        isMobile={isMobile}
        setupPromiseRef={setupPromiseRef}
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
          <CheckSm/> $0 risk. Full refund if not a fit.
        </span>
        <span style={{display:'inline-flex',alignItems:'center',gap:8}}>
          <CheckSm/> Credited toward implementation
        </span>
      </div>

      <div style={{marginTop:48,paddingTop:24,borderTop:'1px solid var(--line-1)',fontSize:13,color:'var(--fg-3)'}}>
        Not ready? <a href="/call" style={{color:'var(--fg-1)',fontWeight:500}}>Book a 25-min fit call</a> instead.
      </div>
    </div>
  );
}

/* ------- Stripe SetupIntent + Payment Element (card on file, $0 today) ------- */
// `contact` is collected on the prior Application step and passed in via
// props. Name/email/phone are forwarded to Stripe at confirm time (we hide
// Stripe's own collectors via `fields.billingDetails: 'never'`); company is
// sent to setup-complete and stored as Stripe customer metadata + surfaced
// in the notify email.
function CardOnFile({answers, otherErp, contact, isMobile, setupPromiseRef}){
  // Phases: loading → ready → submitting → success | error
  const [phase, setPhase] = React.useState('loading');
  const [error, setError] = React.useState('');
  const [intentId, setIntentId] = React.useState('');
  const [stripeRefs, setStripeRefs] = React.useState(null);
  // Whether the Express Checkout Element actually has a wallet to show
  // (Apple Pay / Google Pay / Link). Drives whether we render the buttons
  // or a "no quick payment available on this device" fallback.
  const [expressAvailable, setExpressAvailable] = React.useState(false);
  const expressRef = React.useRef(null);
  // Always-fresh reference to the confirm flow so handlers attached during
  // the one-time mount effect can still call the latest closure (which
  // captures up-to-date contact details + state setters).
  const finalizeRef = React.useRef(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Use the SetupIntent that was pre-fetched at step 4 click if it
        // exists; otherwise (e.g. hot-reload landing straight on confirm)
        // fetch on demand.
        const data = setupPromiseRef && setupPromiseRef.current
          ? await setupPromiseRef.current
          : await (async () => {
              const resp = await fetch('/api/checkout/setup-intent', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ answers, otherErp }),
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
          },
        });

        // Express Checkout (Apple Pay / Google Pay / Link) is the sole
        // payment surface. Renders only the wallets the visitor's browser
        // advertises; if none are available we show a fallback message
        // pointing them at the fit-call form.
        const expressElement = elements.create('expressCheckout', {
          paymentMethodOrder: ['applePay', 'googlePay', 'link'],
          buttonHeight: 48,
        });
        expressElement.on('ready', ({ availablePaymentMethods }) => {
          if (cancelled) return;
          const any = availablePaymentMethods
            ? Object.values(availablePaymentMethods).some(Boolean)
            : false;
          setExpressAvailable(any);
          setPhase('ready');
        });
        expressElement.on('click', (event) => {
          // SetupIntent flow: no line items / shipping needed. Email and
          // phone are already known from the Application step, so don't
          // ask the wallet sheet to collect them again.
          event.resolve({ emailRequired: false, phoneNumberRequired: false });
        });
        expressElement.on('confirm', async () => {
          if (cancelled) return;
          if (finalizeRef.current) await finalizeRef.current();
        });
        expressElement.mount(expressRef.current);
        setStripeRefs({ stripe, elements });
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Could not initialize payment.');
        setPhase('error');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Shared confirm flow — called by both the card-form submit and the
  // Express Checkout Element's `confirm` event. Pulls stripe/elements from
  // state since by the time it runs, mounting has long completed.
  const finalize = async () => {
    if (!stripeRefs || phase === 'submitting') return;
    setPhase('submitting');
    setError('');
    const { stripe, elements } = stripeRefs;
    const { error: confirmErr, setupIntent } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name:  contact.name.trim(),
            email: contact.email.trim(),
            phone: contact.phone.trim(),
          },
        },
      },
      redirect: 'if_required',
    });
    if (confirmErr) {
      setError(confirmErr.message || 'Could not save card.');
      setPhase('ready');
      return;
    }
    try {
      const resp = await fetch('/api/checkout/setup-complete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          intentId: (setupIntent && setupIntent.id) || intentId,
          company: contact.company.trim(),
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.ok) throw new Error(data.error || `Save failed (${resp.status})`);
      setPhase('success');
    } catch (err) {
      setError(err.message || 'Card saved, but we could not finalize. Email denis@uncap.com.');
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
          Card on file. $0 charged today.
        </div>
        <div style={{fontSize:14,color:'var(--uc-stone-300)',maxWidth:420,margin:'0 auto',lineHeight:1.5}}>
          We'll be in touch within one business day to schedule your fit call. After it confirms scope, we'll charge the saved card and start the Blueprint.
        </div>
      </div>
    );
  }

  // The Express Checkout Element drives the whole flow — there is no manual
  // submit. Phases:
  //   'loading'     → placeholder shown (waiting on SetupIntent + express ready)
  //   'ready'       → either express buttons (if expressAvailable) or
  //                    a "no quick payment available" fallback message
  //   'submitting'  → user has tapped a wallet button and confirm is in flight
  return (
    <div style={{
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
        We take on 8 Blueprints per quarter.{' '}
        <strong style={{fontWeight:700}}>Lock yours in. $0 today.</strong>
      </div>

      {/* Wrapper reserves height while we wait on Stripe's `ready` event so */}
      {/* the page doesn't reflow when the wallet buttons paint.            */}
      <div style={{
        position:'relative',
        background:'#fff',color:'var(--fg-1)',borderRadius:5,
        padding: isMobile ? 14 : 18,
        minHeight: 96,
      }}>
        <div ref={expressRef} style={{
          opacity: phase === 'ready' && expressAvailable ? 1 : 0,
          transition: 'opacity 160ms var(--ease-out)',
          pointerEvents: phase === 'submitting' ? 'none' : 'auto',
        }}/>
        {phase !== 'submitting' && !(phase === 'ready' && expressAvailable) && (
          <div style={{
            position:'absolute', inset:0,
            background:'#fff', borderRadius:5,
            display:'flex', alignItems:'center', justifyContent:'center',
            padding: isMobile ? 14 : 18,
            fontSize:13, lineHeight:1.5, textAlign:'center',
            color: phase === 'error' && !stripeRefs ? '#c0392b' : 'var(--fg-3)',
          }}>
            {phase === 'error' && !stripeRefs
              ? error
              : phase === 'ready' && !expressAvailable
                ? <span>Quick payment isn't available on this device. <a href="/call" style={{color:'var(--fg-1)',fontWeight:600}}>Book a 25-min fit call</a> and we'll send a card-save link.</span>
                : 'Preparing secure checkout…'}
          </div>
        )}
        {phase === 'submitting' && (
          <div style={{
            position:'absolute', inset:0,
            background:'rgba(255,255,255,0.85)', borderRadius:5,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:13, color:'var(--fg-2)', fontWeight:500,
          }}>
            Saving card…
          </div>
        )}
      </div>

      {error && stripeRefs && (
        <div style={{fontSize:13,color:'#ffd9d4'}}>{error}</div>
      )}

      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontSize:12,color:'var(--uc-stone-300)',lineHeight:1.45}}>
        <Lock/>
        $0 today. Card kept on file. Charged after we confirm fit on the intro call.
      </div>
    </div>
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

window.QuizApp = QuizApp;
