/* Uncap Discovery Experience — the interactive 10-step discovery session.
 * Faithful port of the Claude Design handoff, wired to the server so every
 * answer autosaves and a half-finished session resumes anywhere. Admins are
 * auto-authed via the __Host-bp_admin cookie; clients open the same URL and
 * unlock it with an email passcode, then edit/fill their own entries.
 */
(function () {
  const { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } = React;
  // Scenes 3-6 are the rich "website frame" pages (normal document flow, tall,
  // sections tagged with data-hotspot). All 10 steps fit to width and scroll
  // vertically inside the fixed viewport.
  const isRichScene = (idx) => idx >= 2 && idx <= 5;
  // #step1 … #step10 in the URL so any step can be opened or shared directly.
  const stepFromHash = () => {
    const m = (window.location.hash || '').match(/^#step(\d+)$/i);
    if (!m) return null;
    const n = parseInt(m[1], 10) - 1;
    return (n >= 0 && n <= 9) ? n : null;
  };
  const setStepHash = (idx) => { try { window.history.replaceState(null, '', '#step' + (idx + 1)); } catch (_) {} };
  // Extra section hotspots that don't map to a discovery question but should
  // still spotlight + link to a relevant group. Add new rich-scene sections
  // here when they need their own hotspot without a dedicated question.
  const EXTRA_HOTSPOTS = {
    'v-tiers':  { label: 'Tier & contract pricing', info: 'Quantity breaks and contract prices, right on the product page — how your pricing rewards bigger orders and signed-in accounts.', gid: 'g-buybox' },
    'v-addons': { label: 'Add-ons & attach', info: 'The accessories and consumables that belong with this product, surfaced with a checkbox to lift average order value.', gid: 'g-buybox' },
    'v-fbt':    { label: 'Frequently bought together', info: 'Cross-sell bundles built from what buyers actually purchase together, with a one-click add-all.', gid: 'g-buybox' },
    'e-proof':  { label: 'Service promises', info: 'The reasons to buy here instead of anywhere else: shipping speed, terms, easy returns, and a human on the account.', gid: 'g-merch' },
    'e-brands': { label: 'Brands carried', info: 'The lines you stock, front and center. Familiar names build instant credibility with a first-time buyer.', gid: 'g-merch' },
    'e-featured': { label: 'Featured products', info: 'A merchandised row you control: seasonal pushes, overstock, new lines. What deserves the spotlight?', gid: 'g-merch' },
    'e-about':  { label: 'Your story', info: 'The five-second credibility check: who you are, how long you have done this, and why accounts stay.', gid: 'g-hero' },
    'e-reviews': { label: 'Social proof', info: 'Real words from real accounts. B2B buyers trust peers over promises.', gid: 'g-merch' },
    'e-signup': { label: 'Email capture', info: 'Restock alerts and offers keep you in the inbox between orders.', gid: 'g-merch' },
    'e-fitment': { label: 'Product fitment', info: 'A guided finder that narrows the catalog by what the buyer runs. The fastest route from landing to the right product.', gid: 'g-nav' },
    'e-sliders': { label: 'Product sliders', info: 'Merchandised product rows: best sellers, reorders, seasonal pushes. What earns a slot on your homepage?', gid: 'g-merch' },
    'd-signup': { label: 'Email capture', info: 'Restock alerts and offers keep you in the inbox between orders.', gid: 'g-grid' },
    'v-signup': { label: 'Email capture', info: 'Restock alerts and offers keep you in the inbox between orders.', gid: 'g-buybox' },
    'r-signup': { label: 'Email capture', info: 'Restock alerts and offers keep you in the inbox between orders.', gid: 'g-cart' },
  };

  const HANDLE = (function () {
    // Classic /discovery/<handle> or the portal embed /<companyId>/
    // discovery/app; the worker resolves a company id to its handle.
    const m = window.location.pathname.match(/^\/discovery\/([a-z0-9-]+)\/?$/)
      || window.location.pathname.match(/^\/([a-z0-9-]+)\/discovery\/app\/?$/);
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

  // ERP vendor → editions catalog for the q-erp cascading dropdown. Vendors
  // without editions skip the second select; "Other" opens a free-text field.
  const ERP_CATALOG = [
    { name: 'No ERP', editions: [] },
    { name: 'SAP', editions: ['S/4HANA On-Premise', 'S/4HANA Private Cloud', 'S/4HANA Cloud Public Edition', 'ECC / Business Suite 7', 'Business One', 'Business ByDesign'] },
    { name: 'Oracle', editions: ['Fusion Cloud ERP', 'NetSuite', 'E-Business Suite (EBS)', 'JD Edwards EnterpriseOne', 'PeopleSoft'] },
    { name: 'Microsoft Dynamics 365', editions: ['Finance', 'Supply Chain Management', 'Business Central', 'GP', 'SL', 'NAV'] },
    { name: 'Infor', editions: ['CloudSuite LN', 'CloudSuite M3', 'CloudSuite Industrial (SyteLine)', 'Distribution SX.e', 'LX / System21'] },
    { name: 'Epicor', editions: ['Kinetic', 'Prophet 21 / P21', 'Eclipse', 'BisTrack', 'CMS', 'LumberTrack', 'iScala'] },
    { name: 'Sage', editions: ['Intacct', 'X3', 'Sage 50', 'Sage 100', 'Sage 200', 'Sage 300'] },
    { name: 'Acumatica', editions: ['General Business', 'Distribution', 'Manufacturing', 'Construction', 'Retail-Commerce'] },
    { name: 'Odoo', editions: ['Community', 'Enterprise'] },
    { name: 'IFS Cloud', editions: [] },
    { name: 'SYSPRO', editions: [] },
    { name: 'QAD Adaptive ERP', editions: [] },
    { name: 'Deltek', editions: [] },
    { name: 'DDI System Inform', editions: [] },
    { name: 'Distribution One ERP-ONE', editions: [] },
    { name: 'Kerridge K8', editions: [] },
    { name: 'Aptean (Apprise)', editions: [] },
    { name: 'ECI', editions: [] },
    { name: 'ERPNext / Frappe', editions: [] },
    { name: 'Workday', editions: [] },
    { name: 'Zoho', editions: [] },
    { name: 'Katana', editions: [] },
    { name: 'MRPeasy', editions: [] },
    { name: 'Cin7', editions: [] },
    { name: 'Brightpearl', editions: [] },
    { name: 'Fishbowl', editions: [] },
  ];

  // Commerce platform vendor → editions catalog for the q-platform dropdown.
  const PLATFORM_CATALOG = [
    { name: 'No Ecommerce Platform', editions: [] },
    { name: 'Adobe Commerce (Magento)', editions: ['Magento Open Source', 'Adobe Commerce', 'Adobe Commerce Cloud'] },
    { name: 'Salesforce Commerce Cloud', editions: ['B2C Commerce (Demandware)', 'B2B Commerce (CloudCraze)'] },
    { name: 'SAP Commerce Cloud (Hybris)', editions: [] },
    { name: 'Oracle Commerce (ATG / Endeca)', editions: [] },
    { name: 'Optimizely', editions: ['Configured Commerce (Insite)', 'Customized Commerce (Episerver)'] },
    { name: 'HCL Commerce (WebSphere Commerce)', editions: [] },
    { name: 'commercetools', editions: [] },
    { name: 'Elastic Path', editions: [] },
    { name: 'Intershop', editions: [] },
    { name: 'VTEX', editions: [] },
    { name: 'Sitecore', editions: ['OrderCloud', 'Sitecore Commerce'] },
    { name: 'Kibo Commerce', editions: [] },
    { name: 'OroCommerce', editions: [] },
    { name: 'Sana Commerce Cloud', editions: [] },
    { name: 'CIMcloud (Website Pipeline)', editions: [] },
    { name: 'Unilog CIMM2', editions: [] },
    { name: 'Kalio Commerce', editions: [] },
    { name: 'k-eCommerce', editions: [] },
    { name: 'Cloudfy', editions: [] },
    { name: 'Corevist', editions: [] },
    { name: 'Znode', editions: [] },
    { name: 'Virto Commerce', editions: [] },
    { name: 'NetSuite SuiteCommerce', editions: ['SuiteCommerce', 'SuiteCommerce Advanced'] },
    { name: 'BigCommerce', editions: ['Standard', 'Enterprise', 'B2B Edition'] },
    { name: 'WooCommerce', editions: [] },
    { name: 'Volusion', editions: [] },
    { name: 'Shift4Shop', editions: [] },
    { name: 'Big Cartel', editions: [] },
    { name: 'Shopware 6', editions: [] },
    { name: 'PrestaShop', editions: [] },
    { name: 'OpenCart', editions: [] },
    { name: 'osCommerce', editions: [] },
    { name: 'Zen Cart', editions: [] },
    { name: 'nopCommerce', editions: [] },
    { name: 'X-Cart', editions: [] },
    { name: 'CS-Cart', editions: [] },
    { name: 'Drupal Commerce', editions: [] },
    { name: 'Spree / Solidus', editions: [] },
    { name: 'Saleor', editions: [] },
  ];

  // PIM platform catalog for the q-pim dropdown (flat, no editions).
  const PIM_CATALOG = [
    'No PIM', 'Akeneo', 'Salsify', 'inRiver', 'Pimcore', 'Syndigo', 'Stibo Systems (STEP)',
    'Contentserv', 'Plytix', 'Sales Layer', 'Bluestone PIM', 'Catsy', 'PIMworks', 'Perfion',
    'Jasper PIM', 'Ergonode',
  ].map((name) => ({ name, editions: [] }));

  // CRM platform catalog for the q-crm dropdown (flat, no editions).
  const CRM_CATALOG = [
    'No CRM', 'Salesforce', 'HubSpot', 'Microsoft Dynamics 365 Sales', 'Zoho CRM', 'Pipedrive',
    'SugarCRM', 'monday CRM', 'Freshsales', 'Copper', 'Insightly', 'Nutshell', 'Close', 'Keap',
    'Attio', 'NetSuite CRM', 'SAP Sales Cloud', 'Oracle CX Sales',
  ].map((name) => ({ name, editions: [] }));

  // Question type → catalog for the cascading vendor/edition dropdowns.
  const CASCADE_CATALOGS = { erp: ERP_CATALOG, platform: PLATFORM_CATALOG, pim: PIM_CATALOG, crm: CRM_CATALOG };

  // Map a stored answer string back onto the dropdowns: "Vendor · Edition",
  // a bare vendor, a bare edition (e.g. a prefilled "NetSuite"), or anything
  // else lands in Other with the raw text preserved. 'None' (the old chips
  // value for q-platform) maps to the catalog's leading "No ..." entry.
  const parseCascade = (catalog, v) => {
    let s = (typeof v === 'string' ? v : '').trim();
    if (s === 'None' && catalog[0] && catalog[0].name.indexOf('No ') === 0) s = catalog[0].name;
    if (!s) return { vendor: '', edition: '', text: '' };
    const sep = s.indexOf(' · ');
    if (sep > 0) {
      const vend = s.slice(0, sep);
      const ed = s.slice(sep + 3);
      const c = catalog.find((e) => e.name === vend);
      if (c) return { vendor: vend, edition: c.editions.includes(ed) ? ed : '', text: '' };
    }
    if (catalog.some((e) => e.name === s)) return { vendor: s, edition: '', text: '' };
    const byEd = catalog.find((e) => e.editions.includes(s));
    if (byEd) return { vendor: byEd.name, edition: s, text: '' };
    return { vendor: 'Other', edition: '', text: s === 'Other' ? '' : s };
  };

  const LABELS = ['Company', 'Architecture', 'Experience', 'Discovery', 'Conversion', 'Revenue', 'Unified', 'Project', 'Growth', 'Enclosing'];

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
  function Experience({ role, company, address, profile, palette, hasLogo, initial, token }) {
    const steps = window.DISCOVERY_STEPS || [];
    const hashStep = stepFromHash();
    const [answers, setAnswers] = useState(initial.answers || {});
    const [activeStepIdx, setActiveStepIdx] = useState(hashStep != null ? hashStep : Math.min(initial.activeStepIdx || 0, 9));
    const [unlockedIdx, setUnlockedIdx] = useState(Math.max(Math.min(initial.unlockedIdx || 0, 9), hashStep != null ? hashStep : 0));
    const [activeHotspotId, setActiveHotspotId] = useState(null);
    // Keeps a cascade question (erp / platform) in "Other" mode while typing,
    // even when the typed text happens to equal a listed vendor or edition.
    const [cascadeOther, setCascadeOther] = useState({});
    const [scale, setScale] = useState(0.55);
    const [contentH, setContentH] = useState(900);
    const [infoCard, setInfoCard] = useState(null);
    const [siteHotspots, setSiteHotspots] = useState([]); // measured section rects for scenes 3-6
    const [fontsReady, setFontsReady] = useState(false);
    const [saveState, setSaveState] = useState(''); // '', 'saving', 'saved'
    const [submitState, setSubmitState] = useState('');
    const [done, setDone] = useState(false); // completion modal only after an explicit finish
    // Below ~720px the stage + form stack vertically (side-by-side crushes both).
    const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches));

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

    // ── Live call transcription (admin only) ─────────────────────────────
    // The rep shares the meeting tab (with audio) once; tab audio + mic are
    // mixed and streamed to Deepgram with a short-lived key minted by the
    // worker. Finalized speech appends into whichever open-text question is
    // focused; "AI fill from call" maps the whole transcript onto any fields
    // still empty (the server never overwrites a human answer).
    const [live, setLive] = useState('');           // '' | 'starting' | 'on'
    const [liveErr, setLiveErr] = useState('');
    const [interim, setInterim] = useState('');
    const [liveFill, setLiveFill] = useState('');   // '' | 'filling' | 'filled N'
    const [focusedQid, setFocusedQid] = useState('');
    const focusedQidRef = useRef('');
    const liveRef = useRef(null);                   // { ws, recorder, ctx, streams, keepalive }
    const transcriptRef = useRef('');

    const isAdminRef = useRef(isAdmin);
    isAdminRef.current = isAdmin;

    const noteFocus = (qid) => { focusedQidRef.current = qid; setFocusedQid(qid); };

    const appendToFocused = (text) => {
      const qid = focusedQidRef.current;
      if (!qid || !text) return;
      setAnswers((prev) => {
        const cur = (prev[qid] || '').toString();
        const joined = cur ? cur.replace(/\s+$/, '') + ' ' + text : text;
        const next = { ...prev, [qid]: joined.slice(0, 8000) };
        scheduleSave(next, stepIdxRef.current, unlockedIdx);
        return next;
      });
    };

    const stopLive = useCallback((persist) => {
      const l = liveRef.current;
      liveRef.current = null;
      setLive(''); setInterim('');
      if (!l) return;
      try { if (l.keepalive) clearInterval(l.keepalive); } catch (_) {}
      try { if (l.recorder && l.recorder.state !== 'inactive') l.recorder.stop(); } catch (_) {}
      try { if (l.ws && l.ws.readyState === 1) { l.ws.send(JSON.stringify({ type: 'CloseStream' })); } } catch (_) {}
      try { if (l.ws) l.ws.close(); } catch (_) {}
      (l.streams || []).forEach((s) => { try { s.getTracks().forEach((t) => t.stop()); } catch (_) {} });
      try { if (l.ctx) l.ctx.close(); } catch (_) {}
      if (persist && transcriptRef.current) {
        api('/api/admin/discovery/transcript-fill', { method: 'POST', body: JSON.stringify({ handle: HANDLE, transcript: transcriptRef.current, fill: false }) }).catch(() => {});
      }
    }, []);

    const startLive = async () => {
      setLiveErr(''); setLive('starting');
      let key;
      try {
        const d = await api('/api/admin/discovery/transcribe-token', { method: 'POST', body: '{}' });
        key = d.key;
      } catch (e) { setLive(''); setLiveErr(e.message || 'Could not start transcription.'); return; }
      let disp;
      try {
        disp = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      } catch (_) { setLive(''); setLiveErr('Pick the meeting tab and tick "Also share tab audio".'); return; }
      if (!disp.getAudioTracks().length) {
        disp.getTracks().forEach((t) => t.stop());
        setLive(''); setLiveErr('No audio was shared. Choose a Chrome TAB and tick "Also share tab audio".');
        return;
      }
      let mic = null;
      try { mic = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (_) { /* mic optional: tab audio alone still captures the call */ }
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const dest = ctx.createMediaStreamDestination();
      ctx.createMediaStreamSource(new MediaStream(disp.getAudioTracks())).connect(dest);
      if (mic) ctx.createMediaStreamSource(mic).connect(dest);
      const recorder = new MediaRecorder(dest.stream, { mimeType: 'audio/webm;codecs=opus' });
      const ws = new WebSocket('wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&interim_results=true', ['token', key]);
      const l = { ws, recorder, ctx, streams: [disp, mic].filter(Boolean), keepalive: 0 };
      liveRef.current = l;
      ws.onopen = () => {
        recorder.start(250);
        l.keepalive = setInterval(() => { try { if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'KeepAlive' })); } catch (_) {} }, 8000);
        setLive('on');
      };
      recorder.ondataavailable = (e) => { try { if (e.data && e.data.size && ws.readyState === 1) ws.send(e.data); } catch (_) {} };
      ws.onmessage = (ev) => {
        let d; try { d = JSON.parse(ev.data); } catch (_) { return; }
        const alt = d.channel && d.channel.alternatives && d.channel.alternatives[0];
        const t = alt && alt.transcript ? alt.transcript.trim() : '';
        if (!t) return;
        if (d.is_final) {
          transcriptRef.current += (transcriptRef.current ? '\n' : '') + t;
          setInterim('');
          appendToFocused(t);
        } else {
          setInterim(t);
        }
      };
      ws.onerror = () => { if (liveRef.current === l) { setLiveErr('Transcription connection failed.'); stopLive(true); } };
      ws.onclose = () => { if (liveRef.current === l) stopLive(true); };
      const vTrack = disp.getVideoTracks()[0];
      if (vTrack) vTrack.onended = () => { if (liveRef.current === l) stopLive(true); };
    };

    const aiFillFromCall = async () => {
      if (!transcriptRef.current || liveFill === 'filling') return;
      setLiveFill('filling');
      try {
        const d = await api('/api/admin/discovery/transcript-fill', { method: 'POST', body: JSON.stringify({ handle: HANDLE, transcript: transcriptRef.current }) });
        // Merge only into locally-empty fields; typed-but-unsaved text wins.
        setAnswers((prev) => {
          const next = { ...prev };
          for (const k of Object.keys(d.answers || {})) {
            const cur = next[k];
            const has = Array.isArray(cur) ? cur.length > 0 : (cur || '').toString().trim() !== '';
            if (!has) next[k] = d.answers[k];
          }
          scheduleSave(next, stepIdxRef.current, unlockedIdx);
          return next;
        });
        setLiveFill('filled ' + (d.filled || 0));
        setTimeout(() => setLiveFill((s) => (s === 'filling' ? s : '')), 4000);
      } catch (e) {
        setLiveFill('');
        setLiveErr(e.message || 'AI fill failed.');
      }
    };

    // Restore the call transcript for a resumed session; stop capture cleanly
    // on unmount.
    useEffect(() => {
      if (isAdmin) {
        api('/api/admin/discovery/transcript?handle=' + encodeURIComponent(HANDLE))
          .then((d) => { if (d && d.text && !transcriptRef.current) transcriptRef.current = d.text; })
          .catch(() => {});
      }
      return () => stopLive(false);
      // eslint-disable-next-line
    }, [isAdmin]);

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
      // Every step fits to width and scrolls vertically inside the viewport.
      const s = Math.max(0.1, (r.width - pad * 2) / 1440);
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

    useEffect(() => {
      const mq = window.matchMedia('(max-width: 720px)');
      const on = () => setIsMobile(mq.matches);
      mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on);
      return () => { mq.removeEventListener ? mq.removeEventListener('change', on) : mq.removeListener(on); };
    }, []);
    useEffect(() => () => { if (roRef.current) roRef.current.disconnect(); }, []);
    // Web fonts change layout after load — re-measure once they're ready.
    useEffect(() => {
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setFontsReady(true)).catch(() => {});
    }, []);
    // Reflect the current step in the URL, and react to a shared/edited hash.
    useEffect(() => {
      setStepHash(stepIdxRef.current);
      const onHash = () => {
        const n = stepFromHash();
        if (n != null && n !== stepIdxRef.current) { setUnlockedIdx((u) => Math.max(u, n)); go(n); }
      };
      window.addEventListener('hashchange', onHash);
      return () => window.removeEventListener('hashchange', onHash);
    }, []);
    // Re-fit on step change, and measure the rich scene's natural height so
    // the scroll viewport gets the right scroll extent.
    useLayoutEffect(() => {
      setInfoCard(null);
      measure();
      if (isRichScene(activeStepIdx) && contentInnerRef.current) {
        setContentH(contentInnerRef.current.offsetHeight || 900);
      } else {
        setContentH(900);
      }
    }, [activeStepIdx, measure, fontsReady]);

    // Measure each tagged section (union per hotspot id) so the animated
    // marker/outline overlay lines up with the rich scene DOM. Re-runs when
    // the scene, scale, or content height settle.
    useLayoutEffect(() => {
      if (!isRichScene(activeStepIdx) || !contentInnerRef.current) { setSiteHotspots([]); return; }
      const root = contentInnerRef.current;
      const rootRect = root.getBoundingClientRect();
      const s = scale || 1;
      // Every tagged section becomes a marker; union multiple elements that
      // share an id, keep DOM order for numbering.
      const byId = {}, order = [];
      Array.from(root.querySelectorAll('[data-hotspot]')).forEach((el) => {
        const id = el.getAttribute('data-hotspot');
        const r = el.getBoundingClientRect();
        const x = (r.left - rootRect.left) / s, y = (r.top - rootRect.top) / s, x2 = (r.right - rootRect.left) / s, y2 = (r.bottom - rootRect.top) / s;
        if (!byId[id]) { byId[id] = { x0: x, y0: y, x1: x2, y1: y2 }; order.push(id); }
        else { const b = byId[id]; b.x0 = Math.min(b.x0, x); b.y0 = Math.min(b.y0, y); b.x1 = Math.max(b.x1, x2); b.y1 = Math.max(b.y1, y2); }
      });
      setSiteHotspots(order.map((id, i) => {
        const b = byId[id];
        return { id, x: b.x0, y: b.y0, w: b.x1 - b.x0, h: b.y1 - b.y0, num: String(i + 1).padStart(2, '0'), gid: resolveHotspot(id).gid };
      }));
    }, [activeStepIdx, scale, contentH, fontsReady]);

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
      setInfoCard(null);
      setStepHash(idx);
      if (formElRef.current) formElRef.current.scrollTo({ top: 0 });
      scrollStripToActive(idx);
      scheduleSave(answers, idx, Math.max(unlockedIdx, idx));
    };

    const scrollToGroup = (gid) => {
      const el = groupEls.current[gid];
      const c = formElRef.current;
      if (el && c) c.scrollTo({ top: Math.max(0, el.offsetTop - 12), behavior: 'smooth' });
    };

    // ── Click-to-highlight for the rich site scenes ──────────────────────
    // Every section in a website-frame scene carries data-hotspot="<groupId>".
    // We measure each tagged section's rect and render the SAME pulsing marker
    // + animated draw outline + dim spotlight the coordinate hotspots use, so
    // the interaction and animation are identical across every step.
    // Resolve a hotspot id to its label/info/group — from the discovery
    // questions first, then the EXTRA_HOTSPOTS map for sections that have a
    // marker but no dedicated question.
    const resolveHotspot = (hid) => {
      const step = steps[stepIdxRef.current];
      const h = step && step.hotspots.find((x) => x.id === hid);
      if (h) { const g = step.groups.find((gg) => gg.hotspotId === hid); return { label: h.label, info: h.info, gid: g ? g.id : '' }; }
      return EXTRA_HOTSPOTS[hid] || { label: hid, info: '', gid: '' };
    };
    const showCard = (hid, el) => {
      const step = steps[stepIdxRef.current];
      const meta = resolveHotspot(hid);
      const r = el.getBoundingClientRect();
      setInfoCard({
        top: r.top, left: r.left,
        eyebrow: 'STEP ' + String(stepIdxRef.current + 1).padStart(2, '0') + ' · ' + (step ? step.label.toUpperCase() : ''),
        label: meta.label, info: meta.info, gid: meta.gid,
      });
    };
    // Select a rich-scene section by its hotspot id (marker click or scene
    // click). Toggles off when the same section is clicked again.
    const selectSiteHotspot = (hid) => {
      const next = activeHotspotId === hid ? null : hid;
      setActiveHotspotId(next);
      if (!next) { setInfoCard(null); return; }
      const meta = resolveHotspot(hid);
      if (meta.gid) scrollToGroup(meta.gid);
      const root = contentInnerRef.current;
      const el = root && root.querySelector('[data-hotspot="' + hid + '"]');
      if (el) showCard(hid, el);
    };
    // Categories mega menu. The hotspot overlay rects sit above the scene
    // HTML and swallow clicks, so DOM-closest never sees the button; hit-test
    // the trigger/panel by screen coordinates instead. Returns true when the
    // click belonged to the menu layer (toggled, or landed inside the open
    // panel); closes an open panel on any other click and lets it fall
    // through to the normal hotspot handling.
    const handleMegaClick = (e) => {
      const root = contentInnerRef.current;
      if (!root) return false;
      const within = (el) => {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      };
      const trigger = root.querySelector('[data-mega]');
      const menu = root.querySelector('[data-megamenu]');
      if (within(trigger)) {
        if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        return true;
      }
      if (within(menu)) return true;
      if (menu && menu.style.display !== 'none') menu.style.display = 'none';
      return false;
    };
    const onSiteClick = (e) => {
      if (handleMegaClick(e)) return;
      const el = e.target.closest ? e.target.closest('[data-hotspot]') : null;
      if (!el) { setActiveHotspotId(null); setInfoCard(null); return; }
      const hid = el.getAttribute('data-hotspot');
      setActiveHotspotId(hid);
      const meta = resolveHotspot(hid);
      if (meta.gid) scrollToGroup(meta.gid);
      showCard(hid, el);
    };
    // Clicking a form group also spotlights + scrolls to its section.
    const focusGroup = (g) => {
      setActiveHotspotId(g.hotspotId);
      if (isRichScene(stepIdxRef.current)) {
        const root = contentInnerRef.current;
        const el = root && root.querySelector('[data-hotspot="' + g.hotspotId + '"]');
        if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => showCard(g.hotspotId, el), 300); }
      }
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
    // Memoized: the swap pipeline makes 15+ full passes over a scene string
    // that can run to ~80KB, and the component re-renders on every keystroke.
    // Its inputs only change on step change / load, so compute it then only.
    const isRich = isRichScene(activeStepIdx);
    const logoUrl = hasLogo ? '/api/discovery/logo?handle=' + encodeURIComponent(HANDLE) : '';
    const sceneHtml = useMemo(() => {
      let html = (window.DISCOVERY_SCENES || {})[activeStepIdx + 1] || '';
      if (activeStepIdx === 0) {
        html = html.replace(/__CLIENT_NAME__/g, escapeText(company || 'there'));
        // Street on line one, city/state/zip on line two; parts are escaped
        // individually so the <br/> survives the substitution.
        const addr = (address || '').toUpperCase().trim();
        const comma = addr.indexOf(',');
        const addrHtml = comma > 0
          ? escapeText(addr.slice(0, comma).trim()) + '<br/>' + escapeText(addr.slice(comma + 1).trim())
          : escapeText(addr);
        html = html.replace(/__CLIENT_ADDRESS__/g, addrHtml);
        html = html.replace(/__CLIENT_LOGO__/g, logoUrl
          ? '<img src="' + logoUrl + '" alt="" style="height:44px;max-width:210px;object-fit:contain;object-position:right;display:block"/>'
          : '');
      }
      // Logo swaps run on the raw scene, before the text swaps consume the
      // wordmark tokens they anchor on. The palette only ever touches the
      // website wireframe scenes; every other slide keeps the Uncap lime.
      html = applyClientLogo(html, logoUrl);
      html = applyProfileSwaps(html, profile);
      if (isRich) html = applyPalette(html, palette);
      return html;
    }, [activeStepIdx, company, address, logoUrl, profile, palette, isRich]);

    return (
      <div style={{ height: isMobile ? 'auto' : '100vh', minHeight: isMobile ? '100dvh' : undefined, display: 'flex', flexDirection: 'column', background: '#F2EFE7', color: '#0A0A0A' }}>
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
          {isAdmin && (
            <button onClick={() => (live ? stopLive(true) : startLive())} disabled={live === 'starting'}
              style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', border: '1px solid ' + (live === 'on' ? '#B5322B' : '#0A0A0A'), borderRadius: 999, background: live === 'on' ? '#B5322B' : 'transparent', color: live === 'on' ? '#FFFFFF' : '#0A0A0A', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.08em', cursor: 'pointer' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: live === 'on' ? '#FFFFFF' : '#B5322B', animation: live === 'on' ? 'uc-pulse 1.6s cubic-bezier(.2,.7,.2,1) infinite' : 'none' }}></span>
              {live === 'on' ? 'STOP LIVE' : live === 'starting' ? 'STARTING…' : 'LIVE CAPTURE'}
            </button>
          )}
          <div style={{ flex: '0 0 auto', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.08em', color: '#9A9A9A' }}>
            {isAdmin ? (saveState === 'saving' ? 'SAVING…' : saveState === 'saved' ? 'SAVED ✓' : 'ADMIN') : 'CLIENT'}
          </div>
        </div>

        {/* LIVE CAPTURE PANEL */}
        {isAdmin && (live || liveErr || liveFill) ? (
          <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 200, width: 'min(340px, calc(100vw - 32px))', background: '#0A0A0A', color: '#FFFFFF', borderRadius: 8, padding: '14px 16px', boxShadow: '0 16px 40px rgba(10,10,10,0.35)', fontFamily: "'JetBrains Mono',monospace" }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, letterSpacing: '0.1em' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: live === 'on' ? '#E8FF4E' : '#707070', animation: live === 'on' ? 'uc-pulse 1.6s cubic-bezier(.2,.7,.2,1) infinite' : 'none' }}></span>
              {live === 'on' ? 'LIVE · CALL TRANSCRIPTION' : live === 'starting' ? 'CONNECTING…' : 'CALL TRANSCRIPTION'}
              {live
                ? <button onClick={() => stopLive(true)} style={{ marginLeft: 'auto', border: '1px solid #4D4D4D', background: 'transparent', color: '#FFFFFF', borderRadius: 4, padding: '3px 8px', fontFamily: 'inherit', fontSize: 9.5, cursor: 'pointer' }}>STOP</button>
                : <button onClick={() => { setLiveErr(''); setLiveFill(''); setInterim(''); }} style={{ marginLeft: 'auto', border: 'none', background: 'transparent', color: '#9A9A9A', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer' }}>✕</button>}
            </div>
            {live === 'on' ? (
              <div style={{ marginTop: 10, fontSize: 11, color: '#C9C7C0' }}>
                {focusedQid && labelMap.current[focusedQid]
                  ? <span>→ {labelMap.current[focusedQid].slice(0, 60)}</span>
                  : <span style={{ color: '#9A9A9A' }}>Click an open question to route speech into it</span>}
              </div>
            ) : null}
            {interim ? <div style={{ marginTop: 8, fontSize: 11.5, fontStyle: 'italic', color: '#9A9A9A', maxHeight: 48, overflow: 'hidden' }}>{interim}</div> : null}
            {liveErr ? <div style={{ marginTop: 8, fontSize: 11, color: '#FF8A80' }}>{liveErr}</div> : null}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <button onClick={aiFillFromCall} disabled={liveFill === 'filling' || !transcriptRef.current}
                style={{ border: 'none', background: '#E8FF4E', color: '#0A0A0A', borderRadius: 5, padding: '8px 12px', fontFamily: 'inherit', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', opacity: liveFill === 'filling' || !transcriptRef.current ? 0.55 : 1 }}>
                {liveFill === 'filling' ? 'ANALYZING…' : 'AI FILL FROM CALL'}
              </button>
              {liveFill && liveFill !== 'filling' ? <span style={{ fontSize: 10.5, color: '#E8FF4E' }}>✓ {liveFill}</span> : null}
            </div>
          </div>
        ) : null}

        {/* MAIN ROW — side-by-side on desktop, stacked (stage over form) on mobile */}
        <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: 0 }}>
          {/* STAGE — fits to width; scrolls inside the viewport on desktop, and
              flows at natural height on mobile so the page scrolls once. */}
          <div ref={stageRef} style={{ flex: isMobile ? '0 0 auto' : '1 1 auto', minWidth: 0, display: 'flex', alignItems: isMobile ? 'flex-start' : 'stretch', justifyContent: 'center', position: 'relative', padding: isMobile ? 10 : 20, boxSizing: 'border-box' }}>
            <div style={{ position: 'relative', width: Math.round(1440 * scale), height: isMobile ? Math.round((isRich ? contentH : 900) * scale) : '100%', borderRadius: 6, overflow: 'hidden', border: '1px solid #C9C7C0', background: '#FFFFFF', boxShadow: '0 12px 32px rgba(10,10,10,0.10), 0 2px 4px rgba(10,10,10,0.05)' }}>
              <div style={{ width: '100%', height: isMobile ? 'auto' : '100%', overflowY: isMobile ? 'visible' : 'auto', overflowX: 'hidden' }}
                onScroll={() => { if (infoCard) setInfoCard(null); }}>
                <div style={{ position: 'relative', width: Math.round(1440 * scale), height: Math.round((isRich ? contentH : 900) * scale) }}>
                  {isRich ? (
                    // Rich website-frame page: normal-flow HTML with tagged, measured sections.
                    <>
                      <div ref={contentInnerRef} onClick={onSiteClick} style={{ position: 'absolute', top: 0, left: 0, width: 1440, transform: 'scale(' + scale + ')', transformOrigin: 'top left', cursor: 'pointer' }}
                        dangerouslySetInnerHTML={{ __html: sceneHtml }}/>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: 1440, transform: 'scale(' + scale + ')', transformOrigin: 'top left', pointerEvents: 'none' }}>
                        {siteHotspots.map((h) => {
                          const active = activeHotspotId === h.id;
                          // Keep the badge on-screen: sections flush to the top
                          // or left edge would otherwise clip it under the frame.
                          const badgeTop = h.y < 20 ? 6 : -15;
                          const badgeLeft = h.x < 20 ? 6 : -15;
                          return (
                            <div key={h.id} onClick={(e) => { e.stopPropagation(); if (handleMegaClick(e)) return; selectSiteHotspot(h.id); }}
                              style={{ position: 'absolute', left: h.x, top: h.y, width: h.w, height: h.h, borderRadius: 8, zIndex: active ? 60 : 10, cursor: 'pointer', pointerEvents: 'auto', boxShadow: active ? '0 0 0 4000px rgba(10,10,10,0.55)' : 'none' }}>
                              {!active && (
                                <span style={{ position: 'absolute', top: badgeTop, left: badgeLeft, width: 30, height: 30, borderRadius: '50%', background: '#E8FF4E', border: '1.5px solid #0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, color: '#0A0A0A', animation: 'uc-pulse 2.4s cubic-bezier(.2,.7,.2,1) infinite' }}>{h.num}</span>
                              )}
                              {active && (
                                <svg style={{ position: 'absolute', top: -2, left: -2, overflow: 'visible' }} width={h.w + 4} height={h.h + 4}>
                                  <rect x="2" y="2" width={h.w} height={h.h} rx="8" fill="none" stroke="#E8FF4E" strokeWidth="3.5" pathLength="100" style={{ strokeDasharray: 100, animation: 'uc-draw 700ms cubic-bezier(.2,.7,.2,1) forwards' }}></rect>
                                </svg>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    // Plain artboard (steps 1-2, 7-10): fixed 1440x900 with coordinate hotspots.
                    <div onClick={() => { if (activeHotspotId) setActiveHotspotId(null); }} style={{ position: 'absolute', top: 0, left: 0, width: 1440, height: 900, transform: 'scale(' + scale + ')', transformOrigin: 'top left' }}>
                      {activeStepIdx === 9
                        ? <Scene10 steps={steps} answers={answers}/>
                        : <div style={{ position: 'absolute', inset: 0 }} dangerouslySetInnerHTML={{ __html: sceneHtml }}/>}
                      {hotspots.map((h) => (
                        <div key={h.id} onClick={(e) => { e.stopPropagation(); onHotspotClick(h.id); }}
                          style={{ position: 'absolute', left: h.x, top: h.y, width: h.w, height: h.h, cursor: 'pointer', zIndex: h.active ? 60 : 10, borderRadius: 8, boxShadow: h.active ? '0 0 0 4000px rgba(10,10,10,0.55)' : 'none' }}>
                          {!h.active && (
                            <span style={{ position: 'absolute', top: -15, left: -15, width: 30, height: 30, borderRadius: '50%', background: '#E8FF4E', border: '1.5px solid #0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, color: '#0A0A0A', animation: 'uc-pulse 2.4s cubic-bezier(.2,.7,.2,1) infinite' }}>{h.num}</span>
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
            </div>
          </div>

          {/* FORM PANEL */}
          <div style={{ flex: isMobile ? '1 1 auto' : '0 0 clamp(360px, 27vw, 470px)', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderLeft: isMobile ? 'none' : '1px solid #C9C7C0', borderTop: isMobile ? '1px solid #C9C7C0' : 'none', minHeight: 0 }}>
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
            <div ref={formElRef} style={{ flex: '1 1 auto', overflowY: isMobile ? 'visible' : 'auto', padding: '4px 24px 24px', position: 'relative', minHeight: 0 }}>
              {step.groups.map((g, gi) => {
                let gDone = 0;
                g.questions.forEach((q) => { if (answered(answers[q.id])) gDone++; });
                const active = activeHotspotId === g.hotspotId;
                const complete = gDone === g.questions.length;
                return (
                  <div key={g.id} ref={(el) => { if (el) groupEls.current[g.id] = el; }}
                    onClick={() => focusGroup(g)}
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
                            <input value={v || ''} onClick={(e) => e.stopPropagation()} onFocus={() => noteFocus(q.id)} onChange={(e) => setAnswer(q.id, e.target.value)} placeholder={q.placeholder || ''}
                              style={{ width: '100%', padding: '10px 12px', border: '1px solid ' + (live === 'on' && focusedQid === q.id ? '#0A0A0A' : '#C9C7C0'), boxShadow: live === 'on' && focusedQid === q.id ? '0 0 0 2px #E8FF4E' : 'none', borderRadius: 5, fontSize: 14, background: '#FDFCF9', outline: 'none', color: '#0A0A0A' }}/>
                          )}
                          {q.type === 'textarea' && (
                            <textarea value={v || ''} onClick={(e) => e.stopPropagation()} onFocus={() => noteFocus(q.id)} onChange={(e) => setAnswer(q.id, e.target.value)} placeholder={q.placeholder || ''} rows={3}
                              style={{ width: '100%', padding: '10px 12px', border: '1px solid ' + (live === 'on' && focusedQid === q.id ? '#0A0A0A' : '#C9C7C0'), boxShadow: live === 'on' && focusedQid === q.id ? '0 0 0 2px #E8FF4E' : 'none', borderRadius: 5, fontSize: 14, background: '#FDFCF9', outline: 'none', resize: 'vertical', lineHeight: 1.5, color: '#0A0A0A' }}/>
                          )}
                          {CASCADE_CATALOGS[q.type] && (() => {
                            const catalog = CASCADE_CATALOGS[q.type];
                            const p = cascadeOther[q.id]
                              ? { vendor: 'Other', edition: '', text: (typeof v === 'string' && v !== 'Other') ? v : '' }
                              : parseCascade(catalog, v);
                            const vendorCat = catalog.find((e) => e.name === p.vendor);
                            const selStyle = { width: '100%', padding: '10px 12px', border: '1px solid #C9C7C0', borderRadius: 5, fontSize: 14, background: '#FDFCF9', outline: 'none', color: p.vendor || p.edition ? '#0A0A0A' : '#9A9A9A', cursor: 'pointer' };
                            return (
                              <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <select value={p.vendor} style={selStyle}
                                  onChange={(e) => { const nv = e.target.value; setCascadeOther((o) => ({ ...o, [q.id]: nv === 'Other' })); setAnswer(q.id, nv); }}>
                                  <option value="">{q.type === 'erp' ? 'Select your ERP…' : q.type === 'pim' ? 'Select your PIM…' : q.type === 'crm' ? 'Select your CRM…' : 'Select your platform…'}</option>
                                  {catalog.map((e) => <option key={e.name} value={e.name}>{e.name}</option>)}
                                  <option value="Other">Other</option>
                                </select>
                                {vendorCat && vendorCat.editions.length > 0 && (
                                  <select value={p.edition} style={{ ...selStyle, color: p.edition ? '#0A0A0A' : '#9A9A9A' }}
                                    onChange={(e) => setAnswer(q.id, e.target.value ? p.vendor + ' · ' + e.target.value : p.vendor)}>
                                    <option value="">Select the edition…</option>
                                    {vendorCat.editions.map((ed) => <option key={ed} value={ed}>{ed}</option>)}
                                  </select>
                                )}
                                {p.vendor === 'Other' && (
                                  <input value={p.text} onChange={(e) => setAnswer(q.id, e.target.value || 'Other')} placeholder="Tell us what you run…"
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #C9C7C0', borderRadius: 5, fontSize: 14, background: '#FDFCF9', outline: 'none', color: '#0A0A0A' }}/>
                                )}
                              </div>
                            );
                          })()}
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

        {infoCard && (
          <div style={{ position: 'fixed', zIndex: 400, width: 360, maxWidth: 'calc(100vw - 24px)',
            top: Math.max(12, Math.min(infoCard.top + 14, window.innerHeight - 250)),
            left: Math.max(12, Math.min(infoCard.left + 16, window.innerWidth - 384)),
            background: '#FFFFFF', border: '1px solid #0A0A0A', borderRadius: 8, padding: 20, boxShadow: '0 18px 44px rgba(10,10,10,0.28)' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.12em', color: '#707070' }}>{infoCard.eyebrow}</div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.015em', marginTop: 8 }}>{infoCard.label}</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.55, color: '#4D4D4D', marginTop: 8 }}>{infoCard.info}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              {infoCard.gid ? <button onClick={() => scrollToGroup(infoCard.gid)} style={{ border: 'none', background: '#0A0A0A', color: '#FFFFFF', borderRadius: 5, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Answer in the form →</button> : null}
              <button onClick={() => { setActiveHotspotId(null); setInfoCard(null); }} style={{ border: '1px solid #C9C7C0', background: '#FFFFFF', color: '#1A1A1A', borderRadius: 5, padding: '10px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Dismiss</button>
            </div>
          </div>
        )}
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

  // Rebrand the stock wireframe scenes with the discovery's profile: a
  // server-built list of [from, to] text swaps (company name, categories,
  // products, copy) applied in ONE alternation pass, longest token first,
  // so nested tokens resolve cleanly and replaced text is never re-matched.
  // Discoveries without a profile (pre-profile records, the uncap demo)
  // render the stock scenes untouched.
  function escapeRegExp(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  function applyProfileSwaps(html, profile) {
    const swaps = (profile && Array.isArray(profile.swaps) ? profile.swaps : [])
      .filter((s) => Array.isArray(s) && typeof s[0] === 'string' && s[0]);
    if (!swaps.length) return html;
    const map = {};
    swaps.forEach(([from, to]) => { if (!(from in map)) map[from] = to == null ? '' : String(to); });
    const keys = Object.keys(map).sort((a, b) => b.length - a.length);
    const re = new RegExp(keys.map(escapeRegExp).join('|'), 'g');
    html = html.replace(re, (m) => escapeText(map[m]));
    // The masthead logo letter sits between tags, so it gets its own
    // markup-anchored swap instead of a text token.
    if (profile.initial) {
      html = html.split('font-size:16px">H</span>').join('font-size:16px">' + escapeText(profile.initial) + '</span>');
    }
    return html;
  }

  // When the discovery has an uploaded client logo, swap every wordmark in
  // the website mocks for the image: the storefront masthead (logo box +
  // brand text), the storefront footer, and the B2B portal sidebar. Runs
  // before applyProfileSwaps so the HARLOW SUPPLY anchors are still intact.
  function applyClientLogo(html, logoUrl) {
    if (!logoUrl) return html;
    const img = (h, extra) => '<img src="' + logoUrl + '" alt="" style="height:' + h + 'px;max-width:200px;object-fit:contain;display:block' + (extra || '') + '"/>';
    // No footer swap: the wireframe footers carry no wordmark by design.
    return html
      .replace(/<span style="width:32px;height:32px;background:#0A0A0A;[^"]*font-size:16px">H<\/span>\s*<span style="font-size:17px;font-weight:800;letter-spacing:-0\.02em">HARLOW SUPPLY<\/span>/g, img(34))
      .replace(/<div style="font-size:14px;font-weight:800;letter-spacing:-0\.01em;padding:0 10px">HARLOW SUPPLY<\/div>/g, '<div style="padding:0 10px">' + img(28) + '</div>');
  }

  // Recolor a WEBSITE WIREFRAME scene (steps 3-6 only; the caller gates on
  // isRichScene, so the Uncap artboards keep their lime). Prime replaces
  // the stock storefront green; accent replaces the stock amber and the
  // in-wireframe lime highlights, and turns the solid call-to-action
  // buttons (Add to cart, Checkout, Find parts, Add all 3) accent with
  // contrast-picked text: white on a dark accent, black on a light one.
  // Header controls (logo box, cart) and selected-state pills stay black.
  function applyPalette(html, palette) {
    if (!palette) return html;
    const ok = (c) => typeof c === 'string' && /^#[0-9A-Fa-f]{6}$/.test(c);
    const prime = ok(palette.prime) ? palette.prime.toUpperCase() : '';
    const accent = ok(palette.accent) ? palette.accent.toUpperCase() : '';
    if (prime) html = html.split('#2F7A47').join(prime);
    if (!accent) return html;
    const yiq = (parseInt(accent.slice(1, 3), 16) * 299 + parseInt(accent.slice(3, 5), 16) * 587 + parseInt(accent.slice(5, 7), 16) * 114) / 1000;
    const fg = yiq >= 145 ? '#0A0A0A' : '#FFFFFF';
    html = html.split('#B8741F').join(accent);
    // Lime badges/promos carry hardcoded dark text; recolor the pair so the
    // text stays in contrast with the new accent background.
    html = html.split('color:#0A0A0A;background:#E8FF4E').join('color:' + fg + ';background:' + accent);
    html = html.split('background:#E8FF4E;color:#0A0A0A').join('background:' + accent + ';color:' + fg);
    html = html.split('#E8FF4E').join(accent);
    // [text-color variant, style tail] pairs pin each swap to one exact
    // button style, so nothing else that is black gets recolored.
    const CTA_TAILS = [
      ['#fff', 'border-radius:5px;padding:9px 0'],      // product-card Add to cart
      ['#fff', 'border-radius:5px;font-size:14px'],     // hero Find parts →
      ['#FFFFFF', 'border-radius:5px;font-size:15px'],  // PDP Add to cart + cart Checkout →
      ['#fff', 'border-radius:5px;font-size:13.5px'],   // Add all 3 to cart
    ];
    for (const [c, tail] of CTA_TAILS) {
      html = html.split('background:#0A0A0A;color:' + c + ';' + tail)
                 .join('background:' + accent + ';color:' + fg + ';' + tail);
    }
    return html;
  }

  // ── Root: resolve auth then render gate or experience ─────────────────
  function Root() {
    const [phase, setPhase] = useState('loading'); // loading | gate | ready | error
    const [company, setCompany] = useState('');
    const [address, setAddress] = useState('');
    const [profile, setProfile] = useState(null);
    const [palette, setPalette] = useState(null);
    const [hasLogo, setHasLogo] = useState(false);
    const [role, setRole] = useState('');
    const [initial, setInitial] = useState(null);
    const [token, setToken] = useState('');
    const [err, setErr] = useState('');

    const loadAnswers = useCallback(async (tok) => {
      const q = '/api/discovery/answers?handle=' + encodeURIComponent(HANDLE) + (tok ? '&token=' + encodeURIComponent(tok) : '');
      const d = await api(q);
      setRole(d.role);
      setCompany(d.company || d.clientName || '');
      setAddress(d.address || '');
      setProfile(d.profile || null);
      setPalette(d.palette || null);
      setHasLogo(!!d.hasLogo);
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
          setAddress(m.address || '');
          setProfile(m.profile || null);
          setPalette(m.palette || null);
          setHasLogo(!!m.hasLogo);
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
    return <Experience role={role} company={company} address={address} profile={profile} palette={palette} hasLogo={hasLogo} initial={initial} token={token}/>;
  }

  ReactDOM.render(<Root/>, document.getElementById('disc-root'));
})();
