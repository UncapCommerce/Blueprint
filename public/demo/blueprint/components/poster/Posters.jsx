// Posters.jsx — minimal section-heading "poster" components reused across the
// blueprint document. The original design-tool export referenced this file by
// name; this is a clean-room reimplementation matching the visual grammar the
// chat transcripts describe (mono section index, big serif/sans headline,
// short subtitle, lime accent).
//
// All visuals use the design-system CSS variables declared in
// colors_and_type.css so anything in the document re-themes via tokens.

// Section eyebrow + index marker. Mono code on the left, sentence-case label
// on the right, divided by a thin rule. Sits above every section's H2.
function BPEyebrow({ index, label }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 16,
      marginBottom: 28,
      fontFamily: 'var(--font-mono)',
      fontSize: 11, fontWeight: 600,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      color: 'var(--fg-3)',
    }}>
      <span style={{ color: 'var(--uc-black)' }}>§ {String(index).padStart(2, '0')}</span>
      <span style={{ width: 20, height: 1, background: 'var(--line-1)' }} />
      <span>{label}</span>
    </div>
  );
}

// Big two-line headline: sans display + italic serif accent on line 2.
// Matches the "statement → resolution" rhythm the brand guide calls for.
function BPHeadline({ title, subtitle, align = 'left', onDark = false }) {
  return (
    <h2 style={{
      fontFamily: 'var(--font-display)', fontWeight: 700,
      fontSize: 'var(--t-h2)',
      lineHeight: 'var(--lh-snug)',
      letterSpacing: 'var(--tr-tight)',
      color: onDark ? 'var(--uc-paper)' : 'var(--fg-1)',
      margin: '0 0 18px',
      textAlign: align, textWrap: 'pretty',
      maxWidth: 880,
    }}>
      {title}
      {subtitle && (
        <span style={{
          display: 'block',
          fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontWeight: 400, fontSize: '0.86em',
          color: onDark ? 'var(--uc-stone-300)' : 'var(--fg-2)',
          marginTop: 6,
        }}>
          {subtitle}
        </span>
      )}
    </h2>
  );
}

// Small chip / pill used on tags + status markers throughout the document.
function BPChip({ children, tone = 'neutral' }) {
  const tones = {
    neutral: { bg: 'transparent', fg: 'var(--fg-2)',  bd: 'var(--line-1)'  },
    dark:    { bg: 'var(--uc-black)',  fg: 'var(--uc-paper)', bd: 'var(--uc-black)' },
    lime:    { bg: 'var(--uc-signal)', fg: 'var(--uc-black)', bd: 'var(--uc-signal)' },
    paper:   { bg: 'var(--uc-paper)',  fg: 'var(--uc-black)', bd: 'var(--uc-paper)' },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 10px',
      borderRadius: 999,
      border: `1px solid ${t.bd}`,
      background: t.bg, color: t.fg,
      fontFamily: 'var(--font-mono)',
      fontSize: 10, fontWeight: 700,
      letterSpacing: '0.1em', textTransform: 'uppercase',
      lineHeight: 1,
    }}>{children}</span>
  );
}

window.BPEyebrow = BPEyebrow;
window.BPHeadline = BPHeadline;
window.BPChip = BPChip;
