// BlogPostersV3.jsx — Editorial magazine treatment.
//   01 Newsstand cover — issue mark + cover lines + corner barcode
//   02 Two-column reading room — drop-cap intro + columnar grid
//   03 Library catalog — Dewey-style organization
//   04 Notebook — handwritten-feel issue ledger
//   05 Mailroom — subscribe styled as a postcard workbench

const V3POSTS = [
  { n: '01', cat: 'Operators',    title: 'No more duct-taped solutions.',             read: '6 min',  d: 'May 22',  au: 'Dyli',     ic: '◐' },
  { n: '02', cat: 'Migration',    title: 'Replatforming without breaking the team.',  read: '9 min',  d: 'May 14',  au: 'Ramirez',  ic: '◔' },
  { n: '03', cat: 'B2B',          title: 'The case for NET-30 inside Shopify.',       read: '7 min',  d: 'May 04',  au: 'Whitaker', ic: '◑' },
  { n: '04', cat: 'Growth',       title: 'AOV, but for the operator.',                read: '5 min',  d: 'Apr 26',  au: 'Shah',     ic: '◕' },
  { n: '05', cat: 'Agentic',      title: 'AI agents in commerce: where they pay.',    read: '11 min', d: 'Apr 14',  au: 'Lin',      ic: '●' },
  { n: '06', cat: 'Distribution', title: 'One million SKUs, one source of truth.',    read: '8 min',  d: 'Apr 02',  au: 'Park',     ic: '◯' }
];

// ─── 01 NEWSSTAND COVER ───────────────────────────────────────────────────
function BV31Cover() {
  const [r, setR] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setR(true), 80); return () => clearTimeout(t); }, []);
  return (
    <section data-poster="1" style={{
      background: 'var(--uc-cream)', minHeight: '100vh',
      padding: '32px 32px 32px', position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      {/* Faint grid backdrop */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background:
          'linear-gradient(rgba(10,10,10,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(10,10,10,0.025) 1px, transparent 1px)',
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
        <PageMark label="Newsstand" noNumber/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          ISSUE 42 · MAY 2026 · $0 · USA / WORLDWIDE
        </div>
      </div>

      {/* Cover composition: huge title + vertical spine + cover-line bricks */}
      <div style={{
        flex: 1, position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'auto minmax(0, 1fr) minmax(0, auto)',
        gap: 'clamp(20px, 3vw, 56px)',
        paddingTop: 'clamp(32px, 4vh, 56px)', paddingBottom: 'clamp(24px, 3vh, 48px)',
        alignItems: 'stretch'
      }}>
        {/* Vertical spine */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 0', borderLeft: '1px solid var(--line-1)',
          borderRight: '1px solid var(--line-1)',
          width: 'clamp(56px, 6vw, 84px)'
        }}>
          <div style={{
            writingMode: 'vertical-rl', transform: 'rotate(180deg)',
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.32em', textTransform: 'uppercase',
            color: 'var(--fg-3)', padding: '12px 0'
          }}>FIELD NOTES · UNCAP · CHI</div>
          <div style={{
            fontFamily: 'var(--font-hero)', fontWeight: 800,
            fontSize: 'clamp(28px, 3.4vw, 56px)',
            letterSpacing: '-0.04em', lineHeight: 1,
            color: 'var(--fg-1)'
          }}>42</div>
          <div style={{
            writingMode: 'vertical-rl', transform: 'rotate(180deg)',
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.32em', textTransform: 'uppercase',
            color: 'var(--fg-3)', padding: '12px 0'
          }}>VOL XIV · NO. 5 · 2026</div>
        </div>

        {/* Center mega title */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          gap: 'clamp(20px, 3vh, 40px)', minWidth: 0
        }}>
          <h1 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.06em', lineHeight: 0.82,
            color: 'var(--fg-1)'
          }}>
            <span className={`uc-rise ${r ? 'in' : ''}`} style={{
              display: 'block', fontSize: 'clamp(72px, 17vw, 248px)'
            }}>Field</span>
            <span className={`uc-rise ${r ? 'in' : ''}`} style={{
              display: 'block', fontSize: 'clamp(72px, 17vw, 248px)',
              fontFamily: 'var(--font-serif)', fontWeight: 400,
              letterSpacing: '-0.05em',
              transitionDelay: '90ms'
            }}>notes.</span>
          </h1>

          {/* Cover lines — like a magazine */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16, paddingTop: 12,
            borderTop: '1px solid var(--line-1)'
          }}>
            {[
              { kicker: 'COVER STORY', t: 'No more duct-taped solutions.', p: 6 },
              { kicker: 'INSIDE',      t: 'Replatforming without breaking the team.', p: 18 },
              { kicker: 'COLUMN',      t: 'The case for NET-30 inside Shopify.', p: 24 }
            ].map((c, i) => (
              <div key={i} style={{
                paddingLeft: i > 0 ? 18 : 0,
                borderLeft: i > 0 ? '1px solid var(--line-1)' : 'none',
                display: 'flex', flexDirection: 'column', gap: 6,
                position: 'relative'
              }}>
                <span aria-hidden="true" style={{
                  position: 'absolute', top: -1, left: i > 0 ? 18 : 0,
                  width: 24, height: 2, background: 'var(--uc-signal)'
                }}/>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.16em', color: 'var(--fg-3)',
                  paddingTop: 10
                }}>{c.kicker}</div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: 'clamp(15px, 1.3vw, 19px)',
                  letterSpacing: '-0.012em', lineHeight: 1.25,
                  color: 'var(--fg-1)', textWrap: 'pretty'
                }}>{c.t}</div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)',
                  letterSpacing: 0
                }}>p. {String(c.p).padStart(2, '0')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — barcode + meta */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          gap: 16, width: 'clamp(140px, 12vw, 180px)', alignItems: 'stretch'
        }}>
          <div style={{
            padding: '10px 12px',
            border: '1px solid var(--line-2)', borderRadius: 4,
            background: 'var(--uc-paper)',
            display: 'flex', flexDirection: 'column', gap: 4
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
              color: 'var(--fg-3)', letterSpacing: '0.14em'
            }}>UC·42·MAY·26</div>
            <svg viewBox="0 0 120 40" preserveAspectRatio="none" style={{ width: '100%', height: 36 }}>
              {Array.from({ length: 28 }).map((_, i) => {
                const x = i * 4.2 + 4;
                const w = (i * 7919 % 4) * 0.6 + 0.5;
                return <rect key={i} x={x} y={4} width={w} height={28} fill="var(--fg-1)"/>;
              })}
              <text x="60" y="38" textAnchor="middle"
                fontFamily="var(--font-mono)" fontSize="4" fill="var(--fg-1)" letterSpacing="0.16em">
                9 781234 567890
              </text>
            </svg>
          </div>

          <div style={{
            display: 'flex', flexDirection: 'column', gap: 8
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-3)'
            }}>Editor&rsquo;s note</div>
            <p style={{
              margin: 0,
              fontFamily: 'var(--font-serif)', fontStyle: 'italic',
              fontSize: 13, lineHeight: 1.5, color: 'var(--fg-2)'
            }}>
              This issue is for the operator. The one keeping the lights on while
              the rest of us shout about platforms.
            </p>
            <a href="#" className="uc-link" style={{ fontSize: 12, marginTop: 4 }}>
              Read the issue <span>→</span>
            </a>
          </div>
        </div>
      </div>

      {/* BOTTOM rail */}
      <div style={{
        paddingTop: 20, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>↳ Open the issue</span>
        <span>UC.DISPATCH · NEWSSTAND</span>
      </div>
    </section>
  );
}

// ─── 02 READING ROOM ──────────────────────────────────────────────────────
function BV32Reading() {
  const cover = V3POSTS[0];
  const rest = V3POSTS.slice(1);
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
        <PageMark label="Reading room" noNumber/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          FOLIO P. 6–14 · COVER ESSAY + 5 SHORTS
        </div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(32px, 4vh, 56px)',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)',
        gap: 'clamp(32px, 5vw, 80px)'
      }}>
        {/* Left: cover essay with drop cap + columnar pull */}
        <article style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-3)'
          }}>
            <span style={{
              background: 'var(--uc-signal)', color: 'var(--uc-black)',
              padding: '3px 8px', marginRight: 8
            }}>COVER ESSAY</span>
            Operators · {cover.read} · by {cover.au}
          </div>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.045em', lineHeight: 0.95,
            fontSize: 'clamp(36px, 4.8vw, 80px)',
            color: 'var(--fg-1)', textWrap: 'balance'
          }}>
            {cover.title}{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--fg-2)' }}>
              Enterprise tech, without the enterprise price tag.
            </span>
          </h2>

          {/* Drop-cap two-column body */}
          <div style={{
            columnCount: 2, columnGap: 32, columnRule: '1px solid var(--line-1)',
            fontFamily: 'var(--font-serif)', fontWeight: 400,
            fontSize: 'clamp(14px, 1.1vw, 16px)', lineHeight: 1.55,
            color: 'var(--fg-1)', textWrap: 'pretty'
          }}>
            <span style={{
              float: 'left', fontFamily: 'var(--font-hero)', fontWeight: 800,
              fontSize: 'clamp(56px, 5.6vw, 96px)', lineHeight: 0.86,
              padding: '6px 10px 0 0', color: 'var(--fg-1)'
            }}>M</span>
            ost operations still run on a stack that wasn&rsquo;t built to work together.
            Aging storefronts that cost more every year. Spreadsheets running inventory.
            Quote requests scattered across emails. ERPs that don&rsquo;t talk to anything
            else. <br/><br/>
            Online and offline never quite meet. It&rsquo;s not for lack of effort. The
            platforms that actually unify operations were built for the enterprise.
            Priced for the enterprise. Half-million-dollar implementations. Year-long
            integrations. Run by ops teams the size of small companies.
          </div>

          <div style={{
            paddingTop: 20, borderTop: '1px solid var(--line-1)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 16, flexWrap: 'wrap'
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-3)'
            }}>Continued on p. 08</span>
            <a href="#" className="uc-btn b-primary" style={{ padding: '10px 16px', fontSize: 13 }}>
              Read the essay <span>→</span>
            </a>
          </div>
        </article>

        {/* Right column — shorts, like a sidebar */}
        <aside style={{
          display: 'flex', flexDirection: 'column',
          borderTop: '1px solid var(--line-1)'
        }}>
          <div style={{
            padding: '14px 0', borderBottom: '1px solid var(--line-1)',
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-3)'
          }}>Shorts · five more from the issue</div>

          {rest.map((p, i) => (
            <a key={p.n} href="#" style={{
              padding: '18px 0', textDecoration: 'none', color: 'var(--fg-1)',
              borderBottom: '1px solid var(--line-1)',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, auto) minmax(0, 1fr) minmax(0, auto)',
              gap: 16, alignItems: 'start'
            }}>
              <span aria-hidden="true" style={{
                fontFamily: 'var(--font-serif)', fontSize: 28,
                color: 'var(--fg-1)', lineHeight: 1
              }}>{p.ic}</span>
              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--fg-3)', marginBottom: 4
                }}>{p.cat} · by {p.au}</div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 'clamp(14px, 1.2vw, 17px)',
                  fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--fg-1)'
                }}>{p.title}</div>
              </div>
              <div style={{
                textAlign: 'right',
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: 'var(--fg-3)', letterSpacing: 0,
                whiteSpace: 'nowrap'
              }}>
                {p.read}<br/>{p.d}
              </div>
            </a>
          ))}
        </aside>
      </div>

      <div style={{
        paddingTop: 20, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>UC.DISPATCH · READING ROOM</span>
        <span>6 ARTICLES · 46 MIN TOTAL</span>
      </div>
    </section>
  );
}

// ─── 03 LIBRARY CATALOG ──────────────────────────────────────────────────
function BV33Catalog() {
  const shelves = [
    {
      class: 'UC.001',
      l: 'Operators',
      d: 'Notes from operator-led teams on the floor.',
      books: ['No more duct-taped solutions.', 'Same caliber. Without the drag.', 'On hiring the senior team.']
    },
    {
      class: 'UC.002',
      l: 'Migration',
      d: 'Replatforming, ERP integration, lift-and-shift.',
      books: ['Replatforming without breaking the team.', 'A field guide to ERP integration.', 'Year-one after replatform.']
    },
    {
      class: 'UC.003',
      l: 'B2B',
      d: 'Catalogs, NET terms, account portals.',
      books: ['The case for NET-30 inside Shopify.', 'Account portals reps will use.', 'Quote-to-cash, end to end.']
    },
    {
      class: 'UC.004',
      l: 'Growth',
      d: 'AOV, conversion, retention, margin per order.',
      books: ['AOV, but for the operator.', 'A growth retainer that works.', 'The first quarter playbook.']
    }
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
        <PageMark label="Library catalog" dark noNumber/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-stone-500)' }}>
          74 PUBLISHED · 4 CLASSES SHOWN
        </div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(40px, 5vh, 64px)',
        display: 'flex', flexDirection: 'column', gap: 36
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
          gap: 48, alignItems: 'end'
        }}>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.045em', lineHeight: 0.92,
            fontSize: 'clamp(40px, 6vw, 96px)',
            color: 'var(--uc-paper)'
          }}>
            Catalogued.{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--uc-stone-300)' }}>
              Card by card.
            </span>
          </h2>
          <p style={{
            margin: 0, maxWidth: 440,
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(14px, 1.2vw, 17px)',
            lineHeight: 1.5, color: 'var(--uc-stone-300)'
          }}>
            Four shelves. Twelve books. Pull the call number that fits the operation
            you&rsquo;re running.
          </p>
        </div>

        {/* Catalog cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16
        }}>
          {shelves.map(s => (
            <div key={s.class} style={{
              background: '#0F0F0F', border: '1px solid #1F1F1F',
              borderRadius: 5, padding: '24px 28px',
              display: 'grid', gridTemplateColumns: '80px minmax(0, 1fr)',
              gap: 28, alignItems: 'start'
            }}>
              {/* Call number */}
              <div style={{
                paddingTop: 6, borderTop: '1px solid #2B2B2B',
                paddingRight: 8, borderRight: '1px solid #2B2B2B',
                display: 'flex', flexDirection: 'column', gap: 10,
                minHeight: 120
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.12em', color: 'var(--uc-signal)'
                }}>CALL №</span>
                <span style={{
                  fontFamily: 'var(--font-hero)', fontWeight: 700,
                  fontSize: 22, letterSpacing: '-0.025em',
                  color: 'var(--uc-paper)'
                }}>{s.class}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{
                  fontFamily: 'var(--font-hero)', fontWeight: 700,
                  fontSize: 'clamp(24px, 2.4vw, 36px)',
                  letterSpacing: '-0.035em', lineHeight: 0.95,
                  color: 'var(--uc-paper)'
                }}>{s.l}</div>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: 13,
                  color: 'var(--uc-stone-300)', lineHeight: 1.45
                }}>{s.d}</div>
                <ul style={{
                  listStyle: 'none', padding: 0, margin: 0,
                  display: 'flex', flexDirection: 'column', gap: 4
                }}>
                  {s.books.map(b => (
                    <li key={b} style={{
                      display: 'grid', gridTemplateColumns: '12px minmax(0, 1fr)',
                      gap: 8, alignItems: 'baseline',
                      padding: '6px 0', borderTop: '1px solid #1F1F1F',
                      fontFamily: 'var(--font-mono)', fontSize: 11,
                      color: 'var(--uc-paper)', letterSpacing: 0
                    }}>
                      <span style={{ color: 'var(--uc-stone-500)' }}>›</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        paddingTop: 20, borderTop: '1px solid #1F1F1F',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-stone-500)'
      }}>
        <span>UC.DISPATCH · CATALOG</span>
        <a href="#" className="uc-link uc-link-light" style={{ fontSize: 12 }}>
          Stacks A–Z <span>→</span>
        </a>
      </div>
    </section>
  );
}

// ─── 04 ARCHIVE LEDGER ────────────────────────────────────────────────────
function BV34Ledger() {
  const rows = [
    { n: '№ 42', d: 'MAY 26', t: 'No more duct-taped solutions.',  state: 'NOW',     reads: '4.2k' },
    { n: '№ 41', d: 'APR 26', t: 'A field guide to ERP integration.', state: 'SENT',  reads: '3.8k' },
    { n: '№ 40', d: 'MAR 26', t: 'Why we don\u2019t do retainers without scopes.', state: 'SENT', reads: '5.1k' },
    { n: '№ 39', d: 'FEB 26', t: 'The first quarter playbook.', state: 'SENT', reads: '3.4k' },
    { n: '№ 38', d: 'JAN 26', t: 'Account portals reps will use.', state: 'SENT', reads: '2.9k' },
    { n: '№ 37', d: 'DEC 25', t: 'Year-end · what we shipped.', state: 'SENT', reads: '6.2k' }
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
        <PageMark label="Archive ledger" noNumber/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          ISSUES 37 → 42 · 6 MONTHS
        </div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(40px, 5vh, 64px)',
        display: 'flex', flexDirection: 'column', gap: 36
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, auto)',
          gap: 32, alignItems: 'end'
        }}>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.045em', lineHeight: 0.92,
            fontSize: 'clamp(40px, 6vw, 96px)',
            color: 'var(--fg-1)'
          }}>
            The ledger.{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>Six months at a glance.</span>
          </h2>
          <div style={{
            padding: '8px 14px',
            background: 'var(--uc-black)', color: 'var(--uc-paper)',
            borderRadius: 999,
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.1em'
          }}>74 PUBLISHED</div>
        </div>

        {/* Ledger table */}
        <div style={{
          background: 'var(--uc-paper)',
          border: '1px solid var(--line-2)', borderRadius: 5,
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 100px minmax(0, 1fr) 80px 90px 90px',
            gap: 16, padding: '14px 20px',
            background: 'var(--uc-bone)',
            borderBottom: '1px solid var(--line-1)',
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-3)'
          }}>
            <span>Issue</span>
            <span>Date</span>
            <span>Title</span>
            <span>Status</span>
            <span style={{ textAlign: 'right' }}>Reads</span>
            <span style={{ textAlign: 'right' }}>Open</span>
          </div>

          {rows.map((row, i) => {
            const now = row.state === 'NOW';
            return (
              <a key={row.n} href="#" style={{
                textDecoration: 'none', color: 'var(--fg-1)',
                display: 'grid',
                gridTemplateColumns: '80px 100px minmax(0, 1fr) 80px 90px 90px',
                gap: 16, padding: '16px 20px',
                borderBottom: i < rows.length - 1 ? '1px solid var(--line-1)' : 'none',
                alignItems: 'center',
                background: now ? 'rgba(232,255,82,0.12)' : 'transparent'
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                  color: 'var(--fg-1)'
                }}>{row.n}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
                }}>{row.d}</span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600,
                  letterSpacing: '-0.005em', color: 'var(--fg-1)'
                }}>{row.t}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: now ? 'var(--uc-black)' : 'var(--fg-3)',
                  background: now ? 'var(--uc-signal)' : 'transparent',
                  border: now ? 'none' : '1px solid var(--line-1)',
                  padding: '3px 8px', borderRadius: 3,
                  justifySelf: 'start'
                }}>{row.state}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-1)',
                  textAlign: 'right'
                }}>{row.reads}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--fg-3)',
                  textAlign: 'right'
                }}>→</span>
              </a>
            );
          })}
        </div>

        {/* Ledger footnote */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, flexWrap: 'wrap',
          fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontSize: 14, color: 'var(--fg-2)'
        }}>
          <span>Audited monthly. Open-rate posted, not engagement.</span>
          <a href="#" className="uc-link" style={{ fontStyle: 'normal' }}>
            See full archive <span>→</span>
          </a>
        </div>
      </div>

      <div style={{
        paddingTop: 20, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>UC.DISPATCH · LEDGER</span>
        <span>↳ Mailroom below</span>
      </div>
    </section>
  );
}

// ─── 05 MAILROOM ──────────────────────────────────────────────────────────
function BV35Mailroom() {
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
        <PageMark label="Mailroom" noNumber/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          UC.DISPATCH · DELIVERED MONTHLY
        </div>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(40px, 5vh, 80px)',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
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

        {/* Postcard — stylized envelope */}
        <div style={{
          position: 'relative',
          background: 'var(--uc-bone)',
          border: '1px solid var(--line-2)',
          borderRadius: 4,
          padding: '32px 36px',
          transform: 'rotate(-1.5deg)',
          boxShadow: '0 18px 32px -16px rgba(10,10,10,0.18)'
        }}>
          {/* Stamp */}
          <div style={{
            position: 'absolute', top: 16, right: 16,
            width: 84, height: 96,
            border: '1px dashed var(--fg-1)',
            background: 'var(--uc-paper)',
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
              width: 30, height: 30, borderRadius: 999,
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
            position: 'absolute', top: 64, right: 110,
            width: 100, height: 100, borderRadius: 999,
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
            fontSize: 'clamp(28px, 3vw, 44px)',
            letterSpacing: '-0.035em', lineHeight: 1.0,
            color: 'var(--fg-1)', maxWidth: 280
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
            fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.45,
            maxWidth: 320
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

window.BV31Cover = BV31Cover;
window.BV32Reading = BV32Reading;
window.BV33Catalog = BV33Catalog;
window.BV34Ledger = BV34Ledger;
window.BV35Mailroom = BV35Mailroom;
