import { appConfig } from "@/theme";
import {
  AttendanceProjection,
  AttendanceRecord,
  AttendanceSettings,
  AttendanceStatus,
  ClassModel,
  HeatmapCell,
  RiskLevel,
  WeeklyTrendPoint
} from "@/utils/types";
import { formatDisplayDate, getRelativeDayBuckets, getWeekLabel, startOfWeek } from "@/utils/date";

const isExcused = (record: AttendanceRecord) => record.status === "excused";

const getStatusWeight = (status: AttendanceStatus, settings: AttendanceSettings) => {
  switch (status) {
    case "present":
      return 1;
    case "late":
      return settings.lateCreditWeight;
    case "excused":
    case "absent":
    default:
      return 0;
  }
};

const getEligibleRecords = (records: AttendanceRecord[]) => records.filter((record) => !isExcused(record));

const getEligibleSessionStats = (classItem: ClassModel, records: AttendanceRecord[], settings: AttendanceSettings) => {
  const classRecords = getClassRecords(records, classItem.id);
  const eligibleRecords = getEligibleRecords(classRecords);
  const earnedCredits = eligibleRecords.reduce((sum, record) => sum + getStatusWeight(record.status, settings), 0);

  return {
    classRecords,
    eligibleRecords,
    earnedCredits
  };
};

const calculateProjectedPercentage = (earnedCredits: number, eligibleCount: number) => {
  if (eligibleCount <= 0) {
    return 100;
  }

  return Math.round((earnedCredits / eligibleCount) * 100);
};

export const getClassRecords = (records: AttendanceRecord[], classId: string) =>
  records
    .filter((record) => record.classId === classId)
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

export const calculateAttendancePercentage = (
  classItem: ClassModel,
  records: AttendanceRecord[],
  settings: AttendanceSettings
) => {
  const { eligibleRecords, earnedCredits } = getEligibleSessionStats(classItem, records, settings);

  if (classItem.attendanceType === "optional" && eligibleRecords.length === 0) {
    return 100;
  }

  return calculateProjectedPercentage(earnedCredits, eligibleRecords.length);
};

export const getAllowedAbsencesRemaining = (
  classItem: ClassModel,
  records: AttendanceRecord[],
  settings: AttendanceSettings
) => {
  const { eligibleRecords, earnedCredits } = getEligibleSessionStats(classItem, records, settings);
  const requiredRate = classItem.requiredAttendance / 100;

  let additionalAbsences = 0;

  while (calculateProjectedPercentage(earnedCredits, eligibleRecords.length + additionalAbsences + 1) >= requiredRate * 100) {
    additionalAbsences += 1;

    if (additionalAbsences > 100) {
      break;
    }
  }

  return additionalAbsences;
};

export const getRiskLevel = (
  percentage: number,
  settings: AttendanceSettings,
  classItem: ClassModel
): RiskLevel => {
  if (classItem.attendanceType === "optional") {
    return percentage >= settings.riskThresholds.critical ? "safe" : "warning";
  }

  if (percentage <= settings.riskThresholds.critical) {
    return "critical";
  }

  if (percentage <= settings.riskThresholds.warning) {
    return "warning";
  }

  return "safe";
};

export const getProjectionSummary = (
  classItem: ClassModel,
  records: AttendanceRecord[],
  settings: AttendanceSettings
): AttendanceProjection[] => {
  const { eligibleRecords, earnedCredits } = getEligibleSessionStats(classItem, records, settings);
  const futureWindow = appConfig.projectionWindowSessions;
  const nextMissPercentage = calculateProjectedPercentage(earnedCredits, eligibleRecords.length + 1);
  const perfectRunPercentage = calculateProjectedPercentage(earnedCredits + futureWindow, eligibleRecords.length + futureWindow);
  const allowedAbsences = getAllowedAbsencesRemaining(classItem, records, settings);

  return [
    {
      label: "If you miss next class",
      percentage: nextMissPercentage,
      detail: `One missed session would move you to ${nextMissPercentage}%.`
    },
    {
      label: "If you attend upcoming classes",
      percentage: perfectRunPercentage,
      detail: `Attending the next ${futureWindow} sessions could bring you to ${perfectRunPercentage}%.`
    },
    {
      label: "Absence buffer",
      percentage: Math.min(100, classItem.requiredAttendance),
      detail: `You can miss ${allowedAbsences} more classes safely before dropping below ${classItem.requiredAttendance}%.`
    }
  ];
};

export const getAttendanceSummary = (
  classItem: ClassModel,
  records: AttendanceRecord[],
  settings: AttendanceSettings
) => {
  const { classRecords, eligibleRecords } = getEligibleSessionStats(classItem, records, settings);
  const percentage = calculateAttendancePercentage(classItem, records, settings);
  const streak = classRecords
    .slice()
    .reverse()
    .reduce(
      (current, record) => {
        if (!current.open) {
          return current;
        }

        if (record.status === "present" || record.status === "late") {
          return { count: current.count + 1, open: true };
        }

        if (record.status === "excused") {
          return current;
        }

        return { count: current.count, open: false };
      },
      { count: 0, open: true }
    ).count;

  return {
    percentage,
    risk: getRiskLevel(percentage, settings, classItem),
    remainingAbsences: getAllowedAbsencesRemaining(classItem, records, settings),
    streak,
    total: classRecords.length,
    eligibleCount: eligibleRecords.length,
    presentCount: classRecords.filter((record) => record.status === "present").length,
    lateCount: classRecords.filter((record) => record.status === "late").length,
    absentCount: classRecords.filter((record) => record.status === "absent").length,
    excusedCount: classRecords.filter((record) => record.status === "excused").length,
    remainingExcused: Math.max(classItem.excusedAllowance - classRecords.filter((record) => record.status === "excused").length, 0),
    projections: getProjectionSummary(classItem, records, settings)
  };
};

export const getWeeklyTrend = (
  classItem: ClassModel,
  records: AttendanceRecord[],
  settings: AttendanceSettings,
  weeks = appConfig.analyticsWeeks
): WeeklyTrendPoint[] => {
  const buckets = getRelativeDayBuckets(weeks);
  const classRecords = getClassRecords(records, classItem.id);

  return buckets.map((start) => {
    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    const bucketRecords = classRecords.filter((record) => {
      const date = new Date(record.date);
      return date >= start && date < end;
    });
    const eligible = getEligibleRecords(bucketRecords);
    const percentage =
      eligible.length > 0
        ? calculateProjectedPercentage(
            eligible.reduce((sum, record) => sum + getStatusWeight(record.status, settings), 0),
            eligible.length
          )
        : 0;

    return {
      label: getWeekLabel(start),
      percentage,
      absences: bucketRecords.filter((record) => record.status === "absent").length
    };
  });
};

export const getOverallWeeklyTrend = (
  classes: ClassModel[],
  records: AttendanceRecord[],
  settings: AttendanceSettings
) =>
  getRelativeDayBuckets(appConfig.analyticsWeeks).map((start) => {
    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    const bucketRecords = records.filter((record) => {
      const date = new Date(record.date);
      return date >= start && date < end;
    });
    const eligible = getEligibleRecords(bucketRecords);
    const percentage =
      eligible.length > 0
        ? calculateProjectedPercentage(
            eligible.reduce((sum, record) => sum + getStatusWeight(record.status, settings), 0),
            eligible.length
          )
        : 0;

    return {
      label: getWeekLabel(start),
      percentage,
      absences: bucketRecords.filter((record) => record.status === "absent").length,
      count: eligible.length || classes.length
    };
  });

export const getMissedPatternSummary = (classes: ClassModel[], records: AttendanceRecord[]) =>
  classes
    .map((classItem) => {
      const missed = getClassRecords(records, classItem.id).filter((record) => record.status === "absent").length;
      const excused = getClassRecords(records, classItem.id).filter((record) => record.status === "excused").length;
      return {
        classId: classItem.id,
        name: classItem.name,
        missed,
        excused
      };
    })
    .sort((left, right) => right.missed - left.missed);

export const getHeatmapData = (records: AttendanceRecord[], weeks = appConfig.heatmapWeeks): HeatmapCell[] => {
  const start = startOfWeek();
  start.setDate(start.getDate() - (weeks - 1) * 7);

  return Array.from({ length: weeks * 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const iso = date.toISOString().slice(0, 10);
    const dayRecords = records.filter((record) => record.date === iso);
    const value = dayRecords.reduce((sum, record) => {
      if (record.status === "present") return sum + 3;
      if (record.status === "late") return sum + 2;
      if (record.status === "excused") return sum + 1;
      return sum;
    }, 0);

    return {
      key: iso,
      value,
      label: `${formatDisplayDate(iso)} • ${dayRecords.length} check-ins`
    };
  });
};

export const getIncentiveMessage = (streak: number) => {
  if (streak <= 0) {
    return "A gentle reset still counts as progress.";
  }

  return appConfig.positiveMessages[streak % appConfig.positiveMessages.length];
};
