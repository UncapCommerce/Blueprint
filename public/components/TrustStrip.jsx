// TrustStrip.jsx: Infinite horizontal marquee of customer logos
function TrustStrip() {
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  // All logos are black-on-transparent rectangle marks; the marquee runs on a
  // white background so no inversion is needed. The list is ordered roughly by
  // brand recognition / variety so the marquee never groups two visually-
  // similar marks back-to-back.
  const logos = [
    {name:'Canon',                       src:'assets/logos/canon-rectangle-black.svg'},
    {name:'Kooks',                       src:'assets/logos/kooks-rectangle-black.svg'},
    {name:'TotalBoat',                   src:'assets/logos/TotalBoat-rectangle-black.svg'},
    {name:'ULE Group',                   src:'assets/logos/ULEgroup-rectangle-black.svg'},
    {name:'Vermont Woods',               src:'assets/logos/VermontWoods-rectangle-black.svg'},
    {name:'Welding Store',               src:'assets/logos/WeldingStore-rectangle-black.svg'},
    {name:'Sign Warehouse',              src:'assets/logos/signwarehouse-rectangle-black.svg'},
    {name:'Warehouse Lighting',          src:'assets/logos/WarehouseLighting-rectangle-black.svg'},
    {name:'E3 Spark Plugs',              src:'assets/logos/E3SparkPlugs-rectangle-black.svg'},
    {name:'Genuine Scooter Company',     src:'assets/logos/GenuineScooterCompany-rectangle-black.svg'},
    {name:'AgriDrain',                   src:'assets/logos/agridrain-rectangle-black.svg'},
    {name:'Uneeda',                      src:'assets/logos/uneeda-rectangle-black.svg'},
    {name:'Industry Railway Suppliers',  src:'assets/logos/IndustryRailwaySuppliers-rectangle-black.svg'},
    {name:'Frontier Distributing',       src:'assets/logos/Frontierdistributing-rectangle-black.svg'},
    {name:'MAC',                         src:'assets/logos/MAC-rectangle-black.svg'},
    {name:'Microfiber Wholesale',        src:'assets/logos/MicrofiberWholesale-rectangle-black.svg'},
    {name:'Nail Super Store',            src:'assets/logos/NailSuperStore-rectangle-black.svg'},
    {name:'Norton Supply',               src:'assets/logos/NortonSupply-rectangle-black.svg'},
    {name:'Sanitaire',                   src:'assets/logos/Sanitaire-rectangle-black.svg'},
    {name:'Leki',                        src:'assets/logos/Leki-rectangle-black.svg'},
    {name:'Kodo',                        src:'assets/logos/Kodo-rectangle-black.svg'},
    {name:'KBS',                         src:'assets/logos/kbs-rectangle-black.svg'},
    {name:'Crowd Control Warehouse',     src:'assets/logos/CrowdControlWarehouse-rectangle-black.svg'},
    {name:'Trailer Parts Kingdom',       src:'assets/logos/trailerpartskingdom-rectangle-black.svg'},
    {name:'Thermosoft',                  src:'assets/logos/thermosoft-rectangle-black.svg'},
    {name:'eVacuum',                     src:'assets/logos/evacuum-rectangle-black.svg'},
    {name:'Farmers',                     src:'assets/logos/farmers-rectangle-black.svg'},
    {name:'Jones and Sons',              src:'assets/logos/jonesandsons-rectangle-black.svg'},
    {name:'Phoenix Mecano',              src:'assets/logos/phoenixmecano-rectangle-black.svg'},
    {name:'Blueroot',                    src:'assets/logos/blueroot-rectangle-black.svg'},
    {name:'Dash Designs',                src:'assets/logos/dashdesigns-rectangle-black.svg'},
    {name:'Explore Industries',          src:'assets/logos/ExploreIndustries-rectangle-black.svg'},
    {name:'Greatlakes Biosystem',        src:'assets/logos/GreatlakesBiosystem-rectangle-black.svg'},
    {name:'EEA',                         src:'assets/logos/EEA-rectangle-black.svg'},
  ];

  // Duplicate the list so the CSS marquee loops seamlessly.
  const track = [...logos, ...logos];

  return (
    <section style={{
      background:'#fff',
      color:'var(--fg-1)',
      padding: isMobile ? '32px 0 36px' : '56px 0',
      borderTop:'1px solid var(--line-1)',
      borderBottom:'1px solid var(--line-1)',
      position:'relative',
      overflow:'hidden',
    }}>
      <div data-reveal="slide-right" style={{
        maxWidth:1280,margin:'0 auto',
        padding: isMobile ? '0 20px' : '0 32px',
        display:'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? 18 : 48,
      }}>
        <div style={{
          flexShrink:0,
          fontFamily:'var(--font-mono)',
          fontSize:11,fontWeight:600,letterSpacing:'.18em',
          textTransform:'uppercase',
          color:'var(--fg-3)',
          display:'flex',alignItems:'center',gap:10,
          justifyContent: isMobile ? 'center' : 'flex-start',
        }}>
          <span style={{width:6,height:6,borderRadius:999,background:'var(--uc-black)'}}/>
          Trusted by
        </div>

        <div className="ts-marquee" style={{
          flex:1,
          position:'relative',
          overflow:'hidden',
          minWidth:0,
          maskImage:'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
          WebkitMaskImage:'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
        }}>
          <div className="ts-track" style={{display:'flex',alignItems:'center',gap: isMobile ? 28 : 44,width:'max-content'}}>
            {track.map((logo, i)=>(
              <div key={i} title={logo.name} style={{
                flexShrink:0,
                height: isMobile ? 36 : 44,
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
                    height: isMobile ? 36 : 44,width:'auto',display:'block',
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
          animation: tsScroll 70s linear infinite;
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
