import { useEffect, useMemo, useState } from "react";
import { Link, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { Icon, IconName } from "@/components/Icon";
import { ForecastChart } from "@/components/attenza/ForecastChart";
import { Meter } from "@/components/attenza/Meter";
import { Segmented } from "@/components/attenza/Segmented";
import { Slider } from "@/components/attenza/Slider";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useUserStore } from "@/store/userStore";
import { useAppPalette } from "@/theme/useAppPalette";
import { useIsTwoColumn } from "@/theme/responsive";
import { getOverallWeeklyTrend, getWeeklyTrend } from "@/utils/attendance";
import { deriveClass, riskTone } from "@/utils/attenza";
import { getGamificationProfile } from "@/utils/gamification";
import { AttendanceRecord } from "@/utils/types";
import {
  WEEKDAY_LABELS,
  WEEKDAY_FULL,
  attendGrade,
  classForecast,
  monthlyMomentum,
  punctuality,
  timeOfDayBuckets,
  weekdayAbsences,
  weekdayRates
} from "@/utils/forecast";

const SectionTitle = ({ title, trailing }: { title: string; trailing?: string }) => {
  const palette = useAppPalette();
  return (
    <View className="mb-2.5 mt-5 flex-row items-end justify-between">
      <Text className="text-[20px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
        {title}
      </Text>
      {trailing ? (
        <Text className="text-[13px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
          {trailing}
        </Text>
      ) : null}
    </View>
  );
};

const card = (palette: ReturnType<typeof useAppPalette>) =>
  ({ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }) as const;

export const AnalyticsScreen = () => {
  const palette = useAppPalette();
  const router = useRouter();
  const twoCol = useIsTwoColumn();
  const { classes, records, settings, canceledDates } = useAttendanceStore();
  const isPremium = useUserStore((s) => s.isPremium);
  const markForecastViewed = useUserStore((s) => s.markForecastViewed);
  const [tab, setTab] = useState("forecast");

  // Marks the third get-started step complete the first time the forecast opens.
  useEffect(() => {
    markForecastViewed();
  }, [markForecastViewed]);
  const [attend, setAttend] = useState(85);
  const [goalPct, setGoalPct] = useState(90);
  // Forecast tab can focus a single course; "all" keeps the term-wide aggregate.
  const [courseId, setCourseId] = useState("all");

  const derived = useMemo(() => classes.map((c) => deriveClass(c, records, settings, canceledDates)), [classes, records, settings, canceledDates]);
  const profile = useMemo(() => getGamificationProfile(classes, records, settings), [classes, records, settings]);

  const focusList = useMemo(
    () => (courseId === "all" ? derived : derived.filter((c) => c.classItem.id === courseId)),
    [derived, courseId]
  );
  const focusCourse = courseId === "all" ? null : focusList[0]?.classItem ?? null;
  const isCourse = courseId !== "all" && !!focusCourse;

  const trend = useMemo(
    () =>
      isCourse && focusCourse
        ? getWeeklyTrend(focusCourse, records, settings).map((t) => t.percentage)
        : getOverallWeeklyTrend(classes, records, settings).map((t) => t.percentage),
    [isCourse, focusCourse, classes, records, settings]
  );

  const rows = useMemo(() => focusList.map((c) => classForecast(c, attend)).sort((a, b) => a.projected - b.projected), [focusList, attend]);
  const overall = rows.length ? Math.round(rows.reduce((s, r) => s + r.projected, 0) / rows.length) : 100;
  const atRisk = rows.filter((r) => !r.willPass);
  const target = focusList.length ? Math.round(focusList.reduce((s, c) => s + c.target, 0) / focusList.length) : 85;
  const overallNow = derived.length ? Math.round(derived.reduce((s, c) => s + c.pct, 0) / derived.length) : 100;
  const remainingTotal = focusList.reduce((s, c) => s + c.remaining, 0);
  const toneFor = (v: number) => (v >= target ? palette.present : v >= target - 8 ? palette.late : palette.riskDanger);

  // Goal planner (inverse of the what-if): for a chosen finish target, how many
  // of each class's remaining sessions can still be skipped — the "skip budget".
  const goalRows = useMemo(
    () =>
      focusList.map((c) => {
        const attended = c.present + c.late;
        // Credits still needed so attended/semTotal lands at >= goal.
        const mustAttend = Math.max(0, Math.ceil((goalPct / 100) * c.semTotal - attended));
        const reachable = mustAttend <= c.remaining;
        const maxSkip = Math.max(0, c.remaining - mustAttend);
        return { c, mustAttend: Math.min(mustAttend, c.remaining), maxSkip, reachable };
      }),
    [focusList, goalPct]
  );
  const totalSkip = goalRows.reduce((s, r) => s + r.maxSkip, 0);
  const unreachable = goalRows.filter((r) => !r.reachable).length;

  if (!isPremium) {
    return (
      <ScreenContainer
        wideMaxWidth={1040}
        header={
          <Pressable onPress={() => router.back()} className="flex-row items-center gap-1 py-1">
            <Icon name="back" size={21} color={palette.forest} stroke={2.2} />
            <Text className="text-[16px]" style={{ color: palette.forest, fontFamily: "Outfit_700Bold" }}>
              Back
            </Text>
          </Pressable>
        }
      >
        <View className="mt-16 items-center px-6">
          <View
            className="mb-4 h-[78px] w-[78px] items-center justify-center rounded-[22px]"
            style={{ backgroundColor: palette.gold, shadowColor: palette.goldDeep, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 5 }}
          >
            <Icon name="crown" size={42} color="#fff" stroke={1.9} />
          </View>
          <Text className="text-[13px] tracking-[1.5px]" style={{ color: palette.goldDeep, fontFamily: "Outfit_800ExtraBold" }}>
            PREMIUM
          </Text>
          <Text className="mb-2 mt-1 text-center text-[28px]" style={{ color: palette.ink, fontFamily: "Fraunces_600SemiBold" }}>
            Forecast & Analytics
          </Text>
          <Text className="mb-6 text-center text-[15px]" style={{ color: palette.ink2, fontFamily: "Outfit_500Medium" }}>
            End-of-term projections, a what-if simulator, weekday & time-of-day patterns, punctuality and streak records.
          </Text>
          <Pressable onPress={() => router.push("/premium")} className="items-center rounded-[18px] px-7 py-4" style={{ backgroundColor: palette.gold }}>
            <Text style={{ color: "#3a2a06", fontFamily: "Outfit_800ExtraBold", fontSize: 16 }}>Try free for 2 weeks</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      wideMaxWidth={1040}
      header={
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} className="flex-row items-center gap-1 py-1">
            <Icon name="back" size={21} color={palette.forest} stroke={2.2} />
            <Text className="text-[16px]" style={{ color: palette.forest, fontFamily: "Outfit_700Bold" }}>
              Back
            </Text>
          </Pressable>
          <View className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5" style={{ backgroundColor: palette.gold }}>
            <Icon name="crown" size={14} color="#3a2a06" stroke={2.2} />
            <Text className="text-[11.5px] tracking-[0.5px]" style={{ color: "#3a2a06", fontFamily: "Outfit_800ExtraBold" }}>
              PREMIUM
            </Text>
          </View>
        </View>
      }
    >
      <View className="mb-3">
        <Text className="text-[13px] tracking-[1.5px]" style={{ color: palette.goldDeep, fontFamily: "Outfit_800ExtraBold" }}>
          DEEP INSIGHTS
        </Text>
        <Text className="text-[30px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
          Forecast & Analytics
        </Text>
      </View>
      <Segmented
        options={[{ value: "forecast", label: "Forecast" }, { value: "patterns", label: "Patterns" }, { value: "records", label: "Records" }]}
        value={tab}
        onChange={setTab}
      />

      {tab === "forecast" ? (
        <View>
          {/* Course focus — scope the whole forecast to one course or the whole term */}
          {derived.length > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 2, paddingRight: 8 }}
              className="mt-3"
            >
              {[{ id: "all", name: "All courses", color: palette.forest }, ...derived.map((c) => ({ id: c.classItem.id, name: c.classItem.name, color: c.classItem.color }))].map((opt) => {
                const on = courseId === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setCourseId(opt.id)}
                    className="flex-row items-center gap-1.5 rounded-full px-3.5 py-2"
                    style={{ backgroundColor: on ? palette.forest : palette.card, borderWidth: 1, borderColor: on ? palette.forest : palette.hairline }}
                  >
                    {opt.id !== "all" ? <View className="h-2 w-2 rounded-full" style={{ backgroundColor: on ? "#fff" : opt.color }} /> : null}
                    <Text className="text-[13px]" style={{ color: on ? "#fff" : palette.ink2, fontFamily: "Outfit_700Bold" }}>
                      {opt.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : null}

          {/* Projected hero */}
          <View className="mt-4 rounded-[22px] p-4" style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}>
            <View className="mb-1.5 flex-row items-end justify-between">
              <View>
                <Text className="text-[13px]" style={{ color: palette.ink2, fontFamily: "Outfit_700Bold" }}>
                  Projected finish
                </Text>
                <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 46, lineHeight: 46, color: toneFor(overall), fontVariant: ["tabular-nums"] }}>
                  {overall}%
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-[12.5px]" style={{ color: palette.goldDeep, fontFamily: "Outfit_700Bold" }}>
                  ● target {target}%
                </Text>
                <Text className="mt-0.5 text-[12.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
                  {isCourse
                    ? atRisk.length === 0
                      ? "On track"
                      : "At risk"
                    : atRisk.length === 0
                      ? "All courses on track"
                      : `${atRisk.length} course${atRisk.length > 1 ? "s" : ""} at risk`}
                </Text>
              </View>
            </View>
            <ForecastChart history={trend} projected={overall} target={target} />
            <View className="mt-2.5 flex-row gap-2">
              {([
                ["Best case", Math.min(100, overall + 5), palette.present],
                ["Likely", overall, palette.ink],
                ["If you slip", Math.max(40, overall - 9), palette.riskDanger]
              ] as const).map(([l, v, c]) => (
                <View key={l} className="flex-1 items-center rounded-[16px] py-2" style={{ backgroundColor: palette.card2, borderWidth: 1, borderColor: palette.hairline }}>
                  <Text style={{ fontFamily: "Outfit_800ExtraBold", fontSize: 18, color: c, fontVariant: ["tabular-nums"] }}>{v}%</Text>
                  <Text className="text-[10.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
                    {l}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Remaining sessions */}
          <View className="mt-4 flex-row items-center gap-3.5 rounded-[22px] p-4" style={{ backgroundColor: palette.goldSoft, borderWidth: 1, borderColor: palette.hairline }}>
            <View className="h-[50px] w-[50px] items-center justify-center rounded-[16px]" style={{ backgroundColor: palette.card }}>
              <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 22, color: palette.goldDeep, fontVariant: ["tabular-nums"] }}>{remainingTotal}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[15px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
                Sessions left this term
              </Text>
              <Text numberOfLines={1} className="text-[13.5px]" style={{ color: palette.ink2, fontFamily: "Outfit_600SemiBold" }}>
                {isCourse && focusCourse ? focusCourse.name : "Across all your courses"}
              </Text>
            </View>
          </View>

          <View style={twoCol ? { flexDirection: "row", alignItems: "flex-start", gap: 16, marginTop: 16 } : undefined}>
          {/* What-if */}
          <View className="rounded-[22px] p-4" style={[card(palette), twoCol ? { flex: 1 } : { marginTop: 16 }]}>
            <View className="mb-1 flex-row items-center gap-2">
              <Icon name="target" size={19} color={palette.goldDeep} stroke={2} />
              <Text className="text-[15px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
                What if…
              </Text>
            </View>
            <Text className="mb-3 text-[14px] leading-[20px]" style={{ color: palette.ink2, fontFamily: "Outfit_500Medium" }}>
              If you attend <Text style={{ color: palette.forest, fontFamily: "Outfit_800ExtraBold" }}>{attend}%</Text> of your remaining classes, you&apos;ll finish around{" "}
              <Text style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>{overall}%</Text> overall.
            </Text>
            <Slider value={attend} onChange={setAttend} tone={palette.goldDeep} />
            <View className="flex-row justify-between">
              <Text className="text-[12px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
                skip everything
              </Text>
              <Text className="text-[12px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
                perfect
              </Text>
            </View>
          </View>

          {/* Goal planner */}
          <View className="rounded-[22px] p-4" style={[card(palette), twoCol ? { flex: 1 } : { marginTop: 16 }]}>
            <View className="mb-1 flex-row items-center gap-2">
              <Icon name="target" size={19} color={palette.goldDeep} stroke={2} />
              <Text className="text-[15px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
                Goal planner
              </Text>
            </View>
            <Text className="mb-1 text-[14px] leading-[20px]" style={{ color: palette.ink2, fontFamily: "Outfit_500Medium" }}>
              To finish {isCourse && focusCourse ? focusCourse.name : "every course"} at{" "}
              <Text style={{ color: palette.forest, fontFamily: "Outfit_800ExtraBold" }}>{goalPct}%</Text>, you can skip up to{" "}
              <Text style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>{totalSkip}</Text> of your {remainingTotal} remaining{" "}
              {remainingTotal === 1 ? "session" : "sessions"}.
            </Text>
            {unreachable > 0 ? (
              <Text className="mb-2 text-[12.5px]" style={{ color: palette.riskDanger, fontFamily: "Outfit_700Bold" }}>
                {unreachable} course{unreachable > 1 ? "s" : ""} can&apos;t reach {goalPct}% this term.
              </Text>
            ) : null}
            <View className="mt-2">
              <Slider value={goalPct} onChange={setGoalPct} min={50} max={100} tone={palette.goldDeep} />
              <View className="flex-row justify-between">
                <Text className="text-[12px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
                  50%
                </Text>
                <Text className="text-[12px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
                  100%
                </Text>
              </View>
            </View>
            <View className="mt-3 gap-2 border-t pt-3" style={{ borderTopColor: palette.hairline }}>
              {goalRows.map(({ c, mustAttend, maxSkip, reachable }) => (
                <View key={c.classItem.id} className="flex-row items-center gap-2.5">
                  <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.classItem.color }} />
                  <Text numberOfLines={1} className="flex-1 text-[13.5px]" style={{ color: palette.ink, fontFamily: "Outfit_600SemiBold" }}>
                    {c.classItem.name}
                  </Text>
                  {!reachable ? (
                    <Text className="text-[12.5px]" style={{ color: palette.riskDanger, fontFamily: "Outfit_800ExtraBold" }}>
                      Out of reach
                    </Text>
                  ) : maxSkip > 0 ? (
                    <Text className="text-[12.5px]" style={{ color: palette.present, fontFamily: "Outfit_800ExtraBold" }}>
                      Skip up to {maxSkip}
                    </Text>
                  ) : (
                    <Text className="text-[12.5px]" style={{ color: palette.late, fontFamily: "Outfit_800ExtraBold" }}>
                      Attend all {c.remaining} left
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
          </View>

          {/* By class */}
          <SectionTitle title="By course" trailing="projected" />
          <View className={twoCol ? "flex-row flex-wrap" : "gap-2.5"} style={twoCol ? { gap: 12 } : undefined}>
            {rows.map(({ c, projected, willPass, mustAttend, confidence }) => (
              <Link key={c.classItem.id} href={`/class/${c.classItem.id}`} asChild>
                <Pressable className="rounded-[18px] p-3.5" style={[card(palette), twoCol ? { width: "48.5%" } : undefined]}>
                  <View className="flex-row items-center gap-3">
                    <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.classItem.color }} />
                    <View className="flex-1">
                      <Text numberOfLines={1} className="text-[15px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
                        {c.classItem.name}
                      </Text>
                      <View className="mt-0.5 flex-row items-center gap-1.5">
                        <Text className="text-[12.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
                          now {c.pct}%
                        </Text>
                        <Icon name="arrowRight" size={12} color={palette.ink3} stroke={2} />
                        <Text className="text-[12.5px]" style={{ color: willPass ? palette.present : palette.riskDanger, fontFamily: "Outfit_800ExtraBold" }}>
                          {projected}%
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center gap-1 rounded-full px-2.5 py-1" style={{ backgroundColor: willPass ? palette.presentSoft : palette.absentSoft }}>
                      <Icon name={willPass ? "present" : "target"} size={14} color={willPass ? palette.present : palette.riskDanger} stroke={2.2} />
                      <Text className="text-[12px]" style={{ color: willPass ? palette.present : palette.riskDanger, fontFamily: "Outfit_800ExtraBold" }}>
                        {willPass ? "On track" : "At risk"}
                      </Text>
                    </View>
                  </View>
                  <View className="mt-2.5 flex-row items-center gap-3 border-t pt-2.5" style={{ borderTopColor: palette.hairline }}>
                    <View className="flex-1">
                      <Text className="mb-1 text-[11px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
                        Confidence {confidence}%
                      </Text>
                      <Meter value={confidence / 100} tone={palette.goldDeep} height={5} />
                    </View>
                    <Text className="text-[12px]" style={{ color: palette.ink2, fontFamily: "Outfit_700Bold" }}>
                      attend <Text style={{ color: palette.forest }}>{mustAttend}</Text> of {c.remaining} left
                    </Text>
                  </View>
                </Pressable>
              </Link>
            ))}
          </View>
        </View>
      ) : null}

      {tab === "patterns" ? <PatternsTab records={records} derived={derived} /> : null}
      {tab === "records" ? <RecordsTab derived={derived} profile={profile} overallNow={overallNow} /> : null}
    </ScreenContainer>
  );
};

const PatternsTab = ({ records, derived }: { records: AttendanceRecord[]; derived: ReturnType<typeof deriveClass>[] }) => {
  const palette = useAppPalette();
  const rates = useMemo(() => weekdayRates(records), [records]);
  const absences = useMemo(() => weekdayAbsences(records), [records]);
  const buckets = useMemo(() => timeOfDayBuckets(derived), [derived]);
  const months = useMemo(() => monthlyMomentum(records), [records]);
  const maxRate = Math.max(0.01, ...rates);
  const worstDay = rates.indexOf(Math.min(...rates));
  const maxAbs = Math.max(1, ...absences);
  const worstAbsDay = absences.indexOf(maxAbs);
  const momentumDelta = months.length >= 2 ? months[months.length - 1].value - months[0].value : 0;

  return (
    <View>
      <SectionTitle title="By weekday" trailing="attendance" />
      <View className="rounded-[22px] p-4" style={card(palette)}>
        <View className="flex-row items-end justify-between" style={{ height: 120, gap: 8 }}>
          {rates.map((v, i) => (
            <View key={i} className="flex-1 items-center justify-end" style={{ height: "100%", gap: 6 }}>
              <Text className="text-[11px]" style={{ color: i === worstDay ? palette.riskDanger : palette.ink2, fontFamily: "Outfit_800ExtraBold", fontVariant: ["tabular-nums"] }}>
                {Math.round(v * 100)}
              </Text>
              <View style={{ width: "66%", height: (v / maxRate) * 78 + 8, borderRadius: 7, backgroundColor: i === worstDay ? palette.late : palette.forest }} />
              <Text className="text-[11px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
                {WEEKDAY_LABELS[i]}
              </Text>
            </View>
          ))}
        </View>
        <Text className="mt-3 text-[13.5px] leading-[20px]" style={{ color: palette.ink2, fontFamily: "Outfit_500Medium" }}>
          <Text style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>{WEEKDAY_FULL[worstDay]}s</Text> are your weak spot — protect that morning.
        </Text>
      </View>

      <SectionTitle title="By time of day" />
      <View className="rounded-[22px] p-4" style={card(palette)}>
        {buckets.length ? (
          buckets.map((b) => (
            <View key={b.label} className="mb-2.5 flex-row items-center gap-3">
              <Text className="text-[12.5px]" style={{ width: 74, color: palette.ink2, fontFamily: "Outfit_700Bold" }}>
                {b.label}
              </Text>
              <View className="flex-1">
                <Meter value={b.rate} tone={b.rate >= 0.9 ? palette.present : b.rate >= 0.82 ? palette.forest : palette.late} height={9} />
              </View>
              <Text className="text-[13px]" style={{ width: 36, textAlign: "right", color: palette.ink, fontFamily: "Outfit_800ExtraBold", fontVariant: ["tabular-nums"] }}>
                {Math.round(b.rate * 100)}%
              </Text>
            </View>
          ))
        ) : (
          <Text className="text-[14px]" style={{ color: palette.ink3, fontFamily: "Outfit_500Medium" }}>
            Not enough scheduled classes to chart yet.
          </Text>
        )}
      </View>

      {months.length >= 2 ? (
        <>
          <SectionTitle title="Monthly momentum" trailing="this term" />
          <View className="rounded-[22px] p-4" style={card(palette)}>
            <View className="flex-row items-end justify-between" style={{ height: 96, gap: 10 }}>
              {months.map((m) => (
                <View key={m.month} className="flex-1 items-center justify-end" style={{ height: "100%", gap: 6 }}>
                  <Text className="text-[11px]" style={{ color: palette.forest, fontFamily: "Outfit_800ExtraBold", fontVariant: ["tabular-nums"] }}>
                    {m.value}
                  </Text>
                  <View style={{ width: "58%", height: Math.max(6, ((m.value - 60) / 40) * 70 + 6), borderRadius: 6, backgroundColor: palette.gold }} />
                  <Text className="text-[11px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
                    {m.month}
                  </Text>
                </View>
              ))}
            </View>
            <Text className="mt-3 text-[13.5px] leading-[20px]" style={{ color: palette.ink2, fontFamily: "Outfit_500Medium" }}>
              {momentumDelta >= 0 ? (
                <>
                  You&apos;ve improved <Text style={{ color: palette.present, fontFamily: "Outfit_800ExtraBold" }}>+{momentumDelta} points</Text> this term. Momentum is trending up.
                </>
              ) : (
                <>
                  Down <Text style={{ color: palette.late, fontFamily: "Outfit_800ExtraBold" }}>{momentumDelta} points</Text> this term — worth a reset.
                </>
              )}
            </Text>
          </View>
        </>
      ) : null}

      <SectionTitle title="When you slip" trailing="absences" />
      <View className="rounded-[22px] p-4" style={card(palette)}>
        <View className="flex-row items-end justify-between" style={{ height: 84, gap: 8 }}>
          {absences.map((v, i) => (
            <View key={i} className="flex-1 items-center justify-end" style={{ height: "100%", gap: 6 }}>
              <View
                style={{
                  width: "72%",
                  height: (v / maxAbs) * 60 + 6,
                  borderRadius: 7,
                  backgroundColor: v === maxAbs && v > 0 ? palette.absent : palette.forestSoft,
                  borderWidth: v === maxAbs && v > 0 ? 0 : 1,
                  borderColor: palette.hairline
                }}
              />
              <Text className="text-[11px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
                {WEEKDAY_LABELS[i][0]}
              </Text>
            </View>
          ))}
        </View>
        <Text className="mt-3 text-[13.5px] leading-[20px]" style={{ color: palette.ink2, fontFamily: "Outfit_500Medium" }}>
          Most absences land on <Text style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>{WEEKDAY_FULL[worstAbsDay]}s</Text>. Set a sharper reminder the night before.
        </Text>
      </View>
    </View>
  );
};

const RecordsTab = ({ derived, profile, overallNow }: { derived: ReturnType<typeof deriveClass>[]; profile: ReturnType<typeof getGamificationProfile>; overallNow: number }) => {
  const palette = useAppPalette();
  const ranked = derived.slice().sort((a, b) => b.pct - a.pct);
  const punct = derived.slice().sort((a, b) => punctuality(b) - punctuality(a));

  const streakTiles: { icon: IconName; label: string; value: number; unit: string }[] = [
    { icon: "flame", label: "Current", value: profile.stats.bestStreak, unit: "days" },
    { icon: "bolt", label: "Longest ever", value: profile.stats.longestEverStreak, unit: "days" },
    { icon: "calendar", label: "Check-in days", value: profile.stats.checkInDays, unit: "logged" },
    { icon: "present", label: "Perfect classes", value: profile.stats.perfectClasses, unit: "at 100%" }
  ];

  return (
    <View>
      {/* Grade */}
      <View className="mt-4 flex-row items-center gap-4 rounded-[22px] p-4" style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}>
        <View
          className="h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-full"
          style={{ shadowColor: palette.forestDeep, shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 5 }}
        >
          <Svg width={84} height={84} style={{ position: "absolute" }}>
            <Defs>
              <LinearGradient id="gradeDisc" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={palette.forest} />
                <Stop offset="1" stopColor={palette.forestDeep} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="84" height="84" fill="url(#gradeDisc)" />
          </Svg>
          <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 32, color: "#fff" }}>{attendGrade(overallNow)}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-[13px] tracking-[0.5px]" style={{ color: palette.goldDeep, fontFamily: "Outfit_800ExtraBold" }}>
            ATTENDANCE GRADE
          </Text>
          <Text className="mt-0.5 text-[16.5px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
            {overallNow}% overall this term
          </Text>
          <Text className="text-[13.5px]" style={{ color: palette.ink2, fontFamily: "Outfit_600SemiBold" }}>
            {profile.rank.title} · Level {profile.level}
          </Text>
        </View>
      </View>

      {/* Streaks */}
      <SectionTitle title="Streaks" />
      <View className="flex-row flex-wrap" style={{ marginHorizontal: -5 }}>
        {streakTiles.map((t) => (
          <View key={t.label} style={{ width: "50%", paddingHorizontal: 5, marginBottom: 10 }}>
            <View className="rounded-[18px] p-3.5" style={card(palette)}>
              <Icon name={t.icon} size={20} color={palette.goldDeep} stroke={2} />
              <Text className="mt-1.5 text-[30px]" style={{ color: palette.ink, fontFamily: "Fraunces_600SemiBold", fontVariant: ["tabular-nums"], lineHeight: 32 }}>
                {t.value}
              </Text>
              <Text className="text-[12.5px]" style={{ color: palette.ink2, fontFamily: "Outfit_700Bold" }}>
                {t.label}
              </Text>
              <Text className="text-[11px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
                {t.unit}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Punctuality */}
      <SectionTitle title="Punctuality" trailing="on-time share" />
      <View className="gap-2.5">
        {punct.map((c) => {
          const p = Math.round(punctuality(c) * 100);
          return (
            <View key={c.classItem.id} className="flex-row items-center gap-3 rounded-[18px] p-3.5" style={card(palette)}>
              <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.classItem.color }} />
              <View className="flex-1">
                <Text numberOfLines={1} className="mb-1.5 text-[14.5px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
                  {c.classItem.name}
                </Text>
                <Meter value={punctuality(c)} tone={p >= 95 ? palette.present : p >= 85 ? palette.forest : palette.late} height={6} />
              </View>
              <Text style={{ fontFamily: "Outfit_800ExtraBold", fontSize: 15, color: palette.ink, fontVariant: ["tabular-nums"] }}>{p}%</Text>
            </View>
          );
        })}
      </View>

      {/* Best / worst */}
      {ranked.length > 0 ? (
        <View className="mt-4 flex-row gap-2.5">
          <View className="flex-1 rounded-[18px] p-3.5" style={card(palette)}>
            <Icon name="crown" size={19} color={palette.present} stroke={2} />
            <Text className="mt-1.5 text-[11.5px] tracking-[0.5px]" style={{ color: palette.present, fontFamily: "Outfit_800ExtraBold" }}>
              STRONGEST
            </Text>
            <Text numberOfLines={1} className="mt-0.5 text-[14.5px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
              {ranked[0].classItem.name}
            </Text>
            <Text style={{ color: palette.ink3, fontFamily: "Outfit_700Bold", fontSize: 13, fontVariant: ["tabular-nums"] }}>{ranked[0].pct}%</Text>
          </View>
          <View className="flex-1 rounded-[18px] p-3.5" style={card(palette)}>
            <Icon name="target" size={19} color={palette.riskDanger} stroke={2} />
            <Text className="mt-1.5 text-[11.5px] tracking-[0.5px]" style={{ color: palette.riskDanger, fontFamily: "Outfit_800ExtraBold" }}>
              NEEDS WORK
            </Text>
            <Text numberOfLines={1} className="mt-0.5 text-[14.5px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
              {ranked[ranked.length - 1].classItem.name}
            </Text>
            <Text style={{ color: palette.ink3, fontFamily: "Outfit_700Bold", fontSize: 13, fontVariant: ["tabular-nums"] }}>{ranked[ranked.length - 1].pct}%</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};
