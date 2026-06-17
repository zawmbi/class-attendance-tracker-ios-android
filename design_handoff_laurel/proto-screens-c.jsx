// ============================================================
// Laurel prototype — Calendar · Add Class · Settings · Premium · Onboarding
// ============================================================
const { useState } = React;

// grouped list primitives (iOS form/list)
// number stepper (− value +)
function Stepper({ label, value, set, min = 0, max = 20, suffix = '' }) {
  const btn = (txt, onClick, disabled) => (
    <button onClick={onClick} disabled={disabled} style={{ width:38, height:38, borderRadius:'var(--r-full)', border:'1.5px solid var(--hairline)', background:'var(--card)', cursor: disabled?'default':'pointer', fontSize:22, fontWeight:700, color: disabled?'var(--ink-3)':'var(--forest)', opacity: disabled?0.4:1, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>{txt}</button>
  );
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <span style={{ fontSize:14.5, fontWeight:600, color:'var(--ink)' }}>{label}</span>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        {btn('−', () => set(Math.max(min, value - 1)), value <= min)}
        <span className="font-display tnum" style={{ fontSize:24, fontWeight:600, color:'var(--ink)', minWidth:28, textAlign:'center' }}>{value}{suffix}</span>
        {btn('+', () => set(Math.min(max, value + 1)), value >= max)}
      </div>
    </div>
  );
}

function Group({ header, children, footer }) {
  return (
    <div style={{ marginBottom:18 }}>
      {header && <div style={{ fontSize:12.5, fontWeight:700, letterSpacing:'0.04em', textTransform:'uppercase', color:'var(--ink-3)', padding:'0 14px 7px' }}>{header}</div>}
      <div style={{ background:'var(--card)', borderRadius:'var(--r-card)', border:'0.5px solid var(--hairline)', boxShadow:'var(--e1)', overflow:'hidden' }}>{children}</div>
      {footer && <div style={{ fontSize:12.5, color:'var(--ink-3)', fontWeight:500, padding:'8px 14px 0', lineHeight:1.4 }}>{footer}</div>}
    </div>
  );
}
function Row({ icon, iconBg, title, detail, right, onClick, last, danger }) {
  return (
    <div onClick={onClick} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 15px', cursor:onClick?'pointer':'default', position:'relative' }}>
      {icon && <div style={{ width:30, height:30, borderRadius:8, background:iconBg||'var(--forest)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon name={icon} size={18} color="#fff" stroke={2} /></div>}
      <span style={{ flex:1, fontSize:16, fontWeight:600, color: danger?'var(--absent)':'var(--ink)' }}>{title}</span>
      {detail && <span style={{ fontSize:15, color:'var(--ink-3)', fontWeight:500 }}>{detail}</span>}
      {right}
      {onClick && !right && <Icon name="chevron" size={17} color="var(--ink-3)" stroke={2} />}
      {!last && <div style={{ position:'absolute', bottom:0, left: icon?57:15, right:0, height:0.5, background:'var(--hairline)' }} />}
    </div>
  );
}

// ---- CALENDAR (tab) ----
function CalendarScreen({ ctx }) {
  const [view, setView] = useState('Week');
  const days = ['Mon','Tue','Wed','Thu','Fri'];
  const dayClasses = (d) => ctx.classes.filter(c => c.days.includes(d));
  const [sel, setSel] = useState('Mon');
  return (
    <div>
      <Header title="Calendar" kicker="Spring 2026" />
      <div style={{ padding:'6px 18px 0' }}>
        <Segmented options={['Week','Month','Semester']} value={view} onChange={setView} />
      </div>

      {view === 'Week' && (
        <div style={{ padding:'16px 18px 0' }}>
          <div style={{ display:'flex', gap:7 }}>
            {days.map((d, i) => {
              const on = d === sel;
              const cs = dayClasses(d);
              return (
                <button key={d} onClick={() => setSel(d)} style={{ flex:1, border:'none', cursor:'pointer', background: on?'linear-gradient(180deg, var(--forest), var(--forest-deep))':'var(--card)', boxShadow: on?'var(--e-forest)':'var(--e1)', borderRadius:'var(--r-field)', padding:'11px 0 9px', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:11.5, fontWeight:700, color: on?'rgba(255,255,255,0.8)':'var(--ink-3)' }}>{d[0]}</span>
                  <span className="tnum" style={{ fontSize:18, fontWeight:800, color: on?'#fff':'var(--ink)' }}>{4+i}</span>
                  <div style={{ display:'flex', gap:3, height:6 }}>
                    {cs.slice(0,3).map((c,ci) => <span key={ci} style={{ width:5, height:5, borderRadius:'50%', background: on?'rgba(255,255,255,0.85)':c.hue }} />)}
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{ marginTop:18, display:'flex', flexDirection:'column', gap:10 }}>
            {dayClasses(sel).length === 0 && <EmptyState icon="today" title="No classes" sub={`Enjoy your free ${sel}day.`} />}
            {dayClasses(sel).sort((a,b)=>a.time.localeCompare(b.time)).map(c => (
              <Card key={c.id} pad={14} onClick={() => ctx.push('classDetail', { classId:c.id })} style={{ display:'flex', alignItems:'center', gap:13 }}>
                <div className="tnum" style={{ width:48, fontSize:14, fontWeight:800, color:'var(--ink-2)' }}>{c.time}</div>
                <div style={{ width:4, alignSelf:'stretch', borderRadius:2, background:c.hue }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15.5, fontWeight:700, color:'var(--ink)' }}>{c.name}</div>
                  <div style={{ fontSize:13, color:'var(--ink-3)', fontWeight:600 }}>{c.room}</div>
                </div>
                <span className="tnum" style={{ fontSize:14, fontWeight:800, color:RISK[riskOf(c)].c }}>{pct(c)}%</span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {view === 'Month' && (
        <div style={{ padding:'16px 18px 0' }}>
          <Card>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <span style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:600, color:'var(--ink)' }}>March 2026</span>
              <div style={{ display:'flex', gap:6 }}><IconBtn name="back" label="prev" /><IconBtn name="chevron" label="next" /></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6, marginBottom:6 }}>
              {['S','M','T','W','T','F','S'].map((d,i) => <div key={i} style={{ textAlign:'center', fontSize:11, fontWeight:700, color:'var(--ink-3)' }}>{d}</div>)}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6 }}>
              {Array.from({length:35}).map((_,i) => {
                const day = i - 5;
                const has = day>0 && day<=31;
                const v = has ? (HEAT[day % HEAT.length]) : 0;
                const col = v===0?'transparent':v===1?'var(--absent)':v===2?'var(--late)':'var(--present)';
                return (
                  <div key={i} style={{ aspectRatio:'1', borderRadius:9, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background: has?'var(--paper-2)':'transparent', position:'relative' }}>
                    {has && (
                      <React.Fragment>
                        <span className="tnum" style={{ fontSize:12.5, fontWeight:700, color: day===4?'var(--forest)':'var(--ink-2)' }}>{day}</span>
                        {v>0 && <span style={{ width:5, height:5, borderRadius:'50%', background:col, marginTop:2 }} />}
                      </React.Fragment>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {view === 'Semester' && (
        <div style={{ padding:'16px 18px 0', display:'flex', flexDirection:'column', gap:12 }}>
          <Card style={{ display:'flex', gap:14 }}>
            {[['16','weeks'],['78','classes'],['91%','overall']].map(([v,l]) => (
              <div key={l} style={{ flex:1, textAlign:'center' }}>
                <div className="font-display tnum" style={{ fontSize:30, fontWeight:600, color:'var(--forest)' }}>{v}</div>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--ink-3)' }}>{l}</div>
              </div>
            ))}
          </Card>
          <Card style={{ background:'linear-gradient(155deg, var(--gold-soft), var(--card))' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}><Icon name="target" size={18} color="var(--gold-deep)" stroke={2}/><span style={{ fontWeight:800, fontSize:14.5, color:'var(--ink)' }}>Finals stretch</span></div>
            <p style={{ margin:0, fontSize:14.5, lineHeight:1.5, color:'var(--ink-2)', fontWeight:500 }}>6 weeks left. Keep your current pace and you'll finish the semester on the Dean's track.</p>
          </Card>
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ textAlign:'center', padding:'40px 20px' }}>
      <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--paper-2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
        <Icon name={icon} size={30} color="var(--ink-3)" stroke={1.8} />
      </div>
      <div style={{ fontSize:17, fontWeight:700, color:'var(--ink)' }}>{title}</div>
      <div style={{ fontSize:14, color:'var(--ink-3)', fontWeight:500, marginTop:3 }}>{sub}</div>
    </div>
  );
}

// ---- ADD / EDIT CLASS (overlay) ----
function AddClass({ ctx, classId, onBack }) {
  const editing = !!classId;
  const c = editing ? classById(classId) : null;
  const [name, setName] = useState(c?.name || '');
  const [code, setCode] = useState(c?.code || '');
  const [target, setTarget] = useState(c?.target || 80);
  const [reqMode, setReqMode] = useState(c?.reqMode || 'pct');     // 'pct' | 'count'
  const [maxMiss, setMaxMiss] = useState(c?.maxAbsences ?? 4);     // max absences allowed
  const [excused, setExcused] = useState(c?.excused ?? 0);         // excused absences that don't count
  const [days, setDays] = useState(c?.days || ['Mon','Wed']);
  const [hue, setHue] = useState(c?.hue || CLASS_HUES.cs);
  const toggle = (d) => setDays(ds => ds.includes(d) ? ds.filter(x=>x!==d) : [...ds, d]);
  const save = () => {
    if (!editing) {
      ctx.addClass({ id:'c'+Date.now(), name:name||'New Class', code:code||'NEW 100', room:'TBD', prof:'TBD', target:+target, reqMode, maxAbsences:+maxMiss, excused:+excused, days:days.length?days:['Mon'], time:'10:00', semTotal:30, held:0, present:0, late:0, absent:0, hue });
      ctx.setToast && ctx.setToast({ icon:'present', text:`${name||'Class'} added` });
    }
    onBack();
  };
  const field = (label, val, set, ph) => (
    <Row title={<span style={{ display:'flex', flexDirection:'column' }}><span style={{ fontSize:12, color:'var(--ink-3)', fontWeight:700 }}>{label}</span><input value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{ border:'none', background:'none', fontSize:16, fontWeight:600, color:'var(--ink)', fontFamily:'var(--font-ui)', padding:0, marginTop:2, outline:'none', width:'100%' }} /></span>} last />
  );
  return (
    <div>
      <div style={{ padding:'4px 18px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ink-2)', fontWeight:600, fontSize:16 }}>Cancel</button>
        <button onClick={save} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--forest)', fontWeight:800, fontSize:16 }}>Save</button>
      </div>
      <Header title={editing ? 'Edit Class' : 'New Class'} />
      <div style={{ padding:'10px 18px 0' }}>
        <Group header="Details">
          {field('Class name', name, setName, 'e.g. Organic Chemistry')}
          <div style={{ height:0.5, background:'var(--hairline)', marginLeft:15 }} />
          {field('Course code', code, setCode, 'e.g. CHEM 210')}
        </Group>
        <Group header="Schedule">
          <div style={{ padding:'13px 15px' }}>
            <div style={{ fontSize:12, color:'var(--ink-3)', fontWeight:700, marginBottom:9 }}>DAYS</div>
            <div style={{ display:'flex', gap:7 }}>
              {['Mon','Tue','Wed','Thu','Fri'].map(d => {
                const on = days.includes(d);
                return <button key={d} onClick={()=>toggle(d)} style={{ flex:1, padding:'10px 0', borderRadius:11, border:'none', cursor:'pointer', fontWeight:700, fontSize:13, background: on?'var(--forest)':'var(--paper-2)', color: on?'#fff':'var(--ink-2)' }}>{d[0]}</button>;
              })}
            </div>
          </div>
        </Group>
        <Group header="Attendance requirement">
          <div style={{ padding:'14px 15px 8px' }}>
            <Segmented options={[{value:'pct',label:'Percentage'},{value:'count',label:'Max absences'}]} value={reqMode} onChange={setReqMode} />
          </div>
          {reqMode === 'pct' ? (
            <div style={{ padding:'4px 15px 16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6 }}>
                <span style={{ fontSize:13, fontWeight:700, color:'var(--ink-2)' }}>Minimum attendance</span>
                <span className="font-display tnum" style={{ fontSize:22, fontWeight:600, color:'var(--forest)' }}>{target}%</span>
              </div>
              <input type="range" min="50" max="100" value={target} onChange={e=>setTarget(+e.target.value)} style={{ width:'100%', accentColor:'var(--forest)' }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, fontWeight:600, color:'var(--ink-3)', marginTop:2 }}><span>50%</span><span>100%</span></div>
            </div>
          ) : (
            <div style={{ padding:'6px 15px 14px' }}>
              <Stepper label="Classes you can miss" value={maxMiss} set={setMaxMiss} min={0} max={20} />
            </div>
          )}
        </Group>
        <Group header="Excused absences" footer="Absences that don't count against you (illness, approved leave).">
          <div style={{ padding:'8px 15px 14px' }}>
            <Stepper label="Allowed this semester" value={excused} set={setExcused} min={0} max={15} />
          </div>
        </Group>
        <Group header="Color">
          <div style={{ padding:'14px 15px', display:'flex', gap:12 }}>
            {Object.values(CLASS_HUES).map(h => (
              <button key={h} onClick={()=>setHue(h)} aria-label="color" style={{ width:34, height:34, borderRadius:'50%', background:h, border: hue===h?'3px solid var(--ink)':'3px solid transparent', cursor:'pointer', outline:'1px solid var(--hairline)' }} />
            ))}
          </div>
        </Group>
        {editing && <Group><Row icon="trash" iconBg="var(--absent)" title="Delete class" danger onClick={onBack} last /></Group>}
      </div>
    </div>
  );
}

// ---- SETTINGS (overlay) ----
function Settings({ ctx, onBack }) {
  const { user } = ctx;
  return (
    <div>
      <Header title="Settings" onBack={onBack} />
      <div style={{ padding:'4px 18px 0' }}>
        {/* profile */}
        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'8px 4px 18px' }}>
          <div style={{ width:62, height:62, borderRadius:'50%', background:'linear-gradient(150deg, var(--moss), var(--forest-deep))', color:'#fff', fontWeight:800, fontSize:26, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--e2)' }}>{user.name[0]}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:20, fontWeight:800, color:'var(--ink)' }}>{user.name} Okonkwo</div>
            <div style={{ fontSize:14, color:'var(--ink-3)', fontWeight:600 }}>{user.rank} · Level {user.level}</div>
          </div>
          <IconBtn name="edit" label="edit profile" />
        </div>

        {/* premium upsell */}
        <button onClick={() => ctx.push('premium')} style={{ width:'100%', border:'none', cursor:'pointer', textAlign:'left', borderRadius:'var(--r-card)', padding:'16px', marginBottom:18, background:'linear-gradient(150deg, oklch(0.27 0.038 170), var(--forest-deep))', boxShadow:'var(--e-forest)', display:'flex', alignItems:'center', gap:13 }}>
          <div style={{ width:42, height:42, borderRadius:12, background:'linear-gradient(150deg, var(--gold), var(--gold-deep))', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--e-gold)' }}><Icon name="crown" size={24} color="#fff" stroke={2} /></div>
          <div style={{ flex:1 }}><div style={{ color:'#fff', fontWeight:800, fontSize:16 }}>Laurel Premium</div><div style={{ color:'oklch(0.88 0.04 120)', fontSize:13, fontWeight:600 }}>Projections, widgets & more</div></div>
          <Icon name="chevron" size={20} color="oklch(0.9 0.05 100)" stroke={2.2} />
        </button>

        <Group header="Attendance">
          <Row icon="target" iconBg="var(--gold-deep)" title="Default required %" detail="80%" onClick={()=>{}} />
          <Row icon="bell" iconBg="var(--late)" title="Class reminders" right={<Toggle on />} />
          <Row icon="calendar" iconBg="var(--excused)" title="Sync to Calendar" right={<Toggle />} last />
        </Group>
        <Group header="Appearance">
          <Row icon="today" iconBg="var(--moss)" title="Theme" right={
            <div style={{ width:128 }}><Segmented options={[{value:'light',label:'Light'},{value:'dark',label:'Dark'}]} value={ctx.theme} onChange={ctx.setTheme} /></div>
          } last />
        </Group>
        <Group header="General">
          <Row icon="bolt" iconBg="var(--forest)" title="Notifications" onClick={()=>{}} />
          <Row icon="book" iconBg="var(--ink-2)" title="Help & feedback" onClick={()=>{}} />
          <Row icon="laurel" iconBg="var(--gold-deep)" title="About Laurel" detail="v2.0" onClick={()=>ctx.push('onboarding')} last />
        </Group>
        <Group footer="Clears check-ins, classes and progress on this device.">
          <Row icon="trash" iconBg="var(--absent)" title="Reset demo data" danger onClick={()=>ctx.resetData()} last />
        </Group>
      </div>
    </div>
  );
}
function Toggle({ on }) {
  const [v, setV] = useState(!!on);
  return <button onClick={()=>setV(!v)} aria-label="toggle" style={{ width:50, height:30, borderRadius:99, border:'none', cursor:'pointer', background: v?'var(--present)':'var(--hairline)', position:'relative', transition:'background var(--d-fast)' }}><span style={{ position:'absolute', top:3, left: v?23:3, width:24, height:24, borderRadius:'50%', background:'#fff', boxShadow:'var(--e1)', transition:'left var(--d-fast)' }} /></button>;
}

// ---- PREMIUM (overlay, dark) ----
const PLANS = [
  { id:'m1',  label:'Monthly',  price:'3.99',  per:'$3.99/mo',  cycle:'monthly',          note:'billed every month',  badge:null,          save:null },
  { id:'m6',  label:'6 Months', price:'19.99', per:'$3.33/mo',  cycle:'every 6 months',   note:'billed $19.99 / 6 mo', badge:'POPULAR',     save:'16%' },
  { id:'m12', label:'12 Months',price:'39.99', per:'$3.33/mo',  cycle:'yearly',           note:'billed $39.99 / yr',  badge:'BEST VALUE',  save:'17%' },
];
function Premium({ ctx, onBack }) {
  const [plan, setPlan] = useState('m6');
  const cur = PLANS.find(p => p.id === plan) || PLANS[0];
  const feats = [
    ['chart','Forecast & grade-aware projections','See exactly how each class will finish','premiumAnalytics'],
    ['grid','Home & lock screen widgets','Buffer & streak at a glance'],
    ['sparkles','Unlimited classes & history','Beyond the free 5-class cap'],
    ['flame','Streak freeze','Keep your streak through breaks & days off'],
  ];
  return (
    <div className="dark grain" style={{ minHeight:'100%', background:'radial-gradient(120% 80% at 50% 0%, oklch(0.24 0.038 170), var(--paper))' }}>
      <div style={{ padding:'4px 18px 0', display:'flex', justifyContent:'flex-end' }}>
        <IconBtn name="close" onClick={onBack} label="Close" bg="rgba(255,255,255,0.1)" tone="#fff" />
      </div>
      <div style={{ textAlign:'center', padding:'10px 24px 0' }}>
        <div style={{ width:78, height:78, borderRadius:22, margin:'0 auto 16px', background:'linear-gradient(150deg, var(--gold), var(--gold-deep))', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--e-gold)' }}><Icon name="crown" size={42} color="#fff" stroke={1.9} /></div>
        <div style={{ fontSize:13, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gold)' }}>Laurel Premium</div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:600, color:'#fff', margin:'6px 0 0', lineHeight:1.1 }}>Never miss the mark</h1>
        <p style={{ fontSize:15.5, color:'oklch(0.82 0.02 120)', fontWeight:500, margin:'10px 0 0' }}>Everything you need to finish every class on track.</p>
      </div>
      <div style={{ padding:'22px 20px 0', display:'flex', flexDirection:'column', gap:10 }}>
        {feats.map(([ic,t,d,route]) => (
          <div key={t} onClick={route ? () => ctx.push(route) : undefined} className={route ? 'pressable' : ''} style={{ display:'flex', alignItems:'center', gap:13, background:'rgba(255,255,255,0.06)', border: route?'0.5px solid var(--gold)':'0.5px solid rgba(255,255,255,0.1)', borderRadius:'var(--r-card)', padding:'14px', cursor: route?'pointer':'default' }}>
            <div style={{ width:40, height:40, borderRadius:11, background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon name={ic} size={22} color="var(--gold)" stroke={2} /></div>
            <div style={{ flex:1 }}><div style={{ color:'#fff', fontWeight:700, fontSize:15.5 }}>{t}</div><div style={{ color:'oklch(0.74 0.02 120)', fontSize:13, fontWeight:500 }}>{d}</div></div>
            {route && <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:12.5, fontWeight:800, color:'var(--gold)' }}>Preview <Icon name="chevron" size={13} color="var(--gold)" stroke={2.4} /></span>}
          </div>
        ))}
      </div>

      {/* PLANS */}
      <div style={{ padding:'26px 20px 0' }}>
        <div style={{ textAlign:'center', fontSize:13, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold)', marginBottom:14 }}>Choose your plan</div>
        <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
          {PLANS.map(p => {
            const on = plan === p.id;
            return (
              <button key={p.id} onClick={() => setPlan(p.id)} className="pressable" style={{ position:'relative', textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', gap:14, padding:'15px 16px', borderRadius:'var(--r-card)', border: on?'2px solid var(--gold)':'1.5px solid rgba(255,255,255,0.12)', background: on?'rgba(212,170,90,0.12)':'rgba(255,255,255,0.04)' }}>
                {/* radio */}
                <span style={{ width:23, height:23, borderRadius:'50%', flexShrink:0, border: on?'7px solid var(--gold)':'2px solid rgba(255,255,255,0.3)', background: on?'#fff':'transparent', transition:'all var(--d-fast)' }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ color:'#fff', fontWeight:800, fontSize:16.5, whiteSpace:'nowrap' }}>{p.label}</span>
                    {p.badge && <span style={{ fontSize:10, fontWeight:800, letterSpacing:'0.03em', whiteSpace:'nowrap', color:'#3a2a06', background:'linear-gradient(180deg, var(--gold), var(--gold-deep))', padding:'2px 7px', borderRadius:'var(--r-full)' }}>{p.badge}</span>}
                  </div>
                  <div style={{ color:'oklch(0.76 0.02 120)', fontSize:12.5, fontWeight:600, marginTop:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.per} · {p.note}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div className="tnum" style={{ color:'#fff', fontWeight:800, fontSize:18 }}>${p.price}</div>
                  {p.save && <div style={{ fontSize:11.5, fontWeight:800, color:'var(--gold)' }}>Save {p.save}</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding:'20px 20px 30px' }}>
        <button onClick={() => { ctx.subscribe && ctx.subscribe(plan); onBack(); }} style={{ width:'100%', border:'none', cursor:'pointer', borderRadius:'var(--r-card)', padding:'17px', background:'linear-gradient(180deg, var(--gold), var(--gold-deep))', color:'#3a2a06', fontWeight:800, fontSize:17, boxShadow:'var(--e-gold)' }}>{ctx.user?.premium ? 'Manage subscription' : 'Start 7-day free trial'}</button>
        <div style={{ textAlign:'center', color:'oklch(0.78 0.02 120)', fontSize:13, fontWeight:600, marginTop:12 }}>then ${cur.price} {cur.cycle} · cancel anytime</div>
        <div style={{ display:'flex', gap:18, justifyContent:'center', marginTop:14 }}>
          <span style={{ color:'oklch(0.72 0.02 120)', fontSize:12.5, fontWeight:600 }}>Restore</span>
          <span style={{ color:'oklch(0.72 0.02 120)', fontSize:12.5, fontWeight:600 }}>Terms</span>
          <span style={{ color:'oklch(0.72 0.02 120)', fontSize:12.5, fontWeight:600 }}>Privacy</span>
        </div>
      </div>
    </div>
  );
}

// ---- ONBOARDING (overlay) ----
function Onboarding({ ctx, onBack }) {
  const [step, setStep] = useState(0);
  const steps = [
    { icon:'laurel', title:'Welcome to Laurel', body:'A calmer way to track attendance — and build a streak you\u2019re proud of.' },
    { icon:'checkin', title:'Check in, in seconds', body:'Tap Present, Late or Absent after each class. That\u2019s the whole habit.' },
    { icon:'target', title:'Know your buffer', body:'We show exactly how many classes you can still miss before it hurts.' },
    { icon:'trophy', title:'Build momentum', body:'Earn XP, climb from Freshman to Valedictorian, and unlock badges.' },
  ];
  const s = steps[step];
  const last = step === steps.length - 1;
  return (
    <div className="grain" style={{ minHeight:'100%', display:'flex', flexDirection:'column', background:'radial-gradient(120% 70% at 50% 8%, var(--forest-soft), var(--paper))' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'0 34px' }}>
        <div key={step} style={{ width:120, height:120, borderRadius:34, background:'linear-gradient(150deg, var(--forest), var(--forest-deep))', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--e-forest)', marginBottom:30, animation:'pop-in 360ms var(--ease-spring)' }}>
          <Icon name={s.icon} size={58} color="var(--gold)" stroke={1.8} />
        </div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:34, fontWeight:600, color:'var(--ink)', margin:0, lineHeight:1.05 }}>{s.title}</h1>
        <p style={{ fontSize:17, lineHeight:1.5, color:'var(--ink-2)', fontWeight:500, margin:'14px 0 0', maxWidth:'30ch' }}>{s.body}</p>
      </div>
      <div style={{ padding:'0 26px 40px' }}>
        <div style={{ display:'flex', gap:7, justifyContent:'center', marginBottom:24 }}>
          {steps.map((_,i) => <span key={i} style={{ width: i===step?22:8, height:8, borderRadius:99, background: i===step?'var(--forest)':'var(--hairline)', transition:'all var(--d-base)' }} />)}
        </div>
        <button onClick={() => last ? onBack() : setStep(step+1)} style={{ width:'100%', border:'none', cursor:'pointer', borderRadius:'var(--r-card)', padding:'17px', background:'linear-gradient(180deg, var(--forest), var(--forest-deep))', color:'#fff', fontWeight:800, fontSize:17, boxShadow:'var(--e-forest)' }}>{last ? 'Get started' : 'Continue'}</button>
        {!last && <button onClick={onBack} style={{ width:'100%', border:'none', background:'none', cursor:'pointer', color:'var(--ink-3)', fontWeight:700, fontSize:15, marginTop:12 }}>Skip</button>}
      </div>
    </div>
  );
}

Object.assign(window, { CalendarScreen, AddClass, Settings, Premium, Onboarding, EmptyState, PLANS });
