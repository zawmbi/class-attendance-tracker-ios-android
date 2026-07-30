import { appConfig } from "@/theme";
import { AttendanceRecord, AttendanceSettings, AttendanceStatus, ClassModel, Weekday } from "@/utils/types";

export const defaultSettings: AttendanceSettings = {
  reminderMinutesBefore: 15,
  missedCheckInDelayMinutes: 10,
  defaultTermType: "semester",
  defaultCourseLengthWeeks: 16,
  riskThresholds: appConfig.riskThresholdDefaults,
  lateCreditWeight: appConfig.lateCreditWeight,
  locationRemindersEnabled: false,
  autoCheckInEnabled: false,
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
    linkedGroup: "",
    sectionLabel: "Seminar",
    professor: "Dr. Elaine Porter",
    ta: "",
    location: "Humanities Hall",
    room: "204",
    schedule: [
      { day: "Monday", startTime: "09:00", endTime: "10:15" },
      { day: "Wednesday", startTime: "09:00", endTime: "10:15" },
      { day: "Friday", startTime: "09:00", endTime: "10:15" }
    ],
    attendanceType: "percentage",
    termType: "semester",
    courseLengthWeeks: 16,
    requiredAttendance: 85,
    excusedAllowance: 2,
    hoursPerWeek: 3,
    color: "#2F5D50",
    priority: "high",
    notes: "Seminar discussions count heavily toward the final grade."
  },
  {
    id: "cls-2",
    name: "Biostatistics",
    linkedGroup: "BIOS 210",
    sectionLabel: "Lecture",
    professor: "Prof. Marcus Hill",
    ta: "Nina Patel",
    location: "Science Center",
    room: "118",
    schedule: [
      { day: "Tuesday", startTime: "11:00", endTime: "12:20" },
      { day: "Thursday", startTime: "11:00", endTime: "12:20" }
    ],
    attendanceType: "percentage",
    termType: "semester",
    courseLengthWeeks: 16,
    requiredAttendance: 80,
    excusedAllowance: 2,
    hoursPerWeek: 3,
    color: "#A3B18A",
    priority: "medium",
    notes: "Late arrivals after quiz distribution are marked absent."
  },
  {
    id: "cls-5",
    name: "Biostatistics Lab",
    linkedGroup: "BIOS 210",
    sectionLabel: "Lab",
    professor: "Prof. Marcus Hill",
    ta: "Nina Patel",
    location: "Science Center",
    room: "Lab 6",
    schedule: [
      { day: "Wednesday", startTime: "14:00", endTime: "16:00" }
    ],
    attendanceType: "percentage",
    termType: "semester",
    courseLengthWeeks: 16,
    requiredAttendance: 80,
    excusedAllowance: 3,
    hoursPerWeek: 2,
    color: "#B7BE96",
    priority: "medium",
    notes: "Lab attendance is tracked separately from lecture."
  },
  {
    id: "cls-3",
    name: "Design Studio",
    linkedGroup: "",
    sectionLabel: "Studio",
    professor: "Avery Lin",
    ta: "",
    location: "Arts Annex",
    room: "3B",
    schedule: [
      { day: "Monday", startTime: "13:30", endTime: "16:00" },
      { day: "Thursday", startTime: "13:30", endTime: "16:00" }
    ],
    attendanceType: "points",
    termType: "quarter",
    courseLengthWeeks: 10,
    requiredAttendance: 75,
    excusedAllowance: 1,
    hoursPerWeek: 4,
    color: "#D4A373",
    priority: "high",
    notes: "Project critique days are especially important."
  },
  {
    id: "cls-4",
    name: "Movement Practice",
    linkedGroup: "",
    sectionLabel: "Practice",
    professor: "Coach Imani Reed",
    ta: "",
    location: "Wellness Center",
    room: "Studio 1",
    schedule: [
      { day: "Tuesday", startTime: "17:30", endTime: "18:30" },
      { day: "Friday", startTime: "17:30", endTime: "18:30" }
    ],
    attendanceType: "optional",
    termType: "trimester",
    courseLengthWeeks: 12,
    requiredAttendance: 60,
    excusedAllowance: 4,
    hoursPerWeek: 2,
    color: "#6B8F71",
    priority: "low",
    notes: "Optional class, but streaks unlock extra wellness credits."
  },
  {
    id: "cls-6",
    name: "Organic Chemistry",
    linkedGroup: "CHEM 240",
    sectionLabel: "Lecture",
    professor: "Dr. Sofia Almeida",
    ta: "Ravi Menon",
    location: "Science Center",
    room: "302",
    schedule: [
      { day: "Monday", startTime: "10:30", endTime: "11:45" },
      { day: "Wednesday", startTime: "10:30", endTime: "11:45" },
      { day: "Friday", startTime: "10:30", endTime: "11:45" }
    ],
    attendanceType: "percentage",
    termType: "semester",
    courseLengthWeeks: 16,
    requiredAttendance: 90,
    excusedAllowance: 2,
    hoursPerWeek: 4,
    color: "#8C6A4A",
    priority: "high",
    notes: "Attendance is part of the participation grade — two misses drops a letter."
  },
  {
    id: "cls-7",
    name: "Discrete Mathematics",
    linkedGroup: "",
    sectionLabel: "Lecture",
    professor: "Prof. Daniel Okafor",
    ta: "",
    location: "Engineering Building",
    room: "141",
    schedule: [
      { day: "Tuesday", startTime: "15:00", endTime: "16:15" },
      { day: "Thursday", startTime: "15:00", endTime: "16:15" }
    ],
    attendanceType: "percentage",
    termType: "semester",
    courseLengthWeeks: 16,
    requiredAttendance: 80,
    excusedAllowance: 3,
    hoursPerWeek: 3,
    color: "#5C7C99",
    priority: "medium",
    notes: "Problem sets are handed back in class."
  }
];

const WEEKDAY_INDEX: Record<Weekday, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
};

// Local yyyy-mm-dd key. We build dates at local noon so day-of-week and the key
// never shift across a timezone boundary (matches countScheduledSessions).
const toKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setHours(12, 0, 0, 0);
  next.setDate(next.getDate() + amount);
  return next;
};

// Per-course status pattern, expressed as fractional positions across the
// term-to-date so it scales with however many sessions have occurred. Absences
// live in the first ~70% so the most recent sessions read as an intact streak.
type DemoPattern = { late: number[]; excused: number[]; absent: number[] };

const DEMO_PATTERNS: Record<string, DemoPattern> = {
  // Showcase course: no absences → the leading run drives the hero streak.
  "cls-1": { late: [0.25, 0.6], excused: [0.45], absent: [] },
  "cls-2": { late: [0.4], excused: [0.75], absent: [0.2] },
  "cls-5": { late: [0.3], excused: [], absent: [] },
  "cls-3": { late: [0.5], excused: [0.7], absent: [0.35] },
  // Optional, low-priority course left in the "watch" zone so the Insights
  // risk/forecast card has a meaningful worst-course to highlight.
  "cls-4": { late: [0.35], excused: [0.85], absent: [0.2, 0.45, 0.7] },
  // High required-attendance course with one slip — makes the forecast's
  // "at risk" count non-zero without looking careless.
  "cls-6": { late: [0.3, 0.68], excused: [], absent: [0.5] },
  "cls-7": { late: [0.55], excused: [0.4], absent: [0.25, 0.62] }
};

// How much attendance history the demo carries. A whole number of weeks so every
// weekday gets equal coverage.
//
// 5 weeks is deliberate, not arbitrary: badge bonus XP accumulates fast and the
// rank ladder tops out at 2600 XP, so 6+ weeks pins the demo at Valedictorian
// with the progress bar full and nothing left to earn. At 5 weeks it lands on
// Dean's List with Valedictorian still ahead and ~40% of badges unlocked —
// a profile in progress rather than a finished one.
const DEMO_HISTORY_DAYS = 35;

const nearestIndex = (fraction: number, length: number) =>
  Math.min(length - 1, Math.max(0, Math.round(fraction * (length - 1))));

// Today's classes that start at/after this hour read as "upcoming" — we leave
// them unlogged so the Today screen shows a live class you can still check into.
const PENDING_AFTER_HOUR = 15;

const scheduleForWeekday = (classItem: ClassModel, weekday: number) =>
  classItem.schedule.find((entry) => WEEKDAY_INDEX[entry.day] === weekday);

/**
 * Builds a fresh, screenshot-ready demo dataset anchored to `now`: ~9 weeks of
 * attendance history up to today for a mid-term (16-week) semester, tuned for
 * high-but-believable percentages, a long streak on the showcase course, one
 * campus holiday, and a live "Today". Regenerated on each call so it never
 * goes stale.
 */
export const buildDemoData = (now: Date = new Date(), historyDays: number = DEMO_HISTORY_DAYS) => {
  const today = new Date(now);
  today.setHours(12, 0, 0, 0);
  const todayKey = toKey(today);

  const termStart = addDays(today, -historyDays);
  // Keep the term a 16-week semester regardless of how far in we are.
  const termEnd = addDays(today, 16 * 7 - historyDays);

  // One campus holiday ~3 weeks back (rolled to a Monday) to exercise the
  // canceled-day treatment on the calendar.
  const holiday = new Date(addDays(today, -21));
  while (holiday.getDay() !== WEEKDAY_INDEX.Monday) holiday.setDate(holiday.getDate() - 1);
  const canceledDates = [toKey(holiday)];
  const canceledSet = new Set(canceledDates);

  const records: AttendanceRecord[] = [];

  for (const classItem of seedClasses) {
    const meetingDays = new Set(classItem.schedule.map((entry) => WEEKDAY_INDEX[entry.day]));

    // Every scheduled, non-holiday session date from term start to today.
    const dates: string[] = [];
    const cursor = new Date(termStart);
    while (cursor <= today) {
      const key = toKey(cursor);
      if (meetingDays.has(cursor.getDay()) && !canceledSet.has(key)) {
        const entry = scheduleForWeekday(classItem, cursor.getDay());
        const pendingToday =
          key === todayKey && entry != null && Number(entry.startTime.slice(0, 2)) >= PENDING_AFTER_HOUR;
        if (!pendingToday) dates.push(key);
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    if (dates.length === 0) continue;

    const pattern = DEMO_PATTERNS[classItem.id] ?? { late: [], excused: [], absent: [] };
    const statusByIndex = new Map<number, AttendanceStatus>();
    // Overwrite order sets precedence when fractions collide: late > excused > absent.
    pattern.absent.forEach((f) => statusByIndex.set(nearestIndex(f, dates.length), "absent"));
    pattern.excused.forEach((f) => statusByIndex.set(nearestIndex(f, dates.length), "excused"));
    pattern.late.forEach((f) => statusByIndex.set(nearestIndex(f, dates.length), "late"));

    dates.forEach((date, index) => {
      records.push({
        id: `demo-${classItem.id}-${date}`,
        classId: classItem.id,
        date,
        status: statusByIndex.get(index) ?? "present",
        notes: ""
      });
    });
  }

  const settings: AttendanceSettings = {
    ...defaultSettings,
    termStartDate: toKey(termStart),
    termEndDate: toKey(termEnd)
  };

  return { classes: seedClasses, records, settings, canceledDates };
};
