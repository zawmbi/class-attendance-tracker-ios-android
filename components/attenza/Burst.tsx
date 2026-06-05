import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

import { useAppPalette } from "@/theme/useAppPalette";

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const N = 14;
// Deterministic spread so particles look scattered without Math.random.
const PARTICLES = Array.from({ length: N }, (_, i) => {
  const ang = (i / N) * Math.PI * 2;
  const dist = 110 + (i % 5) * 22;
  return {
    x: Math.cos(ang) * dist,
    y: Math.sin(ang) * dist - 30,
    size: 7 + (i % 4) * 2,
    round: i % 2 === 0,
    gold: i % 3 !== 0
  };
});

const Particle = ({
  trigger,
  p,
  color
}: {
  trigger: number;
  p: (typeof PARTICLES)[number];
  color: string;
}) => {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = 0;
    t.value = withTiming(1, { duration: 900, easing: EASE_OUT });
  }, [trigger, t]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - t.value,
    transform: [
      { translateX: p.x * t.value },
      { translateY: p.y * t.value },
      { scale: 1 - 0.4 * t.value }
    ]
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: p.size,
          height: p.size,
          borderRadius: p.round ? p.size : 2,
          backgroundColor: color
        },
        style
      ]}
    />
  );
};

// One-shot gold/forest particle burst for celebrations. Re-fires whenever
// `trigger` changes. Reduced-motion → renders nothing.
export const Burst = ({ trigger }: { trigger: number }) => {
  const palette = useAppPalette();
  const reduceMotion = useReducedMotion();
  if (reduceMotion || !trigger) {
    return null;
  }
  return (
    <View pointerEvents="none" style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      {PARTICLES.map((p, i) => (
        <Particle key={`${trigger}-${i}`} trigger={trigger} p={p} color={p.gold ? palette.gold : palette.forest} />
      ))}
    </View>
  );
};
