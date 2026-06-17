// BlueprintSections.jsx — Proposal one-pager sections.
// Sticky left nav + scrollable sections. Cream / white / black rhythm,
// lime accent, mono labels, Inter + Fraunces + JetBrains Mono.

// ── Central brand (name + logo) — change window.__brand to rebrand everywhere ──
function brandName() {return window.__brand && window.__brand.name || 'Wichelt';}
function brandHandle() {return brandName().toLowerCase().replace(/[^a-z0-9]+/g, '');}
function BrandMark({ fontSize = 11, color = 'var(--fg-1)', family = 'var(--font-display)', weight = 700, letterSpacing = '-0.01em', dotColor = 'var(--uc-brand)', height }) {
  const b = window.__brand || {};
  if (b.logoSrc) return <img src={b.logoSrc} alt={brandName()} style={{ height: height || Math.round(fontSize * 1.5), width: 'auto', display: 'block', objectFit: 'contain' }} />;
  return <span style={{ fontFamily: family, fontWeight: weight, fontSize, letterSpacing, color }}>{brandName()}<span style={{ color: dotColor }}>.</span></span>;
}

// ── Section shell ─────────────────────────────────────────────────────────
function BPSection({ id, n, label, dark, paper, children, tail, grid, vec = 'bgVector1' }) {
  const bg = dark ? 'var(--uc-black)' : paper ? 'var(--uc-paper)' : 'var(--uc-cream)';
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
        WebkitMaskImage: `url(${window.__resources && window.__resources[vec] || ''})`,
        maskImage: `url(${window.__resources && window.__resources[vec] || ''})`,
        WebkitMaskSize: 'cover', maskSize: 'cover',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center', maskPosition: 'center'
      }} />
      {grid &&
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage:
        `linear-gradient(${dark ? 'rgba(255,255,255,0.05)' : 'rgba(10,10,10,0.05)'} 1px, transparent 1px),` +
        `linear-gradient(90deg, ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(10,10,10,0.05)'} 1px, transparent 1px)`,
        backgroundSize: '46px 46px',
        backgroundPosition: 'center top',
        WebkitMaskImage: 'linear-gradient(180deg, #000 0%, #000 60%, transparent 100%)',
        maskImage: 'linear-gradient(180deg, #000 0%, #000 60%, transparent 100%)'
      }} />
      }
      <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          marginBottom: 'clamp(28px, 4vw, 48px)',
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 0,
          color: dark ? 'var(--uc-stone-500)' : 'var(--fg-3)'
        }}>
          {/* lime tick accent — work/about signature */}
          <span aria-hidden="true" style={{ width: 16, height: 2, background: 'var(--uc-signal)' }} />
          <span style={{ color: fg, fontWeight: 700 }}>{n}</span>
          <span style={{ width: 28, height: 1, background: line }} />
          <span style={{
            fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 10,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: fg
          }}>{label}</span>
          {tail &&
          <>
              <span style={{ flex: 1, height: 1, background: line }} />
              <span>{tail}</span>
            </>
          }
        </div>
        {children}
      </div>
    </section>);

}

function BPHeadline({ children, dark, size = 'clamp(34px, 4.4vw, 68px)' }) {
  return (
    <h2 style={{
      margin: 0,
      fontFamily: 'var(--font-hero)', fontWeight: 700,
      fontSize: size, letterSpacing: '-0.04em', lineHeight: 0.98,
      color: dark ? 'var(--uc-paper)' : 'var(--fg-1)',
      textWrap: 'balance'
    }}>{children}</h2>);

}
function BPSerif({ children }) {
  return <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>{children}</span>;
}

// ── 00 INTRO ───────────────────────────────────────────────────────────────
function BPIntro() {
  const [r, setR] = React.useState(false);
  React.useEffect(() => {const t = setTimeout(() => setR(true), 80);return () => clearTimeout(t);}, []);
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
      }} />

      <div style={{ maxWidth: 1080, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
        {/* Spec line */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 24, paddingBottom: 22, borderBottom: '1px solid #1F1F1F',
          fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-stone-500)', letterSpacing: 0
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <img src={window.__resources.shopifyBadge} alt="Shopify Platinum Partner" style={{ height: 30, width: 'auto', display: 'block', filter: 'brightness(0) invert(1)' }} />
          </span>
          <span>BLUEPRINT 022 · PREPARED JUNE 2026 · CONFIDENTIAL</span>
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
            }} />
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
              A modern commerce foundation for {brandName()}&rsquo;s next chapter, built on Shopify Plus.
            </div>
          </div>

          {/* Contacts */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 0,
            borderTop: '1px solid #1F1F1F'
          }}>
            {[
            { k: 'Prepared by', v: 'Uncap · Chicago', s: 'hey@uncap.com' },
            { k: 'Client lead', v: 'Adam Wright · Owner', s: 'adam@northvaluepartners.com' },
            { k: 'Valid through', v: 'Jul 31, 2026', s: '30 days' }].
            map((c, i) =>
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
            )}
          </div>
        </div>
      </div>
    </section>);

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
            A plan to move {brandName()}&rsquo;s wholesale operation onto Shopify Plus,
            modernize the B2B buyer experience, and build the foundation for
            direct-to-consumer growth.
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
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0,
        borderTop: '1px solid var(--line-1)', borderBottom: '1px solid var(--line-1)'
      }}>
        {[
        { v: '16 wk', l: 'Estimated timeline to launch on Shopify' },
        { v: 'Unified', l: 'B2B + DTC on Shopify integrated with ERP' },
        { v: '16k+ SKUs', l: 'Sell your quality fabrics, threads, graphs, kits, and more online' },
        { v: 'Modern B2B', l: 'A modern shopping experience for your dealers — self-serve ordering, pricing, and reorders' }].
        map((s, i) =>
        <div key={i} style={{
          padding: 'clamp(24px, 3vw, 36px)',
          paddingLeft: i % 2 === 1 ? 'clamp(20px, 3vw, 36px)' : 0,
          borderLeft: i % 2 === 1 ? '1px solid var(--line-1)' : 'none',
          borderTop: i >= 2 ? '1px solid var(--line-1)' : 'none',
          position: 'relative'
        }}>
            <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: i % 2 === 1 ? 'clamp(20px, 3vw, 36px)' : 0, width: 16, height: 2, background: 'var(--uc-signal)' }} />
            <div style={{ fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(28px, 3vw, 46px)', letterSpacing: '-0.04em', lineHeight: 0.9, color: 'var(--fg-1)' }}>{s.v}</div>
            <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>{s.l}</div>
          </div>
        )}
      </div>
    </BPSection>);

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
            <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--uc-error)' }} />{it.impact}
          </span>
        </div>
        <div style={{ position: 'relative', height: 3, background: 'var(--line-1)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: (h ? it.pct : Math.max(8, it.pct - 22)) + '%', background: 'var(--uc-error)', borderRadius: 999, transition: 'width .6s var(--ease-out)', boxShadow: h ? '0 0 10px -1px rgba(181,50,43,0.55)' : 'none' }} />
        </div>
      </div>
    </div>);

}

function BPWhere() {
  const items = [
  { n: '01', t: 'Lack of commerce storefront', tag: 'Storefront', impact: 'High', pct: 82, d: 'A 20+ year old site that functions as a brochure. No real e-commerce, no modern buyer experience, and zero search visibility.' },
  { n: '02', t: 'Disconnected systems', tag: 'Systems', impact: 'Critical', pct: 94, d: 'Orders still arriving by phone, fax, and email. No e-commerce connection to DistributionPlus. Manual re-keying on every order.' },
  { n: '03', t: 'Manual B2B', tag: 'B2B', impact: 'High', pct: 78, d: "B2B wholesale is the entire business and there's no modern portal for it. Retailers can't self-serve, check inventory, or place orders online." },
  { n: '04', t: 'No single source of truth', tag: 'Data', impact: 'High', pct: 78, d: '20% of revenue flows through a single online reseller who controls the customer relationship. No owned channel, no discoverability, no brand presence.' }];

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
        {items.map((it, i) => <BPWhereCell key={it.n} it={it} i={i} />)}
      </div>
    </BPSection>);

}

// ── 03 OBJECTIVES ───────────────────────────────────────────────────────────
function BPObjectives() {
  const items = [
  { n: '01', t: 'Unify commerce', d: 'One platform for B2B wholesale, brand storefronts, and back-office. No reconciling.', metric: 'One', unit: 'system of record', tag: 'Revenue' },
  { n: '02', t: 'Cut cost of ownership', d: 'Fewer tools, one partner. Retire the legacy stack and its renewals.', metric: 'Lower', unit: 'total cost', tag: 'Finance' },
  { n: '03', t: 'Grow revenue per order', d: 'AOV and conversion engineered in from day one, not bolted on post-launch.', metric: 'Higher', unit: 'AOV + LTV', tag: 'Growth' },
  { n: '04', t: 'Free the team', d: 'Replace phone, fax, and email orders with self-serve. Let the team focus on relationships, not data entry.', metric: 'Faster', unit: 'daily ops', tag: 'Operations' }];

  return (
    <BPSection id="objectives" n="03" label="Objectives" paper tail="WHAT SUCCESS LOOKS LIKE">
      {/* Mega headline + intro — Disciplines two-column header */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        gap: 'clamp(28px, 5vw, 80px)', alignItems: 'end'
      }}>
        <BPHeadline size="clamp(40px, 6vw, 96px)">
          Four outcomes{' '}
          <BPSerif>we&rsquo;re aiming at.</BPSerif>
        </BPHeadline>
        <p style={{
          margin: 0, maxWidth: 380,
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)',
          lineHeight: 1.5, color: 'var(--fg-2)', textWrap: 'pretty'
        }}>
          Every decision in this build ladders up to one of four outcomes. This is the
          scoreboard we&rsquo;ll measure the work against.
        </p>
      </div>

      {/* Outcome ladder */}
      <div style={{
        marginTop: 'clamp(32px, 4vw, 56px)',
        display: 'flex', flexDirection: 'column',
        borderTop: '1px solid var(--line-1)'
      }}>
        {items.map((it) => <BPLadderRow key={it.n} it={it} />)}
      </div>
    </BPSection>);

}

// ── 04 RECOMMENDED APPROACH ────────────────────────────────────────────────
function BPApproach() {
  const steps = [
  { n: 'Phase 1', t: 'Blueprint', d: 'Architecture, data model, integration map. A plan that holds up under scrutiny.', wk: '2–4 weeks' },
  { n: 'Phase 2', t: 'Build', d: 'Storefront, B2B, ERP sync. Fixed scope, senior team, no surprises.', wk: 'Weeks 16+' },
  { n: 'Phase 3', t: 'Grow', d: 'Migrate, go live, then optimize conversion, AOV, and automation.', wk: 'Months 6–12' }];

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
        <div aria-hidden="true" style={{ position: 'absolute', left: '8%', right: '8%', top: 40, height: 1, background: '#2B2B2B' }} />
        {steps.map((s, i) =>
        <div key={i} style={{
          background: '#0F0F0F', border: '1px solid #1F1F1F', borderRadius: 5,
          padding: 'clamp(22px, 2.6vw, 30px)', display: 'flex', flexDirection: 'column', gap: 14,
          position: 'relative', zIndex: 1
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--uc-signal)' }}>{s.n}</span>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--uc-signal)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 'clamp(26px, 2.8vw, 40px)', letterSpacing: '-0.035em', color: 'var(--uc-paper)' }}>{s.t}</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14.5, lineHeight: 1.5, color: 'var(--uc-stone-300)' }}>{s.d}</div>
            <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid #1F1F1F', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-stone-500)' }}>{s.wk}</div>
          </div>
        )}
      </div>
    </BPSection>);

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
      }} />

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
        {it.tag &&
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
        }
      </span>
    </div>);

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
      }} />

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
    </div>);

}

function BPScope() {
  const layers = [
  { code: '01', t: 'Commerce Strategy', d: 'Architecture, roadmap, and a plan the board can trust.' },
  { code: '02', t: 'Experience Design', d: 'A modern, conversion-focused storefront, built to scale.' },
  { code: '03', t: 'Solution Architecture', d: 'System design, data model, and the integration blueprint.' },
  { code: '04', t: 'B2B Enablement', d: 'Catalogs, pricing tiers, NET terms, and account portals.' },
  { code: '05', t: 'ERP Integration Support', d: 'Shopify support for DistributionPlus integration.' },
  { code: '06', t: 'Data Migration', d: 'Products, customers, order history, and SEO redirects.' },
  { code: '07', t: 'Launch & Support', d: 'QA, a go-live runbook, and 30-day post-launch care.', kind: 'base' }];

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
        {layers.map((L) => <BPBuildLayer key={L.code} L={L} />)}
      </div>
    </BPSection>);

}

// ── 06 DELIVERY ─────────────────────────────────────────────────────────────
const BP_GRID = 'minmax(0, 32px) minmax(0, 244px) minmax(0, 1fr) minmax(0, 58px)';
const BP_WEEKS = 16;
const BP_GAP = 'clamp(12px, 1.6vw, 22px)';
// faint week gridlines across the chart column
const BP_GRIDLINES = 'repeating-linear-gradient(90deg, var(--line-1) 0, var(--line-1) 1px, transparent 1px, transparent calc(100% / ' + BP_WEEKS + '))';

function BPGanttRow({ task }) {
  const [h, setH] = React.useState(false);
  const left = (task.s - 1) / BP_WEEKS * 100;
  const width = (task.e - task.s + 1) / BP_WEEKS * 100;
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
      }} />
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
          <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'var(--uc-signal)' }} />
        </div>
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', textAlign: 'right', whiteSpace: 'nowrap' }}>{task.range}</span>
    </div>);

}

function BPGantt() {
  const groups = [
  { name: 'Foundation', range: 'WK 01–06', tasks: [
    { n: '01', t: 'Onboarding & Kickoff', tag: 'Setup', s: 1, e: 2, range: 'W1–2' },
    { n: '02', t: 'Deep Dive Workshops', tag: 'Strategy · Solutions · Design', s: 1, e: 3, range: 'W1–3' },
    { n: '03', t: 'Experience Design', tag: 'UX/UI Design · Web · Mobile', s: 2, e: 5, range: 'W2–5' },
    { n: '04', t: 'Approval', tag: 'Tech Stack Review & Design Sign-off', s: 5, e: 6, range: 'W5–6' }]
  },
  { name: 'Production', range: 'WK 06–14', tasks: [
    { n: '05', t: 'Development', tag: 'Build', s: 6, e: 12, range: 'W6–12' },
    { n: '06', t: 'Data Migration', tag: 'Migrate', s: 9, e: 12, range: 'W9–12' },
    { n: '07', t: 'Integration', tag: 'Connect', s: 9, e: 13, range: 'W9–13' },
    { n: '08', t: 'QA & Testing', tag: 'Verify', s: 12, e: 14, range: 'W12–14' }]
  },
  { name: 'Audit', range: 'WK 14–16', tasks: [
    { n: '09', t: 'Client UAT', tag: 'Go-live', s: 14, e: 16, range: 'W14–16' }]
  }];

  return (
    <div style={{ marginTop: 'clamp(32px, 4vw, 48px)' }}>
      {/* week scale aligned over chart column */}
      <div style={{ display: 'grid', gridTemplateColumns: BP_GRID, gap: BP_GAP, alignItems: 'center', paddingBottom: 9 }}>
        <span />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>Workstream</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 1px' }}>
          {Array.from({ length: BP_WEEKS }).map((_, i) =>
          <span key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--fg-3)', opacity: i % 2 === 0 ? 0.9 : 0.4 }}>{String(i + 1).padStart(2, '0')}</span>
          )}
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)', textAlign: 'right' }}>Span</span>
      </div>

      {groups.map((g, gi) =>
      <div key={g.name} style={{ marginTop: gi === 0 ? 0 : 'clamp(16px, 1.8vw, 26px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 4 }}>
            <span aria-hidden="true" style={{ width: 16, height: 2, background: 'var(--uc-signal)', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(13px, 1.2vw, 16px)', letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--fg-1)', whiteSpace: 'nowrap' }}>{g.name}</span>
            <span style={{ flex: 1, height: 1, background: 'var(--line-1)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--fg-3)', whiteSpace: 'nowrap' }}>{g.range}</span>
          </div>
          {g.tasks.map((task) => <BPGanttRow key={task.n} task={task} />)}
        </div>
      )}

      <div style={{
        marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--line-2)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)'
      }}>
        <span>WK 01 → WK 16 · ~4 Months</span>
        <span>Overlapping phases · single team</span>
      </div>
    </div>);

}

// ── 06 PERFORMANCE DESIGN ───────────────────────────────────────────────────
// Mini faux-UI graphics for each KPI group.
function GfxChrome({ children }) {
  return (
    <div style={{ background: 'var(--uc-paper)', border: '1px solid var(--line-1)', borderRadius: 5, overflow: 'hidden' }}>
      <div style={{ background: 'var(--uc-black)', color: 'var(--uc-paper)', textAlign: 'center', padding: '4px 0', fontFamily: 'var(--font-mono)', fontSize: 7, fontWeight: 700, letterSpacing: '0.12em' }}>FREE FREIGHT OVER $999 · CONTRACTOR PRICING</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px', borderBottom: '1px solid var(--line-1)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 16, height: 16, borderRadius: 999, background: 'var(--uc-black)' }} /><BrandMark fontSize={12} letterSpacing="-0.015em" /></span>
        <div style={{ display: 'flex', gap: 11, marginLeft: 6 }}>{['Lumber', 'Concrete', 'Electrical', 'Tools'].map((x, i) => <span key={x} style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, fontWeight: 700, letterSpacing: '0.04em', color: i === 0 ? 'var(--fg-1)' : 'var(--fg-3)' }}>{x}</span>)}</div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--fg-3)' }}>Search…</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, color: 'var(--uc-paper)', background: 'var(--uc-black)', padding: '3px 8px', borderRadius: 3 }}>Cart 2</span>
        </div>
      </div>
      {children}
    </div>);

}
function GfxMegaNav() {
  const cols = [
  { h: 'Lumber', items: ['Dimensional', 'Plywood & OSB', 'Studs', 'Pressure-treated'] },
  { h: 'Concrete', items: ['Rebar & mesh', 'Mix & bags', 'Block & brick', 'Forming'] },
  { h: 'Electrical', items: ['Wire & cable', 'Conduit', 'Breakers', 'Fixtures'] },
  { h: 'Featured', items: ['Pro Catalog', 'New · Q3', 'Contractor program'] }];

  return (
    <GfxChrome>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--line-1)' }}>
        {cols.map((c, ci) =>
        <div key={ci} style={{ background: 'var(--uc-paper)', padding: '12px 13px 16px', display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: ci === 3 ? 'var(--uc-black)' : 'var(--fg-3)' }}>{c.h}</div>
            {c.items.map((it, ri) => <span key={ri} style={{ fontFamily: 'var(--font-display)', fontWeight: ci === 3 && ri === 0 ? 700 : 500, fontSize: 10.5, letterSpacing: '-0.01em', color: ci === 0 && ri === 0 ? 'var(--uc-black)' : 'var(--fg-2)', display: 'flex', alignItems: 'center', gap: 5 }}>{ci === 0 && ri === 0 && <span style={{ width: 14, height: 3, background: 'var(--uc-signal)' }} />}{it}</span>)}
          </div>
        )}
      </div>
    </GfxChrome>);

}
function GfxCollection() {
  const BLUE = '#567EB9';
  const SOFT = 'var(--font-sans)';
  const prods = [
  ['Aida 14ct · White', '#EDE7DA', 'BULK', '4.9', '212'],
  ['Zweigart Linen 32ct', '#E2D9C4', null, '4.8', '158'],
  ['Mirabilia Chart', '#D8C9DE', 'NEW', '4.9', '64'],
  ['DMC Floss Pack', '#C9D6E2', null, '4.8', '309'],
  ['Mill Hill Bead Kit', '#E8D7B8', 'PRO', '4.9', '47'],
  ['Kreinik Metallic', '#D6C58A', null, '4.7', '521']];

  const facets = [
  { h: 'Category', items: [['Fabric', true], ['Charts', true], ['Threads', false], ['Beads', false], ['Kits', false]] },
  { h: 'Brand', items: [['Wichelt', true], ['Mill Hill', false], ['Zweigart', false]] },
  { h: 'Availability', items: [['In stock', true], ['Ships today', false], ['Backorder', false]] }];

  return (
    <div style={{ background: 'var(--uc-paper)', border: '1px solid var(--line-1)', borderRadius: 5, overflow: 'hidden' }}>
      {/* chrome */}
      <div style={{ background: BLUE, color: 'var(--uc-paper)', textAlign: 'center', padding: '4px 0', fontFamily: SOFT, fontSize: 7.5, fontWeight: 700, letterSpacing: '0.1em' }}>FREE SHIPPING ON ORDERS OVER $250 · WHOLESALE PRICING</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 14px', borderBottom: '1px solid var(--line-1)' }}>
        <span style={{ width: 14, height: 14, borderRadius: 999, background: BLUE }} />
        <BrandMark fontSize={11} />
        <div style={{ display: 'flex', gap: 9, marginLeft: 4 }}>{['Fabric', 'Kits', 'Charts', 'Threads'].map((x, i) => <span key={x} style={{ fontFamily: SOFT, fontSize: 8, fontWeight: 600, color: i === 0 ? 'var(--fg-1)' : 'var(--fg-3)' }}>{x}</span>)}</div>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 132, height: 18, borderRadius: 999, border: '1px solid var(--line-2)', display: 'flex', alignItems: 'center', gap: 4, padding: '0 9px', fontFamily: SOFT, fontSize: 7, color: 'var(--fg-3)', whiteSpace: 'nowrap', overflow: 'hidden' }}><span style={{ fontSize: 8 }}>⌕</span>Search 15,000+ needlework products…</span>
          <span style={{ fontFamily: SOFT, fontSize: 7.5, fontWeight: 700, color: 'var(--uc-paper)', background: BLUE, padding: '3px 9px', borderRadius: 999 }}>Cart 0</span>
        </span>
      </div>

      {/* breadcrumb + title + sort */}
      <div style={{ padding: '11px 14px 9px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ fontFamily: SOFT, fontSize: 7, letterSpacing: '0.06em', color: 'var(--fg-3)' }}>HOME / FABRIC / AIDA & EVENWEAVE</span>
          <span style={{ fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 19, letterSpacing: '-0.035em', color: 'var(--fg-1)' }}>Aida &amp; Evenweave</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: SOFT, fontSize: 7, color: 'var(--fg-3)' }}>1,284 results</span>
          <span style={{ fontFamily: SOFT, fontSize: 7, fontWeight: 700, color: 'var(--fg-1)', border: '1px solid var(--line-2)', borderRadius: 999, padding: '3px 9px' }}>Sort: Best ▾</span>
        </div>
      </div>

      {/* applied filter chips */}
      <div style={{ padding: '0 14px 10px', display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
        {['Fabric ✕', 'Charts ✕', 'In stock ✕'].map((c, i) => <span key={i} style={{ fontFamily: SOFT, fontSize: 7, fontWeight: 600, color: 'var(--fg-1)', background: 'var(--uc-bone)', border: '1px solid var(--line-2)', borderRadius: 999, padding: '2px 9px' }}>{c}</span>)}
        <span style={{ fontFamily: SOFT, fontSize: 7, color: BLUE, fontWeight: 700 }}>Clear all</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '104px 1fr', borderTop: '1px solid var(--line-1)' }}>
        {/* faceted sidebar */}
        <div style={{ borderRight: '1px solid var(--line-1)', background: 'var(--uc-bone)', padding: '11px 10px', display: 'flex', flexDirection: 'column', gap: 11 }}>
          {facets.map((f, fi) =>
          <div key={fi} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontFamily: SOFT, fontSize: 7, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--fg-3)' }}>{f.h.toUpperCase()}</div>
              {f.items.map(([l, on], i) => <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}><span style={{ width: 9, height: 9, borderRadius: 2, background: on ? BLUE : 'var(--uc-paper)', border: '1px solid var(--line-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{on && <svg width="6" height="6" viewBox="0 0 12 12" fill="none"><path d="M2 6 L5 9 L10 3" stroke="var(--uc-paper)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}</span><span style={{ fontFamily: SOFT, fontSize: 7.5, color: on ? 'var(--fg-1)' : 'var(--fg-3)', fontWeight: on ? 700 : 400 }}>{l}</span></div>)}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontFamily: SOFT, fontSize: 7, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--fg-3)' }}>PRICE</div>
            <div style={{ height: 3, background: 'var(--line-1)', borderRadius: 2, position: 'relative' }}><span style={{ position: 'absolute', left: '15%', right: '35%', top: 0, bottom: 0, background: BLUE, borderRadius: 2 }} /><span style={{ position: 'absolute', left: '15%', top: '50%', transform: 'translate(-50%,-50%)', width: 7, height: 7, borderRadius: 999, background: 'var(--uc-paper)', border: '1.5px solid ' + BLUE }} /><span style={{ position: 'absolute', left: '65%', top: '50%', transform: 'translate(-50%,-50%)', width: 7, height: 7, borderRadius: 999, background: 'var(--uc-paper)', border: '1.5px solid ' + BLUE }} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: SOFT, fontSize: 6.5, color: 'var(--fg-3)' }}><span>$3</span><span>$60</span></div>
          </div>
        </div>

        {/* product grid */}
        <div style={{ padding: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {prods.map((p, i) =>
          <div key={i} style={{ border: '1px solid var(--line-1)', borderRadius: 6, padding: 6, display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--uc-paper)' }}>
              <div style={{ aspectRatio: '1/1', background: `linear-gradient(140deg, ${p[1]}, var(--uc-bone))`, borderRadius: 4, position: 'relative' }}>
                {p[2] && <span style={{ position: 'absolute', top: 4, left: 4, padding: '1px 6px', background: p[2] === 'NEW' ? BLUE : p[2] === 'PRO' ? '#3D5A86' : '#3F8B5D', color: '#fff', borderRadius: 999, fontFamily: SOFT, fontSize: 5.5, fontWeight: 800 }}>{p[2]}</span>}
                <span style={{ position: 'absolute', bottom: 4, right: 4, width: 15, height: 15, borderRadius: 999, background: 'var(--uc-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: BLUE, boxShadow: '0 1px 3px rgba(0,0,0,0.18)' }}>＋</span>
              </div>
              <span style={{ fontFamily: SOFT, fontWeight: 700, fontSize: 8.5, letterSpacing: '-0.01em', color: 'var(--fg-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p[0]}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ fontFamily: SOFT, fontSize: 6, color: BLUE }}>★★★★★</span><span style={{ fontFamily: SOFT, fontSize: 6, color: 'var(--fg-3)' }}>{p[3]} ({p[4]})</span></div>
              <span style={{ fontFamily: SOFT, fontSize: 7, fontWeight: 700, color: BLUE }}>Login to See Price</span>
            </div>
          )}
        </div>
      </div>

      {/* pagination */}
      <div style={{ padding: '9px 14px', borderTop: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
        {['‹', '1', '2', '3', '…', '42', '›'].map((n, i) => <span key={i} style={{ minWidth: 15, textAlign: 'center', fontFamily: SOFT, fontSize: 7.5, fontWeight: 700, color: n === '1' ? 'var(--uc-paper)' : 'var(--fg-2)', background: n === '1' ? BLUE : 'transparent', borderRadius: 999, padding: '2px 5px' }}>{n}</span>)}
      </div>
    </div>);

}
function GfxCart() {
  const lines = [['Aida 14ct · White', '24+', 'tier', '—'], ['Zweigart Linen 32ct', '12+', 'tier', '—'], ['DMC Floss Pack', '50+', 'tier', '—']];
  const grid = [['Aida 14ct', '#EDE7DA', 'BULK'], ['Linen 32ct', '#E2D9C4', null], ['Mirabilia Chart', '#D8C9DE', 'NEW'], ['DMC Floss', '#C9D6E2', null], ['Mill Hill Beads', '#E8D7B8', null], ['Kreinik Metallic', '#D6C58A', null]];
  return (
    <div style={{ position: 'relative', background: 'var(--uc-paper)', border: '1px solid var(--line-1)', borderRadius: 5, overflow: 'hidden' }}>
      {/* Full CATEGORY page behind */}
      <div>
        <div style={{ background: '#567EB9', color: 'var(--uc-paper)', textAlign: 'center', padding: '4px 0', fontFamily: 'var(--font-sans)', fontSize: 7.5, fontWeight: 700, letterSpacing: '0.1em' }}>FREE SHIPPING ON ORDERS OVER $250 · WHOLESALE PRICING</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 14px', borderBottom: '1px solid var(--line-1)' }}>
          <span style={{ width: 14, height: 14, borderRadius: 999, background: '#567EB9' }} />
          <BrandMark fontSize={11} />
          <div style={{ display: 'flex', gap: 9, marginLeft: 4 }}>{['Fabric', 'Kits', 'Charts', 'Threads'].map((x, i) => <span key={x} style={{ fontFamily: 'var(--font-sans)', fontSize: 8, fontWeight: 600, color: i === 1 ? 'var(--fg-1)' : 'var(--fg-3)' }}>{x}</span>)}</div>
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-sans)', fontSize: 7.5, fontWeight: 700, color: 'var(--uc-paper)', background: '#567EB9', padding: '3px 9px', borderRadius: 999 }}>Cart 3</span>
        </div>
        {/* category title + breadcrumb */}
        <div style={{ padding: '11px 14px 9px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 7, letterSpacing: '0.06em', color: 'var(--fg-3)' }}>HOME / KITS / CROSS-STITCH KITS</span>
            <span style={{ fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 19, letterSpacing: '-0.035em', color: 'var(--fg-1)' }}>Cross-Stitch Kits</span>
          </div>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 7.5, color: 'var(--fg-3)' }}>48 products · Sort ▾</span>
        </div>
        {/* filter chips */}
        <div style={{ display: 'flex', gap: 6, padding: '0 14px 11px' }}>{['Mirabilia', 'Mill Hill', 'Beginner', 'In stock'].map((f, i) => <span key={f} style={{ padding: '3px 9px', borderRadius: 999, border: '1px solid', borderColor: i === 0 ? '#567EB9' : 'var(--line-1)', background: i === 0 ? '#567EB9' : 'transparent', color: i === 0 ? 'var(--uc-paper)' : 'var(--fg-2)', fontFamily: 'var(--font-sans)', fontSize: 7, fontWeight: 700 }}>{f}</span>)}</div>
        {/* product grid */}
        <div style={{ padding: '0 14px 14px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 9 }}>
          {grid.map((p, i) =>
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ aspectRatio: '1/1', borderRadius: 6, background: `linear-gradient(140deg, ${p[1]}, var(--uc-bone))`, position: 'relative' }}>{p[2] && <span style={{ position: 'absolute', top: 5, left: 5, padding: '1px 6px', background: p[2] === 'BEST' ? '#3F8B5D' : '#567EB9', color: '#fff', borderRadius: 999, fontFamily: 'var(--font-sans)', fontSize: 5.5, fontWeight: 800 }}>{p[2]}</span>}<span style={{ position: 'absolute', bottom: 5, right: 5, width: 16, height: 16, borderRadius: 999, background: 'var(--uc-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#567EB9' }}>＋</span></div>
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 8.5, letterSpacing: '-0.01em', color: 'var(--fg-1)' }}>{p[0]}</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 7, fontWeight: 700, color: '#567EB9' }}>Login to See Price</span>
            </div>
          )}
        </div>
      </div>

      {/* Dim scrim */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.42)' }} />

      {/* Cart drawer — floating, with margin on top/bottom/side */}
      <div style={{
        position: 'absolute', top: 14, right: 14, bottom: 14, width: '54%',
        background: 'var(--uc-paper)', border: '1px solid var(--line-2)', borderRadius: 6,
        boxShadow: '0 18px 40px -16px rgba(10,10,10,0.5)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* header */}
        <div style={{ padding: '9px 13px', borderBottom: '1px solid var(--line-1)', background: 'var(--uc-bone)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12 }}>Your cart</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, color: 'var(--fg-3)' }}>3 ITEMS · ✕</span>
        </div>
        {/* free shipping progress */}
        <div style={{ padding: '9px 13px', borderBottom: '1px solid var(--line-1)', background: 'var(--uc-cream)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--fg-1)', marginBottom: 5 }}>🚚 You&rsquo;ve unlocked <span style={{ color: '#3F8B5D', fontWeight: 700 }}>FREE freight</span></div>
          <div style={{ height: 4, background: 'var(--line-1)', borderRadius: 999, overflow: 'hidden' }}><span style={{ display: 'block', width: '100%', height: '100%', background: '#3F8B5D' }} /></div>
        </div>
        {/* lines */}
        {lines.map((l, i) =>
        <div key={i} style={{ padding: '8px 13px', borderBottom: '1px solid var(--line-1)', display: 'grid', gridTemplateColumns: '26px 1fr auto', gap: 9, alignItems: 'center' }}>
            <div style={{ width: 26, height: 26, borderRadius: 4, background: 'linear-gradient(135deg, var(--uc-stone-200), var(--uc-bone))' }} />
            <div><div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 10, color: 'var(--fg-1)' }}>{l[0]}</div><div style={{ fontFamily: 'var(--font-sans)', fontSize: 8, color: 'var(--fg-3)' }}>qty {l[1]} · <span style={{ color: '#567EB9', fontWeight: 700 }}>wholesale tier</span></div></div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 7.5, fontWeight: 700, color: '#567EB9', textAlign: 'right' }}>Login to<br />See Price</span>
          </div>
        )}
        {/* upsells */}
        <div style={{ padding: '9px 13px', background: 'var(--uc-cream)', borderBottom: '1px solid var(--line-1)' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 7.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 6 }}>PAIRS WELL WITH</div>
          <div style={{ display: 'flex', gap: 6 }}>{[['Q-Snap Frame', '#E8D7B8'], ['Needle Set', '#C9D6E2'], ['Floss Box', '#D8C9DE']].map((u, i) => <div key={i} style={{ flex: 1, border: '1px solid var(--line-1)', borderRadius: 6, padding: 5, display: 'flex', flexDirection: 'column', gap: 3, background: 'var(--uc-paper)' }}><div style={{ aspectRatio: '1/1', background: `linear-gradient(140deg, ${u[1]}, var(--uc-bone))`, borderRadius: 4 }} /><span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 7, color: 'var(--fg-1)' }}>{u[0]}</span><span style={{ fontFamily: 'var(--font-sans)', fontSize: 6.5, fontWeight: 700, color: '#567EB9' }}>Login to add</span></div>)}</div>
        </div>
        {/* trade account upgrade */}
        <div style={{ padding: '10px 13px', background: '#567EB9', color: 'var(--uc-paper)', borderBottom: '1px solid var(--line-1)', display: 'flex', gap: 9, alignItems: 'center' }}>
          <span style={{ width: 18, height: 18, borderRadius: 999, border: '2px solid var(--uc-paper)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--uc-paper)' }} /></span>
          <div style={{ flex: 1 }}><div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 9.5, color: 'var(--uc-paper)' }}>Open a wholesale account</div><div style={{ fontFamily: 'var(--font-sans)', fontSize: 7, color: 'rgba(255,255,255,0.8)' }}>Net terms · tier pricing · fast reorders</div></div>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 7.5, fontWeight: 800, color: '#567EB9', background: 'var(--uc-paper)', padding: '4px 9px', borderRadius: 999 }}>APPLY</span>
        </div>
        {/* totals + checkout */}
        <div style={{ marginTop: 'auto', padding: '10px 13px', borderTop: '1px solid var(--line-1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: 8.5, color: 'var(--fg-3)', marginBottom: 7 }}><span>Subtotal</span><span style={{ color: '#567EB9', fontWeight: 700 }}>Login to See Price</span></div>
          <span style={{ display: 'block', textAlign: 'center', padding: '9px', background: '#567EB9', color: 'var(--uc-paper)', borderRadius: 999, fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700 }}>Login to Check Out</span>
        </div>
      </div>
    </div>);

}
function GfxPDP() {
  return (
    <div style={{ background: 'var(--uc-paper)', border: '1px solid var(--line-1)', borderRadius: 5, overflow: 'hidden' }}>
      {/* chrome */}
      <div style={{ background: '#567EB9', color: 'var(--uc-paper)', textAlign: 'center', padding: '4px 0', fontFamily: 'var(--font-sans)', fontSize: 7.5, fontWeight: 700, letterSpacing: '0.1em' }}>FREE SHIPPING ON ORDERS OVER $250 · WHOLESALE PRICING</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 14px', borderBottom: '1px solid var(--line-1)' }}>
        <span style={{ width: 14, height: 14, borderRadius: 999, background: '#567EB9' }} />
        <BrandMark fontSize={11} />
        <div style={{ display: 'flex', gap: 9, marginLeft: 4 }}>{['Fabric', 'Kits', 'Charts', 'Threads'].map((x, i) => <span key={x} style={{ fontFamily: 'var(--font-sans)', fontSize: 8, fontWeight: 600, color: i === 0 ? 'var(--fg-1)' : 'var(--fg-3)' }}>{x}</span>)}</div>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-sans)', fontSize: 7.5, fontWeight: 700, color: 'var(--uc-paper)', background: '#567EB9', padding: '3px 9px', borderRadius: 999 }}>Cart 2</span>
      </div>
      {/* breadcrumb */}
      <div style={{ padding: '8px 14px 0', fontFamily: 'var(--font-sans)', fontSize: 7, letterSpacing: '0.06em', color: 'var(--fg-3)' }}>HOME / FABRIC / LINEN & EVENWEAVE</div>

      {/* gallery + buy box */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13, padding: '9px 14px 13px' }}>
        {/* gallery */}
        <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: 7 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{['#E2D9C4', '#EDE7DA', '#D8C9DE', '#C9D6E2'].map((c, i) => <div key={i} style={{ aspectRatio: '1/1', borderRadius: 4, background: `linear-gradient(140deg, ${c}, var(--uc-bone))`, border: i === 0 ? '1.5px solid #567EB9' : '1px solid var(--line-1)' }} />)}</div>
          <div style={{ aspectRatio: '4/4.6', borderRadius: 6, background: 'radial-gradient(120% 90% at 60% 25%, #EFE8D6, #E2D9C4 55%, #CFC2A4)', position: 'relative', overflow: 'hidden' }}>
            <span style={{ position: 'absolute', top: 8, left: 8, padding: '2px 8px', background: '#3F8B5D', color: '#fff', borderRadius: 999, fontFamily: 'var(--font-sans)', fontSize: 6, fontWeight: 800, letterSpacing: '0.06em' }}>BEST SELLER</span>
            <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.4 }}>{[...Array(11)].map((_, i) => <line key={'v' + i} x1={15 + i * 7} y1="18" x2={15 + i * 7} y2="88" stroke="rgba(120,100,70,0.5)" strokeWidth="0.6" />)}{[...Array(11)].map((_, i) => <line key={'h' + i} x1="15" y1={18 + i * 7} x2="85" y2={18 + i * 7} stroke="rgba(120,100,70,0.5)" strokeWidth="0.6" />)}</svg>
            <span style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', gap: 4 }}>{[0, 1, 2, 3].map((i) => <span key={i} style={{ width: 5, height: 5, borderRadius: 999, background: i === 0 ? '#567EB9' : 'rgba(86,126,185,0.4)' }} />)}</span>
          </div>
        </div>

        {/* buy box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 7, fontWeight: 700, letterSpacing: '0.1em', color: '#3F8B5D' }}>ZWEIGART · IN STOCK · SHIPS TODAY</div>
          <div style={{ fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 21, letterSpacing: '-0.04em', lineHeight: 0.9, color: 'var(--fg-1)' }}>Belfast Linen<br /><span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 16 }}>32ct · Cross-Stitch Fabric</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)', fontSize: 8 }}><span style={{ color: '#567EB9' }}>★★★★★</span><span style={{ color: 'var(--fg-3)' }}>4.9 · 128 reviews</span></div>
          {/* swatches */}
          <div style={{ display: 'flex', gap: 5, marginTop: 1 }}>{['#E2D9C4', '#EDE7DA', '#D8D2C4', '#C9C0AC'].map((c, i) => <span key={i} style={{ width: 16, height: 16, borderRadius: 999, background: c, border: i === 0 ? '1.5px solid #567EB9' : '1px solid var(--line-1)', boxShadow: i === 0 ? '0 0 0 2px var(--uc-paper) inset' : 'none' }} />)}</div>
          {/* configuration — configurable product */}
          <div style={{ marginTop: 1 }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 6.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 4 }}>CUT SIZE</div>
            <div style={{ display: 'flex', gap: 4 }}>{[['Fat quarter', false], ['Half yard', true], ['Full yard', false]].map(([l, on], i) => <span key={i} style={{ flex: 1, padding: '5px 2px', textAlign: 'center', border: '1px solid', borderColor: on ? '#567EB9' : 'var(--line-1)', borderRadius: 999, fontFamily: 'var(--font-sans)', fontSize: 6, fontWeight: 700, color: on ? 'var(--uc-paper)' : 'var(--fg-2)', background: on ? '#567EB9' : 'transparent', whiteSpace: 'nowrap' }}>{l}</span>)}</div>
          </div>
          {/* wholesale price gate */}
          <div style={{ marginTop: 2, padding: '8px 10px', border: '1px dashed #567EB9', borderRadius: 6, background: 'rgba(86,126,185,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 8, color: 'var(--fg-2)' }}>Wholesale pricing</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 700, color: '#567EB9' }}>Login to See Price</span>
          </div>
          {/* CTAs */}
          <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
            <span style={{ flex: 1, padding: '8px', textAlign: 'center', background: '#567EB9', color: 'var(--uc-paper)', borderRadius: 999, fontFamily: 'var(--font-sans)', fontSize: 9.5, fontWeight: 700 }}>Login to Order</span>
            <span style={{ padding: '8px 11px', textAlign: 'center', border: '1px solid #567EB9', borderRadius: 999, fontFamily: 'var(--font-sans)', fontSize: 9.5, fontWeight: 700, color: '#567EB9' }}>♡</span>
          </div>
          {/* trust row */}
          <div style={{ display: 'flex', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>{['✓ Cut to order', '✓ Dye-lot matched', '✓ Ships today'].map((t) => <span key={t} style={{ fontFamily: 'var(--font-sans)', fontSize: 6.5, fontWeight: 700, color: 'var(--fg-3)' }}>{t}</span>)}</div>
          {/* frequently bought together (compact, in buy box) */}
          <div style={{ marginTop: 7, paddingTop: 9, borderTop: '1px solid var(--line-1)' }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 6.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 6 }}>FREQUENTLY BOUGHT TOGETHER</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
              {[['Belfast Linen 32ct', '#E2D9C4'], ['DMC Floss Pack', '#C9D6E2'], ['John James Needles', '#D8C9DE']].map((p, i) =>
              <React.Fragment key={i}>
                  {i > 0 && <span style={{ fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 11, color: 'var(--fg-3)', flexShrink: 0 }}>+</span>}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ aspectRatio: '1/0.82', borderRadius: 4, background: `linear-gradient(140deg, ${p[1]}, var(--uc-bone))` }} />
                    <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 6.5, letterSpacing: '-0.01em', color: 'var(--fg-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p[0]}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 6, fontWeight: 700, color: '#567EB9' }}>Login</span>
                  </div>
                </React.Fragment>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 7, fontWeight: 700, color: '#567EB9', whiteSpace: 'nowrap' }}>Bundle · Login to See Price</span>
              <span style={{ flex: 1, padding: '6px', textAlign: 'center', background: '#567EB9', color: 'var(--uc-paper)', borderRadius: 999, fontFamily: 'var(--font-sans)', fontSize: 8.5, fontWeight: 700 }}>Add all 3</span>
            </div>
          </div>
        </div>
      </div>

      {/* specs + highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--line-1)', borderTop: '1px solid var(--line-1)' }}>
        <div style={{ background: 'var(--uc-paper)', padding: '11px 14px' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 7.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 7 }}>SPECIFICATIONS</div>
          {[['Count', '32 ct'], ['Fiber', '100% linen'], ['Width', '55 in'], ['Color', 'Cream']].map((r, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: i ? '1px solid var(--line-1)' : 'none', fontFamily: 'var(--font-sans)', fontSize: 8 }}><span style={{ color: 'var(--fg-3)' }}>{r[0]}</span><span style={{ color: 'var(--fg-1)', fontWeight: 700 }}>{r[1]}</span></div>)}
        </div>
        <div style={{ background: 'var(--uc-cream)', padding: '11px 14px' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 7.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 7 }}>WHY STITCHERS CHOOSE IT</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{['Even weave and crisp holes for clean, consistent stitches.', 'Wholesale pricing and net terms for retail accounts.', 'Cut to order from full bolts, dye-lot matched.'].map((t, i) => <div key={i} style={{ display: 'grid', gridTemplateColumns: '12px 1fr', gap: 7, alignItems: 'start' }}><span style={{ width: 10, height: 10, borderRadius: 999, background: '#567EB9', marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="6" height="6" viewBox="0 0 12 12" fill="none"><path d="M2 6 L5 9 L10 3" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span><span style={{ fontFamily: 'var(--font-serif)', fontSize: 9, lineHeight: 1.35, color: 'var(--fg-2)' }}>{t}</span></div>)}</div>
        </div>
      </div>

      {/* review highlight */}
      <div style={{ padding: '11px 14px', borderTop: '1px solid var(--line-1)', display: 'flex', gap: 10, alignItems: 'center', background: 'var(--uc-paper)' }}>
        <span style={{ fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 24, letterSpacing: '-0.04em', color: 'var(--fg-1)' }}>4.9</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 8, color: '#567EB9' }}>★★★★★</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 9, lineHeight: 1.35, color: 'var(--fg-2)', marginTop: 2 }}>“The best linen we stock for our shop. Customers ask for it by name.”</div>
        </div>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 7, fontWeight: 700, color: 'var(--fg-3)', whiteSpace: 'nowrap' }}>VERIFIED ✓</span>
      </div>

      {/* you may also like */}
      <div style={{ padding: '11px 14px', borderTop: '1px solid var(--line-1)', background: 'var(--uc-bone)' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 7.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 8 }}>COMPLETE THE PROJECT</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7 }}>{[['DMC Floss Pack', '#C9D6E2'], ['Mill Hill Beads', '#E8D7B8'], ['Q-Snap Frame', '#D8C9DE'], ['John James Needles', '#C9C0AC']].map((p, i) => <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><div style={{ aspectRatio: '1/1', borderRadius: 4, background: `linear-gradient(140deg, ${p[1]}, var(--uc-bone))` }} /><span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 7.5, color: 'var(--fg-1)' }}>{p[0]}</span><span style={{ fontFamily: 'var(--font-sans)', fontSize: 7, fontWeight: 700, color: '#567EB9' }}>Login</span></div>)}</div>
      </div>
    </div>);

}

function GfxPortal() {
  const rows = [['#PO-9421', '24 items', 'Approved'], ['#PO-9420', '8 items', 'Picking'], ['#PO-9419', '142 items', 'Pending'], ['#PO-9418', '36 items', 'Shipped'], ['#PO-9417', '12 items', 'Delivered'], ['#PO-9416', '64 items', 'Delivered']];
  const nav = [['◧', 'Dashboard', true], ['▤', 'Orders', false], ['❏', 'Quotes', false], ['♺', 'Subscriptions', false], ['♡', 'Saved lists', false], ['⚙', 'Team', false]];
  return (
    <div style={{ background: 'var(--uc-paper)', border: '1px solid var(--line-1)', borderRadius: 5, overflow: 'hidden' }}>
      {/* chrome */}
      <div style={{ background: '#567EB9', color: 'var(--uc-paper)', textAlign: 'center', padding: '4px 0', fontFamily: 'var(--font-sans)', fontSize: 7.5, fontWeight: 700, letterSpacing: '0.1em' }}>WHOLESALE ORDERING PORTAL · NET-30 TERMS ACTIVE</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 14px', borderBottom: '1px solid var(--line-1)' }}>
        <span style={{ width: 14, height: 14, borderRadius: 999, background: '#567EB9' }} />
        <BrandMark fontSize={11} />
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 7.5, fontWeight: 700, color: 'var(--fg-3)' }}>THE STITCHERY SHOP</span>
          <span style={{ width: 18, height: 18, borderRadius: 999, background: 'linear-gradient(135deg,#7E9BC9,#567EB9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: 7, fontWeight: 800, color: '#fff' }}>S</span>
        </span>
      </div>

      {/* body: sidebar + content */}
      <div style={{ display: 'grid', gridTemplateColumns: '112px 1fr', gap: 1, background: 'var(--line-1)' }}>
        {/* sidebar */}
        <div style={{ background: 'var(--uc-bone)', padding: '11px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {nav.map((n, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 7px', borderRadius: 6, background: n[2] ? '#567EB9' : 'transparent' }}><span style={{ fontSize: 9, color: n[2] ? 'var(--uc-paper)' : 'var(--fg-3)' }}>{n[0]}</span><span style={{ fontFamily: 'var(--font-sans)', fontSize: 8, fontWeight: 700, color: n[2] ? 'var(--uc-paper)' : 'var(--fg-2)' }}>{n[1]}</span></div>)}
          <div style={{ marginTop: 'auto', padding: '8px 7px 0' }}><div style={{ fontFamily: 'var(--font-sans)', fontSize: 6.5, color: 'var(--fg-3)', lineHeight: 1.5 }}>CREDIT LINE<br /><span style={{ fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 13, letterSpacing: '-0.02em', color: 'var(--fg-1)' }}>$24k</span> open</div></div>
        </div>

        {/* content */}
        <div style={{ background: 'var(--uc-paper)', display: 'flex', flexDirection: 'column' }}>
          {/* welcome */}
          <div style={{ padding: '11px 14px 9px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 7, letterSpacing: '0.08em', color: 'var(--fg-3)' }}>WELCOME BACK</div>
              <div style={{ fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 17, letterSpacing: '-0.035em', color: 'var(--fg-1)' }}>Karen</div>
            </div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 7.5, fontWeight: 800, color: 'var(--uc-paper)', background: '#567EB9', padding: '4px 10px', borderRadius: 999 }}>+ New order</span>
          </div>
          {/* stat tiles */}
          <div style={{ padding: '0 14px 10px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[['8', 'OPEN ORDERS'], ['2', 'QUOTES'], ['$84k', 'YTD SPEND']].map((s, i) => <div key={i} style={{ border: '1px solid var(--line-1)', borderRadius: 6, padding: '8px 10px' }}><div style={{ fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em', color: 'var(--fg-1)' }}>{s[0]}</div><div style={{ fontFamily: 'var(--font-sans)', fontSize: 7, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--fg-3)', marginTop: 2 }}>{s[1]}</div></div>)}
          </div>
          {/* recent orders / quick reorder */}
          <div style={{ padding: '0 14px 12px' }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 7.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--fg-3)', paddingBottom: 6 }}>RECENT ORDERS · QUICK REORDER</div>
            {rows.map((r, i) => <div key={i} style={{ display: 'grid', gridTemplateColumns: '70px 1fr auto auto', gap: 8, alignItems: 'center', padding: '6px 0', borderTop: '1px solid var(--line-1)' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 600, color: 'var(--fg-1)' }}>{r[0]}</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 8.5, color: 'var(--fg-3)' }}>{r[1]}</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 7.5, fontWeight: 700, color: r[2] === 'Approved' ? 'var(--uc-paper)' : 'var(--fg-3)', background: r[2] === 'Approved' ? '#567EB9' : 'transparent', border: r[2] === 'Approved' ? 'none' : '1px solid var(--line-1)', padding: '2px 7px', borderRadius: 999 }}>{r[2]}</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 8, fontWeight: 700, color: 'var(--uc-paper)', background: '#567EB9', padding: '2px 8px', borderRadius: 999 }}>Reorder</span>
            </div>)}
          </div>
        </div>
      </div>

      {/* SMS / email commerce strip */}
    </div>);

}

function BPPerformance() {
  const groups = [
  {
    kpi: 'Search & Discovery',
    sub: 'Get buyers to the right product, fast.',
    points: [
    { t: 'Information Architecture', d: 'Mega navigation built around how buyers actually browse.' },
    { t: 'Discovery & Merchandising', d: 'Smart collections and curated merchandising that surface the right products.' },
    { t: 'AI Insight Search', d: 'Natural-language search that understands intent, not just keywords.' }],

    gfx: <GfxCollection />
  },
  {
    kpi: 'Optimized Order Value',
    sub: 'Lift AOV without raising prices.',
    points: [
    { t: 'Upsells & Cross-sells', d: 'Relevant add-ons surfaced in cart and on the product page.' },
    { t: 'Prices & Discounts', d: 'Volume pricing, tier discounts, and promotions native to checkout.' },
    { t: 'Promotions & Offers', d: 'Site-wide sales, BOGO, and coupon codes that run themselves.' }],

    gfx: <GfxCart />
  },
  {
    kpi: 'Elevated Conversion Rate',
    sub: 'Turn more visits into orders.',
    points: [
    { t: 'Robust Product Page', d: 'Rich, tailored sections with comparisons, spec tables, and assets.' },
    { t: 'Bundles & Configured Products', d: 'Curated kits and build-your-own bundles checked out as one order.' },
    { t: 'Customer Engagement', d: 'Social proof, reviews, how-to videos, and proprietary instructions.' }],

    gfx: <GfxPDP />
  },
  {
    kpi: 'Retention & Loyalty',
    sub: 'Make the second order easier than the first.',
    points: [
    { t: 'Self-Serve Ordering Portal', d: 'A logged-in account experience for reorders, quotes, and team management.' },
    { t: 'Quick Order & Subscription', d: 'One-click reorders, saved lists, and recurring orders that run themselves.' }],

    gfx: <GfxPortal />
  }];

  return (
    <BPSection id="performance" n="06" label="Commerce" paper tail="DESIGNED FOR KPI">
      <BPHeadline>
        Designed for the{' '}
        <BPSerif>numbers that matter.</BPSerif>
      </BPHeadline>
      <p style={{ marginTop: 'clamp(20px, 2.4vw, 28px)', maxWidth: 640, fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)', lineHeight: 1.5, color: 'var(--fg-2)' }}>
        Every design decision maps back to a KPI. Three levers, engineered into the build from day one.
      </p>
      <div style={{ marginTop: 'clamp(36px, 4.5vw, 64px)', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {groups.map((g, i) =>
        <div key={i} style={{
          display: 'grid',
          gridTemplateColumns: i % 2 === 0 ? 'minmax(0, 1fr) minmax(0, 1.05fr)' : 'minmax(0, 1.05fr) minmax(0, 1fr)',
          gap: 'clamp(28px, 4vw, 64px)', alignItems: 'center',
          padding: 'clamp(32px, 4vw, 56px) 0',
          borderTop: '1px solid var(--line-1)'
        }}>
            <div style={{ order: i % 2 === 0 ? 1 : 2 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'var(--uc-black)', background: 'var(--uc-signal)', padding: '3px 8px', borderRadius: 3 }}>{String(i + 1).padStart(2, '0')}</span>
                KPI
              </div>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 'clamp(26px, 3vw, 44px)', letterSpacing: '-0.035em', lineHeight: 0.98, color: 'var(--fg-1)' }}>{g.kpi}</h3>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)', color: 'var(--fg-2)', marginTop: 10 }}>{g.sub}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {g.points.map((p) =>
              <li key={p.t} style={{ display: 'grid', gridTemplateColumns: '16px minmax(0,1fr)', gap: 12, alignItems: 'start' }}>
                    <span style={{ width: 14, height: 14, borderRadius: 999, background: 'var(--uc-signal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: 3, flexShrink: 0 }}><svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6 L5 9 L10 3" stroke="var(--uc-black)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(15px, 1.3vw, 18px)', letterSpacing: '-0.012em', color: 'var(--fg-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.t}</div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--fg-2)', marginTop: 3, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.9em' }}>{p.d}</div>
                    </div>
                  </li>
              )}
              </ul>
            </div>
            <div style={{ order: i % 2 === 0 ? 2 : 1 }}>{g.gfx}</div>
          </div>
        )}
      </div>
    </BPSection>);

}

// ── 06b CONTENT ──────────────────────────────────────────────────────────────
function GfxPhone({ kind }) {
  // Mobile construction-supply storefront. kind: 'home' | 'about' | 'blog'
  return (
    <div style={{
      background: 'var(--uc-paper)', border: '1px solid var(--line-2)', borderRadius: 18,
      padding: 8, boxShadow: '0 18px 40px -22px rgba(10,10,10,0.4)'
    }}>
      <div style={{ background: 'var(--uc-cream)', borderRadius: 12, overflow: 'hidden', height: 460, display: 'flex', flexDirection: 'column' }}>
        {/* status bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', fontFamily: 'var(--font-mono)', fontSize: 7.5, color: 'var(--fg-3)', flexShrink: 0 }}>
          <span>9:41</span>
          <span style={{ display: 'inline-flex', gap: 3 }}><span style={{ width: 14, height: 6, border: '1px solid var(--fg-3)', borderRadius: 2 }} /></span>
        </div>
        {/* optimized header: wordmark + actions, then big open search */}
        <div style={{ flexShrink: 0, borderBottom: '1px solid var(--line-1)', background: 'var(--uc-paper)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, border: '1px solid var(--line-2)', borderRadius: 5, fontSize: 9, color: 'var(--fg-1)' }}>☰</span>
              <BrandMark fontSize={14} family="var(--font-hero)" weight={800} letterSpacing="-0.045em" />
            </span>
            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 22, padding: '0 9px', background: '#567EB9', borderRadius: 999, fontFamily: 'var(--font-sans)', fontSize: 7.5, fontWeight: 700, color: 'var(--uc-paper)' }}>⛒ Cart<span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 11, height: 11, padding: '0 2px', background: 'var(--uc-paper)', color: '#567EB9', borderRadius: 999, fontSize: 6, fontWeight: 800 }}>6</span></span>
            </span>
          </div>
          {/* big open search */}
          <div style={{ padding: '0 12px 9px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 30, border: '1.5px solid #567EB9', borderRadius: 999, padding: '0 4px 0 10px' }}>
              <span style={{ fontSize: 10, color: 'var(--fg-2)' }}>⌕</span>
              <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 8, color: 'var(--fg-3)' }}>Search 15,000+ needlework products…</span>
              <span style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', padding: '0 9px', margin: '3px 0', background: '#567EB9', color: 'var(--uc-paper)', borderRadius: 999, fontFamily: 'var(--font-sans)', fontSize: 7, fontWeight: 800 }}>GO</span>
            </div>
          </div>
        </div>
        {/* content per kind — scroll-clipped to equal height */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {kind === 'home' &&
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* wholesale announcement */}
            <div style={{ background: '#567EB9', color: 'var(--uc-paper)', padding: '4px 0', textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 6.5, fontWeight: 700, letterSpacing: '0.1em' }}>FREE SHIPPING ON ORDERS OVER $250 · WHOLESALE PRICING</div>
            {/* SHORT hero banner */}
            <div style={{ margin: '10px 12px 0', borderRadius: 8, background: 'linear-gradient(100deg, #2A3550 0%, #3D5A86 55%, #567EB9 135%)', position: 'relative', overflow: 'hidden', padding: '12px 13px', display: 'flex', flexDirection: 'column', gap: 5, minHeight: 96 }}>
              <svg viewBox="0 0 120 60" style={{ position: 'absolute', right: -6, bottom: -6, width: 120, opacity: 0.2 }}>{[...Array(9)].map((_, i) => <line key={'v' + i} x1={20 + i * 11} y1="6" x2={20 + i * 11} y2="56" stroke="#fff" strokeWidth="1" />)}{[...Array(5)].map((_, i) => <line key={'h' + i} x1="20" y1={6 + i * 12} x2="108" y2={6 + i * 12} stroke="#fff" strokeWidth="1" />)}</svg>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 6, fontWeight: 700, letterSpacing: '0.14em', color: '#fff' }}>EST. 1967</span>
              <span style={{ fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 15, letterSpacing: '-0.04em', lineHeight: 0.95, color: '#fff' }}>America&rsquo;s Complete<br /><span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>Needlework Distributor.</span></span>
              <span style={{ alignSelf: 'flex-start', marginTop: 2, padding: '5px 12px', background: 'var(--uc-paper)', color: '#567EB9', borderRadius: 999, fontFamily: 'var(--font-sans)', fontSize: 7, fontWeight: 800 }}>Shop new arrivals →</span>
            </div>
            {/* brand strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, margin: '11px 0 0', padding: '8px 12px', borderTop: '1px solid var(--line-1)', borderBottom: '1px solid var(--line-1)', justifyContent: 'space-between' }}>{['Wichelt', 'Mill Hill', 'Mirabilia', 'Zweigart'].map((b) => <span key={b} style={{ fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 8.5, letterSpacing: '-0.02em', color: 'var(--fg-3)' }}>{b}</span>)}</div>
            {/* product tabs */}
            <div style={{ display: 'flex', gap: 11, padding: '10px 12px 8px', flexWrap: 'wrap' }}>{['Fabric', 'Kits', 'Charts', 'Beads', 'Threads'].map((t, i) => <span key={t} style={{ paddingBottom: 4, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 9, color: i === 0 ? 'var(--fg-1)' : 'var(--fg-3)', borderBottom: i === 0 ? '2px solid #567EB9' : '2px solid transparent' }}>{t}</span>)}</div>
            {/* product grid */}
            <div style={{ padding: '0 12px 11px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['Aida 14ct', '#EDE7DA', 'BULK'], ['Linen 32ct', '#E2D9C4', null], ['Mirabilia Chart', '#D8C9DE', 'NEW'], ['Mill Hill Beads', '#E8D7B8', 'POPULAR']].map((p, i) =>
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ aspectRatio: '1/0.86', borderRadius: 6, background: `linear-gradient(150deg, ${p[1]}, var(--uc-bone))`, position: 'relative' }}>{p[2] && <span style={{ position: 'absolute', top: 5, left: 5, padding: '1px 6px', background: p[2] === 'POPULAR' ? '#3F8B5D' : p[2] === 'NEW' ? '#567EB9' : '#3D5A86', color: '#fff', borderRadius: 999, fontFamily: 'var(--font-sans)', fontSize: 5, fontWeight: 800 }}>{p[2]}</span>}<span style={{ position: 'absolute', bottom: 5, right: 5, width: 16, height: 16, borderRadius: 999, background: 'var(--uc-paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#567EB9' }}>＋</span></div>
                  <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 8, color: 'var(--fg-1)', letterSpacing: '-0.01em' }}>{p[0]}</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 7, fontWeight: 700, color: '#567EB9' }}>Login to See Price</span>
                </div>
              )}
            </div>
            {/* categories */}
            <div style={{ padding: '0 12px 12px' }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 6, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--fg-3)', marginBottom: 6 }}>SHOP BY DEPARTMENT</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>{[['Fabric', '#E2D9C4'], ['Kits', '#D8C9DE'], ['Charts', '#C9D6E2'], ['Beads', '#E8D7B8']].map((c, i) => <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}><div style={{ aspectRatio: '1/1', borderRadius: 6, background: `linear-gradient(140deg, ${c[1]}, var(--uc-bone))` }} /><span style={{ fontFamily: 'var(--font-sans)', fontSize: 6, fontWeight: 700, textAlign: 'center', color: 'var(--fg-2)' }}>{c[0]}</span></div>)}</div>
            </div>
          </div>
          }
        {kind === 'about' &&
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* editorial hero */}
            <div style={{ padding: '14px 13px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-sans)', fontSize: 6, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--fg-3)' }}><span style={{ width: 5, height: 5, borderRadius: 999, background: '#567EB9' }} />EST. 1970 · FAMILY-OWNED</span>
              <span style={{ fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.045em', lineHeight: 0.95, color: 'var(--fg-1)' }}>A family business.<br /><span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400 }}>A craft community.</span></span>
            </div>
            {/* overlapping image cards */}
            <div style={{ position: 'relative', height: 112, margin: '2px 13px 8px' }}>
              <div style={{ position: 'absolute', left: 0, top: 8, width: '58%', aspectRatio: '4/3', borderRadius: 6, background: 'linear-gradient(150deg, #E2D9C4, var(--uc-bone))', transform: 'rotate(-4deg)', boxShadow: '0 8px 16px -10px rgba(10,10,10,0.45)' }} />
              <div style={{ position: 'absolute', right: 6, top: 0, width: '52%', aspectRatio: '3/4', borderRadius: 6, background: 'linear-gradient(150deg, #567EB9, var(--uc-bone))', transform: 'rotate(6deg)', boxShadow: '0 8px 16px -10px rgba(10,10,10,0.4)' }} />
              <span style={{ position: 'absolute', left: '33%', bottom: 2, padding: '3px 8px', background: 'var(--uc-paper)', border: '1px solid var(--line-1)', borderRadius: 999, fontFamily: 'var(--font-sans)', fontSize: 5.5, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--fg-3)', transform: 'rotate(-3deg)' }}>STITCHED SINCE 1967</span>
            </div>
            {/* manifesto */}
            <div style={{ padding: '4px 13px 8px' }}><span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 10.5, lineHeight: 1.45, color: 'var(--fg-2)' }}>“57 years in the making — supplying the needlework shops and stitchers who keep the craft alive.”</span></div>
            {/* stat strip */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, padding: '8px 13px', borderTop: '1px solid var(--line-1)', background: 'var(--uc-paper)' }}>{[['56yr', 'In business'], ['15k+', 'Products'], ['3', 'Owned brands']].map((s, i) => <div key={i}><div style={{ fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 14, letterSpacing: '-0.035em', color: 'var(--fg-1)' }}>{s[0]}</div><div style={{ fontFamily: 'var(--font-sans)', fontSize: 5.5, color: 'var(--fg-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s[1]}</div></div>)}</div>
          </div>
          }
        {kind === 'blog' &&
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 13px 8px' }}><span style={{ fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 19, letterSpacing: '-0.04em', color: 'var(--fg-1)' }}>Guides &amp; Resources</span></div>
            {/* featured story */}
            <div style={{ margin: '0 13px', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--line-1)' }}>
              <div style={{ aspectRatio: '16/9', background: 'radial-gradient(120% 100% at 30% 10%, #E2D9C4, #C9C0AC)', position: 'relative' }}><span style={{ position: 'absolute', top: 7, left: 7, padding: '2px 8px', background: '#567EB9', color: 'var(--uc-paper)', borderRadius: 999, fontFamily: 'var(--font-sans)', fontSize: 6, fontWeight: 800, letterSpacing: '0.06em' }}>FEATURED</span></div>
              <div style={{ padding: '9px 11px', background: 'var(--uc-paper)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 5.5, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--fg-3)' }}>FABRIC · 6 MIN</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12.5, letterSpacing: '-0.018em', lineHeight: 1.08, color: 'var(--fg-1)' }}>How to choose the right Aida count for your project.</span>
              </div>
            </div>
            {/* article list */}
            <div style={{ padding: '10px 13px', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[['Complete the Mirabilia kit: fabric, beads & thread', '7 min', '#D8C9DE'], ['Zweigart canvas: needlepoint for beginners', '6 min', '#E2D9C4'], ['Mill Hill bead kits: what’s included & how to customize', '8 min', '#E8D7B8']].map((a, i) =>
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '42px 1fr', gap: 9, alignItems: 'center' }}>
                  <div style={{ aspectRatio: '1/1', borderRadius: 6, background: `linear-gradient(150deg, ${a[2]}, var(--uc-bone))` }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 5.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--fg-3)' }}>{a[1].toUpperCase()} READ</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 9.5, letterSpacing: '-0.012em', color: 'var(--fg-1)', lineHeight: 1.2 }}>{a[0]}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          }
        </div>
      </div>
    </div>);

}
// ── 06b CONTENT ──────────────────────────────────────────────────────────────
function BPContent() {
  const screens = [
  { kind: 'home', label: 'Landing Pages', d: 'Short hero, brand wall, live product tabs, and a department grid — a merchandising surface that gets stitchers to 15,000+ products fast.' },
  { kind: 'about', label: 'Brand Story', d: 'Family-business story and proof — 56 years, owned brands, and a craft community that wins retailer trust and ranks for branded search.' },
  { kind: 'blog', label: 'Guides & Resources', d: 'How-to and project content engineered for SEO, GEO, and paid landing — each guide a destination that routes to product.' }];

  return (
    <BPSection id="content" n="06b" label="Content" paper tail="STORY · SEO · GEO · PAID">
      <BPHeadline>
        Content that{' '}
        <BPSerif>does the selling.</BPSerif>
      </BPHeadline>
      <p style={{
        marginTop: 'clamp(20px, 2.4vw, 28px)', maxWidth: 720,
        fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)',
        lineHeight: 1.55, color: 'var(--fg-2)'
      }}>
        We build the full mobile content surface for a large-catalog supplier — homepage,
        brand story, and field guides. Each screen is structured for SEO and generative
        (GEO) discovery, and tuned as a destination for paid media.
      </p>

      <div style={{
        marginTop: 'clamp(32px, 4vw, 56px)',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(16px, 2.5vw, 32px)'
      }}>
        {screens.map((s, i) =>
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ maxWidth: 260, margin: '0 auto', width: '100%' }}><GfxPhone kind={s.kind} /></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--fg-3)' }}>0{i + 1}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(16px, 1.5vw, 20px)', letterSpacing: '-0.018em', color: 'var(--fg-1)' }}>{s.label}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, lineHeight: 1.5, color: 'var(--fg-2)' }}>{s.d}</div>
            </div>
          </div>
        )}
      </div>

      {/* tactics row */}
      <div style={{
        marginTop: 'clamp(28px, 3.5vw, 44px)', paddingTop: 24, borderTop: '1px solid var(--line-1)',
        display: 'flex', gap: 18, flexWrap: 'wrap',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.06em'
      }}>
        {['MERCHANDISED HOMEPAGE', 'SEO STRUCTURE', 'GEO / AI ANSWERS', 'PAID-MEDIA DESTINATIONS'].map((t) =>
        <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--uc-signal)' }} />{t}
          </span>
        )}
      </div>

      {/* SEO enablement checklist */}
      {(() => {
        const seo = [
        ['Site Crawl', 'Inventory every indexable URL on the old site.'],
        ['301 Redirects', 'Map all live URLs — products, collections, blogs, pages, assets.'],
        ['Title Tags', 'Migrate every title tag as-is unless there&rsquo;s a proven issue.'],
        ['Meta Descriptions', 'Preserve existing descriptions to avoid CTR drops.'],
        ['Heading Structure', 'Keep correct H1–H6 hierarchy through the rebuild.'],
        ['Body Content', 'Retain core on-page content; no major changes mid-migration.'],
        ['Duplicate Control', 'Prevent duplicates from variants, tags, or collections.'],
        ['Internal Links', 'Rebuild contextual links to maintain authority flow.'],
        ['Catalog Sitemap', 'Retain the catalog structure&rsquo;s SEO optimization.'],
        ['Navigation Links', 'Align menus and footer links to SEO priorities.'],
        ['Breadcrumbs', 'Implement breadcrumb navigation and structured data.'],
        ['Canonical Tags', 'Confirm each page self-canonicalizes correctly.'],
        ['Pagination Logic', 'Keep paginated pages crawlable and correctly linked.'],
        ['Facet Management', 'Block filtered, sorted, and parameter URLs from indexing.'],
        ['Alt Text', 'Migrate all image alt text without loss.'],
        ['Image Compression', 'Optimize aggressively for Core Web Vitals.'],
        ['Schema Tags', 'Implement schema markup to best practices.'],
        ['Core Web Vitals', 'Measure and tune LCP, CLS, and INP.'],
        ['Mobile Parity', 'Verify mobile content matches desktop for indexing.'],
        ['Speed Stability', 'Fast, predictable performance to Google&rsquo;s guidelines.'],
        ['Robots.txt', 'Remove staging rules; confirm critical paths crawlable.'],
        ['XML Sitemap', 'Generate a clean sitemap of only indexable URLs.'],
        ['Sitemap Submit', 'Submit to Google and Bing immediately post-launch.'],
        ['Search Console', 'Verify domain, properties, and settings before cutover.']];

        return (
          <div style={{ marginTop: 'clamp(28px, 3.5vw, 44px)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span aria-hidden="true" style={{ width: 16, height: 2, background: 'var(--uc-signal)' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-1)' }}>SEO Enablement</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', letterSpacing: '0.04em' }}>{seo.length}-point migration checklist</span>            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))', gap: '1px', background: 'var(--line-1)', border: '1px solid var(--line-1)', borderRadius: 8, overflow: 'hidden' }}>
              {seo.map(([t, d], i) =>
              <div key={i} style={{ background: 'var(--uc-paper)', padding: '11px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span aria-hidden="true" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M2 6.4 L4.8 9 L10 3" stroke="var(--fg-2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, letterSpacing: '-0.01em', color: 'var(--fg-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t}</span>
                </div>
              )}
            </div>
          </div>);

      })()}
    </BPSection>);

}

// ── 07 TECH STACK ──────────────────────────────────────────────────────────
function BPTechStack() {
  const rows = [
  { name: 'Shopify Plus', fn: 'Commerce platform + B2B', pri: 'start', cost: '$2,500/mo' },
  { name: 'Search & Discovery', fn: 'Search + discovery', pri: 'start', cost: 'FREE' },
  { name: 'Shopify Flow', fn: 'Workflow automation', pri: 'start', cost: 'FREE' },
  { name: 'Shopify Forms', fn: 'Forms and intake', pri: 'start', cost: 'FREE' },
  { name: 'Shopify Inbox', fn: 'Live chat and support', pri: 'start', cost: 'FREE' },
  { name: 'Shopify Knowledge Base', fn: 'FAQ + agentic content source', pri: 'start', cost: 'FREE' },
  { name: 'Klaviyo', fn: 'Email + SMS lifecycle', pri: 'rec', cost: 'TBD' },
  { name: 'Judge.me', fn: 'Product reviews', pri: 'rec', cost: '$15/mo' },
  { name: 'Stockist Store Locator', fn: 'Find-a-retailer map', pri: 'rec', cost: '$10/mo' }];

  const priMeta = {
    start: { l: 'Needed to start', c: 'var(--uc-signal)', fg: 'var(--uc-black)' },
    launch: { l: 'Needed on launch', c: '#FF8B37', fg: 'var(--uc-black)' },
    rec: { l: 'Recommended', c: '#567EB9', fg: 'var(--uc-paper)' },
    future: { l: 'Future phase', c: 'transparent', fg: 'var(--fg-3)', outline: true }
  };
  return (
    <BPSection id="techstack" n="07" label="Architecture" dark grid tail="WHAT IT RUNS ON">
      <BPHeadline dark>
        A stack chosen for{' '}
        <BPSerif>longevity.</BPSerif>
      </BPHeadline>

      <p style={{ marginTop: 'clamp(16px, 2vw, 22px)', maxWidth: 760, fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)', lineHeight: 1.55, color: 'var(--uc-stone-300)' }}>
        Streamlining operations and omni-channel marketing matter as much as the storefront itself. We wire up the critical integrations — through Shopify apps or connection bridges — so everything syncs in real time. The platforms we manage include, but aren&rsquo;t limited to:
      </p>

      {/* ── Architecture diagram: the stack as layered tiers ── */}
      <div style={{ marginTop: 'clamp(28px, 3.5vw, 44px)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--uc-stone-500)' }}>How it fits together</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--uc-stone-500)', letterSpacing: '0.04em' }}>Shopify Plus at the core · everything else swappable</span>
        </div>

        {(() => {
          const layers = [
          { tier: '04', name: 'Growth & Intelligence', note: 'After launch', tools: [['Judge.me', 'rec'], ['Klaviyo', 'rec']] },
          { tier: '03', name: 'Experience & Engagement', note: 'Customer-facing', tools: [['Klaviyo', 'launch'], ['Shopify Inbox', 'start'], ['Shopify Forms', 'start']] },
          { tier: '02', name: 'Data & Integration', note: 'System of record', tools: [['Search & Discovery', 'start'], ['Shopify Flow', 'start'], ['Knowledge Base', 'start']] },
          { tier: '01', name: 'Commerce Core', note: 'Foundation', tools: [['Shopify Plus', 'start']], core: true }];

          const chip = { start: { bg: 'var(--uc-signal)', fg: 'var(--uc-black)' }, launch: { bg: '#FF8B37', fg: 'var(--uc-black)' }, rec: { bg: '#567EB9', fg: 'var(--uc-paper)' }, future: { bg: 'transparent', fg: 'var(--uc-stone-300)', outline: true } };
          return (
            <div style={{ display: 'flex', gap: 'clamp(12px, 1.6vw, 20px)' }}>
              {/* flow rail */}
              <div style={{ flexShrink: 0, width: 'clamp(30px, 3.4vw, 44px)', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--uc-stone-500)', writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', marginBottom: 8 }}>USER-FACING</span>
                <div style={{ flex: 1, width: 1, background: 'linear-gradient(var(--uc-signal), #FF8B37, #2B2B2B)' }} />
                <span style={{ marginTop: 8, color: 'var(--uc-stone-500)', fontSize: 11 }}>▾</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--uc-stone-500)', writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', marginTop: 8 }}>FOUNDATION</span>
              </div>

              {/* tiers */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {layers.map((L) =>
                <div key={L.tier} style={{
                  display: 'grid', gridTemplateColumns: 'minmax(0,280px) minmax(0,1fr)', gap: 'clamp(14px,2vw,28px)', alignItems: 'center',
                  padding: 'clamp(14px,1.8vw,20px) clamp(16px,2vw,24px)',
                  background: L.core ? 'var(--uc-paper)' : '#121212',
                  border: '1px solid ' + (L.core ? 'var(--uc-paper)' : '#1F1F1F'),
                  borderRadius: 6, position: 'relative', overflow: 'hidden'
                }}>
                    {L.core && <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'var(--uc-signal)' }} />}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 13, minWidth: 0 }}>
                      <span style={{ fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(26px,3vw,40px)', letterSpacing: '-0.04em', lineHeight: 0.9, flexShrink: 0, color: L.core ? 'var(--fg-3)' : 'var(--uc-stone-500)' }}>{L.tier}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                        <span style={{ fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 'clamp(15px,1.5vw,20px)', letterSpacing: '-0.025em', whiteSpace: 'nowrap', color: L.core ? 'var(--uc-black)' : 'var(--uc-paper)' }}>{L.name}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: L.core ? 'var(--fg-3)' : 'var(--uc-stone-500)' }}>{L.note}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {L.tools.map(([t, p]) => {
                      const c = chip[p];
                      return (
                        <span key={t} style={{
                          padding: '6px 12px', borderRadius: 5,
                          background: c.outline ? 'transparent' : c.bg,
                          border: c.outline ? '1px solid #2B2B2B' : 'none',
                          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(12px,1.2vw,15px)', letterSpacing: '-0.01em',
                          color: c.outline ? c.fg : c.fg, whiteSpace: 'nowrap'
                        }}>{t}</span>);

                    })}
                    </div>
                  </div>
                )}
              </div>
            </div>);

        })()}
      </div>

      <div style={{ marginTop: 'clamp(28px, 3.5vw, 44px)', background: '#15120D', border: '1px solid #241F18', borderRadius: 12, padding: 'clamp(18px, 2.4vw, 32px)' }}>
      <div style={{ border: '1px solid #1F1F1F', borderRadius: 6, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1.6fr) minmax(0,1.1fr) 96px', gap: 16, padding: '12px 18px', background: '#0F0F0F', borderBottom: '1px solid #1F1F1F', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--uc-stone-500)' }}>
          <span>Name</span><span>Functionality</span><span style={{ textAlign: 'center' }}>Priority</span><span style={{ textAlign: 'right' }}>Cost</span>
        </div>
        {/* Rows */}
        {rows.map((r, i) => {
            const m = priMeta[r.pri];
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1.6fr) minmax(0,1.1fr) 96px', gap: 16, padding: '14px 18px', borderBottom: i < rows.length - 1 ? '1px solid #1F1F1F' : 'none', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(14px,1.3vw,17px)', letterSpacing: '-0.012em', color: 'var(--uc-paper)' }}>{r.name}</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--uc-stone-300)' }}>{r.fn}</span>
              <span style={{ justifySelf: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 10px', borderRadius: 999, background: m.outline ? 'transparent' : m.c, border: m.outline ? '1px solid #2B2B2B' : 'none', fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: m.outline ? 'var(--uc-stone-300)' : m.fg, whiteSpace: 'nowrap' }}>
                  {!m.outline && <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--uc-black)' }} />}
                  {m.l}
                </span>
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--uc-paper)', textAlign: 'right' }}>{r.cost}</span>
            </div>);

          })}
        {/* Footer total */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1.6fr) minmax(0,1.1fr) 96px', gap: 16, padding: '14px 18px', borderTop: '1px solid #2B2B2B', background: '#0F0F0F', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--uc-signal)' }}>Est. monthly</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--uc-stone-500)' }}>Start + launch stack, before future phase</span>
          <span />
          <span style={{ fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(18px,1.8vw,24px)', letterSpacing: '-0.03em', color: 'var(--uc-paper)', textAlign: 'right', margin: "0px", width: "124px", padding: "0px" }}>~$2,525/mo</span>
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 18, flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--uc-stone-500)', letterSpacing: '0.06em' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--uc-signal)' }} />NEEDED TO START</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 999, background: '#FF8B37' }} />NEEDED ON LAUNCH</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 999, background: '#567EB9' }} />RECOMMENDED</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 999, border: '1px solid #2B2B2B' }} />FUTURE PHASE</span>
        <span style={{ marginLeft: 'auto' }}>↳ Swappable to your existing vendors</span>
      </div>
      </div>

    </BPSection>);

}

// ── 08 B2B ENABLEMENT ───────────────────────────────────────────────────────
function BPB2B() {
  const caps = [
  { t: 'Company accounts & roles', d: 'Multi-buyer companies, permissions, and spend limits per seat.' },
  { t: 'Catalog & price lists', d: 'Customer-specific catalogs, contract pricing, and volume breaks.' },
  { t: 'Payment terms', d: 'NET-30/45/60, PO numbers, and credit limits at checkout.' },
  { t: 'Quick order and reorder', d: 'Customer account pages for quick order and reorder, and vaulted credit cards.' },
  { t: 'Sales rep tools', d: 'Order on behalf of, draft orders, and assisted selling.' }];

  const channels = [{ l: 'DTC Storefront', future: true }, { l: 'B2B Portal' }, { l: 'Sales Reps' }];
  return (
    <BPSection id="b2b" n="08" label="Unified" paper tail="ONE OPERATION">
      <BPHeadline>
        One experience{' '}
        <BPSerif>across every channel.</BPSerif>
      </BPHeadline>
      <p style={{ marginTop: 'clamp(20px, 2.4vw, 28px)', maxWidth: 640, fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)', lineHeight: 1.5, color: 'var(--fg-2)' }}>
        Native Shopify B2B primitives, configured for your accounts, terms, and sales motion — no bolt-on platform required.
      </p>

      {/* Convergence diagram + capability list */}
      <div style={{ marginTop: 'clamp(32px, 4vw, 56px)', display: 'grid', gridTemplateColumns: 'minmax(0, 0.85fr) minmax(0, 1.15fr)', gap: 'clamp(28px, 4vw, 64px)', alignItems: 'center' }}>
        {/* Channels → one core */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,auto) minmax(0,auto)', gap: 'clamp(10px,1.4vw,18px)', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {channels.map((c, i) =>
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--fg-1)', padding: '10px 12px', border: '1px solid var(--line-2)', borderRadius: 5, background: 'var(--uc-paper)', textAlign: 'center', whiteSpace: 'nowrap' }}>{c.l}{c.future && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', border: '1px solid var(--line-2)', borderRadius: 999, padding: '2px 6px' }}>Future Phase</span>}</div>
            )}
          </div>
          {/* connectors */}
          <svg viewBox="0 0 60 200" preserveAspectRatio="none" style={{ width: 'clamp(36px,5vw,60px)', height: '100%', alignSelf: 'stretch' }}>
            {[28, 76, 124, 172].map((y, i) =>
            <path key={i} d={`M0 ${y} C 30 ${y}, 30 100, 60 100`} fill="none" stroke="var(--uc-stone-500)" strokeWidth="1.4" />
            )}
            <circle cx="58" cy="100" r="3" fill="var(--uc-signal)" stroke="var(--uc-black)" strokeWidth="1" />
          </svg>
          {/* one core */}
          <div style={{ width: 'clamp(78px,9vw,116px)', aspectRatio: '1/1', borderRadius: 999, background: 'var(--uc-black)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, boxShadow: '0 0 0 6px rgba(232,255,82,0.14)' }}>
            <span style={{ fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 'clamp(15px,1.6vw,20px)', letterSpacing: '-0.03em', color: 'var(--uc-paper)' }}>One</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.16em', color: 'var(--uc-signal)' }}>SHOPIFY CORE</span>
          </div>
        </div>

        {/* Capability list */}
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--line-1)' }}>
          {caps.map((x, i) =>
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,40px) minmax(0,1fr)', gap: 16, alignItems: 'baseline', padding: 'clamp(13px,1.5vw,18px) 0', borderBottom: '1px solid var(--line-1)', position: 'relative' }}>
              <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: 16, height: 2, background: 'var(--uc-signal)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(15px,1.4vw,19px)', letterSpacing: '-0.015em', color: 'var(--fg-1)' }}>{x.t}</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 14, lineHeight: 1.4, color: 'var(--fg-2)', display: 'block', marginTop: 3 }}>{x.d}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 20, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.06em' }}>
        ↳ Built on Shopify B2B (Plus) · extended by Uncap products where needed
      </div>
    </BPSection>);

}

// ── 11b PHASE 2 ──────────────────────────────────────────────────────────────
function BPPhase2() {
  const pkg = {
    n: '01', name: 'Phase 2', tagline: 'A direct-to-consumer flagship for Mill Hill.', feature: false, accentBar: true,
    who: 'A standalone DTC storefront at MillHill.com — its own theme, URL, catalog, and customer database, home to the Mill Hill, Mirabilia, Nora Corbett, Permin, and Zweigart brands.',
    workLabel: 'What it includes',
    work: [
    'Dedicated DTC storefront at MillHill.com, fully separate from the Wichelt B2B site',
    'Consumer-only at MSRP — no B2B tiers, with an outbound "Become a Retailer" link to Wichelt',
    'Catalog import: ~500 Mill Hill and ~200 Mirabilia / Nora Corbett SKUs, plus Permin, Zweigart fabric, complements & an outlet',
    'Brand and designer storytelling that gives each label a real home',
    '"Complete your project" cross-sell — threads, fabric, and accessories beside kits and charts',
    'Store locator featuring LNS partners and the Mill Hill La Crosse store',
    'Faceted filtering tuned to the catalog — brand, theme, fabric count, price, availability',
    'Learn section with a beginner\u2019s guide and how-to content',
    'Email capture wired to your marketing platform with lifecycle flows',
    'US launch first — Canada and select markets to follow via Shopify Markets'],

    outcome: 'A boutique consumer storefront — heritage, warm, and designer-forward — backed by a 60-year manufacturer.',
    priceLabel: 'Project estimate', price: '$25k'
  };

  return (
    <BPSection id="phase2" n="11b" label="Phase 2" tail="THE CONSUMER STORE">
      <BPHeadline>
        Phase 2:{' '}
        <BPSerif>A home for Mill Hill.</BPSerif>
      </BPHeadline>
      <p style={{ marginTop: 'clamp(18px, 2.2vw, 26px)', maxWidth: 640, fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)', lineHeight: 1.5, color: 'var(--fg-2)' }}>
        A separate direct-to-consumer storefront for the Mill Hill family of brands &mdash; its own store, its own audience, built on the same foundation.
      </p>

      <div style={{ marginTop: 'clamp(30px, 4vw, 52px)', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14, alignItems: 'stretch' }}>
        <BPInvestmentCard p={pkg} />
      </div>

      {/* Next-step note (no buffer allowance here) */}
      <div style={{
        marginTop: 16, padding: 'clamp(22px, 2.6vw, 32px)',
        border: '1px dashed var(--line-2)', borderRadius: 12, background: 'var(--uc-bone)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span aria-hidden="true" style={{ width: 16, height: 2, background: 'var(--uc-signal)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>Next step</span>
        </div>
        <div style={{ fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 'clamp(20px, 2vw, 28px)', letterSpacing: '-0.03em', lineHeight: 1.05, color: 'var(--fg-1)' }}>A fixed price and proposal, when you&rsquo;re ready.</div>
        <p style={{ margin: '10px 0 0', maxWidth: 720, fontFamily: 'var(--font-serif)', fontSize: 'clamp(14px, 1.2vw, 16px)', lineHeight: 1.5, color: 'var(--fg-2)', textWrap: 'pretty' }}>
          This $25k figure frames the Phase 2 investment. We&rsquo;ll lock a fixed bid price and a full proposal separately &mdash; during the Wichelt B2B build or after, whenever you&rsquo;re ready to move on the consumer store.
        </p>
      </div>

    </BPSection>);

}

// ── 09 AGENTIC ──────────────────────────────────────────────────────────────
function BPAgentic() {
  const caps = [
  { t: 'AI storefront search', d: 'Shoppers ask in plain language — "what fabric do I need for this Mirabilia chart" — and land on the right SKU.' },
  { t: 'Conversational assistant', d: 'An on-site agent that answers spec questions, compares products, and builds the cart.' },
  { t: 'Agent-ready catalog', d: 'A machine-readable storefront so external agents — ChatGPT, Perplexity — can find and buy your products.' },
  { t: 'Agentic checkout', d: 'Universal Cart and delegated checkout let trusted agents transact, securely, on Shopify rails.' },
  { t: 'AEO optimized', d: 'FAQ content, JSON-LD, and the technical components that make products discoverable to AI.' }];

  const chat = [
  { who: 'buyer', text: 'What fabric do I need for this Mirabilia chart?' },
  { who: 'agent', text: 'For that design, here are the right picks:' },
  { who: 'cards', items: [
    { t: 'Belfast Linen 32ct · Cream', c: '#E2D9C4', qty: '½ yd', icon: <g stroke="#fff" strokeWidth="1.4">{[...Array(7)].map((_, i) => <line key={'v' + i} x1={10 + i * 5} y1="10" x2={10 + i * 5} y2="38" />)}{[...Array(7)].map((_, i) => <line key={'h' + i} x1="10" y1={10 + i * 5} x2="38" y2={10 + i * 5} />)}</g> },
    { t: 'DMC Floss · 12 colors', c: '#C9D6E2', qty: '×12', icon: <g stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round"><path d="M16 8 V40 M24 8 V40 M32 8 V40" /><path d="M12 14 H36 M12 34 H36" /></g> }]
  },
  { who: 'buyer', text: 'Perfect — add both to my order.' }];

  return (
    <BPSection id="agentic" n="09" label="Agentic" dark tail="THE AI-ENABLED STORE">
      <BPHeadline dark>
        Built for the{' '}
        <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--uc-stone-300)' }}>agentic web.</span>
      </BPHeadline>
      <p style={{ marginTop: 'clamp(20px, 2.4vw, 28px)', maxWidth: 640, fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)', lineHeight: 1.5, color: 'var(--uc-stone-300)' }}>
        Shopify is becoming AI-native — and so is your store. Buyers shop by conversation,
        and AI agents discover, compare, and check out on your catalog. We build it ready for both.
      </p>

      <div style={{ marginTop: 'clamp(32px, 4vw, 56px)', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.15fr)', gap: 'clamp(28px, 4vw, 64px)', alignItems: 'center' }}>
        {/* chat mock */}
        <div style={{ border: '1px solid #1F1F1F', borderRadius: 12, background: '#121212', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', borderBottom: '1px solid #1F1F1F' }}>
            <span style={{ width: 18, height: 18, borderRadius: 999, background: 'var(--uc-signal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 800, color: 'var(--uc-black)' }}>✦</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--uc-stone-300)' }}>Shop Assistant</span>
            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--uc-stone-500)' }}><span style={{ width: 5, height: 5, borderRadius: 999, background: '#3F8B5D' }} />Online</span>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chat.map((m, i) =>
            m.who === 'cards' ?
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {m.items.map((p, j) =>
              <div key={j} style={{ border: '1px solid #2B2B2B', borderRadius: 10, background: '#1A1A1A', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ height: 96, background: `linear-gradient(140deg, ${p.c}, #2A2622)`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="40" height="40" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.55 }}>{p.icon}</svg>
                        <span style={{ position: 'absolute', top: 6, right: 6, fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, color: 'var(--uc-paper)', background: 'rgba(0,0,0,0.45)', borderRadius: 3, padding: '2px 6px' }}>{p.qty}</span>
                        <span style={{ position: 'absolute', bottom: 6, left: 6, fontFamily: 'var(--font-mono)', fontSize: 6.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--uc-paper)', background: 'rgba(0,0,0,0.4)', borderRadius: 2, padding: '1px 5px' }}>IN STOCK</span>
                      </div>
                      <div style={{ padding: '9px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 10, lineHeight: 1.2, color: 'var(--uc-paper)' }}>{p.t}</span>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--uc-signal)' }}>{p.price}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, fontWeight: 800, color: 'var(--uc-black)', background: 'var(--uc-signal)', borderRadius: 3, padding: '3px 9px' }}>ADD</span>
                        </div>
                      </div>
                    </div>
              )}
                </div> :

            <div key={i} style={{ display: 'flex', justifyContent: m.who === 'buyer' ? 'flex-end' : 'flex-start' }}>
                  <span style={{
                maxWidth: '82%', padding: '9px 13px', borderRadius: 12,
                borderBottomRightRadius: m.who === 'buyer' ? 3 : 12,
                borderBottomLeftRadius: m.who === 'buyer' ? 12 : 3,
                fontFamily: 'var(--font-sans)', fontSize: 12.5, lineHeight: 1.4,
                background: m.who === 'buyer' ? 'var(--uc-paper)' : '#1E1E1E',
                color: m.who === 'buyer' ? 'var(--uc-black)' : 'var(--uc-paper)',
                border: m.who === 'agent' ? '1px solid #2B2B2B' : 'none'
              }}>{m.text}</span>
                </div>

            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, padding: '8px 12px', border: '1px solid #2B2B2B', borderRadius: 999 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--uc-stone-500)', flex: 1 }}>Ask anything…</span>
              <span style={{ width: 22, height: 22, borderRadius: 999, background: 'var(--uc-signal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--uc-black)' }}>↑</span>
            </div>
          </div>
        </div>

        {/* capability list */}
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #1F1F1F' }}>
          {caps.map((x, i) =>
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,40px) minmax(0,1fr)', gap: 16, alignItems: 'baseline', padding: 'clamp(14px,1.7vw,20px) 0', borderBottom: '1px solid #1F1F1F', position: 'relative' }}>
              <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: 16, height: 2, background: 'var(--uc-signal)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-stone-500)' }}>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(15px,1.4vw,20px)', letterSpacing: '-0.015em', color: 'var(--uc-paper)' }}>{x.t}</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 14.5, lineHeight: 1.45, color: 'var(--uc-stone-300)', display: 'block', marginTop: 4 }}>{x.d}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 20, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-stone-500)', letterSpacing: '0.06em' }}>
        ↳ Storefront MCP · Universal Cart · agent-ready product feeds
      </div>
    </BPSection>);

}

// ── 09 SYSTEM INTEGRATIONS ──────────────────────────────────────────────────
function BPIntegrations() {
  const pFont = '-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  const maps = [
  { l: 'Order', d: '→', r: 'Sales Order' },
  { l: 'Customer', d: '→', r: 'Account' },
  { l: 'Line items', d: '→', r: 'SO Lines' },
  { l: 'Inventory', d: '←', r: 'Stock on hand' },
  { l: 'Fulfillment', d: '←', r: 'Item Fulfillment' }];

  const activity = [
  ['Order #SO-48217 pushed to NetSuite', '2 min ago'],
  ['Inventory delta · 1,284 items reconciled', '9 min ago'],
  ['Customer ACME Contracting created in ERP', '14 min ago']];

  const Card = ({ children, pad = true }) =>
  <div style={{ background: '#FFFFFF', border: '1px solid #E3E3E3', borderRadius: 12, boxShadow: '0 1px 0 rgba(0,0,0,0.05)', padding: pad ? '14px 16px' : 0 }}>{children}</div>;

  const Badge = ({ children, tone = 'info' }) => {
    const t = tone === 'success' ? { bg: '#CDFEE1', fg: '#014B40' } : tone === 'attention' ? { bg: '#FFF1E3', fg: '#5E3B00' } : { bg: '#EBF5FA', fg: '#00527C' };
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: pFont, fontSize: 11, fontWeight: 600, color: t.fg, background: t.bg, borderRadius: 8, padding: '2px 8px', whiteSpace: 'nowrap' }}>{children}</span>;
  };
  return (
    <BPSection id="integrations" n="09" label="Integrated" tail="HOW IT CONNECTS">
      <BPHeadline>
        One operation,{' '}
        <BPSerif>not five silos.</BPSerif>
      </BPHeadline>
      <p style={{ marginTop: 'clamp(18px, 2.2vw, 26px)', maxWidth: 640, fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)', lineHeight: 1.5, color: 'var(--fg-2)' }}>
        Uncap Connect runs as a Shopify-embedded app — a real-time, bidirectional ERP
        integration with field-level mapping and a live sync log, managed right inside admin.
      </p>

      {/* Shopify-embedded app (Polaris) */}
      <div style={{ marginTop: 'clamp(30px, 4vw, 52px)', border: '1px solid var(--line-2)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 24px 60px -32px rgba(10,10,10,0.45)' }}>
        {/* Shopify admin top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px', background: '#1A1A1A' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 20, height: 20, borderRadius: 5, background: '#95BF47', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: pFont, fontSize: 12, fontWeight: 800, color: '#1A1A1A' }}>S</span>
            <span style={{ fontFamily: pFont, fontSize: 11.5, fontWeight: 600, color: '#E3E3E3' }}>{brandHandle()}-supply</span>
          </span>
          <span style={{ flex: 1, maxWidth: 360, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 7, background: '#303030', borderRadius: 8, padding: '6px 11px' }}>
            <span style={{ color: '#8A8A8A', fontSize: 11 }}>⌕</span>
            <span style={{ fontFamily: pFont, fontSize: 11, color: '#8A8A8A' }}>Search</span>
          </span>
          <span style={{ width: 22, height: 22, borderRadius: 999, background: 'linear-gradient(135deg,#5C6AC4,#202E78)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: pFont, fontSize: 10, fontWeight: 700, color: '#fff' }}>D</span>
        </div>

        {/* admin nav + Polaris page */}
        <div style={{ display: 'flex', background: '#F1F1F1' }}>
          {/* Shopify standard left navigation */}
          <div style={{ flexShrink: 0, width: 'clamp(132px, 15vw, 174px)', background: '#EBEBEB', borderRight: '1px solid #DEDEDE', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {(() => {
              const I = (p) => <svg viewBox="0 0 18 18" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>{p}</svg>;
              const main = [
              ['Home', I(<><path d="M3 8 L9 3 L15 8" /><path d="M5 8 V15 H13 V8" /></>)],
              ['Orders', I(<><path d="M5 6 V5.5 a4 4 0 0 1 8 0 V6" /><path d="M4 6 H14 L13.2 15 H4.8 Z" /></>)],
              ['Products', I(<><path d="M4 5 H14 V14 H4 Z" /><path d="M4 8 H14" /></>)],
              ['Customers', I(<><circle cx="9" cy="7" r="2.6" /><path d="M4 15 c0-3 10-3 10 0" /></>)],
              ['Marketing', I(<><path d="M4 8 L12 4 V14 L4 10 Z" /><path d="M4 8 v3" /></>)],
              ['Discounts', I(<><path d="M5 11 L12 4" /><circle cx="6.2" cy="5.6" r=".8" /><circle cx="11" cy="10.4" r=".8" /></>)],
              ['Content', I(<><path d="M5 3 H11 L14 6 V15 H5 Z" /><path d="M7 9 H12 M7 12 H11" /></>)],
              ['Analytics', I(<><path d="M4 14 V9 M9 14 V4 M14 14 V10" /></>)]];

              const channels = [
              ['Online Store', I(<><circle cx="9" cy="9" r="6" /><path d="M3 9 H15" /><path d="M9 3 a8 8 0 0 1 0 12 a8 8 0 0 1 0 -12" /></>)],
              ['Point of Sale', I(<><path d="M4 4 H14 V11 H4 Z" /><path d="M6 14 H12" /></>)]];

              const NavItem = ({ label, icon, active, badge }) =>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 9px', borderRadius: 8, fontFamily: pFont, fontSize: 12, fontWeight: active ? 700 : 500, color: active ? '#1A1A1A' : '#4A4A4A', background: active ? '#FFFFFF' : 'transparent', boxShadow: active ? '0 1px 0 rgba(0,0,0,0.06)' : 'none' }}>
                  {icon}
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
                  {badge && <span style={{ fontFamily: pFont, fontSize: 9.5, fontWeight: 700, color: '#4A4A4A', background: '#DADADA', borderRadius: 6, padding: '1px 6px' }}>{badge}</span>}
                </div>;

              const Group = ({ children }) => <span style={{ fontFamily: pFont, fontSize: 10, fontWeight: 600, letterSpacing: '0.02em', color: '#8A8A8A', padding: '4px 9px', marginTop: 8 }}>{children}</span>;
              return (
                <>
                  {main.map(([l, ic]) => <NavItem key={l} label={l} icon={ic} badge={l === 'Orders' ? '6' : null} />)}
                  <Group>Sales channels</Group>
                  {channels.map(([l, ic]) => <NavItem key={l} label={l} icon={ic} />)}
                  <Group>Apps</Group>
                  <NavItem label="Uncap Connect" active icon={<span style={{ width: 15, height: 15, borderRadius: 4, background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: pFont, fontSize: 9, fontWeight: 800, color: '#95BF47', flexShrink: 0 }}>⌖</span>} />
                </>);

            })()}
          </div>

          {/* Polaris page */}
          <div style={{ flex: 1, minWidth: 0, padding: 'clamp(16px,2vw,24px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* page header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontFamily: pFont, fontSize: 11.5, color: '#005BD3', fontWeight: 600 }}>‹ Apps</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: pFont, fontSize: 'clamp(18px,1.8vw,22px)', fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.01em' }}>Uncap Connect</span>
                <Badge tone="success"><span style={{ width: 6, height: 6, borderRadius: 999, background: '#29845A' }} />Connected</Badge>
              </span>
              <span style={{ fontFamily: pFont, fontSize: 12.5, color: '#616161' }}>NetSuite ERP integration</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontFamily: pFont, fontSize: 12, fontWeight: 600, color: '#303030', background: '#FFFFFF', border: '1px solid #E3E3E3', borderRadius: 8, padding: '7px 13px', boxShadow: '0 1px 0 rgba(0,0,0,0.05)' }}>View logs</span>
              <span style={{ fontFamily: pFont, fontSize: 12, fontWeight: 600, color: '#FFFFFF', background: '#303030', borderRadius: 8, padding: '7px 13px' }}>Sync now</span>
            </div>
          </div>

          {/* connection card */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <span style={{ width: 34, height: 34, borderRadius: 8, background: '#101A2B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: pFont, fontSize: 13, fontWeight: 800, color: '#9FB4FF' }}>NS</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontFamily: pFont, fontSize: 13.5, fontWeight: 700, color: '#1A1A1A' }}>NetSuite ERP</span>
                  <span style={{ fontFamily: pFont, fontSize: 11.5, color: '#616161' }}>Account 4827-PROD · Last sync 2 min ago</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <Badge tone="info">Real-time</Badge>
                <Badge tone="info">Bidirectional</Badge>
                <span style={{ display: 'inline-flex', border: '1px solid #E3E3E3', borderRadius: 8, overflow: 'hidden' }}>
                  {['Real-time', 'Scheduled'].map((m, i) => <span key={m} style={{ fontFamily: pFont, fontSize: 11, fontWeight: 600, padding: '6px 11px', background: i === 0 ? '#303030' : '#FFFFFF', color: i === 0 ? '#FFFFFF' : '#616161' }}>{m}</span>)}
                </span>
              </div>
            </div>
          </Card>

          {/* field mapping card */}
          <Card pad={false}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '13px 16px', borderBottom: '1px solid #E3E3E3' }}>
              <span style={{ fontFamily: pFont, fontSize: 13.5, fontWeight: 700, color: '#1A1A1A' }}>Field mapping · Order ⇄ Sales Order</span>
              <span style={{ fontFamily: pFont, fontSize: 12, fontWeight: 600, color: '#005BD3' }}>Edit</span>
            </div>
            {/* table header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) clamp(48px,6vw,72px) minmax(0,1.3fr) minmax(0,90px)', gap: 'clamp(8px,1.2vw,16px)', padding: '8px 16px', background: '#FAFAFA', borderBottom: '1px solid #E3E3E3' }}>
              {['Shopify', '', 'NetSuite', 'Status'].map((h, i) => <span key={i} style={{ fontFamily: pFont, fontSize: 10.5, fontWeight: 600, color: '#616161', textAlign: i === 3 ? 'right' : 'left' }}>{h}</span>)}
            </div>
            {maps.map((m, i) =>
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) clamp(48px,6vw,72px) minmax(0,1.3fr) minmax(0,90px)', gap: 'clamp(8px,1.2vw,16px)', padding: '10px 16px', borderBottom: i < maps.length - 1 ? '1px solid #F1F1F1' : 'none', alignItems: 'center' }}>
                <span style={{ fontFamily: pFont, fontSize: 12.5, fontWeight: 600, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.l}</span>
                <span style={{ fontFamily: pFont, fontSize: 13, fontWeight: 700, color: m.d === '←' ? '#B98900' : '#616161', textAlign: 'center' }}>{m.d}</span>
                <span style={{ fontFamily: pFont, fontSize: 12.5, color: '#303030', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.r}</span>
                <span style={{ justifySelf: 'end' }}><Badge tone="success">Synced</Badge></span>
              </div>
              )}
          </Card>

          {/* activity card */}
          <Card pad={false}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid #E3E3E3', fontFamily: pFont, fontSize: 13.5, fontWeight: 700, color: '#1A1A1A' }}>Recent activity</div>
            {activity.map((a, i) =>
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 16px', borderBottom: i < activity.length - 1 ? '1px solid #F1F1F1' : 'none' }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: '#29845A', flexShrink: 0 }} />
                <span style={{ fontFamily: pFont, fontSize: 12.5, color: '#303030', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a[0]}</span>
                <span style={{ fontFamily: pFont, fontSize: 11.5, color: '#8A8A8A', whiteSpace: 'nowrap' }}>{a[1]}</span>
              </div>
              )}
          </Card>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.06em' }}>
        ↳ Native Shopify-embedded app · field maps owned and versioned · no manual re-keying
      </div>
    </BPSection>);

}

function BPMigration() {
  const steps = [
  { t: 'Audit & map', s: 'Catalogue every record — products, customers, orders, content, redirects.' },
  { t: 'Transform', s: 'Clean, dedupe, and re-map data to the new model. Nothing copied blind.' },
  { t: 'Stage & verify', s: 'Dry-run into staging. Reconcile counts, spot-check edge cases.' },
  { t: 'Cutover', s: 'Final delta sync, 301 redirect map, DNS switch with zero lost orders.' }];

  const stats = [
  { v: '15,000+', l: 'Products' },
  { v: '~900', l: 'Customers' },
  { v: '50+', l: 'Collections' }];

  return (
    <BPSection id="migration" n="10" label="Migration" paper tail="MOVE WITHOUT LOSS" vec="bgVector2">
      <BPHeadline>
        Replatform{' '}
        <BPSerif>without losing a thing.</BPSerif>
      </BPHeadline>
      <p style={{ marginTop: 18, maxWidth: 600, fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)', lineHeight: 1.5, color: 'var(--fg-2)' }}>
        We migrate cart-to-cart — every product, customer, and order — and re-map the
        messy parts: legacy categories become tags, custom attributes become metafields,
        old URLs become 301s. Nothing copied blind, nothing lost.
      </p>

      {/* cart-to-cart field crosswalk */}
      {(() => {
        const source = [['Title', 'text'], ['SKU', 'text'], ['Price', 'money'], ['Brand', 'text'], ['Categories', 'list'], ['spec_sheet', 'custom'], ['install_guide', 'custom'], ['Legacy URL', 'url']];
        const target = [['Title', 'text', '1:1'], ['SKU / Variant', 'text', '1:1'], ['Price', 'money', '1:1'], ['Vendor', 'text', 'from Brand'], ['Tags', 'list', 'merged'], ['spec_sheet', 'metafield', 'metafield'], ['install_guide', 'metafield', 'metafield'], ['Redirect', 'url', '301']];
        const links = [[0, 0, 1], [1, 1, 1], [2, 2, 1], [3, 3, 0], [3, 4, 0], [4, 4, 0], [5, 5, 0], [6, 6, 0], [7, 7, 0]];
        const cols = '1fr clamp(54px,8vw,108px) 1fr';
        const tBadge = (t) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--fg-3)', background: 'var(--uc-bone)', border: '1px solid var(--line-1)', borderRadius: 3, padding: '1px 5px', whiteSpace: 'nowrap' }}>{t}</span>;
        return (
          <div style={{ marginTop: 'clamp(30px, 4vw, 48px)', border: '1px solid var(--line-2)', borderRadius: 10, overflow: 'hidden', background: 'var(--uc-paper)', boxShadow: '0 24px 60px -34px rgba(10,10,10,0.4)' }}>
            {/* platform header */}
            <div style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', borderBottom: '1px solid var(--line-1)', background: 'var(--uc-bone)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px' }}>
                <span style={{ width: 26, height: 26, borderRadius: 6, background: '#121118', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-hero)', fontSize: 12, fontWeight: 800, color: '#8FA0FF' }}>C</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em', color: 'var(--fg-1)' }}>Custom Cart</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-3)' }}>Legacy store · ~16,000 records</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--fg-3)' }}>MIGRATE</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 800, color: 'var(--uc-signal)', background: 'var(--uc-black)', borderRadius: 4, padding: '1px 9px' }}>→</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '12px 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em', color: 'var(--fg-1)' }}>Shopify Plus</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-3)' }}>New store · mapped & verified</span>
                </div>
                <span style={{ width: 26, height: 26, borderRadius: 6, background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-hero)', fontSize: 12, fontWeight: 800, color: '#95BF47' }}>S</span>
              </div>
            </div>
            {/* record type tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '9px 16px', borderBottom: '1px solid var(--line-1)', flexWrap: 'wrap' }}>
              {['Products', 'Customers', 'Content'].map((t, i) => <span key={t} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11.5, letterSpacing: '-0.01em', color: i === 0 ? 'var(--fg-1)' : 'var(--fg-3)', borderBottom: i === 0 ? '2px solid var(--uc-black)' : '2px solid transparent', paddingBottom: 3 }}>{t}</span>)}
              <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, color: '#2F7D52' }}><span style={{ width: 6, height: 6, borderRadius: 999, background: '#3F8B5D' }} />Field map verified</span>
            </div>
            {/* crosswalk */}
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: cols, minHeight: 'clamp(300px, 33vw, 392px)' }}>
              {/* left record */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {source.map(([n, ty], i) =>
                <div key={i} style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 9, padding: '0 16px', borderTop: i ? '1px solid var(--line-1)' : 'none' }}>
                    {tBadge(ty)}
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(12px,1.1vw,14.5px)', color: 'var(--fg-1)', whiteSpace: 'nowrap' }}>{n}</span>
                    <span style={{ position: 'absolute', right: -4, top: '50%', transform: 'translateY(-50%)', width: 7, height: 7, borderRadius: 999, background: 'var(--uc-paper)', border: '1.5px solid var(--fg-3)' }} />
                  </div>
                )}
              </div>
              {/* connectors */}
              <div style={{ position: 'relative' }}>
                <svg width="100%" height="100%" viewBox="0 0 100 1000" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, display: 'block' }}>
                  {links.map(([sI, tI, k], j) => {const yL = (sI + 0.5) / source.length * 1000;const yR = (tI + 0.5) / target.length * 1000;return <path key={j} d={'M0 ' + yL + ' C 55 ' + yL + ' 45 ' + yR + ' 100 ' + yR} fill="none" stroke={k ? 'var(--uc-signal)' : 'var(--uc-brand)'} strokeWidth="2" strokeDasharray={k ? '0' : '7 5'} vectorEffect="non-scaling-stroke" />;})}
                </svg>
              </div>
              {/* right record */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {target.map(([n, ty, tf], i) =>
                <div key={i} style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', gap: 9, padding: '0 16px', borderTop: i ? '1px solid var(--line-1)' : 'none' }}>
                    <span style={{ position: 'absolute', left: -4, top: '50%', transform: 'translateY(-50%)', width: 7, height: 7, borderRadius: 999, background: 'var(--uc-paper)', border: '1.5px solid var(--fg-3)' }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(12px,1.1vw,14.5px)', color: 'var(--fg-1)', whiteSpace: 'nowrap' }}>{n}</span>
                    <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 8.5, fontWeight: 700, letterSpacing: '0.03em', whiteSpace: 'nowrap', color: tf === '1:1' ? 'var(--fg-3)' : 'var(--uc-black)', background: tf === '1:1' ? 'transparent' : 'var(--uc-signal)', border: tf === '1:1' ? '1px solid var(--line-1)' : '1px solid var(--uc-signal)', borderRadius: 3, padding: '1px 6px' }}>{tf}</span>
                  </div>
                )}
              </div>
            </div>
            {/* legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '11px 16px', borderTop: '1px solid var(--line-1)', background: 'var(--uc-bone)', flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><span style={{ width: 18, height: 2, background: 'var(--uc-signal)' }} />1:1 copy</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><span style={{ width: 18, height: 2, background: 'repeating-linear-gradient(90deg, var(--uc-brand) 0 5px, transparent 5px 9px)' }} />Transformed — tags · metafields · 301s</span>
              <span style={{ marginLeft: 'auto' }}>Tags, custom fields &amp; attributes preserved</span>
            </div>
          </div>);

      })()}

      {/* guarantee strip */}
      <div style={{ marginTop: 'clamp(28px, 3vw, 40px)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderTop: '1px solid var(--line-1)', borderBottom: '1px solid var(--line-1)' }}>
        {stats.map((s, i) =>
        <div key={i} style={{ padding: '24px 24px 24px 0', paddingLeft: i > 0 ? 24 : 0, borderLeft: i > 0 ? '1px solid var(--line-1)' : 'none', position: 'relative' }}>
            <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: i > 0 ? 24 : 0, width: 16, height: 2, background: 'var(--uc-signal)' }} />
            <div style={{ fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(32px, 3.6vw, 56px)', letterSpacing: '-0.045em', lineHeight: 0.9, color: 'var(--fg-1)' }}>{s.v}</div>
            <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>{s.l}</div>
          </div>
        )}
      </div>
    </BPSection>);

}
window.BPMigration = BPMigration;

function BPDelivery() {
  const milestones = [
  { wk: 'WK 01', t: 'Kickoff + Blueprint start', s: 'Discovery, architecture, data model.' },
  { wk: 'WK 03', t: 'Blueprint sign-off', s: 'Plan, prototype, and budget locked.' },
  { wk: 'WK 06', t: 'Storefront alpha', s: 'Core theme + catalog in staging.' },
  { wk: 'WK 09', t: 'Integrations live', s: 'ERP sync + B2B flows validated.' },
  { wk: 'WK 11', t: 'Migration + QA', s: 'Data moved, redirects, full QA pass.' },
  { wk: 'WK 12', t: 'Launch', s: 'Go live + 30-day support begins.' }];

  return (
    <BPSection id="delivery" n="10" label="Delivery" paper tail="TIMELINE">
      <BPHeadline>
        Sixteen weeks,{' '}
        <BPSerif>phase by phase.</BPSerif>
      </BPHeadline>

      {/* Gantt timeline */}
      <BPGantt />

      {/* Dedicated project team */}
      <div style={{ marginTop: 'clamp(48px, 6vw, 88px)', paddingTop: 'clamp(32px, 4vw, 52px)', borderTop: '1px solid var(--line-2)' }}>
        {/* eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <span aria-hidden="true" style={{ width: 16, height: 2, background: 'var(--uc-signal)' }} />
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
    </BPSection>);

}

// ── 07 TEAM ─────────────────────────────────────────────────────────────────
function BPTeam() {
  const team = [
  { n: 'Denis Dyli', r: 'CEO, Principal', img: 'assets/team-denis.png' },
  { n: 'Ryan Muir', r: 'Managing Director', img: 'assets/team-ryan.png' },
  { n: 'Mike Gojcaj', r: 'Head of Solutions', img: 'assets/team-mike.png' },
  { n: 'Michael Johnson', r: 'Head of Delivery', img: 'assets/team-michael.png' },
  { n: 'Jo Tan', r: 'Head of Design', img: 'assets/team-jo.png' }];

  return (
    <BPSection id="team" n="13" label="Team" tail="WHO DOES THE WORK">
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
        {team.map((p, i) =>
        <div key={i} style={{ background: 'var(--uc-paper)', border: '1px solid var(--line-2)', borderRadius: 5, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ aspectRatio: '1/1', background: 'var(--uc-stone-200)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--line-1)' }}>
              <img src={p.img} alt={p.n} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '-0.012em', color: 'var(--fg-1)' }}>{p.n}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', marginTop: 4 }}>{p.r}</div>
            </div>
          </div>
        )}
      </div>
    </BPSection>);

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
      padding: 'clamp(24px, 3vw, 40px)',
      display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'clamp(28px, 4vw, 56px)'
    }}>
      {(feat || p.accentBar) && <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: 'var(--uc-signal)' }} />}

      {/* LEFT: identity + price + outcome */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2vw, 22px)' }}>
        {/* identity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.6vw, 16px)' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(30px, 3.4vw, 48px)', letterSpacing: '-0.04em', lineHeight: 0.92, color: fg }}>{p.name}</div>
            <div style={{ marginTop: 8, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(15px, 1.3vw, 18px)', color: sub }}>{p.tagline}</div>
          </div>
          <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 'clamp(13.5px, 1.1vw, 15px)', lineHeight: 1.5, color: sub, textWrap: 'pretty' }}>{p.who}</p>
        </div>

        {/* price */}
        <div style={{ paddingTop: 'clamp(14px, 1.8vw, 18px)', borderTop: '1px solid ' + line }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: faint }}>{p.priceLabel}</div>
          <div style={{ marginTop: 6, fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(40px, 5vw, 68px)', letterSpacing: '-0.045em', lineHeight: 0.9, color: fg }}>{p.price}</div>
        </div>

        {/* outcome */}
        <div style={{ marginTop: 'auto', padding: 'clamp(14px, 1.6vw, 18px)', background: feat ? '#141414' : 'var(--uc-bone)', border: '1px solid ' + line, borderRadius: 8 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: faint, marginBottom: 7 }}>You walk away with</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(14px, 1.2vw, 16px)', lineHeight: 1.45, color: fg, textWrap: 'pretty' }}>{p.outcome}</div>
        </div>
      </div>

      {/* RIGHT: the work */}
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: faint, marginBottom: 14 }}>{p.workLabel}</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.4vw, 14px)' }}>
          {p.work.map((w, i) =>
          <li key={i} style={{ display: 'grid', gridTemplateColumns: '15px 1fr', gap: 10, alignItems: 'start' }}>
              <span style={{ marginTop: 2, width: 13, height: 13, borderRadius: 999, background: 'var(--uc-signal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="7" height="7" viewBox="0 0 12 12" fill="none"><path d="M2 6 L5 9 L10 3" stroke="var(--uc-black)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(13px, 1.05vw, 14.5px)', fontWeight: 500, lineHeight: 1.4, color: feat ? 'var(--uc-stone-300)' : 'var(--fg-1)' }}>{w}</span>
            </li>
          )}
        </ul>
      </div>
    </div>);

}

function BPInvestment() {
  const packages = [
  {
    n: '01', name: 'Investment', tagline: 'Your store and your integrated systems, working as one.', feature: true,
    who: 'A modern unified B2C/B2B storefront on Shopify Plus with a tech stack and customer experience — everything Wichelt needs to launch and scale.',
    workLabel: 'The work',
    work: [
    'Tech stack architecture, scoped up front',
    'Shopify theme-based design, configured and branded for Wichelt',
    'Front and back-end Shopify development',
    'Essential integrations: payments, shipping, core tools',
    'Data migration: products, customers, orders, content',
    'Shopify-side ERP integration guidance',
    'Full B2B enablement: companies, catalogs, checkout',
    'Enriched customer account experience',
    'Workflow automation across your systems',
    'SEO and GEO, so you launch findable',
    'Go live, a clean handoff, and a 30-day warranty'],

    outcome: 'Your successful commerce implementation on Shopify, built for growth.',
    priceLabel: 'Fixed price', price: '$56k'
  }];

  return (
    <BPSection id="investment" n="11" label="Investment" tail="FIXED · NO SURPRISES">
      <BPHeadline>
        Priced up front.{' '}
        <BPSerif>No surprise invoices.</BPSerif>
      </BPHeadline>
      <p style={{ marginTop: 'clamp(18px, 2.2vw, 26px)', maxWidth: 620, fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px, 1.3vw, 18px)', lineHeight: 1.5, color: 'var(--fg-2)' }}>
        One fixed-scope, fixed-price package &mdash; everything Wichelt needs to launch and scale, yours to keep.
      </p>
      <div style={{ marginTop: 'clamp(30px, 4vw, 52px)', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14, alignItems: 'stretch' }}>
        {packages.map((p) => <BPInvestmentCard key={p.n} p={p} />)}
      </div>

      {/* Buffer allowance */}
      <div style={{
        marginTop: 16, padding: 'clamp(22px, 2.6vw, 32px)',
        border: '1px dashed var(--line-2)', borderRadius: 12, background: 'var(--uc-bone)',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, auto)',
        gap: 'clamp(20px, 4vw, 48px)', alignItems: 'center'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span aria-hidden="true" style={{ width: 16, height: 2, background: 'var(--uc-signal)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>Buffer Allowance</span>
          </div>
          <div style={{ fontFamily: 'var(--font-hero)', fontWeight: 700, fontSize: 'clamp(20px, 2vw, 28px)', letterSpacing: '-0.03em', lineHeight: 1.05, color: 'var(--fg-1)' }}>A reserve for what comes up mid-build.</div>
          <p style={{ margin: '10px 0 0', maxWidth: 560, fontFamily: 'var(--font-serif)', fontSize: 'clamp(14px, 1.2vw, 16px)', lineHeight: 1.5, color: 'var(--fg-2)', textWrap: 'pretty' }}>
            A pre-agreed pool for out-of-scope requests and wishlist items before launch — so new ideas don&rsquo;t derail budget or timeline. Only charged if you actually use it.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>If needed</div>
          <div style={{ marginTop: 6, fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(34px, 3.6vw, 52px)', letterSpacing: '-0.045em', lineHeight: 0.9, color: 'var(--fg-1)' }}>$12k</div>
        </div>
      </div>
      <div style={{ marginTop: 22, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--fg-3)' }}>
        Most operators land on Grow. We&rsquo;ll confirm the final figure after discovery.
      </div>
    </BPSection>);

}

// ── 11 GROWTH ───────────────────────────────────────────────────────────────
function BPGrowth() {
  const services = [
  { t: 'Shopify Support', d: 'Design, development, integrations, upgrades, and new-feature enablement — on call.' },
  { t: 'Performance Optimization', d: 'Constantly optimizing experience, speed, conversion, and the tech stack behind it.' }];

  return (
    <BPSection id="growth" n="12" label="Growth" paper tail="AFTER LAUNCH">
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
        compounding revenue operation. Managed monthly, measured every quarter.
      </p>
      <div style={{ marginTop: 'clamp(32px, 4vw, 48px)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {services.map((s, i) =>
        <div key={i} style={{
          background: 'var(--uc-paper)', border: '1px solid var(--line-2)', borderRadius: 5,
          padding: 'clamp(22px, 2.6vw, 30px)', display: 'flex', flexDirection: 'column', gap: 12,
          position: 'relative', overflow: 'hidden'
        }}>
            <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: 36, height: 3, background: 'var(--uc-signal)' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', letterSpacing: 0 }}>{String(i + 1).padStart(2, '0')} / 04</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(20px, 2vw, 26px)', letterSpacing: '-0.02em', color: 'var(--fg-1)' }}>{s.t}</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14.5, lineHeight: 1.45, color: 'var(--fg-2)' }}>{s.d}</div>
          </div>
        )}
      </div>
      <div style={{
        marginTop: 24, padding: '18px 22px', background: 'var(--uc-bone)',
        border: '1px solid var(--line-1)', borderRadius: 5,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap'
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--fg-1)' }}>
          Uncap Growth — Essential Package · from <span style={{ fontFamily: 'var(--font-hero)', fontWeight: 800 }}>$2,500 / month</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.06em' }}>
          12 months — Billed Monthly ·
        </div>
      </div>
    </BPSection>);

}

// ── 09 WHY UNCAP ────────────────────────────────────────────────────────────
function BPWhy() {
  const reviews = [
  { name: 'Clutch', score: '4.9' },
  { name: 'Google', score: '4.9' },
  { name: 'Shopify', score: '5.0' },
  { name: 'Trustpilot', score: '4.9' }];

  const clients = ['blueroot', 'canon', 'e3sparkplugs', 'eea', 'farmers', 'garrison', 'genuinescooter', 'industryrailway', 'kbs', 'microfiberwholesale', 'pawstruck', 'phoenixmecano', 'sanitaire', 'signwarehouse', 'thermosoft', 'ulegroup', 'vermontwoods', 'vosges', 'weldingstore', 'warehouselighting'];
  return (
    <BPSection id="why" n="16" label="Uncap" dark tail="THE CASE">
      <BPHeadline dark>
        Uncap Commerce.{' '}
        <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, color: 'var(--uc-stone-300)' }}>Unified.</span>
      </BPHeadline>

      {/* Platinum partner badge */}
      <div style={{ marginTop: 'clamp(28px, 3vw, 40px)', display: 'inline-flex', alignItems: 'center', gap: 14, padding: '12px 18px', background: 'var(--uc-paper)', borderRadius: 6 }}>
        <img src="assets/shopify-platinum-partner-black.svg" alt="Shopify Platinum Partner" style={{ height: 26, display: 'block' }} />
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
          { v: '2014', l: 'Shopify experts since' },
          { v: '380+', l: 'Projects launched' }].
          map((s, i) =>
          <div key={i} style={{ padding: '16px 0', borderBottom: '1px solid #1F1F1F', display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <span style={{ fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(30px, 3.4vw, 48px)', letterSpacing: '-0.045em', lineHeight: 0.9, color: 'var(--uc-paper)', whiteSpace: 'nowrap' }}>{s.v}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--uc-stone-500)' }}>{s.l}</span>
            </div>
          )}
        </div>
      </div>

      {/* Client logos */}
      <div style={{ marginTop: 'clamp(32px, 4vw, 48px)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--uc-stone-500)', marginBottom: 14 }}>↳ Operators we&rsquo;ve shipped for</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '8px' }}>
          {clients.map((c, i) =>
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--uc-paper)', borderRadius: 6, padding: '8px 10px', height: 'clamp(38px, 3.4vw, 48px)' }}>
              <img src={`assets/logos/${c}.svg`} alt={c} style={{ maxHeight: '100%', maxWidth: '100%', width: 'auto', display: 'block' }} />
            </span>
          )}
        </div>
      </div>

      {/* Recognition / reviews */}
      <div style={{ marginTop: 'clamp(28px, 3vw, 40px)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--uc-stone-500)', marginBottom: 16 }}>↳ Recognized by</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderTop: '1px solid #1F1F1F', borderBottom: '1px solid #1F1F1F' }}>
          {reviews.map((r, i) =>
          <div key={i} style={{ padding: '20px 20px 20px 0', paddingLeft: i > 0 ? 20 : 0, borderLeft: i > 0 ? '1px solid #1F1F1F' : 'none', position: 'relative' }}>
              <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: i > 0 ? 20 : 0, width: 14, height: 2, background: 'var(--uc-signal)' }} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(24px, 2.6vw, 38px)', letterSpacing: '-0.04em', color: 'var(--uc-paper)' }}>{r.score}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--uc-signal)' }}>★</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--uc-stone-500)', marginTop: 8 }}>{r.name}</div>
            </div>
          )}
        </div>
      </div>

      {/* One review */}
      <div style={{ marginTop: 'clamp(32px, 4vw, 48px)', paddingTop: 'clamp(28px, 3vw, 40px)', borderTop: '1px solid #1F1F1F' }}>
        <blockquote style={{ margin: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(22px, 2.6vw, 38px)', letterSpacing: '-0.02em', lineHeight: 1.25, color: 'var(--uc-paper)', maxWidth: 900, textWrap: 'pretty', position: 'relative', paddingLeft: 22 }}>
          <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: 4, bottom: 4, width: 3, background: 'var(--uc-signal)' }} />
          &ldquo;Ultra professional, receptive, and helpful during the entire process. The personal touch, and constant communication is what separates them from other companies with a 50+ person team where the attention to detail may be lost.&rdquo;
        </blockquote>
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src={window.__resources.reviewBrandt} alt="Brandt DeVries" style={{ width: 44, height: 44, borderRadius: 999, objectFit: 'cover', flexShrink: 0, border: '1px solid #2B2B2B' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em' }}>
            <span style={{ color: 'var(--uc-paper)', fontWeight: 700 }}>Brandt DeVries</span>
            <span style={{ color: 'var(--uc-stone-500)' }}>VP of Operations, WeldingStore</span>
          </div>
        </div>
      </div>
    </BPSection>);

}

// ── 10 NEXT STEPS ───────────────────────────────────────────────────────────
function BPNext() {
  const steps = [
  { n: '01', t: 'Approve this Blueprint', d: 'Sign off on scope, timeline, and investment.' },
  { n: '02', t: 'Onboard within 2 weeks', d: 'Discovery session + access to systems.' },
  { n: '03', t: 'Ship in 16 weeks', d: 'Launch live, then move into Growth.' }];

  return (
    <BPSection id="next" n="17" label="Next" paper tail="LET'S GO">
      <BPHeadline>
        Three steps{' '}
        <BPSerif>to start.</BPSerif>
      </BPHeadline>
      <div style={{
        marginTop: 'clamp(32px, 4vw, 56px)',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16
      }}>
        {steps.map((s) =>
        <div key={s.n} style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 18, borderTop: '1px solid var(--line-1)' }}>
            <span aria-hidden="true" style={{ width: 18, height: 2, background: 'var(--uc-signal)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)' }}>{s.n}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(20px, 2vw, 26px)', letterSpacing: '-0.02em', color: 'var(--fg-1)' }}>{s.t}</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15, lineHeight: 1.5, color: 'var(--fg-2)' }}>{s.d}</span>
          </div>
        )}
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
        <a href="mailto:hey@uncap.com" className="uc-btn b-signal" style={{ padding: '16px 26px', fontSize: 15 }}>
          Approve &amp; kickoff <span>→</span>
        </a>
      </div>
    </BPSection>);

}

// ── Floating left nav ──────────────────────────────────────────────────────
function BPNav() {
  const items = [
  { id: 'intro', n: '00', l: 'Intro' },
  { id: 'summary', n: '01', l: 'Summary' },
  { id: 'where', n: '02', l: 'Today' },
  { id: 'objectives', n: '03', l: 'Objectives' },
  { id: 'approach', n: '04', l: 'Approach' },
  { id: 'scope', n: '05', l: 'Scope' },
  { id: 'performance', n: '06', l: 'Commerce' },
  { id: 'content', n: '07', l: 'Content' },
  { id: 'techstack', n: '08', l: 'Architecture' },
  { id: 'b2b', n: '09', l: 'Unified' },
  { id: 'agentic', n: '10', l: 'Agentic' },
  { id: 'migration', n: '11', l: 'Migration' },
  { id: 'delivery', n: '12', l: 'Delivery' },
  { id: 'investment', n: '13', l: 'Investment' },
  { id: 'phase2', n: '14', l: 'Phase 2' },
  { id: 'growth', n: '15', l: 'Growth' },
  { id: 'team', n: '16', l: 'Team' },
  { id: 'why', n: '17', l: 'Uncap' },
  { id: 'next', n: '18', l: 'Next' }];

  const [active, setActive] = React.useState('intro');
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const update = () => {
      const mid = window.innerHeight * 0.4;
      let best = items[0].id,bestDist = Infinity;
      items.forEach((it) => {
        const el = document.getElementById(it.id);
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top - mid);
        if (r.top <= mid + 80 && d < bestDist) {bestDist = d;best = it.id;}
      });
      setActive(best);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {window.removeEventListener('scroll', update);window.removeEventListener('resize', update);};
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
    }}>
      
      <div style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '2px 8px 12px', marginBottom: 6,
        borderBottom: '1px solid var(--line-1)'
      }}>
        <img src={window.__resources.uncapLogoBlack} alt="Uncap" style={{ height: 18, display: 'block' }} />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-3)'
        }}>Blueprint</span>
      </div>
      {items.map((it) => {
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
          </button>);

      })}
    </nav>);

}
window.BPNav = BPNav;

// BPPhase2 + BPAgentic were defined in this file but the design tool's
// export missed their window.* assignments — without these, the inline
// App ReferenceErrors out and the page renders blank.
window.BPPhase2 = BPPhase2;
window.BPAgentic = BPAgentic;

window.BPIntro = BPIntro;
window.BPSummary = BPSummary;
window.BPWhere = BPWhere;
window.BPObjectives = BPObjectives;
window.BPApproach = BPApproach;
window.BPScope = BPScope;
window.BPPerformance = BPPerformance;
window.BPContent = BPContent;
window.BPTechStack = BPTechStack;
window.BPB2B = BPB2B;
window.BPIntegrations = BPIntegrations;
window.BPGantt = BPGantt;
window.BPDelivery = BPDelivery;
window.BPTeam = BPTeam;
window.BPInvestment = BPInvestment;
window.BPGrowth = BPGrowth;
window.BPWhy = BPWhy;
window.BPNext = BPNext;