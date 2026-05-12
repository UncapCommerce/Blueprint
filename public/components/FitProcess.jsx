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

  // Sticky-deck scroll: each week card pins to the top of the viewport in
  // turn, then the next one slides up and covers it like a deck of playing
  // cards. We track which card is currently "on top" so the small progress
  // dots inside each card reflect the user's position through the deck.
  const deckRef = React.useRef(null);
  const cardRefs = React.useRef(weeks.map(() => React.createRef()));
  const [activeIdx, setActiveIdx] = React.useState(0);
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) return;
    const stickyTop = isMobile ? 76 : 120;
    const obs = new IntersectionObserver(entries => {
      // Pick the last card whose top has crossed the sticky line — that's
      // the one currently pinned.
      let topIdx = 0;
      entries.forEach(e => {
        const idx = Number(e.target.dataset.weekIdx);
        const rect = e.boundingClientRect;
        if (rect.top <= stickyTop + 2) topIdx = Math.max(topIdx, idx);
      });
      cardRefs.current.forEach((ref, i) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        if (r.top <= stickyTop + 2) topIdx = Math.max(topIdx, i);
      });
      setActiveIdx(topIdx);
    }, { threshold: [0, 1], rootMargin: `-${stickyTop}px 0px 0px 0px` });
    cardRefs.current.forEach(ref => { if (ref.current) obs.observe(ref.current); });
    return () => obs.disconnect();
  }, [isMobile]);
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
          {/* Sticky-deck: each card pins to the top of the viewport in turn,
              and the next one slides up over it like a deck of cards. */}
          <div ref={deckRef} style={{position:'relative'}}>
            {weeks.map((w,i)=>{
              const stickyTop = isMobile ? 76 : 120;
              const cardHeight = isMobile ? 'auto' : 'auto';
              const minHeight = isMobile ? 'min(74vh, 560px)' : 'min(64vh, 520px)';
              const isActive = i === activeIdx;
              return (
                <div
                  key={w.n}
                  ref={cardRefs.current[i]}
                  data-week-idx={i}
                  style={{
                    position:'sticky',
                    top: stickyTop,
                    zIndex: i + 1,
                    marginTop: i === 0 ? 0 : (isMobile ? '22vh' : '26vh'),
                    background:'#fff',
                    border:'1px solid var(--uc-black)',
                    borderRadius:10,
                    padding: isMobile ? '28px 24px 26px' : '48px 56px 44px',
                    boxShadow: '0 20px 60px rgba(10,10,10,0.08), 0 4px 16px rgba(10,10,10,0.04)',
                    display:'flex',flexDirection:'column',gap: isMobile ? 16 : 22,
                    minHeight,
                    height: cardHeight,
                  }}
                >
                  <div style={{display:'flex',alignItems:'center',gap:14}}>
                    <span style={{
                      width: isMobile ? 52 : 64, height: isMobile ? 52 : 64,
                      borderRadius:999,
                      background: isActive ? 'var(--uc-signal)' : 'var(--uc-cream)',
                      color:'var(--uc-black)',
                      display:'inline-flex',alignItems:'center',justifyContent:'center',
                      fontFamily:'var(--font-mono)',fontWeight:800,
                      fontSize: isMobile ? 20 : 26,
                      flexShrink:0,
                      border:'1px solid var(--uc-black)',
                      transition:'background 320ms var(--ease-out), transform 320ms var(--ease-out)',
                      transform: isActive ? 'scale(1)' : 'scale(0.96)',
                    }}>{i+1}</span>
                    <span style={{fontFamily:'var(--font-mono)',fontSize: isMobile ? 12 : 13,color:'var(--fg-3)',letterSpacing:'.1em',textTransform:'uppercase',fontWeight:700}}>{w.n}</span>
                  </div>
                  <h3 style={{
                    fontFamily:'var(--font-display)',fontWeight:700,
                    fontSize: isMobile ? 'clamp(26px, 7vw, 36px)' : 'clamp(36px, 3.6vw, 56px)',
                    letterSpacing:'-.025em',margin:0,color:'var(--fg-1)',lineHeight:1.05,
                    maxWidth: 760,
                  }}>{w.t}</h3>
                  <p style={{
                    fontSize: isMobile ? 16 : 19,
                    lineHeight:1.55,color:'var(--fg-2)',margin:0,
                    maxWidth: 640,
                  }}>{w.d}</p>
                  {/* Progress dots */}
                  <div style={{display:'flex',gap:8,alignItems:'center',marginTop:'auto',paddingTop: isMobile ? 8 : 16}}>
                    {weeks.map((_, j) => (
                      <span key={j} style={{
                        width: j === i ? 28 : 8, height:8, borderRadius:999,
                        background: j <= i ? 'var(--uc-black)' : 'var(--line-1)',
                        transition: 'width 280ms var(--ease-out), background 280ms var(--ease-out)',
                      }}/>
                    ))}
                  </div>
                </div>
              );
            })}
            {/* Tail of scroll space so the last card has room to pin before
                the next section pulls it out of view. */}
            <div style={{height: isMobile ? '20vh' : '24vh'}}/>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}
window.FitProcess = FitProcess;
