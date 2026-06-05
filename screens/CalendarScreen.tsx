import { useMemo, useState } from "react";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Segmented } from "@/components/attenza/Segmented";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useAppPalette } from "@/theme/useAppPalette";
import { deriveClass, riskTone } from "@/utils/attenza";
import { getMonthCells } from "@/utils/calendar";
import { formatTimeLabel, getMonthLabel } from "@/utils/date";
import { Weekday } from "@/utils/types";

const WEEK: { short: Weekday; letter: string }[] = [
  { short: "Monday", letter: "M" },
  { short: "Tuesday", letter: "T" },
  { short: "Wednesday", letter: "W" },
  { short: "Thursday", letter: "T" },
  { short: "Friday", letter: "F" }
];

const termLabel = (now: Date) => {
  const m = now.getMonth();
  const season = m <= 4 ? "Spring" : m <= 7 ? "Summer" : "Fall";
  return `${season} ${now.getFullYear()}`;
};

export const CalendarScreen = () => {
  const palette = useAppPalette();
  const { classes, records, settings } = useAttendanceStore();
  const [view, setView] = useState("Week");
  const [selected, setSelected] = useState<Weekday>("Monday");
  const now = new Date();

  // Monday-anchored dates for this week's chips.
  const weekDates = useMemo(() => {
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return WEEK.map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.getDate();
    });
  }, [now]);

  const derivedById = useMemo(() => {
    const map = new Map<string, ReturnType<typeof deriveClass>>();
    classes.forEach((c) => map.set(c.id, deriveClass(c, records, settings)));
    return map;
  }, [classes, records, settings]);

  const classesOn = (day: Weekday) =>
    classes
      .filter((c) => c.schedule.some((s) => s.day === day))
      .sort((a, b) => (a.schedule[0]?.startTime ?? "").localeCompare(b.schedule[0]?.startTime ?? ""));

  const monthCells = useMemo(() => getMonthCells(classes, now), [classes, now]);
  const overall = classes.length
    ? Math.round([...derivedById.values()].reduce((s, c) => s + c.pct, 0) / classes.length)
    : 100;
  const maxWeeks = classes.reduce((m, c) => Math.max(m, c.courseLengthWeeks), 0);

  return (
    <ScreenContainer>
      <View className="mb-4">
        <Text className="text-[13px] tracking-[1.5px]" style={{ color: palette.goldDeep, fontFamily: "Outfit_800ExtraBold" }}>
          {termLabel(now).toUpperCase()}
        </Text>
        <Text className="text-[32px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
          Calendar
        </Text>
      </View>

      <Segmented options={["Week", "Month", "Semester"]} value={view} onChange={setView} />

      {view === "Week" ? (
        <View className="mt-4">
          <View className="flex-row gap-2">
            {WEEK.map((d, i) => {
              const on = d.short === selected;
              const dots = classesOn(d.short).slice(0, 3);
              return (
                <Pressable
                  key={d.short}
                  onPress={() => setSelected(d.short)}
                  className="flex-1 items-center gap-2 rounded-[16px] pb-2.5 pt-3"
                  style={{
                    backgroundColor: on ? palette.forest : palette.card,
                    borderWidth: on ? 0 : 1,
                    borderColor: palette.hairline
                  }}
                >
                  <Text className="text-[11.5px]" style={{ color: on ? "rgba(255,255,255,0.8)" : palette.ink3, fontFamily: "Outfit_700Bold" }}>
                    {d.letter}
                  </Text>
                  <Text className="text-[18px]" style={{ color: on ? "#fff" : palette.ink, fontFamily: "Outfit_800ExtraBold", fontVariant: ["tabular-nums"] }}>
                    {weekDates[i]}
                  </Text>
                  <View className="h-1.5 flex-row gap-[3px]">
                    {dots.map((c) => (
                      <View key={c.id} className="h-[5px] w-[5px] rounded-full" style={{ backgroundColor: on ? "rgba(255,255,255,0.85)" : c.color }} />
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-4 gap-2.5">
            {classesOn(selected).length === 0 ? (
              <View className="items-center px-5 py-10">
                <View className="mb-3.5 h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: palette.paper2 }}>
                  <Icon name="today" size={30} color={palette.ink3} stroke={1.8} />
                </View>
                <Text className="text-[17px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
                  No classes
                </Text>
                <Text className="mt-0.5 text-[14px]" style={{ color: palette.ink3, fontFamily: "Outfit_500Medium" }}>
                  Enjoy your free {selected}.
                </Text>
              </View>
            ) : (
              classesOn(selected).map((c) => {
                const d = derivedById.get(c.id)!;
                return (
                  <Link key={c.id} href={`/class/${c.id}`} asChild>
                    <Pressable
                      className="flex-row items-center gap-3 rounded-[18px] p-3.5"
                      style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}
                    >
                      <Text className="w-12 text-[14px]" style={{ color: palette.ink2, fontFamily: "Outfit_800ExtraBold", fontVariant: ["tabular-nums"] }}>
                        {formatTimeLabel(c.schedule.find((s) => s.day === selected)?.startTime ?? c.schedule[0]?.startTime ?? "09:00")}
                      </Text>
                      <View className="h-9 w-1 rounded-full" style={{ backgroundColor: c.color }} />
                      <View className="flex-1">
                        <Text numberOfLines={1} className="text-[15.5px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
                          {c.name}
                        </Text>
                        <Text className="text-[13px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
                          Room {c.room}
                        </Text>
                      </View>
                      <Text style={{ color: riskTone(d.risk, palette), fontFamily: "Outfit_800ExtraBold", fontSize: 14, fontVariant: ["tabular-nums"] }}>
                        {d.pct}%
                      </Text>
                    </Pressable>
                  </Link>
                );
              })
            )}
          </View>
        </View>
      ) : null}

      {view === "Month" ? (
        <View className="mt-4 rounded-[22px] p-4" style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}>
          <Text className="mb-3 text-[20px]" style={{ color: palette.ink, fontFamily: "Fraunces_600SemiBold" }}>
            {getMonthLabel(now)}
          </Text>
          <View className="flex-row">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <Text key={i} className="flex-1 text-center text-[11px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
                {d}
              </Text>
            ))}
          </View>
          <View className="mt-1.5 flex-row flex-wrap">
            {monthCells.map((cell) => (
              <View key={cell.key} style={{ width: `${100 / 7}%`, padding: 3 }}>
                <View
                  className="items-center justify-center rounded-[9px]"
                  style={{ aspectRatio: 1, backgroundColor: cell.inMonth ? palette.paper2 : "transparent" }}
                >
                  {cell.inMonth ? (
                    <>
                      <Text className="text-[12.5px]" style={{ color: palette.ink2, fontFamily: "Outfit_700Bold", fontVariant: ["tabular-nums"] }}>
                        {cell.dayNumber}
                      </Text>
                      {cell.sessions.length > 0 ? (
                        <View className="mt-0.5 h-[5px] w-[5px] rounded-full" style={{ backgroundColor: cell.sessions[0].color }} />
                      ) : null}
                    </>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {view === "Semester" ? (
        <View className="mt-4 gap-3">
          <View className="flex-row gap-3 rounded-[22px] p-4" style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}>
            {([
              [String(maxWeeks || 16), "weeks"],
              [String(classes.length), "classes"],
              [`${overall}%`, "overall"]
            ] as const).map(([v, l]) => (
              <View key={l} className="flex-1 items-center">
                <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 28, color: palette.forest, fontVariant: ["tabular-nums"] }}>{v}</Text>
                <Text className="text-[12px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
                  {l}
                </Text>
              </View>
            ))}
          </View>
          <View className="rounded-[22px] p-4" style={{ backgroundColor: palette.goldSoft, borderWidth: 1, borderColor: palette.hairline }}>
            <View className="mb-1.5 flex-row items-center gap-2">
              <Icon name="target" size={18} color={palette.goldDeep} stroke={2} />
              <Text className="text-[14.5px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
                Finals stretch
              </Text>
            </View>
            <Text className="text-[14.5px] leading-[21px]" style={{ color: palette.ink2, fontFamily: "Outfit_500Medium" }}>
              Keep your current pace through the rest of term and you&apos;ll finish on track. Steady check-ins protect your buffer.
            </Text>
          </View>
        </View>
      ) : null}
    </ScreenContainer>
  );
};
