import { Pressable, Text } from "react-native";

import { AttendanceStatus } from "@/utils/types";

const tones: Record<AttendanceStatus, { container: string; text: string }> = {
  present: { container: "bg-primary/10", text: "text-primary" },
  late: { container: "bg-accent/15", text: "text-warning" },
  absent: { container: "bg-critical/10", text: "text-critical" },
  excused: { container: "bg-muted/10", text: "text-muted" }
};

interface RecordStatusPillProps {
  status: AttendanceStatus;
  onPress?: () => void;
}

export const RecordStatusPill = ({ status, onPress }: RecordStatusPillProps) => (
  <Pressable onPress={onPress} disabled={!onPress} className={`rounded-full px-3 py-1.5 ${tones[status].container}`}>
    <Text className={`text-xs uppercase tracking-[1.5px] ${tones[status].text}`}>{status}</Text>
  </Pressable>
);
