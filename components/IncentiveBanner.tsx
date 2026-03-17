import { Text, View } from "react-native";

import { cardStyles } from "@/theme";

interface IncentiveBannerProps {
  streak: number;
  message: string;
}

export const IncentiveBanner = ({ streak, message }: IncentiveBannerProps) => (
  <View className="mb-6 items-center rounded-card border border-border bg-surface px-6 py-7" style={cardStyles}>
    <Text className="text-xs uppercase tracking-[1.5px] text-muted">Incentive System</Text>
    <Text className="mt-3 font-serif text-[32px] text-primary">{streak}-class streak</Text>
    <Text className="mt-3 max-w-[300px] text-center text-sm leading-6 text-muted">{message}</Text>
  </View>
);
