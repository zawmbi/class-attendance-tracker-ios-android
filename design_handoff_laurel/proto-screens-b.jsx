// ============================================================
// Laurel prototype — Class Detail · Trophy Case · Insights
// ============================================================
const { useState } = React;

// ---- CLASS DETAIL (overlay) ----
function ClassDetail({ ctx, classId, onBack }) {
  const c = ctx.classes.find(x => x.id === classId) || classById(classId);
  const r = riskOf(c), info = RISK[r], p = pct(c), b = buffer(c);
  const remaining = c.semTotal - c.held;
  const finalIfPerfect = Math.round(((c.present + c.late + remaining) / c.semTotal) * 100);
  const [history, setHistory] = useState([
    { d:'Fri, Mar 1', s:'present' }, { d:'Wed, Feb 28', s:'present' }, { d:'Mon, Feb 26', s:'late' },
    { d:'Fri, Feb 23', s:'absent' }, { d:'Wed, Feb 21', s:'present' }, { d:'Mon, Feb 19', s:'present' },
  ]);
  const [editRec, setEditRec] = useState(null); // index of record being edited
  const changeRecord = (idx, to) => {
    const from = history[idx].s;
    if (from === to) { setEditRec(null); return; }
    setHistory(h => h.map((r, i) => i === idx ? { ...r, s: to } : r));
    ctx.updateClass(classId, (nc) => {
      nc[from] = Math.max(0, nc[from] - 1); nc[to] = nc[to] + 1; return nc;
    });
    setEditRec(null);
  };
  return (
    <div>
      <div style={{ padding:'4px 18px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:3, color:'var(--forest)', fontWeight:700, fontSize:16 }}><Icon name="back" size={21} color="var(--forest)" stroke={2.2} /> Today</button>
        <IconBtn name="edit" onClick={() => ctx.push('addClass', { classId })} label="Edit class" />
      </div>
      <div style={{ padding:'10px 22px 0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <span style={{ width:10, height:10, borderRadius:'50%', background:c.hue }} />
          <span style={{ fontSize:13, fontWeight:800, letterSpacing:'0.06em', color:'var(--ink-3)' }}>{c.code} · {c.room}</span>
        </div>
        <h1 style={{ fontFamily:'var(--font-ui)', fontSize:28, fontWeight:800, letterSpacing:'-0.02em', color:'var(--ink)', margin:0, lineHeight:1.08 }}>{c.name}</h1>
        <div style={{ fontSize:14, color:'var(--ink-2)', fontWeight:600, marginTop:3 }}>{c.prof} · {c.days.join(' · ')} · {c.time}</div>
      </div>

      {/* hero: % + buffer gauge */}
      <div style={{ padding:'16px 18px 0' }}>
        <Card glow style={{ display:'flex', alignItems:'center', gap:6, padding:'18px 16px' }}>
          <div style={{ flex:1, textAlign:'center' }}>
            <div className="font-display tnum" style={{ fontSize:54, fontWeight:600, lineHeight:0.9, color:info.c }}>{p}<span style={{ fontSize:24, color:'var(--ink-3)' }}>%</span></div>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--ink-2)', marginTop:2 }}>attendance</div>
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, marginTop:8, padding:'5px 11px', borderRadius:'var(--r-full)', background:info.soft, color:info.c, fontWeight:800, fontSize:12.5 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:info.c }} /> {info.label}
            </span>
            <div style={{ fontSize:12, color:'var(--ink-3)', fontWeight:600, marginTop:6 }}>{c.reqMode === 'count' ? `Miss ≤ ${(c.maxAbsences||0)+(c.excused||0)}` : `Target ${c.target}%`}</div>
          </div>
          <div style={{ width:1, alignSelf:'stretch', background:'var(--hairline)', margin:'4px 0' }} />
          <div style={{ flex:1.05, display:'flex', justifyContent:'center' }}>
            <BufferGauge canMiss={b} total={Math.max(b+1, Math.floor(c.semTotal*(1-c.target/100)))} size={158} label="more you can miss" />
          </div>
        </Card>
      </div>

      {/* counts */}
      <div style={{ padding:'12px 18px 0', display:'flex', gap:10 }}>
        {[['present', c.present, 'Present'],['late', c.late, 'Late'],['absent', c.absent, 'Absent']].map(([ic, v, l]) => {
          const tone = ic==='present'?'var(--present)':ic==='late'?'var(--late)':'var(--absent)';
          return (
            <Card key={l} pad={13} style={{ flex:1, textAlign:'center' }}>
              <Icon name={ic} size={20} color={tone} stroke={2} style={{ margin:'0 auto 5px' }} />
              <div className="tnum" style={{ fontSize:22, fontWeight:800, color:'var(--ink)' }}>{v}</div>
              <div style={{ fontSize:11.5, fontWeight:600, color:'var(--ink-3)' }}>{l}</div>
            </Card>
          );
        })}
      </div>

      {/* projection */}
      <div style={{ padding:'16px 18px 0' }}>
        <Card style={{ background:'linear-gradient(155deg, var(--forest-soft), var(--card))' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <Icon name="chart" size={19} color="var(--forest)" stroke={2} />
            <span style={{ fontSize:14.5, fontWeight:800, color:'var(--forest)' }}>Projection</span>
          </div>
          <p style={{ margin:0, fontSize:15, lineHeight:1.5, color:'var(--ink)', fontWeight:500 }}>
            {remaining} classes left this semester. Attend them all and you finish at <strong>{finalIfPerfect}%</strong>. {b > 0 ? <>You can still miss <strong>{b}</strong> and stay {c.reqMode === 'count' ? 'within your limit' : `above your ${c.target}% target`}.</> : <>You're at your limit — every remaining class counts.</>}
          </p>
        </Card>
      </div>

      {/* history */}
      <div style={{ padding:'18px 22px 0' }}>
        <SectionTitle title="History" trailing="Tap to edit" />
        <Card pad={6} style={{ marginTop:10 }}>
          {history.map((h, i) => (
            <div key={i}>
              <div className="pressable" onClick={() => setEditRec(i)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 10px', cursor:'pointer' }}>
                <span style={{ fontSize:15, fontWeight:600, color:'var(--ink)' }}>{h.d}</span>
                <span style={{ display:'flex', alignItems:'center', gap:7 }}><StatusPill status={h.s} size="sm" /><Icon name="chevron" size={15} color="var(--ink-3)" stroke={2} /></span>
              </div>
              {i < history.length - 1 && <div style={{ height:0.5, background:'var(--hairline)' }} />}
            </div>
          ))}
        </Card>
      </div>

      <Sheet open={editRec !== null} onClose={() => setEditRec(null)}>
        {editRec !== null && (
          <div style={{ padding:'2px 4px 0' }}>
            <div style={{ fontSize:13, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--gold-deep)', marginBottom:2 }}>{history[editRec].d}</div>
            <div style={{ fontSize:19, fontWeight:800, color:'var(--ink)', marginBottom:16 }}>Edit attendance</div>
            <div style={{ display:'flex', gap:10 }}>
              {[['present','Present'],['late','Late'],['absent','Absent']].map(([st, lbl]) => {
                const on = history[editRec].s === st;
                const tone = st==='present'?'var(--present)':st==='late'?'var(--late)':'var(--absent)';
                const soft = st==='present'?'var(--present-soft)':st==='late'?'var(--late-soft)':'var(--absent-soft)';
                return (
                  <button key={st} className="pressable" onClick={() => changeRecord(editRec, st)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'16px 4px', borderRadius:'var(--r-field)', border: on?`2px solid ${tone}`:'1.5px solid var(--hairline)', background: on?soft:'var(--card-2)', cursor:'pointer' }}>
                    <Icon name={st} size={26} color={on?tone:'var(--ink-3)'} stroke={2} />
                    <span style={{ fontSize:13, fontWeight:800, color: on?tone:'var(--ink-2)' }}>{lbl}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

// ---- TROPHY CASE (tab) ----
function TrophyCase({ ctx }) {
  const { user } = ctx;
  const cur = LADDER.findIndex(l => l.current);
  const next = LADDER[cur + 1];
  const [sel, setSel] = useState(null);
  return (
    <div>
      <Header title="Trophy Case" kicker="Rank & achievements" />
      {/* rank progression */}
      <div style={{ padding:'8px 18px 0' }}>
        <div className="grain" style={{ position:'relative', borderRadius:'var(--r-card-lg)', overflow:'hidden', padding:'20px', background:'linear-gradient(150deg, oklch(0.27 0.038 170), var(--forest-deep))', boxShadow:'var(--e-forest)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, position:'relative' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(150deg, var(--gold), var(--gold-deep))', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--e-gold)', flexShrink:0 }}>
              <Icon name="laurel" size={36} color="#fff" stroke={1.9} />
            </div>
            <div style={{ color:'#fff' }}>
              <div style={{ fontSize:12.5, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'oklch(0.88 0.10 85)' }}>Current rank</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:30, fontWeight:600, lineHeight:1 }}>{user.rank}</div>
              <div style={{ fontSize:13, fontWeight:600, color:'oklch(0.88 0.03 120)', marginTop:3 }}>Level {user.level} · {next ? `${next.lvl - user.level} levels to ${next.name}` : 'Top rank'}</div>
            </div>
          </div>
          {/* ladder */}
          <div style={{ display:'flex', alignItems:'center', gap:0, marginTop:18, position:'relative' }}>
            {LADDER.map((l, i) => (
              <React.Fragment key={l.name}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, flexShrink:0 }}>
                  <div style={{ width:l.current?28:20, height:l.current?28:20, borderRadius:'50%', background: l.done?'var(--gold)':'rgba(255,255,255,0.18)', border: l.current?'3px solid #fff':'none', display:'flex', alignItems:'center', justifyContent:'center', boxShadow: l.current?'var(--e-gold)':'none' }}>
                    {l.done && !l.current && <Icon name="present" size={13} color="var(--forest-deep)" stroke={3} />}
                  </div>
                </div>
                {i < LADDER.length - 1 && <div style={{ flex:1, height:3, background: LADDER[i+1].done?'var(--gold)':'rgba(255,255,255,0.18)' }} />}
              </React.Fragment>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:7 }}>
            <span style={{ fontSize:10.5, fontWeight:700, color:'oklch(0.86 0.04 120)' }}>Freshman</span>
            <span style={{ fontSize:10.5, fontWeight:700, color:'oklch(0.88 0.10 85)' }}>Valedictorian</span>
          </div>
        </div>
      </div>

      {/* badges */}
      <div style={{ padding:'20px 22px 0' }}>
        <SectionTitle title="Badges" trailing={`${BADGES.filter(b=>b.unlocked).length}/${BADGES.length}`} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginTop:12 }}>
          {BADGES.map(b => (
            <button key={b.id} onClick={() => setSel(b)} style={{ border:'none', background:'none', cursor:'pointer', padding:0, textAlign:'center' }}>
              <div style={{ aspectRatio:'1', borderRadius:'var(--r-card)', background: b.unlocked?'linear-gradient(160deg, var(--gold-soft), var(--card))':'var(--paper-2)', border:'0.5px solid var(--hairline)', boxShadow: b.unlocked?'var(--e2)':'none', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', marginBottom:7 }}>
                <div style={{ width:'52%', aspectRatio:'1', borderRadius:'50%', background: b.unlocked?'linear-gradient(150deg, var(--gold), var(--gold-deep))':'var(--hairline)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow: b.unlocked?'var(--e-gold)':'none' }}>
                  <Icon name={b.unlocked?b.icon:'lock'} size={26} color={b.unlocked?'#fff':'var(--ink-3)'} stroke={2} />
                </div>
                {!b.unlocked && b.progress && (
                  <div style={{ position:'absolute', bottom:8, left:10, right:10, height:4, borderRadius:99, background:'var(--hairline)', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${b.progress*100}%`, background:'var(--gold-deep)', borderRadius:99 }} />
                  </div>
                )}
              </div>
              <div style={{ fontSize:11.5, fontWeight:700, color: b.unlocked?'var(--ink)':'var(--ink-3)', lineHeight:1.15 }}>{b.name}</div>
            </button>
          ))}
        </div>
      </div>

      <Sheet open={!!sel} onClose={() => setSel(null)}>
        {sel && (
          <div style={{ textAlign:'center', padding:'4px 8px 0' }}>
            <div style={{ width:90, height:90, borderRadius:'50%', margin:'0 auto 14px', background: sel.unlocked?'linear-gradient(150deg, var(--gold), var(--gold-deep))':'var(--paper-2)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow: sel.unlocked?'var(--e-gold)':'none' }}>
              <Icon name={sel.unlocked?sel.icon:'lock'} size={42} color={sel.unlocked?'#fff':'var(--ink-3)'} stroke={1.9} />
            </div>
            <div style={{ fontSize:12.5, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--gold-deep)' }}>{sel.rarity}</div>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:600, color:'var(--ink)', margin:'4px 0 6px' }}>{sel.name}</h3>
            <p style={{ fontSize:15, color:'var(--ink-2)', fontWeight:500, margin:'0 0 14px' }}>{sel.desc}</p>
            {!sel.unlocked && sel.progress && (
              <div style={{ padding:'0 20px' }}><Meter value={sel.progress} tone="var(--gold-deep)" /><div style={{ fontSize:12.5, fontWeight:700, color:'var(--ink-3)', marginTop:6 }}>{Math.round(sel.progress*100)}% there</div></div>
            )}
            {sel.unlocked && <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:'var(--r-full)', background:'var(--present-soft)', color:'var(--present)', fontWeight:800, fontSize:14 }}><Icon name="present" size={17} color="var(--present)" stroke={2.4} /> Unlocked</span>}
          </div>
        )}
      </Sheet>
    </div>
  );
}

// ---- INSIGHTS (tab) ----
function Insights({ ctx }) {
  const { classes } = ctx;
  const overall = Math.round(classes.reduce((s,c)=>s+pct(c),0)/classes.length);
  const sorted = [...classes].sort((a,b)=>buffer(a)-buffer(b));
  const worst = sorted[0];
  return (
    <div>
      <Header title="Insights" kicker="Your patterns" />
      {/* overall + trend */}
      <div style={{ padding:'8px 18px 0' }}>
        <Card glow style={{ display:'flex', alignItems:'center', gap:16, padding:'18px' }}>
          <div style={{ textAlign:'center' }}>
            <div className="font-display tnum" style={{ fontSize:50, fontWeight:600, lineHeight:0.9, color:'var(--forest)' }}>{overall}<span style={{ fontSize:22, color:'var(--ink-3)' }}>%</span></div>
            <div style={{ fontSize:12.5, fontWeight:700, color:'var(--ink-2)' }}>overall</div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
              <Icon name="arrowUp" size={16} color="var(--present)" stroke={2.4} />
              <span style={{ fontSize:13.5, fontWeight:700, color:'var(--present)' }}>+6% vs last month</span>
            </div>
            <Sparkline data={WEEK_TREND} w={170} h={48} tone="var(--forest)" />
            <div style={{ fontSize:11.5, color:'var(--ink-3)', fontWeight:600, marginTop:2 }}>12-week trend</div>
          </div>
        </Card>
      </div>

      {/* forecast: locked teaser (free) → live entry (premium) */}
      <div style={{ padding:'16px 18px 0' }}>
        {ctx.user.premium ? (
          <div onClick={() => ctx.push('premiumAnalytics')} className="pressable grain" style={{ position:'relative', overflow:'hidden', cursor:'pointer', borderRadius:'var(--r-card)', padding:'18px', background:'linear-gradient(150deg, var(--forest), var(--forest-deep))', boxShadow:'var(--e-forest)' }}>
            <div style={{ position:'absolute', top:-30, right:-20, width:140, height:140, borderRadius:'50%', background:'radial-gradient(circle, oklch(0.8 0.13 79 / 0.20), transparent 70%)' }} />
            <div style={{ position:'relative', display:'flex', alignItems:'center', gap:13 }}>
              <div style={{ width:46, height:46, borderRadius:13, background:'linear-gradient(150deg, var(--gold), var(--gold-deep))', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--e-gold)', flexShrink:0 }}>
                <Icon name="chart" size={24} color="#fff" stroke={2} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ color:'#fff', fontWeight:800, fontSize:16 }}>End-of-term Forecast</div>
                <div style={{ color:'oklch(0.84 0.03 120)', fontSize:13, fontWeight:600, marginTop:2 }}>Projections, what-if & deep patterns</div>
              </div>
              <Icon name="chevron" size={20} color="var(--gold)" stroke={2.4} />
            </div>
          </div>
        ) : (
          <div onClick={() => ctx.push('premium')} className="pressable grain" style={{ position:'relative', overflow:'hidden', cursor:'pointer', borderRadius:'var(--r-card)', padding:'18px', background:'linear-gradient(150deg, oklch(0.27 0.038 170), var(--forest-deep))', boxShadow:'var(--e-forest)' }}>
            <div style={{ position:'absolute', top:-30, right:-20, width:140, height:140, borderRadius:'50%', background:'radial-gradient(circle, oklch(0.8 0.13 79 / 0.22), transparent 70%)' }} />
            <div style={{ position:'relative', display:'flex', alignItems:'center', gap:13 }}>
              <div style={{ width:46, height:46, borderRadius:13, background:'linear-gradient(150deg, var(--gold), var(--gold-deep))', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--e-gold)', flexShrink:0 }}>
                <Icon name="chart" size={24} color="#fff" stroke={2} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <span style={{ color:'#fff', fontWeight:800, fontSize:16 }}>End-of-term Forecast</span>
                  <Icon name="lock" size={14} color="var(--gold)" stroke={2.2} />
                </div>
                <div style={{ color:'oklch(0.84 0.03 120)', fontSize:13, fontWeight:600, marginTop:2 }}>Projections, what-if & deep patterns</div>
              </div>
              <span style={{ fontSize:11, fontWeight:800, letterSpacing:'0.04em', color:'#3a2a06', background:'linear-gradient(180deg, var(--gold), var(--gold-deep))', padding:'4px 9px', borderRadius:'var(--r-full)' }}>PREMIUM</span>
            </div>
            <div style={{ position:'relative', display:'flex', gap:8, marginTop:14, filter:'blur(3px)', opacity:0.65, pointerEvents:'none' }}>
              {[['92%','likely'],['+9','since Jan'],['Tue','weak spot']].map(([v,l]) => (
                <div key={l} style={{ flex:1, textAlign:'center', padding:'8px 4px', borderRadius:'var(--r-field)', background:'rgba(255,255,255,0.1)' }}>
                  <div className="tnum" style={{ fontSize:17, fontWeight:800, color:'#fff' }}>{v}</div>
                  <div style={{ fontSize:10, fontWeight:700, color:'oklch(0.8 0.03 120)' }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', gap:5, marginTop:12, color:'var(--gold)', fontWeight:800, fontSize:13.5 }}>
              Unlock with Premium <Icon name="chevron" size={15} color="var(--gold)" stroke={2.4} />
            </div>
          </div>
        )}
      </div>

      {/* priorities */}
      <div style={{ padding:'16px 18px 0' }}>
        <SectionTitle title="What to prioritize" trailing="" />
        <Card onClick={() => ctx.push('classDetail', { classId: worst.id })} style={{ marginTop:10, display:'flex', alignItems:'center', gap:13, borderLeft:`4px solid ${RISK[riskOf(worst)].c}` }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:700, color:'var(--ink)' }}>{worst.name}</div>
            <div style={{ fontSize:13.5, color:'var(--ink-2)', fontWeight:600, marginTop:2 }}>{buffer(worst) === 0 ? 'No buffer left — protect every class' : `${buffer(worst)} classes of buffer left`}</div>
          </div>
          <div className="tnum" style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:700, color:RISK[riskOf(worst)].c }}>{pct(worst)}%</div>
        </Card>
      </div>

      {/* heatmap */}
      <div style={{ padding:'18px 18px 0' }}>
        <SectionTitle title="Consistency" trailing="12 weeks" />
        <Card style={{ marginTop:10 }}>
          <div style={{ display:'flex', gap:5, justifyContent:'space-between' }}>
            {['M','T','W','T','F'].map((d,i) => (
              <div key={i} style={{ flex:1 }}>
                <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                  {HEAT.filter((_,idx)=>idx%5===i).slice(0,12).map((v,wi) => {
                    const col = v===0?'var(--hairline)':v===1?'var(--absent)':v===2?'var(--late)':'var(--present)';
                    return <div key={wi} style={{ aspectRatio:'1', borderRadius:5, background:col, opacity:v===0?0.5:0.9 }} />;
                  })}
                </div>
                <div style={{ textAlign:'center', fontSize:11, fontWeight:700, color:'var(--ink-3)', marginTop:6 }}>{d}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:14, marginTop:14, justifyContent:'center' }}>
            {[['present','Present'],['late','Late'],['absent','Absent']].map(([ic,l]) => (
              <span key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11.5, fontWeight:600, color:'var(--ink-3)' }}>
                <span style={{ width:10, height:10, borderRadius:3, background: ic==='present'?'var(--present)':ic==='late'?'var(--late)':'var(--absent)' }} /> {l}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* per-class */}
      <div style={{ padding:'18px 22px 0' }}>
        <SectionTitle title="By class" trailing="" />
        <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:10 }}>
          {sorted.map(c => (
            <Card key={c.id} pad={14} onClick={() => ctx.push('classDetail', { classId: c.id })} style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ width:10, height:10, borderRadius:'50%', background:c.hue, flexShrink:0 }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14.5, fontWeight:700, color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</div>
                <div style={{ marginTop:6 }}><Meter value={pct(c)/100} tone={RISK[riskOf(c)].c} height={6} /></div>
              </div>
              <span className="tnum" style={{ fontSize:16, fontWeight:800, color:RISK[riskOf(c)].c }}>{pct(c)}%</span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ClassDetail, TrophyCase, Insights });
