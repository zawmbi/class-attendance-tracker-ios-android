import { Text, View } from "react-native";

import { BadgeMedallion } from "@/components/attenza/BadgeMedallion";
import { useAppPalette } from "@/theme/useAppPalette";
import { Achievement, tierColor } from "@/utils/gamification";
import { achievementIcon } from "@/utils/attenza";

interface AchievementBadgeProps {
  achievement: Achievement;
  isNew?: boolean;
}

export const AchievementBadge = ({ achievement, isNew = false }: AchievementBadgeProps) => {
  const palette = useAppPalette();
  const accent = tierColor(achievement.tier);
  const unlocked = achievement.unlocked;

  return (
    <View
      className="rounded-[24px] px-4 py-5"
      style={{
        backgroundColor: palette.surface,
        borderWidth: unlocked ? 1.5 : 1,
        borderColor: unlocked ? accent : palette.border,
        opacity: unlocked ? 1 : 0.92
      }}
    >
      {isNew ? (
        <View
          className="absolute right-3 top-3 rounded-full px-2 py-0.5"
          style={{ backgroundColor: accent }}
        >
          <Text className="text-[9px] uppercase tracking-[1px]" style={{ color: palette.background }}>
            New
          </Text>
        </View>
      ) : null}

      <BadgeMedallion icon={achievementIcon(achievement.id)} size={56} unlocked={unlocked} />

      <Text className="mt-3 font-serif text-[19px] leading-[24px]" style={{ color: palette.primary }}>
        {achievement.title}
      </Text>
      <Text className="mt-1 text-xs leading-5" style={{ color: palette.muted }}>
        {achievement.description}
      </Text>

      {unlocked ? (
        <Text className="mt-3 text-[11px] uppercase tracking-[1.2px]" style={{ color: accent }}>
          +{achievement.xp} XP · Earned
        </Text>
      ) : (
        <View className="mt-3">
          <View
            className="h-2 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: palette.background, borderWidth: 1, borderColor: palette.border }}
          >
            <View
              className="h-full rounded-full"
              style={{ width: `${Math.max(3, achievement.progress * 100)}%`, backgroundColor: accent }}
            />
          </View>
          <Text className="mt-1.5 text-[11px]" style={{ color: palette.muted }}>
            {achievement.progressLabel}
          </Text>
        </View>
      )}
    </View>
  );
};
