import { Pressable, Text, View } from "react-native";

import { useAppPalette } from "@/theme/useAppPalette";

type Option = string | { value: string; label: string };

interface SegmentedProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

// iOS segmented control — sunken track, raised active thumb with soft shadow.
export const Segmented = ({ options, value, onChange }: SegmentedProps) => {
  const palette = useAppPalette();
  return (
    <View
      className="flex-row rounded-[14px] p-[3px]"
      style={{ backgroundColor: palette.paper2, borderWidth: 1, borderColor: palette.hairline }}
    >
      {options.map((option) => {
        const v = typeof option === "string" ? option : option.value;
        const label = typeof option === "string" ? option : option.label;
        const on = v === value;
        return (
          <Pressable
            key={v}
            onPress={() => onChange(v)}
            className="flex-1 items-center rounded-[11px] py-2"
            style={
              on
                ? {
                    backgroundColor: palette.card,
                    shadowColor: palette.forestDeep,
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    shadowOffset: { width: 0, height: 1 },
                    elevation: 2
                  }
                : undefined
            }
          >
            <Text className="text-[13.5px]" style={{ color: on ? palette.ink : palette.ink3, fontFamily: "Outfit_700Bold" }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
