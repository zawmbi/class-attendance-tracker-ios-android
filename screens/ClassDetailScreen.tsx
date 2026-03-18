import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { AttendanceTrend } from "@/components/AttendanceTrend";
import { ProgressRing } from "@/components/ProgressRing";
import { RecordStatusPill } from "@/components/RecordStatusPill";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { StatCard } from "@/components/StatCard";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useUserStore } from "@/store/userStore";
import { useAppPalette } from "@/theme/useAppPalette";
import { getAttendanceSummary, getClassRecords, getWeeklyTrend } from "@/utils/attendance";
import { formatLongDate, formatTimeLabel, getNextSession } from "@/utils/date";

export const ClassDetailScreen = ({ classId }: { classId: string }) => {
  const palette = useAppPalette();
  const { classes, records, settings, updateRecordStatus } = useAttendanceStore();
  const { isPremium, openUpgradeModal } = useUserStore();
  const classItem = classes.find((item) => item.id === classId);

  if (!classItem) {
    return (
      <ScreenContainer>
        <Text className="font-serif text-2xl" style={{ color: palette.primary }}>
          Class not found
        </Text>
      </ScreenContainer>
    );
  }

  const summary = getAttendanceSummary(classItem, records, settings);
  const trend = getWeeklyTrend(classItem, records, settings);
  const history = getClassRecords(records, classItem.id);
  const nextSession = getNextSession(classItem.schedule);

  return (
    <ScreenContainer>
      <View className="mb-5 flex-row items-center justify-between">
        <Link href="/(tabs)/dashboard" asChild>
          <Pressable className="self-start rounded-full px-4 py-2.5" style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }}>
            <Text className="text-sm" style={{ color: palette.muted }}>‹ Dashboard</Text>
          </Pressable>
        </Link>
        <View className="flex-row gap-2">
          <Link href={`/class/${classItem.id}/record`} asChild>
            <Pressable className="rounded-full px-4 py-2.5" style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }}>
              <Text className="text-sm" style={{ color: palette.primary }}>Add Record</Text>
            </Pressable>
          </Link>
          <Link href={`/class/edit/${classItem.id}`} asChild>
            <Pressable className="rounded-full px-4 py-2.5" style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }}>
              <Text className="text-sm" style={{ color: palette.primary }}>Edit</Text>
            </Pressable>
          </Link>
        </View>
      </View>
      <SectionHeader title={classItem.name} subtitle={`${classItem.professor} • ${classItem.location} ${classItem.room}`} />

      <View className="mb-6 rounded-[24px] px-5 py-4" style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }}>
        <Text className="text-sm leading-6" style={{ color: palette.muted }}>
          {classItem.sectionLabel ? `${classItem.sectionLabel}` : "Primary section"}
          {classItem.linkedGroup ? ` • Linked to ${classItem.linkedGroup}` : ""}
          {classItem.termType ? ` • ${classItem.termType}` : ""}
          {classItem.courseLengthWeeks ? ` • ${classItem.courseLengthWeeks} weeks` : ""}
          {classItem.ta ? ` • TA ${classItem.ta}` : ""}
          {classItem.hoursPerWeek ? ` • ${classItem.hoursPerWeek} hours` : ""}
          {typeof classItem.excusedAllowance === "number" ? ` • ${summary.remainingExcused}/${classItem.excusedAllowance} excused left` : ""}
        </Text>
      </View>

      <View className="mb-6 items-center rounded-card p-6" style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }}>
        <ProgressRing value={summary.percentage} label="Current attendance" />
        <Text className="mt-5 text-center text-sm leading-6" style={{ color: palette.muted }}>
          {nextSession
            ? `Next session: ${nextSession.entry.day} at ${formatTimeLabel(nextSession.entry.startTime)}`
            : "No scheduled sessions available."}
        </Text>
      </View>

      <View className="mb-6 flex-row">
        <StatCard label="Risk" value={summary.risk} hint={`${summary.remainingAbsences} absences remaining`} />
        <StatCard
          label="Excused"
          value={`${summary.excusedCount}/${classItem.excusedAllowance}`}
          hint={`${summary.remainingExcused} remaining • ${summary.streak}-class positive streak`}
        />
      </View>

      <AttendanceTrend points={trend} />

      <View className="mt-6 rounded-card p-5" style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }}>
        <Text className="font-serif text-xl" style={{ color: palette.primary }}>Attendance outlook</Text>
        <View className="mt-4">
          {summary.projections.map((projection) => (
            <View key={projection.label} className="mb-3 rounded-2xl px-4 py-3" style={{ backgroundColor: palette.background }}>
              <Text className="text-xs uppercase tracking-[1.5px]" style={{ color: palette.muted }}>{projection.label}</Text>
              <Text className="mt-2 font-serif text-2xl" style={{ color: palette.primary }}>{isPremium ? `${projection.percentage}%` : "Premium preview"}</Text>
              <Text className="mt-2 text-sm leading-6" style={{ color: palette.muted }}>
                {isPremium ? projection.detail : "Premium shows predictive simulations and safe absence planning."}
              </Text>
            </View>
          ))}
        </View>
        {!isPremium ? (
          <Pressable className="mt-2 self-start rounded-full px-4 py-3" style={{ backgroundColor: palette.primary }} onPress={() => openUpgradeModal("risk_alert")}>
            <Text style={{ color: palette.background }}>Unlock predictive insights</Text>
          </Pressable>
        ) : null}
      </View>

      <View className="mt-6 rounded-card p-5" style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }}>
        <Text className="font-serif text-xl" style={{ color: palette.primary }}>Attendance history</Text>
        <Text className="mt-2 text-sm" style={{ color: palette.muted }}>
          Required attendance: {classItem.requiredAttendance}% • {classItem.attendanceType} • {summary.eligibleCount} counted sessions
        </Text>
        <View className="mt-5">
          {history.map((record) => (
            <View key={record.id} className="mb-3 flex-row items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: palette.background }}>
              <View>
                <Text className="text-base" style={{ color: palette.ink }}>{formatLongDate(record.date)}</Text>
                <Text className="mt-1 text-xs" style={{ color: palette.muted }}>{record.notes || "No notes"}</Text>
              </View>
              <View className="items-end">
                <RecordStatusPill
                  status={record.status}
                  onPress={() =>
                    updateRecordStatus(record.id, record.status === "excused" ? record.originalStatus ?? "absent" : "excused")
                  }
                />
                <Text className="mt-2 text-xs" style={{ color: palette.muted }}>
                  {record.status === "excused" ? "Tap to restore previous status" : "Tap to mark excused"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
};
