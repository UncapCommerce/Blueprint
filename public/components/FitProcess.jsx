// FitProcess.jsx — Who it's for + Process timeline
function FitProcess() {
  const fit = [
    'You\'re $5M+ in revenue',
    'Migrating in the next 6 months',
    'You want to make the decision once, correctly',
  ];
  const notFit = [
    'You\'re shopping for the cheapest quote',
    'You\'re under $1M',
    'You haven\'t decided to migrate yet',
  ];
  const weeks = [
    {n:'Week 1', t:'Discovery', d:'Deep audit of your stack, data, and goals. We talk to every system owner. Nothing is taken at face value.'},
    {n:'Week 2', t:'Architecture', d:'We design your migration end-to-end. Data, integrations, rendering, identity, SEO — every layer specified.'},
    {n:'Week 3', t:'Workshops', d:'Live sessions with your team. Ops, marketing, eng, leadership. Every question answered. Decisions documented.'},
    {n:'Week 4', t:'Delivery', d:'Full Blueprint + working prototype handed over. Fixed-cost implementation estimate. Risk register. You own it.'},
  ];
  return (
    <>
      {/* Who it's for */}
      <section id="process" style={{background:'var(--uc-black)',color:'#fff',padding:'120px 32px',scrollMarginTop:80}}>
        <div style={{maxWidth:1280,margin:'0 auto'}}>
          <div style={{maxWidth:880,marginBottom:56}}>
            <div className="uc-eyebrow" style={{color:'var(--uc-stone-500)',marginBottom:18}}>Who it's for</div>
            <h2 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:'clamp(40px,4.4vw,68px)',lineHeight:1.02,letterSpacing:'-.03em',margin:'0 0 14px'}}>
              Built for serious operators.
            </h2>
            <p style={{fontFamily:'var(--font-serif)',fontStyle:'italic',fontSize:24,color:'var(--uc-stone-300)',margin:0,letterSpacing:'-.01em'}}>
              We'd rather tell you no than waste your time.
            </p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
            <div style={{border:'1px solid var(--uc-signal)',borderRadius:5,padding:32,background:'#0E0E0E'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:24}}>
                <span style={{width:10,height:10,borderRadius:999,background:'var(--uc-signal)'}}/>
                <span style={{fontSize:13,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase'}}>You're a fit if</span>
              </div>
              <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:0}}>
                {fit.map((s,i)=>(
                  <li key={s} style={{display:'flex',alignItems:'center',gap:14,padding:'16px 0',borderTop:i===0?'none':'1px solid #2B2B2B',fontSize:18,color:'#fff',fontWeight:500}}>
                    <span style={{color:'var(--uc-signal)'}}>→</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{border:'1px solid #2B2B2B',borderRadius:5,padding:32,background:'#111'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:24}}>
                <span style={{width:10,height:10,borderRadius:999,background:'var(--uc-stone-500)'}}/>
                <span style={{fontSize:13,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:'var(--uc-stone-300)'}}>You're not a fit if</span>
              </div>
              <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:0}}>
                {notFit.map((s,i)=>(
                  <li key={s} style={{display:'flex',alignItems:'center',gap:14,padding:'16px 0',borderTop:i===0?'none':'1px solid #2B2B2B',fontSize:18,color:'var(--uc-stone-300)',fontWeight:400}}>
                    <span style={{color:'var(--uc-stone-500)'}}>×</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Process timeline */}
      <section style={{background:'var(--uc-cream)',padding:'120px 32px'}}>
        <div style={{maxWidth:1280,margin:'0 auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,marginBottom:56,alignItems:'end'}}>
            <div>
              <div className="uc-eyebrow" style={{marginBottom:18}}>Process</div>
              <h2 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:'clamp(40px,4.4vw,72px)',lineHeight:1.02,letterSpacing:'-.03em',color:'var(--fg-1)',margin:'0 0 14px'}}>
                4 weeks. Zero surprises.
              </h2>
            </div>
            <p style={{fontSize:18,lineHeight:1.6,color:'var(--fg-2)',margin:0,maxWidth:480}}>
              No discovery purgatory. No "we'll get you a proposal next quarter." A 28-day clock starts the day you sign.
            </p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:0,border:'1px solid var(--uc-black)',borderRadius:5,background:'#fff',overflow:'hidden'}}>
            {weeks.map((w,i)=>(
              <div key={w.n} style={{padding:'32px 28px 36px',borderRight:i<3?'1px solid var(--line-1)':'none',display:'flex',flexDirection:'column',gap:18,position:'relative'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{width:32,height:32,borderRadius:999,background:'var(--uc-black)',color:'#fff',display:'inline-flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-mono)',fontWeight:700,fontSize:13}}>{i+1}</span>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--fg-3)',letterSpacing:'.06em',textTransform:'uppercase',fontWeight:600}}>{w.n}</span>
                </div>
                <h3 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:28,letterSpacing:'-.025em',margin:0,color:'var(--fg-1)',lineHeight:1.05}}>{w.t}</h3>
                <p style={{fontSize:14,lineHeight:1.55,color:'var(--fg-2)',margin:0}}>{w.d}</p>
                {i<3 && <span style={{position:'absolute',top:46,right:-8,zIndex:2,background:'#fff',padding:'2px 4px',color:'var(--fg-3)',fontSize:14}}>→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
window.FitProcess = FitProcess;
