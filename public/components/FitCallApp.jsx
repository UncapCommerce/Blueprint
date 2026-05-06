// FitCallApp.jsx — Mirrors the QuizApp 5-step flow, but ends in a contact
// form. On submit, posts to /api/call which emails NOTIFY_EMAIL via
// Resend (configured in worker/index.js + wrangler.toml).

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
  other:     null,
};

const PLATFORM_OPTIONS = [
  'None — first ecommerce site',
  'Magento / Adobe Commerce',
  'BigCommerce',
  'Salesforce Commerce Cloud',
  'WooCommerce',
  'Optimizely Commerce',
  'SAP Commerce Cloud',
  'commercetools',
  'VTEX',
  'NetSuite SuiteCommerce',
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
  {id:'b2b',  label:'B2B',  sub:'Wholesale, distribution, dealer networks'},
  {id:'dtc',  label:'DTC',  sub:'Direct-to-consumer'},
  {id:'both', label:'Both', sub:'Unified commerce'},
];

const STEPS = ['erp', 'edition', 'platform', 'revenue', 'model'];
// Total progress steps shown in header = 5 quiz steps + 1 form = 6
const TOTAL_PROGRESS = STEPS.length + 1;

function FitCallApp(){
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState({
    erp: null, edition: null, platform: null, revenue: null, model: null,
  });
  const [otherErp, setOtherErp] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const isForm    = step === STEPS.length;
  const isSuccess = submitted;

  const set = (key, value) => setAnswers(prev => ({...prev, [key]: value}));
  const advance = () => setStep(s => s + 1);
  const back = () => setStep(s => Math.max(0, s - 1));
  const choose = (key, value) => { set(key, value); setTimeout(advance, 220); };

  return (
    <div data-screen-label="Blueprint Fit Call" style={{
      minHeight:'100vh',
      background:'var(--uc-cream)',
      color:'var(--fg-1)',
      fontFamily:'var(--font-sans)',
      display:'flex',flexDirection:'column',
    }}>
      <FitHeader
        step={step}
        total={TOTAL_PROGRESS}
        onBack={back}
        isSuccess={isSuccess}
      />

      <main style={{
        flex:1,
        display:'flex',
        alignItems:'flex-start',
        justifyContent:'center',
        padding:'48px 24px 96px',
      }}>
        <div style={{width:'100%',maxWidth:680}}>
          {step === 0 && !isSuccess && (
            <Step
              eyebrow="Step 1 of 5"
              title="What ERP do you run on?"
              sub="We'll tailor the call around your system of record."
            >
              <OptionGrid
                options={ERP_OPTIONS.map(o=>({value:o.id,label:o.label}))}
                selected={answers.erp}
                onChoose={(v)=>choose('erp', v)}
              />
            </Step>
          )}

          {step === 1 && !isSuccess && (
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
                    if (otherErp.trim()) { set('edition', otherErp.trim()); advance(); }
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

          {step === 2 && !isSuccess && (
            <Step
              eyebrow="Step 3 of 5"
              title="What ecommerce platform are you on today?"
              sub="Where you're migrating from shapes the entire conversation."
            >
              <OptionGrid
                options={PLATFORM_OPTIONS.map(o=>({value:o,label:o}))}
                selected={answers.platform}
                onChoose={(v)=>choose('platform', v)}
              />
            </Step>
          )}

          {step === 3 && !isSuccess && (
            <Step
              eyebrow="Step 4 of 5"
              title="What's your annual online revenue?"
              sub="Helps us calibrate scale before the call."
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

          {step === 4 && !isSuccess && (
            <Step
              eyebrow="Step 5 of 5"
              title="Which best describes your model?"
              sub=""
            >
              <OptionGrid
                options={MODEL_OPTIONS.map(o=>({value:o.id,label:o.label,sub:o.sub}))}
                selected={answers.model}
                onChoose={(v)=>choose('model', v)}
                columns={1}
                size="lg"
              />
            </Step>
          )}

          {isForm && !isSuccess && (
            <BookingForm
              answers={answers}
              otherErp={otherErp}
              onSuccess={()=>setSubmitted(true)}
            />
          )}

          {isSuccess && <SuccessScreen/>}
        </div>
      </main>
    </div>
  );
}

/* ------- Header w/ progress (centered, mirrors QuizHeader) ------- */
function FitHeader({step, total, onBack, isSuccess}){
  // If submitted, fill the bar 100%. Otherwise step+1 / total.
  const pct = isSuccess ? 100 : Math.round(((step) / total) * 100);
  const showBack = step > 0 && !isSuccess;
  return (
    <header style={{
      position:'sticky',top:0,zIndex:10,
      background:'rgba(242,239,231,0.92)',
      backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)',
      borderBottom:'1px solid var(--line-1)',
    }}>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'14px 24px 16px',position:'relative',display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
        {showBack && (
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

        <a href="/" style={{display:'flex',alignItems:'center',gap:12,textDecoration:'none',color:'var(--fg-1)'}}>
          <img src="/assets/uncap-logo-black.svg" style={{height:20}} alt="Uncap"/>
          <span style={{height:14,width:1,background:'var(--line-1)'}}/>
          <span style={{fontFamily:'var(--font-display)',fontWeight:600,fontSize:13,letterSpacing:'-.01em'}}>Blueprint</span>
        </a>

        <div style={{display:'flex',alignItems:'center',gap:12,width:'100%',maxWidth:520}}>
          <div style={{flex:1,height:4,background:'var(--uc-stone-200)',borderRadius:999,overflow:'hidden'}}>
            <div style={{
              width:`${pct}%`,height:'100%',
              background:'var(--uc-black)',
              transition:'width 360ms var(--ease-out)',
            }}/>
          </div>
          <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--fg-3)',letterSpacing:'.06em',whiteSpace:'nowrap'}}>
            {isSuccess ? 'COMPLETE' : `${Math.min(step+1,total)} / ${total}`}
          </span>
        </div>
      </div>
    </header>
  );
}

/* ------- Step layout ------- */
function Step({eyebrow, title, sub, children}){
  return (
    <div style={{animation:'quizFadeIn 380ms var(--ease-out) both'}}>
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
    <div style={{display:'grid',gridTemplateColumns:`repeat(${columns}, 1fr)`,gap:12}}>
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

function editionTitle(erpId){
  const erp = ERP_OPTIONS.find(o=>o.id===erpId);
  if (!erp) return 'Which edition?';
  if (erpId === 'other') return 'Which ERP and edition?';
  return `Which edition of ${erp.label}?`;
}

/* ------- Final step: Booking form ------- */
function BookingForm({answers, otherErp, onSuccess}){
  const [form, setForm] = React.useState({
    fullName:'', email:'', phone:'', company:'', notes:'',
  });
  const [website, setWebsite] = React.useState(''); // honeypot
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  const update = (key) => (e) => setForm(prev => ({...prev, [key]: e.target.value}));

  const valid =
    form.fullName.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError('');

    // Build a friendly answers payload (resolve display labels).
    const erpLabel = answers.erp === 'other'
      ? (otherErp || 'Other')
      : (ERP_OPTIONS.find(o=>o.id===answers.erp)?.label || '');
    const modelLabel = MODEL_OPTIONS.find(o=>o.id===answers.model)?.label
      || answers.model || '';

    try {
      const resp = await fetch('/api/call', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email:    form.email.trim(),
          phone:    form.phone.trim(),
          company:  form.company.trim(),
          notes:    form.notes.trim(),
          website,                          // honeypot — always empty for real users
          answers: {
            erp:      erpLabel,
            edition:  answers.edition || '',
            platform: answers.platform || '',
            revenue:  answers.revenue || '',
            model:    modelLabel,
          },
        }),
      });
      const data = await resp.json().catch(()=>({}));
      if (!resp.ok || !data.ok) {
        throw new Error(data.error || `Request failed (${resp.status})`);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again or email denis@uncap.com directly.');
      setSubmitting(false);
    }
  };

  const fieldStyle = (multiline) => ({
    width:'100%',
    padding: multiline ? '14px 16px' : '14px 16px',
    fontSize:16,fontFamily:'var(--font-sans)',fontWeight:500,
    color:'var(--fg-1)',
    background:'#fff',
    border:'1px solid var(--line-1)',borderRadius:5,
    outline:'none',
    transition:'border-color .15s var(--ease-out)',
    resize: multiline ? 'vertical' : 'none',
    minHeight: multiline ? 96 : 'auto',
    lineHeight:1.5,
  });

  return (
    <div style={{animation:'quizFadeIn 380ms var(--ease-out) both'}}>
      <div className="uc-eyebrow" style={{marginBottom:14}}>Final step</div>
      <h1 style={{
        fontFamily:'var(--font-display)',fontWeight:700,
        fontSize:'clamp(32px,3.4vw,48px)',lineHeight:1.05,letterSpacing:'-.025em',
        color:'var(--fg-1)',margin:'0 0 12px',textWrap:'balance',
      }}>How can we reach you?</h1>
      <p style={{
        fontFamily:'var(--font-serif)',fontStyle:'italic',
        fontSize:'clamp(17px,1.5vw,20px)',lineHeight:1.4,
        color:'var(--fg-2)',margin:'0 0 36px',maxWidth:560,
      }}>
        We'll review your answers and reply within one business day to schedule a 25-min fit call.
      </p>

      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:16}}>
        <Field label="Full name" required>
          <input
            type="text"
            value={form.fullName}
            onChange={update('fullName')}
            autoComplete="name"
            required
            style={fieldStyle(false)}
            onFocus={e=>e.currentTarget.style.borderColor='var(--uc-black)'}
            onBlur={e=>e.currentTarget.style.borderColor='var(--line-1)'}
          />
        </Field>

        <Field label="Email" required>
          <input
            type="email"
            value={form.email}
            onChange={update('email')}
            autoComplete="email"
            required
            inputMode="email"
            style={fieldStyle(false)}
            onFocus={e=>e.currentTarget.style.borderColor='var(--uc-black)'}
            onBlur={e=>e.currentTarget.style.borderColor='var(--line-1)'}
          />
        </Field>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <Field label="Phone">
            <input
              type="tel"
              value={form.phone}
              onChange={update('phone')}
              autoComplete="tel"
              inputMode="tel"
              style={fieldStyle(false)}
              onFocus={e=>e.currentTarget.style.borderColor='var(--uc-black)'}
              onBlur={e=>e.currentTarget.style.borderColor='var(--line-1)'}
            />
          </Field>

          <Field label="Company">
            <input
              type="text"
              value={form.company}
              onChange={update('company')}
              autoComplete="organization"
              style={fieldStyle(false)}
              onFocus={e=>e.currentTarget.style.borderColor='var(--uc-black)'}
              onBlur={e=>e.currentTarget.style.borderColor='var(--line-1)'}
            />
          </Field>
        </div>

        <Field label="Notes" hint="Anything else we should know before the call? (optional)">
          <textarea
            value={form.notes}
            onChange={update('notes')}
            rows={4}
            style={fieldStyle(true)}
            onFocus={e=>e.currentTarget.style.borderColor='var(--uc-black)'}
            onBlur={e=>e.currentTarget.style.borderColor='var(--line-1)'}
          />
        </Field>

        {/* Honeypot — bots fill hidden fields; humans don't see it. */}
        <input
          type="text"
          name="website"
          value={website}
          onChange={e=>setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          style={{position:'absolute',left:'-10000px',width:1,height:1,opacity:0}}
          aria-hidden="true"
        />

        {error && (
          <div style={{
            padding:'12px 14px',background:'#fef0ee',border:'1px solid #f5c6c2',
            borderRadius:5,color:'#B5322B',fontSize:14,
          }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={!valid || submitting}
          className="uc-btn b-primary"
          style={{
            alignSelf:'flex-start',
            padding:'16px 24px',fontSize:16,
            opacity: (valid && !submitting) ? 1 : .55,
            cursor: (valid && !submitting) ? 'pointer' : 'default',
            marginTop:8,
          }}>
          {submitting ? 'Sending…' : <>Request a fit call <span>→</span></>}
        </button>

        <div style={{fontSize:12,color:'var(--fg-3)',marginTop:4}}>
          Your answers and contact details are emailed only to the Uncap team. No spam, no third parties.
        </div>
      </form>
    </div>
  );
}

function Field({label, hint, required, children}){
  return (
    <label style={{display:'flex',flexDirection:'column',gap:6}}>
      <span style={{
        fontFamily:'var(--font-mono)',fontSize:11,fontWeight:600,
        letterSpacing:'.1em',textTransform:'uppercase',color:'var(--fg-3)',
      }}>{label}{required && <span style={{color:'#B5322B',marginLeft:4}}>*</span>}</span>
      {children}
      {hint && <span style={{fontSize:12,color:'var(--fg-3)'}}>{hint}</span>}
    </label>
  );
}

/* ------- Success state ------- */
function SuccessScreen(){
  return (
    <div style={{animation:'quizFadeIn 480ms var(--ease-out) both',textAlign:'left'}}>
      <div style={{
        display:'inline-flex',alignItems:'center',justifyContent:'center',
        width:64,height:64,borderRadius:999,background:'var(--uc-signal)',marginBottom:24,
      }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M6 14.5L12 20L22 8" stroke="var(--uc-black)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h1 style={{
        fontFamily:'var(--font-display)',fontWeight:700,
        fontSize:'clamp(36px,4vw,56px)',lineHeight:1.02,letterSpacing:'-.03em',
        color:'var(--fg-1)',margin:'0 0 14px',textWrap:'balance',
      }}>Got it. Talk soon.</h1>
      <p style={{
        fontFamily:'var(--font-serif)',fontStyle:'italic',
        fontSize:'clamp(20px,1.8vw,26px)',lineHeight:1.35,
        color:'var(--fg-2)',margin:'0 0 36px',maxWidth:560,letterSpacing:'-.01em',
      }}>
        Your request is in. We'll reply within one business day to schedule the call.
      </p>
      <div style={{
        background:'#fff',border:'1px solid var(--line-1)',borderRadius:5,
        padding:'20px 24px',marginBottom:32,
        fontSize:14,lineHeight:1.6,color:'var(--fg-2)',
      }}>
        In the meantime — if you'd rather skip the call and start the Blueprint now,
        you can <a href="/quiz" style={{color:'var(--fg-1)',fontWeight:600}}>configure and pay here</a>.
      </div>
      <a href="/" className="uc-btn b-primary" style={{padding:'14px 22px'}}>
        Back to Blueprint <span>→</span>
      </a>
    </div>
  );
}

window.FitCallApp = FitCallApp;
