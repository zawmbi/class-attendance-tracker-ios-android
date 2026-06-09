import { useEffect, useMemo } from "react";
import { Href, Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { Icon } from "@/components/Icon";
import { MomentumRing } from "@/components/attenza/MomentumRing";
import { Meter } from "@/components/attenza/Meter";
import { StatusPill, AttenzaStatus } from "@/components/attenza/StatusPill";
import { ScreenContainer } from "@/components/ScreenContainer";
import { GetStartedChecklist, ChecklistStep } from "@/components/GetStartedChecklist";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useUserStore } from "@/store/userStore";
import { useAppPalette } from "@/theme/useAppPalette";
import { useIsWide, useIsTwoColumn } from "@/theme/responsive";
import { getAttendanceSummary } from "@/utils/attendance";
import { XP_PER_STATUS, getGamificationProfile, tierColor } from "@/utils/gamification";
import { deriveClass, ringPropsFromProfile } from "@/utils/attenza";
import { BadgeMedallion } from "@/components/attenza/BadgeMedallion";
import { formatTimeLabel, isClassToday } from "@/utils/date";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

const dateKicker = () =>
  new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase();

// Two-line glassy stat chip for the hero (big value + label under it).
const HeroStat = ({ icon, value, label }: { icon: "flame" | "bolt"; value: number; label: string }) => (
  <View className="flex-1 rounded-[16px] px-3 py-2" style={{ backgroundColor: "rgba(255,255,255,0.14)" }}>
    <View className="flex-row items-center gap-1.5">
      <Icon name={icon} size={16} color="#F2D89B" stroke={2.2} />
      <Text style={{ color: "#fff", fontFamily: "Outfit_800ExtraBold", fontSize: 18, fontVariant: ["tabular-nums"] }}>{value}</Text>
    </View>
    <Text className="mt-0.5 text-[11px]" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Outfit_600SemiBold" }}>
      {label}
    </Text>
  </View>
);

export const DashboardScreen = () => {
  const palette = useAppPalette();
  const { classes, records, settings } = useAttendanceStore();
  const loadSampleData = useAttendanceStore((state) => state.loadSampleData);
  const userName = useUserStore((state) => state.userName);
  const onboarded = useUserStore((state) => state.onboarded);
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);
  const viewedForecast = useUserStore((state) => state.viewedForecast);
  const today = new Date().toISOString().slice(0, 10);

  const hasClasses = classes.length > 0;
  const hasAnyRecord = records.length > 0;

  const profile = useMemo(() => getGamificationProfile(classes, records, settings), [classes, records, settings]);
  const strongestStreak = useMemo(
    () =>
      classes.reduce((best, c) => {
        const s = getAttendanceSummary(c, records, settings);
        return s.streak > best ? s.streak : best;
      }, 0),
    [classes, records, settings]
  );
  const ring = ringPropsFromProfile(profile, strongestStreak);

  // XP earned from this week's check-ins (Monday-anchored).
  const weekXP = useMemo(() => {
    const monday = new Date();
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    return records.reduce((sum, r) => (new Date(r.date) >= monday ? sum + XP_PER_STATUS[r.status] : sum), 0);
  }, [records]);
  const xpToNext = Math.max(0, profile.xpForNextRank - profile.xpIntoRank);

  const todays = useMemo(() => classes.filter((c) => isClassToday(c.schedule)), [classes]);
  const loggedToday = todays.filter((c) => records.some((r) => r.classId === c.id && r.date === today)).length;

  const derived = useMemo(() => classes.map((c) => deriveClass(c, records, settings)), [classes, records, settings]);
  const atRisk = derived.filter((d) => d.risk === "danger").sort((a, b) => a.buffer - b.buffer)[0];

  const unlockedBadges = profile.achievements.filter((b) => b.unlocked);
  const firstName = userName ? userName.split(" ")[0] : "there";
  const initial = (userName || "A").trim().charAt(0).toUpperCase();
  // `wide` drives the multi-column hero/grid layout (needs real width); `sidebar`
  // just means the tablet sidebar is present (so we hide the redundant avatar).
  const wide = useIsTwoColumn();
  const sidebar = useIsWide();
  const ringSize = wide ? 168 : 132;

  // Auto-complete onboarding once all three get-started steps are satisfied.
  useEffect(() => {
    if (hasClasses && hasAnyRecord && viewedForecast && !onboarded) {
      completeOnboarding();
    }
  }, [hasClasses, hasAnyRecord, viewedForecast, onboarded, completeOnboarding]);

  const getStartedSteps: ChecklistStep[] = [
    { key: "add", label: "Add a class", hint: "Set up your schedule", done: hasClasses, href: "/class/new" },
    { key: "checkin", label: "Check in", hint: "Log today's attendance", done: hasAnyRecord, href: "/(tabs)/check-in" },
    { key: "forecast", label: "See your forecast", hint: "Project your end-of-term %", done: viewedForecast, href: "/(tabs)/analytics" }
  ];

  const quickActions = (
    <View className="mb-5 flex-row gap-3">
      <Link href={"/class/new" as Href} asChild>
        <Pressable
          className="flex-1 flex-row items-center justify-center gap-2 rounded-[18px] py-3.5"
          style={{ backgroundColor: palette.forestSoft, borderWidth: 1, borderColor: palette.hairline }}
        >
          <Icon name="plus" size={20} color={palette.forest} stroke={2.4} />
          <Text style={{ color: palette.forest, fontFamily: "Outfit_800ExtraBold", fontSize: 15 }}>Add class</Text>
        </Pressable>
      </Link>
      <Link href={"/(tabs)/check-in" as Href} asChild>
        <Pressable
          className="flex-1 flex-row items-center justify-center gap-2 rounded-[18px] py-3.5"
          style={{ backgroundColor: palette.forest }}
        >
          <Icon name="checkin" size={20} color={palette.onGradient} stroke={2.2} />
          <Text style={{ color: palette.onGradient, fontFamily: "Outfit_800ExtraBold", fontSize: 15 }}>Check in</Text>
        </Pressable>
      </Link>
    </View>
  );

  const welcomeBlock = (
    <View className="mt-2">
      <View
        className="rounded-[28px] p-6"
        style={{ backgroundColor: palette.forest, shadowColor: palette.forestDeep, shadowOpacity: 0.3, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 6 }}
      >
        <View className="h-12 w-12 items-center justify-center rounded-[16px]" style={{ backgroundColor: "rgba(255,255,255,0.16)" }}>
          <Icon name="today" size={26} color="#fff" stroke={2} />
        </View>
        <Text className="mt-4 text-[26px] leading-[30px]" style={{ color: palette.onGradient, fontFamily: "Fraunces_600SemiBold" }}>
          Welcome to Attendize
        </Text>
        <Text className="mt-2 text-[15px] leading-[21px]" style={{ color: palette.onGradient, opacity: 0.85, fontFamily: "Outfit_500Medium" }}>
          Add your first class to start tracking attendance, protect your streak, and forecast your term.
        </Text>
      </View>

      <Link href={"/class/new" as Href} asChild>
        <Pressable
          className="mt-4 flex-row items-center justify-center gap-2 rounded-[20px] py-4"
          style={{ backgroundColor: palette.forest, shadowColor: palette.forestDeep, shadowOpacity: 0.22, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } }}
        >
          <Icon name="plus" size={20} color={palette.onGradient} stroke={2.4} />
          <Text className="text-[16px]" style={{ color: palette.onGradient, fontFamily: "Outfit_800ExtraBold" }}>
            Add your first class
          </Text>
        </Pressable>
      </Link>
      <Pressable
        onPress={loadSampleData}
        className="mt-3 items-center rounded-[20px] py-3.5"
        style={{ borderWidth: 1.5, borderColor: palette.border }}
      >
        <Text className="text-[14.5px]" style={{ color: palette.ink2, fontFamily: "Outfit_700Bold" }}>
          Load sample data to explore
        </Text>
      </Pressable>
    </View>
  );

  const greetingBlock = (
    <View className="mb-5 flex-row items-center justify-between">
      <View className="flex-1 pr-3">
        <Text className="text-[12px] tracking-[1.5px]" style={{ color: palette.goldDeep, fontFamily: "Outfit_700Bold" }}>
          {dateKicker()}
        </Text>
        <Text className={wide ? "mt-1 text-[38px]" : "mt-1 text-[30px]"} style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
          {greeting()}, {firstName}
        </Text>
      </View>
      {sidebar ? null : (
        <Link href="/(tabs)/settings" asChild>
          <Pressable className="h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: palette.forest }}>
            <Text style={{ color: palette.onGradient, fontFamily: "Outfit_700Bold", fontSize: 18 }}>{initial}</Text>
          </Pressable>
        </Link>
      )}
    </View>
  );

  const heroBlock = (
    <Link href={"/achievements" as Href} asChild>
      <Pressable
        className="rounded-[28px]"
        style={{
          flex: wide ? 1 : undefined,
          backgroundColor: palette.forest,
          shadowColor: palette.forestDeep,
          shadowOpacity: 0.32,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 14 },
          elevation: 6
        }}
      >
        <View className={wide ? "flex-1 justify-center p-7" : "p-5"}>
          <View className={wide ? "flex-row items-center" : "flex-row items-center"} style={wide ? { gap: 24 } : undefined}>
            <MomentumRing size={ringSize} {...ring} />
            <View className={wide ? "flex-1" : "ml-5 flex-1"}>
              <Text className="text-[11px] tracking-[2px]" style={{ color: palette.onGradient, opacity: 0.7, fontFamily: "Outfit_700Bold" }}>
                MOMENTUM
              </Text>
              <Text className={wide ? "mt-1 text-[30px] leading-[34px]" : "mt-1 text-[25px] leading-[28px]"} style={{ color: palette.onGradient, fontFamily: "Fraunces_600SemiBold" }}>
                {strongestStreak >= 3 ? `You're on a roll${wide ? `, ${firstName}` : ""}.` : "Build your streak."}
              </Text>
              <View className="mt-3 flex-row gap-2">
                <HeroStat icon="flame" value={strongestStreak} label="day streak" />
                <HeroStat icon="bolt" value={weekXP} label="XP this week" />
              </View>
            </View>
          </View>

          <View className="mt-4">
            <View className="mb-1.5 flex-row items-center justify-between">
              <Text className="text-[12.5px]" style={{ color: palette.onGradient, opacity: 0.9, fontFamily: "Outfit_700Bold" }}>
                {profile.nextRank ? `${xpToNext} XP to Level ${profile.level + 1}` : "Top rank reached"}
              </Text>
              {profile.nextRank ? (
                <Text className="text-[12.5px]" style={{ color: palette.onGradient, opacity: 0.9, fontFamily: "Outfit_700Bold" }}>
                  Next rank: {profile.nextRank.title}
                </Text>
              ) : null}
            </View>
            <Meter value={profile.progressToNext} tone={palette.gold} height={8} />
          </View>
        </View>
      </Pressable>
    </Link>
  );

  const atRiskBlock = atRisk ? (
    <Link href={`/class/${atRisk.classItem.id}`} asChild>
      <Pressable
        className="flex-row items-center rounded-[22px] p-4"
        style={{ backgroundColor: palette.absentSoft, borderWidth: 1, borderColor: `${palette.riskDanger}55` }}
      >
        <View className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: `${palette.riskDanger}22` }}>
          <Icon name="target" size={22} color={palette.riskDanger} />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-[11px] tracking-[1.5px]" style={{ color: palette.riskDanger, fontFamily: "Outfit_700Bold" }}>
            NEEDS ATTENTION
          </Text>
          <Text className="mt-0.5 text-[16px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
            {atRisk.classItem.name}
          </Text>
          <Text className="text-[13px]" style={{ color: palette.ink2, fontFamily: "Outfit_500Medium" }}>
            {atRisk.buffer <= 0 ? "Buffer empty — every class counts now." : `Only ${atRisk.buffer} more miss before risk.`}
          </Text>
        </View>
        <Icon name="chevron" size={20} color={palette.ink3} />
      </Pressable>
    </Link>
  ) : null;

  const todayBlock = (
    <View>
      <View className="mb-3 flex-row items-end justify-between">
        <Text className="text-[22px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
          Today
        </Text>
        <Text className="text-[13px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
          {loggedToday} of {todays.length} logged
        </Text>
      </View>

      {todays.length > 0 ? (
        <View className="overflow-hidden rounded-[22px]" style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border }}>
          {todays.map((c, i) => {
            const status = records.find((r) => r.classId === c.id && r.date === today)?.status as AttenzaStatus | undefined;
            return (
              <Link key={c.id} href={`/class/${c.id}`} asChild>
                <Pressable
                  className="flex-row items-center px-4 py-3.5"
                  style={i > 0 ? { borderTopWidth: 1, borderTopColor: palette.border } : undefined}
                >
                  <Text numberOfLines={1} className="w-[70px] text-[12.5px]" style={{ color: palette.ink2, fontFamily: "Outfit_600SemiBold" }}>
                    {formatTimeLabel(c.schedule[0]?.startTime ?? "09:00")}
                  </Text>
                  <View className="mr-3 h-9 w-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <View className="flex-1 pr-2">
                    <Text numberOfLines={1} className="text-[16px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
                      {c.name}
                    </Text>
                    <Text className="text-[12px]" style={{ color: palette.ink3, fontFamily: "Outfit_500Medium" }}>
                      {c.sectionLabel ? `${c.sectionLabel} · ` : ""}Room {c.room}
                    </Text>
                  </View>
                  {status ? (
                    <StatusPill status={status} size="sm" />
                  ) : (
                    <Link href="/(tabs)/check-in" asChild>
                      <Pressable className="flex-row items-center gap-1 rounded-full px-3 py-1.5" style={{ backgroundColor: palette.forestSoft }}>
                        <Text style={{ color: palette.forest, fontFamily: "Outfit_700Bold", fontSize: 12.5 }}>Check in</Text>
                        <Icon name="chevron" size={13} color={palette.forest} stroke={2.2} />
                      </Pressable>
                    </Link>
                  )}
                </Pressable>
              </Link>
            );
          })}
        </View>
      ) : (
        <View className="items-center rounded-[22px] px-5 py-7" style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border }}>
          <Icon name="inbox" size={28} color={palette.ink3} />
          <Text className="mt-2 text-center text-[14px]" style={{ color: palette.ink2, fontFamily: "Outfit_500Medium" }}>
            Nothing scheduled today. Enjoy the breather.
          </Text>
        </View>
      )}
    </View>
  );

  const trophyBlock =
    unlockedBadges.length > 0 ? (
      <View>
        <View className="mb-3 flex-row items-end justify-between">
          <Text className="text-[22px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
            Badges
          </Text>
          <Link href={"/achievements" as Href} asChild>
            <Pressable>
              <Text className="text-[13px]" style={{ color: palette.forest, fontFamily: "Outfit_600SemiBold" }}>
                View all
              </Text>
            </Pressable>
          </Link>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 8 }}>
          {unlockedBadges.map((b) => (
            <View key={b.id} className="items-center" style={{ width: 92 }}>
              <View
                className="h-[92px] w-[92px] items-center justify-center rounded-[22px]"
                style={{ backgroundColor: `${tierColor(b.tier)}22`, borderWidth: 1, borderColor: `${tierColor(b.tier)}55` }}
              >
                <BadgeMedallion emoji={b.glyph} tier={b.tier} size={56} />
              </View>
              <Text numberOfLines={2} className="mt-1.5 text-center text-[12px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
                {b.title}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    ) : null;

  return (
    <ScreenContainer maxWidth={wide ? 1180 : sidebar ? 600 : 460}>
      {greetingBlock}
      {!hasClasses ? (
        welcomeBlock
      ) : (
        <>
          {!onboarded ? (
            <View className="mb-5">
              <GetStartedChecklist steps={getStartedSteps} onDismiss={completeOnboarding} />
            </View>
          ) : null}
          {quickActions}
          {wide ? (
            <>
              <View className="flex-row items-stretch" style={{ gap: 20 }}>
                <View style={{ flex: 1.4 }}>{heroBlock}</View>
                <View style={{ flex: 1, gap: 16 }}>
                  {atRiskBlock}
                  {todayBlock}
                </View>
              </View>
              {trophyBlock ? <View className="mt-6">{trophyBlock}</View> : null}
            </>
          ) : (
            <>
              <View className="mb-5">{heroBlock}</View>
              {atRiskBlock ? <View className="mb-5">{atRiskBlock}</View> : null}
              <View className="mb-5">{todayBlock}</View>
              {trophyBlock}
            </>
          )}
        </>
      )}
    </ScreenContainer>
  );
};
