import { Pressable, Text, View } from "react-native";

import { cardStyles } from "@/theme";

interface PremiumFeatureCardProps {
  title: string;
  description: string;
  onPress: () => void;
}

export const PremiumFeatureCard = ({ title, description, onPress }: PremiumFeatureCardProps) => (
  <View className="rounded-card border border-border bg-surface p-5" style={cardStyles}>
    <Text className="text-xs uppercase tracking-[1.5px] text-muted">Premium</Text>
    <Text className="mt-3 font-serif text-2xl text-primary">{title}</Text>
    <Text className="mt-2 text-sm leading-6 text-muted">{description}</Text>
    <Pressable className="mt-5 self-start rounded-full bg-primary px-4 py-3" onPress={onPress}>
      <Text className="text-background">Unlock premium</Text>
    </Pressable>
  </View>
);
