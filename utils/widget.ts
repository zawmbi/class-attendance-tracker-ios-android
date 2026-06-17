import { deriveClass } from "@/utils/attenza";
import { getWeekdayLabel, formatTimeLabel } from "@/utils/date";
import { AttendanceRecord, AttendanceSettings, ClassModel } from "@/utils/types";

// App Group / shared-storage key the native widget extension reads from.
// (iOS: App Group "group.<bundleId>.widget"; Android: SharedPreferences.)
export const WIDGET_APP_GROUP = "group.com.attendancetrackerappsorganization.attendancetrackerapp.widget";
export const WIDGET_DATA_KEY = "attendize.widget.today";

export interface WidgetSession {
  classId: string;
  name: string;
  time: string; // formatted start time, e.g. "9:00 AM"
  color: string;
  checkedIn: boolean; // already has a record today
}

export interface WidgetData {
  dateLabel: string; // e.g. "Mon, Mar 2"
  sessions: WidgetSession[];
  totalBuffer: number; // total absences still allowed across all classes
  atRiskCount: number; // classes not in the "safe" zone
}

// Computes the snapshot a "today + buffer" widget would display. Pure, so the
// app can build it and hand it to the native side; also unit-testable.
export const buildWidgetData = (
  classes: ClassModel[],
  records: AttendanceRecord[],
  settings: AttendanceSettings,
  now: Date = new Date()
): WidgetData => {
  const todayName = getWeekdayLabel(now);
  const todayIso = now.toISOString().slice(0, 10);

  // Collect with the raw 24h start time so we can sort chronologically before
  // formatting (formatted labels like "1:00 PM" would sort wrong as strings).
  const collected: (WidgetSession & { start24: string })[] = [];
  let totalBuffer = 0;
  let atRiskCount = 0;

  for (const classItem of classes) {
    const derived = deriveClass(classItem, records, settings);
    totalBuffer += derived.buffer;
    if (derived.risk !== "safe") {
      atRiskCount += 1;
    }

    for (const entry of classItem.schedule) {
      if (entry.day !== todayName) {
        continue;
      }
      const checkedIn = records.some((r) => r.classId === classItem.id && r.date === todayIso);
      collected.push({
        classId: classItem.id,
        name: classItem.name,
        time: formatTimeLabel(entry.startTime),
        color: classItem.color,
        checkedIn,
        start24: entry.startTime
      });
    }
  }

  const sessions: WidgetSession[] = collected
    .sort((a, b) => a.start24.localeCompare(b.start24))
    .map(({ start24, ...session }) => session);

  return {
    dateLabel: now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    sessions,
    totalBuffer,
    atRiskCount
  };
};

export const serializeWidgetData = (data: WidgetData): string => JSON.stringify(data);
