import { Pressable, Text, View } from "react-native";

import { cardStyles } from "@/theme";
import { useAppPalette } from "@/theme/useAppPalette";

interface PremiumFeatureCardProps {
  title: string;
  description: string;
  onPress: () => void;
}

export const PremiumFeatureCard = ({ title, description, onPress }: PremiumFeatureCardProps) => {
  const palette = useAppPalette();
  return (
    <View
      className="rounded-card p-5"
      style={[cardStyles, { backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }]}
    >
      <Text className="text-xs uppercase tracking-[1.5px]" style={{ color: palette.muted }}>Premium</Text>
      <Text className="mt-3 font-serif text-2xl" style={{ color: palette.primary }}>{title}</Text>
      <Text className="mt-2 text-sm leading-6" style={{ color: palette.muted }}>{description}</Text>
      <Pressable className="mt-5 self-start rounded-full px-4 py-3" style={{ backgroundColor: palette.primary }} onPress={onPress}>
        <Text style={{ color: palette.background }}>Unlock premium</Text>
      </Pressable>
    </View>
  );
};
