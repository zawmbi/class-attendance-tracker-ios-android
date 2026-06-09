import { ReactNode } from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";

// ATTENZA bespoke icon family — 24×24 grid, 1.75 optical stroke, round caps.
// `filled` adds the soft tab-active fill to select glyphs.
export type IconName =
  | "today" | "calendar" | "insights" | "trophy" | "checkin"
  | "present" | "late" | "absent" | "excused"
  | "flame" | "bolt" | "laurel" | "target" | "bell" | "crown" | "lock" | "sparkles"
  | "plus" | "chevron" | "chevronDown" | "back" | "close" | "gear" | "search"
  | "edit" | "trash" | "chart" | "grid" | "book" | "clock" | "arrowUp" | "arrowRight" | "inbox";

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  stroke?: number;
  filled?: boolean;
  label?: string;
}

export const Icon = ({ name, size = 24, color = "#2B3A33", stroke = 1.75, filled = false, label }: IconProps) => {
  // shared stroke props
  const P = {
    fill: "none" as const,
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };
  const soft = (opacity: number) => (filled ? { fill: color, fillOpacity: opacity } : {});

  const glyphs: Record<IconName, ReactNode> = {
    today: (
      <>
        <Path {...P} d="M3 16.5h18" />
        <Path {...P} {...soft(0.16)} d="M6.5 16.5a5.5 5.5 0 0 1 11 0" />
        <Path {...P} d="M12 3v2.2M4.6 6.6l1.5 1.5M19.4 6.6l-1.5 1.5M2.5 16.5h1M20.5 16.5h1" />
        <Path {...P} d="M8.5 20h7" />
      </>
    ),
    calendar: (
      <>
        <Rect {...P} {...soft(0.14)} x={3.5} y={5} width={17} height={15.5} rx={3.5} />
        <Path {...P} d="M3.5 9.5h17" />
        <Path {...P} d="M8 3v3.5M16 3v3.5" />
        <Circle cx={12} cy={14.5} r={1.6} fill={color} />
      </>
    ),
    insights: (
      <>
        <Path {...P} d="M4 20V4" />
        <Path {...P} d="M4 20h16" />
        <Path {...P} d="M8 16.5v-3.5M12.5 16.5V9M17 16.5V6.5" />
        <Path {...P} opacity={0.55} d="M7 9.5l4-3.5 3 2 4-4" />
      </>
    ),
    trophy: (
      <>
        <Path {...P} {...soft(0.16)} d="M7.5 4.5h9v4a4.5 4.5 0 0 1-9 0v-4Z" />
        <Path {...P} d="M7.5 5.5H5a2 2 0 0 0 0 4h.8M16.5 5.5H19a2 2 0 0 1 0 4h-.8" />
        <Path {...P} d="M12 13v3.5M9 20h6M10 16.5h4l.5 3.5h-5l.5-3.5Z" />
      </>
    ),
    checkin: (
      <>
        <Circle {...P} {...(filled ? { fill: color, fillOpacity: 1 } : {})} cx={12} cy={12} r={9} />
        <Path
          fill="none"
          stroke={filled ? "#fff" : color}
          strokeWidth={stroke + 0.25}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12.3l2.7 2.7L16 9.5"
        />
      </>
    ),
    present: (<><Circle {...P} cx={12} cy={12} r={8.5} /><Path {...P} d="M8 12.2l2.6 2.6L16 9.2" /></>),
    late: (<><Circle {...P} cx={12} cy={12} r={8.5} /><Path {...P} d="M12 7.5V12l3 2" /></>),
    absent: (<><Circle {...P} cx={12} cy={12} r={8.5} /><Path {...P} d="M8.5 12h7" /></>),
    excused: (<><Path {...P} d="M12 3.5l6.5 2.2v5.2c0 4-2.7 7-6.5 8.6-3.8-1.6-6.5-4.6-6.5-8.6V5.7L12 3.5Z" /><Path {...P} d="M9 11.8l2.2 2.2L15 9.8" /></>),
    flame: (
      <>
        <Path {...P} {...soft(0.16)} d="M12 3.5c2.5 3 4 5 4 7.5a4 4 0 0 1-8 0c0-1 .4-2 1-3 .2 1 .8 1.6 1.6 1.8C10.2 8 11 6 12 3.5Z" />
        <Path {...P} d="M12 20a5.5 5.5 0 0 0 5.5-5.5c0-3.5-2.2-6.6-5.5-10.5C8.7 7.9 6.5 11 6.5 14.5A5.5 5.5 0 0 0 12 20Z" />
      </>
    ),
    bolt: (<><Path {...P} {...soft(0.16)} d="M13 3 5.5 13.2a.6.6 0 0 0 .5 1h4.2l-.7 6.3a.4.4 0 0 0 .73.27L18 10.3a.6.6 0 0 0-.5-1h-4l1-6Z" /></>),
    laurel: (
      <>
        <Path {...P} d="M12 21V8" />
        <Path {...P} d="M12 20c-3 0-6-2-7-5 .3-2 1.4-3.6 3-4.4M12 20c3 0 6-2 7-5-.3-2-1.4-3.6-3-4.4" />
        <Path {...P} d="M9 13c-1.6.2-3-.4-3.8-1.6M15 13c1.6.2 3-.4 3.8-1.6M10.5 9.6c-1.4-.3-2.4-1.3-2.7-2.8M13.5 9.6c1.4-.3 2.4-1.3 2.7-2.8" />
        <Circle cx={12} cy={5} r={1.6} fill={color} />
      </>
    ),
    target: (<><Circle {...P} cx={12} cy={12} r={8.5} /><Circle {...P} cx={12} cy={12} r={4.8} /><Circle cx={12} cy={12} r={1.7} fill={color} /></>),
    bell: (<><Path {...P} d="M6.5 17V11a5.5 5.5 0 0 1 11 0v6M4.5 17h15M10 20a2 2 0 0 0 4 0" /></>),
    crown: (<><Path {...P} {...soft(0.16)} d="M4 8l3 3.5L12 6l5 5.5L20 8l-1.4 9.5H5.4L4 8Z" /><Path {...P} d="M5.4 17.5h13.2" /></>),
    lock: (<><Rect {...P} x={5} y={10.5} width={14} height={9.5} rx={3} /><Path {...P} d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /><Circle cx={12} cy={15} r={1.3} fill={color} /></>),
    sparkles: (
      <>
        <Path {...P} {...soft(0.16)} d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4Z" />
        <Path {...P} d="M18.5 15l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
      </>
    ),
    plus: (<Path {...P} d="M12 5v14M5 12h14" />),
    chevron: (<Path {...P} d="M9 5l7 7-7 7" />),
    chevronDown: (<Path {...P} d="M5 9l7 7 7-7" />),
    back: (<Path {...P} d="M15 5l-7 7 7 7" />),
    close: (<Path {...P} d="M6 6l12 12M18 6L6 18" />),
    gear: (<><Circle {...P} cx={12} cy={12} r={3.2} /><Path {...P} d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2 5.6 5.6" /></>),
    search: (<><Circle {...P} cx={11} cy={11} r={6.5} /><Path {...P} d="M16 16l4 4" /></>),
    edit: (<><Path {...P} d="M16.5 4.5l3 3L9 18l-4 1 1-4 10.5-10.5Z" /><Path {...P} d="M14.5 6.5l3 3" /></>),
    trash: (<><Path {...P} d="M5.5 7h13M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M7 7l.8 11.5A1.5 1.5 0 0 0 9.3 20h5.4a1.5 1.5 0 0 0 1.5-1.5L17 7" /></>),
    chart: (<><Path {...P} d="M4 20V4M4 20h16" /><Path {...P} d="M7.5 17l3.5-4 3 2.5 4.5-6.5" /></>),
    grid: (<><Rect {...P} x={4} y={4} width={7} height={7} rx={2} /><Rect {...P} x={13} y={4} width={7} height={7} rx={2} /><Rect {...P} x={4} y={13} width={7} height={7} rx={2} /><Rect {...P} x={13} y={13} width={7} height={7} rx={2} /></>),
    book: (<><Path {...P} d="M5 4.5h8a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3V4.5Z" /><Path {...P} opacity={0.5} d="M16 7.5h3v12.5h-8" /></>),
    clock: (<><Circle {...P} cx={12} cy={12} r={8.5} /><Path {...P} d="M12 7v5l3.2 1.8" /></>),
    arrowUp: (<Path {...P} d="M12 19V6M6 12l6-6 6 6" />),
    arrowRight: (<Path {...P} d="M5 12h14M13 6l6 6-6 6" />),
    inbox: (<><Path {...P} d="M4 13l2.5-7.5A2 2 0 0 1 8.4 4h7.2a2 2 0 0 1 1.9 1.5L20 13v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4Z" /><Path {...P} d="M4 13h4l1 2.5h6L16 13h4" /></>)
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel={label} accessibilityRole={label ? "image" : undefined}>
      {glyphs[name]}
    </Svg>
  );
};
