import {
  attendGrade,
  classForecast,
  monthlyMomentum,
  punctuality,
  timeOfDayBuckets,
  weekdayAbsences,
  weekdayRates
} from "@/utils/forecast";
import { AttenzaClass } from "@/utils/attenza";
import { makeClass, makeRecord } from "../helpers/fixtures";

describe("attendGrade", () => {
  it.each([
    [100, "A+"],
    [97, "A+"],
    [93, "A"],
    [90, "A-"],
    [87, "B+"],
    [83, "B"],
    [80, "B-"],
    [73, "C"],
    [70, "C-"],
    [60, "D"],
    [59, "F"],
    [0, "F"]
  ])("maps %i%% to %s", (pct, grade) => {
    expect(attendGrade(pct)).toBe(grade);
  });
});

describe("weekdayRates / weekdayAbsences", () => {
  it("computes Mon-Fri rates ignoring excused and weekends", () => {
    const records = [
      makeRecord({ status: "present", date: "2026-03-02" }), // Monday
      makeRecord({ status: "absent", date: "2026-03-09" }), // Monday
      makeRecord({ status: "excused", date: "2026-03-16" }), // Monday (ignored)
      makeRecord({ status: "late", date: "2026-03-03" }) // Tuesday
    ];
    const rates = weekdayRates(records);
    expect(rates[0]).toBeCloseTo(0.5); // Monday: 1 credit / 2 eligible
    expect(rates[1]).toBe(1); // Tuesday: late counts as credit
    const absences = weekdayAbsences(records);
    expect(absences[0]).toBe(1); // one Monday absence
  });
});

describe("monthlyMomentum", () => {
  it("returns chronological monthly percentages", () => {
    const records = [
      makeRecord({ status: "present", date: "2026-01-05" }),
      makeRecord({ status: "absent", date: "2026-01-12" }),
      makeRecord({ status: "present", date: "2026-02-02" })
    ];
    const momentum = monthlyMomentum(records, 4);
    expect(momentum).toEqual([
      { month: "Jan", value: 50 },
      { month: "Feb", value: 100 }
    ]);
  });
});

describe("punctuality", () => {
  it("is present / (present + late + absent)", () => {
    expect(punctuality({ present: 6, late: 2, absent: 2 } as AttenzaClass)).toBeCloseTo(0.6);
  });
  it("defaults to 1 with no sessions", () => {
    expect(punctuality({ present: 0, late: 0, absent: 0 } as AttenzaClass)).toBe(1);
  });
});

describe("classForecast", () => {
  const base = {
    classItem: makeClass(),
    held: 8,
    present: 8,
    late: 0,
    absent: 0,
    excused: 0,
    semTotal: 20,
    target: 80,
    pct: 100,
    buffer: 6,
    allowed: 6,
    remaining: 12,
    risk: "safe"
  } as AttenzaClass;

  it("projects end-of-term percentage and pass state", () => {
    const f = classForecast(base, 100);
    expect(f.projected).toBe(100);
    expect(f.willPass).toBe(true);
    expect(f.mustAttend).toBe(8); // ceil(20*0.8) - 8 = 8, capped at remaining
    expect(f.confidence).toBeLessThanOrEqual(97);
    expect(f.confidence).toBeGreaterThanOrEqual(35);
  });

  it("flags failing projections when too few sessions are attended", () => {
    const f = classForecast({ ...base, present: 2 }, 0);
    expect(f.willPass).toBe(false);
  });
});

describe("timeOfDayBuckets", () => {
  it("buckets classes by scheduled start hour and averages their pct", () => {
    const morning = {
      classItem: makeClass({ schedule: [{ day: "Monday", startTime: "09:00", endTime: "10:00" }] }),
      pct: 90
    } as AttenzaClass;
    const afternoon = {
      classItem: makeClass({ schedule: [{ day: "Monday", startTime: "15:00", endTime: "16:00" }] }),
      pct: 60
    } as AttenzaClass;
    const buckets = timeOfDayBuckets([morning, afternoon]);
    expect(buckets.find((b) => b.label === "Before 10a")?.rate).toBeCloseTo(0.9);
    expect(buckets.find((b) => b.label === "2 – 4p")?.rate).toBeCloseTo(0.6);
  });
});
