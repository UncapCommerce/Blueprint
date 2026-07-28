// Posters.jsx — Six full-viewport poster compositions.
// Each section is min-height: 100vh and treats type as the subject.
// Cream / black alternation. Lime as a single accent per page.
// A right-rail jump-nav shows page position.

function PageMark({ n, label, dark, total = 11, noNumber }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 12,
      fontFamily: 'var(--font-mono)',
      fontSize: 11, letterSpacing: 0,
      color: dark ? 'var(--uc-stone-500)' : 'var(--fg-3)'
    }}>
      {!noNumber && (
        <span style={{ color: dark ? 'var(--uc-paper)' : 'var(--fg-1)', fontWeight: 700 }}>
          {String(n).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      )}
      {!noNumber && (
        <span style={{
          width: 40, height: 1,
          background: dark ? '#2B2B2B' : 'var(--line-1)'
        }}/>
      )}
      <span style={{
        textTransform: 'uppercase', letterSpacing: '0.18em',
        fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10,
        color: dark ? 'var(--uc-paper)' : 'var(--fg-1)'
      }}>{label}</span>
    </div>
  );
}
window.PageMark = PageMark;

// ─── 01 COVER ─────────────────────────────────────────────────────────────
function P1Cover() {
  const [r, setR] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setR(true), 80); return () => clearTimeout(t); }, []);
  return (
    <section data-poster="1" style={{
      background: 'var(--uc-cream)',
      minHeight: '100vh',
      padding: '32px 32px 32px',
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Brand bg vector */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'rgba(10,10,10,0.05)',
        WebkitMaskImage: `url(${window.__resources.bgVector1})`,
        maskImage: `url(${window.__resources.bgVector1})`,
        WebkitMaskSize: 'cover', maskSize: 'cover',
        WebkitMaskPosition: 'center', maskPosition: 'center',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat'
      }}/>
      {/* TOP rail */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20,
        borderBottom: '1px solid var(--line-1)'
      }}>
        <PageMark n={1} label="Cover"/>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--fg-3)', letterSpacing: 0
        }}>UNCAP · VOL XIII · SPRING 2026</div>
      </div>

      {/* Hero composition — type takes the page */}
      <div style={{
        flex: 1, position: 'relative',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        paddingTop: 'clamp(40px, 6vh, 80px)',
        paddingBottom: 'clamp(40px, 6vh, 80px)'
      }}>
        <h1 style={{
          margin: 0,
          fontFamily: 'var(--font-hero)',
          fontWeight: 700,
          color: 'var(--fg-1)',
          letterSpacing: '-0.055em'
        }}>
          <span className={`uc-rise ${r ? 'in' : ''}`} style={{
            display: 'block',
            fontSize: 'clamp(80px, 16vw, 280px)',
            lineHeight: 0.82
          }}>
            Uncap
          </span>
          <span className={`uc-rise ${r ? 'in' : ''}`} style={{
            display: 'block',
            fontSize: 'clamp(80px, 16vw, 280px)',
            lineHeight: 0.82,
            paddingLeft: 'clamp(40px, 8vw, 180px)',
            transitionDelay: '90ms'
          }}>
            Commerce.
          </span>
          <span className={`uc-rise ${r ? 'in' : ''}`} style={{
            display: 'block',
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            fontSize: 'clamp(80px, 16vw, 280px)',
            letterSpacing: '-0.055em',
            lineHeight: 0.82,
            paddingLeft: 'clamp(80px, 16vw, 360px)',
            transitionDelay: '200ms',
            marginTop: 0
          }}>
            Unified.
          </span>
        </h1>

        {/* Floating annotation */}
        <div style={{
          position: 'absolute',
          right: 0, top: '20%',
          width: 1, height: 'clamp(120px, 16vh, 220px)',
          background: 'var(--uc-signal)'
        }}/>
        <div style={{
          position: 'absolute',
          right: 12, top: '38%',
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: 'var(--fg-3)', letterSpacing: '0.16em',
          writingMode: 'vertical-rl', textOrientation: 'mixed',
          transform: 'rotate(180deg)'
        }}>SHOPIFY · SINCE 2013 · 380+ PROJECTS</div>
      </div>

      {/* BOTTOM rail */}
      <div style={{
        paddingTop: 24,
        borderTop: '1px solid var(--line-1)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 460px) minmax(0, 1fr)',
        gap: 32, alignItems: 'center'
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(14px, 1.1vw, 17px)',
          fontWeight: 400, lineHeight: 1.4,
          color: 'var(--fg-2)',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          The Shopify Platinum Partner behind hundreds of operator-led brands, manufacturers, and distributors uncapping growth across B2B and B2C.
        </div>

        {/* Client logo slider */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          paddingLeft: 32,
          borderLeft: '1px solid var(--line-1)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 40px, #000 calc(100% - 40px), transparent 100%)',
          maskImage: 'linear-gradient(90deg, transparent 0, #000 40px, #000 calc(100% - 40px), transparent 100%)'
        }}>
          <div style={{
            display: 'flex', gap: 56, alignItems: 'center',
            animation: 'uc-marquee 60s linear infinite',
            whiteSpace: 'nowrap', width: 'max-content'
          }}>
            {[...COVER_CLIENTS, ...COVER_CLIENTS].map((c, i) => (
              <span key={i} style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700, fontSize: 20,
                color: 'var(--uc-stone-700)',
                letterSpacing: '0.04em'
              }}>{c}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const COVER_CLIENTS = [
  'ULE GROUP', 'AGRI DRAIN', 'TOTALBOAT', 'KOOKS',
  'WELDINGSTORE', 'SIGNWAREHOUSE', 'VOSGES', 'PAWSTRUCK',
  'AJINOMOTO', 'LEKI', 'CANON', 'GINKGO'
];

// ─── 02 DUCT TAPE — STATEMENT ────────────────────────────────────────────
function P2DuctTape() {
  return (
    <section data-poster="2" style={{
      background: 'var(--uc-black)',
      color: 'var(--uc-paper)',
      minHeight: '100vh',
      padding: '32px 32px 32px',
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Brand bg vector */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'rgba(255,255,255,0.04)',
        WebkitMaskImage: `url(${window.__resources.bgVector3})`,
        maskImage: `url(${window.__resources.bgVector3})`,
        WebkitMaskSize: 'cover', maskSize: 'cover',
        WebkitMaskPosition: 'center', maskPosition: 'center',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat'
      }}/>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20,
        borderBottom: '1px solid #1F1F1F'
      }}>
        <PageMark n={2} label="The reality" dark/>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--uc-stone-500)', letterSpacing: 0
        }}>STATUS · PRE-UNIFY</div>
      </div>

      <div style={{
        flex: 1, position: 'relative',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        gap: 32, paddingTop: 56, paddingBottom: 56
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: 'clamp(22px, 2.4vw, 36px)',
          letterSpacing: '-0.018em',
          lineHeight: 1.2,
          color: 'var(--uc-stone-300)',
          maxWidth: 760
        }}>
          Most operations still run on
        </div>

        <h2 style={{
          margin: 0,
          fontFamily: 'var(--font-hero)',
          fontWeight: 800,
          fontSize: 'clamp(100px, 22vw, 380px)',
          letterSpacing: '-0.06em',
          lineHeight: 0.82,
          color: 'var(--uc-paper)'
        }}>
          duct tape.
        </h2>

        <div style={{
          maxWidth: 720,
          fontFamily: 'var(--font-serif)', fontWeight: 400,
          fontSize: 'clamp(22px, 2vw, 28px)',
          letterSpacing: '-0.012em',
          lineHeight: 1.35,
          color: 'var(--uc-stone-300)',
          marginTop: 8
        }}>
          Aging storefronts. Spreadsheets running inventory. Quote requests
          buried in inboxes. ERPs that don't talk to anything else.
          <span style={{ color: 'var(--uc-paper)' }}> Operators were left to make do.</span>
        </div>
      </div>

      {/* Duct tape — photoreal v2: woven crepe, ragged tears, light press */}
      <svg
        aria-hidden="true"
        viewBox="0 0 220 60"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          right: 'clamp(40px, 6vw, 110px)',
          top: 'calc(54% - 160px)',
          width: 'clamp(80px, 9vw, 130px)',
          height: 'clamp(38px, 4.6vw, 58px)',
          transform: 'rotate(-45deg)',
          transformOrigin: '50% 50%',
          filter: 'drop-shadow(1.5px 3px 2px rgba(0,0,0,0.55)) drop-shadow(0 10px 14px rgba(0,0,0,0.32))',
          zIndex: 3,
          pointerEvents: 'none'
        }}>
        <defs>
          {/* Warm silver-grey base with slight yellow undertone (real cloth tape) */}
          <linearGradient id="dt5base" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#A8A293"/>
            <stop offset="40%"  stopColor="#928D7C"/>
            <stop offset="100%" stopColor="#5F5B4E"/>
          </linearGradient>
          {/* Soft top-rim sheen */}
          <linearGradient id="dt5rim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(255,250,235,0.45)"/>
            <stop offset="100%" stopColor="rgba(255,250,235,0)"/>
          </linearGradient>
          {/* Cross-pattern weave — vertical warp + horizontal weft */}
          <pattern id="dt5warp" patternUnits="userSpaceOnUse" width="1.6" height="3">
            <line x1="0"   y1="0" x2="0"   y2="3" stroke="rgba(0,0,0,0.42)" strokeWidth="0.4"/>
            <line x1="0.8" y1="0" x2="0.8" y2="3" stroke="rgba(255,255,255,0.18)" strokeWidth="0.32"/>
          </pattern>
          <pattern id="dt5weft" patternUnits="userSpaceOnUse" width="4" height="2">
            <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(0,0,0,0.16)" strokeWidth="0.32"/>
            <line x1="0" y1="1" x2="4" y2="1" stroke="rgba(255,255,255,0.08)" strokeWidth="0.22"/>
          </pattern>
          {/* Fine fiber noise */}
          <filter id="dt5fiber" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="2.4 3.6" numOctaves="2" seed="41"/>
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.36 0"/>
            <feComposite in2="SourceGraphic" operator="in"/>
          </filter>
          {/* Adhesive halo */}
          <filter id="dt5adh" x="-15%" y="-30%" width="130%" height="160%">
            <feGaussianBlur stdDeviation="1.2"/>
          </filter>
          <clipPath id="dt5clip">
            {/* Ragged tape body — torn fiber ends top & bottom */}
            <path d="M 6 13 L 14 9 L 22 14 L 32 8 L 44 14 L 58 9 L 74 15 L 90 9 L 108 15 L 126 9 L 144 15 L 162 9 L 180 14 L 196 9 L 212 14
                     L 213 47 L 200 51 L 184 47 L 168 51 L 152 47 L 134 51 L 116 47 L 98 51 L 80 47 L 64 51 L 48 47 L 32 51 L 18 47 L 6 51 Z"/>
          </clipPath>
        </defs>

        {/* Soft adhesive halo */}
        <path d="M 4 10 L 214 9 L 215 51 L 4 52 Z" fill="rgba(70,62,50,0.42)" filter="url(#dt5adh)"/>

        {/* Body */}
        <path d="M 6 13 L 14 9 L 22 14 L 32 8 L 44 14 L 58 9 L 74 15 L 90 9 L 108 15 L 126 9 L 144 15 L 162 9 L 180 14 L 196 9 L 212 14
                 L 213 47 L 200 51 L 184 47 L 168 51 L 152 47 L 134 51 L 116 47 L 98 51 L 80 47 L 64 51 L 48 47 L 32 51 L 18 47 L 6 51 Z"
              fill="url(#dt5base)"/>

        {/* Cross weave */}
        <rect x="0" y="0" width="220" height="60" fill="url(#dt5warp)" clipPath="url(#dt5clip)" opacity="0.95"/>
        <rect x="0" y="0" width="220" height="60" fill="url(#dt5weft)" clipPath="url(#dt5clip)" opacity="0.85"/>

        {/* Fiber grain */}
        <rect x="0" y="0" width="220" height="60" filter="url(#dt5fiber)" clipPath="url(#dt5clip)" opacity="0.92"/>

        {/* Top-rim subtle sheen (no heavy mid-band) */}
        <path d="M 8 12 L 212 11 L 212 18 L 8 19 Z" fill="url(#dt5rim)" clipPath="url(#dt5clip)" opacity="0.7"/>

        {/* Hairline scratches */}
        <path d="M 14 22 Q 110 20 206 23" stroke="rgba(0,0,0,0.28)" strokeWidth="0.42" fill="none" clipPath="url(#dt5clip)"/>
        <path d="M 16 32 Q 110 31 206 33" stroke="rgba(255,255,255,0.14)" strokeWidth="0.38" fill="none" clipPath="url(#dt5clip)"/>
        <path d="M 18 40 Q 110 42 206 39" stroke="rgba(0,0,0,0.30)" strokeWidth="0.4" fill="none" clipPath="url(#dt5clip)"/>

        {/* Subtle press wrinkles */}
        <path d="M 72 12 C 76 24, 76 36, 72 50" stroke="rgba(0,0,0,0.22)" strokeWidth="0.5" fill="none" clipPath="url(#dt5clip)"/>
        <path d="M 70 12 C 74 24, 74 36, 70 50" stroke="rgba(255,255,255,0.12)" strokeWidth="0.32" fill="none" clipPath="url(#dt5clip)"/>
        <path d="M 154 12 C 158 24, 158 36, 154 50" stroke="rgba(0,0,0,0.18)" strokeWidth="0.42" fill="none" clipPath="url(#dt5clip)"/>

        {/* Torn fiber strands at both ends */}
        <g stroke="rgba(220,214,196,0.85)" strokeWidth="0.45" strokeLinecap="round" fill="none">
          <path d="M 6 14 L 1 14"/>
          <path d="M 6 20 L 0 21"/>
          <path d="M 6 28 L 0 28"/>
          <path d="M 6 36 L 1 38"/>
          <path d="M 6 46 L 1 48"/>
          <path d="M 212 14 L 217 12"/>
          <path d="M 212 22 L 218 22"/>
          <path d="M 212 30 L 218 30"/>
          <path d="M 212 38 L 217 39"/>
          <path d="M 212 46 L 217 48"/>
        </g>
        <g stroke="rgba(0,0,0,0.32)" strokeWidth="0.36" strokeLinecap="round" fill="none">
          <path d="M 6 18 L 2 19"/>
          <path d="M 6 32 L 1 33"/>
          <path d="M 6 42 L 1 43"/>
          <path d="M 212 18 L 217 17"/>
          <path d="M 212 34 L 217 34"/>
          <path d="M 212 42 L 217 44"/>
        </g>

        {/* Dust */}
        <g fill="rgba(0,0,0,0.34)">
          <circle cx="36" cy="22" r="0.35"/>
          <circle cx="108" cy="34" r="0.3"/>
          <circle cx="178" cy="24" r="0.35"/>
        </g>
        <g fill="rgba(255,255,255,0.28)">
          <circle cx="56" cy="18" r="0.28"/>
          <circle cx="132" cy="30" r="0.3"/>
        </g>
      </svg>

      <div style={{
        paddingTop: 24,
        borderTop: '1px solid #1F1F1F',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'var(--uc-stone-500)', letterSpacing: 0
      }}>
        <span>↳ FILED · 380+ ENGAGEMENTS</span>
        <span>UC.GAP-01</span>
      </div>
    </section>
  );
}

// ─── 03 DIRECTORY ─────────────────────────────────────────────────────────
function P3Directory() {
  const solutions = [
    { n: '01', name: 'Uncap Blueprint', out: 'A real plan before you commit to a build.' },
    { n: '02', name: 'Uncap Commerce',  out: 'A Shopify launch that actually launches.' },
    { n: '03', name: 'Uncap Growth',    out: 'A store that gets better every month.' }
  ];
  const products = [
    { name: 'Uncap Connect',      cat: 'Integration', icon: 'connect'  },
    { name: 'Uncap Quotes',       cat: 'Quoting',     icon: 'quotes'   },
    { name: 'Uncap DealRoom',     cat: 'Sales',       icon: 'dealroom' },
    { name: 'Uncap Garage',       cat: 'Fitment',     icon: 'garage'   },
    { name: 'Uncap PartsDiagram', cat: 'Discovery',   icon: 'parts'    },
    { name: 'Uncap Portal',       cat: 'B2B',         icon: 'portal'   }
  ];

  return (
    <section data-poster="7" style={{
      background: 'var(--uc-cream)',
      minHeight: '100vh',
      padding: '32px 32px 32px',
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      borderTop: '1px solid var(--line-1)'
    }}>
      {/* Brand bg vector */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'rgba(255,255,255,0.04)',
        WebkitMaskImage: `url(${window.__resources.bgVector1})`,
        maskImage: `url(${window.__resources.bgVector1})`,
        WebkitMaskSize: 'cover', maskSize: 'cover',
        WebkitMaskPosition: 'center', maskPosition: 'center',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat'
      }}/>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20,
        borderBottom: '1px solid var(--line-1)'
      }}>
        <PageMark n={4} label="What's on offer"/>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--fg-3)', letterSpacing: 0
        }}>DIRECTORY · 03 + 06</div>
      </div>

      <div style={{
        flex: 1, paddingTop: 56, paddingBottom: 40,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.1fr) 1px minmax(0, 1fr)',
        gap: 48
      }}>
        {/* SOLUTIONS column */}
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            color: 'var(--fg-3)', letterSpacing: '0.16em',
            textTransform: 'uppercase', marginBottom: 32
          }}>
            <span style={{ color: 'var(--uc-signal)', background: 'var(--uc-black)', padding: '2px 6px', marginRight: 8 }}>·</span>
            Solutions · A team since 2013
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' }}>
            {solutions.map(s => (
              <li key={s.n} style={{
                padding: '28px 0',
                borderBottom: '1px solid var(--line-1)',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 140px) minmax(0, 1fr)',
                gap: 24, alignItems: 'center'
              }}>
                <span style={{
                  fontFamily: 'var(--font-hero)',
                  fontWeight: 800,
                  fontSize: 'clamp(80px, 9vw, 140px)',
                  letterSpacing: '-0.06em',
                  lineHeight: 0.85,
                  color: 'transparent',
                  WebkitTextStroke: '1px var(--line-1)',
                  userSelect: 'none'
                }}>{s.n}</span>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-hero)',
                    fontWeight: 700,
                    fontSize: 'clamp(32px, 4.4vw, 64px)',
                    letterSpacing: '-0.035em',
                    lineHeight: 1.0,
                    color: 'var(--fg-1)',
                    marginBottom: 8
                  }}>{s.name}</div>
                  <div style={{
                    fontFamily: 'var(--font-serif)', fontWeight: 400,
                    fontSize: 'clamp(15px, 1.3vw, 19px)',
                    lineHeight: 1.35, letterSpacing: '-0.005em',
                    color: 'var(--fg-2)'
                  }}>{s.out}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* divider */}
        <div style={{ background: 'var(--line-1)' }}/>

        {/* PRODUCTS column */}
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            color: 'var(--fg-3)', letterSpacing: '0.16em',
            textTransform: 'uppercase', marginBottom: 32
          }}>
            <span style={{ color: 'var(--uc-signal)', background: 'var(--uc-black)', padding: '2px 6px', marginRight: 8 }}>·</span>
            Products · All Shopify-native
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {products.map(p => (
              <li key={p.name} style={{
                padding: '14px 0',
                borderBottom: '1px solid var(--line-1)',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 56px) minmax(0, 1fr) minmax(0, auto)',
                gap: 18, alignItems: 'center'
              }}>
                {/* Black abstract icon */}
                <span aria-hidden="true" style={{
                  width: 44, height: 44,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--uc-black)', flexShrink: 0
                }}>
                  <AppIcon kind={p.icon}/>
                </span>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 'clamp(20px, 2.2vw, 30px)',
                  letterSpacing: '-0.022em',
                  color: 'var(--fg-1)'
                }}>{p.name}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  color: 'var(--fg-3)', letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}>{p.cat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{
        paddingTop: 24,
        borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16
      }}>
        <div style={{
          fontFamily: 'var(--font-serif)', fontWeight: 400,
          fontSize: 'clamp(15px, 1.3vw, 19px)',
          color: 'var(--fg-2)'
        }}>Each one stands alone. Together, they compound.</div>
        <a href="#" className="uc-link">
          Open the full catalog <span>→</span>
        </a>
      </div>
    </section>
  );
}

// ─── 04 NUMBERS ───────────────────────────────────────────────────────────
function P4Numbers() {
  const stats = [
    { v: '6', suffix: '×', l: 'lift in online sales after migration', d: 'Median · post-launch · 90d window',
      cite: '“We shipped what they pitched. Numbers showed up in the first quarter.”',
      who: 'Karen Whitmore · COO, Agri Drain' },
    { v: '14', suffix: 'h', l: 'returned to the sales team weekly', d: 'Per team · across active engagements',
      cite: '“My reps stopped re-keying orders. That alone paid for the build.”',
      who: 'Daniel Mendoza · VP Digital, ULE Group' },
    { v: '38', suffix: '%', l: 'lower total cost of ownership',     d: 'Vs prior commerce stack · trailing 12mo',
      cite: '“One stack, one partner. We cut three vendors and gained capability.”',
      who: 'Lena Park · President, TotalBoat' }
  ];

  return (
    <section data-poster="4" style={{
      background: 'var(--uc-black)',
      color: 'var(--uc-paper)',
      minHeight: '100vh',
      padding: '32px 32px 32px',
      position: 'relative',
      display: 'flex', flexDirection: 'column'
    }}>
      {/* Brand bg vector */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'rgba(10,10,10,0.05)',
        WebkitMaskImage: `url(${window.__resources.bgVector2})`,
        maskImage: `url(${window.__resources.bgVector2})`,
        WebkitMaskSize: 'cover', maskSize: 'cover',
        WebkitMaskPosition: 'center', maskPosition: 'center',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat'
      }}/>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20,
        borderBottom: '1px solid #1F1F1F'
      }}>
        <PageMark n={7} label="By the numbers" dark/>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--uc-stone-500)', letterSpacing: 0
        }}>UC.METRICS · ROLLING 12MO</div>
      </div>

      <div style={{
        flex: 1, paddingTop: 64, paddingBottom: 48,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16, alignItems: 'stretch'
      }}>
        {stats.map((s, i) => (
          <CountUpStat key={i} {...s} index={i}/>
        ))}
      </div>

      <div style={{
        paddingTop: 24,
        borderTop: '1px solid #1F1F1F',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16
      }}>
        <div style={{
          fontFamily: 'var(--font-serif)', fontWeight: 400,
          fontSize: 'clamp(18px, 1.6vw, 24px)',
          color: 'var(--uc-stone-300)',
          maxWidth: 720
        }}>
          We measure what we deliver. <span style={{ color: 'var(--uc-paper)' }}>Then we deliver more of it.</span>
        </div>
        <a href="#" className="uc-link uc-link-light">
          See full archive <span>→</span>
        </a>
      </div>
    </section>
  );
}

function CountUpStat({ v, suffix, l, d, cite, who, index }) {
  const ref = React.useRef(null);
  const [n, setN] = React.useState(0);
  const target = parseInt(v, 10);
  React.useEffect(() => {
    if (!ref.current) return;
    let raf;
    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) {
          const start = performance.now() + index * 120;
          const tick = (t) => {
            const p = Math.max(0, Math.min(1, (t - start) / 1500));
            setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [target, index]);
  return (
    <div ref={ref} style={{
      borderLeft: index > 0 ? '1px solid #1F1F1F' : 'none',
      paddingLeft: index > 0 ? 32 : 0,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      gap: 24
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'var(--uc-stone-500)', letterSpacing: 0
      }}>UC.M-0{index+1}</div>
      <div>
        <div style={{
          fontFamily: 'var(--font-hero)',
          fontWeight: 800,
          fontSize: 'clamp(120px, 18vw, 280px)',
          letterSpacing: '-0.06em',
          lineHeight: 0.84,
          color: 'var(--uc-paper)',
          fontVariantNumeric: 'tabular-nums',
          display: 'flex', alignItems: 'baseline'
        }}>
          {n}
          <span style={{
            color: 'var(--uc-signal)',
            fontSize: '0.5em',
            fontWeight: 700,
            marginLeft: 4
          }}>{suffix}</span>
        </div>
      </div>
      <div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: 'clamp(15px, 1.2vw, 18px)',
          letterSpacing: '-0.008em',
          lineHeight: 1.35,
          color: 'var(--uc-paper)', marginBottom: 18
        }}>{l}</div>
        {cite && (
          <div style={{
            paddingTop: 14, borderTop: '1px solid #1F1F1F',
            display: 'grid',
            gridTemplateColumns: 'auto minmax(0, 1fr)',
            columnGap: 14, alignItems: 'start'
          }}>
            <span aria-hidden="true" style={{
              width: 36, height: 36, borderRadius: 999,
              overflow: 'hidden',
              background: 'var(--uc-stone-700)',
              border: '1px solid #2B2B2B',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <image-slot
                id={`numbers-avatar-${index}`}
                shape="circle"
                placeholder=""
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                fontWeight: 400, fontSize: 'clamp(13px, 1.05vw, 16px)',
                lineHeight: 1.45, letterSpacing: '-0.005em',
                color: 'var(--uc-stone-300)', textWrap: 'pretty'
              }}>{cite}</div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: 'var(--uc-stone-500)', letterSpacing: '0.04em'
              }}>{who}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 05 QUOTE / FIELD ────────────────────────────────────────────────────
function P5Quote() {
  return (
    <section data-poster="8" style={{
      background: 'var(--uc-cream)',
      minHeight: '100vh',
      padding: '32px 32px 32px',
      position: 'relative',
      display: 'flex', flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20,
        borderBottom: '1px solid var(--line-1)'
      }}>
        <PageMark n={8} label="Field"/>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--fg-3)', letterSpacing: 0
        }}>FR.01 · AGRI DRAIN · 2025·Q3</div>
      </div>

      <div style={{
        flex: 1, paddingTop: 64, paddingBottom: 48,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)',
        gap: 'clamp(32px, 5vw, 80px)', alignItems: 'center'
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 13,
            color: 'var(--uc-signal)',
            background: 'var(--uc-black)', padding: '4px 10px',
            display: 'inline-block', borderRadius: 3,
            letterSpacing: '0.06em', marginBottom: 32
          }}>"</div>
          <blockquote style={{
            margin: 0,
            fontFamily: 'var(--font-serif)', fontWeight: 400,
            fontSize: 'clamp(36px, 5.6vw, 96px)',
            letterSpacing: '-0.028em',
            lineHeight: 1.04,
            color: 'var(--fg-1)',
            textWrap: 'balance'
          }}>
            We ran on duct tape for fifteen years. Uncap was the first team that didn't flinch — and shipped something our reps will use{' '}
            <span style={{
              background: 'var(--uc-signal)',
              padding: '0 8px',
              borderRadius: 4
            }}>on a Tuesday.</span>
          </blockquote>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 24,
          paddingLeft: 'clamp(24px, 3vw, 48px)',
          borderLeft: '1px solid var(--line-1)'
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              color: 'var(--fg-3)', letterSpacing: '0.12em',
              textTransform: 'uppercase', marginBottom: 8
            }}>Filed by</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 22, letterSpacing: '-0.018em',
              color: 'var(--fg-1)', marginBottom: 4
            }}>Karen Whitmore</div>
            <div style={{ fontSize: 14, color: 'var(--fg-3)' }}>COO · Agri Drain · Manufacturing</div>
          </div>

          <div style={{
            paddingTop: 24, borderTop: '1px solid var(--line-1)'
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              color: 'var(--fg-3)', letterSpacing: '0.12em',
              textTransform: 'uppercase', marginBottom: 12
            }}>Outcome</div>
            <div style={{
              fontFamily: 'var(--font-hero)', fontWeight: 800,
              fontSize: 'clamp(56px, 6vw, 96px)',
              letterSpacing: '-0.05em', lineHeight: 0.85,
              color: 'var(--fg-1)'
            }}>+312<span style={{ color: 'var(--uc-stone-500)', fontSize: '0.6em' }}>%</span></div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--fg-3)', letterSpacing: 0, marginTop: 8
            }}>dealer order volume · trailing 12mo</div>
          </div>

          <div style={{
            paddingTop: 24, borderTop: '1px solid var(--line-1)'
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              color: 'var(--fg-3)', letterSpacing: '0.12em',
              textTransform: 'uppercase', marginBottom: 10
            }}>Stack deployed</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['Commerce','Connect','DealRoom','Quotes'].map(t => (
                <span key={t} style={{
                  padding: '4px 10px',
                  background: 'var(--uc-paper)',
                  border: '1px solid var(--line-2)',
                  borderRadius: 3,
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  fontWeight: 600, color: 'var(--fg-1)'
                }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        paddingTop: 24,
        borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--fg-3)', letterSpacing: 0
        }}>3 industries · 3 dispatches · full archive</span>
        <a href="#" className="uc-link">Read all field reports <span>→</span></a>
      </div>
    </section>
  );
}

// ─── 06 INITIATE ─────────────────────────────────────────────────────────
function P6Initiate() {
  return (
    <section data-poster="10" style={{
      background: 'var(--uc-black)',
      color: 'var(--uc-paper)',
      minHeight: '100vh',
      padding: '32px 32px 32px',
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20,
        borderBottom: '1px solid #1F1F1F'
      }}>
        <PageMark n={10} label="Initiate" dark/>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--uc-stone-500)', letterSpacing: 0,
          display: 'inline-flex', alignItems: 'center', gap: 8
        }}>
          <span className="uc-pulse" style={{ width: 6, height: 6 }}/>
          READY · BOOKING Q2 2026
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        gap: 48, paddingTop: 56, paddingBottom: 56,
        position: 'relative'
      }}>
        <h2 style={{
          margin: 0, position: 'relative', zIndex: 1,
          fontFamily: 'var(--font-hero)',
          fontWeight: 800,
          fontSize: 'clamp(120px, 22vw, 380px)',
          letterSpacing: '-0.06em',
          lineHeight: 0.82,
          color: 'var(--uc-paper)',
          textAlign: 'center'
        }}>
          Initiate.
        </h2>

        <div style={{
          position: 'relative', zIndex: 1,
          fontFamily: 'var(--font-serif)', fontWeight: 400,
          fontSize: 'clamp(20px, 2vw, 28px)',
          letterSpacing: '-0.012em',
          lineHeight: 1.35,
          color: 'var(--uc-stone-300)',
          maxWidth: 760, margin: '0 auto', textAlign: 'center'
        }}>
          A 45-minute working session with the team that would do the work. We answer in hours, not days.
        </div>

        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 24, flexWrap: 'wrap'
        }}>
          <a href="#" className="uc-btn b-signal" style={{ padding: '20px 30px', fontSize: 17 }}>
            Talk to Our Experts <span>→</span>
          </a>
          <a href="#" className="uc-link uc-link-light" style={{ fontSize: 15 }}>
            Or book a product demo <span>→</span>
          </a>
        </div>
      </div>

      <div style={{
        paddingTop: 24,
        borderTop: '1px solid #1F1F1F',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16
      }}>
        {[
          { k: 'REPLY', v: '24 hrs' },
          { k: 'CALL',  v: '45 min' },
          { k: 'OPEN',  v: 'Q2 2026' }
        ].map((r, i) => (
          <div key={i} style={{
            borderLeft: i > 0 ? '1px solid #1F1F1F' : 'none',
            paddingLeft: i > 0 ? 24 : 0,
            display: 'flex', alignItems: 'baseline', gap: 14
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              color: 'var(--uc-stone-500)', letterSpacing: '0.12em',
              textTransform: 'uppercase'
            }}>{r.k}</span>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 'clamp(18px, 1.6vw, 24px)', letterSpacing: '-0.018em',
              color: 'var(--uc-paper)'
            }}>{r.v}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Right-rail page nav ──────────────────────────────────────────────────
function PagerRail() {
  const [active, setActive] = React.useState(1);
  React.useEffect(() => {
    const update = () => {
      const posters = Array.from(document.querySelectorAll('[data-poster]'));
      const mid = window.innerHeight / 2;
      let best = 1, bestDist = Infinity;
      posters.forEach(p => {
        const r = p.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const d = Math.abs(center - mid);
        if (d < bestDist) { bestDist = d; best = parseInt(p.dataset.poster, 10); }
      });
      setActive(best);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);
  const labels = (typeof window !== 'undefined' && window.__pagerLabels) || ['Intro', 'Reality', 'Promise', 'Offer', 'Path', 'Context', 'Numbers', 'Cases', 'Mission'];
  return (
    <div style={{
      position: 'fixed',
      right: 16, top: '50%', transform: 'translateY(-50%)',
      zIndex: 40,
      display: 'flex', flexDirection: 'column', gap: 4,
      mixBlendMode: 'difference'
    }}>
      {labels.map((label, i) => {
        const n = i + 1;
        const on = active === n;
        return (
          <a key={n}
            href={`#poster-${n}`}
            onClick={(e) => {
              e.preventDefault();
              const p = document.querySelectorAll('[data-poster]')[i];
              if (p) p.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '4px 6px',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: 10, letterSpacing: '0.08em',
              color: '#FFFFFF',
              opacity: on ? 1 : 0.4,
              transition: 'opacity .2s var(--ease-out)'
            }}>
            <span style={{
              width: on ? 16 : 8, height: 1,
              background: '#FFFFFF',
              transition: 'width .25s var(--ease-out)'
            }}/>
            <span style={{ fontWeight: 700 }}>{String(n).padStart(2,'0')}</span>
            <span style={{ textTransform: 'uppercase' }}>{label}</span>
          </a>
        );
      })}
    </div>
  );
}

window.P1Cover = P1Cover;
window.P2DuctTape = P2DuctTape;
window.P3Directory = P3Directory;

// AppIcon — abstract black geometric marks.
function AppIcon({ kind }) {
  const c = { width: 40, height: 40, viewBox: '0 0 40 40', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (kind) {
    case 'connect':
      // Two intersecting circles
      return (
        <svg {...c}>
          <circle cx="15" cy="20" r="10"/>
          <circle cx="25" cy="20" r="10"/>
        </svg>
      );
    case 'quotes':
      // Stacked offset squares
      return (
        <svg {...c}>
          <rect x="7" y="7" width="18" height="18" rx="1"/>
          <rect x="15" y="15" width="18" height="18" rx="1"/>
        </svg>
      );
    case 'dealroom':
      // Triangle + circle composition
      return (
        <svg {...c}>
          <path d="M6 30 L 20 6 L 34 30 Z"/>
          <circle cx="20" cy="24" r="5" fill="currentColor"/>
        </svg>
      );
    case 'garage':
      // Concentric rings — radar/target
      return (
        <svg {...c}>
          <circle cx="20" cy="20" r="14"/>
          <circle cx="20" cy="20" r="8"/>
          <circle cx="20" cy="20" r="2.4" fill="currentColor"/>
        </svg>
      );
    case 'parts':
      // 3x3 dot grid with one filled
      return (
        <svg {...c}>
          {[8, 20, 32].map(y => [8, 20, 32].map(x => (
            <circle key={x+'-'+y} cx={x} cy={y} r={x === 32 && y === 8 ? 3 : 2} fill="currentColor"/>
          )))}
        </svg>
      );
    case 'portal':
      // Half-disc + bar — abstract arch
      return (
        <svg {...c}>
          <path d="M6 28 a 14 14 0 0 1 28 0" fill="currentColor"/>
          <rect x="4" y="30" width="32" height="3" fill="currentColor"/>
        </svg>
      );
    default:
      return (<svg {...c}><circle cx="20" cy="20" r="12"/></svg>);
  }
}
window.AppIcon = AppIcon;
window.P4Numbers = P4Numbers;
window.P5Quote = P5Quote;
window.P6Initiate = P6Initiate;
window.PagerRail = PagerRail;
