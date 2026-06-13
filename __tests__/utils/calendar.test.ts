import { getMonthCells, getSemesterMonths, getWeekSessions } from "@/utils/calendar";
import { makeClass } from "../helpers/fixtures";

const reference = new Date("2026-03-04T12:00:00Z"); // a Wednesday

describe("getWeekSessions", () => {
  it("expands each schedule entry into a dated session, sorted chronologically", () => {
    const cls = makeClass({
      schedule: [
        { day: "Wednesday", startTime: "09:00", endTime: "10:00" },
        { day: "Monday", startTime: "09:00", endTime: "10:00" }
      ]
    });
    const sessions = getWeekSessions([cls], reference);
    expect(sessions).toHaveLength(2);
    expect(sessions[0].dayLabel).toBe("Mon"); // Monday sorts before Wednesday
    expect(sessions[1].dayLabel).toBe("Wed");
    expect(sessions[0].className).toBe(cls.name);
  });
});

describe("getMonthCells", () => {
  it("returns a fixed 35-cell grid whose in-month cells start at day 1", () => {
    const cells = getMonthCells([makeClass()], reference);
    expect(cells).toHaveLength(35); // fixed 5-week grid
    const inMonth = cells.filter((c) => c.inMonth);
    expect(inMonth[0].dayNumber).toBe(1);
    expect(inMonth.length).toBeGreaterThanOrEqual(28);
    expect(inMonth.length).toBeLessThanOrEqual(31);
    // a Monday/Wednesday class shows session dots on those weekdays
    const withSessions = cells.filter((c) => c.count > 0);
    expect(withSessions.length).toBeGreaterThan(0);
  });
});

describe("getSemesterMonths", () => {
  it("returns the requested number of months of cells", () => {
    const months = getSemesterMonths([makeClass()], reference, 3);
    expect(months).toHaveLength(3);
    expect(months[0].cells.every((cell) => cell.inMonth)).toBe(true);
  });
});
