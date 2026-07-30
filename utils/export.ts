import { getAttendanceSummary, getClassRecords } from "@/utils/attendance";
import { formatLongDate, toDateKey } from "@/utils/date";
import { AttendanceRecord, AttendanceSettings, ClassModel } from "@/utils/types";

const STATUS_LABEL: Record<AttendanceRecord["status"], string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  excused: "Excused"
};

// RFC-4180 style escaping: wrap in quotes and double any embedded quotes when the
// value contains a comma, quote, or newline.
const csvCell = (value: string | number): string => {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

const csvRow = (cells: (string | number)[]): string => cells.map(csvCell).join(",");

// Flat CSV of every attendance record, grouped by class then sorted by date.
export const buildAttendanceCsv = (classes: ClassModel[], records: AttendanceRecord[]): string => {
  const header = ["Class", "Course Code", "Date", "Status", "Notes"];
  const rows: string[] = [csvRow(header)];

  for (const classItem of classes) {
    const classRecords = getClassRecords(records, classItem.id)
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date));
    for (const record of classRecords) {
      rows.push(
        csvRow([
          classItem.name,
          classItem.linkedGroup ?? "",
          record.date,
          STATUS_LABEL[record.status],
          record.notes ?? ""
        ])
      );
    }
  }

  return rows.join("\n");
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Self-contained printable HTML attendance report (Premium). No external assets
// so expo-print can render it offline.
export const buildAttendanceReportHtml = (
  classes: ClassModel[],
  records: AttendanceRecord[],
  settings: AttendanceSettings,
  generatedAt: Date = new Date()
): string => {
  const rows = classes
    .map((classItem) => {
      const s = getAttendanceSummary(classItem, records, settings);
      const riskColor = s.risk === "critical" ? "#B23B3B" : s.risk === "warning" ? "#C08527" : "#2F5247";
      return `<tr>
        <td><strong>${escapeHtml(classItem.name)}</strong>${
        classItem.linkedGroup ? `<br/><span class="sub">${escapeHtml(classItem.linkedGroup)}</span>` : ""
      }</td>
        <td style="color:${riskColor}"><strong>${s.percentage}%</strong></td>
        <td>${classItem.requiredAttendance}%</td>
        <td>${s.presentCount}</td>
        <td>${s.lateCount}</td>
        <td>${s.absentCount}</td>
        <td>${s.excusedCount}</td>
        <td>${s.remainingAbsences}</td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
    <style>
      body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #2B3A33; padding: 24px; }
      h1 { font-size: 22px; margin: 0 0 2px; }
      .meta { color: #828E86; font-size: 12px; margin-bottom: 18px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid #E4EDE7; }
      th { color: #5C6B62; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
      .sub { color: #828E86; font-size: 10px; }
    </style></head>
    <body>
      <h1>Attendize — Attendance Report</h1>
      <div class="meta">Generated ${escapeHtml(formatLongDate(toDateKey(generatedAt)))} · ${
    classes.length
  } classes</div>
      <table>
        <thead><tr>
          <th>Class</th><th>Current</th><th>Required</th><th>Present</th><th>Late</th>
          <th>Absent</th><th>Excused</th><th>Buffer</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </body></html>`;
};

export const csvFileName = (date: Date = new Date()) => `attendize-attendance-${toDateKey(date)}.csv`;
export const pdfFileName = (date: Date = new Date()) => `attendize-report-${toDateKey(date)}.pdf`;
