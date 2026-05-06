// Problem.jsx — "Migrations don't fail because of Shopify"
// Visual concept: incident dossier. Each failure mode is a "case file" —
// stacked, rotated, stamped, with a redaction bar over what you "didn't know".
function Problem() {
  const items = [
    {
      n:'01',
      tag:'SCOPE',
      t:'Scope creeps. Costs double.',
      d:'The original SOW was a guess. Six months in, the change orders are bigger than the original quote.',
      redact:'change orders are bigger than the original quote',
      stamp:'OVERRUN',
      rot:-2.2,
    },
    {
      n:'02',
      tag:'SEO',
      t:'SEO tanks. Revenue dips for months.',
      d:'Nobody mapped the redirects. Rankings fall off a cliff and recovery takes two quarters.',
      redact:'Nobody mapped the redirects',
      stamp:'TRAFFIC −38%',
      rot:1.6,
    },
    {
      n:'03',
      tag:'INTEGRATIONS',
      t:'Integrations break in ways nobody warned you about.',
      d:'ERP, 3PL, tax, payments, custom pricing logic — half of it doesn\'t survive cutover.',
      redact:'half of it doesn\'t survive cutover',
      stamp:'DATA LOSS',
      rot:-1.4,
    },
    {
      n:'04',
      tag:'PARTNER',
      t:'The agency disappears after kickoff.',
      d:'You signed with a partner. You\'re working with three offshore contractors and a Slack channel that\'s been quiet for a week.',
      redact:'a Slack channel that\'s been quiet for a week',
      stamp:'GHOSTED',
      rot:2.0,
    },
  ];

  return (
    <section id="problem" style={{
      background:'var(--uc-cream)',
      padding:'140px 32px 160px',
      position:'relative',
      overflow:'hidden',
      scrollMarginTop:80,
    }}>
      {/* Subtle dotted-grid background — evidence-board feel */}
      <div aria-hidden="true" style={{
        position:'absolute',inset:0,
        backgroundImage:'radial-gradient(circle, rgba(10,10,10,0.07) 1px, transparent 1px)',
        backgroundSize:'28px 28px',
        maskImage:'linear-gradient(180deg, transparent, #000 12%, #000 88%, transparent)',
        WebkitMaskImage:'linear-gradient(180deg, transparent, #000 12%, #000 88%, transparent)',
        pointerEvents:'none',
      }}/>

      <div style={{maxWidth:1280,margin:'0 auto',position:'relative',zIndex:1}}>

        {/* Header — file folder tab metaphor */}
        <div style={{maxWidth:920,marginBottom:72,position:'relative'}}>
          <div style={{
            display:'inline-flex',alignItems:'center',gap:10,
            padding:'6px 14px',
            background:'var(--uc-black)',color:'#fff',
            borderRadius:'5px 5px 0 0',
            fontFamily:'var(--font-mono)',fontSize:11,fontWeight:600,letterSpacing:'.12em',
            position:'relative',top:1,
          }}>
            <span style={{width:6,height:6,borderRadius:999,background:'var(--uc-signal)',animation:'pulseDot 2s var(--ease-out) infinite'}}/>
            CASE FILE · MIGRATION POSTMORTEMS
          </div>
          <div style={{height:2,background:'var(--uc-black)',marginBottom:24}}/>

          <div className="uc-eyebrow" style={{marginBottom:14}}>The problem</div>
          <h2 style={{
            fontFamily:'var(--font-display)',fontWeight:700,
            fontSize:'clamp(40px,4.4vw,68px)',lineHeight:1.02,letterSpacing:'-.03em',
            color:'var(--fg-1)',margin:'0 0 16px',textWrap:'balance',
          }}>
            Migrations don't fail because of Shopify.
          </h2>
          <p style={{
            fontFamily:'var(--font-serif)',fontStyle:'italic',fontWeight:500,
            fontSize:'clamp(26px,2.8vw,40px)',lineHeight:1.12,
            color:'var(--fg-2)',margin:'0 0 28px',letterSpacing:'-.015em',textWrap:'balance',
          }}>
            They fail because of what you didn't know before you signed.
          </p>
          <p style={{fontSize:17,lineHeight:1.6,color:'var(--fg-2)',margin:0,maxWidth:640}}>
            Every brand we've ever rescued from a stalled migration shared the same first mistake: they bought an estimate when they needed a strategy.
          </p>
        </div>

        {/* The 4 case files — staggered, rotated dossier cards */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(4, 1fr)',
          gap:24,
          position:'relative',
          paddingTop:20,
        }}>
          {items.map((item,i)=>(
            <CaseFile key={item.n} item={item} index={i}/>
          ))}
        </div>

        {/* Closing line — handwritten / underlined */}
        <div style={{marginTop:88,textAlign:'center',position:'relative'}}>
          <p style={{
            display:'inline-block',
            fontFamily:'var(--font-display)',fontWeight:600,
            fontSize:'clamp(22px,2vw,30px)',lineHeight:1.2,letterSpacing:'-.02em',
            color:'var(--fg-1)',margin:0,
            position:'relative',
          }}>
            You don't need another estimate.{' '}
            <span style={{position:'relative',display:'inline-block'}}>
              <span style={{position:'relative',zIndex:1}}>You need clarity.</span>
              <svg aria-hidden="true" style={{position:'absolute',left:-4,right:-4,bottom:-6,width:'calc(100% + 8px)',height:14,zIndex:0}} viewBox="0 0 220 14" preserveAspectRatio="none">
                <path d="M2 9 C 40 4, 90 12, 140 7 S 210 5, 218 8" stroke="var(--uc-signal)" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.85"/>
              </svg>
            </span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        .case-file {
          transition: transform .35s var(--ease-out), box-shadow .35s var(--ease-out);
        }
        .case-file:hover {
          transform: translateY(-6px) rotate(0deg) !important;
          box-shadow: 0 18px 36px rgba(10,10,10,0.14), 0 4px 8px rgba(10,10,10,0.06);
          z-index: 5;
        }
        .case-file:hover .case-redact {
          background: transparent;
          color: var(--uc-error);
        }
        .case-file:hover .case-stamp {
          opacity: 1;
          transform: rotate(-8deg) scale(1.04);
        }
      `}</style>
    </section>
  );
}

function CaseFile({item, index}){
  const isOdd = index % 2 === 1;
  return (
    <div className="case-file" style={{
      position:'relative',
      transform:`rotate(${item.rot}deg) translateY(${isOdd ? 16 : 0}px)`,
      transformOrigin:'center top',
    }}>
      {/* Tape / clip at top */}
      <div aria-hidden="true" style={{
        position:'absolute',top:-14,left:'50%',transform:'translateX(-50%) rotate(-3deg)',
        width:64,height:22,
        background:'rgba(232,255,82,0.55)',
        border:'1px solid rgba(10,10,10,0.18)',
        boxShadow:'0 1px 0 rgba(10,10,10,0.05)',
        zIndex:2,
      }}/>

      <div style={{
        background:'#FCFAF3',
        border:'1px solid var(--uc-black)',
        borderRadius:5,
        padding:'24px 22px 22px',
        boxShadow:'0 6px 14px rgba(10,10,10,0.07), 0 1px 2px rgba(10,10,10,0.05)',
        position:'relative',
        minHeight:340,
        display:'flex',flexDirection:'column',
        // Faint horizontal rule lines like a notepad
        backgroundImage:`
          linear-gradient(180deg, transparent 0, transparent calc(100% - 1px), rgba(10,10,10,0.05) 100%),
          repeating-linear-gradient(0deg, transparent 0, transparent 27px, rgba(10,10,10,0.04) 27px, rgba(10,10,10,0.04) 28px)
        `,
      }}>
        {/* Header row: case number + tag */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18,paddingBottom:10,borderBottom:'1px dashed rgba(10,10,10,0.25)'}}>
          <span style={{
            fontFamily:'var(--font-mono)',fontSize:10,fontWeight:600,
            letterSpacing:'.14em',color:'var(--fg-3)',
          }}>CASE №{item.n}</span>
          <span style={{
            fontFamily:'var(--font-mono)',fontSize:9,fontWeight:700,
            letterSpacing:'.14em',color:'var(--uc-black)',
            padding:'3px 7px',border:'1px solid var(--uc-black)',
            borderRadius:2,
          }}>{item.tag}</span>
        </div>

        {/* Big serif failure title */}
        <h3 style={{
          fontFamily:'var(--font-display)',fontWeight:700,
          fontSize:21,lineHeight:1.15,letterSpacing:'-.022em',
          margin:'0 0 14px',color:'var(--fg-1)',
        }}>{item.t}</h3>

        {/* Body with inline redaction */}
        <p style={{fontSize:13.5,lineHeight:1.55,color:'var(--fg-2)',margin:'0 0 22px'}}>
          {renderWithRedaction(item.d, item.redact)}
        </p>

        {/* Spacer */}
        <div style={{flex:1}}/>

        {/* Stamp at bottom */}
        <div className="case-stamp" aria-hidden="true" style={{
          position:'absolute',bottom:18,right:18,
          padding:'6px 10px',
          border:'2px solid var(--uc-error)',
          color:'var(--uc-error)',
          fontFamily:'var(--font-mono)',fontWeight:700,
          fontSize:10,letterSpacing:'.12em',
          transform:'rotate(-6deg)',
          opacity:0.78,
          background:'rgba(181,50,43,0.04)',
          transition:'opacity .35s var(--ease-out), transform .35s var(--ease-out)',
          whiteSpace:'nowrap',
        }}>{item.stamp}</div>

        {/* Punch holes on left edge — folder feel */}
        <div aria-hidden="true" style={{
          position:'absolute',left:-1,top:60,bottom:60,
          width:8,
          display:'flex',flexDirection:'column',justifyContent:'space-between',
          alignItems:'center',
        }}>
          <span style={{width:8,height:8,borderRadius:999,background:'var(--uc-cream)',border:'1px solid rgba(10,10,10,0.3)',marginLeft:-4}}/>
          <span style={{width:8,height:8,borderRadius:999,background:'var(--uc-cream)',border:'1px solid rgba(10,10,10,0.3)',marginLeft:-4}}/>
          <span style={{width:8,height:8,borderRadius:999,background:'var(--uc-cream)',border:'1px solid rgba(10,10,10,0.3)',marginLeft:-4}}/>
        </div>
      </div>
    </div>
  );
}

// Render a paragraph with the matched substring rendered as a "redaction bar"
// that reveals on hover via the .case-file:hover .case-redact rule.
function renderWithRedaction(text, target){
  const idx = text.indexOf(target);
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const after = text.slice(idx + target.length);
  return (
    <React.Fragment>
      {before}
      <span className="case-redact" style={{
        background:'var(--uc-black)',
        color:'var(--uc-black)',
        padding:'1px 4px',
        borderRadius:2,
        transition:'background .35s var(--ease-out), color .35s var(--ease-out)',
        boxDecorationBreak:'clone',
        WebkitBoxDecorationBreak:'clone',
      }}>{target}</span>
      {after}
    </React.Fragment>
  );
}

window.Problem = Problem;
