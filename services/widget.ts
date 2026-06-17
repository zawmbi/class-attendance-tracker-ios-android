import { Platform } from "react-native";
import { ExtensionStorage } from "@bacons/apple-targets";

import { formatTimeLabel } from "@/utils/date";
import { AttendanceRecord, ClassModel, Weekday } from "@/utils/types";

// Must match the App Group + key used by the iOS widget (targets/widget/index.swift).
const APP_GROUP = "group.com.attendancetrackerappsorganization.attendancetrackerapp";
const STORAGE_KEY = "todayClasses";

const WEEKDAY_BY_INDEX: Weekday[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

// Only iOS has the widget; constructing the storage is a no-op elsewhere.
const storage = Platform.OS === "ios" ? new ExtensionStorage(APP_GROUP) : null;

/**
 * Mirrors today's schedule (with logged status) into the App Group so the iOS
 * home-screen widget can render it, then asks WidgetKit to reload. Safe to call
 * on every classes/records change; no-op off iOS.
 */
export const syncTodayWidget = (classes: ClassModel[], records: AttendanceRecord[]) => {
  if (!storage) return;

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const weekday = WEEKDAY_BY_INDEX[now.getDay()];

  const rows: { sort: string; name: string; time: string; status: string | null }[] = [];
  for (const classItem of classes) {
    const entry = classItem.schedule.find((s) => s.day === weekday);
    if (!entry) continue;
    const record = records.find((r) => r.classId === classItem.id && r.date === today);
    rows.push({
      sort: entry.startTime,
      name: classItem.name,
      time: formatTimeLabel(entry.startTime),
      status: record?.status ?? null
    });
  }
  rows.sort((a, b) => a.sort.localeCompare(b.sort));

  const payload = {
    dateLabel: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(now),
    classes: rows.map(({ sort, ...rest }) => rest)
  };

  try {
    storage.set(STORAGE_KEY, JSON.stringify(payload));
    ExtensionStorage.reloadWidget();
  } catch {
    // Widget not installed / native module unavailable — ignore.
  }
};
