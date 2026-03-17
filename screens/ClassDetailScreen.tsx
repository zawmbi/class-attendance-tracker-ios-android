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
import { getAttendanceSummary, getClassRecords, getWeeklyTrend } from "@/utils/attendance";
import { formatLongDate, formatTimeLabel, getNextSession } from "@/utils/date";

export const ClassDetailScreen = ({ classId }: { classId: string }) => {
  const { classes, records, settings, updateRecordStatus } = useAttendanceStore();
  const { isPremium, openUpgradeModal } = useUserStore();
  const classItem = classes.find((item) => item.id === classId);

  if (!classItem) {
    return (
      <ScreenContainer>
        <Text className="font-serif text-2xl text-primary">Class not found</Text>
      </ScreenContainer>
    );
  }

  const summary = getAttendanceSummary(classItem, records, settings);
  const trend = getWeeklyTrend(classItem, records, settings);
  const history = getClassRecords(records, classItem.id);
  const nextSession = getNextSession(classItem.schedule);

  return (
    <ScreenContainer>
      <Link href="/(tabs)/dashboard">
        <Text className="mb-4 text-sm text-muted">Back to dashboard</Text>
      </Link>
      <SectionHeader title={classItem.name} subtitle={`${classItem.professor} • ${classItem.location} ${classItem.room}`} />

      <View className="mb-6 items-center rounded-card border border-border bg-surface p-6">
        <ProgressRing value={summary.percentage} label="Current attendance" />
        <Text className="mt-5 text-center text-sm leading-6 text-muted">
          {nextSession
            ? `Next session: ${nextSession.entry.day} at ${formatTimeLabel(nextSession.entry.startTime)}`
            : "No scheduled sessions available."}
        </Text>
      </View>

      <View className="mb-6 flex-row">
        <StatCard label="Risk" value={summary.risk} hint={`${summary.remainingAbsences} absences remaining`} />
        <StatCard label="Excused" value={`${summary.excusedCount}`} hint={`${summary.streak}-class positive streak`} />
      </View>

      <AttendanceTrend points={trend} />

      <View className="mt-6 rounded-card border border-border bg-surface p-5">
        <Text className="font-serif text-xl text-primary">Attendance outlook</Text>
        <View className="mt-4">
          {summary.projections.map((projection) => (
            <View key={projection.label} className="mb-3 rounded-2xl bg-background px-4 py-3">
              <Text className="text-xs uppercase tracking-[1.5px] text-muted">{projection.label}</Text>
              <Text className="mt-2 font-serif text-2xl text-primary">{isPremium ? `${projection.percentage}%` : "Premium preview"}</Text>
              <Text className="mt-2 text-sm leading-6 text-muted">
                {isPremium ? projection.detail : "Premium shows predictive simulations and safe absence planning."}
              </Text>
            </View>
          ))}
        </View>
        {!isPremium ? (
          <Pressable className="mt-2 self-start rounded-full bg-primary px-4 py-3" onPress={() => openUpgradeModal("risk_alert")}>
            <Text className="text-background">Unlock predictive insights</Text>
          </Pressable>
        ) : null}
      </View>

      <View className="mt-6 rounded-card border border-border bg-surface p-5">
        <Text className="font-serif text-xl text-primary">Attendance history</Text>
        <Text className="mt-2 text-sm text-muted">
          Required attendance: {classItem.requiredAttendance}% • {classItem.attendanceType} • {summary.eligibleCount} counted sessions
        </Text>
        <View className="mt-5">
          {history.map((record) => (
            <View key={record.id} className="mb-3 flex-row items-center justify-between rounded-2xl bg-background px-4 py-3">
              <View>
                <Text className="text-base text-ink">{formatLongDate(record.date)}</Text>
                <Text className="mt-1 text-xs text-muted">{record.notes || "No notes"}</Text>
              </View>
              <View className="items-end">
                <RecordStatusPill
                  status={record.status}
                  onPress={() =>
                    updateRecordStatus(record.id, record.status === "excused" ? record.originalStatus ?? "absent" : "excused")
                  }
                />
                <Text className="mt-2 text-xs text-muted">
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
