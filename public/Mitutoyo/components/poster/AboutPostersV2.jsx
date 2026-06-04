// AboutPostersV2.jsx — About page, editorial direction (forked from BlogPostersV2).
// Five posters covering the firm — cover, story, team, numbers, talk.
//   01 Cover · "Operator-led, since 2013" with rail + footnotes
//   02 Story · drop-cap manifesto + pull-quote + photo
//   03 Team · roster as vertical type set
//   04 Numbers · firm metrics as weighted bars
//   05 Talk · postcard-style contact card

const V2_POSTS = [
  { n: '01', cat: 'Founder',          title: 'Denis Dyli.',     read: 'CEO',          d: 'Since 2013', au: 'Chicago' },
  { n: '02', cat: 'Solutions',        title: 'Ada Ramirez.',    read: 'Head',         d: 'Since 2016', au: 'Chicago' },
  { n: '03', cat: 'Engineering',      title: 'Marcus Lin.',     read: 'Head',         d: 'Since 2017', au: 'Chicago' },
  { n: '04', cat: 'Growth',           title: 'Priya Shah.',     read: 'Head',         d: 'Since 2019', au: 'Chicago' },
  { n: '05', cat: 'B2B Practice',     title: 'Sam Whitaker.',   read: 'Director',     d: 'Since 2020', au: 'Chicago' },
  { n: '06', cat: 'Strategy',         title: 'Lena Park.',      read: 'Director',     d: 'Since 2021', au: 'Chicago' }
];

// ─── 01 COVER ─────────────────────────────────────────────────────────────
function AV1Cover() {
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
        <PageMark label="About Uncap" noNumber/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          VOL. XIV · CHICAGO · UC.WHO-WE-ARE
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
            }}>EST. 2013</span>
            <span style={{
              fontFamily: 'var(--font-serif)', fontStyle: 'italic',
              fontSize: 'clamp(15px, 1.4vw, 19px)', color: 'var(--fg-2)'
            }}>
              A Shopify Platinum Partner. Operator-led since day one.
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
            }}>Operator-</span>
            <span className={`uc-rise ${r ? 'in' : ''}`} style={{
              display: 'block', fontSize: 'clamp(96px, 20vw, 320px)',
              fontFamily: 'var(--font-serif)', fontWeight: 400,
              letterSpacing: '-0.06em',
              paddingLeft: 'clamp(40px, 8vw, 200px)',
              transitionDelay: '90ms'
            }}>led.</span>
          </h1>


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
            display: 'flex', flexDirection: 'column', gap: 14
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-3)',
              marginBottom: 4
            }}>Reviews</div>
            {[
              { name: 'Clutch',     rating: '4.9', count: '80+',  icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="var(--fg-1)" strokeWidth="1.4"/>
                  <path d="M12 7 A 5 5 0 0 0 12 17" stroke="var(--fg-1)" strokeWidth="1.4"/>
                  <circle cx="15.5" cy="9.5" r="1.5" fill="var(--uc-signal)"/>
                  <circle cx="15.5" cy="14.5" r="1.5" fill="var(--uc-signal)"/>
                </svg>
              )},
              { name: 'Google',     rating: '4.8', count: '65',   icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M21 12.2 H 12 V 14.5 H 18 a 6 6 0 1 1 -6 -7.5 a 6 6 0 0 1 4 1.5 L 17.5 6 a 9 9 0 1 0 3.5 6.2 Z" stroke="var(--fg-1)" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
                </svg>
              )},
              { name: 'Shopify',    rating: '5.0', count: '200+', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5 L 16 5 L 18 8 L 19 21 L 5 21 L 6 8 Z" stroke="var(--fg-1)" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
                  <path d="M9 5 a 3 3 0 0 1 6 0" stroke="var(--fg-1)" strokeWidth="1.3" fill="none"/>
                </svg>
              )},
              { name: 'Trustpilot', rating: '4.9', count: '120+', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3 L 14.8 9.2 L 21.5 9.8 L 16.5 14.2 L 18 21 L 12 17.5 L 6 21 L 7.5 14.2 L 2.5 9.8 L 9.2 9.2 Z" stroke="var(--fg-1)" strokeWidth="1.3" strokeLinejoin="round" fill="var(--uc-signal)"/>
                </svg>
              )}
            ].map(r => (
              <div key={r.name} style={{
                display: 'grid', gridTemplateColumns: '20px minmax(0, 1fr) auto',
                gap: 10, alignItems: 'center',
                paddingBottom: 10, borderBottom: '1px dotted var(--line-1)'
              }}>
                <span aria-hidden="true" style={{ display: 'inline-flex' }}>{r.icon}</span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: 13, letterSpacing: '-0.01em', color: 'var(--fg-1)'
                }}>{r.name}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: 'var(--fg-3)', letterSpacing: 0, whiteSpace: 'nowrap'
                }}>
                  <span style={{ color: 'var(--fg-1)', fontWeight: 700 }}>{r.rating}</span>
                  {' · '}{r.count}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Core values strip */}
      <div style={{
        position: 'relative', zIndex: 1,
        paddingTop: 'clamp(20px, 3vh, 32px)',
        marginTop: 'clamp(20px, 3vh, 32px)',
        borderTop: '1px solid var(--line-1)'
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-3)',
          marginBottom: 16
        }}>↳ Core values · 5</div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0,
          borderTop: '1px solid var(--line-1)', borderBottom: '1px solid var(--line-1)'
        }}>
          {[
            { n: '01', t: 'Good Humans.', d: 'Talent matters. Character matters more. We protect the kind of place we want to show up to every day. No B.S.' },
            { n: '02', t: 'Craftsman with Care.', d: 'We take pride in our work. We don\u2019t ship mediocre. We own what we build. Our work creates impact.' },
            { n: '03', t: 'Forward Through Curiosity.', d: 'We stay humble. We keep learning. We push each other to get sharper every day.' },
            { n: '04', t: 'Partner, Not Vendor.', d: 'We stand beside our clients as trusted advisors. We tell the truth and do the right thing, especially when it\u2019s hard.' },
            { n: '05', t: 'AI-First Mindset.', d: 'We use AI across our work, but we strip the fad. It earns its place only where it drives efficiency. That\u2019s what makes us resilient.' }
          ].map((v, i) => (
            <div key={v.n} style={{
              padding: '18px 16px 18px 0',
              paddingLeft: i > 0 ? 16 : 0,
              borderLeft: i > 0 ? '1px solid var(--line-1)' : 'none',
              display: 'flex', flexDirection: 'column', gap: 8,
              position: 'relative'
            }}>
              <span aria-hidden="true" style={{
                position: 'absolute', top: -1, left: i > 0 ? 16 : 0,
                width: 18, height: 2, background: 'var(--uc-signal)'
              }}/>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.16em', color: 'var(--fg-3)', paddingTop: 8
              }}>{v.n}</span>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: 'clamp(16px, 1.4vw, 19px)',
                letterSpacing: '-0.018em', lineHeight: 1.15,
                color: 'var(--fg-1)'
              }}>{v.t}</span>
              <span style={{
                fontFamily: 'var(--font-serif)', fontSize: 13, lineHeight: 1.4,
                color: 'var(--fg-2)', textWrap: 'pretty'
              }}>{v.d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM rail */}
      <div style={{
        paddingTop: 20,
        borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)',
        position: 'relative', zIndex: 1
      }}>
        <span>↳ Read the story</span>
        <span>UC.ABOUT · COVER</span>
      </div>
    </section>
  );
}

// ─── 02 LONG-READ ────────────────────────────────────────────────────────
function AV2Story() {
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
        <PageMark label="The Story" noNumber/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          2013 → 2026 · 13 YEARS ON SHOPIFY
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
            }}>OUR STORY</span>
            <span>From the founder · Denis Dyli</span>
          </div>

          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.045em', lineHeight: 0.95,
            fontSize: 'clamp(36px, 5vw, 88px)',
            color: 'var(--fg-1)', textWrap: 'balance'
          }}>
            Twelve years on Shopify.{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--fg-2)' }}>
              Same crew. Same craft. Bigger work.
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
e started in 2013, building on Shopify before B2B was a category and when
            Plus was still new. Hundreds of operators, dozens of replatforms, and
            twelve years later, we&rsquo;ve seen every way commerce can break.
            <br/><br/>
            The work that kept showing up was the operator-led work. Founders running
            distribution. COOs running manufacturing. Teams keeping the lights on
            while the rest of the market shouted about platforms. We built the firm
            around them — and around what they actually needed: to uncap their
            commerce.
            <br/><br/>
            Same crew. Same craft. Bigger work.
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
            &ldquo;The work that kept showing up was the operator-led work.&rdquo;
          </blockquote>

          <div style={{
            position: 'relative', aspectRatio: '4/3',
            minHeight: 280
          }}>
            {/* Back card — rotated left */}
            <div style={{
              position: 'absolute', top: '4%', left: '0%',
              width: '46%', aspectRatio: '4/3',
              background: 'var(--uc-stone-200)',
              border: '1px solid var(--line-2)', borderRadius: 4,
              overflow: 'hidden',
              transform: 'rotate(-6deg)',
              boxShadow: '0 14px 28px -16px rgba(10,10,10,0.32)'
            }}>
<img src="https://cdn.prod.website-files.com/634ac2be2ddfdbd4a84e5fb3/69fb69bb9ffa7c0073fc5250_dotdev-p-1600.jpg" alt="Uncap team" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}/>
            </div>
            {/* Middle card — front */}
            <div style={{
              position: 'absolute', top: '22%', left: '28%',
              width: '46%', aspectRatio: '4/3',
              background: 'var(--uc-stone-200)',
              border: '1px solid var(--line-2)', borderRadius: 4,
              overflow: 'hidden',
              transform: 'rotate(2deg)',
              boxShadow: '0 18px 36px -16px rgba(10,10,10,0.4)',
              zIndex: 2
            }}>
<img src="https://cdn.prod.website-files.com/634ac2be2ddfdbd4a84e5fb3/69fb695b2d27d7391c329d76_shopify-b2b-online-p-1600.jpg" alt="Shopify B2B at Uncap" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}/>
            </div>
            {/* Right card — rotated right, behind */}
            <div style={{
              position: 'absolute', top: '6%', right: '0%',
              width: '44%', aspectRatio: '4/3',
              background: 'var(--uc-stone-200)',
              border: '1px solid var(--line-2)', borderRadius: 4,
              overflow: 'hidden',
              transform: 'rotate(8deg)',
              boxShadow: '0 14px 28px -16px rgba(10,10,10,0.3)',
              zIndex: 1
            }}>
<img src="https://cdn.prod.website-files.com/634ac2be2ddfdbd4a84e5fb3/634ac2be2ddfdb1c8e4e61fd_about-2.jpg" alt="Uncap floor" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}/>
            </div>
            {/* Polaroid-style caption card */}
            <div style={{
              position: 'absolute', bottom: 0, right: '6%',
              padding: '8px 12px 10px',
              background: 'var(--uc-paper)',
              border: '1px solid var(--line-2)',
              borderRadius: 3,
              transform: 'rotate(-3deg)',
              zIndex: 3,
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--fg-3)',
              boxShadow: '0 6px 12px -6px rgba(10,10,10,0.25)'
            }}>
              CHI · EST. 2013
            </div>
          </div>

          <div style={{
            paddingTop: 18, borderTop: '1px solid var(--line-1)',
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 14, fontFamily: 'var(--font-mono)', fontSize: 11
          }}>
            <div>
              <div style={{ color: 'var(--fg-3)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Founded</div>
              <div style={{ color: 'var(--fg-1)' }}>2013</div>
            </div>
            <div>
              <div style={{ color: 'var(--fg-3)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Projects</div>
              <div style={{ color: 'var(--fg-1)' }}>380+</div>
            </div>
            <div>
              <div style={{ color: 'var(--fg-3)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Team</div>
              <div style={{ color: 'var(--fg-1)' }}>32 operators</div>
            </div>
            <div>
              <div style={{ color: 'var(--fg-3)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>HQ</div>
              <div style={{ color: 'var(--fg-1)' }}>Chicago, IL</div>
            </div>
          </div>
        </aside>
      </div>

      <div style={{
        paddingTop: 20, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>UC.ABOUT · STORY</span>
        <span>↳ The team below</span>
      </div>
    </section>
  );
}

// ─── 03 INDEX — vertical type set ────────────────────────────────────────
function AV3Team() {
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
        <PageMark label="The Team" noNumber/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          32 OPERATORS · ROSTER · 8 LEADS
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
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>roster.</span>
          </h2>
          <p style={{
            marginTop: 20, maxWidth: 360,
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)',
            lineHeight: 1.5, color: 'var(--fg-2)'
          }}>
            Senior teams from day one. The names below are who you&rsquo;ll meet on the first call.
          </p>
          <div style={{
            marginTop: 28, display: 'flex', alignItems: 'center', gap: 14,
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)',
            letterSpacing: '0.06em', textTransform: 'uppercase'
          }}>
            <span style={{ color: 'var(--uc-signal)', background: 'var(--uc-black)', padding: '3px 8px', fontWeight: 700 }}>↳ HIRING</span>
            <span>2 open roles · see careers</span>
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
        <span>UC.ABOUT · ROSTER</span>
        <a href="#" className="uc-link" style={{ fontSize: 12 }}>
          See careers <span>→</span>
        </a>
      </div>
    </section>
  );
}

// ─── 04 STREAMS — dial visualization ─────────────────────────────────────
function AV4Numbers() {
  const streams = [
    { n: '01', l: 'Projects shipped',  c: '380+',     pct: 28 },
    { n: '02', l: 'Years on Shopify',  c: '13y',      pct: 24 },
    { n: '03', l: 'Operators on team', c: '32',       pct: 19 },
    { n: '04', l: 'Clutch rating',     c: '4.9 / 5',  pct: 18 },
    { n: '05', l: 'Industries served', c: '5',        pct: 7  },
    { n: '06', l: 'B2B specialty',     c: '62 projects', pct: 4 }
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
        <PageMark label="Numbers" dark noNumber/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-stone-500)' }}>
          FIRM · MEASURED · UPDATED Q2 2026
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
            What you<br/>
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--uc-stone-300)' }}>
              should know.
            </span>
          </h2>
          <p style={{
            margin: 0, maxWidth: 440,
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)',
            lineHeight: 1.5, color: 'var(--uc-stone-300)'
          }}>
Twelve years of operator-led commerce, by the numbers. The bars show share
            of focus, not recency. B2B dominates because operators dominate.
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
                  }}>{s.c}</span>
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
        <span>UC.ABOUT · NUMBERS</span>
        <span>SHOPIFY PLATINUM PARTNER · CHI</span>
      </div>
    </section>
  );
}

// ─── 05 SUBSCRIBE — postcard with stamp + interactive ─────────────────────
function AV5Talk() {
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
        <PageMark label="Talk" noNumber/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          CHICAGO · LETTERS@UNCAP.COM
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
          }}>↳ Real reply · senior team</div>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.05em', lineHeight: 0.88,
            fontSize: 'clamp(48px, 7vw, 128px)',
            color: 'var(--fg-1)', textWrap: 'balance'
          }}>
            Talk to{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>the operators.</span>
          </h2>
          <p style={{
            marginTop: 28, maxWidth: 540,
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)',
            lineHeight: 1.5, color: 'var(--fg-2)'
          }}>
Write us a line. We answer in hours, not days. From a real person on the
            team — never an SDR. No discovery call required to start a conversation.
          </p>

          <div style={{ marginTop: 36, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a href="mailto:hey@uncap.com" className="uc-btn b-primary" style={{ padding: '14px 22px' }}>
              hey@uncap.com <span>→</span>
            </a>
            <a href="tel:+13124690944" className="uc-link" style={{ fontSize: 14 }}>
              (312) 469-0944 <span>→</span>
            </a>
          </div>
          <div style={{
            marginTop: 14,
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
          }}>
            Replies in hours · No pitch deck · No B.S.
          </div>
        </div>

        {/* Postcard */}
        <div style={{
          position: 'relative',
          background: 'var(--uc-paper)',
          border: '1px solid var(--line-2)',
          borderRadius: 4,
          padding: '0 0 32px',
          transform: 'rotate(-1.5deg)',
          boxShadow: '0 18px 32px -16px rgba(10,10,10,0.18)',
          overflow: 'hidden'
        }}>
          {/* Office building photo */}
          <div style={{
            position: 'relative',
            aspectRatio: '16/9',
            background: 'var(--uc-stone-200)',
            borderBottom: '1px solid var(--line-1)'
          }}>
            <img
              src="https://cdn.prod.website-files.com/634ac2be2ddfdbd4a84e5fb3/65a56319e44a7e94c9e666fb_uncap-office-chicago-p-1080.jpg"
              alt="Uncap office, Chicago"
              style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute', bottom: 10, left: 12,
              padding: '4px 8px',
              background: 'rgba(242,239,231,0.95)',
              border: '1px solid var(--line-2)',
              borderRadius: 3,
              fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'var(--fg-1)', backdropFilter: 'blur(6px)'
            }}>UNCAP HQ · CHICAGO</div>
          </div>
        <div style={{ padding: '24px 36px 0' }}>
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
          }}>↳ Studio · Chicago</div>

          <div style={{
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            fontSize: 'clamp(28px, 3.2vw, 48px)',
            letterSpacing: '-0.035em', lineHeight: 1.0,
            color: 'var(--fg-1)', maxWidth: 320
          }}>
            Find us.
          </div>

          <div style={{
            marginTop: 24, display: 'flex', flexDirection: 'column', gap: 4,
            fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--fg-2)'
          }}>
            <div>Studio: <span style={{ color: 'var(--fg-1)', fontWeight: 600 }}>212 W Superior St, Suite 400</span></div>
            <div>City: <span style={{ color: 'var(--fg-1)', fontWeight: 600 }}>Chicago, IL 60654</span></div>
            <div>Hours: <span style={{ color: 'var(--fg-1)', fontWeight: 600 }}>Mon–Fri · 9–6 CT</span></div>
          </div>

          <div style={{
            marginTop: 24, paddingTop: 16,
            borderTop: '1px dashed var(--fg-3)',
            fontFamily: 'var(--font-serif)', fontStyle: 'italic',
            fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.5,
            maxWidth: 360
          }}>
            Knock on the door. We&rsquo;ll put the kettle on. Or write a letter — the
            inbox works too.
          </div>
        </div>
        </div>
      </div>

      <div style={{
        paddingTop: 20, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>UC.ABOUT · TALK</span>
        <span>CHICAGO · OPERATOR-LED · SINCE 2013</span>
      </div>
    </section>
  );
}

window.AV1Cover = AV1Cover;
window.AV2Story = AV2Story;
window.AV3Team = AV3Team;
window.AV4Numbers = AV4Numbers;
window.AV5Talk = AV5Talk;
