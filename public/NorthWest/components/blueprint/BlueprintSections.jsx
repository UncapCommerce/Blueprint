// BlueprintSections.jsx — Proposal one-pager sections.
// Sticky left nav + scrollable sections. Cream / white / black rhythm,
// lime accent, mono labels, Inter + Fraunces + JetBrains Mono.

// ── Central brand (name + logo) — change window.__brand to rebrand everywhere ──
function brandName() { return (window.__brand && window.__brand.name) || 'The North West Company'; }
function brandHandle() { const b = window.__brand || {}; return b.handle || brandName().toLowerCase().replace(/[^a-z0-9]+/g, ''); }
function BrandMark({ fontSize = 11, color = 'var(--fg-1)', family = 'var(--font-display)', weight = 700, letterSpacing = '-0.01em', dotColor = 'var(--uc-brand)', height }) {
  const b = window.__brand || {};
  if (b.logoSrc) return <img src={b.logoSrc} alt={brandName()} style={{ height: height || Math.round(fontSize * 2.3), width: 'auto', display: 'block', objectFit: 'contain' }}/>;
  return <span style={{ fontFamily: family, fontWeight: weight, fontSize, letterSpacing, color }}>{brandName()}<span style={{ color: dotColor }}>.</span></span>;
}

// ── Section shell ─────────────────────────────────────────────────────────
function BPSection({ id, n, label, dark, paper, children, tail, grid, vec = 'bgVector1' }) {
  const bg = dark ? 'var(--uc-black)' : (paper ? 'var(--uc-paper)' : 'var(--uc-cream)');
  const fg = dark ? 'var(--uc-paper)' : 'var(--fg-1)';
  const line = dark ? '#1F1F1F' : 'var(--line-1)';
  return (
    <section id={id} data-bp-section={id} style={{
      background: bg, color: fg,
      borderTop: '1px solid ' + line,
      padding: 'clamp(56px, 8vw, 112px) clamp(32px, 5vw, 80px)',
      scrollMarginTop: 24,
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Brand vector texture — from work/about pages */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(10,10,10,0.04)',
        WebkitMaskImage: `url(${(window.__resources && window.__resources[vec]) || ''})`,
        maskImage: `url(${(window.__resources && window.__resources[vec]) || ''})`,
        WebkitMaskSize: 'cover', maskSize: 'cover',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center', maskPosition: 'center'
      }}/>
      {grid && (
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage:
            `linear-gradient(${dark ? 'rgba(255,255,255,0.05)' : 'rgba(10,10,10,0.05)'} 1px, transparent 1px),` +
            `linear-gradient(90deg, ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(10,10,10,0.05)'} 1px, transparent 1px)`,
          backgroundSize: '46px 46px',
          backgroundPosition: 'center top',
          WebkitMaskImage: 'linear-gradient(180deg, #000 0%, #000 60%, transparent 100%)',
          maskImage: 'linear-gradient(180deg, #000 0%, #000 60%, transparent 100%)'
        }}/>
      )}
      <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          marginBottom: 'clamp(28px, 4vw, 48px)',
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 0,
          color: dark ? 'var(--uc-stone-500)' : 'var(--fg-3)'
        }}>
          {/* lime tick accent — work/about signature */}
          <span aria-hidden="true" style={{ width: 16, height: 2, background: 'var(--uc-signal)' }}/>
          <span style={{ color: fg, fontWeight: 700 }}>{n}</span>
          <span style={{ width: 28, height: 1, background: line }}/>
          <span style={{
            fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: fg
          }}>{label}</span>
          {tail && (
            <>
              <span style={{ flex: 1, height: 1, background: line }}/>
              <span>{tail}</span>
            </>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

function BPHeadline({ children, dark, size = 'clamp(34px, 4.4vw, 68px)' }) {
  return (
    <h2 style={{
      margin: 0,
      fontFamily: 'var(--font-hero)', fontWeight: 700,
      fontSize: size, letterSpacing: '-0.04em', lineHeight: 0.98,
      color: dark ? 'var(--uc-paper)' : 'var(--fg-1)',
      textWrap: 'balance'
    }}>{children}</h2>
  );
}
function BPSerif({ children }) {
  return <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>{children}</span>;
}

// ── 00 INTRO ───────────────────────────────────────────────────────────────
function BPIntro() {
  const [r, setR] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setR(true), 80); return () => clearTimeout(t); }, []);
  // Valid-through, client lead, and company address come from the app
  // (surfaced on window.__bpExpiresAt / window.__bpCompany by the Gate),
  // with static fallbacks until they're set there.
  const bpExp = (typeof window !== 'undefined' && window.__bpExpiresAt) || '';
  const expMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(bpExp);
  const [expY, expM, expD] = expMatch ? [+expMatch[1], +expMatch[2], +expMatch[3]] : [2026, 9, 30];
  const validThrough = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][expM - 1] + ' ' + expD + ', ' + expY;
  const validDays = Math.max(0, Math.floor((Date.UTC(expY, expM - 1, expD, 23, 59, 59) - Date.now()) / 86400000));
  const validSub = validDays === 1 ? '1 day' : validDays + ' days';
  const bpCo = (typeof window !== 'undefined' && window.__bpCompany) || null;
  const leadName = (bpCo && bpCo.lead && bpCo.lead.name) || 'TBD';
  const leadSub = (bpCo && bpCo.lead && bpCo.lead.title) || 'Client Lead';
  const coName = (bpCo && bpCo.name) || 'The North West Company';
  const coAddr = (bpCo && bpCo.address) || '';
  return (
    <section id="intro" data-bp-section="intro" style={{
      background: 'var(--uc-black)',
      color: 'var(--uc-paper)',
      padding: 'clamp(48px, 6vw, 88px) clamp(32px, 5vw, 80px) clamp(56px, 7vw, 96px)',
      position: 'relative', overflow: 'hidden',
      minHeight: '78vh',
      display: 'flex', flexDirection: 'column',
      scrollMarginTop: 24
    }}>
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),' +
          'linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
        backgroundSize: '46px 46px',
        backgroundPosition: 'center top',
        WebkitMaskImage: 'linear-gradient(180deg, #000 0%, #000 55%, transparent 100%)',
        maskImage: 'linear-gradient(180deg, #000 0%, #000 55%, transparent 100%)'
      }}/>

      <div style={{ maxWidth: 1080, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
        {/* Spec line */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 24, paddingBottom: 22, borderBottom: '1px solid #1F1F1F',
          fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-stone-500)', letterSpacing: 0
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <img src={window.__resources.shopifyBadge} alt="Shopify Platinum Partner" style={{ height: 30, width: 'auto', display: 'block', filter: 'brightness(0) invert(1)' }}/>
          </span>
          <span>BLUEPRINT 023 · PREPARED SEPTEMBER 2026 · CONFIDENTIAL</span>
        </div>

        {/* Big title */}
        <div style={{ paddingTop: 'clamp(36px, 5vw, 64px)' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--uc-stone-500)',
            marginBottom: 18
          }}>Prepared for</div>
          <h1 style={{
            margin: 0,
            fontFamily: 'var(--font-hero)', fontWeight: 700,
            letterSpacing: '-0.05em', lineHeight: 0.86,
            color: 'var(--uc-paper)'
          }}>
            <span className={`uc-rise ${r ? 'in' : ''}`} style={{
              display: 'block', fontSize: 'clamp(56px, 9vw, 156px)'
            }}>{brandName()}&rsquo;s</span>
            <span className={`uc-rise ${r ? 'in' : ''}`} style={{
              display: 'block', fontSize: 'clamp(40px, 6vw, 104px)',
              fontFamily: 'var(--font-serif)', fontWeight: 400,
              letterSpacing: '-0.04em', transitionDelay: '90ms',
              color: 'var(--uc-stone-300)'
            }}>Uncap Blueprint.</span>
          </h1>
        </div>

        {/* Bottom row: callout + contacts */}
        <div style={{
          marginTop: 'clamp(40px, 6vw, 72px)',
          display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
          gap: 'clamp(32px, 5vw, 64px)', alignItems: 'end'
        }}>
          {/* Callout */}
          <div style={{
            padding: 'clamp(24px, 3vw, 36px)',
            background: '#0F0F0F', color: 'var(--uc-paper)',
            border: '1px solid #1F1F1F',
            borderRadius: 5, position: 'relative', overflow: 'hidden'
          }}>
            <span aria-hidden="true" style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: 3,
              background: 'var(--uc-signal)'
            }}/>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'var(--uc-signal)', marginBottom: 16
            }}>The callout</div>
            <div style={{
              fontFamily: 'var(--font-serif)', fontWeight: 400,
              fontSize: 'clamp(20px, 2.2vw, 32px)', lineHeight: 1.25,
              letterSpacing: '-0.015em', color: 'var(--uc-paper)', textWrap: 'pretty'
            }}>
              A plan to implement Shopify for {brandName()}&rsquo;s commerce operations, consolidate
              the tech stack, and build an exceptional experience for growth.
            </div>
          </div>

          {/* Contacts */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 0,
            borderTop: '1px solid #1F1F1F'
          }}>
            {[
              { k: 'Prepared by', v: 'Denis Dyli', s: 'CEO & Principal Architect' },
              { k: 'Client lead',  v: leadName,  s: leadSub },
              { k: 'Company', v: coName, s: coAddr },
              { k: 'Valid through', v: validThrough,    s: validSub }
            ].map((c, i) => (
              <div key={i} style={{
                padding: '14px 0', borderBottom: '1px solid #1F1F1F',
                display: 'grid', gridTemplateColumns: 'minmax(0, auto) minmax(0, 1fr)',
                gap: 16, alignItems: 'baseline'
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--uc-stone-500)',
                  whiteSpace: 'nowrap'
                }}>{c.k}</span>
                <span style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'block', fontFamily: 'var(--font-display)', fontWeight: 700,
                    fontSize: 15, letterSpacing: '-0.01em', color: 'var(--uc-paper)'
                  }}>{c.v}</span>
                  <span style={{
                    display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11,
                    color: 'var(--uc-stone-500)', marginTop: 2
                  }}>{c.s}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── 01 EXECUTIVE SUMMARY ────────────────────────────────────────────────────
function BPSummary() {
  return (
    <BPSection id="summary" n="01" label="Executive Summary" paper tail="TL;DR">
      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
        gap: 'clamp(32px, 5vw, 72px)', alignItems: 'start'
      }}>
        <BPHeadline>
          The short version,{' '}
          <BPSerif>before the detail.</BPSerif>
        </BPHeadline>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 'clamp(16px, 1.4vw, 20px)', lineHeight: 1.55, color: 'var(--fg-2)' }}>
            {brandName()} is running a capable operation on a stack that no longer keeps up.
            This blueprint lays out how we unify storefront, B2B, and back-office on
            Shopify — in a fixed scope, on a fixed timeline.
          </p>
          <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 'clamp(16px, 1.4vw, 20px)', lineHeight: 1.55, color: 'var(--fg-2)' }}>
            The result: one system, lower total cost of ownership, and a revenue engine
            your team can actually run.
          </p>
        </div>
      </div>

      {/* Headline numbers */}
      <div style={{
        marginTop: 'clamp(40px, 5vw, 64px)',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
        borderTop: '1px solid var(--line-1)', borderBottom: '1px solid var(--line-1)'
      }}>
        {[
          { v: '16 wk', l: 'Estimated timeline to launch on Shopify' },
          { v: 'Unified', l: 'B2C, B2B, POS on Shopify integrated with ERP' },
          { v: 'Speed', l: 'Sidekick-friendly system to self-manage your store' },
          { v: 'Growth', l: 'Experience optimized for conversion and retention' }
        ].map((s, i) => (
          <div key={i} style={{
            padding: 'clamp(24px, 3vw, 36px)',
            paddingLeft: i > 0 ? 'clamp(20px, 3vw, 36px)' : 0,
            borderLeft: i > 0 ? '1px solid var(--line-1)' : 'none',
            position: 'relative'
          }}>
            <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: i > 0 ? 'clamp(20px, 3vw, 36px)' : 0, width: 16, height: 2, background: 'var(--uc-signal)' }}/>
            <div style={{ fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(34px, 3.8vw, 60px)', letterSpacing: '-0.05em', lineHeight: 0.88, color: 'var(--fg-1)' }}>{s.v}</div>
            <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>{s.l}</div>
          </div>
        ))}
      </div>
    </BPSection>
  );
}

// ── 02 WHERE WE ARE ─────────────────────────────────────────────────────────
function BPWhereCell({ it, i }) {
  const [h, setH] = React.useState(false);
  const col2 = i % 2 === 1;
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        position: 'relative',
        padding: 'clamp(26px, 3.4vw, 48px) clamp(8px, 2vw, 40px) clamp(26px, 3.4vw, 44px)',
        paddingLeft: col2 ? 'clamp(24px, 3vw, 48px)' : 0,
        paddingRight: col2 ? 0 : 'clamp(24px, 3vw, 48px)',
        borderBottom: '1px solid var(--line-1)',
        borderLeft: col2 ? '1px solid var(--line-1)' : 'none',
        display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 1.8vw, 22px)'
      }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 14 }}>
        <span style={{
          fontFamily: 'var(--font-serif)', fontWeight: 400, fontStyle: 'italic',
          fontSize: 'clamp(34px, 4.2vw, 64px)', letterSpacing: '-0.03em', lineHeight: 0.9,
          color: h ? 'var(--fg-1)' : 'var(--uc-stone-300)', transition: 'color .3s var(--ease-out)'
        }}>{it.n}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>{it.tag}</span>
      </div>
      <div>
        <div style={{
          fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 'clamp(22px, 2.4vw, 34px)',
          letterSpacing: '-0.035em', lineHeight: 1.0, color: 'var(--fg-1)',
          transform: h ? 'translateX(6px)' : 'none', transition: 'transform .3s var(--ease-out)'
        }}>{it.t}</div>
        <div style={{ marginTop: 12, maxWidth: 380, fontFamily: 'var(--font-serif)', fontSize: 'clamp(14px, 1.2vw, 16px)', lineHeight: 1.5, color: 'var(--fg-2)', textWrap: 'pretty' }}>{it.d}</div>
      </div>
      {/* severity meter */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>Impact if ignored</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-error)' }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--uc-error)' }}/>{it.impact}
          </span>
        </div>
        <div style={{ position: 'relative', height: 3, background: 'var(--line-1)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: (h ? it.pct : Math.max(8, it.pct - 22)) + '%', background: 'var(--uc-error)', borderRadius: 999, transition: 'width .6s var(--ease-out)', boxShadow: h ? '0 0 10px -1px rgba(181,50,43,0.55)' : 'none' }}/>
        </div>
      </div>
    </div>
  );
}

function BPWhere() {
  const items = [
    { n: '01', t: 'No B2B ordering portal', tag: 'Commercial', impact: 'High', pct: 82, d: 'Commercial and institutional orders handled by phone and email — no self-serve reordering, quotes, or account visibility.' },
    { n: '02', t: 'Outdated experience', tag: 'Storefront', impact: 'High', pct: 82, d: 'Unfriendly shopping experience and no mobile optimization.' },
    { n: '03', t: 'No optionality', tag: 'Systems', impact: 'Critical', pct: 94, d: 'Lack of ability to integrate and plug and play with modern advanced commerce tools and solutions.' },
    { n: '04', t: 'Zero agentic optimisation', tag: 'AI', impact: 'High', pct: 78, d: 'No in-site technical components and integrations with AI discovery platforms.' }
  ];
  return (
    <BPSection id="where" n="02" label="Today" tail="CURRENT STATE">
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 'clamp(28px, 5vw, 80px)', alignItems: 'end' }}>
        <BPHeadline size="clamp(40px, 6vw, 96px)">
          Today&rsquo;s stack,{' '}
          <BPSerif>honestly assessed.</BPSerif>
        </BPHeadline>
        <p style={{ margin: 0, maxWidth: 380, fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)', lineHeight: 1.5, color: 'var(--fg-2)', textWrap: 'pretty' }}>
          Four gaps are quietly capping growth. None are unusual for a business this size &mdash; and every one is fixable on Shopify.
        </p>
      </div>

      <div style={{ marginTop: 'clamp(30px, 4vw, 56px)', borderTop: '1px solid var(--line-1)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {items.map((it, i) => <BPWhereCell key={it.n} it={it} i={i}/>)}
      </div>
    </BPSection>
  );
}

// ── 03 OBJECTIVES ───────────────────────────────────────────────────────────
function BPObjectives() {
  const items = [
    { n: '01', t: 'Seamless implementation', d: 'Implement Shopify without losing what works — while optimizing for growth.', metric: 'Zero',   unit: 'disruption',       tag: 'Implementation' },
    { n: '02', t: 'Unify commerce',   d: 'One platform for storefront, B2B, and back-office. No reconciling.',           metric: 'One',    unit: 'system of record', tag: 'Revenue' },
    { n: '03', t: 'Low cost of ownership', d: 'Fewer tools, one partner. Retire the legacy stack and its renewals.',          metric: 'Lower',  unit: 'total cost',       tag: 'Finance' },
    { n: '04', t: 'Growth-ready foundation', d: 'Conversion, AOV, retention — engineered in, not bolted on.',                  metric: 'Higher', unit: 'AOV + LTV',        tag: 'Growth' },
    { n: '05', t: 'Free the team',         d: 'Automate the robot work. Let people do the work that grows the business.',     metric: 'Faster', unit: 'daily ops',        tag: 'Operations' }
  ];
  return (
    <BPSection id="objectives" n="03" label="Objectives" paper tail="WHAT SUCCESS LOOKS LIKE">
      {/* Mega headline + intro — Disciplines two-column header */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        gap: 'clamp(28px, 5vw, 80px)', alignItems: 'end'
      }}>
        <BPHeadline size="clamp(40px, 6vw, 96px)">
          Five outcomes{' '}
          <BPSerif>we&rsquo;re aiming at.</BPSerif>
        </BPHeadline>
        <p style={{
          margin: 0, maxWidth: 380,
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)',
          lineHeight: 1.5, color: 'var(--fg-2)', textWrap: 'pretty'
        }}>
          Every decision in this build ladders up to one of five outcomes. This is the
          scoreboard we&rsquo;ll measure the work against.
        </p>
      </div>

      {/* Outcome ladder */}
      <div style={{
        marginTop: 'clamp(32px, 4vw, 56px)',
        display: 'flex', flexDirection: 'column',
        borderTop: '1px solid var(--line-1)'
      }}>
        {items.map(it => <BPLadderRow key={it.n} it={it}/>)}
      </div>
    </BPSection>
  );
}

// ── 04 RECOMMENDED APPROACH ────────────────────────────────────────────────
function BPApproach() {
  const steps = [
    { n: 'Phase 1', t: 'Blueprint', d: 'Architecture, data model, integration map. A plan that holds up under scrutiny.', wk: '2 weeks' },
    { n: 'Phase 2', t: 'Build', d: 'Storefront, B2B, ERP sync. Fixed scope, senior team, no surprises.', wk: 'Weeks 16+' },
    { n: 'Phase 3', t: 'Grow', d: 'Migrate, go live, then optimize conversion, AOV, and automation.', wk: 'Months 6–12' }
  ];
  return (
    <BPSection id="approach" n="04" label="Recommended Approach" dark tail="THE PLAN">
      <BPHeadline dark>
        Three phases.{' '}
        <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--uc-stone-300)' }}>One straight line.</span>
      </BPHeadline>
      <div style={{
        marginTop: 'clamp(32px, 4vw, 56px)',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, position: 'relative'
      }}>
        <div aria-hidden="true" style={{ position: 'absolute', left: '8%', right: '8%', top: 40, height: 1, background: '#2B2B2B' }}/>
        {steps.map((s, i) => (
          <div key={i} style={{
            background: '#0F0F0F', border: '1px solid #1F1F1F', borderRadius: 5,
            padding: 'clamp(22px, 2.6vw, 30px)', display: 'flex', flexDirection: 'column', gap: 14,
            position: 'relative', zIndex: 1
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--uc-signal)' }}>{s.n}</span>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--uc-signal)' }}/>
            </div>
            <div style={{ fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 'clamp(26px, 2.8vw, 40px)', letterSpacing: '-0.035em', color: 'var(--uc-paper)' }}>{s.t}</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14.5, lineHeight: 1.5, color: 'var(--uc-stone-300)' }}>{s.d}</div>
            <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid #1F1F1F', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-stone-500)' }}>{s.wk}</div>
          </div>
        ))}
      </div>
    </BPSection>
  );
}

// ── Practice-ladder row, matching the Work page "Disciplines" section. ──────
function BPLadderRow({ it }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: 'clamp(22px, 2.4vw, 30px) 14px',
        margin: '0 -14px',
        borderBottom: '1px solid var(--line-1)',
        color: 'var(--fg-1)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 52px) minmax(0, 2fr) minmax(0, 1.1fr) minmax(0, auto)',
        gap: 'clamp(16px, 2vw, 32px)', alignItems: 'center',
        position: 'relative',
        background: hover ? 'rgba(10,10,10,0.045)' : 'transparent',
        transition: 'background .2s var(--ease-out)'
      }}>
      {/* Lime accent bar — base tick at top, grows full-height on hover */}
      <span aria-hidden="true" style={{
        position: 'absolute', top: 0, left: 0,
        width: hover ? 3 : 18,
        height: hover ? '100%' : 2,
        background: 'var(--uc-signal)',
        transition: 'width .25s var(--ease-out), height .35s var(--ease-out)'
      }}/>

      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 13,
        color: hover ? 'var(--fg-1)' : 'var(--fg-3)',
        transition: 'color .15s var(--ease-out)'
      }}>{it.n}</span>

      <span style={{
        fontFamily: 'var(--font-hero)', fontWeight: 700,
        fontSize: 'clamp(26px, 3vw, 48px)',
        letterSpacing: '-0.035em', lineHeight: 1.0,
        color: 'var(--fg-1)',
        transform: hover ? 'translateX(6px)' : 'none',
        transition: 'transform .25s var(--ease-out)'
      }}>{it.t}</span>

      <span style={{
        fontFamily: 'var(--font-serif)', fontSize: 14,
        color: 'var(--fg-2)', lineHeight: 1.45, textWrap: 'pretty'
      }}>{it.d}</span>

      <span style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'flex-end'
      }}>
        {it.tag && (
          <span style={{
            padding: '4px 9px',
            background: hover ? 'var(--uc-signal)' : 'var(--uc-bone)',
            border: '1px solid ' + (hover ? 'var(--uc-signal)' : 'var(--line-1)'),
            borderRadius: 3,
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--fg-1)', whiteSpace: 'nowrap',
            transition: 'background .2s var(--ease-out), border-color .2s var(--ease-out)'
          }}>{it.tag}</span>
        )}
      </span>
    </div>
  );
}

// One layer in the build "stack".
function BPBuildLayer({ L }) {
  const [hover, setHover] = React.useState(false);
  const base = L.kind === 'base';
  const fg = base ? 'var(--uc-paper)' : 'var(--fg-1)';
  const sub = base ? 'var(--uc-stone-300)' : 'var(--fg-2)';
  const faint = base ? 'var(--uc-stone-500)' : 'var(--fg-3)';
  const edge = base ? 'var(--uc-black)' : 'var(--line-2)';
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        gridColumn: base ? '1 / -1' : 'auto',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 44px) minmax(0, 1fr)',
        gap: 'clamp(12px, 1.4vw, 20px)', alignItems: 'center',
        padding: 'clamp(18px, 2vw, 24px) clamp(20px, 2.2vw, 28px)',
        background: base ? 'var(--uc-black)' : 'var(--uc-paper)',
        color: fg,
        border: '1px solid ' + edge,
        borderRadius: 6,
        transform: hover ? 'translateX(4px)' : 'none',
        transition: 'transform .22s var(--ease-out)'
      }}>
      {/* lime structural tick on the left edge */}
      <span aria-hidden="true" style={{
        position: 'absolute', left: -1, top: 10, bottom: 10, width: 3,
        borderRadius: 3, background: 'var(--uc-signal)',
        transform: hover ? 'scaleY(1)' : 'scaleY(0.4)',
        transformOrigin: 'center',
        transition: 'transform .25s var(--ease-out)'
      }}/>

      {/* layer code */}
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700,
        color: base ? 'var(--uc-signal)' : 'var(--fg-3)'
      }}>{L.code}</span>

      {/* name + brief */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        <span style={{
          fontFamily: 'var(--font-hero)', fontWeight: 700,
          fontSize: 'clamp(21px, 2.2vw, 30px)', letterSpacing: '-0.03em',
          lineHeight: 1.0, color: fg
        }}>{L.t}</span>
        <span style={{
          fontFamily: 'var(--font-serif)', fontSize: 14, lineHeight: 1.45,
          color: sub, textWrap: 'pretty',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', minHeight: '2.9em'
        }}>{L.d}</span>
      </div>
    </div>
  );
}

function BPScope() {
  const layers = [
    { code: '01', t: 'Commerce Strategy', d: 'Strategy, R&D, optimisation, and a plan the board can trust.' },
    { code: '02', t: 'Experience Design', d: 'A modern, conversion-focused storefront, built to scale.' },
    { code: '03', t: 'Solution Architecture', d: 'Solution architecture, roadmap and integration.' },
    { code: '04', t: 'B2B Enablement',    d: 'Catalogs, pricing tiers, NET terms, and account portals.' },
    { code: '05', t: 'System Integration',   d: 'Bidirectional, real-time sync native to Shopify Plus.' },
    { code: '06', t: 'Data Migration',    d: 'Products, customers, order history, and SEO redirects.' },
    { code: '07', t: 'Launch & Hypercare Support',  d: 'QA, a go-live runbook, and 30-day post-launch care.', kind: 'base' }
  ];
  return (
    <BPSection id="scope" n="05" label="Scope of Work" tail="THE SYSTEM">
      <div style={{ maxWidth: 720 }}>
        <BPHeadline>
          What&rsquo;s in{' '}
          <BPSerif>the build.</BPSerif>
        </BPHeadline>
        <p style={{
          marginTop: 'clamp(18px, 2.2vw, 26px)', maxWidth: 600,
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)',
          lineHeight: 1.55, color: 'var(--fg-2)', textWrap: 'pretty'
        }}>
          Seven workstreams, stacked into one Shopify Plus system — from the storefront
          down to the platform it ships on.
        </p>
      </div>

      {/* The build, drawn as a stack */}
      <div style={{
        marginTop: 'clamp(30px, 4vw, 52px)',
        display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10
      }}>
        {layers.map(L => <BPBuildLayer key={L.code} L={L}/>)}
      </div>
    </BPSection>
  );
}

// ── 06 DELIVERY ─────────────────────────────────────────────────────────────
const BP_GRID = 'minmax(0, 32px) minmax(0, 244px) minmax(0, 1fr) minmax(0, 58px)';
const BP_WEEKS = 16;
const BP_GAP = 'clamp(12px, 1.6vw, 22px)';
// faint week gridlines across the chart column
const BP_GRIDLINES = 'repeating-linear-gradient(90deg, var(--line-1) 0, var(--line-1) 1px, transparent 1px, transparent calc(100% / ' + BP_WEEKS + '))';

function BPGanttRow({ task }) {
  const [h, setH] = React.useState(false);
  const left = ((task.s - 1) / BP_WEEKS) * 100;
  const width = ((task.e - task.s + 1) / BP_WEEKS) * 100;
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: 'grid', gridTemplateColumns: BP_GRID, gap: BP_GAP, alignItems: 'center',
        padding: 'clamp(11px, 1.3vw, 16px) 0', borderTop: '1px solid var(--line-1)', position: 'relative'
      }}>
      {/* hover lime edge */}
      <span aria-hidden="true" style={{
        position: 'absolute', left: -16, top: -1, height: 'calc(100% + 1px)', width: 2,
        background: 'var(--uc-signal)', transform: h ? 'scaleY(1)' : 'scaleY(0)', transformOrigin: 'top',
        transition: 'transform .25s var(--ease-out)'
      }}/>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>{task.n}</span>
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{
          fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 'clamp(14px, 1.3vw, 18px)',
          letterSpacing: '-0.025em', color: 'var(--fg-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>{task.t}</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--fg-3)'
        }}>{task.tag}</span>
      </div>
      {/* chart cell */}
      <div style={{ position: 'relative', height: 22, backgroundImage: BP_GRIDLINES }}>
        <div style={{
          position: 'absolute', top: '50%', transform: 'translateY(-50%)',
          left: left + '%', width: width + '%', height: 14, borderRadius: 4,
          background: 'var(--uc-black)', overflow: 'hidden',
          boxShadow: h ? '0 0 0 2px var(--uc-signal)' : 'none', transition: 'box-shadow .2s var(--ease-out)'
        }}>
          <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'var(--uc-signal)' }}/>
        </div>
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', textAlign: 'right', whiteSpace: 'nowrap' }}>{task.range}</span>
    </div>
  );
}

function BPGantt() {
  const groups = [
    { name: 'Foundation', range: 'WK 01–06', tasks: [
      { n: '01', t: 'Onboarding & Kickoff',       tag: 'Setup',    s: 1, e: 2,  range: 'W1–2' },
      { n: '02', t: 'Deep Dive Workshops',        tag: 'Strategy · Solutions · Design',   s: 1, e: 3,  range: 'W1–3' },
      { n: '03', t: 'Experience Design',  tag: 'UX/UI Design · Web · Mobile',   s: 2, e: 5,  range: 'W2–5' },
      { n: '04', t: 'Approval',                   tag: 'Tech Stack Review & Design Sign-off', s: 5, e: 6,  range: 'W5–6' }
    ] },
    { name: 'Production', range: 'WK 06–14', tasks: [
      { n: '05', t: 'Development',                tag: 'Build',    s: 6,  e: 12, range: 'W6–12' },
      { n: '06', t: 'Data Migration',             tag: 'Migrate',  s: 9,  e: 12, range: 'W9–12' },
      { n: '07', t: 'Integration',                tag: 'Connect',  s: 9,  e: 13, range: 'W9–13' },
      { n: '08', t: 'QA & Testing',               tag: 'Verify',   s: 12, e: 14, range: 'W12–14' }
    ] },
    { name: 'Audit', range: 'WK 14–16', tasks: [
      { n: '09', t: 'Client UAT',                 tag: 'Go-live',  s: 14, e: 16, range: 'W14–16' }
    ] }
  ];
  return (
    <div style={{ marginTop: 'clamp(32px, 4vw, 48px)' }}>
      {/* week scale aligned over chart column */}
      <div style={{ display: 'grid', gridTemplateColumns: BP_GRID, gap: BP_GAP, alignItems: 'center', paddingBottom: 9 }}>
        <span/>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>Workstream</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 1px' }}>
          {Array.from({ length: BP_WEEKS }).map((_, i) => (
            <span key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--fg-3)', opacity: (i % 2 === 0) ? 0.9 : 0.4 }}>{String(i + 1).padStart(2, '0')}</span>
          ))}
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)', textAlign: 'right' }}>Span</span>
      </div>

      {groups.map((g, gi) => (
        <div key={g.name} style={{ marginTop: gi === 0 ? 0 : 'clamp(16px, 1.8vw, 26px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 4 }}>
            <span aria-hidden="true" style={{ width: 16, height: 2, background: 'var(--uc-signal)', flexShrink: 0 }}/>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(13px, 1.2vw, 16px)', letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--fg-1)', whiteSpace: 'nowrap' }}>{g.name}</span>
            <span style={{ flex: 1, height: 1, background: 'var(--line-1)' }}/>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--fg-3)', whiteSpace: 'nowrap' }}>{g.range}</span>
          </div>
          {g.tasks.map(task => <BPGanttRow key={task.n} task={task}/>)}
        </div>
      ))}

      <div style={{
        marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--line-2)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)'
      }}>
        <span>WK 01 → WK 16 · ~4 Months</span>
        <span>Overlapping phases · single team</span>
      </div>
    </div>
  );
}

// ── 06 PERFORMANCE DESIGN ───────────────────────────────────────────────────
// Mini faux-UI graphics for each KPI group.
function GfxChrome({ children }) {
  return (
    <div style={{ background: 'var(--uc-paper)', border: '1px solid var(--line-1)', borderRadius: 5, overflow: 'hidden' }}>
      <div style={{ background:'var(--nw-green-deep)', color:'var(--uc-paper)', textAlign:'center', padding:'4px 0', fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, letterSpacing:'0.12em' }}>FREE PICKUP AT YOUR COMMUNITY STORE · COMMERCIAL PRICING</div>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 14px', borderBottom:'1px solid var(--line-1)' }}>
        <BrandMark fontSize={12}/>
        <div style={{ display:'flex', gap:11, marginLeft:6 }}>{['Grocery','Apparel','Home','Outdoor'].map((x,i)=>(<span key={x} style={{ fontFamily:'var(--font-mono)', fontSize:8.5, fontWeight:700, letterSpacing:'0.04em', color:i===0?'var(--fg-1)':'var(--fg-3)' }}>{x}</span>))}</div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--fg-3)' }}>Search…</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:8, fontWeight:700, color:'var(--uc-paper)', background:'var(--nw-green)', padding:'3px 8px', borderRadius:3 }}>Cart 2</span>
        </div>
      </div>
      {children}
    </div>
  );
}
function GfxMegaNav() {
  const cols = [
    { h: 'Grocery', items: ['Pantry staples','Fresh & frozen','Baby & family','Sealift orders'] },
    { h: 'Apparel', items: ['Parkas & outerwear','Winter boots','Kids','Workwear'] },
    { h: 'Home & Outdoor', items: ['Appliances','Housewares','Snowmobile & ATV parts','Hunting & fishing'] },
    { h: 'Featured', items: ['Weekly Flyer','Commercial Sales','Special Order Desk'] }
  ];
  return (
    <GfxChrome>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:1, background:'var(--line-1)' }}>
        {cols.map((c,ci)=>(
          <div key={ci} style={{ background:'var(--uc-paper)', padding:'12px 13px 16px', display:'flex', flexDirection:'column', gap:7 }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:8, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color: ci===3?'var(--uc-black)':'var(--fg-3)' }}>{c.h}</div>
            {c.items.map((it,ri)=>(<span key={ri} style={{ fontFamily:'var(--font-display)', fontWeight:ci===3&&ri===0?700:500, fontSize:10.5, letterSpacing:'-0.01em', color: ci===0&&ri===0?'var(--uc-black)':'var(--fg-2)', display:'flex', alignItems:'center', gap:5 }}>{ci===0&&ri===0 && <span style={{ width:14, height:3, background:'var(--nw-green)' }}/>}{it}</span>))}
          </div>
        ))}
      </div>
    </GfxChrome>
  );
}
function GfxCollection() {
  const prods = [
    ['Arctic Down Parka','$349.00','−40°C','#3B5B6E','BEST','4.8','212'],
    ['Insulated Bibs','$149.00','Unisex','#4A4F57',null,'4.6','158'],
    ['Winter Boots −40°','$189.00','Sizes 6–14','#6B4E3D','NEW','4.9','64'],
    ['Fleece Base Layer','$44.99','Set','#7C8B7A',null,'4.7','309'],
    ['Kids Snowsuit','$129.00','2T–12','#B0554A','SALE','4.9','47'],
    ['Wool Mitts','$24.99','Pair','#9A938A',null,'4.5','521']
  ];
  const facets = [
    { h: 'Department', items: [['Apparel', true],['Outdoor', true],['Grocery', false],['Home', false],['Pharmacy', false]] },
    { h: 'Fulfilment', items: [['Store pickup', true],['Air freight', false],['Sealift', false]] },
    { h: 'Availability', items: [['In stock', true],['Ships today', false],['Special order', false]] }
  ];
  return (
    <div style={{ background:'var(--uc-paper)', border:'1px solid var(--line-1)', borderRadius:5, overflow:'hidden' }}>
      {/* chrome */}
      <div style={{ background:'var(--nw-green-deep)', color:'var(--uc-paper)', textAlign:'center', padding:'4px 0', fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, letterSpacing:'0.12em' }}>FREE PICKUP AT YOUR COMMUNITY STORE · COMMERCIAL PRICING</div>
      <div style={{ display:'flex', alignItems:'center', gap:11, padding:'8px 14px', borderBottom:'1px solid var(--line-1)' }}>
        
        <BrandMark fontSize={11}/>
        <div style={{ display:'flex', gap:9, marginLeft:4 }}>{['Grocery','Apparel','Home','Outdoor'].map((x,i)=>(<span key={x} style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, color:i===1?'var(--fg-1)':'var(--fg-3)' }}>{x}</span>))}</div>
        <span style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:7 }}>
          <span style={{ width:110, height:18, borderRadius:999, border:'1px solid var(--line-2)', display:'flex', alignItems:'center', gap:4, padding:'0 9px', fontFamily:'var(--font-mono)', fontSize:7, color:'var(--fg-3)', whiteSpace:'nowrap', overflow:'hidden' }}><span style={{ fontSize:8 }}>⌕</span>Search products…</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, color:'var(--uc-paper)', background:'var(--nw-green)', padding:'3px 8px', borderRadius:3 }}>Cart 0</span>
        </span>
      </div>

      {/* breadcrumb + title + sort */}
      <div style={{ padding:'11px 14px 9px', display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:10 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:7, letterSpacing:'0.1em', color:'var(--fg-3)' }}>HOME / APPAREL / WINTER OUTERWEAR</span>
          <span style={{ fontFamily:'var(--font-hero)', fontWeight:700, fontSize:19, letterSpacing:'-0.035em', color:'var(--fg-1)' }}>Winter Outerwear</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:7, color:'var(--fg-3)' }}>1,284 results</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, color:'var(--fg-1)', border:'1px solid var(--line-2)', borderRadius:3, padding:'3px 7px' }}>Sort: Best ▾</span>
        </div>
      </div>

      {/* applied filter chips */}
      <div style={{ padding:'0 14px 10px', display:'flex', gap:5, flexWrap:'wrap', alignItems:'center' }}>
        {['Apparel ✕','Outdoor ✕','In stock ✕'].map((c,i)=>(<span key={i} style={{ fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, color:'var(--fg-1)', background:'var(--uc-bone)', border:'1px solid var(--line-2)', borderRadius:999, padding:'2px 8px' }}>{c}</span>))}
        <span style={{ fontFamily:'var(--font-mono)', fontSize:7, color:'var(--nw-green)', fontWeight:700 }}>Clear all</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'104px 1fr', borderTop:'1px solid var(--line-1)' }}>
        {/* faceted sidebar */}
        <div style={{ borderRight:'1px solid var(--line-1)', background:'var(--uc-bone)', padding:'11px 10px', display:'flex', flexDirection:'column', gap:11 }}>
          {facets.map((f,fi)=>(
            <div key={fi} style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, letterSpacing:'0.1em', color:'var(--fg-3)' }}>{f.h.toUpperCase()}</div>
              {f.items.map(([l,on],i)=>(<div key={i} style={{ display:'flex', gap:6, alignItems:'center' }}><span style={{ width:9,height:9,borderRadius:2, background:on?'var(--nw-green)':'var(--uc-paper)', border:'1px solid var(--line-2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{on && <svg width="6" height="6" viewBox="0 0 12 12" fill="none"><path d="M2 6 L5 9 L10 3" stroke="var(--uc-paper)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}</span><span style={{ fontFamily:'var(--font-mono)', fontSize:7.5, color:on?'var(--fg-1)':'var(--fg-3)', fontWeight:on?700:400 }}>{l}</span></div>))}
            </div>
          ))}
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, letterSpacing:'0.1em', color:'var(--fg-3)' }}>PRICE</div>
            <div style={{ height:3, background:'var(--line-1)', borderRadius:2, position:'relative' }}><span style={{ position:'absolute', left:'15%', right:'35%', top:0, bottom:0, background:'var(--nw-green)', borderRadius:2 }}/><span style={{ position:'absolute', left:'15%', top:'50%', transform:'translate(-50%,-50%)', width:7, height:7, borderRadius:999, background:'var(--uc-paper)', border:'1.5px solid var(--nw-green)' }}/><span style={{ position:'absolute', left:'65%', top:'50%', transform:'translate(-50%,-50%)', width:7, height:7, borderRadius:999, background:'var(--uc-paper)', border:'1.5px solid var(--nw-green)' }}/></div>
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:6.5, color:'var(--fg-3)' }}><span>$20</span><span>$400</span></div>
          </div>
        </div>

        {/* product grid */}
        <div style={{ padding:10, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8 }}>
          {prods.map((p,i)=>(
            <div key={i} style={{ border:'1px solid var(--line-1)', borderRadius:3, padding:6, display:'flex', flexDirection:'column', gap:4, background:'var(--uc-paper)' }}>
              <div style={{ aspectRatio:'1/1', background:`linear-gradient(140deg, ${p[3]}, var(--uc-bone))`, borderRadius:2, position:'relative' }}>
                {p[4] && <span style={{ position:'absolute', top:4, left:4, padding:'1px 5px', background:p[4]==='NEW'?'var(--nw-green)':(p[4]==='SALE'?'var(--nw-green-mid)':'var(--nw-green-deep)'), color:'#fff', borderRadius:2, fontFamily:'var(--font-mono)', fontSize:5.5, fontWeight:800 }}>{p[4]}</span>}
                <span style={{ position:'absolute', bottom:4, right:4, width:15, height:15, borderRadius:999, background:'var(--uc-paper)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'var(--fg-1)', boxShadow:'0 1px 3px rgba(0,0,0,0.18)' }}>＋</span>
              </div>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:8.5, letterSpacing:'-0.01em', color:'var(--fg-1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p[0]}</span>
              <div style={{ display:'flex', alignItems:'center', gap:3 }}><span style={{ fontFamily:'var(--font-mono)', fontSize:6, color:'var(--nw-green)' }}>★★★★★</span><span style={{ fontFamily:'var(--font-mono)', fontSize:6, color:'var(--fg-3)' }}>{p[5]} ({p[6]})</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}><span style={{ fontFamily:'var(--font-mono)', fontSize:9, fontWeight:700, color:'var(--fg-1)' }}>{p[1]}</span><span style={{ fontFamily:'var(--font-mono)', fontSize:6, color:'var(--fg-3)' }}>{p[2]}</span></div>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:6, fontWeight:700, color:'var(--nw-green-mid)' }}>Commercial price ✓</span>
            </div>
          ))}
        </div>
      </div>

      {/* pagination */}
      <div style={{ padding:'9px 14px', borderTop:'1px solid var(--line-1)', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
        {['‹','1','2','3','…','42','›'].map((n,i)=>(<span key={i} style={{ minWidth:15, textAlign:'center', fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, color:n==='1'?'var(--uc-paper)':'var(--fg-2)', background:n==='1'?'var(--nw-green)':'transparent', borderRadius:2, padding:'2px 4px' }}>{n}</span>))}
      </div>
    </div>
  );
}
function GfxCart() {
  const lines=[['All-Purpose Flour · 10 kg','24','$22.49','$540'],['Evaporated Milk · 12-pk','12','$26.99','$324'],['Diapers Size 4 · 104 ct','10','$49.99','$500']];
  const grid=[['All-Purpose Flour 10 kg','$24.99','#C9B79C','BULK'],['Evaporated Milk 12-pk','$28.49','#B8C4CC',null],['Rolled Oats 2 kg','$8.99','#C2A878','NEW'],['Canned Ham 340 g','$6.49','#B0554A',null],['White Rice 8 kg','$21.99','#D8D2C4',null],['Peanut Butter 2 kg','$12.99','#9C7A4A',null]];
  return (
    <div style={{ position:'relative', background:'var(--uc-paper)', border:'1px solid var(--line-1)', borderRadius:5, overflow:'hidden' }}>
      {/* Full CATEGORY page behind */}
      <div>
        <div style={{ background:'var(--nw-green-deep)', color:'var(--uc-paper)', textAlign:'center', padding:'4px 0', fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, letterSpacing:'0.12em' }}>FREE PICKUP AT YOUR COMMUNITY STORE · COMMERCIAL PRICING</div>
        <div style={{ display:'flex', alignItems:'center', gap:11, padding:'8px 14px', borderBottom:'1px solid var(--line-1)' }}>
          
          <BrandMark fontSize={11}/>
          <div style={{ display:'flex', gap:9, marginLeft:4 }}>{['Grocery','Apparel','Home','Outdoor'].map((x,i)=>(<span key={x} style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, color:i===0?'var(--fg-1)':'var(--fg-3)' }}>{x}</span>))}</div>
          <span style={{ marginLeft:'auto', fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, color:'var(--uc-paper)', background:'var(--nw-green)', padding:'3px 8px', borderRadius:3 }}>Cart 3</span>
        </div>
        {/* category title + breadcrumb */}
        <div style={{ padding:'11px 14px 9px', display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:7, letterSpacing:'0.1em', color:'var(--fg-3)' }}>HOME / GROCERY / PANTRY STAPLES</span>
            <span style={{ fontFamily:'var(--font-hero)', fontWeight:700, fontSize:19, letterSpacing:'-0.035em', color:'var(--fg-1)' }}>Pantry Staples</span>
          </div>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:7.5, color:'var(--fg-3)' }}>48 products · Sort ▾</span>
        </div>
        {/* filter chips */}
        <div style={{ display:'flex', gap:6, padding:'0 14px 11px' }}>{['Flour & baking','Canned','Dry goods','In stock'].map((f,i)=>(<span key={f} style={{ padding:'3px 9px', borderRadius:999, border:'1px solid', borderColor:i===0?'var(--nw-green)':'var(--line-1)', background:i===0?'var(--nw-green)':'transparent', color:i===0?'var(--uc-paper)':'var(--fg-2)', fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700 }}>{f}</span>))}</div>
        {/* product grid */}
        <div style={{ padding:'0 14px 14px', display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:9 }}>
          {grid.map((p,i)=>(
            <div key={i} style={{ display:'flex', flexDirection:'column', gap:5 }}>
              <div style={{ aspectRatio:'1/1', borderRadius:3, background:`linear-gradient(140deg, ${p[2]}, var(--uc-bone))`, position:'relative' }}>{p[3] && <span style={{ position:'absolute', top:5, left:5, padding:'1px 6px', background:p[3]==='BEST'?'var(--nw-green-mid)':'var(--nw-green)', color:'#fff', borderRadius:2, fontFamily:'var(--font-mono)', fontSize:5.5, fontWeight:800 }}>{p[3]}</span>}<span style={{ position:'absolute', bottom:5, right:5, width:16, height:16, borderRadius:999, background:'var(--uc-paper)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'var(--fg-1)' }}>＋</span></div>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:8.5, letterSpacing:'-0.01em', color:'var(--fg-1)' }}>{p[0]}</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:8, fontWeight:700, color:'var(--fg-1)' }}>{p[1]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dim scrim */}
      <div aria-hidden="true" style={{ position:'absolute', inset:0, background:'rgba(10,10,10,0.42)' }}/>

      {/* Cart drawer — floating, with margin on top/bottom/side */}
      <div style={{
        position:'absolute', top:14, right:14, bottom:14, width:'54%',
        background:'var(--uc-paper)', border:'1px solid var(--line-2)', borderRadius:6,
        boxShadow:'0 18px 40px -16px rgba(10,10,10,0.5)',
        display:'flex', flexDirection:'column', overflow:'hidden'
      }}>
        {/* header */}
        <div style={{ padding:'9px 13px', borderBottom:'1px solid var(--line-1)', background:'var(--uc-bone)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:12 }}>Your cart</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:8.5, color:'var(--fg-3)' }}>3 ITEMS · ✕</span>
        </div>
        {/* free shipping progress */}
        <div style={{ padding:'7px 13px', borderBottom:'1px solid var(--line-1)', background:'var(--uc-cream)' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--fg-1)', marginBottom:5 }}>Order qualifies for <span style={{ color:'var(--nw-green-mid)', fontWeight:700 }}>FREE store pickup</span></div>
          <div style={{ height:4, background:'var(--line-1)', borderRadius:999, overflow:'hidden' }}><span style={{ display:'block', width:'100%', height:'100%', background:'var(--nw-green-mid)' }}/></div>
        </div>
        {/* lines */}
        {lines.map((l,i)=>(
          <div key={i} style={{ padding:'5px 13px', borderBottom:'1px solid var(--line-1)', display:'grid', gridTemplateColumns:'26px 1fr auto', gap:9, alignItems:'center' }}>
            <div style={{ width:26, height:26, borderRadius:3, background:'linear-gradient(135deg, var(--uc-stone-200), var(--uc-bone))' }}/>
            <div><div style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:10, color:'var(--fg-1)' }}>{l[0]}</div><div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--fg-3)' }}>qty {l[1]} · <span style={{ color:'var(--nw-green)', fontWeight:700 }}>{l[2]}</span></div></div>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:9.5, fontWeight:700 }}>{l[3]}</span>
          </div>
        ))}
        {/* upsells */}
        <div style={{ padding:'7px 13px', background:'var(--uc-cream)', borderBottom:'1px solid var(--line-1)' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, letterSpacing:'0.1em', color:'var(--fg-3)', marginBottom:5 }}>PAIRS WELL WITH</div>
          <div style={{ display:'flex', gap:6 }}>{[['Baking Powder','$6'],['Sugar 4 kg','$9'],['Lard 454 g','$5']].map((u,i)=>(<div key={i} style={{ flex:1, border:'1px solid var(--line-1)', borderRadius:3, padding:5, display:'flex', flexDirection:'column', gap:3, background:'var(--uc-paper)' }}><div style={{ aspectRatio:'1/0.6', background:'var(--uc-stone-200)', borderRadius:2 }}/><span style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:7, color:'var(--fg-1)' }}>{u[0]}</span><span style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, color:'var(--uc-black)' }}>+ {u[1]}</span></div>))}</div>
        </div>
        {/* totals + checkout */}
        <div style={{ marginTop:'auto', padding:'7px 13px 9px', borderTop:'1px solid var(--line-1)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:8.5, color:'var(--fg-3)', marginBottom:3 }}><span>Subtotal</span><span>$1,482</span></div>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:8.5, color:'var(--nw-green-mid)', marginBottom:7 }}><span>Tier savings</span><span>−$118</span></div>
          <span style={{ display:'block', textAlign:'center', padding:'7px', background:'var(--nw-green)', color:'var(--uc-paper)', borderRadius:3, fontSize:10, fontWeight:700 }}>Checkout · NET-30 · $1,364</span>
        </div>
      </div>
    </div>
  );
}
function GfxPDP() {
  return (
    <div style={{ background:'var(--uc-paper)', border:'1px solid var(--line-1)', borderRadius:5, overflow:'hidden' }}>
      {/* chrome */}
      <div style={{ background:'var(--nw-green-deep)', color:'var(--uc-paper)', textAlign:'center', padding:'4px 0', fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, letterSpacing:'0.12em' }}>FREE PICKUP AT YOUR COMMUNITY STORE · COMMERCIAL PRICING</div>
      <div style={{ display:'flex', alignItems:'center', gap:11, padding:'8px 14px', borderBottom:'1px solid var(--line-1)' }}>
        
        <BrandMark fontSize={11}/>
        <div style={{ display:'flex', gap:9, marginLeft:4 }}>{['Grocery','Apparel','Home','Outdoor'].map((x,i)=>(<span key={x} style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, color:i===0?'var(--fg-1)':'var(--fg-3)' }}>{x}</span>))}</div>
        <span style={{ marginLeft:'auto', fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, color:'var(--uc-paper)', background:'var(--nw-green)', padding:'3px 8px', borderRadius:3 }}>Cart 2</span>
      </div>
      {/* breadcrumb */}
      <div style={{ padding:'8px 14px 0', fontFamily:'var(--font-mono)', fontSize:7, letterSpacing:'0.08em', color:'var(--fg-3)' }}>HOME / APPAREL / WORKWEAR</div>

      {/* gallery + buy box */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:13, padding:'9px 14px 13px' }}>
        {/* gallery */}
        <div style={{ display:'grid', gridTemplateColumns:'26px 1fr', gap:7 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>{['#1F3A4D','#E8742B','#2B2B2B','#7C8B7A'].map((c,i)=>(<div key={i} style={{ aspectRatio:'1/1', borderRadius:3, background:`linear-gradient(140deg, ${c}, var(--uc-bone))`, border:i===0?'1.5px solid var(--nw-green)':'1px solid var(--line-1)' }}/>))}</div>
          <div style={{ aspectRatio:'4/4.6', borderRadius:4, background:'radial-gradient(120% 90% at 65% 20%, #2E5F7A, #1F3A4D 60%, #10202B)', position:'relative', overflow:'hidden' }}>
            <span style={{ position:'absolute', top:8, left:8, padding:'2px 7px', background:'var(--nw-green-mid)', color:'#fff', borderRadius:999, fontFamily:'var(--font-mono)', fontSize:6, fontWeight:800, letterSpacing:'0.06em' }}>BEST SELLER</span>
            
            <span style={{ position:'absolute', bottom:8, left:8, display:'flex', gap:4 }}>{[0,1,2,3].map(i=>(<span key={i} style={{ width:5, height:5, borderRadius:999, background:i===0?'#fff':'rgba(255,255,255,0.45)' }}/>))}</span>
          </div>
        </div>

        {/* buy box */}
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, letterSpacing:'0.12em', color:'var(--nw-green-mid)' }}>IN STOCK · SHIPS FROM WINNIPEG DC · FREE STORE PICKUP</div>
          <div style={{ fontFamily:'var(--font-hero)', fontWeight:700, fontSize:21, letterSpacing:'-0.04em', lineHeight:0.9, color:'var(--fg-1)' }}>ARCTIC SERIES<br/><span style={{ fontFamily:'var(--font-serif)', fontWeight:400, fontSize:16 }}>Insulated Work Parka</span></div>
          <div style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'var(--font-mono)', fontSize:8 }}><span style={{ color:'var(--nw-green)' }}>★★★★★</span><span style={{ color:'var(--fg-3)' }}>4.9 · 128 reviews</span></div>
          {/* swatches */}
          <div style={{ display:'flex', gap:5, marginTop:1 }}>{['#1F3A4D','#E8742B','#1F1F1F','#7C8B7A'].map((c,i)=>(<span key={i} style={{ width:16, height:16, borderRadius:999, background:c, border:i===0?'1.5px solid var(--nw-green)':'1px solid var(--line-1)', boxShadow:i===0?'0 0 0 2px var(--uc-paper) inset':'none' }}/>))}</div>
          {/* configuration — configurable product */}
          <div style={{ marginTop:1 }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:6.5, fontWeight:700, letterSpacing:'0.1em', color:'var(--fg-3)', marginBottom:4 }}>CONFIGURATION</div>
            <div style={{ display:'flex', gap:4 }}>{[['Parka only',false],['Parka + bibs',true],['Full winter kit',false]].map(([l,on],i)=>(<span key={i} style={{ flex:1, padding:'5px 2px', textAlign:'center', border:'1px solid', borderColor:on?'var(--nw-green)':'var(--line-1)', borderRadius:3, fontFamily:'var(--font-mono)', fontSize:6, fontWeight:700, color:on?'var(--uc-paper)':'var(--fg-2)', background:on?'var(--nw-green)':'transparent', whiteSpace:'nowrap' }}>{l}</span>))}</div>
          </div>
          {/* tier pricing — minimalist table */}
          <div style={{ marginTop:2, border:'1px solid var(--line-1)', borderRadius:3, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>{[['5+','$279'],['20+','$265'],['50+','$249'],['100+','$229']].map((t,i)=>(
              <div key={i} style={{ padding:'4px 2px', textAlign:'center', borderLeft:i?'1px solid var(--line-1)':'none' }}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:6.5, fontWeight:700, color:'var(--fg-3)', letterSpacing:'0.04em' }}>{t[0]}</div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, color:'var(--fg-1)', marginTop:2 }}>{t[1]}</div>
              </div>))}</div>
          </div>
          {/* CTAs */}
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:2 }}>
            <div style={{ display:'flex', gap:6 }}>
              <div style={{ display:'flex', alignItems:'center', border:'1px solid var(--uc-black)', borderRadius:3, overflow:'hidden' }}>
                <span style={{ padding:'0 8px', fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, color:'var(--fg-2)' }}>–</span>
                <span style={{ padding:'8px 4px', minWidth:18, textAlign:'center', fontFamily:'var(--font-mono)', fontSize:9, fontWeight:700, color:'var(--fg-1)', borderLeft:'1px solid var(--line-1)', borderRight:'1px solid var(--line-1)' }}>1</span>
                <span style={{ padding:'0 8px', fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, color:'var(--fg-2)' }}>+</span>
              </div>
              <span style={{ flex:1, padding:'8px', textAlign:'center', background:'var(--nw-green)', color:'var(--uc-paper)', borderRadius:3, fontFamily:'var(--font-display)', fontSize:9.5, fontWeight:800 }}>Add to cart</span>
            </div>
            <span style={{ padding:'7px', textAlign:'center', border:'1px solid var(--nw-green)', borderRadius:3, fontFamily:'var(--font-display)', fontSize:9, fontWeight:700, color:'var(--nw-green)' }}>Request a Quote</span>
          </div>
          {/* trust row */}
          <div style={{ display:'flex', gap:8, marginTop:3, flexWrap:'wrap' }}>{['✓ 1-yr warranty','✓ Free store pickup','✓ Easy returns'].map(t=>(<span key={t} style={{ fontFamily:'var(--font-mono)', fontSize:6.5, fontWeight:700, color:'var(--fg-3)' }}>{t}</span>))}</div>
          {/* frequently bought together (compact, in buy box) */}
          <div style={{ marginTop:7, paddingTop:9, borderTop:'1px solid var(--line-1)' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:6.5, fontWeight:700, letterSpacing:'0.1em', color:'var(--fg-3)', marginBottom:6 }}>FREQUENTLY BOUGHT TOGETHER</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
              {[['Arctic Work Parka','$299','#1F3A4D'],['Insulated Bibs','$149','#4A4F57'],['Wool Liner Gloves','$24','#7C8B7A']].map((p,i)=>(
                <React.Fragment key={i}>
                  {i>0 && <span style={{ fontFamily:'var(--font-hero)', fontWeight:800, fontSize:11, color:'var(--fg-3)', flexShrink:0 }}>+</span>}
                  <div style={{ flex:1, display:'flex', flexDirection:'column', gap:3 }}>
                    <div style={{ aspectRatio:'1/0.82', borderRadius:3, background:`linear-gradient(140deg, ${p[2]}, var(--uc-bone))` }}/>
                    <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:6.5, letterSpacing:'-0.01em', color:'var(--fg-1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p[0]}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:6.5, fontWeight:700, color:'var(--fg-1)' }}>{p[1]}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, color:'var(--fg-3)', whiteSpace:'nowrap' }}>Bundle <span style={{ fontFamily:'var(--font-hero)', fontWeight:800, fontSize:12, color:'var(--fg-1)' }}>$449</span></span>
              <span style={{ flex:1, padding:'6px', textAlign:'center', background:'var(--nw-green)', color:'var(--uc-paper)', borderRadius:3, fontFamily:'var(--font-display)', fontSize:8.5, fontWeight:700 }}>Add all 3</span>
            </div>
          </div>
        </div>
      </div>

      {/* specs + highlights */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'var(--line-1)', borderTop:'1px solid var(--line-1)' }}>
        <div style={{ background:'var(--uc-paper)', padding:'11px 14px' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, letterSpacing:'0.1em', color:'var(--fg-3)', marginBottom:7 }}>SPECIFICATIONS</div>
          {[['Rated to','−40°C'],['Insulation','400 g synthetic'],['Shell','Waterproof nylon'],['Sizes','XS–4XL']].map((r,i)=>(<div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderTop:i?'1px solid var(--line-1)':'none', fontFamily:'var(--font-mono)', fontSize:8 }}><span style={{ color:'var(--fg-3)' }}>{r[0]}</span><span style={{ color:'var(--fg-1)', fontWeight:700 }}>{r[1]}</span></div>))}
        </div>
        <div style={{ background:'var(--uc-cream)', padding:'11px 14px' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, letterSpacing:'0.1em', color:'var(--fg-3)', marginBottom:7 }}>WHY BUYERS CHOOSE IT</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>{['Built for real northern winters — wind, −40°C, and long days outside.','Commercial pricing and NET terms unlock at 5+ units.','Free pickup at any Northern or NorthMart store.'].map((t,i)=>(<div key={i} style={{ display:'grid', gridTemplateColumns:'12px 1fr', gap:7, alignItems:'start' }}><span style={{ width:10, height:10, borderRadius:999, background:'var(--nw-green)', marginTop:1, display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="6" height="6" viewBox="0 0 12 12" fill="none"><path d="M2 6 L5 9 L10 3" stroke="var(--uc-paper)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span style={{ fontFamily:'var(--font-serif)', fontSize:9, lineHeight:1.35, color:'var(--fg-2)' }}>{t}</span></div>))}</div>
        </div>
      </div>

      {/* review highlight */}
      <div style={{ padding:'11px 14px', borderTop:'1px solid var(--line-1)', display:'flex', gap:10, alignItems:'center', background:'var(--uc-paper)' }}>
        <span style={{ fontFamily:'var(--font-hero)', fontWeight:800, fontSize:24, letterSpacing:'-0.04em', color:'var(--fg-1)' }}>4.9</span>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--nw-green)' }}>★★★★★</div>
          <div style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontSize:9, lineHeight:1.35, color:'var(--fg-2)', marginTop:2 }}>“Issued one to every member of our road crew. Warm, tough, and they last.”</div>
        </div>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, color:'var(--fg-3)', whiteSpace:'nowrap' }}>VERIFIED ✓</span>
      </div>

      {/* you may also like */}
      <div style={{ padding:'11px 14px', borderTop:'1px solid var(--line-1)', background:'var(--uc-bone)' }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, letterSpacing:'0.1em', color:'var(--fg-3)', marginBottom:8 }}>COMPLETE THE SET</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:7 }}>{[['Balaclava','$18','#2B2B2B'],['Wool Socks 3-pk','$29','#7C8B7A'],['Hi-Vis Vest','$22','#E8742B'],['Knit Toque','$16','#1F3A4D']].map((p,i)=>(<div key={i} style={{ display:'flex', flexDirection:'column', gap:4 }}><div style={{ aspectRatio:'1/1', borderRadius:3, background:`linear-gradient(140deg, ${p[2]}, var(--uc-bone))` }}/><span style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:7.5, color:'var(--fg-1)' }}>{p[0]}</span><span style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, color:'var(--fg-1)' }}>{p[1]}</span></div>))}</div>
      </div>
    </div>
  );
}

function GfxHomepage() {
  const nav = ['Grocery','Apparel','Outdoor','Commercial'];
  const mega = [
    { h: 'By Department', items: ['Grocery','Apparel','Home & Appliances','Outdoor & Parts','Pharmacy','Baby & Family'] },
    { h: 'By Season', items: ['Sealift Orders','Winter Ready','Camp & Cabin','Back to School'] },
    { h: 'Quick Links', items: ['Weekly Flyer','Clearance','Commercial Sales','Special Order Desk'] }
  ];
  const brands = ['NORTHERN','NORTHMART','GIANT TIGER','COST-U-LESS','QUICKSTOP'];
  const feat = [['All-Purpose Flour 10 kg','$24.99','#C9B79C','BULK'],['Arctic Down Parka','$349.00','#3B5B6E',null],['Chest Freezer 7 cu ft','$449.00','#B8C4CC','NEW'],['Snowmobile Drive Belt','$74.99','#4A4F57','DEAL']];
  return (
    <div style={{ background:'var(--uc-paper)', border:'1px solid var(--line-1)', borderRadius:5, overflow:'hidden' }}>
      {/* announcement */}
      <div style={{ background:'var(--nw-green-deep)', color:'var(--uc-paper)', textAlign:'center', padding:'4px 0', fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, letterSpacing:'0.12em' }}>FREE PICKUP AT YOUR COMMUNITY STORE · COMMERCIAL PRICING</div>
      {/* header */}
      <div style={{ display:'flex', alignItems:'center', gap:11, padding:'8px 14px', borderBottom:'1px solid var(--line-1)' }}>
        <BrandMark fontSize={12}/>
        <div style={{ display:'flex', gap:9, marginLeft:4, minWidth:0 }}>{nav.map((x,i)=>(<span key={x} style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, color:i===0?'var(--fg-1)':'var(--fg-3)', position:'relative' }}>{x}{i===0 && <span style={{ position:'absolute', left:0, right:0, bottom:-9, height:2, background:'var(--nw-green)' }}/>}</span>))}</div>
        <span style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:7 }}>
          <span style={{ width:72, height:18, borderRadius:999, border:'1px solid var(--line-2)', display:'flex', alignItems:'center', gap:4, padding:'0 9px', fontFamily:'var(--font-mono)', fontSize:7, color:'var(--fg-3)', whiteSpace:'nowrap', overflow:'hidden' }}><span style={{ fontSize:8 }}>⌕</span>Search…</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, color:'var(--uc-paper)', background:'var(--nw-green)', padding:'3px 8px', borderRadius:3 }}>Cart 6</span>
        </span>
      </div>

      {/* hero + mega menu overlay */}
      <div style={{ position:'relative', height:188, background:'linear-gradient(100deg, #063F33 0%, #0B6651 55%, #2E8A72 135%)', overflow:'hidden' }}>
        
        {/* hero copy (right 1/3) */}
        <div style={{ position:'absolute', right:18, top:0, bottom:0, width:'34%', display:'flex', flexDirection:'column', justifyContent:'center', gap:7 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, letterSpacing:'0.16em', color:'var(--nw-green-light)' }}>SEALIFT SEASON · ORDER BY JUNE 30</span>
          <span style={{ fontFamily:'var(--font-hero)', fontWeight:800, fontSize:24, letterSpacing:'-0.04em', lineHeight:0.9, color:'#fff' }}>Stock up for<br/><span style={{ fontFamily:'var(--font-serif)', fontWeight:400 }}>the season ahead.</span></span>
          <span style={{ alignSelf:'flex-start', marginTop:2, padding:'5px 13px', background:'var(--uc-paper)', color:'var(--nw-green)', borderRadius:999, fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:800 }}>Shop sealift deals →</span>
        </div>
        {/* mega menu over 2/3 */}
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'64%', background:'rgba(248,246,240,0.97)', borderRight:'1px solid var(--line-2)', boxShadow:'10px 0 30px -16px rgba(0,0,0,0.5)', padding:'14px 16px', display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14 }}>
          {mega.map((col,ci)=>(
            <div key={ci} style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, letterSpacing:'0.1em', color:'var(--fg-3)', paddingBottom:4, borderBottom:'1px solid var(--line-1)' }}>{col.h.toUpperCase()}</div>
              {col.items.map((it,ii)=>(<span key={ii} style={{ fontFamily:'var(--font-display)', fontWeight:ii===0&&ci===0?700:500, fontSize:8.5, letterSpacing:'-0.01em', color:ii===0&&ci===0?'var(--fg-1)':'var(--fg-2)' }}>{it}</span>))}
            </div>
          ))}
        </div>
      </div>

      {/* Year / Make / Model fitment */}
      <div style={{ background:'var(--nw-green-deep)', padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, letterSpacing:'0.08em', color:'var(--nw-green-light)', whiteSpace:'nowrap' }}>SNOWMOBILE & ATV PARTS</span>
        {['Year','Make','Model'].map((f,i)=>(<span key={f} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'space-between', height:22, background:'var(--uc-paper)', borderRadius:4, padding:'0 9px', fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, color:'var(--fg-2)' }}>{f}<span style={{ color:'var(--fg-3)' }}>▾</span></span>))}
        <span style={{ display:'inline-flex', alignItems:'center', height:22, padding:'0 12px', background:'var(--uc-paper)', color:'var(--nw-green)', borderRadius:4, fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:800, whiteSpace:'nowrap' }}>Find Parts →</span>
      </div>

      {/* brand strip */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px', borderBottom:'1px solid var(--line-1)' }}>{brands.map(b=>(<span key={b} style={{ fontFamily:'var(--font-hero)', fontWeight:800, fontSize:12, letterSpacing:'-0.02em', color:'var(--fg-3)' }}>{b}</span>))}</div>

      {/* featured products */}
      <div style={{ padding:'12px 14px 6px', display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
        <span style={{ fontFamily:'var(--font-hero)', fontWeight:700, fontSize:14, letterSpacing:'-0.03em', color:'var(--fg-1)' }}>Featured products</span>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, color:'var(--fg-3)' }}>View all →</span>
      </div>
      <div style={{ padding:'0 14px 14px', display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:9 }}>
        {feat.map((p,i)=>(
          <div key={i} style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <div style={{ aspectRatio:'1/0.9', borderRadius:4, background:`linear-gradient(150deg, ${p[2]}, var(--uc-bone))`, position:'relative' }}>{p[3] && <span style={{ position:'absolute', top:5, left:5, padding:'1px 6px', background:p[3]==='DEAL'?'var(--nw-green-mid)':(p[3]==='NEW'?'var(--nw-green)':'var(--nw-green-deep)'), color:'#fff', borderRadius:2, fontFamily:'var(--font-mono)', fontSize:5.5, fontWeight:800 }}>{p[3]}</span>}<span style={{ position:'absolute', bottom:5, right:5, width:16, height:16, borderRadius:999, background:'var(--uc-paper)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'var(--fg-1)', boxShadow:'0 1px 3px rgba(0,0,0,0.18)' }}>＋</span></div>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:8.5, color:'var(--fg-1)', letterSpacing:'-0.01em' }}>{p[0]}</span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:8.5, fontWeight:700, color:'var(--fg-1)' }}>{p[1]}</span>
          </div>
        ))}
      </div>

      {/* brand story — image + text */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, borderTop:'1px solid var(--line-1)' }}>
        <div style={{ background:'linear-gradient(150deg, #2E8A72, #063F33)', minHeight:96, position:'relative' }}><span style={{ position:'absolute', bottom:8, left:10, padding:'2px 7px', background:'var(--uc-paper)', borderRadius:3, fontFamily:'var(--font-mono)', fontSize:5.5, fontWeight:800, letterSpacing:'0.1em', color:'var(--fg-3)' }}>EST. 1668</span></div>
        <div style={{ padding:'16px 16px', display:'flex', flexDirection:'column', justifyContent:'center', gap:7, background:'var(--uc-bone)' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:6.5, fontWeight:700, letterSpacing:'0.14em', color:'var(--fg-3)' }}>OUR STORY</span>
          <span style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontSize:14, lineHeight:1.3, letterSpacing:'-0.01em', color:'var(--fg-1)' }}>Trading in the North since 1668. Today, the trusted community store from Nunavut to the Caribbean.</span>
          <span style={{ alignSelf:'flex-start', fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, color:'var(--fg-1)', borderBottom:'1.5px solid var(--nw-green)', paddingBottom:1 }}>Read our story →</span>
        </div>
      </div>
    </div>
  );
}

function BPPerformance() {
  const groups = [
    {
      kpi: 'Shopping Experience',
      sub: 'A considered path from landing to checkout.',
      points: [
        { t: 'Customer Journey', d: 'Streamlined and tailored paths from landing to checkout, for both community shoppers and commercial accounts.' },
        { t: 'Information Architecture', d: 'Mega navigation with multi-level menus built around how shops actually browse.' },
        { t: 'Product Finding', d: 'Year / Make / Model fitment, quizzes, and creative ways to find products.' }
      ],
      gfx: <GfxHomepage/>
    },
    {
      kpi: 'Search & Discovery',
      sub: 'Get buyers to the right product, fast.',
      points: [
        { t: 'Product Merchandising', d: 'Assortment sorting, highlighting, and spotlighting key products with badges.' },
        { t: 'Faceted Filters', d: 'Smart collections with attribute filtering to help buyers find exactly what they’re looking for.' },
        { t: 'AI Insight Search', d: 'Shopify-built natural-language search that understands intent, not just keywords.' }
      ],
      gfx: <GfxCollection/>
    },
    {
      kpi: 'Optimized Order Value',
      sub: 'Lift AOV without raising prices.',
      points: [
        { t: 'Upsells & Cross-sells', d: 'Relevant add-ons and complementary products surfaced in cart and on the product page to grow basket size.' },
        { t: 'Prices & Discounts', d: 'Volume pricing, tiered trade discounts, and automatic promotions applied natively at checkout.' },
        { t: 'Promotions & Offers', d: 'Site-wide sales, BOGO deals, and scheduled coupon codes that launch and expire on their own.' }
      ],
      gfx: <GfxCart/>
    },
    {
      kpi: 'Elevated Conversion Rate',
      sub: 'Turn more visits into orders.',
      points: [
        { t: 'Robust Product Page', d: 'Rich, tailored sections with side-by-side comparisons, detailed spec tables, and downloadable assets.' },
        { t: 'Bundles & Grouped Products', d: 'Curated product linking and configured products bundled and checked out together as one seamless order.' },
        { t: 'Customer Engagement', d: 'Social proof, verified reviews, how-to videos, and proprietary installation instructions that build buyer confidence.' }
      ],
      gfx: <GfxPDP/>
    }
  ];
  return (
    <BPSection id="performance" n="06" label="Commerce" paper tail="DESIGNED FOR KPI">
      <BPHeadline>
        Designed for the{' '}
        <BPSerif>numbers that matter.</BPSerif>
      </BPHeadline>
      <p style={{ marginTop:'clamp(20px, 2.4vw, 28px)', maxWidth:640, fontFamily:'var(--font-serif)', fontSize:'clamp(15px, 1.3vw, 18px)', lineHeight:1.5, color:'var(--fg-2)' }}>
        Every design decision maps back to a KPI. Four levers, engineered into the build from day one.
      </p>
      <div style={{ marginTop:'clamp(36px, 4.5vw, 64px)', display:'flex', flexDirection:'column', gap:0 }}>
        {groups.map((g, i) => (
          <div key={i} style={{
            display:'grid',
            gridTemplateColumns: i % 2 === 0 ? 'minmax(0, 1fr) minmax(0, 1.05fr)' : 'minmax(0, 1.05fr) minmax(0, 1fr)',
            gap:'clamp(28px, 4vw, 64px)', alignItems:'center',
            padding:'clamp(32px, 4vw, 56px) 0',
            borderTop:'1px solid var(--line-1)'
          }}>
            <div style={{ order: i % 2 === 0 ? 1 : 2 }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--fg-3)', marginBottom:14, display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ color:'var(--uc-black)', background:'var(--uc-signal)', padding:'3px 8px', borderRadius:3 }}>{String(i+1).padStart(2,'0')}</span>
                KPI
              </div>
              <h3 style={{ margin:0, fontFamily:'var(--font-hero)', fontWeight:700, fontSize:'clamp(26px, 3vw, 44px)', letterSpacing:'-0.035em', lineHeight:0.98, color:'var(--fg-1)' }}>{g.kpi}</h3>
              <div style={{ fontFamily:'var(--font-serif)', fontSize:'clamp(15px, 1.3vw, 18px)', color:'var(--fg-2)', marginTop:10 }}>{g.sub}</div>
              <ul style={{ listStyle:'none', padding:0, margin:'20px 0 0', display:'flex', flexDirection:'column', gap:14 }}>
                {g.points.map(p => (
                  <li key={p.t} style={{ display:'grid', gridTemplateColumns:'16px minmax(0,1fr)', gap:12, alignItems:'start' }}>
                    <span style={{ width:14, height:14, borderRadius:999, background:'var(--uc-signal)', display:'inline-flex', alignItems:'center', justifyContent:'center', marginTop:3, flexShrink:0 }}><svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6 L5 9 L10 3" stroke="var(--uc-black)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                    <div>
                      <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'clamp(15px, 1.3vw, 18px)', letterSpacing:'-0.012em', color:'var(--fg-1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.t}</div>
                      <div style={{ fontFamily:'var(--font-serif)', fontSize:14, color:'var(--fg-2)', marginTop:3, lineHeight:1.45, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', minHeight:'2.9em' }}>{p.d}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ order: i % 2 === 0 ? 2 : 1 }}>{g.gfx}</div>
          </div>
        ))}
      </div>
    </BPSection>
  );
}

// ── 07 TECH STACK ──────────────────────────────────────────────────────────
function BPTechStack() {
  const rows = [
    { name: 'Shopify', fn: 'Commerce platform + B2B',            pri: 'start',  cost: '$2,300/mo' },
    { name: 'Shopify Search & Discovery',  fn: 'Search, filters & recommendations',   pri: 'launch', cost: 'Free' },
    { name: 'Shopify Checkout Blocks',     fn: 'Checkout customizations',             pri: 'launch', cost: 'Free' },
    { name: 'Shopify Knowledge Base',      fn: 'Help center & self-service',          pri: 'launch', cost: 'Free' },
    { name: 'Shopify Flow',                fn: 'Workflow automation',                 pri: 'launch', cost: 'Free' },
    { name: 'Shopify Bundles',             fn: 'Bundled & grouped products',          pri: 'launch', cost: 'Free' },
    { name: 'Uncap Quotes',                fn: 'B2B quote management',                pri: 'start',  cost: '$100/mo' },
    { name: 'Uncap Connect',               fn: 'FTP flat-file ↔ Shopify sync',         pri: 'start',  cost: '$390/mo' },
    { name: 'Matrixify',                   fn: 'Bulk import / export & migration',    pri: 'start',  cost: '$50/mo' }
  ];
  const priMeta = {
    start:  { l: 'Needed to start',  c: 'var(--uc-signal)', fg: 'var(--uc-black)' },
    launch: { l: 'Needed on launch', c: '#FF8B37',          fg: 'var(--uc-black)' },
    future: { l: 'Future phase',     c: 'transparent',      fg: 'var(--fg-3)', outline: true }
  };
  return (
    <BPSection id="techstack" n="07" label="Architecture" dark grid tail="WHAT IT RUNS ON">
      <BPHeadline dark>
        A stack chosen for{' '}
        <BPSerif>longevity.</BPSerif>
      </BPHeadline>

      <p style={{ marginTop:'clamp(16px, 2vw, 22px)', maxWidth:760, fontFamily:'var(--font-serif)', fontSize:'clamp(15px, 1.3vw, 18px)', lineHeight:1.55, color:'var(--uc-stone-300)' }}>
        Streamlining operations and omni-channel marketing matter as much as the storefront itself. We wire up the critical integrations — through Shopify apps or connection bridges — so everything syncs in real time. The platforms we manage include, but aren&rsquo;t limited to:
      </p>

      {/* ── Architecture diagram: the stack as layered tiers ── */}
      <div style={{ marginTop:'clamp(28px, 3.5vw, 44px)' }}>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:18, flexWrap:'wrap', gap:8 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--uc-stone-500)' }}>How it fits together</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--uc-stone-500)', letterSpacing:'0.04em' }}>Shopify Plus at the core · everything else swappable</span>
        </div>

        {(() => {
          const layers = [
            { tier:'04', name:'Growth & Intelligence', note:'After launch', tools:[['Shopify Flow','launch'],['Shopify Knowledge Base','launch']] },
            { tier:'03', name:'Experience & Engagement', note:'Customer-facing', tools:[['Shopify Search & Discovery','launch'],['Shopify Checkout Blocks','launch'],['Shopify Bundles','launch'],['Uncap Quotes','start']] },
            { tier:'02', name:'Data & Integration', note:'System of record', tools:[['Uncap Connect','start'],['Matrixify','start']] },
            { tier:'01', name:'Commerce Core', note:'Foundation', tools:[['Shopify','start']], core:true }
          ];
          const chip = { start:{ bg:'var(--uc-signal)', fg:'var(--uc-black)' }, launch:{ bg:'#FF8B37', fg:'var(--uc-black)' }, future:{ bg:'transparent', fg:'var(--uc-stone-300)', outline:true } };
          return (
            <div style={{ display:'flex', gap:'clamp(12px, 1.6vw, 20px)' }}>
              {/* flow rail */}
              <div style={{ flexShrink:0, width:'clamp(30px, 3.4vw, 44px)', display:'flex', flexDirection:'column', alignItems:'center', position:'relative' }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'var(--uc-stone-500)', writingMode:'vertical-rl', transform:'rotate(180deg)', whiteSpace:'nowrap', marginBottom:8 }}>USER-FACING</span>
                <div style={{ flex:1, width:1, background:'linear-gradient(var(--uc-signal), #FF8B37, #2B2B2B)' }}/>
                <span style={{ marginTop:8, color:'var(--uc-stone-500)', fontSize:11 }}>▾</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'var(--uc-stone-500)', writingMode:'vertical-rl', transform:'rotate(180deg)', whiteSpace:'nowrap', marginTop:8 }}>FOUNDATION</span>
              </div>

              {/* tiers */}
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10 }}>
                {layers.map((L) => (
                  <div key={L.tier} style={{
                    display:'grid', gridTemplateColumns:'minmax(0,280px) minmax(0,1fr)', gap:'clamp(14px,2vw,28px)', alignItems:'center',
                    padding:'clamp(14px,1.8vw,20px) clamp(16px,2vw,24px)',
                    background: L.core ? 'var(--uc-paper)' : '#121212',
                    border:'1px solid ' + (L.core ? 'var(--uc-paper)' : '#1F1F1F'),
                    borderRadius:6, position:'relative', overflow:'hidden'
                  }}>
                    {L.core && <span aria-hidden="true" style={{ position:'absolute', left:0, top:0, bottom:0, width:4, background:'var(--uc-signal)' }}/>}
                    <div style={{ display:'flex', alignItems:'center', gap:13, minWidth:0 }}>
                      <span style={{ fontFamily:'var(--font-hero)', fontWeight:800, fontSize:'clamp(26px,3vw,40px)', letterSpacing:'-0.04em', lineHeight:0.9, flexShrink:0, color: L.core ? 'var(--fg-3)' : 'var(--uc-stone-500)' }}>{L.tier}</span>
                      <div style={{ display:'flex', flexDirection:'column', gap:3, minWidth:0 }}>
                        <span style={{ fontFamily:'var(--font-hero)', fontWeight:700, fontSize:'clamp(15px,1.5vw,20px)', letterSpacing:'-0.025em', whiteSpace:'nowrap', color: L.core ? 'var(--uc-black)' : 'var(--uc-paper)' }}>{L.name}</span>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:8.5, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color: L.core ? 'var(--fg-3)' : 'var(--uc-stone-500)' }}>{L.note}</span>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'flex-end' }}>
                      {L.tools.map(([t,p]) => {
                        const c = chip[p];
                        return (
                          <span key={t} style={{
                            padding:'6px 12px', borderRadius:5,
                            background: c.outline ? 'transparent' : c.bg,
                            border: c.outline ? '1px solid #2B2B2B' : 'none',
                            fontFamily:'var(--font-display)', fontWeight:700, fontSize:'clamp(12px,1.2vw,15px)', letterSpacing:'-0.01em',
                            color: c.outline ? c.fg : c.fg, whiteSpace:'nowrap'
                          }}>{t}</span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      <div style={{ marginTop:'clamp(28px, 3.5vw, 44px)', background:'#15120D', border:'1px solid #241F18', borderRadius:12, padding:'clamp(18px, 2.4vw, 32px)' }}>
      <div style={{ border:'1px solid #1F1F1F', borderRadius:6, overflow:'hidden' }}>
        {/* Header */}
        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1.2fr) minmax(0,1.5fr) minmax(0,1fr) 120px', gap:16, padding:'12px 18px', background:'#0F0F0F', borderBottom:'1px solid #1F1F1F', fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--uc-stone-500)' }}>
          <span>Name</span><span>Functionality</span><span style={{ textAlign:'center' }}>Priority</span><span style={{ textAlign:'right' }}>Cost</span>
        </div>
        {/* Rows */}
        {rows.map((r, i) => {
          const m = priMeta[r.pri];
          return (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'minmax(0,1.2fr) minmax(0,1.5fr) minmax(0,1fr) 120px', gap:16, padding:'14px 18px', borderBottom: i < rows.length-1 ? '1px solid #1F1F1F' : 'none', alignItems:'center' }}>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'clamp(14px,1.3vw,17px)', letterSpacing:'-0.012em', color:'var(--uc-paper)' }}>{r.name}</span>
              <span style={{ fontFamily:'var(--font-serif)', fontSize:14, color:'var(--uc-stone-300)' }}>{r.fn}</span>
              <span style={{ justifySelf:'center' }}>
                <span style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'4px 10px', borderRadius:999, background: m.outline ? 'transparent' : m.c, border: m.outline ? '1px solid #2B2B2B' : 'none', fontFamily:'var(--font-mono)', fontSize:9.5, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color: m.outline ? 'var(--uc-stone-300)' : m.fg, whiteSpace:'nowrap' }}>
                  {!m.outline && <span style={{ width:5, height:5, borderRadius:999, background:'var(--uc-black)' }}/>}
                  {m.l}
                </span>
              </span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, color:'var(--uc-paper)', textAlign:'right' }}>{r.cost}</span>
            </div>
          );
        })}
        {/* Footer total */}
        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) auto', gap:16, padding:'14px 18px', borderTop:'1px solid #2B2B2B', background:'#0F0F0F', alignItems:'center' }}>
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'baseline', gap:'4px 14px', minWidth:0 }}>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--uc-signal)', whiteSpace:'nowrap' }}>Est. monthly</span>
            <span style={{ fontFamily:'var(--font-serif)', fontSize:13, color:'var(--uc-stone-500)' }}>Platform + apps + FTP integration</span>
          </div>
          <span style={{ fontFamily:'var(--font-hero)', fontWeight:800, fontSize:'clamp(18px,1.8vw,24px)', letterSpacing:'-0.03em', color:'var(--uc-paper)', textAlign:'right', whiteSpace:'nowrap' }}>~$2,840/mo</span>
        </div>
      </div>
      <div style={{ marginTop:16, display:'flex', gap:18, flexWrap:'wrap', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--uc-stone-500)', letterSpacing:'0.06em' }}>
        <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}><span style={{ width:8,height:8,borderRadius:999,background:'var(--uc-signal)' }}/>NEEDED TO START</span>
        <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}><span style={{ width:8,height:8,borderRadius:999,background:'#FF8B37' }}/>NEEDED ON LAUNCH</span>
        <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}><span style={{ width:8,height:8,borderRadius:999,border:'1px solid #2B2B2B' }}/>FUTURE PHASE</span>
        <span style={{ marginLeft:'auto' }}>↳ Swappable to your existing vendors</span>
      </div>
      </div>

    </BPSection>
  );
}

// ── Shared Shopify admin left navigation (used by both Uncap apps) ─────────
function ShopAdminNav({ activeApp }) {
  const pFont = '-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  const I = (p) => <svg viewBox="0 0 18 18" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>{p}</svg>;
  const main = [
    ['Home', I(<><path d="M3 8 L9 3 L15 8"/><path d="M5 8 V15 H13 V8"/></>)],
    ['Orders', I(<><path d="M5 6 V5.5 a4 4 0 0 1 8 0 V6"/><path d="M4 6 H14 L13.2 15 H4.8 Z"/></>)],
    ['Products', I(<><path d="M4 5 H14 V14 H4 Z"/><path d="M4 8 H14"/></>)],
    ['Customers', I(<><circle cx="9" cy="7" r="2.6"/><path d="M4 15 c0-3 10-3 10 0"/></>)],
    ['Marketing', I(<><path d="M4 8 L12 4 V14 L4 10 Z"/><path d="M4 8 v3"/></>)],
    ['Discounts', I(<><path d="M5 11 L12 4"/><circle cx="6.2" cy="5.6" r=".8"/><circle cx="11" cy="10.4" r=".8"/></>)],
    ['Content', I(<><path d="M5 3 H11 L14 6 V15 H5 Z"/><path d="M7 9 H12 M7 12 H11"/></>)],
    ['Analytics', I(<><path d="M4 14 V9 M9 14 V4 M14 14 V10"/></>)]
  ];
  const channels = [
    ['Online Store', I(<><circle cx="9" cy="9" r="6"/><path d="M3 9 H15"/><path d="M9 3 a8 8 0 0 1 0 12 a8 8 0 0 1 0 -12"/></>)],
    ['Point of Sale', I(<><path d="M4 4 H14 V11 H4 Z"/><path d="M6 14 H12"/></>)]
  ];
  const NavItem = ({ label, icon, active, badge }) => (
    <div style={{ display:'flex', alignItems:'center', gap:9, padding:'6px 9px', borderRadius:8, fontFamily:pFont, fontSize:12, fontWeight: active?700:500, color: active?'#1A1A1A':'#4A4A4A', background: active?'#FFFFFF':'transparent', boxShadow: active?'0 1px 0 rgba(0,0,0,0.06)':'none' }}>
      {icon}
      <span style={{ flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{label}</span>
      {badge && <span style={{ fontFamily:pFont, fontSize:9.5, fontWeight:700, color:'#4A4A4A', background:'#DADADA', borderRadius:6, padding:'1px 6px' }}>{badge}</span>}
    </div>
  );
  const Group = ({ children }) => <span style={{ fontFamily:pFont, fontSize:10, fontWeight:600, letterSpacing:'0.02em', color:'#8A8A8A', padding:'4px 9px', marginTop:8 }}>{children}</span>;
  const Child = ({ label, active }) => (
    <div style={{ display:'flex', alignItems:'center', padding:'5px 9px 5px 33px', borderRadius:8, fontFamily:pFont, fontSize:12, fontWeight: active?700:500, color: active?'#1A1A1A':'#4A4A4A', background: active?'#FFFFFF':'transparent', boxShadow: active?'0 1px 0 rgba(0,0,0,0.06)':'none' }}>{label}</div>
  );
  const AppParent = ({ label, glyph, open, active }) => (
    <div style={{ display:'flex', alignItems:'center', gap:9, padding:'6px 9px', borderRadius:8, fontFamily:pFont, fontSize:12, fontWeight: (open||active)?700:500, color: (open||active)?'#1A1A1A':'#4A4A4A', background: active?'#FFFFFF':'transparent', boxShadow: active?'0 1px 0 rgba(0,0,0,0.06)':'none' }}>
      <span style={{ width:15, height:15, borderRadius:4, background:'#1A1A1A', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:pFont, fontSize:9, fontWeight:800, color:'#95BF47', flexShrink:0 }}>{glyph}</span>
      <span style={{ flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{label}</span>
      <span style={{ color:'#8A8A8A', fontSize:10 }}>{open ? '▾' : '›'}</span>
    </div>
  );
  return (
    <div style={{ flexShrink:0, width:'clamp(132px, 15vw, 174px)', background:'#EBEBEB', borderRight:'1px solid #DEDEDE', padding:'12px 10px', display:'flex', flexDirection:'column', gap:1 }}>
      {main.map(([l,ic]) => <NavItem key={l} label={l} icon={ic} badge={l==='Orders'?'6':null}/>)}
      <Group>Sales channels</Group>
      {channels.map(([l,ic]) => <NavItem key={l} label={l} icon={ic}/>)}
      <Group>Apps</Group>
      {/* Uncap Quotes — expandable */}
      <AppParent label="Uncap Quotes" glyph="▤" open={activeApp==='quotes'}/>
      {activeApp==='quotes' && <>
        <Child label="Requests"/>
        <Child label="Quotes" active/>
        <Child label="Accounts"/>
        <Child label="Settings"/>
      </>}
      {/* Uncap Connect — expandable */}
      <AppParent label="Uncap Connect" glyph="⌖" open={activeApp==='connect'}/>
      {activeApp==='connect' && <>
        <Child label="Overview" active/>
        <Child label="Field mapping"/>
        <Child label="Sync logs"/>
        <Child label="Settings"/>
      </>}
    </div>
  );
}

// ── Uncap Quotes — Quotes tab (Shopify-embedded app, Polaris) ──────────────
function GfxQuotes() {
  const pFont = '-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  const tabs = [['All','22'],['Drafts','1'],['Sent','1'],['Viewed','3'],['Commented','4'],['Approved','5'],['Paid','7']];
  const rows = [
    { id:'Q-2087', dt:'2026-05-28', co:'Midwest Fabrication LLC', cu:'Dale Wojcik',     it:'509',  tot:'$2,406.06', exp:'2026-06-12', st:'Viewed',   cm:true },
    { id:'Q-2086', dt:'2026-05-28', co:'Rust Belt Welding Supply', cu:'Stan Petryk',     it:'20',   tot:'$2,182.80', exp:'2026-06-15', st:'Draft' },
    { id:'Q-2085', dt:'2026-05-27', co:'Great Lakes Industrial',  cu:'Sandra Liu',      it:'1230', tot:'$5,074.55', exp:'2026-06-22', st:'Approved' },
    { id:'Q-2084', dt:'2026-05-27', co:'Allegheny Iron & Forge',  cu:'Carl Bregović',   it:'12',   tot:'$1,536.52', exp:'2026-06-20', st:'Viewed',   cm:true },
    { id:'Q-2083', dt:'2026-05-27', co:'Harbor Steel Works',      cu:'Erik Lindqvist',  it:'4',    tot:'$1,060.25', exp:'2026-06-09', st:'Paid',     arch:true },
    { id:'Q-2082', dt:'2026-05-08', co:'Cascade Machine Tooling', cu:'Jen Park',        it:'4',    tot:'$2,708.16', exp:'2026-05-20', st:'Expired',  arch:true },
    { id:'Q-2081', dt:'2026-05-27', co:'Birch Run Manufacturing', cu:'Travis McCready', it:'259',  tot:'$1,244.44', exp:'2026-06-14', st:'Paid',     arch:true }
  ];
  const initials = (n) => n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  const StatusBadge = ({ st }) => {
    const map = {
      Viewed:   { bg:'#ECE6FF', fg:'#4A26A8', dot:'#7B57D6' },
      Draft:    { bg:'#EBEBEB', fg:'#616161', dot:null },
      Approved: { bg:'#CDFEE1', fg:'#014B40', dot:'#29845A' },
      Paid:     { bg:'#F1F1F1', fg:'#616161', dot:'#8A8A8A' },
      Expired:  { bg:'#FFF1E3', fg:'#5E3B00', dot:'#B98900' },
      Declined: { bg:'#FDD9D6', fg:'#8E1F0B', dot:'#D72C0D' }
    };
    const t = map[st] || map.Draft;
    return <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontFamily:pFont, fontSize:11, fontWeight:600, color:t.fg, background:t.bg, borderRadius:8, padding:'2px 8px', whiteSpace:'nowrap' }}>{t.dot && <span style={{ width:6, height:6, borderRadius:999, background:t.dot }}/>}{st}</span>;
  };
  const gridCols = 'minmax(0,72px) minmax(0,84px) minmax(0,1.3fr) minmax(0,1.1fr) minmax(0,46px) minmax(0,84px) minmax(0,84px) minmax(0,86px)';
  return (
    <div style={{ border:'1px solid var(--line-2)', borderRadius:12, overflow:'hidden', boxShadow:'0 24px 60px -32px rgba(10,10,10,0.45)' }}>
      {/* Shopify admin top bar */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 14px', background:'#1A1A1A' }}>
        <span style={{ display:'inline-flex', alignItems:'center', gap:7 }}>
          <span style={{ width:20, height:20, borderRadius:5, background:'#95BF47', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:pFont, fontSize:12, fontWeight:800, color:'#1A1A1A' }}>S</span>
          <span style={{ fontFamily:pFont, fontSize:11.5, fontWeight:600, color:'#E3E3E3' }}>{brandHandle()}-company</span>
        </span>
        <span style={{ flex:1, maxWidth:360, margin:'0 auto', display:'flex', alignItems:'center', gap:7, background:'#303030', borderRadius:8, padding:'6px 11px' }}>
          <span style={{ color:'#8A8A8A', fontSize:11 }}>⌕</span>
          <span style={{ fontFamily:pFont, fontSize:11, color:'#8A8A8A' }}>Search</span>
        </span>
        <span style={{ width:22, height:22, borderRadius:999, background:'linear-gradient(135deg,#5C6AC4,#202E78)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:pFont, fontSize:10, fontWeight:700, color:'#fff' }}>D</span>
      </div>

      <div style={{ display:'flex', background:'#F1F1F1' }}>
        {/* Shopify left navigation */}
        <ShopAdminNav activeApp="quotes"/>

        {/* Polaris page */}
        <div style={{ flex:1, minWidth:0, padding:'clamp(16px,2vw,24px)', display:'flex', flexDirection:'column', gap:14 }}>
          {/* page header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap' }}>
            <span style={{ fontFamily:pFont, fontSize:'clamp(18px,1.8vw,22px)', fontWeight:700, color:'#1A1A1A', letterSpacing:'-0.01em' }}>Quotes</span>
            <div style={{ display:'flex', gap:8 }}>
              <span style={{ fontFamily:pFont, fontSize:12, fontWeight:600, color:'#303030', background:'#FFFFFF', border:'1px solid #E3E3E3', borderRadius:8, padding:'7px 13px', boxShadow:'0 1px 0 rgba(0,0,0,0.05)' }}>Export</span>
              <span style={{ fontFamily:pFont, fontSize:12, fontWeight:600, color:'#FFFFFF', background:'#303030', borderRadius:8, padding:'7px 13px' }}>＋ Create quote</span>
            </div>
          </div>

          {/* card: tabs + filters + table */}
          <div style={{ background:'#FFFFFF', border:'1px solid #E3E3E3', borderRadius:12, boxShadow:'0 1px 0 rgba(0,0,0,0.05)', overflow:'hidden' }}>
            {/* tabs */}
            <div style={{ display:'flex', alignItems:'center', gap:2, padding:'8px 10px', borderBottom:'1px solid #F1F1F1', flexWrap:'wrap' }}>
              {tabs.map(([l,c],i)=>(
                <span key={l} style={{ display:'inline-flex', alignItems:'center', gap:5, fontFamily:pFont, fontSize:12, fontWeight: i===0?700:500, color: i===0?'#1A1A1A':'#616161', background: i===0?'#F1F1F1':'transparent', borderRadius:8, padding:'5px 10px' }}>{l}<span style={{ color:'#8A8A8A', fontWeight:400 }}>{c}</span></span>
              ))}
            </div>
            {/* filter row */}
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderBottom:'1px solid #F1F1F1' }}>
              <span style={{ flex:1, maxWidth:300, display:'flex', alignItems:'center', gap:7, background:'#FFFFFF', border:'1px solid #E3E3E3', borderRadius:8, padding:'6px 11px' }}>
                <span style={{ color:'#8A8A8A', fontSize:11 }}>⌕</span>
                <span style={{ fontFamily:pFont, fontSize:12, color:'#8A8A8A' }}>Search quotes</span>
              </span>
              <span style={{ fontFamily:pFont, fontSize:11.5, fontWeight:600, color:'#303030', background:'#FFFFFF', border:'1px solid #E3E3E3', borderRadius:8, padding:'6px 11px' }}>⚲ Filter</span>
              <span style={{ fontFamily:pFont, fontSize:11.5, fontWeight:600, color:'#303030', background:'#FFFFFF', border:'1px solid #E3E3E3', borderRadius:8, padding:'6px 11px' }}>⇅ Sort</span>
            </div>
            {/* table header */}
            <div style={{ display:'grid', gridTemplateColumns:gridCols, gap:'clamp(6px,1vw,12px)', padding:'9px 16px', background:'#FAFAFA', borderBottom:'1px solid #E3E3E3' }}>
              {[['Quote','left'],['Created','left'],['Company','left'],['Customer','left'],['Items','right'],['Total','right'],['Expires','left'],['Status','right']].map(([h,a],i)=>(<span key={i} style={{ fontFamily:pFont, fontSize:10.5, fontWeight:600, color:'#616161', textAlign:a }}>{h}</span>))}
            </div>
            {/* rows */}
            {rows.map((r,i)=>(
              <div key={r.id} style={{ display:'grid', gridTemplateColumns:gridCols, gap:'clamp(6px,1vw,12px)', padding:'10px 16px', borderBottom: i<rows.length-1?'1px solid #F1F1F1':'none', alignItems:'center', opacity: r.arch?0.62:1 }}>
                <span style={{ fontFamily:pFont, fontSize:12, fontWeight:500, color:'#1A1A1A', display:'inline-flex', alignItems:'center', gap:5 }}>{r.id}{r.cm && <span style={{ color:'#8A8A8A', fontSize:11 }}>💬</span>}</span>
                <span style={{ fontFamily:pFont, fontSize:11.5, color:'#8A8A8A', whiteSpace:'nowrap' }}>{r.dt}</span>
                <span style={{ fontFamily:pFont, fontSize:12, fontWeight:500, color:'#1A1A1A', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.co}</span>
                <span style={{ display:'inline-flex', alignItems:'center', gap:7, minWidth:0 }}>
                  <span style={{ width:20, height:20, borderRadius:999, background:'#E0E7F5', color:'#3F5CA8', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:pFont, fontSize:8.5, fontWeight:700 }}>{initials(r.cu)}</span>
                  <span style={{ fontFamily:pFont, fontSize:12, fontWeight:500, color:'#1A1A1A', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.cu}</span>
                </span>
                <span style={{ fontFamily:pFont, fontSize:12, color:'#303030', textAlign:'right' }}>{r.it}</span>
                <span style={{ fontFamily:pFont, fontSize:12, fontWeight:600, color:'#1A1A1A', textAlign:'right' }}>{r.tot}</span>
                <span style={{ fontFamily:pFont, fontSize:11.5, color:'#8A8A8A', whiteSpace:'nowrap' }}>{r.exp}</span>
                <span style={{ justifySelf:'end' }}><StatusBadge st={r.st}/></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 08 B2B ENABLEMENT ───────────────────────────────────────────────────────
function BPB2B() {
  const caps = [
    { t: 'Company accounts & roles', d: 'Multi-buyer companies, permissions, and spend limits per seat.' },
    { t: 'Catalog & price lists', d: 'Customer-specific catalogs, contract pricing, and volume breaks.' },
    { t: 'Quotes & approvals', d: 'Request, negotiate, and convert quotes to orders inside Shopify.' },
    { t: 'Payment terms', d: 'NET-30/45/60, PO numbers, and credit limits at checkout.' },
    { t: 'Quick order & reorder', d: 'One-click reorders, saved lists, and fast repeat ordering.' },
    { t: 'Sales rep tools', d: 'Order on behalf of, account dashboards, and assisted selling.' }
  ];
  const channels = ['DTC Storefront', 'B2B Portal', 'Point of Sale', 'Sales Reps'];
  return (
    <BPSection id="b2b" n="08" label="Unified" paper tail="ONE OPERATION">
      <BPHeadline>
        One experience{' '}
        <BPSerif>across every channel.</BPSerif>
      </BPHeadline>
      <p style={{ marginTop:'clamp(20px, 2.4vw, 28px)', maxWidth:640, fontFamily:'var(--font-serif)', fontSize:'clamp(15px, 1.3vw, 18px)', lineHeight:1.5, color:'var(--fg-2)' }}>
        Native Shopify B2B primitives, configured for your accounts, terms, and sales motion — no bolt-on platform required.
      </p>

      {/* Convergence diagram + capability list */}
      <div style={{ marginTop:'clamp(32px, 4vw, 56px)', display:'grid', gridTemplateColumns:'minmax(0, 0.85fr) minmax(0, 1.15fr)', gap:'clamp(28px, 4vw, 64px)', alignItems:'center' }}>
        {/* Channels → one core */}
        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,auto) minmax(0,auto)', gap:'clamp(10px,1.4vw,18px)', alignItems:'center' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {channels.map((c, i) => (
              <div key={i} style={{ fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, letterSpacing:'0.04em', color:'var(--fg-1)', padding:'10px 12px', border:'1px solid var(--line-2)', borderRadius:5, background:'var(--uc-paper)', textAlign:'center', whiteSpace:'nowrap' }}>{c}</div>
            ))}
          </div>
          {/* connectors */}
          <svg viewBox="0 0 60 200" preserveAspectRatio="none" style={{ width:'clamp(36px,5vw,60px)', height:'100%', alignSelf:'stretch' }}>
            {[28, 76, 124, 172].map((y, i) => (
              <path key={i} d={`M0 ${y} C 30 ${y}, 30 100, 60 100`} fill="none" stroke="var(--uc-stone-500)" strokeWidth="1.4"/>
            ))}
            <circle cx="58" cy="100" r="3" fill="var(--uc-signal)" stroke="var(--uc-black)" strokeWidth="1"/>
          </svg>
          {/* one core */}
          <div style={{ width:'clamp(78px,9vw,116px)', aspectRatio:'1/1', borderRadius:999, background:'var(--uc-black)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, boxShadow:'0 0 0 6px rgba(232,255,82,0.14)' }}>
            <span style={{ fontFamily:'var(--font-hero)', fontWeight:700, fontSize:'clamp(15px,1.6vw,20px)', letterSpacing:'-0.03em', color:'var(--uc-paper)' }}>One</span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.16em', color:'var(--uc-signal)' }}>SHOPIFY CORE</span>
          </div>
        </div>

        {/* Capability list */}
        <div style={{ display:'flex', flexDirection:'column', borderTop:'1px solid var(--line-1)' }}>
          {caps.map((x, i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'minmax(0,40px) minmax(0,1fr)', gap:16, alignItems:'baseline', padding:'clamp(13px,1.5vw,18px) 0', borderBottom:'1px solid var(--line-1)', position:'relative' }}>
              <span aria-hidden="true" style={{ position:'absolute', top:0, left:0, width:16, height:2, background:'var(--uc-signal)' }}/>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-3)' }}>{String(i+1).padStart(2,'0')}</span>
              <div>
                <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'clamp(15px,1.4vw,19px)', letterSpacing:'-0.015em', color:'var(--fg-1)' }}>{x.t}</span>
                <span style={{ fontFamily:'var(--font-serif)', fontSize:14, lineHeight:1.4, color:'var(--fg-2)', display:'block', marginTop:3 }}>{x.d}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Uncap Quotes app — Quotes tab */}
      <div style={{ marginTop:'clamp(44px, 5.5vw, 80px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'clamp(16px, 1.8vw, 22px)' }}>
          <span aria-hidden="true" style={{ width:16, height:2, background:'var(--uc-signal)' }}/>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--fg-3)' }}>Uncap Quotes · Shopify admin</span>
        </div>
        <BPHeadline>
          Quote management,{' '}
          <BPSerif>start to signed.</BPSerif>
        </BPHeadline>
        <p style={{ marginTop:'clamp(16px, 2vw, 24px)', maxWidth:680, fontFamily:'var(--font-serif)', fontSize:'clamp(15px, 1.3vw, 18px)', lineHeight:1.5, color:'var(--fg-2)', textWrap:'pretty' }}>
          Capture requests, build and send quotes, run approvals, negotiate line by line with threaded comments, collect payment against invoices, and collaborate with your team and buyers — every quote, end to end, inside Shopify.
        </p>
        <div style={{ marginTop:'clamp(24px, 3vw, 40px)' }}>
          <GfxQuotes/>
        </div>
      </div>

      <div style={{ marginTop:20, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-3)', letterSpacing:'0.06em' }}>
        ↳ Built on Shopify B2B (Plus) · extended by Uncap products where needed
      </div>
    </BPSection>
  );
}

// ── 09 SYSTEM INTEGRATIONS ──────────────────────────────────────────────────
function BPIntegrations() {
  const pFont = '-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  const maps = [
    { l:'Order',       d:'→', r:'orders_YYYYMMDD.csv' },
    { l:'Customer',    d:'→', r:'customers.csv' },
    { l:'Line items',  d:'→', r:'order_lines.csv' },
    { l:'Inventory',   d:'←', r:'inventory.csv' },
    { l:'Fulfillment', d:'←', r:'shipments.csv' }
  ];
  const activity = [
    ['orders_20260521.csv · 42 orders exported to FTP', '2 min ago'],
    ['inventory.csv · 1,284 items reconciled', '9 min ago'],
    ['customers.csv · 3 new commercial accounts pushed', '14 min ago']
  ];
  const Card = ({ children, pad=true }) => (
    <div style={{ background:'#FFFFFF', border:'1px solid #E3E3E3', borderRadius:12, boxShadow:'0 1px 0 rgba(0,0,0,0.05)', padding: pad ? '14px 16px' : 0 }}>{children}</div>
  );
  const Badge = ({ children, tone='info' }) => {
    const t = tone==='success' ? { bg:'#CDFEE1', fg:'#014B40' } : tone==='attention' ? { bg:'#FFF1E3', fg:'#5E3B00' } : { bg:'#EBF5FA', fg:'#00527C' };
    return <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontFamily:pFont, fontSize:11, fontWeight:600, color:t.fg, background:t.bg, borderRadius:8, padding:'2px 8px', whiteSpace:'nowrap' }}>{children}</span>;
  };
  return (
    <BPSection id="integrations" n="09" label="Integrated" tail="HOW IT CONNECTS">
      <BPHeadline>
        One operation,{' '}
        <BPSerif>not five silos.</BPSerif>
      </BPHeadline>
      <p style={{ marginTop:'clamp(18px, 2.2vw, 26px)', maxWidth:640, fontFamily:'var(--font-serif)', fontSize:'clamp(15px, 1.3vw, 18px)', lineHeight:1.5, color:'var(--fg-2)' }}>
        Uncap Connect runs as a Shopify-embedded app — a scheduled, bidirectional flat-file sync
        over FTP with field-level mapping and a live sync log, managed right inside admin.
      </p>

      {/* Shopify-embedded app (Polaris) */}
      <div style={{ marginTop:'clamp(30px, 4vw, 52px)', border:'1px solid var(--line-2)', borderRadius:12, overflow:'hidden', boxShadow:'0 24px 60px -32px rgba(10,10,10,0.45)' }}>
        {/* Shopify admin top bar */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 14px', background:'#1A1A1A' }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:7 }}>
            <span style={{ width:20, height:20, borderRadius:5, background:'#95BF47', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:pFont, fontSize:12, fontWeight:800, color:'#1A1A1A' }}>S</span>
            <span style={{ fontFamily:pFont, fontSize:11.5, fontWeight:600, color:'#E3E3E3' }}>{brandHandle()}-company</span>
          </span>
          <span style={{ flex:1, maxWidth:360, margin:'0 auto', display:'flex', alignItems:'center', gap:7, background:'#303030', borderRadius:8, padding:'6px 11px' }}>
            <span style={{ color:'#8A8A8A', fontSize:11 }}>⌕</span>
            <span style={{ fontFamily:pFont, fontSize:11, color:'#8A8A8A' }}>Search</span>
          </span>
          <span style={{ width:22, height:22, borderRadius:999, background:'linear-gradient(135deg,#5C6AC4,#202E78)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:pFont, fontSize:10, fontWeight:700, color:'#fff' }}>D</span>
        </div>

        {/* admin nav + Polaris page */}
        <div style={{ display:'flex', background:'#F1F1F1' }}>
          {/* Shopify standard left navigation */}
          <ShopAdminNav activeApp="connect"/>

          {/* Polaris page */}
          <div style={{ flex:1, minWidth:0, padding:'clamp(16px,2vw,24px)', display:'flex', flexDirection:'column', gap:14 }}>
          {/* page header */}
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:14, flexWrap:'wrap' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
              <span style={{ fontFamily:pFont, fontSize:11.5, color:'#005BD3', fontWeight:600 }}>‹ Apps</span>
              <span style={{ display:'inline-flex', alignItems:'center', gap:10 }}>
                <span style={{ fontFamily:pFont, fontSize:'clamp(18px,1.8vw,22px)', fontWeight:700, color:'#1A1A1A', letterSpacing:'-0.01em' }}>Uncap Connect</span>
                <Badge tone="success"><span style={{ width:6, height:6, borderRadius:999, background:'#29845A' }}/>Connected</Badge>
              </span>
              <span style={{ fontFamily:pFont, fontSize:12.5, color:'#616161' }}>FTP flat-file integration</span>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <span style={{ fontFamily:pFont, fontSize:12, fontWeight:600, color:'#303030', background:'#FFFFFF', border:'1px solid #E3E3E3', borderRadius:8, padding:'7px 13px', boxShadow:'0 1px 0 rgba(0,0,0,0.05)' }}>View logs</span>
              <span style={{ fontFamily:pFont, fontSize:12, fontWeight:600, color:'#FFFFFF', background:'#303030', borderRadius:8, padding:'7px 13px' }}>Sync now</span>
            </div>
          </div>

          {/* connection card */}
          <Card>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                <span style={{ width:34, height:34, borderRadius:8, background:'#101A2B', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:pFont, fontSize:11, fontWeight:800, color:'#9FB4FF' }}>FTP</span>
                <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                  <span style={{ fontFamily:pFont, fontSize:13.5, fontWeight:700, color:'#1A1A1A' }}>SFTP · Flat-file sync</span>
                  <span style={{ fontFamily:pFont, fontSize:11.5, color:'#616161' }}>sftp.northwest.ca/exchange · Every 15 min · Last sync 2 min ago</span>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                <Badge tone="info">Real-time</Badge>
                <Badge tone="info">Bidirectional</Badge>
                <span style={{ display:'inline-flex', border:'1px solid #E3E3E3', borderRadius:8, overflow:'hidden' }}>
                  {['Real-time','Scheduled'].map((m,i)=>(<span key={m} style={{ fontFamily:pFont, fontSize:11, fontWeight:600, padding:'6px 11px', background:i===0?'#303030':'#FFFFFF', color:i===0?'#FFFFFF':'#616161' }}>{m}</span>))}
                </span>
              </div>
            </div>
          </Card>

          {/* field mapping card */}
          <Card pad={false}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:'13px 16px', borderBottom:'1px solid #E3E3E3' }}>
              <span style={{ fontFamily:pFont, fontSize:13.5, fontWeight:700, color:'#1A1A1A' }}>Field mapping · Order ⇄ Sales Order</span>
              <span style={{ fontFamily:pFont, fontSize:12, fontWeight:600, color:'#005BD3' }}>Edit</span>
            </div>
            {/* table header */}
            <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1.3fr) clamp(48px,6vw,72px) minmax(0,1.3fr) minmax(0,90px)', gap:'clamp(8px,1.2vw,16px)', padding:'8px 16px', background:'#FAFAFA', borderBottom:'1px solid #E3E3E3' }}>
              {['Shopify','','FTP file','Status'].map((h,i)=>(<span key={i} style={{ fontFamily:pFont, fontSize:10.5, fontWeight:600, color:'#616161', textAlign:i===3?'right':'left' }}>{h}</span>))}
            </div>
            {maps.map((m,i)=>(
              <div key={i} style={{ display:'grid', gridTemplateColumns:'minmax(0,1.3fr) clamp(48px,6vw,72px) minmax(0,1.3fr) minmax(0,90px)', gap:'clamp(8px,1.2vw,16px)', padding:'10px 16px', borderBottom: i<maps.length-1?'1px solid #F1F1F1':'none', alignItems:'center' }}>
                <span style={{ fontFamily:pFont, fontSize:12.5, fontWeight:600, color:'#1A1A1A', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m.l}</span>
                <span style={{ fontFamily:pFont, fontSize:13, fontWeight:700, color: m.d==='←' ? '#B98900' : '#616161', textAlign:'center' }}>{m.d}</span>
                <span style={{ fontFamily:pFont, fontSize:12.5, color:'#303030', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m.r}</span>
                <span style={{ justifySelf:'end' }}><Badge tone="success">Synced</Badge></span>
              </div>
            ))}
          </Card>

          {/* activity card */}
          <Card pad={false}>
            <div style={{ padding:'13px 16px', borderBottom:'1px solid #E3E3E3', fontFamily:pFont, fontSize:13.5, fontWeight:700, color:'#1A1A1A' }}>Recent activity</div>
            {activity.map((a,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:11, padding:'10px 16px', borderBottom: i<activity.length-1?'1px solid #F1F1F1':'none' }}>
                <span style={{ width:7, height:7, borderRadius:999, background:'#29845A', flexShrink:0 }}/>
                <span style={{ fontFamily:pFont, fontSize:12.5, color:'#303030', flex:1, minWidth:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a[0]}</span>
                <span style={{ fontFamily:pFont, fontSize:11.5, color:'#8A8A8A', whiteSpace:'nowrap' }}>{a[1]}</span>
              </div>
            ))}
          </Card>
          </div>
        </div>
      </div>

      <div style={{ marginTop:20, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-3)', letterSpacing:'0.06em' }}>
        ↳ Native Shopify-embedded app · field maps owned and versioned · no manual re-keying
      </div>
    </BPSection>
  );
}

function BPMigration() {
  const steps = [
    { t: 'Audit & map', s: 'Catalogue every record — products, customers, orders, content, redirects.' },
    { t: 'Transform', s: 'Clean, dedupe, and re-map data to the new model. Nothing copied blind.' },
    { t: 'Stage & verify', s: 'Dry-run into staging. Reconcile counts, spot-check edge cases.' },
    { t: 'Cutover', s: 'Final delta sync, 301 redirect map, DNS switch with zero lost orders.' }
  ];
  const stats = ['Products', 'Collections', 'Customers', 'Companies', 'Orders'];
  return (
    <BPSection id="migration" n="10" label="Data" paper tail="MOVE WITHOUT LOSS" vec="bgVector2">
      <BPHeadline>
        Implement{' '}
        <BPSerif>without losing a thing.</BPSerif>
      </BPHeadline>
      <p style={{ marginTop: 18, maxWidth: 600, fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)', lineHeight: 1.5, color: 'var(--fg-2)' }}>
        We migrate cart-to-cart — every product, customer, and order — and re-map the
        messy parts: legacy categories become tags, custom attributes become metafields,
        old URLs become 301s. Nothing copied blind, nothing lost.
      </p>

      {/* cart-to-cart field crosswalk */}
      {(() => {
        const source = [['Title','text'],['SKU','text'],['Price','money'],['Brand','text'],['Categories','list'],['spec_sheet','custom'],['install_guide','custom'],['Legacy URL','url']];
        const target = [['Title','text','1:1'],['SKU / Variant','text','1:1'],['Price','money','1:1'],['Vendor','text','from Brand'],['Tags','list','merged'],['spec_sheet','metafield','metafield'],['install_guide','metafield','metafield'],['Redirect','url','301']];
        const links = [[0,0,1],[1,1,1],[2,2,1],[3,3,0],[3,4,0],[4,4,0],[5,5,0],[6,6,0],[7,7,0]];
        const cols = '1fr clamp(54px,8vw,108px) 1fr';
        const tBadge = (t) => <span style={{ fontFamily:'var(--font-mono)', fontSize:8.5, fontWeight:700, letterSpacing:'0.04em', textTransform:'uppercase', color:'var(--fg-3)', background:'var(--uc-bone)', border:'1px solid var(--line-1)', borderRadius:3, padding:'1px 5px', whiteSpace:'nowrap' }}>{t}</span>;
        return (
          <div style={{ marginTop:'clamp(30px, 4vw, 48px)', border:'1px solid var(--line-2)', borderRadius:10, overflow:'hidden', background:'var(--uc-paper)', boxShadow:'0 24px 60px -34px rgba(10,10,10,0.4)' }}>
            {/* platform header */}
            <div style={{ display:'grid', gridTemplateColumns:cols, alignItems:'center', borderBottom:'1px solid var(--line-1)', background:'var(--uc-bone)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px' }}>
                <span style={{ width:26, height:26, borderRadius:6, background:'#121118', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-hero)', fontSize:12, fontWeight:800, color:'#8FA0FF' }}>B</span>
                <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
                  <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, letterSpacing:'-0.01em', color:'var(--fg-1)' }}>BigCommerce</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)' }}>Legacy store · 12,480 records</span>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:8.5, fontWeight:700, letterSpacing:'0.14em', color:'var(--fg-3)' }}>MIGRATE</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:14, fontWeight:800, color:'var(--uc-signal)', background:'var(--uc-black)', borderRadius:4, padding:'1px 9px' }}>→</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:10, padding:'12px 16px' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:1, alignItems:'flex-end' }}>
                  <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, letterSpacing:'-0.01em', color:'var(--fg-1)' }}>Shopify Plus</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--fg-3)' }}>New store · mapped & verified</span>
                </div>
                <span style={{ width:26, height:26, borderRadius:6, background:'#1A1A1A', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-hero)', fontSize:12, fontWeight:800, color:'#95BF47' }}>S</span>
              </div>
            </div>
            {/* record type tabs */}
            <div style={{ display:'flex', alignItems:'center', gap:16, padding:'9px 16px', borderBottom:'1px solid var(--line-1)', flexWrap:'wrap' }}>
              {['Products','Customers','Orders','Content'].map((t,i)=>(<span key={t} style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:11.5, letterSpacing:'-0.01em', color:i===0?'var(--fg-1)':'var(--fg-3)', borderBottom:i===0?'2px solid var(--uc-black)':'2px solid transparent', paddingBottom:3 }}>{t}</span>))}
              <span style={{ marginLeft:'auto', display:'inline-flex', alignItems:'center', gap:6, fontFamily:'var(--font-mono)', fontSize:9.5, fontWeight:700, color:'#2F7D52' }}><span style={{ width:6, height:6, borderRadius:999, background:'#3F8B5D' }}/>Field map verified</span>
            </div>
            {/* crosswalk */}
            <div style={{ position:'relative', display:'grid', gridTemplateColumns:cols, minHeight:'clamp(300px, 33vw, 392px)' }}>
              {/* left record */}
              <div style={{ display:'flex', flexDirection:'column' }}>
                {source.map(([n,ty],i)=>(
                  <div key={i} style={{ position:'relative', flex:1, display:'flex', alignItems:'center', justifyContent:'flex-end', gap:9, padding:'0 16px', borderTop:i?'1px solid var(--line-1)':'none' }}>
                    {tBadge(ty)}
                    <span style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:'clamp(12px,1.1vw,14.5px)', color:'var(--fg-1)', whiteSpace:'nowrap' }}>{n}</span>
                    <span style={{ position:'absolute', right:-4, top:'50%', transform:'translateY(-50%)', width:7, height:7, borderRadius:999, background:'var(--uc-paper)', border:'1.5px solid var(--fg-3)' }}/>
                  </div>
                ))}
              </div>
              {/* connectors */}
              <div style={{ position:'relative' }}>
                <svg width="100%" height="100%" viewBox="0 0 100 1000" preserveAspectRatio="none" style={{ position:'absolute', inset:0, display:'block' }}>
                  {links.map(([sI,tI,k],j)=>{ const yL=(sI+0.5)/source.length*1000; const yR=(tI+0.5)/target.length*1000; return <path key={j} d={'M0 '+yL+' C 55 '+yL+' 45 '+yR+' 100 '+yR} fill="none" stroke={k?'var(--uc-signal)':'var(--uc-brand)'} strokeWidth="2" strokeDasharray={k?'0':'7 5'} vectorEffect="non-scaling-stroke"/>; })}
                </svg>
              </div>
              {/* right record */}
              <div style={{ display:'flex', flexDirection:'column' }}>
                {target.map(([n,ty,tf],i)=>(
                  <div key={i} style={{ position:'relative', flex:1, display:'flex', alignItems:'center', gap:9, padding:'0 16px', borderTop:i?'1px solid var(--line-1)':'none' }}>
                    <span style={{ position:'absolute', left:-4, top:'50%', transform:'translateY(-50%)', width:7, height:7, borderRadius:999, background:'var(--uc-paper)', border:'1.5px solid var(--fg-3)' }}/>
                    <span style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:'clamp(12px,1.1vw,14.5px)', color:'var(--fg-1)', whiteSpace:'nowrap' }}>{n}</span>
                    <span style={{ marginLeft:'auto', fontFamily:'var(--font-mono)', fontSize:8.5, fontWeight:700, letterSpacing:'0.03em', whiteSpace:'nowrap', color: tf==='1:1'?'var(--fg-3)':'var(--uc-black)', background: tf==='1:1'?'transparent':'var(--uc-signal)', border: tf==='1:1'?'1px solid var(--line-1)':'1px solid var(--uc-signal)', borderRadius:3, padding:'1px 6px' }}>{tf}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* legend */}
            <div style={{ display:'flex', alignItems:'center', gap:18, padding:'11px 16px', borderTop:'1px solid var(--line-1)', background:'var(--uc-bone)', flexWrap:'wrap', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--fg-3)' }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:7 }}><span style={{ width:18, height:2, background:'var(--uc-signal)' }}/>1:1 copy</span>
              <span style={{ display:'inline-flex', alignItems:'center', gap:7 }}><span style={{ width:18, height:2, background:'repeating-linear-gradient(90deg, var(--uc-brand) 0 5px, transparent 5px 9px)' }}/>Transformed — tags · metafields · 301s</span>
              <span style={{ marginLeft:'auto' }}>Tags, custom fields &amp; attributes preserved</span>
            </div>
          </div>
        );
      })()}

      {/* guarantee strip */}
      <div style={{ marginTop: 'clamp(28px, 3vw, 40px)', paddingTop: 'clamp(24px, 3vw, 36px)', borderTop: '1px solid var(--line-1)', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {stats.map((s, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '10px 16px', border: '1px solid var(--line-2)', borderRadius: 999, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(14px, 1.3vw, 17px)', letterSpacing: '-0.01em', color: 'var(--fg-1)' }}>
            <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--uc-signal)' }}/>
            {s}
          </span>
        ))}
      </div>
    </BPSection>
  );
}
window.BPMigration = BPMigration;

function BPDelivery() {
  const milestones = [
    { wk: 'WK 01', t: 'Kickoff + Blueprint start', s: 'Discovery, architecture, data model.' },
    { wk: 'WK 03', t: 'Blueprint sign-off', s: 'Plan, prototype, and budget locked.' },
    { wk: 'WK 06', t: 'Storefront alpha', s: 'Core theme + catalog in staging.' },
    { wk: 'WK 09', t: 'Integrations live', s: 'ERP sync + B2B flows validated.' },
    { wk: 'WK 11', t: 'Migration + QA', s: 'Data moved, redirects, full QA pass.' },
    { wk: 'WK 12', t: 'Launch', s: 'Go live + 30-day support begins.' }
  ];
  return (
    <BPSection id="delivery" n="11" label="Delivery" paper tail="TIMELINE">
      <BPHeadline>
        Sixteen weeks,{' '}
        <BPSerif>phase by phase.</BPSerif>
      </BPHeadline>

      {/* Gantt timeline */}
      <BPGantt/>

      {/* Dedicated project team */}
      <div style={{ marginTop: 'clamp(48px, 6vw, 88px)', paddingTop: 'clamp(32px, 4vw, 52px)', borderTop: '1px solid var(--line-2)' }}>
        {/* eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <span aria-hidden="true" style={{ width: 16, height: 2, background: 'var(--uc-signal)' }}/>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>Delivery Team</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'clamp(28px, 5vw, 72px)', alignItems: 'start' }}>
          {/* left: heading + body */}
          <div>
            <h3 style={{
              margin: 0, fontFamily: 'var(--font-hero)', fontWeight: 700,
              fontSize: 'clamp(28px, 3.4vw, 52px)', letterSpacing: '-0.035em', lineHeight: 1.0, color: 'var(--fg-1)'
            }}>
              Your dedicated{' '}
              <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>project team.</span>
            </h3>
          </div>
          {/* right: short summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.2vw, 18px)', lineHeight: 1.55, color: 'var(--fg-2)' }}>
            <p style={{ margin: 0 }}>
              A dedicated <strong style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--fg-1)' }}>Project Lead</strong> runs the build day-to-day — your single point of contact, with weekly 1:1s and full <strong style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--fg-1)' }}>ClickUp</strong> transparency.
            </p>
            <p style={{ margin: 0 }}>
              They&rsquo;re backed by a <strong style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--fg-1)' }}>Director of Delivery</strong> overseeing the work, a <strong style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--fg-1)' }}>Technical Lead</strong> on architecture &amp; build, a <strong style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--fg-1)' }}>Creative Lead</strong> on experience &amp; UI, and specialist teams across data and QA.
            </p>
          </div>
        </div>
      </div>
    </BPSection>
  );
}

// ── RISK ASSESSMENT ─────────────────────────────────────────────────────────
function BPRiskAssessment() {
  const sev = {
    Low:    { c: 'var(--uc-signal)', label: 'Low' },
    Medium: { c: '#FF8B37',          label: 'Medium' },
    High:   { c: 'var(--uc-error)',  label: 'High' }
  };
  const risks = [
    { t: 'Data migration integrity', sev: 'High',
      d: 'Products, customers, and orders don\u2019t map cleanly off the legacy stack.',
      m: 'Dry-run into staging, reconcile counts, and spot-check edge cases before cutover.' },
    { t: 'ERP integration complexity', sev: 'High',
      d: 'Bidirectional ERP sync is the hardest dependency — mismatches can block orders.',
      m: 'Field-level mapping validated early via Uncap Connect, with a live sync log.' },
    { t: 'Scope creep mid-build', sev: 'Medium',
      d: 'New requests surface once the build is underway and pull at budget and timeline.',
      m: 'Fixed scope up front, with a pre-approved buffer allowance for out-of-scope asks.' }
  ];
  return (
    <BPSection id="risks" n="12" label="Risks" tail="EYES OPEN">
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 'clamp(28px, 5vw, 80px)', alignItems: 'end' }}>
        <BPHeadline>
          Named upfront,{' '}
          <BPSerif>managed by design.</BPSerif>
        </BPHeadline>
        <p style={{ margin: 0, maxWidth: 380, fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)', lineHeight: 1.5, color: 'var(--fg-2)', textWrap: 'pretty' }}>
          Every implementation carries risk. Here are the ones we watch — each paired with how we manage it.
        </p>
      </div>

      {/* Risk list */}
      <div style={{ marginTop: 'clamp(30px, 4vw, 52px)', borderTop: '1px solid var(--line-1)' }}>
        {risks.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
            gap: 'clamp(20px, 4vw, 56px)', alignItems: 'baseline',
            padding: 'clamp(20px, 2.4vw, 28px) 0', borderBottom: '1px solid var(--line-1)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: sev[r.sev].c, flexShrink: 0 }}/>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>{sev[r.sev].label} severity</span>
              </div>
              <div style={{ fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 'clamp(20px, 2vw, 28px)', letterSpacing: '-0.03em', lineHeight: 1.05, color: 'var(--fg-1)' }}>{r.t}</div>
              <div style={{ marginTop: 8, fontFamily: 'var(--font-serif)', fontSize: 'clamp(14px, 1.2vw, 16px)', lineHeight: 1.5, color: 'var(--fg-2)', textWrap: 'pretty' }}>{r.d}</div>
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-1)', borderBottom: '2px solid var(--uc-signal)', paddingBottom: 1 }}>Mitigation</span>
              <div style={{ marginTop: 10, fontFamily: 'var(--font-serif)', fontSize: 'clamp(14px, 1.2vw, 16px)', lineHeight: 1.5, color: 'var(--fg-1)', textWrap: 'pretty' }}>{r.m}</div>
            </div>
          </div>
        ))}
      </div>
    </BPSection>
  );
}

// ── 07 TEAM ─────────────────────────────────────────────────────────────────
function BPTeam() {
  const team = [
    { n: 'Denis Dyli', r: 'CEO, Principal', img: 'assets/team-denis.webp' },
    { n: 'Michael Johnson', r: 'Head of Services', img: 'assets/team-michael.webp' },
    { n: 'Jo Tan', r: 'Head of Design', img: 'assets/team-jo.webp' },
    { n: 'Vishal Ranpariya', r: 'Head of Products', img: 'assets/team-vishal.webp' },
    { n: 'Jack Patel', r: 'Head of Solutions', img: 'assets/team-jack.webp' }
  ];
  return (
    <BPSection id="team" n="15" label="Team" tail="WHO DOES THE WORK">
      <BPHeadline>
        Senior from{' '}
        <BPSerif>day one.</BPSerif>
      </BPHeadline>
      <p style={{ marginTop: 18, maxWidth: 600, fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)', lineHeight: 1.5, color: 'var(--fg-2)' }}>
        The team in this proposal is the team in the work. No bait-and-switch, no
        outsourced QA. You&rsquo;ll meet everyone on the first call.
      </p>
      <div style={{
        marginTop: 'clamp(32px, 4vw, 48px)',
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14
      }}>
        {team.map((p, i) => (
          <div key={i} style={{ background: 'var(--uc-paper)', border: '1px solid var(--line-2)', borderRadius: 5, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ aspectRatio: '1/1', background: 'var(--uc-stone-200)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {p.img
                ? <img src={p.img} loading="lazy" decoding="async" alt={p.n} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
                : <span aria-hidden="true" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(26px, 2.6vw, 40px)', letterSpacing: '-0.02em', color: 'var(--fg-3)' }}>{p.n.split(' ').map((w) => w[0]).join('')}</span>}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '-0.012em', color: 'var(--fg-1)' }}>{p.n}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', marginTop: 4 }}>{p.r}</div>
            </div>
          </div>
        ))}
      </div>
    </BPSection>
  );
}

// ── 08 INVESTMENT ───────────────────────────────────────────────────────────
function BPInvestmentCard({ p }) {
  const [h, setH] = React.useState(false);
  const feat = p.feature;
  const fg = feat ? 'var(--uc-paper)' : 'var(--fg-1)';
  const sub = feat ? 'var(--uc-stone-300)' : 'var(--fg-2)';
  const faint = feat ? 'var(--uc-stone-500)' : 'var(--fg-3)';
  const line = feat ? '#1F1F1F' : 'var(--line-1)';
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: feat ? 'var(--uc-black)' : 'var(--uc-paper)',
      color: fg,
      border: '1px solid ' + (feat ? 'var(--uc-black)' : 'var(--line-2)'),
      borderRadius: 12,
      padding: 'clamp(22px, 2.4vw, 32px)',
      display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2vw, 22px)'
    }}>
      {feat && <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: 'var(--uc-signal)' }}/>}

      {/* identity */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.6vw, 16px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: faint }}>PACKAGE {p.n}</span>
          {feat && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--uc-black)', background: 'var(--uc-signal)', borderRadius: 999, padding: '2px 8px' }}>POPULAR</span>}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(28px, 3vw, 40px)', letterSpacing: '-0.04em', lineHeight: 0.92, color: fg }}>{p.name}</div>
          <div style={{ marginTop: 8, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(15px, 1.3vw, 18px)', color: sub }}>{p.tagline}</div>
        </div>
        <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 'clamp(13.5px, 1.1vw, 15px)', lineHeight: 1.5, color: sub, textWrap: 'pretty' }}>{p.who}</p>
      </div>

      {/* price + CTA */}
      <div style={{ paddingTop: 'clamp(14px, 1.8vw, 18px)', borderTop: '1px solid ' + line }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: faint }}>{p.priceLabel}</div>
        <div style={{ marginTop: 6, fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(26px, 2.8vw, 38px)', letterSpacing: '-0.045em', lineHeight: 0.9, color: fg }}>{p.price}</div>
      </div>

      {/* the work */}
      <div style={{ paddingTop: 'clamp(14px, 1.8vw, 18px)', borderTop: '1px solid ' + line }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: faint, marginBottom: 14 }}>{p.workLabel}</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {p.work.map((w, i) => (
            <li key={i} style={{ display: 'grid', gridTemplateColumns: '15px 1fr', gap: 10, alignItems: 'start' }}>
              <span style={{ marginTop: 2, width: 13, height: 13, borderRadius: 999, background: 'var(--uc-signal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="7" height="7" viewBox="0 0 12 12" fill="none"><path d="M2 6 L5 9 L10 3" stroke="var(--uc-black)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(12.5px, 1vw, 13.5px)', fontWeight: 500, lineHeight: 1.4, color: feat ? 'var(--uc-stone-300)' : 'var(--fg-1)' }}>{w}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* outcome */}
      <div style={{ marginTop: 'auto', padding: 'clamp(14px, 1.6vw, 18px)', background: feat ? '#141414' : 'var(--uc-bone)', border: '1px solid ' + line, borderRadius: 8 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: faint, marginBottom: 7 }}>You walk away with</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(14px, 1.2vw, 16px)', lineHeight: 1.45, color: fg, textWrap: 'pretty' }}>{p.outcome}</div>
      </div>
    </div>
  );
}

function BPInvestment() {
  const work = [
    'Tech stack architecture, scoped up front',
    'Shopify theme-based design, configured and branded for ' + brandName(),
    'Front and back-end Shopify development',
    'Essential integrations: payments, shipping, core tools',
    'Data migration: products, customers, orders, content',
    'Shopify-side ERP integration guidance',
    'Full B2B enablement: companies, catalogs, checkout',
    'Enriched customer account experience',
    'Workflow automation across your systems',
    'SEO and GEO, so you launch findable',
    'Go live, a clean handoff, and a 30-day warranty'
  ];
  const integration = [
    'Scheduled SFTP exchange — secure, bidirectional flat files',
    'Orders and customers exported from Shopify',
    'Prices and inventory imported from your back office',
    'Field-level mapping with validation and error handling',
    'Live sync log and alerts inside Shopify admin',
    'Dry-runs in staging, then a monitored cutover'
  ];
  const schedule = [
    { n: '01', amount: '$54,000', due: 'Due at signup', share: '1/2' },
    { n: '02', amount: '$27,000', due: 'Due at design approval', share: '1/4' },
    { n: '03', amount: '$27,000', due: 'Due at project completion', share: '1/4' }
  ];
  return (
    <BPSection id="investment" n="13" label="Investment" dark tail="FIXED · NO SURPRISES">
      {/* One package — split panel */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: '#0F0F0F', color: 'var(--uc-paper)',
        border: '1px solid #1F1F1F', borderRadius: 12,
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)'
      }}>
        <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: 'var(--uc-signal)', zIndex: 2 }}/>

        {/* LEFT — identity + price */}
        <div style={{ padding: 'clamp(28px, 3.4vw, 52px)', display: 'flex', flexDirection: 'column', gap: 'clamp(18px, 2vw, 26px)' }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(40px, 5vw, 76px)', letterSpacing: '-0.045em', lineHeight: 0.9, color: 'var(--uc-paper)' }}>Shopify <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '0.62em', letterSpacing: '-0.02em' }}>Implementation</span></h3>
            <div style={{ marginTop: 'clamp(14px, 1.6vw, 20px)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(17px, 1.6vw, 24px)', lineHeight: 1.25, color: 'var(--uc-stone-300)', textWrap: 'pretty' }}>Your store and your integrated systems, working as one.</div>
          </div>
          <p style={{ margin: 0, maxWidth: 460, fontFamily: 'var(--font-serif)', fontSize: 'clamp(14.5px, 1.2vw, 17px)', lineHeight: 1.55, color: 'var(--uc-stone-300)', textWrap: 'pretty' }}>
            A modern unified B2C/B2B storefront on Shopify Plus with a tech stack and customer
            experience — everything {brandName()} needs to launch and scale.
          </p>

          {/* price — standout box */}
          <div style={{ padding: 'clamp(18px, 2vw, 26px) clamp(20px, 2.2vw, 28px)', background: 'var(--uc-signal)', borderRadius: 12, boxShadow: '0 22px 60px -26px rgba(232,255,82,0.45)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--uc-black)' }}>Fixed price</div>
            <div style={{ marginTop: 4, fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(52px, 6vw, 88px)', letterSpacing: '-0.05em', lineHeight: 0.85, color: 'var(--uc-black)' }}>$76k</div>
          </div>

          {/* walk away */}
          <div style={{ marginTop: 'auto', padding: 'clamp(16px, 1.8vw, 22px)', background: '#141414', border: '1px solid #1F1F1F', borderRadius: 10 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--uc-stone-500)', marginBottom: 8 }}>You walk away with</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)', lineHeight: 1.4, color: 'var(--uc-paper)', textWrap: 'pretty' }}>Your successful commerce implementation on Shopify, built for growth.</div>
          </div>
        </div>

        {/* RIGHT — the work */}
        <div style={{ padding: 'clamp(28px, 3.4vw, 52px)', borderLeft: '1px solid #1F1F1F' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--uc-stone-500)', marginBottom: 'clamp(18px, 2vw, 26px)' }}>The work</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'clamp(13px, 1.5vw, 18px)' }}>
            {work.map((w, i) => (
              <li key={i} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 14, alignItems: 'start' }}>
                <span style={{ marginTop: 1, width: 18, height: 18, borderRadius: 999, background: 'var(--uc-signal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6 L5 9 L10 3" stroke="var(--uc-black)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(14px, 1.15vw, 16.5px)', fontWeight: 500, lineHeight: 1.35, color: 'var(--uc-stone-300)', textWrap: 'pretty' }}>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Integration — separate panel */}
      <div style={{
        marginTop: 16, position: 'relative', overflow: 'hidden',
        background: '#0F0F0F', color: 'var(--uc-paper)',
        border: '1px solid #1F1F1F', borderRadius: 12,
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)'
      }}>
        <div style={{ padding: 'clamp(24px, 3vw, 44px)', display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 1.8vw, 22px)' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--uc-stone-500)', marginBottom: 12 }}>Integration</div>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(30px, 3.6vw, 54px)', letterSpacing: '-0.045em', lineHeight: 0.9, color: 'var(--uc-paper)' }}>FTP <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '0.62em', letterSpacing: '-0.02em' }}>File Synchronization</span></h3>
            <div style={{ marginTop: 'clamp(12px, 1.4vw, 16px)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(15px, 1.4vw, 20px)', lineHeight: 1.3, color: 'var(--uc-stone-300)', textWrap: 'pretty' }}>Prices, orders and customers — kept in step with your back office.</div>
          </div>
          <div style={{ marginTop: 'auto', alignSelf: 'flex-start', padding: 'clamp(14px, 1.6vw, 20px) clamp(20px, 2.2vw, 28px)', background: 'var(--uc-signal)', borderRadius: 12, boxShadow: '0 22px 60px -26px rgba(232,255,82,0.45)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--uc-black)' }}>Fixed price</div>
            <div style={{ marginTop: 4, fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(40px, 4.4vw, 64px)', letterSpacing: '-0.05em', lineHeight: 0.85, color: 'var(--uc-black)' }}>$32k</div>
          </div>
        </div>
        <div style={{ padding: 'clamp(24px, 3vw, 44px)', borderLeft: '1px solid #1F1F1F' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--uc-stone-500)', marginBottom: 'clamp(16px, 1.8vw, 22px)' }}>The work</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.4vw, 16px)' }}>
            {integration.map((w, i) => (
              <li key={i} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 14, alignItems: 'start' }}>
                <span style={{ marginTop: 1, width: 18, height: 18, borderRadius: 999, background: 'var(--uc-signal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6 L5 9 L10 3" stroke="var(--uc-black)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(14px, 1.15vw, 16.5px)', fontWeight: 500, lineHeight: 1.35, color: 'var(--uc-stone-300)', textWrap: 'pretty' }}>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Payment schedule */}
      <div style={{ marginTop: 'clamp(28px, 3.2vw, 44px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'clamp(16px, 1.8vw, 22px)' }}>
          <span aria-hidden="true" style={{ width: 16, height: 2, background: 'var(--uc-signal)' }}/>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--uc-stone-500)' }}>Payment schedule</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {schedule.map((s, i) => (
            <div key={i} style={{
              position: 'relative', overflow: 'hidden',
              background: 'var(--uc-paper)', border: '1px solid var(--line-2)', borderRadius: 10,
              padding: 'clamp(20px, 2.2vw, 28px)', display: 'flex', flexDirection: 'column', gap: 'clamp(18px, 2.4vw, 30px)'
            }}>
              {i === 0 && <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: 'var(--uc-signal)' }}/>}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-2)' }}>Installment {i + 1}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--fg-3)' }}>{s.share} of total</span>
              </div>
              <div style={{ fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(30px, 3.4vw, 46px)', letterSpacing: '-0.04em', lineHeight: 0.9, color: 'var(--fg-1)' }}>{s.amount}</div>
              <div style={{ paddingTop: 'clamp(12px, 1.4vw, 16px)', borderTop: '1px solid var(--line-1)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.04em', color: 'var(--fg-2)' }}>{s.due}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Buffer allowance */}
      <div style={{
        marginTop: 16, padding: 'clamp(22px, 2.6vw, 32px)',
        border: '1px dashed #2B2B2B', borderRadius: 12, background: '#0F0F0F',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, auto)',
        gap: 'clamp(20px, 4vw, 48px)', alignItems: 'center'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span aria-hidden="true" style={{ width: 16, height: 2, background: 'var(--uc-signal)' }}/>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--uc-stone-500)' }}>Buffer Allowance</span>
          </div>
          <div style={{ fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 'clamp(20px, 2vw, 28px)', letterSpacing: '-0.03em', lineHeight: 1.05, color: 'var(--uc-paper)' }}>A reserve for what comes up mid-build.</div>
          <p style={{ margin: '10px 0 0', maxWidth: 640, fontFamily: 'var(--font-serif)', fontSize: 'clamp(13.5px, 1.1vw, 15px)', lineHeight: 1.55, color: 'var(--uc-stone-300)', textWrap: 'pretty' }}>
            The Buffer Allowance is an incremental charge in addition to the fixed project price and provides a pre-agreed pool of hours at a discounted hourly rate for approved out-of-scope requests, new ideas, and wishlist items. When an out-of-scope item is approved, the full allocated hours are charged, regardless of actual time spent. Any unused hours can be applied to other approved out-of-scope work or carried forward for post-launch enhancements. The Buffer Allowance is separate from the fixed-price project scope and is only charged when utilized.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--uc-stone-500)' }}>If needed</div>
          <div style={{ marginTop: 6, fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(34px, 3.6vw, 52px)', letterSpacing: '-0.045em', lineHeight: 0.9, color: 'var(--uc-paper)' }}>$18k</div>
          <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 10px', border: '1px solid #2B2B2B', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--uc-stone-300)', whiteSpace: 'nowrap' }}><span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--uc-signal)' }}/>135 service hours</div>
        </div>
      </div>
    </BPSection>
  );
}

// ── 11 GROWTH ───────────────────────────────────────────────────────────────
function BPGrowth() {
  // Same plan data and selector as the estimate template's Managed Growth
  // table (estimate-template/EstimateTemplate.jsx) — keep the two in sync.
  const PLANS = [
    { id: 'core', name: 'Core', sub: 'Advisory + essentials', price: '$2,500' },
    { id: 'optimize', name: 'Optimize', sub: 'Most popular', price: '$5,000' },
    { id: 'accelerate', name: 'Accelerate', sub: 'Embedded partner', price: '$9,000' },
  ];
  const GROWTH_ROWS = [
    { label: 'Engagement Model', v: ['Advisory-first support & essential execution', 'Operational optimization & execution', 'Embedded growth partnership'] },
    { label: 'Service Capacity', v: ['15 hrs / month', '35 hrs / month', '65 hrs / month'] },
    { label: 'Strategic Planning', v: ['Quarterly assessment & roadmap', 'Monthly assessment & roadmap', 'Bi-weekly strategy & planning'] },
    { label: 'Founder & Exec Alignment', v: ['\u2014', 'Allocated 1-1 office hours', '1-1 office hours & mastermind sessions'] },
    { label: 'CRO Services', v: ['\u2014', 'Essential CRO', 'Strategic CRO, SEO/GEO & Retention'] },
    { label: 'Meetings & Cadence', v: ['Monthly call', 'Bi-weekly calls', 'Weekly calls'] },
    { label: 'Account Management', v: ['Shared delivery team', 'Senior-led delivery', 'Dedicated account manager'] },
    { label: 'Reporting & Insights', v: ['Quarterly', 'Monthly', 'Bi-weekly performance review'] },
    { label: 'Primary Focus', v: ['Stability & direction', 'Lower TCO, efficiency, controlled growth', 'Velocity, experimentation & scale'] },
    { label: 'Best For', v: ['Teams needing guidance, light execution, and a clear roadmap', 'Ops-led teams focused on efficiency, reliability, and measurable improvement', 'Teams requiring white-glove execution and weekly leadership involvement'] },
    { label: 'Contract', v: ['Month-To-Month', 'Month-To-Month', 'Month-To-Month'] },
  ];
  const services = [
    { t: 'Revenue.', d: 'Upsells, cross-sells, bundles, and personalization raise order value, so the store does more with the same traffic.' },
    { t: 'Optimization.', d: 'Faster pages, fewer drop-offs, and more of the visitors you already have turning into orders.' },
    { t: 'Retention.', d: 'Email automation, self-service portals, quick reorders, and membership clubs bring buyers back.' },
    { t: 'Operations.', d: 'We integrate your systems and automate the robot work, so your people focus on what grows the business.' }
  ];
  const [plan, setPlan] = React.useState('optimize');
  const check = (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6 L5 9 L10 3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
  return (
    <BPSection id="growth" n="14" label="Growth" paper tail="AFTER LAUNCH">
      <BPHeadline>
        Launch is the start.{' '}
        <BPSerif>Growth is the work.</BPSerif>
      </BPHeadline>
      <p style={{
        marginTop: 'clamp(20px, 2.4vw, 28px)', maxWidth: 640,
        fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)',
        lineHeight: 1.5, color: 'var(--fg-2)'
      }}>
        Post-launch, we stay embedded as your growth team — turning a live store into a
        compounding revenue operation. Retainers start the month after go-live, and run
        month-to-month after the first quarter — move up or down as the season demands.
      </p>
      <div style={{ marginTop: 'clamp(32px, 4vw, 48px)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {services.map((sv, i) => (
          <div key={i} style={{
            background: '#0F0F0F', border: '1px solid #1F1F1F', borderRadius: 8,
            padding: 'clamp(22px, 2.6vw, 30px)', display: 'flex', flexDirection: 'column', gap: 12,
            position: 'relative', overflow: 'hidden', color: 'var(--uc-paper)'
          }}>
            <span aria-hidden="true" style={{ position: 'absolute', right: 22, bottom: -28, fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(90px, 9vw, 150px)', letterSpacing: '-0.05em', lineHeight: 1, color: 'rgba(255,255,255,0.05)', pointerEvents: 'none', userSelect: 'none' }}>{String(i + 1).padStart(2, '0')}</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-stone-500)', letterSpacing: '0.06em' }}>{String(i + 1).padStart(2, '0')} / 04</span>
              <span aria-hidden="true" style={{ width: 16, height: 3, background: 'var(--uc-signal)' }}/>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(22px, 2.2vw, 30px)', letterSpacing: '-0.025em', color: 'var(--uc-paper)', position: 'relative' }}>{sv.t}</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14.5, lineHeight: 1.5, color: 'var(--uc-stone-300)', position: 'relative', textWrap: 'pretty' }}>{sv.d}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'clamp(26px, 3.2vw, 40px)', overflowX: 'auto' }}>
        <div style={{ minWidth: 780, paddingTop: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) repeat(3, minmax(0,1fr))', borderTop: '1px solid var(--line-2)' }}>
            <span style={{ padding: '16px 18px 14px 0', borderBottom: '1px solid var(--line-2)', display: 'flex', alignItems: 'flex-end', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>Compare</span>
            {PLANS.map((pl) => {
              const on = plan === pl.id;
              return (
                <span key={pl.id} onClick={() => setPlan(pl.id)} style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'flex-end', cursor: 'pointer', position: 'relative', zIndex: on ? 1 : 0, padding: on ? '20px 18px 14px' : '16px 18px 14px', marginTop: on ? -18 : 0, borderBottom: '1px solid var(--line-2)', borderTop: '2px solid ' + (on ? 'var(--uc-black)' : 'transparent'), borderLeft: '2px solid ' + (on ? 'var(--uc-black)' : 'transparent'), borderRight: '2px solid ' + (on ? 'var(--uc-black)' : 'transparent'), borderRadius: on ? '10px 10px 0 0' : 0, background: on ? 'var(--uc-paper)' : 'transparent', boxShadow: on ? '0 -3px 0 var(--uc-signal) inset' : 'none' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 'clamp(19px, 1.9vw, 26px)', letterSpacing: '-0.035em', color: 'var(--fg-1)' }}>{pl.name}</span>
                    {pl.id === 'optimize' ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--uc-signal)', color: 'var(--uc-black)', borderRadius: 999, padding: '3px 7px' }}>Recommended</span> : null}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)' }}>{pl.sub}</span>
                </span>
              );
            })}
            {GROWTH_ROWS.map((r, ri) => (
              <React.Fragment key={ri}>
                <span style={{ padding: '12px 18px 12px 0', borderBottom: '1px solid var(--line-1)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '-0.005em', color: 'var(--fg-1)' }}>{r.label}</span>
                {PLANS.map((pl, i) => {
                  const on = plan === pl.id;
                  return <span key={pl.id} style={{ padding: '12px 18px', borderBottom: '1px solid var(--line-1)', borderLeft: '2px solid ' + (on ? 'var(--uc-black)' : 'transparent'), borderRight: '2px solid ' + (on ? 'var(--uc-black)' : 'transparent'), background: on ? 'var(--uc-paper)' : 'transparent', color: on ? 'var(--fg-1)' : 'var(--fg-2)', fontWeight: on ? 500 : 400, fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.45 }}>{r.v[i]}</span>;
                })}
              </React.Fragment>
            ))}
            <span style={{ padding: '18px 18px 8px 0', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-3)', display: 'flex', alignItems: 'center' }}>Monthly investment</span>
            {PLANS.map((pl) => {
              const on = plan === pl.id;
              return <span key={pl.id} style={{ padding: '18px 18px 8px', fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(22px, 2.3vw, 30px)', letterSpacing: '-0.04em', color: 'var(--fg-1)', borderLeft: '2px solid ' + (on ? 'var(--uc-black)' : 'transparent'), borderRight: '2px solid ' + (on ? 'var(--uc-black)' : 'transparent'), background: on ? 'var(--uc-paper)' : 'transparent' }}>{pl.price}<span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500, letterSpacing: 0, color: 'var(--fg-3)' }}>/mo</span></span>;
            })}
            <span/>
            {PLANS.map((pl) => {
              const on = plan === pl.id;
              return (
                <span key={pl.id} onClick={() => setPlan(pl.id)} style={{ padding: '4px 18px 20px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', borderLeft: '2px solid ' + (on ? 'var(--uc-black)' : 'transparent'), borderRight: '2px solid ' + (on ? 'var(--uc-black)' : 'transparent'), borderBottom: '2px solid ' + (on ? 'var(--uc-black)' : 'transparent'), borderRadius: on ? '0 0 10px 10px' : 0, background: on ? 'var(--uc-paper)' : 'transparent' }}>
                  <span style={{ flex: '0 0 auto', width: 20, height: 20, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid ' + (on ? 'var(--uc-black)' : 'var(--uc-stone-500)'), background: on ? 'var(--uc-signal)' : 'transparent', color: on ? 'var(--uc-black)' : 'transparent' }}>{check}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-2)' }}>{on ? 'Selected' : 'Choose'}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
      <p style={{ margin: '10px 0 0', fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.06em', color: 'var(--fg-3)' }}>RETAINER PRICING IS SEPARATE FROM THE PROJECT INVESTMENT ABOVE</p>
    </BPSection>
  );
}

// ── 09 WHY UNCAP ────────────────────────────────────────────────────────────
function BPWhy() {
  const reviews = [
    { name: 'Clutch', score: '4.9' },
    { name: 'Google', score: '4.9' },
    { name: 'Shopify', score: '5.0' },
    { name: 'Trustpilot', score: '4.9' }
  ];
  const clients = ['blueroot','canon','e3sparkplugs','eea','farmers','garrison','genuinescooter','industryrailway','kbs','microfiberwholesale','pawstruck','phoenixmecano','sanitaire','signwarehouse','thermosoft','ulegroup','vermontwoods','vosges','weldingstore','warehouselighting'];
  return (
    <BPSection id="why" n="16" label="Uncap" dark tail="THE CASE">
      <BPHeadline dark>
        Uncap Commerce.{' '}
        <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--uc-stone-300)' }}>Unified.</span>
      </BPHeadline>

      {/* Platinum partner badge */}
      <div style={{ marginTop: 'clamp(28px, 3vw, 40px)', display: 'inline-flex', alignItems: 'center', gap: 16, padding: '12px 20px', background: '#111', border: '1px solid #2B2B2B', borderRadius: 6 }}>
        <img src={window.__resources.uncapLogoWhite} alt="Uncap" style={{ height: 22, display: 'block' }}/>
        <span style={{ width: 1, height: 22, background: '#2B2B2B' }}/>
        <img src={window.__resources.shopifyBadge} alt="Shopify Platinum Partner" style={{ height: 22, display: 'block', filter: 'brightness(0) invert(1)' }}/>
      </div>

      {/* About Uncap intro + stats */}
      <div style={{
        marginTop: 'clamp(26px, 3vw, 40px)',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)',
        gap: 'clamp(24px, 4vw, 64px)', alignItems: 'center'
      }}>
        <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 'clamp(17px, 1.7vw, 24px)', lineHeight: 1.45, color: 'var(--uc-paper)', textWrap: 'pretty' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Uncap</span> is the Shopify Platinum Partner behind hundreds of operator-led brands, manufacturers, and distributors — uncapping growth across B2B and B2C.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #1F1F1F' }}>
          {[
            { v: '2013', l: 'Shopify experts since' },
            { v: '380+', l: 'Projects launched' }
          ].map((s, i) => (
            <div key={i} style={{ padding: '16px 0', borderBottom: '1px solid #1F1F1F', display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <span style={{ fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(30px, 3.4vw, 48px)', letterSpacing: '-0.045em', lineHeight: 0.9, color: 'var(--uc-paper)', whiteSpace: 'nowrap' }}>{s.v}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--uc-stone-500)' }}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Client logos */}
      <div style={{ marginTop: 'clamp(32px, 4vw, 48px)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--uc-stone-500)', marginBottom: 14 }}>↳ Operators we&rsquo;ve shipped for</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '8px' }}>
          {clients.map((c, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--uc-paper)', borderRadius: 6, padding: '8px 10px', height: 'clamp(38px, 3.4vw, 48px)' }}>
              <img src={`assets/logos/${c}.svg`} loading="lazy" decoding="async" alt={c} style={{ maxHeight: '100%', maxWidth: '100%', width: 'auto', display: 'block' }}/>
            </span>
          ))}
        </div>
      </div>

      {/* Recognition / reviews */}
      <div style={{ marginTop: 'clamp(28px, 3vw, 40px)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--uc-stone-500)', marginBottom: 16 }}>↳ Recognized by</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderTop: '1px solid #1F1F1F', borderBottom: '1px solid #1F1F1F' }}>
          {reviews.map((r, i) => (
            <div key={i} style={{ padding: '20px 20px 20px 0', paddingLeft: i > 0 ? 20 : 0, borderLeft: i > 0 ? '1px solid #1F1F1F' : 'none', position: 'relative' }}>
              <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: i > 0 ? 20 : 0, width: 14, height: 2, background: 'var(--uc-signal)' }}/>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(24px, 2.6vw, 38px)', letterSpacing: '-0.04em', color: 'var(--uc-paper)' }}>{r.score}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-signal)' }}>★</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--uc-stone-500)', marginTop: 8 }}>{r.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* One review */}
      <div style={{ marginTop: 'clamp(32px, 4vw, 48px)', paddingTop: 'clamp(28px, 3vw, 40px)', borderTop: '1px solid #1F1F1F' }}>
        <blockquote style={{ margin: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(22px, 2.6vw, 38px)', letterSpacing: '-0.02em', lineHeight: 1.25, color: 'var(--uc-paper)', maxWidth: 900, textWrap: 'pretty', position: 'relative', paddingLeft: 22 }}>
          <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: 4, bottom: 4, width: 3, background: 'var(--uc-signal)' }}/>
          &ldquo;We earned Platinum Partner status along the way, but the thing we&rsquo;re proudest of is the trust. An unchallengeable reputation as a partner that delivers. And customers who came to us for one project and stayed for over ten years.&rdquo;
        </blockquote>
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="assets/team-denis.webp" loading="lazy" decoding="async" alt="Denis Dyli" style={{ width: 44, height: 44, borderRadius: 999, objectFit: 'cover', flexShrink: 0, border: '1px solid #2B2B2B' }}/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em' }}>
            <span style={{ color: 'var(--uc-paper)', fontWeight: 700 }}>Denis Dyli</span>
            <span style={{ color: 'var(--uc-stone-500)' }}>Founder</span>
          </div>
        </div>
      </div>
    </BPSection>
  );
}

// ── PROOF ───────────────────────────────────────────────────────────────────
function BPProof() {
  const variants = {
    dark:   { bg: 'var(--uc-black)', border: 'var(--uc-black)', fg: 'var(--uc-paper)', sub: 'var(--uc-stone-300)', faint: 'var(--uc-stone-500)', line: '#1F1F1F', avBg: '#2B2B2B', avFg: 'var(--uc-paper)', avLine: '#3A3A3A', dashed: false },
    signal: { bg: 'var(--uc-signal)', border: 'var(--uc-signal)', fg: 'var(--uc-black)', sub: 'rgba(10,10,10,0.78)', faint: 'rgba(10,10,10,0.55)', line: 'rgba(10,10,10,0.16)', avBg: 'rgba(10,10,10,0.08)', avFg: 'var(--uc-black)', avLine: 'rgba(10,10,10,0.2)', dashed: false },
    paper:  { bg: 'var(--uc-paper)', border: 'var(--line-2)', fg: 'var(--fg-1)', sub: 'var(--fg-2)', faint: 'var(--fg-3)', line: 'var(--line-1)', avBg: 'var(--uc-bone)', avFg: 'var(--fg-1)', avLine: 'var(--line-1)', borderStyle: 'solid' },
    dotted: { bg: 'var(--uc-bone)', border: 'var(--uc-stone-300)', fg: 'var(--fg-1)', sub: 'var(--fg-2)', faint: 'var(--fg-3)', line: 'var(--line-1)', avBg: 'var(--uc-paper)', avFg: 'var(--fg-1)', avLine: 'var(--line-1)', borderStyle: 'dotted' }
  };
  const cards = [
    { v: 'dark', q: 'I cannot praise Uncap enough. They are a hell of a team.', n: 'Andy Blechschmidt', c: 'Jerico' },
    { v: 'dotted', q: 'The integration of our platforms created an easy solution that even our complex systems sales teams can use.', stat: '83% Lower TCO', statL: 'Total cost of ownership on Shopify', n: 'Bryan Snyder', c: 'Canon Medical' },
    { v: 'paper', q: 'During the Blueprint, Uncap walked through every requirement — what was native, what needed an app, and what was custom.', stat: '1M SKUs', statL: 'Mapped to sync from Epicor to Shopify', n: 'Denise Foley', c: 'ULE Group' },
    { v: 'paper', q: 'The professionalism, high quality of the design, timely communication and responsiveness have been greatly appreciated (especially compared to our previous dev agency partner).', stat: 'BigCommerce\nMigration', statL: 'Migrated to Shopify with Uncap', n: 'Kiki Fischer', c: 'Rescue Essentials' },
    { v: 'signal', q: 'They are brilliant and very knowledgeable of all that Shopify can do.', stat: 'Product Configurations', statL: 'Custom product ordering for manufacturing', n: 'Peggy Farabaugh', c: 'Vermont Woods' },
    { v: 'dotted', q: 'Uncap demonstrated a deep understanding of the Shopify ecosystem from the get-go.', stat: 'Custom ERP', statL: 'Integration data mapping for Shopify', n: 'Andy Morgan', c: 'ScooterWorks' },
    { v: 'paper', q: 'The personal touch and constant communication is what separates them from other companies with a 50+ person team where the attention to detail may be lost.', n: 'Brandt DeVries', c: 'WeldingStore' },
    { v: 'dark', q: 'The team and internal stakeholders were impressed with Uncap\u2019s vast technical expertise.', stat: '60 Days', statL: 'Migrating to Shopify after Blueprint', n: 'Todd Arey', c: 'E3 Spark Plugs' }
  ];
  const Stars = ({ color }) => (
    <div style={{ display: 'flex', gap: 3 }}>{[0,1,2,3,4].map(i => (<span key={i} style={{ color, fontSize: 12 }}>★</span>))}</div>
  );
  const initials = (n) => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <BPSection id="proof" n="17" label="Proof" paper tail="ON THE RECORD">
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 'clamp(28px, 5vw, 80px)', alignItems: 'end' }}>
        <BPHeadline>
          Don&rsquo;t take{' '}
          <BPSerif>our word for it.</BPSerif>
        </BPHeadline>
        <p style={{ margin: 0, maxWidth: 380, fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)', lineHeight: 1.5, color: 'var(--fg-2)', textWrap: 'pretty' }}>
          Operators who ran the same play — replatformed, integrated, and grew on Shopify with Uncap.
        </p>
      </div>

      {/* Masonry of testimonials */}
      <div style={{ marginTop: 'clamp(28px, 3.5vw, 44px)', columnWidth: 300, columnGap: 14 }}>
        {cards.map((card, i) => {
          const t = variants[card.v];
          return (
            <div key={i} style={{
              breakInside: 'avoid', marginBottom: 14, width: '100%',
              background: t.bg, color: t.fg,
              border: '1px ' + (t.borderStyle || 'solid') + ' ' + t.border,
              borderRadius: 12, padding: 'clamp(20px, 2.2vw, 26px)',
              display: 'flex', flexDirection: 'column', gap: 14
            }}>
              <Stars color={t.fg}/>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(15px, 1.4vw, 18px)', lineHeight: 1.35, letterSpacing: '-0.01em', color: t.fg, textWrap: 'pretty' }}>&ldquo;{card.q}&rdquo;</div>

              {card.stat && (
                <div style={{ paddingTop: 14, borderTop: '1px solid ' + t.line, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(22px, 2.2vw, 30px)', letterSpacing: '-0.04em', lineHeight: 0.95, color: t.fg, textTransform: 'uppercase', overflowWrap: 'anywhere', whiteSpace: 'pre-line' }}>{card.stat}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.faint, lineHeight: 1.4 }}>{card.statL}</span>
                </div>
              )}

              <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid ' + t.line, display: 'flex', alignItems: 'center', gap: 11 }}>
                <span style={{ width: 32, height: 32, borderRadius: 999, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, background: t.avBg, color: t.avFg, border: '1px solid ' + t.avLine }}>{initials(card.n)}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, letterSpacing: '-0.01em', color: t.fg, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.n}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: t.faint, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.c}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </BPSection>
  );
}

// ── Approve & kickoff CTA. Clicking opens an inline signature modal that
// captures the signer's full name and title; submitting POSTs them to
// /api/auth/sign which persists a record in KV (1-year TTL) and emails
// denis@uncap.com with the signer + timestamp + IP + user-agent. The
// button only flips to the disabled "Approved ✓" pill after the server
// confirms the signature was recorded. ──
function BPApproveButton() {
  const APPROVED_KEY = 'northwest_approved_v1';
  const [state, setState]       = React.useState(
    () => (typeof window !== 'undefined' && window.sessionStorage.getItem(APPROVED_KEY) === '1') ? 'approved' : 'idle'
  );
  const [name, setName]         = React.useState('');
  const [title, setTitle]       = React.useState('');
  const [error, setError]       = React.useState('');
  const nameRef                 = React.useRef(null);
  const BRAND_NAME              = 'The North West Company';
  const MSA                     = (typeof window !== 'undefined' && window.UncapMSA) || null;

  React.useEffect(() => {
    if (state === 'signing' && nameRef.current) nameRef.current.focus();
  }, [state]);

  React.useEffect(() => {
    if (state !== 'signing' && state !== 'submitting') return;
    const onKey = (e) => { if (e.key === 'Escape' && state === 'signing') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state]);

  const openModal = () => { setError(''); setState('signing'); };
  const closeModal = () => { setState('idle'); setError(''); };

  const onSubmit = async (e) => {
    e.preventDefault();
    const n = name.trim();
    const t = title.trim();
    if (!n || !t) { setError('Both fields required'); return; }
    setState('submitting');
    try {
      const token = (typeof window !== 'undefined' && window.__bpToken) || '';
      const resp = await fetch('/api/auth/sign', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, name: n, title: t }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.ok) {
        setError(data.error || 'Could not record signature');
        setState('signing');
        return;
      }
      try { window.sessionStorage.setItem(APPROVED_KEY, '1'); } catch (_) {}
      setState('approved');
    } catch (_) {
      setError('Network error — try again.');
      setState('signing');
    }
  };

  if (state === 'approved') {
    return (
      <button
        type="button"
        disabled
        aria-label="Approved"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '16px 26px', fontSize: 15,
          background: 'var(--uc-paper)', color: 'var(--uc-black)',
          border: '1px solid var(--uc-paper)', borderRadius: 'var(--radius)',
          fontFamily: 'var(--font-sans)', fontWeight: 600, letterSpacing: '-0.005em',
          lineHeight: 1, cursor: 'default'
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22, borderRadius: 999,
            background: 'var(--uc-signal)', color: 'var(--uc-black)'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2.5 6.2 L4.8 8.5 L9.5 3.5"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        Approved
      </button>
    );
  }

  return (
    <React.Fragment>
      <button
        type="button"
        onClick={openModal}
        className="uc-btn b-signal"
        style={{ padding: '16px 26px', fontSize: 15, border: 'none', cursor: 'pointer' }}
      >
        Approve &amp; kickoff <span>→</span>
      </button>

      {(state === 'signing' || state === 'submitting') && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Sign to approve"
          onClick={(e) => { if (e.target === e.currentTarget && state === 'signing') closeModal(); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(10,10,10,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, fontFamily: 'var(--font-sans)', color: 'var(--fg-1)'
          }}
        >
          <form
            onSubmit={onSubmit}
            style={{
              width: '100%', maxWidth: 720,
              maxHeight: '90vh', overflowY: 'auto',
              background: 'var(--uc-paper)',
              border: '1px solid var(--uc-black)',
              borderRadius: 8, padding: 32,
              boxShadow: '0 24px 60px -28px rgba(10,10,10,0.45)'
            }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 20,
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-3)'
            }}>
              <span style={{ width: 14, height: 2, background: 'var(--uc-signal)' }}/>
              Sign to approve
            </div>
            <h2 style={{
              margin: '0 0 8px',
              fontFamily: 'var(--font-hero)', fontWeight: 800,
              fontSize: 'clamp(24px, 3.4vw, 30px)', lineHeight: 1.04,
              letterSpacing: '-0.025em'
            }}>Approve &amp; kickoff.</h2>
            <p style={{
              margin: '0 0 22px',
              fontFamily: 'var(--font-serif)', fontStyle: 'italic',
              fontSize: 14.5, lineHeight: 1.5, color: 'var(--fg-2)'
            }}>
              Your name and title are recorded as the authorising signer on
              this Blueprint and timestamped to your IP.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                <label style={{
                  display: 'block', marginBottom: 6,
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-3)'
                }}>Full name</label>
                <input
                  ref={nameRef}
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (error) setError(''); }}
                  placeholder="Jane Doe"
                  autoComplete="name"
                  disabled={state === 'submitting'}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '12px 14px',
                    fontFamily: 'var(--font-sans)', fontSize: 17, fontWeight: 500,
                    color: 'var(--fg-1)', background: 'var(--uc-cream)',
                    border: '1px solid ' + (error ? 'var(--uc-error)' : 'var(--line-1)'),
                    borderRadius: 5, outline: 'none',
                    transition: 'border-color .15s var(--ease-out)'
                  }}
                  onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = 'var(--uc-black)'; }}
                  onBlur={(e)  => { if (!error) e.currentTarget.style.borderColor = 'var(--line-1)'; }}
                />
              </div>
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                <label style={{
                  display: 'block', marginBottom: 6,
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-3)'
                }}>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); if (error) setError(''); }}
                  placeholder="Director of Operations"
                  autoComplete="organization-title"
                  disabled={state === 'submitting'}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '12px 14px',
                    fontFamily: 'var(--font-sans)', fontSize: 17, fontWeight: 500,
                    color: 'var(--fg-1)', background: 'var(--uc-cream)',
                    border: '1px solid ' + (error ? 'var(--uc-error)' : 'var(--line-1)'),
                    borderRadius: 5, outline: 'none',
                    transition: 'border-color .15s var(--ease-out)'
                  }}
                  onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = 'var(--uc-black)'; }}
                  onBlur={(e)  => { if (!error) e.currentTarget.style.borderColor = 'var(--line-1)'; }}
                />
              </div>
            </div>

            {error && (
              <div style={{
                marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-error)'
              }}>{error}</div>
            )}

            <div style={{ marginTop: 26, paddingTop: 22, borderTop: '1px solid var(--line-1)' }}>
              <p style={{
                margin: '0 0 18px',
                fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                fontSize: 13.5, lineHeight: 1.5, color: 'var(--fg-2)'
              }}>
                Review the agreement below. Signing &amp; approving binds {BRAND_NAME} to
                these terms as the Effective Date.
              </p>
              {MSA ? <MSA
                company={BRAND_NAME}
                name={name.trim()}
                title={title.trim()}
                actions={
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={state === 'submitting'}
                      style={{
                        flex: '0 0 auto',
                        padding: '12px 18px', fontSize: 14, fontFamily: 'var(--font-sans)',
                        fontWeight: 600, letterSpacing: '-0.005em', lineHeight: 1,
                        background: 'transparent', color: 'var(--fg-2)',
                        border: '1px solid var(--line-1)', borderRadius: 'var(--radius)',
                        cursor: state === 'submitting' ? 'default' : 'pointer'
                      }}
                    >Cancel</button>
                    <button
                      type="submit"
                      disabled={state === 'submitting' || !name.trim() || !title.trim()}
                      className="uc-btn b-signal"
                      style={{
                        flex: 1, justifyContent: 'center',
                        padding: '12px 18px', fontSize: 14, border: 'none',
                        cursor: (state === 'submitting' || !name.trim() || !title.trim()) ? 'default' : 'pointer',
                        opacity: state === 'submitting' ? 0.7 : 1
                      }}
                    >
                      {state === 'submitting' ? 'Recording…' : 'Sign & approve'} <span>→</span>
                    </button>
                  </div>
                }
              /> : null}
            </div>
          </form>
        </div>
      )}
    </React.Fragment>
  );
}

// ── 10 NEXT STEPS ───────────────────────────────────────────────────────────
function BPNext() {
  const steps = [
    { n: '01', t: 'Approve this Blueprint', d: 'Sign off on scope, timeline, and investment.' },
    { n: '02', t: 'Onboard within one week', d: 'Discovery session + access to systems.' },
    { n: '03', t: 'Ship in 20 weeks', d: 'Launch live, then move into Growth.' }
  ];
  return (
    <BPSection id="next" n="18" label="Next" paper tail="LET'S GO">
      <BPHeadline>
        Three steps{' '}
        <BPSerif>to start.</BPSerif>
      </BPHeadline>
      <div style={{
        marginTop: 'clamp(32px, 4vw, 56px)',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16
      }}>
        {steps.map(s => (
          <div key={s.n} style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 18, borderTop: '1px solid var(--line-1)' }}>
            <span aria-hidden="true" style={{ width: 18, height: 2, background: 'var(--uc-signal)' }}/>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>{s.n}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(20px, 2vw, 26px)', letterSpacing: '-0.02em', color: 'var(--fg-1)' }}>{s.t}</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15, lineHeight: 1.5, color: 'var(--fg-2)' }}>{s.d}</span>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 'clamp(40px, 5vw, 64px)',
        padding: 'clamp(28px, 4vw, 48px)',
        background: 'var(--uc-black)', color: 'var(--uc-paper)', borderRadius: 5,
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, auto)',
        gap: 32, alignItems: 'center'
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 'clamp(28px, 3.4vw, 52px)', letterSpacing: '-0.035em', lineHeight: 1.0, color: 'var(--uc-paper)' }}>
            Ready to uncap{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--uc-signal)' }}>the ceiling?</span>
          </div>
          <div style={{ marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--uc-stone-300)' }}>hey@uncap.com · (312) 469-0944 · Chicago, IL</div>
        </div>
        <BPApproveButton/>
      </div>
    </BPSection>
  );
}

// ── Floating left nav ──────────────────────────────────────────────────────
function BPNav() {
  const items = [
    { id: 'intro',       n: '00', l: 'Intro' },
    { id: 'summary',     n: '01', l: 'Summary' },
    { id: 'where',       n: '02', l: 'Today' },
    { id: 'objectives',  n: '03', l: 'Objectives' },
    { id: 'approach',    n: '04', l: 'Approach' },
    { id: 'scope',       n: '05', l: 'Scope' },
    { id: 'performance', n: '06', l: 'Commerce' },
    { id: 'techstack',   n: '07', l: 'Architecture' },
    { id: 'b2b',         n: '08', l: 'Unified' },
    { id: 'integrations',n: '09', l: 'Integrated' },
    { id: 'migration',   n: '10', l: 'Data' },
    { id: 'delivery',    n: '11', l: 'Delivery' },
    { id: 'risks',       n: '12', l: 'Risks' },
    { id: 'investment',  n: '13', l: 'Investment' },
    { id: 'growth',      n: '14', l: 'Growth' },
    { id: 'team',        n: '15', l: 'Team' },
    { id: 'why',         n: '16', l: 'Uncap' },
    { id: 'proof',       n: '17', l: 'Proof' },
    { id: 'next',        n: '18', l: 'Next' }
  ];
  const [active, setActive] = React.useState('intro');
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const update = () => {
      const mid = window.innerHeight * 0.4;
      let best = items[0].id, bestDist = Infinity;
      items.forEach(it => {
        const el = document.getElementById(it.id);
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top - mid);
        if (r.top <= mid + 80 && d < bestDist) { bestDist = d; best = it.id; }
      });
      setActive(best);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);

  const go = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav style={{
      position: 'fixed',
      left: 'clamp(16px, 2vw, 32px)', top: 'clamp(16px, 2vw, 32px)',
      zIndex: 50,
      display: 'flex', flexDirection: 'column', gap: 2,
      padding: '14px 12px',
      background: 'rgba(255,255,255,0.72)',
      border: '1px solid var(--line-2)',
      borderRadius: 8,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      boxShadow: '0 12px 32px -16px rgba(10,10,10,0.28)',
      width: 220
    }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '2px 8px 12px', marginBottom: 6,
        borderBottom: '1px solid var(--line-1)'
      }}>
        <img src={window.__resources.uncapLogoBlack} alt="Uncap" style={{ height: 18, display: 'block' }}/>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-3)'
        }}>Blueprint</span>
      </div>
      {items.map(it => {
        const on = active === it.id;
        return (
          <button key={it.id} type="button" onClick={() => go(it.id)}
            style={{
              border: 'none', background: on ? 'var(--uc-black)' : 'transparent',
              cursor: 'pointer', textAlign: 'left',
              padding: '7px 8px', borderRadius: 5,
              display: 'flex', alignItems: 'center', gap: 10,
              transition: 'background .15s var(--ease-out)'
            }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              color: on ? 'var(--uc-signal)' : 'var(--fg-3)',
              flexShrink: 0
            }}>{it.n}</span>
            <span style={{
              fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: on ? 700 : 500,
              letterSpacing: '-0.005em',
              color: on ? 'var(--uc-paper)' : 'var(--fg-1)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>{it.l}</span>
          </button>
        );
      })}
    </nav>
  );
}
window.BPNav = BPNav;

window.BPIntro = BPIntro;
window.BPSummary = BPSummary;
window.BPWhere = BPWhere;
window.BPObjectives = BPObjectives;
window.BPApproach = BPApproach;
window.BPScope = BPScope;
window.BPPerformance = BPPerformance;
window.BPTechStack = BPTechStack;
window.BPB2B = BPB2B;
window.BPIntegrations = BPIntegrations;
window.BPGantt = BPGantt;
window.BPDelivery = BPDelivery;
window.BPTeam = BPTeam;
window.BPInvestment = BPInvestment;
window.BPGrowth = BPGrowth;
window.BPWhy = BPWhy;
window.BPProof = BPProof;
window.BPApproveButton = BPApproveButton;
window.BPNext = BPNext;
