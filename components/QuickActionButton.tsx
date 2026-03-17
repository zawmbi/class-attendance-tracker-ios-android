import { Pressable, Text } from "react-native";

interface QuickActionButtonProps {
  label: string;
  tone: "present" | "late" | "absent";
  onPress: () => void;
}

const toneClasses = {
  present: {
    container: "bg-primary",
    text: "text-background"
  },
  late: {
    container: "bg-accent",
    text: "text-primary"
  },
  absent: {
    container: "bg-critical/90",
    text: "text-background"
  }
} as const;

export const QuickActionButton = ({ label, tone, onPress }: QuickActionButtonProps) => (
  <Pressable className={`min-h-[72px] flex-1 items-center justify-center rounded-[24px] px-3 py-4 ${toneClasses[tone].container}`} onPress={onPress}>
    <Text className={`font-serif text-[20px] ${toneClasses[tone].text}`}>{label}</Text>
  </Pressable>
);
