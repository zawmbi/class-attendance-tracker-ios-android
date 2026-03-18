import { useEffect } from "react";
import { Text, View } from "react-native";

import { AttendanceTrend } from "@/components/AttendanceTrend";
import { HeatmapGrid } from "@/components/HeatmapGrid";
import { MotivationPanel } from "@/components/MotivationPanel";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useUserStore } from "@/store/userStore";
import { useAppPalette } from "@/theme/useAppPalette";
import { getAttendanceSummary, getHeatmapData, getMissedPatternSummary, getOverallWeeklyTrend } from "@/utils/attendance";
import { getBehaviorInsights, getMotivationInsights, getPrioritySuggestion } from "@/utils/motivation";

export const AnalyticsScreen = () => {
  const palette = useAppPalette();
  const { classes, records, settings } = useAttendanceStore();
  const { isPremium, openUpgradeModal } = useUserStore();
  const weeklyTrend = getOverallWeeklyTrend(classes, records, settings);
  const patterns = getMissedPatternSummary(classes, records);
  const heatmap = getHeatmapData(records);
  const motivationInsights = getMotivationInsights(classes, records, settings);
  const behaviorInsights = getBehaviorInsights(classes, records);
  const prioritySuggestion = getPrioritySuggestion(classes, records, settings);
  const averageAttendance = Math.round(
    classes.reduce((sum, classItem) => sum + getAttendanceSummary(classItem, records, settings).percentage, 0) /
      Math.max(classes.length, 1)
  );
  const atRiskCount = classes.filter(
    (classItem) => getAttendanceSummary(classItem, records, settings).risk !== "safe"
  ).length;

  useEffect(() => {
    if (!isPremium) {
      openUpgradeModal("analytics");
    }
  }, [isPremium, openUpgradeModal]);

  return (
    <ScreenContainer>
      <SectionHeader title="Analytics" subtitle="Patterns, priorities, and a clearer read on where things stand." />

      <MotivationPanel insights={motivationInsights.slice(0, 1)} />

      <View className="mb-6 flex-row gap-3">
        <View className="flex-1 rounded-[28px] px-5 py-5" style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }}>
          <Text className="text-[11px] uppercase tracking-[1.8px]" style={{ color: palette.muted }}>Overview</Text>
          <Text className="mt-3 font-serif text-[38px]" style={{ color: palette.primary }}>{averageAttendance}%</Text>
          <Text className="mt-2 text-sm leading-6" style={{ color: palette.muted }}>Average attendance across your classes.</Text>
        </View>
        <View className="flex-1 rounded-[28px] px-5 py-5" style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }}>
          <Text className="text-[11px] uppercase tracking-[1.8px]" style={{ color: palette.muted }}>Needs attention</Text>
          <Text className="mt-3 font-serif text-[38px]" style={{ color: palette.primary }}>{atRiskCount}</Text>
          <Text className="mt-2 text-sm leading-6" style={{ color: palette.muted }}>Classes currently in warning or critical range.</Text>
        </View>
      </View>

      <AttendanceTrend points={weeklyTrend} />

      <View className="mt-6 rounded-card p-5" style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }}>
        <Text className="font-serif text-xl" style={{ color: palette.primary }}>What to prioritize next</Text>
        <Text className="mt-3 text-sm leading-6" style={{ color: palette.muted }}>
          {isPremium
            ? prioritySuggestion
              ? `${prioritySuggestion.className} deserves the most attention next. ${prioritySuggestion.reason}`
              : "Your classes are in a steady place right now."
            : "Premium highlights your highest-risk class and suggests where showing up next will matter most."}
        </Text>
      </View>

      <View className="mt-6 rounded-card p-5" style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }}>
        <Text className="font-serif text-xl" style={{ color: palette.primary }}>Missed class patterns</Text>
        <View className="mt-4">
          {patterns.map((pattern) => (
            <View key={pattern.classId} className="mb-3 flex-row items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: palette.background }}>
              <View>
                <Text className="text-base" style={{ color: palette.ink }}>{pattern.name}</Text>
                <Text className="mt-1 text-xs" style={{ color: palette.muted }}>{pattern.excused} excused</Text>
              </View>
              <Text className="text-sm" style={{ color: palette.muted }}>{pattern.missed} missed classes</Text>
            </View>
          ))}
        </View>
      </View>

      {isPremium ? (
        <>
          <View className="mt-6 rounded-card p-5" style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }}>
            <Text className="font-serif text-xl" style={{ color: palette.primary }}>Behavior patterns</Text>
            <View className="mt-4">
              {behaviorInsights.map((insight) => (
                <View key={insight.id} className="mb-3 rounded-2xl px-4 py-3" style={{ backgroundColor: palette.background }}>
                  <Text className="text-xs uppercase tracking-[1.5px]" style={{ color: palette.muted }}>{insight.label}</Text>
                  <Text className="mt-2 text-sm leading-6" style={{ color: palette.ink }}>{insight.value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-6 rounded-card p-5" style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }}>
            <Text className="font-serif text-xl" style={{ color: palette.primary }}>Priority ladder</Text>
            <View className="mt-4">
              {classes
                .map((classItem) => ({
                  classItem,
                  summary: getAttendanceSummary(classItem, records, settings)
                }))
                .sort((a, b) => {
                  const leftScore = (a.summary.risk === "critical" ? 3 : a.summary.risk === "warning" ? 2 : 1) * (100 - a.summary.percentage);
                  const rightScore = (b.summary.risk === "critical" ? 3 : b.summary.risk === "warning" ? 2 : 1) * (100 - b.summary.percentage);
                  return rightScore - leftScore;
                })
                .slice(0, 3)
                .map(({ classItem, summary }, index) => (
                  <View key={classItem.id} className="mb-3 flex-row items-center justify-between rounded-2xl px-4 py-4" style={{ backgroundColor: palette.background }}>
                    <View className="flex-1 pr-4">
                      <Text className="font-serif text-lg" style={{ color: palette.primary }}>{index + 1}. {classItem.name}</Text>
                      <Text className="mt-1 text-sm leading-6" style={{ color: palette.muted }}>
                        {summary.remainingAbsences} absences left • {summary.remainingExcused} excused remaining
                      </Text>
                    </View>
                    <Text className="text-sm" style={{ color: palette.muted }}>{summary.percentage}%</Text>
                  </View>
                ))}
            </View>
          </View>

          <View className="mt-6 rounded-card p-5" style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }}>
            <Text className="font-serif text-xl" style={{ color: palette.primary }}>Premium projections</Text>
            <View className="mt-4">
              {classes
                .map((classItem) => ({
                  classItem,
                  summary: getAttendanceSummary(classItem, records, settings)
                }))
                .sort((a, b) => a.summary.percentage - b.summary.percentage)
                .slice(0, 3)
                .map(({ classItem, summary }) => (
                  <View key={classItem.id} className="mb-3 rounded-2xl px-4 py-4" style={{ backgroundColor: palette.background }}>
                    <Text className="font-serif text-lg" style={{ color: palette.primary }}>{classItem.name}</Text>
                    <Text className="mt-2 text-sm leading-6" style={{ color: palette.muted }}>{summary.projections[0]?.detail}</Text>
                    <Text className="mt-1 text-sm leading-6" style={{ color: palette.muted }}>{summary.projections[2]?.detail}</Text>
                  </View>
                ))}
            </View>
          </View>
        </>
      ) : null}

      <View className="mt-6">
        <HeatmapGrid cells={heatmap} />
      </View>

      {!isPremium ? (
        <>
          <View className="mt-6">
            <PremiumFeatureCard
              title="Behavioral insights"
              description="Spot day and time patterns, see which class needs you next, and turn scattered attendance into a clearer plan."
              onPress={() => openUpgradeModal("analytics")}
            />
          </View>
          <View className="mt-4">
            <PremiumFeatureCard
              title="Predictive attendance engine"
              description="Preview how missing the next class changes your percentage, see safe absence buffers, and unlock advanced reminder timing."
              onPress={() => openUpgradeModal("analytics")}
            />
          </View>
        </>
      ) : null}
    </ScreenContainer>
  );
};
