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
export type UpgradeTrigger = "risk_alert" | "analytics" | "consistent_use" | "theme_customization" | "advanced_reminders";
export type ThemePreset = "fern" | "sage" | "sandstone";
export type ThemeMode = "light" | "dark";
export type AuthProvider = "email" | "google" | "facebook" | "apple";
export type DashboardWidget = "actions" | "momentum" | "motivation" | "today" | "more_classes";

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
  color: string;
  priority: PriorityLevel;
  notes: string;
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
  riskThresholds: {
    warning: number;
    critical: number;
  };
  lateCreditWeight: number;
  locationRemindersEnabled: boolean;
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
