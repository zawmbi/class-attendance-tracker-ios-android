import { Pressable, View } from "react-native";

import { useAppPalette } from "@/theme/useAppPalette";

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const Toggle = ({ value, onChange }: ToggleProps) => {
  const palette = useAppPalette();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={{ width: 50, height: 30, borderRadius: 99, backgroundColor: value ? palette.present : palette.hairline, justifyContent: "center" }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: "#fff",
          marginLeft: value ? 23 : 3,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2
        }}
      />
    </Pressable>
  );
};
