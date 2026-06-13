// ============================================================
// Laurel prototype — Premium "Forecast" analytics (gated screen)
// ============================================================
const { useState } = React;

function ForecastChart({ history, projected }) {
  const W = 320, H = 130, pad = 8;
  const all = [...history, projected];
  const min = 55, max = 100;
  const x = (i, n) => pad + (i / (n - 1)) * (W - pad * 2);
  const y = (v) => H - pad - ((v - min) / (max - min)) * (H - pad * 2);
  const hist = history.map((v, i) => [x(i, history.length + 3), y(v)]);
  // projection: continue 3 steps from last history point toward `projected`
  const last = history[history.length - 1];
  const projPts = [0, 1, 2, 3].map(k => {
    const v = last + (projected - last) * (k / 3);
    return [x(history.length - 1 + k, history.length + 3), y(v)];
  });
  const line = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const targetY = y(85);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="fcfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--forest)" stopOpacity="0.18" /><stop offset="100%" stopColor="var(--forest)" stopOpacity="0" /></linearGradient>
      </defs>
      <line x1={pad} y1={targetY} x2={W - pad} y2={targetY} stroke="var(--gold-deep)" strokeWidth="1.5" strokeDasharray="2 4" opacity="0.7" />
      <path d={`${line(hist)} L ${hist[hist.length-1][0]} ${H-pad} L ${hist[0][0]} ${H-pad} Z`} fill="url(#fcfill)" stroke="none" />
      <path d={line(hist)} fill="none" stroke="var(--forest)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={line(projPts)} fill="none" stroke="var(--gold-deep)" strokeWidth="2.5" strokeDasharray="3 4" strokeLinecap="round" />
      <circle cx={projPts[projPts.length-1][0]} cy={projPts[projPts.length-1][1]} r="4" fill="var(--gold-deep)" />
      <circle cx={hist[hist.length-1][0]} cy={hist[hist.length-1][1]} r="3.2" fill="var(--forest)" />
    </svg>
  );
}

function PremiumAnalytics({ ctx, onBack }) {
  const { classes } = ctx;
  const [attend, setAttend] = useState(85);
  const [tab, setTab] = useState('forecast');
  const rows = classes.map(c => {
    const remaining = Math.max(0, c.semTotal - c.held);
    const projected = Math.round(((c.present + c.late + remaining * attend / 100) / c.semTotal) * 100);
    const projAbs = c.absent + Math.round(remaining * (1 - attend / 100));
    const allowedAbs = (c.reqMode === 'count' ? (c.maxAbsences || 0) : Math.floor(c.semTotal * (1 - c.target / 100))) + (c.excused || 0);
    const willPass = c.reqMode === 'count' ? projAbs <= allowedAbs : projected >= c.target;
    // min classes of the remaining you MUST attend to still pass on %
    const needRate = c.reqMode === 'count' ? null : Math.max(0, Math.ceil(c.semTotal * c.target/100 - (c.present + c.late)));
    const conf = projConfidence(c);
    return { c, remaining, projected, current: pct(c), willPass, mustAttend: needRate, conf };
  });
  const overall = Math.round(rows.reduce((s, r) => s + r.projected, 0) / rows.length);
  const atRisk = rows.filter(r => !r.willPass);
  const dayRisk = [0,1,2,3,4].map(i => { const vals = HEAT.filter((_, idx) => idx % 5 === i); return vals.filter(v => v === 1).length; });
  const maxRisk = Math.max(1, ...dayRisk);
  const dayNames = ['Mon','Tue','Wed','Thu','Fri'];

  return (
    <div>
      <div style={{ padding:'4px 18px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:3, color:'var(--forest)', fontWeight:700, fontSize:16 }}><Icon name="back" size={21} color="var(--forest)" stroke={2.2} /> Back</button>
        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 11px', borderRadius:'var(--r-full)', background:'linear-gradient(180deg, var(--gold), var(--gold-deep))', color:'#3a2a06', fontWeight:800, fontSize:11.5, letterSpacing:'0.04em' }}><Icon name="crown" size={14} color="#3a2a06" stroke={2.2} /> PREMIUM</span>
      </div>
      <div style={{ padding:'8px 22px 0' }}>
        <div style={{ fontSize:13, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold-deep)' }}>Deep insights</div>
        <h1 style={{ fontFamily:'var(--font-ui)', fontSize:30, fontWeight:800, letterSpacing:'-0.02em', color:'var(--ink)', margin:'2px 0 0' }}>Forecast & Analytics</h1>
      </div>
      <div style={{ padding:'14px 18px 4px' }}>
        <Segmented options={[{value:'forecast',label:'Forecast'},{value:'patterns',label:'Patterns'},{value:'records',label:'Records'}]} value={tab} onChange={setTab} />
      </div>

      {tab === 'forecast' && <ForecastTab {...{ rows, overall, atRisk, attend, setAttend, ctx }} />}
      {tab === 'patterns' && <PatternsTab {...{ dayRisk, maxRisk, dayNames, ctx }} />}
      {tab === 'records' && <RecordsTab {...{ ctx }} />}

      <div style={{ height:24 }} />
    </div>
  );
}

// ---------- FORECAST TAB ----------
function ForecastTab({ rows, overall, atRisk, attend, setAttend, ctx }) {
  const finalsDays = 39;
  return (
    <>
      <div style={{ padding:'12px 18px 0' }}>
        <Card glow style={{ background:'linear-gradient(160deg, var(--forest-soft), var(--card))' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:6 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--ink-2)' }}>Projected finish</div>
              <div className="font-display tnum" style={{ fontSize:46, fontWeight:600, lineHeight:0.95, color: overall>=85?'var(--present)':overall>=78?'var(--late)':'var(--risk-danger)' }}>{overall}%</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:12.5, fontWeight:700, color:'var(--gold-deep)' }}>● target 85%</div>
              <div style={{ fontSize:12.5, fontWeight:600, color:'var(--ink-3)', marginTop:2 }}>{atRisk.length === 0 ? 'All classes on track' : `${atRisk.length} class${atRisk.length>1?'es':''} at risk`}</div>
            </div>
          </div>
          <ForecastChart history={WEEK_TREND} projected={overall} />
          <div style={{ display:'flex', gap:8, marginTop:10 }}>
            {[['Best case', Math.min(100, overall+5), 'var(--present)'],['Likely', overall, 'var(--ink)'],['If you slip', Math.max(40, overall-9), 'var(--risk-danger)']].map(([l,v,col]) => (
              <div key={l} style={{ flex:1, textAlign:'center', padding:'9px 4px', borderRadius:'var(--r-field)', background:'var(--card-2)', border:'0.5px solid var(--hairline)' }}>
                <div className="tnum" style={{ fontSize:18, fontWeight:800, color:col }}>{v}%</div>
                <div style={{ fontSize:10.5, fontWeight:700, color:'var(--ink-3)' }}>{l}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* finals countdown */}
      <div style={{ padding:'14px 18px 0' }}>
        <Card style={{ display:'flex', alignItems:'center', gap:14, background:'linear-gradient(155deg, var(--gold-soft), var(--card))' }}>
          <div style={{ width:50, height:50, borderRadius:'var(--r-field)', background:'rgba(255,255,255,0.6)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span className="font-display tnum" style={{ fontSize:22, fontWeight:700, color:'var(--gold-deep)', lineHeight:1 }}>{finalsDays}</span>
            <span style={{ fontSize:9, fontWeight:800, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'0.05em' }}>days</span>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:800, color:'var(--ink)' }}>Until finals week</div>
            <div style={{ fontSize:13.5, color:'var(--ink-2)', fontWeight:600 }}>~{Math.round(finalsDays/7*4)} more sessions across your classes</div>
          </div>
        </Card>
      </div>

      {/* what-if */}
      <div style={{ padding:'14px 18px 0' }}>
        <Card>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <Icon name="target" size={19} color="var(--gold-deep)" stroke={2} />
            <span style={{ fontSize:15, fontWeight:800, color:'var(--ink)' }}>What if…</span>
          </div>
          <p style={{ margin:'0 0 14px', fontSize:14, color:'var(--ink-2)', fontWeight:500, lineHeight:1.45 }}>
            If you attend <strong style={{ color:'var(--forest)' }}>{attend}%</strong> of your remaining classes, you'll finish around <strong style={{ color:'var(--ink)' }}>{overall}%</strong> overall.
          </p>
          <input type="range" min="0" max="100" value={attend} onChange={e=>setAttend(+e.target.value)} style={{ width:'100%', accentColor:'var(--gold-deep)' }} />
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, fontWeight:600, color:'var(--ink-3)', marginTop:2 }}><span>skip everything</span><span>perfect</span></div>
        </Card>
      </div>

      {/* per-class forecast with confidence + must-attend */}
      <div style={{ padding:'18px 22px 0' }}>
        <SectionTitle title="By class" trailing="projected" />
        <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:10 }}>
          {rows.slice().sort((a,b)=>a.projected-b.projected).map(({ c, current, projected, willPass, mustAttend, conf, remaining }) => (
            <Card key={c.id} pad={14} onClick={()=>ctx.push('classDetail',{classId:c.id})}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ width:10, height:10, borderRadius:'50%', background:c.hue, flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</div>
                  <div style={{ fontSize:12.5, fontWeight:600, color:'var(--ink-3)', display:'flex', alignItems:'center', gap:5, marginTop:2 }}>
                    now {current}% <Icon name="arrowRight" size={12} color="var(--ink-3)" stroke={2} /> <span style={{ color: willPass?'var(--present)':'var(--risk-danger)', fontWeight:800 }}>{projected}%</span>
                  </div>
                </div>
                <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'5px 10px', borderRadius:'var(--r-full)', background: willPass?'var(--present-soft)':'var(--absent-soft)', color: willPass?'var(--present)':'var(--risk-danger)', fontWeight:800, fontSize:12 }}>
                  <Icon name={willPass?'present':'target'} size={14} color={willPass?'var(--present)':'var(--risk-danger)'} stroke={2.2} /> {willPass?'On track':'At risk'}
                </span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:11, paddingTop:11, borderTop:'0.5px solid var(--hairline)' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--ink-3)', marginBottom:4 }}>Confidence {conf}%</div>
                  <Meter value={conf/100} tone="var(--gold-deep)" height={5} />
                </div>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--ink-2)', textAlign:'right', flexShrink:0 }}>
                  {mustAttend != null ? <>attend <strong style={{ color:'var(--forest)' }}>{Math.min(remaining, mustAttend)}</strong> of {remaining} left</> : <>buffer <strong style={{ color:'var(--forest)' }}>{buffer(c)}</strong> left</>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

// ---------- PATTERNS TAB ----------
function PatternsTab({ dayRisk, maxRisk, dayNames, ctx }) {
  const maxDow = Math.max(...DOW_RATE);
  const worstDow = DOW_RATE.indexOf(Math.min(...DOW_RATE));
  return (
    <>
      {/* attendance by weekday */}
      <div style={{ padding:'12px 18px 0' }}>
        <SectionTitle title="By weekday" trailing="attendance" />
        <Card style={{ marginTop:10 }}>
          <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:120 }}>
            {DOW_RATE.map((v, i) => (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:7, height:'100%', justifyContent:'flex-end' }}>
                <span className="tnum" style={{ fontSize:12, fontWeight:800, color: i===worstDow?'var(--risk-danger)':'var(--ink-2)' }}>{Math.round(v*100)}</span>
                <div style={{ width:'66%', height:`${(v/maxDow)*78+8}px`, borderRadius:7, background: i===worstDow?'linear-gradient(180deg, var(--late), var(--absent))':'linear-gradient(180deg, var(--moss), var(--forest))' }} />
                <span style={{ fontSize:11, fontWeight:700, color:'var(--ink-3)' }}>{dayNames[i]}</span>
              </div>
            ))}
          </div>
          <p style={{ margin:'12px 0 0', fontSize:13.5, color:'var(--ink-2)', fontWeight:500, lineHeight:1.45 }}>
            <strong style={{ color:'var(--ink)' }}>{dayNames[worstDow]}days</strong> are your weak spot — {Math.round(DOW_RATE[worstDow]*100)}% vs your {Math.round(maxDow*100)}% best. Protect that morning.
          </p>
        </Card>
      </div>

      {/* time-of-day */}
      <div style={{ padding:'16px 18px 0' }}>
        <SectionTitle title="By time of day" trailing="" />
        <Card style={{ marginTop:10, display:'flex', flexDirection:'column', gap:11 }}>
          {HOUR_BUCKETS.map(b => (
            <div key={b.label} style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ width:74, fontSize:12.5, fontWeight:700, color:'var(--ink-2)', flexShrink:0 }}>{b.label}</span>
              <div style={{ flex:1 }}><Meter value={b.rate} tone={b.rate>=0.9?'var(--present)':b.rate>=0.82?'var(--forest)':'var(--late)'} height={9} /></div>
              <span className="tnum" style={{ width:34, textAlign:'right', fontSize:13, fontWeight:800, color:'var(--ink)' }}>{Math.round(b.rate*100)}%</span>
            </div>
          ))}
          <div style={{ fontSize:12.5, color:'var(--ink-3)', fontWeight:600, marginTop:2 }}>Afternoon classes (2–4p) are hardest for you to make.</div>
        </Card>
      </div>

      {/* monthly momentum */}
      <div style={{ padding:'16px 18px 0' }}>
        <SectionTitle title="Monthly momentum" trailing="this term" />
        <Card style={{ marginTop:10 }}>
          <div style={{ display:'flex', alignItems:'flex-end', gap:12, height:96 }}>
            {MONTHLY.map((m,i) => (
              <div key={m.m} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, height:'100%', justifyContent:'flex-end' }}>
                <span className="tnum" style={{ fontSize:11.5, fontWeight:800, color:'var(--forest)' }}>{m.v}</span>
                <div style={{ width:'60%', height:`${(m.v-75)/25*72+6}px`, borderRadius:6, background:'linear-gradient(180deg, var(--gold), var(--gold-deep))' }} />
                <span style={{ fontSize:11, fontWeight:700, color:'var(--ink-3)' }}>{m.m}</span>
              </div>
            ))}
          </div>
          <p style={{ margin:'12px 0 0', fontSize:13.5, color:'var(--ink-2)', fontWeight:500, lineHeight:1.45 }}>You've improved <strong style={{ color:'var(--present)' }}>+9 points</strong> since January. Momentum is trending up.</p>
        </Card>
      </div>

      {/* skip-risk by weekday */}
      <div style={{ padding:'16px 18px 0' }}>
        <SectionTitle title="When you slip" trailing="absences" />
        <Card style={{ marginTop:10 }}>
          <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:84 }}>
            {dayRisk.map((v, i) => (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:7, height:'100%', justifyContent:'flex-end' }}>
                <div style={{ width:'72%', height:`${(v/maxRisk)*60+6}px`, borderRadius:7, background: v===maxRisk?'linear-gradient(180deg, var(--late), var(--absent))':'var(--forest-soft)', border: v===maxRisk?'none':'1px solid var(--hairline)' }} />
                <span style={{ fontSize:11, fontWeight:700, color:'var(--ink-3)' }}>{dayNames[i][0]}</span>
              </div>
            ))}
          </div>
          <p style={{ margin:'12px 0 0', fontSize:13.5, color:'var(--ink-2)', fontWeight:500, lineHeight:1.45 }}>
            Most absences land on <strong style={{ color:'var(--ink)' }}>{dayNames[dayRisk.indexOf(maxRisk)]}days</strong>. Set a sharper reminder the night before.
          </p>
        </Card>
      </div>
    </>
  );
}

// ---------- RECORDS TAB ----------
function RecordsTab({ ctx }) {
  const { classes } = ctx;
  const ranked = classes.slice().sort((a,b)=>pct(b)-pct(a));
  const overall = Math.round(classes.reduce((s,c)=>s+pct(c),0)/classes.length);
  return (
    <>
      {/* attendance GPA */}
      <div style={{ padding:'12px 18px 0' }}>
        <Card glow style={{ display:'flex', alignItems:'center', gap:18, background:'linear-gradient(160deg, var(--forest-soft), var(--card))' }}>
          <div style={{ width:84, height:84, borderRadius:'50%', flexShrink:0, background:'linear-gradient(150deg, var(--forest), var(--forest-deep))', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', boxShadow:'var(--e-forest)' }}>
            <span className="font-display" style={{ fontSize:32, fontWeight:600, color:'#fff', lineHeight:1 }}>{attendGrade(overall)}</span>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--gold-deep)' }}>Attendance grade</div>
            <div style={{ fontSize:16.5, fontWeight:700, color:'var(--ink)', marginTop:2 }}>{overall}% overall this term</div>
            <div style={{ fontSize:13.5, color:'var(--ink-2)', fontWeight:600 }}>Top 12% of your cohort</div>
          </div>
        </Card>
      </div>

      {/* streak records */}
      <div style={{ padding:'16px 18px 0' }}>
        <SectionTitle title="Streaks" trailing="" />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:11, marginTop:10 }}>
          {[['flame','Current', STREAKS.current, 'days'],['bolt','Longest ever', STREAKS.longest, 'days'],['sparkles','Term average', STREAKS.thisTermAvg, 'days'],['target','Freezes left', STREAKS.freezesLeft, 'available']].map(([ic,l,v,u]) => (
            <Card key={l} pad={15}>
              <Icon name={ic} size={20} color="var(--gold-deep)" stroke={2} />
              <div className="font-display tnum" style={{ fontSize:30, fontWeight:600, color:'var(--ink)', marginTop:6, lineHeight:1 }}>{v}</div>
              <div style={{ fontSize:12.5, fontWeight:700, color:'var(--ink-2)' }}>{l}</div>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--ink-3)' }}>{u}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* punctuality leaderboard */}
      <div style={{ padding:'16px 22px 0' }}>
        <SectionTitle title="Punctuality" trailing="on-time share" />
        <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:10 }}>
          {classes.slice().sort((a,b)=>punctuality(b)-punctuality(a)).map(c => {
            const p = Math.round(punctuality(c)*100);
            return (
              <Card key={c.id} pad={13} onClick={()=>ctx.push('classDetail',{classId:c.id})} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ width:10, height:10, borderRadius:'50%', background:c.hue, flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14.5, fontWeight:700, color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</div>
                  <div style={{ marginTop:6 }}><Meter value={punctuality(c)} tone={p>=95?'var(--present)':p>=85?'var(--forest)':'var(--late)'} height={6} /></div>
                </div>
                <span className="tnum" style={{ fontSize:15, fontWeight:800, color:'var(--ink)' }}>{p}%</span>
              </Card>
            );
          })}
        </div>
      </div>

      {/* best & worst */}
      <div style={{ padding:'16px 18px 0' }}>
        <div style={{ display:'flex', gap:11 }}>
          <Card pad={15} style={{ flex:1 }}>
            <Icon name="crown" size={19} color="var(--present)" stroke={2} />
            <div style={{ fontSize:11.5, fontWeight:800, letterSpacing:'0.05em', textTransform:'uppercase', color:'var(--present)', marginTop:6 }}>Strongest</div>
            <div style={{ fontSize:14.5, fontWeight:700, color:'var(--ink)', marginTop:2 }}>{ranked[0].name}</div>
            <div className="tnum" style={{ fontSize:13, fontWeight:700, color:'var(--ink-3)' }}>{pct(ranked[0])}%</div>
          </Card>
          <Card pad={15} style={{ flex:1 }}>
            <Icon name="target" size={19} color="var(--risk-danger)" stroke={2} />
            <div style={{ fontSize:11.5, fontWeight:800, letterSpacing:'0.05em', textTransform:'uppercase', color:'var(--risk-danger)', marginTop:6 }}>Needs work</div>
            <div style={{ fontSize:14.5, fontWeight:700, color:'var(--ink)', marginTop:2 }}>{ranked[ranked.length-1].name}</div>
            <div className="tnum" style={{ fontSize:13, fontWeight:700, color:'var(--ink-3)' }}>{pct(ranked[ranked.length-1])}%</div>
          </Card>
        </div>
      </div>
    </>
  );
}

window.PremiumAnalytics = PremiumAnalytics;
window.ForecastChart = ForecastChart;
