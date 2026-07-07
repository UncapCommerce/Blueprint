// BlueprintSections.jsx — the complete Uncap Blueprint proposal document.
// Reconstructed from the design bundle's chat transcripts (the original JSX
// referenced by blueprint.html wasn't included in the export). Every section
// is laid out per the descriptions in /tmp/design-bundle/blueprint-001/chats/
// and uses the design tokens defined in colors_and_type.css.

const SECTIONS = [
  { id: 'intro',         label: 'Cover'        },
  { id: 'summary',       label: 'Summary'      },
  { id: 'where',         label: 'Today'        },
  { id: 'objectives',    label: 'Outcomes'     },
  { id: 'approach',      label: 'Approach'     },
  { id: 'scope',         label: 'Build'        },
  { id: 'performance',   label: 'Commerce'     },
  { id: 'content',       label: 'Content'      },
  { id: 'techstack',     label: 'Stack'        },
  { id: 'b2b',           label: 'B2B'          },
  { id: 'agentic',       label: 'Agentic'      },
  { id: 'integrations',  label: 'Integrations' },
  { id: 'migration',     label: 'Migration'    },
  { id: 'delivery',      label: 'Delivery'     },
  { id: 'investment',    label: 'Investment'   },
  { id: 'growth',        label: 'Growth'       },
  { id: 'team',          label: 'Team'         },
  { id: 'why',           label: 'Why uncap'    },
  { id: 'talk',          label: 'Next'         },
];

const CONTAINER = { maxWidth: 1280, margin: '0 auto', padding: '0 32px' };
const COL = { maxWidth: 1080, margin: '0 auto', padding: '0 32px' };

/* ----------------------- NAV (floating side pill) ---------------------- */
function BPNav() {
  const [active, setActive] = React.useState('intro');
  React.useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      const visible = entries.filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: '-20% 0px -65% 0px' });
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const logo = window.__resources?.uncapLogoBlack || '/assets/uncap-logo-black.svg';
  const brand = (window.__brand?.name || 'Client').trim();

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(242,239,231,0.86)',
      backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--line-1)',
    }}>
      <div style={{
        ...CONTAINER,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, padding: '14px 32px',
      }}>
        <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', color: 'var(--fg-1)' }}>
          <img src={logo} alt="uncap" style={{ height: 22, width: 'auto', display: 'block' }} />
          <span style={{ height: 16, width: 1, background: 'var(--line-1)' }} />
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
            letterSpacing: '-0.01em', color: 'var(--fg-1)',
          }}>Blueprint · {brand}</span>
        </a>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {SECTIONS.slice(2, 9).map(s => {
            const on = active === s.id;
            return (
              <a key={s.id} href={`#${s.id}`} style={{
                padding: '8px 10px', borderRadius: 5, textDecoration: 'none',
                fontSize: 12, fontWeight: on ? 600 : 500,
                color: on ? 'var(--fg-1)' : 'var(--fg-3)',
                background: on ? 'rgba(10,10,10,0.06)' : 'transparent',
                transition: 'background .15s var(--ease-out), color .15s var(--ease-out)',
              }}>{s.label}</a>
            );
          })}
        </nav>
        <a href="#talk" className="uc-btn b-primary" style={{ padding: '10px 16px', fontSize: 13 }}>
          Talk to us <span>→</span>
        </a>
      </div>
    </header>
  );
}

/* ----------------------- 01 · INTRO / COVER ---------------------------- */
function BPIntro() {
  const brand = (window.__brand?.name || 'CLIENT').toUpperCase();
  return (
    <section id="intro" style={{
      background: 'var(--uc-cream)',
      padding: '128px 0 96px',
      borderBottom: '1px solid var(--line-1)',
      position: 'relative',
    }}>
      <div style={COL}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56,
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
          letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-3)',
        }}>
          <span className="uc-pulse" />
          <span>uncap blueprint · proposal v1</span>
          <span style={{ flex: 1, height: 1, background: 'var(--line-1)' }} />
          <span>{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-hero)', fontWeight: 800,
          fontSize: 'clamp(56px, 9vw, 132px)', lineHeight: 0.94,
          letterSpacing: '-0.04em', color: 'var(--uc-black)',
          margin: '0 0 32px', textWrap: 'balance',
        }}>
          Built for how
          <br/>
          <span style={{
            display: 'inline-block', position: 'relative',
            fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500,
            background: `linear-gradient(transparent 64%, var(--uc-signal) 64%, var(--uc-signal) 88%, transparent 88%)`,
            paddingRight: 8,
          }}>{brand}</span>{' '}
          actually runs.
        </h1>

        <p style={{
          fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontSize: 'clamp(20px, 2.2vw, 28px)', lineHeight: 1.35,
          color: 'var(--fg-2)', maxWidth: 780,
          margin: '0 0 64px', letterSpacing: '-0.01em',
        }}>
          The plan that maps your replatform — operations, data, integrations,
          B2B, and AI — into one Shopify Plus rollout. Scoped, sequenced,
          priced flat. Yours to keep, with us or without.
        </p>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
          border: '1px solid var(--uc-black)', borderRadius: 5,
          background: 'var(--uc-paper)', overflow: 'hidden',
        }}>
          {[
            { k: 'Delivery',  v: '16 weeks' },
            { k: 'Workstreams', v: '07'      },
            { k: 'Price',     v: '$7,000'   },
            { k: 'Refund',    v: 'Full'     },
          ].map((s, i) => (
            <div key={s.k} style={{
              padding: '22px 24px',
              borderLeft: i === 0 ? 'none' : '1px solid var(--line-1)',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'var(--fg-3)', marginBottom: 8,
              }}>{s.k}</div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
                letterSpacing: '-0.025em', color: 'var(--fg-1)',
              }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------- 02 · EXECUTIVE SUMMARY ----------------------- */
function BPSummary() {
  return (
    <section id="summary" style={{ background: 'var(--uc-cream)', padding: '96px 0' }}>
      <div style={COL}>
        <BPEyebrow index={1} label="Executive summary" />
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 64, alignItems: 'start' }}>
          <BPHeadline
            title="A migration you can see coming."
            subtitle="No black boxes. No mid-build pivots. No surprise invoices."
          />
          <div>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--fg-2)', margin: '0 0 18px' }}>
              We replace the duct-tape stack with a single Shopify Plus
              storefront wired to your ERP, your warehouse, and your
              customers' real buying behavior — B2B accounts and B2C alike.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--fg-2)', margin: 0 }}>
              The Blueprint maps every workstream, dependency, and decision
              before a line of code is shipped. By kickoff, the build is
              predictable. By launch, the operation is unified.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------- 03 · WHERE YOU ARE TODAY --------------------- */
function BPWhere() {
  const pains = [
    { k: 'Storefront',    v: 'Legacy platform, slow page, broken mobile checkout, no merchandising control.' },
    { k: 'Operations',    v: 'Spreadsheets running price lists. Quote requests scattered across email threads.' },
    { k: 'ERP gap',       v: 'Inventory, orders, and customers live in three systems that do not talk.' },
    { k: 'B2B & B2C',     v: 'Wholesale and retail rebuilt twice on two different platforms. Drift everywhere.' },
    { k: 'Reporting',     v: 'Daily extracts to Sheets. No reliable view of revenue, margin, or attribution.' },
    { k: 'Team',          v: 'Ops spends days on manual work that should be one webhook.' },
  ];
  return (
    <section id="where" style={{ background: 'var(--uc-cream)', padding: '96px 0', borderTop: '1px solid var(--line-1)' }}>
      <div style={COL}>
        <BPEyebrow index={2} label="Where you are today" />
        <BPHeadline title="Six holes in the stack." subtitle="They cost you orders, margin, and team hours every week." />
        <div style={{
          marginTop: 56,
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0,
          border: '1px solid var(--uc-black)', borderRadius: 5,
          background: 'var(--uc-paper)', overflow: 'hidden',
        }}>
          {pains.map((p, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            return (
              <div key={p.k} style={{
                padding: '24px 28px',
                borderLeft: col === 1 ? '1px solid var(--line-1)' : 'none',
                borderTop: row > 0 ? '1px solid var(--line-1)' : 'none',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'var(--fg-3)', marginBottom: 10,
                }}>{p.k}</div>
                <div style={{ fontSize: 16, lineHeight: 1.45, color: 'var(--fg-1)' }}>{p.v}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ----------------------- 04 · FOUR OUTCOMES (LADDER) ------------------ */
function BPObjectives() {
  const rows = [
    { n: '01', t: 'Unify commerce',           d: 'One storefront, one cart, one customer record across B2B and B2C — without two parallel codebases.', tag: 'Revenue' },
    { n: '02', t: 'Cut cost of ownership',    d: 'Replace four annual licenses with one Shopify Plus contract and a stack you can actually staff.',     tag: 'Finance' },
    { n: '03', t: 'Grow revenue per order',   d: 'Lift AOV with quick-order, configurable bundles, and reorder flows your buyers asked for.',           tag: 'Growth'  },
    { n: '04', t: 'Free the team',            d: 'Pull ops out of the spreadsheet. ERP-driven price lists, automated approvals, exception-only review.',  tag: 'Operations' },
  ];
  return (
    <section id="objectives" style={{ background: 'var(--uc-paper)', padding: '120px 0', borderTop: '1px solid var(--line-1)' }}>
      <div style={COL}>
        <BPEyebrow index={3} label="Four outcomes we're aiming at" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, marginBottom: 72 }}>
          <BPHeadline title="Where this lands." subtitle="Four measurable shifts. Owned, dated, and signed off." />
          <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--fg-2)', alignSelf: 'end' }}>
            Each outcome maps to one or more workstreams in the build,
            and to a KPI we'll define together at kickoff so we both know
            what "shipped" means.
          </p>
        </div>
        <div>
          {rows.map((r, i) => (
            <div key={r.n} style={{
              display: 'grid', gridTemplateColumns: '80px 1.6fr 2fr 160px',
              gap: 36, alignItems: 'baseline',
              padding: '36px 0',
              borderTop: '1px solid var(--line-1)',
              borderBottom: i === rows.length - 1 ? '1px solid var(--line-1)' : 'none',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
                color: 'var(--fg-3)', letterSpacing: '0.1em',
              }}>{r.n}</div>
              <h3 style={{
                fontFamily: 'var(--font-hero)', fontWeight: 700,
                fontSize: 'clamp(28px, 3vw, 44px)', lineHeight: 1.05,
                letterSpacing: '-0.03em', color: 'var(--fg-1)', margin: 0,
              }}>{r.t}</h3>
              <p style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                fontSize: 18, lineHeight: 1.45, color: 'var(--fg-2)', margin: 0,
              }}>{r.d}</p>
              <div style={{ justifySelf: 'end' }}><BPChip>{r.tag}</BPChip></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------- 05 · APPROACH -------------------------------- */
function BPApproach() {
  return (
    <section id="approach" style={{ background: 'var(--uc-black)', color: 'var(--uc-paper)', padding: '120px 0' }}>
      <div style={COL}>
        <BPEyebrow index={4} label="How we work" />
        <BPHeadline
          title="Three deep dives before code."
          subtitle="Operations first. Architecture second. Build last."
          onDark
        />
        <div style={{
          marginTop: 72,
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
          border: '1px solid var(--uc-stone-700)', borderRadius: 5, overflow: 'hidden',
        }}>
          {[
            { n: '01', t: 'Diagnose', d: 'Two weeks inside your ops. We map every system, integration, and manual workaround. Output: a system audit + risk register.' },
            { n: '02', t: 'Design',   d: 'One week designing the unified architecture. Data flow, identity, pricing logic, checkout, B2B portal. Output: the Blueprint document.' },
            { n: '03', t: 'Decide',   d: 'Half-day workshop with leadership. We walk through every trade-off, kill ambiguity, sign the build scope. Output: a green-lit kickoff.' },
          ].map((c, i) => (
            <div key={c.n} style={{
              padding: '40px 32px',
              borderLeft: i === 0 ? 'none' : '1px solid var(--uc-stone-700)',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.14em', color: 'var(--uc-signal)', marginBottom: 18,
              }}>PHASE {c.n}</div>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: 28, letterSpacing: '-0.025em',
                color: 'var(--uc-paper)', margin: '0 0 14px',
              }}>{c.t}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--uc-stone-300)', margin: 0 }}>{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------- 06 · SCOPE (two-column, 1-7) ----------------- */
function BPScope() {
  const layers = [
    { n: '01', t: 'Discovery & Strategy',  d: 'Stakeholder workshops, system inventory, KPI alignment, risk register.' },
    { n: '02', t: 'Experience Design',     d: 'Customer journeys, flow prototypes, IA, B2B + B2C UX patterns.' },
    { n: '03', t: 'Solution Architecture', d: 'Schema, identity, pricing logic, checkout topology, integration contracts.' },
    { n: '04', t: 'B2B Enablement',        d: 'Company accounts, role-based pricing, quote flow, approval rules, net-terms.' },
    { n: '05', t: 'ERP Integration',       d: 'Bidirectional sync for inventory, customers, orders, price lists, payments.' },
    { n: '06', t: 'Data Migration',        d: 'Field-level mapping, cleanup rules, SEO preservation, redirect plan.' },
    { n: '07', t: 'Launch Readiness',      d: 'QA matrix, performance budget, runbooks, team enablement, go-live plan.' },
  ];
  return (
    <section id="scope" style={{ background: 'var(--uc-cream)', padding: '120px 0' }}>
      <div style={COL}>
        <BPEyebrow index={5} label="What's in the build" />
        <BPHeadline title="Seven workstreams." subtitle="Stacked from strategy through launch. Every one priced into the flat." />
        <div style={{
          marginTop: 56,
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16,
        }}>
          {layers.map((l) => (
            <div key={l.n} className="bp-scope-card" style={{
              background: 'var(--uc-paper)', border: '1px solid var(--line-1)', borderRadius: 5,
              padding: '24px 28px',
              transition: 'border-color .18s var(--ease-out), transform .18s var(--ease-out), box-shadow .18s var(--ease-out)',
            }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '48px 1fr', gap: 16, alignItems: 'baseline',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                  color: 'var(--fg-3)', letterSpacing: '0.1em',
                }}>{l.n}</div>
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700,
                    fontSize: 22, letterSpacing: '-0.02em',
                    color: 'var(--fg-1)', margin: '0 0 6px',
                  }}>{l.t}</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--fg-2)', margin: 0 }}>{l.d}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 16, background: 'var(--uc-black)', color: 'var(--uc-paper)',
          borderRadius: 5, padding: '20px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
          }}>Platform · Shopify Plus</div>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16,
            color: 'var(--uc-signal)',
          }}>Foundation</div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------- 07 · COMMERCE / PERFORMANCE ------------------ */
function BPPerformance() {
  const groups = [
    {
      kpi: 'Search & Discovery',
      sub: 'Get the right product in front of the right buyer faster.',
      points: [
        { t: 'Information Architecture', d: 'Collections, facets, and category trees aligned to how your buyers actually shop.' },
        { t: 'Native Site Search',       d: 'Autocomplete, typo-tolerance, synonyms, and ranked merchandising.' },
        { t: 'Editorial Surfaces',       d: 'Curated rows, badges, and seasonal landings driven from the CMS.' },
      ],
    },
    {
      kpi: 'Optimized Order Value',
      sub: 'Lift AOV with the right offers at the right moment.',
      points: [
        { t: 'Smart Bundles',            d: 'Configurable kits with rule-based pricing and B2B account discounts.' },
        { t: 'Cross-Sell at Cart',       d: 'Threshold-aware nudges keyed on margin, inventory, and history.' },
        { t: 'Self-Serve Ordering Portal', d: 'Quick-order pads, saved lists, and CSV upload for repeat trade buyers.' },
      ],
    },
    {
      kpi: 'Elevated Conversion Rate',
      sub: 'Remove friction from every step of the checkout.',
      points: [
        { t: 'Robust Product Page',      d: 'Live inventory, lead times, and trust signals where buyers expect them.' },
        { t: 'One-Page Checkout',        d: 'Shop Pay, saved cards, address autofill, and Apple/Google Pay.' },
        { t: 'B2B Net-Terms Flow',       d: 'PO numbers, ship-to dictionaries, and approval thresholds — all native.' },
      ],
    },
    {
      kpi: 'Retention & Loyalty',
      sub: 'Turn the first order into the second, third, and tenth.',
      points: [
        { t: 'Quick Order & Subscription', d: 'One-click reorder, subscriptions, and saved templates synced with ERP.' },
        { t: 'Account Hub',              d: 'Order history, invoices, returns, and reorder — accessible in two clicks.' },
        { t: 'Lifecycle Triggers',       d: 'Klaviyo flows for replenishment, win-back, and post-purchase upsell.' },
      ],
    },
  ];
  return (
    <section id="performance" style={{ background: 'var(--uc-paper)', padding: '120px 0', borderTop: '1px solid var(--line-1)' }}>
      <div style={COL}>
        <BPEyebrow index={6} label="Commerce" />
        <BPHeadline title="Four levers we move." subtitle="Every site change traces back to one of them. No vanity surfaces." />
        <div style={{ marginTop: 64, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          {groups.map(g => (
            <div key={g.kpi} style={{
              border: '1px solid var(--uc-black)', borderRadius: 5, padding: 32,
              background: 'var(--uc-cream)',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: 22, letterSpacing: '-0.02em',
                color: 'var(--fg-1)', margin: '0 0 6px',
              }}>{g.kpi}</h3>
              <p style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                fontSize: 15, color: 'var(--fg-2)', margin: '0 0 24px', lineHeight: 1.4,
              }}>{g.sub}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {g.points.map(p => (
                  <div key={p.t} style={{
                    display: 'grid', gridTemplateColumns: '24px 1fr', gap: 12, alignItems: 'start',
                  }}>
                    <div style={{ paddingTop: 4 }}>
                      <span style={{
                        display: 'inline-block', width: 12, height: 12,
                        background: 'var(--uc-signal)', borderRadius: 2,
                      }} />
                    </div>
                    <div>
                      <div style={{
                        fontSize: 15, fontWeight: 600, color: 'var(--fg-1)',
                        lineHeight: 1.3, marginBottom: 4,
                        // Uniform: one-line title, two-line description.
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>{p.t}</div>
                      <div style={{
                        fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.5,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden', minHeight: 39,
                      }}>{p.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------- 08 · CONTENT --------------------------------- */
function BPContent() {
  return (
    <section id="content" style={{ background: 'var(--uc-cream)', padding: '120px 0' }}>
      <div style={COL}>
        <BPEyebrow index={7} label="Content & SEO" />
        <BPHeadline title="The traffic survives the move." subtitle="URL inventory, redirect map, canonical strategy, ranking-protection runbook." />
        <div style={{
          marginTop: 56,
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
        }}>
          {[
            { t: 'URL Inventory',  d: 'Every indexed URL mapped, scored, prioritized. Lossy patterns flagged before they ship.' },
            { t: 'Redirect Map',   d: '1:1 where possible, semantic where not. Multi-step chains collapsed to single hops.' },
            { t: 'Schema & Meta',  d: 'Product, Collection, FAQ, Breadcrumb. Open Graph + Twitter cards across every template.' },
          ].map(c => (
            <div key={c.t} style={{
              border: '1px solid var(--line-1)', background: 'var(--uc-paper)',
              borderRadius: 5, padding: 28,
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20,
                letterSpacing: '-0.015em', color: 'var(--fg-1)', margin: '0 0 12px',
              }}>{c.t}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--fg-2)', margin: 0 }}>{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------- 09 · TECH STACK ------------------------------ */
function BPTechStack() {
  const stack = [
    { layer: 'Storefront', items: ['Shopify Plus', 'Hydrogen (optional)', 'Liquid'] },
    { layer: 'Commerce',   items: ['Shop Pay', 'Apple Pay', 'Google Pay', 'Bolt'] },
    { layer: 'B2B',        items: ['B2B on Shopify', 'Shopify Functions', 'Net-terms via custom app'] },
    { layer: 'Content',    items: ['Sanity', 'Cloudinary'] },
    { layer: 'Search',     items: ['Native Search & Discovery', 'Algolia (where needed)'] },
    { layer: 'CRM/Email',  items: ['Klaviyo', 'Gorgias', 'Postscript'] },
    { layer: 'Data',       items: ['Snowflake', 'Segment', 'Looker'] },
    { layer: 'ERP',        items: ['NetSuite', 'Acumatica', 'Microsoft Dynamics'] },
  ];
  return (
    <section id="techstack" style={{ background: 'var(--uc-black)', color: 'var(--uc-paper)', padding: '120px 0' }}>
      <div style={COL}>
        <BPEyebrow index={8} label="Tech stack" />
        <BPHeadline
          title="The stack that finally works as one."
          subtitle="Tested, supported, swap-friendly. Nothing here without a reason."
          onDark
        />
        <div style={{
          marginTop: 56,
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16,
        }}>
          {stack.map(s => (
            <div key={s.layer} style={{
              border: '1px solid var(--uc-stone-700)', borderRadius: 5,
              padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'var(--uc-signal)',
              }}>{s.layer}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {s.items.map(it => (
                  <span key={it} style={{
                    padding: '6px 12px', borderRadius: 999,
                    background: 'rgba(255,255,255,0.08)', color: 'var(--uc-paper)',
                    fontSize: 13, fontWeight: 500,
                  }}>{it}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------- 10 · B2B ------------------------------------- */
function BPB2B() {
  return (
    <section id="b2b" style={{ background: 'var(--uc-paper)', padding: '120px 0' }}>
      <div style={COL}>
        <BPEyebrow index={9} label="B2B" />
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 64, alignItems: 'start' }}>
          <BPHeadline
            title="Wholesale that doesn't fork the codebase."
            subtitle="One storefront, two audiences, zero parallel maintenance."
          />
          <div>
            {[
              ['Company accounts', 'Multi-buyer per company, role-based access, shared cart history.'],
              ['Custom catalogs',  'Per-account price lists driven by your ERP customer tier.'],
              ['Quote-to-order',   'Quote requests, approvals, conversion to order — native to checkout.'],
              ['Net-terms checkout', 'Purchase orders, payment terms, custom shipping rules.'],
            ].map(([t, d]) => (
              <div key={t} style={{ padding: '18px 0', borderTop: '1px solid var(--line-1)' }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 4 }}>{t}</div>
                <div style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.55 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------- 11 · AGENTIC --------------------------------- */
function BPAgentic() {
  return (
    <section id="agentic" style={{ background: 'var(--uc-cream)', padding: '120px 0' }}>
      <div style={COL}>
        <BPEyebrow index={10} label="Agentic AI" />
        <BPHeadline
          title="The right AI in the right places."
          subtitle="Not a chatbot bolted on. Agents doing real work in the back office."
        />
        <div style={{
          marginTop: 56,
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16,
        }}>
          {[
            { t: 'Buyer Concierge',      d: 'Conversational product discovery for high-SKU catalogs. Handoff to sales on B2B intent.' },
            { t: 'Order Triage',         d: 'Auto-classify exception orders (oversold, address fail, payment failure) and route to the right human.' },
            { t: 'Reorder Coach',        d: 'Surface likely-next reorders based on cadence + inventory; one-click cart fill.' },
            { t: 'PIM Enrichment',       d: 'LLM-assisted attribute extraction from supplier sheets. Human approval before publish.' },
          ].map(c => (
            <div key={c.t} style={{
              border: '1px solid var(--line-1)', background: 'var(--uc-paper)',
              borderRadius: 5, padding: 28,
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22,
                letterSpacing: '-0.02em', color: 'var(--fg-1)', margin: '0 0 10px',
              }}>{c.t}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--fg-2)', margin: 0 }}>{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------- 12 · INTEGRATIONS ---------------------------- */
function BPIntegrations() {
  const rows = [
    ['Inventory',  'ERP → Shopify',  'Real-time push on stock adjustments, transfers, receipts.'],
    ['Orders',     'Shopify → ERP',  'Webhook on order paid; cancellation + refund sync back.'],
    ['Customers',  'Bidirectional',  'Match on email + ERP customer ID. Tier/price-list sync.'],
    ['Pricing',    'ERP → Shopify',  'B2B catalog price lists synced nightly + delta on change.'],
    ['Tax',        'Avalara / native', 'Real-time tax calc at checkout. Resale certificates on file.'],
    ['Payments',   'Stripe / Shop Pay', 'Card + ACH + net-terms. PCI scope minimized on Shopify.'],
  ];
  return (
    <section id="integrations" style={{ background: 'var(--uc-paper)', padding: '120px 0' }}>
      <div style={COL}>
        <BPEyebrow index={11} label="Integrations" />
        <BPHeadline title="Every wire accounted for." subtitle="No mystery sync jobs. No silent failures." />
        <div style={{
          marginTop: 56,
          border: '1px solid var(--uc-black)', borderRadius: 5, overflow: 'hidden',
        }}>
          {rows.map((r, i) => (
            <div key={r[0]} style={{
              display: 'grid', gridTemplateColumns: '180px 200px 1fr',
              gap: 24, padding: '20px 28px', alignItems: 'baseline',
              borderTop: i > 0 ? '1px solid var(--line-1)' : 'none',
              background: i % 2 ? 'var(--uc-cream)' : 'var(--uc-paper)',
            }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17,
                color: 'var(--fg-1)',
              }}>{r[0]}</div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-3)',
              }}>{r[1]}</div>
              <div style={{ fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.5 }}>{r[2]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------- 13 · MIGRATION ------------------------------- */
function BPMigration() {
  return (
    <section id="migration" style={{ background: 'var(--uc-cream)', padding: '120px 0' }}>
      <div style={COL}>
        <BPEyebrow index={12} label="Migration" />
        <BPHeadline title="The data, the URLs, the customers." subtitle="Migrated cleanly. Audited. Reconciled." />
        <div style={{
          marginTop: 56,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
          border: '1px solid var(--uc-black)', borderRadius: 5,
          background: 'var(--uc-paper)', overflow: 'hidden',
        }}>
          {[
            ['Products',     '~12K SKUs', 'Variants, options, metafields, media, taxonomy.'],
            ['Customers',    '~80K',      'B2C + B2B accounts, tier mapping, address books.'],
            ['Orders',       '~340K',     '3 years of history, statuses preserved, returns linked.'],
            ['Content',      '~120 pages', 'CMS migration with internal-link rewrite + media sync.'],
          ].map((c, i) => (
            <div key={c[0]} style={{
              padding: '24px 28px',
              borderLeft: i === 0 ? 'none' : '1px solid var(--line-1)',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--fg-3)', marginBottom: 6,
              }}>{c[0]}</div>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26,
                letterSpacing: '-0.025em', color: 'var(--fg-1)', marginBottom: 10,
              }}>{c[1]}</div>
              <div style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.45 }}>{c[2]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------- 14 · DELIVERY / GANTT ------------------------ */
function BPDelivery() {
  const lanes = [
    { name: 'Discovery & Strategy',  start: 1,  end: 3,  tone: 'paper' },
    { name: 'Experience Design',     start: 2,  end: 6,  tone: 'paper' },
    { name: 'Solution Architecture', start: 3,  end: 7,  tone: 'paper' },
    { name: 'B2B Enablement',        start: 5,  end: 12, tone: 'paper' },
    { name: 'ERP Integration',       start: 4,  end: 13, tone: 'paper' },
    { name: 'Data Migration',        start: 7,  end: 14, tone: 'paper' },
    { name: 'Launch Readiness',      start: 12, end: 16, tone: 'signal' },
  ];
  const weeks = 16;
  return (
    <section id="delivery" style={{ background: 'var(--uc-black)', color: 'var(--uc-paper)', padding: '120px 0' }}>
      <div style={COL}>
        <BPEyebrow index={13} label="Delivery" />
        <BPHeadline
          title="Sixteen weeks. End to end."
          subtitle="Visible from day one. Re-baselined every Friday."
          onDark
        />
        <div style={{
          marginTop: 56,
          border: '1px solid var(--uc-stone-700)', borderRadius: 5, overflow: 'hidden',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '200px repeat(16, 1fr)',
            gap: 0, padding: '14px 0',
            borderBottom: '1px solid var(--uc-stone-700)',
          }}>
            <div />
            {Array.from({ length: weeks }).map((_, i) => (
              <div key={i} style={{
                textAlign: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                letterSpacing: '0.1em', color: 'var(--uc-stone-500)',
              }}>W{i + 1}</div>
            ))}
          </div>
          {lanes.map((l, i) => (
            <div key={l.name} style={{
              display: 'grid', gridTemplateColumns: '200px repeat(16, 1fr)',
              gap: 0, padding: '14px 0', alignItems: 'center',
              borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <div style={{
                paddingLeft: 16,
                fontSize: 13, fontWeight: 500, color: 'var(--uc-paper)',
              }}>{l.name}</div>
              {Array.from({ length: weeks }).map((_, w) => {
                const inLane = w + 1 >= l.start && w + 1 <= l.end;
                const isStart = w + 1 === l.start;
                const isEnd = w + 1 === l.end;
                if (!inLane) return <div key={w} />;
                return (
                  <div key={w} style={{
                    height: 12,
                    margin: '0 1px',
                    background: l.tone === 'signal' ? 'var(--uc-signal)' : 'var(--uc-paper)',
                    borderTopLeftRadius: isStart ? 6 : 0,
                    borderBottomLeftRadius: isStart ? 6 : 0,
                    borderTopRightRadius: isEnd ? 6 : 0,
                    borderBottomRightRadius: isEnd ? 6 : 0,
                  }} />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------- 15 · INVESTMENT ------------------------------ */
function BPInvestment() {
  return (
    <section id="investment" style={{ background: 'var(--uc-cream)', padding: '120px 0' }}>
      <div style={COL}>
        <BPEyebrow index={14} label="Investment" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
          <div>
            <BPHeadline
              title="$7,000 flat."
              subtitle="Fully refundable if we're not a fit on the discovery call."
            />
            <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--fg-2)', maxWidth: 520, margin: '0 0 32px' }}>
              The Blueprint is a fixed-fee engagement. You leave with the
              full document, prototypes, architecture, and migration plan —
              whether you build it with us or not.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Stakeholder workshops (up to 4)',
                'Solution architecture + data model',
                'ERP integration spec, end-to-end',
                'UX flow prototypes (5 screens)',
                'SEO preservation roadmap',
                'Migration runbook + risk register',
              ].map(line => (
                <div key={line} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 4, background: 'var(--uc-black)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6.2L4.8 8.5L9.5 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span style={{ fontSize: 15, color: 'var(--fg-1)' }}>{line}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{
            border: '1px solid var(--uc-black)', borderRadius: 5,
            background: 'var(--uc-paper)', padding: 36,
            position: 'sticky', top: 88,
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--fg-3)', marginBottom: 12,
            }}>Total · One-time</div>
            <div style={{
              fontFamily: 'var(--font-hero)', fontWeight: 800,
              fontSize: 'clamp(56px, 7vw, 96px)', lineHeight: 1,
              letterSpacing: '-0.04em', color: 'var(--uc-black)', margin: '0 0 8px',
            }}>$7,000</div>
            <p style={{
              fontFamily: 'var(--font-serif)', fontStyle: 'italic',
              fontSize: 18, color: 'var(--fg-2)', margin: '0 0 28px',
            }}>Reserved with a $500 deposit. Balance on kickoff.</p>
            <a href="#talk" className="uc-btn b-signal" style={{ width: '100%', justifyContent: 'center', padding: '18px 24px', fontSize: 16 }}>
              Reserve your slot <span>→</span>
            </a>
            <div style={{
              marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--line-1)',
              display: 'flex', justifyContent: 'space-between',
              fontSize: 13, color: 'var(--fg-3)',
            }}>
              <span>Delivery</span>
              <span style={{ color: 'var(--fg-1)', fontWeight: 600 }}>4 weeks</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------- 16 · GROWTH ---------------------------------- */
function BPGrowth() {
  return (
    <section id="growth" style={{ background: 'var(--uc-paper)', padding: '120px 0' }}>
      <div style={COL}>
        <BPEyebrow index={15} label="After launch" />
        <BPHeadline title="Launch is the start, not the finish." subtitle="We stay engaged on what compounds." />
        <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { t: 'Conversion',      d: 'Tested weekly. Hypotheses prioritised on lift potential and confidence.' },
            { t: 'Order value',     d: 'Bundling, threshold incentives, upsell flow tuning. Margin-aware.' },
            { t: 'Automation & AI', d: 'New flows shipped quarterly. Triage agents tuned on real exception load.' },
          ].map(c => (
            <div key={c.t} style={{ border: '1px solid var(--line-1)', borderRadius: 5, padding: 28, background: 'var(--uc-cream)' }}>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20,
                letterSpacing: '-0.015em', color: 'var(--fg-1)', margin: '0 0 10px',
              }}>{c.t}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--fg-2)', margin: 0 }}>{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------- 17 · TEAM ------------------------------------ */
function BPTeam() {
  const team = [
    { n: 'Denis Dyli',     r: 'Managing Director',         tone: '#1f4cd6' },
    { n: 'Jo',             r: 'Solution Architect',        tone: '#0a6d4a' },
    { n: 'Michael',        r: 'Lead Developer',            tone: '#a3531f' },
    { n: 'Jack',           r: 'Experience Designer',       tone: '#5a3a8a' },
  ];
  return (
    <section id="team" style={{ background: 'var(--uc-cream)', padding: '120px 0' }}>
      <div style={COL}>
        <BPEyebrow index={16} label="Team on the work" />
        <BPHeadline title="The people you'll actually meet." subtitle="No bait-and-switch. Same names on the proposal, the kickoff, and the go-live." />
        <div style={{
          marginTop: 56,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
          border: '1px solid var(--uc-black)', borderRadius: 5,
          background: 'var(--uc-paper)', overflow: 'hidden',
        }}>
          {team.map((t, i) => (
            <div key={t.n} style={{
              padding: '28px 24px',
              borderLeft: i === 0 ? 'none' : '1px solid var(--line-1)',
            }}>
              <span style={{
                width: 44, height: 44, borderRadius: 999,
                background: t.tone, color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16,
                marginBottom: 18,
              }}>{t.n[0]}</span>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18,
                color: 'var(--fg-1)', marginBottom: 4,
              }}>{t.n}</div>
              <div style={{ fontSize: 13, color: 'var(--fg-3)', fontWeight: 500 }}>{t.r}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------- 18 · WHY UNCAP ------------------------------- */
function BPWhy() {
  const shopify = window.__resources?.shopifyBadge || '/assets/shopify-platinum-partner-black.svg';
  return (
    <section id="why" style={{ background: 'var(--uc-black)', color: 'var(--uc-paper)', padding: '120px 0' }}>
      <div style={COL}>
        <BPEyebrow index={17} label="Why uncap" />
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 80, alignItems: 'center' }}>
          <BPHeadline
            title="Built on Shopify since 2013."
            subtitle="380+ projects shipped. Operator-led, no agency theater."
            onDark
          />
          <img src={shopify} alt="Shopify Platinum Partner" style={{ height: 64, opacity: 0.95, justifySelf: 'end', filter: 'invert(1)' }} />
        </div>
        <div style={{
          marginTop: 64,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
          borderTop: '1px solid var(--uc-stone-700)', borderBottom: '1px solid var(--uc-stone-700)',
        }}>
          {[
            ['380+', 'Projects shipped'],
            ['12 yrs', 'On Shopify'],
            ['$1.4B', 'GMV processed'],
            ['38%', 'Avg. lower TCO'],
          ].map((s, i) => (
            <div key={s[0]} style={{
              padding: '36px 24px',
              borderLeft: i === 0 ? 'none' : '1px solid var(--uc-stone-700)',
            }}>
              <div style={{
                fontFamily: 'var(--font-hero)', fontWeight: 800,
                fontSize: 'clamp(40px, 4vw, 56px)', lineHeight: 1,
                letterSpacing: '-0.03em', color: 'var(--uc-paper)', marginBottom: 8,
              }}>{s[0]}</div>
              <div style={{ fontSize: 13, color: 'var(--uc-stone-300)', fontWeight: 500 }}>{s[1]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------- 19 · NEXT / CTA ------------------------------ */
function BPNext() {
  return (
    <section style={{ background: 'var(--uc-cream)', padding: '160px 0' }}>
      <div style={COL}>
        <div style={{ maxWidth: 880 }}>
          <BPEyebrow index={18} label="Next" />
          <h2 style={{
            fontFamily: 'var(--font-hero)', fontWeight: 800,
            fontSize: 'clamp(48px, 6vw, 88px)', lineHeight: 1.02,
            letterSpacing: '-0.035em', color: 'var(--uc-black)', margin: '0 0 28px',
            textWrap: 'balance',
          }}>
            Reserve your Blueprint.
            <br />
            <span style={{
              fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500,
              color: 'var(--fg-2)', fontSize: '0.62em',
            }}>$500 today. Fully refundable.</span>
          </h2>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 18, lineHeight: 1.55,
            color: 'var(--fg-2)', margin: '0 0 40px', maxWidth: 620,
          }}>
            One 30-minute discovery call. Either we're a fit and the
            engagement starts — or we're not, and the deposit comes back.
            No pitch deck. No B.S.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="https://go.uncap.com/build" className="uc-btn b-primary" style={{ padding: '18px 28px', fontSize: 16 }}>
              Start the Blueprint <span>→</span>
            </a>
            <a href="mailto:hay@uncap.com" className="uc-link" style={{ marginLeft: 8 }}>
              Or email us first <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

window.BPNav         = BPNav;
window.BPIntro       = BPIntro;
window.BPSummary     = BPSummary;
window.BPWhere       = BPWhere;
window.BPObjectives  = BPObjectives;
window.BPApproach    = BPApproach;
window.BPScope       = BPScope;
window.BPPerformance = BPPerformance;
window.BPContent     = BPContent;
window.BPTechStack   = BPTechStack;
window.BPB2B         = BPB2B;
window.BPAgentic     = BPAgentic;
window.BPIntegrations = BPIntegrations;
window.BPMigration   = BPMigration;
window.BPDelivery    = BPDelivery;
window.BPInvestment  = BPInvestment;
window.BPGrowth      = BPGrowth;
window.BPTeam        = BPTeam;
window.BPWhy         = BPWhy;
window.BPNext        = BPNext;
