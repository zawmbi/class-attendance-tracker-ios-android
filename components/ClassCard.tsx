import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { cardStyles } from "@/theme";
import { getAttendanceSummary } from "@/utils/attendance";
import { formatTimeLabel, getNextSession, isClassToday } from "@/utils/date";
import { AttendanceRecord, AttendanceSettings, ClassModel } from "@/utils/types";
import { RiskBadge } from "@/components/RiskBadge";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ClassCardProps {
  classItem: ClassModel;
  records: AttendanceRecord[];
  settings: AttendanceSettings;
  index?: number;
}

export const ClassCard = ({ classItem, records, settings, index = 0 }: ClassCardProps) => {
  const summary = getAttendanceSummary(classItem, records, settings);
  const nextSession = getNextSession(classItem.schedule);
  const highlightToday = isClassToday(classItem.schedule);

  return (
    <Link href={`/class/${classItem.id}`} asChild>
      <AnimatedPressable
        entering={FadeInUp.delay(index * 70).springify()}
        className="mb-4 rounded-[30px] border border-border bg-surface px-6 py-6"
        style={[
          cardStyles,
          highlightToday && {
            borderColor: classItem.color
          }
        ]}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="font-serif text-[28px] leading-[34px] text-primary">{classItem.name}</Text>
            <Text className="mt-2 text-sm text-muted">
              {nextSession
                ? `${nextSession.entry.day} at ${formatTimeLabel(nextSession.entry.startTime)}`
                : "No upcoming sessions"}
            </Text>
          </View>
          <RiskBadge risk={summary.risk} />
        </View>

        <View className="mt-6 flex-row items-end justify-between">
          <View>
            <Text className="text-[11px] uppercase tracking-[1.8px] text-muted">Attendance</Text>
            <Text className="mt-2 font-serif text-[44px] leading-[48px]" style={{ color: classItem.color }}>
              {summary.percentage}%
            </Text>
          </View>
          <View className="rounded-full bg-background px-4 py-3">
            <Text className="text-sm text-primary">Open class</Text>
          </View>
        </View>

        <View className="mt-5 rounded-[22px] bg-background px-4 py-4">
          <Text className="text-center text-sm leading-6 text-ink">
            {highlightToday ? "Scheduled today" : `${classItem.professor} • Room ${classItem.room}`}
          </Text>
          <Text className="mt-2 text-center text-sm leading-6 text-muted">
            {summary.remainingAbsences} absences left before risk increases
          </Text>
        </View>
      </AnimatedPressable>
    </Link>
  );
};
