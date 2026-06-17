import {
  AttendanceRecord,
  AttendanceSettings,
  ClassModel
} from "@/utils/types";
import { getAttendanceSummary, getClassRecords } from "@/utils/attendance";

// XP earned for logging each kind of session. Showing up is rewarded most,
// being honest about a miss (excused) still earns a little credit.
export const XP_PER_STATUS = {
  present: 12,
  late: 7,
  excused: 4,
  absent: 0
} as const;

export interface AcademicRank {
  index: number;
  title: string;
  minXp: number;
  blurb: string;
}

// Academic progression ladder. Titles students recognise, thresholds tuned so
// a typical semester of steady check-ins climbs a few ranks.
export const RANKS: AcademicRank[] = [
  { index: 0, title: "Freshman", minXp: 0, blurb: "Just getting your bearings." },
  { index: 1, title: "Sophomore", minXp: 140, blurb: "Finding your rhythm." },
  { index: 2, title: "Junior", minXp: 360, blurb: "Steady and dependable." },
  { index: 3, title: "Senior", minXp: 680, blurb: "A seasoned regular." },
  { index: 4, title: "Honor Roll", minXp: 1120, blurb: "Consistency that shows." },
  { index: 5, title: "Dean's List", minXp: 1720, blurb: "Top of the attendance class." },
  { index: 6, title: "Valedictorian", minXp: 2600, blurb: "Nothing keeps you away." }
];

export interface GamificationStats {
  classCount: number;
  totalRecords: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  bestStreak: number;
  longestEverStreak: number;
  perfectClasses: number;
  safeClasses: number;
  checkInDays: number;
  onTimeRate: number;
  hasComeback: boolean;
  baseXp: number;
}

export type AchievementTier = "bronze" | "silver" | "gold";

interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  glyph: string;
  tier: AchievementTier;
  xp: number;
  target: number;
  value: (stats: GamificationStats, xp: number) => number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  glyph: string;
  tier: AchievementTier;
  xp: number;
  unlocked: boolean;
  progress: number;
  progressLabel: string;
}

export interface GamificationProfile {
  xp: number;
  rank: AcademicRank;
  nextRank: AcademicRank | null;
  level: number;
  xpIntoRank: number;
  xpForNextRank: number;
  progressToNext: number;
  stats: GamificationStats;
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
  bonusXp: number;
}

const isCredit = (status: AttendanceRecord["status"]) => status === "present" || status === "late";

// Longest unbroken run of present/late in a class history (excused sessions are
// neutral and do not break the chain).
const longestRun = (records: AttendanceRecord[]) => {
  const ordered = records
    .slice()
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

  let best = 0;
  let current = 0;
  for (const record of ordered) {
    if (record.status === "excused") {
      continue;
    }
    if (isCredit(record.status)) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
};

// Did the student recover after a miss? An absent followed later by a 3+ run.
const detectComeback = (records: AttendanceRecord[]) => {
  const ordered = records
    .slice()
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

  let sawAbsence = false;
  let runAfter = 0;
  for (const record of ordered) {
    if (record.status === "absent") {
      sawAbsence = true;
      runAfter = 0;
    } else if (sawAbsence && isCredit(record.status)) {
      runAfter += 1;
      if (runAfter >= 3) {
        return true;
      }
    } else if (record.status !== "excused") {
      runAfter = 0;
    }
  }
  return false;
};

export const getGamificationStats = (
  classes: ClassModel[],
  records: AttendanceRecord[],
  settings: AttendanceSettings
): GamificationStats => {
  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;
  let excusedCount = 0;

  for (const record of records) {
    if (record.status === "present") presentCount += 1;
    else if (record.status === "late") lateCount += 1;
    else if (record.status === "absent") absentCount += 1;
    else if (record.status === "excused") excusedCount += 1;
  }

  let bestStreak = 0;
  let longestEverStreak = 0;
  let perfectClasses = 0;
  let safeClasses = 0;
  let hasComeback = false;
  let streakBonus = 0;

  for (const classItem of classes) {
    const summary = getAttendanceSummary(classItem, records, settings);
    bestStreak = Math.max(bestStreak, summary.streak);
    if (summary.risk === "safe") safeClasses += 1;
    if (summary.percentage >= 100 && summary.eligibleCount >= 3) perfectClasses += 1;

    const classRecords = getClassRecords(records, classItem.id);
    longestEverStreak = Math.max(longestEverStreak, longestRun(classRecords));
    if (!hasComeback && detectComeback(classRecords)) hasComeback = true;

    // Reward live streaks so momentum feels valuable.
    if (summary.streak >= 10) streakBonus += 120;
    else if (summary.streak >= 5) streakBonus += 45;
    else if (summary.streak >= 3) streakBonus += 15;
  }

  const checkInDays = new Set(records.map((record) => record.date)).size;
  const eligible = presentCount + lateCount + absentCount;
  const onTimeRate = eligible > 0 ? presentCount / eligible : 0;

  const recordXp = records.reduce((sum, record) => sum + XP_PER_STATUS[record.status], 0);

  return {
    classCount: classes.length,
    totalRecords: records.length,
    presentCount,
    lateCount,
    absentCount,
    excusedCount,
    bestStreak,
    longestEverStreak,
    perfectClasses,
    safeClasses,
    checkInDays,
    onTimeRate,
    hasComeback,
    baseXp: recordXp + streakBonus
  };
};

const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "first_step",
    title: "First Step",
    description: "Log your very first check-in.",
    glyph: "🌱",
    tier: "bronze",
    xp: 20,
    target: 1,
    value: (stats) => stats.totalRecords
  },
  {
    id: "warming_up",
    title: "Warming Up",
    description: "Build a 3-class attendance streak.",
    glyph: "✨",
    tier: "bronze",
    xp: 30,
    target: 3,
    value: (stats) => stats.bestStreak
  },
  {
    id: "on_a_roll",
    title: "On a Roll",
    description: "Reach a 5-class attendance streak.",
    glyph: "🔥",
    tier: "silver",
    xp: 60,
    target: 5,
    value: (stats) => Math.max(stats.bestStreak, stats.longestEverStreak)
  },
  {
    id: "unstoppable",
    title: "Unstoppable",
    description: "Hit a 10-class streak in a single course.",
    glyph: "⚡",
    tier: "gold",
    xp: 140,
    target: 10,
    value: (stats) => Math.max(stats.bestStreak, stats.longestEverStreak)
  },
  {
    id: "flawless",
    title: "Flawless",
    description: "Keep a course at 100% over 3+ sessions.",
    glyph: "💎",
    tier: "gold",
    xp: 120,
    target: 1,
    value: (stats) => stats.perfectClasses
  },
  {
    id: "all_clear",
    title: "All Clear",
    description: "Have every course sitting in the safe zone.",
    glyph: "🛡️",
    tier: "silver",
    xp: 80,
    target: 1,
    value: (stats) => (stats.classCount > 0 && stats.safeClasses === stats.classCount ? 1 : 0)
  },
  {
    id: "punctual",
    title: "Punctual",
    description: "Stay on time for 90% of 10+ sessions.",
    glyph: "⏰",
    tier: "silver",
    xp: 70,
    target: 1,
    value: (stats) =>
      stats.presentCount + stats.lateCount + stats.absentCount >= 10 && stats.onTimeRate >= 0.9 ? 1 : 0
  },
  {
    id: "comeback",
    title: "Comeback Kid",
    description: "Bounce back with a 3-class run after a miss.",
    glyph: "🪃",
    tier: "silver",
    xp: 75,
    target: 1,
    value: (stats) => (stats.hasComeback ? 1 : 0)
  },
  {
    id: "bookworm",
    title: "Bookworm",
    description: "Record 25 total check-ins.",
    glyph: "📚",
    tier: "silver",
    xp: 90,
    target: 25,
    value: (stats) => stats.totalRecords
  },
  {
    id: "regular",
    title: "Regular",
    description: "Check in across 14 different days.",
    glyph: "🦉",
    tier: "silver",
    xp: 85,
    target: 14,
    value: (stats) => stats.checkInDays
  },
  {
    id: "full_schedule",
    title: "Full Schedule",
    description: "Track 5 or more courses at once.",
    glyph: "🏫",
    tier: "bronze",
    xp: 40,
    target: 5,
    value: (stats) => stats.classCount
  },
  {
    id: "deans_list",
    title: "Luminary",
    description: "Earn 1,720 XP and climb the ranks.",
    glyph: "🎓",
    tier: "gold",
    xp: 200,
    target: 1720,
    value: (_, xp) => xp
  },

  // ----- Momentum: longer streaks reward sustained success -----
  { id: "iron_will", title: "Iron Will", description: "Reach a 15-class attendance streak.", glyph: "🏔️", tier: "gold", xp: 170, target: 15, value: (s) => Math.max(s.bestStreak, s.longestEverStreak) },
  { id: "relentless", title: "Relentless", description: "Reach a 20-class attendance streak.", glyph: "🌟", tier: "gold", xp: 220, target: 20, value: (s) => Math.max(s.bestStreak, s.longestEverStreak) },
  { id: "juggernaut", title: "Juggernaut", description: "Reach a 30-class attendance streak.", glyph: "🚀", tier: "gold", xp: 300, target: 30, value: (s) => Math.max(s.bestStreak, s.longestEverStreak) },
  { id: "unbroken", title: "Unbroken", description: "Reach a 50-class attendance streak.", glyph: "♾️", tier: "gold", xp: 420, target: 50, value: (s) => Math.max(s.bestStreak, s.longestEverStreak) },

  // ----- Dedication: total check-ins -----
  { id: "half_century", title: "Half Century", description: "Log 50 total check-ins.", glyph: "🪙", tier: "silver", xp: 110, target: 50, value: (s) => s.totalRecords },
  { id: "centurion", title: "Centurion", description: "Log 100 total check-ins.", glyph: "💯", tier: "gold", xp: 200, target: 100, value: (s) => s.totalRecords },
  { id: "double_century", title: "Double Century", description: "Log 200 total check-ins.", glyph: "🏛️", tier: "gold", xp: 320, target: 200, value: (s) => s.totalRecords },
  { id: "year_long", title: "Year-Long", description: "Log 365 total check-ins.", glyph: "🎆", tier: "gold", xp: 500, target: 365, value: (s) => s.totalRecords },

  // ----- Showing up: present sessions -----
  { id: "reliably_there", title: "Reliably There", description: "Be present for 25 sessions.", glyph: "✅", tier: "silver", xp: 90, target: 25, value: (s) => s.presentCount },
  { id: "ever_present", title: "Ever-Present", description: "Be present for 75 sessions.", glyph: "🟢", tier: "gold", xp: 180, target: 75, value: (s) => s.presentCount },
  { id: "pillar", title: "Pillar", description: "Be present for 150 sessions.", glyph: "🗿", tier: "gold", xp: 300, target: 150, value: (s) => s.presentCount },

  // ----- Habit: distinct check-in days -----
  { id: "consistency_king", title: "Consistency King", description: "Check in across 21 different days.", glyph: "🦅", tier: "silver", xp: 110, target: 21, value: (s) => s.checkInDays },
  { id: "month_strong", title: "Month Strong", description: "Check in across 30 different days.", glyph: "📆", tier: "silver", xp: 140, target: 30, value: (s) => s.checkInDays },
  { id: "semester_habit", title: "Semester Habit", description: "Check in across 60 different days.", glyph: "🔁", tier: "gold", xp: 240, target: 60, value: (s) => s.checkInDays },
  { id: "hundred_days", title: "Hundred Days", description: "Check in across 100 different days.", glyph: "💪", tier: "gold", xp: 360, target: 100, value: (s) => s.checkInDays },

  // ----- Mastery: perfect classes -----
  { id: "double_diamond", title: "Double Diamond", description: "Keep 2 courses at 100% over 3+ sessions.", glyph: "💠", tier: "gold", xp: 200, target: 2, value: (s) => s.perfectClasses },
  { id: "triple_crown", title: "Triple Crown", description: "Keep 3 courses perfect at once.", glyph: "👑", tier: "gold", xp: 280, target: 3, value: (s) => s.perfectClasses },
  { id: "perfect_slate", title: "Perfect Slate", description: "Keep 5 courses perfect at once.", glyph: "🧊", tier: "gold", xp: 380, target: 5, value: (s) => s.perfectClasses },

  // ----- Punctuality -----
  { id: "clockwork", title: "Clockwork", description: "Stay on time for 95% of 25+ sessions.", glyph: "⏱️", tier: "gold", xp: 170, target: 1, value: (s) => (s.presentCount + s.lateCount + s.absentCount >= 25 && s.onTimeRate >= 0.95 ? 1 : 0) },
  { id: "dawn_patrol", title: "Dawn Patrol", description: "Stay on time for 90% of 40+ sessions.", glyph: "🌅", tier: "gold", xp: 200, target: 1, value: (s) => (s.presentCount + s.lateCount + s.absentCount >= 40 && s.onTimeRate >= 0.9 ? 1 : 0) },

  // ----- Course load -----
  { id: "triple_threat", title: "Triple Threat", description: "Track 3 courses at once.", glyph: "🎒", tier: "bronze", xp: 30, target: 3, value: (s) => s.classCount },
  { id: "full_load", title: "Full Load", description: "Track 8 courses at once.", glyph: "📦", tier: "silver", xp: 90, target: 8, value: (s) => s.classCount },
  { id: "mountain_mover", title: "Mountain Mover", description: "Track 10 courses at once.", glyph: "🧗", tier: "gold", xp: 160, target: 10, value: (s) => s.classCount },

  // ----- Whole-term standing -----
  { id: "green_board", title: "Green Across the Board", description: "Hold 4+ courses all in the safe zone.", glyph: "🟩", tier: "gold", xp: 180, target: 1, value: (s) => (s.classCount >= 4 && s.safeClasses === s.classCount ? 1 : 0) },
  { id: "spotless_record", title: "Spotless Record", description: "Reach 50 check-ins with zero absences.", glyph: "🚫", tier: "gold", xp: 260, target: 1, value: (s) => (s.totalRecords >= 50 && s.absentCount === 0 ? 1 : 0) },
  { id: "resilient", title: "Resilient", description: "Recover from a miss and build a 5-class streak.", glyph: "🛟", tier: "silver", xp: 120, target: 1, value: (s) => (s.hasComeback && Math.max(s.bestStreak, s.longestEverStreak) >= 5 ? 1 : 0) },

  // ----- Rank / XP milestones -----
  { id: "rising_star", title: "Rising Star", description: "Earn 500 XP.", glyph: "⭐", tier: "silver", xp: 120, target: 500, value: (_, xp) => xp },
  { id: "scholar", title: "Scholar", description: "Earn 1,000 XP.", glyph: "📖", tier: "gold", xp: 180, target: 1000, value: (_, xp) => xp },
  { id: "honor_roll_badge", title: "Trailblazer", description: "Earn 1,120 XP.", glyph: "🏅", tier: "gold", xp: 220, target: 1120, value: (_, xp) => xp },
  { id: "valedictorian", title: "Legend", description: "Earn 2,600 XP and reach the summit.", glyph: "🎖️", tier: "gold", xp: 320, target: 2600, value: (_, xp) => xp }
];

export const getRankForXp = (xp: number): AcademicRank => {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.minXp) {
      current = rank;
    }
  }
  return current;
};

export const getGamificationProfile = (
  classes: ClassModel[],
  records: AttendanceRecord[],
  settings: AttendanceSettings
): GamificationProfile => {
  const stats = getGamificationStats(classes, records, settings);

  // First pass on base XP determines which XP-gated achievements unlock,
  // then their bonus XP is folded into the final total.
  const bonusXp = ACHIEVEMENTS.reduce(
    (sum, def) => (def.value(stats, stats.baseXp) >= def.target ? sum + def.xp : sum),
    0
  );
  const xp = stats.baseXp + bonusXp;

  const achievements: Achievement[] = ACHIEVEMENTS.map((def) => {
    const value = def.value(stats, xp);
    const unlocked = value >= def.target;
    const progress = def.target > 0 ? Math.min(1, value / def.target) : unlocked ? 1 : 0;
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      glyph: def.glyph,
      tier: def.tier,
      xp: def.xp,
      unlocked,
      progress,
      progressLabel: `${Math.min(value, def.target)} / ${def.target}`
    };
  });

  const rank = getRankForXp(xp);
  const nextRank = RANKS[rank.index + 1] ?? null;
  const xpIntoRank = xp - rank.minXp;
  const xpForNextRank = nextRank ? nextRank.minXp - rank.minXp : 0;
  const progressToNext = nextRank ? Math.min(1, xpIntoRank / xpForNextRank) : 1;

  return {
    xp,
    rank,
    nextRank,
    level: rank.index + 1,
    xpIntoRank,
    xpForNextRank,
    progressToNext,
    stats,
    achievements,
    unlockedCount: achievements.filter((item) => item.unlocked).length,
    totalCount: achievements.length,
    bonusXp
  };
};

export const tierColor = (tier: AchievementTier) => {
  switch (tier) {
    case "gold":
      return "#C9A24B";
    case "silver":
      return "#9AA7A0";
    case "bronze":
    default:
      return "#B07A4E";
  }
};
