import { Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { cardStyles } from "@/theme";
import { MotivationInsight } from "@/utils/types";

const toneBorder = {
  streak: "#2F5D50",
  recovery: "#A3B18A",
  risk: "#D4A373",
  steady: "#6B7C72",
  support: "#D9D0C1"
} as const;

export const MotivationPanel = ({ insights }: { insights: MotivationInsight[] }) => (
  <View>
    {insights.map((insight, index) => (
      <Animated.View
        key={insight.title}
        entering={FadeInUp.delay(index * 60).springify()}
        className="mb-4 items-center rounded-card border bg-surface px-6 py-6"
        style={[cardStyles, { borderColor: toneBorder[insight.tone] }]}
      >
        <Text className="font-serif text-2xl text-primary">{insight.title}</Text>
        <Text className="mt-3 max-w-[300px] text-center text-sm leading-6 text-muted">{insight.message}</Text>
      </Animated.View>
    ))}
  </View>
);
