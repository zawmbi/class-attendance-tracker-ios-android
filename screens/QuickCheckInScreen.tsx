import { Text, View } from "react-native";

import { QuickActionButton } from "@/components/QuickActionButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { useAttendanceStore } from "@/store/attendanceStore";
import { isClassToday } from "@/utils/date";

export const QuickCheckInScreen = () => {
  const { classes, records, settings, markAttendance } = useAttendanceStore();
  const todaysClasses = classes.filter((classItem) => isClassToday(classItem.schedule));
  const checkInClasses = todaysClasses.length > 0 ? todaysClasses : classes;

  return (
    <ScreenContainer>
      <SectionHeader title="Quick Check-In" subtitle="Fast, obvious actions for the classes that matter today." centered />

      <View className="mb-6 rounded-[30px] border border-border bg-surface px-6 py-6">
        <Text className="text-center font-serif text-[28px] text-primary">Today’s check-in window</Text>
        <Text className="mt-3 text-center text-sm leading-6 text-muted">
          Reminders are set for {settings.reminderMinutesBefore} minutes before class, with missed check-ins nudged again
          after {settings.missedCheckInDelayMinutes} minutes.
        </Text>
      </View>

      {checkInClasses.map((classItem) => {
        const todayStatus = records.find(
          (record) => record.classId === classItem.id && record.date === new Date().toISOString().slice(0, 10)
        );

        return (
          <View key={classItem.id} className="mb-4 rounded-[30px] border border-border bg-surface px-6 py-6">
            <Text className="text-center font-serif text-[30px] text-primary">{classItem.name}</Text>
            <Text className="mt-2 text-center text-sm text-muted">
              {todayStatus ? `Today: ${todayStatus.status}` : "Not checked in yet"}
            </Text>
            <View className="mt-6 flex-row gap-3">
              <QuickActionButton label="Present" tone="present" onPress={() => markAttendance(classItem.id, "present")} />
              <QuickActionButton label="Late" tone="late" onPress={() => markAttendance(classItem.id, "late")} />
              <QuickActionButton label="Absent" tone="absent" onPress={() => markAttendance(classItem.id, "absent")} />
            </View>
          </View>
        );
      })}
    </ScreenContainer>
  );
};
