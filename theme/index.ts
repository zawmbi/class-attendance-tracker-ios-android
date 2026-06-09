// ATTENZA design tokens (ported from tokens.css; OKLCH → sRGB hex).
// Legacy keys (background/primary/surface/...) are kept as aliases so existing
// screens keep working while screens migrate to the Attenza token names.
export const palette = {
  // legacy aliases
  background: "#FAF8F2",
  primary: "#2F5247",
  secondary: "#6E8C7E",
  accent: "#E0A53D",
  surface: "#FFFFFF",
  ink: "#2B3A33",
  muted: "#5C6B62",
  border: "#E6E2D8",
  warning: "#D69A3E",
  critical: "#C45B3C",
  success: "#5C8170",
  gradientStart: "#2F5247",
  gradientEnd: "#223D34",
  onGradient: "#F4EFE4",
  // surfaces
  paper: "#FAF8F2",
  paper2: "#F2EFE5",
  card: "#FFFFFF",
  card2: "#FCFBF7",
  hairline: "rgba(43,58,51,0.12)",
  // text
  ink2: "#5C6B62",
  ink3: "#828E86",
  // brand
  forest: "#2F5247",
  forestDeep: "#223D34",
  forestSoft: "#E4EDE7",
  moss: "#6E8C7E",
  gold: "#E0A53D",
  goldDeep: "#C08527",
  goldSoft: "#F6ECD6",
  // status
  present: "#5C8170",
  presentSoft: "#E3EDE7",
  late: "#D69A3E",
  lateSoft: "#F5ECD7",
  absent: "#C45B3C",
  absentSoft: "#F3E2DA",
  excused: "#7186A8",
  excusedSoft: "#E3E7EF",
  riskDanger: "#BE4A33"
} as const;

export const darkPalette = {
  // legacy aliases
  background: "#1A211D",
  primary: "#86AC9C",
  secondary: "#8FB3A2",
  accent: "#EBAE45",
  surface: "#222B26",
  ink: "#F2EFE8",
  muted: "#BCC2BB",
  border: "rgba(255,255,255,0.10)",
  warning: "#E6B055",
  critical: "#D87355",
  success: "#86AC97",
  gradientStart: "#2F5247",
  gradientEnd: "#15211C",
  onGradient: "#F1E9D9",
  // surfaces
  paper: "#1A211D",
  paper2: "#161C19",
  card: "#222B26",
  card2: "#2A332E",
  hairline: "rgba(255,255,255,0.10)",
  // text
  ink2: "#BCC2BB",
  ink3: "#909A92",
  // brand
  forest: "#86AC9C",
  forestDeep: "#5E8576",
  forestSoft: "#2B3F38",
  moss: "#8FB3A2",
  gold: "#EBAE45",
  goldDeep: "#D29A3C",
  goldSoft: "#4A3C20",
  // status
  present: "#86AC97",
  presentSoft: "#2A3B33",
  late: "#E6B055",
  lateSoft: "#4B3D22",
  absent: "#D87355",
  absentSoft: "#4A2E26",
  excused: "#8197BC",
  excusedSoft: "#2C3340",
  riskDanger: "#D4654A"
} as const;

// Radii scale (tokens.css)
export const radii = {
  chip: 9,
  btn: 14,
  field: 16,
  card: 22,
  cardLg: 28,
  sheet: 34,
  full: 9999
} as const;

export const appConfig = {
  reminderOptions: [0, 5, 10, 15, 30, 45],
  missedCheckInOptions: [0, 5, 10, 15, 20],
  priorityOptions: ["low", "medium", "high"] as const,
  attendanceTypeOptions: ["percentage", "points", "optional"] as const,
  academicTermOptions: ["semester", "trimester", "quarter", "custom"] as const,
  courseLengthOptions: [4, 6, 8, 10, 12, 14, 16] as const,
  lateCreditWeight: 0.5,
  heatmapWeeks: 8,
  analyticsWeeks: 6,
  projectionWindowSessions: 8,
  consistentUseUpgradeDays: 5,
  riskThresholdDefaults: {
    warning: 80,
    critical: 65
  },
  positiveMessages: [
    "Consistency looks beautiful on you.",
    "Steady progress is protecting your semester.",
    "Your streak is building calm momentum.",
    "Every check-in is one less thing to worry about later."
  ],
  classColorOptions: [
    "#2F5D50",
    "#6B8F71",
    "#7C8A6D",
    "#A3B18A",
    "#B7BE96",
    "#D4A373",
    "#C08457"
  ],
  earthyThemes: [
    {
      id: "fern",
      name: "Fern",
      description: "Deep greens with grounded contrast."
    },
    {
      id: "sage",
      name: "Sage",
      description: "A softer, airy classroom palette."
    },
    {
      id: "sandstone",
      name: "Sandstone",
      description: "Warm neutrals with muted gold accents."
    }
  ]
} as const;

// Attenza elevation e2 (soft, warm-tinted). Hero glows are done per-component.
export const cardStyles = {
  borderRadius: 22,
  shadowColor: "#223D34",
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: {
    width: 0,
    height: 6
  },
  elevation: 3
} as const;

export const getPalette = (mode: "light" | "dark") => (mode === "dark" ? darkPalette : palette);
