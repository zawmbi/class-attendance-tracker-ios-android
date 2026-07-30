import { parseLocalDate, toDateKey } from "@/utils/date";

// Regression cover for toDateKey, which replaced `date.toISOString().slice(0, 10)`
// across the app. That returns the UTC date, so anywhere behind UTC it rolls over
// to tomorrow in the evening — check-ins were written under the wrong day and
// today's records stopped matching.
//
// jest.config.js pins TZ=UTC for deterministic bucketing, where the two
// implementations agree. So the contract is asserted structurally (local
// Y/M/D components), and the rollover case runs only when the host TZ can
// actually exhibit it.
describe("toDateKey", () => {
  it("returns the LOCAL calendar components", () => {
    for (const d of [
      new Date(2026, 6, 29, 20, 21, 0),
      new Date(2026, 0, 5, 9, 0, 0),
      new Date(2026, 11, 31, 23, 59, 0)
    ]) {
      const expected = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
      expect(toDateKey(d)).toBe(expected);
    }
  });

  it("is stable across every hour of a day", () => {
    for (let hour = 0; hour < 24; hour += 1) {
      expect(toDateKey(new Date(2026, 6, 29, hour, 30, 0))).toBe("2026-07-29");
    }
  });

  it("round-trips with parseLocalDate", () => {
    for (const key of ["2026-03-09", "2026-01-05", "2026-12-31"]) {
      expect(toDateKey(parseLocalDate(key))).toBe(key);
    }
  });

  it("does not drift to the UTC date in the evening", () => {
    // 8:21pm local. Behind UTC this instant is already tomorrow in UTC.
    const evening = new Date(2026, 6, 29, 20, 21, 0);
    expect(toDateKey(evening)).toBe("2026-07-29");
    if (evening.getTimezoneOffset() > 0) {
      // Host is behind UTC (e.g. America/Chicago) — the old implementation broke here.
      expect(evening.toISOString().slice(0, 10)).toBe("2026-07-30");
    }
  });
});
