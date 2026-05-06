// Math.jsx — $7K to see the whole map
function MathSection() {
  return (
    <section id="math" style={{background:'var(--uc-cream)',padding:'120px 32px',position:'relative',overflow:'hidden',scrollMarginTop:80}}>
      <div style={{maxWidth:1280,margin:'0 auto',position:'relative',zIndex:1}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1.2fr',gap:80,alignItems:'center'}}>
          <div>
            <div className="uc-eyebrow" style={{marginBottom:18}}>The math</div>
            <h2 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:'clamp(40px,4.4vw,72px)',lineHeight:1.02,letterSpacing:'-.03em',color:'var(--fg-1)',margin:'0 0 14px'}}>
              $7K to see the whole map.
            </h2>
            <p style={{fontFamily:'var(--font-serif)',fontStyle:'italic',fontSize:'clamp(22px,2vw,30px)',lineHeight:1.3,color:'var(--fg-2)',margin:0,letterSpacing:'-.01em'}}>
              It pays for itself the moment it stops you from hiring the wrong partner.
            </p>
          </div>

          {/* Bar comparison */}
          <div style={{display:'flex',flexDirection:'column',gap:18}}>
            <Bar label="A bad migration" sub="Wasted spend, lost revenue, lost months" amount="$50K – $150K" widthPct={100} dark/>
            <Bar label="One week of an agency retainer" sub="Industry standard, $300–$500/hr × 40h" amount="$12K – $20K" widthPct={20} stripe/>
            <Bar label="The Blueprint" sub="Fixed. Locked. Yours to keep." amount="$7,000" widthPct={7} signal/>
          </div>
        </div>
      </div>
    </section>
  );
}
function Bar({label, sub, amount, widthPct, dark, stripe, signal}){
  let fill = 'var(--uc-stone-300)';
  if (dark) fill = 'var(--uc-black)';
  if (stripe) fill = 'repeating-linear-gradient(135deg, var(--uc-stone-500) 0 8px, var(--uc-stone-300) 8px 16px)';
  if (signal) fill = 'var(--uc-signal)';
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:10}}>
        <div>
          <div style={{fontSize:15,fontWeight:600,color:'var(--fg-1)',marginBottom:2}}>{label}</div>
          <div style={{fontSize:13,color:'var(--fg-3)'}}>{sub}</div>
        </div>
        <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:24,letterSpacing:'-.02em',color:'var(--fg-1)',whiteSpace:'nowrap'}}>{amount}</div>
      </div>
      <div style={{height:18,background:'#fff',border:'1px solid var(--uc-black)',borderRadius:3,overflow:'hidden',position:'relative'}}>
        <div style={{height:'100%',width:`${widthPct}%`,background:fill,transition:'width 600ms var(--ease-out)'}}/>
      </div>
    </div>
  );
}
window.MathSection = MathSection;
