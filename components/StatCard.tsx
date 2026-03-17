import { Text, View } from "react-native";

import { cardStyles } from "@/theme";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
}

export const StatCard = ({ label, value, hint }: StatCardProps) => (
  <View className="mr-3 flex-1 rounded-card border border-border bg-surface p-4" style={cardStyles}>
    <Text className="text-xs uppercase tracking-[1.5px] text-muted">{label}</Text>
    <Text className="mt-3 font-serif text-2xl text-primary">{value}</Text>
    {hint ? <Text className="mt-2 text-sm text-muted">{hint}</Text> : null}
  </View>
);
