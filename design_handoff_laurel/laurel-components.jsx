// ============================================================
// LAUREL shared components — signature gamification objects + primitives
// Used by both the Design System doc and the interactive prototype.
// All visuals are flat-buildable in react-native-svg (notes in handoff).
// ============================================================
const { useState, useEffect, useRef } = React;

const RANKS = [
  { key: 'freshman',     name: 'Freshman',      tier: 1 },
  { key: 'sophomore',    name: 'Sophomore',     tier: 2 },
  { key: 'junior',       name: 'Junior',        tier: 3 },
  { key: 'senior',       name: 'Senior',        tier: 4 },
  { key: 'honors',       name: 'Honors',        tier: 5 },
  { key: 'deans',        name: "Dean's List",   tier: 6 },
  { key: 'valedictorian',name: 'Valedictorian', tier: 7 },
];

// ---- Signature: Momentum Ring -------------------------------------------
// Fuses XP progress (ring), academic rank (core), and streak (flame badge).
function MomentumRing({ size = 168, level = 12, xp = 740, xpMax = 1000, streak = 23, rank = 'Junior', animate = true, dark }) {
  const stroke = size * 0.085;
  const r = (size - stroke) / 2 - 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, xp / xpMax));
  const [draw, setDraw] = useState(animate ? 0 : pct);
  useEffect(() => {
    if (!animate) { setDraw(pct); return; }
    const t = setTimeout(() => setDraw(pct), 180);
    return () => clearTimeout(t);
  }, [pct, animate]);
  const uid = useRef('mr' + Math.random().toString(36).slice(2, 8)).current;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
        <defs>
          <linearGradient id={uid + 'g'} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--gold)" />
            <stop offset="55%" stopColor="var(--gold-deep)" />
            <stop offset="100%" stopColor="var(--forest)" />
          </linearGradient>
          <radialGradient id={uid + 'core'} cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="var(--card-2)" />
            <stop offset="100%" stopColor="var(--paper-2)" />
          </radialGradient>
          <filter id={uid + 'sh'} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy={size*0.03} stdDeviation={size*0.04} floodColor="var(--gold-deep)" floodOpacity="0.35" />
          </filter>
        </defs>
        {/* track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--hairline)" strokeWidth={stroke} />
        {/* progress */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#${uid}g)`} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - draw)}
          transform={`rotate(-90 ${size/2} ${size/2})`} filter={`url(#${uid}sh)`}
          style={{ transition: 'stroke-dashoffset 1.1s var(--ease-out)' }} />
        {/* glossy core */}
        <circle cx={size/2} cy={size/2} r={r - stroke/2 - 3} fill={`url(#${uid}core)`} />
        <circle cx={size/2} cy={size/2} r={r - stroke/2 - 3} fill="none" stroke="var(--hairline)" strokeWidth="1" />
      </svg>
      {/* core content */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: size*0.07, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--forest)' }}>{rank}</div>
        <div className="font-display tnum" style={{ fontSize: size*0.34, fontWeight: 600, lineHeight: 0.95, color: 'var(--ink)', marginTop: size*0.01 }}>{level}</div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: size*0.066, fontWeight: 600, color: 'var(--ink-3)', marginTop: size*0.015 }}>{xp}/{xpMax} XP</div>
      </div>
      {/* streak flame badge */}
      <div style={{ position: 'absolute', top: -2, right: -2, display: 'flex', alignItems: 'center', gap: 3, padding: '5px 9px 5px 7px', borderRadius: 'var(--r-full)', background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))', boxShadow: 'var(--e-gold)', color: '#fff' }}>
        <Icon name="flame" size={size*0.10} color="#fff" stroke={2} />
        <span className="tnum" style={{ fontSize: size*0.085, fontWeight: 800 }}>{streak}</span>
      </div>
    </div>
  );
}

// ---- Signature: Buffer Gauge --------------------------------------------
// The "absence buffer" — how many classes you can still miss. Fuel-gauge arc.
function BufferGauge({ canMiss = 3, total = 5, label = 'classes you can still miss', size = 200 }) {
  const used = total - canMiss;
  const ratio = total ? canMiss / total : 0;
  const tone = canMiss <= 0 ? 'var(--risk-danger)' : canMiss <= 1 ? 'var(--late)' : 'var(--present)';
  const A = Math.PI * 1.25, span = Math.PI * 1.5; // 270° arc
  const R = size/2 - 16, cx = size/2, cy = size/2;
  const pt = (ang) => [cx + R*Math.cos(ang), cy + R*Math.sin(ang)];
  const arc = (frac) => {
    const [x0,y0] = pt(A), [x1,y1] = pt(A + span*frac);
    return `M ${x0} ${y0} A ${R} ${R} 0 ${frac > 0.5 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  const uid = useRef('bg' + Math.random().toString(36).slice(2, 8)).current;
  return (
    <div style={{ position: 'relative', width: size, height: size*0.82 }}>
      <svg width={size} height={size*0.82} viewBox={`0 0 ${size} ${size*0.82}`}>
        <defs>
          <linearGradient id={uid} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--forest)" /><stop offset="100%" stopColor={tone} />
          </linearGradient>
        </defs>
        <path d={arc(1)} fill="none" stroke="var(--hairline)" strokeWidth="13" strokeLinecap="round" />
        <path d={arc(ratio || 0.001)} fill="none" stroke={`url(#${uid})`} strokeWidth="13" strokeLinecap="round"
          style={{ transition: 'all 0.9s var(--ease-out)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, top: size*0.06, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="font-display tnum" style={{ fontSize: size*0.32, fontWeight: 600, lineHeight: 0.9, color: tone }}>{canMiss}</div>
        <div style={{ fontSize: size*0.07, fontWeight: 600, color: 'var(--ink-2)', maxWidth: size*0.62, textAlign: 'center', lineHeight: 1.2, marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

// ---- Status pill --------------------------------------------------------
function StatusPill({ status = 'present', size = 'md' }) {
  const map = {
    present: { icon: 'present', label: 'Present', c: 'var(--present)', bg: 'var(--present-soft)' },
    late:    { icon: 'late',    label: 'Late',    c: 'var(--late)',    bg: 'var(--late-soft)' },
    absent:  { icon: 'absent',  label: 'Absent',  c: 'var(--absent)',  bg: 'var(--absent-soft)' },
    excused: { icon: 'excused', label: 'Excused', c: 'var(--excused)', bg: 'var(--excused-soft)' },
  };
  const s = map[status] || map.present;
  const sm = size === 'sm';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: sm?4:6, padding: sm?'3px 9px 3px 7px':'5px 12px 5px 9px', borderRadius: 'var(--r-full)', background: s.bg, color: s.c, fontWeight: 700, fontSize: sm?12:13.5, letterSpacing: '-0.01em' }}>
      <Icon name={s.icon} size={sm?13:16} color={s.c} stroke={2} /> {s.label}
    </span>
  );
}

// ---- Progress meter (linear) -------------------------------------------
function Meter({ value = 0.8, tone = 'var(--forest)', height = 8 }) {
  return (
    <div style={{ height, borderRadius: 'var(--r-full)', background: 'var(--hairline)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(1,value)*100}%`, borderRadius: 'var(--r-full)', background: tone, transition: 'width 0.9s var(--ease-out)' }} />
    </div>
  );
}

// ---- Sparkline ----------------------------------------------------------
function Sparkline({ data = [], w = 120, h = 40, tone = 'var(--forest)', fill = true }) {
  if (!data.length) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((d, i) => [ (i/(data.length-1))*w, h - ((d-min)/rng)*(h-6) - 3 ]);
  const line = pts.map((p,i)=>`${i?'L':'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const uid = useRef('sp' + Math.random().toString(36).slice(2,8)).current;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display:'block', overflow:'visible' }}>
      <defs><linearGradient id={uid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={tone} stopOpacity="0.24"/><stop offset="100%" stopColor={tone} stopOpacity="0"/></linearGradient></defs>
      {fill && <path d={`${line} L ${w} ${h} L 0 ${h} Z`} fill={`url(#${uid})`} stroke="none" />}
      <path d={line} fill="none" stroke={tone} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3.2" fill={tone} />
    </svg>
  );
}

Object.assign(window, { MomentumRing, BufferGauge, StatusPill, Meter, Sparkline, RANKS });
