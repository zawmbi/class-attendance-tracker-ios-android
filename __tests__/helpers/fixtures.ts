import { defaultSettings } from "@/utils/mockData";
import { AttendanceRecord, AttendanceSettings, ClassModel, ClassSchedule } from "@/utils/types";

// A fresh copy of the app's default settings for each test (avoids shared mutation).
export const makeSettings = (overrides: Partial<AttendanceSettings> = {}): AttendanceSettings => ({
  ...defaultSettings,
  ...overrides,
  riskThresholds: { ...defaultSettings.riskThresholds, ...(overrides.riskThresholds ?? {}) }
});

const defaultSchedule: ClassSchedule[] = [
  { day: "Monday", startTime: "09:00", endTime: "10:00" },
  { day: "Wednesday", startTime: "09:00", endTime: "10:00" }
];

export const makeClass = (overrides: Partial<ClassModel> = {}): ClassModel => ({
  id: "class-1",
  name: "Organic Chemistry",
  linkedGroup: "CHEM 210",
  sectionLabel: "Lecture",
  professor: "Dr. Rivera",
  ta: "Jamie Chen",
  location: "Science Hall",
  room: "204",
  schedule: defaultSchedule,
  attendanceType: "percentage",
  termType: "semester",
  courseLengthWeeks: 10,
  requiredAttendance: 80,
  excusedAllowance: 2,
  hoursPerWeek: 3,
  color: "#2F5D50",
  priority: "medium",
  notes: "",
  ...overrides
});

let recordSeq = 0;
export const makeRecord = (overrides: Partial<AttendanceRecord> = {}): AttendanceRecord => ({
  id: `record-${(recordSeq += 1)}`,
  classId: "class-1",
  date: "2026-03-02",
  status: "present",
  notes: "",
  ...overrides
});

// Build N records on consecutive days from a start date with the given statuses.
export const makeRecords = (
  statuses: AttendanceRecord["status"][],
  opts: { classId?: string; startDate?: string } = {}
): AttendanceRecord[] => {
  const start = new Date(`${opts.startDate ?? "2026-03-02"}T00:00:00Z`);
  return statuses.map((status, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return makeRecord({
      classId: opts.classId ?? "class-1",
      date: date.toISOString().slice(0, 10),
      status
    });
  });
};
