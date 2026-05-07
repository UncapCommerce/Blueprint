// SocialProof.jsx — Mosaic wall of customer reviews (responsive)
function SocialProof() {
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  // Each review has a "size" controlling its grid span, and a "tone" controlling
  // its visual treatment (cream, dark, signal-yellow accent, quote-only, stat-led).
  const reviews = [
    {
      tone:'dark', size:'tall',
      quote:'The Blueprint surfaced three integration risks our previous partner hadn\'t even mentioned. We saved a year.',
      attr:'Denise Foley',
      role:'EVP E-Commerce, ULE Group',
      stat:{n:'6×', l:'Online sales after launch'},
    },
    {
      tone:'cream', size:'wide',
      quote:'The fixed-cost estimate alone was worth ten times what we paid. We never would\'ve known what we didn\'t know.',
      attr:'Mark Iverson',
      role:'COO, Northwoods Mfg.',
      stat:{n:'$295K', l:'saved vs. the wrong quote'},
    },
    {
      tone:'signal', size:'small',
      quote:'We hired the Blueprint as a second opinion. It became the entire project plan.',
      attr:'Priya Shah',
      role:'Head of DTC, Atlas Hardware',
    },
    {
      tone:'white', size:'small',
      quote:'Senior people, every meeting. No bait-and-switch to juniors after kickoff.',
      attr:'Tom Reilly',
      role:'CTO, Welding Store',
    },
    {
      tone:'stat', size:'small',
      stat:{n:'11 weeks', l:'from stalled mid-build to relaunch'},
      attr:'Atlas Hardware',
    },
    {
      tone:'white', size:'wide',
      quote:'Three weeks in we had a working prototype on real Shopify, not a Figma file. That alone changed how every internal stakeholder talked about the project.',
      attr:'Lena Kowalski',
      role:'VP Digital, Sign Warehouse',
    },
    {
      tone:'dark', size:'small',
      stat:{n:'$0', l:'change orders, end of project'},
      attr:'Northwoods Mfg.',
    },
    {
      tone:'cream', size:'small',
      quote:'Every assumption documented, every risk owned, every dollar accounted for before we wrote a line of code.',
      attr:'Jordan Marsh',
      role:'Director of Engineering, Uneeda',
    },
  ];

  return (
    <section id="proof" style={{
      background:'#fff',
      padding: isMobile ? '64px 20px' : '120px 32px',
      borderTop:'1px solid var(--line-1)',
      scrollMarginTop:80,
      position:'relative',
      overflow:'hidden',
    }}>
      <div style={{maxWidth:1280,margin:'0 auto',position:'relative',zIndex:1}}>
        {/* Header */}
        <div style={{display:'grid',gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr',gap: isMobile ? 24 : 64,alignItems: isMobile ? 'start' : 'end',marginBottom: isMobile ? 32 : 56}}>
          <div>
            <div className="uc-eyebrow" style={{marginBottom: isMobile ? 12 : 18}}>Social proof</div>
            <h2 style={{
              fontFamily:'var(--font-display)',fontWeight:700,
              fontSize: isMobile ? 'clamp(28px, 7.6vw, 40px)' : 'clamp(40px,4.4vw,68px)',
              lineHeight:1.05,letterSpacing:'-.03em',
              color:'var(--fg-1)',margin:'0 0 14px',textWrap:'balance',
            }}>
              Brands that stopped guessing.
            </h2>
            <p style={{
              fontFamily:'var(--font-serif)',fontStyle:'italic',
              fontSize: isMobile ? 'clamp(17px, 4.6vw, 22px)' : 'clamp(20px,1.8vw,26px)',
              lineHeight:1.35,
              color:'var(--fg-2)',margin:0,letterSpacing:'-.01em',
            }}>
              Executives. Operators. Founders. Same pattern, every time.
            </p>
          </div>
          <div style={{display:'flex',gap: isMobile ? 16 : 24,justifyContent: isMobile ? 'flex-start' : 'flex-end',alignItems:'baseline',flexWrap:'wrap'}}>
            <Pill n="380+" l="Migrations Completed"/>
            <Pill n="13 yrs" l="Shopify Experts"/>
            <Pill n="4.9★" l="Reviews CSAT"/>
          </div>
        </div>

        {/* 3-column mosaic with varied card heights — collapses to 1-column on mobile */}
        <div style={{
          columnCount: isMobile ? 1 : 3,
          columnGap:16,
        }}>
          {reviews.map((r, i)=>(
            <div key={i} style={{breakInside:'avoid',WebkitColumnBreakInside:'avoid',pageBreakInside:'avoid',marginBottom:16}}>
              <ReviewTile review={r} index={i} isMobile={isMobile}/>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function spanFor(size, isMobile){
  // On mobile, all tiles auto-size to content — no minHeight padding to fight.
  if (isMobile) return {};
  // In column layout, "size" controls minHeight to vary card heights instead of grid spans
  if (size === 'tall')  return {minHeight:380};
  if (size === 'wide')  return {minHeight:240};
  if (size === 'small') return {minHeight:200};
  return {minHeight:200};
}

function ReviewTile({review, index, isMobile}){
  const span = spanFor(review.size, isMobile);
  const tone = review.tone;

  // Tone presets
  const presets = {
    dark:   {bg:'var(--uc-black)', fg:'#fff', sub:'var(--uc-stone-300)', meta:'var(--uc-stone-500)', border:'1px solid var(--uc-black)'},
    cream:  {bg:'var(--uc-cream)', fg:'var(--fg-1)', sub:'var(--fg-2)', meta:'var(--fg-3)', border:'1px solid var(--uc-black)'},
    signal: {bg:'var(--uc-signal)', fg:'var(--uc-black)', sub:'var(--uc-black)', meta:'rgba(10,10,10,0.6)', border:'1px solid var(--uc-black)'},
    white:  {bg:'#fff', fg:'var(--fg-1)', sub:'var(--fg-2)', meta:'var(--fg-3)', border:'1px solid var(--line-1)'},
    stat:   {bg:'#fff', fg:'var(--fg-1)', sub:'var(--fg-2)', meta:'var(--fg-3)', border:'1.5px dashed var(--uc-black)'},
  };
  const p = presets[tone] || presets.white;

  // Stat-led tile: huge number, tiny attribution
  if (tone === 'stat') {
    return (
      <article style={{
        ...span,
        background:p.bg,color:p.fg,border:p.border,borderRadius:5,
        padding:'28px 24px',display:'flex',flexDirection:'column',justifyContent:'space-between',
        position:'relative',
      }}>
        <div style={{fontFamily:'var(--font-mono)',fontSize:10,fontWeight:700,letterSpacing:'.14em',color:p.meta}}>OUTCOME</div>
        <div>
          <div style={{
            fontFamily:'var(--font-display)',fontWeight:800,
            fontSize:'clamp(40px,4vw,64px)',letterSpacing:'-.04em',lineHeight:1,
            marginBottom:6,
          }}>{review.stat.n}</div>
          <div style={{fontSize:13,lineHeight:1.4,color:p.sub,maxWidth:200}}>{review.stat.l}</div>
        </div>
        <div style={{fontSize:12,fontWeight:600,color:p.meta,letterSpacing:'.04em',textTransform:'uppercase'}}>— {review.attr}</div>
      </article>
    );
  }

  // "Tall" tile (featured) — quote + stat ribbon at bottom
  if (review.size === 'tall') {
    return (
      <article style={{
        ...span,
        background:p.bg,color:p.fg,border:p.border,borderRadius:5,
        padding:'28px 26px',display:'flex',flexDirection:'column',justifyContent:'space-between',gap:24,
        position:'relative',overflow:'hidden',
      }}>
        {/* Big serif open-quote mark */}
        <div aria-hidden="true" style={{
          fontFamily:'var(--font-serif)',fontWeight:700,fontStyle:'italic',
          fontSize:96,lineHeight:0.7,color:p.fg,opacity:.18,
          position:'absolute',top:14,right:18,
        }}>"</div>

        <div style={{position:'relative',zIndex:1}}>
          <Stars color={p.fg}/>
          <p style={{
            fontFamily:'var(--font-display)',fontWeight:500,
            fontSize:'clamp(20px,1.7vw,26px)',lineHeight:1.25,letterSpacing:'-.018em',
            margin:'18px 0 0',color:p.fg,textWrap:'balance',
          }}>"{review.quote}"</p>
        </div>

        <div>
          {review.stat && (
            <div style={{
              padding:'14px 0',marginBottom:16,
              borderTop:`1px solid ${tone==='dark'?'#2B2B2B':'rgba(10,10,10,0.15)'}`,
              borderBottom:`1px solid ${tone==='dark'?'#2B2B2B':'rgba(10,10,10,0.15)'}`,
              display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:12,
            }}>
              <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:28,letterSpacing:'-.025em',lineHeight:1}}>{review.stat.n}</div>
              <div style={{fontSize:11,letterSpacing:'.08em',textTransform:'uppercase',color:p.meta,fontWeight:600,textAlign:'right'}}>{review.stat.l}</div>
            </div>
          )}
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <Avatar name={review.attr} dark={tone==='dark'}/>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:p.fg,lineHeight:1.2}}>{review.attr}</div>
              <div style={{fontSize:12,color:p.meta,lineHeight:1.3,marginTop:2}}>{review.role}</div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Wide tile (now displays as a stacked card in 3-col layout)
  if (review.size === 'wide') {
    return (
      <article style={{
        ...span,
        background:p.bg,color:p.fg,border:p.border,borderRadius:5,
        padding:'26px 26px',display:'flex',flexDirection:'column',gap:18,
      }}>
        <div>
          <Stars color={p.fg}/>
          <p style={{
            fontFamily:'var(--font-display)',fontWeight:500,
            fontSize:18,lineHeight:1.3,letterSpacing:'-.012em',
            margin:'12px 0 0',color:p.fg,textWrap:'pretty',
          }}>"{review.quote}"</p>
        </div>
        {review.stat && (
          <div style={{
            paddingTop:14,
            borderTop:`1px solid ${tone==='dark'?'#2B2B2B':'rgba(10,10,10,0.12)'}`,
            display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:12,
          }}>
            <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:24,letterSpacing:'-.02em',lineHeight:1}}>{review.stat.n}</div>
            <div style={{fontSize:11,letterSpacing:'.06em',textTransform:'uppercase',color:p.meta,fontWeight:600,textAlign:'right'}}>{review.stat.l}</div>
          </div>
        )}
        <div style={{display:'flex',alignItems:'center',gap:12,paddingTop:review.stat?0:6,borderTop:review.stat?'none':`1px solid ${tone==='dark'?'#2B2B2B':'rgba(10,10,10,0.08)'}`,marginTop:review.stat?0:6}}>
          <Avatar name={review.attr} dark={tone==='dark'}/>
          <div>
            <div style={{fontSize:14,fontWeight:600,color:p.fg,lineHeight:1.2}}>{review.attr}</div>
            <div style={{fontSize:12,color:p.meta,lineHeight:1.3,marginTop:2}}>{review.role}</div>
          </div>
        </div>
      </article>
    );
  }

  // Small tile — compact quote
  return (
    <article style={{
      ...span,
      background:p.bg,color:p.fg,border:p.border,borderRadius:5,
      padding:'22px 22px',display:'flex',flexDirection:'column',justifyContent:'space-between',gap:16,
    }}>
      <div>
        <Stars color={p.fg} small/>
        <p style={{
          fontFamily:'var(--font-display)',fontWeight:500,
          fontSize:16,lineHeight:1.35,letterSpacing:'-.01em',
          margin:'10px 0 0',color:p.fg,
        }}>"{review.quote}"</p>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <Avatar name={review.attr} dark={tone==='dark'} small/>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:p.fg,lineHeight:1.2}}>{review.attr}</div>
          <div style={{fontSize:11,color:p.meta,lineHeight:1.3,marginTop:2}}>{review.role}</div>
        </div>
      </div>
    </article>
  );
}

function Stars({color='var(--uc-black)', small=false}){
  const size = small ? 12 : 14;
  return (
    <div style={{display:'inline-flex',gap:2}}>
      {[0,1,2,3,4].map(i=>(
        <svg key={i} width={size} height={size} viewBox="0 0 14 14" fill={color}>
          <path d="M7 1l1.8 3.7 4 .6-2.9 2.8.7 4L7 10.2l-3.6 1.9.7-4-2.9-2.8 4-.6L7 1z"/>
        </svg>
      ))}
    </div>
  );
}

function Avatar({name, dark=false, small=false}){
  // Initials avatar
  const initials = name.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase();
  const size = small ? 28 : 36;
  const fontSize = small ? 11 : 13;
  return (
    <div style={{
      width:size,height:size,borderRadius:999,
      background: dark ? '#2B2B2B' : 'var(--uc-stone-200)',
      color: dark ? '#fff' : 'var(--uc-black)',
      display:'inline-flex',alignItems:'center',justifyContent:'center',
      fontFamily:'var(--font-display)',fontWeight:700,fontSize,letterSpacing:'.02em',
      flexShrink:0,
      border: dark ? '1px solid #3a3a3a' : '1px solid rgba(10,10,10,0.1)',
    }}>{initials}</div>
  );
}

function Pill({n, l}){
  return (
    <div style={{display:'flex',flexDirection:'column',gap:2,paddingLeft:16,borderLeft:'1px solid var(--line-1)'}}>
      <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:24,letterSpacing:'-.025em',lineHeight:1,color:'var(--fg-1)'}}>{n}</div>
      <div style={{fontSize:11,letterSpacing:'.06em',textTransform:'uppercase',color:'var(--fg-3)',fontWeight:600}}>{l}</div>
    </div>
  );
}

window.SocialProof = SocialProof;
