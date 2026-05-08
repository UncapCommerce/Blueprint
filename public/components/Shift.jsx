// Shift.jsx: Free estimate is the trap (compare table) (responsive)
function Shift() {
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  const left = [
    'Free Quote',
    'Vague proposal',
    'You commit on faith',
    'Surprise change orders',
    '14-month timeline',
    '+65% over budget',
    'You\'re locked in',
  ];
  const right = [
    '3 Deep Dive Workshops',
    'Solution Engineering & Demos',
    'UX & Flow Prototyping',
    'Total Cost of Ownership Calculator',
    'Blueprint Document',
    '4-week delivery',
    'You own everything',
  ];
  return (
    <section style={{background:'var(--uc-black)',color:'#fff',padding: isMobile ? '64px 20px' : '120px 32px',position:'relative',overflow:'hidden'}}>
      {!isMobile && (
        <div style={{position:'absolute',inset:0,opacity:.06,pointerEvents:'none'}}>
          <img src="assets/bg-vector-3.svg" style={{position:'absolute',right:-100,bottom:-100,width:700}} alt="" loading="lazy" decoding="async"/>
        </div>
      )}
      <div style={{maxWidth:1280,margin:'0 auto',position:'relative',zIndex:1}}>
        <div style={{maxWidth:880,marginBottom: isMobile ? 32 : 64}}>
          <div className="uc-eyebrow" style={{color:'var(--uc-stone-500)',marginBottom: isMobile ? 12 : 18}}>The shift</div>
          <h2 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize: isMobile ? 'clamp(28px, 7.6vw, 40px)' : 'clamp(40px,4.4vw,72px)',lineHeight:1.05,letterSpacing:'-.03em',margin:'0 0 12px',color:'#fff'}}>
            The "free estimate" is the real real trap.
          </h2>
          <p style={{fontFamily:'var(--font-serif)',fontStyle:'italic',fontWeight:400,fontSize: isMobile ? 'clamp(17px, 4.6vw, 22px)' : 'clamp(22px,2vw,30px)',lineHeight:1.35,color:'var(--uc-stone-300)',margin:0,letterSpacing:'-.01em'}}>
            We charge for the part everyone else skips: the part that decides whether your migration works.
          </p>
        </div>

        <div style={{display:'grid',gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',gap: isMobile ? 16 : 24}}>
          {/* Left: how most agencies sell it */}
          <div style={{border:'1px solid #2B2B2B',borderRadius:5,padding: isMobile ? '24px 22px' : 32,background:'#111'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom: isMobile ? 16 : 24}}>
              <div style={{width:8,height:8,borderRadius:999,background:'#B5322B'}}/>
              <div style={{fontSize:13,fontWeight:600,color:'var(--uc-stone-300)',letterSpacing:'.04em',textTransform:'uppercase'}}>How most agencies sell it</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:0}}>
              {left.map((s,i)=>(
                <div key={s} style={{display:'flex',alignItems:'center',gap: isMobile ? 12 : 14,padding: isMobile ? '12px 0' : '14px 0',borderTop:i===0?'none':'1px solid #2B2B2B'}}>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--uc-stone-500)',width:24,flexShrink:0}}>{String(i+1).padStart(2,'0')}</span>
                  <span style={{fontSize: isMobile ? 15 : 16,color:'var(--uc-stone-300)',textDecoration:i>=3?'line-through':'none'}}>{s}</span>
                  {i===3 && !isMobile && <span style={{marginLeft:'auto',fontSize:11,color:'#B5322B',fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',whiteSpace:'nowrap'}}>Where it breaks</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Right: how the blueprint works */}
          <div style={{border:'1px solid var(--uc-signal)',borderRadius:5,padding: isMobile ? '24px 22px' : 32,background:'#0E0E0E',position:'relative',marginTop: isMobile ? 16 : 0}}>
            <div style={{position:'absolute',top:-12,right: isMobile ? 16 : 24,padding:'4px 10px',background:'var(--uc-signal)',borderRadius:3,fontSize:11,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:'var(--uc-black)'}}>The Blueprint</div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom: isMobile ? 16 : 24}}>
              <div style={{width:8,height:8,borderRadius:999,background:'var(--uc-signal)'}}/>
              <div style={{fontSize:13,fontWeight:600,color:'#fff',letterSpacing:'.04em',textTransform:'uppercase'}}>How the Blueprint works</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:0}}>
              {right.map((s,i)=>(
                <div key={s} style={{display:'flex',alignItems:'center',gap: isMobile ? 12 : 14,padding: isMobile ? '12px 0' : '14px 0',borderTop:i===0?'none':'1px solid #2B2B2B'}}>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--uc-stone-500)',width:24,flexShrink:0}}>{String(i+1).padStart(2,'0')}</span>
                  <span style={{fontSize: isMobile ? 15 : 16,color:'#fff',fontWeight:500}}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p style={{fontFamily:'var(--font-serif)',fontStyle:'italic',fontSize: isMobile ? 17 : 24,color:'#fff',margin: isMobile ? '32px 0 0' : '48px 0 0',textAlign:'center',letterSpacing:'-.01em'}}>
          No upsell pressure. No long term contract. No lock-in.
        </p>
      </div>
    </section>
  );
}
window.Shift = Shift;
