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

  // Parallax-style scroll reveal. Each card has its own scroll window through
  // the section (e.g. 0-32%, 20-52%, ...) and its transform is interpolated
  // continuously between "hidden below" and "in the fan". Updates run through
  // requestAnimationFrame writing straight to the DOM via refs — no React
  // re-renders per scroll tick, so it stays smooth at 60fps.
  const scrollerRef = React.useRef(null);
  const cardRefs = React.useRef(weeks.map(() => React.createRef()));
  // Per-card scroll windows. Overlap is intentional — adjacent cards animate
  // at the same time so the hand feels like it's continuously building rather
  // than snapping one card at a time.
  const cardWindowsRef = React.useRef([
    [0.00, 0.32],
    [0.18, 0.52],
    [0.36, 0.72],
    [0.54, 0.92],
  ]);
  const fanLayoutsRef = React.useRef(null);
  fanLayoutsRef.current = isMobile
    ? [
        { rot: -4, x: 0, y: -90 },
        { rot: -2, x: 0, y: -30 },
        { rot: 2,  x: 0, y: 30  },
        { rot: 4,  x: 0, y: 90  },
      ]
    : [
        // Wider spread + gentler tilt so each card has clear breathing room
        // and the body copy reads cleanly. Outer cards push to ±38%, inner
        // sit at ±13% — leaves a visible gap between adjacent cards on the
        // page so the text inside isn't fighting for attention.
        { rot: -11, x: -38, y: 30 },
        { rot: -4,  x: -13, y: 4  },
        { rot: 4,   x: 13,  y: 4  },
        { rot: 11,  x: 38,  y: 30 },
      ];

  React.useEffect(() => {
    if (typeof window === 'undefined' || !scrollerRef.current) return;
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const reducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    const update = () => {
      rafId = 0;
      const el = scrollerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const total = Math.max(1, rect.height - vh);
      const scrolled = Math.min(total, Math.max(0, -rect.top));
      const progress = scrolled / total;
      cardRefs.current.forEach((ref, i) => {
        const card = ref.current;
        if (!card) return;
        const [start, end] = cardWindowsRef.current[i];
        let raw = (progress - start) / (end - start);
        if (raw < 0) raw = 0;
        if (raw > 1) raw = 1;
        const e = reducedMotion ? (raw > 0 ? 1 : 0) : easeOut(raw);
        const layout = fanLayoutsRef.current[i];
        const hiddenVh = (1 - e) * 70; // start ~70vh below the rest position
        const tx = e * layout.x;       // 0% → fan x offset
        const tyPx = e * layout.y;     // 0px → fan y offset
        const rot = e * layout.rot;    // 0° → final rotation
        card.style.opacity = e.toFixed(3);
        card.style.transform =
          'translate(-50%, -50%) ' +
          `translateX(${tx.toFixed(2)}%) ` +
          `translateY(calc(${hiddenVh.toFixed(2)}vh + ${tyPx.toFixed(1)}px)) ` +
          `rotate(${rot.toFixed(2)}deg)`;
      });
    };
    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
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
          {/* Scroll-driven poker hand. The outer scroller is taller than the
              viewport — its scroll progress determines which card has been
              revealed. The inner sticky stage pins the hand in place while
              the user scrolls past, so each scroll tick deals the next card. */}
          <div
            ref={scrollerRef}
            style={{
              position:'relative',
              height: isMobile ? '300vh' : '320vh',
              marginTop: isMobile ? 12 : 24,
            }}
          >
            <div style={{
              position:'sticky',
              top: isMobile ? '6vh' : '10vh',
              height: isMobile ? '88vh' : '80vh',
              display:'flex',alignItems:'center',justifyContent:'center',
            }}>
              <div style={{position:'relative', width:'100%', height:'100%'}}>
                {weeks.map((w,i)=>{
                  // Sized in % of the inner stage so the hand stays within the
                  // 1280px page wrapper on every viewport. Cards never grow
                  // beyond ~280px wide or shrink below ~190px.
                  const cardWidth  = isMobile ? '86%'                       : 'clamp(200px, 22%, 290px)';
                  const cardHeight = isMobile ? 'clamp(180px,28vh,260px)'   : 'clamp(320px, 60%, 480px)';
                  return (
                    <article
                      key={w.n}
                      ref={cardRefs.current[i]}
                      data-week-idx={i}
                      style={{
                        position:'absolute',
                        left:'50%',
                        top:'50%',
                        width: cardWidth,
                        height: cardHeight,
                        background:'#fff',
                        border:'1px solid var(--uc-black)',
                        borderRadius:14,
                        boxShadow:'0 24px 56px rgba(10,10,10,0.18), 0 8px 22px rgba(10,10,10,0.08)',
                        padding: isMobile ? '22px 22px 20px' : '28px 28px 24px',
                        display:'flex',flexDirection:'column',gap: isMobile ? 10 : 14,
                        zIndex: i + 1,
                        transformOrigin:'50% 110%',
                        // Initial: hidden below + flat. The scroll listener
                        // takes over on first rAF and updates transform every
                        // frame, so we deliberately leave transition off.
                        transform: 'translate(-50%, -50%) translateY(70vh) rotate(0deg)',
                        opacity: 0,
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
                        fontSize: isMobile ? 20 : 'clamp(20px, 1.5vw, 26px)',
                        letterSpacing:'-.02em',margin:0,color:'var(--fg-1)',lineHeight:1.1,
                      }}>{w.t}</h3>
                      <p style={{
                        fontSize: isMobile ? 14 : 13.5,
                        lineHeight:1.5,color:'var(--fg-2)',margin:0,
                        flex:1,
                        overflow:'hidden',
                      }}>{w.d}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}
window.FitProcess = FitProcess;
