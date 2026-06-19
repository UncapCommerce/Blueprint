// CaseStudies.jsx — Three case studies under one tabbed poster.
// Content is unchanged from the prior three posters; only the shell now wraps
// them as full-width tabs inside a single section.

function CaseCollage({ id, placeholder, accents }) {
  return (
    <div style={{
      position: 'relative',
      minHeight: 480,
      aspectRatio: '4/5',
      background: 'var(--uc-stone-200)',
      borderRadius: 5,
      overflow: 'hidden',
      border: '1px solid var(--line-1)'
    }}>
      <image-slot
        id={id}
        shape="rect"
        radius="5"
        placeholder={placeholder}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />

    </div>
  );
}

function CaseLeft({ logo, h1, h2, subtitle, stack, quote, stats, caption }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, minWidth: 0 }}>
      {/* Logo — quiet, sits on its own line with a hairline rule */}
      <div style={{
        paddingBottom: 24,
        borderBottom: '1px solid var(--line-1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', minHeight: 44 }}>
          {logo}
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: 'var(--fg-3)', letterSpacing: '0.16em', textTransform: 'uppercase'
        }}>Case · Live</span>
      </div>

      {/* Headline — large display + Fraunces tail */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{
          margin: 0,
          fontFamily: 'var(--font-hero)',
          fontWeight: 700,
          fontSize: 'clamp(28px, 3.6vw, 52px)',
          letterSpacing: '-0.038em',
          lineHeight: 1.02,
          color: 'var(--fg-1)',
          textWrap: 'balance'
        }}>
          {h1}{' '}
          <span style={{
            fontFamily: 'var(--font-serif)', fontWeight: 400,
            color: 'var(--fg-2)', letterSpacing: '-0.028em'
          }}>{h2}</span>
        </h2>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(14px, 1.1vw, 16px)',
          fontWeight: 500, color: 'var(--fg-3)'
        }}>{subtitle}</div>
      </div>

      {/* Outcomes — two big numbers side by side, no chrome */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 0,
        borderTop: '1px solid var(--line-1)',
        borderBottom: '1px solid var(--line-1)'
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            padding: '22px 24px 22px 0',
            paddingLeft: i > 0 ? 28 : 0,
            borderLeft: i > 0 ? '1px solid var(--line-1)' : 'none',
            display: 'flex', flexDirection: 'column', gap: 4,
            position: 'relative'
          }}>
            <span aria-hidden="true" style={{
              position: 'absolute',
              top: 0, left: i > 0 ? 28 : 0,
              width: 14, height: 2,
              background: 'var(--uc-signal)'
            }}/>
            <div style={{
              fontFamily: 'var(--font-hero)',
              fontWeight: 800,
              fontSize: 'clamp(48px, 5.2vw, 88px)',
              letterSpacing: '-0.055em',
              lineHeight: 0.88,
              color: 'var(--fg-1)'
            }}>{s.v}</div>
            <div style={{ marginTop: 6 }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600, fontSize: 14,
                color: 'var(--fg-1)', letterSpacing: '-0.005em'
              }}>{s.h}</div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11, color: 'var(--fg-3)',
                letterSpacing: '0.04em', marginTop: 3
              }}>{s.l}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pull quote — large italic Fraunces, no box */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <blockquote style={{
          margin: 0,
          fontFamily: 'var(--font-serif)',
          fontWeight: 400, fontStyle: 'italic',
          fontSize: 'clamp(17px, 1.45vw, 22px)',
          lineHeight: 1.45,
          letterSpacing: '-0.012em',
          color: 'var(--fg-1)',
          textWrap: 'pretty'
        }}>
          “{quote.text}”
        </blockquote>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 999,
            background: 'var(--uc-stone-200)',
            overflow: 'hidden',
            flexShrink: 0, border: '1px solid var(--line-1)'
          }}>
            <image-slot
              id={quote.avatarId}
              shape="circle"
              placeholder=""
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          </div>
          <div style={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
              color: 'var(--fg-1)', letterSpacing: '-0.008em'
            }}>{quote.name}</span>
            <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>· {quote.title}</span>
          </div>
        </div>
      </div>

      {/* Stack — chip line, monospaced caps, no box */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-3)'
        }}>Stack · {stack.length}</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap'
        }}>
          {stack.map((s, i) => (
            <span key={i} style={{
              padding: '5px 11px',
              border: '1px solid var(--line-1)',
              borderRadius: 999,
              fontFamily: 'var(--font-mono)',
              fontSize: 11, fontWeight: 600,
              color: 'var(--fg-1)', letterSpacing: '-0.005em',
              background: 'var(--uc-paper)'
            }}>{s.t}</span>
          ))}
        </div>
      </div>

      {/* Footer — caption + CTA on a single quiet line */}
      <div style={{
        marginTop: 16,
        paddingTop: 28,
        borderTop: '1px solid var(--line-1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, flexWrap: 'wrap'
      }}>
        <div style={{
          fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontSize: 14, color: 'var(--fg-3)', letterSpacing: '-0.005em'
        }}>{caption}</div>
        <a href="#" className="uc-btn b-primary" style={{
          padding: '12px 20px', fontSize: 14
        }}>
          Read the Case Study <span>→</span>
        </a>
      </div>
    </div>
  );
}

// ── Case data, unchanged content from prior posters ──────────────────────
const CASE_DATA = [
  {
    tag: 'Vosges',
    pageN: 8,
    code: 'UC.CASE.01 · DTC + B2B + POS · 2024',
    tabHeadline: 'DTC + B2B + Subscriptions',
    caseLeft: {
      tag: 'Vosges',
      logo: (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{
            fontFamily: 'var(--font-serif)', fontStyle: 'italic',
            fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em',
            color: 'var(--fg-1)'
          }}>Vosges</span>
          <span style={{
            fontFamily: 'var(--font-serif)', fontSize: 10,
            letterSpacing: '0.32em', textTransform: 'uppercase',
            color: 'var(--fg-2)'
          }}>haut-chocolat</span>
        </div>
      ),
      h1: 'True Unified Commerce, in practice.',
      h2: 'DTC, B2B, POS, and Subscriptions on Shopify.',
      subtitle: 'Architected for performance, security, and scale.',
      stack: [
        { t: 'shopify',  font: 'var(--font-display)', w: 700, size: 18, color: 'var(--fg-1)' },
        { t: 'FISHBOWL', upper: true, w: 800, size: 14, color: 'var(--fg-1)' },
        { t: 'recharge', w: 700, size: 16, color: 'var(--fg-1)' },
        { t: 'klaviyo',  w: 800, size: 16, color: 'var(--fg-1)' },
        { t: 'yotpo.',   w: 800, size: 18, color: 'var(--uc-brand)' }
      ],
      quote: {
        avatarId: 'case-vosges-avatar',
        name: 'Katrina Markoff',
        title: 'CEO, Vosges Haut-Chocolat',
        text: 'Shopify Plus not only allowed us to create a visually stunning website, it created a much cleaner and more seamless shopping experience. Its solid foundation enabled us to rapidly scale our direct-to-consumer business efficiently while providing a wide range of digital tools and technical support to accelerate our growth.'
      },
      stats: [
        { v: '40%', h: 'Increase',  l: 'Online Revenues' },
        { v: '50%', h: 'Lower',     l: 'Cost of Ownership' }
      ],
      caption: 'Featured on Shopify. Read the full case study.'
    },
    collage: {
      id: 'case-vosges-collage',
      placeholder: 'Vosges Haut-Chocolat · storefront, cart, product cards, subscription module collage',
      accents: [
        { label: 'GET 20% OFF',  pos: { top: 24, left: 24 }, bg: 'var(--uc-black)', fg: 'var(--uc-paper)' },
        { label: 'CART · $57', pos: { top: 24, right: 24 } },
        { label: 'CUSTOMIZE',  pos: { bottom: 24, left: 24 } }
      ]
    }
  },
  {
    tag: 'KOOKS',
    pageN: 9,
    code: 'UC.CASE.02 · YMM FITMENT · 2024',
    tabHeadline: 'YMM Fitment at Scale',
    caseLeft: {
      tag: 'KOOKS',
      logo: (
        <div style={{
          fontFamily: 'var(--font-hero)',
          fontStyle: 'italic',
          fontWeight: 900,
          fontSize: 40,
          letterSpacing: '-0.04em',
          color: 'var(--fg-1)'
        }}>KOOKS™</div>
      ),
      h1: 'In auto parts on Shopify, fitment is essential.',
      h2: "We built KOOKS' catalog around it.",
      subtitle: 'The infrastructure spine of modern commerce.',
      stack: [
        { t: 'shopify',    font: 'var(--font-display)', w: 700, size: 18, color: 'var(--fg-1)' },
        { t: 'infor',      w: 900, size: 18, color: '#D6203B', italic: true },
        { t: 'PDM·AUTO',   upper: true, w: 800, size: 13, color: 'var(--uc-brand)' },
        { t: 'Avalara',    w: 700, size: 16, color: '#F18A1F' },
        { t: 'klaviyo',    w: 800, size: 16, color: 'var(--fg-1)' },
        { t: 'ShipperHQ',  w: 700, size: 15, color: 'var(--uc-brand)' }
      ],
      quote: {
        avatarId: 'case-kooks-avatar',
        name: 'George Kook Jr.',
        title: 'President, Kooks Headers',
        text: "Transitioning to Shopify has given us the functionality we needed to scale — real-time inventory, integrated analytics, and B2B capabilities that streamline operations. It's freeing up our account managers to spend more time prospecting and helping us grow not only Kooks Headers & Exhaust, but also the performance manufacturing side of the business."
      },
      stats: [
        { v: '38%', h: 'Lower',     l: 'Cost of Ownership' },
        { v: '22%', h: 'Increased', l: 'Conversion Rate' }
      ],
      caption: 'Shopify wrote the case study. Read it for yourself.'
    },
    collage: {
      id: 'case-kooks-collage',
      placeholder: 'KOOKS Headers · YMM fitment selector, exhaust system PDP, weld shop photo collage',
      accents: [
        { label: 'YMM · ENGINE TYPE', pos: { top: 24, left: 24 }, bg: 'var(--uc-black)', fg: 'var(--uc-paper)' },
        { label: 'IN USA',  pos: { top: 24, right: 24 } },
        { label: 'ADD TO CART', pos: { bottom: 24, right: 24 }, bg: '#D6203B', fg: 'var(--uc-paper)' }
      ]
    }
  },
  {
    tag: 'ULE Group',
    pageN: 10,
    code: 'UC.CASE.03 · 1M SKU B2B · 2024',
    tabHeadline: 'B2B at 1M+ SKUs',
    caseLeft: {
      tag: 'ULE Group',
      logo: (
        <div style={{
          display: 'flex', flexDirection: 'column',
          fontFamily: 'var(--font-hero)', fontWeight: 900,
          letterSpacing: '0.06em', color: 'var(--fg-1)',
          lineHeight: 0.9
        }}>
          <span style={{ fontSize: 32 }}>ULE</span>
          <span style={{ fontSize: 12, letterSpacing: '0.32em', marginTop: 4 }}>GROUP</span>
        </div>
      ),
      h1: 'One million SKUs is where projects break.',
      h2: "ULE Group's, scaling on Shopify B2B.",
      subtitle: 'Built on enterprise-grade infrastructure.',
      stack: [
        { t: 'shopify',  font: 'var(--font-display)', w: 700, size: 18, color: 'var(--fg-1)' },
        { t: 'EPICOR',   upper: true, w: 800, size: 15, color: 'var(--fg-1)', tracking: '0.04em' },
        { t: 'algolia',  w: 700, size: 16, color: 'var(--uc-brand)' },
        { t: 'klaviyo',  w: 800, size: 16, color: 'var(--fg-1)' },
        { t: 'akeneo',   w: 700, size: 16, color: '#7A4DFF' }
      ],
      quote: {
        avatarId: 'case-ule-avatar',
        name: 'Denise Foley',
        title: 'EVP of E-Commerce, ULE Group',
        text: 'Shopify allowed us to move quickly while laying a strong foundation for growth, scalability, and future enhancements. Its built-in performance, security, and flexibility gave us the confidence to deliver a great B2B experience without delaying time to market.'
      },
      stats: [
        { v: '6X',   h: 'Increased', l: 'Online Sales' },
        { v: '559%', h: 'Increased', l: 'Website Traffic YOY' }
      ],
      caption: "Don't take our word for it. Read Shopify's write-up."
    },
    collage: {
      id: 'case-ule-collage',
      placeholder: 'ULE Group · 64,920-SKU search results, cart, PDP, B2B quote module collage',
      accents: [
        { label: '45% OFF · FIRST ORDER', pos: { top: 24, right: 24 }, bg: '#FFD400', fg: 'var(--uc-black)' },
        { label: 'B2B CATALOG',           pos: { top: 24, left: 24 }, bg: 'var(--uc-brand)', fg: 'var(--uc-paper)' },
        { label: 'REQUEST A QUOTE',       pos: { bottom: 24, left: 24 } }
      ]
    }
  }
];

// ─── Single tabbed poster wrapping all three cases ────────────────────────
function CaseTabsPoster() {
  const DUR = 6000;
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [seen, setSeen] = React.useState(false);
  const startRef = React.useRef(performance.now());
  const sectionRef = React.useRef(null);

  React.useEffect(() => {
    if (!sectionRef.current) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setSeen(true);
          startRef.current = performance.now();
          io.disconnect();
        }
      });
    }, { threshold: 0.35 });
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);
  const cs = CASE_DATA[active];

  React.useEffect(() => {
    startRef.current = performance.now();
    setProgress(0);
  }, [active, paused]);

  React.useEffect(() => {
    if (paused || !seen) return;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - startRef.current) / DUR);
      setProgress(t);
      if (t >= 1) {
        setActive((active + 1) % CASE_DATA.length);
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, paused, seen]);

  const onPick = (i) => {
    setActive(i);
    setPaused(true);
  };

  return (
    <section ref={sectionRef} data-poster={8} style={{
      background: 'var(--uc-paper)',
      minHeight: '100vh',
      padding: '32px 32px 32px',
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* TOP rail */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20,
        borderBottom: '1px solid var(--line-1)'
      }}>
        <PageMark n={8} label={`Field · ${cs.tag}`}/>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--fg-3)', letterSpacing: 0
        }}>{cs.code}</div>
      </div>

      {/* Full-width tab bar — same style as Your Context */}
      <div style={{
        marginTop: 24,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 0,
        borderBottom: '1px solid var(--line-1)'
      }}>
        {CASE_DATA.map((c, i) => {
          const on = active === i;
          return (
            <button
              key={c.tag}
              type="button"
              onClick={() => onPick(i)}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              style={{
                border: 'none', background: 'transparent',
                padding: '8px 20px 28px',
                borderLeft: i > 0 ? '1px solid var(--line-1)' : 'none',
                cursor: 'pointer', textAlign: 'left',
                position: 'relative',
                transition: 'opacity .25s var(--ease-out)',
                opacity: on ? 1 : 0.45
              }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'var(--fg-3)', letterSpacing: 0, marginBottom: 12
              }}>0{i+1} / 03</div>
              <div style={{
                fontFamily: 'var(--font-hero)',
                fontWeight: 800,
                fontSize: 'clamp(32px, 4.4vw, 64px)',
                letterSpacing: '-0.045em',
                lineHeight: 0.95,
                color: 'var(--fg-1)',
                marginBottom: 12
              }}>{c.tag}</div>
              <div style={{
                fontFamily: 'var(--font-serif)', fontWeight: 400,
                fontSize: 'clamp(14px, 1.1vw, 17px)',
                letterSpacing: '-0.005em', lineHeight: 1.35,
                color: 'var(--fg-2)'
              }}>{c.tabHeadline}</div>
              {/* Persistent bottom indicator: grey when off, black when on, lime fill = progress */}
              <div aria-hidden="true" style={{
                position: 'absolute',
                left: 20, right: 20, bottom: -1,
                height: 3,
                background: on ? 'var(--uc-black)' : 'var(--line-1)',
                overflow: 'hidden'
              }}>
                {on && (
                  <div style={{
                    width: `${(paused ? 1 : progress) * 100}%`,
                    height: '100%',
                    background: 'var(--uc-signal)',
                    transition: paused ? 'width .15s var(--ease-out)' : 'none'
                  }}/>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active case body */}
      <div style={{
        flex: 1, paddingTop: 40,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
        gap: 'clamp(32px, 5vw, 80px)',
        alignItems: 'center'
      }}>
        <CaseLeft {...cs.caseLeft}/>
        <CaseCollage {...cs.collage}/>
      </div>

      {/* BOTTOM rail */}
      <div style={{
        paddingTop: 20,
        borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'var(--fg-3)', letterSpacing: 0
      }}>
        <span>UC.CASE · {cs.tag.toUpperCase()}</span>
        <span>UNCAP · BUILT · LIVE</span>
      </div>
    </section>
  );
}

// Backwards-compat exports so existing imports still resolve; all three render
// the same tabbed poster, so it appears once in the page even if referenced
// multiple times.
function P8Vosges() { return <CaseTabsPoster/>; }
function P9Kooks()  { return null; }
function P10Ule()   { return null; }

window.CaseTabsPoster = CaseTabsPoster;
window.P8Vosges = P8Vosges;
window.P9Kooks  = P9Kooks;
window.P10Ule   = P10Ule;
