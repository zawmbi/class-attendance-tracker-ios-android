import type { IconName } from "@/components/Icon";
import { getAttendanceSummary } from "@/utils/attendance";
import type { GamificationProfile } from "@/utils/gamification";
import { AttendanceRecord, AttendanceSettings, ClassModel } from "@/utils/types";

// Map each achievement onto a bespoke icon-family glyph so badges render as a
// solid gold medallion with a white icon (per the Laurel design), not an emoji.
const ACHIEVEMENT_ICONS: Record<string, IconName> = {
  first_step: "sparkles",
  warming_up: "sparkles",
  on_a_roll: "flame",
  unstoppable: "bolt",
  flawless: "target",
  all_clear: "present",
  punctual: "clock",
  comeback: "arrowUp",
  bookworm: "book",
  regular: "calendar",
  full_schedule: "grid",
  deans_list: "crown"
};

export const achievementIcon = (id: string): IconName => ACHIEVEMENT_ICONS[id] ?? "trophy";

export type AttenzaRisk = "safe" | "watch" | "danger";

export interface AttenzaClass {
  classItem: ClassModel;
  held: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  semTotal: number;
  target: number;
  pct: number;
  buffer: number;
  allowed: number; // total absences allowed (gauge denominator)
  remaining: number; // sessions left this term
  risk: AttenzaRisk;
}

export const RISK_META: Record<AttenzaRisk, { label: string }> = {
  safe: { label: "On track" },
  watch: { label: "Watch" },
  danger: { label: "At risk" }
};

// Derive the Attenza count-based view of a class from the existing
// record-based store, so the redesigned screens can use the handoff's
// rate/pct/buffer/risk model without migrating data.
export const deriveClass = (
  classItem: ClassModel,
  records: AttendanceRecord[],
  settings: AttendanceSettings
): AttenzaClass => {
  const summary = getAttendanceSummary(classItem, records, settings);
  const present = summary.presentCount;
  const late = summary.lateCount;
  const absent = summary.absentCount;
  const excused = summary.excusedCount;
  const held = summary.total;

  const sessionsPerWeek = Math.max(1, classItem.schedule.length);
  const semTotal = Math.max(held, classItem.courseLengthWeeks * sessionsPerWeek);
  const target = classItem.requiredAttendance;

  const pct = held > 0 ? Math.round(((present + late) / held) * 100) : 100;

  const base = Math.floor(semTotal * (1 - target / 100));
  const allowed = base + classItem.excusedAllowance;
  const buffer = Math.max(0, allowed - absent);
  const remaining = Math.max(0, semTotal - held);

  let risk: AttenzaRisk = "safe";
  if (buffer <= 0 || pct < target) {
    risk = "danger";
  } else if (buffer <= 1) {
    risk = "watch";
  }

  return {
    classItem,
    held,
    present,
    late,
    absent,
    excused,
    semTotal,
    target,
    pct,
    buffer,
    allowed: Math.max(allowed, buffer, 1),
    remaining,
    risk
  };
};

export const riskTone = (risk: AttenzaRisk, palette: { present: string; late: string; riskDanger: string }) =>
  risk === "danger" ? palette.riskDanger : risk === "watch" ? palette.late : palette.present;

// Map the gamification profile onto Momentum Ring props (XP shown relative to
// the current rank, so the ring fills toward the next rank).
export const ringPropsFromProfile = (profile: GamificationProfile, streak: number) => ({
  level: profile.level,
  xp: profile.xpIntoRank,
  xpMax: profile.xpForNextRank > 0 ? profile.xpForNextRank : Math.max(1, profile.xp),
  rank: profile.rank.title,
  streak
});
