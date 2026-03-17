import { View, Text } from "react-native";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export const SectionHeader = ({ title, subtitle, centered = false }: SectionHeaderProps) => (
  <View className={`mb-5 ${centered ? "items-center" : ""}`}>
    <Text className={`font-serif text-[30px] text-primary ${centered ? "text-center" : ""}`}>{title}</Text>
    {subtitle ? (
      <Text className={`mt-2 max-w-[360px] text-sm leading-6 text-muted ${centered ? "text-center" : ""}`}>
        {subtitle}
      </Text>
    ) : null}
  </View>
);
