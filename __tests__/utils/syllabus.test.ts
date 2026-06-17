import { draftToClassPayload, parseSyllabusText } from "@/utils/syllabus";

describe("parseSyllabusText", () => {
  it("extracts core fields from a single syllabus block", () => {
    const text = [
      "Course: Organic Chemistry",
      "Course Code: CHEM 210",
      "Instructor: Dr. Rivera",
      "Schedule: Mon/Wed 9:30 - 10:45 AM",
      "Attendance: 80% required, 2 excused absences",
      "Location: Science Hall, Room 204",
      "16 weeks, semester"
    ].join("\n");

    const [draft] = parseSyllabusText(text);
    expect(draft.name).toBe("Organic Chemistry");
    expect(draft.linkedGroup).toBe("CHEM 210");
    expect(draft.professor).toBe("Dr. Rivera");
    expect(draft.requiredAttendance).toBe(80);
    expect(draft.excusedAllowance).toBe(2);
    expect(draft.termType).toBe("semester");
    expect(draft.courseLengthWeeks).toBe(16);
    expect(draft.room).toBe("204");
    const days = draft.schedule.map((s) => s.day);
    expect(days).toEqual(expect.arrayContaining(["Monday", "Wednesday"]));
    expect(draft.schedule[0].startTime).toBe("09:30");
  });

  it("expands compact day codes like MWF and TTH", () => {
    const mwf = parseSyllabusText("Course: Bio\nMWF 10:00-11:00 AM")[0];
    expect(mwf.schedule.map((s) => s.day)).toEqual(
      expect.arrayContaining(["Monday", "Wednesday", "Friday"])
    );
    const tth = parseSyllabusText("Course: Stats\nTTH 1:00-2:15 PM")[0];
    expect(tth.schedule.map((s) => s.day)).toEqual(expect.arrayContaining(["Tuesday", "Thursday"]));
  });

  it("detects optional attendance and defaults its required rate", () => {
    const draft = parseSyllabusText("Course: Yoga\nAttendance is optional for this class.")[0];
    expect(draft.attendanceType).toBe("optional");
    expect(draft.requiredAttendance).toBe(60);
  });

  it("splits multiple syllabi separated by a divider", () => {
    const text = "Course: Bio\nMWF 9:00-10:00 AM\n---\nCourse: Chem\nTTH 11:00-12:15 PM";
    const drafts = parseSyllabusText(text);
    expect(drafts).toHaveLength(2);
    expect(drafts.map((d) => d.name)).toEqual(["Bio", "Chem"]);
  });

  it("falls back to sensible defaults when fields are missing", () => {
    const draft = parseSyllabusText("Just some unstructured class notes here")[0];
    expect(draft.name.length).toBeGreaterThan(0);
    expect(draft.requiredAttendance).toBe(80);
    expect(draft.excusedAllowance).toBe(2);
  });
});

describe("draftToClassPayload", () => {
  it("maps a draft onto a ClassModel with the supplied id/color/priority", () => {
    const draft = parseSyllabusText("Course: Bio\nMWF 9:00-10:00 AM")[0];
    const cls = draftToClassPayload(draft, { id: "abc", color: "#123456", priority: "high" });
    expect(cls.id).toBe("abc");
    expect(cls.color).toBe("#123456");
    expect(cls.priority).toBe("high");
    expect(cls.name).toBe("Bio");
    expect(cls.schedule).toEqual(draft.schedule);
  });
});
