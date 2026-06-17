// ============================================================
// Laurel prototype — app shell, state, navigation, scaling
// ============================================================
const { useState, useEffect, useRef, useCallback } = React;

const loadLS = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } };
const resetData = () => { ['laurel-classes','laurel-today','laurel-user','laurel-onboarded'].forEach(k => localStorage.removeItem(k)); location.reload(); };

// Slide-in overlay wrapper for pushed screens
function Overlay({ open, children, dark }) {
  const [mount, setMount] = useState(open);
  useEffect(() => { if (open) setMount(true); }, [open]);
  if (!mount && !open) return null;
  return (
    <div className={dark ? 'dark grain' : 'grain'} onTransitionEnd={() => { if (!open) setMount(false); }}
      style={{ position: 'absolute', inset: 0, background: 'var(--paper)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform var(--d-base) var(--ease-out)', overflow: 'hidden' }}>
      <div className="hide-scroll" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 40 }}>{children}</div>
    </div>
  );
}

function App() {
  const reduce = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches).current;
  const [theme, setTheme] = useState(() => localStorage.getItem('laurel-theme') || 'light');
  const [device, setDevice] = useState('iphone');
  useEffect(() => { localStorage.setItem('laurel-theme', theme); }, [theme]);
  const [tab, setTab] = useState('today');
  const [stack, setStack] = useState([]);        // pushed screens: {screen, props}
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const stageRef = useRef(null);

  // live data — persisted to localStorage
  const [classes, setClasses] = useState(() => loadLS('laurel-classes', CLASSES.map(c => ({ ...c }))));
  const [today, setToday] = useState(() => loadLS('laurel-today', TODAY.map(t => ({ ...t }))));
  const [user, setUser] = useState(() => loadLS('laurel-user', { ...USER }));
  const [onboard, setOnboard] = useState(() => !localStorage.getItem('laurel-onboarded'));
  useEffect(() => { localStorage.setItem('laurel-classes', JSON.stringify(classes)); }, [classes]);
  useEffect(() => { localStorage.setItem('laurel-today', JSON.stringify(today)); }, [today]);
  useEffect(() => { localStorage.setItem('laurel-user', JSON.stringify(user)); }, [user]);
  const [celebrate, setCelebrate] = useState(null); // {gained, status, streakUp}
  const [toast, setToast] = useState(null);
  const [levelUp, setLevelUp] = useState(null);     // {level, rank} when crossed
  const undoRef = useRef(null);

  const push = (screen, props = {}) => setStack(s => [...s, { screen, props }]);
  const pop = () => setStack(s => s.slice(0, -1));
  const top = stack[stack.length - 1];

  // check-in mutation
  const doCheckIn = useCallback((todayId, status) => {
    const item = today.find(t => t.id === todayId);
    if (!item) return;
    undoRef.current = { today, classes, user }; // snapshot for undo
    setToday(ts => ts.map(t => t.id === todayId ? { ...t, status } : t));
    setClasses(cs => cs.map(c => {
      if (c.id !== item.classId) return c;
      const prev = item.status;
      let nc = { ...c };
      if (!prev) { nc.held += 1; }
      else { nc = { ...nc, present: c.present - (prev==='present'?1:0), late: c.late-(prev==='late'?1:0), absent: c.absent-(prev==='absent'?1:0) }; }
      nc.present += status==='present'?1:0; nc.late += status==='late'?1:0; nc.absent += status==='absent'?1:0;
      return nc;
    }));
    const gained = status === 'present' ? 50 : status === 'late' ? 20 : 5;
    const streakUp = status !== 'absent';
    const willBreak = status === 'absent' && user.streak > 0;
    setUser(u => {
      let xp = u.xp + gained, level = u.level, xpMax = u.xpMax, rank = u.rank, leveled = false;
      // absent breaks the streak; late/present extend it
      let streak = status === 'absent' ? 0 : u.streak + 1;
      if (xp >= xpMax) { xp -= xpMax; level += 1; xpMax += 100; leveled = true; }
      const newRank = [...LADDER].reverse().find(l => level >= l.lvl);
      const rankedUp = newRank && newRank.name !== rank;
      if (newRank) rank = newRank.name;
      if (leveled) setTimeout(() => setLevelUp({ level, rank, rankedUp }), 350);
      return { ...u, xp, level, streak, xpMax, rank, weekXP: u.weekXP + gained, totalXP: u.totalXP + gained };
    });
    setCelebrate({ gained, status, streakUp, willBreak, brokenAt: user.streak });
  }, [today, classes, user]);

  // Use a Streak Freeze to protect the streak that an absence just broke
  const useFreeze = useCallback((restoreTo) => {
    setUser(u => u.freezes > 0 ? { ...u, streak: restoreTo, freezes: u.freezes - 1 } : u);
    setToast({ icon:'flame', text:`Streak frozen · ${restoreTo} days safe` });
  }, []);

  const undoLast = useCallback(() => {
    const s = undoRef.current; if (!s) return;
    setToday(s.today); setClasses(s.classes); setUser(s.user); undoRef.current = null; setToast(null);
  }, []);

  // scaling to fit
  useEffect(() => {
    const fit = () => {
      const el = stageRef.current; if (!el) return;
      const W = device === 'iphone' ? 390 : 1180;
      const H = device === 'iphone' ? 844 : 834;
      const availW = el.clientWidth - 32, availH = el.clientHeight - 32;
      setScale(Math.min(availW / W, availH / H, 1.1));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [device]);

  const ctx = { theme, setTheme, classes, today, user, push, pop, doCheckIn, undoLast, useFreeze, setTab, openCheckIn: () => setCheckInOpen(true), openPremium: () => push('premium'), reduce, setToast,
    subscribe: (planId) => { setUser(u => ({ ...u, premium: true, plan: planId || 'm6' })); setToast({ icon:'crown', text:'Welcome to Premium!' }); },
    addClass: (c) => setClasses(cs => [...cs, c]),
    updateClass: (id, fn) => setClasses(cs => cs.map(c => c.id === id ? fn({ ...c }) : c)),
    resetData,
    quickLog: (item, status) => {
      const streakBefore = user.streak;
      doCheckIn(item.id, status);
      const xp = status === 'present' ? 50 : status === 'late' ? 20 : 5;
      const lbl = status[0].toUpperCase() + status.slice(1);
      if (status === 'absent' && streakBefore > 0 && user.freezes > 0) {
        setToast({ icon: 'flame', text: `Streak broken (${streakBefore}d)`, actionLabel: 'Freeze', onAction: () => useFreeze(streakBefore) });
      } else {
        setToast({ icon: status, text: `${lbl} · +${xp} XP`, actionLabel: 'Undo', onAction: undoLast });
      }
    } };

  // route the active tab
  const tabScreen = () => {
    const map = { today: window.Dashboard, calendar: window.CalendarScreen, insights: window.Insights, trophy: window.TrophyCase, analytics: window.Insights };
    const C = map[tab] || window.Dashboard;
    return <C ctx={ctx} />;
  };

  // pushed overlay screen
  const overlayScreen = () => {
    if (!top) return null;
    const map = { classDetail: window.ClassDetail, settings: window.Settings, premium: window.Premium, addClass: window.AddClass, onboarding: window.Onboarding, premiumAnalytics: window.PremiumAnalytics };
    const C = map[top.screen];
    return C ? <C ctx={ctx} {...top.props} onBack={pop} /> : null;
  };

  const phone = (
    <Phone statusDark={theme === 'dark'} tabBar={<TabBar active={tab} onChange={(t)=>{ setStack([]); setTab(t); }} onCheckIn={() => setCheckInOpen(true)} />}
      overlay={
        <>
          <Overlay open={stack.length > 0} dark={top?.screen==='premium'}>{overlayScreen()}</Overlay>
          {window.CheckIn && <window.CheckIn ctx={ctx} open={checkInOpen} onClose={() => { setCheckInOpen(false); setCelebrate(null); }} celebrate={celebrate} clearCelebrate={() => setCelebrate(null)} />}
          <LevelUp data={levelUp} onClose={() => setLevelUp(null)} />
          {onboard && window.Onboarding && (
            <div className="grain" style={{ position:'absolute', inset:0, zIndex:150, background:'var(--paper)' }}>
              <div className="hide-scroll" style={{ position:'absolute', inset:0, overflowY:'auto' }}>
                <window.Onboarding ctx={ctx} firstRun onBack={() => { localStorage.setItem('laurel-onboarded','1'); setOnboard(false); }} />
              </div>
            </div>
          )}
        </>
      }>
      <div key={tab} className="tab-anim">{tabScreen()}</div>
      {toast && <Toast {...toast} onDone={() => setToast(null)} />}
    </Phone>
  );

  const pad = window.IPad ? <window.IPad ctx={ctx} view={tab} /> : null;

  return (
    <div className={theme === 'dark' ? 'dark' : ''} style={{ minHeight: '100vh', background: 'var(--ds-bg, #e9e7df)', display: 'flex', flexDirection: 'column' }}>
      <ControlStrip {...{ theme, setTheme, device, setDevice, tab, setTab, push, setStack }} />
      <div ref={stageRef} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', minHeight: 0 }}>
        <div style={{ zoom: scale }}>
          {device === 'iphone' ? phone : pad}
        </div>
      </div>
    </div>
  );
}

// Top control strip (outside the device)
function ControlStrip({ theme, setTheme, device, setDevice, push, setStack, setTab, setCheckIn }) {
  const [menu, setMenu] = useState(false);
  const seg = (val, cur, set, label, icon) => (
    <button onClick={() => set(val)} style={{ display:'inline-flex', alignItems:'center', gap:6, border:'none', cursor:'pointer', padding:'7px 12px', borderRadius:9, fontWeight:700, fontSize:13, fontFamily:'var(--font-ui)', color: cur===val?'#0e1f17':'#5c6b62', background: cur===val?'#fff':'transparent', boxShadow: cur===val?'0 1px 3px rgba(0,0,0,0.12)':'none' }}>
      {icon && <Icon name={icon} size={16} color={cur===val?'#294a3f':'#5c6b62'} />}{label}
    </button>
  );
  const more = [['classDetail','Class Detail',{classId:'cs'}],['settings','Settings'],['premium','Premium'],['premiumAnalytics','Forecast (Premium)'],['addClass','Add Class'],['onboarding','Onboarding']];
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 22px', flexWrap:'wrap', background:'rgba(255,255,255,0.5)', borderBottom:'1px solid rgba(20,40,30,0.08)', backdropFilter:'blur(10px)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:22, color:'#1b2c26' }}>Laurel</div>
        <span style={{ fontSize:12.5, fontWeight:600, color:'#5c6b62' }}>Interactive prototype</span>
      </div>
      <div style={{ flex:1 }} />
      <div style={{ display:'flex', gap:3, background:'rgba(20,40,30,0.06)', borderRadius:11, padding:3 }}>
        {seg('iphone', device, setDevice, 'iPhone')}
        {seg('ipad', device, setDevice, 'iPad')}
      </div>
      <div style={{ display:'flex', gap:3, background:'rgba(20,40,30,0.06)', borderRadius:11, padding:3 }}>
        {seg('light', theme, setTheme, 'Light')}
        {seg('dark', theme, setTheme, 'Dark')}
      </div>
      <div style={{ position:'relative' }}>
        <button onClick={() => setMenu(m=>!m)} style={{ display:'inline-flex', alignItems:'center', gap:6, border:'none', cursor:'pointer', padding:'9px 14px', borderRadius:11, fontWeight:700, fontSize:13, fontFamily:'var(--font-ui)', color:'#fff', background:'linear-gradient(180deg,#3a564e,#2a423b)' }}>
          More screens <Icon name="chevronDown" size={15} color="#fff" />
        </button>
        {menu && (
          <div style={{ position:'absolute', right:0, top:'calc(100% + 8px)', background:'#fff', borderRadius:14, boxShadow:'0 12px 30px rgba(0,0,0,0.18)', padding:6, zIndex:200, minWidth:170 }}>
            {more.map(([s, l, p]) => (
              <button key={s} onClick={() => { setDevice('iphone'); setStack([{ screen:s, props:p||{} }]); setMenu(false); }} style={{ display:'flex', width:'100%', textAlign:'left', border:'none', background:'none', cursor:'pointer', padding:'10px 12px', borderRadius:9, fontWeight:600, fontSize:14, color:'#16271e' }} onMouseEnter={e=>e.currentTarget.style.background='#f0f3ee'} onMouseLeave={e=>e.currentTarget.style.background='none'}>{l}</button>
            ))}
          </div>
        )}
      </div>
      <a href="Attendance Tracker — Design System.html" style={{ fontSize:13, fontWeight:700, color:'#3a564e', textDecoration:'none' }}>Design system →</a>
    </div>
  );
}

// transient toast (optional Undo action)
function Toast({ icon = 'present', text, actionLabel, onAction, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, actionLabel ? 3200 : 1700); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position:'absolute', left:'50%', bottom:130, transform:'translateX(-50%)', zIndex:120, display:'flex', alignItems:'center', gap:10, padding:'10px 10px 10px 16px', borderRadius:'var(--r-full)', background:'var(--ink)', color:'var(--paper)', boxShadow:'var(--e3)', fontWeight:700, fontSize:14, whiteSpace:'nowrap', animation:'toast-in 240ms var(--ease-out)' }}>
      <Icon name={icon} size={18} color="var(--gold)" stroke={2} /> {text}
      {actionLabel && <button onClick={() => { onAction && onAction(); onDone(); }} style={{ border:'none', cursor:'pointer', background:'rgba(255,255,255,0.16)', color:'var(--gold)', fontWeight:800, fontSize:13.5, padding:'6px 12px', borderRadius:'var(--r-full)' }}>{actionLabel}</button>}
    </div>
  );
}

// Level-up / rank-up celebration overlay
function LevelUp({ data, onClose }) {
  if (!data) return null;
  return (
    <div onClick={onClose} style={{ position:'absolute', inset:0, zIndex:130, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(15,24,20,0.55)', backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)', animation:'toast-in 220ms var(--ease-out)', borderRadius:40 }}>
      <Burst trigger={data.level} />
      <div className="grain" style={{ position:'relative', width:280, textAlign:'center', borderRadius:'var(--r-card-lg)', overflow:'hidden', padding:'30px 24px', background:'linear-gradient(155deg, var(--forest), var(--forest-deep) 70%, oklch(0.24 0.035 170))', boxShadow:'var(--e4)', animation:'pop-in 380ms var(--ease-spring)' }}>
        <div style={{ width:84, height:84, margin:'0 auto 16px', borderRadius:'50%', background:'linear-gradient(150deg, var(--gold), var(--gold-deep))', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--e-gold)' }}>
          <Icon name={data.rankedUp ? 'laurel' : 'arrowUp'} size={44} color="#fff" stroke={2} />
        </div>
        <div style={{ fontSize:13, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'oklch(0.9 0.11 85)' }}>{data.rankedUp ? 'Rank up' : 'Level up'}</div>
        <div className="font-display" style={{ fontSize:40, fontWeight:600, color:'#fff', lineHeight:1, margin:'6px 0 4px' }}>{data.rankedUp ? data.rank : `Level ${data.level}`}</div>
        <div style={{ fontSize:14.5, color:'oklch(0.88 0.03 120)', fontWeight:600 }}>{data.rankedUp ? `You reached ${data.rank}!` : 'Keep the momentum going.'}</div>
        <button onClick={onClose} style={{ marginTop:18, width:'100%', border:'none', cursor:'pointer', borderRadius:'var(--r-btn)', padding:'13px', background:'linear-gradient(180deg, var(--gold), var(--gold-deep))', color:'#3a2a06', fontWeight:800, fontSize:15.5 }}>Nice</button>
      </div>
    </div>
  );
}

window.LaurelApp = App;
