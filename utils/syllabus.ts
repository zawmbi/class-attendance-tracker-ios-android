import { parseTimeInput } from "@/utils/date";
import {
  AcademicTermType,
  AttendanceType,
  ClassModel,
  ClassSchedule,
  SyllabusImportDraft,
  Weekday
} from "@/utils/types";

const weekdayMap: Array<{ pattern: RegExp; day: Weekday }> = [
  { pattern: /\bmonday\b|\bmon\b/i, day: "Monday" },
  { pattern: /\btuesday\b|\btue\b|\btues\b/i, day: "Tuesday" },
  { pattern: /\bwednesday\b|\bwed\b/i, day: "Wednesday" },
  { pattern: /\bthursday\b|\bthu\b|\bthur\b|\bthurs\b/i, day: "Thursday" },
  { pattern: /\bfriday\b|\bfri\b/i, day: "Friday" },
  { pattern: /\bsaturday\b|\bsat\b/i, day: "Saturday" },
  { pattern: /\bsunday\b|\bsun\b/i, day: "Sunday" }
];

const compactDayPatterns: Array<{ pattern: RegExp; days: Weekday[] }> = [
  { pattern: /\bMWF\b/, days: ["Monday", "Wednesday", "Friday"] },
  { pattern: /\bTTH\b|\bTR\b|\bTU\/TH\b|\bT\/TH\b/, days: ["Tuesday", "Thursday"] },
  { pattern: /\bMW\b/, days: ["Monday", "Wednesday"] },
  { pattern: /\bWF\b/, days: ["Wednesday", "Friday"] }
];

const splitBlocks = (input: string) => {
  const normalized = input.replace(/\r/g, "").trim();
  if (!normalized) {
    return [];
  }

  const hardSplit = normalized
    .split(/\n(?:---+|===+)\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

  if (hardSplit.length > 1) {
    return hardSplit;
  }

  const lines = normalized.split("\n");
  const starts = lines.reduce<number[]>((indexes, line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return indexes;
    }

    const looksLikeHeader = /^(course|course title|class|class title|subject)\s*:/i.test(trimmed);
    const looksLikeSyllabusTitle = /^syllabus\b/i.test(trimmed);

    if ((looksLikeHeader || looksLikeSyllabusTitle) && index !== 0) {
      indexes.push(index);
    }

    return indexes;
  }, [0]);

  const blocks = starts
    .map((start, index) => lines.slice(start, starts[index + 1] ?? lines.length).join("\n").trim())
    .filter(Boolean);

  return blocks.length > 0 ? blocks : [normalized];
};

const extractField = (input: string, labels: string[]) => {
  for (const label of labels) {
    const match = input.match(new RegExp(`(?:^|\\n)\\s*${label}\\s*:?\\s*(.+)`, "im"));
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return "";
};

const normalizeCourseName = (input: string) => {
  const direct =
    extractField(input, ["course title", "class title", "course", "class", "subject"]) ||
    input.match(/^syllabus\s*(?:for)?\s*(.+)$/im)?.[1]?.trim() ||
    input.split("\n").map((line) => line.trim()).find((line) => line.length > 4);

  if (!direct) {
    return "New Class";
  }

  return direct.replace(/\s{2,}/g, " ").trim();
};

const extractLinkedGroup = (name: string, input: string) => {
  const explicit = extractField(input, ["course code", "course number"]);
  const codeMatch = (explicit || name).match(/\b[A-Z]{2,5}\s?-?\d{2,4}[A-Z]?\b/);
  return codeMatch?.[0].replace("-", " ").trim() ?? "";
};

const extractSectionLabel = (name: string, input: string) => {
  const explicit = extractField(input, ["section", "meeting type"]);
  if (explicit) {
    return explicit;
  }

  const combined = `${name} ${input}`;
  if (/lab\b/i.test(combined)) return "Lab";
  if (/lecture\b/i.test(combined)) return "Lecture";
  if (/seminar\b/i.test(combined)) return "Seminar";
  if (/studio\b/i.test(combined)) return "Studio";
  return "";
};

const extractWeekdays = (line: string) => {
  const days = new Set<Weekday>();

  for (const entry of weekdayMap) {
    if (entry.pattern.test(line)) {
      days.add(entry.day);
    }
  }

  const compact = line.toUpperCase().replace(/\s+/g, "");
  for (const entry of compactDayPatterns) {
    if (entry.pattern.test(compact)) {
      entry.days.forEach((day) => days.add(day));
    }
  }

  return Array.from(days);
};

const withInferredMeridiem = (value: string, fallback?: string) => {
  const trimmed = value.trim().toUpperCase();
  if (/(AM|PM)$/.test(trimmed)) {
    return trimmed;
  }

  const fallbackSuffix = fallback?.trim().toUpperCase().match(/(AM|PM)$/)?.[1];
  return fallbackSuffix ? `${trimmed} ${fallbackSuffix}` : trimmed;
};

const extractTimeRange = (line: string) => {
  const match = line.match(
    /(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*(?:-|–|to)\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i
  );

  if (!match) {
    return null;
  }

  const startTime = parseTimeInput(withInferredMeridiem(match[1], match[2]));
  const endTime = parseTimeInput(withInferredMeridiem(match[2], match[1]));

  if (!startTime || !endTime) {
    return null;
  }

  return { startTime, endTime };
};

const extractSchedule = (input: string) => {
  const schedules: ClassSchedule[] = [];

  for (const line of input.split("\n")) {
    const days = extractWeekdays(line);
    const timeRange = extractTimeRange(line);

    if (!days.length || !timeRange) {
      continue;
    }

    days.forEach((day) => {
      schedules.push({
        day,
        startTime: timeRange.startTime,
        endTime: timeRange.endTime
      });
    });
  }

  const unique = new Map<string, ClassSchedule>();
  schedules.forEach((entry) => {
    unique.set(`${entry.day}-${entry.startTime}-${entry.endTime}`, entry);
  });

  return Array.from(unique.values());
};

const extractTermType = (input: string): AcademicTermType => {
  if (/trimester/i.test(input)) return "trimester";
  if (/quarter/i.test(input)) return "quarter";
  if (/semester/i.test(input)) return "semester";
  return "custom";
};

const extractCourseLengthWeeks = (input: string, termType: AcademicTermType) => {
  const weekMatch = input.match(/\b(\d{1,2})\s*(?:week|weeks)\b/i);
  if (weekMatch) {
    return Number(weekMatch[1]);
  }

  if (termType === "semester") return 16;
  if (termType === "trimester") return 12;
  if (termType === "quarter") return 10;
  return 8;
};

const extractAttendanceType = (input: string): AttendanceType => {
  const attendanceWindow = input.match(/attendance[\s\S]{0,220}/i)?.[0] ?? input;
  if (/\boptional\b|attendance is not required|attendance not required/i.test(attendanceWindow)) {
    return "optional";
  }
  if (/\bpoints?\b|\bparticipation points?\b/i.test(attendanceWindow)) {
    return "points";
  }
  return "percentage";
};

const extractRequiredAttendance = (input: string, attendanceType: AttendanceType) => {
  const match =
    input.match(/attendance[\s\S]{0,140}?(\d{1,3})\s*%/i) ??
    input.match(/minimum[\s\S]{0,60}?(\d{1,3})\s*%/i) ??
    input.match(/(\d{1,3})\s*%\s*(?:attendance|required)/i);

  if (match) {
    return Math.min(Math.max(Number(match[1]), 0), 100);
  }

  return attendanceType === "optional" ? 60 : 80;
};

const extractExcusedAllowance = (input: string) => {
  const match =
    input.match(/(\d+)\s+(?:excused absences?|excused classes?|absences? may be excused)/i) ??
    input.match(/up to\s+(\d+)\s+absences?/i);

  return match ? Number(match[1]) : 2;
};

const calculateHoursFromSchedule = (schedule: ClassSchedule[]) => {
  const total = schedule.reduce((sum, entry) => {
    const [startHours, startMinutes] = entry.startTime.split(":").map(Number);
    const [endHours, endMinutes] = entry.endTime.split(":").map(Number);
    const duration = endHours + endMinutes / 60 - (startHours + startMinutes / 60);
    return sum + Math.max(duration, 0);
  }, 0);

  return Math.round(total * 10) / 10;
};

const extractHoursPerWeek = (input: string, schedule: ClassSchedule[]) => {
  const creditMatch =
    input.match(/(\d(?:\.\d)?)\s*(?:credit hours?|credits?)/i) ??
    input.match(/(\d(?:\.\d)?)\s*(?:contact hours?|hours? per week)/i);

  if (creditMatch) {
    return Number(creditMatch[1]);
  }

  const scheduleHours = calculateHoursFromSchedule(schedule);
  return scheduleHours || 3;
};

const extractLocationAndRoom = (input: string) => {
  const locationLine = extractField(input, ["location", "classroom", "room", "meeting location"]);
  if (!locationLine) {
    return { location: "", room: "" };
  }

  const roomMatch = locationLine.match(/\b(?:room|rm\.?|lab|suite)\s*([A-Z0-9-]+)/i);
  if (roomMatch) {
    return {
      location: locationLine.replace(roomMatch[0], "").replace(/,\s*$/, "").trim(),
      room: roomMatch[1].trim()
    };
  }

  const splitMatch = locationLine.match(/(.+?),\s*([A-Z0-9-]{1,8})$/);
  if (splitMatch) {
    return {
      location: splitMatch[1].trim(),
      room: splitMatch[2].trim()
    };
  }

  return { location: locationLine.trim(), room: "" };
};

const summarizeNotes = (input: string) => {
  const interestingLines = input
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 12 &&
        /(attendance|excused|absence|late|tardy|participation|policy)/i.test(line)
    )
    .slice(0, 3);

  return interestingLines.join(" ");
};

const buildDraft = (input: string): SyllabusImportDraft => {
  const name = normalizeCourseName(input);
  const linkedGroup = extractLinkedGroup(name, input);
  const sectionLabel = extractSectionLabel(name, input);
  const schedule = extractSchedule(input);
  const attendanceType = extractAttendanceType(input);
  const termType = extractTermType(input);
  const courseLengthWeeks = extractCourseLengthWeeks(input, termType);
  const requiredAttendance = extractRequiredAttendance(input, attendanceType);
  const excusedAllowance = extractExcusedAllowance(input);
  const hoursPerWeek = extractHoursPerWeek(input, schedule);
  const { location, room } = extractLocationAndRoom(input);
  const estimatedSessions = Math.max(schedule.length * courseLengthWeeks, 0);
  const allowedAbsencesEstimate =
    attendanceType === "optional"
      ? estimatedSessions
      : Math.max(Math.floor(estimatedSessions * (1 - requiredAttendance / 100)), 0);

  return {
    name,
    linkedGroup,
    sectionLabel,
    professor: extractField(input, ["instructor", "professor", "faculty"]),
    ta: extractField(input, ["teaching assistant", "ta", "discussion leader"]),
    location,
    room,
    schedule,
    attendanceType,
    termType,
    courseLengthWeeks,
    requiredAttendance,
    excusedAllowance,
    hoursPerWeek,
    notes: summarizeNotes(input),
    estimatedSessions,
    allowedAbsencesEstimate,
    sourceExcerpt: input.slice(0, 240).trim()
  };
};

export const parseSyllabusText = (input: string) =>
  splitBlocks(input)
    .map((block) => buildDraft(block))
    .filter((draft) => draft.name.trim().length > 0);

export const draftToClassPayload = (
  draft: SyllabusImportDraft,
  options: Pick<ClassModel, "id" | "color" | "priority">
): ClassModel => ({
  id: options.id,
  name: draft.name,
  linkedGroup: draft.linkedGroup,
  sectionLabel: draft.sectionLabel,
  professor: draft.professor,
  ta: draft.ta,
  location: draft.location,
  room: draft.room,
  schedule: draft.schedule,
  attendanceType: draft.attendanceType,
  termType: draft.termType,
  courseLengthWeeks: draft.courseLengthWeeks,
  requiredAttendance: draft.requiredAttendance,
  excusedAllowance: draft.excusedAllowance,
  hoursPerWeek: draft.hoursPerWeek,
  color: options.color,
  priority: options.priority,
  notes: draft.notes
});
