// Header.jsx — Sticky floating capsule nav with Solutions mega-menu
function Header() {
  const [active, setActive] = React.useState('');
  const [openMenu, setOpenMenu] = React.useState(false);
  const closeTimer = React.useRef(null);

  const links = [
    { id: 'solutions', t: 'Solutions', dropdown: true },
    { id: 'work',      t: 'Work' },
    { id: 'blog',      t: 'Blog' },
    { id: 'about',     t: 'About' }
  ];

  React.useEffect(() => {
    const ids = ['solutions', 'work', 'blog', 'about'];

    // Scroll-based active detection: pick the section whose top is closest
    // above (or near) a "trigger line" 30% down the viewport. IntersectionObserver
    // misses cases where you scroll fast or land mid-section, so we drive this
    // directly off scroll position instead.
    const update = () => {
      const trigger = window.innerHeight * 0.3;
      let bestId = '';
      let bestTop = -Infinity;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        // section whose top is <= trigger and closest to it wins
        if (top <= trigger && top > bestTop) {
          bestTop = top;
          bestId = id;
        }
      }
      // Special-case: near bottom of page, force last id
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        bestId = ids[ids.length - 1];
      }
      setActive(bestId);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const onNav = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openSolutions = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    setOpenMenu(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(false), 140);
  };

  // Esc closes
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpenMenu(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'transparent', paddingTop: 16
    }}>
      <div style={{
        padding: '0 24px'
      }}>
        <div style={{
          background: 'rgba(242,239,231,0.85)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid var(--line-1)',
          borderRadius: 5,
          padding: '12px 16px 12px 20px',
          display: 'flex', alignItems: 'center', gap: 24,
          boxShadow: 'var(--shadow-1)',
          position: 'relative'
        }}>
          <a
            href="#top"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}
          >
            <img src={window.__resources.uncapLogoBlack} style={{ height: 22 }} alt="uncap"/>
            <span style={{ height: 20, width: 1, background: 'var(--line-1)' }}/>
            <img
              src={window.__resources.shopifyBadge}
              alt="Shopify Platinum Partner"
              style={{ height: 22, display: 'block' }}
            />
          </a>

          <nav style={{ display: 'flex', gap: 2, alignItems: 'center', marginLeft: 12 }}>
            {links.map(({ id, t, dropdown }) => {
              const isActive = active === id || (id === 'solutions' && openMenu);
              if (dropdown) {
                return (
                  <div
                    key={id}
                    onMouseEnter={openSolutions}
                    onMouseLeave={scheduleClose}
                    style={{ position: 'relative' }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenMenu(o => !o)}
                      aria-expanded={openMenu}
                      aria-haspopup="true"
                      style={{
                        border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? 'var(--fg-1)' : 'var(--fg-2)',
                        background: isActive ? 'rgba(10,10,10,0.06)' : 'transparent',
                        padding: '8px 10px 8px 12px',
                        borderRadius: 5,
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        transition: 'background .15s var(--ease-out), color .15s var(--ease-out)'
                      }}
                    >
                      {t}
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{
                        transition: 'transform .2s var(--ease-out)',
                        transform: openMenu ? 'rotate(180deg)' : 'none'
                      }}>
                        <path d="M2.5 4.5 L6 8 L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    {/* Mega menu anchored to button */}
                    <SolutionsMenu
                      open={openMenu}
                      onEnter={openSolutions}
                      onLeave={scheduleClose}
                    />
                  </div>
                );
              }
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => onNav(e, id)}
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--fg-1)' : 'var(--fg-2)',
                    textDecoration: 'none',
                    padding: '8px 12px',
                    borderRadius: 5,
                    background: isActive ? 'rgba(10,10,10,0.06)' : 'transparent',
                    transition: 'background .15s var(--ease-out), color .15s var(--ease-out)'
                  }}
                >{t}</a>
              );
            })}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            <a
              href="#talk"
              onClick={(e) => onNav(e, 'talk')}
              style={{
                fontSize: 13, fontWeight: 500,
                color: 'var(--fg-2)',
                textDecoration: 'none', padding: '8px 4px'
              }}
            >Book a fit call</a>
            <a
              href="#talk"
              onClick={(e) => onNav(e, 'talk')}
              className="uc-btn b-primary"
              style={{ padding: '10px 16px', fontSize: 13 }}
            >Talk to Our Experts <span>→</span></a>
          </div>
        </div>
      </div>
    </header>
  );
}

function SolutionsMenu({ open, onEnter, onLeave }) {
  const products = [
    { name: 'Uncap Connect',      desc: 'Real-time sync between Shopify, ERP, and the floor.', icon: 'connect' },
    { name: 'Uncap Quotes',       desc: 'Quote-to-cash for catalogs built for self-serve.', icon: 'quotes' },
    { name: 'Uncap Garage',       desc: 'Stage and ship storefront changes without breaking prod.', icon: 'garage' },
    { name: 'Uncap PartsDiagram', desc: 'Exploded diagrams that turn parts into orders.', icon: 'parts' },
    { name: 'Uncap Portal',       desc: 'A B2B account portal reps and buyers actually use.', icon: 'portal' },
    { name: 'Uncap Dealroom',     desc: 'Quote, negotiate, and close large orders in one place.', icon: 'dealroom' }
  ];
  const services = [
    { name: 'Uncap Commerce',  desc: 'Migrate, launch, or unify B2B and B2C on Shopify.', icon: 'commerce' },
    { name: 'Uncap Growth',    desc: 'Compound revenue, margin, and speed after launch.', icon: 'growth' },
    { name: 'Uncap Blueprint', desc: 'Strategy, architecture, and working prototypes before code.', icon: 'blueprint' }
  ];
  const specialties = [
    { name: 'Unified Commerce' },
    { name: 'Agentic Commerce' },
    { name: 'Wholesale' },
    { name: 'Distribution' },
    { name: 'Manufacturing' }
  ];

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      aria-hidden={!open}
      style={{
        position: 'absolute',
        top: 'calc(100% + 10px)',
        left: 0,
        width: 640,
        zIndex: 60,
        pointerEvents: open ? 'auto' : 'none',
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0)' : 'translateY(-6px)',
        transition: 'opacity .18s var(--ease-out), transform .18s var(--ease-out)'
      }}
    >
      <div style={{
        background: 'var(--uc-paper)',
        border: '1px solid var(--line-1)',
        borderRadius: 5,
        boxShadow: 'var(--shadow-3)',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'stretch'
      }}>
        <MenuColumn>
          <MenuBlock
            eyebrow="Solutions"
            subtitle="The team that makes it land."
            items={services}
          />
          <div style={{ height: 1, background: 'var(--line-1)', margin: '4px 6px' }}/>
          <MenuBlock
            eyebrow="Focus"
            subtitle="Where we ship most often."
            items={specialties}
            compact
          />
        </MenuColumn>
        <MenuColumn divider>
          <MenuBlock
            eyebrow="Products"
            subtitle="The technology that unifies the operation."
            items={products}
          />
        </MenuColumn>
      </div>
    </div>
  );
}

function MenuColumn({ divider, children }) {
  return (
    <div style={{
      background: 'var(--uc-paper)',
      padding: '20px 16px 18px',
      display: 'flex', flexDirection: 'column', gap: 8,
      borderLeft: divider ? '1px solid var(--line-1)' : 'none'
    }}>{children}</div>
  );
}

function MenuBlock({ eyebrow, subtitle, items, compact }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ padding: '0 6px' }}>
        <div className="uc-eyebrow" style={{ margin: 0, marginBottom: 4 }}>{eyebrow}</div>
        <div style={{
          fontFamily: 'var(--font-serif)', fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.3
        }}>{subtitle}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(it => (
          <a key={it.name} href="#" className="uc-menu-item" style={{
            display: 'flex', alignItems: compact ? 'center' : 'flex-start', gap: 12,
            padding: compact ? '6px 12px' : '10px 12px',
            borderRadius: 5,
            textDecoration: 'none',
            color: 'var(--fg-1)',
            transition: 'background .15s var(--ease-out)'
          }}>
            {it.icon && (
              <span aria-hidden="true" className="uc-menu-icon" style={{
                flexShrink: 0,
                width: 20, height: 20,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--fg-1)',
                marginTop: compact ? 0 : 2,
                transition: 'color .15s var(--ease-out), transform .15s var(--ease-out)'
              }}>
                <MenuIcon name={it.icon}/>
              </span>
            )}
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 13, fontWeight: compact ? 500 : 600,
                letterSpacing: '-0.005em', color: 'var(--fg-1)'
              }}>
                {it.name}
                <span className="uc-menu-arrow" style={{
                  fontSize: 11, color: 'var(--fg-3)',
                  transition: 'transform .2s var(--ease-out), color .2s var(--ease-out)',
                  display: 'inline-flex'
                }}>→</span>
              </span>
              {!compact && it.desc && (
                <span style={{
                  fontSize: 11.5, lineHeight: 1.4,
                  color: 'var(--fg-3)', textWrap: 'pretty'
                }}>
                  {it.desc}
                </span>
              )}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
window.Header = Header;

// Slick 1.5px-stroke icon set — one per Solutions menu item
function MenuIcon({ name }) {
  const common = {
    width: 16, height: 16, viewBox: '0 0 16 16',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round'
  };
  switch (name) {
    case 'connect':
      // Two overlapping circles linked
      return (
        <svg {...common}>
          <circle cx="6" cy="8" r="3.25"/>
          <circle cx="10" cy="8" r="3.25"/>
        </svg>
      );
    case 'garage':
      // Roll-up door / shutter raised
      return (
        <svg {...common}>
          <path d="M2.5 13.5 V 7 L 8 3 L 13.5 7 V 13.5"/>
          <path d="M5 13.5 V 10 H 11 V 13.5"/>
          <path d="M5 12 H 11"/>
        </svg>
      );
    case 'portal':
      // Archway / doorway with depth lines
      return (
        <svg {...common}>
          <path d="M3 13.5 V 7 a 5 5 0 0 1 10 0 V 13.5"/>
          <path d="M5.5 13.5 V 8 a 2.5 2.5 0 0 1 5 0 V 13.5"/>
        </svg>
      );
    case 'dealroom':
      return (
        <svg {...common}>
          <path d="M2.5 8 H 7"/>
          <path d="M5 5.5 L 7.5 8 L 5 10.5"/>
          <path d="M13.5 8 H 9"/>
          <path d="M11 5.5 L 8.5 8 L 11 10.5"/>
        </svg>
      );
    case 'parts':
      // Exploded assembly — main square + offset detail square + connector
      return (
        <svg {...common}>
          <rect x="2.5" y="6.5" width="6.5" height="6.5" rx="0.5"/>
          <path d="M9 8 L 11.5 5"/>
          <rect x="10" y="2.5" width="3.5" height="3.5" rx="0.4"/>
          <circle cx="5.75" cy="9.75" r="0.6" fill="currentColor" stroke="none"/>
        </svg>
      );
    case 'quotes':
      // Document with price tag corner
      return (
        <svg {...common}>
          <path d="M3.5 2.5 H 10.5 L 13 5 V 13.5 H 3.5 Z"/>
          <path d="M10.5 2.5 V 5 H 13"/>
          <path d="M6 8.5 H 10.5"/>
          <path d="M6 11 H 9"/>
        </svg>
      );
    case 'commerce':
      // Shopping bag with handle
      return (
        <svg {...common}>
          <path d="M3 5.5 H 13 L 12.25 13.5 H 3.75 Z"/>
          <path d="M6 7.5 V 5 a 2 2 0 0 1 4 0 V 7.5"/>
        </svg>
      );
    case 'growth':
      // Sparkline up + arrowhead
      return (
        <svg {...common}>
          <path d="M2.5 11 L 6 7.5 L 8.5 9.5 L 13.5 4.5"/>
          <path d="M10 4.5 H 13.5 V 8"/>
        </svg>
      );
    case 'blueprint':
      // Grid with one filled cell — schematic
      return (
        <svg {...common}>
          <rect x="2.75" y="2.75" width="10.5" height="10.5" rx="0.5"/>
          <path d="M2.75 8 H 13.25"/>
          <path d="M8 2.75 V 13.25"/>
          <rect x="3.5" y="3.5" width="3.75" height="3.75" rx="0.25" fill="currentColor" stroke="none"/>
        </svg>
      );
    case 'unified':
      // Three nodes converging into one — unified
      return (
        <svg {...common}>
          <circle cx="3.5" cy="4" r="1.25"/>
          <circle cx="3.5" cy="12" r="1.25"/>
          <circle cx="12.5" cy="8" r="1.75"/>
          <path d="M4.75 4 H 8 a 2 2 0 0 1 2 2 V 6.5"/>
          <path d="M4.75 12 H 8 a 2 2 0 0 0 2 -2 V 9.5"/>
        </svg>
      );
    case 'agentic':
      // Cursor / spark — autonomous agent
      return (
        <svg {...common}>
          <path d="M3 3 L 8 13 L 9.75 9 L 13 8 Z"/>
          <path d="M11 11 L 13.5 13.5"/>
        </svg>
      );
    case 'wholesale':
      // Stacked boxes — bulk
      return (
        <svg {...common}>
          <rect x="2.5" y="8.5" width="5" height="4.5"/>
          <rect x="8.5" y="8.5" width="5" height="4.5"/>
          <rect x="5.5" y="3.5" width="5" height="4.5"/>
        </svg>
      );
    case 'distribution':
      // Hub with branching arrows
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="2"/>
          <path d="M8 6 V 3 M3 8 H 6 M13 8 H 10 M8 10 V 13"/>
          <path d="M5.25 5.25 L 6.5 6.5 M10.75 5.25 L 9.5 6.5 M5.25 10.75 L 6.5 9.5 M10.75 10.75 L 9.5 9.5"/>
        </svg>
      );
    case 'manufacturing':
      // Factory roofline
      return (
        <svg {...common}>
          <path d="M2.5 13.5 V 8 L 6 10 V 8 L 9.5 10 V 8 L 13.5 10.5 V 13.5 Z"/>
          <path d="M2.5 13.5 H 13.5"/>
          <path d="M5 11.5 V 12.5 M8 11.5 V 12.5 M11 11.5 V 12.5"/>
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="5"/>
        </svg>
      );
  }
}
window.MenuIcon = MenuIcon;
