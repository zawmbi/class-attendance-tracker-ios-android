import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { cardStyles } from "@/theme";
import { useAppPalette } from "@/theme/useAppPalette";
import { GamificationProfile } from "@/utils/gamification";

interface LevelProgressProps {
  profile: GamificationProfile;
  streak: number;
  compact?: boolean;
}

const MiniStat = ({
  glyph,
  value,
  label,
  onColor
}: {
  glyph: string;
  value: string;
  label: string;
  onColor: string;
}) => (
  <View
    className="flex-1 items-center rounded-[18px] px-2 py-3"
    style={{ backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.16)" }}
  >
    <Text className="text-[18px]">{glyph}</Text>
    <Text className="mt-1 font-serif text-[20px]" style={{ color: onColor }}>
      {value}
    </Text>
    <Text className="mt-0.5 text-[10px] uppercase tracking-[1.2px]" style={{ color: onColor, opacity: 0.7 }}>
      {label}
    </Text>
  </View>
);

export const LevelProgress = ({ profile, streak, compact = false }: LevelProgressProps) => {
  const palette = useAppPalette();
  const onColor = palette.onGradient;
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = withTiming(profile.progressToNext, { duration: 900 });
  }, [fill, profile.progressToNext]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.max(4, fill.value * 100)}%`
  }));

  const remainingXp = profile.nextRank ? Math.max(0, profile.xpForNextRank - profile.xpIntoRank) : 0;

  return (
    <View
      className="rounded-[28px]"
      style={[cardStyles, { borderRadius: 28, backgroundColor: palette.gradientEnd }]}
    >
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="momentumGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={palette.gradientStart} />
            <Stop offset="1" stopColor={palette.gradientEnd} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" rx="28" ry="28" fill="url(#momentumGradient)" />
      </Svg>

      <View className={compact ? "px-5 py-5" : "px-6 py-6"}>
        <View className="flex-row items-center justify-between">
          <Text className="text-[11px] uppercase tracking-[2px]" style={{ color: onColor, opacity: 0.7 }}>
            Momentum
          </Text>
          <View className="rounded-full px-3 py-1" style={{ backgroundColor: "rgba(255,255,255,0.16)" }}>
            <Text className="text-[11px] tracking-[1px]" style={{ color: onColor }}>
              Level {profile.level}
            </Text>
          </View>
        </View>

        <Text className="mt-3 font-serif text-[34px] leading-[40px]" style={{ color: onColor }}>
          {profile.rank.title}
        </Text>
        <Text className="mt-1 text-sm leading-6" style={{ color: onColor, opacity: 0.78 }}>
          {profile.rank.blurb}
        </Text>

        <View className="mt-5">
          <View className="h-3 w-full overflow-hidden rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>
            <Animated.View className="h-full rounded-full" style={[{ backgroundColor: palette.accent }, barStyle]} />
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-xs" style={{ color: onColor, opacity: 0.78 }}>
              {profile.xp.toLocaleString()} XP
            </Text>
            <Text className="text-xs" style={{ color: onColor, opacity: 0.78 }}>
              {profile.nextRank ? `${remainingXp} XP to ${profile.nextRank.title}` : "Top rank reached"}
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row gap-3">
          <MiniStat glyph="🔥" value={`${streak}`} label="Streak" onColor={onColor} />
          <MiniStat glyph="🏅" value={`${profile.unlockedCount}/${profile.totalCount}`} label="Badges" onColor={onColor} />
          <MiniStat glyph="⭐" value={`${profile.stats.presentCount}`} label="On time" onColor={onColor} />
        </View>
      </View>
    </View>
  );
};
