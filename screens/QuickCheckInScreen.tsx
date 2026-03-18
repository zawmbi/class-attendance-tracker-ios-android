import { Text, View } from "react-native";
import { useState } from "react";

import { QuickActionButton } from "@/components/QuickActionButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useAppPalette } from "@/theme/useAppPalette";
import { isClassToday } from "@/utils/date";

export const QuickCheckInScreen = () => {
  const palette = useAppPalette();
  const { classes, records, settings, markAttendance, clearAttendanceForDate } = useAttendanceStore();
  const todaysClasses = classes.filter((classItem) => isClassToday(classItem.schedule));
  const checkInClasses = todaysClasses.length > 0 ? todaysClasses : classes;
  const [celebratingClassId, setCelebratingClassId] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const handleStatusPress = (classId: string, currentStatus: "present" | "late" | "absent" | "excused" | undefined, nextStatus: "present" | "late" | "absent") => {
    if (currentStatus === nextStatus) {
      clearAttendanceForDate(classId, today);
      setCelebratingClassId((current) => (current === classId ? null : current));
      return;
    }

    if (nextStatus === "present") {
      setCelebratingClassId(classId);
      setTimeout(() => setCelebratingClassId((current) => (current === classId ? null : current)), 850);
    } else {
      setCelebratingClassId((current) => (current === classId ? null : current));
    }

    markAttendance(classId, nextStatus);
  };

  return (
    <ScreenContainer>
      <SectionHeader title="Quick Check-In" subtitle="Mark today’s classes in one calm place." centered />



      {checkInClasses.map((classItem) => {
        const todayStatus = records.find(
          (record) => record.classId === classItem.id && record.date === today
        );
        const selectedStatus = todayStatus?.status;

        return (
          
          <View key={classItem.id} className="mb-4 rounded-[30px] px-6 py-6" style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }}>
            <Text className="text-center font-serif text-[30px]" style={{ color: palette.primary }}>
              {classItem.sectionLabel ? `${classItem.name} • ${classItem.sectionLabel}` : classItem.name}
            </Text>
            <Text className="mt-2 text-center text-sm" style={{ color: palette.muted }}>
              {todayStatus ? `Today: ${todayStatus.status}` : "Not checked in yet"}
            </Text>
            {classItem.ta || classItem.hoursPerWeek ? (
              <Text className="mt-2 text-center text-xs" style={{ color: palette.muted }}>
                {classItem.ta ? `TA ${classItem.ta}` : ""}
                {classItem.ta && classItem.hoursPerWeek ? " • " : ""}
                {classItem.hoursPerWeek ? `${classItem.hoursPerWeek} hours` : ""}
              </Text>
            ) : null}
            <View className="mt-6 flex-row gap-3">
              <QuickActionButton
                label="Present"
                tone="present"
                active={selectedStatus === "present"}
                onPress={() => handleStatusPress(classItem.id, selectedStatus, "present")}
                celebrate={celebratingClassId === classItem.id}
              />
              <QuickActionButton
                label="Late"
                tone="late"
                active={selectedStatus === "late"}
                onPress={() => handleStatusPress(classItem.id, selectedStatus, "late")}
              />
              <QuickActionButton
                label="Absent"
                tone="absent"
                active={selectedStatus === "absent"}
                onPress={() => handleStatusPress(classItem.id, selectedStatus, "absent")}
              />
            </View>
          
          </View>
          
        );
        
      })}
    </ScreenContainer>
    
  );
};
