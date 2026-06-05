import { useMemo } from "react";
import { Link, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";

import { Icon } from "@/components/Icon";
import { Meter } from "@/components/attenza/Meter";
import { Sparkline } from "@/components/attenza/Sparkline";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useUserStore } from "@/store/userStore";
import { useAppPalette } from "@/theme/useAppPalette";
import { getOverallWeeklyTrend } from "@/utils/attendance";
import { deriveClass, riskTone } from "@/utils/attenza";

const HEAT_WEEKS = 12;
const WEEKDAYS = ["M", "T", "W", "T", "F"];

// Monday-anchored Mon–Fri × N-week grid of the dominant status per day.
// 0 none · 1 absent · 2 late · 3 present
const buildHeatmap = (records: { date: string; status: string }[]) => {
  const now = new Date();
  const monday = new Date(now);
  const dow = (now.getDay() + 6) % 7; // 0 = Monday
  monday.setDate(now.getDate() - dow - (HEAT_WEEKS - 1) * 7);

  const byDate = new Map<string, string[]>();
  records.forEach((r) => {
    const list = byDate.get(r.date) ?? [];
    list.push(r.status);
    byDate.set(r.date, list);
  });

  const weeks: number[][] = [];
  for (let w = 0; w < HEAT_WEEKS; w += 1) {
    const row: number[] = [];
    for (let d = 0; d < 5; d += 1) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + w * 7 + d);
      const iso = day.toISOString().slice(0, 10);
      const statuses = byDate.get(iso) ?? [];
      if (statuses.includes("absent")) row.push(1);
      else if (statuses.includes("late")) row.push(2);
      else if (statuses.includes("present")) row.push(3);
      else row.push(0);
    }
    weeks.push(row);
  }
  return weeks;
};

export const InsightsScreen = () => {
  const palette = useAppPalette();
  const router = useRouter();
  const { classes, records, settings } = useAttendanceStore();
  const isPremium = useUserStore((s) => s.isPremium);

  const derived = useMemo(() => classes.map((c) => deriveClass(c, records, settings)), [classes, records, settings]);
  const sorted = useMemo(() => derived.slice().sort((a, b) => a.buffer - b.buffer), [derived]);
  const worst = sorted[0];
  const overall = derived.length ? Math.round(derived.reduce((s, c) => s + c.pct, 0) / derived.length) : 100;

  const trend = useMemo(() => getOverallWeeklyTrend(classes, records, settings), [classes, records, settings]);
  const trendData = trend.map((t) => t.percentage);
  const delta = trendData.length >= 2 ? trendData[trendData.length - 1] - trendData[0] : 0;

  const heat = useMemo(() => buildHeatmap(records), [records]);
  const heatColor = (v: number) =>
    v === 0 ? palette.hairline : v === 1 ? palette.absent : v === 2 ? palette.late : palette.present;

  return (
    <ScreenContainer wideMaxWidth={720}>
      <View className="mb-4">
        <Text className="text-[13px] tracking-[1.5px]" style={{ color: palette.goldDeep, fontFamily: "Outfit_800ExtraBold" }}>
          YOUR PATTERNS
        </Text>
        <Text className="text-[32px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
          Insights
        </Text>
      </View>

      {/* Overall + trend */}
      <View
        className="mb-4 flex-row items-center gap-4 rounded-[22px] p-4"
        style={{
          backgroundColor: palette.card,
          borderWidth: 1,
          borderColor: palette.hairline,
          shadowColor: palette.forestDeep,
          shadowOpacity: 0.1,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 3
        }}
      >
        <View className="items-center">
          <View className="flex-row items-end">
            <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 50, lineHeight: 50, color: palette.forest, fontVariant: ["tabular-nums"] }}>
              {overall}
            </Text>
            <Text style={{ fontFamily: "Fraunces_500Medium", fontSize: 22, color: palette.ink3, marginBottom: 5 }}>%</Text>
          </View>
          <Text className="text-[12.5px]" style={{ color: palette.ink2, fontFamily: "Outfit_700Bold" }}>
            overall
          </Text>
        </View>
        <View className="flex-1">
          <View className="mb-1 flex-row items-center gap-1.5">
            <Icon name={delta >= 0 ? "arrowUp" : "arrowRight"} size={16} color={delta >= 0 ? palette.present : palette.late} stroke={2.4} />
            <Text className="text-[13.5px]" style={{ color: delta >= 0 ? palette.present : palette.late, fontFamily: "Outfit_700Bold" }}>
              {delta >= 0 ? "+" : ""}{delta}% vs earlier
            </Text>
          </View>
          <Sparkline data={trendData} width={170} height={48} tone={palette.forest} />
          <Text className="mt-0.5 text-[11.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
            {trendData.length}-week trend
          </Text>
        </View>
      </View>

      {/* Forecast teaser */}
      {isPremium ? (
        <Pressable
          onPress={() => router.push("/(tabs)/analytics")}
          className="mb-5 overflow-hidden rounded-[22px] p-4"
          style={{ shadowColor: palette.forestDeep, shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 12 }, elevation: 6 }}
        >
          <Svg style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="fcGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={palette.forest} />
                <Stop offset="1" stopColor={palette.forestDeep} />
              </LinearGradient>
              <RadialGradient id="fcGlow" cx="85%" cy="0%" r="60%">
                <Stop offset="0" stopColor={palette.gold} stopOpacity={0.22} />
                <Stop offset="1" stopColor={palette.gold} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#fcGrad)" />
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#fcGlow)" />
          </Svg>
          <View className="flex-row items-center gap-3">
            <View
              className="h-11 w-11 items-center justify-center rounded-[13px]"
              style={{ backgroundColor: palette.gold }}
            >
              <Icon name="chart" size={24} color="#fff" stroke={2} />
            </View>
            <View className="flex-1">
              <Text className="text-[16px]" style={{ color: "#fff", fontFamily: "Outfit_800ExtraBold" }}>
                End-of-term Forecast
              </Text>
              <Text className="text-[13px]" style={{ color: palette.onGradient, opacity: 0.85, fontFamily: "Outfit_600SemiBold" }}>
                Projections, what-if & deep patterns
              </Text>
            </View>
            <Icon name="chevron" size={20} color={palette.gold} stroke={2.4} />
          </View>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => router.push("/premium")}
          className="mb-5 overflow-hidden rounded-[22px] p-4"
          style={{ shadowColor: palette.forestDeep, shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 12 }, elevation: 6 }}
        >
          <Svg style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="fcGradLocked" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={palette.forestDeep} />
                <Stop offset="1" stopColor={palette.forestDeep} />
              </LinearGradient>
              <RadialGradient id="fcGlowLocked" cx="85%" cy="0%" r="60%">
                <Stop offset="0" stopColor={palette.gold} stopOpacity={0.22} />
                <Stop offset="1" stopColor={palette.gold} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#fcGradLocked)" />
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#fcGlowLocked)" />
          </Svg>
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-[13px]" style={{ backgroundColor: palette.gold }}>
              <Icon name="chart" size={24} color="#fff" stroke={2} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-[16px]" style={{ color: "#fff", fontFamily: "Outfit_800ExtraBold" }}>
                  End-of-term Forecast
                </Text>
                <Icon name="lock" size={14} color={palette.gold} stroke={2.2} />
              </View>
              <Text className="text-[13px]" style={{ color: palette.onGradient, opacity: 0.85, fontFamily: "Outfit_600SemiBold" }}>
                Projections, what-if & deep patterns
              </Text>
            </View>
            <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: palette.gold }}>
              <Text className="text-[11px] tracking-[0.5px]" style={{ color: palette.forestDeep, fontFamily: "Outfit_800ExtraBold" }}>
                PREMIUM
              </Text>
            </View>
          </View>
          <View className="mt-3.5 flex-row items-center justify-center gap-1.5">
            <Text className="text-[13.5px]" style={{ color: palette.gold, fontFamily: "Outfit_800ExtraBold" }}>
              Unlock with Premium
            </Text>
            <Icon name="chevron" size={15} color={palette.gold} stroke={2.4} />
          </View>
        </Pressable>
      )}

      {/* What to prioritize */}
      {worst ? (
        <>
          <Text className="mb-2 text-[22px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
            What to prioritize
          </Text>
          <Link href={`/class/${worst.classItem.id}`} asChild>
            <Pressable
              className="mb-5 flex-row items-center gap-3 overflow-hidden rounded-[22px] p-4"
              style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline, borderLeftWidth: 4, borderLeftColor: riskTone(worst.risk, palette) }}
            >
              <View className="flex-1">
                <Text className="text-[16px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
                  {worst.classItem.name}
                </Text>
                <Text className="mt-0.5 text-[13.5px]" style={{ color: palette.ink2, fontFamily: "Outfit_600SemiBold" }}>
                  {worst.buffer === 0 ? "No buffer left — protect every class" : `${worst.buffer} classes of buffer left`}
                </Text>
              </View>
              <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 26, color: riskTone(worst.risk, palette), fontVariant: ["tabular-nums"] }}>
                {worst.pct}%
              </Text>
            </Pressable>
          </Link>
        </>
      ) : null}

      {/* Consistency heatmap */}
      <View className="mb-2 flex-row items-end justify-between">
        <Text className="text-[22px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
          Consistency
        </Text>
        <Text className="text-[13px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
          {HEAT_WEEKS} weeks
        </Text>
      </View>
      <View className="mb-5 rounded-[22px] p-4" style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}>
        <View className="flex-row justify-between" style={{ gap: 5 }}>
          {WEEKDAYS.map((d, col) => (
            <View key={col} className="flex-1">
              <View style={{ gap: 5 }}>
                {heat.map((week, w) => (
                  <View
                    key={w}
                    style={{ aspectRatio: 1, borderRadius: 5, backgroundColor: heatColor(week[col]), opacity: week[col] === 0 ? 0.5 : 0.92 }}
                  />
                ))}
              </View>
              <Text className="mt-1.5 text-center text-[11px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
                {d}
              </Text>
            </View>
          ))}
        </View>
        <View className="mt-3.5 flex-row justify-center gap-3.5">
          {([
            ["present", "Present", palette.present],
            ["late", "Late", palette.late],
            ["absent", "Absent", palette.absent]
          ] as const).map(([key, label, c]) => (
            <View key={key} className="flex-row items-center gap-1.5">
              <View className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: c }} />
              <Text className="text-[11.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* By class */}
      <Text className="mb-2 text-[22px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
        By class
      </Text>
      <View className="gap-2.5">
        {sorted.map((c) => (
          <Link key={c.classItem.id} href={`/class/${c.classItem.id}`} asChild>
            <Pressable
              className="flex-row items-center gap-3 rounded-[18px] p-3.5"
              style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}
            >
              <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.classItem.color }} />
              <View className="flex-1">
                <Text numberOfLines={1} className="mb-1.5 text-[14.5px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
                  {c.classItem.name}
                </Text>
                <Meter value={c.pct / 100} tone={riskTone(c.risk, palette)} height={7} />
              </View>
              <Text style={{ fontFamily: "Outfit_800ExtraBold", fontSize: 15, color: palette.ink, fontVariant: ["tabular-nums"] }}>
                {c.pct}%
              </Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScreenContainer>
  );
};
