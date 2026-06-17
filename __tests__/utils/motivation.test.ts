import {
  getBehaviorInsights,
  getMotivationInsights,
  getPrioritySuggestion,
  shouldPromptForConsistentUseUpgrade
} from "@/utils/motivation";
import { makeClass, makeRecord, makeRecords, makeSettings } from "../helpers/fixtures";

const settings = makeSettings();

describe("getMotivationInsights", () => {
  it("always includes a supportive closing insight and caps at 4", () => {
    const insights = getMotivationInsights([makeClass()], makeRecords(["present", "present", "present"]), settings);
    expect(insights.length).toBeLessThanOrEqual(4);
    expect(insights.some((i) => i.tone === "support")).toBe(true);
  });

  it("surfaces a streak insight when a class is on a run", () => {
    const insights = getMotivationInsights([makeClass()], makeRecords(["present", "present", "present"]), settings);
    expect(insights.some((i) => i.tone === "streak")).toBe(true);
  });
});

describe("getBehaviorInsights", () => {
  it("identifies the most-missed day and class", () => {
    const cls = makeClass({ id: "c1", name: "Calc" });
    const records = [
      makeRecord({ classId: "c1", status: "absent", date: "2026-03-02" }), // Monday
      makeRecord({ classId: "c1", status: "absent", date: "2026-03-09" }) // Monday
    ];
    const insights = getBehaviorInsights([cls], records);
    const day = insights.find((i) => i.id === "day-pattern");
    expect(day?.value).toMatch(/Monday/);
    const cl = insights.find((i) => i.id === "class-pattern");
    expect(cl?.value).toMatch(/Calc/);
  });

  it("returns nothing actionable with no absences", () => {
    const insights = getBehaviorInsights([makeClass()], makeRecords(["present", "present"]));
    expect(insights.find((i) => i.id === "class-pattern")).toBeUndefined();
  });
});

describe("getPrioritySuggestion", () => {
  it("returns the highest-risk, highest-priority class", () => {
    const safe = makeClass({ id: "safe", name: "Safe", priority: "low" });
    const risky = makeClass({ id: "risky", name: "Risky", priority: "high" });
    const records = [
      ...makeRecords(["present", "present", "present"], { classId: "safe" }),
      ...makeRecords(["absent", "absent", "absent"], { classId: "risky" })
    ];
    const suggestion = getPrioritySuggestion([safe, risky], records, settings);
    expect(suggestion?.classId).toBe("risky");
  });

  it("returns null when there are no classes", () => {
    expect(getPrioritySuggestion([], [], settings)).toBeNull();
  });
});

describe("shouldPromptForConsistentUseUpgrade", () => {
  it("prompts once the usage-day threshold is reached", () => {
    expect(shouldPromptForConsistentUseUpgrade(4)).toBe(false);
    expect(shouldPromptForConsistentUseUpgrade(5)).toBe(true);
  });
});
