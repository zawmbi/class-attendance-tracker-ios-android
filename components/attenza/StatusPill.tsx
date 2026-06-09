import { Text, View } from "react-native";

import { Icon, IconName } from "@/components/Icon";
import { useAppPalette } from "@/theme/useAppPalette";

export type AttenzaStatus = "present" | "late" | "absent" | "excused";

interface StatusPillProps {
  status?: AttenzaStatus;
  size?: "sm" | "md";
}

// Status is never color-only — always icon + label (a11y).
export const StatusPill = ({ status = "present", size = "md" }: StatusPillProps) => {
  const palette = useAppPalette();
  const map: Record<AttenzaStatus, { icon: IconName; label: string; c: string; bg: string }> = {
    present: { icon: "present", label: "Present", c: palette.present, bg: palette.presentSoft },
    late: { icon: "late", label: "Late", c: palette.late, bg: palette.lateSoft },
    absent: { icon: "absent", label: "Absent", c: palette.absent, bg: palette.absentSoft },
    excused: { icon: "excused", label: "Excused", c: palette.excused, bg: palette.excusedSoft }
  };
  const s = map[status];
  const sm = size === "sm";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: sm ? 4 : 6,
        paddingVertical: sm ? 3 : 5,
        paddingLeft: sm ? 7 : 9,
        paddingRight: sm ? 9 : 12,
        borderRadius: 9999,
        backgroundColor: s.bg,
        alignSelf: "flex-start"
      }}
    >
      <Icon name={s.icon} size={sm ? 13 : 16} color={s.c} stroke={2} label={s.label} />
      <Text style={{ color: s.c, fontFamily: "Outfit_700Bold", fontSize: sm ? 12 : 13.5 }}>{s.label}</Text>
    </View>
  );
};
