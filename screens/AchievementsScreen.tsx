import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { Icon } from "@/components/Icon";
import { BadgeMedallion } from "@/components/attenza/BadgeMedallion";
import { Meter } from "@/components/attenza/Meter";
import { Sheet } from "@/components/attenza/Sheet";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useGamificationStore } from "@/store/gamificationStore";
import { useAppPalette } from "@/theme/useAppPalette";
import { useIsWide } from "@/theme/responsive";
import { Achievement, RANKS, getGamificationProfile, tierColor } from "@/utils/gamification";

export const AchievementsScreen = () => {
  const palette = useAppPalette();
  const router = useRouter();
  const wide = useIsWide();
  const { classes, records, settings } = useAttendanceStore();
  const { acknowledgedAchievements, acknowledgeAchievements } = useGamificationStore();
  const [selected, setSelected] = useState<Achievement | null>(null);

  const profile = useMemo(() => getGamificationProfile(classes, records, settings), [classes, records, settings]);

  const unlockedIds = useMemo(
    () => profile.achievements.filter((item) => item.unlocked).map((item) => item.id),
    [profile.achievements]
  );
  const newlyUnlocked = useMemo(
    () => unlockedIds.filter((id) => !acknowledgedAchievements.includes(id)),
    [unlockedIds, acknowledgedAchievements]
  );
  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      acknowledgeAchievements(newlyUnlocked);
    }
  }, [newlyUnlocked, acknowledgeAchievements]);

  const ordered = useMemo(
    () =>
      profile.achievements.slice().sort((a, b) => {
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        return b.progress - a.progress;
      }),
    [profile.achievements]
  );

  const currentRankIndex = profile.rank.index;

  return (
    <ScreenContainer wideMaxWidth={1040}>
      {/* Back + header */}
      <Pressable onPress={() => router.back()} className="mb-2 flex-row items-center gap-1 py-1" accessibilityLabel="Back">
        <Icon name="back" size={21} color={palette.forest} stroke={2.2} />
        <Text className="text-[16px]" style={{ color: palette.forest, fontFamily: "Outfit_700Bold" }}>
          Back
        </Text>
      </Pressable>
      <View className="mb-4">
        <Text className="text-[13px] tracking-[1.5px]" style={{ color: palette.goldDeep, fontFamily: "Outfit_800ExtraBold" }}>
          RANK & ACHIEVEMENTS
        </Text>
        <Text className="text-[32px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
          Trophy Case
        </Text>
      </View>

      {/* Rank card */}
      <View
        className="mb-6 rounded-[28px] p-5"
        style={{
          backgroundColor: palette.forestDeep,
          shadowColor: palette.forestDeep,
          shadowOpacity: 0.32,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 14 },
          elevation: 6
        }}
      >
        <Svg style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="rankGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={palette.forest} />
              <Stop offset="0.7" stopColor={palette.forestDeep} />
              <Stop offset="1" stopColor={palette.forestDeep} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" rx="28" ry="28" fill="url(#rankGrad)" />
        </Svg>

        <View className="flex-row items-center gap-3.5">
          <View
            className="h-16 w-16 items-center justify-center rounded-full"
            style={{
              backgroundColor: palette.gold,
              shadowColor: palette.goldDeep,
              shadowOpacity: 0.5,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 5
            }}
          >
            <Icon name="laurel" size={36} color="#fff" stroke={1.9} />
          </View>
          <View className="flex-1">
            <Text className="text-[12.5px] tracking-[1.5px]" style={{ color: palette.gold, fontFamily: "Outfit_800ExtraBold" }}>
              CURRENT RANK
            </Text>
            <Text className="text-[30px] leading-[32px]" style={{ color: "#fff", fontFamily: "Fraunces_600SemiBold" }}>
              {profile.rank.title}
            </Text>
            <Text className="mt-0.5 text-[13px]" style={{ color: palette.onGradient, opacity: 0.85, fontFamily: "Outfit_600SemiBold" }}>
              {profile.nextRank
                ? `${Math.max(0, profile.xpForNextRank - profile.xpIntoRank)} XP to ${profile.nextRank.title}`
                : "Top rank reached"}
            </Text>
          </View>
        </View>

        {/* Ladder */}
        <View className="mt-5 flex-row items-center">
          {RANKS.map((rank, i) => {
            const done = i < currentRankIndex;
            const current = i === currentRankIndex;
            const reached = i <= currentRankIndex;
            const size = current ? 28 : 20;
            return (
              <View key={rank.title} className="flex-row items-center" style={{ flex: i < RANKS.length - 1 ? 1 : 0 }}>
                <View
                  className="items-center justify-center rounded-full"
                  style={{
                    width: size,
                    height: size,
                    backgroundColor: reached ? palette.gold : "rgba(255,255,255,0.18)",
                    borderWidth: current ? 3 : 0,
                    borderColor: "#fff"
                  }}
                >
                  {done ? <Icon name="present" size={13} color={palette.forestDeep} stroke={3} /> : null}
                </View>
                {i < RANKS.length - 1 ? (
                  <View
                    className="mx-0.5 h-[3px] flex-1 rounded-full"
                    style={{ backgroundColor: i + 1 <= currentRankIndex ? palette.gold : "rgba(255,255,255,0.18)" }}
                  />
                ) : null}
              </View>
            );
          })}
        </View>
        <View className="mt-1.5 flex-row justify-between">
          <Text className="text-[10.5px]" style={{ color: palette.onGradient, opacity: 0.8, fontFamily: "Outfit_700Bold" }}>
            {RANKS[0].title}
          </Text>
          <Text className="text-[10.5px]" style={{ color: palette.gold, fontFamily: "Outfit_700Bold" }}>
            {RANKS[RANKS.length - 1].title}
          </Text>
        </View>
      </View>

      {/* Badges */}
      <View className="mb-3 flex-row items-end justify-between">
        <Text className="text-[22px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
          Badges
        </Text>
        <Text className="text-[13px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
          {profile.unlockedCount} / {profile.totalCount}
        </Text>
      </View>

      <View className="flex-row flex-wrap" style={{ marginHorizontal: -5 }}>
        {ordered.map((badge) => (
          <View key={badge.id} style={{ width: wide ? "16.666%" : "33.333%", paddingHorizontal: 6, marginBottom: 14 }}>
            <Pressable onPress={() => setSelected(badge)}>
              <View
                className="items-center justify-center rounded-[22px]"
                style={{
                  aspectRatio: 1,
                  backgroundColor: badge.unlocked ? `${tierColor(badge.tier)}22` : palette.paper2,
                  borderWidth: 1,
                  borderColor: badge.unlocked ? `${tierColor(badge.tier)}55` : palette.hairline
                }}
              >
                <BadgeMedallion emoji={badge.glyph} tier={badge.tier} size={wide ? 60 : 52} unlocked={badge.unlocked} />
                {!badge.unlocked && badge.progress > 0 ? (
                  <View style={{ position: "absolute", bottom: 8, left: 12, right: 12 }}>
                    <Meter value={badge.progress} tone={palette.goldDeep} height={4} />
                  </View>
                ) : null}
              </View>
              <Text
                numberOfLines={2}
                className="mt-1.5 text-center text-[11.5px]"
                style={{ color: badge.unlocked ? palette.ink : palette.ink3, fontFamily: "Outfit_700Bold" }}
              >
                {badge.title}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>

      {/* Badge detail sheet */}
      <Sheet open={selected !== null} onClose={() => setSelected(null)}>
        {selected ? (
          <View className="items-center">
            <View className="mb-3.5">
              <BadgeMedallion emoji={selected.glyph} tier={selected.tier} size={90} unlocked={selected.unlocked} />
            </View>
            <Text className="text-[12.5px] tracking-[1px]" style={{ color: palette.goldDeep, fontFamily: "Outfit_800ExtraBold" }}>
              {selected.tier.toUpperCase()}
            </Text>
            <Text className="mb-1.5 mt-1 text-[26px]" style={{ color: palette.ink, fontFamily: "Fraunces_600SemiBold" }}>
              {selected.title}
            </Text>
            <Text className="mb-4 text-center text-[15px]" style={{ color: palette.ink2, fontFamily: "Outfit_500Medium" }}>
              {selected.description}
            </Text>
            {selected.unlocked ? (
              <View className="flex-row items-center gap-1.5 rounded-full px-4 py-2" style={{ backgroundColor: palette.presentSoft }}>
                <Icon name="present" size={17} color={palette.present} stroke={2.4} />
                <Text className="text-[14px]" style={{ color: palette.present, fontFamily: "Outfit_800ExtraBold" }}>
                  Unlocked · +{selected.xp} XP
                </Text>
              </View>
            ) : (
              <View className="w-full px-5">
                <Meter value={selected.progress} tone={palette.goldDeep} />
                <Text className="mt-1.5 text-center text-[12.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
                  {selected.progressLabel} · {Math.round(selected.progress * 100)}% there
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View />
        )}
      </Sheet>
    </ScreenContainer>
  );
};
