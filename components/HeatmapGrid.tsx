import { Text, View } from "react-native";

import { palette } from "@/theme";
import { useAppPalette } from "@/theme/useAppPalette";
import { HeatmapCell } from "@/utils/types";

interface HeatmapGridProps {
  cells: HeatmapCell[];
}

const getHeatColor = (value: number) => {
  if (value >= 6) return palette.primary;
  if (value >= 4) return "#5D7D67";
  if (value >= 2) return palette.secondary;
  if (value >= 1) return "#D9C8A4";
  return "#EDE5D7";
};

export const HeatmapGrid = ({ cells }: HeatmapGridProps) => {
  const activePalette = useAppPalette();
  return (
    <View className="rounded-card p-5" style={{ backgroundColor: activePalette.surface, borderColor: activePalette.border, borderWidth: 1 }}>
      <Text className="font-serif text-xl" style={{ color: activePalette.primary }}>Attendance heatmap</Text>
      <Text className="mt-2 text-sm" style={{ color: activePalette.muted }}>Brighter cells mark stronger attendance activity.</Text>
      <View className="mt-5 flex-row flex-wrap">
        {cells.map((cell) => (
          <View
            key={cell.key}
            className="m-1 h-8 w-8 rounded-lg"
            style={{ backgroundColor: getHeatColor(cell.value) }}
          />
        ))}
      </View>
    </View>
  );
};
