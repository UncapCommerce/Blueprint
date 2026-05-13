// SocialProof.jsx: Mosaic wall of customer reviews (responsive)
function SocialProof() {
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  // Each review has a "size" controlling its grid span, and a "tone" controlling
  // its visual treatment (cream, dark, signal-yellow accent, quote-only, stat-led).
  const reviews = [
    {
      tone:'dark', size:'tall',
      quote:'The team communicated consistently and efficiently, and internal stakeholders were particularly impressed with the Uncaps\' vast technical expertise.',
      attr:'Todd Arey',
      role:'E3 Spark Plugs',
      photo:'https://i.pravatar.cc/120?img=44',
      stat:{n:'60 DAYS', l:'migrating to Shopify after Blueprint'},
    },
    {
      tone:'cream', size:'wide',
      quote:'The personal touch, and constant communication is what separates them from other companies with a 50+ person team where the attention to detail may be lost.',
      attr:'Brandt DeVries',
      role:'WeldingStore',
      photo:'https://i.pravatar.cc/120?img=12',
    },
    {
      tone:'signal', size:'small',
      quote:'The integration of our platforms created an easy solution that even our complex systems sales teams can easily use.',
      attr:'Bryan Snyder',
      role:'Canon Medical',
      photo:'https://i.pravatar.cc/120?img=18',
      stat:{n:'83% LOWER', l:'Total cost of ownership running on Shopify'},
      statBig: true,
    },
    {
      tone:'signal', size:'small',
      quote:'They are brilliant and very knowledgeable of all that Shopify can do.',
      attr:'Peggy Farabaugh',
      role:'Vermont Woods',
      photo:'https://i.pravatar.cc/120?img=5',
      stat:{n:'PRODUCT CONFIGURATOR', l:'Furniture manufacturing custom ordering'},
      statBig: true,
    },
    {
      tone:'white', size:'small',
      quote:'Uncap team demonstrated a deep understanding of working within the Shopify ecosystem from the get-go, which in turn helped me tremendously with aligning the new site with our older business model and work flows.',
      attr:'Andy Morgan',
      role:'ScooterWorks',
      photo:'https://i.pravatar.cc/120?img=14',
      stat:{n:'CUSTOM ERP', l:'integration data mapping for Shopify'},
      statBig: true,
    },
    {
      tone:'stat', size:'small',
      stat:{n:'Unified Commerce', l:'DTC + B2B + POS'},
      // Same tile carries the Pete Suter testimonial directly under the stat
      // copy, no extra box. The stat-tone renderer picks this up and stacks
      // it below the stat label.
      followUpQuote:'I’ve honestly never worked with a firm like them before; they’re absolutely outstanding.',
      followUpAttr:'Pete Suter',
      followUpRole:"Shirley's Gourmet Popcorn",
    },
    {
      tone:'white', size:'wide',
      quote:'During the Blueprint, the Uncap team went through each of my requirements and laid out if it was doable, if it was native to Shopify, if it required an app and which one they recommend, or if custom work was needed.',
      attr:'Denise Foley',
      role:'ULE Group',
      photo:'https://i.pravatar.cc/120?img=9',
      stat:{n:'1M SKUs', l:'Mapped to sync from Epicor to Shopify'},
      statBig: true,
    },
    {
      tone:'dark', size:'small',
      quote:'I cannot praise the Uncap enough. They are hell of a team.',
      attr:'Andy Blechschmidt',
      role:'Jerico',
      photo:'https://i.pravatar.cc/120?img=11',
    },
    {
      tone:'cream', size:'small',
      quote:'The team was incredible and very honest and transparent with us when we voiced our needs and concerns.',
      attr:'Georgia Kryssing',
      role:'Kooks Headers',
      photo:'https://i.pravatar.cc/120?img=15',
      stat:{n:'YMM FITMENT', l:'ACES & PIES fitment live sync on the online store'},
      statBig: true,
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
            <div className="uc-eyebrow" style={{marginBottom: isMobile ? 12 : 18}}>Testimonials</div>
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

        {/* 3-column mosaic with varied card heights: collapses to 1-column on mobile */}
        <div data-reveal-stagger style={{
          columnCount: isMobile ? 1 : 3,
          columnGap:16,
        }}>
          {reviews.map((r, i)=>(
            <div key={i} style={{breakInside:'avoid',WebkitColumnBreakInside:'avoid',pageBreakInside:'avoid',marginBottom:16}}>
              <ReviewTile review={r} index={i} isMobile={isMobile}/>
            </div>
          ))}
        </div>

        {/* Trust badges below the mosaic — Trustpilot, Clutch, Google, Shopify.
            Each lockup is icon + wordmark + 5-star strip in the brand colour,
            rendered inline with no surrounding box so the row reads as a
            clean ribbon under the wall of voices. */}
        <div style={{
          marginTop: isMobile ? 32 : 48,
          paddingTop: isMobile ? 24 : 32,
          borderTop:'1px solid var(--line-1)',
          display:'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems:'center',
          justifyContent:'center',
          gap: isMobile ? 18 : 44,
          flexWrap:'wrap',
        }}>
          <TrustBadge brand="trustpilot"/>
          <TrustBadge brand="clutch"/>
          <TrustBadge brand="google"/>
          <TrustBadge brand="shopify"/>
        </div>
      </div>
    </section>
  );
}

// One review-platform lockup: real brand logo + 5-star row, all inline,
// no surrounding box. Logo SVGs live in public/assets/badges/. Every logo
// renders at the same fixed visual height (LOGO_H) so the four lockups
// line up visually regardless of each SVG's internal aspect ratio.
const LOGO_H = 26;
function TrustBadge({brand}){
  const data = {
    trustpilot: { label:'Trustpilot', colour:'#00B67A', file:'Trust Pilot-logo.svg' },
    clutch:     { label:'Clutch',     colour:'#FF3D2E', file:'Clutch-logo.svg'      },
    google:     { label:'Google',     colour:'#FBBC05', file:'Google-logo.svg'      },
    shopify:    { label:'Shopify',    colour:'#5A8A3A', file:'Shopify-logo.svg'     },
  }[brand];

  return (
    <div style={{display:'inline-flex',alignItems:'center',gap:10}}>
      <span style={{display:'inline-flex',alignItems:'center',height: LOGO_H,flexShrink:0}}>
        <img
          src={`assets/badges/${data.file}`}
          alt={data.label}
          loading="lazy"
          decoding="async"
          style={{height: LOGO_H, width:'auto', maxHeight: LOGO_H, display:'block', objectFit:'contain'}}
        />
      </span>
      <FiveStars colour={data.colour}/>
    </div>
  );
}

function FiveStars({colour='#00B67A'}){
  return (
    <span aria-label="5 out of 5 stars" style={{display:'inline-flex',gap:2}}>
      {[0,1,2,3,4].map(i => (
        <svg key={i} width="13" height="13" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M10 1.6l2.36 4.97 5.44.63-4.03 3.72 1.16 5.4L10 13.6l-4.93 2.72 1.16-5.4-4.03-3.72 5.44-.63L10 1.6z" fill={colour}/>
        </svg>
      ))}
    </span>
  );
}

function spanFor(size, isMobile){
  // On mobile, all tiles auto-size to content: no minHeight padding to fight.
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

  // Stat-led tile: huge number, tiny attribution. If the review carries a
  // followUpQuote, the same tile stacks that testimonial under the stat copy
  // (separated by a hairline) — no second box.
  if (tone === 'stat') {
    return (
      <article style={{
        ...span,
        background:p.bg,color:p.fg,border:p.border,borderRadius:5,
        padding:'28px 24px',display:'flex',flexDirection:'column',justifyContent:'space-between',gap:20,
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
        {review.attr ? (
          <div style={{fontSize:12,fontWeight:600,color:p.meta,letterSpacing:'.04em',textTransform:'uppercase'}}>{review.attr}</div>
        ) : null}
        {review.followUpQuote ? (
          <div style={{
            marginTop:4,paddingTop:18,
            borderTop:'1px dashed rgba(10,10,10,0.18)',
            display:'flex',flexDirection:'column',gap:10,
          }}>
            <p style={{
              fontFamily:'var(--font-display)',fontStyle:'italic',fontWeight:500,
              fontSize:14,lineHeight:1.4,letterSpacing:'-.01em',
              color:p.fg,margin:0,
            }}>“{review.followUpQuote}”</p>
            <div style={{display:'flex',flexDirection:'column',lineHeight:1.25}}>
              <span style={{fontSize:12,fontWeight:600,color:p.fg}}>{review.followUpAttr}</span>
              {review.followUpRole ? (
                <span style={{fontSize:11,color:p.meta,fontWeight:500}}>{review.followUpRole}</span>
              ) : null}
            </div>
          </div>
        ) : null}
      </article>
    );
  }

  // "Tall" tile (featured): quote + stat ribbon at bottom
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
            <Avatar name={review.attr} src={review.photo} dark={tone==='dark'}/>
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
            paddingTop:14,paddingBottom:14,
            borderTop:`1px solid ${tone==='dark'?'#2B2B2B':'rgba(10,10,10,0.12)'}`,
            borderBottom:`1px solid ${tone==='dark'?'#2B2B2B':'rgba(10,10,10,0.12)'}`,
            display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:12,
          }}>
            <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize: review.statBig ? 32 : 24,letterSpacing:'-.02em',lineHeight:1}}>{review.stat.n}</div>
            <div style={{fontSize:11,letterSpacing:'.06em',textTransform:'uppercase',color:p.meta,fontWeight:600,textAlign:'right'}}>{review.stat.l}</div>
          </div>
        )}
        <div style={{display:'flex',alignItems:'center',gap:12,paddingTop:review.stat?0:6,borderTop:review.stat?'none':`1px solid ${tone==='dark'?'#2B2B2B':'rgba(10,10,10,0.08)'}`,marginTop:review.stat?0:6}}>
          <Avatar name={review.attr} src={review.photo} dark={tone==='dark'}/>
          <div>
            <div style={{fontSize:14,fontWeight:600,color:p.fg,lineHeight:1.2}}>{review.attr}</div>
            <div style={{fontSize:12,color:p.meta,lineHeight:1.3,marginTop:2}}>{review.role}</div>
          </div>
        </div>
      </article>
    );
  }

  // Small tile: compact quote
  return (
    <article style={{
      ...span,
      background:p.bg,color:p.fg,border:p.border,borderRadius:5,
      padding:'22px 22px',display:'flex',flexDirection:'column',justifyContent:'space-between',gap:14,
    }}>
      <div>
        <Stars color={p.fg} small/>
        <p style={{
          fontFamily:'var(--font-display)',fontWeight:500,
          fontSize:16,lineHeight:1.35,letterSpacing:'-.01em',
          margin:'10px 0 0',color:p.fg,
        }}>"{review.quote}"</p>
      </div>
      {review.stat && (
        <div style={{
          paddingTop:12,paddingBottom:12,
          borderTop:`1px solid ${tone==='dark'?'#2B2B2B':'rgba(10,10,10,0.12)'}`,
          borderBottom:`1px solid ${tone==='dark'?'#2B2B2B':'rgba(10,10,10,0.12)'}`,
          display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:10,
        }}>
          <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize: review.statBig ? 26 : 20,letterSpacing:'-.02em',lineHeight:1}}>{review.stat.n}</div>
          <div style={{fontSize:11,letterSpacing:'.05em',textTransform:'uppercase',color:p.meta,fontWeight:600,textAlign:'right'}}>{review.stat.l}</div>
        </div>
      )}
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <Avatar name={review.attr} src={review.photo} dark={tone==='dark'} small/>
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

function Avatar({name, src, dark=false, small=false}){
  const size = small ? 28 : 36;
  const fontSize = small ? 11 : 13;
  const baseStyle = {
    width:size,height:size,borderRadius:999,
    flexShrink:0,
    border: dark ? '1px solid #3a3a3a' : '1px solid rgba(10,10,10,0.1)',
    overflow:'hidden',
  };
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        loading="lazy"
        decoding="async"
        style={{...baseStyle, objectFit:'cover', display:'block'}}
      />
    );
  }
  const initials = name.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase();
  return (
    <div style={{
      ...baseStyle,
      background: dark ? '#2B2B2B' : 'var(--uc-stone-200)',
      color: dark ? '#fff' : 'var(--uc-black)',
      display:'inline-flex',alignItems:'center',justifyContent:'center',
      fontFamily:'var(--font-display)',fontWeight:700,fontSize,letterSpacing:'.02em',
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
