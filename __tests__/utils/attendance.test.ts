import {
  calculateAttendancePercentage,
  getAllowedAbsencesRemaining,
  getAttendanceSummary,
  getHeatmapData,
  getIncentiveMessage,
  getMissedPatternSummary,
  getProjectionSummary,
  getRiskLevel
} from "@/utils/attendance";
import { makeClass, makeRecord, makeRecords, makeSettings } from "../helpers/fixtures";

const settings = makeSettings();

describe("calculateAttendancePercentage", () => {
  it("weights present as 1 and late as 0.5", () => {
    const cls = makeClass();
    const records = [
      makeRecord({ status: "present", date: "2026-03-02" }),
      makeRecord({ status: "present", date: "2026-03-04" }),
      makeRecord({ status: "late", date: "2026-03-06" }),
      makeRecord({ status: "late", date: "2026-03-09" })
    ];
    // (1 + 1 + 0.5 + 0.5) / 4 = 75%
    expect(calculateAttendancePercentage(cls, records, settings)).toBe(75);
  });

  it("excludes excused records from the denominator", () => {
    const cls = makeClass();
    const records = [
      makeRecord({ status: "present", date: "2026-03-02" }),
      makeRecord({ status: "excused", date: "2026-03-04" }),
      makeRecord({ status: "absent", date: "2026-03-06" })
    ];
    // excused dropped -> 1 / 2 = 50%
    expect(calculateAttendancePercentage(cls, records, settings)).toBe(50);
  });

  it("returns 100 for an optional class with no eligible records", () => {
    const cls = makeClass({ attendanceType: "optional" });
    expect(calculateAttendancePercentage(cls, [], settings)).toBe(100);
  });

  it("returns 100 when there are no records", () => {
    expect(calculateAttendancePercentage(makeClass(), [], settings)).toBe(100);
  });
});

describe("getAllowedAbsencesRemaining", () => {
  it("computes how many future absences keep you at/above the requirement", () => {
    const cls = makeClass({ requiredAttendance: 80 });
    const records = makeRecords(["present", "present", "present", "present", "present", "present", "present", "present"]);
    // 8 credits over 8 eligible -> can add absences while 8/(8+n) >= 80%
    // 8/10 = 80% (ok), 8/11 = 72.7% (fails) -> 2 buffer absences
    expect(getAllowedAbsencesRemaining(cls, records, settings)).toBe(2);
  });

  it("returns 0 when already below the requirement", () => {
    const cls = makeClass({ requiredAttendance: 90 });
    const records = makeRecords(["present", "absent", "absent"]);
    expect(getAllowedAbsencesRemaining(cls, records, settings)).toBe(0);
  });
});

describe("getRiskLevel", () => {
  const cls = makeClass();
  it("flags critical at/below the critical threshold", () => {
    expect(getRiskLevel(65, settings, cls)).toBe("critical");
    expect(getRiskLevel(50, settings, cls)).toBe("critical");
  });
  it("flags warning between critical and warning thresholds", () => {
    expect(getRiskLevel(75, settings, cls)).toBe("warning");
    expect(getRiskLevel(80, settings, cls)).toBe("warning");
  });
  it("is safe above the warning threshold", () => {
    expect(getRiskLevel(95, settings, cls)).toBe("safe");
  });
  it("treats optional classes leniently", () => {
    const optional = makeClass({ attendanceType: "optional" });
    expect(getRiskLevel(70, settings, optional)).toBe("safe");
    expect(getRiskLevel(60, settings, optional)).toBe("warning");
  });
});

describe("getAttendanceSummary", () => {
  it("tallies counts, streak, and remaining excused", () => {
    const cls = makeClass({ excusedAllowance: 2 });
    const records = [
      makeRecord({ status: "present", date: "2026-03-02" }),
      makeRecord({ status: "late", date: "2026-03-04" }),
      makeRecord({ status: "absent", date: "2026-03-06" }),
      makeRecord({ status: "excused", date: "2026-03-09" })
    ];
    const summary = getAttendanceSummary(cls, records, settings);
    expect(summary.presentCount).toBe(1);
    expect(summary.lateCount).toBe(1);
    expect(summary.absentCount).toBe(1);
    expect(summary.excusedCount).toBe(1);
    expect(summary.total).toBe(4);
    expect(summary.eligibleCount).toBe(3); // excused excluded
    expect(summary.remainingExcused).toBe(1); // 2 allowed - 1 used
    expect(summary.projections).toHaveLength(3);
  });

  it("counts a clean run of attendance as the streak", () => {
    const cls = makeClass();
    const records = makeRecords(["present", "present", "late"]);
    expect(getAttendanceSummary(cls, records, settings).streak).toBe(3);
  });
});

describe("getProjectionSummary", () => {
  it("labels the three projection scenarios", () => {
    const projections = getProjectionSummary(makeClass(), makeRecords(["present", "present"]), settings);
    expect(projections.map((p) => p.label)).toEqual([
      "If you miss next class",
      "If you attend upcoming classes",
      "Absence buffer"
    ]);
  });
});

describe("getMissedPatternSummary", () => {
  it("ranks classes by number of absences", () => {
    const a = makeClass({ id: "a", name: "A" });
    const b = makeClass({ id: "b", name: "B" });
    const records = [
      makeRecord({ classId: "a", status: "absent", date: "2026-03-02" }),
      makeRecord({ classId: "b", status: "absent", date: "2026-03-02" }),
      makeRecord({ classId: "b", status: "absent", date: "2026-03-04" })
    ];
    const ranked = getMissedPatternSummary([a, b], records);
    expect(ranked[0].classId).toBe("b");
    expect(ranked[0].missed).toBe(2);
    expect(ranked[1].missed).toBe(1);
  });
});

describe("getHeatmapData", () => {
  it("returns an 8-week grid (56 cells) and scores statuses by weight", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-04T12:00:00Z"));
    const cells = getHeatmapData([makeRecord({ status: "present", date: "2026-03-02" })]);
    expect(cells).toHaveLength(56); // default heatmapWeeks (8) * 7
    const monday = cells.find((c) => c.key === "2026-03-02");
    expect(monday?.value).toBe(3); // present = 3
    jest.useRealTimers();
  });
});

describe("getIncentiveMessage", () => {
  it("returns a reset message for non-positive streaks", () => {
    expect(getIncentiveMessage(0)).toMatch(/reset/i);
  });
  it("returns a rotating positive message otherwise", () => {
    expect(typeof getIncentiveMessage(3)).toBe("string");
    expect(getIncentiveMessage(3).length).toBeGreaterThan(0);
  });
});
