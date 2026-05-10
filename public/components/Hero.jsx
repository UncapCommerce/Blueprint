// Hero.jsx: Above-the-fold conversion module (responsive)
// URL hash drives two things independently:
//   /#<platform>          → just the H1's "Migrating from X" lead-in
//   /#<erp>               → just the chip's "For operators running X" line
//   /#<erp>-<platform>    → both (chip + H1)
// Slugs match the quiz's ERP_OPTIONS and PLATFORM_OPTIONS keys. When a single
// segment matches both an ERP and a platform (eg. `netsuite`, `sap`), the ERP
// interpretation wins because the chip is the higher-impact targeting.
const HERO_PLATFORM_BY_HASH = {
  magento:        'Magento',
  bigcommerce:    'BigCommerce',
  woocommerce:    'WooCommerce',
  netsuite:       'NetSuite',
  optimizely:     'Optimizely',
  salesforce:     'Salesforce',
  sap:            'SAP',
  commercetools:  'commercetools',
  vtex:           'VTEX',
  custom:         'a custom platform',
};

const HERO_ERP_BY_HASH = {
  netsuite:   'NetSuite',
  msdyn:      'Microsoft Dynamics',
  acumatica:  'Acumatica',
  epicor:     'Epicor',
  sage:       'Sage',
  sap:        'SAP',
  infor:      'Infor',
  odoo:       'Odoo',
};

function parseHeroHash(raw) {
  const slug = (raw || '').replace(/^#/, '').toLowerCase();
  if (!slug) return { erp: '', platform: '' };
  const dash = slug.indexOf('-');
  if (dash > 0) {
    return {
      erp:      HERO_ERP_BY_HASH[slug.slice(0, dash)] || '',
      platform: HERO_PLATFORM_BY_HASH[slug.slice(dash + 1)] || '',
    };
  }
  if (HERO_ERP_BY_HASH[slug])      return { erp: HERO_ERP_BY_HASH[slug], platform: '' };
  if (HERO_PLATFORM_BY_HASH[slug]) return { erp: '', platform: HERO_PLATFORM_BY_HASH[slug] };
  return { erp: '', platform: '' };
}

function Hero() {
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  // Re-render on hash changes so deep links like /#magento update the H1
  // without a full reload (e.g. when a CTA links between #anchors).
  const [hash, setHash] = React.useState(() =>
    typeof window !== 'undefined' ? window.location.hash || '' : ''
  );
  React.useEffect(() => {
    const onHash = () => setHash(window.location.hash || '');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const { erp: heroErp, platform: heroPlatform } = parseHeroHash(hash);
  const headlineNode = heroPlatform
    ? (<React.Fragment>Migrating from <PlatformMarker>{heroPlatform} to Shopify</PlatformMarker>? Stop gambling six figures on a migration you can't see coming.</React.Fragment>)
    : `Migrating to Shopify? Stop gambling six figures on a migration you can't see coming.`;
  const chipNode = heroErp
    ? (<React.Fragment>For operators running <ErpHighlight>{heroErp}</ErpHighlight>.</React.Fragment>)
    : `Built for operators who've been burned before.`;
  return (
    <section style={{background:'var(--uc-cream)',padding: isMobile ? '32px 18px 56px' : '72px 32px 96px',position:'relative',overflow:'hidden'}}>
      {!isMobile && (
        <div style={{position:'absolute',inset:0,opacity:.5,pointerEvents:'none'}}>
          <img src="assets/bg-vector-2.svg" style={{position:'absolute',right:-200,top:-100,width:900,opacity:.35}} alt="" loading="lazy" decoding="async"/>
        </div>
      )}
      <div style={{maxWidth:1280,margin:'0 auto',position:'relative',zIndex:1}}>
        {/* Tag chip: full-width banner on mobile so the line never wraps */}
        {/* awkwardly inside a content-sized chip; inline on desktop.        */}
        <div style={{
          display: isMobile ? 'flex' : 'inline-flex',
          alignItems:'center',
          gap: isMobile ? 8 : 10,
          padding: isMobile ? '8px 12px' : '6px 14px 6px 8px',
          border:'1px solid var(--uc-black)', borderRadius:5, background:'#fff',
          marginBottom: isMobile ? 20 : 32,
          width: isMobile ? '100%' : 'auto',
          maxWidth: '100%',
          justifyContent: isMobile ? 'center' : 'flex-start',
        }}>
          <span style={{display:'inline-flex',alignItems:'center',gap:6,padding:'3px 8px',background:'var(--uc-signal)',borderRadius:3,fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',flexShrink:0}}>New</span>
          <span style={{fontSize: isMobile ? 12 : 13,fontWeight:500,color:'var(--fg-1)',whiteSpace:'normal',lineHeight:1.3,textAlign: isMobile ? 'center' : 'left'}}>{chipNode}</span>
        </div>

        <div style={{display:'grid',gridTemplateColumns: isMobile ? '1fr' : '1.35fr 1fr',gap: isMobile ? 28 : 80,alignItems: isMobile ? 'start' : 'end'}}>
          <div>
            <h1 style={{fontFamily:'var(--font-hero)',fontWeight:800,fontSize: isMobile ? 'clamp(30px, 8.5vw, 40px)' : 'clamp(48px, 5.6vw, 88px)',lineHeight: isMobile ? 1.05 : 1.0,letterSpacing:'-.035em',color:'var(--fg-1)',margin: isMobile ? '0 0 16px' : '0 0 28px',textWrap:'balance'}}>
              {headlineNode}
            </h1>
            <p style={{fontFamily:'var(--font-display)',fontStyle:'italic',fontWeight:500,fontSize: isMobile ? 'clamp(16px, 4.4vw, 19px)' : 'clamp(22px, 2vw, 28px)',lineHeight:1.35,letterSpacing:'-.015em',color:'var(--fg-2)',margin: isMobile ? '0 0 24px' : '0 0 40px',maxWidth:640}}>
              Everything you need to migrate to Shopify. Without the guesswork. $7K flat. Yours to keep.
            </p>
            <div style={{display:'flex',gap: isMobile ? 10 : 14,alignItems: isMobile ? 'stretch' : 'center',flexDirection: isMobile ? 'column' : 'row',flexWrap:'wrap'}}>
              <a href="/build" className="uc-btn b-primary" style={isMobile ? {width:'100%',justifyContent:'center',padding:'16px 22px',fontSize:16} : null}>Start the Blueprint <span>→</span></a>
            </div>
            <div style={{display:'flex',gap: isMobile ? 10 : 16,alignItems: isMobile ? 'flex-start' : 'center',marginTop: isMobile ? 24 : 36,flexDirection: isMobile ? 'column' : 'row',flexWrap: isMobile ? 'wrap' : 'nowrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <CheckDot/>
                <span style={{fontSize:13,color:'var(--fg-2)',fontWeight:500,whiteSpace:'nowrap'}}>3 deep dives. 4-week delivery.</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <CheckDot/>
                <span style={{fontSize:13,color:'var(--fg-2)',fontWeight:500,whiteSpace:'nowrap'}}>Fully refundable if not a fit.</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <CheckDot/>
                <span style={{fontSize:13,color:'var(--fg-2)',fontWeight:500,whiteSpace:'nowrap'}}>Credited toward implementation</span>
              </div>
            </div>
          </div>

          {/* Right column: the artifact card */}
          <BlueprintArtifact isMobile={isMobile}/>
        </div>
      </div>
    </section>
  );
}

// Bold ERP name with a brushed signal-yellow underline beneath it. Two
// overlapping strokes suggest brush texture: a wider, lighter base + a
// crisper top pass. preserveAspectRatio=none stretches both to the ERP name.
function ErpHighlight({children}){
  return (
    <span style={{position:'relative',display:'inline-block',fontWeight:700,whiteSpace:'nowrap',paddingBottom:6}}>
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 120 12"
        preserveAspectRatio="none"
        style={{position:'absolute',left:-2,right:-2,bottom:-1,width:'calc(100% + 4px)',height:10,pointerEvents:'none',overflow:'visible'}}
      >
        <path
          d="M2 6.5 C 22 2, 48 10, 68 5.5 S 104 1.5, 118 6"
          stroke="var(--uc-signal)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.55"
        />
        <path
          d="M3 6 C 22 2.8, 48 9.4, 68 5.6 S 104 2.2, 117 5.8"
          stroke="var(--uc-signal)"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

// Hand-marker highlight over the platform name in the H1. Built to read like
// real felt-tip ink on paper:
//   1. The main shape is a single irregular path that overshoots the word and
//      has a hand-pulled top/bottom edge (different curves on each side, with
//      a tail that thins out on the right where the marker lifted).
//   2. Fill is a horizontal stripe pattern, not a flat color, so you see the
//      parallel "fiber tracks" a felt tip leaves in the direction of motion.
//   3. An feTurbulence + feDisplacementMap filter warps every edge with real
//      noise so nothing reads as a perfect curve.
//   4. A second much thinner streak above the main body simulates the dry
//      first contact stroke before ink fully flowed.
//   5. The whole group tilts ~1.6deg so the line never sits horizontal.
function PlatformMarker({children}){
  return (
    <span style={{position:'relative',display:'inline-block',whiteSpace:'nowrap',padding:'0 .14em'}}>
      <svg
        aria-hidden="true"
        viewBox="0 0 220 56"
        preserveAspectRatio="none"
        style={{position:'absolute',left:'-0.22em',right:'-0.22em',top:'-0.06em',width:'calc(100% + 0.44em)',height:'calc(100% + 0.12em)',zIndex:0,pointerEvents:'none'}}
      >
        <defs>
          {/* Horizontal fiber streaks — what a real marker leaves on paper. */}
          <pattern id="uc-marker-fibers" x="0" y="0" width="220" height="3" patternUnits="userSpaceOnUse">
            <rect width="220" height="3" fill="var(--uc-signal)"/>
            <rect x="0" y="0"   width="220" height="0.45" fill="rgba(255,255,255,0.18)"/>
            <rect x="0" y="2.55" width="220" height="0.35" fill="rgba(0,0,0,0.05)"/>
          </pattern>
          {/* Edge roughening: real ink bleed never traces a smooth Bezier. */}
          <filter id="uc-marker-edge" x="-5%" y="-25%" width="110%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.045 0.75" numOctaves="2" seed="13" result="n"/>
            <feDisplacementMap in="SourceGraphic" in2="n" scale="3.6"/>
          </filter>
        </defs>
        <g filter="url(#uc-marker-edge)" transform="rotate(-1.6 110 28)">
          {/* dry first-contact streak — narrow, sits above the main body */}
          <path
            d="M9 13 C 60 11, 130 16, 200 12"
            stroke="var(--uc-signal)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.45"
          />
          {/* main body: irregular hand-pulled rectangle with a thinning right tail */}
          <path
            d="M4 17
               C 55 13, 105 19, 158 15
               S 210 18, 217 21
               L 213 41
               C 188 47, 150 43, 110 45
               S 35 46, 6 41
               Z"
            fill="url(#uc-marker-fibers)"
          />
          {/* overlap pass on the left where the marker pressed harder at start */}
          <path
            d="M5 21 C 25 17, 55 24, 70 20 L 68 38 C 50 41, 22 39, 6 36 Z"
            fill="var(--uc-signal)"
            opacity="0.35"
          />
        </g>
      </svg>
      <span style={{position:'relative',zIndex:1}}>{children}</span>
    </span>
  );
}

function CheckDot(){
  return (
    <span style={{width:18,height:18,borderRadius:999,background:'var(--uc-black)',display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5.2L4 7.2L8 2.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </span>
  );
}

function BlueprintArtifact({isMobile}){
  const m = !!isMobile;
  return (
    <div style={{position:'relative',perspective:1200,marginTop: m ? 4 : 0,marginRight: m ? 0 : 14}}>
      {/* Stacked paper effect: drop on mobile (right offset would clip viewport) */}
      {!m && (
        <React.Fragment>
          <div style={{position:'absolute',top:14,left:14,right:-14,bottom:-14,background:'#fff',border:'1px solid var(--uc-black)',borderRadius:5,opacity:.4}}/>
          <div style={{position:'absolute',top:7,left:7,right:-7,bottom:-7,background:'#fff',border:'1px solid var(--uc-black)',borderRadius:5,opacity:.7}}/>
        </React.Fragment>
      )}
      <div style={{position:'relative',background:'#fff',border:'1px solid var(--uc-black)',borderRadius:5,padding: m ? 18 : 28,boxShadow:'var(--shadow-3)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom: m ? 14 : 20,paddingBottom: m ? 12 : 14,borderBottom:'1px solid var(--line-1)',gap:8}}>
          <div className="uc-eyebrow" style={{color:'var(--fg-1)',fontSize: m ? 11 : 13}}>Blueprint v6.0</div>
          <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--fg-3)'}}>uncap-blueprint.pdf</div>
        </div>
        <div style={{
          display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap: m ? 10 : 14,
          marginBottom: m ? 14 : 18,
        }}>
          <div style={{
            fontFamily:'var(--font-display)',fontWeight:700,
            fontSize: m ? 18 : 22,
            letterSpacing:'-.02em',lineHeight:1.15,color:'var(--fg-1)',minWidth:0,
          }}>
            Uncap Blueprint.
            <div style={{
              marginTop: m ? 4 : 6,
              fontStyle:'italic',fontWeight:500,fontFamily:'var(--font-serif)',
              fontSize: m ? 16 : 20,color:'var(--fg-2)',
              whiteSpace: m ? 'normal' : 'nowrap',
            }}>
              Acme Supply, Inc
            </div>
          </div>
          <img
            src="assets/shopify-platinum-partner-black.svg"
            alt="Shopify Platinum Partner"
            decoding="async"
            style={{height: m ? 24 : 32,width:'auto',display:'block',flexShrink:0,opacity:.92,marginTop:2}}
          />
        </div>

        {/* TOC list */}
        <div style={{display:'flex',flexDirection:'column'}}>
          {[
            {n:'01', t:'Ecommerce Optimization', p:'3 pp'},
            {n:'02', t:'Solution Architecture', p:'2 pp'},
            {n:'03', t:'Data Migration Taxonomy', p:'4 pp'},
            {n:'04', t:'SEO Preservation Roadmap', p:'3 pp'},
            {n:'05', t:'Tech Stack & 3d Party Apps', p:'1 table'},
            {n:'06', t:'Total Cost of Ownership', p:'1 report'},
            {n:'07', t:'ERP Integration Audit', p:'5 pp'},
            {n:'08', t:'UX & Flow Prototyping', p:'5 screens'},
            {n:'09', t:'Stakeholders Workshop', p:'3 sessions'},
            {n:'10', t:'Replatforming Risk Assessment', p:'3 pp'},
          ].map((row,i)=>(
            <div key={row.n} style={{
              display:'grid',
              gridTemplateColumns:'auto minmax(0, 1fr) auto',
              gap: m ? 10 : 14,
              alignItems:'center',
              padding: m ? '7px 0' : '9px 0',
              borderTop: i===0 ? 'none' : '1px solid var(--line-1)',
            }}>
              <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--fg-3)'}}>{row.n}</span>
              <span style={{
                fontSize: m ? 13 : 14,
                fontWeight:500,color:'var(--fg-1)',
                lineHeight:1.3,
                overflow:'hidden',textOverflow:'ellipsis',
              }}>{row.t}</span>
              <span style={{fontFamily:'var(--font-mono)',fontSize: m ? 10 : 11,color:'var(--fg-3)',whiteSpace:'nowrap'}}>{row.p}</span>
            </div>
          ))}
        </div>

        <div style={{marginTop: m ? 14 : 20,paddingTop:14,borderTop:'1px solid var(--uc-black)',display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--fg-3)'}}>Prepared by</span>
            <div style={{display:'flex',alignItems:'center'}}>
              {[
                'https://i.pravatar.cc/80?img=12',
                'https://i.pravatar.cc/80?img=44',
                'https://i.pravatar.cc/80?img=14',
                'https://i.pravatar.cc/80?img=9',
              ].map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: m ? 22 : 26,
                    height: m ? 22 : 26,
                    borderRadius:999,
                    objectFit:'cover',
                    border:'2px solid #fff',
                    marginLeft: i === 0 ? 0 : -8,
                    display:'block',
                  }}
                />
              ))}
            </div>
          </div>
          <span style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 10px',background:'var(--uc-signal)',borderRadius:3,fontSize:11,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase'}}>$7,000 fixed</span>
        </div>
      </div>
    </div>
  );
}

window.Hero = Hero;
window.BlueprintArtifact = BlueprintArtifact;
