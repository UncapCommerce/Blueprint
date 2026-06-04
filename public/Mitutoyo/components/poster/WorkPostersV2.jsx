// WorkPostersV2.jsx — alternate layout for work page.
//   01 Editorial cover (poster-scale "Work" + tape-style accent)
//   02 Grid of all cases (4×2 thumbnails)
//   03 Featured story (single immersive case)
//   04 By-the-numbers strip
//   05 Approach / how-we-build (3 columns)

const V2_CASES = [
  { tag: 'Vosges',     ind: 'Confections',   stat: '40%', sl: 'Lift in online revenue',      tone: 'cream'  },
  { tag: 'KOOKS',      ind: 'Auto Parts',    stat: '22%', sl: 'Conversion rate',             tone: 'dark'   },
  { tag: 'ULE Group',  ind: 'Distribution',  stat: '6×',  sl: 'Online sales',                tone: 'paper'  },
  { tag: 'TotalBoat',  ind: 'Marine',        stat: '312%',sl: 'B2B revenue YOY',             tone: 'paper'  },
  { tag: 'Agri Drain', ind: 'Manufacturing', stat: '14h', sl: 'Returned to sales weekly',    tone: 'dark'   },
  { tag: 'WeldingStore', ind: 'Industrial',  stat: '2.4×',sl: 'Quote-to-order conversion',   tone: 'cream'  },
  { tag: 'Pawstruck',  ind: 'D2C Food',      stat: '+45%',sl: 'Subscription LTV',            tone: 'paper'  },
  { tag: 'SignWarehouse', ind: 'Custom',     stat: '38%', sl: 'Lower TCO',                   tone: 'cream'  }
];

// ─── 01 EDITORIAL COVER ───────────────────────────────────────────────────
function V1Cover() {
  const [r, setR] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setR(true), 80); return () => clearTimeout(t); }, []);
  return (
    <section data-poster="1" style={{
      background: 'var(--uc-cream)', minHeight: '100vh',
      padding: '32px 32px 32px', position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'rgba(10,10,10,0.05)',
        WebkitMaskImage: `url(${window.__resources.bgVector2})`,
        maskImage: `url(${window.__resources.bgVector2})`,
        WebkitMaskSize: 'cover', maskSize: 'cover',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center', maskPosition: 'center'
      }}/>

      {/* TOP rail */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20, borderBottom: '1px solid var(--line-1)'
      }}>
        <PageMark label="Vol XIV · Field" noNumber/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          UNCAP · WORK · 2013 → NOW
        </div>
      </div>

      {/* Hero composition */}
      <div style={{
        flex: 1, position: 'relative',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        paddingTop: 'clamp(40px, 6vh, 96px)', paddingBottom: 'clamp(32px, 5vh, 80px)'
      }}>
        <div style={{
          fontFamily: 'var(--font-serif)', fontWeight: 400,
          fontSize: 'clamp(20px, 2vw, 28px)',
          letterSpacing: '-0.012em', color: 'var(--fg-2)',
          marginBottom: 24
        }}>
          Eight stories,
        </div>
        <h1 style={{
          margin: 0,
          fontFamily: 'var(--font-hero)', fontWeight: 700,
          letterSpacing: '-0.06em', lineHeight: 0.82,
          color: 'var(--fg-1)'
        }}>
          <span className={`uc-rise ${r ? 'in' : ''}`} style={{
            display: 'block', fontSize: 'clamp(96px, 22vw, 360px)'
          }}>shipped</span>
          <span className={`uc-rise ${r ? 'in' : ''}`} style={{
            display: 'block', fontSize: 'clamp(96px, 22vw, 360px)',
            transitionDelay: '90ms',
            fontFamily: 'var(--font-serif)', fontWeight: 400,
            letterSpacing: '-0.05em',
            paddingLeft: 'clamp(40px, 8vw, 180px)'
          }}>by us.</span>
        </h1>

        {/* meta strip */}
        <div style={{
          marginTop: 'clamp(40px, 5vh, 64px)',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0, borderTop: '1px solid var(--line-1)', borderBottom: '1px solid var(--line-1)'
        }}>
          {[
            { v: '380+', l: 'Projects shipped' },
            { v: '8',    l: 'Featured this volume' },
            { v: '13y',  l: 'On Shopify' },
            { v: '5',    l: 'Industries served' }
          ].map((s, i) => (
            <div key={i} style={{
              padding: '24px 24px 24px 0', paddingLeft: i > 0 ? 24 : 0,
              borderLeft: i > 0 ? '1px solid var(--line-1)' : 'none',
              position: 'relative'
            }}>
              <span aria-hidden="true" style={{
                position: 'absolute', top: 0, left: i > 0 ? 24 : 0,
                width: 16, height: 2, background: 'var(--uc-signal)'
              }}/>
              <div style={{
                fontFamily: 'var(--font-hero)', fontWeight: 800,
                fontSize: 'clamp(36px, 4vw, 64px)',
                letterSpacing: '-0.045em', lineHeight: 0.9,
                color: 'var(--fg-1)'
              }}>{s.v}</div>
              <div style={{
                marginTop: 10,
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--fg-3)'
              }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM rail */}
      <div style={{
        paddingTop: 20, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>↳ Scroll for the catalog</span>
        <span>UC.WORK · COVER</span>
      </div>
    </section>
  );
}

// ─── 02 CATALOG GRID ──────────────────────────────────────────────────────
function V2Catalog() {
  return (
    <section data-poster="2" style={{
      background: 'var(--uc-paper)', minHeight: '100vh',
      padding: '32px 32px 32px', position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      borderTop: '1px solid var(--line-1)'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20, borderBottom: '1px solid var(--line-1)'
      }}>
        <PageMark label="Catalog" noNumber/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          8 OF 380+ · GRID VIEW
        </div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(40px, 5vh, 56px)',
        display: 'flex', flexDirection: 'column', gap: 24
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, auto)',
          gap: 32, alignItems: 'end'
        }}>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.04em', lineHeight: 0.92,
            fontSize: 'clamp(40px, 5.6vw, 96px)',
            color: 'var(--fg-1)'
          }}>
            Eight cases.{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>One way of working.</span>
          </h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['All', 'B2B', 'D2C', 'Distribution', 'Manufacturing'].map((t, i) => (
              <span key={t} style={{
                padding: '6px 12px', borderRadius: 999,
                background: i === 0 ? 'var(--uc-black)' : 'transparent',
                color: i === 0 ? 'var(--uc-paper)' : 'var(--fg-1)',
                border: '1px solid ' + (i === 0 ? 'var(--uc-black)' : 'var(--line-1)'),
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600
              }}>{t}</span>
            ))}
          </div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16
        }}>
          {V2_CASES.map((c, i) => {
            const dark = c.tone === 'dark';
            const cream = c.tone === 'cream';
            return (
              <a key={c.tag} href="#" style={{
                textDecoration: 'none',
                background: dark ? 'var(--uc-black)' : (cream ? 'var(--uc-cream)' : 'var(--uc-paper)'),
                color: dark ? 'var(--uc-paper)' : 'var(--fg-1)',
                border: '1px solid ' + (dark ? '#1F1F1F' : 'var(--line-1)'),
                borderRadius: 5, overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                minHeight: 280
              }}>
                <div style={{
                  aspectRatio: '4/3',
                  background: dark ? '#0F0F0F' : 'var(--uc-stone-200)',
                  borderBottom: '1px solid ' + (dark ? '#1F1F1F' : 'var(--line-1)'),
                  position: 'relative', overflow: 'hidden'
                }}>
                  <image-slot
                    id={`v2-case-${i}`}
                    shape="rect" radius="0"
                    placeholder={`${c.tag} · ${c.ind}`}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', top: 12, left: 12,
                    padding: '4px 9px',
                    background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(242,239,231,0.95)',
                    border: '1px solid ' + (dark ? '#2B2B2B' : 'var(--line-1)'),
                    borderRadius: 3,
                    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: dark ? 'var(--uc-paper)' : 'var(--fg-1)',
                    backdropFilter: 'blur(8px)'
                  }}>{c.ind}</div>
                </div>
                <div style={{
                  padding: 18,
                  display: 'flex', flexDirection: 'column', gap: 14,
                  flex: 1
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
                    letterSpacing: '-0.012em',
                    color: dark ? 'var(--uc-paper)' : 'var(--fg-1)'
                  }}>{c.tag}</div>
                  <div style={{
                    display: 'flex', alignItems: 'baseline', gap: 10,
                    marginTop: 'auto',
                    paddingTop: 14,
                    borderTop: '1px solid ' + (dark ? '#1F1F1F' : 'var(--line-1)')
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-hero)', fontWeight: 800,
                      fontSize: 26, letterSpacing: '-0.035em',
                      color: dark ? 'var(--uc-signal)' : 'var(--fg-1)'
                    }}>{c.stat}</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                      color: dark ? 'var(--uc-stone-300)' : 'var(--fg-3)',
                      letterSpacing: 0
                    }}>{c.sl}</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <div style={{
        paddingTop: 20, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>UC.WORK · CATALOG</span>
        <a href="#" className="uc-link" style={{ fontSize: 12 }}>See full archive <span>→</span></a>
      </div>
    </section>
  );
}

// ─── 03 FEATURED IMMERSIVE ────────────────────────────────────────────────
function V3Featured() {
  return (
    <section data-poster="3" style={{
      background: 'var(--uc-black)', color: 'var(--uc-paper)',
      minHeight: '100vh', padding: '32px 32px 32px',
      position: 'relative', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', borderTop: '1px solid var(--line-1)'
    }}>
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'rgba(255,255,255,0.03)',
        WebkitMaskImage: `url(${window.__resources.bgVector1})`,
        maskImage: `url(${window.__resources.bgVector1})`,
        WebkitMaskSize: 'cover', maskSize: 'cover',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center', maskPosition: 'center'
      }}/>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20, borderBottom: '1px solid #1F1F1F'
      }}>
        <PageMark label="Featured" dark noNumber/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-stone-500)' }}>
          ULE GROUP · 1M+ SKU B2B
        </div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(40px, 5vh, 64px)',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: 'clamp(32px, 5vw, 96px)', alignItems: 'center'
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'var(--uc-signal)', marginBottom: 24
          }}>↳ Pick of the volume</div>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.045em', lineHeight: 0.92,
            fontSize: 'clamp(40px, 6vw, 100px)',
            color: 'var(--uc-paper)', textWrap: 'balance'
          }}>
            One million SKUs.{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--uc-stone-300)' }}>
              On Shopify B2B.
            </span>
          </h2>

          <p style={{
            marginTop: 28, maxWidth: 540,
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.4vw, 19px)',
            lineHeight: 1.5, color: 'var(--uc-stone-300)'
          }}>
            We replatformed ULE Group&rsquo;s industrial distribution business from a
            custom legacy cart to Shopify Plus, with Algolia search, Klaviyo lifecycle,
            and Epicor ERP sync. The numbers moved in the first quarter.
          </p>

          <div style={{
            marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 0,
            borderTop: '1px solid #1F1F1F', borderBottom: '1px solid #1F1F1F'
          }}>
            {[
              { v: '6×',   l: 'Online sales' },
              { v: '559%', l: 'Website traffic YOY' }
            ].map((s, i) => (
              <div key={i} style={{
                padding: '24px 28px 24px 0',
                paddingLeft: i > 0 ? 32 : 0,
                borderLeft: i > 0 ? '1px solid #1F1F1F' : 'none',
                position: 'relative'
              }}>
                <span aria-hidden="true" style={{
                  position: 'absolute', top: 0, left: i > 0 ? 32 : 0,
                  width: 16, height: 2, background: 'var(--uc-signal)'
                }}/>
                <div style={{
                  fontFamily: 'var(--font-hero)', fontWeight: 800,
                  fontSize: 'clamp(48px, 5vw, 88px)',
                  letterSpacing: '-0.05em', lineHeight: 0.88,
                  color: 'var(--uc-paper)'
                }}>{s.v}</div>
                <div style={{
                  marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--uc-stone-500)'
                }}>{s.l}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a href="#" className="uc-btn b-signal">Read the case study <span>→</span></a>
            <a href="#" className="uc-link uc-link-light">View next case <span>→</span></a>
          </div>
        </div>

        <div style={{
          position: 'relative', aspectRatio: '4/5', minHeight: 480,
          background: '#0F0F0F', border: '1px solid #1F1F1F',
          borderRadius: 5, overflow: 'hidden'
        }}>
          <image-slot
            id="v2-featured"
            shape="rect" radius="5"
            placeholder="ULE Group · 64,920-SKU search results · B2B quote module"
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>
      </div>

      <div style={{
        paddingTop: 20, borderTop: '1px solid #1F1F1F',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-stone-500)'
      }}>
        <span>UC.WORK · FEATURED</span>
        <span>SHOPIFY PLUS · EPICOR · ALGOLIA · KLAVIYO</span>
      </div>
    </section>
  );
}

// ─── 04 NUMBERS ──────────────────────────────────────────────────────────
function V4Numbers() {
  const stats = [
    { v: '6×',  l: 'lift in online sales',     who: 'ULE Group · 2024' },
    { v: '40%', l: 'increase in revenue',      who: 'Vosges · 2024' },
    { v: '38%', l: 'lower TCO',                who: 'KOOKS · 2024' },
    { v: '14h', l: 'returned to sales weekly', who: 'Agri Drain · 2023' }
  ];
  return (
    <section data-poster="4" style={{
      background: 'var(--uc-cream)', minHeight: '100vh',
      padding: '32px 32px 32px', position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      borderTop: '1px solid var(--line-1)'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20, borderBottom: '1px solid var(--line-1)'
      }}>
        <PageMark label="By the Numbers" noNumber/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          ACROSS 380+ ENGAGEMENTS
        </div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(40px, 5vh, 64px)',
        display: 'flex', flexDirection: 'column', gap: 56,
        justifyContent: 'center'
      }}>
        <h2 style={{
          margin: 0,
          fontFamily: 'var(--font-hero)', fontWeight: 700,
          letterSpacing: '-0.045em', lineHeight: 0.92,
          fontSize: 'clamp(40px, 6vw, 96px)',
          color: 'var(--fg-1)',
          maxWidth: 900
        }}>
          Four numbers,{' '}
          <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>four operators.</span>
        </h2>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0, borderTop: '1px solid var(--line-1)', borderBottom: '1px solid var(--line-1)'
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              padding: 28,
              borderLeft: i > 0 ? '1px solid var(--line-1)' : 'none',
              position: 'relative'
            }}>
              <span aria-hidden="true" style={{
                position: 'absolute', top: 0, left: 28,
                width: 18, height: 2, background: 'var(--uc-signal)'
              }}/>
              <div style={{
                fontFamily: 'var(--font-hero)', fontWeight: 800,
                fontSize: 'clamp(64px, 7vw, 120px)',
                letterSpacing: '-0.055em', lineHeight: 0.85,
                color: 'var(--fg-1)'
              }}>{s.v}</div>
              <div style={{
                marginTop: 16,
                fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
                color: 'var(--fg-1)', letterSpacing: '-0.005em'
              }}>{s.l}</div>
              <div style={{
                marginTop: 4,
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: 'var(--fg-3)', letterSpacing: '0.06em'
              }}>{s.who}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        paddingTop: 20, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>UC.WORK · MEASURED</span>
        <span>↳ Approach below</span>
      </div>
    </section>
  );
}

// ─── 05 APPROACH ─────────────────────────────────────────────────────────
function V5Approach() {
  const steps = [
    {
      n: '01', t: 'Blueprint',
      d: 'Strategy, architecture, and a budget that holds up under scrutiny. 4–6 weeks.',
      bullets: ['ERP + commerce mapping', 'Replatforming risk model', 'Phased rollout plan']
    },
    {
      n: '02', t: 'Commerce',
      d: 'Fixed-scope build on Shopify Plus. Senior team, no surprise invoices.',
      bullets: ['Architecture + design', 'Data migration', 'Integrations + launch']
    },
    {
      n: '03', t: 'Growth',
      d: 'Ongoing managed services across revenue, retention, and ops.',
      bullets: ['AOV + conversion programs', 'Lifecycle automation', 'Quarterly roadmap']
    }
  ];
  return (
    <section data-poster="5" style={{
      background: 'var(--uc-paper)', minHeight: '100vh',
      padding: '32px 32px 32px', position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      borderTop: '1px solid var(--line-1)'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20, borderBottom: '1px solid var(--line-1)'
      }}>
        <PageMark label="How we build" noNumber/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          BLUEPRINT → COMMERCE → GROWTH
        </div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(40px, 5vh, 64px)',
        display: 'flex', flexDirection: 'column', gap: 40
      }}>
        <h2 style={{
          margin: 0,
          fontFamily: 'var(--font-hero)', fontWeight: 700,
          letterSpacing: '-0.045em', lineHeight: 0.92,
          fontSize: 'clamp(40px, 6vw, 96px)',
          color: 'var(--fg-1)',
          maxWidth: 1000, textWrap: 'balance'
        }}>
          A short path.{' '}
          <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>
            With three good stops.
          </span>
        </h2>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16
        }}>
          {steps.map(s => (
            <div key={s.n} style={{
              padding: 28,
              background: 'var(--uc-paper)',
              border: '1px solid var(--line-2)', borderRadius: 5,
              display: 'flex', flexDirection: 'column', gap: 18,
              minHeight: 360
            }}>
              <div style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
                }}>{s.n}</span>
                <span style={{
                  width: 16, height: 2, background: 'var(--uc-signal)'
                }}/>
              </div>
              <div style={{
                fontFamily: 'var(--font-hero)', fontWeight: 700,
                fontSize: 'clamp(28px, 3vw, 44px)',
                letterSpacing: '-0.04em', lineHeight: 0.95,
                color: 'var(--fg-1)'
              }}>{s.t}</div>
              <div style={{
                fontFamily: 'var(--font-serif)', fontSize: 15,
                color: 'var(--fg-2)', lineHeight: 1.5
              }}>{s.d}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
                {s.bullets.map(b => (
                  <li key={b} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    color: 'var(--fg-1)', letterSpacing: 0
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: 999,
                      background: 'var(--uc-signal)'
                    }}/>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
          <a href="#" className="uc-btn b-primary">Start a project <span>→</span></a>
        </div>
      </div>

      <div style={{
        paddingTop: 20, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>UC.WORK · APPROACH</span>
        <span>SAME TEAM · EVERY STOP</span>
      </div>
    </section>
  );
}

window.V1Cover = V1Cover;
window.V2Catalog = V2Catalog;
window.V3Featured = V3Featured;
window.V4Numbers = V4Numbers;
window.V5Approach = V5Approach;
