// Header.jsx — Sticky cream header with section-scroll nav
function Header() {
  const [active, setActive] = React.useState('');
  const links = [
    {id:'problem', t:'Problem'},
    {id:'offer', t:'Deliverables'},
    {id:'math', t:'ROI'},
    {id:'proof', t:'Proof'},
    {id:'process', t:'Process'},
    {id:'faq', t:'FAQ'},
  ];

  React.useEffect(()=>{
    const ids = links.map(l=>l.id);
    const observer = new IntersectionObserver((entries)=>{
      // Pick the entry highest on screen that is intersecting
      const visible = entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    },{rootMargin:'-20% 0px -65% 0px',threshold:0});
    ids.forEach(id=>{ const el=document.getElementById(id); if(el) observer.observe(el); });
    return ()=>observer.disconnect();
  },[]);

  const onNav = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
  };

  return (
    <header style={{
      position:'sticky',top:0,zIndex:50,
      background:'transparent',
      paddingTop:16,
    }}>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'0 32px',boxSizing:'content-box'}}>
        <div style={{
          background:'rgba(242,239,231,0.85)',
          backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',
          border:'1px solid var(--line-1)',
          borderRadius:5,
          padding:'12px 16px 12px 20px',
          display:'flex',alignItems:'center',justifyContent:'space-between',gap:24,
          boxShadow:'var(--shadow-1)'
        }}>
        <a href="#top" onClick={(e)=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'})}} style={{display:'flex',alignItems:'center',gap:14,textDecoration:'none'}}>
          <img src="assets/uncap-logo-black.svg" style={{height:22}} alt="uncap"/>
          <span style={{height:16,width:1,background:'var(--line-1)'}}/>
          <span style={{fontFamily:'var(--font-display)',fontWeight:600,fontSize:14,letterSpacing:'-.01em',color:'var(--fg-1)'}}>Blueprint</span>
        </a>
        <nav style={{display:'flex',gap:2,alignItems:'center'}}>
          {links.map(({id,t})=>{
            const isActive = active===id;
            return (
              <a key={id} href={`#${id}`} onClick={(e)=>onNav(e,id)} style={{
                fontSize:13,fontWeight:isActive?600:500,
                color:isActive?'var(--fg-1)':'var(--fg-2)',
                textDecoration:'none',
                padding:'8px 12px',borderRadius:5,
                background:isActive?'rgba(10,10,10,0.06)':'transparent',
                transition:'background .15s var(--ease-out), color .15s var(--ease-out)'
              }}>{t}</a>
            );
          })}
        </nav>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <a href="/call" style={{fontSize:13,fontWeight:500,color:'var(--fg-2)',textDecoration:'none',padding:'8px 4px'}}>Book a fit call</a>
          <a href="/quiz" className="uc-btn b-primary" style={{padding:'10px 16px',fontSize:13}}>Start the Blueprint <span>→</span></a>
        </div>
        </div>
      </div>
    </header>
  );
}
window.Header = Header;
