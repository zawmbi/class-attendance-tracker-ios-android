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
    description: "Hit a 10-class streak in a single class.",
    glyph: "⚡",
    tier: "gold",
    xp: 140,
    target: 10,
    value: (stats) => Math.max(stats.bestStreak, stats.longestEverStreak)
  },
  {
    id: "flawless",
    title: "Flawless",
    description: "Keep a class at 100% over 3+ sessions.",
    glyph: "💎",
    tier: "gold",
    xp: 120,
    target: 1,
    value: (stats) => stats.perfectClasses
  },
  {
    id: "all_clear",
    title: "All Clear",
    description: "Have every class sitting in the safe zone.",
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
    description: "Track 5 or more classes at once.",
    glyph: "🏫",
    tier: "bronze",
    xp: 40,
    target: 5,
    value: (stats) => stats.classCount
  },
  {
    id: "deans_list",
    title: "Dean's List",
    description: "Earn 1,720 XP and climb the ranks.",
    glyph: "🎓",
    tier: "gold",
    xp: 200,
    target: 1720,
    value: (_, xp) => xp
  }
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
