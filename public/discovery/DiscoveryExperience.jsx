/* Uncap Discovery Experience — the interactive 10-step discovery session.
 * Faithful port of the Claude Design handoff, wired to the server so every
 * answer autosaves and a half-finished session resumes anywhere. Admins are
 * auto-authed via the __Host-bp_admin cookie; clients open the same URL and
 * unlock it with an email passcode, then edit/fill their own entries.
 */
(function () {
  const { useState, useEffect, useLayoutEffect, useRef, useCallback } = React;
  // Scenes 3-6 are the full "website frame" pages: taller than the artboard,
  // fit to width and scrolled vertically inside a fixed viewport.
  const isSiteScene = (idx) => idx >= 2 && idx <= 5;

  const HANDLE = (function () {
    const m = window.location.pathname.match(/^\/discovery\/([a-z0-9-]+)\/?$/);
    return m ? m[1] : '';
  })();
  const TOKEN_KEY = 'disc_token_' + HANDLE;

  const api = async (path, opts) => {
    const resp = await fetch(path, {
      credentials: 'same-origin',
      headers: opts && opts.body ? { 'content-type': 'application/json' } : undefined,
      ...opts,
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || data.ok === false) {
      const err = new Error(data.error || ('Request failed (' + resp.status + ')'));
      err.status = resp.status;
      throw err;
    }
    return data;
  };

  const answered = (v) => {
    if (v == null) return false;
    if (Array.isArray(v)) return v.length > 0;
    return String(v).trim().length > 0;
  };

  const LABELS = ['Client', 'Architecture', 'Experience', 'Discovery', 'Conversion', 'Revenue', 'Unified', 'Project', 'Growth', 'Enclosing'];

  // ── Passcode gate (client) — identical to the blueprint proposal gate ──
  function Gate({ onToken }) {
    const [step, setStep] = useState('email'); // email | code
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);
    useEffect(() => { if (inputRef.current) inputRef.current.focus(); }, [step]);

    const requestCode = async (e) => {
      e.preventDefault();
      const raw = email.trim();
      if (!raw) { setError('Enter your email'); return; }
      setLoading(true); setError('');
      try {
        const resp = await fetch('/api/discovery/request-code', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ handle: HANDLE, email: raw }) });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok || data.ok === false) { setError(data.error || 'Could not send code'); return; }
        setStep('code');
      } catch (_) { setError('Network error — try again.'); } finally { setLoading(false); }
    };
    const verifyCode = async (e) => {
      e.preventDefault();
      if (code.length !== 6) { setError('Enter the 6-digit code'); return; }
      setLoading(true); setError('');
      try {
        const resp = await fetch('/api/discovery/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ handle: HANDLE, email: email.trim(), code: code.trim() }) });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok || data.ok === false) { setError(data.error || 'Wrong code'); return; }
        try { sessionStorage.setItem(TOKEN_KEY, data.token); } catch (_) {}
        onToken(data.token);
      } catch (_) { setError('Network error — try again.'); } finally { setLoading(false); }
    };

    const inputBase = { width: '100%', boxSizing: 'border-box', padding: '14px 16px', color: 'var(--fg-1)', background: 'var(--uc-cream)', borderRadius: 5, outline: 'none', transition: 'border-color .15s var(--ease-out)' };
    const primaryBtn = { width: '100%', justifyContent: 'center', marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 22px', border: 'none', borderRadius: 5, background: 'var(--uc-black)', color: 'var(--uc-paper)', fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, cursor: 'pointer' };

    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--uc-cream)', color: 'var(--fg-1)', fontFamily: 'var(--font-sans)', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <img src="/assets/uncap-logo-black.svg" alt="Uncap" style={{ height: 28, width: 'auto', display: 'block', margin: '0 auto 28px' }}/>
          <form onSubmit={step === 'email' ? requestCode : verifyCode} style={{ background: 'var(--uc-paper)', border: '1px solid var(--uc-black)', borderRadius: 8, padding: 36, boxShadow: '0 18px 40px -22px rgba(10,10,10,0.25)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 24, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>
              <span style={{ width: 14, height: 2, background: 'var(--uc-signal)' }}/>
              Private discovery
            </div>
            {step === 'email' ? (
              <React.Fragment>
                <h1 style={{ margin: '0 0 10px', fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 36px)', lineHeight: 1.04, letterSpacing: '-0.03em' }}>Enter your email.</h1>
                <p style={{ margin: '0 0 24px', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, lineHeight: 1.5, color: 'var(--fg-2)' }}>
                  We&rsquo;ll send a one-time 6-digit passcode to unlock your discovery.
                </p>
                <input ref={inputRef} type="text" value={email} onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                  placeholder="you@company.com" autoComplete="email" spellCheck="false" disabled={loading} aria-label="Email" aria-invalid={!!error}
                  style={{ ...inputBase, fontFamily: 'var(--font-sans)', fontSize: 17, fontWeight: 500, border: '1px solid ' + (error ? 'var(--uc-error)' : 'var(--line-1)') }}
                  onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = 'var(--uc-black)'; }}
                  onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = 'var(--line-1)'; }}/>
                {error && <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-error)' }}>{error}</div>}
                <button type="submit" disabled={loading || !email.trim()} style={{ ...primaryBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'default' : 'pointer' }}>
                  {loading ? 'Sending…' : 'Send passcode'} <span>→</span>
                </button>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <h1 style={{ margin: '0 0 10px', fontFamily: 'var(--font-hero)', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 36px)', lineHeight: 1.04, letterSpacing: '-0.03em' }}>Check your inbox.</h1>
                <p style={{ margin: '0 0 24px', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, lineHeight: 1.5, color: 'var(--fg-2)' }}>
                  We sent a 6-digit passcode to <strong style={{ color: 'var(--fg-1)' }}>{email}</strong>. Valid for 10 minutes.
                </p>
                <input ref={inputRef} type="text" inputMode="numeric" value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); if (error) setError(''); }}
                  placeholder="000000" autoComplete="one-time-code" disabled={loading} aria-label="6-digit code" aria-invalid={!!error}
                  style={{ ...inputBase, fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, letterSpacing: '0.25em', textAlign: 'center', border: '1px solid ' + (error ? 'var(--uc-error)' : 'var(--line-1)') }}
                  onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = 'var(--uc-black)'; }}
                  onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = 'var(--line-1)'; }}/>
                {error && <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--uc-error)' }}>{error}</div>}
                <button type="submit" disabled={loading || code.length !== 6} style={{ ...primaryBtn, opacity: (loading || code.length !== 6) ? 0.7 : 1, cursor: (loading || code.length !== 6) ? 'default' : 'pointer' }}>
                  {loading ? 'Unlocking…' : 'Unlock'} <span>→</span>
                </button>
                <button type="button" onClick={() => { setStep('email'); setCode(''); setError(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>
                  ← Use a different email
                </button>
              </React.Fragment>
            )}
            <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--line-1)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>Trouble? Email hey@uncap.com</div>
          </form>
        </div>
      </div>
    );
  }

  // ── The experience ────────────────────────────────────────────────────
  function Experience({ role, company, initial, token }) {
    const steps = window.DISCOVERY_STEPS || [];
    const [answers, setAnswers] = useState(initial.answers || {});
    const [activeStepIdx, setActiveStepIdx] = useState(Math.min(initial.activeStepIdx || 0, 9));
    const [unlockedIdx, setUnlockedIdx] = useState(Math.min(initial.unlockedIdx || 0, 9));
    const [activeHotspotId, setActiveHotspotId] = useState(null);
    const [scale, setScale] = useState(0.55);
    const [contentH, setContentH] = useState(900);
    const [saveState, setSaveState] = useState(''); // '', 'saving', 'saved'
    const [submitState, setSubmitState] = useState('');
    const [done, setDone] = useState(initial.status === 'complete' && role === 'admin');

    const stageElRef = useRef(null);
    const formElRef = useRef(null);
    const stripElRef = useRef(null);
    const groupEls = useRef({});
    const saveTimer = useRef(null);
    const roRef = useRef(null);
    const contentInnerRef = useRef(null);
    const stepIdxRef = useRef(activeStepIdx);
    stepIdxRef.current = activeStepIdx;

    const isAdmin = role === 'admin';

    // Build a qid → label map once, for change reporting on the client side.
    const labelMap = useRef((function () {
      const m = {};
      steps.forEach((st) => st.groups.forEach((g) => g.questions.forEach((q) => { m[q.id] = q.label; })));
      return m;
    })());

    const measure = useCallback(() => {
      const el = stageElRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const pad = 20;
      const site = isSiteScene(stepIdxRef.current);
      const s = site
        ? Math.max(0.1, (r.width - pad * 2) / 1440)                                            // fit width, scroll vertically
        : Math.max(0.1, Math.min((r.width - pad * 2) / 1440, (r.height - pad * 2) / 900));     // fit whole artboard
      const rounded = Math.round(s * 1000) / 1000;
      setScale((prev) => (rounded !== prev ? rounded : prev));
    }, []);

    const stageRef = useCallback((el) => {
      stageElRef.current = el;
      if (el && !roRef.current) {
        roRef.current = new ResizeObserver(() => measure());
        roRef.current.observe(el);
        measure();
      }
    }, [measure]);

    useEffect(() => () => { if (roRef.current) roRef.current.disconnect(); }, []);
    // Re-fit on step change, and measure the rich scene's natural height so
    // the scroll viewport gets the right scroll extent.
    useLayoutEffect(() => {
      measure();
      if (isSiteScene(activeStepIdx) && contentInnerRef.current) {
        setContentH(contentInnerRef.current.offsetHeight || 900);
      } else {
        setContentH(900);
      }
    }, [activeStepIdx, measure]);

    // Admin autosave (debounced). Clients persist only on Submit.
    const scheduleSave = useCallback((nextAnswers, aIdx, uIdx) => {
      if (!isAdmin) return;
      setSaveState('saving');
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          await api('/api/discovery/answers', { method: 'POST', body: JSON.stringify({ handle: HANDLE, answers: nextAnswers, activeStepIdx: aIdx, unlockedIdx: uIdx }) });
          setSaveState('saved');
          setTimeout(() => setSaveState((s) => (s === 'saved' ? '' : s)), 1600);
        } catch (_) { setSaveState(''); }
      }, 700);
    }, [isAdmin]);

    const currentStep = () => steps[activeStepIdx];
    const requiredLeft = (step) => {
      let n = 0;
      step.groups.forEach((g) => g.questions.forEach((q) => { if (q.required && !answered(answers[q.id])) n++; }));
      return n;
    };

    const scrollStripToActive = useCallback((idx) => {
      const c = stripElRef.current;
      if (!c) return;
      const btn = c.querySelector('[data-idx="' + idx + '"]');
      if (btn) c.scrollTo({ left: Math.max(0, btn.offsetLeft - 60), behavior: 'smooth' });
    }, []);

    const go = (idx) => {
      setActiveStepIdx(idx);
      setActiveHotspotId(null);
      if (formElRef.current) formElRef.current.scrollTo({ top: 0 });
      scrollStripToActive(idx);
      scheduleSave(answers, idx, Math.max(unlockedIdx, idx));
    };

    const scrollToGroup = (gid) => {
      const el = groupEls.current[gid];
      const c = formElRef.current;
      if (el && c) c.scrollTo({ top: Math.max(0, el.offsetTop - 12), behavior: 'smooth' });
    };

    const setAnswer = (qid, val) => {
      setAnswers((prev) => {
        const next = { ...prev, [qid]: val };
        scheduleSave(next, activeStepIdx, unlockedIdx);
        return next;
      });
    };
    const toggleChip = (qid, val, multi) => {
      setAnswers((prev) => {
        const cur = prev[qid];
        let nextVal;
        if (multi) {
          const arr = Array.isArray(cur) ? cur.slice() : [];
          const i = arr.indexOf(val);
          if (i >= 0) arr.splice(i, 1); else arr.push(val);
          nextVal = arr;
        } else {
          nextVal = cur === val ? '' : val;
        }
        const next = { ...prev, [qid]: nextVal };
        scheduleSave(next, activeStepIdx, unlockedIdx);
        return next;
      });
    };

    const onHotspotClick = (hid) => {
      const next = activeHotspotId === hid ? null : hid;
      setActiveHotspotId(next);
      if (next) {
        const step = currentStep();
        const g = step && step.groups.find((g) => g.hotspotId === hid);
        if (g) setTimeout(() => scrollToGroup(g.id), 60);
      }
    };

    const onNext = async () => {
      const step = steps[activeStepIdx];
      const isLast = activeStepIdx === 9;
      if (isLast) { await finish(); return; }
      if (requiredLeft(step) > 0) return;
      const nextIdx = activeStepIdx + 1;
      setUnlockedIdx((u) => Math.max(u, nextIdx));
      go(nextIdx);
    };
    const onBack = () => { if (activeStepIdx > 0) go(activeStepIdx - 1); };

    const finish = async () => {
      setSubmitState('saving');
      try {
        if (isAdmin) {
          await api('/api/discovery/answers', { method: 'POST', body: JSON.stringify({ handle: HANDLE, answers, activeStepIdx, unlockedIdx, complete: true }) });
          setDone(true);
        } else {
          await api('/api/discovery/submit', { method: 'POST', body: JSON.stringify({ handle: HANDLE, token, answers, labels: labelMap.current }) });
          setDone(true);
        }
        setSubmitState('done');
      } catch (e) { setSubmitState(''); alert(e.message); }
    };

    // ---- derived render data ----
    const step = steps[activeStepIdx];
    const gate = true;

    let answeredCount = 0, questionCount = 0;
    step.groups.forEach((g) => g.questions.forEach((q) => { questionCount++; if (answered(answers[q.id])) answeredCount++; }));

    const reqLeft = requiredLeft(step);
    const isLast = activeStepIdx === 9;
    const canNext = isLast || reqLeft === 0;
    const nextLabel = isLast
      ? (isAdmin ? (submitState === 'saving' ? 'Completing…' : 'Complete discovery ✓') : (submitState === 'saving' ? 'Submitting…' : 'Submit my answers'))
      : ('Next: ' + LABELS[activeStepIdx + 1] + ' →');
    const gateNote = (!isLast && reqLeft > 0) ? (reqLeft + ' REQUIRED ANSWER' + (reqLeft > 1 ? 'S' : '') + ' LEFT ON THIS STEP') : '';

    // ---- top step strip ----
    const topSteps = LABELS.map((label, idx) => {
      const st = steps[idx];
      const dn = idx < activeStepIdx && requiredLeft(st) === 0;
      const current = idx === activeStepIdx;
      const locked = gate && idx > unlockedIdx;
      return { idx, label, dn, current, locked,
        mark: dn ? '✓' : String(idx + 1).padStart(2, '0') };
    });

    // ---- hotspots for the active step ----
    const hotspots = (step.hotspots || []).map((h, i) => {
      const active = activeHotspotId === h.id;
      const bottom = h.y + h.h;
      const cardBelow = active && bottom <= 640;
      const cardAbove = active && !cardBelow && h.y >= 240;
      const cardInside = active && !cardBelow && !cardAbove;
      const g = step.groups.find((g) => g.hotspotId === h.id);
      return { ...h, i, active, cardBelow, cardAbove, cardInside,
        num: String(i + 1).padStart(2, '0'),
        gid: g ? g.id : '',
        eyebrow: 'STEP ' + String(activeStepIdx + 1).padStart(2, '0') + ' · ' + step.label.toUpperCase(),
        cardLeft: Math.max(-h.x + 12, Math.min(0, 1440 - h.x - 376)) };
    });

    // Scene HTML (1-9 static); scene 10 rendered in JSX.
    const isSite = isSiteScene(activeStepIdx);
    let sceneHtml = (window.DISCOVERY_SCENES || {})[activeStepIdx + 1] || '';
    if (activeStepIdx === 0) sceneHtml = sceneHtml.replace(/__CLIENT_NAME__/g, escapeText(company || 'there'));

    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#F2EFE7', color: '#0A0A0A' }}>
        {/* TOP BAR */}
        <div style={{ height: 60, flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 24, padding: '0 24px', background: 'rgba(242,239,231,0.92)', borderBottom: '1px solid #C9C7C0', zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '0 0 auto' }}>
            <img src="/assets/uncap-logo-black.svg" alt="Uncap" style={{ height: 20, display: 'block' }}/>
            <span style={{ width: 1, height: 22, background: '#C9C7C0' }}></span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.12em', color: '#707070' }}>DISCOVERY</span>
          </div>
          <div ref={stripElRef} style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', gap: 2, overflowX: 'auto', minWidth: 0, scrollbarWidth: 'none' }}>
            {topSteps.map((s) => (
              <button key={s.idx} data-idx={s.idx} onClick={() => { if (!s.locked) go(s.idx); }}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 10px', border: 'none', background: s.current ? '#0A0A0A' : 'transparent', borderRadius: 5, cursor: s.locked ? 'default' : 'pointer', opacity: s.locked ? 0.6 : 1, flex: '0 0 auto', transition: 'background 220ms cubic-bezier(.2,.7,.2,1)' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 600, background: s.current ? '#E8FF4E' : s.dn ? '#0A0A0A' : 'transparent', color: s.current ? '#0A0A0A' : s.dn ? '#FFFFFF' : s.locked ? '#9A9A9A' : '#0A0A0A', border: '1px solid ' + (s.current ? '#E8FF4E' : s.locked ? '#C9C7C0' : '#0A0A0A'), flex: '0 0 auto' }}>{s.mark}</span>
                <span style={{ fontSize: 12, fontWeight: s.current ? 650 : 500, color: s.current ? '#FFFFFF' : s.locked ? '#9A9A9A' : '#1A1A1A', whiteSpace: 'nowrap' }}>{s.label}</span>
              </button>
            ))}
          </div>
          <div style={{ flex: '0 0 auto', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.08em', color: '#9A9A9A' }}>
            {isAdmin ? (saveState === 'saving' ? 'SAVING…' : saveState === 'saved' ? 'SAVED ✓' : 'ADMIN') : 'CLIENT'}
          </div>
        </div>

        {/* MAIN ROW */}
        <div style={{ flex: '1 1 auto', display: 'flex', minHeight: 0 }}>
          {/* STAGE */}
          <div ref={stageRef} style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', alignItems: isSite ? 'stretch' : 'center', justifyContent: 'center', position: 'relative', padding: 20, boxSizing: 'border-box' }}>
            <div style={{ position: 'relative', width: Math.round(1440 * scale), height: isSite ? '100%' : Math.round(900 * scale), borderRadius: 6, overflow: 'hidden', border: '1px solid #C9C7C0', background: '#FFFFFF', boxShadow: '0 12px 32px rgba(10,10,10,0.10), 0 2px 4px rgba(10,10,10,0.05)' }}>
              {isSite ? (
                // Website-frame scenes: a rich, tall page scrolled inside the viewport.
                <div style={{ width: '100%', height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
                  <div style={{ position: 'relative', width: Math.round(1440 * scale), height: Math.round(contentH * scale) }}>
                    <div ref={contentInnerRef} style={{ position: 'absolute', top: 0, left: 0, width: 1440, transform: 'scale(' + scale + ')', transformOrigin: 'top left' }}
                      dangerouslySetInnerHTML={{ __html: sceneHtml }}/>
                  </div>
                </div>
              ) : (
                <div onClick={() => { if (activeHotspotId) setActiveHotspotId(null); }} style={{ position: 'absolute', top: 0, left: 0, width: 1440, height: 900, transform: 'scale(' + scale + ')', transformOrigin: 'top left' }}>
                  {activeStepIdx === 9
                    ? <Scene10 steps={steps} answers={answers}/>
                    : <div style={{ position: 'absolute', inset: 0 }} dangerouslySetInnerHTML={{ __html: sceneHtml }}/>}

                  {/* HOTSPOT LAYER */}
                  {hotspots.map((h) => (
                    <div key={h.id} onClick={(e) => { e.stopPropagation(); onHotspotClick(h.id); }}
                      style={{ position: 'absolute', left: h.x, top: h.y, width: h.w, height: h.h, cursor: 'pointer', zIndex: h.active ? 60 : 10, borderRadius: 8, boxShadow: h.active ? '0 0 0 4000px rgba(10,10,10,0.55)' : 'none' }}>
                      {!h.active && (
                        <span style={{ position: 'absolute', top: -15, left: -15, width: 30, height: 30, borderRadius: '50%', background: '#FFFFFF', border: '1.5px solid #0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, color: '#0A0A0A', animation: 'uc-pulse 2.4s cubic-bezier(.2,.7,.2,1) infinite' }}>{h.num}</span>
                      )}
                      {h.active && (
                        <svg style={{ position: 'absolute', top: -2, left: -2, overflow: 'visible', pointerEvents: 'none' }} width={h.w + 4} height={h.h + 4}>
                          <rect x="2" y="2" width={h.w} height={h.h} rx="8" fill="none" stroke="#E8FF4E" strokeWidth="3.5" pathLength="100" style={{ strokeDasharray: 100, animation: 'uc-draw 700ms cubic-bezier(.2,.7,.2,1) forwards' }}></rect>
                        </svg>
                      )}
                      {h.active && (
                        <div onClick={(e) => e.stopPropagation()} style={hotspotCardStyle(h)}>
                          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.12em', color: '#707070' }}>{h.eyebrow}</div>
                          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.015em', marginTop: 8 }}>{h.label}</div>
                          <div style={{ fontSize: 13.5, lineHeight: 1.55, color: '#4D4D4D', marginTop: 8 }}>{h.info}</div>
                          <button onClick={(e) => { e.stopPropagation(); scrollToGroup(h.gid); }} style={{ marginTop: 14, border: 'none', background: '#0A0A0A', color: '#FFFFFF', borderRadius: 5, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Answer in the form →</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* FORM PANEL */}
          <div style={{ flex: '0 0 clamp(360px, 27vw, 470px)', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderLeft: '1px solid #C9C7C0', minHeight: 0 }}>
            <div style={{ flex: '0 0 auto', padding: '22px 24px 16px' }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.14em', color: '#707070' }}>STEP {String(activeStepIdx + 1).padStart(2, '0')} OF 10</div>
              <div style={{ fontSize: 27, fontWeight: 750, letterSpacing: '-0.03em', marginTop: 6 }}>{step.label}</div>
              <div style={{ fontFamily: 'Fraunces,Georgia,serif', fontStyle: 'italic', fontSize: 16, color: '#4D4D4D', marginTop: 3 }}>{step.tagline}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
                <div style={{ flex: 1, height: 4, background: '#E4E1D8', borderRadius: 2, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, height: 4, background: '#0A0A0A', borderRadius: 2, width: (questionCount ? Math.round(answeredCount / questionCount * 100) : 0) + '%', transition: 'width 220ms cubic-bezier(.2,.7,.2,1)' }}></div>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#707070', flex: '0 0 auto' }}>{answeredCount}/{questionCount}</span>
              </div>
            </div>
            <div ref={formElRef} style={{ flex: '1 1 auto', overflowY: 'auto', padding: '4px 24px 24px', position: 'relative', minHeight: 0 }}>
              {step.groups.map((g, gi) => {
                let gDone = 0;
                g.questions.forEach((q) => { if (answered(answers[q.id])) gDone++; });
                const active = activeHotspotId === g.hotspotId;
                const complete = gDone === g.questions.length;
                return (
                  <div key={g.id} ref={(el) => { if (el) groupEls.current[g.id] = el; }}
                    onClick={() => { if (activeHotspotId !== g.hotspotId) setActiveHotspotId(g.hotspotId); }}
                    style={{ border: '1px solid ' + (active ? '#0A0A0A' : '#E4E1D8'), boxShadow: active ? '0 0 0 1px #0A0A0A' : 'none', borderRadius: 5, padding: 18, marginBottom: 14, background: '#FFFFFF', cursor: 'pointer', transition: 'border-color 220ms, box-shadow 220ms' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid #0A0A0A', background: complete ? '#0A0A0A' : 'transparent', color: complete ? '#FFFFFF' : '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 600, flex: '0 0 auto' }}>{String(gi + 1).padStart(2, '0')}</span>
                      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>{g.title}</span>
                      <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: complete ? '#2F7A47' : '#9A9A9A' }}>{gDone}/{g.questions.length}</span>
                    </div>
                    {g.questions.map((q) => {
                      const v = answers[q.id];
                      const isChips = q.type === 'chips' || q.type === 'chips-multi';
                      return (
                        <div key={q.id} style={{ marginTop: 16 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 7 }}>{q.label}{q.required ? <span style={{ color: '#B5322B' }}> *</span> : null}</div>
                          {q.type === 'text' && (
                            <input value={v || ''} onClick={(e) => e.stopPropagation()} onChange={(e) => setAnswer(q.id, e.target.value)} placeholder={q.placeholder || ''}
                              style={{ width: '100%', padding: '10px 12px', border: '1px solid #C9C7C0', borderRadius: 5, fontSize: 14, background: '#FDFCF9', outline: 'none', color: '#0A0A0A' }}/>
                          )}
                          {q.type === 'textarea' && (
                            <textarea value={v || ''} onClick={(e) => e.stopPropagation()} onChange={(e) => setAnswer(q.id, e.target.value)} placeholder={q.placeholder || ''} rows={3}
                              style={{ width: '100%', padding: '10px 12px', border: '1px solid #C9C7C0', borderRadius: 5, fontSize: 14, background: '#FDFCF9', outline: 'none', resize: 'vertical', lineHeight: 1.5, color: '#0A0A0A' }}/>
                          )}
                          {isChips && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {q.options.map((opt) => {
                                const sel = q.type === 'chips-multi' ? (Array.isArray(v) && v.includes(opt)) : v === opt;
                                return (
                                  <button key={opt} onClick={(e) => { e.stopPropagation(); toggleChip(q.id, opt, q.type === 'chips-multi'); }}
                                    style={{ border: '1px solid ' + (sel ? '#0A0A0A' : '#C9C7C0'), background: sel ? '#0A0A0A' : '#FFFFFF', color: sel ? '#FFFFFF' : '#1A1A1A', borderRadius: 5, padding: '7px 12px', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 120ms' }}>{opt}</button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <div style={{ flex: '0 0 auto', borderTop: '1px solid #E4E1D8', padding: '14px 24px 16px' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={onBack} style={{ border: '1px solid #0A0A0A', background: 'transparent', color: '#0A0A0A', borderRadius: 5, padding: '12px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: activeStepIdx === 0 ? 0.35 : 1 }}>←</button>
                <button onClick={onNext} style={{ flex: 1, border: 'none', background: canNext ? '#0A0A0A' : '#C9C7C0', color: '#FFFFFF', borderRadius: 5, padding: '12px 18px', fontSize: 14, fontWeight: 650, cursor: canNext ? 'pointer' : 'default', transition: 'background 220ms' }}>{nextLabel}</button>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.06em', color: '#B8741F', marginTop: 9, minHeight: 13 }}>{gateNote}</div>
            </div>
          </div>
        </div>

        {done && <DonePanel isAdmin={isAdmin} onClose={() => setDone(false)}/>}
      </div>
    );
  }

  function hotspotCardStyle(h) {
    const base = { position: 'absolute', width: 360, background: '#FFFFFF', border: '1px solid #0A0A0A', borderRadius: 5, padding: 20, boxShadow: '0 12px 32px rgba(10,10,10,0.2)', animation: 'uc-fadeup 240ms cubic-bezier(.2,.7,.2,1) both', cursor: 'default', left: h.cardLeft };
    if (h.cardBelow) return { ...base, top: 'calc(100% + 16px)' };
    if (h.cardAbove) return { ...base, bottom: 'calc(100% + 16px)' };
    return { ...base, top: 16, left: 16 };
  }

  // Scene 10 — the "Enclosing" summary artboard, live from answers.
  function Scene10({ steps, answers }) {
    let aTotal = 0, qTotal = 0;
    const rows = steps.slice(0, 9).map((st, i) => {
      let a = 0, t = 0;
      st.groups.forEach((g) => g.questions.forEach((q) => { t++; if (answered(answers[q.id])) a++; }));
      aTotal += a; qTotal += t;
      return { num: String(i + 1).padStart(2, '0'), label: st.label, pct: t ? Math.round(a / t * 100) : 0, count: a + '/' + t };
    });
    steps[9].groups.forEach((g) => g.questions.forEach((q) => { qTotal++; if (answered(answers[q.id])) aTotal++; }));
    return (
      <div style={{ position: 'absolute', inset: 0, background: '#F2EFE7', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 80, top: 70, fontFamily: "'JetBrains Mono',monospace", fontSize: 13, letterSpacing: '0.12em', color: '#707070' }}>ENCLOSING</div>
        <div style={{ position: 'absolute', left: 80, top: 100, fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em' }}>What we captured today.</div>
        <div style={{ position: 'absolute', left: 60, top: 200, width: 880, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {rows.map((r) => (
            <div key={r.num} style={{ background: '#FFFFFF', border: '1px solid #E4E1D8', borderRadius: 5, padding: 20, height: 132, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: '#707070' }}>{r.num}</span>
                <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: r.pct === 100 ? '#2F7A47' : '#9A9A9A' }}>{r.count}</span>
              </div>
              <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 14 }}>{r.label}</div>
              <div style={{ marginTop: 'auto', height: 4, background: '#E4E1D8', borderRadius: 2, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: 4, background: '#0A0A0A', borderRadius: 2, width: r.pct + '%' }}></div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 980, top: 200, width: 380, height: 620, background: '#0A0A0A', color: '#FFFFFF', borderRadius: 5, padding: 30, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '0.12em', color: '#9A9A9A' }}>DISCOVERY COMPLETE</div>
          <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 24, lineHeight: 1 }}>{aTotal}<span style={{ fontSize: 30, color: '#9A9A9A' }}>/{qTotal}</span></div>
          <div style={{ fontSize: 16, color: '#C9C7C0', marginTop: 10 }}>questions answered</div>
          <div style={{ fontFamily: 'Fraunces,Georgia,serif', fontStyle: 'italic', fontSize: 22, marginTop: 'auto', lineHeight: 1.3 }}>No pitch deck. No B.S. Just the brief.</div>
        </div>
      </div>
    );
  }

  function DonePanel({ isAdmin, onClose }) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(10,10,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: 8, maxWidth: 460, width: '100%', padding: 34, textAlign: 'center', border: '1px solid #0A0A0A' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#E8FF4E', border: '1px solid #0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 18px' }}>✓</div>
          <h2 style={{ fontSize: 24, fontWeight: 750, letterSpacing: '-0.02em', margin: '0 0 10px' }}>{isAdmin ? 'Discovery marked complete.' : 'Thank you — your answers are in.'}</h2>
          <p style={{ fontSize: 14.5, color: '#4D4D4D', lineHeight: 1.55, margin: '0 0 22px' }}>
            {isAdmin ? 'Everything is saved. You can keep editing any answer and it stays saved automatically.' : 'The Uncap team has been notified of your updates. You can keep editing and submit again anytime.'}
          </p>
          <button onClick={onClose} style={{ border: 'none', background: '#0A0A0A', color: '#fff', borderRadius: 6, padding: '12px 22px', fontSize: 14, fontWeight: 650, cursor: 'pointer' }}>Back to the discovery</button>
        </div>
      </div>
    );
  }

  function escapeText(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ── Root: resolve auth then render gate or experience ─────────────────
  function Root() {
    const [phase, setPhase] = useState('loading'); // loading | gate | ready | error
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [initial, setInitial] = useState(null);
    const [token, setToken] = useState('');
    const [err, setErr] = useState('');

    const loadAnswers = useCallback(async (tok) => {
      const q = '/api/discovery/answers?handle=' + encodeURIComponent(HANDLE) + (tok ? '&token=' + encodeURIComponent(tok) : '');
      const d = await api(q);
      setRole(d.role);
      setCompany(d.company || d.clientName || '');
      setInitial({ answers: d.answers || {}, activeStepIdx: d.activeStepIdx || 0, unlockedIdx: d.unlockedIdx || 0, status: d.status });
      setPhase('ready');
    }, []);

    useEffect(() => {
      if (!HANDLE) { setErr('Invalid discovery link.'); setPhase('error'); return; }
      (async () => {
        // Admins are authed by cookie — try answers directly first.
        try { await loadAnswers(''); return; } catch (e) { if (e.status !== 401) { /* fall through to gate */ } }
        // Try a stored client token.
        let tok = '';
        try { tok = sessionStorage.getItem(TOKEN_KEY) || ''; } catch (_) {}
        if (tok) {
          try { setToken(tok); await loadAnswers(tok); return; } catch (_) { try { sessionStorage.removeItem(TOKEN_KEY); } catch (_) {} }
        }
        // Need the passcode gate — fetch public meta for the company name.
        try {
          const m = await api('/api/discovery/meta?handle=' + encodeURIComponent(HANDLE));
          setCompany(m.company || m.clientName || '');
        } catch (e) { setErr(e.message); setPhase('error'); return; }
        setPhase('gate');
      })();
    }, [loadAnswers]);

    if (phase === 'loading') {
      return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 26, height: 26, border: '3px solid #C9C7C0', borderTopColor: '#0A0A0A', borderRadius: '50%', animation: 'uc-spin 700ms linear infinite' }}></div>
      </div>;
    }
    if (phase === 'error') {
      return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center' }}>
        <div><h1 style={{ fontSize: 22 }}>This discovery link isn't available.</h1><p style={{ color: '#707070' }}>{err}</p></div>
      </div>;
    }
    if (phase === 'gate') {
      return <Gate onToken={(tok) => { setToken(tok); loadAnswers(tok).catch((e) => setErr(e.message)); }}/>;
    }
    return <Experience role={role} company={company} initial={initial} token={token}/>;
  }

  ReactDOM.render(<Root/>, document.getElementById('disc-root'));
})();
