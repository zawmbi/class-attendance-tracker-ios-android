import { useMemo, useState } from "react";
import { Link, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";

import { Icon } from "@/components/Icon";
import { Sparkline } from "@/components/attenza/Sparkline";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Segmented } from "@/components/attenza/Segmented";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useUserStore } from "@/store/userStore";
import { useAppPalette } from "@/theme/useAppPalette";
import { getOverallWeeklyTrend } from "@/utils/attendance";
import { deriveClass, RISK_META, riskTone } from "@/utils/attenza";

const HEAT_WEEKS = 12;
const WEEKDAYS = ["M", "T", "W", "T", "F"];
const HEAT_LABEL_W = 34; // left gutter for week-start labels (Weeks / Both modes)

// Monday-anchored Mon–Fri × N-week grid of the dominant status per day.
// 0 none · 1 absent · 2 late · 3 present
type HeatCell = { v: number; day: number };
type HeatWeek = { label: string; cells: HeatCell[] };

const buildHeatmap = (records: { date: string; status: string }[]): HeatWeek[] => {
  const now = new Date();
  const monday = new Date(now);
  monday.setHours(12, 0, 0, 0);
  const dow = (now.getDay() + 6) % 7; // 0 = Monday
  monday.setDate(monday.getDate() - dow - (HEAT_WEEKS - 1) * 7);

  const byDate = new Map<string, string[]>();
  records.forEach((r) => {
    const list = byDate.get(r.date) ?? [];
    list.push(r.status);
    byDate.set(r.date, list);
  });

  const monthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  const weeks: HeatWeek[] = [];
  for (let w = 0; w < HEAT_WEEKS; w += 1) {
    const cells: HeatCell[] = [];
    let weekStart: Date | null = null;
    for (let d = 0; d < 5; d += 1) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + w * 7 + d);
      if (d === 0) weekStart = day;
      // Local yyyy-mm-dd so keys line up with stored record dates (see parseLocalDate).
      const iso = `${day.getFullYear()}-${`${day.getMonth() + 1}`.padStart(2, "0")}-${`${day.getDate()}`.padStart(2, "0")}`;
      const statuses = byDate.get(iso) ?? [];
      let v = 0;
      if (statuses.includes("absent")) v = 1;
      else if (statuses.includes("late")) v = 2;
      else if (statuses.includes("present")) v = 3;
      cells.push({ v, day: day.getDate() });
    }
    weeks.push({ label: weekStart ? monthDay.format(weekStart) : "", cells });
  }
  return weeks;
};

// Color tile with the class initial — the shared "compact card" leading mark.
const ColorTile = ({ name, color, size = 44 }: { name: string; color: string; size?: number }) => (
  <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
    <Text style={{ color: "#fff", fontFamily: "Outfit_800ExtraBold", fontSize: size * 0.43 }}>
      {name.trim().charAt(0).toUpperCase() || "?"}
    </Text>
  </View>
);

export const InsightsScreen = () => {
  const palette = useAppPalette();
  const router = useRouter();
  const { classes, records, settings, canceledDates } = useAttendanceStore();
  const isPremium = useUserStore((s) => s.isPremium);

  const derived = useMemo(() => classes.map((c) => deriveClass(c, records, settings, canceledDates)), [classes, records, settings, canceledDates]);
  const sorted = useMemo(() => derived.slice().sort((a, b) => a.buffer - b.buffer), [derived]);
  const worst = sorted[0];
  const overall = derived.length ? Math.round(derived.reduce((s, c) => s + c.pct, 0) / derived.length) : 100;

  const trend = useMemo(() => getOverallWeeklyTrend(classes, records, settings), [classes, records, settings]);
  const trendData = trend.map((t) => t.percentage);
  const delta = trendData.length >= 2 ? trendData[trendData.length - 1] - trendData[0] : 0;

  const heat = useMemo(() => buildHeatmap(records), [records]);
  const [heatMode, setHeatMode] = useState("weeks");
  const showWeekLabels = heatMode === "weeks" || heatMode === "both";
  const showDates = heatMode === "dates" || heatMode === "both";
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
          className="mb-5 rounded-[22px] p-4"
          style={{ backgroundColor: palette.forest, shadowColor: palette.forestDeep, shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 12 }, elevation: 6 }}
        >
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
          className="mb-5 rounded-[22px] p-4"
          style={{ backgroundColor: palette.forestDeep, shadowColor: palette.forestDeep, shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 12 }, elevation: 6 }}
        >
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
              <ColorTile name={worst.classItem.name} color={worst.classItem.color} />
              <View className="flex-1">
                <Text numberOfLines={1} className="text-[16px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
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
      <View className="mb-2.5">
        <Segmented
          options={[
            { value: "weeks", label: "Weeks" },
            { value: "dates", label: "Dates" },
            { value: "both", label: "Both" }
          ]}
          value={heatMode}
          onChange={setHeatMode}
        />
      </View>
      <View className="mb-5 rounded-[22px] p-4" style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}>
        {/* Weekday header */}
        <View className="mb-1.5 flex-row" style={{ gap: 5 }}>
          {showWeekLabels ? <View style={{ width: HEAT_LABEL_W, marginRight: 5 }} /> : null}
          {WEEKDAYS.map((d, col) => (
            <View key={col} className="flex-1 items-center">
              <Text className="text-[11px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
                {d}
              </Text>
            </View>
          ))}
        </View>
        {/* One row per week */}
        {heat.map((week, w) => (
          <View key={w} className="flex-row items-center" style={{ gap: 5, marginTop: w === 0 ? 0 : 5 }}>
            {showWeekLabels ? (
              <Text
                numberOfLines={1}
                style={{ width: HEAT_LABEL_W, marginRight: 5, fontSize: 9.5, color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}
              >
                {week.label}
              </Text>
            ) : null}
            {week.cells.map((cell, col) => (
              <View
                key={col}
                className="flex-1 items-center justify-center"
                style={{ aspectRatio: 1, borderRadius: 5, backgroundColor: heatColor(cell.v), opacity: cell.v === 0 ? 0.5 : 0.92 }}
              >
                {showDates ? (
                  <Text style={{ fontSize: 9, fontFamily: "Outfit_700Bold", color: cell.v === 0 ? palette.ink3 : "#fff" }}>
                    {cell.day}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ))}
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

      {/* By course */}
      <Text className="mb-2 text-[22px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
        By course
      </Text>
      <View className="gap-2.5">
        {sorted.map((c) => (
          <Link key={c.classItem.id} href={`/class/${c.classItem.id}`} asChild>
            <Pressable
              className="flex-row items-center gap-3 rounded-[18px] p-3"
              style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}
            >
              <ColorTile name={c.classItem.name} color={c.classItem.color} />
              <View className="flex-1 pr-1">
                <Text numberOfLines={1} className="text-[16px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
                  {c.classItem.name}
                </Text>
                <Text numberOfLines={1} className="mt-0.5 text-[12.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_500Medium" }}>
                  {RISK_META[c.risk].label}
                  {c.buffer > 0 ? ` · ${c.buffer} buffer left` : ""}
                </Text>
              </View>
              <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 19, color: riskTone(c.risk, palette), fontVariant: ["tabular-nums"] }}>
                {c.pct}%
              </Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScreenContainer>
  );
};
