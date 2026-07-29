export type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type AttendanceStatus = "present" | "late" | "absent" | "excused";
export type AttendanceType = "percentage" | "points" | "optional";
export type RiskLevel = "safe" | "warning" | "critical";
export type PriorityLevel = "low" | "medium" | "high";
export type AcademicTermType = "semester" | "trimester" | "quarter" | "custom";
export type UpgradeTrigger =
  | "risk_alert"
  | "analytics"
  | "consistent_use"
  | "theme_customization"
  | "advanced_reminders"
  | "syllabus_import";
export type ThemePreset = "fern" | "sage" | "sandstone";
// "system" follows the OS appearance and is the default for new installs.
// Resolve it to a concrete scheme with useResolvedThemeMode() — getPalette()
// only understands light/dark.
export type ThemeMode = "system" | "light" | "dark";
export type AuthProvider = "email" | "google" | "apple";
export type DashboardWidget = "actions" | "momentum" | "trophies" | "motivation" | "today" | "more_classes";

export interface ClassSchedule {
  day: Weekday;
  startTime: string;
  endTime: string;
}

export interface ClassModel {
  id: string;
  name: string;
  linkedGroup?: string;
  sectionLabel?: string;
  professor: string;
  ta: string;
  location: string;
  room: string;
  schedule: ClassSchedule[];
  attendanceType: AttendanceType;
  termType: AcademicTermType;
  courseLengthWeeks: number;
  requiredAttendance: number;
  excusedAllowance: number;
  hoursPerWeek: number;
  /**
   * How much credit a "late" check-in earns toward attendance, 0–1.
   * 1 = counts as present, 0.5 = half credit, 0 = counts as absent.
   * When omitted, falls back to settings.lateCreditWeight (the global default).
   */
  lateCreditWeight?: number;
  /** Optional geocoordinates for location-based check-in reminders (geofence). */
  latitude?: number;
  longitude?: number;
  color: string;
  priority: PriorityLevel;
  notes: string;
}

export interface SyllabusImportDraft {
  name: string;
  linkedGroup: string;
  sectionLabel: string;
  professor: string;
  ta: string;
  location: string;
  room: string;
  schedule: ClassSchedule[];
  attendanceType: AttendanceType;
  termType: AcademicTermType;
  courseLengthWeeks: number;
  requiredAttendance: number;
  excusedAllowance: number;
  hoursPerWeek: number;
  notes: string;
  estimatedSessions: number;
  allowedAbsencesEstimate: number;
  sourceExcerpt: string;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  originalStatus?: Exclude<AttendanceStatus, "excused">;
  notes: string;
}

export interface AttendanceSettings {
  reminderMinutesBefore: number;
  missedCheckInDelayMinutes: number;
  defaultTermType: AcademicTermType;
  defaultCourseLengthWeeks: number;
  /** First day of the term (ISO yyyy-mm-dd). Bounds the calendar and projections. */
  termStartDate?: string;
  /** Last day of the term (ISO yyyy-mm-dd). */
  termEndDate?: string;
  riskThresholds: {
    warning: number;
    critical: number;
  };
  lateCreditWeight: number;
  locationRemindersEnabled: boolean;
  /** Premium: auto-log "present" when you arrive at a class's location (geofence). */
  autoCheckInEnabled?: boolean;
  incentiveSystemEnabled: boolean;
  motivationMessagesEnabled: boolean;
  dailyMotivationNotificationsEnabled: boolean;
  weeklyMotivationNotificationsEnabled: boolean;
  advancedRemindersEnabled: boolean;
  attendanceRulesLocked: boolean;
}

export interface WeeklyTrendPoint {
  label: string;
  percentage: number;
  absences: number;
  // False when the week had no eligible sessions. `percentage` is 0 in that
  // case, which is "no data" — NOT "attended nothing". Callers plotting a trend
  // or comparing weeks must skip these or a not-yet-started week reads as a
  // crash to zero.
  hasData: boolean;
}

export interface HeatmapCell {
  key: string;
  value: number;
  label: string;
}

export interface AttendanceProjection {
  label: string;
  percentage: number;
  detail: string;
}

export interface MotivationInsight {
  title: string;
  message: string;
  tone: "streak" | "recovery" | "risk" | "steady" | "support";
}

export interface BehaviorInsight {
  id: string;
  label: string;
  value: string;
}

export interface PrioritySuggestion {
  classId: string;
  className: string;
  reason: string;
}

export interface UserProfile {
  isPremium: boolean;
  preferredTheme: ThemePreset;
  themeMode: ThemeMode;
  isAuthenticated: boolean;
  authProvider: AuthProvider | null;
  userName: string;
  userEmail: string;
  dashboardWidgetOrder: DashboardWidget[];
  usageDays: number;
  consistencyDays: number;
  upgradePrompt: UpgradeTrigger | null;
  seenUpgradePrompts: UpgradeTrigger[];
}
