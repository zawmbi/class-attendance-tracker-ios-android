import { Text, View } from "react-native";

import { MotivationPanel } from "@/components/MotivationPanel";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useUserStore } from "@/store/userStore";
import { getBehaviorInsights, getMotivationInsights, getPrioritySuggestion } from "@/utils/motivation";

export const InsightsScreen = () => {
  const { classes, records, settings } = useAttendanceStore();
  const { isPremium, openUpgradeModal } = useUserStore();
  const insights = getMotivationInsights(classes, records, settings);
  const behaviorInsights = getBehaviorInsights(classes, records);
  const prioritySuggestion = getPrioritySuggestion(classes, records, settings);

  return (
    <ScreenContainer>
      <SectionHeader title="Insights" subtitle="Supportive context, not pressure." />
      <MotivationPanel insights={insights} />

      <View className="mt-2 rounded-card border border-border bg-surface p-5">
        <Text className="font-serif text-xl text-primary">What to prioritize next</Text>
        <Text className="mt-3 text-sm leading-6 text-muted">
          {isPremium
            ? prioritySuggestion
              ? `${prioritySuggestion.className} deserves the most attention next. ${prioritySuggestion.reason}`
              : "Your classes are in a steady place right now."
            : "Premium highlights your highest-risk class and suggests where showing up next will matter most."}
        </Text>
      </View>

      <View className="mt-6">
        {isPremium ? (
          <View className="rounded-card border border-border bg-surface p-5">
            <Text className="font-serif text-xl text-primary">Behavior patterns</Text>
            <View className="mt-4">
              {behaviorInsights.map((insight) => (
                <View key={insight.id} className="mb-3 rounded-2xl bg-background px-4 py-3">
                  <Text className="text-xs uppercase tracking-[1.5px] text-muted">{insight.label}</Text>
                  <Text className="mt-2 text-sm leading-6 text-ink">{insight.value}</Text>
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
    </ScreenContainer>
  );
};
