import { useEffect } from "react";
import { Text, View } from "react-native";

import { AttendanceTrend } from "@/components/AttendanceTrend";
import { HeatmapGrid } from "@/components/HeatmapGrid";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useUserStore } from "@/store/userStore";
import { getHeatmapData, getMissedPatternSummary, getOverallWeeklyTrend } from "@/utils/attendance";

export const AnalyticsScreen = () => {
  const { classes, records, settings } = useAttendanceStore();
  const { isPremium, openUpgradeModal } = useUserStore();
  const weeklyTrend = getOverallWeeklyTrend(classes, records, settings);
  const patterns = getMissedPatternSummary(classes, records);
  const heatmap = getHeatmapData(records);

  useEffect(() => {
    if (!isPremium) {
      openUpgradeModal("analytics");
    }
  }, [isPremium, openUpgradeModal]);

  return (
    <ScreenContainer>
      <SectionHeader title="Analytics" subtitle="Weekly movement, missed patterns, and attendance energy." />

      <AttendanceTrend points={weeklyTrend} />

      <View className="mt-6 rounded-card border border-border bg-surface p-5">
        <Text className="font-serif text-xl text-primary">Missed class patterns</Text>
        <View className="mt-4">
          {patterns.map((pattern) => (
            <View key={pattern.classId} className="mb-3 flex-row items-center justify-between rounded-2xl bg-background px-4 py-3">
              <View>
                <Text className="text-base text-ink">{pattern.name}</Text>
                <Text className="mt-1 text-xs text-muted">{pattern.excused} excused</Text>
              </View>
              <Text className="text-sm text-muted">{pattern.missed} missed classes</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="mt-6">
        <HeatmapGrid cells={heatmap} />
      </View>

      {!isPremium ? (
        <View className="mt-6">
          <PremiumFeatureCard
            title="Predictive attendance engine"
            description="Preview how missing the next class changes your percentage, see safe absence buffers, and unlock advanced reminder timing."
            onPress={() => openUpgradeModal("analytics")}
          />
        </View>
      ) : null}
    </ScreenContainer>
  );
};
