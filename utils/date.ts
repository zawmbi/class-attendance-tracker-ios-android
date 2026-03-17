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

export const formatDisplayDate = (isoDate: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(isoDate));

export const formatLongDate = (isoDate: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(new Date(isoDate));

export const formatTimeLabel = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
};

export const isClassToday = (schedule: ClassSchedule[], now = new Date()) =>
  schedule.some((item) => item.day === getWeekdayLabel(now));

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
