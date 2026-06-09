import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

import { Icon, IconName } from "@/components/Icon";
import { Burst } from "@/components/attenza/Burst";
import { Meter } from "@/components/attenza/Meter";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useAppPalette } from "@/theme/useAppPalette";
import { formatTimeLabel, isClassToday } from "@/utils/date";
import { XP_PER_STATUS } from "@/utils/gamification";
import { AttendanceStatus } from "@/utils/types";

type CheckInStatus = "present" | "late" | "absent";

const STATUS_BUTTONS: { status: CheckInStatus; icon: IconName; label: string }[] = [
  { status: "present", icon: "present", label: "Present" },
  { status: "late", icon: "late", label: "Late" },
  { status: "absent", icon: "absent", label: "Absent" }
];

// "+XP" numeral that floats up and fades on each log, per the handoff.
const XpFloat = ({ amount, trigger }: { amount: number; trigger: number }) => {
  const palette = useAppPalette();
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = 0;
    t.value = withTiming(1, { duration: reduceMotion ? 160 : 1100, easing: Easing.bezier(0.22, 1, 0.36, 1) });
  }, [trigger, t, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.15 ? t.value / 0.15 : 1 - (t.value - 0.15) / 0.85,
    transform: [{ translateY: reduceMotion ? 0 : -34 * t.value }]
  }));

  if (!trigger) {
    return null;
  }
  return (
    <Animated.View pointerEvents="none" style={[{ position: "absolute", top: 8, right: 14 }, style]}>
      <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 22, color: palette.goldDeep }}>+{amount}</Text>
    </Animated.View>
  );
};

export const QuickCheckInScreen = () => {
  const palette = useAppPalette();
  const router = useRouter();
  const { classes, records, markAttendance, clearAttendanceForDate } = useAttendanceStore();
  const today = new Date().toISOString().slice(0, 10);
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());

  const todaysClasses = useMemo(() => classes.filter((c) => isClassToday(c.schedule)), [classes]);
  const checkInClasses = todaysClasses.length > 0 ? todaysClasses : classes;

  const [burst, setBurst] = useState(0);
  const [gain, setGain] = useState<{ id: string; amount: number; nonce: number } | null>(null);

  const statusFor = (classId: string): AttendanceStatus | undefined =>
    records.find((r) => r.classId === classId && r.date === today)?.status;

  const logged = checkInClasses.filter((c) => statusFor(c.id)).length;
  const allDone = checkInClasses.length > 0 && logged === checkInClasses.length;
  const xpToday = checkInClasses.reduce((sum, c) => {
    const s = statusFor(c.id);
    return sum + (s ? XP_PER_STATUS[s] : 0);
  }, 0);

  const handle = (classId: string, current: AttendanceStatus | undefined, next: CheckInStatus) => {
    if (current === next) {
      clearAttendanceForDate(classId, today);
      return;
    }
    markAttendance(classId, next);
    const amount = XP_PER_STATUS[next];
    if (amount > 0) {
      setGain({ id: classId, amount, nonce: Date.now() });
      setTimeout(() => setGain((g) => (g?.id === classId ? null : g)), 1150);
    }
    if (next === "present") {
      setBurst((b) => b + 1);
    }
  };

  return (
    <ScreenContainer wideMaxWidth={720}>
      <Burst trigger={burst} />

      {/* Header */}
      <View className="mb-4 flex-row items-start justify-between">
        <View>
          <Text className="text-[13px] tracking-[1.5px]" style={{ color: palette.goldDeep, fontFamily: "Outfit_800ExtraBold" }}>
            QUICK CHECK-IN
          </Text>
          <Text className="mt-0.5 text-[28px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
            {weekday}
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Close"
          onPress={() => router.navigate("/(tabs)/dashboard")}
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}
        >
          <Icon name="close" size={20} color={palette.ink2} />
        </Pressable>
      </View>

      {/* Progress */}
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-[13.5px]" style={{ color: palette.ink2, fontFamily: "Outfit_700Bold" }}>
          {logged} of {checkInClasses.length} logged
        </Text>
        <Text className="text-[13.5px]" style={{ color: palette.forest, fontFamily: "Outfit_700Bold", fontVariant: ["tabular-nums"] }}>
          +{xpToday} XP today
        </Text>
      </View>
      <Meter value={checkInClasses.length ? logged / checkInClasses.length : 0} tone={palette.forest} height={9} />

      {/* All caught up */}
      {allDone ? (
        <View className="mt-4 gap-3">
          <View
            className="flex-row items-center gap-3.5 overflow-hidden rounded-[22px] p-4"
            style={{ backgroundColor: palette.forestSoft }}
          >
            <View
              className="h-12 w-12 items-center justify-center rounded-full"
              style={{
                backgroundColor: palette.gold,
                shadowColor: palette.goldDeep,
                shadowOpacity: 0.4,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
                elevation: 4
              }}
            >
              <Icon name="laurel" size={26} color="#fff" stroke={2} />
            </View>
            <View className="flex-1">
              <Text className="text-[16.5px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
                All caught up!
              </Text>
              <Text className="text-[13.5px]" style={{ color: palette.ink2, fontFamily: "Outfit_600SemiBold" }}>
                Every class logged today. See where you&apos;re headed.
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.navigate("/(tabs)/analytics")}
            className="flex-row items-center justify-center gap-2 rounded-[18px] py-3.5"
            style={{ backgroundColor: palette.forest }}
          >
            <Icon name="chart" size={19} color={palette.onGradient} stroke={2.2} />
            <Text style={{ color: palette.onGradient, fontFamily: "Outfit_800ExtraBold", fontSize: 15 }}>
              See your forecast
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* Class cards */}
      <View className="mt-4 gap-3">
        {checkInClasses.map((c) => {
          const current = statusFor(c.id);
          const [clock, meridiem] = formatTimeLabel(c.schedule[0]?.startTime ?? "09:00").split(" ");
          return (
            <View
              key={c.id}
              className="overflow-hidden rounded-[22px] p-4"
              style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}
            >
              {gain?.id === c.id ? <XpFloat amount={gain.amount} trigger={gain.nonce} /> : null}
              <View className="mb-3.5 flex-row items-center gap-3">
                <View
                  className="h-11 w-11 items-center justify-center rounded-[16px]"
                  style={{ backgroundColor: c.color }}
                >
                  <Text style={{ color: "#fff", fontFamily: "Outfit_800ExtraBold", fontSize: 13, lineHeight: 15, fontVariant: ["tabular-nums"] }}>
                    {clock}
                  </Text>
                  {meridiem ? (
                    <Text style={{ color: "#fff", fontFamily: "Outfit_700Bold", fontSize: 8, lineHeight: 9, opacity: 0.9 }}>
                      {meridiem}
                    </Text>
                  ) : null}
                </View>
                <View className="flex-1">
                  <Text numberOfLines={1} className="text-[16px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
                    {c.name}
                  </Text>
                  <Text className="text-[13px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
                    {c.sectionLabel ? `${c.sectionLabel} · ` : ""}Room {c.room}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-2">
                {STATUS_BUTTONS.map(({ status, icon, label }) => {
                  const on = current === status;
                  const tone = status === "present" ? palette.present : status === "late" ? palette.late : palette.absent;
                  const soft = status === "present" ? palette.presentSoft : status === "late" ? palette.lateSoft : palette.absentSoft;
                  return (
                    <Pressable
                      key={status}
                      onPress={() => handle(c.id, current, status)}
                      className="flex-1 items-center gap-1 rounded-[16px] py-3"
                      style={{
                        borderWidth: 1.5,
                        borderColor: on ? tone : palette.hairline,
                        backgroundColor: on ? soft : palette.card2
                      }}
                    >
                      <Icon name={icon} size={23} color={on ? tone : palette.ink3} stroke={2} label={label} />
                      <Text className="text-[12.5px]" style={{ color: on ? tone : palette.ink2, fontFamily: "Outfit_700Bold" }}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    </ScreenContainer>
  );
};
