// PostersB.jsx — Four additional posters in the same series.
// Slots: 03 Promise · 05 Path · 06 Focus · 09 Mission
// Same visual grammar: full viewport · top + bottom rails · poster-scale type · single lime move.

// ─── 03 PROMISE ───────────────────────────────────────────────────────────
function P3Promise() {
  const outs = [
    {
      n: '01', icon: 'systems',
      h: 'Integrated Systems',
      d: 'Native to Shopify. Flexible enough to grow with you. Secure and compliant without an ops team to babysit them.'
    },
    {
      n: '02', icon: 'revenue',
      h: 'Revenue Engine',
      d: 'AOV. Conversion. Retention. Quote-to-cash speed. Margin per order. Numbers that move, and a team that hits them.'
    },
    {
      n: '03', icon: 'debt',
      h: 'Lower Tech Debt',
      d: 'Native products that work with the team you have. Fewer tools. One partner. Enterprise capability without enterprise overhead.'
    }
  ];
  return (
    <section data-poster="3" style={{
      background: 'var(--uc-paper)',
      minHeight: '100vh',
      padding: '48px 48px 48px',
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      gap: 48
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20,
        borderBottom: '1px solid var(--line-1)'
      }}>
        <PageMark n={3} label="The promise"/>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--fg-3)', letterSpacing: 0
        }}>UC.GAP-02 · CLOSE</div>
      </div>

      {/* TOP — tagline */}
      <div style={{
        paddingTop: 64, paddingBottom: 48,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, auto)',
        gap: 32, alignItems: 'end'
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-serif)', fontWeight: 400,
            fontSize: 'clamp(18px, 1.6vw, 22px)',
            letterSpacing: '-0.01em',
            color: 'var(--fg-2)', marginBottom: 28
          }}>Uncap exists to close that gap.</div>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)',
            fontWeight: 700,
            fontSize: 'clamp(36px, 5.4vw, 96px)',
            letterSpacing: '-0.05em',
            lineHeight: 0.95,
            color: 'var(--fg-1)',
            whiteSpace: 'nowrap'
          }}>
            Same caliber.{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>Without the drag.</span>
          </h2>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '10px 16px',
          background: 'var(--uc-signal)',
          borderRadius: 3,
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'var(--uc-black)',
          whiteSpace: 'nowrap'
        }}>↳ Here's what we deliver</div>
      </div>

      {/* MIDDLE — Cinematic photo band with overlay copy */}
      <div style={{
        position: 'relative',
        flex: 1,
        minHeight: 320,
        borderRadius: 5,
        overflow: 'hidden',
        background: 'var(--uc-black)',
        marginBottom: 48
      }}>
        <image-slot
          id="poster-p3-band"
          shape="rect"
          radius="5"
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1800&q=80"
          placeholder="Wide cinematic: warehouse, manufacturing line, or shop floor"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            display: 'block'
          }}
        />
        {/* Dark tint */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          background:
            'linear-gradient(90deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.55) 50%, rgba(10,10,10,0.85) 100%)',
          pointerEvents: 'none'
        }}/>
        {/* Faint grid on top */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          background:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          pointerEvents: 'none'
        }}/>

        {/* Overlay copy */}
        <div style={{
          position: 'relative', zIndex: 1,
          padding: 'clamp(28px, 4vw, 56px)',
          height: '100%',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          color: 'var(--uc-paper)'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'var(--uc-stone-500)'
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8
            }}>
              <span className="uc-pulse" style={{ width: 5, height: 5 }}/>
              On the floor · in use
            </span>
            <span>UC.LIFE.01</span>
          </div>

          <div style={{ maxWidth: 720, marginTop: 'clamp(40px, 6vh, 96px)' }}>
            <div style={{
              fontFamily: 'var(--font-serif)', fontWeight: 400,
              fontSize: 'clamp(20px, 2.4vw, 36px)',
              letterSpacing: '-0.015em',
              lineHeight: 1.2,
              color: 'var(--uc-paper)',
              textWrap: 'balance'
            }}>
              Engineered for the warehouse aisle, the sales floor, the back office — wherever real work happens.
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            gap: 16, flexWrap: 'wrap',
            paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,0.15)'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--uc-stone-300)', letterSpacing: 0
            }}>
              <span>OPERATOR-LED</span>
              <span style={{ width: 14, height: 1, background: '#2B2B2B' }}/>
              <span>SHOPIFY-NATIVE</span>
              <span style={{ width: 14, height: 1, background: '#2B2B2B' }}/>
              <span>SINCE 2013</span>
            </div>
            <span style={{
              fontFamily: 'var(--font-hero)', fontWeight: 800,
              fontSize: 'clamp(36px, 4vw, 64px)', letterSpacing: '-0.045em',
              lineHeight: 1, color: 'var(--uc-signal)'
            }}>3 outcomes.</span>
          </div>
        </div>
      </div>

      {/* BOTTOM — three outcomes in a row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 0,
        borderTop: '1px solid var(--line-1)',
        borderBottom: '1px solid var(--line-1)'
      }}>
        {outs.map((o, i) => (
          <div key={o.n} style={{
            padding: '40px 32px',
            borderLeft: i > 0 ? '1px solid var(--line-1)' : 'none',
            paddingLeft: i === 0 ? 0 : 40,
            paddingRight: i === outs.length - 1 ? 0 : 40,
            display: 'flex', flexDirection: 'column', gap: 16
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'var(--fg-3)', letterSpacing: 0
            }}>{o.n} / 03</span>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'auto minmax(0, 1fr)',
              columnGap: 20, alignItems: 'start'
            }}>
              <span aria-hidden="true" style={{
                width: 56, height: 56,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-start',
                color: 'var(--uc-black)', flexShrink: 0
              }}>
                <OutcomeIcon kind={o.icon}/>
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
                <h3 style={{
                  margin: 0,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 'clamp(22px, 2.4vw, 32px)',
                  letterSpacing: '-0.028em',
                  lineHeight: 1.1,
                  color: 'var(--fg-1)',
                  textWrap: 'balance'
                }}>{o.h}</h3>
                <p style={{
                  margin: 0,
                  fontFamily: 'var(--font-serif)', fontWeight: 400,
                  fontSize: 'clamp(14px, 1.15vw, 17px)',
                  lineHeight: 1.4, letterSpacing: '-0.005em',
                  color: 'var(--fg-2)'
                }}>{o.d}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        paddingTop: 32,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'var(--fg-3)', letterSpacing: 0
      }}>
        <span>3 outcomes · committed in writing</span>
        <span>UC.PROMISE</span>
      </div>
    </section>
  );
}

// ─── 05 PATH ──────────────────────────────────────────────────────────────
// Vertical "departures board" — three steps stacked, each a wide row.
//   left:   outline GATE number with lime tick
//   center: mega step name (clamp up to 144px)
//   right:  cycle + outcome line + lime ENTER chip
// A continuous lime spine runs the full height connecting each gate.
function P5Path() {
  const steps = [
    { gate: '01', name: 'Migrate', cycle: '10–16 WKS', type: 'REPLATFORM',  out: 'Replatform from another cart to Shopify with a brand-new tech stack.' },
    { gate: '02', name: 'Launch',  cycle: '6–10 WKS',  type: 'GREENFIELD', out: 'Launch your storefront or ordering portal on Shopify.' },
    { gate: '03', name: 'Unify',   cycle: '4–8 WKS',   type: 'UPGRADE',    out: 'Upgrade your current Shopify and enable B2B primitives.' }
  ];
  const [hover, setHover] = React.useState(-1);

  return (
    <section data-poster="5" style={{
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
        WebkitMaskImage: `url(${window.__resources.bgVector2})`,
        maskImage: `url(${window.__resources.bgVector2})`,
        WebkitMaskSize: 'cover', maskSize: 'cover',
        WebkitMaskPosition: 'center', maskPosition: 'center',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat'
      }}/>
      {/* TOP rail */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20,
        borderBottom: '1px solid #1F1F1F'
      }}>
        <PageMark n={5} label="Your path" dark/>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 14,
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--uc-stone-500)', letterSpacing: 0
        }}>
          <span>UC.PATH</span>
          <span style={{ width: 12, height: 1, background: '#2B2B2B' }}/>
          <span>3 GATES · ANY ENTRY</span>
        </div>
      </div>

      {/* Sub-headline + intro band */}
      <div style={{
        paddingTop: 40, paddingBottom: 32,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, auto)',
        gap: 24, alignItems: 'end',
        borderBottom: '1px solid #1F1F1F'
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)',
            fontWeight: 700,
            fontSize: 'clamp(40px, 5.6vw, 88px)',
            letterSpacing: '-0.045em',
            lineHeight: 0.95,
            color: 'var(--uc-paper)',
            textWrap: 'balance'
          }}>
            Three Commerce tracks.{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>Board where you need to.</span>
          </h2>
          <p style={{
            margin: '14px 0 0',
            fontFamily: 'var(--font-serif)', fontWeight: 400,
            fontSize: 'clamp(18px, 1.5vw, 22px)',
            letterSpacing: '-0.01em', lineHeight: 1.4,
            color: 'var(--uc-stone-300)',
            maxWidth: 760
          }}>
            Migrate. Launch. Unify. The same team, ready for whichever fits the moment you’re in.
          </p>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '6px 12px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid #2B2B2B',
          borderRadius: 3,
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--uc-paper)', letterSpacing: 0
        }}>
          <span className="uc-pulse" style={{ width: 6, height: 6 }}/>
          BOARDING
        </div>
      </div>

      {/* The board */}
      <div style={{
        flex: 1, position: 'relative',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center'
      }}>
        {/* Lime spine — continuous on the left */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          left: 56, top: 32, bottom: 32, width: 2,
          background: 'linear-gradient(180deg, transparent 0, var(--uc-signal) 8%, var(--uc-signal) 92%, transparent 100%)',
          opacity: 0.6
        }}/>

        {steps.map((s, i) => {
          const on = hover === i || hover === -1;
          return (
            <div
              key={s.gate}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(-1)}
              style={{
                position: 'relative',
                padding: 'clamp(24px, 3.2vw, 44px) 0',
                borderTop: '1px solid #1F1F1F',
                borderBottom: i === steps.length - 1 ? '1px solid #1F1F1F' : 'none',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 80px) minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, auto)',
                gap: 'clamp(20px, 3vw, 56px)',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'background .3s var(--ease-out), opacity .3s var(--ease-out)',
                background: hover === i ? 'rgba(73, 90, 243, 0.04)' : 'transparent',
                opacity: on ? 1 : 0.35
              }}
            >
              {/* Lime dot on the spine */}
              <div aria-hidden="true" style={{
                position: 'absolute',
                left: 50, top: '50%', transform: 'translate(0, -50%)',
                width: hover === i ? 14 : 10,
                height: hover === i ? 14 : 10,
                borderRadius: 999,
                background: 'var(--uc-signal)',
                border: '2px solid var(--uc-black)',
                boxShadow: hover === i ? '0 0 0 4px rgba(232,255,82,0.18)' : 'none',
                transition: 'all .25s var(--ease-out)',
                zIndex: 2
              }}/>

              {/* spacer for lime spine */}
              <div/>

              {/* Mega step name */}
              <div>
                <h3 style={{
                  margin: 0,
                  fontFamily: 'var(--font-hero)',
                  fontWeight: 800,
                  fontSize: 'clamp(48px, 9vw, 144px)',
                  letterSpacing: '-0.055em',
                  lineHeight: 0.88,
                  color: 'var(--uc-paper)'
                }}>{s.name}</h3>
                <p style={{
                  margin: '14px 0 0',
                  fontFamily: 'var(--font-serif)', fontWeight: 400,
                  fontSize: 'clamp(16px, 1.4vw, 20px)',
                  letterSpacing: '-0.008em', lineHeight: 1.35,
                  color: 'var(--uc-stone-300)',
                  maxWidth: 540
                }}>{s.out}</p>
              </div>

              {/* Cycle column */}
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 6,
                paddingLeft: 24,
                borderLeft: '1px solid #1F1F1F'
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  color: 'var(--uc-stone-500)', letterSpacing: '0.16em'
                }}>CYCLE</span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: 24, letterSpacing: '-0.022em',
                  color: 'var(--uc-paper)'
                }}>{s.cycle}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  color: 'var(--uc-stone-500)', letterSpacing: '0.16em',
                  marginTop: 6
                }}>{s.type}</span>
              </div>

              {/* Enter chip */}
              <a href="#" style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '14px 20px',
                background: hover === i ? 'var(--uc-signal)' : 'transparent',
                color: hover === i ? 'var(--uc-black)' : 'var(--uc-paper)',
                border: '1px solid ' + (hover === i ? 'var(--uc-signal)' : '#2B2B2B'),
                borderRadius: 3,
                textDecoration: 'none',
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.12em',
                transition: 'all .2s var(--ease-out)',
                whiteSpace: 'nowrap'
              }}>
                ENTER
                <span style={{ display: 'inline-flex', transition: 'transform .2s var(--ease-out)', transform: hover === i ? 'translateX(4px)' : 'none' }}>↳</span>
              </a>
            </div>
          );
        })}
      </div>

      {/* BOTTOM rail */}
      <div style={{
        paddingTop: 20,
        borderTop: '1px solid #1F1F1F',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: 16, flexWrap: 'wrap',
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'var(--uc-stone-500)', letterSpacing: 0
      }}>
        <span>↳ Each stop is self-contained · Together, they compound.</span>
        <a href="#" className="uc-link uc-link-light" style={{ fontSize: 13 }}>
          Map your path <span>→</span>
        </a>
      </div>
    </section>
  );
}

// ─── 06 FOCUS ─────────────────────────────────────────────────────────────
// Tabs: Unified · Distribution · Manufacturing. Each shows an HTML graphic
// underneath (faux product UI) demonstrating that flavor of commerce.
function P6Focus() {
  const tabs = [
    { id: 'unified',       label: 'Unified',       sub: 'Brand blending DTC / B2B in one roof' },
    { id: 'distribution',  label: 'Distribution',  sub: 'Large catalog storefronts B2B native' },
    { id: 'manufacturing', label: 'Manufacturing', sub: 'Private ordering portals' }
  ];
  const DUR = 6000; // ms per tab
  const [active, setActive] = React.useState('unified');
  const [paused, setPaused] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [seen, setSeen] = React.useState(false);
  const startRef = React.useRef(performance.now());
  const sectionRef = React.useRef(null);

  // Start timer only when scrolled into view
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

  // Reset clock when active or pause changes
  React.useEffect(() => {
    startRef.current = performance.now();
    setProgress(0);
  }, [active, paused]);

  // Animate progress + auto-advance
  React.useEffect(() => {
    if (paused || !seen) return;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - startRef.current) / DUR);
      setProgress(t);
      if (t >= 1) {
        const i = tabs.findIndex(x => x.id === active);
        const next = tabs[(i + 1) % tabs.length].id;
        setActive(next);
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, paused, seen]);

  const onPick = (id) => {
    setActive(id);
    setPaused(true);
  };

  return (
    <section ref={sectionRef} data-poster="6" style={{
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
        WebkitMaskImage: `url(${window.__resources.bgVector3})`,
        maskImage: `url(${window.__resources.bgVector3})`,
        WebkitMaskSize: 'cover', maskSize: 'cover',
        WebkitMaskPosition: 'center', maskPosition: 'center',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat'
      }}/>

      {/* TOP rail */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20,
        borderBottom: '1px solid var(--line-1)'
      }}>
        <PageMark n={6} label="Your context"/>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--fg-3)', letterSpacing: 0
        }}>UC.MAP · 3 PATTERNS</div>
      </div>

      {/* Tabs */}
      <div style={{
        position: 'relative', zIndex: 1,
        paddingTop: 40, paddingBottom: 32,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 0,
        borderBottom: '1px solid var(--line-1)'
      }}>
        {tabs.map((t, i) => {
          const on = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onPick(t.id)}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              style={{
                border: 'none', background: 'transparent',
                padding: '8px 20px 28px',
                borderLeft: i > 0 ? '1px solid var(--line-1)' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
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
              }}>{t.label}</div>
              <div style={{
                fontFamily: 'var(--font-serif)', fontWeight: 400,
                fontSize: 'clamp(14px, 1.1vw, 17px)',
                letterSpacing: '-0.005em', lineHeight: 1.35,
                color: 'var(--fg-2)'
              }}>{t.sub}</div>
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

      {/* Graphic */}
      <div style={{
        position: 'relative', zIndex: 1,
        flex: 1, paddingTop: 32,
        minHeight: 0
      }}>
        {active === 'unified'       && <UnifiedGraphic/>}
        {active === 'distribution'  && <DistributionGraphic/>}
        {active === 'manufacturing' && <ManufacturingGraphic/>}
      </div>

      {/* BOTTOM rail */}
      <div style={{
        position: 'relative', zIndex: 1,
        paddingTop: 16, marginTop: 20,
        borderTop: '1px solid var(--line-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'var(--fg-3)', letterSpacing: 0
      }}>
        <span>UC.PATTERN · {active.toUpperCase()}</span>
        <a href="#" className="uc-link" style={{ fontSize: 13 }}>
          Talk to a {active} expert <span>→</span>
        </a>
      </div>
    </section>
  );
}

// ── Shared chrome ─────────────────────────────────────────────────────────
function StorefrontChrome({ children, accent = 'var(--uc-brand)' }) {
  return (
    <div style={{
      background: 'var(--uc-paper)',
      border: '1px solid var(--line-2)',
      borderRadius: 5,
      overflow: 'hidden',
      boxShadow: '0 24px 64px -32px rgba(10,10,10,0.18)',
      width: '100%', margin: '0 auto'
    }}>
      {/* Promo bar */}
      <div style={{
        background: 'var(--uc-black)', color: 'var(--uc-paper)',
        padding: '8px 16px',
        fontSize: 11, fontWeight: 500, letterSpacing: '-0.005em',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span>Free shipping on orders over $200!</span>
        <span style={{ display: 'inline-flex', gap: 14 }}>
          <span style={{ opacity: 0.7 }}>Save 20%</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span style={{ opacity: 0.7 }}>Subscribe to our Newsletter</span>
        </span>
      </div>

      {/* Header */}
      <div style={{
        padding: '14px 18px',
        display: 'grid', gridTemplateColumns: 'auto 1fr auto',
        gap: 16, alignItems: 'center',
        borderBottom: '1px solid var(--line-1)'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 26, height: 26, borderRadius: 999,
              background: accent,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6 4 V12 a6 6 0 0 0 12 0 V4" stroke="var(--uc-paper)" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </span>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17,
              color: 'var(--fg-1)', letterSpacing: '-0.015em'
            }}>
              uncap<span style={{ color: 'var(--fg-3)' }}>store</span>
            </span>
          </div>
          {/* Products nav button */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '6px 10px 6px 8px',
            background: 'var(--uc-paper)',
            border: '1px solid var(--line-1)',
            borderRadius: 5,
            fontSize: 12, fontWeight: 600, color: 'var(--fg-1)',
            letterSpacing: '-0.005em'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 6 H 20 M 4 12 H 20 M 4 18 H 20" stroke="var(--fg-1)" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Products
            <span style={{ fontSize: 9, color: 'var(--fg-3)' }}>▾</span>
          </span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--uc-bone)',
          border: '1px solid var(--line-1)',
          borderRadius: 999,
          padding: '6px 14px',
          maxWidth: 480, margin: '0 auto', width: '100%'
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="var(--fg-3)" strokeWidth="2"/>
            <path d="M20 20 L16 16" stroke="var(--fg-3)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>Search products</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{
            padding: '5px 10px', background: '#EFF6F4',
            borderRadius: 5, fontSize: 11, fontWeight: 600, color: 'var(--fg-1)'
          }}>Help</span>
          <span style={{ fontSize: 11, color: 'var(--fg-2)' }}>Explore ▾</span>
          <span style={{ fontSize: 11, color: 'var(--fg-2)' }}>Account ▾</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 12px', background: 'var(--uc-black)',
            color: 'var(--uc-paper)', borderRadius: 5,
            fontSize: 11, fontWeight: 600
          }}>
            <span style={{
              width: 16, height: 16, borderRadius: 999,
              background: 'rgba(255,255,255,0.2)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9
            }}>2</span>
            Cart
          </span>
        </div>
      </div>

      {children}
    </div>
  );
}

function MiniChip({ children, dark, accent, mono }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 7px',
      background: dark ? 'var(--uc-black)' : (accent || 'var(--uc-paper)'),
      color: dark ? 'var(--uc-paper)' : (accent ? 'var(--uc-paper)' : 'var(--fg-1)'),
      border: !dark && !accent ? '1px solid var(--line-1)' : 'none',
      borderRadius: 3,
      fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
      fontSize: 9, fontWeight: 700,
      letterSpacing: '0.06em', textTransform: 'uppercase'
    }}>{children}</span>
  );
}

// ── 01 UNIFIED — Furniture catalog ────────────────────────────────────────
// Vector furniture pieces drawn inline. Cream paper-tone backgrounds.
function FurnIcon({ kind }) {
  // Modern, refined product illustrations. Light tones, soft shadows, restrained line.
  const INK   = '#1A1A1A';
  const HAIR  = 'rgba(26,26,26,0.18)';
  const HAIR2 = 'rgba(26,26,26,0.32)';
  const SHADOW= 'rgba(26,26,26,0.08)';
  const PAPER = '#FFFFFF';

  // Palette — premium, light, modern
  const BOUCLE   = '#F0E6D6'; // pale boucle upholstery
  const BOUCLE_S = '#D8C8AC';
  const CLAY     = '#E4BFA8'; // soft clay
  const CLAY_S   = '#C99B7E';
  const SAND     = '#E5D5B8'; // sand / oak wash
  const SAND_S   = '#C7B083';
  const OAK      = '#D3B886'; // mid oak
  const OAK_S    = '#A48852';
  const WAL      = '#7E5A3D'; // light walnut (warmer, not muddy)
  const WAL_S    = '#5E4128';
  const BRASS    = '#D9B470';
  const BRASS_S  = '#A98441';
  const TRAV     = '#E8E2D2'; // pale travertine
  const TRAV_S   = '#C1B89F';
  const SAGE     = '#B8C2A2';
  const SAGE_S   = '#94A07B';
  const LIME     = 'var(--uc-signal)';
  const wrap = { width: '94%', height: '94%', overflow: 'visible' };

  switch (kind) {
    case 'lounge':
      // Curved-back lounge chair — boucle upholstery, slim walnut legs
      return (
        <svg viewBox="0 0 60 60" style={wrap} fill="none">
          <ellipse cx="32" cy="55" rx="18" ry="1.3" fill={SHADOW}/>
          {/* curved shell */}
          <path d="M14 42 Q 12 16 30 16 Q 48 16 48 32 L 48 42 Z" fill={BOUCLE}/>
          <path d="M14 42 Q 12 16 30 16 Q 48 16 48 32" stroke={HAIR2} strokeWidth="0.7" fill="none"/>
          {/* seat cushion seam */}
          <path d="M14 36 Q 26 34 48 36" stroke={BOUCLE_S} strokeWidth="0.5"/>
          {/* slim legs */}
          <line x1="18" y1="42" x2="14" y2="52" stroke={WAL} strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="44" y1="42" x2="48" y2="52" stroke={WAL} strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      );

    case 'sofa':
      // Low-slung modular sofa — long bench cushion, twin back pillows
      return (
        <svg viewBox="0 0 60 60" style={wrap} fill="none">
          <ellipse cx="30" cy="52" rx="24" ry="1.3" fill={SHADOW}/>
          {/* base */}
          <rect x="5" y="34" width="50" height="12" rx="3" fill={CLAY}/>
          {/* seat cushion seams */}
          <line x1="25" y1="34" x2="25" y2="46" stroke={CLAY_S} strokeWidth="0.5" opacity="0.7"/>
          <line x1="35" y1="34" x2="35" y2="46" stroke={CLAY_S} strokeWidth="0.5" opacity="0.7"/>
          {/* back pillows */}
          <path d="M10 22 Q 16 18 24 22 L 24 34 L 10 34 Z" fill={BOUCLE}/>
          <path d="M26 24 Q 30 20 34 24 L 34 34 L 26 34 Z" fill={SAGE} opacity="0.85"/>
          <path d="M36 22 Q 44 18 50 22 L 50 34 L 36 34 Z" fill={BOUCLE}/>
          {/* slim legs */}
          <line x1="8" y1="46" x2="8" y2="50" stroke={WAL} strokeWidth="1.4" strokeLinecap="round"/>
          <line x1="52" y1="46" x2="52" y2="50" stroke={WAL} strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      );

    case 'dining':
      // Wishbone-style dining chair — oak frame, woven seat
      return (
        <svg viewBox="0 0 60 60" style={wrap} fill="none">
          <ellipse cx="30" cy="55" rx="13" ry="1" fill={SHADOW}/>
          {/* curved back — Y silhouette */}
          <path d="M18 24 Q 18 8 30 8 Q 42 8 42 24" stroke={OAK} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
          <path d="M30 8 L 30 26" stroke={OAK} strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M22 26 Q 30 22 38 26" stroke={OAK} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
          {/* woven seat — diamond paper-cord */}
          <ellipse cx="30" cy="32" rx="14" ry="3.5" fill={SAND}/>
          <line x1="18" y1="32" x2="42" y2="32" stroke={SAND_S} strokeWidth="0.4"/>
          {/* legs — splayed */}
          <line x1="20" y1="34" x2="16" y2="52" stroke={OAK} strokeWidth="1.4" strokeLinecap="round"/>
          <line x1="40" y1="34" x2="44" y2="52" stroke={OAK} strokeWidth="1.4" strokeLinecap="round"/>
          <line x1="23" y1="34" x2="22" y2="48" stroke={OAK} strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="37" y1="34" x2="38" y2="48" stroke={OAK} strokeWidth="1.2" strokeLinecap="round"/>
          {/* stretcher */}
          <line x1="18" y1="44" x2="42" y2="44" stroke={OAK_S} strokeWidth="0.8"/>
        </svg>
      );

    case 'table':
      // Round pedestal dining table — pale oak top, conical base
      return (
        <svg viewBox="0 0 60 60" style={wrap} fill="none">
          <ellipse cx="30" cy="54" rx="22" ry="1.5" fill={SHADOW}/>
          {/* top ellipse */}
          <ellipse cx="30" cy="20" rx="26" ry="4.5" fill={SAND}/>
          <ellipse cx="30" cy="20" rx="26" ry="4.5" stroke={SAND_S} strokeWidth="0.5"/>
          {/* top edge highlight */}
          <ellipse cx="30" cy="18" rx="24" ry="2.5" fill={PAPER} opacity="0.5"/>
          {/* pedestal */}
          <path d="M22 24 Q 24 36 18 50 L 42 50 Q 36 36 38 24" fill={SAND}/>
          <path d="M22 24 Q 24 36 18 50" stroke={SAND_S} strokeWidth="0.5" fill="none"/>
          <path d="M38 24 Q 36 36 42 50" stroke={SAND_S} strokeWidth="0.5" fill="none"/>
          {/* base disk */}
          <ellipse cx="30" cy="50" rx="13" ry="2" fill={SAND_S}/>
        </svg>
      );

    case 'side':
      // Travertine drum side table — minimal cylinder, soft veining
      return (
        <svg viewBox="0 0 60 60" style={wrap} fill="none">
          <ellipse cx="30" cy="54" rx="15" ry="1.3" fill={SHADOW}/>
          {/* top */}
          <ellipse cx="30" cy="14" rx="14" ry="3.2" fill={TRAV}/>
          <ellipse cx="30" cy="14" rx="14" ry="3.2" stroke={TRAV_S} strokeWidth="0.5"/>
          {/* cylinder body */}
          <path d="M16 14 L 16 46 Q 30 49 44 46 L 44 14" fill={TRAV}/>
          <path d="M16 14 L 16 46 Q 30 49 44 46 L 44 14" stroke={TRAV_S} strokeWidth="0.5"/>
          {/* highlight column */}
          <path d="M20 16 L 20 44" stroke={PAPER} strokeWidth="1.2" opacity="0.7"/>
          {/* soft veining */}
          <path d="M26 18 Q 28 30 27 44" stroke={TRAV_S} strokeWidth="0.35" opacity="0.5"/>
          <path d="M36 22 Q 35 32 36 42" stroke={TRAV_S} strokeWidth="0.35" opacity="0.4"/>
        </svg>
      );

    case 'pendant':
      // Globe pendant — frosted opal sphere, slim brass cord
      return (
        <svg viewBox="0 0 60 60" style={wrap} fill="none">
          <line x1="30" y1="4" x2="30" y2="22" stroke={INK} strokeWidth="0.8"/>
          <circle cx="30" cy="3.5" r="1.3" fill={INK}/>
          {/* canopy disc */}
          <ellipse cx="30" cy="22" rx="3.5" ry="0.9" fill={BRASS}/>
          {/* opal sphere */}
          <circle cx="30" cy="36" r="13" fill="#FAF6EC"/>
          <circle cx="30" cy="36" r="13" stroke={HAIR2} strokeWidth="0.5"/>
          {/* highlight crescent */}
          <path d="M22 30 Q 24 28 28 28" stroke={PAPER} strokeWidth="2" opacity="0.9" strokeLinecap="round" fill="none"/>
          <ellipse cx="26" cy="34" rx="3" ry="6" fill={PAPER} opacity="0.45"/>
          {/* warm glow underside */}
          <ellipse cx="30" cy="44" rx="10" ry="2" fill={LIME} opacity="0.55"/>
          <ellipse cx="30" cy="48" rx="14" ry="2.5" fill={LIME} opacity="0.1"/>
        </svg>
      );

    case 'floor':
      // Arc floor lamp — pale stone base, slender brass arc, paper drum shade
      return (
        <svg viewBox="0 0 60 60" style={wrap} fill="none">
          <ellipse cx="13" cy="55" rx="9" ry="1.3" fill={SHADOW}/>
          {/* stone disc base */}
          <ellipse cx="13" cy="52" rx="9" ry="1.8" fill={TRAV}/>
          <ellipse cx="13" cy="52" rx="9" ry="1.8" stroke={TRAV_S} strokeWidth="0.5"/>
          {/* brass arc */}
          <path d="M13 52 L 13 38 Q 13 12 44 12" stroke={BRASS} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
          {/* shade — paper drum */}
          <path d="M40 8 L 50 8 L 47 22 L 43 22 Z" fill={PAPER}/>
          <path d="M40 8 L 50 8 L 47 22 L 43 22 Z" stroke={HAIR2} strokeWidth="0.6" strokeLinejoin="round"/>
          {/* shade banding */}
          <line x1="41" y1="12" x2="49" y2="12" stroke={HAIR} strokeWidth="0.4"/>
          {/* warm glow */}
          <ellipse cx="45" cy="24" rx="6" ry="1.1" fill={LIME} opacity="0.7"/>
          <ellipse cx="45" cy="28" rx="9" ry="1.6" fill={LIME} opacity="0.12"/>
        </svg>
      );

    case 'shelf':
      // Wall-mounted floating shelves — three pale oak slabs with curated objects
      return (
        <svg viewBox="0 0 60 60" style={wrap} fill="none">
          <ellipse cx="30" cy="55" rx="22" ry="1" fill={SHADOW} opacity="0.6"/>
          {/* three shelves — oak slabs */}
          <rect x="8" y="16" width="44" height="2.2" rx="0.5" fill={SAND}/>
          <rect x="8" y="34" width="44" height="2.2" rx="0.5" fill={SAND}/>
          <rect x="8" y="52" width="44" height="2.2" rx="0.5" fill={SAND}/>
          {/* subtle wall hairlines */}
          <line x1="8" y1="18.2" x2="52" y2="18.2" stroke={SAND_S} strokeWidth="0.3"/>
          <line x1="8" y1="36.2" x2="52" y2="36.2" stroke={SAND_S} strokeWidth="0.3"/>
          <line x1="8" y1="54.2" x2="52" y2="54.2" stroke={SAND_S} strokeWidth="0.3"/>

          {/* TOP shelf — vase + sphere + thin frame */}
          <path d="M14 16 L 14 11 Q 14 8 18 8 Q 22 8 22 11 L 22 16" fill={CLAY}/>
          <circle cx="32" cy="13" r="3.5" fill={BRASS} opacity="0.85"/>
          <rect x="40" y="8" width="9" height="8" fill="none" stroke={INK} strokeWidth="0.6"/>
          <line x1="40" y1="11" x2="49" y2="11" stroke={INK} strokeWidth="0.4"/>

          {/* MIDDLE shelf — books + small bowl */}
          <rect x="14" y="26" width="2" height="8" fill={WAL}/>
          <rect x="16.5" y="27" width="2" height="7" fill={CLAY}/>
          <rect x="19" y="25" width="2" height="9" fill={SAGE}/>
          <rect x="21.5" y="28" width="2" height="6" fill={SAND_S}/>
          <path d="M34 30 Q 38 28 42 30 L 41 34 L 35 34 Z" fill={SAGE} opacity="0.9"/>

          {/* BOTTOM shelf — basket + flat plate */}
          <path d="M14 44 L 24 44 L 22 52 L 16 52 Z" fill={BOUCLE}/>
          <line x1="15" y1="46" x2="23" y2="46" stroke={BOUCLE_S} strokeWidth="0.4"/>
          <line x1="16" y1="49" x2="22" y2="49" stroke={BOUCLE_S} strokeWidth="0.4"/>
          <ellipse cx="38" cy="50" rx="6" ry="1.4" fill={TRAV}/>
          <ellipse cx="38" cy="50" rx="6" ry="1.4" stroke={TRAV_S} strokeWidth="0.4"/>
        </svg>
      );

    case 'rug':
      // Minimal modern rug — soft tonal stripes and a single off-center circle
      return (
        <svg viewBox="0 0 60 60" style={wrap} fill="none">
          {/* tassels — light, sparse */}
          <line x1="7" y1="14" x2="6" y2="11" stroke={HAIR2} strokeWidth="0.8"/>
          <line x1="10" y1="14" x2="9" y2="11" stroke={HAIR2} strokeWidth="0.8"/>
          <line x1="50" y1="14" x2="51" y2="11" stroke={HAIR2} strokeWidth="0.8"/>
          <line x1="53" y1="14" x2="54" y2="11" stroke={HAIR2} strokeWidth="0.8"/>
          <line x1="7" y1="46" x2="6" y2="49" stroke={HAIR2} strokeWidth="0.8"/>
          <line x1="10" y1="46" x2="9" y2="49" stroke={HAIR2} strokeWidth="0.8"/>
          <line x1="50" y1="46" x2="51" y2="49" stroke={HAIR2} strokeWidth="0.8"/>
          <line x1="53" y1="46" x2="54" y2="49" stroke={HAIR2} strokeWidth="0.8"/>
          {/* base */}
          <rect x="6" y="14" width="48" height="32" rx="1" fill={BOUCLE}/>
          {/* tonal stripes */}
          <rect x="6" y="20" width="48" height="3" fill={CLAY} opacity="0.55"/>
          <rect x="6" y="33" width="48" height="3" fill={SAGE} opacity="0.55"/>
          {/* off-center circle */}
          <circle cx="22" cy="30" r="6" fill={CLAY} opacity="0.7"/>
          <circle cx="22" cy="30" r="6" stroke={CLAY_S} strokeWidth="0.4"/>
          {/* hairline borders */}
          <rect x="6" y="14" width="48" height="32" rx="1" stroke={HAIR2} strokeWidth="0.5"/>
        </svg>
      );

    case 'mirror':
      // Modern arched standing mirror — slim brass frame, soft reflection gradient
      return (
        <svg viewBox="0 0 60 60" style={wrap} fill="none">
          <defs>
            <linearGradient id="mglass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F8F5EE"/>
              <stop offset="100%" stopColor="#E6E1D3"/>
            </linearGradient>
          </defs>
          <ellipse cx="30" cy="55" rx="14" ry="1.2" fill={SHADOW}/>
          {/* glass */}
          <path d="M20 50 L 20 24 Q 20 10 30 10 Q 40 10 40 24 L 40 50 Z" fill="url(#mglass)"/>
          {/* slim brass frame */}
          <path d="M20 50 L 20 24 Q 20 10 30 10 Q 40 10 40 24 L 40 50" stroke={BRASS} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
          <path d="M20 50 L 40 50" stroke={BRASS} strokeWidth="1.4" strokeLinecap="round"/>
          {/* highlight */}
          <path d="M23 47 L 23 26 Q 23 14 28 13" stroke={PAPER} strokeWidth="1.3" opacity="0.9" strokeLinecap="round" fill="none"/>
          {/* base block */}
          <rect x="22" y="50" width="16" height="3.2" rx="0.6" fill={WAL}/>
        </svg>
      );

    case 'stool':
      // Sculptural turned-wood stool — barrel base, oak top, single seam
      return (
        <svg viewBox="0 0 60 60" style={wrap} fill="none">
          <ellipse cx="30" cy="55" rx="12" ry="1.2" fill={SHADOW}/>
          {/* top */}
          <ellipse cx="30" cy="20" rx="15" ry="4" fill={SAND}/>
          <ellipse cx="30" cy="20" rx="15" ry="4" stroke={SAND_S} strokeWidth="0.5"/>
          <ellipse cx="30" cy="18" rx="13" ry="2.2" fill={PAPER} opacity="0.45"/>
          {/* barrel body */}
          <path d="M17 22 Q 13 38 18 52 L 42 52 Q 47 38 43 22" fill={SAND}/>
          <path d="M17 22 Q 13 38 18 52" stroke={SAND_S} strokeWidth="0.5" fill="none"/>
          <path d="M43 22 Q 47 38 42 52" stroke={SAND_S} strokeWidth="0.5" fill="none"/>
          {/* center groove */}
          <path d="M16 36 Q 30 38 44 36" stroke={SAND_S} strokeWidth="0.5" fill="none"/>
          {/* base shadow ring */}
          <ellipse cx="30" cy="52" rx="12" ry="1.4" fill={SAND_S} opacity="0.7"/>
        </svg>
      );

    default:
      return null;
  }
}

function ToolIcon({ kind }) {
  // Same design language as FurnIcon — modern, light, premium product illustration.
  // Realistic tube/pipe cutter silhouettes with metallic + grip palette.
  const INK     = '#1A1A1A';
  const HAIR    = 'rgba(26,26,26,0.32)';
  const SHADOW  = 'rgba(26,26,26,0.08)';
  const PAPER   = '#FFFFFF';

  const STEEL_L = '#E5E7EA';        // light brushed steel
  const STEEL   = '#C2C7CD';
  const STEEL_S = '#8C939B';
  const STEEL_D = '#5E646C';
  const BRASS   = '#D9B470';
  const BRASS_S = '#A98441';
  const COPPER  = '#C77B5E';
  const COPPER_S= '#9C5B41';
  const GRIP_R  = '#C9402E';        // red rubberized grip
  const GRIP_R_S= '#992414';
  const GRIP_B  = '#2A4D77';        // blue grip
  const GRIP_B_S= '#1A3050';
  const GRIP_K  = '#1F1F22';        // black grip
  const POLY_O  = '#E0892F';        // orange poly accent
  const LIME    = 'var(--uc-signal)';
  const wrap = { width: '94%', height: '94%', overflow: 'visible' };

  switch (kind) {
    case 'mini':
      // 1-1/8" Mini Tube Cutter — compact body, thumb wheel, single brass roller
      return (
        <svg viewBox="0 0 60 60" style={wrap} fill="none">
          <ellipse cx="30" cy="50" rx="20" ry="1.2" fill={SHADOW}/>
          {/* body */}
          <rect x="14" y="22" width="32" height="14" rx="3" fill={STEEL_L}/>
          <rect x="14" y="22" width="32" height="14" rx="3" stroke={STEEL_S} strokeWidth="0.6"/>
          {/* highlight band */}
          <rect x="14" y="23" width="32" height="3" rx="2" fill={PAPER} opacity="0.55"/>
          {/* cutting wheel slot */}
          <circle cx="22" cy="29" r="3" fill={STEEL_D}/>
          <circle cx="22" cy="29" r="1.6" fill={LIME} opacity="0.85"/>
          {/* brass adjustment knob */}
          <circle cx="38" cy="29" r="5" fill={BRASS}/>
          <circle cx="38" cy="29" r="5" stroke={BRASS_S} strokeWidth="0.5"/>
          <circle cx="38" cy="29" r="2" fill={BRASS_S}/>
          {/* knurled rim ticks */}
          {[0,1,2,3,4,5,6,7].map(i => {
            const a = (i * 45 * Math.PI) / 180;
            const x1 = 38 + Math.cos(a) * 4.4;
            const y1 = 29 + Math.sin(a) * 4.4;
            const x2 = 38 + Math.cos(a) * 5.2;
            const y2 = 29 + Math.sin(a) * 5.2;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={BRASS_S} strokeWidth="0.5"/>;
          })}
          {/* tube preview */}
          <rect x="6" y="26" width="10" height="6" rx="2" fill={COPPER} opacity="0.7"/>
          <rect x="44" y="26" width="10" height="6" rx="2" fill={COPPER} opacity="0.7"/>
        </svg>
      );

    case 'heavy':
      // 2" Heavy-Duty Pipe Cutter — pliers-style with red grips
      return (
        <svg viewBox="0 0 60 60" style={wrap} fill="none">
          <ellipse cx="30" cy="52" rx="22" ry="1.3" fill={SHADOW}/>
          {/* upper jaw + handle */}
          <path d="M8 18 L 30 22 Q 36 24 36 28 L 36 30 L 26 30 L 26 26 L 8 22 Z" fill={STEEL}/>
          <path d="M8 18 L 30 22 Q 36 24 36 28 L 36 30 L 26 30 L 26 26 L 8 22 Z" stroke={STEEL_S} strokeWidth="0.6"/>
          {/* lower jaw + handle */}
          <path d="M8 38 L 30 34 Q 36 32 36 28 L 26 30 L 26 32 L 8 36 Z" fill={STEEL}/>
          <path d="M8 38 L 30 34 Q 36 32 36 28 L 26 30 L 26 32 L 8 36 Z" stroke={STEEL_S} strokeWidth="0.6"/>
          {/* pivot */}
          <circle cx="36" cy="28" r="2" fill={STEEL_D}/>
          {/* cutting wheel — open jaw */}
          <circle cx="44" cy="28" r="3" fill={LIME}/>
          <circle cx="44" cy="28" r="3" stroke={INK} strokeWidth="0.6"/>
          {/* tube */}
          <rect x="48" y="24" width="10" height="8" rx="3" fill={COPPER}/>
          <ellipse cx="53" cy="28" rx="2" ry="3.5" fill={COPPER_S}/>
          {/* grips */}
          <rect x="3" y="16" width="12" height="6" rx="3" fill={GRIP_R}/>
          <rect x="3" y="16" width="12" height="6" rx="3" stroke={GRIP_R_S} strokeWidth="0.5"/>
          <rect x="3" y="36" width="12" height="6" rx="3" fill={GRIP_R}/>
          <rect x="3" y="36" width="12" height="6" rx="3" stroke={GRIP_R_S} strokeWidth="0.5"/>
          {/* grip ribs */}
          <line x1="5" y1="17.5" x2="5" y2="20.5" stroke={GRIP_R_S} strokeWidth="0.4"/>
          <line x1="8" y1="17.5" x2="8" y2="20.5" stroke={GRIP_R_S} strokeWidth="0.4"/>
          <line x1="11" y1="17.5" x2="11" y2="20.5" stroke={GRIP_R_S} strokeWidth="0.4"/>
        </svg>
      );

    case 'ratchet':
      // 3" Ratcheting Tube Cutter — ratchet body with lever, brass barrel
      return (
        <svg viewBox="0 0 60 60" style={wrap} fill="none">
          <ellipse cx="30" cy="52" rx="22" ry="1.3" fill={SHADOW}/>
          {/* barrel grip */}
          <rect x="6" y="22" width="20" height="14" rx="3" fill={GRIP_K}/>
          <rect x="6" y="23" width="20" height="3" rx="2" fill="#3a3a3a"/>
          <line x1="9" y1="28" x2="9" y2="35" stroke="#3a3a3a" strokeWidth="0.5"/>
          <line x1="14" y1="28" x2="14" y2="35" stroke="#3a3a3a" strokeWidth="0.5"/>
          <line x1="19" y1="28" x2="19" y2="35" stroke="#3a3a3a" strokeWidth="0.5"/>
          {/* brass collar */}
          <rect x="26" y="24" width="3" height="10" fill={BRASS}/>
          {/* metal body */}
          <rect x="29" y="20" width="22" height="18" rx="3" fill={STEEL_L}/>
          <rect x="29" y="20" width="22" height="18" rx="3" stroke={STEEL_S} strokeWidth="0.6"/>
          <rect x="29" y="21" width="22" height="3" rx="2" fill={PAPER} opacity="0.55"/>
          {/* ratchet lever */}
          <path d="M30 18 L 44 14 L 46 18 L 36 21 Z" fill={POLY_O}/>
          <path d="M30 18 L 44 14 L 46 18 L 36 21 Z" stroke={INK} strokeWidth="0.5"/>
          {/* cutting wheel housing */}
          <circle cx="45" cy="29" r="5" fill={STEEL_D}/>
          <circle cx="45" cy="29" r="2.5" fill={LIME}/>
          {/* tube */}
          <rect x="50" y="25" width="9" height="8" rx="3" fill={COPPER}/>
        </svg>
      );

    case 'internal':
      // 4" Internal Pipe Cutter — long shaft with internal cutter head
      return (
        <svg viewBox="0 0 60 60" style={wrap} fill="none">
          <ellipse cx="30" cy="52" rx="24" ry="1.3" fill={SHADOW}/>
          {/* handle */}
          <rect x="3" y="26" width="16" height="6" rx="3" fill={GRIP_B}/>
          <rect x="3" y="26" width="16" height="6" rx="3" stroke={GRIP_B_S} strokeWidth="0.5"/>
          <line x1="6" y1="27.5" x2="6" y2="30.5" stroke={GRIP_B_S} strokeWidth="0.4"/>
          <line x1="10" y1="27.5" x2="10" y2="30.5" stroke={GRIP_B_S} strokeWidth="0.4"/>
          <line x1="14" y1="27.5" x2="14" y2="30.5" stroke={GRIP_B_S} strokeWidth="0.4"/>
          {/* steel shaft */}
          <rect x="19" y="27" width="24" height="4" fill={STEEL}/>
          <rect x="19" y="27" width="24" height="1.2" fill={PAPER} opacity="0.7"/>
          {/* head — pipe cross-section + internal cutter */}
          <circle cx="46" cy="29" r="8" fill={STEEL_L} stroke={STEEL_S} strokeWidth="0.6"/>
          <circle cx="46" cy="29" r="5" fill={PAPER}/>
          <circle cx="46" cy="29" r="5" stroke={STEEL_S} strokeWidth="0.5"/>
          {/* cutter arm */}
          <path d="M46 29 L 50 31 L 51 28 Z" fill={LIME}/>
          <path d="M46 29 L 50 31 L 51 28 Z" stroke={INK} strokeWidth="0.5"/>
          {/* adjust knob */}
          <circle cx="22" cy="22" r="3" fill={BRASS}/>
          <circle cx="22" cy="22" r="1.2" fill={BRASS_S}/>
        </svg>
      );

    case 'powered':
      // 6" Powered Cutter Kit — cordless tool with battery
      return (
        <svg viewBox="0 0 60 60" style={wrap} fill="none">
          <ellipse cx="30" cy="52" rx="24" ry="1.3" fill={SHADOW}/>
          {/* head housing */}
          <path d="M14 14 L 38 14 Q 44 14 44 20 L 44 32 Q 44 36 40 36 L 14 36 Q 10 36 10 32 L 10 20 Q 10 14 14 14 Z" fill={POLY_O}/>
          <path d="M14 14 L 38 14 Q 44 14 44 20 L 44 32 Q 44 36 40 36 L 14 36 Q 10 36 10 32 L 10 20 Q 10 14 14 14 Z" stroke={INK} strokeWidth="0.6"/>
          {/* highlight stripe */}
          <rect x="12" y="16" width="30" height="2" fill={PAPER} opacity="0.45"/>
          {/* model badge */}
          <rect x="16" y="20" width="16" height="6" rx="1" fill={INK}/>
          <text x="24" y="24.5" fontFamily="var(--font-mono)" fontSize="3.5" fill={LIME} textAnchor="middle" letterSpacing="0.4">UC-6</text>
          {/* cutting head — disc */}
          <circle cx="48" cy="25" r="9" fill={STEEL_L}/>
          <circle cx="48" cy="25" r="9" stroke={STEEL_S} strokeWidth="0.6"/>
          <circle cx="48" cy="25" r="6" fill={STEEL}/>
          <circle cx="48" cy="25" r="2.5" fill={INK}/>
          {/* sparks/cut indicator */}
          <line x1="58" y1="20" x2="56" y2="22" stroke={LIME} strokeWidth="1.4" strokeLinecap="round"/>
          <line x1="58" y1="28" x2="56" y2="26" stroke={LIME} strokeWidth="1.4" strokeLinecap="round"/>
          {/* handle/grip */}
          <path d="M20 36 L 20 46 Q 20 50 24 50 L 32 50 Q 36 50 36 46 L 36 36 Z" fill={GRIP_K}/>
          <line x1="22" y1="40" x2="34" y2="40" stroke="#3a3a3a" strokeWidth="0.5"/>
          <line x1="22" y1="44" x2="34" y2="44" stroke="#3a3a3a" strokeWidth="0.5"/>
          {/* trigger */}
          <rect x="36" y="38" width="3" height="6" rx="1" fill={STEEL_D}/>
          {/* battery pack */}
          <rect x="22" y="50" width="12" height="6" rx="1.5" fill={STEEL_D}/>
          <rect x="24" y="51" width="3" height="2" fill={LIME}/>
          <rect x="28" y="51" width="3" height="2" fill={LIME}/>
        </svg>
      );

    case 'quick':
      // 1/2" Quick-Release Cutter — small, slim, quick-release lever
      return (
        <svg viewBox="0 0 60 60" style={wrap} fill="none">
          <ellipse cx="30" cy="50" rx="18" ry="1.2" fill={SHADOW}/>
          {/* slim body */}
          <rect x="16" y="24" width="28" height="10" rx="2.5" fill={STEEL_L}/>
          <rect x="16" y="24" width="28" height="10" rx="2.5" stroke={STEEL_S} strokeWidth="0.6"/>
          <rect x="16" y="25" width="28" height="2.5" rx="2" fill={PAPER} opacity="0.5"/>
          {/* cutting wheel */}
          <circle cx="24" cy="29" r="2.5" fill={STEEL_D}/>
          <circle cx="24" cy="29" r="1.2" fill={LIME}/>
          {/* quick-release lever */}
          <path d="M30 24 L 30 18 Q 30 16 32 16 L 36 16 Q 38 16 38 18 L 38 24" fill={GRIP_R}/>
          <path d="M30 24 L 30 18 Q 30 16 32 16 L 36 16 Q 38 16 38 18 L 38 24" stroke={GRIP_R_S} strokeWidth="0.5"/>
          {/* brass roller */}
          <circle cx="40" cy="29" r="3" fill={BRASS}/>
          <circle cx="40" cy="29" r="1.2" fill={BRASS_S}/>
          {/* tube preview */}
          <rect x="6" y="26" width="12" height="6" rx="2" fill={COPPER} opacity="0.7"/>
          <rect x="42" y="26" width="12" height="6" rx="2" fill={COPPER} opacity="0.7"/>
        </svg>
      );

    default:
      return null;
  }
}

function UnifiedGraphic() {
  return (
    <div style={{ position: 'relative' }}>
      <StorefrontChrome>
        {/* Mode toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 24px',
          background: 'var(--uc-bone)',
          borderBottom: '1px solid var(--line-1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 4, background: 'var(--uc-paper)', padding: 4, border: '1px solid var(--line-1)', borderRadius: 999 }}>
              <span style={{ padding: '6px 16px', borderRadius: 999, color: 'var(--fg-3)', fontSize: 11, fontWeight: 600 }}>Uncap</span>
              <span style={{ padding: '6px 16px', borderRadius: 999, background: 'var(--uc-black)', color: 'var(--uc-paper)', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Uncap <span style={{ background: 'var(--uc-signal)', color: 'var(--uc-black)', padding: '1px 5px', borderRadius: 2, fontSize: 9, fontWeight: 800, letterSpacing: '0.04em' }}>PRO</span>
              </span>
            </div>
            <span style={{ width: 1, height: 22, background: 'var(--line-1)' }}/>
            <MiniChip dark mono>NET-30</MiniChip>
            <MiniChip mono>TIER A</MiniChip>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--fg-3)' }}>
            <span>Logged in as <strong style={{ color: 'var(--fg-1)' }}>Maria @ Wesley Studio</strong></span>
          </div>
        </div>

        {/* Hero header */}
        <div style={{ padding: '24px 24px 12px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'end' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>WHOLESALE CATALOG · FALL COLLECTION</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.025em', color: 'var(--fg-1)' }}>
              Field Series · Vol II
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--fg-2)', marginTop: 4 }}>Solid wood, brass, and patinated steel. Made-to-order, trade priced.</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <MiniChip>USD</MiniChip>
            <MiniChip dark>NET-30</MiniChip>
            <MiniChip accent="#3F8B5D">VERIFIED · TRADE</MiniChip>
          </div>
        </div>

        {/* Result count */}
        <div style={{
          padding: '12px 24px 8px',
          borderTop: '1px solid var(--line-1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', letterSpacing: 0,
          background: 'var(--uc-paper)'
        }}>
          <span>Showing 1–10 of 142 SKUs · 2 filters active</span>
          <span>View: Grid 5 ▾</span>
        </div>

        {/* Sidebar filters + product grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '220px 1fr',
          gap: 0,
          borderTop: '1px solid var(--line-1)'
        }}>
          {/* Left filter sidebar */}
          <div style={{
            padding: '18px 18px',
            borderRight: '1px solid var(--line-1)',
            background: 'var(--uc-paper)',
            display: 'flex', flexDirection: 'column', gap: 0
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-3)',
              marginBottom: 14
            }}>Filter products</div>

            {[
              { name: 'Category',   open: false, count: '8' },
              { name: 'Material',   open: true,
                items: [
                  { l: 'Oak',           c: 38, on: true },
                  { l: 'Walnut',        c: 27, on: true },
                  { l: 'Patina Steel',  c: 19, on: false },
                  { l: 'Brushed Brass', c: 14, on: false },
                  { l: 'Travertine',    c: 9,  on: false }
                ]
              },
              { name: 'Finish',     open: false, count: '6' },
              { name: 'Room',       open: false, count: '7' },
              { name: 'Lead time',  open: false, count: '4' },
              { name: 'Price',      open: false, count: 'range' },
              { name: 'In stock',   open: false, count: 'only' }
            ].map((s, i) => (
              <div key={s.name} style={{
                borderTop: i === 0 ? '1px solid var(--line-1)' : 'none',
                borderBottom: '1px solid var(--line-1)',
                padding: '12px 0'
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: 12, fontWeight: s.open ? 700 : 600, color: 'var(--fg-1)'
                }}>
                  <span>{s.name}</span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)'
                  }}>
                    {s.count && <span>{s.count}</span>}
                    <span style={{
                      width: 16, height: 16, borderRadius: 999,
                      background: s.open ? 'var(--uc-black)' : 'transparent',
                      color: s.open ? 'var(--uc-paper)' : 'var(--fg-3)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9
                    }}>{s.open ? '−' : '+'}</span>
                  </span>
                </div>
                {s.open && s.items && (
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {s.items.map((o, oi) => (
                      <label key={oi} style={{
                        display: 'grid', gridTemplateColumns: '14px 1fr auto',
                        gap: 8, alignItems: 'center'
                      }}>
                        <span style={{
                          width: 14, height: 14, borderRadius: 3,
                          background: o.on ? 'var(--uc-black)' : 'var(--uc-paper)',
                          border: '1px solid ' + (o.on ? 'var(--uc-black)' : 'var(--line-2)'),
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {o.on && <span style={{ color: 'var(--uc-paper)', fontSize: 9, lineHeight: 1 }}>✓</span>}
                        </span>
                        <span style={{
                          fontSize: 12, fontWeight: o.on ? 600 : 500,
                          color: 'var(--fg-1)'
                        }}>{o.l}</span>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)'
                        }}>{o.c}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div style={{
              marginTop: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 11
            }}>
              <span style={{ color: 'var(--fg-3)' }}>Clear all</span>
              <span style={{
                padding: '6px 12px', background: 'var(--uc-black)', color: 'var(--uc-paper)',
                borderRadius: 3, fontWeight: 700
              }}>Apply · 2</span>
            </div>
          </div>

          {/* Product grid — 5×2 rows, second row visually clipped */}
          <div style={{
            position: 'relative',
            padding: '12px 18px 0',
            overflow: 'hidden'
          }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10,
            alignContent: 'start',
            maxHeight: 520, overflow: 'hidden',
            position: 'relative'
          }}>
            {[
              { name: 'Field Lounge · Oak',    icon: 'lounge',  tiers: [{q:'1+',p:'$2,480'},{q:'4+',p:'$2,180'},{q:'10+',p:'$1,860'}], badge: 'Best',    color: '#3F8B5D',         variants: [{c:'#D6927A',l:'Clay'},{c:'#C9A878',l:'Oak'},{c:'#1A1A1A',l:'Ink'},{c:'#7C8A6E',l:'Sage'}], more: 3 },
              { name: 'Mesa Sofa · Walnut',    icon: 'sofa',    tiers: [{q:'1+',p:'$4,200'},{q:'4+',p:'$3,640'},{q:'10+',p:'$3,180'}], badge: 'New',     color: 'var(--uc-brand)', variants: [{c:'#4A2E1E',l:'Walnut'},{c:'#D6927A',l:'Clay'},{c:'#B6B2A8',l:'Stone'},{c:'#1A1A1A',l:'Ink'}], more: 2 },
              { name: 'Atelier Dining Chair',  icon: 'dining',  tiers: [{q:'2+',p:'$640'},{q:'8+',p:'$540'},{q:'24+',p:'$460'}],       badge: 'Trade',   color: '#A14B8E',         variants: [{c:'#7C8A6E',l:'Sage'},{c:'#D6927A',l:'Clay'},{c:'#1A1A1A',l:'Ink'},{c:'#FFFFFF',l:'Paper'}], more: 4 },
              { name: 'Marlowe Side Table',    icon: 'side',    tiers: [{q:'1+',p:'$880'},{q:'4+',p:'$760'},{q:'12+',p:'$640'}],       badge: 'Limited',color: '#C26A2A',         variants: [{c:'#B6B2A8',l:'Travertine'},{c:'#4A2E1E',l:'Walnut'},{c:'#C8A14E',l:'Brass'}], more: 1 },
              { name: 'Halo Pendant · Brass',  icon: 'pendant', tiers: [{q:'1+',p:'$540'},{q:'4+',p:'$460'},{q:'12+',p:'$390'}],       badge: 'Origin',  color: 'var(--uc-black)', variants: [{c:'#C8A14E',l:'Brass'},{c:'#1A1A1A',l:'Ink'},{c:'#B0B0B0',l:'Nickel'}], more: 2 },
              { name: 'Standard Dining Table', icon: 'table',   tiers: [{q:'1+',p:'$2,840'},{q:'4+',p:'$2,480'},{q:'10+',p:'$2,100'}], badge: null,      color: null,              variants: [{c:'#C9A878',l:'Oak'},{c:'#4A2E1E',l:'Walnut'},{c:'#1A1A1A',l:'Ink'}], more: 2 },
              { name: 'Arc Floor Lamp',        icon: 'floor',   tiers: [{q:'1+',p:'$720'},{q:'4+',p:'$620'},{q:'12+',p:'$520'}],       badge: 'New',     color: 'var(--uc-brand)', variants: [{c:'#C8A14E',l:'Brass'},{c:'#1A1A1A',l:'Ink'},{c:'#FFFFFF',l:'Paper'}], more: 1 },
              { name: 'Stack Shelf · Oak',     icon: 'shelf',   tiers: [{q:'1+',p:'$1,640'},{q:'4+',p:'$1,420'},{q:'10+',p:'$1,220'}], badge: null,      color: null,              variants: [{c:'#C9A878',l:'Oak'},{c:'#7C8A6E',l:'Sage'},{c:'#4A2E1E',l:'Walnut'}], more: 2 },
              { name: 'Field Rug · 8×10',      icon: 'rug',     tiers: [{q:'1+',p:'$1,180'},{q:'4+',p:'$1,020'},{q:'10+',p:'$880'}],   badge: null,      color: null,              variants: [{c:'#D6927A',l:'Clay'},{c:'#7C8A6E',l:'Sage'},{c:'#B6B2A8',l:'Stone'},{c:'#1A1A1A',l:'Ink'}], more: 3 },
              { name: 'Halo Mirror · Brass',   icon: 'mirror',  tiers: [{q:'1+',p:'$680'},{q:'4+',p:'$580'},{q:'12+',p:'$490'}],       badge: 'Best',    color: '#3F8B5D',         variants: [{c:'#C8A14E',l:'Brass'},{c:'#1A1A1A',l:'Ink'},{c:'#B0B0B0',l:'Nickel'}], more: 2 }
            ].map((p, i) => (
              <div key={i} style={{
                border: '1px solid var(--line-1)', borderRadius: 4,
                padding: 10, display: 'flex', flexDirection: 'column', gap: 8,
                background: 'var(--uc-paper)'
              }}>
                <div style={{
                  aspectRatio: '1 / 1',
                  background: 'linear-gradient(135deg, var(--uc-stone-200), var(--uc-bone))',
                  borderRadius: 3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative'
                }}>
                  {p.badge && (
                    <span style={{ position: 'absolute', top: 6, left: 6, zIndex: 1 }}>
                      <MiniChip accent={p.color}>{p.badge}</MiniChip>
                    </span>
                  )}
                  <FurnIcon kind={p.icon}/>
                </div>
                <div style={{ fontSize: 11, color: 'var(--fg-1)', fontWeight: 700, letterSpacing: '-0.005em' }}>{p.name}</div>

                {/* Price + variation swatches */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
                    letterSpacing: '-0.01em', color: 'var(--fg-1)'
                  }}>{p.tiers[1].p}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-3)' }}>trade</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {p.variants.map((v, vi) => (
                    <span key={vi} title={v.l} style={{
                      width: 14, height: 14, borderRadius: 999,
                      background: v.c,
                      border: '1px solid ' + (vi === 0 ? 'var(--uc-black)' : 'var(--line-1)'),
                      boxShadow: vi === 0 ? '0 0 0 2px var(--uc-paper), 0 0 0 3px var(--uc-black)' : 'none',
                      display: 'inline-block', flexShrink: 0
                    }}/>
                  ))}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-3)', marginLeft: 2 }}>+{p.more}</span>
                </div>

                {/* Price table + QTY + Add — all on one row */}
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                  <div style={{
                    flex: 1, minWidth: 0,
                    display: 'flex', alignItems: 'center', gap: 6,
                    flexWrap: 'nowrap', overflow: 'hidden',
                    fontFamily: 'var(--font-mono)', fontSize: 9
                  }}>
                    {p.tiers.map((t, ti) => (
                      <React.Fragment key={ti}>
                        {ti > 0 && (
                          <span aria-hidden="true" style={{
                            width: 1, alignSelf: 'stretch',
                            background: 'var(--line-1)',
                            margin: '2px 0'
                          }}/>
                        )}
                        <span style={{
                          display: 'inline-flex', alignItems: 'baseline', gap: 3,
                          whiteSpace: 'nowrap'
                        }}>
                          <span style={{
                            color: 'var(--fg-3)',
                            fontSize: 8,
                            fontWeight: 500
                          }}>{t.q}</span>
                          <span style={{
                            color: 'var(--fg-1)',
                            fontWeight: 600,
                            fontSize: 10
                          }}>{t.p}</span>
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                  <div style={{ padding: '4px 6px', border: '1px solid var(--line-1)', borderRadius: 3, fontSize: 10, color: 'var(--fg-1)', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                    <span>4</span><span style={{ fontSize: 8 }}>▾</span>
                  </div>
                  <span style={{
                    padding: '4px 9px', background: 'var(--uc-black)', color: 'var(--uc-paper)',
                    borderRadius: 3, fontSize: 10, fontWeight: 600, flexShrink: 0
                  }}>+</span>
                </div>
              </div>
            ))}
          </div>
          {/* Fade-out overlay suggesting more below the fold */}
          <div aria-hidden="true" style={{
            position: 'absolute',
            left: 0, right: 0, bottom: 0, height: 140,
            background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 80%, rgba(255,255,255,1) 100%)',
            pointerEvents: 'none'
          }}/>
          <div style={{
            position: 'absolute', left: '50%', bottom: 20,
            transform: 'translateX(-50%)',
            padding: '8px 16px', background: 'var(--uc-paper)',
            border: '1px solid var(--uc-black)', borderRadius: 999,
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            color: 'var(--fg-1)', letterSpacing: '0.04em',
            boxShadow: '0 6px 20px -6px rgba(10,10,10,0.18)'
          }}>
            Load 132 more →
          </div>
          </div>
        </div>
      </StorefrontChrome>

      {/* Overlay cart */}
      <div style={{
        position: 'absolute',
        right: 28, bottom: 28,
        width: 360,
        background: 'var(--uc-paper)',
        border: '1px solid var(--line-2)',
        borderRadius: 6,
        boxShadow: '0 20px 60px -10px rgba(10,10,10,0.32), 0 8px 24px -8px rgba(10,10,10,0.18)',
        display: 'flex', flexDirection: 'column',
        zIndex: 5,
        overflow: 'hidden'
      }}>
        {/* Free shipping bar */}
        <div style={{
          background: 'var(--uc-black)', color: 'var(--uc-paper)',
          padding: '10px 14px 12px',
          display: 'flex', flexDirection: 'column', gap: 7
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M3 16 V 7 a 1 1 0 0 1 1 -1 H 14 V 16 M 14 9 H 19 L 22 13 V 16 M 3 16 H 22 M 7 19 a 2 2 0 1 0 -4 0 a 2 2 0 1 0 4 0 Z M 19 19 a 2 2 0 1 0 -4 0 a 2 2 0 1 0 4 0 Z"
                  stroke="var(--uc-signal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              You're <span style={{ color: 'var(--uc-signal)', fontWeight: 800, margin: '0 2px' }}>$420</span> from free shipping
            </span>
            <span style={{ color: 'var(--uc-stone-500)' }}>$8,000 target</span>
          </div>
          <div style={{ position: 'relative', height: 4, background: '#2B2B2B', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: '94%', background: 'var(--uc-signal)', borderRadius: 999
            }}/>
          </div>
        </div>

        {/* Cart header */}
        <div style={{
          padding: '12px 14px', borderBottom: '1px solid var(--line-1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--uc-bone)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ position: 'relative', display: 'inline-flex' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 4 H 6 L 8 16 H 19 L 21 8 H 7" stroke="var(--fg-1)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="20" r="1.5" fill="var(--fg-1)"/>
                <circle cx="17" cy="20" r="1.5" fill="var(--fg-1)"/>
              </svg>
              <span style={{
                position: 'absolute', top: -6, right: -8,
                minWidth: 16, height: 16, padding: '0 4px',
                background: 'var(--uc-signal)', color: 'var(--uc-black)',
                borderRadius: 999, fontFamily: 'var(--font-mono)',
                fontSize: 9, fontWeight: 800,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
              }}>4</span>
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>Your project cart</span>
          </div>
          <MiniChip mono>NET-30</MiniChip>
        </div>

        {/* Lines */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { n: 'Field Lounge · Oak',     icon: 'lounge', q: 4, tier: '4+',  unit: '$2,180', total: '$8,720.00' },
            { n: 'Atelier Dining Chair',   icon: 'dining', q: 8, tier: '8+',  unit: '$540',   total: '$4,320.00' },
            { n: 'Marlowe Side Table',     icon: 'side',   q: 4, tier: '4+',  unit: '$760',   total: '$3,040.00' },
            { n: 'Halo Pendant · Brass',   icon: 'pendant',q: 4, tier: '4+',  unit: '$460',   total: '$1,840.00' }
          ].map((l, i) => (
            <div key={i} style={{
              padding: '10px 14px', borderBottom: '1px solid var(--line-1)',
              display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 10, alignItems: 'center'
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 3,
                background: 'linear-gradient(135deg, var(--uc-stone-200), var(--uc-bone))',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FurnIcon kind={l.icon}/>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-1)' }}>{l.n}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-3)', marginTop: 2 }}>
                  × {l.q} @ <span style={{ color: 'var(--uc-brand)', fontWeight: 700 }}>{l.tier}</span> · {l.unit}
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--fg-1)' }}>{l.total}</div>
            </div>
          ))}
        </div>

        {/* You may also like */}
        <div style={{
          padding: '12px 14px',
          borderBottom: '1px solid var(--line-1)',
          background: 'var(--uc-bone)'
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 10
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-3)'
            }}>Pair with</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)' }}>‹ ›</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {[
              { n: 'Stack Shelf', icon: 'shelf',  p: '$1,420' },
              { n: 'Arc Lamp',    icon: 'floor',  p: '$620'   },
              { n: 'Field Rug',   icon: 'rug',    p: '$1,020' }
            ].map((u, i) => (
              <div key={i} style={{
                background: 'var(--uc-paper)',
                border: '1px solid var(--line-1)', borderRadius: 4,
                padding: 6, display: 'flex', flexDirection: 'column', gap: 4
              }}>
                <div style={{
                  aspectRatio: '1 / 1',
                  background: 'linear-gradient(135deg, var(--uc-stone-200), var(--uc-bone))',
                  borderRadius: 3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <FurnIcon kind={u.icon}/>
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--fg-1)', lineHeight: 1.2 }}>{u.n}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--fg-1)' }}>{u.p}</span>
                  <span style={{
                    width: 18, height: 18, borderRadius: 999,
                    background: 'var(--uc-black)', color: 'var(--uc-paper)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, lineHeight: 1
                  }}>+</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line-1)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-2)' }}>
            <span>Subtotal</span><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-1)' }}>$17,920.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-2)' }}>
            <span>Trade tier savings</span><span style={{ fontFamily: 'var(--font-mono)', color: '#3F8B5D' }}>−$2,340.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, paddingTop: 6, borderTop: '1px solid var(--line-1)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>Total</span>
            <span style={{ fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.025em' }}>$15,580.00</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
            padding: '10px 14px', background: 'var(--uc-black)', color: 'var(--uc-paper)',
            borderRadius: 3, fontSize: 12, fontWeight: 700
          }}>
            Checkout · NET-30 <span>→</span>
          </span>
          <span style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
            padding: '9px 14px', background: 'var(--uc-paper)',
            color: 'var(--fg-1)', border: '1px solid var(--uc-black)',
            borderRadius: 3, fontSize: 12, fontWeight: 600
          }}>
            Request a Quote <span style={{ color: 'var(--fg-3)' }}>↳</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── 02 DISTRIBUTION ──────────────────────────────────────────────────────
function DistributionGraphic() {
  return (
    <StorefrontChrome>
      {/* 2-col body: content + full-height cart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 0 }}>
        <div style={{ minWidth: 0, borderRight: '1px solid var(--line-1)' }}>
      {/* Sub nav */}
      <div style={{ padding: '8px 16px', display: 'flex', gap: 6, alignItems: 'center', overflow: 'hidden' }}>
        {['Power', 'Hand', 'Electrical', 'Tube & Pipe', 'Plumbing', 'Hardware', 'Safety'].map((c, i) => (
          <span key={c} style={{
            padding: '5px 11px', borderRadius: 999, fontSize: 10, fontWeight: 600,
            background: i === 3 ? 'var(--uc-black)' : 'var(--uc-bone)',
            color: i === 3 ? 'var(--uc-paper)' : 'var(--fg-2)',
            border: '1px solid ' + (i === 3 ? 'var(--uc-black)' : 'var(--line-1)')
          }}>{c}</span>
        ))}
      </div>

      {/* Page header */}
      <div style={{
        background: 'var(--uc-black)', color: 'var(--uc-paper)',
        padding: '20px 24px'
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.018em' }}>Tube &amp; Pipe Cutters</div>
        <div style={{ fontSize: 12, color: 'var(--uc-stone-300)', marginTop: 4 }}>Engineered for professional-grade performance.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px minmax(0, 1fr)', gap: 0 }}>
        {/* Filter sidebar */}
        <div style={{ padding: '16px 18px', borderRight: '1px solid var(--line-1)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Filter Products</div>

          {[
            { name: 'Power Type', open: false },
            { name: 'Hand Tools', open: true,
              items: [
                { l: 'Cable Cutters' },
                { l: 'Tube & Pipe Cutters', on: true },
                { l: 'Metal Snips' },
                { l: 'Wire Strippers & Cutters' },
                { l: 'Pliers' }
              ]
            },
            { name: 'Brand', open: false },
            { name: 'Price', open: true, custom: 'slider' },
            { name: 'Availability', open: false }
          ].map((s, i) => (
            <div key={s.name} style={{ borderTop: '1px solid var(--line-1)', padding: '12px 0' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: 12, fontWeight: s.open ? 700 : 600, color: 'var(--fg-1)'
              }}>
                {s.name}
                <span style={{
                  width: 18, height: 18, borderRadius: 999,
                  background: s.open ? 'var(--uc-black)' : 'transparent',
                  color: s.open ? 'var(--uc-paper)' : 'var(--fg-3)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10
                }}>{s.open ? '▾' : '▸'}</span>
              </div>
              {s.items && s.open && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {s.items.map(it => (
                    <label key={it.l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--fg-2)' }}>
                      <span style={{
                        width: 12, height: 12, borderRadius: 2,
                        background: it.on ? 'var(--uc-black)' : 'var(--uc-paper)',
                        border: '1px solid ' + (it.on ? 'var(--uc-black)' : 'var(--line-2)'),
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {it.on && <span style={{ color: 'var(--uc-paper)', fontSize: 8 }}>✓</span>}
                      </span>
                      <span style={{ color: it.on ? 'var(--fg-1)' : 'var(--fg-2)', fontWeight: it.on ? 600 : 400 }}>{it.l}</span>
                    </label>
                  ))}
                </div>
              )}
              {s.custom === 'slider' && s.open && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ height: 2, background: 'var(--line-1)', borderRadius: 2, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '12%', right: '38%', height: 2, background: 'var(--uc-black)' }}/>
                    <div style={{ position: 'absolute', left: '12%', top: -4, width: 10, height: 10, borderRadius: 999, background: 'var(--uc-paper)', border: '1px solid var(--uc-black)' }}/>
                    <div style={{ position: 'absolute', left: '62%', top: -4, width: 10, height: 10, borderRadius: 999, background: 'var(--uc-paper)', border: '1px solid var(--uc-black)' }}/>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, gap: 6 }}>
                    <span style={{ flex: 1, padding: '4px 6px', border: '1px solid var(--line-1)', borderRadius: 3, fontSize: 10, color: 'var(--fg-1)' }}>$100</span>
                    <span style={{ flex: 1, padding: '4px 6px', border: '1px solid var(--line-1)', borderRadius: 3, fontSize: 10, color: 'var(--fg-1)' }}>$10,000</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Product list — quick-entry */}
        <div style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--fg-3)', marginBottom: 14 }}>
            <span>Showing 1 - 8 of 11 products</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ padding: '4px 8px', border: '1px solid var(--line-1)', borderRadius: 3, fontSize: 10, color: 'var(--fg-3)' }}>Grid</span>
              <span style={{ padding: '4px 8px', background: 'var(--uc-black)', color: 'var(--uc-paper)', borderRadius: 3, fontSize: 10, fontWeight: 700 }}>List</span>
              <span style={{ padding: '4px 8px', border: '1px solid var(--line-1)', borderRadius: 3, fontSize: 10, color: 'var(--fg-3)' }}>Sort: Popular ▾</span>
            </div>
          </div>

          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '48px minmax(0, 2fr) 110px 90px 200px 100px 110px',
            gap: 12, padding: '8px 12px',
            background: 'var(--uc-bone)', border: '1px solid var(--line-1)', borderRadius: 3,
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)'
          }}>
            <span/>
            <span>Product / SKU</span>
            <span>Material</span>
            <span>Cap.</span>
            <span>Tier pricing</span>
            <span style={{ textAlign: 'right' }}>QTY</span>
            <span style={{ textAlign: 'right' }}>Action</span>
          </div>

          {/* List rows */}
          {[
            { sku: 'TPC-1140', name: '1-1/8" Mini Tube Cutter',     icon: 'mini',     mat: 'Hardened Steel',  cap: '⅛"–1⅛"',     badge: 'Popular',  list: '$28.40', tiers: [{q:'1+',p:'$28'},{q:'10+',p:'$24'},{q:'50+',p:'$19'}], stock: 'In stock · 142' },
            { sku: 'TPC-2018', name: '2" Heavy-Duty Pipe Cutter',   icon: 'heavy',    mat: 'Forged Alloy',    cap: '⅛"–2"',      badge: null,       list: '$54.00', tiers: [{q:'1+',p:'$54'},{q:'10+',p:'$48'},{q:'50+',p:'$39'}], stock: 'In stock · 82'  },
            { sku: 'TPC-3201', name: '3" Ratcheting Tube Cutter',   icon: 'ratchet',  mat: 'Steel + Brass',   cap: '½"–3"',      badge: 'New',      list: '$112.00',tiers: [{q:'1+',p:'$112'},{q:'10+',p:'$98'},{q:'50+',p:'$84'}], stock: 'In stock · 24' },
            { sku: 'TPC-4421', name: '4" Internal Pipe Cutter',     icon: 'internal', mat: 'Stainless',       cap: '2"–4"',      badge: 'Limited',  list: '$184.00',tiers: [{q:'1+',p:'$184'},{q:'10+',p:'$168'},{q:'25+',p:'$148'}], stock: 'Low · 6'      },
            { sku: 'TPC-5210', name: '6" Powered Cutter · Kit',     icon: 'powered',  mat: 'Steel + Polymer', cap: '4"–6"',      badge: 'Featured', list: '$642.00',tiers: [{q:'1+',p:'$642'},{q:'5+',p:'$598'},{q:'10+',p:'$549'}], stock: 'In stock · 11' },
            { sku: 'TPC-6090', name: '½" Quick-Release Cutter',     icon: 'quick',    mat: 'Hardened Steel',  cap: '⅛"–½"',      badge: null,       list: '$19.80', tiers: [{q:'1+',p:'$19'},{q:'25+',p:'$16'},{q:'100+',p:'$13'}], stock: 'In stock · 312' }
          ].map((row, i) => {
            const colors = { New: '#E08029', Popular: '#3F8B5D', Limited: '#D6203B', Featured: 'var(--uc-brand)' };
            return (
              <div key={row.sku} style={{
                display: 'grid',
                gridTemplateColumns: '44px minmax(0, 2fr) 110px 90px 200px 100px 110px',
                gap: 12, padding: '10px 12px', alignItems: 'center',
                borderBottom: '1px solid var(--line-1)',
                background: i % 2 === 1 ? 'var(--uc-bone)' : 'var(--uc-paper)'
              }}>
                {/* Thumb */}
                <div style={{
                  width: 40, height: 40, borderRadius: 3,
                  background: 'var(--uc-bone)', border: '1px solid var(--line-1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ToolIcon kind={row.icon}/>
                </div>

                {/* Name + SKU + badge */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-1)' }}>{row.name}</span>
                    {row.badge && <MiniChip accent={colors[row.badge]}>{row.badge}</MiniChip>}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)' }}>
                    SKU {row.sku} · {row.stock}
                  </div>
                </div>

                {/* Material */}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-2)' }}>{row.mat}</span>

                {/* Capacity */}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-2)' }}>{row.cap}</span>

                {/* Tier pricing */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
                  {row.tiers.map((t, ti) => (
                    <div key={ti} style={{
                      padding: '3px 4px',
                      background: ti === 1 ? 'var(--uc-black)' : 'var(--uc-paper)',
                      color: ti === 1 ? 'var(--uc-paper)' : 'var(--fg-1)',
                      border: ti === 1 ? '1px solid var(--uc-black)' : '1px solid var(--line-1)',
                      borderRadius: 2, textAlign: 'center'
                    }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, opacity: 0.7 }}>{t.q}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700 }}>{t.p}</div>
                    </div>
                  ))}
                </div>

                {/* QTY input */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                  <span style={{ width: 20, height: 24, border: '1px solid var(--line-1)', borderRadius: 3, background: 'var(--uc-paper)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--fg-3)' }}>−</span>
                  <span style={{ width: 32, height: 24, border: '1px solid var(--line-1)', borderRadius: 3, background: 'var(--uc-paper)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--fg-1)' }}>{(i+1)*5}</span>
                  <span style={{ width: 20, height: 24, border: '1px solid var(--line-1)', borderRadius: 3, background: 'var(--uc-paper)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--fg-3)' }}>+</span>
                </div>

                {/* Add button */}
                <span style={{
                  justifySelf: 'end',
                  padding: '6px 12px', background: 'var(--uc-black)', color: 'var(--uc-paper)',
                  borderRadius: 3, fontSize: 11, fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap'
                }}>+ Add</span>
              </div>
            );
          })}


        </div>

        </div>
        </div>
        {/* Cart drawer — right column, starts at storefront header */}
        <div style={{
          background: 'var(--uc-paper)',
          display: 'flex', flexDirection: 'column',
          minWidth: 0
        }}>
          {/* Cart header */}
          <div style={{
            padding: '14px 16px',
            background: 'var(--uc-bone)',
            borderBottom: '1px solid var(--line-1)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ position: 'relative', display: 'inline-flex' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 4 H 6 L 8 16 H 19 L 21 8 H 7" stroke="var(--fg-1)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="20" r="1.5" fill="var(--fg-1)"/>
                  <circle cx="17" cy="20" r="1.5" fill="var(--fg-1)"/>
                </svg>
                <span style={{
                  position: 'absolute', top: -6, right: -8,
                  minWidth: 16, height: 16, padding: '0 4px',
                  background: 'var(--uc-signal)', color: 'var(--uc-black)',
                  borderRadius: 999, fontFamily: 'var(--font-mono)',
                  fontSize: 9, fontWeight: 800,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                }}>6</span>
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>Order draft</span>
            </div>
            <MiniChip mono>PO #4421</MiniChip>
          </div>

          {/* Lines */}
          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 320, overflow: 'hidden' }}>
            {[
              { sku: 'TPC-1140', icon: 'mini',     n: '1-1/8" Mini Cutter',       q: 25, tier: '10+', unit: '$24',  total: '$600.00'   },
              { sku: 'TPC-3201', icon: 'ratchet',  n: '3" Ratcheting Cutter',     q: 12, tier: '10+', unit: '$98',  total: '$1,176.00' },
              { sku: 'TPC-4421', icon: 'internal', n: '4" Internal Pipe Cutter',  q: 8,  tier: '5+',  unit: '$168', total: '$1,344.00' },
              { sku: 'TPC-5210', icon: 'powered',  n: '6" Powered Kit',           q: 4,  tier: '1+',  unit: '$642', total: '$2,568.00' }
            ].map((l, i) => (
              <div key={i} style={{
                padding: '10px 14px', borderBottom: '1px solid var(--line-1)',
                display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 10, alignItems: 'center'
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 3,
                  background: 'var(--uc-bone)', border: '1px solid var(--line-1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <ToolIcon kind={l.icon}/>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-1)' }}>{l.n}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-3)', marginTop: 2 }}>
                    {l.sku} · × {l.q} @ <span style={{ color: 'var(--uc-brand)', fontWeight: 700 }}>{l.tier}</span> · {l.unit}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--fg-1)' }}>{l.total}</div>
              </div>
            ))}
          </div>

          {/* Quick entry — single-line: search + Add + Upload */}
          <div style={{
            padding: '12px 14px',
            background: 'var(--uc-black)', color: 'var(--uc-paper)',
            borderBottom: '1px solid var(--line-1)',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <div style={{
              flex: 1, minWidth: 0,
              padding: '7px 10px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid #2B2B2B',
              borderRadius: 3,
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: 'var(--uc-stone-300)',
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="4.5" stroke="var(--uc-stone-500)" strokeWidth="1.4"/>
                <path d="M13 13 L 10.5 10.5" stroke="var(--uc-stone-500)" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Paste SKU or search…</span>
            </div>
            <span style={{
              padding: '7px 12px',
              background: 'var(--uc-paper)', color: 'var(--uc-black)',
              borderRadius: 3, fontSize: 11, fontWeight: 700,
              flexShrink: 0
            }}>+ Add</span>
            <span style={{
              padding: '7px 12px',
              border: '1px solid #2B2B2B',
              borderRadius: 3, fontSize: 11, fontWeight: 600,
              color: 'var(--uc-paper)', flexShrink: 0
            }}>Upload</span>
          </div>

          {/* CSV / bulk indicator */}
          <div style={{
            padding: '10px 14px',
            background: 'var(--uc-bone)',
            borderBottom: '1px solid var(--line-1)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)'
          }}>
            <span style={{ letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>+ 2 from CSV</span>
            <span>6 lines · 49 units</span>
          </div>

          {/* Totals */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line-1)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-2)' }}>
              <span>Subtotal</span><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-1)' }}>$5,688.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-2)' }}>
              <span>Tier savings</span><span style={{ fontFamily: 'var(--font-mono)', color: '#3F8B5D' }}>−$642.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-2)' }}>
              <span>Est. freight</span><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-1)' }}>$124.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, paddingTop: 6, borderTop: '1px solid var(--line-1)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>Order total</span>
              <span style={{ fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.025em' }}>$5,170.00</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
              padding: '10px 14px', background: 'var(--uc-black)', color: 'var(--uc-paper)',
              borderRadius: 3, fontSize: 12, fontWeight: 700
            }}>
              Submit PO · NET-30 <span>→</span>
            </span>
            <span style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
              padding: '9px 14px', background: 'var(--uc-paper)',
              color: 'var(--fg-1)', border: '1px solid var(--uc-black)',
              borderRadius: 3, fontSize: 12, fontWeight: 600
            }}>
              Save as Quote <span style={{ color: 'var(--fg-3)' }}>↳</span>
            </span>
          </div>
        </div>
      </div>
    </StorefrontChrome>
  );
}

// ── 03 MANUFACTURING ─────────────────────────────────────────────────────
function NavIcon({ kind }) {
  const sw = 1.4, sc = 'currentColor', cmm = { fill: 'none', stroke: sc, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (kind) {
    case 'home':
      return (<svg width="14" height="14" viewBox="0 0 16 16" {...cmm}><path d="M2 8 L 8 3 L 14 8 M 3 8 V 13 H 13 V 8"/></svg>);
    case 'orders':
      return (<svg width="14" height="14" viewBox="0 0 16 16" {...cmm}><path d="M3 4 H 6 L 7 13 H 13"/><circle cx="7" cy="14.5" r="0.8"/><circle cx="12" cy="14.5" r="0.8"/><path d="M6 6 H 14 L 13 11 H 7"/></svg>);
    case 'inv':
      return (<svg width="14" height="14" viewBox="0 0 16 16" {...cmm}><path d="M4 2 H 11 L 13 4 V 14 L 11 13 L 9 14 L 7 13 L 5 14 L 4 13 Z"/><path d="M6 6 H 11 M 6 8.5 H 11 M 6 11 H 9"/></svg>);
    case 'svc':
      return (<svg width="14" height="14" viewBox="0 0 16 16" {...cmm}><circle cx="8" cy="8" r="2.5"/><path d="M8 1.5 V 4 M 8 12 V 14.5 M 1.5 8 H 4 M 12 8 H 14.5 M 3.5 3.5 L 5.5 5.5 M 10.5 10.5 L 12.5 12.5 M 3.5 12.5 L 5.5 10.5 M 10.5 5.5 L 12.5 3.5"/></svg>);
    case 'tick':
      return (<svg width="14" height="14" viewBox="0 0 16 16" {...cmm}><path d="M3 4 H 13 V 11 H 9 L 6 13.5 V 11 H 3 Z"/><circle cx="6" cy="7.5" r="0.7" fill={sc}/><circle cx="8" cy="7.5" r="0.7" fill={sc}/><circle cx="10" cy="7.5" r="0.7" fill={sc}/></svg>);
    case 'war':
      return (<svg width="14" height="14" viewBox="0 0 16 16" {...cmm}><path d="M8 1.5 L 13.5 4 V 8 Q 13.5 12 8 14.5 Q 2.5 12 2.5 8 V 4 Z"/><path d="M5.5 8 L 7.5 10 L 11 6"/></svg>);
    case 'recall':
      return (<svg width="14" height="14" viewBox="0 0 16 16" {...cmm}><path d="M8 2 L 14 13 H 2 Z"/><path d="M8 6.5 V 9.5"/><circle cx="8" cy="11.5" r="0.6" fill={sc}/></svg>);
    case 'rebate':
      return (<svg width="14" height="14" viewBox="0 0 16 16" {...cmm}><path d="M3 5 H 13 L 12 13 H 4 Z"/><path d="M6 5 V 4 a 2 2 0 0 1 4 0 V 5"/><path d="M7 9 L 9 11 M 9 9 L 7 11"/></svg>);
    default:
      return <span/>;
  }
}

function ManufacturingGraphic() {
  return (
    <StorefrontChrome accent="#0A3A2E">
      {/* Account header */}
      <div style={{
        padding: '20px 24px',
        background: 'var(--uc-bone)',
        borderBottom: '1px solid var(--line-1)',
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center'
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>PRIVATE PORTAL · DEALER ACCOUNT</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--fg-1)', letterSpacing: '-0.02em' }}>
            Eastline Auto Parts · #DLR-04812
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg-2)', marginTop: 4 }}>Authorized 2019 · NET-45 terms · Tier-A pricing</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <MiniChip dark mono>NET-45</MiniChip>
          <MiniChip mono>TIER A</MiniChip>
          <MiniChip accent="#0A3A2E">VERIFIED</MiniChip>
        </div>
      </div>

      {/* Body: left-side portal nav + content */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px minmax(0, 1fr)', gap: 0 }}>
      {/* Left-side portal navigation */}
      <nav style={{
        borderRight: '1px solid var(--line-1)',
        background: 'var(--uc-bone)',
        padding: '20px 16px',
        display: 'flex', flexDirection: 'column', gap: 4,
        minWidth: 0
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-3)',
          marginBottom: 14, paddingLeft: 10
        }}>Account portal</div>
        {[
          { l: 'Home',            icon: 'home',    on: true,  count: null },
          { l: 'Orders',          icon: 'orders',  on: false, count: 14 },
          { l: 'Invoices',        icon: 'inv',     on: false, count: 6 },
          { l: 'Service Requests',icon: 'svc',     on: false, count: 2 },
          { l: 'Support Tickets', icon: 'tick',    on: false, count: null },
          { l: 'Warranties',      icon: 'war',     on: false, count: null },
          { l: 'Recalls',         icon: 'recall',  on: false, count: 1 },
          { l: 'Rebates',         icon: 'rebate',  on: false, count: 3 }
        ].map((it, i) => (
          <a key={i} href="#" style={{
            display: 'grid',
            gridTemplateColumns: '20px minmax(0, 1fr) auto',
            gap: 10, alignItems: 'center',
            padding: '9px 10px',
            borderRadius: 4,
            background: it.on ? 'var(--uc-paper)' : 'transparent',
            border: '1px solid ' + (it.on ? 'var(--line-2)' : 'transparent'),
            color: 'var(--fg-1)',
            textDecoration: 'none',
            fontSize: 12.5, fontWeight: it.on ? 700 : 500,
            letterSpacing: '-0.005em'
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: it.on ? 'var(--fg-1)' : 'var(--fg-3)'
            }}>
              <NavIcon kind={it.icon}/>
            </span>
            <span>{it.l}</span>
            {it.count != null && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: it.on ? 'var(--fg-1)' : 'var(--fg-3)',
                padding: '2px 6px',
                background: it.on ? 'var(--uc-signal)' : 'var(--uc-bone)',
                border: '1px solid ' + (it.on ? 'var(--uc-black)' : 'var(--line-1)'),
                borderRadius: 999, fontWeight: 700
              }}>{it.count}</span>
            )}

          </a>
        ))}

        <div style={{
          marginTop: 20, paddingTop: 14,
          borderTop: '1px solid var(--line-1)',
          display: 'flex', flexDirection: 'column', gap: 8
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '4px 10px'
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: 999,
              background: '#0A3A2E', color: 'var(--uc-paper)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, letterSpacing: 0
            }}>JR</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-1)' }}>J. Rivera</div>
              <div style={{ fontSize: 10, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>Buyer · Eastline</div>
            </div>
          </div>
          <a href="#" style={{
            padding: '6px 10px', textDecoration: 'none',
            fontSize: 11, color: 'var(--fg-3)',
            display: 'flex', justifyContent: 'space-between'
          }}>
            <span>Settings</span><span>↳</span>
          </a>
          <a href="#" style={{
            padding: '6px 10px', textDecoration: 'none',
            fontSize: 11, color: 'var(--fg-3)',
            display: 'flex', justifyContent: 'space-between'
          }}>
            <span>Sign out</span><span>↳</span>
          </a>
        </div>
      </nav>
      <div style={{ minWidth: 0 }}>

      <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {[
          { k: 'OPEN ORDERS',   v: '14',  d: '3 awaiting approval', acc: 'var(--uc-brand)' },
          { k: 'QUOTES ACTIVE', v: '4',   d: '$48,210 in flight',    acc: '#0A3A2E' },
          { k: 'YTD VOLUME',    v: '$612k', d: '+22% vs LY',          acc: '#D6203B' }
        ].map((s, i) => (
          <div key={i} style={{
            border: '1px solid var(--line-1)', borderRadius: 5, padding: 16,
            background: 'var(--uc-paper)'
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', letterSpacing: '0.12em', marginBottom: 6 }}>{s.k}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <div style={{ fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 32, letterSpacing: '-0.035em', color: 'var(--fg-1)' }}>{s.v}</div>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: s.acc }}/>
            </div>
            <div style={{ fontSize: 11, color: 'var(--fg-2)', marginTop: 4 }}>{s.d}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 24px 24px', display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 12 }}>
        {/* Recent orders table */}
        <div style={{ border: '1px solid var(--line-1)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line-1)', background: 'var(--uc-bone)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>Recent Orders</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)' }}>14 OPEN · 3 NEEDS APPROVAL</span>
          </div>
          {[
            { id: '#PO-9421', desc: '24 SKUs · UC.CON sync',     amt: '$12,480',  status: 'Approved' },
            { id: '#PO-9420', desc: '8 SKUs · rush ship',         amt: '$3,210',   status: 'Picking' },
            { id: '#PO-9419', desc: '142 SKUs · quarterly fill',  amt: '$48,902',  status: 'Pending', warn: true },
            { id: '#PO-9418', desc: '6 SKUs · sample request',    amt: '$420',     status: 'Shipped' },
            { id: '#PO-9417', desc: '32 SKUs · standing order',   amt: '$8,840',   status: 'Delivered' }
          ].map((r, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '80px 1fr 80px 84px 130px',
              gap: 12, padding: '10px 16px',
              borderBottom: i < 4 ? '1px solid var(--line-1)' : 'none',
              alignItems: 'center', fontSize: 11
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-1)', fontWeight: 600 }}>{r.id}</span>
              <span style={{ color: 'var(--fg-2)' }}>{r.desc}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--fg-1)', textAlign: 'right' }}>{r.amt}</span>
              <span style={{ textAlign: 'right' }}>
                <MiniChip accent={r.warn ? '#D6203B' : (r.status === 'Delivered' ? '#0A3A2E' : undefined)} dark={r.status === 'Approved'}>
                  {r.status}
                </MiniChip>
              </span>
              <span style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 9px',
                  border: '1px solid var(--line-1)',
                  borderRadius: 3,
                  background: 'var(--uc-paper)',
                  color: 'var(--fg-1)',
                  fontSize: 10, fontWeight: 600
                }}>
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                    <path d="M1.5 8 Q 4 4 8 4 Q 12 4 14.5 8 Q 12 12 8 12 Q 4 12 1.5 8 Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                  View
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 9px',
                  background: 'var(--uc-black)',
                  color: 'var(--uc-paper)',
                  borderRadius: 3,
                  fontSize: 10, fontWeight: 700
                }}>
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8 Q 3 3 8 3 Q 11.5 3 13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    <path d="M11 6 H 13.5 V 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <path d="M13 8 Q 13 13 8 13 Q 4.5 13 3 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    <path d="M5 10 H 2.5 V 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                  Reorder
                </span>
              </span>
            </div>
          ))}
        </div>

        {/* Quote panel */}
        <div style={{ border: '1px solid var(--line-1)', borderRadius: 5, padding: 16, background: 'var(--uc-paper)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>Build a Quote</span>
            <MiniChip mono>DRAFT · 4</MiniChip>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { p: 'Header · LS3 · CAT-BACK',    q: '12', a: '$8,640' },
              { p: 'Header · LT4 · OFF-ROAD',    q: '8',  a: '$5,720' },
              { p: 'Connection · 3" · GREEN',    q: '24', a: '$3,840' }
            ].map((l, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 70px', gap: 8, alignItems: 'center', padding: '8px 10px', background: 'var(--uc-bone)', borderRadius: 3, fontSize: 11 }}>
                <span style={{ color: 'var(--fg-1)', fontWeight: 600 }}>{l.p}</span>
                <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--fg-2)' }}>×{l.q}</span>
                <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--fg-1)', fontWeight: 600 }}>{l.a}</span>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--line-1)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)' }}>QUOTE TOTAL</div>
              <div style={{ fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 22, color: 'var(--fg-1)', letterSpacing: '-0.028em' }}>$18,200</div>
            </div>
            <span style={{
              padding: '8px 14px', background: '#0A3A2E', color: 'var(--uc-paper)',
              borderRadius: 3, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em'
            }}>SEND FOR APPROVAL →</span>
          </div>
        </div>
      </div>
          </div>


      </div>
    </StorefrontChrome>
  );
}

// ─── 09 MISSION ───────────────────────────────────────────────────────────
function P9Mission() {
  return (
    <section data-poster="11" style={{
      background: 'var(--uc-black)',
      color: 'var(--uc-paper)',
      minHeight: '100vh',
      padding: '32px 32px 32px',
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* User-fillable background image */}
      <image-slot
        id="mission-bg"
        shape="rect"
        radius="0"
        src="https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1800&q=80"
        placeholder="Full-bleed photo — warehouse, manufacturing line, or operator-in-context"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          zIndex: 0, display: 'block',
          filter: 'grayscale(0.6)'
        }}
      />
      {/* Dark tint overlay so image reads as mood, not subject */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(10,10,10,0.72) 0%, rgba(10,10,10,0.86) 100%)'
      }}/>
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
      {/* Faint grid */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background:
          'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 50%, transparent 100%)',
        maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 50%, transparent 100%)'
      }}/>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, paddingBottom: 20,
        borderBottom: '1px solid #1F1F1F', position: 'relative', zIndex: 1
      }}>
        <PageMark n={11} label="The mission" dark/>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--uc-stone-500)', letterSpacing: 0
        }}>UC.MISSION · CORE</div>
      </div>

      <div style={{
        flex: 1, position: 'relative', zIndex: 1,
        paddingTop: 56, paddingBottom: 40,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', textAlign: 'center', gap: 32
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--uc-stone-500)'
        }}>Why Uncap exists</div>

        <h2 style={{
          margin: 0,
          fontFamily: 'var(--font-hero)',
          fontWeight: 700,
          fontSize: 'clamp(48px, 7.6vw, 144px)',
          letterSpacing: '-0.045em',
          lineHeight: 0.9,
          color: 'var(--uc-paper)',
          maxWidth: 1200, textWrap: 'balance'
        }}>
          Smaller and mid-market businesses are the{' '}
          <span style={{
            fontFamily: 'var(--font-serif)', fontWeight: 400,
            color: 'var(--uc-signal)'
          }}>catalyst of the economy.</span>
        </h2>

        <p style={{
          margin: 0,
          fontFamily: 'var(--font-serif)', fontWeight: 400,
          fontSize: 'clamp(20px, 1.85vw, 28px)',
          letterSpacing: '-0.012em',
          lineHeight: 1.35,
          color: 'var(--uc-stone-300)',
          maxWidth: 760, textWrap: 'pretty'
        }}>
          They deserve enterprise capability without the enterprise bill. Our products and solutions are how we deliver it.
        </p>

        <div style={{
          paddingTop: 32, marginTop: 8,
          borderTop: '1px solid #1F1F1F', width: '100%', maxWidth: 720,
          display: 'flex', justifyContent: 'center'
        }}>
          <a href="#" className="uc-outline-light">
            Read Our Story <span>→</span>
          </a>
        </div>
      </div>

      <div style={{
        paddingTop: 24, position: 'relative', zIndex: 1,
        borderTop: '1px solid #1F1F1F',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'var(--uc-stone-500)', letterSpacing: 0
      }}>
        <span>↳ Chicago HQ · est. 2013</span>
        <span>UC.WHY</span>
      </div>
    </section>
  );
}

window.P3Promise = P3Promise;

// OutcomeIcon — black abstract marks for the three Promise outcomes.
function OutcomeIcon({ kind }) {
  const c = { width: 56, height: 56, viewBox: '0 0 40 40', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (kind) {
    case 'systems':
      // Three connected nodes — integration
      return (
        <svg {...c}>
          <circle cx="10" cy="10" r="3.5"/>
          <circle cx="30" cy="10" r="3.5"/>
          <circle cx="20" cy="30" r="3.5"/>
          <path d="M13 11 L 27 11"/>
          <path d="M11.5 13 L 18 27"/>
          <path d="M28.5 13 L 22 27"/>
        </svg>
      );
    case 'revenue':
      // Upward step chart with arrow
      return (
        <svg {...c}>
          <path d="M5 30 L 13 22 L 19 26 L 28 12"/>
          <path d="M21 12 H 28 V 19"/>
          <line x1="5" y1="34" x2="34" y2="34"/>
        </svg>
      );
    case 'debt':
      // Stacked layers shrinking down — less to maintain
      return (
        <svg {...c}>
          <rect x="6" y="9" width="28" height="5" rx="0.6"/>
          <rect x="9" y="17" width="22" height="5" rx="0.6"/>
          <rect x="13" y="25" width="14" height="5" rx="0.6"/>
        </svg>
      );
    default:
      return null;
  }
}
window.OutcomeIcon = OutcomeIcon;
window.P5Path = P5Path;
window.P6Focus = P6Focus;
window.P9Mission = P9Mission;
