import { appConfig } from "@/theme";
import { AttendanceRecord, AttendanceSettings, BehaviorInsight, ClassModel, MotivationInsight, PrioritySuggestion } from "@/utils/types";
import { getAttendanceSummary, getClassRecords, getOverallWeeklyTrend } from "@/utils/attendance";
import { formatTimeLabel } from "@/utils/date";

export const getMotivationInsights = (
  classes: ClassModel[],
  records: AttendanceRecord[],
  settings: AttendanceSettings
): MotivationInsight[] => {
  const summaries = classes.map((classItem) => ({
    classItem,
    summary: getAttendanceSummary(classItem, records, settings)
  }));
  const strongestStreak = summaries.reduce((best, item) => (item.summary.streak > best ? item.summary.streak : best), 0);
  const atRisk = summaries.find((item) => item.summary.risk !== "safe");
  const weeklyTrend = getOverallWeeklyTrend(classes, records, settings);
  const recent = weeklyTrend[weeklyTrend.length - 1];
  const previous = weeklyTrend[weeklyTrend.length - 2];
  const improved = recent && previous && recent.percentage > previous.percentage;

  const insights: MotivationInsight[] = [];

  if (strongestStreak > 1) {
    insights.push({
      title: "Streak building",
      message: `You're on a ${strongestStreak}-class streak. Quiet consistency is doing real work for you.`,
      tone: "streak"
    });
  }

  if (improved) {
    insights.push({
      title: "Recovery in motion",
      message: "You improved from last week. Small corrections still count, even mid-semester.",
      tone: "recovery"
    });
  }

  if (atRisk) {
    insights.push({
      title: "Gentle risk reminder",
      message: `${atRisk.classItem.name} is getting close to its limit. Staying steady here could protect the rest of your week.`,
      tone: "risk"
    });
  }

  if (!atRisk && !improved) {
    insights.push({
      title: "Steady rhythm",
      message: "You're maintaining steady attendance. Keeping the routine light and repeatable is enough.",
      tone: "steady"
    });
  }

  insights.push({
    title: "You're not alone",
    message: "Many students hit attendance friction mid-semester. Missing one class does not define your progress.",
    tone: "support"
  });

  return insights.slice(0, 4);
};

export const getBehaviorInsights = (classes: ClassModel[], records: AttendanceRecord[]): BehaviorInsight[] => {
  const absentRecords = records.filter((record) => record.status === "absent");
  const dayBuckets = absentRecords.reduce<Record<string, number>>((acc, record) => {
    const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date(record.date));
    acc[weekday] = (acc[weekday] ?? 0) + 1;
    return acc;
  }, {});
  const timeBuckets = absentRecords.reduce<Record<string, number>>((acc, record) => {
    const classItem = classes.find((item) => item.id === record.classId);
    const firstStart = classItem?.schedule[0]?.startTime ?? "00:00";
    const hour = Number(firstStart.split(":")[0]);
    const key = hour >= 14 ? "After 2pm" : "Before 2pm";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const topDay = Object.entries(dayBuckets).sort((a, b) => b[1] - a[1])[0];
  const topTime = Object.entries(timeBuckets).sort((a, b) => b[1] - a[1])[0];

  const insights: BehaviorInsight[] = [];

  if (topDay) {
    insights.push({
      id: "day-pattern",
      label: "Day pattern",
      value: `You more often miss ${topDay[0]} classes.`
    });
  }

  if (topTime) {
    insights.push({
      id: "time-pattern",
      label: "Time pattern",
      value: `Attendance dips more ${topTime[0].toLowerCase()} classes.`
    });
  }

  const toughestClass = classes
    .map((classItem) => ({
      classItem,
      missed: getClassRecords(records, classItem.id).filter((record) => record.status === "absent").length
    }))
    .sort((a, b) => b.missed - a.missed)[0];

  if (toughestClass && toughestClass.missed > 0) {
    insights.push({
      id: "class-pattern",
      label: "Class pattern",
      value: `${toughestClass.classItem.name} has absorbed the most missed sessions so far.`
    });
  }

  return insights.slice(0, 3);
};

export const getPrioritySuggestion = (
  classes: ClassModel[],
  records: AttendanceRecord[],
  settings: AttendanceSettings
): PrioritySuggestion | null => {
  const scored = classes
    .map((classItem) => {
      const summary = getAttendanceSummary(classItem, records, settings);
      const nextSession = classItem.schedule[0];
      const riskWeight = summary.risk === "critical" ? 3 : summary.risk === "warning" ? 2 : 1;
      const priorityWeight = classItem.priority === "high" ? 3 : classItem.priority === "medium" ? 2 : 1;
      return {
        classItem,
        score: riskWeight * priorityWeight * Math.max(1, 100 - summary.percentage),
        summary,
        nextSession
      };
    })
    .sort((a, b) => b.score - a.score)[0];

  if (!scored) {
    return null;
  }

  return {
    classId: scored.classItem.id,
    className: scored.classItem.name,
    reason: `${scored.summary.risk} risk with ${scored.summary.remainingAbsences} absences left. Next regular start: ${scored.nextSession ? formatTimeLabel(scored.nextSession.startTime) : "TBD"}.`
  };
};

export const shouldPromptForConsistentUseUpgrade = (usageDays: number) => usageDays >= appConfig.consistentUseUpgradeDays;
