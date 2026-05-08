// Header.jsx: Sticky cream header with section-scroll nav
function Header() {
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
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
      padding: isMobile ? '8px 14px 0' : '16px 32px 0',
      boxSizing:'content-box',
    }}>
      <div style={{
        maxWidth:1280,margin:'0 auto',
        background:'rgba(242,239,231,0.85)',
        backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',
        border:'1px solid var(--line-1)',
        borderRadius:5,
        padding: isMobile ? '10px 10px 10px 14px' : '12px 16px 12px 20px',
        display:'flex',alignItems:'center',justifyContent:'space-between',
        gap: isMobile ? 8 : 24,
        boxShadow:'var(--shadow-1)',
      }}>
        {/* Brand */}
        <a href="#top"
           onClick={(e)=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'})}}
           style={{display:'flex',alignItems:'center',gap: isMobile ? 8 : 14,textDecoration:'none',minWidth:0,flexShrink:0}}>
          <img
            src="assets/uncap-logo-black.svg"
            alt="uncap"
            width="84" height="22"
            fetchpriority="high"
            decoding="async"
            style={{height: isMobile ? 22 : 22, width:'auto', display:'block'}}
          />
          <span style={{height: isMobile ? 16 : 16, width:1, background:'var(--line-1)', flexShrink:0}}/>
          <span style={{
            fontFamily:'var(--font-display)',fontWeight:600,
            fontSize: isMobile ? 14 : 14,
            letterSpacing:'-.01em',color:'var(--fg-1)',whiteSpace:'nowrap',
          }}>Blueprint</span>
        </a>

        {/* Section nav: desktop only */}
        {!isMobile && (
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
                  transition:'background .15s var(--ease-out), color .15s var(--ease-out)',
                }}>{t}</a>
              );
            })}
          </nav>
        )}

        {/* Right cluster: primary CTA */}
        <div style={{display:'flex',alignItems:'center',flexShrink:0}}>
          <a href="/build" className="uc-btn b-primary" style={{
            padding: isMobile ? '10px 14px' : '10px 16px',
            fontSize: isMobile ? 13 : 13,
            whiteSpace:'nowrap',
          }}>
            Start the Blueprint <span>→</span>
          </a>
        </div>
      </div>
    </header>
  );
}
window.Header = Header;
