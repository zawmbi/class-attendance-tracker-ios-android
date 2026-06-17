import { buildWidgetData, serializeWidgetData } from "@/utils/widget";
import { makeClass, makeRecord, makeSettings } from "../helpers/fixtures";

const settings = makeSettings();
const monday = new Date("2026-03-02T08:00:00Z"); // Monday

describe("buildWidgetData", () => {
  it("lists only today's sessions, sorted by start time, with check-in state", () => {
    const cls = makeClass({
      id: "c1",
      name: "Chem",
      schedule: [
        { day: "Monday", startTime: "13:00", endTime: "14:00" },
        { day: "Monday", startTime: "09:00", endTime: "10:00" },
        { day: "Friday", startTime: "09:00", endTime: "10:00" }
      ]
    });
    const records = [makeRecord({ classId: "c1", date: "2026-03-02", status: "present" })];
    const data = buildWidgetData([cls], records, settings, monday);

    expect(data.sessions).toHaveLength(2); // Friday excluded
    expect(data.sessions[0].time).toBe("9:00 AM"); // earlier first
    expect(data.sessions[1].time).toBe("1:00 PM");
    expect(data.sessions[0].checkedIn).toBe(true);
    expect(data.dateLabel).toBe("Mon, Mar 2");
  });

  it("aggregates total buffer and at-risk count across classes", () => {
    const safe = makeClass({ id: "safe", schedule: [{ day: "Monday", startTime: "09:00", endTime: "10:00" }] });
    const risky = makeClass({ id: "risky", requiredAttendance: 90 });
    const records = [
      makeRecord({ classId: "risky", date: "2026-02-02", status: "absent" }),
      makeRecord({ classId: "risky", date: "2026-02-04", status: "absent" })
    ];
    const data = buildWidgetData([safe, risky], records, settings, monday);
    expect(data.totalBuffer).toBeGreaterThanOrEqual(0);
    expect(data.atRiskCount).toBeGreaterThanOrEqual(1); // risky class is below target
  });

  it("returns no sessions on a day with nothing scheduled", () => {
    const cls = makeClass({ schedule: [{ day: "Sunday", startTime: "09:00", endTime: "10:00" }] });
    expect(buildWidgetData([cls], [], settings, monday).sessions).toHaveLength(0);
  });

  it("serializes to JSON the native side can read", () => {
    const data = buildWidgetData([makeClass()], [], settings, monday);
    expect(() => JSON.parse(serializeWidgetData(data))).not.toThrow();
  });
});
