import { View, Text } from "react-native";
import { useAppPalette } from "@/theme/useAppPalette";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export const SectionHeader = ({ title, subtitle, centered = false }: SectionHeaderProps) => {
  const palette = useAppPalette();

  return (
    <View className={`mb-5 ${centered ? "items-center" : ""}`}>
      <Text className={`font-serif text-[30px] ${centered ? "text-center" : ""}`} style={{ color: palette.primary }}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          className={`mt-2 max-w-[360px] text-sm leading-6 ${centered ? "text-center" : ""}`}
          style={{ color: palette.muted }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};
