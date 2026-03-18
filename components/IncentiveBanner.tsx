import { Text, View } from "react-native";

import { cardStyles } from "@/theme";
import { useAppPalette } from "@/theme/useAppPalette";

interface IncentiveBannerProps {
  streak: number;
  message: string;
}

export const IncentiveBanner = ({ streak, message }: IncentiveBannerProps) => {
  const palette = useAppPalette();
  return (
    <View
      className="mb-6 items-center rounded-card px-6 py-7"
      style={[cardStyles, { backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }]}
    >
      <Text className="text-xs uppercase tracking-[1.5px]" style={{ color: palette.muted }}>Momentum</Text>
      <Text className="mt-3 font-serif text-[32px]" style={{ color: palette.primary }}>{streak}-class streak</Text>
      <Text className="mt-3 max-w-[300px] text-center text-sm leading-6" style={{ color: palette.muted }}>{message}</Text>
    </View>
  );
};
