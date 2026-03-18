export const palette = {
  background: "#F5F1E8",
  primary: "#2F5D50",
  secondary: "#A3B18A",
  accent: "#D4A373",
  surface: "#FCF8F1",
  ink: "#1F352E",
  muted: "#6B7C72",
  border: "#E3DBCD",
  warning: "#C98B42",
  critical: "#B65B4A",
  success: "#4C7A5D"
} as const;

export const darkPalette = {
  background: "#1A221F",
  primary: "#E3D2B5",
  secondary: "#7E927F",
  accent: "#C88F60",
  surface: "#24302B",
  ink: "#F6EFE3",
  muted: "#AAB6AC",
  border: "#34413C",
  warning: "#D3A262",
  critical: "#C87868",
  success: "#91AF86"
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

export const cardStyles = {
  borderRadius: 24,
  shadowColor: palette.primary,
  shadowOpacity: 0.1,
  shadowRadius: 18,
  shadowOffset: {
    width: 0,
    height: 10
  },
  elevation: 4
} as const;

export const getPalette = (mode: "light" | "dark") => (mode === "dark" ? darkPalette : palette);
