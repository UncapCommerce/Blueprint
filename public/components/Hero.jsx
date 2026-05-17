// Hero.jsx: Above-the-fold conversion module (responsive)
// URL hash drives two things independently — see _hooks.jsx for the slug map
// and parser:
//   /#<platform>          → just the H1's "Migrating from X" lead-in
//   /#<erp>               → just the chip's "For businesses with X" line
//   /#<erp>-<platform>    → both (chip + H1)
// When a single segment matches both an ERP and a platform (eg. `netsuite`,
// `sap`), the ERP interpretation wins because the chip is the higher-impact
// targeting signal.
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
  const { erp: heroErp, platform: heroPlatform } = window.parseHeroHash(hash);
  const headlineNode = heroPlatform
    ? (<React.Fragment>Migrating from <PlatformMarker>{heroPlatform} to Shopify?</PlatformMarker> Stop gambling six figures on a migration you can't see coming.</React.Fragment>)
    : `Migrating to Shopify? Stop gambling six figures on a migration you can't see coming.`;
  const chipNode = heroErp
    ? (<React.Fragment>For businesses with <ErpHighlight>{heroErp}</ErpHighlight> at the core.</React.Fragment>)
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
          <span className="uc-pulse" style={{display:'inline-flex',alignItems:'center',gap:6,padding:'3px 8px',background:'var(--uc-signal)',borderRadius:3,fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',flexShrink:0}}>New</span>
          <span style={{fontSize: isMobile ? 12 : 13,fontWeight:500,color:'var(--fg-1)',whiteSpace:'normal',lineHeight:1.3,textAlign: isMobile ? 'center' : 'left'}}>{chipNode}</span>
        </div>

        <div style={{display:'grid',gridTemplateColumns: isMobile ? '1fr' : '1.35fr 1fr',gap: isMobile ? 28 : 80,alignItems: isMobile ? 'start' : 'end'}}>
          <div>
            <h1 style={{fontFamily:'var(--font-hero)',fontWeight:800,fontSize: isMobile ? 'clamp(26px, 7vw, 34px)' : 'clamp(40px, 4.4vw, 64px)',lineHeight: isMobile ? 1.08 : 1.05,letterSpacing:'-.035em',color:'var(--fg-1)',margin: isMobile ? '0 0 16px' : '0 0 28px',textWrap:'balance'}}>
              {headlineNode}
            </h1>
            <p style={{fontFamily:'var(--font-display)',fontStyle:'italic',fontWeight:500,fontSize: isMobile ? 'clamp(16px, 4.4vw, 19px)' : 'clamp(22px, 2vw, 28px)',lineHeight:1.35,letterSpacing:'-.015em',color:'var(--fg-2)',margin: isMobile ? '0 0 24px' : '0 0 40px',maxWidth:640}}>
              Everything you need to migrate to Shopify. Without the guesswork. $7K flat. Yours to keep.
            </p>
            <HeroCta isMobile={isMobile} hash={hash}/>
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
          <BlueprintArtifact isMobile={isMobile} heroErp={heroErp}/>
        </div>
      </div>
    </section>
  );
}

// CTA row: optional company-website input on the left + "Start the Blueprint"
// button on the right. Filling the URL is optional; if the user provides
// something that looks like a domain, we forward it to /build as a `company=`
// query param so the quiz can pre-fill (and skip) the company-website step.
// Empty / non-domain input just falls through to the original /build link.
function HeroCta({isMobile, hash}) {
  const [companyUrl, setCompanyUrl] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const borderColor = focused ? 'var(--uc-black)' : 'var(--line-1)';

  const submit = (e) => {
    e.preventDefault();
    const raw = companyUrl.trim();
    // Light "looks like a domain" check. Quiz step 7 has the strict normalizer
    // for full validation; we just want to avoid forwarding junk through the
    // URL, since that'd send the user to step 7 with a broken pre-fill.
    // Bare-host inputs are prepended with `https://www.` to match the visible
    // input prefix the user just typed against.
    const looksLikeDomain = raw && /\.[a-z]{2,}/i.test(raw);
    let normalized = '';
    if (looksLikeDomain) {
      if (/^https?:\/\//i.test(raw)) normalized = raw;
      else if (/^www\./i.test(raw))  normalized = 'https://' + raw;
      else                           normalized = 'https://www.' + raw;
    }
    const query = normalized ? `?company=${encodeURIComponent(normalized)}` : '';
    window.location.href = `/build${query}${hash}`;
  };

  return (
    <form
      onSubmit={submit}
      style={{
        display:'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 10 : 12,
        alignItems:'stretch',
        maxWidth: 560,
      }}
    >
      <div style={{
        display:'flex',alignItems:'stretch',
        border:`1px solid ${borderColor}`,
        borderRadius:5,
        background:'#fff',
        transition:'border-color .15s var(--ease-out)',
        overflow:'hidden',
        flex: isMobile ? 'none' : 1,
        minWidth:0,
      }}>
        <span aria-hidden="true" style={{
          padding: isMobile ? '14px 0 14px 14px' : '14px 0 14px 16px',
          color:'var(--fg-3)',
          userSelect:'none',
          whiteSpace:'nowrap',
          fontSize: 15,
          fontWeight: 500,
          fontFamily:'var(--font-sans)',
        }}>https://www.</span>
        <input
          type="url"
          value={companyUrl}
          onChange={(e) => setCompanyUrl(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="yourcompany.com"
          autoComplete="url"
          aria-label="Company website"
          style={{
            flex:1,minWidth:0,
            padding: isMobile ? '14px 14px 14px 0' : '14px 16px 14px 0',
            border:'none',
            outline:'none',
            background:'transparent',
            fontSize: 15,
            fontFamily:'var(--font-sans)',
            fontWeight: 500,
            color:'var(--fg-1)',
          }}
        />
      </div>
      <button
        type="submit"
        className="uc-btn b-primary"
        style={isMobile
          ? {width:'100%',justifyContent:'center',padding:'16px 22px',fontSize:16}
          : {whiteSpace:'nowrap'}}
      >
        Start the Blueprint <span>→</span>
      </button>
    </form>
  );
}

// Bold ERP name with a brushed signal-yellow underline beneath it. Two
// overlapping strokes suggest brush texture: a wider, lighter base + a
// crisper top pass. preserveAspectRatio=none stretches both to the ERP name.
function ErpHighlight({children}){
  return (
    <span style={{position:'relative',display:'inline-block',fontWeight:700,whiteSpace:'nowrap',verticalAlign:'baseline'}}>
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 120 12"
        preserveAspectRatio="none"
        style={{position:'absolute',left:-2,right:-2,bottom:-7,width:'calc(100% + 4px)',height:8,pointerEvents:'none',overflow:'visible'}}
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
// Hand-marker highlight rendered as a data-URI background so it wraps with
// the text on narrow viewports (long platform names like "Salesforce Commerce
// Cloud" used to overflow the H1 with the previous absolute-SVG approach).
// The SVG shape itself is an irregular hand-drawn silhouette stretched to fit
// each line via preserveAspectRatio=none; box-decoration-break:clone lets the
// background paint per-line so wrapping never produces one giant blob.
const PLATFORM_MARKER_SVG =
  "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 40' preserveAspectRatio='none'%3E" +
  "%3Cpath d='M3 7 C 45 3 95 11 145 6 S 195 3 197 9 L 196 33 C 158 38 110 31 65 35 S 8 37 4 32 Z' fill='%23E8FF52'/%3E" +
  "%3Cpath d='M6 11 C 60 8 130 14 192 10' stroke='%23E8FF52' stroke-width='2' stroke-linecap='round' fill='none' opacity='0.55'/%3E" +
  "%3C/svg%3E";

function PlatformMarker({children}){
  return (
    <span style={{
      backgroundImage: `url("data:image/svg+xml;utf8,${PLATFORM_MARKER_SVG}")`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100% 100%',
      WebkitBoxDecorationBreak: 'clone',
      boxDecorationBreak: 'clone',
      padding: '0 .12em',
      // Allow wrapping on narrow viewports; box-decoration-break:clone repeats
      // the marker on each line so the hand-drawn shape survives the wrap.
      whiteSpace: 'normal',
    }}>{children}</span>
  );
}

function CheckDot(){
  return (
    <span style={{width:18,height:18,borderRadius:999,background:'var(--uc-black)',display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5.2L4 7.2L8 2.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </span>
  );
}

function BlueprintArtifact({isMobile, heroErp}){
  const m = !!isMobile;
  return (
    <div className={m ? '' : 'uc-artifact'} style={{position:'relative',perspective:1200,marginTop: m ? 4 : 0,marginRight: m ? 0 : 14}}>
      {/* Stacked paper effect: drop on mobile (right offset would clip viewport) */}
      {!m && (
        <React.Fragment>
          <div className="uc-artifact-paper uc-artifact-paper--back" style={{position:'absolute',top:14,left:14,right:-14,bottom:-14,background:'#fff',border:'1px solid var(--uc-black)',borderRadius:5,opacity:.4}}/>
          <div className="uc-artifact-paper uc-artifact-paper--mid"  style={{position:'absolute',top:7,left:7,right:-7,bottom:-7,background:'#fff',border:'1px solid var(--uc-black)',borderRadius:5,opacity:.7}}/>
        </React.Fragment>
      )}
      <div className={m ? '' : 'uc-artifact-front'} style={{position:'relative',background:'#fff',border:'1px solid var(--uc-black)',borderRadius:5,padding: m ? 18 : 28,boxShadow:'var(--shadow-3)'}}>
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
            {n:'07', t:`${heroErp ? heroErp + ' ' : ''}ERP Integration Audit`, p:'5 pp'},
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
            <div style={{display:'flex',alignItems:'center'}}>
              {[
                // Tries to load a real headshot first; if the file isn't in
                // public/assets/team/ yet, falls back to the colored initial
                // bubble. Drop the team photos into that folder and the
                // artifact picks them up with no code change.
                {name:'Jack',    file:'Jack - IMG.png',    tone:'#1f4cd6'},
                {name:'Jo',      file:'Jo - IMG.png',      tone:'#0a6d4a'},
                {name:'Michael', file:'Michael - IMG.png', tone:'#a3531f'},
                {name:'Mike',    file:'Mike - IMG.png',    tone:'#5a3a8a'},
              ].map((person, i) => (
                <TeamAvatar key={person.name} person={person} i={i} m={m}/>
              ))}
            </div>
            <PreparedByName/>
          </div>
          <span style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 10px',background:'var(--uc-signal)',borderRadius:3,fontSize:11,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase'}}>$7,000 fixed</span>
        </div>
      </div>
    </div>
  );
}

// Avatar slot that tries to load /assets/team/<file> first, and renders the
// colored initial bubble when that image is missing. No remote pravatar /
// stock photo fallback — once a real headshot is dropped into the folder it
// takes over with no code change.
function TeamAvatar({person, i, m}){
  const [failed, setFailed] = React.useState(false);
  const baseStyle = {
    width: m ? 22 : 26,
    height: m ? 22 : 26,
    borderRadius: 999,
    border: '2px solid #fff',
    marginLeft: i === 0 ? 0 : -8,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 0 1px rgba(10,10,10,0.04)',
    flexShrink: 0,
  };
  if (failed) {
    return (
      <span
        title={person.name}
        aria-label={person.name}
        style={{
          ...baseStyle,
          background: person.tone,
          color: '#fff',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: m ? 10 : 11,
        }}
      >{person.name[0]}</span>
    );
  }
  return (
    <img
      src={`assets/team/${person.file}`}
      alt={person.name}
      title={person.name}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      style={{
        ...baseStyle,
        objectFit: 'cover',
        background: '#fff',
      }}
    />
  );
}

// Rotates through the team name on the artifact's "Prepared by" label so the
// card never feels static. Phases through Jack → Jo → Michael → Mike on a
// gentle fade-and-rise cross-swap. Pauses for prefers-reduced-motion users by
// just printing the first name.
function PreparedByName(){
  const names = React.useMemo(() => ['Jack', 'Jo', 'Michael', 'Mike'], []);
  const [idx, setIdx] = React.useState(0);
  const [shown, setShown] = React.useState(true);
  React.useEffect(() => {
    if (typeof window !== 'undefined' &&
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const cycle = setInterval(() => {
      setShown(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % names.length);
        setShown(true);
      }, 220);
    }, 2600);
    return () => clearInterval(cycle);
  }, [names.length]);
  return (
    <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--fg-3)',whiteSpace:'nowrap'}}>
      Prepared by{' '}
      <span style={{
        color:'var(--fg-1)',fontWeight:700,
        display:'inline-block',minWidth:'4.4em',
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(-3px)',
        transition:'opacity 220ms var(--ease-out), transform 220ms var(--ease-out)',
      }}>{names[idx]}</span>
    </span>
  );
}

window.Hero = Hero;
window.BlueprintArtifact = BlueprintArtifact;
