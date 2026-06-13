import {
  addDays,
  getNextSession,
  getRelativeDayBuckets,
  isClassToday,
  parseTimeInput,
  startOfWeek
} from "@/utils/date";

describe("parseTimeInput", () => {
  it("parses 12-hour times with meridiem", () => {
    expect(parseTimeInput("9:30 AM")).toBe("09:30");
    expect(parseTimeInput("9 am")).toBe("09:00");
    expect(parseTimeInput("1:05 PM")).toBe("13:05");
  });
  it("handles 12 AM and 12 PM edge cases", () => {
    expect(parseTimeInput("12:00 AM")).toBe("00:00");
    expect(parseTimeInput("12:00 PM")).toBe("12:00");
  });
  it("parses 24-hour times", () => {
    expect(parseTimeInput("23:45")).toBe("23:45");
    expect(parseTimeInput("07:05")).toBe("07:05");
  });
  it("rejects invalid input", () => {
    expect(parseTimeInput("")).toBeNull();
    expect(parseTimeInput("25:00")).toBeNull();
    expect(parseTimeInput("13:99")).toBeNull();
    expect(parseTimeInput("noon")).toBeNull();
  });
});

describe("isClassToday", () => {
  it("matches the current weekday", () => {
    const monday = new Date("2026-03-02T12:00:00Z"); // Monday
    expect(isClassToday([{ day: "Monday", startTime: "09:00", endTime: "10:00" }], monday)).toBe(true);
    expect(isClassToday([{ day: "Tuesday", startTime: "09:00", endTime: "10:00" }], monday)).toBe(false);
  });
});

describe("getNextSession", () => {
  it("returns the soonest upcoming scheduled session", () => {
    const monday = new Date("2026-03-02T08:00:00Z");
    const next = getNextSession(
      [
        { day: "Wednesday", startTime: "09:00", endTime: "10:00" },
        { day: "Monday", startTime: "09:00", endTime: "10:00" }
      ],
      monday
    );
    expect(next.entry.day).toBe("Monday"); // later today beats Wednesday
  });

  it("rolls a passed session to next week", () => {
    const mondayLate = new Date("2026-03-02T23:00:00Z");
    const next = getNextSession([{ day: "Monday", startTime: "09:00", endTime: "10:00" }], mondayLate);
    expect(next.startsAt.getTime()).toBeGreaterThan(mondayLate.getTime());
  });
});

describe("startOfWeek / addDays / getRelativeDayBuckets", () => {
  it("startOfWeek returns the Monday of the week", () => {
    const wed = new Date("2026-03-04T12:00:00Z");
    expect(startOfWeek(wed).getDay()).toBe(1); // Monday
  });
  it("addDays shifts by the given number of days", () => {
    const d = addDays(new Date("2026-03-02T00:00:00Z"), 5);
    expect(d.toISOString().slice(0, 10)).toBe("2026-03-07");
  });
  it("getRelativeDayBuckets returns one date per requested week", () => {
    expect(getRelativeDayBuckets(6)).toHaveLength(6);
  });
});
