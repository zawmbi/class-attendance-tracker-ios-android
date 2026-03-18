import { Text, View } from "react-native";
import { useAppPalette } from "@/theme/useAppPalette";

import { WeeklyTrendPoint } from "@/utils/types";

interface AttendanceTrendProps {
  points: WeeklyTrendPoint[];
}

export const AttendanceTrend = ({ points }: AttendanceTrendProps) => {
  const palette = useAppPalette();
  return (
    <View className="rounded-card p-5" style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }}>
      <Text className="font-serif text-xl" style={{ color: palette.primary }}>Trend</Text>
      <Text className="mt-2 text-sm leading-6" style={{ color: palette.muted }}>
        Weekly attendance rate by date, based on the sessions counted for that week.
      </Text>
      <View className="mt-6 flex-row items-end justify-between">
        {points.map((point) => (
          <View key={point.label} className="mx-1 flex-1 items-center">
            <View className="h-32 w-full items-center justify-end">
              <View
                className="w-7 rounded-t-full"
                style={{ height: `${Math.max(point.percentage, 8)}%`, backgroundColor: palette.primary }}
              />
            </View>
            <Text className="mt-3 text-xs" style={{ color: palette.muted }}>{point.label}</Text>
            <Text className="mt-1 text-xs" style={{ color: palette.primary }}>{point.percentage}% week</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
