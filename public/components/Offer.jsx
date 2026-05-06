// Offer.jsx — What $7K actually gets you
function Offer() {
  const items = [
    {t:'Ecommerce Strategy', d:'Optimization strategies for performance, retention, and conversion. KPI framework, growth levers, and a roadmap that ties site decisions to revenue outcomes.', icon:'arch'},
    {t:'Data Migration Taxonomy', d:'Products, customers, orders, history. Field-level mappings. Cleanup rules. Test cutover protocol.', icon:'data'},
    {t:'SEO Optimisation Autonomy', d:'Focus on SEO preservation and optimization for go-live. URL inventory, redirect map, canonical plan, ranking-protection runbook.', icon:'seo'},
    {t:'Apps & Custom Functionality', d:'Every app, every webhook, every custom function. What survives. What gets replaced. What gets killed.', icon:'apps'},
    {t:'ERP Integration', d:'End-to-end ERP systems mapping. Data flows. Identity. Auth. Sync strategy. Every box accounted for.', icon:'price'},
    {t:'UX & Flow Prototyping', d:'Customer journey workflows and user experience designs showing exactly how your site will look and behave on Shopify.', icon:'prototype'},
    {t:'Stakeholder Workshops', d:'Up to 4 live sessions. Ops, marketing, eng, leadership. Every question on the table answered.', icon:'work'},
    {t:'Replatforming Risk Mitigation', d:'Every known unknown surfaced before kickoff. Owned. Mitigated. Documented.', icon:'risk'},
  ];
  return (
    <section id="offer" style={{background:'#fff',padding:'120px 32px',scrollMarginTop:80}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'1.1fr 1fr',gap:80,alignItems:'end',marginBottom:64}}>
          <div>
            <div className="uc-eyebrow" style={{marginBottom:18}}>The offer</div>
            <h2 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:'clamp(40px,4.6vw,76px)',lineHeight:1.0,letterSpacing:'-.035em',color:'var(--fg-1)',margin:'0 0 14px'}}>
              What $7K actually<br/>gets you.
            </h2>
            <p style={{fontFamily:'var(--font-serif)',fontStyle:'italic',fontWeight:500,fontSize:'clamp(22px,2vw,30px)',lineHeight:1.25,color:'var(--fg-2)',margin:0,letterSpacing:'-.01em'}}>
              Not a slide deck. A complete migration playbook.
            </p>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:14,padding:'24px 28px',background:'var(--uc-cream)',border:'1px solid var(--uc-black)',borderRadius:5}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
              <span style={{fontSize:13,color:'var(--fg-3)',fontWeight:500,letterSpacing:'.04em',textTransform:'uppercase'}}>Fixed price</span>
              <span style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:48,letterSpacing:'-.04em',color:'var(--fg-1)'}}>$7,000</span>
            </div>
            <div style={{height:1,background:'var(--line-1)'}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
              <span style={{fontSize:13,color:'var(--fg-3)',fontWeight:500,letterSpacing:'.04em',textTransform:'uppercase'}}>Delivery</span>
              <span style={{fontSize:18,fontWeight:600,color:'var(--fg-1)'}}>4 weeks</span>
            </div>
            <div style={{height:1,background:'var(--line-1)'}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
              <span style={{fontSize:13,color:'var(--fg-3)',fontWeight:500,letterSpacing:'.04em',textTransform:'uppercase'}}>Ownership</span>
              <span style={{fontSize:18,fontWeight:600,color:'var(--fg-1)'}}>Yours to keep</span>
            </div>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:0,border:'1px solid var(--uc-black)',borderRadius:5,background:'#fff',overflow:'hidden'}}>
          {items.map((item,i)=>{
            const col = i % 4;
            const row = Math.floor(i / 4);
            return (
              <div key={item.t} style={{
                padding:'28px',
                borderRight: col<3 ? '1px solid var(--line-1)' : 'none',
                borderTop: row>0 ? '1px solid var(--line-1)' : 'none',
                display:'flex',flexDirection:'column',gap:12,minHeight:200
              }}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <CheckSquare/>
                  <h3 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:17,letterSpacing:'-.015em',margin:0,color:'var(--fg-1)',lineHeight:1.2}}>{item.t}</h3>
                </div>
                <p style={{fontSize:13,lineHeight:1.55,color:'var(--fg-2)',margin:0}}>{item.d}</p>
              </div>
            );
          })}
        </div>

        <div style={{marginTop:32,display:'flex',gap:14,alignItems:'center',flexWrap:'wrap'}}>
          <a href="/quiz" className="uc-btn b-primary">Start the Blueprint <span>→</span></a>
          <span style={{fontSize:13,color:'var(--fg-3)'}}>Delivered in 4 weeks. Yours to keep — with us, or without.</span>
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
