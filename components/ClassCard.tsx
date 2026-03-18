import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { cardStyles } from "@/theme";
import { useAppPalette } from "@/theme/useAppPalette";
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
  compact?: boolean;
}

export const ClassCard = ({ classItem, records, settings, index = 0, compact = false }: ClassCardProps) => {
  const palette = useAppPalette();
  const summary = getAttendanceSummary(classItem, records, settings);
  const nextSession = getNextSession(classItem.schedule);
  const highlightToday = isClassToday(classItem.schedule);

  return (
    <Link href={`/class/${classItem.id}`} asChild>
      <AnimatedPressable
        entering={FadeInUp.delay(index * 70).springify()}
        className={`mb-4 rounded-[30px] ${compact ? "px-4 py-4" : "px-6 py-6"}`}
        style={[
          cardStyles,
          {
            backgroundColor: palette.surface,
            borderColor: highlightToday ? classItem.color : palette.border,
            borderWidth: 1
          },
          highlightToday && {
            borderColor: classItem.color
          }
        ]}
      >
        {compact ? (
          <View>
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              className="font-serif text-[20px] leading-[26px]"
              style={{ color: palette.primary }}
            >
              {classItem.sectionLabel ? `${classItem.name} • ${classItem.sectionLabel}` : classItem.name}
            </Text>
            <View className="mt-3 self-start">
              <RiskBadge risk={summary.risk} />
            </View>
            <Text className="mt-3 text-xs leading-5" style={{ color: palette.muted }}>
              {nextSession
                ? `${nextSession.entry.day} at ${formatTimeLabel(nextSession.entry.startTime)}`
                : "No upcoming sessions"}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text
                numberOfLines={3}
                className="font-serif text-[28px] leading-[34px]"
                style={{ color: palette.primary }}
              >
                {classItem.sectionLabel ? `${classItem.name} • ${classItem.sectionLabel}` : classItem.name}
              </Text>
              <Text className="mt-2 text-sm" style={{ color: palette.muted }}>
                {nextSession
                  ? `${nextSession.entry.day} at ${formatTimeLabel(nextSession.entry.startTime)}`
                  : "No upcoming sessions"}
              </Text>
            </View>
            <RiskBadge risk={summary.risk} />
          </View>
        )}

        <View className={`flex-row items-end justify-between ${compact ? "mt-4" : "mt-6"}`}>
          <View>
            <Text className="text-[11px] uppercase tracking-[1.8px]" style={{ color: palette.muted }}>Attendance</Text>
            <Text
              className={`mt-2 font-serif ${compact ? "text-[34px] leading-[38px]" : "text-[44px] leading-[48px]"}`}
              style={{ color: classItem.color }}
            >
              {summary.percentage}%
            </Text>
          </View>
          <View
            className={`rounded-full ${compact ? "px-3 py-2" : "px-4 py-3"}`}
            style={{ backgroundColor: palette.background }}
          >
            <Text className={`${compact ? "text-xs" : "text-sm"}`} style={{ color: palette.primary }}>Open</Text>
          </View>
        </View>

        <View
          className={`rounded-[22px] px-4 ${compact ? "mt-4 py-3" : "mt-5 py-4"}`}
          style={{ backgroundColor: palette.background }}
        >
          <Text className={`text-center ${compact ? "text-xs leading-5" : "text-sm leading-6"}`} style={{ color: palette.ink }}>
            {highlightToday ? "Scheduled today" : `${classItem.professor} • Room ${classItem.room}`}
          </Text>
          <Text className={`mt-2 text-center ${compact ? "text-xs leading-5" : "text-sm leading-6"}`} style={{ color: palette.muted }}>
            {summary.remainingAbsences} absences left before risk increases
          </Text>
        </View>
      </AnimatedPressable>
    </Link>
  );
};
