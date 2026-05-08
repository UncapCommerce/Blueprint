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

  // Number of "real" steps before confirmation. Confirmation is index = STEPS.length.
  const STEPS = ['erp', 'edition', 'platform', 'revenue', 'model'];
  const isConfirm = step >= STEPS.length;
  const totalProgress = STEPS.length;

  const set = (key, value) => {
    setAnswers(prev => ({...prev, [key]: value}));
  };

  const advance = () => setStep(s => s + 1);
  const back = () => setStep(s => Math.max(0, s - 1));

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
                onChoose={(v)=>choose('model', v)}
                columns={1}
              />
            </Step>
          )}

          {isConfirm && (
            <Confirm answers={answers} otherErp={otherErp}/>
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
        {step > 0 && !isConfirm && (
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

/* ------- Confirmation screen ------- */
function Confirm({answers, otherErp}){
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  const erpName = answers.erp === 'other'
    ? (otherErp || 'Other')
    : (ERP_OPTIONS.find(o=>o.id===answers.erp)?.label || '—');
  const editionName = answers.edition || '—';
  const platformName = answers.platform || '—';
  const revenueName = answers.revenue || '—';
  const modelName = MODEL_OPTIONS.find(o=>o.id===answers.model)?.label || answers.model || '—';

  const rows = [
    {l:'ERP',                      v:erpName},
    {l:'Edition',                  v:editionName},
    {l:'Current platform',         v:platformName},
    {l:'Annual online revenue',    v:revenueName},
    {l:'Model',                    v:modelName},
  ];

  return (
    <div style={{animation:'quizFadeIn 480ms var(--ease-out) both'}}>
      <div style={{display:'inline-flex',alignItems:'center',gap:10,padding:'6px 14px',background:'var(--uc-signal)',borderRadius:999,marginBottom:24}}>
        <span style={{width:8,height:8,borderRadius:999,background:'var(--uc-black)'}}/>
        <span style={{fontFamily:'var(--font-mono)',fontSize:11,fontWeight:700,letterSpacing:'.12em',color:'var(--uc-black)'}}>READY TO START</span>
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
        Lock it in. We'll be in touch within one business day to schedule your kickoff.
      </p>

      {/* Recap card */}
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

      <CardOnFile answers={answers} otherErp={otherErp} isMobile={isMobile}/>
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
function CardOnFile({answers, otherErp, isMobile}){
  // Phases: loading → ready → submitting → success | error
  const [phase, setPhase] = React.useState('loading');
  const [error, setError] = React.useState('');
  const [intentId, setIntentId] = React.useState('');
  const [stripeRefs, setStripeRefs] = React.useState(null);
  const paymentRef = React.useRef(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch('/api/checkout/setup-intent', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ answers, otherErp }),
        });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok || !data.ok) throw new Error(data.error || `Setup failed (${resp.status})`);
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
            rules: {
              '.Input': { border: '1px solid #e6e6e6', boxShadow: 'none' },
              '.Input:focus': { border: '1px solid #0a0a0a' },
              '.Label': { fontWeight: '600', color: '#3d3d3d' },
            },
          },
        });
        const paymentElement = elements.create('payment', { layout: 'tabs' });
        // Wait for the iframe to be visually ready before crossfading the
        // loader out — otherwise we get a flick where the loader vanishes
        // and the user stares at empty space until the iframe paints.
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

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!stripeRefs || phase === 'submitting') return;
    setPhase('submitting');
    setError('');
    const { stripe, elements } = stripeRefs;
    const { error: confirmErr, setupIntent } = await stripe.confirmSetup({
      elements,
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
        body: JSON.stringify({ intentId: (setupIntent && setupIntent.id) || intentId }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.ok) throw new Error(data.error || `Save failed (${resp.status})`);
      setPhase('success');
    } catch (err) {
      setError(err.message || 'Card saved, but we could not finalize. Email denis@uncap.com.');
      setPhase('ready');
    }
  };

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

  const buttonDisabled = phase !== 'ready';
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
        We take on 8 Blueprints per quarter.{' '}
        <strong style={{fontWeight:700}}>Lock yours in. $0 today.</strong>
      </div>

      {/* Reserve the height the Payment Element will occupy so the loader → */}
      {/* element handoff doesn't reflow the page. Loader sits absolutely on */}
      {/* top of the (initially empty) Stripe mount point and crossfades out */}
      {/* once Stripe fires its `ready` event. */}
      <div style={{
        position:'relative',
        background:'#fff',color:'var(--fg-1)',borderRadius:5,
        padding: isMobile ? 12 : 16,
        // Reserve enough height for the Payment Element so the wrapper
        // doesn't grow when Stripe paints. On mobile the tabs layout
        // stacks expiry/CVC vertically, which is much taller than desktop.
        minHeight: isMobile ? 360 : 280,
      }}>
        <div style={{
          position:'absolute', inset:0,
          display:'flex', alignItems:'center', justifyContent:'center',
          padding: isMobile ? 12 : 16,
          fontSize:13, lineHeight:1.5, textAlign:'center',
          color: phase === 'error' && !stripeRefs ? '#c0392b' : 'var(--fg-3)',
          opacity: phase === 'ready' || phase === 'submitting' ? 0 : 1,
          pointerEvents: phase === 'ready' || phase === 'submitting' ? 'none' : 'auto',
          transition: 'opacity 200ms var(--ease-out)',
        }}>
          {phase === 'error' && !stripeRefs
            ? error
            : 'Loading secure payment form…'}
        </div>
        <div ref={paymentRef} style={{
          opacity: phase === 'ready' || phase === 'submitting' ? 1 : 0,
          transition: 'opacity 200ms var(--ease-out)',
        }}/>
      </div>

      {error && phase !== 'loading' && stripeRefs && (
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
        {phase === 'submitting' ? 'Saving card…' : 'Reserve your slot · $0 today'}
        <span>→</span>
      </button>

      <div style={{fontSize:12,color:'var(--uc-stone-300)',textAlign:'center',lineHeight:1.45}}>
        $0 today. Card kept on file. Charged after we confirm fit on the intro call.
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

window.QuizApp = QuizApp;
