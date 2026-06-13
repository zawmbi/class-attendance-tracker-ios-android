import {
  getGamificationProfile,
  getGamificationStats,
  getRankForXp,
  RANKS,
  XP_PER_STATUS
} from "@/utils/gamification";
import { makeClass, makeRecords, makeSettings } from "../helpers/fixtures";

const settings = makeSettings();

describe("getRankForXp", () => {
  it("returns the highest rank whose threshold is met", () => {
    expect(getRankForXp(0).title).toBe("Freshman");
    expect(getRankForXp(139).title).toBe("Freshman");
    expect(getRankForXp(140).title).toBe("Sophomore");
    expect(getRankForXp(2600).title).toBe("Valedictorian");
    expect(getRankForXp(999999).title).toBe(RANKS[RANKS.length - 1].title);
  });
});

describe("getGamificationStats", () => {
  it("tallies status counts, check-in days, and on-time rate", () => {
    const cls = makeClass();
    const records = makeRecords(["present", "present", "late", "absent"]);
    const stats = getGamificationStats([cls], records, settings);
    expect(stats.presentCount).toBe(2);
    expect(stats.lateCount).toBe(1);
    expect(stats.absentCount).toBe(1);
    expect(stats.checkInDays).toBe(4);
    expect(stats.onTimeRate).toBeCloseTo(2 / 4); // present / (present+late+absent)
    expect(stats.classCount).toBe(1);
  });

  it("detects a comeback (3-class run after an absence)", () => {
    const cls = makeClass();
    const records = makeRecords(["absent", "present", "present", "present"]);
    const stats = getGamificationStats([cls], records, settings);
    expect(stats.hasComeback).toBe(true);
    expect(stats.longestEverStreak).toBe(3);
  });

  it("includes base XP from records plus streak bonuses", () => {
    const cls = makeClass();
    const records = makeRecords(["present", "present", "present"]); // streak 3 -> +15 bonus
    const stats = getGamificationStats([cls], records, settings);
    const recordXp = 3 * XP_PER_STATUS.present;
    expect(stats.baseXp).toBe(recordXp + 15);
  });
});

describe("getGamificationProfile", () => {
  it("unlocks first-step + warming-up and folds bonus XP into the rank", () => {
    const cls = makeClass();
    const records = makeRecords(["present", "present", "present"]);
    const profile = getGamificationProfile([cls], records, settings);

    const unlockedIds = profile.achievements.filter((a) => a.unlocked).map((a) => a.id);
    // 3 clean check-ins clears: first_step, warming_up (streak 3), flawless
    // (100% over 3+ sessions) and all_clear (every class safe).
    expect(unlockedIds).toEqual(expect.arrayContaining(["first_step", "warming_up", "flawless", "all_clear"]));
    expect(unlockedIds).not.toContain("unstoppable");

    // baseXp 51 + bonus (20 + 30 + 120 + 80) = 301 -> Sophomore (level 2)
    expect(profile.xp).toBe(301);
    expect(profile.rank.title).toBe("Sophomore");
    expect(profile.level).toBe(2);
    expect(profile.unlockedCount).toBe(unlockedIds.length);
    expect(profile.totalCount).toBe(profile.achievements.length);
  });

  it("reports progress toward the next rank between 0 and 1", () => {
    const profile = getGamificationProfile([makeClass()], makeRecords(["present"]), settings);
    expect(profile.progressToNext).toBeGreaterThanOrEqual(0);
    expect(profile.progressToNext).toBeLessThanOrEqual(1);
  });
});
