import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { useUserStore } from "@/store/userStore";
import { useAppPalette } from "@/theme/useAppPalette";
import { DashboardWidget } from "@/utils/types";

const labels: Record<DashboardWidget, { title: string; description: string }> = {
  actions: { title: "Quick actions", description: "Check In and Add Class buttons." },
  momentum: { title: "Momentum", description: "Your current streak card." },
  motivation: { title: "Motivation", description: "Supportive message block." },
  today: { title: "Today", description: "Classes scheduled for today." },
  more_classes: { title: "More Classes", description: "Your condensed class grid." }
};

export const DashboardCustomizeScreen = () => {
  const palette = useAppPalette();
  const { dashboardWidgetOrder, moveDashboardWidget } = useUserStore();

  return (
    <ScreenContainer>
      <Link href="/(tabs)/dashboard" asChild>
        <Pressable className="mb-5 self-start rounded-full px-4 py-2.5" style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
          <Text style={{ color: palette.primary }}>‹ Back</Text>
        </Pressable>
      </Link>
      <SectionHeader
        title="Customize Dashboard"
        subtitle="Move sections up or down to decide what you see first."
      />

      {dashboardWidgetOrder.map((widget, index) => (
        <View
          key={widget}
          className="mb-4 rounded-[28px] px-5 py-5"
          style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
        >
          <Text className="font-serif text-[24px]" style={{ color: palette.primary }}>{labels[widget].title}</Text>
          <Text className="mt-2 text-sm leading-6" style={{ color: palette.muted }}>{labels[widget].description}</Text>
          <View className="mt-4 flex-row gap-3">
            <Pressable
              className="flex-1 items-center rounded-[20px] px-4 py-3"
              style={{ backgroundColor: palette.background, opacity: index === 0 ? 0.45 : 1 }}
              onPress={() => moveDashboardWidget(widget, "up")}
              disabled={index === 0}
            >
              <Text style={{ color: palette.primary }}>Move Up</Text>
            </Pressable>
            <Pressable
              className="flex-1 items-center rounded-[20px] px-4 py-3"
              style={{ backgroundColor: palette.background, opacity: index === dashboardWidgetOrder.length - 1 ? 0.45 : 1 }}
              onPress={() => moveDashboardWidget(widget, "down")}
              disabled={index === dashboardWidgetOrder.length - 1}
            >
              <Text style={{ color: palette.primary }}>Move Down</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScreenContainer>
  );
};
