// Shift.jsx — Free estimate is the trap (compare table)
function Shift() {
  const left = [
    'Free quote',
    'Vague proposal',
    'You sign blind',
    'Surprise change orders',
    '14-month timeline',
    'You\'re locked in',
  ];
  const right = [
    'Paid R&D',
    'Working prototype',
    'Stakeholder workshops',
    'Fixed-cost implementation',
    '4-week delivery',
    'You own everything',
  ];
  return (
    <section style={{background:'var(--uc-black)',color:'#fff',padding:'120px 32px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,opacity:.06,pointerEvents:'none'}}>
        <img src="assets/bg-vector-3.svg" style={{position:'absolute',right:-100,bottom:-100,width:700}} alt="" loading="lazy" decoding="async"/>
      </div>
      <div style={{maxWidth:1280,margin:'0 auto',position:'relative',zIndex:1}}>
        <div style={{maxWidth:880,marginBottom:64}}>
          <div className="uc-eyebrow" style={{color:'var(--uc-stone-500)',marginBottom:18}}>The shift</div>
          <h2 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:'clamp(40px,4.4vw,72px)',lineHeight:1.02,letterSpacing:'-.03em',margin:'0 0 12px'}}>
            The "free estimate" is the trap.
          </h2>
          <p style={{fontFamily:'var(--font-serif)',fontStyle:'italic',fontWeight:400,fontSize:'clamp(22px,2vw,30px)',lineHeight:1.3,color:'var(--uc-stone-300)',margin:0,letterSpacing:'-.01em'}}>
            We charge for the part everyone else skips — the part that decides whether your migration works.
          </p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
          {/* Left: how most agencies sell it */}
          <div style={{border:'1px solid #2B2B2B',borderRadius:5,padding:32,background:'#111'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:24}}>
              <div style={{width:8,height:8,borderRadius:999,background:'#B5322B'}}/>
              <div style={{fontSize:13,fontWeight:600,color:'var(--uc-stone-300)',letterSpacing:'.04em',textTransform:'uppercase'}}>How most agencies sell it</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:0}}>
              {left.map((s,i)=>(
                <div key={s} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 0',borderTop:i===0?'none':'1px solid #2B2B2B'}}>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--uc-stone-500)',width:24}}>{String(i+1).padStart(2,'0')}</span>
                  <span style={{fontSize:16,color:'var(--uc-stone-300)',textDecoration:i>=3?'line-through':'none'}}>{s}</span>
                  {i===3 && <span style={{marginLeft:'auto',fontSize:11,color:'#B5322B',fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase'}}>Where it breaks</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Right: how the blueprint works */}
          <div style={{border:'1px solid var(--uc-signal)',borderRadius:5,padding:32,background:'#0E0E0E',position:'relative'}}>
            <div style={{position:'absolute',top:-12,right:24,padding:'4px 10px',background:'var(--uc-signal)',borderRadius:3,fontSize:11,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:'var(--uc-black)'}}>The Blueprint</div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:24}}>
              <div style={{width:8,height:8,borderRadius:999,background:'var(--uc-signal)'}}/>
              <div style={{fontSize:13,fontWeight:600,color:'#fff',letterSpacing:'.04em',textTransform:'uppercase'}}>How the Blueprint works</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:0}}>
              {right.map((s,i)=>(
                <div key={s} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 0',borderTop:i===0?'none':'1px solid #2B2B2B'}}>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--uc-stone-500)',width:24}}>{String(i+1).padStart(2,'0')}</span>
                  <span style={{fontSize:16,color:'#fff',fontWeight:500}}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p style={{fontFamily:'var(--font-serif)',fontStyle:'italic',fontSize:24,color:'#fff',margin:'48px 0 0',textAlign:'center',letterSpacing:'-.01em'}}>
          No upsell pressure. No long term contract. No lock-in.
        </p>
      </div>
    </section>
  );
}
window.Shift = Shift;
