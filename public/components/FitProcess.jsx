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

  // Poker-hand scroll-in: the four week cards start below the viewport, then
  // rise into a fanned-out hand as the section scrolls into view. Cards land
  // staggered (left-to-right) and settle into asymmetric rotations + vertical
  // offsets so they read like cards held in a hand.
  const handRef = React.useRef(null);
  const [revealed, setRevealed] = React.useState(0);
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.IntersectionObserver || !handRef.current) {
      setRevealed(weeks.length);
      return;
    }
    let triggered = false;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !triggered) {
          triggered = true;
          weeks.forEach((_, i) => {
            setTimeout(() => setRevealed(r => Math.max(r, i + 1)), i * 220);
          });
          obs.disconnect();
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.2 });
    obs.observe(handRef.current);
    return () => obs.disconnect();
  }, []);
  // Final fan positions — symmetric arc, outer cards rotated more and slightly
  // lifted so the hand reads like the cards are angled toward the viewer.
  const fanLayouts = isMobile
    ? [
        { rot: -6, x: -3,  y: 0  },
        { rot: -2, x: -1,  y: 0  },
        { rot: 2,  x: 1,   y: 0  },
        { rot: 6,  x: 3,   y: 0  },
      ]
    : [
        { rot: -14, x: -27, y: 26 },
        { rot: -5,  x: -9,  y: 4  },
        { rot: 5,   x: 9,   y: 4  },
        { rot: 14,  x: 27,  y: 26 },
      ];
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
          {/* Poker-hand: cards rise from below into a fanned arrangement. */}
          <div
            ref={handRef}
            style={{
              position:'relative',
              height: isMobile ? 'auto' : 'min(70vh, 560px)',
              minHeight: isMobile ? '92vh' : 'min(70vh, 560px)',
              marginTop: isMobile ? 12 : 24,
              perspective: '1400px',
            }}
          >
            {weeks.map((w,i)=>{
              const layout = fanLayouts[i];
              const visible = i < revealed;
              // Card geometry — kept around 1/4 of the viewport on desktop so
              // the hand spreads cleanly across the column. Mobile cards
              // stack vertically with subtle rotation so the hand-feel still
              // reads on small screens.
              const cardWidth  = isMobile ? '86vw'                          : 'min(25vw, 320px)';
              const cardHeight = isMobile ? 'min(28vh, 240px)'              : 'min(58vh, 460px)';
              const restTransform = isMobile
                ? `translate(-50%, ${i * 92}px) rotate(${layout.rot}deg)`
                : `translate(-50%, -50%) translate(${layout.x}vw, ${layout.y}px) rotate(${layout.rot}deg)`;
              const hiddenTransform = isMobile
                ? `translate(-50%, calc(${i * 92}px + 120vh)) rotate(0deg)`
                : `translate(-50%, -50%) translate(0vw, 100vh) rotate(0deg)`;
              return (
                <article
                  key={w.n}
                  data-week-idx={i}
                  style={{
                    position:'absolute',
                    left:'50%',
                    top: isMobile ? 0 : '50%',
                    width: cardWidth,
                    height: cardHeight,
                    background:'#fff',
                    border:'1px solid var(--uc-black)',
                    borderRadius:14,
                    boxShadow:'0 24px 56px rgba(10,10,10,0.18), 0 8px 22px rgba(10,10,10,0.08)',
                    padding: isMobile ? '22px 22px 20px' : '28px 28px 24px',
                    display:'flex',flexDirection:'column',gap: isMobile ? 10 : 14,
                    zIndex: i + 1,
                    transformOrigin: isMobile
                      ? '50% 110%'      // pivot near bottom so rotation reads as wrist motion
                      : '50% 110%',
                    transform: visible ? restTransform : hiddenTransform,
                    opacity: visible ? 1 : 0,
                    transition:
                      'transform 820ms cubic-bezier(.18,1.02,.36,1), ' +
                      'opacity 360ms ease-out',
                    willChange:'transform, opacity',
                  }}
                >
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
                    <span style={{
                      width: isMobile ? 36 : 44, height: isMobile ? 36 : 44,
                      borderRadius:999,
                      background:'var(--uc-signal)',
                      color:'var(--uc-black)',
                      display:'inline-flex',alignItems:'center',justifyContent:'center',
                      fontFamily:'var(--font-mono)',fontWeight:800,
                      fontSize: isMobile ? 16 : 19,
                      flexShrink:0,
                      border:'1px solid var(--uc-black)',
                    }}>{i+1}</span>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--fg-3)',letterSpacing:'.12em',textTransform:'uppercase',fontWeight:700}}>{w.n}</span>
                  </div>
                  <h3 style={{
                    fontFamily:'var(--font-display)',fontWeight:700,
                    fontSize: isMobile ? 20 : 'clamp(22px, 1.7vw, 28px)',
                    letterSpacing:'-.02em',margin:0,color:'var(--fg-1)',lineHeight:1.1,
                  }}>{w.t}</h3>
                  <p style={{
                    fontSize: isMobile ? 14 : 14,
                    lineHeight:1.5,color:'var(--fg-2)',margin:0,
                    flex:1,
                    overflow:'hidden',
                  }}>{w.d}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}
window.FitProcess = FitProcess;
