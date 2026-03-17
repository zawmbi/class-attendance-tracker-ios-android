import { appConfig } from "@/theme";
import { AttendanceRecord, AttendanceSettings, ClassModel } from "@/utils/types";

export const defaultSettings: AttendanceSettings = {
  reminderMinutesBefore: 15,
  missedCheckInDelayMinutes: 10,
  riskThresholds: appConfig.riskThresholdDefaults,
  lateCreditWeight: appConfig.lateCreditWeight,
  locationRemindersEnabled: false,
  incentiveSystemEnabled: true,
  motivationMessagesEnabled: true,
  dailyMotivationNotificationsEnabled: false,
  weeklyMotivationNotificationsEnabled: true,
  advancedRemindersEnabled: false,
  attendanceRulesLocked: false
};

export const seedClasses: ClassModel[] = [
  {
    id: "cls-1",
    name: "Modern Literature",
    professor: "Dr. Elaine Porter",
    location: "Humanities Hall",
    room: "204",
    schedule: [
      { day: "Monday", startTime: "09:00", endTime: "10:15" },
      { day: "Wednesday", startTime: "09:00", endTime: "10:15" }
    ],
    attendanceType: "percentage",
    requiredAttendance: 85,
    color: "#2F5D50",
    priority: "high",
    notes: "Seminar discussions count heavily toward the final grade."
  },
  {
    id: "cls-2",
    name: "Biostatistics",
    professor: "Prof. Marcus Hill",
    location: "Science Center",
    room: "118",
    schedule: [
      { day: "Tuesday", startTime: "11:00", endTime: "12:20" },
      { day: "Thursday", startTime: "11:00", endTime: "12:20" }
    ],
    attendanceType: "percentage",
    requiredAttendance: 80,
    color: "#A3B18A",
    priority: "medium",
    notes: "Late arrivals after quiz distribution are marked absent."
  },
  {
    id: "cls-3",
    name: "Design Studio",
    professor: "Avery Lin",
    location: "Arts Annex",
    room: "3B",
    schedule: [
      { day: "Friday", startTime: "13:30", endTime: "16:00" }
    ],
    attendanceType: "points",
    requiredAttendance: 75,
    color: "#D4A373",
    priority: "high",
    notes: "Project critique days are especially important."
  },
  {
    id: "cls-4",
    name: "Movement Practice",
    professor: "Coach Imani Reed",
    location: "Wellness Center",
    room: "Studio 1",
    schedule: [
      { day: "Monday", startTime: "17:30", endTime: "18:30" },
      { day: "Thursday", startTime: "17:30", endTime: "18:30" }
    ],
    attendanceType: "optional",
    requiredAttendance: 60,
    color: "#6B8F71",
    priority: "low",
    notes: "Optional class, but streaks unlock extra wellness credits."
  }
];

export const seedRecords: AttendanceRecord[] = [
  { id: "r-1", classId: "cls-1", date: "2026-02-16", status: "present", notes: "" },
  { id: "r-2", classId: "cls-1", date: "2026-02-18", status: "late", notes: "Traffic" },
  { id: "r-3", classId: "cls-1", date: "2026-02-23", status: "excused", notes: "Advising trip" },
  { id: "r-4", classId: "cls-1", date: "2026-02-25", status: "absent", notes: "Sick" },
  { id: "r-5", classId: "cls-1", date: "2026-03-02", status: "present", notes: "" },
  { id: "r-6", classId: "cls-1", date: "2026-03-04", status: "present", notes: "" },
  { id: "r-7", classId: "cls-1", date: "2026-03-09", status: "present", notes: "" },
  { id: "r-8", classId: "cls-1", date: "2026-03-11", status: "late", notes: "" },
  { id: "r-9", classId: "cls-2", date: "2026-02-17", status: "present", notes: "" },
  { id: "r-10", classId: "cls-2", date: "2026-02-19", status: "present", notes: "" },
  { id: "r-11", classId: "cls-2", date: "2026-02-24", status: "present", notes: "" },
  { id: "r-12", classId: "cls-2", date: "2026-02-26", status: "absent", notes: "Overslept" },
  { id: "r-13", classId: "cls-2", date: "2026-03-03", status: "late", notes: "" },
  { id: "r-14", classId: "cls-2", date: "2026-03-05", status: "present", notes: "" },
  { id: "r-15", classId: "cls-2", date: "2026-03-10", status: "present", notes: "" },
  { id: "r-16", classId: "cls-3", date: "2026-02-20", status: "present", notes: "" },
  { id: "r-17", classId: "cls-3", date: "2026-02-27", status: "excused", notes: "Department showcase" },
  { id: "r-18", classId: "cls-3", date: "2026-03-06", status: "late", notes: "" },
  { id: "r-19", classId: "cls-3", date: "2026-03-13", status: "present", notes: "" },
  { id: "r-20", classId: "cls-4", date: "2026-02-16", status: "present", notes: "" },
  { id: "r-21", classId: "cls-4", date: "2026-02-19", status: "excused", notes: "Team travel" },
  { id: "r-22", classId: "cls-4", date: "2026-02-23", status: "present", notes: "" },
  { id: "r-23", classId: "cls-4", date: "2026-02-26", status: "absent", notes: "" },
  { id: "r-24", classId: "cls-4", date: "2026-03-02", status: "present", notes: "" },
  { id: "r-25", classId: "cls-4", date: "2026-03-05", status: "present", notes: "" },
  { id: "r-26", classId: "cls-4", date: "2026-03-09", status: "present", notes: "" },
  { id: "r-27", classId: "cls-4", date: "2026-03-12", status: "present", notes: "" }
];
