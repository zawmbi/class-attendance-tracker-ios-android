import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { useAppPalette } from "@/theme/useAppPalette";

interface StepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}

// − / value / + stepper; value rendered in the Fraunces display serif.
export const Stepper = ({ label, value, onChange, min = 0, max = 20, suffix = "" }: StepperProps) => {
  const palette = useAppPalette();
  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  const Button = ({ icon, delta }: { icon: "plus" | "absent"; delta: number }) => {
    const disabled = clamp(value + delta) === value;
    return (
      <Pressable
        onPress={() => onChange(clamp(value + delta))}
        disabled={disabled}
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: palette.paper2, opacity: disabled ? 0.4 : 1 }}
      >
        <Icon name={icon} size={18} color={palette.forest} stroke={2.4} />
      </Pressable>
    );
  };

  return (
    <View className="flex-row items-center justify-between">
      <Text className="flex-1 text-[15px]" style={{ color: palette.ink, fontFamily: "Outfit_600SemiBold" }}>
        {label}
      </Text>
      <View className="flex-row items-center gap-3">
        <Button icon="absent" delta={-1} />
        <Text
          className="min-w-[40px] text-center text-[22px]"
          style={{ color: palette.forest, fontFamily: "Fraunces_600SemiBold", fontVariant: ["tabular-nums"] }}
        >
          {value}
          {suffix}
        </Text>
        <Button icon="plus" delta={1} />
      </View>
    </View>
  );
};
