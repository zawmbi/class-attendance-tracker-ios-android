import { useEffect, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";

import { QuickActionButton } from "@/components/QuickActionButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useAppPalette } from "@/theme/useAppPalette";
import { isClassToday } from "@/utils/date";
import { XP_PER_STATUS, getGamificationProfile } from "@/utils/gamification";
import { AttendanceStatus } from "@/utils/types";

type CheckInStatus = "present" | "late" | "absent";

interface Feedback {
  message: string;
  accent: string;
  nonce: number;
}

const FeedbackToast = ({ feedback }: { feedback: Feedback | null }) => {
  const palette = useAppPalette();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-12);

  useEffect(() => {
    if (!feedback) {
      return;
    }
    opacity.value = withSequence(
      withTiming(1, { duration: 180 }),
      withTiming(1, { duration: 1200 }),
      withTiming(0, { duration: 400 })
    );
    translateY.value = withSequence(
      withTiming(0, { duration: 180 }),
      withTiming(0, { duration: 1200 }),
      withTiming(-12, { duration: 400 })
    );
  }, [feedback, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }]
  }));

  if (!feedback) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      className="mb-4 items-center rounded-[20px] px-5 py-3"
      style={[
        { backgroundColor: palette.surface, borderWidth: 1.5, borderColor: feedback.accent },
        style
      ]}
    >
      <Text className="font-serif text-[18px]" style={{ color: palette.primary }}>
        {feedback.message}
      </Text>
    </Animated.View>
  );
};

const presentLines = [
  "Nice — your streak keeps building.",
  "Showing up is the whole game.",
  "That's momentum you can feel.",
  "Another one in the books."
];

export const QuickCheckInScreen = () => {
  const palette = useAppPalette();
  const { classes, records, settings, markAttendance, clearAttendanceForDate } = useAttendanceStore();
  const todaysClasses = classes.filter((classItem) => isClassToday(classItem.schedule));
  const checkInClasses = todaysClasses.length > 0 ? todaysClasses : classes;
  const [celebratingClassId, setCelebratingClassId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const profile = useMemo(
    () => getGamificationProfile(classes, records, settings),
    [classes, records, settings]
  );

  // Watch the unlocked badge set; when it grows, celebrate the new badge.
  const unlockedIds = useMemo(
    () => profile.achievements.filter((item) => item.unlocked).map((item) => item.id),
    [profile.achievements]
  );
  const prevUnlocked = useRef<string[] | null>(null);

  useEffect(() => {
    if (prevUnlocked.current === null) {
      prevUnlocked.current = unlockedIds;
      return;
    }
    const fresh = unlockedIds.filter((id) => !prevUnlocked.current!.includes(id));
    prevUnlocked.current = unlockedIds;
    if (fresh.length > 0) {
      const achievement = profile.achievements.find((item) => item.id === fresh[0]);
      if (achievement) {
        setFeedback({
          message: `${achievement.glyph} ${achievement.title} unlocked!`,
          accent: palette.accent,
          nonce: Date.now()
        });
      }
    }
  }, [unlockedIds, profile.achievements, palette.accent]);

  const showXpToast = (status: CheckInStatus) => {
    if (status === "absent") {
      return;
    }
    const xp = XP_PER_STATUS[status];
    const line = status === "present" ? presentLines[Math.floor(Math.random() * presentLines.length)] : "Logged — late still counts.";
    setFeedback({
      message: `+${xp} XP · ${line}`,
      accent: status === "present" ? palette.success : palette.warning,
      nonce: Date.now()
    });
  };

  const handleStatusPress = (
    classId: string,
    currentStatus: AttendanceStatus | undefined,
    nextStatus: CheckInStatus
  ) => {
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
    showXpToast(nextStatus);
  };

  return (
    <ScreenContainer>
      <SectionHeader title="Quick Check-In" subtitle="Mark today's classes in one calm place." centered />

      <FeedbackToast feedback={feedback} />

      {checkInClasses.map((classItem) => {
        const todayStatus = records.find(
          (record) => record.classId === classItem.id && record.date === today
        );
        const selectedStatus = todayStatus?.status;

        return (
          <View
            key={classItem.id}
            className="mb-4 rounded-[30px] px-6 py-6"
            style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }}
          >
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
