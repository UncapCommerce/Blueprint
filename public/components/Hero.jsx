// Hero.jsx — Above-the-fold conversion module
function Hero() {
  return (
    <section style={{background:'var(--uc-cream)',padding:'72px 32px 96px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,opacity:.5,pointerEvents:'none'}}>
        <img src="assets/bg-vector-2.svg" style={{position:'absolute',right:-200,top:-100,width:900,opacity:.35}} alt="" loading="lazy" decoding="async"/>
      </div>
      <div style={{maxWidth:1280,margin:'0 auto',position:'relative',zIndex:1}}>
        {/* Tag chip */}
        <div style={{display:'inline-flex',alignItems:'center',gap:10,padding:'6px 14px 6px 8px',border:'1px solid var(--uc-black)',borderRadius:5,background:'#fff',marginBottom:32}}>
          <span style={{display:'inline-flex',alignItems:'center',gap:6,padding:'3px 8px',background:'var(--uc-signal)',borderRadius:3,fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase'}}>New</span>
          <span style={{fontSize:13,fontWeight:500,color:'var(--fg-1)'}}>The Blueprint — fixed-cost migration R&D</span>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1.35fr 1fr',gap:80,alignItems:'end'}}>
          <div>
            <h1 style={{fontFamily:'var(--font-hero)',fontWeight:800,fontSize:'clamp(48px, 5.6vw, 88px)',lineHeight:1.0,letterSpacing:'-.035em',color:'var(--fg-1)',margin:'0 0 28px',textWrap:'balance'}}>
              Stop gambling six figures on a Shopify migration you can't see coming.
            </h1>
            <p style={{fontFamily:'var(--font-display)',fontStyle:'italic',fontWeight:500,fontSize:'clamp(22px, 2vw, 28px)',lineHeight:1.3,letterSpacing:'-.015em',color:'var(--fg-2)',margin:'0 0 40px',maxWidth:640}}>
              A fully built migration blueprint, prototype, and strategy — for a fixed $7K. Yours to keep. With us, or without.
            </p>
            <div style={{display:'flex',gap:14,alignItems:'center',flexWrap:'wrap'}}>
              <a href="/quiz" className="uc-btn b-primary">Start the Blueprint <span>→</span></a>
              <a href="/call" className="uc-btn b-text">Not ready? Book a fit call <span>→</span></a>
            </div>
            <div style={{display:'flex',gap:24,alignItems:'center',marginTop:36,flexWrap:'wrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <CheckDot/>
                <span style={{fontSize:13,color:'var(--fg-2)',fontWeight:500}}>Delivered in 4 weeks</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <CheckDot/>
                <span style={{fontSize:13,color:'var(--fg-2)',fontWeight:500}}>Refund if it doesn't give you clarity</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <CheckDot/>
                <span style={{fontSize:13,color:'var(--fg-2)',fontWeight:500}}>Credited toward implementation</span>
              </div>
            </div>
          </div>

          {/* Right column — the artifact card */}
          <BlueprintArtifact/>
        </div>
      </div>
    </section>
  );
}

function CheckDot(){
  return (
    <span style={{width:18,height:18,borderRadius:999,background:'var(--uc-black)',display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5.2L4 7.2L8 2.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </span>
  );
}

function BlueprintArtifact(){
  return (
    <div style={{position:'relative',perspective:1200}}>
      {/* Stacked paper effect */}
      <div style={{position:'absolute',top:14,left:14,right:-14,bottom:-14,background:'#fff',border:'1px solid var(--uc-black)',borderRadius:5,opacity:.4}}/>
      <div style={{position:'absolute',top:7,left:7,right:-7,bottom:-7,background:'#fff',border:'1px solid var(--uc-black)',borderRadius:5,opacity:.7}}/>
      <div style={{position:'relative',background:'#fff',border:'1px solid var(--uc-black)',borderRadius:5,padding:28,boxShadow:'var(--shadow-3)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,paddingBottom:14,borderBottom:'1px solid var(--line-1)'}}>
          <div className="uc-eyebrow" style={{color:'var(--fg-1)'}}>Blueprint v1.0</div>
          <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--fg-3)'}}>uncap-blueprint.pdf</div>
        </div>
        <div style={{
          display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:14,
          marginBottom:18,
        }}>
          <div style={{
            fontFamily:'var(--font-display)',fontWeight:700,fontSize:22,
            letterSpacing:'-.02em',lineHeight:1.15,color:'var(--fg-1)',
          }}>
            Uncap Blueprint.
            <div style={{
              marginTop:6,
              fontStyle:'italic',fontWeight:500,fontFamily:'var(--font-serif)',
              fontSize:20,color:'var(--fg-2)',
            }}>
              Acme Manufacturing &amp; Co.
            </div>
          </div>
          <img
            src="assets/shopify-platinum-partner-black.svg"
            alt="Shopify Platinum Partner"
            decoding="async"
            style={{height:32,width:'auto',display:'block',flexShrink:0,opacity:.92,marginTop:2}}
          />
        </div>

        {/* TOC list */}
        <div style={{display:'flex',flexDirection:'column'}}>
          {[
            {n:'01', t:'Ecommerce Strategy', p:'2 pp'},
            {n:'02', t:'Solution Architecture', p:'2 pp'},
            {n:'03', t:'Data Migration Taxonomy', p:'4 pp'},
            {n:'04', t:'SEO Optimization Strategy', p:'3 pp'},
            {n:'05', t:'Tech Stack & Apps Demo', p:'2 pp'},
            {n:'06', t:'Custom Functionalities', p:'4 pp'},
            {n:'07', t:'ERP Integration Audit', p:'5 pp'},
            {n:'08', t:'UX & Flow Prototyping', p:'5 screens'},
            {n:'09', t:'Stakeholders Workshop', p:'3 sessions'},
            {n:'10', t:'Replatforming Risk Assessment', p:'3 pp'},
          ].map((row,i)=>(
            <div key={row.n} style={{display:'grid',gridTemplateColumns:'auto 1fr auto',gap:14,alignItems:'center',padding:'9px 0',borderTop:i===0?'none':'1px solid var(--line-1)'}}>
              <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--fg-3)'}}>{row.n}</span>
              <span style={{fontSize:14,fontWeight:500,color:'var(--fg-1)'}}>{row.t}</span>
              <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--fg-3)'}}>{row.p}</span>
            </div>
          ))}
        </div>

        <div style={{marginTop:20,paddingTop:14,borderTop:'1px solid var(--uc-black)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--fg-3)'}}>Status: Delivered · Wk 4</span>
          <span style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 10px',background:'var(--uc-signal)',borderRadius:3,fontSize:11,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase'}}>$7,000 fixed</span>
        </div>
      </div>
    </div>
  );
}

window.Hero = Hero;
window.BlueprintArtifact = BlueprintArtifact;
