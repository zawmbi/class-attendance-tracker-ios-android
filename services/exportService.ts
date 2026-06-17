import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import {
  buildAttendanceCsv,
  buildAttendanceReportHtml,
  csvFileName,
  pdfFileName
} from "@/utils/export";
import { AttendanceRecord, AttendanceSettings, ClassModel } from "@/utils/types";

const ensureCanShare = async () => {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error("Sharing isn't available on this device.");
  }
};

// Writes the attendance CSV to a temp file and opens the share sheet.
export const exportAttendanceCsv = async (classes: ClassModel[], records: AttendanceRecord[]): Promise<void> => {
  if (classes.length === 0) {
    throw new Error("Add a class before exporting.");
  }
  const csv = buildAttendanceCsv(classes, records);
  const uri = `${FileSystem.cacheDirectory}${csvFileName()}`;
  await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
  await ensureCanShare();
  await Sharing.shareAsync(uri, { mimeType: "text/csv", dialogTitle: "Export attendance (CSV)", UTI: "public.comma-separated-values-text" });
};

// Renders the printable report to a PDF and opens the share sheet (Premium).
export const exportAttendancePdf = async (
  classes: ClassModel[],
  records: AttendanceRecord[],
  settings: AttendanceSettings
): Promise<void> => {
  if (classes.length === 0) {
    throw new Error("Add a class before exporting.");
  }
  const html = buildAttendanceReportHtml(classes, records, settings);
  const { uri } = await Print.printToFileAsync({ html });
  // Give the file a friendly name before sharing.
  const target = `${FileSystem.cacheDirectory}${pdfFileName()}`;
  try {
    await FileSystem.moveAsync({ from: uri, to: target });
  } catch {
    // If the move fails, fall back to the original print URI.
  }
  await ensureCanShare();
  await Sharing.shareAsync(target, { mimeType: "application/pdf", dialogTitle: "Export attendance report", UTI: "com.adobe.pdf" });
};
