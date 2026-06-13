// ============================================================
// Laurel prototype — shell, device frames, shared UI primitives
// ============================================================
const { useState, useEffect, useRef, useCallback } = React;

// ---- Status bar (Laurel-tinted) ----
function StatusBar({ dark }) {
  const c = dark ? '#fff' : 'var(--ink)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 30px 8px', position: 'relative', zIndex: 20 }}>
      <span className="tnum" style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 16, color: c, letterSpacing: '0.01em' }}>9:41</span>
      <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
        <svg width="18" height="11" viewBox="0 0 18 11"><rect x="0" y="7" width="3" height="4" rx="0.6" fill={c}/><rect x="4.5" y="4.5" width="3" height="6.5" rx="0.6" fill={c}/><rect x="9" y="2.2" width="3" height="8.8" rx="0.6" fill={c}/><rect x="13.5" y="0" width="3" height="11" rx="0.6" fill={c}/></svg>
        <svg width="16" height="11" viewBox="0 0 16 11"><path d="M8 2.8C10.1 2.8 12 3.6 13.4 5L14.4 4C12.7 2.3 10.5 1.3 8 1.3C5.5 1.3 3.3 2.3 1.6 4L2.6 5C4 3.6 5.9 2.8 8 2.8Z" fill={c}/><path d="M8 6.2C9.2 6.2 10.4 6.7 11.2 7.5L12.2 6.5C11 5.4 9.6 4.7 8 4.7C6.4 4.7 5 5.4 3.8 6.5L4.8 7.5C5.6 6.7 6.8 6.2 8 6.2Z" fill={c}/><circle cx="8" cy="9.6" r="1.4" fill={c}/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke={c} strokeOpacity="0.4" fill="none"/><rect x="2" y="2" width="16" height="8" rx="1.8" fill={c}/><path d="M23 4V8C23.7 7.7 24.2 7 24.2 6C24.2 5 23.7 4.3 23 4Z" fill={c} fillOpacity="0.5"/></svg>
      </div>
    </div>
  );
}

// ---- iPhone frame: status bar + scrollable body + fixed tab bar + home indicator ----
function Phone({ children, tabBar, overlay, statusDark = false, scrollRef, onScroll, bg = 'var(--paper)' }) {
  return (
    <div style={{ width: 390, height: 844, borderRadius: 52, position: 'relative', background: '#000', boxShadow: '0 50px 100px -20px rgba(20,40,30,0.45), 0 0 0 11px #1a1a1c, 0 0 0 12px #2c2c2e' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 40, overflow: 'hidden' }}>
        {/* decorative bg + grain */}
        <div className="grain" style={{ position: 'absolute', inset: 0, background: bg, zIndex: 0, pointerEvents: 'none' }} />
        {/* flex column: status bar / scroll / tab bar */}
        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flexShrink: 0 }}><StatusBar dark={statusDark} /></div>
          <div ref={scrollRef} onScroll={onScroll} className="hide-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', paddingBottom: tabBar ? 6 : 30 }}>
            {children}
          </div>
          {tabBar && <div style={{ flexShrink: 0 }}>{tabBar}</div>}
        </div>
        {/* dynamic island */}
        <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', width: 120, height: 35, borderRadius: 22, background: '#000', zIndex: 40 }} />
        {/* home indicator */}
        <div style={{ position: 'absolute', bottom: 9, left: '50%', transform: 'translateX(-50%)', width: 134, height: 5, borderRadius: 100, background: statusDark ? 'rgba(255,255,255,0.55)' : 'rgba(40,50,45,0.32)', zIndex: 70, pointerEvents: 'none' }} />
        {overlay && <div style={{ position: 'absolute', inset: 0, zIndex: 65 }}>{overlay}</div>}
      </div>
    </div>
  );
}

// ---- Tab bar (glass) + center check-in FAB ----
function TabBar({ active, onChange, onCheckIn }) {
  const tabs = [['today','Today'],['calendar','Calendar'],['__fab','' ],['insights','Insights'],['trophy','Trophy']];
  return (
    <div style={{ position: 'relative', padding: '10px 14px 26px' }}>
      <div className="glass" style={{ borderRadius: 'var(--r-card-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '10px 8px', height: 64 }}>
        {tabs.map(([key, label]) => {
          if (key === '__fab') return <div key="fab" style={{ width: 58 }} />;
          const on = active === key;
          return (
            <button key={key} onClick={() => onChange(key)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1, padding: 0 }}>
              <Icon name={key} size={26} color={on ? 'var(--forest)' : 'var(--ink-3)'} fill={on ? 'fill' : 'none'} stroke={on ? 1.9 : 1.75} />
              <span style={{ fontSize: 10.5, fontWeight: on ? 800 : 600, color: on ? 'var(--forest)' : 'var(--ink-3)', letterSpacing: '0.01em' }}>{label}</span>
            </button>
          );
        })}
      </div>
      {/* center FAB */}
      <button onClick={onCheckIn} aria-label="Check in" style={{ position: 'absolute', top: -2, left: '50%', transform: 'translateX(-50%)', width: 60, height: 60, borderRadius: 'var(--r-full)', border: '3.5px solid var(--paper)', background: 'linear-gradient(155deg, var(--forest), var(--forest-deep))', boxShadow: 'var(--e-forest)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="checkin" size={30} color="#fff" stroke={2} />
      </button>
    </div>
  );
}

// ---- Large-title header ----
function Header({ title, kicker, right, onBack, sticky }) {
  return (
    <div style={{ padding: '6px 22px 10px' }}>
      {onBack && (
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--forest)', fontWeight: 700, fontSize: 16, padding: '4px 0', marginBottom: 6 }}>
          <Icon name="back" size={20} color="var(--forest)" stroke={2.2} /> Back
        </button>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div>
          {kicker && <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-deep)', marginBottom: 3 }}>{kicker}</div>}
          <h1 style={{ fontFamily: 'var(--font-ui)', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink)', margin: 0, lineHeight: 1.05 }}>{title}</h1>
        </div>
        {right}
      </div>
    </div>
  );
}

// ---- Card ----
function Card({ children, onClick, style, pad = 18, glow }) {
  return (
    <div onClick={onClick} className={onClick ? 'pressable' : ''} style={{ background: 'var(--card)', borderRadius: 'var(--r-card)', boxShadow: glow ? 'var(--e3)' : 'var(--e2)', border: '0.5px solid var(--hairline)', padding: pad, position: 'relative', cursor: onClick ? 'pointer' : 'default', ...style }}>
      {children}
    </div>
  );
}

// ---- Round icon button ----
function IconBtn({ name, onClick, label, tone = 'var(--ink-2)', bg = 'var(--card)' }) {
  return (
    <button onClick={onClick} aria-label={label} style={{ width: 40, height: 40, borderRadius: 'var(--r-full)', background: bg, border: '0.5px solid var(--hairline)', boxShadow: 'var(--e1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} size={21} color={tone} />
    </button>
  );
}

// ---- Segmented control ----
function Segmented({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', background: 'var(--paper-2)', borderRadius: 'var(--r-btn)', padding: 3, border: '0.5px solid var(--hairline)' }}>
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value;
        const l = typeof o === 'string' ? o : o.label;
        const on = v === value;
        return (
          <button key={v} onClick={() => onChange(v)} style={{ flex: 1, border: 'none', cursor: 'pointer', padding: '8px 6px', borderRadius: 11, fontWeight: 700, fontSize: 13.5, color: on ? 'var(--ink)' : 'var(--ink-3)', background: on ? 'var(--card)' : 'transparent', boxShadow: on ? 'var(--e1)' : 'none', transition: 'all var(--d-fast)' }}>{l}</button>
        );
      })}
    </div>
  );
}

// ---- Count-up numeral ----
function CountUp({ to, dur = 900, className, style, suffix = '' }) {
  const [n, setN] = useState(0);
  const reduce = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches).current;
  useEffect(() => {
    if (reduce) { setN(to); return; }
    let raf, start;
    const step = (t) => { if (!start) start = t; const p = Math.min(1, (t - start) / dur); setN(Math.round((1 - Math.pow(1 - p, 3)) * to)); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span className={className} style={style}>{n}{suffix}</span>;
}

// ---- Bottom sheet ----
function Sheet({ open, onClose, children, dark }) {
  const [show, setShow] = useState(open);
  useEffect(() => { if (open) setShow(true); }, [open]);
  if (!show && !open) return null;
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 90, display: 'flex', alignItems: 'flex-end', borderRadius: 40, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,30,25,0.4)', opacity: open ? 1 : 0, transition: 'opacity var(--d-base)' }} />
      <div onClick={(e) => e.stopPropagation()} onTransitionEnd={() => { if (!open) setShow(false); }} className={dark ? 'dark' : ''} style={{ position: 'relative', width: '100%', background: 'var(--card)', borderTopLeftRadius: 'var(--r-sheet)', borderTopRightRadius: 'var(--r-sheet)', boxShadow: 'var(--e4)', padding: '14px 20px 36px', transform: open ? 'translateY(0)' : 'translateY(100%)', transition: 'transform var(--d-base) var(--ease-out)', maxHeight: '88%', overflowY: 'auto' }}>
        <div style={{ width: 38, height: 5, borderRadius: 100, background: 'var(--hairline)', margin: '0 auto 14px' }} />
        {children}
      </div>
    </div>
  );
}

// ---- Celebration burst (one-shot gold particles) ----
function Burst({ trigger }) {
  const reduce = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches).current;
  if (reduce || !trigger) return null;
  const N = 14;
  return (
    <div key={trigger} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100, overflow: 'hidden' }}>
      {Array.from({ length: N }).map((_, i) => {
        const ang = (i / N) * Math.PI * 2;
        const dist = 120 + Math.random() * 90;
        const x = Math.cos(ang) * dist, y = Math.sin(ang) * dist - 40;
        const c = i % 3 === 0 ? 'var(--forest)' : 'var(--gold)';
        const sz = 7 + Math.random() * 7;
        return <span key={i} style={{ position: 'absolute', top: '42%', left: '50%', width: sz, height: sz, borderRadius: i % 2 ? '50%' : 2, background: c, animation: `burst-${i % 4} 900ms var(--ease-out) forwards`, '--x': x + 'px', '--y': y + 'px' }} />;
      })}
    </div>
  );
}

window.LaurelUI = { Phone, TabBar, Header, Card, IconBtn, Segmented, CountUp, Sheet, Burst, StatusBar };
Object.assign(window, { Phone, TabBar, Header, Card, IconBtn, Segmented, CountUp, Sheet, Burst });
