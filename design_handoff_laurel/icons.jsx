// ============================================================
// LAUREL icon family — bespoke, flat-buildable for react-native-svg
// Grid: 24×24 · stroke: 1.75 (optical) · round caps/joins · 2px radii
// <Icon name="today" size={24} stroke={1.75} color="currentColor" />
// Filled variant (tab active) via `fill` for select glyphs.
// ============================================================

function Icon({ name, size = 24, stroke = 1.75, color = 'currentColor', fill = 'none', style = {}, title }) {
  const P = { fill: 'none', stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const glyphs = {
    // ---- TAB BAR ----
    today: (
      <>
        <path {...P} d="M3 16.5h18" />
        <path {...P} d="M6.5 16.5a5.5 5.5 0 0 1 11 0" fill={fill === 'none' ? 'none' : color} fillOpacity={fill === 'none' ? 0 : 0.16} />
        <path {...P} d="M12 3v2.2M4.6 6.6l1.5 1.5M19.4 6.6l-1.5 1.5M2.5 16.5h1M20.5 16.5h1" />
        <path {...P} d="M8.5 20h7" />
      </>
    ),
    calendar: (
      <>
        <rect {...P} x="3.5" y="5" width="17" height="15.5" rx="3.5" fill={fill === 'none' ? 'none' : color} fillOpacity={fill === 'none' ? 0 : 0.14} />
        <path {...P} d="M3.5 9.5h17" />
        <path {...P} d="M8 3v3.5M16 3v3.5" />
        <circle cx="12" cy="14.5" r="1.6" fill={color} stroke="none" />
      </>
    ),
    insights: (
      <>
        <path {...P} d="M4 20V4" />
        <path {...P} d="M4 20h16" />
        <path {...P} d="M8 16.5v-3.5M12.5 16.5V9M17 16.5V6.5" />
        <path {...P} d="M7 9.5l4-3.5 3 2 4-4" opacity="0.55" />
      </>
    ),
    trophy: (
      <>
        <path {...P} d="M7.5 4.5h9v4a4.5 4.5 0 0 1-9 0v-4Z" fill={fill === 'none' ? 'none' : color} fillOpacity={fill === 'none' ? 0 : 0.16} />
        <path {...P} d="M7.5 5.5H5a2 2 0 0 0 0 4h.8M16.5 5.5H19a2 2 0 0 1 0 4h-.8" />
        <path {...P} d="M12 13v3.5M9 20h6M10 16.5h4l.5 3.5h-5l.5-3.5Z" />
      </>
    ),
    checkin: (
      <>
        <circle {...P} cx="12" cy="12" r="9" fill={fill === 'none' ? 'none' : color} fillOpacity={fill === 'none' ? 0 : 1} />
        <path fill="none" stroke={fill === 'none' ? color : '#fff'} strokeWidth={stroke + 0.25} strokeLinecap="round" strokeLinejoin="round" d="M8 12.3l2.7 2.7L16 9.5" />
      </>
    ),
    // ---- STATUS ----
    present: (<><circle {...P} cx="12" cy="12" r="8.5" /><path {...P} d="M8 12.2l2.6 2.6L16 9.2" /></>),
    late: (<><circle {...P} cx="12" cy="12" r="8.5" /><path {...P} d="M12 7.5V12l3 2" /></>),
    absent: (<><circle {...P} cx="12" cy="12" r="8.5" /><path {...P} d="M8.5 12h7" /></>),
    excused: (<><path {...P} d="M12 3.5l6.5 2.2v5.2c0 4-2.7 7-6.5 8.6-3.8-1.6-6.5-4.6-6.5-8.6V5.7L12 3.5Z" /><path {...P} d="M9 11.8l2.2 2.2L15 9.8" /></>),
    // ---- GAMIFICATION ----
    flame: (<><path {...P} d="M12 3.5c2.5 3 4 5 4 7.5a4 4 0 0 1-8 0c0-1 .4-2 1-3 .2 1 .8 1.6 1.6 1.8C10.2 8 11 6 12 3.5Z" fill={fill === 'none' ? 'none' : color} fillOpacity={fill === 'none' ? 0 : 0.16} /><path {...P} d="M12 20a5.5 5.5 0 0 0 5.5-5.5c0-3.5-2.2-6.6-5.5-10.5C8.7 7.9 6.5 11 6.5 14.5A5.5 5.5 0 0 0 12 20Z" /></>),
    bolt: (<><path {...P} d="M13 3 5.5 13.2a.6.6 0 0 0 .5 1h4.2l-.7 6.3a.4.4 0 0 0 .73.27L18 10.3a.6.6 0 0 0-.5-1h-4l1-6Z" fill={fill === 'none' ? 'none' : color} fillOpacity={fill === 'none' ? 0 : 0.16} /></>),
    laurel: (<><path {...P} d="M12 21V8" /><path {...P} d="M12 20c-3 0-6-2-7-5 .3-2 1.4-3.6 3-4.4M12 20c3 0 6-2 7-5-.3-2-1.4-3.6-3-4.4" /><path {...P} d="M9 13c-1.6.2-3-.4-3.8-1.6M15 13c1.6.2 3-.4 3.8-1.6M10.5 9.6c-1.4-.3-2.4-1.3-2.7-2.8M13.5 9.6c1.4-.3 2.4-1.3 2.7-2.8" /><circle cx="12" cy="5" r="1.6" {...P} fill={color} stroke="none" /></>),
    target: (<><circle {...P} cx="12" cy="12" r="8.5" /><circle {...P} cx="12" cy="12" r="4.8" /><circle cx="12" cy="12" r="1.7" fill={color} stroke="none" /></>),
    bell: (<><path {...P} d="M6.5 17V11a5.5 5.5 0 0 1 11 0v6M4.5 17h15M10 20a2 2 0 0 0 4 0" /></>),
    crown: (<><path {...P} d="M4 8l3 3.5L12 6l5 5.5L20 8l-1.4 9.5H5.4L4 8Z" fill={fill === 'none' ? 'none' : color} fillOpacity={fill === 'none' ? 0 : 0.16} /><path {...P} d="M5.4 17.5h13.2" /></>),
    lock: (<><rect {...P} x="5" y="10.5" width="14" height="9.5" rx="3" /><path {...P} d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /><circle cx="12" cy="15" r="1.3" fill={color} stroke="none" /></>),
    sparkles: (<><path {...P} d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4Z" fill={fill === 'none' ? 'none' : color} fillOpacity={fill === 'none' ? 0 : 0.16} /><path {...P} d="M18.5 15l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" /></>),
    // ---- UTILITY ----
    plus: (<path {...P} d="M12 5v14M5 12h14" />),
    chevron: (<path {...P} d="M9 5l7 7-7 7" />),
    chevronDown: (<path {...P} d="M5 9l7 7 7-7" />),
    back: (<path {...P} d="M15 5l-7 7 7 7" />),
    close: (<path {...P} d="M6 6l12 12M18 6L6 18" />),
    gear: (<><circle {...P} cx="12" cy="12" r="3.2" /><path {...P} d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2 5.6 5.6" /></>),
    search: (<><circle {...P} cx="11" cy="11" r="6.5" /><path {...P} d="M16 16l4 4" /></>),
    edit: (<><path {...P} d="M16.5 4.5l3 3L9 18l-4 1 1-4 10.5-10.5Z" /><path {...P} d="M14.5 6.5l3 3" /></>),
    trash: (<><path {...P} d="M5.5 7h13M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M7 7l.8 11.5A1.5 1.5 0 0 0 9.3 20h5.4a1.5 1.5 0 0 0 1.5-1.5L17 7" /></>),
    chart: (<><path {...P} d="M4 20V4M4 20h16" /><path {...P} d="M7.5 17l3.5-4 3 2.5 4.5-6.5" /></>),
    grid: (<><rect {...P} x="4" y="4" width="7" height="7" rx="2" /><rect {...P} x="13" y="4" width="7" height="7" rx="2" /><rect {...P} x="4" y="13" width="7" height="7" rx="2" /><rect {...P} x="13" y="13" width="7" height="7" rx="2" /></>),
    book: (<><path {...P} d="M5 4.5h8a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3V4.5Z" /><path {...P} d="M16 7.5h3v12.5h-8" opacity="0.5" /></>),
    clock: (<><circle {...P} cx="12" cy="12" r="8.5" /><path {...P} d="M12 7v5l3.2 1.8" /></>),
    arrowUp: (<path {...P} d="M12 19V6M6 12l6-6 6 6" />),
    arrowRight: (<path {...P} d="M5 12h14M13 6l6 6-6 6" />),
    inbox: (<><path {...P} d="M4 13l2.5-7.5A2 2 0 0 1 8.4 4h7.2a2 2 0 0 1 1.9 1.5L20 13v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4Z" /><path {...P} d="M4 13h4l1 2.5h6L16 13h4" /></>),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', ...style }} role={title ? 'img' : 'presentation'} aria-label={title} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      {glyphs[name] || null}
    </svg>
  );
}

window.Icon = Icon;
window.ICON_NAMES = ['today','calendar','insights','trophy','checkin','present','late','absent','excused','flame','bolt','laurel','target','bell','crown','lock','sparkles','plus','chevron','chevronDown','back','close','gear','search','edit','trash','chart','grid','book','clock','arrowUp','arrowRight','inbox'];
