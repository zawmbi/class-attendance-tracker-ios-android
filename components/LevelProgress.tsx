import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { cardStyles } from "@/theme";
import { useAppPalette } from "@/theme/useAppPalette";
import { GamificationProfile } from "@/utils/gamification";

interface LevelProgressProps {
  profile: GamificationProfile;
  streak: number;
  compact?: boolean;
}

const MiniStat = ({ glyph, value, label }: { glyph: string; value: string; label: string }) => {
  const palette = useAppPalette();
  return (
    <View
      className="flex-1 items-center rounded-[18px] px-2 py-3"
      style={{ backgroundColor: palette.background, borderWidth: 1, borderColor: palette.border }}
    >
      <Text className="text-[18px]">{glyph}</Text>
      <Text className="mt-1 font-serif text-[20px]" style={{ color: palette.primary }}>
        {value}
      </Text>
      <Text className="mt-0.5 text-[10px] uppercase tracking-[1.2px]" style={{ color: palette.muted }}>
        {label}
      </Text>
    </View>
  );
};

export const LevelProgress = ({ profile, streak, compact = false }: LevelProgressProps) => {
  const palette = useAppPalette();
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = withTiming(profile.progressToNext, { duration: 900 });
  }, [fill, profile.progressToNext]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.max(4, fill.value * 100)}%`
  }));

  const remainingXp = profile.nextRank
    ? Math.max(0, profile.xpForNextRank - profile.xpIntoRank)
    : 0;

  return (
    <View
      className={`rounded-[28px] ${compact ? "px-5 py-5" : "px-6 py-6"}`}
      style={[cardStyles, { backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }]}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px] uppercase tracking-[1.8px]" style={{ color: palette.muted }}>
          Momentum
        </Text>
        <View
          className="rounded-full px-3 py-1"
          style={{ backgroundColor: palette.primary }}
        >
          <Text className="text-[11px] tracking-[1px]" style={{ color: palette.background }}>
            Level {profile.level}
          </Text>
        </View>
      </View>

      <Text className="mt-3 font-serif text-[34px] leading-[38px]" style={{ color: palette.primary }}>
        {profile.rank.title}
      </Text>
      <Text className="mt-1 text-sm leading-6" style={{ color: palette.muted }}>
        {profile.rank.blurb}
      </Text>

      <View className="mt-5">
        <View
          className="h-3 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: palette.background, borderWidth: 1, borderColor: palette.border }}
        >
          <Animated.View
            className="h-full rounded-full"
            style={[{ backgroundColor: palette.accent }, barStyle]}
          />
        </View>
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-xs" style={{ color: palette.muted }}>
            {profile.xp.toLocaleString()} XP
          </Text>
          <Text className="text-xs" style={{ color: palette.muted }}>
            {profile.nextRank ? `${remainingXp} XP to ${profile.nextRank.title}` : "Top rank reached"}
          </Text>
        </View>
      </View>

      <View className="mt-5 flex-row gap-3">
        <MiniStat glyph="🔥" value={`${streak}`} label="Streak" />
        <MiniStat glyph="🏅" value={`${profile.unlockedCount}/${profile.totalCount}`} label="Badges" />
        <MiniStat glyph="⭐" value={`${profile.stats.presentCount}`} label="On time" />
      </View>
    </View>
  );
};
