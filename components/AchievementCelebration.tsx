import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Confetti } from "@/components/attenza/Confetti";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useGamificationStore } from "@/store/gamificationStore";
import { useAppPalette } from "@/theme/useAppPalette";
import { Achievement, getGamificationProfile } from "@/utils/gamification";

// Global overlay that pops a confetti celebration whenever a NEW achievement
// unlocks during the session. Mounted once inside the authed tab layout.
export const AchievementCelebration = () => {
  const palette = useAppPalette();
  const router = useRouter();
  const { classes, records, settings } = useAttendanceStore();
  const acknowledge = useGamificationStore((s) => s.acknowledgeAchievements);

  const unlocked = useMemo(
    () => getGamificationProfile(classes, records, settings).achievements.filter((a) => a.unlocked),
    [classes, records, settings]
  );
  const unlockedKey = unlocked.map((a) => a.id).join(",");

  // Baseline of unlocks already present this session — these never celebrate
  // (e.g. the demo data a guest loads). Only unlocks that appear afterwards do.
  const seenRef = useRef<Set<string> | null>(null);
  const [queue, setQueue] = useState<Achievement[]>([]);
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    const ids = new Set(unlocked.map((a) => a.id));
    if (seenRef.current === null) {
      // First render baselines whatever's already unlocked (e.g. demo data).
      seenRef.current = ids;
      return;
    }
    const fresh = unlocked.filter((a) => !seenRef.current!.has(a.id));
    // Track the current set (so re-earning after a data reset celebrates again).
    seenRef.current = ids;
    if (fresh.length > 0) {
      setQueue((q) => [...q, ...fresh]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlockedKey]);

  const current = queue[0];

  // Fire the confetti each time a new celebration surfaces.
  useEffect(() => {
    if (current) {
      setBurst((b) => b + 1);
    }
  }, [current?.id]);

  if (!current) {
    return null;
  }

  const dismiss = () => {
    acknowledge([current.id]);
    setQueue((q) => q.slice(1));
  };

  const seeAll = () => {
    dismiss();
    router.push("/achievements");
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={dismiss}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(8,16,13,0.55)", padding: 24 }}>
        <View
          style={{
            width: "100%",
            maxWidth: 380,
            borderRadius: 28,
            padding: 26,
            alignItems: "center",
            backgroundColor: palette.card,
            borderWidth: 1,
            borderColor: palette.hairline
          }}
        >
          <Text style={{ color: palette.goldDeep, fontFamily: "Outfit_800ExtraBold", fontSize: 12.5, letterSpacing: 1.5 }}>
            ACHIEVEMENT UNLOCKED
          </Text>

          <View
            style={{
              marginTop: 16,
              height: 100,
              width: 100,
              borderRadius: 30,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: palette.goldSoft
            }}
          >
            <Text style={{ fontSize: 54 }}>{current.glyph}</Text>
          </View>

          <Text style={{ marginTop: 14, color: palette.ink, fontFamily: "Fraunces_600SemiBold", fontSize: 27, textAlign: "center" }}>
            {current.title}
          </Text>
          <Text style={{ marginTop: 6, color: palette.ink2, fontFamily: "Outfit_500Medium", fontSize: 14.5, textAlign: "center", lineHeight: 20 }}>
            {current.description}
          </Text>

          <View style={{ marginTop: 14, flexDirection: "row", alignItems: "center", backgroundColor: palette.presentSoft, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 }}>
            <Text style={{ color: palette.present, fontFamily: "Outfit_800ExtraBold", fontSize: 14 }}>+{current.xp} XP</Text>
          </View>

          <Pressable
            onPress={seeAll}
            style={{ marginTop: 22, width: "100%", alignItems: "center", borderRadius: 18, paddingVertical: 14, backgroundColor: palette.forest }}
          >
            <Text style={{ color: palette.onGradient, fontFamily: "Outfit_800ExtraBold", fontSize: 15.5 }}>See all badges</Text>
          </Pressable>
          <Pressable onPress={dismiss} style={{ marginTop: 8, paddingVertical: 8 }}>
            <Text style={{ color: palette.ink3, fontFamily: "Outfit_700Bold", fontSize: 14.5 }}>Dismiss</Text>
          </Pressable>
        </View>

        <Confetti trigger={burst} />
      </View>
    </Modal>
  );
};
