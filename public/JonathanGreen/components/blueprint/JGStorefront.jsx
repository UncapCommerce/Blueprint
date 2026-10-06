// Storefront wireframe graphics — Jonathan Green content, navigation, and palette.
// Loaded before BlueprintSections.jsx; BrandMark resolves from window at render time.
const JG = {
  green:'#046A38', deep:'#03502B', yellow:'#FFC72C', ink:'#0E1F15',
  tint:'#EEF5F0', tint2:'#DCEAE1', star:'#E3A008',
  bagBlack:'#1B1B1B', bagBlue:'#1F4E8C', bagYellow:'#E9B824', bagBrown:'#7A4E26', bagGreen:'#2F7D3A',
  bagTan:'#C9A86A', soil:'#5E4026', lawn:'#3F7D2E', lawnLight:'#8DB35A', shade:'#2F5F3A', spreader:'#2C5AA0'
};
const JG_ANN = 'FALL IS THE BEST TIME TO SEED · SHOP BLACK BEAUTY® FALL MAGIC';
const JG_NAV = ['Shop','Learn','About','Support','Guide'];
const jgTile = (c) => `linear-gradient(140deg, ${c}, ${JG.tint})`;
function JGLogo({ h = 16, style }) {
  return <img src="assets/jonathan-green-logo.svg" alt="Jonathan Green" style={{ height:h, width:'auto', display:'block', flexShrink:0, ...style }}/>;
}
function JGBadge({ k, style }) {
  const bg = k==='FALL'||k==='SALE' ? JG.yellow : (k==='NEW'||k==='LIMITED' ? JG.deep : JG.green);
  const fg = k==='FALL'||k==='SALE' ? JG.ink : '#fff';
  return <span style={{ position:'absolute', top:4, left:4, padding:'1px 5px', background:bg, color:fg, borderRadius:2, fontFamily:'var(--font-mono)', fontSize:5.5, fontWeight:800, letterSpacing:'0.04em', ...style }}>{k}</span>;
}
function JGHeader({ active = 0, cart = 2, search = true, size = 'sm' }) {
  const big = size === 'lg';
  return (
    <>
      <div style={{ background:JG.deep, color:'#fff', textAlign:'center', padding:'4px 0', fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, letterSpacing:'0.12em' }}>{JG_ANN}</div>
      <div style={{ display:'flex', alignItems:'center', gap:11, padding: big?'9px 14px':'8px 14px', borderBottom:'1px solid var(--line-1)' }}>
        <JGLogo h={big?20:17}/>
        <div style={{ display:'flex', gap:8, marginLeft:4, flexShrink:0 }}>{JG_NAV.map((x,i)=>(<span key={x} style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, color:i===active?JG.green:'var(--fg-3)', whiteSpace:'nowrap' }}>{x}</span>))}</div>
        <span style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:7, minWidth:0, flex:'0 1 auto' }}>
          {search && <span style={{ flex:'1 1 60px', minWidth:0, maxWidth:118, height:18, borderRadius:999, border:'1px solid var(--line-2)', display:'flex', alignItems:'center', gap:4, padding:'0 9px', fontFamily:'var(--font-mono)', fontSize:7, color:'var(--fg-3)', whiteSpace:'nowrap', overflow:'hidden' }}><span style={{ fontSize:8, flexShrink:0 }}>⌕</span><span style={{ minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>Search grass seed…</span></span>}
          <span style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:800, color:JG.ink, background:JG.yellow, padding:'3px 8px', borderRadius:3, whiteSpace:'nowrap', flexShrink:0 }}>Cart {cart}</span>
        </span>
      </div>
    </>
  );
}

function GfxChrome({ children }) {
  return (
    <div style={{ background:'var(--uc-paper)', border:'1px solid var(--line-1)', borderRadius:5, overflow:'hidden' }}>
      <JGHeader active={0} cart={2} size="lg"/>
      {children}
    </div>
  );
}
function GfxMegaNav() {
  const cols = [
    { h:'Grass Seed', items:['Black Beauty® Ultra','Black Beauty® Fall Magic','Dense Shade','Heavy Traffic'] },
    { h:'Lawn Fertilizers', items:['Veri-Green Weed & Feed','Starter Fertilizer','Nitrogen Rich','Organic Lawn Food'] },
    { h:'Soil Amendments', items:['Mag-I-Cal® Plus','Love Your Soil®','Soil pH Test Kit'] },
    { h:'Featured', items:['Black Beauty® Fall Magic','Lawn Care Bundles','Lawn Product Quiz'] }
  ];
  return (
    <GfxChrome>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:1, background:'var(--line-1)' }}>
        {cols.map((c,ci)=>(
          <div key={ci} style={{ background:'var(--uc-paper)', padding:'12px 13px 16px', display:'flex', flexDirection:'column', gap:7 }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:8, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color: ci===3?JG.green:'var(--fg-3)' }}>{c.h}</div>
            {c.items.map((it,ri)=>(<span key={ri} style={{ fontFamily:'var(--font-display)', fontWeight:ci===3&&ri===0?700:500, fontSize:10.5, letterSpacing:'-0.01em', color: ci===0&&ri===0?JG.green:'var(--fg-2)', display:'flex', alignItems:'center', gap:5 }}>{ci===0&&ri===0 && <span style={{ width:14, height:3, background:JG.yellow }}/>}{it}</span>))}
          </div>
        ))}
      </div>
    </GfxChrome>
  );
}

function GfxCollection() {
  const prods = [
    ['Black Beauty® Ultra','$12.99','1 lb',JG.bagBlack,'BEST SELLER','4.8','1,212'],
    ['Black Beauty® Fall Magic','$21.99','3 lb',JG.bagGreen,'NEW','4.9','164'],
    ['Dense Shade','$12.99','1 lb',JG.shade,null,'4.7','308'],
    ['Heavy Traffic','$24.99','3 lb',JG.lawn,null,'4.7','209'],
    ['Blue Panther® Bluegrass','$27.99','3 lb',JG.bagBlue,null,'4.6','98'],
    ['Founders Reserve','$27.99','3 lb',JG.bagTan,'LIMITED','4.9','77']
  ];
  const facets = [
    { h:'Category', items:[['Grass Seed',true],['Southern Lawn',false],['Lawn Fertilizers',false],['Soil Amendments',false],['Weed Control',false]] },
    { h:'Sun exposure', items:[['Full sun',true],['Sun & shade',true],['Dense shade',false]] },
    { h:'Grass type', items:[['Tall fescue',true],['Kentucky bluegrass',false],['Perennial rye',false]] }
  ];
  const Check = ({ on }) => (<span style={{ width:9, height:9, borderRadius:2, background:on?JG.green:'var(--uc-paper)', border:`1px solid ${on?JG.green:'var(--line-2)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{on && <svg width="6" height="6" viewBox="0 0 12 12" fill="none"><path d="M2 6 L5 9 L10 3" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}</span>);
  return (
    <div style={{ background:'var(--uc-paper)', border:'1px solid var(--line-1)', borderRadius:5, overflow:'hidden' }}>
      <JGHeader active={0} cart={0}/>
      <div style={{ padding:'11px 14px 9px', display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:10 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:7, letterSpacing:'0.1em', color:'var(--fg-3)' }}>HOME / SHOP / GRASS SEED</span>
          <span style={{ fontFamily:'var(--font-hero)', fontWeight:700, fontSize:19, letterSpacing:'-0.035em', color:'var(--fg-1)' }}>Grass Seed</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:7, color:'var(--fg-3)' }}>24 results</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, color:'var(--fg-1)', border:'1px solid var(--line-2)', borderRadius:3, padding:'3px 7px' }}>Sort: Best ▾</span>
        </div>
      </div>
      <div style={{ padding:'0 14px 10px', display:'flex', gap:5, flexWrap:'wrap', alignItems:'center' }}>
        {['Full sun ✕','Sun & shade ✕','Tall fescue ✕'].map((c,i)=>(<span key={i} style={{ fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, color:JG.deep, background:JG.tint, border:`1px solid ${JG.tint2}`, borderRadius:999, padding:'2px 8px' }}>{c}</span>))}
        <span style={{ fontFamily:'var(--font-mono)', fontSize:7, color:JG.green, fontWeight:700 }}>Clear all</span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'104px minmax(0,1fr)', borderTop:'1px solid var(--line-1)' }}>
        <div style={{ borderRight:'1px solid var(--line-1)', background:JG.tint, padding:'11px 10px', display:'flex', flexDirection:'column', gap:11 }}>
          {facets.map((f,fi)=>(
            <div key={fi} style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, letterSpacing:'0.1em', color:'var(--fg-3)' }}>{f.h.toUpperCase()}</div>
              {f.items.map(([l,on],i)=>(<div key={i} style={{ display:'flex', gap:6, alignItems:'center' }}><Check on={on}/><span style={{ fontFamily:'var(--font-mono)', fontSize:7.5, color:on?'var(--fg-1)':'var(--fg-3)', fontWeight:on?700:400, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{l}</span></div>))}
            </div>
          ))}
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, letterSpacing:'0.1em', color:'var(--fg-3)' }}>PRICE</div>
            <div style={{ height:3, background:JG.tint2, borderRadius:2, position:'relative' }}><span style={{ position:'absolute', left:'15%', right:'35%', top:0, bottom:0, background:JG.green, borderRadius:2 }}/><span style={{ position:'absolute', left:'15%', top:'50%', transform:'translate(-50%,-50%)', width:7, height:7, borderRadius:999, background:'var(--uc-paper)', border:`1.5px solid ${JG.green}` }}/><span style={{ position:'absolute', left:'65%', top:'50%', transform:'translate(-50%,-50%)', width:7, height:7, borderRadius:999, background:'var(--uc-paper)', border:`1.5px solid ${JG.green}` }}/></div>
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:6.5, color:'var(--fg-3)' }}><span>$12</span><span>$150</span></div>
          </div>
        </div>
        <div style={{ padding:10, display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:8 }}>
          {prods.map((p,i)=>(
            <div key={i} style={{ minWidth:0, border:'1px solid var(--line-1)', borderRadius:3, padding:6, display:'flex', flexDirection:'column', gap:4, background:'var(--uc-paper)' }}>
              <div style={{ aspectRatio:'1/1', background:jgTile(p[3]), borderRadius:2, position:'relative' }}>
                {p[4] && <JGBadge k={p[4]}/>}
                <span style={{ position:'absolute', bottom:4, right:4, width:15, height:15, borderRadius:999, background:JG.yellow, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:JG.ink, boxShadow:'0 1px 3px rgba(0,0,0,0.18)' }}>＋</span>
              </div>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:8.5, letterSpacing:'-0.01em', color:'var(--fg-1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p[0]}</span>
              <div style={{ display:'flex', alignItems:'center', gap:3 }}><span style={{ fontFamily:'var(--font-mono)', fontSize:6, color:JG.star }}>★★★★★</span><span style={{ fontFamily:'var(--font-mono)', fontSize:6, color:'var(--fg-3)' }}>{p[5]} ({p[6]})</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}><span style={{ fontFamily:'var(--font-mono)', fontSize:9, fontWeight:700, color:'var(--fg-1)' }}>From {p[1]}</span><span style={{ fontFamily:'var(--font-mono)', fontSize:6, color:'var(--fg-3)' }}>{p[2]}</span></div>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:6, fontWeight:700, color:JG.green }}>Safe for kids & pets ✓</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:'9px 14px', borderTop:'1px solid var(--line-1)', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
        {['‹','1','2','3','›'].map((n,i)=>(<span key={i} style={{ minWidth:15, textAlign:'center', fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, color:n==='1'?'#fff':'var(--fg-2)', background:n==='1'?JG.green:'transparent', borderRadius:2, padding:'2px 4px' }}>{n}</span>))}
      </div>
    </div>
  );
}

function GfxCart() {
  const lines=[['Black Beauty® Ultra · 7 lb','1','$39.99','$39.99'],['Veri-Green Starter · 5,000 sq ft','1','$39.99','$39.99'],['Love Your Soil® · 5,000 sq ft','1','$32.99','$32.99']];
  const grid=[['Veri-Green Weed & Feed','$35.99',JG.bagYellow,'BEST'],['Veri-Green Starter','$19.99',JG.bagBlue,null],['Nitrogen Rich','$29.99',JG.bagGreen,null],['Crabgrass Preventer','$39.99',JG.spreader,'NEW'],['Organic Lawn Food','$34.99',JG.soil,null],['Corn Gluten Weed Preventer','$49.99',JG.bagTan,null]];
  return (
    <div style={{ position:'relative', background:'var(--uc-paper)', border:'1px solid var(--line-1)', borderRadius:5, overflow:'hidden' }}>
      <div>
        <JGHeader active={0} cart={3} search={false}/>
        <div style={{ padding:'11px 14px 9px', display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:7, letterSpacing:'0.1em', color:'var(--fg-3)' }}>HOME / SHOP / LAWN FERTILIZERS</span>
            <span style={{ fontFamily:'var(--font-hero)', fontWeight:700, fontSize:19, letterSpacing:'-0.035em', color:'var(--fg-1)' }}>Lawn Fertilizers</span>
          </div>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:7.5, color:'var(--fg-3)' }}>18 products · Sort ▾</span>
        </div>
        <div style={{ display:'flex', gap:6, padding:'0 14px 11px' }}>{['Weed & Feed','Starter','Organic','In stock'].map((f,i)=>(<span key={f} style={{ padding:'3px 9px', borderRadius:999, border:'1px solid', borderColor:i===0?JG.green:'var(--line-1)', background:i===0?JG.green:'transparent', color:i===0?'#fff':'var(--fg-2)', fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700 }}>{f}</span>))}</div>
        <div style={{ padding:'0 14px 14px', display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:9 }}>
          {grid.map((p,i)=>(
            <div key={i} style={{ minWidth:0, display:'flex', flexDirection:'column', gap:5 }}>
              <div style={{ aspectRatio:'1/1', borderRadius:3, background:jgTile(p[2]), position:'relative' }}>{p[3] && <JGBadge k={p[3]} style={{ top:5, left:5, padding:'1px 6px' }}/>}<span style={{ position:'absolute', bottom:5, right:5, width:16, height:16, borderRadius:999, background:JG.yellow, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:JG.ink }}>＋</span></div>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:8.5, letterSpacing:'-0.01em', color:'var(--fg-1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p[0]}</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:8, fontWeight:700, color:'var(--fg-1)' }}>From {p[1]}</span>
            </div>
          ))}
        </div>
      </div>
      <div aria-hidden="true" style={{ position:'absolute', inset:0, background:'rgba(3,40,22,0.46)' }}/>
      <div style={{ position:'absolute', top:14, right:14, bottom:14, width:'54%', background:'var(--uc-paper)', border:'1px solid var(--line-2)', borderRadius:6, boxShadow:'0 18px 40px -16px rgba(10,10,10,0.5)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'9px 13px', borderBottom:'1px solid var(--line-1)', background:JG.tint, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:12 }}>Your cart</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:8.5, color:'var(--fg-3)' }}>3 ITEMS · ✕</span>
        </div>
        <div style={{ padding:'7px 13px', borderBottom:'1px solid var(--line-1)' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--fg-1)', marginBottom:5 }}>🚚 You&rsquo;ve unlocked <span style={{ color:JG.green, fontWeight:700 }}>FREE shipping</span></div>
          <div style={{ height:4, background:JG.tint2, borderRadius:999, overflow:'hidden' }}><span style={{ display:'block', width:'100%', height:'100%', background:JG.green }}/></div>
        </div>
        {lines.map((l,i)=>(
          <div key={i} style={{ padding:'8px 13px', borderBottom:'1px solid var(--line-1)', display:'grid', gridTemplateColumns:'26px 1fr auto', gap:9, alignItems:'center' }}>
            <div style={{ width:26, height:26, borderRadius:3, background:jgTile(i===0?JG.bagBlack:(i===1?JG.bagBlue:JG.soil)) }}/>
            <div style={{ minWidth:0 }}><div style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:10, color:'var(--fg-1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{l[0]}</div><div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--fg-3)' }}>qty {l[1]} · <span style={{ color:JG.green, fontWeight:700 }}>{l[2]}</span></div></div>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:9.5, fontWeight:700 }}>{l[3]}</span>
          </div>
        ))}
        <div style={{ padding:'8px 13px', background:JG.tint, borderBottom:'1px solid var(--line-1)', display:'flex', flexDirection:'column', gap:5 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, letterSpacing:'0.1em', color:'var(--fg-3)' }}>PAIRS WELL WITH</div>
          {[['Mag-I-Cal® Plus · 5,000 sq ft','$35.99',JG.bagBrown],['Hand Spreader','$24.99',JG.spreader],['Soil pH Test Kit','$14.99',JG.lawnLight]].map((u,i)=>(<div key={i} style={{ display:'grid', gridTemplateColumns:'18px 1fr auto', gap:7, alignItems:'center' }}><div style={{ width:18, height:18, borderRadius:3, background:jgTile(u[2]) }}/><span style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:8.5, color:'var(--fg-1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{u[0]}</span><span style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:800, color:JG.ink, background:JG.yellow, padding:'2px 6px', borderRadius:2 }}>+ {u[1]}</span></div>))}
        </div>
        <div style={{ padding:'10px 13px', background:JG.green, color:'#fff', borderBottom:'1px solid var(--line-1)', display:'flex', gap:9, alignItems:'center' }}>
          <span style={{ width:18, height:18, borderRadius:999, border:`2px solid ${JG.yellow}`, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ width:7, height:7, borderRadius:999, background:JG.yellow }}/></span>
          <div style={{ flex:1, minWidth:0 }}><div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:9.5, color:'#fff' }}>Bundle & save <span style={{ color:JG.yellow }}>−15%</span></div><div style={{ fontFamily:'var(--font-mono)', fontSize:7, color:'rgba(255,255,255,0.78)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>Grass Seed & Fertilizer Bundle · seed + starter + soil</div></div>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:800, color:JG.ink, background:JG.yellow, padding:'4px 8px', borderRadius:3 }}>ADD</span>
        </div>
        <div style={{ marginTop:'auto', padding:'10px 13px', borderTop:'1px solid var(--line-1)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:8.5, color:'var(--fg-3)', marginBottom:3 }}><span>Subtotal</span><span>$112.97</span></div>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:8.5, color:JG.green, marginBottom:7 }}><span>Bundle savings</span><span>−$16.95</span></div>
          <span style={{ display:'block', textAlign:'center', padding:'9px', background:JG.yellow, color:JG.ink, borderRadius:3, fontSize:10, fontWeight:800 }}>Checkout · $96.02</span>
        </div>
      </div>
    </div>
  );
}

function GfxPDP() {
  const Btn = ({ children, outline, style }) => (<span style={{ padding:'8px', textAlign:'center', borderRadius:3, fontFamily:'var(--font-display)', fontSize:9.5, fontWeight:800, background: outline?'transparent':JG.yellow, color: outline?JG.green:JG.ink, border: outline?`1px solid ${JG.green}`:'none', ...style }}>{children}</span>);
  return (
    <div style={{ background:'var(--uc-paper)', border:'1px solid var(--line-1)', borderRadius:5, overflow:'hidden' }}>
      <JGHeader active={0} cart={2} search={false}/>
      <div style={{ padding:'8px 14px 0', fontFamily:'var(--font-mono)', fontSize:7, letterSpacing:'0.08em', color:'var(--fg-3)' }}>HOME / SHOP / GRASS SEED</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:13, padding:'9px 14px 13px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'26px 1fr', gap:7 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>{[JG.bagBlack,JG.lawn,JG.soil,JG.bagTan].map((c,i)=>(<div key={i} style={{ aspectRatio:'1/1', borderRadius:3, background:jgTile(c), border:i===0?`1.5px solid ${JG.green}`:'1px solid var(--line-1)' }}/>))}</div>
          <div style={{ aspectRatio:'4/4.6', borderRadius:4, background:`radial-gradient(120% 90% at 65% 20%, #2A2A2A, ${JG.bagBlack} 55%, ${JG.deep})`, position:'relative', overflow:'hidden' }}>
            <span style={{ position:'absolute', top:8, left:8, padding:'2px 7px', background:JG.green, color:'#fff', borderRadius:999, fontFamily:'var(--font-mono)', fontSize:6, fontWeight:800, letterSpacing:'0.06em' }}>BEST SELLER</span>
            <div style={{ position:'absolute', left:'14%', right:'14%', top:'22%', bottom:'14%', borderRadius:6, border:'1.5px solid rgba(255,255,255,0.35)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, padding:8 }}>
              <span style={{ fontFamily:'var(--font-hero)', fontWeight:800, fontSize:12, letterSpacing:'-0.03em', lineHeight:1, color:'#fff', textAlign:'center' }}>BLACK<br/>BEAUTY®</span>
              <span style={{ width:28, height:2, background:JG.yellow }}/>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:6, fontWeight:700, letterSpacing:'0.14em', color:'rgba(255,255,255,0.8)' }}>ULTRA</span>
            </div>
            <span style={{ position:'absolute', bottom:8, left:8, display:'flex', gap:4 }}>{[0,1,2,3].map(i=>(<span key={i} style={{ width:5, height:5, borderRadius:999, background:i===0?JG.yellow:'rgba(255,255,255,0.45)' }}/>))}</span>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, letterSpacing:'0.12em', color:JG.green }}>GRASS SEED · IN STOCK · SAFE FOR KIDS & PETS</div>
          <div style={{ fontFamily:'var(--font-hero)', fontWeight:700, fontSize:21, letterSpacing:'-0.04em', lineHeight:0.9, color:'var(--fg-1)' }}>BLACK BEAUTY®<br/><span style={{ fontFamily:'var(--font-serif)', fontWeight:400, fontSize:16 }}>Ultra Grass Seed</span></div>
          <div style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'var(--font-mono)', fontSize:8 }}><span style={{ color:JG.star }}>★★★★★</span><span style={{ color:'var(--fg-3)' }}>4.8 · 1,212 reviews</span></div>
          <div style={{ display:'flex', alignItems:'baseline', gap:6 }}><span style={{ fontFamily:'var(--font-hero)', fontWeight:800, fontSize:16, letterSpacing:'-0.03em', color:'var(--fg-1)' }}>$39.99</span><span style={{ fontFamily:'var(--font-mono)', fontSize:7, color:'var(--fg-3)' }}>7 lb bag · tall fescue, Kentucky bluegrass & perennial rye</span></div>
          <div style={{ marginTop:1 }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:6.5, fontWeight:700, letterSpacing:'0.1em', color:'var(--fg-3)', marginBottom:4 }}>WEIGHT</div>
            <div style={{ display:'flex', gap:4 }}>{[['1 lb',false],['3 lb',false],['7 lb',true],['25 lb',false],['50 lb',false]].map(([l,on],i)=>(<span key={i} style={{ flex:1, padding:'5px 2px', textAlign:'center', border:'1px solid', borderColor:on?JG.green:'var(--line-1)', borderRadius:3, fontFamily:'var(--font-mono)', fontSize:6, fontWeight:700, color:on?'#fff':'var(--fg-2)', background:on?JG.green:'transparent', whiteSpace:'nowrap' }}>{l}</span>))}</div>
          </div>
          <div style={{ marginTop:2 }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:6.5, fontWeight:700, letterSpacing:'0.1em', color:'var(--fg-3)', marginBottom:4 }}>PURCHASE OPTIONS</div>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {[['One-time purchase','$39.99',false,''],['Subscribe & save 10%','$35.99',true,'Deliver every 8 weeks · skip or cancel anytime']].map(([l,pr,on,note],i)=>(
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:6, padding:'6px 7px', border:'1px solid', borderColor:on?JG.green:'var(--line-1)', borderRadius:3, background:on?JG.tint:'var(--uc-paper)' }}>
                  <span style={{ width:9, height:9, marginTop:1, borderRadius:999, border:`1.5px solid ${on?JG.green:'var(--line-2)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{on && <span style={{ width:4, height:4, borderRadius:999, background:JG.green }}/>}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', gap:6 }}>
                      <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:8.5, color:'var(--fg-1)' }}>{l}</span>
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:8, fontWeight:700, color:on?JG.green:'var(--fg-1)' }}>{pr}</span>
                    </div>
                    {note && <div style={{ fontFamily:'var(--font-mono)', fontSize:6.5, color:'var(--fg-3)', marginTop:2 }}>{note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:2 }}>
            <div style={{ display:'flex', gap:6 }}>
              <div style={{ display:'flex', alignItems:'center', border:`1px solid ${JG.green}`, borderRadius:3, overflow:'hidden' }}>
                <span style={{ padding:'0 8px', fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, color:'var(--fg-2)' }}>–</span>
                <span style={{ padding:'8px 4px', minWidth:18, textAlign:'center', fontFamily:'var(--font-mono)', fontSize:9, fontWeight:700, color:'var(--fg-1)', borderLeft:'1px solid var(--line-1)', borderRight:'1px solid var(--line-1)' }}>1</span>
                <span style={{ padding:'0 8px', fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, color:'var(--fg-2)' }}>+</span>
              </div>
              <Btn style={{ flex:1 }}>Subscribe · $35.99</Btn>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:3, flexWrap:'wrap' }}>{['✓ Safe for kids & pets','✓ Establishes quickly','✓ Family-owned since 1881'].map(t=>(<span key={t} style={{ fontFamily:'var(--font-mono)', fontSize:6.5, fontWeight:700, color:'var(--fg-3)' }}>{t}</span>))}</div>
          <div style={{ marginTop:7, paddingTop:9, borderTop:'1px solid var(--line-1)' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:6.5, fontWeight:700, letterSpacing:'0.1em', color:'var(--fg-3)', marginBottom:6 }}>FREQUENTLY BOUGHT TOGETHER</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
              {[['Black Beauty® Ultra','$39.99',JG.bagBlack],['Veri-Green Starter','$19.99',JG.bagBlue],['Love Your Soil®','$32.99',JG.soil]].map((p,i)=>(
                <React.Fragment key={i}>
                  {i>0 && <span style={{ fontFamily:'var(--font-hero)', fontWeight:800, fontSize:11, color:'var(--fg-3)', flexShrink:0 }}>+</span>}
                  <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:3 }}>
                    <div style={{ aspectRatio:'1/0.82', borderRadius:3, background:jgTile(p[2]) }}/>
                    <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:6.5, letterSpacing:'-0.01em', color:'var(--fg-1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p[0]}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:6.5, fontWeight:700, color:'var(--fg-1)' }}>{p[1]}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, color:'var(--fg-3)', whiteSpace:'nowrap' }}>Bundle <span style={{ fontFamily:'var(--font-hero)', fontWeight:800, fontSize:12, color:'var(--fg-1)' }}>$84.99</span></span>
              <span style={{ flex:1, padding:'6px', textAlign:'center', background:JG.green, color:'#fff', borderRadius:3, fontFamily:'var(--font-display)', fontSize:8.5, fontWeight:700 }}>Add all 3</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'var(--line-1)', borderTop:'1px solid var(--line-1)' }}>
        <div style={{ background:'var(--uc-paper)', padding:'11px 14px' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, letterSpacing:'0.1em', color:'var(--fg-3)', marginBottom:7 }}>SPECIFICATIONS</div>
          {[['Grass type','Tall fescue · KBG · Rye'],['Sun exposure','Full sun to partial shade'],['Bag size','7 lb'],['Best for','New lawns & overseeding']].map((r,i)=>(<div key={i} style={{ display:'flex', justifyContent:'space-between', gap:8, padding:'4px 0', borderTop:i?'1px solid var(--line-1)':'none', fontFamily:'var(--font-mono)', fontSize:8 }}><span style={{ color:'var(--fg-3)', whiteSpace:'nowrap' }}>{r[0]}</span><span style={{ color:'var(--fg-1)', fontWeight:700, textAlign:'right' }}>{r[1]}</span></div>))}
        </div>
        <div style={{ background:JG.tint, padding:'11px 14px' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, letterSpacing:'0.1em', color:'var(--fg-3)', marginBottom:7 }}>WHY HOMEOWNERS CHOOSE IT</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>{['Our most popular mixture — establishes quickly and grows thick, dark green.','Deep roots that tolerate heat and survive drought.','Six generations of turfgrass breeding on our research farm.'].map((t,i)=>(<div key={i} style={{ display:'grid', gridTemplateColumns:'12px 1fr', gap:7, alignItems:'start' }}><span style={{ width:10, height:10, borderRadius:999, background:JG.yellow, marginTop:1, display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="6" height="6" viewBox="0 0 12 12" fill="none"><path d="M2 6 L5 9 L10 3" stroke={JG.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span style={{ fontFamily:'var(--font-serif)', fontSize:9, lineHeight:1.35, color:'var(--fg-2)' }}>{t}</span></div>))}</div>
        </div>
      </div>
      <div style={{ padding:'11px 14px', borderTop:'1px solid var(--line-1)', display:'flex', gap:10, alignItems:'center', background:'var(--uc-paper)' }}>
        <span style={{ fontFamily:'var(--font-hero)', fontWeight:800, fontSize:24, letterSpacing:'-0.04em', color:'var(--fg-1)' }}>4.8</span>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:JG.star }}>★★★★★</div>
          <div style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontSize:9, lineHeight:1.35, color:'var(--fg-2)', marginTop:2 }}>“Such a dramatic color difference — I knew I wanted a whole lawn of Black Beauty Ultra.” — Mark H.</div>
        </div>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, color:'var(--fg-3)', whiteSpace:'nowrap' }}>VERIFIED ✓</span>
      </div>
      <div style={{ padding:'11px 14px', borderTop:'1px solid var(--line-1)', background:JG.tint }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, letterSpacing:'0.1em', color:'var(--fg-3)', marginBottom:8 }}>COMPLETE YOUR LAWN PLAN</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:7 }}>{[['Veri-Green Starter','$19.99',JG.bagBlue],['Love Your Soil®','$32.99',JG.soil],['Mag-I-Cal® Plus','$35.99',JG.bagBrown],['Hand Spreader','$24.99',JG.spreader]].map((p,i)=>(<div key={i} style={{ display:'flex', flexDirection:'column', gap:4, minWidth:0 }}><div style={{ aspectRatio:'1/1', borderRadius:3, background:jgTile(p[2]) }}/><span style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:7.5, color:'var(--fg-1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p[0]}</span><span style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, color:'var(--fg-1)' }}>{p[1]}</span></div>))}</div>
      </div>
    </div>
  );
}

function GfxPortal() {
  const rows=[['#PO-3121','3 pallets','Approved'],['#PO-3120','48 bags','Picking'],['#PO-3119','6 pallets','Pending'],['#PO-3118','24 bags','Shipped'],['#PO-3117','2 pallets','Delivered'],['#PO-3116','96 bags','Delivered']];
  const nav=[['◧','Dashboard',true],['▤','Orders',false],['♡','Saved lists',false],['◫','Invoices',false],['⚙','Team',false]];
  return (
    <div style={{ background:'var(--uc-paper)', border:'1px solid var(--line-1)', borderRadius:5, overflow:'hidden' }}>
      <div style={{ background:JG.deep, color:'#fff', textAlign:'center', padding:'4px 0', fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, letterSpacing:'0.12em' }}>RETAILER ORDERING PORTAL · NET-30 TERMS ACTIVE</div>
      <div style={{ display:'flex', alignItems:'center', gap:11, padding:'8px 14px', borderBottom:'1px solid var(--line-1)' }}>
        <JGLogo h={17}/>
        <span style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:7 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, color:'var(--fg-3)' }}>GREEN THUMB GARDEN CENTER</span>
          <span style={{ width:18, height:18, borderRadius:999, background:`linear-gradient(135deg, ${JG.lawnLight}, ${JG.green})`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-mono)', fontSize:7, fontWeight:800, color:'#fff' }}>G</span>
        </span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'112px 1fr', gap:1, background:'var(--line-1)' }}>
        <div style={{ background:JG.tint, padding:'11px 10px', display:'flex', flexDirection:'column', gap:3 }}>
          {nav.map((n,i)=>(<div key={i} style={{ display:'flex', alignItems:'center', gap:7, padding:'5px 7px', borderRadius:3, background:n[2]?JG.green:'transparent' }}><span style={{ fontSize:9, color:n[2]?JG.yellow:'var(--fg-3)' }}>{n[0]}</span><span style={{ fontFamily:'var(--font-mono)', fontSize:8, fontWeight:700, color:n[2]?'#fff':'var(--fg-2)' }}>{n[1]}</span></div>))}
          <div style={{ marginTop:'auto', padding:'8px 7px 0' }}><div style={{ fontFamily:'var(--font-mono)', fontSize:6.5, color:'var(--fg-3)', lineHeight:1.5 }}>CREDIT LINE<br/><span style={{ fontFamily:'var(--font-hero)', fontWeight:800, fontSize:13, letterSpacing:'-0.02em', color:'var(--fg-1)' }}>$42k</span> open</div></div>
        </div>
        <div style={{ background:'var(--uc-paper)', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'11px 14px 9px', display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:7, letterSpacing:'0.1em', color:'var(--fg-3)' }}>WELCOME BACK</div>
              <div style={{ fontFamily:'var(--font-hero)', fontWeight:700, fontSize:17, letterSpacing:'-0.035em', color:'var(--fg-1)' }}>Maria</div>
            </div>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:800, color:JG.ink, background:JG.yellow, padding:'4px 9px', borderRadius:3 }}>+ New order</span>
          </div>
          <div style={{ padding:'0 14px 10px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {[['9','OPEN ORDERS'],['4','SAVED LISTS'],['$186k','YTD SPEND']].map((s,i)=>(<div key={i} style={{ border:'1px solid var(--line-1)', borderRadius:4, padding:'8px 10px' }}><div style={{ fontFamily:'var(--font-hero)', fontWeight:800, fontSize:18, letterSpacing:'-0.03em', color:'var(--fg-1)' }}>{s[0]}</div><div style={{ fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, letterSpacing:'0.08em', color:'var(--fg-3)', marginTop:2 }}>{s[1]}</div></div>))}
          </div>
          <div style={{ padding:'0 14px 12px' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, letterSpacing:'0.1em', color:'var(--fg-3)', paddingBottom:6 }}>RECENT ORDERS · QUICK REORDER</div>
            {rows.map((r,i)=>(<div key={i} style={{ display:'grid', gridTemplateColumns:'70px 1fr auto auto', gap:8, alignItems:'center', padding:'6px 0', borderTop:'1px solid var(--line-1)' }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:9, fontWeight:600, color:'var(--fg-1)' }}>{r[0]}</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:8.5, color:'var(--fg-3)' }}>{r[1]}</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, color: r[2]==='Approved'?'#fff':'var(--fg-3)', background: r[2]==='Approved'?JG.green:'transparent', border: r[2]==='Approved'?'none':'1px solid var(--line-1)', padding:'2px 6px', borderRadius:2 }}>{r[2]}</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:8, fontWeight:800, color:JG.ink, background:JG.yellow, padding:'2px 7px', borderRadius:2 }}>Reorder</span>
            </div>))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GfxHomepage() {
  const mega = [
    { h:'Shop', items:['Grass Seed','Southern Lawn','Fertilizers','Soil Amendments','Weed Control','Natural Lawn'] },
    { h:'More', items:['Insect Control','Spreaders','Bundles','Accessories'] },
    { h:'Featured', items:['Fall Magic','Lawn Quiz','Store Locator','Spreader Settings'] }
  ];
  const lines = ['BLACK BEAUTY®','BLUE PANTHER®','VERI-GREEN','MAG-I-CAL®','TURF-PRO™'];
  const feat = [['Black Beauty® Ultra','From $12.99',JG.bagBlack,'BEST'],['Love Your Soil®','From $32.99',JG.soil,null],['Veri-Green Starter','From $19.99',JG.bagBlue,'NEW'],['Fall Magic','From $21.99',JG.bagGreen,'FALL']];
  return (
    <div style={{ background:'var(--uc-paper)', border:'1px solid var(--line-1)', borderRadius:5, overflow:'hidden' }}>
      <div style={{ background:JG.deep, color:'#fff', textAlign:'center', padding:'4px 0', fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, letterSpacing:'0.12em' }}>{JG_ANN}</div>
      <div style={{ display:'flex', alignItems:'center', gap:11, padding:'8px 14px', borderBottom:'1px solid var(--line-1)' }}>
        <JGLogo h={19}/>
        <div style={{ display:'flex', gap:9, marginLeft:6, flexShrink:0 }}>{JG_NAV.map((x,i)=>(<span key={x} style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, color:i===0?JG.green:'var(--fg-3)', position:'relative', whiteSpace:'nowrap' }}>{x}{i===0 && <span style={{ position:'absolute', left:0, right:0, bottom:-9, height:2, background:JG.yellow }}/>}</span>))}</div>
        <span style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:7, minWidth:0 }}>
          <span style={{ flex:'1 1 60px', minWidth:0, maxWidth:120, height:18, borderRadius:999, border:'1px solid var(--line-2)', display:'flex', alignItems:'center', gap:4, padding:'0 9px', fontFamily:'var(--font-mono)', fontSize:7, color:'var(--fg-3)', whiteSpace:'nowrap', overflow:'hidden' }}><span style={{ fontSize:8, flexShrink:0 }}>⌕</span><span style={{ minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>Search grass seed…</span></span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:800, color:JG.ink, background:JG.yellow, padding:'3px 8px', borderRadius:3, flexShrink:0 }}>Cart 2</span>
        </span>
      </div>
      <div style={{ position:'relative', height:188, background:`linear-gradient(100deg, #03361E 0%, ${JG.green} 55%, #2F8F4E 135%)`, overflow:'hidden' }}>
        <svg viewBox="0 0 200 90" preserveAspectRatio="none" style={{ position:'absolute', right:-10, bottom:-6, width:220, opacity:0.18 }}><path d="M20 90 C 30 60, 34 40, 36 10 M50 90 C 56 66, 70 50, 84 30 M80 90 C 84 70, 86 50, 82 22 M112 90 C 118 72, 134 60, 150 44 M140 90 C 142 70, 148 48, 158 26 M172 90 C 176 74, 186 60, 198 50" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/></svg>
        <div style={{ position:'absolute', left:'64%', right:12, top:0, bottom:0, paddingLeft:12, display:'flex', flexDirection:'column', justifyContent:'center', gap:6, minWidth:0 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:6.5, fontWeight:700, letterSpacing:'0.12em', color:JG.yellow }}>SINCE 1881</span>
          <span style={{ fontFamily:'var(--font-hero)', fontWeight:800, fontSize:'clamp(15px, 2vw, 20px)', letterSpacing:'-0.04em', lineHeight:0.92, color:'#fff' }}>Great lawns<br/><span style={{ fontFamily:'var(--font-serif)', fontWeight:400 }}>start here.</span></span>
          <span style={{ alignSelf:'flex-start', marginTop:2, padding:'5px 10px', background:JG.yellow, color:JG.ink, borderRadius:999, fontFamily:'var(--font-mono)', fontSize:7, fontWeight:800, whiteSpace:'nowrap' }}>Shop grass seed →</span>
        </div>
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'64%', background:'rgba(248,250,247,0.97)', borderRight:'1px solid var(--line-2)', boxShadow:'10px 0 30px -16px rgba(0,0,0,0.5)', padding:'14px 14px', display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:10 }}>
          {mega.map((col,ci)=>(
            <div key={ci} style={{ display:'flex', flexDirection:'column', gap:6, minWidth:0 }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, letterSpacing:'0.1em', color:ci===2?JG.green:'var(--fg-3)', paddingBottom:4, borderBottom:`1px solid ${JG.tint2}` }}>{col.h.toUpperCase()}</div>
              {col.items.map((it,ii)=>(<span key={ii} style={{ fontFamily:'var(--font-display)', fontWeight:ii===0&&ci===0?700:500, fontSize:8.5, letterSpacing:'-0.01em', color:ii===0&&ci===0?JG.green:'var(--fg-2)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{it}</span>))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:JG.green, padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, letterSpacing:'0.08em', color:JG.yellow, whiteSpace:'nowrap', flexShrink:0 }}>LAWN QUIZ</span>
        {['Region','Sun / shade','Lawn size'].map((f)=>(<span key={f} style={{ flex:'1 1 0', minWidth:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'space-between', height:22, background:'var(--uc-paper)', borderRadius:4, padding:'0 9px', fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, color:'var(--fg-2)', whiteSpace:'nowrap' }}>{f}<span style={{ color:'var(--fg-3)' }}>▾</span></span>))}
        <span style={{ display:'inline-flex', alignItems:'center', height:22, padding:'0 12px', background:JG.yellow, color:JG.ink, borderRadius:4, fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:800, whiteSpace:'nowrap', flexShrink:0 }}>Take the quiz →</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, padding:'11px 16px', borderBottom:'1px solid var(--line-1)', overflow:'hidden' }}>{lines.map(b=>(<span key={b} style={{ fontFamily:'var(--font-hero)', fontWeight:800, fontSize:9, letterSpacing:'-0.02em', color:'var(--fg-3)', whiteSpace:'nowrap' }}>{b}</span>))}</div>
      <div style={{ padding:'12px 14px 6px', display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
        <span style={{ fontFamily:'var(--font-hero)', fontWeight:700, fontSize:14, letterSpacing:'-0.03em', color:'var(--fg-1)' }}>Popular lawn products</span>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, color:JG.green }}>Browse all products →</span>
      </div>
      <div style={{ padding:'0 14px 14px', display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:9 }}>
        {feat.map((p,i)=>(
          <div key={i} style={{ display:'flex', flexDirection:'column', gap:4, minWidth:0 }}>
            <div style={{ aspectRatio:'1/0.9', borderRadius:4, background:jgTile(p[2]), position:'relative' }}>{p[3] && <JGBadge k={p[3]} style={{ top:5, left:5, padding:'1px 6px' }}/>}<span style={{ position:'absolute', bottom:5, right:5, width:16, height:16, borderRadius:999, background:JG.yellow, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:JG.ink, boxShadow:'0 1px 3px rgba(0,0,0,0.18)' }}>＋</span></div>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:8.5, color:'var(--fg-1)', letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p[0]}</span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:8.5, fontWeight:700, color:'var(--fg-1)' }}>{p[1]}</span>
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, borderTop:'1px solid var(--line-1)' }}>
        <div style={{ background:`linear-gradient(150deg, ${JG.lawn}, #1F4A20)`, minHeight:96, position:'relative' }}><span style={{ position:'absolute', bottom:8, left:10, padding:'2px 7px', background:JG.yellow, borderRadius:3, fontFamily:'var(--font-mono)', fontSize:5.5, fontWeight:800, letterSpacing:'0.1em', color:JG.ink }}>SINCE 1881</span></div>
        <div style={{ padding:'16px 16px', display:'flex', flexDirection:'column', justifyContent:'center', gap:7, background:JG.tint }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:6.5, fontWeight:700, letterSpacing:'0.14em', color:JG.green }}>OUR LAWN LEGACY</span>
          <span style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontSize:14, lineHeight:1.3, letterSpacing:'-0.01em', color:'var(--fg-1)' }}>Six generations perfecting grass seed — so you spend less time worrying about your lawn and more time enjoying it.</span>
          <span style={{ alignSelf:'flex-start', fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, color:'var(--fg-1)', borderBottom:`1.5px solid ${JG.yellow}`, paddingBottom:1 }}>Read our story →</span>
        </div>
      </div>
    </div>
  );
}

function GfxPhone({ kind }) {
  // Mobile lawn-care storefront. kind: 'home' | 'about' | 'blog'
  return (
    <div style={{ background:'var(--uc-paper)', border:'1px solid var(--line-2)', borderRadius:18, padding:8, boxShadow:'0 18px 40px -22px rgba(10,10,10,0.4)' }}>
      <div style={{ background:'var(--uc-cream)', borderRadius:12, overflow:'hidden', height:460, display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 12px', fontFamily:'var(--font-mono)', fontSize:7.5, color:'var(--fg-3)', flexShrink:0 }}>
          <span>9:41</span>
          <span style={{ display:'inline-flex', gap:3 }}><span style={{ width:14, height:6, border:'1px solid var(--fg-3)', borderRadius:2 }}/></span>
        </div>
        <div style={{ flexShrink:0, borderBottom:'1px solid var(--line-1)', background:'var(--uc-paper)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 12px' }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
              <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:22, height:22, border:'1px solid var(--line-2)', borderRadius:5, fontSize:9, color:'var(--fg-1)' }}>☰</span>
              <JGLogo h={18}/>
            </span>
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, height:22, padding:'0 9px', background:JG.green, borderRadius:5, fontFamily:'var(--font-mono)', fontSize:7.5, fontWeight:700, color:'#fff' }}>⛒ Cart<span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', minWidth:11, height:11, padding:'0 2px', background:JG.yellow, color:JG.ink, borderRadius:999, fontSize:6, fontWeight:800 }}>2</span></span>
          </div>
          <div style={{ padding:'0 12px 9px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, height:30, border:`1.5px solid ${JG.green}`, borderRadius:5, padding:'0 4px 0 10px' }}>
              <span style={{ fontSize:10, color:'var(--fg-2)' }}>⌕</span>
              <span style={{ flex:1, fontFamily:'var(--font-mono)', fontSize:8, color:'var(--fg-3)' }}>Search grass seed, fertilizer…</span>
              <span style={{ alignSelf:'stretch', display:'flex', alignItems:'center', padding:'0 9px', margin:'3px 0', background:JG.yellow, color:JG.ink, borderRadius:3, fontFamily:'var(--font-mono)', fontSize:7, fontWeight:800 }}>GO</span>
            </div>
          </div>
        </div>
        <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {kind === 'home' && (
          <div style={{ display:'flex', flexDirection:'column' }}>
            <div style={{ background:JG.deep, color:'#fff', padding:'4px 0', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:6, fontWeight:700, letterSpacing:'0.12em' }}>FALL IS THE BEST TIME TO SEED · SHOP FALL MAGIC</div>
            <div style={{ margin:'10px 12px 0', borderRadius:8, background:`linear-gradient(100deg, #03361E 0%, ${JG.green} 55%, #2F8F4E 135%)`, position:'relative', overflow:'hidden', padding:'12px 13px', display:'flex', flexDirection:'column', gap:5, minHeight:96 }}>
              <svg viewBox="0 0 120 60" style={{ position:'absolute', right:-6, bottom:-4, width:120, opacity:0.2 }}><path d="M12 60 C 18 42, 20 28, 22 8 M34 60 C 38 44, 48 34, 58 20 M56 60 C 58 46, 60 32, 56 14 M80 60 C 84 48, 94 40, 106 30 M98 60 C 100 46, 104 32, 110 16" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/></svg>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:6, fontWeight:700, letterSpacing:'0.16em', color:JG.yellow }}>SINCE 1881 · FAMILY-OWNED</span>
              <span style={{ fontFamily:'var(--font-hero)', fontWeight:800, fontSize:18, letterSpacing:'-0.04em', lineHeight:0.9, color:'#fff' }}>Great lawns<br/><span style={{ fontFamily:'var(--font-serif)', fontWeight:400 }}>start here.</span></span>
              <span style={{ alignSelf:'flex-start', marginTop:2, padding:'5px 12px', background:JG.yellow, color:JG.ink, borderRadius:999, fontFamily:'var(--font-mono)', fontSize:7, fontWeight:800 }}>Shop grass seed →</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:0, margin:'11px 0 0', padding:'8px 12px', borderTop:'1px solid var(--line-1)', borderBottom:'1px solid var(--line-1)', justifyContent:'space-between' }}>{['BLACK BEAUTY®','BLUE PANTHER®','VERI-GREEN','MAG-I-CAL®'].map(b=>(<span key={b} style={{ fontFamily:'var(--font-hero)', fontWeight:800, fontSize:7.5, letterSpacing:'-0.02em', color:'var(--fg-3)', whiteSpace:'nowrap' }}>{b}</span>))}</div>
            <div style={{ display:'flex', gap:13, padding:'10px 12px 8px' }}>{['Best Sellers','New','Bundles'].map((t,i)=>(<span key={t} style={{ paddingBottom:4, fontFamily:'var(--font-display)', fontWeight:700, fontSize:9, color:i===0?JG.green:'var(--fg-3)', borderBottom:i===0?`2px solid ${JG.yellow}`:'2px solid transparent' }}>{t}</span>))}</div>
            <div style={{ padding:'0 12px 11px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[['Black Beauty® Ultra','From $12.99',JG.bagBlack,'BEST'],['Love Your Soil®','From $32.99',JG.soil,null],['Veri-Green Starter','From $19.99',JG.bagBlue,'NEW'],['Black Beauty® Fall Magic','From $21.99',JG.bagGreen,'FALL']].map((p,i)=>(
                <div key={i} style={{ display:'flex', flexDirection:'column', gap:4, minWidth:0 }}>
                  <div style={{ aspectRatio:'1/0.86', borderRadius:5, background:jgTile(p[2]), position:'relative' }}>{p[3] && <JGBadge k={p[3]} style={{ top:5, left:5, padding:'1px 6px', fontSize:5 }}/>}<span style={{ position:'absolute', bottom:5, right:5, width:16, height:16, borderRadius:999, background:JG.yellow, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:JG.ink }}>＋</span></div>
                  <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:8, color:'var(--fg-1)', letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p[0]}</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:8, fontWeight:700, color:'var(--fg-1)' }}>{p[1]}</span>
                </div>
              ))}
            </div>
            <div style={{ padding:'0 12px 12px' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:6, fontWeight:700, letterSpacing:'0.1em', color:'var(--fg-3)', marginBottom:6 }}>EXPLORE BY CATEGORY</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>{[['Grass Seed',JG.bagGreen],['Fertilizers',JG.bagYellow],['Soil',JG.soil],['Weed Control',JG.lawnLight]].map((c,i)=>(<div key={i} style={{ display:'flex', flexDirection:'column', gap:3, minWidth:0 }}><div style={{ aspectRatio:'1/1', borderRadius:4, background:jgTile(c[1]) }}/><span style={{ fontFamily:'var(--font-mono)', fontSize:6, fontWeight:700, textAlign:'center', color:'var(--fg-2)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c[0]}</span></div>))}</div>
            </div>
          </div>
        )}
        {kind === 'about' && (
          <div style={{ display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'14px 13px 10px', display:'flex', flexDirection:'column', gap:6 }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontFamily:'var(--font-mono)', fontSize:6, fontWeight:700, letterSpacing:'0.16em', color:'var(--fg-3)' }}><span style={{ width:5, height:5, borderRadius:999, background:JG.yellow }}/>SINCE 1881 · SIX GENERATIONS</span>
              <span style={{ fontFamily:'var(--font-hero)', fontWeight:700, fontSize:21, letterSpacing:'-0.045em', lineHeight:0.9, color:'var(--fg-1)' }}>A family business<br/><span style={{ fontFamily:'var(--font-serif)', fontWeight:400 }}>built on better seed.</span></span>
            </div>
            <div style={{ position:'relative', height:112, margin:'2px 13px 4px' }}>
              <div style={{ position:'absolute', left:0, top:10, width:'58%', height:84, borderRadius:5, background:`linear-gradient(150deg, ${JG.lawn}, ${JG.tint})`, transform:'rotate(-4deg)', boxShadow:'0 8px 16px -10px rgba(10,10,10,0.45)' }}/>
              <div style={{ position:'absolute', right:8, top:0, width:'46%', height:104, borderRadius:5, background:`linear-gradient(150deg, ${JG.soil}, ${JG.tint})`, transform:'rotate(6deg)', boxShadow:'0 8px 16px -10px rgba(10,10,10,0.4)' }}/>
              <span style={{ position:'absolute', left:'33%', bottom:2, padding:'3px 8px', background:JG.yellow, borderRadius:3, fontFamily:'var(--font-mono)', fontSize:5.5, fontWeight:800, letterSpacing:'0.1em', color:JG.ink, transform:'rotate(-3deg)' }}>TURFGRASS RESEARCH FARM</span>
            </div>
            <div style={{ padding:'12px 13px 8px' }}><span style={{ fontFamily:'var(--font-serif)', fontStyle:'italic', fontSize:10.5, lineHeight:1.45, color:'var(--fg-2)' }}>“Our goal has always been to help you spend less time worrying about your lawn and more time enjoying it.”</span></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, padding:'8px 13px', borderTop:'1px solid var(--line-1)', background:'var(--uc-paper)' }}>{[['1881','Founded'],['6','Generations'],['0','Big-box stores']].map((s,i)=>(<div key={i}><div style={{ fontFamily:'var(--font-hero)', fontWeight:800, fontSize:14, letterSpacing:'-0.035em', color:'var(--fg-1)' }}>{s[0]}</div><div style={{ fontFamily:'var(--font-mono)', fontSize:5.5, color:'var(--fg-3)', letterSpacing:'0.08em', textTransform:'uppercase' }}>{s[1]}</div></div>))}</div>
          </div>
        )}
        {kind === 'blog' && (
          <div style={{ display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'12px 13px 8px' }}><span style={{ fontFamily:'var(--font-hero)', fontWeight:700, fontSize:19, letterSpacing:'-0.04em', color:'var(--fg-1)' }}>Resource Center</span></div>
            <div style={{ margin:'0 13px', borderRadius:6, overflow:'hidden', border:'1px solid var(--line-1)' }}>
              <div style={{ aspectRatio:'16/9', background:`radial-gradient(120% 100% at 30% 10%, ${JG.lawnLight}, ${JG.lawn})`, position:'relative' }}><span style={{ position:'absolute', top:7, left:7, padding:'2px 7px', background:JG.yellow, color:JG.ink, borderRadius:999, fontFamily:'var(--font-mono)', fontSize:6, fontWeight:800, letterSpacing:'0.06em' }}>FALL</span></div>
              <div style={{ padding:'9px 11px', background:'var(--uc-paper)', display:'flex', flexDirection:'column', gap:4 }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:5.5, fontWeight:700, letterSpacing:'0.12em', color:'var(--fg-3)' }}>LAWN CARE BY SEASON · 11 MIN READ</span>
                <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:12.5, letterSpacing:'-0.018em', lineHeight:1.08, color:'var(--fg-1)' }}>Essential Tips for Fall Lawn Care</span>
              </div>
            </div>
            <div style={{ padding:'10px 13px', display:'flex', flexDirection:'column', gap:9 }}>
              {[['5 Reasons Why It’s Best To Seed In the Fall','7 min',JG.bagGreen],['Overseeding Lawns: A Complete How-To Guide','10 min',JG.lawn],['Fall Lawn Care Myths Debunked','5 min',JG.soil]].map((a,i)=>(
                <div key={i} style={{ display:'grid', gridTemplateColumns:'42px 1fr', gap:9, alignItems:'center' }}>
                  <div style={{ aspectRatio:'1/1', borderRadius:4, background:jgTile(a[2]) }}/>
                  <div style={{ display:'flex', flexDirection:'column', gap:3, minWidth:0 }}>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:5.5, fontWeight:700, letterSpacing:'0.1em', color:'var(--fg-3)' }}>{a[1].toUpperCase()} READ</span>
                    <span style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:10, letterSpacing:'-0.012em', color:'var(--fg-1)', lineHeight:1.15 }}>{a[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { JG, JGLogo, GfxChrome, GfxMegaNav, GfxCollection, GfxCart, GfxPDP, GfxPortal, GfxHomepage, GfxPhone });
