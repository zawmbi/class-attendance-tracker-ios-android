import { Text, View } from "react-native";

import { RiskLevel } from "@/utils/types";

const riskStyles: Record<RiskLevel, string> = {
  safe: "bg-primary/10",
  warning: "bg-accent/15",
  critical: "bg-critical/10"
};

const textStyles: Record<RiskLevel, string> = {
  safe: "text-primary",
  warning: "text-warning",
  critical: "text-critical"
};

export const RiskBadge = ({ risk }: { risk: RiskLevel }) => (
  <View className={`rounded-full px-3 py-1.5 ${riskStyles[risk]}`}>
    <Text className={`text-[11px] capitalize ${textStyles[risk]}`}>{risk}</Text>
  </View>
);
