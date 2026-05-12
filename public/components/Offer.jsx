// Offer.jsx: What $7K actually gets you (responsive)
function Offer() {
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  const hash = window.useHash ? window.useHash() : '';
  const heroErp = window.parseHeroHash ? window.parseHeroHash(hash).erp : '';
  const items = [
    {t:'Ecommerce Optimization', d:'Optimization strategies for performance, retention, and conversion. KPI framework, growth levers, and a roadmap that ties site decisions to revenue outcomes.', icon:'arch'},
    {t:'Data Migration Taxonomy', d:'Product information and enrichment. Customers and orders history. Field-level mappings. Cleanup rules. Content pages.', icon:'data'},
    {t:'SEO Preservation Roadmap', d:'Focus on SEO preservation and optimization for go-live. URL inventory, redirect map, canonical plan, ranking-protection runbook.', icon:'seo'},
    {t:'Apps & Custom Functionality', d:'Every app, every webhook, every custom function. What survives. What gets replaced. What gets killed.', icon:'apps'},
    {t:`${heroErp ? heroErp + ' ' : ''}ERP Integration`, d:'End-to-end ERP systems mapping. Data flows. Identity. Auth. Sync strategy. Every box accounted for.', icon:'price'},
    {t:'UX & Flow Prototyping', d:'Customer journey workflows and user experience designs showing exactly how your site will look and behave on Shopify.', icon:'prototype'},
    {t:'Stakeholder Workshops', d:'Up to 4 live sessions. Ops, marketing, eng, leadership. Every question on the table answered.', icon:'work'},
    {t:'Replatforming Risk Mitigation', d:'Every known unknown surfaced before kickoff. Owned. Mitigated. Documented.', icon:'risk'},
  ];
  return (
    <section id="offer" style={{background:'#fff',padding: isMobile ? '64px 20px' : '120px 32px',scrollMarginTop:80}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1fr',gap: isMobile ? 28 : 80,alignItems: isMobile ? 'start' : 'end',marginBottom: isMobile ? 36 : 64}}>
          <div>
            <div className="uc-eyebrow" style={{marginBottom: isMobile ? 12 : 18}}>The offer</div>
            <h2 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize: isMobile ? 'clamp(30px, 8vw, 44px)' : 'clamp(40px,4.6vw,76px)',lineHeight: isMobile ? 1.05 : 1.0,letterSpacing:'-.035em',color:'var(--fg-1)',margin:'0 0 14px'}}>
              {isMobile ? 'What $7K actually gets you.' : <React.Fragment>What $7K actually<br/>gets you.</React.Fragment>}
            </h2>
            <p style={{fontFamily:'var(--font-serif)',fontStyle:'italic',fontWeight:500,fontSize: isMobile ? 'clamp(17px, 4.6vw, 22px)' : 'clamp(22px,2vw,30px)',lineHeight:1.3,color:'var(--fg-2)',margin:0,letterSpacing:'-.01em'}}>
              Full consultation. Solution deep-dive. A complete migration playbook, not a slide deck.
            </p>
          </div>
          <figure style={{
            margin:0,
            display:'flex',flexDirection:'column',gap: isMobile ? 16 : 20,
            padding: isMobile ? '24px 22px' : '30px 32px',
            background:'var(--uc-cream)',
            border:'1px solid var(--uc-black)',
            borderRadius:5,
            position:'relative',
          }}>
            <span aria-hidden="true" style={{
              fontFamily:'var(--font-display)',fontWeight:800,
              fontSize: isMobile ? 56 : 72,
              lineHeight:.6,
              color:'var(--uc-black)',
              opacity:.18,
              position:'absolute',
              top: isMobile ? 10 : 14,
              left: isMobile ? 14 : 22,
              pointerEvents:'none',
              userSelect:'none',
            }}>“</span>
            <blockquote style={{
              margin:0,
              fontFamily:'var(--font-display)',fontStyle:'italic',fontWeight:500,
              fontSize: isMobile ? 'clamp(17px, 4.4vw, 21px)' : 'clamp(20px, 1.7vw, 25px)',
              lineHeight:1.35,letterSpacing:'-.012em',
              color:'var(--fg-1)',
              paddingTop: isMobile ? 18 : 22,
            }}>
              45 accumulated years of operator experience went into crafting this Blueprint.
            </blockquote>
            <figcaption style={{display:'flex',alignItems:'center',gap:12}}>
              <span style={{
                width:36,height:36,borderRadius:999,background:'var(--uc-black)',color:'#fff',
                display:'inline-flex',alignItems:'center',justifyContent:'center',
                fontFamily:'var(--font-mono)',fontWeight:700,fontSize:13,flexShrink:0,
              }}>RM</span>
              <div style={{display:'flex',flexDirection:'column',gap:1,lineHeight:1.25}}>
                <span style={{fontSize: isMobile ? 14 : 14,fontWeight:600,color:'var(--fg-1)'}}>Ryan Muir</span>
                <span style={{fontSize:12,color:'var(--fg-3)',fontWeight:500}}>Managing Director @ Uncap</span>
              </div>
            </figcaption>
          </figure>
        </div>

        <div style={{display:'grid',gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',gap:0,border:'1px solid var(--uc-black)',borderRadius:5,background:'#fff',overflow:'hidden'}}>
          {items.map((item,i)=>{
            const col = i % 4;
            const row = Math.floor(i / 4);
            const isLast = i === items.length - 1;
            const borderRight = !isMobile && col<3 ? '1px solid var(--line-1)' : 'none';
            const borderTop = !isMobile && row>0 ? '1px solid var(--line-1)' : 'none';
            const borderBottom = isMobile && !isLast ? '1px solid var(--line-1)' : 'none';
            return (
              <div key={item.t} style={{
                padding: isMobile ? '22px' : '28px',
                borderRight, borderTop, borderBottom,
                display:'flex',flexDirection:'column',gap:12,
                minHeight: isMobile ? 'auto' : 200,
              }}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <CheckSquare/>
                  <h3 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize: isMobile ? 16 : 17,letterSpacing:'-.015em',margin:0,color:'var(--fg-1)',lineHeight:1.2}}>{item.t}</h3>
                </div>
                <p style={{fontSize: isMobile ? 14 : 13,lineHeight:1.55,color:'var(--fg-2)',margin:0}}>{item.d}</p>
              </div>
            );
          })}
        </div>

        <div style={{marginTop: isMobile ? 24 : 32,display:'flex',gap: isMobile ? 12 : 14,alignItems: isMobile ? 'stretch' : 'center',flexDirection: isMobile ? 'column' : 'row',flexWrap:'wrap'}}>
          <a href={`/build${hash}`} className="uc-btn b-primary" style={isMobile ? {width:'100%',justifyContent:'center',padding:'16px 24px',fontSize:16} : null}>Start the Blueprint <span>→</span></a>
          <span style={{fontSize:13,color:'var(--fg-3)',textAlign: isMobile ? 'center' : 'left'}}>Delivered in 4 weeks. Yours to keep, with us or without.</span>
        </div>
      </div>
    </section>
  );
}
function CheckSquare(){
  return (
    <span style={{width:22,height:22,borderRadius:3,background:'var(--uc-black)',display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.2L4.8 8.5L9.5 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </span>
  );
}
window.Offer = Offer;
