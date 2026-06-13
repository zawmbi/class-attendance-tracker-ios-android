// ============================================================
// Laurel prototype — iPad (landscape) layouts for Dashboard + Insights
// ============================================================
const { useState } = React;

function IPad({ ctx, view }) {
  const { user, today, classes } = ctx;
  const cur = view === 'insights' ? 'insights' : view === 'analytics' ? 'analytics' : 'today';
  const nav = [['today','Today','today'],['insights','Insights','insights']];
  return (
    <div style={{ width:1180, height:834, borderRadius:38, background:'#0c0c0d', padding:13, boxShadow:'0 50px 100px -20px rgba(20,40,30,0.5), 0 0 0 2px #2c2c2e' }}>
      <div className="grain" style={{ width:'100%', height:'100%', borderRadius:26, overflow:'hidden', background:'var(--paper)', display:'flex' }}>
        {/* sidebar */}
        <div className="glass" style={{ width:248, flexShrink:0, borderRadius:0, borderInline:'none', display:'flex', flexDirection:'column', padding:'26px 18px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:11, padding:'0 8px 22px' }}>
            <AppIconMini />
            <div style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:600, color:'var(--ink)' }}>Laurel</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {nav.map(([k,l,vw]) => {
              const on = cur === vw;
              return (
                <button key={k} onClick={() => ctx.setTab(vw)} style={{ display:'flex', alignItems:'center', gap:12, border:'none', cursor:'pointer', padding:'12px 14px', borderRadius:'var(--r-field)', background: on?'var(--forest-soft)':'transparent', color: on?'var(--forest)':'var(--ink-2)', fontWeight:700, fontSize:16 }}>
                  <Icon name={k} size={24} color={on?'var(--forest)':'var(--ink-3)'} fill={on?'fill':'none'} /> {l}
                </button>
              );
            })}
            {/* Analytics — premium */}
            <button onClick={() => ctx.setTab('analytics')} style={{ display:'flex', alignItems:'center', gap:12, border:'none', cursor:'pointer', padding:'12px 14px', borderRadius:'var(--r-field)', background: cur==='analytics'?'var(--gold-soft)':'transparent', color: cur==='analytics'?'var(--gold-deep)':'var(--ink-2)', fontWeight:700, fontSize:16 }}>
              <Icon name="chart" size={24} color={cur==='analytics'?'var(--gold-deep)':'var(--ink-3)'} /> Forecast
              <Icon name={user.premium?'sparkles':'lock'} size={15} color="var(--gold-deep)" stroke={2.2} style={{ marginLeft:'auto' }} />
            </button>
            {[['calendar','Calendar'],['trophy','Trophy']].map(([k,l]) => (
              <div key={k} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', color:'var(--ink-3)', fontWeight:700, fontSize:16, opacity:0.6 }}>
                <Icon name={k} size={24} color="var(--ink-3)" /> {l}
              </div>
            ))}
          </div>
          <button onClick={ctx.openCheckIn} style={{ marginTop:18, display:'flex', alignItems:'center', justifyContent:'center', gap:8, border:'none', cursor:'pointer', padding:'14px', borderRadius:'var(--r-field)', background:'linear-gradient(180deg, var(--forest), var(--forest-deep))', color:'#fff', fontWeight:800, fontSize:16, boxShadow:'var(--e-forest)' }}>
            <Icon name="checkin" size={22} color="#fff" stroke={2} /> Check in
          </button>
          <div style={{ flex:1 }} />
          <div style={{ display:'flex', alignItems:'center', gap:11, padding:'10px 8px' }}>
            <div style={{ width:42, height:42, borderRadius:'50%', background:'linear-gradient(150deg, var(--moss), var(--forest-deep))', color:'#fff', fontWeight:800, fontSize:17, display:'flex', alignItems:'center', justifyContent:'center' }}>{user.name[0]}</div>
            <div><div style={{ fontSize:15, fontWeight:700, color:'var(--ink)' }}>{user.name}</div><div style={{ fontSize:12.5, color:'var(--ink-3)', fontWeight:600 }}>{user.rank}</div></div>
          </div>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--ink-3)', textAlign:'center', marginTop:8, opacity:0.7 }}>Optimized for iPad</div>
        </div>

        {/* content */}
        <div className="hide-scroll" style={{ flex:1, overflowY:'auto', padding:'34px 38px' }}>
          {cur === 'today' && <PadDashboard ctx={ctx} />}
          {cur === 'insights' && <PadInsights ctx={ctx} />}
          {cur === 'analytics' && (ctx.user.premium ? <PadAnalytics ctx={ctx} /> : <PadAnalyticsLocked ctx={ctx} />)}
        </div>
      </div>
    </div>
  );
}

function AppIconMini() {
  return (
    <div style={{ width:38, height:38, borderRadius:11, position:'relative', overflow:'hidden', background:'linear-gradient(150deg, var(--forest), var(--forest-deep))', boxShadow:'var(--e2)' }}>
      <svg viewBox="0 0 24 24" width="38" height="38"><path d="M8.4 12.4l2.5 2.5 5-5.4" fill="none" stroke="var(--gold)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  );
}

function PadDashboard({ ctx }) {
  const { user, today, classes } = ctx;
  const atRisk = classes.filter(c => riskOf(c) === 'danger');
  const logged = today.filter(t=>t.status).length;
  const next = LADDER.find(l => !l.done);
  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold-deep)' }}>Monday · March 4</div>
          <h1 style={{ fontFamily:'var(--font-ui)', fontSize:38, fontWeight:800, letterSpacing:'-0.02em', color:'var(--ink)', margin:'3px 0 0', whiteSpace:'nowrap' }}>Good morning, {user.name}</h1>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:20 }}>
        {/* hero */}
        <div className="grain" style={{ position:'relative', borderRadius:'var(--r-card-lg)', overflow:'hidden', padding:'28px', background:'linear-gradient(150deg, var(--forest), var(--forest-deep) 70%, oklch(0.24 0.035 170))', boxShadow:'var(--e-forest)' }}>
          <div style={{ position:'absolute', top:-50, right:-30, width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle, oklch(0.8 0.13 79 / 0.25), transparent 70%)' }} />
          <div style={{ display:'flex', alignItems:'center', gap:28, position:'relative' }}>
            <MomentumRing size={188} level={user.level} xp={user.xp} xpMax={user.xpMax} streak={user.streak} rank={user.rank} animate={false} />
            <div style={{ color:'#fff', flex:1 }}>
              <div style={{ fontSize:13, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:'oklch(0.88 0.10 85)' }}>Momentum</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:600, lineHeight:1.05, margin:'4px 0 14px' }}>You're on a roll, {user.name}.</div>
              <div style={{ display:'flex', gap:10 }}>
                <Stat icon="flame" v={user.streak} l="day streak" />
                <Stat icon="bolt" v={user.weekXP} l="XP this week" />
              </div>
              <div style={{ marginTop:16, fontSize:13, fontWeight:700, color:'oklch(0.9 0.03 120)' }}>{user.xpMax - user.xp} XP to Level {user.level+1} · Next rank {next?.name}</div>
            </div>
          </div>
        </div>
        {/* at risk */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {atRisk.length > 0 && (
            <Card glow onClick={()=>ctx.push('classDetail',{classId:atRisk[0].id})} style={{ display:'flex', alignItems:'center', gap:14, padding:'20px' }}>
              <div style={{ width:52, height:52, borderRadius:'var(--r-field)', background:'var(--absent-soft)', display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name="target" size={28} color="var(--risk-danger)" stroke={2} /></div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12.5, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--risk-danger)' }}>Needs attention</div>
                <div style={{ fontSize:17, fontWeight:700, color:'var(--ink)' }}>{atRisk[0].name}</div>
                <div style={{ fontSize:14, color:'var(--ink-2)', fontWeight:600 }}>Buffer empty — can't miss any more</div>
              </div>
            </Card>
          )}
          <Card style={{ flex:1 }}>
            <SectionTitle title="Today" trailing={`${logged}/${today.length}`} onAction={ctx.openCheckIn} actionLabel="Check in" />
            <div style={{ marginTop:8 }}>
              {today.map((t,i) => <div key={t.id}><TodayRow ctx={ctx} item={t} onTap={()=> t.status ? ctx.push('classDetail',{classId:t.classId}) : ctx.openCheckIn()} />{i<today.length-1 && <div style={{ height:0.5, background:'var(--hairline)', marginLeft:69 }} />}</div>)}
            </div>
          </Card>
        </div>
      </div>
      {/* trophy strip */}
      <div style={{ marginTop:22 }}>
        <SectionTitle title="Trophy case" trailing="" />
        <div style={{ display:'flex', gap:14, marginTop:14 }}>
          {BADGES.filter(b=>b.unlocked).map(b => (
            <div key={b.id} style={{ flex:1, textAlign:'center' }}>
              <div style={{ height:96, borderRadius:'var(--r-card)', background:'linear-gradient(160deg, var(--gold-soft), var(--card))', border:'0.5px solid var(--hairline)', boxShadow:'var(--e1)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:8 }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(150deg, var(--gold), var(--gold-deep))', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--e-gold)' }}><Icon name={b.icon} size={28} color="#fff" stroke={2} /></div>
              </div>
              <div style={{ fontSize:12.5, fontWeight:700, color:'var(--ink)' }}>{b.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PadInsights({ ctx }) {
  const { classes } = ctx;
  const overall = Math.round(classes.reduce((s,c)=>s+pct(c),0)/classes.length);
  const sorted = [...classes].sort((a,b)=>buffer(a)-buffer(b));
  const worst = sorted[0];
  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:13, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold-deep)' }}>Your patterns</div>
        <h1 style={{ fontFamily:'var(--font-ui)', fontSize:38, fontWeight:800, letterSpacing:'-0.02em', color:'var(--ink)', margin:'3px 0 0' }}>Insights</h1>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20 }}>
        <Card glow style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', justifyContent:'center', padding:'24px' }}>
          <div className="font-display tnum" style={{ fontSize:64, fontWeight:600, lineHeight:0.9, color:'var(--forest)' }}>{overall}<span style={{ fontSize:28, color:'var(--ink-3)' }}>%</span></div>
          <div style={{ fontSize:14, fontWeight:700, color:'var(--ink-2)', marginTop:4 }}>overall attendance</div>
          <span style={{ display:'inline-flex', alignItems:'center', gap:5, marginTop:10, color:'var(--present)', fontWeight:700, fontSize:13.5 }}><Icon name="arrowUp" size={16} color="var(--present)" stroke={2.4} /> +6% vs last month</span>
        </Card>
        <Card style={{ gridColumn:'span 2', display:'flex', flexDirection:'column', justifyContent:'center' }}>
          <SectionTitle title="12-week trend" trailing="" />
          <div style={{ marginTop:14 }}><Sparkline data={WEEK_TREND} w={620} h={120} tone="var(--forest)" /></div>
        </Card>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:20, marginTop:20 }}>
        <Card>
          <SectionTitle title="Consistency" trailing="12 weeks" />
          <div style={{ display:'flex', gap:7, justifyContent:'space-between', marginTop:14 }}>
            {['Mon','Tue','Wed','Thu','Fri'].map((d,i) => (
              <div key={i} style={{ flex:1 }}>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {HEAT.filter((_,idx)=>idx%5===i).slice(0,12).map((v,wi) => { const col = v===0?'var(--hairline)':v===1?'var(--absent)':v===2?'var(--late)':'var(--present)'; return <div key={wi} style={{ aspectRatio:'1', borderRadius:6, background:col, opacity:v===0?0.5:0.9 }} />; })}
                </div>
                <div style={{ textAlign:'center', fontSize:12, fontWeight:700, color:'var(--ink-3)', marginTop:7 }}>{d}</div>
              </div>
            ))}
          </div>
        </Card>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Card onClick={()=>ctx.push('classDetail',{classId:worst.id})} style={{ borderLeft:`4px solid ${RISK[riskOf(worst)].c}` }}>
            <div style={{ fontSize:12.5, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', color:RISK[riskOf(worst)].c }}>Prioritize</div>
            <div style={{ fontSize:18, fontWeight:700, color:'var(--ink)', marginTop:3 }}>{worst.name}</div>
            <div style={{ fontSize:14, color:'var(--ink-2)', fontWeight:600 }}>{buffer(worst)===0?'No buffer left':`${buffer(worst)} classes of buffer`} · {pct(worst)}%</div>
          </Card>
          {sorted.slice(1).map(c => (
            <Card key={c.id} pad={14} onClick={()=>ctx.push('classDetail',{classId:c.id})} style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ width:10, height:10, borderRadius:'50%', background:c.hue }} />
              <div style={{ flex:1 }}><div style={{ fontSize:14.5, fontWeight:700, color:'var(--ink)' }}>{c.name}</div><div style={{ marginTop:6 }}><Meter value={pct(c)/100} tone={RISK[riskOf(c)].c} height={6} /></div></div>
              <span className="tnum" style={{ fontSize:15, fontWeight:800, color:RISK[riskOf(c)].c }}>{pct(c)}%</span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

window.IPad = IPad;
Object.assign(window, { PadDashboard, PadInsights, PadAnalytics, PadAnalyticsLocked });

// iPad analytics paywall — blurred preview behind a glass subscribe card
function PadAnalyticsLocked({ ctx }) {
  const [plan, setPlan] = useState('m6');
  const PLANS = window.PLANS || [];
  const cur = PLANS.find(p => p.id === plan) || PLANS[0] || { price:'3.99', cycle:'monthly' };
  return (
    <div style={{ position:'relative', minHeight:720 }}>
      <div style={{ filter:'blur(7px)', opacity:0.5, pointerEvents:'none', userSelect:'none' }}>
        <PadAnalytics ctx={ctx} />
      </div>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div className="glass grain" style={{ width:460, maxWidth:'100%', borderRadius:'var(--r-card-lg)', padding:'30px 28px', textAlign:'center' }}>
          <div style={{ width:72, height:72, borderRadius:20, margin:'0 auto 16px', background:'linear-gradient(150deg, var(--gold), var(--gold-deep))', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--e-gold)' }}><Icon name="crown" size={38} color="#fff" stroke={1.9} /></div>
          <div style={{ fontSize:13, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gold-deep)' }}>Laurel Premium</div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:30, fontWeight:600, color:'var(--ink)', margin:'6px 0 6px' }}>Unlock Forecast & Analytics</h2>
          <p style={{ fontSize:15, color:'var(--ink-2)', fontWeight:500, margin:'0 0 20px', lineHeight:1.5 }}>End-of-term projections, a what-if simulator, weekday & time-of-day patterns, punctuality and streak records.</p>
          <div style={{ display:'flex', gap:10, marginBottom:18 }}>
            {PLANS.map(p => {
              const on = p.id === plan;
              return (
                <button key={p.id} onClick={() => setPlan(p.id)} className="pressable" style={{ flex:1, cursor:'pointer', textAlign:'center', padding:'14px 8px', borderRadius:'var(--r-field)', border: on?'2px solid var(--gold-deep)':'1.5px solid var(--hairline)', background: on?'var(--gold-soft)':'var(--card)' }}>
                  <div style={{ fontSize:13, fontWeight:800, color:'var(--ink)' }}>{p.label}</div>
                  <div className="tnum" style={{ fontSize:18, fontWeight:800, color:'var(--ink)', marginTop:3 }}>${p.price}</div>
                  {p.save ? <div style={{ fontSize:11, fontWeight:800, color:'var(--gold-deep)' }}>Save {p.save}</div> : <div style={{ fontSize:11, fontWeight:700, color:'var(--ink-3)' }}>monthly</div>}
                </button>
              );
            })}
          </div>
          <button onClick={() => ctx.subscribe && ctx.subscribe(plan)} style={{ width:'100%', border:'none', cursor:'pointer', borderRadius:'var(--r-card)', padding:'16px', background:'linear-gradient(180deg, var(--gold), var(--gold-deep))', color:'#3a2a06', fontWeight:800, fontSize:17, boxShadow:'var(--e-gold)' }}>Start 7-day free trial</button>
          <div style={{ fontSize:12.5, color:'var(--ink-3)', fontWeight:600, marginTop:11 }}>then ${cur.price} {cur.cycle} · cancel anytime</div>
        </div>
      </div>
    </div>
  );
}

// ---------- iPad ANALYTICS (multi-column) ----------
function PadAnalytics({ ctx }) {
  const { classes, user } = ctx;
  const [attend, setAttend] = useState(85);
  const rows = classes.map(c => {
    const remaining = Math.max(0, c.semTotal - c.held);
    const projected = Math.round(((c.present + c.late + remaining * attend / 100) / c.semTotal) * 100);
    const projAbs = c.absent + Math.round(remaining * (1 - attend / 100));
    const allowedAbs = (c.reqMode === 'count' ? (c.maxAbsences || 0) : Math.floor(c.semTotal * (1 - c.target / 100))) + (c.excused || 0);
    const willPass = c.reqMode === 'count' ? projAbs <= allowedAbs : projected >= c.target;
    return { c, remaining, projected, current: pct(c), willPass, conf: projConfidence(c) };
  });
  const overall = Math.round(rows.reduce((s,r)=>s+r.projected,0)/rows.length);
  const atRisk = rows.filter(r => !r.willPass);
  const worstDow = DOW_RATE.indexOf(Math.min(...DOW_RATE));
  const maxDow = Math.max(...DOW_RATE);
  const dayNames = ['Mon','Tue','Wed','Thu','Fri'];
  const overallNow = Math.round(classes.reduce((s,c)=>s+pct(c),0)/classes.length);
  const sectionH = { fontFamily:'var(--font-ui)', fontSize:18, fontWeight:800, letterSpacing:'-0.01em', color:'var(--ink)', margin:'0 0 12px' };

  return (
    <div>
      {/* header */}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:22 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold-deep)' }}>Premium · deep insights</div>
          <h1 style={{ fontFamily:'var(--font-ui)', fontSize:38, fontWeight:800, letterSpacing:'-0.02em', color:'var(--ink)', margin:'3px 0 0' }}>Forecast & Analytics</h1>
        </div>
        <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:'var(--r-full)', background:'linear-gradient(180deg, var(--gold), var(--gold-deep))', color:'#3a2a06', fontWeight:800, fontSize:12.5, letterSpacing:'0.04em' }}><Icon name="crown" size={15} color="#3a2a06" stroke={2.2} /> {user.premium?'PREMIUM':'PREVIEW'}</span>
      </div>

      {/* ROW 1: forecast hero (2col) + scenario/finals/what-if (1col) */}
      <div style={{ display:'grid', gridTemplateColumns:'1.55fr 1fr', gap:18, marginBottom:18 }}>
        <Card glow style={{ background:'linear-gradient(160deg, var(--forest-soft), var(--card))' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:8 }}>
            <div>
              <div style={{ fontSize:13.5, fontWeight:700, color:'var(--ink-2)' }}>Projected end-of-term</div>
              <div className="font-display tnum" style={{ fontSize:60, fontWeight:600, lineHeight:0.92, color: overall>=85?'var(--present)':overall>=78?'var(--late)':'var(--risk-danger)' }}>{overall}%</div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {[['Best', Math.min(100,overall+5),'var(--present)'],['Likely',overall,'var(--ink)'],['Slip',Math.max(40,overall-9),'var(--risk-danger)']].map(([l,v,col])=>(
                <div key={l} style={{ textAlign:'center', padding:'9px 12px', borderRadius:'var(--r-field)', background:'var(--card-2)', border:'0.5px solid var(--hairline)' }}>
                  <div className="tnum" style={{ fontSize:18, fontWeight:800, color:col }}>{v}%</div>
                  <div style={{ fontSize:10.5, fontWeight:700, color:'var(--ink-3)' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <ForecastChart history={WEEK_TREND} projected={overall} />
        </Card>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Card style={{ display:'flex', alignItems:'center', gap:14, background:'linear-gradient(155deg, var(--gold-soft), var(--card))' }}>
            <div style={{ width:54, height:54, borderRadius:'var(--r-field)', background:'rgba(255,255,255,0.6)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span className="font-display tnum" style={{ fontSize:24, fontWeight:700, color:'var(--gold-deep)', lineHeight:1 }}>39</span>
              <span style={{ fontSize:9, fontWeight:800, color:'var(--ink-3)', textTransform:'uppercase' }}>days</span>
            </div>
            <div><div style={{ fontSize:16, fontWeight:800, color:'var(--ink)' }}>Until finals</div><div style={{ fontSize:13.5, color:'var(--ink-2)', fontWeight:600 }}>~22 sessions to go</div></div>
          </Card>
          <Card style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}><Icon name="target" size={19} color="var(--gold-deep)" stroke={2} /><span style={{ fontSize:15, fontWeight:800, color:'var(--ink)' }}>What if…</span></div>
            <p style={{ margin:'0 0 14px', fontSize:14, color:'var(--ink-2)', fontWeight:500, lineHeight:1.45 }}>Attend <strong style={{ color:'var(--forest)' }}>{attend}%</strong> of remaining classes → finish near <strong style={{ color:'var(--ink)' }}>{overall}%</strong>. {atRisk.length?`${atRisk.length} at risk.`:'All on track.'}</p>
            <input type="range" min="0" max="100" value={attend} onChange={e=>setAttend(+e.target.value)} style={{ width:'100%', accentColor:'var(--gold-deep)' }} />
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, fontWeight:600, color:'var(--ink-3)', marginTop:2 }}><span>skip all</span><span>perfect</span></div>
          </Card>
        </div>
      </div>

      {/* ROW 2: per-class forecast (2col grid) */}
      <h2 style={sectionH}>By class · projected</h2>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:22 }}>
        {rows.slice().sort((a,b)=>a.projected-b.projected).map(({c,current,projected,willPass,conf})=>(
          <Card key={c.id} pad={15} onClick={()=>ctx.push('classDetail',{classId:c.id})}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ width:11, height:11, borderRadius:'50%', background:c.hue, flexShrink:0 }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:15.5, fontWeight:700, color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</div>
                <div style={{ fontSize:12.5, fontWeight:600, color:'var(--ink-3)', display:'flex', alignItems:'center', gap:5, marginTop:2 }}>now {current}% <Icon name="arrowRight" size={12} color="var(--ink-3)" stroke={2} /> <span style={{ color: willPass?'var(--present)':'var(--risk-danger)', fontWeight:800 }}>{projected}%</span></div>
              </div>
              <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'5px 10px', borderRadius:'var(--r-full)', background: willPass?'var(--present-soft)':'var(--absent-soft)', color: willPass?'var(--present)':'var(--risk-danger)', fontWeight:800, fontSize:12 }}><Icon name={willPass?'present':'target'} size={14} color={willPass?'var(--present)':'var(--risk-danger)'} stroke={2.2} /> {willPass?'On track':'At risk'}</span>
            </div>
            <div style={{ marginTop:11, paddingTop:11, borderTop:'0.5px solid var(--hairline)' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--ink-3)', marginBottom:4 }}>Confidence {conf}%</div>
              <Meter value={conf/100} tone="var(--gold-deep)" height={5} />
            </div>
          </Card>
        ))}
      </div>

      {/* ROW 3: patterns — 3 columns */}
      <h2 style={sectionH}>Patterns</h2>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:22 }}>
        <Card>
          <div style={{ fontSize:13, fontWeight:800, color:'var(--ink-2)', marginBottom:12 }}>By weekday</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:104 }}>
            {DOW_RATE.map((v,i)=>(
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, height:'100%', justifyContent:'flex-end' }}>
                <span className="tnum" style={{ fontSize:11, fontWeight:800, color: i===worstDow?'var(--risk-danger)':'var(--ink-2)' }}>{Math.round(v*100)}</span>
                <div style={{ width:'66%', height:`${(v/maxDow)*66+8}px`, borderRadius:6, background: i===worstDow?'linear-gradient(180deg, var(--late), var(--absent))':'linear-gradient(180deg, var(--moss), var(--forest))' }} />
                <span style={{ fontSize:10.5, fontWeight:700, color:'var(--ink-3)' }}>{dayNames[i][0]}</span>
              </div>
            ))}
          </div>
          <p style={{ margin:'10px 0 0', fontSize:12.5, color:'var(--ink-2)', fontWeight:500, lineHeight:1.4 }}><strong style={{ color:'var(--ink)' }}>{dayNames[worstDow]}</strong> is your weak spot.</p>
        </Card>
        <Card>
          <div style={{ fontSize:13, fontWeight:800, color:'var(--ink-2)', marginBottom:12 }}>By time of day</div>
          <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
            {HOUR_BUCKETS.map(b=>(
              <div key={b.label} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ width:64, fontSize:11.5, fontWeight:700, color:'var(--ink-2)', flexShrink:0 }}>{b.label}</span>
                <div style={{ flex:1 }}><Meter value={b.rate} tone={b.rate>=0.9?'var(--present)':b.rate>=0.82?'var(--forest)':'var(--late)'} height={8} /></div>
                <span className="tnum" style={{ width:30, textAlign:'right', fontSize:12, fontWeight:800, color:'var(--ink)' }}>{Math.round(b.rate*100)}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ fontSize:13, fontWeight:800, color:'var(--ink-2)', marginBottom:12 }}>Monthly momentum</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:9, height:104 }}>
            {MONTHLY.map(m=>(
              <div key={m.m} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, height:'100%', justifyContent:'flex-end' }}>
                <span className="tnum" style={{ fontSize:11, fontWeight:800, color:'var(--forest)' }}>{m.v}</span>
                <div style={{ width:'56%', height:`${(m.v-75)/25*64+8}px`, borderRadius:6, background:'linear-gradient(180deg, var(--gold), var(--gold-deep))' }} />
                <span style={{ fontSize:10.5, fontWeight:700, color:'var(--ink-3)' }}>{m.m}</span>
              </div>
            ))}
          </div>
          <p style={{ margin:'10px 0 0', fontSize:12.5, color:'var(--ink-2)', fontWeight:500, lineHeight:1.4 }}><strong style={{ color:'var(--present)' }}>+9 pts</strong> since January.</p>
        </Card>
      </div>

      {/* ROW 4: records — grade + streaks + punctuality */}
      <h2 style={sectionH}>Records</h2>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:14 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Card glow style={{ display:'flex', alignItems:'center', gap:16, background:'linear-gradient(160deg, var(--forest-soft), var(--card))' }}>
            <div style={{ width:76, height:76, borderRadius:'50%', flexShrink:0, background:'linear-gradient(150deg, var(--forest), var(--forest-deep))', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--e-forest)' }}>
              <span className="font-display" style={{ fontSize:30, fontWeight:600, color:'#fff' }}>{attendGrade(overallNow)}</span>
            </div>
            <div><div style={{ fontSize:12.5, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--gold-deep)' }}>Attendance grade</div><div style={{ fontSize:16, fontWeight:700, color:'var(--ink)', marginTop:2 }}>{overallNow}% this term</div><div style={{ fontSize:13, color:'var(--ink-2)', fontWeight:600 }}>Top 12% of cohort</div></div>
          </Card>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[['flame','Current',STREAKS.current],['bolt','Longest',STREAKS.longest],['sparkles','Term avg',STREAKS.thisTermAvg],['target','Freezes',STREAKS.freezesLeft]].map(([ic,l,v])=>(
              <Card key={l} pad={14}>
                <Icon name={ic} size={19} color="var(--gold-deep)" stroke={2} />
                <div className="font-display tnum" style={{ fontSize:26, fontWeight:600, color:'var(--ink)', marginTop:4, lineHeight:1 }}>{v}</div>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--ink-2)' }}>{l}</div>
              </Card>
            ))}
          </div>
        </div>
        <Card>
          <div style={{ fontSize:13, fontWeight:800, color:'var(--ink-2)', marginBottom:12 }}>Punctuality · on-time share</div>
          <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
            {classes.slice().sort((a,b)=>punctuality(b)-punctuality(a)).map(c=>{
              const p = Math.round(punctuality(c)*100);
              return (
                <div key={c.id} onClick={()=>ctx.push('classDetail',{classId:c.id})} className="pressable" style={{ display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
                  <span style={{ width:10, height:10, borderRadius:'50%', background:c.hue, flexShrink:0 }} />
                  <span style={{ width:150, fontSize:14, fontWeight:700, color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', flexShrink:0 }}>{c.name}</span>
                  <div style={{ flex:1 }}><Meter value={punctuality(c)} tone={p>=95?'var(--present)':p>=85?'var(--forest)':'var(--late)'} height={7} /></div>
                  <span className="tnum" style={{ width:34, textAlign:'right', fontSize:14, fontWeight:800, color:'var(--ink)' }}>{p}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
