// FitProcess.jsx: Who it's for + Process timeline (responsive)
function FitProcess() {
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  const hash = window.useHash ? window.useHash() : '';
  const heroPlatform = window.parseHeroHash ? window.parseHeroHash(hash).platform : '';
  const fit = [
    'You\'re $5M+ in revenue',
    `Migrating${heroPlatform ? ' from ' + heroPlatform : ''} within the next 6 months`,
    'You want to make the decision once, correctly',
    'You\'re a wholesaler, distributor, manufacturer or unified commerce supplier',
  ];
  const notFit = [
    'You\'re shopping on price, not outcome',
    'You\'re under $5M in revenue',
    'You are not the decision maker',
    'You\'re a purely DTC brand',
  ];
  const weeks = [
    {n:'Week 1', t:'Discovery & Research',     d:'Deep audit of your stack, data, and goals. We talk to every system owner. Nothing taken at face value.'},
    {n:'Week 2', t:'Deep Dive Workshops',      d:'Live sessions with your team. Ops, marketing, eng, leadership. Every assumption tested, every decision documented.'},
    {n:'Week 3', t:'Architecture & Prototyping', d:'We design your migration end-to-end and ship a working prototype. Data, integrations, rendering, identity, SEO: every layer specified.'},
    {n:'Week 4', t:'Delivery & Founder Briefing', d:'Full Blueprint and prototype handed over 1:1 with the founder. Fixed-cost implementation estimate. Risk register. You own it.'},
  ];

  // Stagger-reveal: the four week cards rise + fade in one after another when
  // the row enters the viewport. Progressive enhancement — without
  // IntersectionObserver every card just renders visible from the start.
  const weeksRowRef = React.useRef(null);
  const [revealCount, setRevealCount] = React.useState(0);
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.IntersectionObserver || !weeksRowRef.current) {
      setRevealCount(weeks.length);
      return;
    }
    let cancelled = false;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !cancelled) {
          cancelled = true;
          weeks.forEach((_, i) => {
            setTimeout(() => setRevealCount(r => Math.max(r, i + 1)), i * 240);
          });
          obs.disconnect();
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
    obs.observe(weeksRowRef.current);
    return () => { cancelled = true; obs.disconnect(); };
  }, []);
  return (
    <React.Fragment>
      {/* Who it's for */}
      <section id="process" style={{background:'var(--uc-black)',color:'#fff',padding: isMobile ? '64px 20px' : '120px 32px',scrollMarginTop:80}}>
        <div style={{maxWidth:1280,margin:'0 auto'}}>
          <div style={{maxWidth:880,marginBottom: isMobile ? 32 : 56}}>
            <div className="uc-eyebrow" style={{color:'var(--uc-stone-500)',marginBottom: isMobile ? 12 : 18}}>Who it's for</div>
            <h2 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize: isMobile ? 'clamp(28px, 7.6vw, 40px)' : 'clamp(40px,4.4vw,68px)',lineHeight:1.05,letterSpacing:'-.03em',margin:'0 0 14px',color:'#fff'}}>
              Built for serious operators.
            </h2>
            <p style={{fontFamily:'var(--font-serif)',fontStyle:'italic',fontSize: isMobile ? 17 : 24,color:'var(--uc-stone-300)',margin:0,letterSpacing:'-.01em',lineHeight:1.4}}>
              We'd rather tell you no than waste your time.
            </p>
          </div>
          <div style={{display:'grid',gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',gap: isMobile ? 16 : 24}}>
            <div style={{border:'1px solid var(--uc-signal)',borderRadius:5,padding: isMobile ? '24px 22px' : 32,background:'#0E0E0E'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom: isMobile ? 16 : 24}}>
                <span style={{width:10,height:10,borderRadius:999,background:'var(--uc-signal)'}}/>
                <span style={{fontSize:13,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase'}}>You're a fit if</span>
              </div>
              <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:0}}>
                {fit.map((s,i)=>(
                  <li key={s} style={{display:'flex',alignItems:'flex-start',gap:14,padding: isMobile ? '14px 0' : '16px 0',borderTop:i===0?'none':'1px solid #2B2B2B',fontSize: isMobile ? 16 : 18,color:'#fff',fontWeight:500,lineHeight:1.4}}>
                    <span style={{color:'var(--uc-signal)',flexShrink:0}}>→</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{border:'1px solid #2B2B2B',borderRadius:5,padding: isMobile ? '24px 22px' : 32,background:'#111'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom: isMobile ? 16 : 24}}>
                <span style={{width:10,height:10,borderRadius:999,background:'var(--uc-stone-500)'}}/>
                <span style={{fontSize:13,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:'var(--uc-stone-300)'}}>You're not a fit if</span>
              </div>
              <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:0}}>
                {notFit.map((s,i)=>(
                  <li key={s} style={{display:'flex',alignItems:'flex-start',gap:14,padding: isMobile ? '14px 0' : '16px 0',borderTop:i===0?'none':'1px solid #2B2B2B',fontSize: isMobile ? 16 : 18,color:'var(--uc-stone-300)',fontWeight:400,lineHeight:1.4}}>
                    <span style={{color:'var(--uc-stone-500)',flexShrink:0}}>×</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Process timeline */}
      <section style={{background:'var(--uc-cream)',padding: isMobile ? '64px 20px' : '120px 32px'}}>
        <div style={{maxWidth:1280,margin:'0 auto'}}>
          <div style={{display:'grid',gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',gap: isMobile ? 18 : 80,marginBottom: isMobile ? 32 : 56,alignItems: isMobile ? 'start' : 'end'}}>
            <div>
              <div className="uc-eyebrow" style={{marginBottom: isMobile ? 12 : 18}}>Process</div>
              <h2 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize: isMobile ? 'clamp(28px, 7.6vw, 40px)' : 'clamp(40px,4.4vw,72px)',lineHeight:1.05,letterSpacing:'-.03em',color:'var(--fg-1)',margin:'0 0 14px'}}>
                4 weeks. Zero surprises.
              </h2>
            </div>
            <p style={{fontSize: isMobile ? 16 : 18,lineHeight:1.6,color:'var(--fg-2)',margin:0,maxWidth:480}}>
              No discovery purgatory. No "we'll get you a proposal next quarter." A 28-day clock starts the day you sign.
            </p>
          </div>
          <div ref={weeksRowRef} style={{display:'grid',gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',gap:0,border:'1px solid var(--uc-black)',borderRadius:5,background:'#fff',overflow:'hidden'}}>
            {weeks.map((w,i)=>{
              const isLast = i === weeks.length - 1;
              const borderRight = !isMobile && i<3 ? '1px solid var(--line-1)' : 'none';
              const borderBottom = isMobile && !isLast ? '1px solid var(--line-1)' : 'none';
              const revealed = i < revealCount;
              const arrowOn = i + 1 < revealCount;
              return (
                <div key={w.n} style={{
                  padding: isMobile ? '24px 22px 28px' : '32px 28px 36px',
                  borderRight,borderBottom,
                  display:'flex',flexDirection:'column',gap: isMobile ? 14 : 18,
                  position:'relative',
                  opacity: revealed ? 1 : 0,
                  transform: revealed ? 'translateY(0) scale(1)' : 'translateY(22px) scale(0.97)',
                  transition: 'opacity 620ms var(--ease-out), transform 620ms var(--ease-out)',
                  willChange:'opacity, transform',
                }}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{
                      width:32,height:32,borderRadius:999,background:'var(--uc-black)',color:'#fff',
                      display:'inline-flex',alignItems:'center',justifyContent:'center',
                      fontFamily:'var(--font-mono)',fontWeight:700,fontSize:13,flexShrink:0,
                      transform: revealed ? 'scale(1)' : 'scale(0)',
                      transition: 'transform 520ms cubic-bezier(.34,1.56,.64,1) 120ms',
                    }}>{i+1}</span>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--fg-3)',letterSpacing:'.06em',textTransform:'uppercase',fontWeight:600}}>{w.n}</span>
                  </div>
                  <h3 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize: isMobile ? 22 : 28,letterSpacing:'-.025em',margin:0,color:'var(--fg-1)',lineHeight:1.05}}>{w.t}</h3>
                  <p style={{fontSize: isMobile ? 15 : 14,lineHeight:1.55,color:'var(--fg-2)',margin:0}}>{w.d}</p>
                  {!isMobile && i<3 && (
                    <span style={{
                      position:'absolute',top:46,right:-8,zIndex:2,background:'#fff',padding:'2px 4px',color:'var(--fg-3)',fontSize:14,
                      opacity: arrowOn ? 1 : 0,
                      transform: arrowOn ? 'translateX(0)' : 'translateX(-6px)',
                      transition: 'opacity 360ms var(--ease-out) 140ms, transform 360ms var(--ease-out) 140ms',
                    }}>→</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}
window.FitProcess = FitProcess;
