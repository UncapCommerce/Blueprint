// BlogPostersV4.jsx — Broadsheet newspaper concept.
// 4 posters: front page, op-ed spread, classifieds-style index, subscribe slip.

const V4_POSTS = [
  { n: '01', cat: 'Operators',    title: 'No more duct-taped solutions.',             read: '6 min', d: 'May 22', au: 'Dyli' },
  { n: '02', cat: 'Migration',    title: 'Replatforming without breaking the team.',  read: '9 min', d: 'May 14', au: 'Ramirez' },
  { n: '03', cat: 'B2B',          title: 'The case for NET-30 inside Shopify.',       read: '7 min', d: 'May 04', au: 'Whitaker' },
  { n: '04', cat: 'Growth',       title: 'AOV, but for the operator.',                read: '5 min', d: 'Apr 26', au: 'Shah' },
  { n: '05', cat: 'Agentic',      title: 'AI agents in commerce: where they pay.',    read: '11 min',d: 'Apr 14', au: 'Lin' },
  { n: '06', cat: 'Distribution', title: 'One million SKUs, one source of truth.',    read: '8 min', d: 'Apr 02', au: 'Park' }
];

// ─── 01 FRONT PAGE ────────────────────────────────────────────────────────
function BV41Front() {
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
      {/* TOP rail — newspaper meta */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 14, borderBottom: '1px solid var(--line-1)',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)',
        letterSpacing: '0.06em'
      }}>
        <span>CHICAGO, IL · USA · 41.8°N · 87.6°W</span>
        <span>MAY 26, 2026 · LAST WORKING DAY</span>
        <span>50¢ · MONTHLY · UC.DISPATCH</span>
      </div>

      {/* Masthead */}
      <div style={{
        textAlign: 'center', padding: '18px 0 22px',
        borderBottom: '4px double var(--fg-1)',
        position: 'relative'
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.32em', color: 'var(--fg-3)', marginBottom: 10
        }}>EST. 2013 · CHI · OPERATOR-LED</div>
        <h1 className={`uc-rise ${r ? 'in' : ''}`} style={{
          margin: 0,
          fontFamily: 'var(--font-hero)', fontWeight: 700,
          fontSize: 'clamp(64px, 10vw, 180px)',
          letterSpacing: '-0.05em', lineHeight: 0.88,
          color: 'var(--fg-1)'
        }}>
          The Field <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>Notes.</span>
        </h1>
        <div style={{
          marginTop: 10,
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--fg-3)', letterSpacing: '0.18em', textTransform: 'uppercase'
        }}>VOL. XIV · NO. 42 · DISPATCH</div>
      </div>

      {/* Three-column front page */}
      <div style={{
        flex: 1, paddingTop: 28,
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 1fr)',
        gap: 28, alignItems: 'stretch'
      }}>
        {/* MAIN STORY */}
        <article style={{
          paddingRight: 28, borderRight: '1px solid var(--line-1)',
          display: 'flex', flexDirection: 'column', gap: 16
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-3)',
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span style={{ background: 'var(--uc-signal)', color: 'var(--uc-black)', padding: '3px 8px' }}>HEADLINE</span>
            <span>By Denis Dyli · Founder</span>
          </div>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.04em', lineHeight: 0.92,
            fontSize: 'clamp(34px, 4.4vw, 72px)',
            color: 'var(--fg-1)', textWrap: 'balance'
          }}>
            No more duct-taped solutions.{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--fg-2)' }}>
              Enterprise tech, without the enterprise price tag.
            </span>
          </h2>
          {/* dek + body */}
          <div style={{
            fontFamily: 'var(--font-serif)', fontStyle: 'italic',
            fontSize: 16, lineHeight: 1.5, color: 'var(--fg-2)'
          }}>
            Operators were left to make do. Here&rsquo;s what we&rsquo;ve learned closing the gap.
          </div>
          <div style={{
            columnCount: 2, columnGap: 24, columnRule: '1px solid var(--line-1)',
            fontFamily: 'var(--font-serif)', fontSize: 14.5, lineHeight: 1.55,
            color: 'var(--fg-1)'
          }}>
            <span style={{
              float: 'left', fontFamily: 'var(--font-hero)', fontWeight: 800,
              fontSize: 64, lineHeight: 0.85, padding: '4px 8px 0 0',
              color: 'var(--fg-1)'
            }}>M</span>
            ost operations still run on a stack that wasn&rsquo;t built to work together.
            Aging storefronts. Spreadsheets for inventory. Quote requests in inboxes.
            ERPs that don&rsquo;t talk to anything else.<br/><br/>
            It&rsquo;s not for lack of effort. The platforms that actually unify operations
            were built for the enterprise. Priced for the enterprise. The operator-led
            businesses driving the economy were left to make do.
          </div>
          <div style={{
            paddingTop: 14, borderTop: '1px solid var(--line-1)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
          }}>
            <span>↳ Continued on A8</span>
            <a href="#" className="uc-link" style={{ fontSize: 13 }}>Read essay <span>→</span></a>
          </div>
        </article>

        {/* MIDDLE COL — secondary lead */}
        <article style={{
          paddingRight: 28, borderRight: '1px solid var(--line-1)',
          display: 'flex', flexDirection: 'column', gap: 14
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-3)'
          }}>SECONDARY · MIGRATION</div>
          <h3 style={{
            margin: 0,
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 'clamp(22px, 2vw, 28px)', letterSpacing: '-0.022em',
            lineHeight: 1.1, color: 'var(--fg-1)'
          }}>Replatforming without breaking the team.</h3>
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: 14, lineHeight: 1.55,
            color: 'var(--fg-2)'
          }}>
            How we move a million-SKU operator off a legacy cart in 11 weeks
            without losing a single order.
          </div>
          <a href="#" className="uc-link" style={{ fontSize: 12 }}>Read · 9 min <span>→</span></a>

          {/* Brief */}
          <div style={{
            marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--line-1)',
            display: 'flex', flexDirection: 'column', gap: 6
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-3)'
            }}>IN BRIEF · GROWTH</div>
            <h4 style={{
              margin: 0,
              fontFamily: 'var(--font-display)', fontWeight: 600,
              fontSize: 17, letterSpacing: '-0.015em', color: 'var(--fg-1)'
            }}>AOV, but for the operator.</h4>
            <div style={{
              fontFamily: 'var(--font-serif)', fontSize: 13.5, lineHeight: 1.5,
              color: 'var(--fg-2)'
            }}>Five plays that lift order value without raising prices.</div>
          </div>
        </article>

        {/* RIGHT COL — index / weather */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Index box */}
          <div style={{
            padding: 18, background: 'var(--uc-paper)',
            border: '1px solid var(--line-2)'
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-3)',
              paddingBottom: 10, borderBottom: '1px solid var(--line-1)', marginBottom: 12
            }}>Inside this issue</div>
            {[
              { s: 'A1', t: 'No more duct-taped solutions.' },
              { s: 'A4', t: 'Replatforming · field notes.' },
              { s: 'B1', t: 'NET-30 inside Shopify.' },
              { s: 'B6', t: 'AOV plays for the operator.' },
              { s: 'C1', t: 'Agentic commerce, where it pays.' },
              { s: 'C8', t: 'Million-SKU truth source.' }
            ].map((it, i) => (
              <div key={i} style={{
                padding: '6px 0',
                borderBottom: i < 5 ? '1px dotted var(--line-1)' : 'none',
                display: 'grid', gridTemplateColumns: '32px minmax(0, 1fr)',
                gap: 10, alignItems: 'baseline',
                fontFamily: 'var(--font-serif)', fontSize: 13.5, color: 'var(--fg-1)'
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  color: 'var(--fg-3)', letterSpacing: '0.08em'
                }}>{it.s}</span>
                <span>{it.t}</span>
              </div>
            ))}
          </div>

          {/* "Weather" — Shopify status of the month */}
          <div style={{
            padding: 18, background: 'var(--uc-bone)',
            border: '1px solid var(--line-1)',
            display: 'flex', flexDirection: 'column', gap: 8
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-3)'
            }}>Month at a glance</div>
            <div style={{
              fontFamily: 'var(--font-hero)', fontWeight: 700,
              fontSize: 32, letterSpacing: '-0.035em', color: 'var(--fg-1)'
            }}>4 shipped · 1 in flight</div>
            <div style={{
              fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.4
            }}>
              Vosges subs · KOOKS fitment · ULE pricing · Agri portal.
              Cooler & dryer for the operator.
            </div>
          </div>
        </div>
      </div>

      <div style={{
        paddingTop: 14, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>FRONT PAGE · A1</span>
        <span>↳ Turn to B</span>
      </div>
    </section>
  );
}

// ─── 02 OP-ED SPREAD ──────────────────────────────────────────────────────
function BV42Oped() {
  return (
    <section data-poster="2" style={{
      background: 'var(--uc-paper)', minHeight: '100vh',
      padding: '32px 32px 32px', position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 14,
        borderBottom: '1px solid var(--line-1)',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)',
        letterSpacing: '0.06em'
      }}>
        <PageMark label="Op-Ed" noNumber/>
        <span>SECTION B · MAY 2026</span>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(28px, 4vh, 56px)',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)',
        gap: 'clamp(40px, 5vw, 80px)', alignItems: 'start'
      }}>
        {/* Big editorial cartoon area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-3)'
          }}>Editorial · cartoon</div>
          <div style={{
            aspectRatio: '4/3', background: 'var(--uc-bone)',
            border: '1px solid var(--line-1)', position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Stylized editorial sketch */}
            <svg viewBox="0 0 400 300" style={{ width: '100%', height: '100%', display: 'block' }}>
              {/* duct-tape platform */}
              <rect x="40" y="180" width="320" height="20" fill="none" stroke="var(--fg-1)" strokeWidth="2"/>
              <line x1="40" y1="190" x2="360" y2="190" stroke="var(--fg-1)" strokeWidth="1" strokeDasharray="4 4"/>
              {/* stack */}
              {[60, 100, 140, 180, 220, 260, 300].map((x, i) => (
                <rect key={i} x={x} y={180 - (i+1)*16} width="32" height="16" fill="none" stroke="var(--fg-1)" strokeWidth="1.5"/>
              ))}
              {/* operator silhouette */}
              <circle cx="200" cy="70" r="22" fill="var(--uc-signal)" stroke="var(--fg-1)" strokeWidth="2"/>
              <path d="M178 70 a22 22 0 0 0 44 0" fill="var(--fg-1)" opacity="0.1"/>
              <line x1="200" y1="92" x2="200" y2="120" stroke="var(--fg-1)" strokeWidth="3"/>
              {/* caption arrow */}
              <path d="M250 230 L 320 220" stroke="var(--fg-1)" strokeWidth="1.5" markerEnd="url(#arrow)" fill="none"/>
              <text x="252" y="252" fontFamily="var(--font-serif)" fontStyle="italic" fontSize="14" fill="var(--fg-1)">
                ↘ &ldquo;just one more app&rdquo;
              </text>
            </svg>
          </div>
          <div style={{
            fontFamily: 'var(--font-serif)', fontStyle: 'italic',
            fontSize: 14, color: 'var(--fg-2)', textAlign: 'center'
          }}>
            Caption: The Operator&rsquo;s Predicament. Drawn by the editor.
          </div>
        </div>

        {/* Op-Ed text + signed pieces */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <article style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-3)'
            }}>↳ FROM THE EDITORS</div>
            <h2 style={{
              margin: 0,
              fontFamily: 'var(--font-hero)', fontWeight: 700,
              fontSize: 'clamp(28px, 3.6vw, 56px)',
              letterSpacing: '-0.035em', lineHeight: 0.96,
              color: 'var(--fg-1)', textWrap: 'balance'
            }}>
              Twelve years on Shopify.{' '}
              <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>
                The take we keep coming back to.
              </span>
            </h2>
            <p style={{
              margin: 0,
              fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 1.55,
              color: 'var(--fg-1)', textWrap: 'pretty'
            }}>
              Software gets you to launch. Growth is what happens after. We stay engaged
              long after go-live, optimizing the operation that the platform alone can&rsquo;t.
              That belief sits behind every project we take on, and every one we turn away.
            </p>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)',
              letterSpacing: '0.08em', textTransform: 'uppercase'
            }}>— The editorial board</div>
          </article>

          {/* Signed columns */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16
          }}>
            {[
              { who: 'A. Ramirez', role: 'Solutions', t: 'On honest scopes.' },
              { who: 'P. Shah',    role: 'Growth',    t: 'The case for fixed retainers.' }
            ].map((c, i) => (
              <article key={i} style={{
                padding: 18,
                background: 'var(--uc-bone)',
                border: '1px solid var(--line-1)',
                display: 'flex', flexDirection: 'column', gap: 10
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                  letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-3)'
                }}>SIGNED COLUMN · {c.role}</div>
                <h3 style={{
                  margin: 0,
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: 18, letterSpacing: '-0.015em', color: 'var(--fg-1)'
                }}>{c.t}</h3>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: 13.5, color: 'var(--fg-2)',
                  lineHeight: 1.45
                }}>
                  A 600-word note on what we believe and why we won&rsquo;t budge on it.
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)',
                  letterSpacing: '0.06em'
                }}>by {c.who}</div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        paddingTop: 14, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>OP-ED · B1</span>
        <span>↳ Classifieds next</span>
      </div>
    </section>
  );
}

// ─── 03 CLASSIFIEDS / ARCHIVE ─────────────────────────────────────────────
function BV43Classifieds() {
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
        gap: 24, paddingBottom: 14,
        borderBottom: '1px solid var(--line-1)',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)',
        letterSpacing: '0.06em'
      }}>
        <PageMark label="Classifieds" noNumber/>
        <span>SECTION C · ARCHIVE + CALL</span>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(28px, 4vh, 48px)',
        display: 'flex', flexDirection: 'column', gap: 28
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, auto)',
          gap: 32, alignItems: 'end'
        }}>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            fontSize: 'clamp(40px, 6vw, 96px)',
            letterSpacing: '-0.045em', lineHeight: 0.9,
            color: 'var(--fg-1)'
          }}>
            The archive,{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>
              filed alphabetically.
            </span>
          </h2>
          <span style={{
            padding: '6px 12px', background: 'var(--uc-black)', color: 'var(--uc-paper)',
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em'
          }}>74 ENTRIES</span>
        </div>

        {/* Three-column dense list */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0,
          borderTop: '1px solid var(--line-1)',
          borderBottom: '1px solid var(--line-1)'
        }}>
          {V4_POSTS.concat(V4_POSTS).slice(0, 12).map((p, i) => (
            <a key={i} href="#" style={{
              padding: '14px 18px 14px 0',
              paddingLeft: (i % 3 !== 0) ? 18 : 0,
              borderLeft: (i % 3 !== 0) ? '1px solid var(--line-1)' : 'none',
              borderBottom: i < 9 ? '1px dotted var(--line-1)' : 'none',
              textDecoration: 'none', color: 'var(--fg-1)',
              display: 'grid', gridTemplateColumns: 'minmax(0, 36px) minmax(0, 1fr) minmax(0, auto)',
              gap: 10, alignItems: 'baseline'
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                color: 'var(--fg-3)'
              }}>{p.cat.slice(0,1)}{i+1}</span>
              <span style={{
                fontFamily: 'var(--font-serif)', fontSize: 14, lineHeight: 1.35,
                color: 'var(--fg-1)'
              }}>{p.title}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)'
              }}>{p.read}</span>
            </a>
          ))}
        </div>

        {/* "Call for letters" */}
        <div style={{
          padding: '20px 24px', background: 'var(--uc-paper)',
          border: '1px dashed var(--fg-1)',
          display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, auto)',
          gap: 24, alignItems: 'center'
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-3)',
              marginBottom: 8
            }}>↳ Call for letters</div>
            <div style={{
              fontFamily: 'var(--font-hero)', fontWeight: 700,
              fontSize: 'clamp(20px, 2vw, 28px)', letterSpacing: '-0.02em',
              color: 'var(--fg-1)', marginBottom: 6
            }}>Write us back.</div>
            <div style={{
              fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.4,
              maxWidth: 560
            }}>
              Got a take on what we shipped this month? A correction? A pointer to a
              better playbook? We read every letter. The good ones make next month&rsquo;s issue.
            </div>
          </div>
          <a href="mailto:letters@uncap.com" className="uc-btn b-primary" style={{ padding: '12px 18px', fontSize: 13 }}>
            letters@uncap.com <span>→</span>
          </a>
        </div>
      </div>

      <div style={{
        paddingTop: 14, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>CLASSIFIEDS · C1</span>
        <span>↳ Subscribe slip next</span>
      </div>
    </section>
  );
}

// ─── 04 SUBSCRIBE SLIP ───────────────────────────────────────────────────
function BV44SubscribeSlip() {
  return (
    <section data-poster="4" style={{
      background: 'var(--uc-paper)', minHeight: '100vh',
      padding: '32px 32px 32px', position: 'relative',
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 14,
        borderBottom: '1px solid var(--line-1)',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)',
        letterSpacing: '0.06em'
      }}>
        <PageMark label="Subscribe" noNumber/>
        <span>BACK PAGE · MAIL-IN COUPON</span>
      </div>

      <div style={{
        flex: 1, paddingTop: 'clamp(40px, 5vh, 80px)',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)',
        gap: 'clamp(40px, 6vw, 96px)', alignItems: 'center'
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--fg-3)', marginBottom: 18
          }}>↳ Mail-in subscription</div>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            fontSize: 'clamp(48px, 7vw, 128px)',
            letterSpacing: '-0.05em', lineHeight: 0.88,
            color: 'var(--fg-1)', textWrap: 'balance'
          }}>
            Take the paper{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>home with you.</span>
          </h2>
          <p style={{
            marginTop: 28, maxWidth: 540,
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)',
            lineHeight: 1.5, color: 'var(--fg-2)'
          }}>
            One issue, the last working day of each month. Front page essay, op-ed,
            classifieds, the shipping log. Free. No drips.
          </p>
        </div>

        {/* Coupon */}
        <form onSubmit={(e) => e.preventDefault()} style={{
          padding: 32,
          background: 'var(--uc-cream)',
          border: '2px dashed var(--fg-1)',
          position: 'relative',
          display: 'flex', flexDirection: 'column', gap: 18,
          transform: 'rotate(0.5deg)'
        }}>
          {/* Scissors mark */}
          <div aria-hidden="true" style={{
            position: 'absolute', top: -12, left: 16,
            background: 'var(--uc-paper)', padding: '0 8px',
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-3)'
          }}>✂ cut here ─ ─ ─ ─ ─ ─ ─</div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-3)'
          }}>
            <span>UC.DISPATCH · COUPON № 42</span>
            <span>2026 · CHI</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            fontSize: 'clamp(28px, 3vw, 44px)', letterSpacing: '-0.04em',
            color: 'var(--fg-1)', lineHeight: 1.0
          }}>
            Yes! Send me the issue.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-3)'
              }}>Name</span>
              <input style={{
                padding: '10px 12px', background: 'transparent',
                border: 'none', borderBottom: '1px solid var(--fg-1)',
                fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--fg-1)',
                outline: 'none'
              }} placeholder="Maria Whitmore"/>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-3)'
              }}>Address (email)</span>
              <input type="email" style={{
                padding: '10px 12px', background: 'transparent',
                border: 'none', borderBottom: '1px solid var(--fg-1)',
                fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--fg-1)',
                outline: 'none'
              }} placeholder="maria@operator.co"/>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-3)'
              }}>Role · operation</span>
              <input style={{
                padding: '10px 12px', background: 'transparent',
                border: 'none', borderBottom: '1px solid var(--fg-1)',
                fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--fg-1)',
                outline: 'none'
              }} placeholder="COO · Wholesale"/>
            </label>
          </div>
          <button className="uc-btn b-primary" style={{
            alignSelf: 'flex-start', marginTop: 8
          }}>
            Mail me the paper <span>→</span>
          </button>
          <div style={{
            paddingTop: 12, borderTop: '1px dashed var(--fg-1)',
            fontFamily: 'var(--font-serif)', fontStyle: 'italic',
            fontSize: 13, color: 'var(--fg-2)'
          }}>
            4,200+ operators reading. One click to cancel.
          </div>
        </form>
      </div>

      <div style={{
        paddingTop: 14, borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)'
      }}>
        <span>UC.DISPATCH · BACK PAGE</span>
        <span>SET IN INTER · FRAUNCES · JETBRAINS MONO</span>
      </div>
    </section>
  );
}

window.BV41Front = BV41Front;
window.BV42Oped = BV42Oped;
window.BV43Classifieds = BV43Classifieds;
window.BV44SubscribeSlip = BV44SubscribeSlip;
