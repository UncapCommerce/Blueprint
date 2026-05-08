// Guarantee.jsx + FAQ.jsx + Founder.jsx + FinalCTA.jsx + Footer.jsx (responsive)
function Guarantee() {
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  return (
    <section style={{background:'#fff',padding: isMobile ? '64px 20px' : '120px 32px'}}>
      <div style={{maxWidth:1080,margin:'0 auto',position:'relative'}}>
        {/* Stamp — absolute on desktop, inline above headline on mobile so it never overlaps */}
        <div style={isMobile ? {
          width:108,height:108,border:'1px solid var(--uc-black)',borderRadius:999,
          display:'flex',alignItems:'center',justifyContent:'center',transform:'rotate(-6deg)',
          background:'var(--uc-signal)',margin:'0 0 24px',
        } : {
          position:'absolute',top:-20,right:0,width:140,height:140,border:'1px solid var(--uc-black)',borderRadius:999,
          display:'flex',alignItems:'center',justifyContent:'center',transform:'rotate(8deg)',background:'var(--uc-signal)',
        }}>
          <div style={{textAlign:'center',fontFamily:'var(--font-display)',fontWeight:800,fontSize: isMobile ? 12 : 14,letterSpacing:'.04em',textTransform:'uppercase',lineHeight:1.1,color:'var(--uc-black)'}}>
            100%<br/>Money-back<br/>Guarantee
          </div>
        </div>
        <div className="uc-eyebrow" style={{marginBottom: isMobile ? 12 : 18}}>Guarantee</div>
        <h2 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize: isMobile ? 'clamp(28px, 7.6vw, 40px)' : 'clamp(40px,4.4vw,72px)',lineHeight:1.05,letterSpacing:'-.03em',color:'var(--fg-1)',margin:'0 0 14px',maxWidth:840}}>
          If it doesn't give you clarity, you don't pay.
        </h2>
        <p style={{fontFamily:'var(--font-serif)',fontStyle:'italic',fontSize: isMobile ? 'clamp(17px, 4.6vw, 22px)' : 'clamp(22px,2vw,30px)',lineHeight:1.35,color:'var(--fg-2)',margin:'0 0 24px',maxWidth:760,letterSpacing:'-.01em'}}>
          Finish the Discovery Call. If you don't feel confident in your migration path, we refund every dollar.
        </p>
        <p style={{fontSize: isMobile ? 15 : 17,color:'var(--fg-3)',margin:0,fontWeight:500}}>
          We've never had to.
        </p>
      </div>
    </section>
  );
}

function FAQ() {
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  const items = [
    {q:'Why charge for what others give away?', a:'Because free estimates aren\'t strategy. They\'re sales calls in disguise. Doing the work properly takes 4 weeks of senior time. We\'d rather charge for it and do it right than dress it up as "discovery" and bake the cost into a 14-month build.'},
    {q:'What if I want you to implement?', a:'Great. The Blueprint cost is credited 1:1 toward implementation. Your $7.5K becomes a $7.5K discount on the build.'},
    {q:'What if I don\'t want you to implement?', a:'Also great. You walk with everything you need to brief any agency — or your in-house team. The architecture, the prototype, the data plan, the risk register, the fixed-cost estimate. All yours. No NDA chokeholds, no IP traps.'},
    {q:'How is this different from a discovery phase?', a:'Discovery phases lock you in. Most are scoped to justify the build the agency already wants to sell you. The Blueprint is scoped to give you the truth — even if the truth is "don\'t migrate yet" or "hire someone else."'},
    {q:'What happens on the 25-min call?', a:'We diagnose your situation, tell you honestly if you\'re a fit, and answer anything. No pitch deck. No slick spin. No B.S. If you\'re not a fit, we\'ll tell you who is.'},
    {q:'Who actually does the work?', a:'Senior architects who\'ve done this hundreds of times. Not junior consultants and not offshore contractors. The people on your kickoff call are the people writing your Blueprint.'},
  ];
  const [open,setOpen] = React.useState(0);
  return (
    <section id="faq" style={{background:'var(--uc-cream)',padding: isMobile ? '64px 20px' : '120px 32px',scrollMarginTop:80}}>
      <div style={{maxWidth:1080,margin:'0 auto'}}>
        <div className="uc-eyebrow" style={{marginBottom: isMobile ? 12 : 18}}>FAQ</div>
        <h2 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize: isMobile ? 'clamp(28px, 7.6vw, 38px)' : 'clamp(40px,4.4vw,68px)',lineHeight:1.05,letterSpacing:'-.03em',color:'var(--fg-1)',margin: isMobile ? '0 0 28px' : '0 0 48px'}}>
          Questions worth asking.
        </h2>
        <div style={{borderTop:'1px solid var(--uc-black)'}}>
          {items.map((it,i)=>(
            <div key={it.q} style={{borderBottom:'1px solid var(--uc-black)'}}>
              <button onClick={()=>setOpen(open===i?-1:i)} style={{width:'100%',background:'transparent',border:'none',padding: isMobile ? '18px 0' : '24px 0',textAlign:'left',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',gap: isMobile ? 14 : 24}}>
                <span style={{fontFamily:'var(--font-display)',fontWeight:600,fontSize: isMobile ? 'clamp(15px, 4vw, 18px)' : 'clamp(20px,1.8vw,26px)',letterSpacing:'-.015em',color:'var(--fg-1)',lineHeight:1.25}}>{it.q}</span>
                <span style={{width: isMobile ? 30 : 36,height: isMobile ? 30 : 36,borderRadius:999,border:'1px solid var(--uc-black)',display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0,transform:open===i?'rotate(45deg)':'rotate(0)',transition:'transform 220ms var(--ease-out)',background:open===i?'var(--uc-black)':'transparent',color:open===i?'#fff':'var(--uc-black)'}}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5v11M1.5 7h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </span>
              </button>
              <div style={{maxHeight:open===i? (isMobile ? 600 : 400) :0,overflow:'hidden',transition:'max-height 320ms var(--ease-out)'}}>
                <p style={{fontSize: isMobile ? 15 : 17,lineHeight:1.6,color:'var(--fg-2)',margin:0,paddingBottom: isMobile ? 18 : 24,maxWidth:780}}>{it.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Founder() {
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  return (
    <section style={{background:'var(--uc-black)',color:'#fff',padding: isMobile ? '64px 20px' : '120px 32px'}}>
      <div style={{maxWidth:1080,margin:'0 auto',display:'grid',gridTemplateColumns: isMobile ? '1fr' : '1fr 1.6fr',gap: isMobile ? 28 : 64,alignItems:'center'}}>
        <div>
          <div style={{aspectRatio:'4/5',background:'#1A1A1A',border:'1px solid #2B2B2B',borderRadius:5,position:'relative',overflow:'hidden',maxWidth: isMobile ? 320 : 'none',margin: isMobile ? '0 auto' : 0}}>
            <img src="assets/denis-dyli-uncap.png" alt="Denis Dyli, Founder of Uncap" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top',display:'block'}} loading="lazy" decoding="async"/>
            <div style={{position:'absolute',bottom:16,left:16,padding:'4px 10px',background:'var(--uc-signal)',borderRadius:3,fontSize:11,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:'var(--uc-black)'}}>Denis Dyli · Founder</div>
          </div>
        </div>
        <div>
          <div className="uc-eyebrow" style={{color:'var(--uc-stone-500)',marginBottom: isMobile ? 12 : 18}}>Why I built this</div>
          <p style={{fontFamily:'var(--font-display)',fontWeight:500,fontSize: isMobile ? 'clamp(20px, 5.4vw, 28px)' : 'clamp(28px,3vw,42px)',lineHeight:1.2,letterSpacing:'-.025em',color:'#fff',margin:'0 0 18px'}}>
            I've watched too many brands sign migration contracts they didn't understand and pay for it for years.
          </p>
          <p style={{fontFamily:'var(--font-serif)',fontStyle:'italic',fontSize: isMobile ? 'clamp(17px, 4.6vw, 22px)' : 'clamp(22px,2vw,28px)',lineHeight:1.4,color:'var(--uc-stone-300)',margin: isMobile ? '0 0 18px' : '0 0 28px',letterSpacing:'-.01em'}}>
            The Blueprint is the brief I wish every founder had before they signed anything.
          </p>
          <div style={{fontSize: isMobile ? 13 : 14,fontWeight:500,color:'var(--uc-stone-500)',lineHeight:1.5}}>— Denis Dyli, Founder, Uncap · Building on Shopify since 2013 · 380+ projects launched</div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  return (
    <section id="book" style={{background:'var(--uc-cream)',padding: isMobile ? '72px 20px 80px' : '140px 32px',position:'relative',overflow:'hidden',scrollMarginTop:80}}>
      {!isMobile && (
        <div style={{position:'absolute',inset:0,opacity:.5,pointerEvents:'none'}}>
          <img src="assets/bg-vector-1.svg" style={{position:'absolute',left:-200,bottom:-200,width:900,opacity:.3}} alt="" loading="lazy" decoding="async"/>
        </div>
      )}
      <div style={{maxWidth:1080,margin:'0 auto',textAlign:'left',position:'relative',zIndex:1}}>
        <div className="uc-eyebrow" style={{marginBottom: isMobile ? 16 : 24}}>Final step</div>
        <h2 style={{fontFamily:'var(--font-hero)',fontWeight:800,fontSize: isMobile ? 'clamp(36px, 10vw, 56px)' : 'clamp(48px,6vw,108px)',lineHeight:1,letterSpacing:'-.04em',color:'var(--fg-1)',margin:'0 0 18px',textWrap:'balance'}}>
          Ready to see the whole map?
        </h2>
        <p style={{fontFamily:'var(--font-serif)',fontStyle:'italic',fontSize: isMobile ? 'clamp(18px, 4.8vw, 24px)' : 'clamp(24px,2.4vw,36px)',lineHeight:1.3,color:'var(--fg-2)',margin: isMobile ? '0 0 28px' : '0 0 48px',maxWidth:760,letterSpacing:'-.01em'}}>
          Eight 5-minute questions. Save a card on file with $0 today — we charge only after the kickoff confirms scope.
        </p>
        <div style={{display:'flex',gap: isMobile ? 10 : 14,alignItems:'stretch',flexDirection: isMobile ? 'column' : 'row',flexWrap:'wrap',marginBottom:32}}>
          <a href="/build" className="uc-btn b-primary" style={isMobile ? {width:'100%',justifyContent:'center',padding:'16px 24px',fontSize:16} : {padding:'18px 28px',fontSize:16}}>Start the Blueprint <span>→</span></a>
        </div>
        <div style={{display:'grid',gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',gap: isMobile ? 18 : 32,paddingTop: isMobile ? 24 : 32,borderTop:'1px solid var(--line-1)'}}>
          {[
            {n:'4 weeks', l:'Delivery'},
            {n:'$7,500', l:'Fixed price'},
            {n:'100%', l:'Refund guarantee'},
            {n:'Yours', l:'To keep'},
          ].map(s=>(
            <div key={s.l}>
              <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize: isMobile ? 24 : 32,letterSpacing:'-.03em',color:'var(--fg-1)',lineHeight:1}}>{s.n}</div>
              <div style={{fontSize:12,color:'var(--fg-3)',marginTop:6,letterSpacing:'.08em',textTransform:'uppercase',fontWeight:600}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  return (
    <footer style={{background:'var(--uc-black)',color:'var(--uc-stone-300)',padding: isMobile ? '40px 20px 24px' : '56px 32px 28px'}}>
      <div style={{maxWidth:1280,margin:'0 auto',display:'grid',gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',gap: isMobile ? 28 : 48}}>
        <div>
          <img src="assets/uncap-logo-white.svg" style={{height: isMobile ? 22 : 26,marginBottom: isMobile ? 14 : 20}} alt="Uncap" loading="lazy" decoding="async"/>
          <p style={{fontSize:14,lineHeight:1.6,color:'var(--uc-stone-500)',maxWidth:380,margin:0}}>
            Uncap is the partner behind hundreds of ambitious unified commerce brands, manufacturers, and distributors growing on Shopify.
          </p>
        </div>
        {[
          {h:'Connect',l:['hey@uncap.com','(312) 469-0944','8770 West Bryn Mawr Ave','Suite 1300','Chicago, IL 60631']},
        ].map(col=>(
          <div key={col.h}>
            <div className="uc-eyebrow" style={{color:'#fff',marginBottom: isMobile ? 10 : 14}}>{col.h}</div>
            <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:8}}>
              {col.l.map(x=><li key={x}><a href="#" style={{color:'var(--uc-stone-300)',textDecoration:'none',fontSize:14}}>{x}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div style={{maxWidth:1280,margin: isMobile ? '28px auto 0' : '40px auto 0',paddingTop:20,borderTop:'1px solid #2B2B2B',display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--uc-stone-500)',flexWrap:'wrap',gap:8}}>
        <div>2026 © Uncap, Inc — All rights reserved.</div>
        <div>Shopify Platinum Partner</div>
      </div>
    </footer>
  );
}

window.Guarantee = Guarantee;
window.FAQ = FAQ;
window.Founder = Founder;
window.FinalCTA = FinalCTA;
window.Footer = Footer;
