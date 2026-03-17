import { Text, View } from "react-native";

import { WeeklyTrendPoint } from "@/utils/types";

interface AttendanceTrendProps {
  points: WeeklyTrendPoint[];
}

export const AttendanceTrend = ({ points }: AttendanceTrendProps) => (
  <View className="rounded-card border border-border bg-surface p-5">
    <Text className="font-serif text-xl text-primary">Trend</Text>
    <View className="mt-6 flex-row items-end justify-between">
      {points.map((point) => (
        <View key={point.label} className="mx-1 flex-1 items-center">
          <View className="h-32 w-full items-center justify-end">
            <View
              className="w-7 rounded-t-full bg-primary/80"
              style={{ height: `${Math.max(point.percentage, 8)}%` }}
            />
          </View>
          <Text className="mt-3 text-xs text-muted">{point.label}</Text>
          <Text className="mt-1 text-xs text-primary">{point.percentage}%</Text>
        </View>
      ))}
    </View>
  </View>
);
