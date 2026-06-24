// BlogPosters.jsx — 4 posters for the Blog page.
//   01 Index / latest
//   02 Featured essay
//   03 Categories
//   04 Newsletter / archive

function B1Index() {
  const [r, setR] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setR(true), 80); return () => clearTimeout(t); }, []);

  const latest = [
    { n: '01', cat: 'Operators', title: 'No more duct-taped solutions.', read: '6 min', d: 'May 22, 2026' },
    { n: '02', cat: 'Migration', title: 'Replatforming without breaking the team.', read: '9 min', d: 'May 14, 2026' },
    { n: '03', cat: 'B2B',       title: 'The case for NET-30 inside Shopify.', read: '7 min', d: 'May 04, 2026' },
    { n: '04', cat: 'Growth',    title: 'AOV, but for the operator.', read: '5 min', d: 'Apr 26, 2026' },
    { n: '05', cat: 'Agentic',   title: 'AI agents in commerce: where they actually pay.', read: '11 min', d: 'Apr 14, 2026' },
    { n: '06', cat: 'Distribution', title: 'One million SKUs, one source of truth.', read: '8 min', d: 'Apr 02, 2026' }
  ];

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

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20, borderBottom: '1px solid var(--line-1)'
      }}>
        <PageMark n={1} label="Index" total={4}/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          UNCAP · DISPATCH · ISSUE NO. 42
        </div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(40px, 5vh, 64px)',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
        gap: 'clamp(24px, 4vw, 80px)'
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
            }}>Field</span>
            <span className={`uc-rise ${r ? 'in' : ''}`} style={{
              display: 'block', fontSize: 'clamp(64px, 12vw, 200px)',
              paddingLeft: 'clamp(40px, 7vw, 140px)', transitionDelay: '90ms',
              fontFamily: 'var(--font-serif)', fontWeight: 400
            }}>notes.</span>
          </h1>
          <p style={{
            marginTop: 24, maxWidth: 520,
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)',
            lineHeight: 1.45, color: 'var(--fg-2)'
          }}>
            Essays, playbooks, and dispatches from the people who actually do the work.
            No takes. Just what we&rsquo;ve seen.
          </p>
          <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['All', 'Operators', 'Migration', 'B2B', 'Growth', 'Agentic'].map((t, i) => (
              <span key={t} style={{
                padding: '6px 12px', borderRadius: 999,
                background: i === 0 ? 'var(--uc-black)' : 'var(--uc-paper)',
                color: i === 0 ? 'var(--uc-paper)' : 'var(--fg-1)',
                border: '1px solid ' + (i === 0 ? 'var(--uc-black)' : 'var(--line-1)'),
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                letterSpacing: '-0.005em'
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Latest list */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          borderTop: '1px solid var(--line-1)'
        }}>
          {latest.map(p => (
            <a key={p.n} href="#" style={{
              padding: '16px 0', textDecoration: 'none', color: 'var(--fg-1)',
              borderBottom: '1px solid var(--line-1)',
              display: 'grid',
              gridTemplateColumns: '36px minmax(0, 1.2fr) minmax(0, 2fr) minmax(0, auto) 70px',
              gap: 14, alignItems: 'baseline'
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>{p.n}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'var(--fg-3)'
              }}>{p.cat}</span>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(15px, 1.3vw, 19px)',
                fontWeight: 600, letterSpacing: '-0.012em',
                color: 'var(--fg-1)'
              }}>{p.title}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
              }}>{p.read}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'var(--fg-3)', textAlign: 'right'
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
        <span>↳ Featured below</span>
        <span>UC.BLOG · INDEX</span>
      </div>
    </section>
  );
}

// ─── 02 FEATURED ESSAY ────────────────────────────────────────────────────
function B2Featured() {
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
        <PageMark n={2} label="Featured" total={4}/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          ESSAY · MAY 22 · 2026
        </div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(40px, 5vh, 64px)',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
        gap: 'clamp(32px, 5vw, 80px)', alignItems: 'center'
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'var(--fg-3)', marginBottom: 18
          }}>
            <span style={{ color: 'var(--uc-signal)', background: 'var(--uc-black)', padding: '3px 8px', marginRight: 8 }}>FEATURED</span>
            Operators · 6 min read
          </div>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.045em', lineHeight: 0.92,
            fontSize: 'clamp(40px, 6vw, 96px)',
            color: 'var(--fg-1)', textWrap: 'balance'
          }}>
            No more duct-taped solutions.{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>
              Enterprise tech, without the enterprise price tag.
            </span>
          </h2>
          <p style={{
            marginTop: 28, maxWidth: 540,
            fontFamily: 'var(--font-serif)', fontWeight: 400,
            fontSize: 'clamp(16px, 1.4vw, 19px)',
            lineHeight: 1.5, color: 'var(--fg-2)'
          }}>
            Most operations still run on a stack that wasn&rsquo;t built to work together.
            Spreadsheets running inventory. Quote requests in inboxes. ERPs that don&rsquo;t
            talk to anything else. Here&rsquo;s what we&rsquo;ve learned closing that gap, one
            engagement at a time.
          </p>

          <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <a href="#" className="uc-btn b-primary">Read the essay <span>→</span></a>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
            }}>by Denis Dyli · Founder</span>
          </div>
        </div>

        <div style={{
          position: 'relative', aspectRatio: '4/5', minHeight: 460,
          background: 'var(--uc-stone-200)', borderRadius: 5,
          overflow: 'hidden', border: '1px solid var(--line-1)'
        }}>
          <image-slot
            id="blog-featured"
            shape="rect" radius="5"
            placeholder="Editorial photo · operator on the floor, warm documentary tone"
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
          <div style={{
            position: 'absolute', bottom: 24, left: 24, right: 24,
            padding: '14px 16px', background: 'rgba(242,239,231,0.96)',
            border: '1px solid var(--line-2)', borderRadius: 5,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--fg-1)', backdropFilter: 'blur(8px)'
          }}>
            <span>↳ Read in 6 min</span>
            <span>UC.ESSAY.42</span>
          </div>
        </div>
      </div>

      <div style={{
        paddingTop: 20, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>UC.BLOG · FEATURED</span>
        <span>READ TIME · 6 MIN</span>
      </div>
    </section>
  );
}

// ─── 03 CATEGORIES ────────────────────────────────────────────────────────
function B3Categories() {
  const cats = [
    { n: '01', l: 'Operators',    c: 14, d: 'Notes from operator-led teams on the floor.' },
    { n: '02', l: 'Migration',    c: 9,  d: 'Replatforming, ERP integration, lift-and-shift playbooks.' },
    { n: '03', l: 'B2B',          c: 21, d: 'Catalogs, NET terms, account portals, quote workflows.' },
    { n: '04', l: 'Growth',       c: 18, d: 'AOV, conversion, retention, margin per order.' },
    { n: '05', l: 'Distribution', c: 7,  d: 'Multi-location inventory, sales teams, dealer networks.' },
    { n: '06', l: 'Agentic',      c: 5,  d: 'AI agents in commerce: where they actually pay.' }
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
        <PageMark n={3} label="Categories" total={4} dark/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-stone-500)' }}>
          BY TOPIC · 6 STREAMS
        </div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(40px, 5vh, 64px)',
        display: 'flex', flexDirection: 'column', gap: 32
      }}>
        <h2 style={{
          margin: 0,
          fontFamily: 'var(--font-hero)', fontWeight: 700,
          letterSpacing: '-0.045em', lineHeight: 0.92,
          fontSize: 'clamp(40px, 6vw, 96px)',
          color: 'var(--uc-paper)', textWrap: 'balance'
        }}>
          By the<br/>
          <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--uc-stone-300)' }}>
            stream.
          </span>
        </h2>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16
        }}>
          {cats.map(c => (
            <a key={c.n} href="#" style={{
              padding: '24px 22px', borderRadius: 5,
              background: '#0F0F0F', border: '1px solid #1F1F1F',
              textDecoration: 'none', color: 'var(--uc-paper)',
              display: 'flex', flexDirection: 'column', gap: 14
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-stone-500)' }}>{c.n}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.08em', color: 'var(--uc-signal)'
                }}>{c.c} POSTS</span>
              </div>
              <div style={{
                fontFamily: 'var(--font-hero)', fontWeight: 700,
                fontSize: 'clamp(28px, 2.6vw, 40px)',
                letterSpacing: '-0.035em', lineHeight: 1
              }}>{c.l}</div>
              <div style={{
                fontFamily: 'var(--font-serif)', fontSize: 14,
                color: 'var(--uc-stone-300)', lineHeight: 1.45
              }}>{c.d}</div>
            </a>
          ))}
        </div>
      </div>

      <div style={{
        paddingTop: 20, borderTop: '1px solid #1F1F1F',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-stone-500)'
      }}>
        <span>UC.BLOG · STREAMS</span>
        <span>74 PUBLISHED · 12 IN DRAFT</span>
      </div>
    </section>
  );
}

// ─── 04 NEWSLETTER / ARCHIVE ─────────────────────────────────────────────
function B4Newsletter() {
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
        <PageMark n={4} label="Subscribe" total={4}/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          UC.DISPATCH · MONTHLY
        </div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(40px, 5vh, 64px)',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
        gap: 'clamp(32px, 5vw, 80px)', alignItems: 'center'
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.045em', lineHeight: 0.92,
            fontSize: 'clamp(40px, 6.4vw, 104px)',
            color: 'var(--fg-1)', textWrap: 'balance'
          }}>
            One dispatch.{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>Once a month.</span>
          </h2>
          <p style={{
            marginTop: 28, maxWidth: 540,
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(16px, 1.3vw, 19px)',
            lineHeight: 1.45, color: 'var(--fg-2)'
          }}>
            The essay we wrote that month, two playbooks we keep coming back to,
            and what we shipped. No fluff, no take-of-the-week. Operator-grade.
          </p>

          <div style={{
            marginTop: 36, display: 'flex', gap: 8, maxWidth: 480, flexWrap: 'wrap'
          }}>
            <input
              type="email" placeholder="your@email.com"
              style={{
                flex: 1, minWidth: 240,
                padding: '14px 16px',
                background: 'var(--uc-paper)',
                border: '1px solid var(--line-2)',
                borderRadius: 5, fontFamily: 'var(--font-sans)',
                fontSize: 14, color: 'var(--fg-1)', outline: 'none'
              }}
            />
            <button className="uc-btn b-primary" style={{ padding: '14px 22px' }}>
              Subscribe <span>→</span>
            </button>
          </div>
          <div style={{
            marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--fg-3)'
          }}>
            4,200+ operators reading · Unsubscribe in one click
          </div>
        </div>

        <div style={{
          padding: 32, background: 'var(--uc-paper)',
          border: '1px solid var(--line-2)', borderRadius: 5,
          display: 'flex', flexDirection: 'column', gap: 18
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--fg-3)'
          }}>↳ This month&rsquo;s dispatch · #42</div>
          <div style={{
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            fontSize: 'clamp(24px, 2.2vw, 32px)',
            letterSpacing: '-0.028em', lineHeight: 1.1
          }}>
            What we shipped in May
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['ESSAY', 'No more duct-taped solutions.'],
              ['PLAYBOOK', 'The B2B account portal checklist.'],
              ['SHIPPED', 'Vosges · Subscriptions on Plus.'],
              ['SHIPPED', 'KOOKS · YMM fitment live for all variants.']
            ].map(([k, v]) => (
              <li key={v} style={{
                display: 'grid', gridTemplateColumns: '92px minmax(0, 1fr)',
                gap: 12, alignItems: 'baseline',
                paddingBottom: 12, borderBottom: '1px solid var(--line-1)'
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.08em', color: 'var(--fg-3)'
                }}>{k}</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--fg-1)' }}>{v}</span>
              </li>
            ))}
          </ul>
          <a href="#" className="uc-link">Read this month&rsquo;s issue <span>→</span></a>
        </div>
      </div>

      <div style={{
        paddingTop: 20, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>UC.BLOG · DISPATCH</span>
        <span>↳ Mission below</span>
      </div>
    </section>
  );
}

window.B1Index = B1Index;
window.B2Featured = B2Featured;
window.B3Categories = B3Categories;
window.B4Newsletter = B4Newsletter;
