import { Text, View } from "react-native";

import { cardStyles } from "@/theme";
import { useAppPalette } from "@/theme/useAppPalette";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
}

export const StatCard = ({ label, value, hint }: StatCardProps) => {
  const palette = useAppPalette();
  return (
    <View
      className="mr-3 flex-1 rounded-card p-4"
      style={[cardStyles, { backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }]}
    >
      <Text className="text-xs uppercase tracking-[1.5px]" style={{ color: palette.muted }}>{label}</Text>
      <Text className="mt-3 font-serif text-2xl" style={{ color: palette.primary }}>{value}</Text>
      {hint ? <Text className="mt-2 text-sm" style={{ color: palette.muted }}>{hint}</Text> : null}
    </View>
  );
};
