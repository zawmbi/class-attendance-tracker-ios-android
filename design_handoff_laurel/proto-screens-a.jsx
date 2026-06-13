// ============================================================
// Laurel prototype — Dashboard (Today) + Quick Check-In
// ============================================================
const { useState, useEffect, useRef } = React;

// shared: a today class row with status / quick check-in
function TodayRow({ ctx, item, onTap, onLongPress, swipe }) {
  const c = classById(item.classId);
  const logged = !!item.status;
  const [dx, setDx] = useState(0);
  const g = useRef({ down:false, x0:0, moved:false, timer:null });
  const body = (
    <>
      <div className="tnum" style={{ width:52, fontSize:14, fontWeight:700, color:'var(--ink-3)' }}>{item.time}</div>
      <div style={{ width:4, alignSelf:'stretch', borderRadius:2, background:c.hue, opacity:0.9 }} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</div>
        <div style={{ fontSize:13, color:'var(--ink-3)', fontWeight:600 }}>{c.code} · {c.room}</div>
      </div>
      {logged ? <StatusPill status={item.status} size="sm" />
        : <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:13.5, fontWeight:800, color:'var(--forest)', background:'var(--forest-soft)', padding:'6px 12px', borderRadius:'var(--r-full)' }}>Check in <Icon name="chevron" size={14} color="var(--forest)" stroke={2.4} /></span>}
    </>
  );

  // simple tap row (logged items, iPad, or reduced motion)
  if (logged || !swipe || ctx.reduce) {
    return <div onClick={onTap} style={{ display:'flex', alignItems:'center', gap:13, padding:'13px 4px', cursor:'pointer' }}>{body}</div>;
  }

  // swipe-to-log + long-press
  const down = (e) => { g.current = { down:true, x0:e.clientX, moved:false }; e.currentTarget.setPointerCapture?.(e.pointerId);
    g.current.timer = setTimeout(() => { if (g.current.down && !g.current.moved) { g.current.down = false; setDx(0); onLongPress && onLongPress(); } }, 460); };
  const move = (e) => { if (!g.current.down) return; const d = e.clientX - g.current.x0; if (Math.abs(d) > 6) { g.current.moved = true; clearTimeout(g.current.timer); } setDx(Math.max(-118, Math.min(118, d))); };
  const up = () => { if (!g.current.down) { setDx(0); return; } clearTimeout(g.current.timer); g.current.down = false; const d = dx;
    if (d > 72) ctx.quickLog(item, 'present'); else if (d < -72) ctx.quickLog(item, 'absent'); else if (!g.current.moved) onTap && onTap(); setDx(0); };
  const hint = (st, side) => { const tone = st==='present'?'var(--present)':'var(--absent)'; const soft = st==='present'?'var(--present-soft)':'var(--absent-soft)';
    return <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent: side==='l'?'flex-start':'flex-end', gap:6, padding:'0 16px', background:soft, color:tone, fontWeight:800, fontSize:13 }}><Icon name={st} size={18} color={tone} stroke={2} />{st==='present'?'Present':'Absent'}</div>; };
  return (
    <div style={{ position:'relative', overflow:'hidden', borderRadius:'var(--r-field)' }}>
      <div style={{ position:'absolute', inset:0, display:'flex' }}>{hint('present','l')}{hint('absent','r')}</div>
      <div onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        style={{ display:'flex', alignItems:'center', gap:13, padding:'13px 4px', cursor:'grab', position:'relative', background:'var(--card)', transform:`translateX(${dx}px)`, transition: g.current.down ? 'none' : 'transform 220ms var(--ease-out)', touchAction:'pan-y' }}>
        {body}
      </div>
    </div>
  );
}

function Dashboard({ ctx }) {
  const { user, today, classes } = ctx;
  const logged = today.filter(t => t.status).length;
  const atRisk = classes.filter(c => riskOf(c) === 'danger');
  const recent = BADGES.filter(b => b.unlocked).slice(0, 4);
  const next = LADDER.find(l => !l.done);
  const [quick, setQuick] = useState(null);

  return (
    <div>
      {/* greeting */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'8px 22px 14px' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold-deep)' }}>Monday · Mar 4</div>
          <h1 style={{ fontFamily:'var(--font-ui)', fontSize:30, fontWeight:800, letterSpacing:'-0.02em', color:'var(--ink)', margin:'2px 0 0' }}>Morning, {user.name}</h1>
        </div>
        <button onClick={() => ctx.push('settings')} aria-label="Profile" style={{ flexShrink:0, width:46, height:46, borderRadius:'var(--r-full)', border:'2px solid var(--card)', boxShadow:'var(--e2)', background:'linear-gradient(150deg, var(--moss), var(--forest-deep))', color:'#fff', fontWeight:800, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{user.name[0]}</button>
      </div>

      {/* MOMENTUM HERO */}
      <div style={{ padding:'0 18px' }}>
        <div className="grain" style={{ position:'relative', borderRadius:'var(--r-card-lg)', overflow:'hidden', padding:'20px 20px 18px', background:'linear-gradient(155deg, var(--forest) 0%, var(--forest-deep) 70%, oklch(0.25 0.035 170) 100%)', boxShadow:'var(--e-forest)' }}>
          <div style={{ position:'absolute', top:-40, right:-30, width:160, height:160, borderRadius:'50%', background:'radial-gradient(circle, oklch(0.8 0.13 79 / 0.28), transparent 70%)' }} />
          <div style={{ display:'flex', alignItems:'center', gap:18, position:'relative' }}>
            <MomentumRing size={132} level={user.level} xp={user.xp} xpMax={user.xpMax} streak={user.streak} rank={user.rank} />
            <div style={{ flex:1, color:'#fff' }}>
              <div style={{ fontSize:12.5, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:'oklch(0.88 0.10 85)' }}>Momentum</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:25, fontWeight:600, lineHeight:1.1, margin:'2px 0 8px' }}>You're on a roll.</div>
              <div style={{ display:'flex', gap:8 }}>
                <Stat icon="flame" v={user.streak} l="day streak" />
                <Stat icon="target" v={user.freezes ?? 0} l="freezes" />
              </div>
            </div>
          </div>
          <div style={{ marginTop:14, position:'relative' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5, fontWeight:700, color:'oklch(0.9 0.03 120)', marginBottom:6 }}>
              <span>{user.xpMax - user.xp} XP to Level {user.level + 1}</span>
              <span>Next rank: {next?.name} · Lv {next?.lvl}</span>
            </div>
            <div style={{ height:7, borderRadius:99, background:'rgba(255,255,255,0.18)', overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${(user.xp/user.xpMax)*100}%`, borderRadius:99, background:'linear-gradient(90deg, var(--gold), oklch(0.88 0.12 88))', transition:'width 0.9s var(--ease-out)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* AT RISK / buffer teaser */}
      {atRisk.length > 0 && (
        <div style={{ padding:'14px 18px 0' }}>
          <Card onClick={() => ctx.push('classDetail', { classId: atRisk[0].id })} glow style={{ display:'flex', alignItems:'center', gap:14, borderLeft:'none', background:'var(--card)' }}>
            <div style={{ width:46, height:46, borderRadius:'var(--r-field)', background:'var(--absent-soft)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon name="target" size={24} color="var(--risk-danger)" stroke={2} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12.5, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--risk-danger)' }}>Needs attention</div>
              <div style={{ fontSize:15.5, fontWeight:700, color:'var(--ink)', marginTop:1 }}>{atRisk[0].name}</div>
              <div style={{ fontSize:13.5, color:'var(--ink-2)', fontWeight:600 }}>Buffer empty — can't miss any more</div>
            </div>
            <Icon name="chevron" size={20} color="var(--ink-3)" stroke={2.2} />
          </Card>
        </div>
      )}

      {/* TODAY */}
      <div style={{ padding:'20px 22px 0' }}>
        <SectionTitle title="Today" trailing={`${logged} of ${today.length} logged`} onAction={() => ctx.openCheckIn()} actionLabel="Check in all" />
        <Card pad={6} style={{ marginTop:10 }}>
          {today.map((t, i) => (
            <div key={t.id}>
              <TodayRow ctx={ctx} item={t} swipe onTap={() => ctx.push('classDetail', { classId: t.classId })} onLongPress={() => setQuick(t)} />
              {i < today.length - 1 && <div style={{ height:0.5, background:'var(--hairline)', marginLeft:69 }} />}
            </div>
          ))}
        </Card>
        {today.some(t => !t.status) && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:9, fontSize:12, fontWeight:600, color:'var(--ink-3)' }}>
            <Icon name="arrowRight" size={14} color="var(--ink-3)" stroke={2} /> Swipe a class to log · long-press for options
          </div>
        )}
      </div>
      <div style={{ padding:'22px 0 6px' }}>
        <div style={{ padding:'0 22px' }}><SectionTitle title="Trophy case" trailing="See all" onAction={() => ctx.setTab('trophy')} /></div>
        <div className="hide-scroll" style={{ display:'flex', gap:12, overflowX:'auto', padding:'12px 22px 4px' }}>
          {recent.map(b => (
            <div key={b.id} style={{ flexShrink:0, width:104, textAlign:'center' }}>
              <div style={{ width:104, height:104, borderRadius:'var(--r-card)', background:'linear-gradient(160deg, var(--gold-soft), var(--card))', border:'0.5px solid var(--hairline)', boxShadow:'var(--e2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:7 }}>
                <div style={{ width:62, height:62, borderRadius:'50%', background:'linear-gradient(150deg, var(--gold), var(--gold-deep))', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--e-gold)' }}>
                  <Icon name={b.icon} size={30} color="#fff" stroke={2} />
                </div>
              </div>
              <div style={{ fontSize:12.5, fontWeight:700, color:'var(--ink)', lineHeight:1.15 }}>{b.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK-LOG SHEET */}
      <Sheet open={!!quick} onClose={() => setQuick(null)}>
        {quick && (() => { const c = classById(quick.classId); return (
          <div style={{ padding:'2px 4px 0' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
              <div style={{ width:44, height:44, borderRadius:'var(--r-field)', background:c.hue, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span className="tnum" style={{ color:'#fff', fontWeight:800, fontSize:13 }}>{quick.time}</span></div>
              <div><div style={{ fontSize:18, fontWeight:800, color:'var(--ink)' }}>{c.name}</div><div style={{ fontSize:13.5, color:'var(--ink-3)', fontWeight:600 }}>How did this class go?</div></div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              {[['present','Present'],['late','Late'],['absent','Absent']].map(([st, lbl]) => {
                const tone = st==='present'?'var(--present)':st==='late'?'var(--late)':'var(--absent)';
                const soft = st==='present'?'var(--present-soft)':st==='late'?'var(--late-soft)':'var(--absent-soft)';
                return (
                  <button key={st} className="pressable" onClick={() => { ctx.quickLog(quick, st); setQuick(null); }} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'16px 4px', borderRadius:'var(--r-field)', border:`1.5px solid ${soft}`, background:soft, cursor:'pointer' }}>
                    <Icon name={st} size={26} color={tone} stroke={2} />
                    <span style={{ fontSize:13, fontWeight:800, color:tone }}>{lbl}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ); })()}
      </Sheet>
    </div>
  );
}

function Stat({ icon, v, l }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.14)', borderRadius:'var(--r-field)', padding:'7px 11px', backdropFilter:'blur(4px)', flex:1 }}>
      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
        <Icon name={icon} size={16} color="oklch(0.9 0.11 85)" stroke={2.2} />
        <span className="tnum" style={{ fontSize:18, fontWeight:800, color:'#fff' }}>{v}</span>
      </div>
      <div style={{ fontSize:11, fontWeight:600, color:'oklch(0.88 0.03 120)', marginTop:1 }}>{l}</div>
    </div>
  );
}

function SectionTitle({ title, trailing, onAction, actionLabel }) {
  return (
    <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
      <h2 style={{ fontFamily:'var(--font-ui)', fontSize:21, fontWeight:800, letterSpacing:'-0.01em', color:'var(--ink)', margin:0 }}>{title}</h2>
      <button onClick={onAction} style={{ background:'none', border:'none', cursor:'pointer', fontSize:14, fontWeight:700, color: onAction ? 'var(--forest)' : 'var(--ink-3)' }}>{actionLabel || trailing}</button>
    </div>
  );
}

// ---- QUICK CHECK-IN (full-screen modal) ----
function CheckIn({ ctx, open, onClose }) {
  const { today } = ctx;
  const [mount, setMount] = useState(open);
  const [gain, setGain] = useState(null);   // {id, xp}
  const [burst, setBurst] = useState(0);
  useEffect(() => { if (open) setMount(true); }, [open]);
  if (!mount && !open) return null;
  const logged = today.filter(t => t.status).length;
  const allDone = logged === today.length;

  const handle = (item, status) => {
    ctx.doCheckIn(item.id, status);
    const xp = status === 'present' ? 50 : status === 'late' ? 20 : 5;
    setGain({ id: item.id, xp, status });
    if (status === 'present') setBurst(b => b + 1);
    setTimeout(() => setGain(null), 1100);
  };

  return (
    <div onTransitionEnd={() => { if (!open) setMount(false); }} style={{ position:'absolute', inset:0, zIndex:95, transform: open ? 'translateY(0)' : 'translateY(100%)', transition:'transform var(--d-base) var(--ease-out)' }}>
      <div className="grain" style={{ position:'absolute', inset:0, background:'var(--paper)', borderRadius:40, overflow:'hidden' }}>
        <Burst trigger={burst} />
        <div className="hide-scroll" style={{ position:'absolute', inset:0, overflowY:'auto', paddingTop:54, paddingBottom:30 }}>
          {/* header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 20px 6px' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold-deep)' }}>Quick check-in</div>
              <h1 style={{ fontFamily:'var(--font-ui)', fontSize:28, fontWeight:800, letterSpacing:'-0.02em', color:'var(--ink)', margin:'2px 0 0' }}>Monday</h1>
            </div>
            <IconBtn name="close" onClick={onClose} label="Close" />
          </div>
          {/* progress */}
          <div style={{ padding:'8px 20px 4px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13.5, fontWeight:700, color:'var(--ink-2)', marginBottom:7 }}>
              <span>{logged} of {today.length} logged</span>
              <span style={{ color:'var(--forest)' }}>+{today.reduce((s,t)=>s+(t.status==='present'?50:t.status==='late'?20:t.status==='absent'?5:0),0)} XP today</span>
            </div>
            <Meter value={logged/today.length} tone="var(--forest)" height={9} />
          </div>

          {allDone && (
            <div style={{ margin:'14px 20px 0', padding:'18px', borderRadius:'var(--r-card)', background:'linear-gradient(150deg, var(--forest-soft), var(--gold-soft))', display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(150deg, var(--gold), var(--gold-deep))', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--e-gold)' }}><Icon name="laurel" size={26} color="#fff" stroke={2} /></div>
              <div><div style={{ fontWeight:800, fontSize:16.5, color:'var(--ink)' }}>All caught up!</div><div style={{ fontSize:13.5, color:'var(--ink-2)', fontWeight:600 }}>Streak extended to {ctx.user.streak} days. See you tomorrow.</div></div>
            </div>
          )}

          {/* cards */}
          <div style={{ padding:'14px 20px 0', display:'flex', flexDirection:'column', gap:12 }}>
            {today.map(item => {
              const c = classById(item.classId);
              return (
                <Card key={item.id} pad={15} style={{ position:'relative', transition:'transform var(--d-fast)' }}>
                  {gain && gain.id === item.id && (
                    <div style={{ position:'absolute', top:8, right:14, fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--gold-deep)', animation:'float-up 1.1s var(--ease-out) forwards', pointerEvents:'none' }}>+{gain.xp}</div>
                  )}
                  <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:13 }}>
                    <div style={{ width:42, height:42, borderRadius:'var(--r-field)', background:c.hue, opacity:0.92, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span className="tnum" style={{ color:'#fff', fontWeight:800, fontSize:13 }}>{item.time}</span>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:16, fontWeight:700, color:'var(--ink)' }}>{c.name}</div>
                      <div style={{ fontSize:13, color:'var(--ink-3)', fontWeight:600 }}>{c.code} · {c.room}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    {[['present','Present'],['late','Late'],['absent','Absent']].map(([st, lbl]) => {
                      const on = item.status === st;
                      const tone = st==='present'?'var(--present)':st==='late'?'var(--late)':'var(--absent)';
                      const soft = st==='present'?'var(--present-soft)':st==='late'?'var(--late-soft)':'var(--absent-soft)';
                      return (
                        <button key={st} onClick={() => handle(item, st)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'11px 4px', borderRadius:'var(--r-field)', border: on?`1.5px solid ${tone}`:'1.5px solid var(--hairline)', background: on?soft:'var(--card-2)', cursor:'pointer', transition:'all var(--d-fast)' }}>
                          <Icon name={st} size={23} color={on?tone:'var(--ink-3)'} stroke={2} />
                          <span style={{ fontSize:12.5, fontWeight:700, color: on?tone:'var(--ink-2)' }}>{lbl}</span>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard, CheckIn, SectionTitle, Stat, TodayRow });
