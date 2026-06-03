import { useEffect, useMemo } from "react";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { AchievementBadge } from "@/components/AchievementBadge";
import { LevelProgress } from "@/components/LevelProgress";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useGamificationStore } from "@/store/gamificationStore";
import { useAppPalette } from "@/theme/useAppPalette";
import { getAttendanceSummary } from "@/utils/attendance";
import { getGamificationProfile } from "@/utils/gamification";

export const AchievementsScreen = () => {
  const palette = useAppPalette();
  const { classes, records, settings } = useAttendanceStore();
  const { acknowledgedAchievements, acknowledgeAchievements } = useGamificationStore();

  const profile = useMemo(
    () => getGamificationProfile(classes, records, settings),
    [classes, records, settings]
  );

  const strongestStreak = useMemo(
    () =>
      classes.reduce((best, classItem) => {
        const summary = getAttendanceSummary(classItem, records, settings);
        return summary.streak > best ? summary.streak : best;
      }, 0),
    [classes, records, settings]
  );

  const unlockedIds = useMemo(
    () => profile.achievements.filter((item) => item.unlocked).map((item) => item.id),
    [profile.achievements]
  );

  const newlyUnlocked = useMemo(
    () => unlockedIds.filter((id) => !acknowledgedAchievements.includes(id)),
    [unlockedIds, acknowledgedAchievements]
  );

  // Acknowledge anything new once the trophy case has been opened.
  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      acknowledgeAchievements(newlyUnlocked);
    }
  }, [newlyUnlocked, acknowledgeAchievements]);

  const ordered = useMemo(() => {
    return profile.achievements.slice().sort((left, right) => {
      if (left.unlocked !== right.unlocked) {
        return left.unlocked ? -1 : 1;
      }
      return right.progress - left.progress;
    });
  }, [profile.achievements]);

  return (
    <ScreenContainer>
      <Link href="/(tabs)/dashboard" asChild>
        <Pressable
          className="mb-5 self-start rounded-full px-4 py-2.5"
          style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
        >
          <Text style={{ color: palette.primary }}>‹ Back</Text>
        </Pressable>
      </Link>

      <SectionHeader
        title="Trophy Case"
        subtitle="Every check-in earns XP, climbs the ranks, and unlocks badges."
        centered
      />

      <View className="mb-6">
        <LevelProgress profile={profile} streak={strongestStreak} />
      </View>

      <SectionHeader
        title="Badges"
        subtitle={`${profile.unlockedCount} of ${profile.totalCount} unlocked`}
      />

      <View className="flex-row flex-wrap justify-between">
        {ordered.map((achievement) => (
          <View key={achievement.id} className="mb-4" style={{ width: "48.5%" }}>
            <AchievementBadge
              achievement={achievement}
              isNew={newlyUnlocked.includes(achievement.id)}
            />
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
};
