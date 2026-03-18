import { Text, View } from "react-native";

import { MotivationPanel } from "@/components/MotivationPanel";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useUserStore } from "@/store/userStore";
import { useAppPalette } from "@/theme/useAppPalette";
import { getAttendanceSummary } from "@/utils/attendance";
import { getBehaviorInsights, getMotivationInsights, getPrioritySuggestion } from "@/utils/motivation";

export const InsightsScreen = () => {
  const palette = useAppPalette();
  const { classes, records, settings } = useAttendanceStore();
  const { isPremium, openUpgradeModal } = useUserStore();
  const insights = getMotivationInsights(classes, records, settings);
  const behaviorInsights = getBehaviorInsights(classes, records);
  const prioritySuggestion = getPrioritySuggestion(classes, records, settings);

  return (
    <ScreenContainer>
      <SectionHeader title="Insights" subtitle="Supportive context, not pressure." />
      <MotivationPanel insights={insights} />

      <View className="mt-2 rounded-card p-5" style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }}>
        <Text className="font-serif text-xl" style={{ color: palette.primary }}>What to prioritize next</Text>
        <Text className="mt-3 text-sm leading-6" style={{ color: palette.muted }}>
          {isPremium
            ? prioritySuggestion
              ? `${prioritySuggestion.className} deserves the most attention next. ${prioritySuggestion.reason}`
              : "Your classes are in a steady place right now."
            : "Premium highlights your highest-risk class and suggests where showing up next will matter most."}
        </Text>
      </View>

      <View className="mt-6">
        {isPremium ? (
          <View className="rounded-card p-5" style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }}>
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
        ) : (
          <PremiumFeatureCard
            title="Advanced behavioral insights"
            description="Detect recurring day and time patterns, surface your highest-risk class, and get gentle suggestions before attendance slips."
            onPress={() => openUpgradeModal("analytics")}
          />
        )}
      </View>

      {isPremium ? (
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
      ) : null}
    </ScreenContainer>
  );
};
