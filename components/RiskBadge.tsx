import { Text, View } from "react-native";

import { useAppPalette } from "@/theme/useAppPalette";
import { RiskLevel } from "@/utils/types";

export const RiskBadge = ({ risk }: { risk: RiskLevel }) => {
  const palette = useAppPalette();
  const backgroundByRisk = {
    safe: `${palette.secondary}33`,
    warning: `${palette.accent}33`,
    critical: `${palette.critical}33`
  } as const;
  const textByRisk = {
    safe: palette.success,
    warning: palette.warning,
    critical: palette.critical
  } as const;

  return (
    <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: backgroundByRisk[risk] }}>
      <Text className="text-[11px] capitalize" style={{ color: textByRisk[risk] }}>
        {risk}
      </Text>
    </View>
  );
};
