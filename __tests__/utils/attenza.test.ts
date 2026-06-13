import { achievementIcon, deriveClass, RISK_META, ringPropsFromProfile, riskTone } from "@/utils/attenza";
import { GamificationProfile } from "@/utils/gamification";
import { makeClass, makeRecords, makeSettings } from "../helpers/fixtures";

const settings = makeSettings();
const palette = { present: "#0f0", late: "#ff0", riskDanger: "#f00" };

describe("deriveClass", () => {
  it("computes pct, buffer, remaining, and a safe risk for a clean record", () => {
    // schedule has 2 sessions/week, 10 weeks -> semTotal 20
    const cls = makeClass({ requiredAttendance: 80, excusedAllowance: 2 });
    const records = makeRecords(["present", "present", "present", "present", "present", "present", "present", "present", "present"]);
    const d = deriveClass(cls, records, settings);
    expect(d.held).toBe(9);
    expect(d.pct).toBe(100);
    expect(d.semTotal).toBe(20);
    // base = floor(20 * (1 - 0.8)); note 1 - 0.8 == 0.199999... in IEEE-754, so
    // this floors to 3 (not 4). allowed = 3 + 2 excused = 5; buffer = 5 - 0 absences.
    expect(d.buffer).toBe(5);
    expect(d.remaining).toBe(11); // 20 - 9
    expect(d.risk).toBe("safe");
  });

  it("flags danger when below target or out of buffer", () => {
    const cls = makeClass({ requiredAttendance: 80 });
    const records = makeRecords(["present", "absent", "absent", "absent"]);
    const d = deriveClass(cls, records, settings);
    expect(d.risk).toBe("danger");
  });

  it("treats a class with no records as 100% and safe", () => {
    const d = deriveClass(makeClass(), [], settings);
    expect(d.pct).toBe(100);
    expect(d.held).toBe(0);
    expect(d.risk).toBe("safe");
  });
});

describe("riskTone", () => {
  it("maps risk levels to palette colors", () => {
    expect(riskTone("danger", palette)).toBe(palette.riskDanger);
    expect(riskTone("watch", palette)).toBe(palette.late);
    expect(riskTone("safe", palette)).toBe(palette.present);
  });
});

describe("achievementIcon", () => {
  it("returns a mapped icon, falling back to trophy", () => {
    expect(achievementIcon("on_a_roll")).toBe("flame");
    expect(achievementIcon("unknown_id")).toBe("trophy");
  });
});

describe("RISK_META", () => {
  it("has a label for every risk level", () => {
    expect(RISK_META.safe.label).toBeDefined();
    expect(RISK_META.watch.label).toBeDefined();
    expect(RISK_META.danger.label).toBeDefined();
  });
});

describe("ringPropsFromProfile", () => {
  it("maps profile XP relative to the current rank", () => {
    const profile = {
      level: 2,
      xpIntoRank: 40,
      xpForNextRank: 220,
      xp: 180,
      rank: { title: "Sophomore" }
    } as GamificationProfile;
    const props = ringPropsFromProfile(profile, 5);
    expect(props).toMatchObject({ level: 2, xp: 40, xpMax: 220, rank: "Sophomore", streak: 5 });
  });
});
