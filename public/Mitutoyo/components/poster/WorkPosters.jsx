// WorkPosters.jsx — 5 posters for the Work page.
//   01 Index / Selected Work
//   02 Featured 1 (Vosges)
//   03 Featured 2 (KOOKS)
//   04 Featured 3 (ULE)
//   05 By the Discipline (capabilities) + CTA

function BrandRow({ row }) {
  const [hover, setHover] = React.useState(false);
  return (
    <a href="#"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '14px 14px',
        margin: '0 -14px',
        textDecoration: 'none', color: 'var(--fg-1)',
        borderBottom: '1px solid var(--line-1)',
        display: 'grid',
        gridTemplateColumns: '40px minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1.2fr) 56px',
        gap: 12, alignItems: 'baseline',
        background: hover ? 'rgba(10,10,10,0.045)' : 'transparent',
        transition: 'background .2s var(--ease-out)',
        position: 'relative'
      }}>
      <span aria-hidden="true" style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 3, background: 'var(--uc-signal)',
        transform: hover ? 'scaleY(1)' : 'scaleY(0)',
        transformOrigin: 'top',
        transition: 'transform .25s var(--ease-out)'
      }}/>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 12,
        color: hover ? 'var(--fg-1)' : 'var(--fg-3)',
        transition: 'color .15s var(--ease-out)'
      }}>{row.n}</span>
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(16px, 1.4vw, 20px)',
        fontWeight: 700, letterSpacing: '-0.015em',
        transform: hover ? 'translateX(4px)' : 'none',
        transition: 'transform .25s var(--ease-out)'
      }}>{row.client}</span>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        color: 'var(--fg-3)'
      }}>{row.ind}</span>
      <span style={{
        fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--fg-2)'
      }}>{row.scope}</span>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: hover ? 'var(--fg-1)' : 'var(--fg-3)',
        textAlign: 'right',
        transition: 'color .15s var(--ease-out)'
      }}>{hover ? '→' : row.y}</span>
    </a>
  );
}

// ─── 01 INDEX ─────────────────────────────────────────────────────────────
function W1Index() {
  const [r, setR] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setR(true), 80); return () => clearTimeout(t); }, []);

  const rows = [
    { n: '01', client: 'Vosges',     ind: 'Confections',     scope: 'DTC + B2B + POS',       y: '2024' },
    { n: '02', client: 'KOOKS',      ind: 'Auto Parts',      scope: 'YMM Fitment',            y: '2024' },
    { n: '03', client: 'ULE Group',  ind: 'Distribution',    scope: '1M+ SKU B2B',            y: '2024' },
    { n: '04', client: 'TotalBoat',  ind: 'Marine',          scope: 'D2C + Wholesale',        y: '2023' },
    { n: '05', client: 'Agri Drain', ind: 'Manufacturing',   scope: 'Dealer Portal',          y: '2023' },
    { n: '06', client: 'WeldingStore', ind: 'Industrial',    scope: 'Quote-to-Order',         y: '2023' },
    { n: '07', client: 'Pawstruck',  ind: 'D2C Food',        scope: 'Subscription Build',     y: '2022' },
    { n: '08', client: 'SignWarehouse', ind: 'Custom Goods', scope: 'Configurator',           y: '2022' }
  ];

  return (
    <section data-poster="1" style={{
      background: 'var(--uc-cream)', minHeight: '100vh',
      padding: '32px 32px 32px', position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      borderTop: '1px solid var(--line-1)',
      borderBottom: '1px solid var(--line-1)'
    }}>
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'rgba(10,10,10,0.05)',
        WebkitMaskImage: `url(${window.__resources.bgVector1})`,
        maskImage: `url(${window.__resources.bgVector1})`,
        WebkitMaskSize: 'cover', maskSize: 'cover',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center', maskPosition: 'center'
      }}/>

      {/* TOP rail */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20, borderBottom: '1px solid var(--line-1)'
      }}>
        <PageMark label="Index" noNumber/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          WORK · 380+ ENGAGEMENTS · 2013→
        </div>
      </div>

      {/* Mega headline */}
      <div style={{
        flex: 1, position: 'relative',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
        gap: 'clamp(24px, 4vw, 80px)',
        paddingTop: 'clamp(40px, 5vh, 64px)', paddingBottom: 32
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.05em', lineHeight: 0.86,
            color: 'var(--fg-1)'
          }}>
            <span className={`uc-rise ${r ? 'in' : ''}`} style={{
              display: 'block', fontSize: 'clamp(64px, 12vw, 200px)'
            }}>Selected</span>
            <span className={`uc-rise ${r ? 'in' : ''}`} style={{
              display: 'block', fontSize: 'clamp(64px, 12vw, 200px)',
              paddingLeft: 'clamp(40px, 7vw, 140px)', transitionDelay: '90ms',
              fontFamily: 'var(--font-serif)', fontWeight: 400
            }}>work.</span>
          </h1>
          <p style={{
            marginTop: 24, maxWidth: 520, color: 'var(--fg-2)',
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)',
            lineHeight: 1.45
          }}>
            A small slice of what we&rsquo;ve built with operator-led brands across
            wholesale, distribution, manufacturing, and unified commerce.
          </p>
        </div>

        {/* Index list */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          borderTop: '1px solid var(--line-1)'
        }}>
          {rows.map(row => <BrandRow key={row.n} row={row}/>)}
        </div>
      </div>

      {/* BOTTOM rail */}
      <div style={{
        paddingTop: 20, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>↳ Scroll for featured</span>
        <span>UC.WORK · INDEX</span>
      </div>
    </section>
  );
}

// ─── Featured case body (matches CaseStudies layout) ──────────────────────
function WFeaturedCase({ n, code, label, headline, headlineTail, sub, stack, quote, stats, image, accents = [] }) {
  const dark = n === 3; // alternate dark on the middle
  return (
    <section data-poster={n} style={{
      background: dark ? 'var(--uc-black)' : 'var(--uc-paper)',
      color: dark ? 'var(--uc-paper)' : 'var(--fg-1)',
      minHeight: '100vh', padding: '32px 32px 32px',
      position: 'relative', display: 'flex', flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20,
        borderBottom: dark ? '1px solid #1F1F1F' : '1px solid var(--line-1)'
      }}>
        <PageMark n={n} label={label} dark={dark} total={5}/>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: dark ? 'var(--uc-stone-500)' : 'var(--fg-3)'
        }}>{code}</div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(32px, 4vw, 56px)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: 'clamp(32px, 5vw, 80px)', alignItems: 'center'
      }}>
        {/* Left: body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.04em', lineHeight: 1.0,
            fontSize: 'clamp(36px, 5.4vw, 88px)',
            color: dark ? 'var(--uc-paper)' : 'var(--fg-1)',
            textWrap: 'balance'
          }}>
            {headline}{' '}
            <span style={{
              fontFamily: 'var(--font-serif)', fontWeight: 400,
              color: dark ? 'var(--uc-stone-300)' : 'var(--fg-2)',
              letterSpacing: '-0.028em'
            }}>{headlineTail}</span>
          </h2>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 500,
            fontSize: 'clamp(14px, 1.15vw, 17px)',
            color: dark ? 'var(--uc-stone-300)' : 'var(--fg-3)',
            maxWidth: 520
          }}>{sub}</div>

          {/* Stack */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
            paddingTop: 8
          }}>
            {stack.map((s, i) => (
              <span key={i} style={{
                padding: '5px 11px', borderRadius: 999,
                border: '1px solid ' + (dark ? '#2B2B2B' : 'var(--line-1)'),
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                color: dark ? 'var(--uc-paper)' : 'var(--fg-1)'
              }}>{s}</span>
            ))}
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0,
            borderTop: '1px solid ' + (dark ? '#1F1F1F' : 'var(--line-1)'),
            borderBottom: '1px solid ' + (dark ? '#1F1F1F' : 'var(--line-1)')
          }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                padding: '22px 0', paddingLeft: i > 0 ? 28 : 0,
                borderLeft: i > 0 ? ('1px solid ' + (dark ? '#1F1F1F' : 'var(--line-1)')) : 'none',
                position: 'relative'
              }}>
                <span aria-hidden="true" style={{
                  position: 'absolute', top: 0, left: i > 0 ? 28 : 0,
                  width: 14, height: 2, background: 'var(--uc-signal)'
                }}/>
                <div style={{
                  fontFamily: 'var(--font-hero)', fontWeight: 800,
                  fontSize: 'clamp(40px, 4.2vw, 72px)',
                  letterSpacing: '-0.05em', lineHeight: 0.9,
                  color: dark ? 'var(--uc-paper)' : 'var(--fg-1)'
                }}>{s.v}</div>
                <div style={{
                  marginTop: 8,
                  fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600,
                  color: dark ? 'var(--uc-paper)' : 'var(--fg-1)'
                }}>{s.h}</div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  color: dark ? 'var(--uc-stone-500)' : 'var(--fg-3)', marginTop: 3
                }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Quote */}
          <blockquote style={{
            margin: 0,
            fontFamily: 'var(--font-serif)', fontWeight: 400, fontStyle: 'italic',
            fontSize: 'clamp(15px, 1.3vw, 19px)',
            lineHeight: 1.5,
            color: dark ? 'var(--uc-stone-300)' : 'var(--fg-1)',
            textWrap: 'pretty'
          }}>
            &ldquo;{quote.text}&rdquo;
          </blockquote>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: dark ? 'var(--uc-stone-500)' : 'var(--fg-3)'
          }}>
            <span>{quote.name}</span><span>·</span><span>{quote.title}</span>
          </div>

          <div>
            <a href="#" className="uc-btn b-primary" style={{ padding: '12px 20px', fontSize: 14 }}>
              Read the Case Study <span>→</span>
            </a>
          </div>
        </div>

        {/* Right: image collage */}
        <div style={{
          position: 'relative', aspectRatio: '4/5', minHeight: 460,
          background: dark ? '#0F0F0F' : 'var(--uc-stone-200)',
          borderRadius: 5, overflow: 'hidden',
          border: '1px solid ' + (dark ? '#1F1F1F' : 'var(--line-1)')
        }}>
          <image-slot
            id={`work-${label.toLowerCase()}-img`}
            shape="rect" radius="5"
            placeholder={image}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />

        </div>
      </div>

      <div style={{
        paddingTop: 20,
        borderTop: dark ? '1px solid #1F1F1F' : '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: dark ? 'var(--uc-stone-500)' : 'var(--fg-3)'
      }}>
        <span>UC.WORK · {label.toUpperCase()}</span>
        <span>UNCAP · BUILT · LIVE</span>
      </div>
    </section>
  );
}

function W2Vosges() {
  return (
    <WFeaturedCase
      n={2} label="Vosges" code="UC.CASE.01 · DTC + B2B + POS · 2024"
      headline="DTC, B2B, POS, and Subscriptions."
      headlineTail="One catalog. One ledger."
      sub="Architected for performance, security, and scale across every channel."
      stack={['Shopify Plus', 'Fishbowl', 'Recharge', 'Klaviyo', 'Yotpo']}
      stats={[
        { v: '40%', h: 'Increase', l: 'Online revenues' },
        { v: '50%', h: 'Lower',    l: 'Cost of ownership' }
      ]}
      quote={{
        text: 'Shopify Plus created a much cleaner, more seamless shopping experience. We scaled DTC efficiently with the right tools and partner.',
        name: 'Katrina Markoff', title: 'CEO, Vosges Haut-Chocolat'
      }}
      image="Vosges storefront · cart · subscription module collage"
      accents={[
        { label: 'GET 20% OFF',  pos: { top: 24, left: 24 }, bg: 'var(--uc-black)', fg: 'var(--uc-paper)' },
        { label: 'CART · $57', pos: { top: 24, right: 24 } },
        { label: 'CUSTOMIZE',  pos: { bottom: 24, left: 24 } }
      ]}
    />
  );
}

function W3Kooks() {
  return (
    <WFeaturedCase
      n={3} label="KOOKS" code="UC.CASE.02 · YMM FITMENT · 2024"
      headline="In auto parts, fitment is essential."
      headlineTail="So we built the catalog around it."
      sub="Year-Make-Model selectors, real-time inventory, integrated analytics."
      stack={['Shopify Plus', 'Infor', 'PDM·Auto', 'Avalara', 'Klaviyo', 'ShipperHQ']}
      stats={[
        { v: '38%', h: 'Lower',     l: 'Cost of ownership' },
        { v: '22%', h: 'Increased', l: 'Conversion rate' }
      ]}
      quote={{
        text: "Transitioning to Shopify gave us real-time inventory, integrated analytics, and B2B capabilities to streamline operations and grow.",
        name: 'George Kook Jr.', title: 'President, Kooks Headers'
      }}
      image="KOOKS YMM selector · exhaust PDP · weld shop collage"
      accents={[
        { label: 'YMM · ENGINE TYPE', pos: { top: 24, left: 24 }, bg: 'var(--uc-black)', fg: 'var(--uc-paper)' },
        { label: 'IN USA',  pos: { top: 24, right: 24 } },
        { label: 'ADD TO CART', pos: { bottom: 24, right: 24 }, bg: '#D6203B', fg: 'var(--uc-paper)' }
      ]}
    />
  );
}

function W4Ule() {
  return (
    <WFeaturedCase
      n={4} label="ULE Group" code="UC.CASE.03 · 1M SKU B2B · 2024"
      headline="One million SKUs."
      headlineTail="On Shopify B2B."
      sub="Built on enterprise-grade infrastructure for distribution at scale."
      stack={['Shopify Plus', 'Epicor', 'Algolia', 'Klaviyo', 'Akeneo']}
      stats={[
        { v: '6×',   h: 'Increased', l: 'Online sales' },
        { v: '559%', h: 'Increased', l: 'Website traffic YOY' }
      ]}
      quote={{
        text: 'Shopify allowed us to move quickly while laying a strong foundation for growth, scalability, and future enhancements.',
        name: 'Denise Foley', title: 'EVP of E-Commerce, ULE Group'
      }}
      image="ULE Group SKU search · cart · B2B quote module"
      accents={[
        { label: '45% OFF · FIRST ORDER', pos: { top: 24, right: 24 }, bg: '#FFD400', fg: 'var(--uc-black)' },
        { label: 'B2B CATALOG',           pos: { top: 24, left: 24 }, bg: 'var(--uc-brand)', fg: 'var(--uc-paper)' },
        { label: 'REQUEST A QUOTE',       pos: { bottom: 24, left: 24 } }
      ]}
    />
  );
}

function DisciplineRow({ it }) {
  const [hover, setHover] = React.useState(false);
  return (
    <a href="#"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '28px 14px',
        margin: '0 -14px',
        borderBottom: '1px solid var(--line-1)',
        textDecoration: 'none', color: 'var(--fg-1)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 56px) minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 120px) minmax(0, auto)',
        gap: 'clamp(16px, 2vw, 32px)', alignItems: 'center',
        position: 'relative',
        background: hover ? 'rgba(10,10,10,0.045)' : 'transparent',
        transition: 'background .2s var(--ease-out)'
      }}>
      {/* Lime accent bar — grows top-to-bottom on hover, base mark at the top */}
      <span aria-hidden="true" style={{
        position: 'absolute', top: 0, left: 0,
        width: hover ? 3 : 18,
        height: hover ? '100%' : 2,
        background: 'var(--uc-signal)',
        transition: 'width .25s var(--ease-out), height .35s var(--ease-out)'
      }}/>

      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 13,
        color: hover ? 'var(--fg-1)' : 'var(--fg-3)',
        transition: 'color .15s var(--ease-out)'
      }}>{it.n}</span>

      <span style={{
        fontFamily: 'var(--font-hero)', fontWeight: 700,
        fontSize: 'clamp(28px, 3.4vw, 56px)',
        letterSpacing: '-0.035em', lineHeight: 1.0,
        color: 'var(--fg-1)',
        transform: hover ? 'translateX(6px)' : 'none',
        transition: 'transform .25s var(--ease-out)'
      }}>{it.l}</span>

      <span style={{
        fontFamily: 'var(--font-serif)', fontSize: 14,
        color: 'var(--fg-2)', lineHeight: 1.45
      }}>{it.d}</span>

      <span style={{
        display: 'flex', flexDirection: 'column', gap: 4,
        alignItems: 'flex-end'
      }}>
        <span style={{
          fontFamily: 'var(--font-hero)', fontWeight: 800,
          fontSize: 'clamp(28px, 3vw, 44px)',
          letterSpacing: '-0.035em', lineHeight: 0.9,
          color: 'var(--fg-1)'
        }}>{it.stat}</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--fg-3)'
        }}>{it.unit}</span>
      </span>

      <span style={{
        display: 'flex', alignItems: 'center', gap: 12,
        justifyContent: 'flex-end'
      }}>
        {it.tag && (
          <span style={{
            padding: '4px 9px',
            background: hover ? 'var(--uc-signal)' : 'var(--uc-bone)',
            border: '1px solid ' + (hover ? 'var(--uc-signal)' : 'var(--line-1)'),
            borderRadius: 3,
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--fg-1)', whiteSpace: 'nowrap',
            transition: 'background .2s var(--ease-out), border-color .2s var(--ease-out)'
          }}>{it.tag}</span>
        )}
        <span style={{
          width: 36, height: 36, borderRadius: 999,
          background: hover ? 'var(--uc-black)' : 'transparent',
          color: hover ? 'var(--uc-paper)' : 'var(--fg-1)',
          border: '1px solid ' + (hover ? 'var(--uc-black)' : 'var(--line-2)'),
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 14,
          transform: hover ? 'translateX(4px)' : 'none',
          transition: 'all .22s var(--ease-out)'
        }}>→</span>
      </span>
    </a>
  );
}

// ─── 05 DISCIPLINES — V2: practice rail with metrics ─────────────────────
function W5Discipline() {
  const items = [
    {
      n: '01', l: 'Replatforming',
      d: 'Migrations from custom and legacy carts onto Shopify Plus.',
      stat: '38', unit: 'projects', tag: 'Most-shipped'
    },
    {
      n: '02', l: 'B2B Launch',
      d: 'B2B catalogs, account portals, NET terms, tiered pricing.',
      stat: '62', unit: 'projects', tag: 'Practice lead'
    },
    {
      n: '03', l: 'D2C + Wholesale',
      d: 'Unified storefronts handling consumer and trade in one stack.',
      stat: '54', unit: 'projects'
    },
    {
      n: '04', l: 'Custom Integrations',
      d: 'ERPs, PIMs, ESPs, and quote workflows native to Shopify.',
      stat: '120+', unit: 'projects', tag: 'Specialty'
    },
    {
      n: '05', l: 'Growth Optimization',
      d: 'AOV, retention, conversion programs after go-live.',
      stat: 'Ongoing', unit: 'retainer'
    }
  ];

  return (
    <section data-poster="5" style={{
      background: 'var(--uc-cream)', minHeight: '100vh',
      padding: '32px 32px 32px', position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      borderTop: '1px solid var(--line-1)'
    }}>
      {/* TOP rail */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20, borderBottom: '1px solid var(--line-1)'
      }}>
        <PageMark label="Disciplines" noNumber/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          5 PRACTICES · 274+ SHIPPED
        </div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(32px, 4vh, 56px)',
        display: 'flex', flexDirection: 'column', gap: 36
      }}>
        {/* Mega headline + intro */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
          gap: 'clamp(32px, 5vw, 80px)', alignItems: 'end'
        }}>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.05em', lineHeight: 0.88,
            fontSize: 'clamp(48px, 7vw, 128px)',
            color: 'var(--fg-1)', textWrap: 'balance'
          }}>
            Sorted by{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>
              what we build most.
            </span>
          </h2>
          <p style={{
            margin: 0, maxWidth: 380,
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)',
            lineHeight: 1.45, color: 'var(--fg-2)'
          }}>
            Twelve years of work, organized by the practice that drives it.
            Pick the discipline that matches the moment you&rsquo;re in.
          </p>
        </div>

        {/* Practice ladder */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          borderTop: '1px solid var(--line-1)'
        }}>
          {items.map(it => <DisciplineRow key={it.n} it={it}/>)}
        </div>

        {/* Footer note + CTA */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, flexWrap: 'wrap'
        }}>
          <div style={{
            fontFamily: 'var(--font-serif)', fontStyle: 'italic',
            fontSize: 15, color: 'var(--fg-2)'
          }}>
            Pick a practice. Or talk to the team and we&rsquo;ll help you pick.
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a href="#" className="uc-btn b-primary">Talk to our experts <span>→</span></a>
            <a href="#" className="uc-link">See archive <span>→</span></a>
          </div>
        </div>
      </div>

      <div style={{
        paddingTop: 20, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>UC.WORK · DISCIPLINES</span>
        <span>SAME TEAM · EVERY PRACTICE</span>
      </div>
    </section>
  );
}

window.W1Index = W1Index;
window.W2Vosges = W2Vosges;
window.W3Kooks = W3Kooks;
window.W4Ule = W4Ule;
window.W5Discipline = W5Discipline;
