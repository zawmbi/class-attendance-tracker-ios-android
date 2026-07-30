import { ClassSchedule, Weekday } from "@/utils/types";

const weekdays: Weekday[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

export const getWeekdayLabel = (date: Date) => weekdays[date.getDay()];

// Parse a yyyy-mm-dd key as LOCAL midnight. Bare `new Date("2026-07-13")` parses
// as UTC, so in timezones behind UTC it renders as the previous day. Callers pass
// date-only keys (record.date / toISOString slices); the slice guards stray times.
export const parseLocalDate = (isoDate: string) => new Date(`${isoDate.slice(0, 10)}T00:00:00`);

// yyyy-mm-dd for a Date, in LOCAL time. The inverse of parseLocalDate.
//
// Never use `date.toISOString().slice(0, 10)` for this: that's the UTC date, so
// anywhere behind UTC it rolls over to tomorrow in the evening — check-ins get
// written under the wrong day and today's records stop matching.
export const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (isoDate: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(parseLocalDate(isoDate));

export const formatLongDate = (isoDate: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(parseLocalDate(isoDate));

export const formatTimeLabel = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
};

export const formatEditableTime = (time: string) => formatTimeLabel(time);

export const parseTimeInput = (input: string) => {
  const trimmed = input.trim().toUpperCase();

  if (!trimmed) {
    return null;
  }

  const meridiemMatch = trimmed.match(/^(\d{1,2})(?::?(\d{2}))?\s*(AM|PM)$/);
  if (meridiemMatch) {
    let hours = Number(meridiemMatch[1]);
    const minutes = Number(meridiemMatch[2] ?? "0");
    const suffix = meridiemMatch[3];

    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
      return null;
    }

    if (suffix === "AM") {
      hours = hours === 12 ? 0 : hours;
    } else {
      hours = hours === 12 ? 12 : hours + 12;
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  const twentyFourHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourHourMatch) {
    const hours = Number(twentyFourHourMatch[1]);
    const minutes = Number(twentyFourHourMatch[2]);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  return null;
};

export const isClassToday = (schedule: ClassSchedule[], now = new Date()) =>
  schedule.some((item) => item.day === getWeekdayLabel(now));

// The schedule entry for today's weekday. Use this rather than schedule[0] when
// showing or ordering "today" — a course can meet at different times on
// different days, and schedule[0] is just whichever day was entered first.
export const getTodayScheduleEntry = (schedule: ClassSchedule[], now = new Date()) =>
  schedule.find((item) => item.day === getWeekdayLabel(now));

// Sortable minutes-since-midnight for today's session. Classes that don't meet
// today sort last rather than jumping to the front.
export const todayStartMinutes = (schedule: ClassSchedule[], now = new Date()) => {
  const entry = getTodayScheduleEntry(schedule, now);
  if (!entry) return Number.MAX_SAFE_INTEGER;
  const [hours, minutes] = entry.startTime.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

export const getNextSession = (schedule: ClassSchedule[], now = new Date()) => {
  const candidates = schedule.map((entry) => {
    const target = new Date(now);
    const currentDayIndex = now.getDay();
    const targetDayIndex = weekdays.indexOf(entry.day);
    let offset = targetDayIndex - currentDayIndex;

    if (offset < 0) {
      offset += 7;
    }

    const [hours, minutes] = entry.startTime.split(":").map(Number);
    target.setDate(now.getDate() + offset);
    target.setHours(hours, minutes, 0, 0);

    if (target < now) {
      target.setDate(target.getDate() + 7);
    }

    return {
      startsAt: target,
      entry
    };
  });

  return candidates.sort((left, right) => left.startsAt.getTime() - right.startsAt.getTime())[0];
};

export const startOfWeek = (date = new Date()) => {
  const copy = new Date(date);
  const weekday = copy.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const getWeekLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(date);

export const getRelativeDayBuckets = (weeks: number) => {
  const base = startOfWeek();
  return Array.from({ length: weeks }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() - (weeks - index - 1) * 7);
    return date;
  });
};

export const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

export const getMonthLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(date);

export const getShortWeekday = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short"
  }).format(date);
