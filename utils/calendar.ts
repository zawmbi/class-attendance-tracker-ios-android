import { ClassModel, Weekday } from "@/utils/types";
import { addDays, formatTimeLabel, getMonthLabel, getShortWeekday, startOfWeek } from "@/utils/date";

const weekdayToIndex: Record<Weekday, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 0
};

export interface CalendarSession {
  key: string;
  classId: string;
  className: string;
  sectionLabel?: string;
  color: string;
  date: string;
  dayLabel: string;
  startLabel: string;
  endLabel: string;
  locationLabel: string;
}

const buildDateForWeekday = (baseWeek: Date, day: Weekday) => addDays(baseWeek, (weekdayToIndex[day] + 7 - 1) % 7);

export const getWeekSessions = (classes: ClassModel[], referenceDate = new Date()): CalendarSession[] => {
  const weekStart = startOfWeek(referenceDate);

  return classes
    .flatMap((classItem) =>
      classItem.schedule.map((entry) => {
        const date = buildDateForWeekday(weekStart, entry.day);
        return {
          key: `${classItem.id}-${entry.day}-${entry.startTime}`,
          classId: classItem.id,
          className: classItem.name,
          sectionLabel: classItem.sectionLabel,
          color: classItem.color,
          date: date.toISOString().slice(0, 10),
          dayLabel: getShortWeekday(date),
          startLabel: formatTimeLabel(entry.startTime),
          endLabel: formatTimeLabel(entry.endTime),
          locationLabel: `${classItem.location} ${classItem.room}`.trim()
        };
      })
    )
    .sort((left, right) => {
      const leftDate = new Date(left.date).getTime();
      const rightDate = new Date(right.date).getTime();
      return leftDate - rightDate || left.startLabel.localeCompare(right.startLabel);
    });
};

export const getMonthCells = (classes: ClassModel[], referenceDate = new Date()) => {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = addDays(firstOfMonth, -startOffset);

  return Array.from({ length: 35 }, (_, index) => {
    const date = addDays(gridStart, index);
    const iso = date.toISOString().slice(0, 10);
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" }) as Weekday;
    const sessions = classes.filter((classItem) => classItem.schedule.some((item) => item.day === weekday));

    return {
      key: iso,
      iso,
      dayNumber: date.getDate(),
      inMonth: date.getMonth() === month,
      sessions: sessions.slice(0, 3).map((classItem) => ({
        id: classItem.id,
        color: classItem.color
      })),
      count: sessions.length
    };
  });
};

export const getSemesterMonths = (classes: ClassModel[], referenceDate = new Date(), length = 5) =>
  Array.from({ length }, (_, index) => {
    const monthDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + index, 1);
    const cells = getMonthCells(classes, monthDate);

    return {
      key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
      label: getMonthLabel(monthDate),
      cells: cells.filter((cell) => cell.inMonth)
    };
  });
