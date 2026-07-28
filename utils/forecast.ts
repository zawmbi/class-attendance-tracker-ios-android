import { getClassRecords } from "@/utils/attendance";
import { AttenzaClass } from "@/utils/attenza";
import { parseLocalDate } from "@/utils/date";
import { AttendanceRecord } from "@/utils/types";

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
// Full names (same Mon–Fri ordering) for prose like "Wednesdays" — appending
// "days" to the short label mangles Tue/Wed/Thu ("Weddays").
export const WEEKDAY_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Letter grade from an attendance percentage.
export const attendGrade = (pct: number) => {
  if (pct >= 97) return "A+";
  if (pct >= 93) return "A";
  if (pct >= 90) return "A-";
  if (pct >= 87) return "B+";
  if (pct >= 83) return "B";
  if (pct >= 80) return "B-";
  if (pct >= 77) return "C+";
  if (pct >= 73) return "C";
  if (pct >= 70) return "C-";
  if (pct >= 60) return "D";
  return "F";
};

const weekdayIndex = (iso: string) => {
  const d = parseLocalDate(iso).getDay(); // 0=Sun..6=Sat
  return d === 0 || d === 6 ? -1 : d - 1; // Mon=0..Fri=4
};

// Attendance rate per weekday (Mon–Fri): (present+late)/eligible.
export const weekdayRates = (records: AttendanceRecord[]) => {
  const credit = [0, 0, 0, 0, 0];
  const total = [0, 0, 0, 0, 0];
  records.forEach((r) => {
    const i = weekdayIndex(r.date);
    if (i < 0 || r.status === "excused") return;
    total[i] += 1;
    if (r.status === "present" || r.status === "late") credit[i] += 1;
  });
  return total.map((t, i) => (t > 0 ? credit[i] / t : 0));
};

// Absence count per weekday (Mon–Fri).
export const weekdayAbsences = (records: AttendanceRecord[]) => {
  const out = [0, 0, 0, 0, 0];
  records.forEach((r) => {
    const i = weekdayIndex(r.date);
    if (i >= 0 && r.status === "absent") out[i] += 1;
  });
  return out;
};

// Attendance rate bucketed by the class's scheduled start hour.
export const timeOfDayBuckets = (classes: AttenzaClass[]) => {
  const defs: { label: string; lo: number; hi: number }[] = [
    { label: "Before 10a", lo: 0, hi: 10 },
    { label: "10a – 12p", lo: 10, hi: 12 },
    { label: "12 – 2p", lo: 12, hi: 14 },
    { label: "2 – 4p", lo: 14, hi: 16 },
    { label: "After 4p", lo: 16, hi: 24 }
  ];
  return defs
    .map((b) => {
      const inBucket = classes.filter((c) => {
        const hour = parseInt(c.classItem.schedule[0]?.startTime?.split(":")[0] ?? "9", 10);
        return hour >= b.lo && hour < b.hi;
      });
      const rate = inBucket.length ? inBucket.reduce((s, c) => s + c.pct, 0) / inBucket.length / 100 : null;
      return { label: b.label, rate, count: inBucket.length };
    })
    .filter((b) => b.rate !== null) as { label: string; rate: number; count: number }[];
};

// Overall attendance % per recent month (chronological).
export const monthlyMomentum = (records: AttendanceRecord[], months = 4) => {
  const byMonth = new Map<string, { credit: number; total: number; label: string }>();
  records.forEach((r) => {
    if (r.status === "excused") return;
    const d = parseLocalDate(r.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = d.toLocaleString("en-US", { month: "short" });
    const entry = byMonth.get(key) ?? { credit: 0, total: 0, label };
    entry.total += 1;
    if (r.status === "present" || r.status === "late") entry.credit += 1;
    byMonth.set(key, entry);
  });
  return Array.from(byMonth.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-months)
    .map(([, v]) => ({ month: v.label, value: v.total ? Math.round((v.credit / v.total) * 100) : 0 }));
};

// On-time share for a class: present / (present + late + absent).
export const punctuality = (c: AttenzaClass) => {
  const denom = c.present + c.late + c.absent;
  return denom > 0 ? c.present / denom : 1;
};

// Project end-of-term % if the student attends `attendPct` of remaining sessions.
export interface ClassForecast {
  c: AttenzaClass;
  projected: number;
  willPass: boolean;
  mustAttend: number | null;
  confidence: number;
}

export const classForecast = (c: AttenzaClass, attendPct: number): ClassForecast => {
  const projected =
    c.semTotal > 0 ? Math.round(((c.present + c.late + (c.remaining * attendPct) / 100) / c.semTotal) * 100) : c.pct;
  const willPass = projected >= c.target;
  const mustAttend = Math.max(0, Math.ceil((c.semTotal * c.target) / 100 - (c.present + c.late)));
  // Confidence: how comfortably the projection clears the target, tempered by buffer.
  const margin = projected - c.target;
  const confidence = Math.round(Math.max(35, Math.min(97, 70 + margin * 1.5 + c.buffer * 4)));
  return { c, projected, willPass, mustAttend: Math.min(c.remaining, mustAttend), confidence };
};

export { getClassRecords };
