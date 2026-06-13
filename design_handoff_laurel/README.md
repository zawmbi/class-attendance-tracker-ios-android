# Handoff: Laurel — Attendance Tracker (full visual rehaul)

> **Stack target:** React Native + Expo, NativeWind (Tailwind), react-native-svg, Reanimated 3, expo-haptics, expo-blur, expo-font. No new heavy native modules required.

---

## Overview

**Laurel** is a complete visual + IA rehaul of an iOS-first attendance self-tracker for college/grad students. It reframes attendance tracking as **building momentum**: students log Present / Late / Absent per class, earn XP, climb academic ranks (Freshman → Valedictorian), build streaks, and unlock badges. The signature utility is the **Buffer** — exactly how many more classes a student can miss before dropping below their requirement. A Premium tier adds an **end-of-term Forecast & Analytics** suite.

Design identity: a calm, prestigious academic companion in **deep spruce green + honey-gold**, with tactile depth (soft layered shadows, warm grain, gradient fills, glass) — never flat. Two signature objects carry the brand: the **Momentum Ring** and the **Buffer Gauge**.

---

## About the design files

The files in this bundle are **design references created in HTML/React (Babel-in-browser)** — high-fidelity prototypes showing intended look and behavior. **They are not production code to copy directly.** Your task is to **recreate these designs in the RN + Expo + NativeWind environment** using its established patterns (Tailwind classes via NativeWind, `react-native-svg` for the signature graphics, Reanimated for motion). Treat the HTML as the source of truth for layout, color, type, spacing, and interaction — then build it idiomatically in RN.

The prototype is split into focused files (see **Files** at the bottom). All visual values come from `tokens.css` — port that first as your NativeWind theme.

## Fidelity

**High-fidelity.** Final colors, typography, spacing, radii, shadows, and interactions are all specified. Recreate pixel-faithfully using RN/NativeWind equivalents. Where a CSS feature has no direct RN analog (e.g. `mix-blend-mode` grain, `backdrop-filter` glass), use the documented RN substitute (noise PNG, `expo-blur`).

---

## Design tokens

Port these first into `tailwind.config.js` (`theme.extend`) and a `ThemeProvider`. All colors are authored in **OKLCH**; hex equivalents are given for convenience (sRGB-clamped, ~±1). Light + dark are full parity — drive dark via NativeWind `dark:` + `useColorScheme()`.

### Color — Light

| Token | OKLCH | ~Hex | Use |
|---|---|---|---|
| `paper` | `0.985 0.008 95` | `#FAF8F2` | App background (warm cream) |
| `paper-2` | `0.965 0.013 92` | `#F2EFE5` | Grouped / sunken bg |
| `card` | `1 0 0` | `#FFFFFF` | Raised card |
| `card-2` | `0.992 0.006 95` | `#FCFBF7` | Nested fill |
| `hairline` | `0.42 0.02 150 / 0.12` | rgba | Borders / dividers (12% green-black) |
| `ink` | `0.26 0.022 152` | `#2B3A33` | Primary text (warm green-black) |
| `ink-2` | `0.45 0.018 150` | `#5C6B62` | Secondary text |
| `ink-3` | `0.60 0.014 150` | `#828E86` | Tertiary / captions |
| `forest` | `0.40 0.046 168` | `#2F5247` | **Brand** — deep muted spruce |
| `forest-deep` | `0.30 0.038 170` | `#223D34` | Brand deep (gradients) |
| `forest-soft` | `0.93 0.021 165` | `#E4EDE7` | Tinted fill |
| `moss` | `0.56 0.05 165` | `#6E8C7E` | Lighter green |
| `gold` | `0.80 0.128 79` | `#E0A53D` | **Accent** — honey-gold (achievement only) |
| `gold-deep` | `0.69 0.13 71` | `#C08527` | Gold deep |
| `gold-soft` | `0.94 0.045 84` | `#F6ECD6` | Gold tinted fill |

### Color — Status (light)

| Token | OKLCH | ~Hex | Use |
|---|---|---|---|
| `present` | `0.52 0.062 165` | `#5C8170` | Present (muted green) |
| `present-soft` | `0.92 0.028 163` | `#E3EDE7` | Present fill |
| `late` | `0.76 0.125 70` | `#D69A3E` | Late (amber) |
| `late-soft` | `0.94 0.05 80` | `#F5ECD7` | Late fill |
| `absent` | `0.585 0.145 33` | `#C45B3C` | Absent (clay/terracotta) |
| `absent-soft` | `0.93 0.04 38` | `#F3E2DA` | Absent fill |
| `excused` | `0.60 0.05 250` | `#7186A8` | Excused (slate-blue) |
| `excused-soft` | `0.93 0.025 250` | `#E3E7EF` | Excused fill |
| `risk-danger` | `0.56 0.16 30` | `#BE4A33` | Risk / at-risk |

### Color — Dark (overrides)

| Token | OKLCH | ~Hex |
|---|---|---|
| `paper` | `0.19 0.014 158` | `#1A211D` (warm espresso-green black) |
| `paper-2` | `0.165 0.013 158` | `#161C19` |
| `card` | `0.235 0.017 158` | `#222B26` |
| `card-2` | `0.275 0.018 158` | `#2A332E` |
| `hairline` | `0.9 0.01 150 / 0.10` | rgba (10% white) |
| `ink` | `0.95 0.012 92` | `#F2EFE8` |
| `ink-2` | `0.78 0.014 120` | `#BCC2BB` |
| `ink-3` | `0.62 0.014 140` | `#909A92` |
| `forest` | `0.68 0.066 168` | `#86AC9C` |
| `gold` | `0.83 0.13 80` | `#EBAE45` |
| `present` | `0.68 0.078 165` | `#86AC97` |
| `late` | `0.80 0.12 74` | `#E6B055` |
| `absent` | `0.66 0.15 35` | `#D87355` |
| `risk-danger` | `0.66 0.17 32` | `#D4654A` |

### Typography

Two families via `expo-font`. Keep `allowFontScaling` on for Dynamic Type.

- **Outfit** — the UI font; all UI text. Weights 400/500/600/700/800.
- **Fraunces** (display serif) — **reserved strictly** for hero numerals and rank names. Weights 400/500/600/700. Do NOT use Fraunces for body/labels.

iOS-aligned scale (px):

| Role | Size | Weight | Notes |
|---|---|---|---|
| Hero numeral | 56 | 600 | Fraunces, gamification numbers (XP, %, buffer) |
| Large title | 34 | 700–800 | Screen titles (Outfit) |
| Title 1 | 28 | 800 | Sheet/overlay titles |
| Title 2 | 22 | 700 | Section heads |
| Title 3 | 20 | 700 | |
| Headline | 17 | 700 | Emphasis |
| Body | 17 | 500 | |
| Callout | 16 | 600 | |
| Subhead | 15 | 600 | |
| Footnote | 13 | 600 | |
| Caption | 12 | 600 | |

Numerals that change (XP, %, counts) use **tabular-nums** (`fontVariant: ['tabular-nums']`).

### Spacing (4-pt grid)

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64` → tokens `s1…s10`.

### Radii

| Token | px | Use |
|---|---|---|
| `chip` | 9 | small chips |
| `btn` | 14 | buttons |
| `field` | 16 | fields, tiles, status squares |
| `card` | 22 | cards |
| `card-lg` | 28 | hero cards |
| `sheet` | 34 | bottom sheets |
| `full` | 9999 | pills, rings, avatars |

### Elevation (soft, warm-tinted; light)

All shadow color = forest-tinted `oklch(0.34 0.04 150)`.

| Token | Value |
|---|---|
| `e1` | `0 1px 2px /6%, 0 1px 3px /5%` |
| `e2` | `0 2px 4px /5%, 0 4px 10px /7%` |
| `e3` | `0 6px 14px /8%, 0 12px 28px /9%` |
| `e4` | `0 10px 24px /10%, 0 24px 56px /13%` |
| `e-gold` | `0 8px 26px oklch(0.69 0.13 71 / 0.30)` — gold ambient glow |
| `e-forest` | `0 10px 30px oklch(0.34 0.062 157 / 0.32)` — forest ambient glow |

In RN: use `shadowColor` (tinted) + `shadowOpacity/Radius/Offset` on iOS; `elevation` on Android. The colored ambient glows (`e-gold`, `e-forest`) behind hero elements are best done as a **blurred, absolutely-positioned View** behind the card (a radial-gradient PNG or a `<Svg>` radial), not a box-shadow.

### Motion

| Easing | Curve | Use |
|---|---|---|
| `ease-out` | `cubic-bezier(0.22,1,0.36,1)` | navigation, fills, fades |
| `ease-spring` | `cubic-bezier(0.34,1.56,0.64,1)` | rewards, pops, rank-up |
| `ease-in-out` | `cubic-bezier(0.65,0,0.35,1)` | |

Durations: `fast 160ms`, `base 240ms`, `slow 420ms`. Honor `AccessibilityInfo.isReduceMotionEnabled` → replace springs/count-ups/bursts with a 160ms opacity fade.

### Depth treatments (the "not flat" requirement)

- **Grain**: a tiled fractal-noise PNG at ~50% opacity, `mix-blend-mode: soft-light` over warm surfaces. In RN: a tiled `Image` (or `ImageBackground`) of a noise texture at low opacity over hero/dark surfaces.
- **Glass** (tab bar, sheets, sidebar): `expo-blur` `BlurView` (light/dark tint) + a hairline top inset highlight + e3 shadow.
- **Gradients**: `expo-linear-gradient`. Hero green gradient: `155deg, forest → forest-deep(70%) → oklch(0.25 0.035 170)`. Gold pill/badge: `180deg, gold → gold-deep`.

---

## Information architecture (what moved & why)

**Tab bar (5 slots) with a center Check-In FAB:**
`Today` · `Calendar` · **[Check-In FAB]** · `Insights` · `Trophy`

Rationale — a student's real loop is **glance → act → understand**:
- **Today (home)** front-loads the one number that matters (Momentum), then today's classes (act), then teasers (understand). The check-in action is promoted to a always-present center FAB because logging is the core daily habit.
- **Calendar** promoted to a primary tab (week/month/semester) — students think in their weekly schedule.
- **Insights** (was buried) is a primary tab; it now also hosts the Premium **Forecast** teaser.
- **Trophy** (rank + badges) is its own tab so gamification has a home without cluttering daily use.
- **Settings, Premium, Add/Edit Class, Class Detail, Forecast, Onboarding** are pushed/modal screens, not tabs.

**iPad**: replaces the tab bar with a **left sidebar** (Today, Insights, Forecast, + Check-in button) and uses genuine **multi-column** content — not a stretched phone.

---

## Signature components (build these as reusable RN/SVG components)

### 1. Momentum Ring (`react-native-svg` + Reanimated)
A layered circular hero fusing three things:
- **XP progress** → a stroked circle arc. `strokeDasharray = 2πr`, animate `strokeDashoffset` from full to `(1−xp/xpMax)·C` over **1100ms ease-out**. Stroke is a gradient `gold → gold-deep → forest`, round cap, with a soft drop shadow.
- **Rank + Level core** → glossy inner circle (radial fill card-2 → paper-2), showing rank label (Outfit, uppercase, forest) + level numeral (**Fraunces**, ~34% of ring size) + `xp/xpMax XP`.
- **Streak flame badge** → a gold gradient pill top-right with a flame icon + streak count.
- Sizes used: 132 (phone hero), 168 (system doc), 188 (iPad hero).
- Track ring = `hairline`. Reduced-motion: render at final value, no animation.

### 2. Buffer Gauge (`react-native-svg`)
A **270° fuel-gauge arc** showing "how many classes you can still miss."
- Arc from 225° spanning 270°. Track = hairline (width ~13). Progress = gradient `forest → tone`, animated over 900ms ease-out.
- Center: big number (**Fraunces**, ~32% size) in the tone color + caption.
- **Tone by buffer**: `≤0 → risk-danger`, `≤1 → late`, else `present`.
- Sizes: 158 (class detail), 200 (system doc).

### 3. Status Pill
Rounded-full pill, soft-tinted bg + status color text + status icon. Variants: present / late / absent / excused. Two sizes (sm/md). **Status is never color-only** — always icon + label (a11y).

### 4. Other primitives
- **Meter** — linear rounded progress bar (animated width).
- **Sparkline** — SVG line + gradient area fill + end dot.
- **Card** — bg `card`, radius `card`, border hairline, shadow e2 (or e3 when `glow`). Pressable cards scale to 0.98 + brightness 0.985 on press.
- **Segmented** — iOS segmented control (sunken track, raised active thumb with e1).
- **Stepper** — − / value / + (value in Fraunces).
- **Sheet** — bottom sheet, radius `sheet`, rises with ease-out, dim backdrop, grab handle.
- **CountUp** — animated integer roll (cubic ease, ~900ms), reduced-motion → instant.
- **Burst** — one-shot gold/forest particle burst for celebrations (reduced-motion → none).
- **Toast** — pill at bottom, ink bg, gold icon, optional action button (Undo / Freeze).

---

## Iconography (bespoke family — build as `react-native-svg`)

One cohesive set: **24×24 grid, 1.75 optical stroke, round caps & joins, ~2px corner radii.** Tab glyphs gain a soft fill (`fillOpacity ~0.16`) + forest color when active. Build a single `<Icon name size stroke color fill />` wrapper with one `accessibilityLabel` per glyph.

Glyph names in the set (see `icons.jsx` for exact paths — port the paths verbatim):
`today, calendar, insights, trophy, checkin, present, late, absent, excused, flame, bolt, laurel, target, bell, crown, lock, sparkles, plus, chevron, chevronDown, back, close, gear, search, edit, trash, chart, grid, book, clock, arrowUp, arrowRight, inbox`.

**App icon**: evergreen squircle with a radial green gradient + top gloss, a gold **laurel** wreath, and a white **momentum check** mark. Grain overlay. See `AppIcon` in `ds-app.jsx`.

**VoiceOver labels** (examples): today→"Today", checkin→"Check in", present→"Present", flame→"Streak, N days", target→"Absence buffer", trophy→"Trophy case".

---

## Screens / Views

Coordinates are described relationally; exact style values live in the referenced files. Phone canvas = 390×844 (iPhone), safe-area aware (Dynamic Island top, home indicator bottom).

### 1. Dashboard / Today  (`proto-screens-a.jsx` → `Dashboard`)
- **Greeting row**: weekday/date kicker (gold-deep, uppercase) + "Morning, {name}" (Outfit 30/800) + circular avatar button (opens Settings). Avatar = moss→forest-deep gradient with initial.
- **Momentum hero** (the focal point): full-bleed green gradient card (radius card-lg, e-forest, grain, gold radial glow top-right). Left: **Momentum Ring** (132). Right: "MOMENTUM" kicker + "You're on a roll." (Fraunces 25) + two stat chips (streak, freezes). Bottom: XP-to-next-level progress bar + "Next rank" label.
- **At-risk nudge** (conditional): if any class is `danger`, a card with target icon, "NEEDS ATTENTION", class name, "Buffer empty…", chevron → Class Detail.
- **Today list**: section title "Today" + "{n} of {m} logged" + "Check in all". Card containing rows: time · color bar · class name/code·room · StatusPill (if logged) or "Check in →" chip. **Gestures**: swipe row right = Present, left = Absent (colored reveal zones, threshold 72px); long-press = quick-log sheet; tap = Class Detail. Hint line below: "Swipe a class to log · long-press for options".
- **Trophy teaser**: horizontal scroll of unlocked badge medallions (gold gradient discs).

### 2. Quick Check-In  (`proto-screens-a.jsx` → `CheckIn`)
Full-screen modal (rises from bottom).
- Header: "QUICK CHECK-IN" + "Monday" + close button.
- Progress: "{n} of {m} logged" + "+{X} XP today" + Meter.
- "All caught up!" banner when complete (laurel medallion + streak msg).
- One card per class: time chip (class hue) + name/code·room, then three big buttons **Present / Late / Absent** (icon + label; selected = tinted bg + colored border). On tap: logs, **floats "+XP"** upward (Fraunces, 1100ms), and on Present fires the **Burst**.
- XP values: **Present +50, Late +20, Absent +5**.

### 3. Class Detail  (`proto-screens-b.jsx` → `ClassDetail`)
Pushed screen.
- Back ("Today") + edit button.
- Header: hue dot + "CODE · room", class name (28/800), "{prof} · {days} · {time}".
- **Hero card**: left = big attendance **%** (Fraunces 54, risk-toned) + "attendance" + risk pill (On track / Watch / At risk) + requirement caption ("Target X%" or "Miss ≤ N"). Right = **Buffer Gauge** (158) "more you can miss".
- **Counts row**: 3 tiles Present / Late / Absent (icon + count).
- **Projection card** (forest-soft gradient): "N classes left… finish at X%… still miss N…".
- **History list**: "Tap to edit" — each row = date + StatusPill + chevron. Tapping opens an **edit sheet** (Present/Late/Absent); changing a record **recomputes the class counts, %, and buffer live**.

### 4. Trophy Case  (`proto-screens-b.jsx` → `TrophyCase`)
- **Rank card** (dark green gradient): laurel medallion + "CURRENT RANK" + rank name (Fraunces 30) + "N levels to {next}". Below: a **rank ladder** (7 nodes Freshman→Valedictorian; done=gold w/ check, current=enlarged gold w/ white ring; connectors gold when reached).
- **Badge grid** (3-up): unlocked = gold medallion on gold-soft tile (e2); locked = lock glyph on sunken tile, with a progress bar if partially earned. Tap → detail sheet (medallion, rarity, description, progress or "Unlocked").
- Ranks: Freshman(1), Sophomore(5), Junior(10), Senior(18), Honors(26), Dean's List(35), Valedictorian(50).

### 5. Insights  (`proto-screens-b.jsx` → `Insights`)  [FREE]
- **Overall card**: big overall % (Fraunces) + "+6% vs last month" + 12-week Sparkline.
- **Forecast teaser** (Premium gate): if not premium → dark card, lock glyph, "PREMIUM" badge, **blurred** preview stats, "Unlock with Premium" → Premium screen. If premium → solid green "End-of-term Forecast" card → opens Forecast directly.
- **What to prioritize**: worst class card (risk-toned left border) → Class Detail.
- **Consistency heatmap**: 5 columns (Mon–Fri) × 12 weeks of present/late/absent squares + legend.
- **By class**: rows with hue dot, Meter, %.

### 6. Forecast & Analytics  (`proto-premium-analytics.jsx` → `PremiumAnalytics`)  [PREMIUM]
Pushed screen, gold "PREMIUM" badge, 3 segmented tabs:
- **Forecast**: projected finish % (risk-toned) + best/likely/slip scenario chips + **ForecastChart** (solid history line → dashed projection, dashed target line) + **finals countdown** tile + **What-if** slider (drag attend % → recomputes finish + at-risk count) + per-class cards (now→projected, On track/At risk, **confidence** bar, "attend N of M left").
- **Patterns**: attendance **by weekday** bars (worst day highlighted), **by time of day** meters, **monthly momentum** bars (+9 since Jan), **"when you slip"** weekday absence bars.
- **Records**: **attendance grade** (A+…D from %) medallion, **streak records** (current/longest/term-avg/freezes), **punctuality** leaderboard (on-time share per class), strongest/needs-work cards.

### 7. Calendar  (`proto-screens-c.jsx` → `CalendarScreen`)
Segmented Week / Month / Semester. Week = day selector chips (active = forest gradient) + that day's class cards. Month = grid with attendance dots. Semester = stat tiles + "Finals stretch" card.

### 8. Add / Edit Class  (`proto-screens-c.jsx` → `AddClass`)
iOS grouped form. Cancel/Save. Fields: name, code; **Schedule** day toggles; **Attendance requirement** with a **Percentage ⇄ Max absences** segmented toggle (Percentage → slider 50–100%; Max absences → Stepper); **Excused absences allowed** Stepper (don't count against buffer); **Color** picker (5 cool hues). Edit mode adds Delete.

### 9. Settings  (`proto-screens-c.jsx` → `Settings`)
Profile row; **Premium upsell** card; grouped rows (Default required %, Class reminders toggle, Sync to Calendar toggle); **Appearance → Theme** (Light/Dark segmented, persisted); General (Notifications, Help, About → Onboarding); **Reset demo data** (destructive).

### 10. Premium  (`proto-screens-c.jsx` → `Premium`)  [paywall]
Dark screen. Crown medallion + "Never miss the mark". Feature list (Forecast [tappable preview], Widgets, Unlimited classes, **Streak Freeze**). **Plan selector** (radio cards): **Monthly $3.99**, **6 Months $19.99** (POPULAR, $3.33/mo, Save 16%), **12 Months $39.99** (BEST VALUE, $3.33/mo, Save 17%). CTA "Start 7-day free trial" → subscribes; footnote reflects selected plan. Restore/Terms/Privacy.

### 11. Onboarding  (`proto-screens-c.jsx` → `Onboarding`)
4 steps (Welcome / Check in / Buffer / Momentum), each a forest medallion (pop-in spring) + Fraunces title + body + dot pager + Continue / Skip. First-run gated via `laurel-onboarded` flag; also reachable from Settings.

---

## Interactions & behavior

- **Check-in** (`doCheckIn`): updates the day's status + the class's present/late/absent counts (+held if first log); awards XP (50/20/10... see above — actually **Present 50, Late 20, Absent 5**); **Present/Late extend streak +1, Absent resets streak to 0**; XP rollover increments level (`xpMax += 100`) and may cross a rank threshold → **Level-Up / Rank-Up overlay** (gold Burst + spring pop). Light impact haptic on tap; success haptic on rank-up.
- **Quick-log** (`quickLog`): same mutation + a Toast. If an absence breaks a streak and a freeze is available → Toast offers **"Freeze"** (protect streak, decrement freeze). Otherwise Toast offers **"Undo"**.
- **Undo** (`undoLast`): restores a pre-action snapshot of `{today, classes, user}`.
- **Streak Freeze** (`useFreeze`): restores the broken streak value and decrements `user.freezes`.
- **Edit history**: changing a past record adjusts the class's counts and recomputes % / buffer / risk live.
- **Subscribe** (`subscribe`): sets `user.premium = true` (+plan). Flips the Insights teaser to a live entry and unlocks iPad Forecast.
- **Theme**: persisted to `laurel-theme` (use AsyncStorage in RN).
- **Animations**: ring fill 1100ms ease-out; meters/buffer 900ms ease-out; XP float 1100ms; rank-up spring 700ms; check-in card press 160ms spring; sheet/screen 240ms ease-out. All gated on reduced-motion.

## State management

Per-user gamification state and data live in app state (Context/Zustand/Redux — your call), persisted (AsyncStorage):
- `user`: `{ name, level, rank, xp, xpMax, streak, weekXP, totalXP, freezes, premium, plan }`
- `classes[]`: `{ id, name, code, room, prof, target, reqMode('pct'|'count'), maxAbsences, excused, days[], time, semTotal, held, present, late, absent, hue }`
- `today[]`: `{ id, classId, time, status }`
- Persist keys used in the prototype: `laurel-classes`, `laurel-today`, `laurel-user`, `laurel-theme`, `laurel-onboarded`.

**Core derivations** (port verbatim from `proto-data.jsx`):
- `rate(c) = (present+late)/held`; `pct(c) = round(rate*100)`.
- `buffer(c)`: base = count-mode ? `maxAbsences` : `floor(semTotal*(1−target/100))`; `allowed = base + excused`; `return max(0, allowed − absent)`.
- `riskOf(c)`: `buffer≤0 → danger`; `pct<target (pct-mode) → danger`; `buffer≤1 → watch`; else `safe`.

---

## Accessibility

- Contrast: ink-on-paper ≈ 12:1; forest text & white-on-forest both clear AA. **Gold is never body text on light** (only on dark fills or as large accent).
- Status is **never color-only** — always icon + label.
- **Dynamic Type**: scalable text, reflow to single column at large sizes; cap Momentum Ring numeral growth so it never clips.
- **Reduce Motion**: springs/count-ups/bursts → 160ms opacity fade.
- One `accessibilityLabel` per icon glyph (see list above).

---

## Build mapping (Laurel → NativeWind/RN)

| Laurel piece | RN implementation |
|---|---|
| Color/spacing/radii tokens | `tailwind.config.js theme.extend`; dark via NativeWind `dark:` + `useColorScheme()` |
| Elevation | preset shadow utilities; iOS `shadowColor` tinted forest; ambient glow = blurred absolute View behind hero |
| Type | `expo-font` (Fraunces + Outfit); `allowFontScaling` |
| Momentum Ring / Buffer Gauge / Sparkline / ForecastChart | `react-native-svg` (Circle/Path + dasharray); animate with Reanimated `useSharedValue` + `withTiming`/`withSpring` |
| Grain / Glass | grain = tiled noise PNG low-opacity; glass = `expo-blur` BlurView (no new native build beyond Expo SDK) |
| Icons | `react-native-svg` paths from `icons.jsx`; one `<Icon>` wrapper + `accessibilityLabel` |
| Motion + haptics | Reanimated 3 + `expo-haptics`; honor `AccessibilityInfo.isReduceMotionEnabled` |
| Persistence | AsyncStorage with the keys above |

---

## Files (design references in this bundle)

| File | Contains |
|---|---|
| `tokens.css` | **Port first.** All color (light+dark), type, spacing, radii, elevation, motion tokens; grain & glass utilities |
| `icons.jsx` | Bespoke icon family — exact SVG paths for every glyph + app-icon guidance |
| `laurel-components.jsx` | Signature components: MomentumRing, BufferGauge, StatusPill, Meter, Sparkline; RANKS |
| `proto-data.jsx` | Mock data + **all derivation helpers** (rate/pct/buffer/riskOf, analytics helpers) |
| `proto-ui.jsx` | Shell primitives: Phone frame, TabBar+FAB, Header, Card, Segmented, Stepper-less, Sheet, CountUp, Burst, StatusBar |
| `proto-screens-a.jsx` | Dashboard, Quick Check-In, TodayRow (gestures), Stat, SectionTitle |
| `proto-screens-b.jsx` | Class Detail, Trophy Case, Insights (+ Forecast teaser) |
| `proto-screens-c.jsx` | Calendar, Add/Edit Class (+Stepper), Settings, Premium (+PLANS), Onboarding |
| `proto-premium-analytics.jsx` | Forecast & Analytics (Forecast/Patterns/Records tabs), ForecastChart |
| `proto-ipad.jsx` | iPad multi-column layouts: Dashboard, Insights, Analytics (+ paywall) |
| `proto-app.jsx` | App shell: state, navigation/stack, theme, check-in & streak logic, level-up, scaling |
| `Attendance Tracker — Prototype.html` | Entry point that loads all of the above |
| `Attendance Tracker — Design System.html` + `ds-app.jsx` | The rendered design-system doc (tokens, type, color, icons, components, motion, a11y, handoff table) |

**Suggested implementation order:** tokens → Icon wrapper → signature components (Ring, Gauge, pills, meters) → shell (tab bar, cards, sheets) → Dashboard → Check-In + streak/XP logic → Class Detail → Trophy → Insights → Forecast/Analytics → Calendar/forms/Settings/Premium/Onboarding → iPad layouts.
