// CTA + Footer
function CTA() {
  const [sent, setSent] = React.useState(false);
  return (
    <section style={{
      background: 'var(--uc-cream)',
      padding: 'clamp(80px, 10vw, 144px) 32px',
      position: 'relative',
      overflow: 'hidden',
      borderTop: '1px solid var(--line-1)'
    }}>
      <svg aria-hidden="true" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', opacity: 0.07 }}>
        <path d="M-50 300 H 1050 M 900 120 L 1180 300 L 900 480"
          fill="none" stroke="var(--uc-black)"
          strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>

      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'rgba(10,10,10,0.045)',
        WebkitMaskImage: `url(${window.__resources.bgVector3})`,
        maskImage: `url(${window.__resources.bgVector3})`,
        WebkitMaskSize: 'cover', maskSize: 'cover',
        WebkitMaskPosition: 'center', maskPosition: 'center',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat'
      }}/>

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <p className="uc-eyebrow" style={{ marginBottom: 32 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', letterSpacing: 0, whiteSpace: 'nowrap', textTransform: 'none' }}>05 / </span>
            <span style={{ width: 24, height: 1, background: 'var(--line-1)' }}/>
            Talk to us
          </span>
        </p>

        <h2 style={{
          fontFamily: 'var(--font-hero)',
          fontWeight: 700,
          fontSize: 'clamp(54px, 8.4vw, 144px)',
          letterSpacing: '-0.04em',
          lineHeight: 0.94,
          margin: '0 0 12px',
          color: 'var(--fg-1)',
          textWrap: 'balance',
          maxWidth: 1100
        }}>
          Let's uncap{' '}
          <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, letterSpacing: '-0.028em' }}>what comes next.</span>
        </h2>

        <div style={{
          marginTop: 56,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
          gap: 64, alignItems: 'start'
        }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(20px, 1.8vw, 24px)',
            fontWeight: 500,
            lineHeight: 1.3, letterSpacing: '-0.01em',
            color: 'var(--fg-1)', margin: 0,
            maxWidth: 620, textWrap: 'pretty'
          }}>
            Whether you're planning a Shopify B2B launch, a platform
            migration, or scaling an operation that's outgrowing its
            stack — a working session with our team is the right next step.
          </p>

          <div style={{
            display: 'flex', flexDirection: 'column', gap: 24,
            padding: 24,
            background: 'var(--uc-paper)',
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--radius)'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--fg-3)'
            }}>
              <span className="uc-pulse"/>
              No pitch deck. No slick spin. No B.S.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <button
                className="uc-btn b-dark"
                style={{ justifyContent: 'space-between', width: '100%' }}
                onClick={() => setSent(true)}
                disabled={sent}
              >
                {sent ? <>Request received <span>✓</span></> : <>Get a Quote <span>→</span></>}
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <a href="mailto:hey@uncap.com" style={{
                  padding: '12px 14px',
                  border: '1px solid var(--line-2)',
                  borderRadius: 'var(--radius)',
                  textDecoration: 'none', color: 'var(--fg-1)',
                  fontSize: 13, fontWeight: 600,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>hey@uncap.com <span>→</span></a>
                <a href="tel:+13124690944" style={{
                  padding: '12px 14px',
                  border: '1px solid var(--line-2)',
                  borderRadius: 'var(--radius)',
                  textDecoration: 'none', color: 'var(--fg-1)',
                  fontSize: 13, fontWeight: 600,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>(312) 469-0944 <span>→</span></a>
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, paddingTop: 14,
              borderTop: '1px solid var(--line-1)',
              fontSize: 12, color: 'var(--fg-3)'
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--uc-shopify)' }}/>
              Shopify Platinum Partner · Chicago HQ · est. 2013
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// FOOTER — "Operator's Station"
//   1. Editorial lead with serif accent + mini live dashboard
//   2. Big CTA pair (Get a Quote button + Book a fit call link)
//   3. Sitemap with contact column
//   4. Corner crop marks + colophon
// ────────────────────────────────────────────────────────────────────────────
function Footer() {
  const [time, setTime] = React.useState(() => formatChicagoTime());
  React.useEffect(() => {
    const t = setInterval(() => setTime(formatChicagoTime()), 1000);
    return () => clearInterval(t);
  }, []);

  const yearsBuilding = new Date().getFullYear() - 2013;

  const sitemap = [
    { h: 'Practices', l: ['Uncap Commerce', 'Uncap Growth', 'Uncap Blueprint'] },
    { h: 'Products',  l: ['Connect', 'Quotes', 'Garage', 'PartsDiagram', 'Portal', 'Dealroom'] },
    { h: 'Focus',     l: ['Unified Commerce', 'Agentic Commerce', 'Wholesale', 'Distribution', 'Manufacturing'] },
    { h: 'Company',   l: ['Work', 'Blog', 'About', 'Careers', 'Contact'] }
  ];

  const onScrollTo = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer style={{
      background: 'var(--uc-black)',
      color: 'var(--uc-stone-300)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* faint vector overlay */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'rgba(255,255,255,0.03)',
        WebkitMaskImage: `url(${window.__resources.bgVector3})`,
        maskImage: `url(${window.__resources.bgVector3})`,
        WebkitMaskSize: 'cover', maskSize: 'cover',
        WebkitMaskPosition: 'center', maskPosition: 'center',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat'
      }}/>

      {/* ── EDITORIAL LEAD + CTA ── */}
      <div style={{
        background: 'var(--uc-black)',
        position: 'relative', zIndex: 1,
        borderTop: '1px solid #1F1F1F',
        borderBottom: '1px solid #1F1F1F',
        overflow: 'hidden'
      }}>
        {/* Background image — user fills via drag/drop, heavily tinted */}
        <image-slot
          id="footer-bg"
          shape="rect"
          radius="0"
          placeholder="Drop a lifestyle / operator photo"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            zIndex: 0,
            display: 'block',
            filter: 'grayscale(1)',
            opacity: 0.35
          }}
        />
        {/* Tint overlay */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background:
            'radial-gradient(ellipse 90% 75% at 70% 50%, rgba(10,10,10,0.55), rgba(10,10,10,0.92))',
          pointerEvents: 'none'
        }}/>

        <div style={{
          maxWidth: 1360, margin: '0 auto',
          padding: '96px 32px 72px',
          position: 'relative', zIndex: 1
        }}>
        <div className="uc-eyebrow" style={{ color: 'var(--uc-paper)', marginBottom: 28 }}>
          Ready to get started?
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, auto)',
          gap: 80,
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(40px, 5vw, 80px)',
              letterSpacing: '-0.035em',
              lineHeight: 1.0,
              margin: '0 0 8px',
              color: 'var(--uc-paper)',
              maxWidth: 760, textWrap: 'balance'
            }}>
              Straight to solutions.
            </h3>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 400,
              fontSize: 'clamp(28px, 3.4vw, 48px)',
              lineHeight: 1.08,
              letterSpacing: '-0.022em',
              margin: 0,
              color: 'var(--uc-stone-300)',
              maxWidth: 760, textWrap: 'balance'
            }}>
              No pitch deck. No slick spin. No B.S.
            </p>
          </div>

          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16
          }}>
            <a
              href="#talk"
              onClick={(e) => onScrollTo(e, 'talk')}
              className="uc-cta-mega"
            >
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
                  textTransform: 'uppercase', opacity: 0.55
                }}>Start here</span>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 28, fontWeight: 700,
                  letterSpacing: '-0.02em', lineHeight: 1
                }}>Get a Quote</span>
              </span>
              <span className="uc-cta-mega-arrow">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M5 14 H 22 M 15 7 L 23 14 L 15 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </a>
            <a
              href="#talk"
              onClick={(e) => onScrollTo(e, 'talk')}
              className="uc-link uc-link-light"
              style={{ fontSize: 14, alignSelf: 'center' }}
            >
              Book a fit call <span>→</span>
            </a>
          </div>
        </div>
        </div>
      </div>

      {/* ── SITEMAP ── */}
      <div style={{
        position: 'relative', zIndex: 1
      }}>
        <div style={{
          maxWidth: 1360, margin: '0 auto',
          padding: '56px 32px 40px',
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1.2fr',
          gap: 56
        }}>
          {/* Brand column */}
          <div>
            <img src={window.__resources.uncapLogoWhite} style={{ height: 28, marginBottom: 18, display: 'block' }} alt="uncap"/>
            <p style={{
              fontSize: 13, lineHeight: 1.55,
              color: 'var(--uc-stone-500)', margin: 0,
              maxWidth: 320, textWrap: 'pretty'
            }}>
              Shopify Platinum Partner. We crafted Uncap for operator-led
              manufacturers and distributors holding the economy together.
            </p>
          </div>

          {/* Practices + Focus stacked */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <SitemapBlock h="Practices" items={['Uncap Commerce', 'Uncap Growth', 'Uncap Blueprint']}/>
            <SitemapBlock h="Focus" items={['Unified Commerce', 'Agentic Commerce', 'Wholesale', 'Distribution', 'Manufacturing']}/>
          </div>

          {/* Products */}
          <SitemapBlock h="Products" items={['Connect', 'Quotes', 'Garage', 'PartsDiagram', 'Portal', 'Dealroom']}/>

          {/* Company */}
          <SitemapBlock h="Company" items={['Work', 'Blog', 'About', 'Careers', 'Contact']}/>

          {/* Contact column — last */}
          <div>
            <div className="uc-eyebrow" style={{ color: 'var(--uc-paper)', marginBottom: 18 }}>
              Contact
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ContactRow
                label="Email"
                href="mailto:hey@uncap.com"
                value="hey@uncap.com"
              />
              <ContactRow
                label="Phone"
                href="tel:+13124690944"
                value="(312) 469-0944"
              />
              <div>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: 'var(--uc-stone-500)',
                  marginBottom: 6
                }}>Studio</div>
                <address style={{
                  fontStyle: 'normal',
                  fontSize: 14, lineHeight: 1.45,
                  color: 'var(--uc-paper)'
                }}>
                  212 W Superior St, Suite 400<br/>
                  Chicago, IL 60654
                </address>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── COLOPHON ── */}
      <div style={{ borderTop: '1px solid #1F1F1F', position: 'relative', zIndex: 1 }}>
        <div style={{
          maxWidth: 1360, margin: '0 auto',
          padding: '20px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 24, flexWrap: 'wrap',
          fontSize: 12, color: 'var(--uc-stone-500)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span>© 2026 Uncap, Inc — All rights reserved.</span>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <a href="#" style={{ color: 'var(--uc-stone-500)', textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ color: 'var(--uc-stone-500)', textDecoration: 'none' }}>Terms</a>
            <a href="#" style={{ color: 'var(--uc-stone-500)', textDecoration: 'none' }}>Security</a>
            <a href="#" style={{ color: 'var(--uc-stone-500)', textDecoration: 'none' }}>Cookies</a>
          </div>
        </div>
      </div>

      {/* Corner crop marks removed */}
    </footer>
  );
}

function SitemapBlock({ h, items }) {
  return (
    <div>
      <div className="uc-eyebrow" style={{ color: 'var(--uc-paper)', marginBottom: 16 }}>
        {h}
      </div>
      <ul style={{
        listStyle: 'none', padding: 0, margin: 0,
        display: 'flex', flexDirection: 'column', gap: 11
      }}>
        {items.map(x => (
          <li key={x}>
            <a href="#" className="uc-footer-link" style={{
              color: 'var(--uc-stone-300)', textDecoration: 'none',
              fontSize: 13.5, letterSpacing: '-0.005em',
              transition: 'color .15s var(--ease-out)'
            }}>{x}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DashTile({ label, valueNode, meta, border }) {
  return (
    <div style={{
      padding: '18px 18px 16px',
      borderLeft: border ? '1px solid #1F1F1F' : 'none',
      display: 'flex', flexDirection: 'column', gap: 6,
      minWidth: 0
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'var(--uc-stone-500)'
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 600, fontSize: 22, letterSpacing: '-0.015em',
        color: 'var(--uc-paper)', lineHeight: 1.1,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
      }}>
        {valueNode}
      </div>
      <div style={{
        fontSize: 11, color: 'var(--uc-stone-500)',
        fontFamily: 'var(--font-mono)', letterSpacing: 0
      }}>{meta}</div>
    </div>
  );
}

function ContactRow({ label, href, value }) {
  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'var(--uc-stone-500)',
        marginBottom: 4
      }}>{label}</div>
      <a href={href} className="uc-footer-link" style={{
        color: 'var(--uc-paper)', textDecoration: 'none',
        fontSize: 14, fontWeight: 500, letterSpacing: '-0.005em'
      }}>{value}</a>
    </div>
  );
}

function CropMarks() {
  const arm = 14;
  const inset = 16;
  const mark = (pos) => ({
    position: 'absolute',
    [pos.includes('top') ? 'top' : 'bottom']: inset,
    [pos.includes('left') ? 'left' : 'right']: inset,
    width: arm, height: arm,
    zIndex: 2, pointerEvents: 'none',
    opacity: 0.45
  });
  return (
    <>
      {['top-left','top-right','bottom-left','bottom-right'].map(p => {
        const tl = p === 'top-left';
        const tr = p === 'top-right';
        const bl = p === 'bottom-left';
        const br = p === 'bottom-right';
        return (
          <div key={p} aria-hidden="true" style={mark(p)}>
            <svg viewBox="0 0 14 14" width={arm} height={arm} fill="none">
              <path d={
                tl ? 'M0 0 H 14 M 0 0 V 14' :
                tr ? 'M14 0 H 0 M 14 0 V 14' :
                bl ? 'M0 14 H 14 M 0 14 V 0' :
                'M14 14 H 0 M 14 14 V 0'
              } stroke="var(--uc-stone-500)" strokeWidth="1"/>
            </svg>
          </div>
        );
      })}
    </>
  );
}

function formatChicagoTime() {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }).format(new Date());
  } catch {
    return '--:--:--';
  }
}
window.CTA = CTA;
window.Footer = Footer;
