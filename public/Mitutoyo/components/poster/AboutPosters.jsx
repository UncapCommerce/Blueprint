// AboutPosters.jsx — 5 posters for the About page.
//   01 Cover — Operator-led
//   02 The story (timeline)
//   03 By the numbers (firm facts)
//   04 The team
//   05 Partners + values + CTA

function A1Cover() {
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
        WebkitMaskImage: `url(${window.__resources.bgVector1})`,
        maskImage: `url(${window.__resources.bgVector1})`,
        WebkitMaskSize: 'cover', maskSize: 'cover',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center', maskPosition: 'center'
      }}/>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20, borderBottom: '1px solid var(--line-1)'
      }}>
        <PageMark n={1} label="Who we are" total={5}/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          UNCAP · CHICAGO · EST. 2013
        </div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(40px, 5vh, 64px)',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
        gap: 'clamp(32px, 5vw, 80px)', alignItems: 'center'
      }}>
        <h1 style={{
          margin: 0,
          fontFamily: 'var(--font-hero)', fontWeight: 700,
          letterSpacing: '-0.05em', lineHeight: 0.86,
          color: 'var(--fg-1)'
        }}>
          <span className={`uc-rise ${r ? 'in' : ''}`} style={{
            display: 'block', fontSize: 'clamp(64px, 12vw, 200px)'
          }}>Operator-</span>
          <span className={`uc-rise ${r ? 'in' : ''}`} style={{
            display: 'block', fontSize: 'clamp(64px, 12vw, 200px)',
            paddingLeft: 'clamp(40px, 7vw, 140px)', transitionDelay: '90ms',
            fontFamily: 'var(--font-serif)', fontWeight: 400
          }}>led, since day one.</span>
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p style={{
            margin: 0, maxWidth: 480,
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(16px, 1.4vw, 20px)',
            lineHeight: 1.5, color: 'var(--fg-2)'
          }}>
            We are a Shopify Platinum Partner, building on Shopify since 2013.
            Hundreds of operator-led brands, manufacturers, and distributors trust us
            to uncap their commerce.
          </p>
          <div style={{
            padding: 20, background: 'var(--uc-paper)',
            border: '1px solid var(--line-2)', borderRadius: 5,
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0
          }}>
            {[
              { v: '380+', l: 'Projects' },
              { v: '13y',  l: 'On Shopify' },
              { v: 'CHI',  l: 'Headquarters' }
            ].map((s, i) => (
              <div key={i} style={{
                paddingLeft: i > 0 ? 16 : 0,
                borderLeft: i > 0 ? '1px solid var(--line-1)' : 'none'
              }}>
                <div style={{
                  fontFamily: 'var(--font-hero)', fontWeight: 800,
                  fontSize: 'clamp(28px, 3vw, 44px)',
                  letterSpacing: '-0.04em', lineHeight: 0.9,
                  color: 'var(--fg-1)'
                }}>{s.v}</div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'var(--fg-3)', marginTop: 6
                }}>{s.l}</div>
              </div>
            ))}
          </div>
          <a href="#talk" className="uc-btn b-primary" style={{ alignSelf: 'flex-start' }}>
            Read our story <span>→</span>
          </a>
        </div>
      </div>

      <div style={{
        paddingTop: 20, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>↳ The story below</span>
        <span>UC.ABOUT · COVER</span>
      </div>
    </section>
  );
}

// ─── 02 STORY / TIMELINE ──────────────────────────────────────────────────
function A2Story() {
  const events = [
    { y: '2013', t: 'Founded',          d: 'Pivofy, Inc. begins building on Shopify for operator-led teams.' },
    { y: '2017', t: 'Shopify Plus',     d: 'Certified Plus Partner. Begin replatforming enterprise carts.' },
    { y: '2020', t: 'B2B + Distribution', d: 'First 1M+ SKU launches. Quote-to-cash workflows native to Shopify.' },
    { y: '2023', t: 'Platinum Partner', d: 'Promoted to the top Shopify Partner tier. 300+ projects shipped.' },
    { y: '2024', t: 'Products + Solutions', d: 'Launch native products (Connect, Quotes, DealRoom, Portal, Garage, PartsDiagram).' },
    { y: '2026', t: 'Uncap',            d: 'Rebrand from Pivofy to Uncap. New positioning, same team.' }
  ];
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
        <PageMark n={2} label="Story" total={5}/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          TIMELINE · 13 YEARS
        </div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(40px, 5vh, 64px)',
        display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1fr)',
        gap: 'clamp(32px, 5vw, 80px)', alignItems: 'start'
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.045em', lineHeight: 0.92,
            fontSize: 'clamp(40px, 6vw, 96px)',
            color: 'var(--fg-1)'
          }}>
            A long{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>way</span><br/>
            from where{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>we started.</span>
          </h2>
          <p style={{
            marginTop: 24, maxWidth: 420,
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)',
            lineHeight: 1.45, color: 'var(--fg-2)'
          }}>
            Same crew, same operator-grade approach. We&rsquo;ve just gotten better at it.
          </p>
        </div>

        <div style={{ position: 'relative', paddingLeft: 28 }}>
          <div aria-hidden="true" style={{
            position: 'absolute', left: 6, top: 4, bottom: 4, width: 1,
            background: 'var(--line-1)'
          }}/>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 28 }}>
            {events.map(ev => (
              <li key={ev.y} style={{ position: 'relative' }}>
                <span aria-hidden="true" style={{
                  position: 'absolute', left: -26, top: 6,
                  width: 13, height: 13, borderRadius: 999,
                  background: 'var(--uc-signal)',
                  border: '1px solid var(--uc-black)'
                }}/>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  color: 'var(--fg-3)', letterSpacing: 0, marginBottom: 4
                }}>{ev.y}</div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: 'clamp(20px, 1.8vw, 24px)',
                  letterSpacing: '-0.018em', color: 'var(--fg-1)', marginBottom: 6
                }}>{ev.t}</div>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: 14,
                  color: 'var(--fg-2)', lineHeight: 1.45
                }}>{ev.d}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{
        paddingTop: 20, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>UC.ABOUT · TIMELINE</span>
        <span>2013 → 2026</span>
      </div>
    </section>
  );
}

// ─── 03 NUMBERS ──────────────────────────────────────────────────────────
function A3Numbers() {
  const stats = [
    { v: '380+', l: 'projects shipped' },
    { v: '13y',  l: 'on Shopify' },
    { v: '32',   l: 'engineers + strategists' },
    { v: '4.9★', l: 'on Clutch' }
  ];
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
        WebkitMaskImage: `url(${window.__resources.bgVector2})`,
        maskImage: `url(${window.__resources.bgVector2})`,
        WebkitMaskSize: 'cover', maskSize: 'cover',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center', maskPosition: 'center'
      }}/>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20, borderBottom: '1px solid #1F1F1F'
      }}>
        <PageMark n={3} label="Numbers" total={5} dark/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-stone-500)' }}>
          FIRM · AT A GLANCE
        </div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(40px, 5vh, 64px)',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)',
        gap: 64, alignItems: 'center'
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.045em', lineHeight: 0.92,
            fontSize: 'clamp(40px, 6vw, 96px)',
            color: 'var(--uc-paper)'
          }}>
            What you{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--uc-stone-300)' }}>
              should know.
            </span>
          </h2>
          <p style={{
            marginTop: 24, maxWidth: 440,
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)',
            lineHeight: 1.45, color: 'var(--uc-stone-300)'
          }}>
            Four numbers that say more about us than the bio paragraph would.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 0,
          borderTop: '1px solid #1F1F1F', borderBottom: '1px solid #1F1F1F'
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              padding: 32,
              borderLeft: i % 2 === 1 ? '1px solid #1F1F1F' : 'none',
              borderTop: i >= 2 ? '1px solid #1F1F1F' : 'none',
              position: 'relative'
            }}>
              <span aria-hidden="true" style={{
                position: 'absolute', top: 0, left: 32,
                width: 16, height: 2, background: 'var(--uc-signal)'
              }}/>
              <div style={{
                fontFamily: 'var(--font-hero)', fontWeight: 800,
                fontSize: 'clamp(56px, 6vw, 96px)',
                letterSpacing: '-0.055em', lineHeight: 0.85,
                color: 'var(--uc-paper)'
              }}>{s.v}</div>
              <div style={{
                marginTop: 16, fontFamily: 'var(--font-display)',
                fontSize: 14, fontWeight: 500, color: 'var(--uc-stone-300)',
                letterSpacing: '-0.005em'
              }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        paddingTop: 20, borderTop: '1px solid #1F1F1F',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-stone-500)'
      }}>
        <span>UC.ABOUT · NUMBERS</span>
        <span>UPDATED · 2026·Q2</span>
      </div>
    </section>
  );
}

// ─── 04 TEAM ──────────────────────────────────────────────────────────────
function A4Team() {
  const team = [
    { n: 'Denis Dyli',   r: 'Founder · CEO' },
    { n: 'Ada Ramirez',  r: 'Head of Solutions' },
    { n: 'Marcus Lin',   r: 'Head of Engineering' },
    { n: 'Priya Shah',   r: 'Head of Growth' },
    { n: 'Sam Whitaker', r: 'Director, B2B Practice' },
    { n: 'Lena Park',    r: 'Director, Strategy' },
    { n: 'Theo Brand',   r: 'Principal Engineer' },
    { n: 'Aiko Mori',    r: 'Principal Designer' }
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
        <PageMark n={4} label="Team" total={5}/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          ROSTER · 32 OPERATORS
        </div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(40px, 5vh, 64px)',
        display: 'flex', flexDirection: 'column', gap: 40
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 'clamp(32px, 5vw, 80px)', alignItems: 'end'
        }}>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.045em', lineHeight: 0.92,
            fontSize: 'clamp(40px, 6vw, 96px)',
            color: 'var(--fg-1)'
          }}>
            The people{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>
              who&rsquo;ll do the work.
            </span>
          </h2>
          <p style={{
            margin: 0, maxWidth: 440,
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)',
            lineHeight: 1.45, color: 'var(--fg-2)'
          }}>
            Senior teams from day one. No outsourced overseas QA. No surprise account
            handoffs. The names below are who you&rsquo;ll meet on the first call.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16
        }}>
          {team.map((p, i) => (
            <div key={p.n} style={{
              background: 'var(--uc-paper)',
              border: '1px solid var(--line-2)', borderRadius: 5,
              padding: 16, display: 'flex', flexDirection: 'column', gap: 12
            }}>
              <div style={{
                aspectRatio: '1/1', background: 'var(--uc-stone-200)',
                borderRadius: 4, overflow: 'hidden',
                border: '1px solid var(--line-1)'
              }}>
                <image-slot
                  id={`about-team-${i}`}
                  shape="rect" radius="4"
                  placeholder={p.n}
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: 15, letterSpacing: '-0.012em',
                  color: 'var(--fg-1)'
                }}>{p.n}</div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'var(--fg-3)', marginTop: 4
                }}>{p.r}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        paddingTop: 20, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>UC.ABOUT · TEAM</span>
        <a href="#" className="uc-link" style={{ fontSize: 12 }}>
          See careers <span>→</span>
        </a>
      </div>
    </section>
  );
}

// ─── 05 VALUES + CTA ─────────────────────────────────────────────────────
function A5Values() {
  const vals = [
    { n: '01', t: 'Operator-grade.', d: 'We build for the people running the operation, not the buyer of the platform.' },
    { n: '02', t: 'Honest scopes.',  d: 'Fixed scope, fixed price, fixed timeline. No surprise invoices.' },
    { n: '03', t: 'Senior teams.',   d: 'The team in the pitch is the team in the work. No bait-and-switch.' },
    { n: '04', t: 'Compounding work.', d: 'We stay after launch. Growth is what happens after.' }
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
        <PageMark n={5} label="Values" total={5}/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          HOW WE WORK · 04
        </div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(40px, 5vh, 64px)',
        display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1fr)',
        gap: 'clamp(32px, 5vw, 80px)', alignItems: 'start'
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.045em', lineHeight: 0.92,
            fontSize: 'clamp(40px, 6vw, 96px)',
            color: 'var(--fg-1)'
          }}>
            What we{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>
              stand for.
            </span>
          </h2>
          <p style={{
            marginTop: 24, maxWidth: 420,
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)',
            lineHeight: 1.45, color: 'var(--fg-2)'
          }}>
            Four operating principles. They show up in every engagement, every line of code.
          </p>
          <div style={{ marginTop: 36, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a href="#" className="uc-btn b-primary">Talk to our experts <span>→</span></a>
            <a href="#" className="uc-link">See careers <span>→</span></a>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {vals.map(v => (
            <div key={v.n} style={{
              padding: '28px 0',
              borderTop: '1px solid var(--line-1)',
              display: 'grid', gridTemplateColumns: '60px minmax(0, 1fr)',
              gap: 22, alignItems: 'start'
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-3)'
              }}>{v.n}</span>
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: 'clamp(22px, 2.2vw, 30px)',
                  letterSpacing: '-0.022em', color: 'var(--fg-1)', marginBottom: 8
                }}>{v.t}</div>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: 15,
                  color: 'var(--fg-2)', lineHeight: 1.5
                }}>{v.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        paddingTop: 20, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>UC.ABOUT · VALUES</span>
        <span>↳ Talk below</span>
      </div>
    </section>
  );
}

window.A1Cover = A1Cover;
window.A2Story = A2Story;
window.A3Numbers = A3Numbers;
window.A4Team = A4Team;
window.A5Values = A5Values;
