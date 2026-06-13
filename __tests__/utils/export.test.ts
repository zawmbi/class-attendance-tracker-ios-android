import { buildAttendanceCsv, buildAttendanceReportHtml, csvFileName, pdfFileName } from "@/utils/export";
import { makeClass, makeRecord, makeSettings } from "../helpers/fixtures";

const settings = makeSettings();

describe("buildAttendanceCsv", () => {
  it("emits a header and one row per record, sorted by date", () => {
    const cls = makeClass({ id: "c1", name: "Chem", linkedGroup: "CHEM 210" });
    const records = [
      makeRecord({ classId: "c1", date: "2026-03-06", status: "absent" }),
      makeRecord({ classId: "c1", date: "2026-03-02", status: "present" })
    ];
    const csv = buildAttendanceCsv([cls], records);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("Class,Course Code,Date,Status,Notes");
    expect(lines[1]).toBe("Chem,CHEM 210,2026-03-02,Present,");
    expect(lines[2]).toBe("Chem,CHEM 210,2026-03-06,Absent,");
  });

  it("escapes commas, quotes, and newlines in fields", () => {
    const cls = makeClass({ id: "c1", name: "History, AP", linkedGroup: "" });
    const records = [makeRecord({ classId: "c1", date: "2026-03-02", notes: 'said "hi"' })];
    const csv = buildAttendanceCsv([cls], records);
    expect(csv).toContain('"History, AP"');
    expect(csv).toContain('"said ""hi"""');
  });

  it("returns just the header when there are no records", () => {
    expect(buildAttendanceCsv([makeClass()], [])).toBe("Class,Course Code,Date,Status,Notes");
  });
});

describe("buildAttendanceReportHtml", () => {
  it("includes a row and summary numbers for each class", () => {
    const cls = makeClass({ name: "Bio 101", requiredAttendance: 80 });
    const records = [
      makeRecord({ date: "2026-03-02", status: "present" }),
      makeRecord({ date: "2026-03-04", status: "absent" })
    ];
    const html = buildAttendanceReportHtml([cls], records, settings, new Date("2026-03-10T00:00:00Z"));
    expect(html).toContain("Attendize — Attendance Report");
    expect(html).toContain("Bio 101");
    expect(html).toContain("50%"); // 1 present / 2 eligible
    expect(html).toMatch(/<table/);
  });

  it("escapes HTML-sensitive characters in class names", () => {
    const cls = makeClass({ name: "Math <Honors> & Co" });
    const html = buildAttendanceReportHtml([cls], [], settings);
    expect(html).toContain("Math &lt;Honors&gt; &amp; Co");
    expect(html).not.toContain("Math <Honors>");
  });
});

describe("file names", () => {
  it("are date-stamped with the right extension", () => {
    const d = new Date("2026-03-10T00:00:00Z");
    expect(csvFileName(d)).toBe("attendize-attendance-2026-03-10.csv");
    expect(pdfFileName(d)).toBe("attendize-report-2026-03-10.pdf");
  });
});
