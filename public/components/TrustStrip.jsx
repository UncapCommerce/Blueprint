// TrustStrip.jsx — Infinite horizontal marquee of customer logos
function TrustStrip() {
  // 6 black-on-light + 2 white-on-dark logos. We render on a dark background
  // and invert the black ones so all read as light marks on dark.
  // On a light background: invert the white-on-dark logos so they render dark.
  const logos = [
    {name:'ULE Group',           src:'assets/logos/ulegroup.svg',          invert:false},
    {name:'Welding Store',       src:'assets/logos/weldingstore.svg',      invert:false},
    {name:'Sign Warehouse',      src:'assets/logos/signwarehouse.svg',     invert:false},
    {name:'Warehouse Lighting',  src:'assets/logos/warehouselighting.svg', invert:false},
    {name:'Uneeda',              src:'assets/logos/uneeda.svg',            invert:false},
    {name:'AgriDrain',           src:'assets/logos/agridrain.svg',         invert:false},
    {name:'E3 Spark Plugs',      src:'assets/logos/e3sparkplugs.svg',      invert:false},
    {name:'Canon',               src:'assets/logos/canon.svg',             invert:false},
    {name:'HTI Materials',       src:'assets/logos/htimaterials.svg',      invert:false},
    {name:'Industry Railway Suppliers', src:'assets/logos/industryrailwaysuppliers.svg', invert:false},
    {name:'Frontier Distributing', src:'assets/logos/frontierdistributing.svg', invert:false},
  ];

  // Duplicate the list so the CSS marquee loops seamlessly.
  const track = [...logos, ...logos];

  return (
    <section style={{
      background:'#fff',
      color:'var(--fg-1)',
      padding:'56px 0',
      borderTop:'1px solid var(--line-1)',
      borderBottom:'1px solid var(--line-1)',
      position:'relative',
      overflow:'hidden',
    }}>
      <div style={{
        maxWidth:1280,margin:'0 auto',padding:'0 32px',
        display:'flex',alignItems:'center',gap:48,
      }}>
        <div style={{
          flexShrink:0,
          fontFamily:'var(--font-mono)',
          fontSize:11,fontWeight:600,letterSpacing:'.18em',
          textTransform:'uppercase',
          color:'var(--fg-3)',
          display:'flex',alignItems:'center',gap:10,
        }}>
          <span style={{width:6,height:6,borderRadius:999,background:'var(--uc-black)'}}/>
          Trusted by
        </div>

        <div className="ts-marquee" style={{
          flex:1,
          position:'relative',
          overflow:'hidden',
          maskImage:'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
          WebkitMaskImage:'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
        }}>
          <div className="ts-track" style={{display:'flex',alignItems:'center',gap:80,width:'max-content'}}>
            {track.map((logo, i)=>(
              <div key={i} title={logo.name} style={{
                flexShrink:0,
                height:64,
                display:'flex',alignItems:'center',justifyContent:'center',
                opacity:.78,
                transition:'opacity .25s var(--ease-out)',
              }}
                onMouseEnter={e=>e.currentTarget.style.opacity='1'}
                onMouseLeave={e=>e.currentTarget.style.opacity='.78'}>
                <img
                  src={logo.src}
                  alt={logo.name}
                  loading="lazy"
                  decoding="async"
                  style={{
                    height:64,width:'auto',display:'block',
                    filter: logo.invert ? 'invert(1)' : 'none',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tsScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ts-track {
          animation: tsScroll 38s linear infinite;
        }
        .ts-marquee:hover .ts-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .ts-track { animation: none; }
        }
      `}</style>
    </section>
  );
}
window.TrustStrip = TrustStrip;
