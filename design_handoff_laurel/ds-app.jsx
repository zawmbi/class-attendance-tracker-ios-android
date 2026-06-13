// ============================================================
// Laurel Design System — document app
// ============================================================
const { useState } = React;

// ---- App icon concept: evergreen squircle + laurel + momentum check ----
function AppIcon({ size = 120, radius }) {
  const r = radius ?? size * 0.225;
  const uid = 'app' + size;
  return (
    <div style={{ width: size, height: size, borderRadius: r, position: 'relative', overflow: 'hidden', boxShadow: 'var(--e3)' }} className="grain">
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 110% at 30% 18%, var(--forest) 0%, var(--forest-deep) 60%, oklch(0.24 0.035 170) 100%)' }} />
      {/* top gloss */}
      <div style={{ position: 'absolute', insetInline: 0, top: 0, height: '46%', background: 'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0))' }} />
      <svg viewBox="0 0 24 24" width={size} height={size} style={{ position: 'absolute', inset: 0 }}>
        <g transform="translate(0,0.5)">
          {/* laurel */}
          <g stroke="var(--gold)" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
            <path d="M12 20c-3 0-5.6-1.9-6.6-4.7.3-1.9 1.4-3.4 3-4.2M12 20c3 0 5.6-1.9 6.6-4.7-.3-1.9-1.4-3.4-3-4.2" />
            <path d="M9 13.4c-1.5.2-2.8-.4-3.6-1.5M15 13.4c1.5.2 2.8-.4 3.6-1.5M10.4 10.2c-1.3-.3-2.3-1.2-2.6-2.6M13.6 10.2c1.3-.3 2.3-1.2 2.6-2.6" />
          </g>
          {/* momentum check */}
          <path d="M8.4 12.4l2.5 2.5 5-5.4" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

// ---- section scaffold ----
function Section({ id, kicker, title, lead, children }) {
  return (
    <section id={id} style={{ padding: '60px 0 8px' }}>
      <div className="wrap">
        <div className="ds-kicker">{kicker}</div>
        <h2 className="ds-h2">{title}</h2>
        {lead && <p className="ds-lead" style={{ marginTop: 14 }}>{lead}</p>}
        <div style={{ marginTop: 30 }}>{children}</div>
      </div>
    </section>
  );
}

function Swatch({ varName, name, hint, big }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ height: big ? 92 : 64, borderRadius: 'var(--r-btn)', background: `var(${varName})`, border: '0.5px solid var(--hairline)', boxShadow: 'var(--e1)' }} />
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{name}</div>
        <div className="mono-note">{varName}{hint ? ` · ${hint}` : ''}</div>
      </div>
    </div>
  );
}

function Tile({ children, label, pad = 24, style }) {
  return (
    <div className="card" style={{ padding: pad, display: 'flex', flexDirection: 'column', gap: 16, ...style }}>
      {children}
      {label && <div className="mono-note" style={{ marginTop: 'auto' }}>{label}</div>}
    </div>
  );
}

// ---- buttons showcase ----
function Btn({ kind = 'primary', children, icon }) {
  const base = { display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 16, padding: '13px 20px', borderRadius: 'var(--r-btn)', border: 'none', cursor: 'pointer', letterSpacing: '-0.01em' };
  const styles = {
    primary:   { ...base, background: 'linear-gradient(180deg, var(--forest), var(--forest-deep))', color: '#fff', boxShadow: 'var(--e-forest)' },
    accent:    { ...base, background: 'linear-gradient(180deg, var(--gold), var(--gold-deep))', color: '#3a2a06', boxShadow: 'var(--e-gold)' },
    secondary: { ...base, background: 'var(--forest-soft)', color: 'var(--forest)' },
    tertiary:  { ...base, background: 'transparent', color: 'var(--forest)', padding: '13px 12px' },
    destructive:{ ...base, background: 'var(--absent-soft)', color: 'var(--absent)' },
  };
  return <button style={styles[kind]}>{icon && <Icon name={icon} size={18} color={kind==='primary'?'#fff':kind==='accent'?'#3a2a06':'currentColor'} stroke={2} />}{children}</button>;
}

function DSApp() {
  const NAV = [['concept','Concept'],['color','Color'],['type','Type'],['scale','Scale'],['icons','Icons'],['components','Components'],['motion','Motion'],['a11y','Access'],['handoff','Handoff']];
  const heatRow = (vals) => (
    <div style={{ display: 'flex', gap: 4 }}>
      {vals.map((v, i) => <div key={i} style={{ width: 16, height: 16, borderRadius: 4, background: v === 0 ? 'var(--hairline)' : `color-mix(in oklab, var(--forest) ${20 + v*26}%, transparent)` }} />)}
    </div>
  );

  return (
    <div className="grain" style={{ position: 'relative', minHeight: '100vh', paddingBottom: 100 }}>
      {/* masthead */}
      <header className="wrap" style={{ paddingTop: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
          <AppIcon size={104} />
          <div>
            <div className="ds-kicker">Design Language · Attendance Tracker</div>
            <h1 className="font-display" style={{ fontSize: 'clamp(52px, 9vw, 92px)', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 0.92, margin: '6px 0 0', color: 'var(--ink)' }}>Laurel</h1>
          </div>
        </div>
        <p className="ds-lead" style={{ marginTop: 26, fontSize: 21 }}>
          Attendance tracking is quietly stressful. <strong style={{ color: 'var(--ink)' }}>Laurel reframes it as building momentum</strong> — a calm, prestigious academic companion in evergreen and laurel-gold that rewards consistency. Depth comes from soft layered shadows, warm grain, gradient fills and glass; never flat. Two signatures carry the identity: the <strong style={{ color: 'var(--forest)' }}>Momentum Ring</strong> and the <strong style={{ color: 'var(--gold-deep)' }}>Buffer Gauge</strong>.
        </p>
        <a href="Attendance Tracker — Prototype.html" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 24, textDecoration: 'none', fontWeight: 700, color: 'var(--forest)', background: 'var(--forest-soft)', padding: '11px 18px', borderRadius: 'var(--r-full)' }}>
          Open the interactive prototype <Icon name="arrowRight" size={18} color="var(--forest)" stroke={2} />
        </a>
      </header>

      {/* sticky nav */}
      <nav className="scrollnav" style={{ marginTop: 44 }}>
        <div className="glass" style={{ borderRadius: 0, borderInline: 'none' }}>
          <div className="wrap" style={{ display: 'flex', gap: 4, overflowX: 'auto', padding: '11px 28px' }}>
            {NAV.map(([id, label]) => <a key={id} href={'#' + id}>{label}</a>)}
          </div>
        </div>
      </nav>

      {/* CONCEPT */}
      <Section id="concept" kicker="01 · Identity" title="A point of view" lead="Three principles drive every decision. They keep the product calm at a glance, rewarding in the moment, and trustworthy over a whole semester.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {[
            ['Glance → Act → Understand', 'Every screen front-loads the one number that matters, then the single most likely action, then the detail. No hunting.'],
            ['Earned, not loud', 'Gamification is prestige, not confetti spam. Gold is reserved for genuine achievement — rank-ups, streaks, unlocks.'],
            ['Tactile depth', 'Layering, soft shadows, gradient fills, grain and glass create elevation. It feels like a physical object, not a web form.'],
          ].map(([t, d]) => (
            <div key={t} className="card" style={{ padding: 24 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--ink)' }}>{t}</div>
              <p style={{ color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 0, marginTop: 10 }}>{d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* COLOR */}
      <Section id="color" kicker="02 · Color" title="Evergreen & honey-gold" lead="Green is the brand — structure, surfaces, the trustworthy baseline. Gold is the single accent, rationed for momentum and achievement. Status colors stay calm and never shout. Full light + dark parity.">
        <div className="mono-note" style={{ marginBottom: 12, fontWeight: 700, color: 'var(--ink-2)' }}>LIGHT</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16 }}>
          <Swatch varName="--forest" name="Forest / brand" hint="0.45 .074 156" big />
          <Swatch varName="--forest-deep" name="Forest deep" big />
          <Swatch varName="--moss" name="Moss" big />
          <Swatch varName="--gold" name="Gold / accent" hint="0.80 .128 79" big />
          <Swatch varName="--gold-deep" name="Gold deep" big />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 16, marginTop: 20 }}>
          <Swatch varName="--present" name="Present" />
          <Swatch varName="--late" name="Late" />
          <Swatch varName="--absent" name="Absent" />
          <Swatch varName="--excused" name="Excused" />
          <Swatch varName="--risk-danger" name="Risk" />
          <Swatch varName="--paper" name="Paper" />
          <Swatch varName="--paper-2" name="Sunken" />
          <Swatch varName="--ink" name="Ink" />
        </div>
        <div className="dark" style={{ marginTop: 28, background: 'var(--paper)', borderRadius: 'var(--r-card-lg)', padding: 24, boxShadow: 'var(--e2)' }}>
          <div className="mono-note" style={{ marginBottom: 12, fontWeight: 700, color: 'var(--ink-2)' }}>DARK</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 16 }}>
            <Swatch varName="--forest" name="Forest" />
            <Swatch varName="--gold" name="Gold" />
            <Swatch varName="--present" name="Present" />
            <Swatch varName="--late" name="Late" />
            <Swatch varName="--absent" name="Absent" />
            <Swatch varName="--card" name="Card" />
            <Swatch varName="--paper-2" name="Sunken" />
            <Swatch varName="--ink" name="Ink" />
          </div>
        </div>
      </Section>

      {/* TYPE */}
      <Section id="type" kicker="03 · Typography" title="Fraunces, rationed. Outfit, everywhere." lead="Outfit carries all UI — a clean geometric sans that stays highly legible at small sizes with great Dynamic Type behavior. Fraunces is reserved strictly for hero numerals and rank names, so the serif reads as a signature flourish, never as decoration on every label.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div className="card" style={{ padding: 28 }}>
            <div className="mono-note">Fraunces · display — hero numerals & ranks</div>
            <div className="font-display tnum" style={{ fontSize: 92, fontWeight: 600, lineHeight: 0.9, color: 'var(--forest)', marginTop: 8 }}>94<span style={{ fontSize: 40, color: 'var(--ink-3)' }}>%</span></div>
            <div className="font-display" style={{ fontSize: 34, fontWeight: 600, color: 'var(--ink)' }}>Valedictorian</div>
          </div>
          <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="mono-note">Outfit · UI scale</div>
            {[['Large Title', 34, 700],['Title 2', 22, 700],['Headline', 17, 700],['Body', 17, 500],['Subhead', 15, 600],['Footnote', 13, 600]].map(([n, s, w]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, borderBottom: '0.5px solid var(--hairline)', paddingBottom: 7 }}>
                <span style={{ fontSize: s, fontWeight: w, color: 'var(--ink)' }}>{n}</span>
                <span className="mono-note">{s}px · {w}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* SCALE: spacing / radii / elevation */}
      <Section id="scale" kicker="04 · Scale" title="Spacing, radii & elevation" lead="A 4-pt spacing grid, a friendly radius ramp, and four soft warm-tinted elevation levels (plus two colored ambient glows for signature moments) keep everything consistent and fast to build.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <Tile label="4-pt spacing · s1–s10">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
              {[4,8,12,16,20,24,32,40].map((v) => <div key={v} title={v+'px'} style={{ width: 18, height: v*1.4, background: 'var(--forest)', borderRadius: 4, opacity: 0.85 }} />)}
            </div>
          </Tile>
          <Tile label="Radii · chip 9 · btn 14 · card 22 · sheet 34">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {[['9',9],['14',14],['22',22],['34',34]].map(([l, r]) => <div key={l} style={{ width: 54, height: 54, background: 'var(--forest-soft)', border: '1.5px solid var(--forest)', borderRadius: r, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--forest)' }}>{l}</div>)}
            </div>
          </Tile>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginTop: 16 }}>
          {[['e1','--e1'],['e2','--e2'],['e3','--e3'],['e4','--e4']].map(([n, v]) => (
            <div key={n} style={{ height: 96, borderRadius: 'var(--r-card)', background: 'var(--card)', boxShadow: `var(${v})`, display: 'flex', alignItems: 'flex-end', padding: 14 }}>
              <span className="mono-note" style={{ fontWeight: 700 }}>{n}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ICONS */}
      <Section id="icons" kicker="05 · Iconography" title="One bespoke family" lead="A single grid (24×24), one stroke weight (1.75 optical), round caps and joins, ~2px corner radii. Tab glyphs gain a soft fill when active. Built as clean paths for react-native-svg; every icon ships with a VoiceOver label (see Access).">
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 8 }}>
            {window.ICON_NAMES.map((n) => (
              <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 6px', borderRadius: 'var(--r-btn)', color: 'var(--ink)' }}>
                <Icon name={n} size={26} color="var(--forest)" />
                <span className="mono-note" style={{ fontSize: 11 }}>{n}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginTop: 16 }}>
          <Tile label="App icon · evergreen squircle, gold laurel + momentum check">
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <AppIcon size={96} /><AppIcon size={60} /><AppIcon size={38} />
            </div>
          </Tile>
          <Tile label="Tab glyphs — active gains soft fill + gold">
            <div style={{ display: 'flex', gap: 22 }}>
              {['today','calendar','checkin','insights','trophy'].map((n, i) => (
                <div key={n} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                  <Icon name={n} size={28} color={i===0?'var(--forest)':'var(--ink-3)'} fill={i===0?'fill':'none'} />
                  <span className="mono-note" style={{ fontSize: 10, color: i===0?'var(--forest)':'var(--ink-3)' }}>{i===0?'active':''}</span>
                </div>
              ))}
            </div>
          </Tile>
        </div>
      </Section>

      {/* COMPONENTS */}
      <Section id="components" kicker="06 · Components" title="Signature objects & primitives" lead="Two signatures plus a small, consistent kit. Everything below is the real component used in the prototype.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <Tile label="Momentum Ring — XP arc · rank core · streak flame" style={{ alignItems: 'center' }}>
            <MomentumRing size={180} animate={false} />
          </Tile>
          <Tile label="Buffer Gauge — the absence buffer, at a glance" style={{ alignItems: 'center' }}>
            <BufferGauge canMiss={3} total={5} size={200} />
          </Tile>
          <Tile label="Status pills">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <StatusPill status="present" /><StatusPill status="late" /><StatusPill status="absent" /><StatusPill status="excused" />
            </div>
            <div style={{ height: 1 }} />
            <Meter value={0.82} />
            <Meter value={0.46} tone="var(--late)" />
          </Tile>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
          <Tile label="Buttons — primary · accent · secondary · tertiary · destructive">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <Btn kind="primary" icon="checkin">Check in</Btn>
              <Btn kind="accent" icon="bolt">Claim XP</Btn>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <Btn kind="secondary">Secondary</Btn>
              <Btn kind="tertiary" icon="plus">Add class</Btn>
              <Btn kind="destructive" icon="trash">Delete</Btn>
            </div>
          </Tile>
          <Tile label="States — default · hover · disabled (focus = 2px gold ring)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['Default', {}],['Hover', { background: 'var(--forest-deep)' }],['Focus', { outline: '2.5px solid var(--gold)', outlineOffset: 2 }],['Disabled', { opacity: 0.4 }]].map(([l, s]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button style={{ background: 'linear-gradient(180deg, var(--forest), var(--forest-deep))', color: '#fff', border: 'none', borderRadius: 'var(--r-btn)', padding: '11px 18px', fontWeight: 700, fontFamily: 'var(--font-ui)', fontSize: 15, ...s }}>Check in</button>
                  <span className="mono-note">{l}</span>
                </div>
              ))}
            </div>
          </Tile>
        </div>
      </Section>

      {/* MOTION */}
      <Section id="motion" kicker="07 · Motion" title="Micro-interactions" lead="Motion confirms cause and effect and makes achievement feel earned. Springy for rewards, ease-out for navigation. Everything degrades gracefully under Reduce Motion to a simple opacity fade.">
        <div className="card" style={{ overflow: 'hidden' }}>
          {[
            ['Check-in tap', 'Card scales 0.98 → 1, status pill cross-fades, soft haptic (impact light)', '160ms · ease-spring'],
            ['XP gain', 'Number rolls up (count-up), ring arc fills, brief gold sheen sweep', '1100ms · ease-out'],
            ['Rank-up', 'Ring pulses, laurel scales in, gold particle burst (one-shot), success haptic', '700ms · ease-spring'],
            ['Streak', 'Flame badge bounces, count increments, warm glow', '420ms · ease-spring'],
            ['Progress fills', 'Meters & buffer animate from 0 on first paint / value change', '900ms · ease-out'],
            ['Screen / sheet', 'iOS push (slide-in) · sheets rise with rubber-band, dim backdrop', '240ms · ease-out'],
          ].map(([n, d, t], i) => (
            <div key={n} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 180px', gap: 16, padding: '16px 24px', alignItems: 'center', borderTop: i ? '0.5px solid var(--hairline)' : 'none' }}>
              <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{n}</div>
              <div style={{ color: 'var(--ink-2)', fontSize: 15 }}>{d}</div>
              <div className="mono-note" style={{ textAlign: 'right', color: 'var(--gold-deep)', fontWeight: 700 }}>{t}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* A11Y */}
      <Section id="a11y" kicker="08 · Accessibility" title="Calm and usable for everyone" lead="">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Contrast</div>
            <p style={{ color: 'var(--ink-2)', lineHeight: 1.5, marginTop: 0 }}>Ink on paper ≈ 12:1. Forest-on-white text & white-on-forest both clear 4.5:1 (AA body). Gold is never used for body text on light surfaces — only on dark ink fills or as a large accent — because gold-on-cream fails AA at small sizes. Status is never conveyed by color alone; every status carries an icon + label.</p>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Dynamic Type & Reduce Motion</div>
            <p style={{ color: 'var(--ink-2)', lineHeight: 1.5, marginTop: 0 }}>UI text uses scalable units and reflows to single-column past the larger accessibility sizes; the Momentum Ring numerals cap their growth so the ring never clips. Reduce Motion replaces springs, count-ups and the rank-up burst with a 160ms opacity fade.</p>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>VoiceOver labels for icons</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
              {[['today','Today'],['checkin','Check in'],['present','Present'],['late','Late'],['absent','Absent'],['flame','Streak, 23 days'],['trophy','Trophy case'],['target','Absence buffer']].map(([ic, lbl]) => (
                <div key={ic} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name={ic} size={18} color="var(--forest)" />
                  <span className="mono-note">"{lbl}"</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* HANDOFF */}
      <Section id="handoff" kicker="09 · Build handoff" title="Maps to NativeWind / RN" lead="Tokens become a Tailwind theme; signatures become SVG components; no new heavy native deps.">
        <div className="card" style={{ padding: 24, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14.5 }}>
            <thead><tr style={{ textAlign: 'left', color: 'var(--ink-3)' }}>
              <th style={{ padding: '8px 12px', fontWeight: 700 }}>Laurel piece</th>
              <th style={{ padding: '8px 12px', fontWeight: 700 }}>Implementation</th>
            </tr></thead>
            <tbody>
              {[
                ['Color tokens', 'tailwind.config → theme.colors (forest, gold, present…). Light/dark via NativeWind dark: variant + useColorScheme().'],
                ['Spacing / radii', 'theme.spacing on the 4-pt grid; theme.borderRadius (chip/btn/card/sheet).'],
                ['Elevation', 'Preset shadow classes; iOS shadowColor tinted forest. Colored ambient = a blurred absolutely-positioned glow View behind hero.'],
                ['Type', 'expo-font: Fraunces (numerals/ranks) + Outfit. allowFontScaling on for Dynamic Type.'],
                ['Momentum Ring / Buffer Gauge', 'react-native-svg Circle/Path with strokeDasharray; animate strokeDashoffset & count-up via Reanimated useSharedValue.'],
                ['Grain & glass', 'Grain = a tiled noise PNG at low opacity (soft-light). Glass = expo-blur BlurView (no new native build beyond Expo SDK).'],
                ['Icons', 'react-native-svg path components, one <Icon name/> wrapper. accessibilityLabel per glyph.'],
                ['Motion', 'Reanimated 3 (withSpring / withTiming) + expo-haptics. Honor AccessibilityInfo.isReduceMotionEnabled.'],
              ].map(([a, b], i) => (
                <tr key={a} style={{ borderTop: '0.5px solid var(--hairline)' }}>
                  <td style={{ padding: '12px', fontWeight: 700, color: 'var(--forest)', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{a}</td>
                  <td style={{ padding: '12px', color: 'var(--ink-2)', lineHeight: 1.5 }}>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
window.DSApp = DSApp;
