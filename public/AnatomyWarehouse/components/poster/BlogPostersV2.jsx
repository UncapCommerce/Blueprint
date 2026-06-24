// BlogPostersV2.jsx — Creative editorial direction (rewrite).
// Stronger magazine identity, sharper layouts, more rhythm.
//   01 Cover · oversized stencil-style with side rail and footnotes
//   02 Long-read · drop-cap + sidebar pull-quotes
//   03 Index · vertical type set + frame-counter spreads
//   04 Streams · dial chart with stream weights
//   05 Subscribe · postcard with stamp + interactive line

const V2_POSTS = [
  { n: '01', cat: 'Operators',    title: 'No more duct-taped solutions.',             read: '6 min',  d: 'May 22',  au: 'Dyli' },
  { n: '02', cat: 'Migration',    title: 'Replatforming without breaking the team.',  read: '9 min',  d: 'May 14',  au: 'Ramirez' },
  { n: '03', cat: 'B2B',          title: 'The case for NET-30 inside Shopify.',       read: '7 min',  d: 'May 04',  au: 'Whitaker' },
  { n: '04', cat: 'Growth',       title: 'AOV, but for the operator.',                read: '5 min',  d: 'Apr 26',  au: 'Shah' },
  { n: '05', cat: 'Agentic',      title: 'AI agents in commerce: where they pay.',    read: '11 min', d: 'Apr 14',  au: 'Lin' },
  { n: '06', cat: 'Distribution', title: 'One million SKUs, one source of truth.',    read: '8 min',  d: 'Apr 02',  au: 'Park' }
];

// ─── 01 COVER ─────────────────────────────────────────────────────────────
function BV1Masthead() {
  const [r, setR] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setR(true), 80); return () => clearTimeout(t); }, []);
  return (
    <section data-poster="1" style={{
      background: 'var(--uc-cream)', minHeight: '100vh',
      padding: '32px 32px 32px', position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      borderTop: '1px solid var(--line-1)',
      borderBottom: '1px solid var(--line-1)'
    }}>
      {/* Backdrop grid mask */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background:
          'linear-gradient(rgba(10,10,10,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(10,10,10,0.04) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 50%, transparent 100%)',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 50%, transparent 100%)'
      }}/>

      {/* TOP rail */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20, borderBottom: '1px solid var(--line-1)',
        position: 'relative', zIndex: 1
      }}>
        <PageMark label="Field Notes" noNumber/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          ISSUE 42 · MAY 2026 · CHICAGO · UC.DISPATCH
        </div>
      </div>

      {/* Body — type fills the page */}
      <div style={{
        flex: 1, position: 'relative', zIndex: 1,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: 'clamp(24px, 4vw, 56px)',
        paddingTop: 'clamp(24px, 4vh, 48px)'
      }}>
        {/* Left — the masthead block */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Number tag + tagline */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 18 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontWeight: 800,
              fontSize: 14, letterSpacing: '0.18em', color: 'var(--fg-1)',
              padding: '6px 10px', border: '1px solid var(--fg-1)'
            }}>№ 42</span>
            <span style={{
              fontFamily: 'var(--font-serif)', fontStyle: 'italic',
              fontSize: 'clamp(15px, 1.4vw, 19px)', color: 'var(--fg-2)'
            }}>
              The operator&rsquo;s dispatch, monthly from Chicago.
            </span>
          </div>

          {/* Mega title */}
          <h1 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.07em', lineHeight: 0.8,
            color: 'var(--fg-1)'
          }}>
            <span className={`uc-rise ${r ? 'in' : ''}`} style={{
              display: 'block', fontSize: 'clamp(96px, 20vw, 320px)'
            }}>Field</span>
            <span className={`uc-rise ${r ? 'in' : ''}`} style={{
              display: 'block', fontSize: 'clamp(96px, 20vw, 320px)',
              fontFamily: 'var(--font-serif)', fontWeight: 400,
              letterSpacing: '-0.06em',
              paddingLeft: 'clamp(40px, 8vw, 200px)',
              transitionDelay: '90ms'
            }}>notes.</span>
          </h1>

          {/* Cover-line strip */}
          <div style={{
            marginTop: 'clamp(32px, 5vh, 56px)',
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 0,
            borderTop: '1px solid var(--line-1)',
            borderBottom: '1px solid var(--line-1)'
          }}>
            {[
              { kicker: 'COVER',  t: 'No more duct-taped solutions.',     p: '06', read: '6m' },
              { kicker: 'INSIDE', t: 'Replatforming without breaking it.', p: '18', read: '9m' },
              { kicker: 'COLUMN', t: 'NET-30 inside Shopify.',             p: '24', read: '7m' }
            ].map((c, i) => (
              <a key={i} href="#" style={{
                padding: '20px 22px 20px 0',
                paddingLeft: i > 0 ? 22 : 0,
                borderLeft: i > 0 ? '1px solid var(--line-1)' : 'none',
                position: 'relative',
                textDecoration: 'none', color: 'var(--fg-1)',
                display: 'flex', flexDirection: 'column', gap: 6
              }}>
                <span aria-hidden="true" style={{
                  position: 'absolute', top: -1, left: i > 0 ? 22 : 0,
                  width: 28, height: 2, background: 'var(--uc-signal)'
                }}/>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.18em', color: 'var(--fg-3)',
                  paddingTop: 8
                }}>{c.kicker} · p. {c.p}</span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: 'clamp(15px, 1.3vw, 19px)',
                  letterSpacing: '-0.012em', lineHeight: 1.2,
                  color: 'var(--fg-1)', textWrap: 'pretty'
                }}>{c.t}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)'
                }}>{c.read} read</span>
              </a>
            ))}
          </div>
        </div>

        {/* Right — vertical spine with footnotes */}
        <aside style={{
          display: 'flex', flexDirection: 'column', alignItems: 'stretch',
          width: 'clamp(140px, 12vw, 200px)',
          borderLeft: '1px solid var(--line-1)',
          paddingLeft: 18,
          position: 'relative'
        }}>
          <div style={{
            writingMode: 'vertical-rl', transform: 'rotate(180deg)',
            fontFamily: 'var(--font-mono)', fontWeight: 700,
            fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase',
            color: 'var(--fg-3)', alignSelf: 'flex-start',
            padding: '12px 0'
          }}>UNCAP · CHICAGO · 41.8°N 87.6°W</div>

          <div style={{
            marginTop: 'auto',
            paddingTop: 18,
            borderTop: '1px solid var(--line-1)',
            display: 'flex', flexDirection: 'column', gap: 18
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-3)',
                marginBottom: 6
              }}>Editor</div>
              <div style={{
                fontFamily: 'var(--font-serif)', fontWeight: 400,
                fontSize: 14, color: 'var(--fg-1)', lineHeight: 1.4
              }}>D. Dyli · A. Ramirez</div>
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-3)',
                marginBottom: 6
              }}>Set in</div>
              <div style={{
                fontFamily: 'var(--font-serif)', fontWeight: 400,
                fontSize: 14, color: 'var(--fg-1)', lineHeight: 1.4
              }}>Inter · Fraunces · JetBrains Mono</div>
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-3)',
                marginBottom: 6
              }}>Frequency</div>
              <div style={{
                fontFamily: 'var(--font-serif)', fontWeight: 400,
                fontSize: 14, color: 'var(--fg-1)', lineHeight: 1.4
              }}>Monthly · last working day</div>
            </div>
          </div>
        </aside>
      </div>

      {/* BOTTOM rail */}
      <div style={{
        paddingTop: 20,
        borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)',
        position: 'relative', zIndex: 1
      }}>
        <span>↳ Open the issue</span>
        <span>VOL XIV · NO. 5 · 2026</span>
      </div>
    </section>
  );
}

// ─── 02 LONG-READ ────────────────────────────────────────────────────────
function BV2ContactSheet() {
  return (
    <section data-poster="2" style={{
      background: 'var(--uc-paper)', minHeight: '100vh',
      padding: '32px 32px 32px', position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20, borderBottom: '1px solid var(--line-1)'
      }}>
        <PageMark label="Long-read" noNumber/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          P. 06 · OPERATORS · 6 MIN
        </div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(32px, 4vh, 56px)',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)',
        gap: 'clamp(40px, 5vw, 80px)'
      }}>
        {/* Article column */}
        <article style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-3)',
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <span style={{
              background: 'var(--uc-signal)', color: 'var(--uc-black)',
              padding: '3px 8px'
            }}>COVER ESSAY</span>
            <span>By Denis Dyli, Founder</span>
          </div>

          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.045em', lineHeight: 0.95,
            fontSize: 'clamp(36px, 5vw, 88px)',
            color: 'var(--fg-1)', textWrap: 'balance'
          }}>
            No more duct-taped solutions.{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--fg-2)' }}>
              Enterprise tech, without the enterprise price tag.
            </span>
          </h2>

          {/* Drop-cap two-column body */}
          <div style={{
            columnCount: 2, columnGap: 36, columnRule: '1px solid var(--line-1)',
            fontFamily: 'var(--font-serif)', fontWeight: 400,
            fontSize: 'clamp(14px, 1.1vw, 16px)', lineHeight: 1.6,
            color: 'var(--fg-1)', textWrap: 'pretty'
          }}>
            <span style={{
              float: 'left', fontFamily: 'var(--font-hero)', fontWeight: 800,
              fontSize: 'clamp(56px, 5.8vw, 104px)', lineHeight: 0.86,
              padding: '6px 12px 0 0', color: 'var(--fg-1)'
            }}>M</span>
            ost operations still run on a stack that wasn&rsquo;t built to work together.
            Aging storefronts that cost more every year. Spreadsheets running inventory.
            Quote requests scattered across emails. ERPs that don&rsquo;t talk to anything
            else.
            <br/><br/>
            Online and offline never quite meet. It&rsquo;s not for lack of effort. The
            platforms that actually unify operations were built for the enterprise.
            Priced for the enterprise. Half-million-dollar implementations. Year-long
            integrations. Run by ops teams the size of small companies.
            <br/><br/>
            The operator-led businesses that drive the economy were left to make do.
            Uncap exists to close that gap.
          </div>

          <div style={{
            paddingTop: 20, borderTop: '1px solid var(--line-1)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 16, flexWrap: 'wrap'
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-3)'
            }}>↳ Continued on p. 08</span>
            <a href="#" className="uc-btn b-primary" style={{ padding: '10px 16px', fontSize: 13 }}>
              Read the essay <span>→</span>
            </a>
          </div>
        </article>

        {/* Right — pull quote + meta + thumbnail */}
        <aside style={{
          display: 'flex', flexDirection: 'column', gap: 28,
          paddingLeft: 'clamp(20px, 2vw, 40px)',
          borderLeft: '1px solid var(--line-1)'
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-3)'
          }}>Pull quote</div>

          <blockquote style={{
            margin: 0,
            fontFamily: 'var(--font-serif)', fontStyle: 'italic',
            fontWeight: 400, fontSize: 'clamp(22px, 2.4vw, 36px)',
            letterSpacing: '-0.02em', lineHeight: 1.2,
            color: 'var(--fg-1)', textWrap: 'pretty',
            position: 'relative', paddingLeft: 18
          }}>
            <span aria-hidden="true" style={{
              position: 'absolute', left: 0, top: 4, bottom: 4,
              width: 3, background: 'var(--uc-signal)'
            }}/>
            &ldquo;Same caliber of technology. Without the enterprise drag.&rdquo;
          </blockquote>

          <div style={{
            aspectRatio: '4/3', background: 'var(--uc-stone-200)',
            border: '1px solid var(--line-1)', borderRadius: 4,
            overflow: 'hidden', position: 'relative'
          }}>
            <image-slot
              id="blogv2-essay"
              shape="rect" radius="4"
              placeholder="Editorial photo · operator at workstation · warm documentary"
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          </div>

          <div style={{
            paddingTop: 18, borderTop: '1px solid var(--line-1)',
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 14, fontFamily: 'var(--font-mono)', fontSize: 11
          }}>
            <div>
              <div style={{ color: 'var(--fg-3)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Time</div>
              <div style={{ color: 'var(--fg-1)' }}>6 min</div>
            </div>
            <div>
              <div style={{ color: 'var(--fg-3)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Words</div>
              <div style={{ color: 'var(--fg-1)' }}>1,420</div>
            </div>
            <div>
              <div style={{ color: 'var(--fg-3)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Topic</div>
              <div style={{ color: 'var(--fg-1)' }}>Operators</div>
            </div>
            <div>
              <div style={{ color: 'var(--fg-3)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Filed</div>
              <div style={{ color: 'var(--fg-1)' }}>May 22, 2026</div>
            </div>
          </div>
        </aside>
      </div>

      <div style={{
        paddingTop: 20, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>UC.DISPATCH · LONG-READ</span>
        <span>↳ The index below</span>
      </div>
    </section>
  );
}

// ─── 03 INDEX — vertical type set ────────────────────────────────────────
function BV3Series() {
  return (
    <section data-poster="3" style={{
      background: 'var(--uc-cream)', minHeight: '100vh',
      padding: '32px 32px 32px', position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      borderTop: '1px solid var(--line-1)',
      borderBottom: '1px solid var(--line-1)'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20, borderBottom: '1px solid var(--line-1)'
      }}>
        <PageMark label="The Index" noNumber/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          6 ESSAYS · ISSUE 42 · TABLE OF CONTENTS
        </div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(32px, 4vh, 56px)',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)',
        gap: 'clamp(32px, 5vw, 80px)', alignItems: 'start'
      }}>
        <div style={{ position: 'sticky', top: 100 }}>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.05em', lineHeight: 0.88,
            fontSize: 'clamp(48px, 7vw, 128px)',
            color: 'var(--fg-1)', textWrap: 'balance'
          }}>
            The{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>index.</span>
          </h2>
          <p style={{
            marginTop: 20, maxWidth: 360,
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)',
            lineHeight: 1.5, color: 'var(--fg-2)'
          }}>
            Six essays. One issue. Pick your entry. Each one stands on its own.
          </p>
          <div style={{
            marginTop: 28, display: 'flex', alignItems: 'center', gap: 14,
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)',
            letterSpacing: '0.06em', textTransform: 'uppercase'
          }}>
            <span style={{ color: 'var(--uc-signal)', background: 'var(--uc-black)', padding: '3px 8px', fontWeight: 700 }}>↳ NEW</span>
            <span>This month · 6 published</span>
          </div>
        </div>

        {/* Vertical type list with frame counters */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          borderTop: '1px solid var(--line-1)'
        }}>
          {V2_POSTS.map(p => (
            <a key={p.n} href="#" style={{
              padding: '24px 0', textDecoration: 'none', color: 'var(--fg-1)',
              borderBottom: '1px solid var(--line-1)',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 48px) minmax(0, 1fr) minmax(0, auto)',
              gap: 'clamp(16px, 2vw, 32px)', alignItems: 'baseline',
              position: 'relative'
            }}>
              <span aria-hidden="true" style={{
                position: 'absolute', top: 0, left: 0,
                width: 14, height: 2, background: 'var(--uc-signal)'
              }}/>
              <span style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                fontSize: 28, color: 'var(--fg-3)', lineHeight: 1
              }}>{p.n}</span>
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.16em', textTransform: 'uppercase',
                  color: 'var(--fg-3)', marginBottom: 8
                }}>
                  <span>{p.cat}</span>
                  <span style={{ width: 12, height: 1, background: 'var(--line-1)' }}/>
                  <span>{p.au}</span>
                  <span style={{ width: 12, height: 1, background: 'var(--line-1)' }}/>
                  <span>{p.read}</span>
                </div>
                <div style={{
                  fontFamily: 'var(--font-hero)', fontWeight: 700,
                  fontSize: 'clamp(22px, 2.4vw, 36px)',
                  letterSpacing: '-0.028em', lineHeight: 1.05,
                  color: 'var(--fg-1)', textWrap: 'balance'
                }}>{p.title}</div>
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'var(--fg-3)', whiteSpace: 'nowrap'
              }}>{p.d}</span>
            </a>
          ))}
        </div>
      </div>

      <div style={{
        paddingTop: 20, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>UC.DISPATCH · INDEX</span>
        <a href="#" className="uc-link" style={{ fontSize: 12 }}>
          See archive <span>→</span>
        </a>
      </div>
    </section>
  );
}

// ─── 04 STREAMS — dial visualization ─────────────────────────────────────
function BV4Streams() {
  const streams = [
    { n: '01', l: 'Operators',    c: 14, pct: 19 },
    { n: '02', l: 'Migration',    c: 9,  pct: 12 },
    { n: '03', l: 'B2B',          c: 21, pct: 28 },
    { n: '04', l: 'Growth',       c: 18, pct: 24 },
    { n: '05', l: 'Distribution', c: 7,  pct: 10 },
    { n: '06', l: 'Agentic',      c: 5,  pct: 7  }
  ];
  return (
    <section data-poster="4" style={{
      background: 'var(--uc-black)', color: 'var(--uc-paper)',
      minHeight: '100vh', padding: '32px 32px 32px',
      position: 'relative', display: 'flex', flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'rgba(255,255,255,0.03)',
        WebkitMaskImage: `url(${window.__resources.bgVector3})`,
        maskImage: `url(${window.__resources.bgVector3})`,
        WebkitMaskSize: 'cover', maskSize: 'cover',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center', maskPosition: 'center'
      }}/>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20, borderBottom: '1px solid #1F1F1F'
      }}>
        <PageMark label="Streams" dark noNumber/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-stone-500)' }}>
          BY TOPIC · 6 STREAMS · 74 ESSAYS
        </div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(40px, 5vh, 64px)',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)',
        gap: 'clamp(40px, 6vw, 80px)', alignItems: 'center'
      }}>
        {/* Dial / weighted bars */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 24
        }}>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.045em', lineHeight: 0.92,
            fontSize: 'clamp(40px, 6vw, 96px)',
            color: 'var(--uc-paper)'
          }}>
            By the<br/>
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--uc-stone-300)' }}>
              stream weight.
            </span>
          </h2>
          <p style={{
            margin: 0, maxWidth: 440,
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)',
            lineHeight: 1.5, color: 'var(--uc-stone-300)'
          }}>
            What we&rsquo;ve been writing about most. Each bar is the share of the
            archive, not the recency. B2B dominates because operators dominate.
          </p>
        </div>

        {/* Right — bars */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          borderTop: '1px solid #1F1F1F'
        }}>
          {streams.map(s => (
            <a key={s.n} href="#" style={{
              padding: '22px 0', textDecoration: 'none', color: 'var(--uc-paper)',
              borderBottom: '1px solid #1F1F1F',
              display: 'grid', gridTemplateColumns: 'minmax(0, 36px) minmax(0, 1fr) minmax(0, auto)',
              gap: 18, alignItems: 'center'
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-stone-500)'
              }}>{s.n}</span>
              <div>
                <div style={{
                  display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                  marginBottom: 8
                }}>
                  <span style={{
                    fontFamily: 'var(--font-hero)', fontWeight: 700,
                    fontSize: 'clamp(22px, 2.2vw, 32px)',
                    letterSpacing: '-0.025em',
                    color: 'var(--uc-paper)'
                  }}>{s.l}</span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    color: 'var(--uc-stone-500)', letterSpacing: 0
                  }}>{s.c} essays · {s.pct}%</span>
                </div>
                {/* weighted bar */}
                <div style={{
                  position: 'relative', height: 6,
                  background: '#1F1F1F', borderRadius: 999, overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute', top: 0, bottom: 0, left: 0,
                    width: `${s.pct * 3.2}%`,
                    background: 'var(--uc-signal)',
                    borderRadius: 999
                  }}/>
                </div>
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 14,
                color: 'var(--uc-stone-300)'
              }}>→</span>
            </a>
          ))}
        </div>
      </div>

      <div style={{
        paddingTop: 20, borderTop: '1px solid #1F1F1F',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-stone-500)'
      }}>
        <span>UC.DISPATCH · WEIGHTS</span>
        <span>74 PUBLISHED · 12 IN DRAFT</span>
      </div>
    </section>
  );
}

// ─── 05 SUBSCRIBE — postcard with stamp + interactive ─────────────────────
function BV5Subscribe() {
  return (
    <section data-poster="5" style={{
      background: 'var(--uc-cream)', minHeight: '100vh',
      padding: '32px 32px 32px', position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      borderTop: '1px solid var(--line-1)'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20, borderBottom: '1px solid var(--line-1)'
      }}>
        <PageMark label="Subscribe" noNumber/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          POSTED MONTHLY · NO FILLER
        </div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(40px, 5vh, 80px)',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
        gap: 'clamp(40px, 6vw, 96px)', alignItems: 'center'
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--fg-3)', marginBottom: 24
          }}>↳ One stamp · no spam</div>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.05em', lineHeight: 0.88,
            fontSize: 'clamp(48px, 7vw, 128px)',
            color: 'var(--fg-1)', textWrap: 'balance'
          }}>
            Get the issue{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>in your inbox.</span>
          </h2>
          <p style={{
            marginTop: 28, maxWidth: 540,
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)',
            lineHeight: 1.5, color: 'var(--fg-2)'
          }}>
            One dispatch, the last working day of each month. The cover essay,
            two playbooks, and what shipped. No drips, no welcome series.
          </p>

          <div style={{
            marginTop: 36, display: 'flex', gap: 8, maxWidth: 520, flexWrap: 'wrap'
          }}>
            <input type="email" placeholder="your@email.com" style={{
              flex: 1, minWidth: 240, padding: '14px 16px',
              background: 'var(--uc-paper)', border: '1px solid var(--line-2)',
              borderRadius: 5, fontFamily: 'var(--font-sans)',
              fontSize: 14, color: 'var(--fg-1)', outline: 'none'
            }}/>
            <button className="uc-btn b-primary" style={{ padding: '14px 22px' }}>
              Subscribe <span>→</span>
            </button>
          </div>
          <div style={{
            marginTop: 14,
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
          }}>
            4,200+ operators reading · Unsubscribe in one click
          </div>
        </div>

        {/* Postcard */}
        <div style={{
          position: 'relative',
          background: 'var(--uc-paper)',
          border: '1px solid var(--line-2)',
          borderRadius: 4,
          padding: '32px 36px',
          transform: 'rotate(-1.5deg)',
          boxShadow: '0 18px 32px -16px rgba(10,10,10,0.18)'
        }}>
          {/* Stamp */}
          <div style={{
            position: 'absolute', top: 16, right: 16,
            width: 88, height: 100,
            border: '1px dashed var(--fg-1)',
            background: 'var(--uc-bone)',
            padding: '8px 6px 6px',
            display: 'flex', flexDirection: 'column', gap: 6,
            alignItems: 'center', justifyContent: 'space-between',
            textAlign: 'center'
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700,
              color: 'var(--fg-3)', letterSpacing: '0.18em'
            }}>USPS · 2026</div>
            <div style={{
              width: 32, height: 32, borderRadius: 999,
              background: 'var(--uc-signal)',
              border: '1px solid var(--uc-black)'
            }}/>
            <div style={{
              fontFamily: 'var(--font-hero)', fontWeight: 800,
              fontSize: 18, color: 'var(--fg-1)', letterSpacing: '-0.03em'
            }}>UC·42</div>
          </div>

          {/* Cancellation mark */}
          <div aria-hidden="true" style={{
            position: 'absolute', top: 70, right: 110,
            width: 96, height: 96, borderRadius: 999,
            border: '1px solid var(--fg-3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: 'rotate(-12deg)',
            opacity: 0.5
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
              color: 'var(--fg-3)', textAlign: 'center', lineHeight: 1.2,
              letterSpacing: '0.08em'
            }}>
              CHICAGO IL<br/>
              ★ MAY 26 ★<br/>
              UC.DISPATCH
            </div>
          </div>

          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'var(--fg-3)', marginBottom: 12
          }}>↳ Postmarked Chicago</div>

          <div style={{
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            fontSize: 'clamp(28px, 3.2vw, 48px)',
            letterSpacing: '-0.035em', lineHeight: 1.0,
            color: 'var(--fg-1)', maxWidth: 320
          }}>
            This month&rsquo;s dispatch.
          </div>

          <div style={{
            marginTop: 24, display: 'flex', flexDirection: 'column', gap: 4,
            fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--fg-2)'
          }}>
            <div>To: <span style={{ color: 'var(--fg-1)', fontWeight: 600 }}>4,200+ operators</span></div>
            <div>From: <span style={{ color: 'var(--fg-1)', fontWeight: 600 }}>Uncap · Chicago, IL</span></div>
            <div>Re: <span style={{ color: 'var(--fg-1)', fontWeight: 600 }}>Field Notes № 42</span></div>
          </div>

          <div style={{
            marginTop: 24, paddingTop: 16,
            borderTop: '1px dashed var(--fg-3)',
            fontFamily: 'var(--font-serif)', fontStyle: 'italic',
            fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.5,
            maxWidth: 360
          }}>
            One essay, two playbooks, the month&rsquo;s shipping log. Read it in five.
            Print it for the team if you want.
          </div>
        </div>
      </div>

      <div style={{
        paddingTop: 20, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>UC.DISPATCH · MAILROOM</span>
        <span>SET IN INTER + FRAUNCES + JETBRAINS MONO</span>
      </div>
    </section>
  );
}

window.BV1Masthead = BV1Masthead;
window.BV2ContactSheet = BV2ContactSheet;
window.BV3Series = BV3Series;
window.BV4Streams = BV4Streams;
window.BV5Subscribe = BV5Subscribe;
