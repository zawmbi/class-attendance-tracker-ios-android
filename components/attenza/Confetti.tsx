import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

// Bright, varied confetti colors (not the muted brand palette — celebrations
// should feel loud).
const COLORS = [
  "#E0533D", "#F2A03D", "#F4D03F", "#5BC46A", "#3AA39B",
  "#4C7BD9", "#7C5CBF", "#C75B8A", "#2F9E6B", "#EC6FA6"
];
const N = 30;

// Deterministic scatter (no Math.random — keeps it resume-safe and stable).
const PIECES = Array.from({ length: N }, (_, i) => {
  const ang = (i / N) * Math.PI * 2;
  const spread = 70 + (i % 6) * 30;
  return {
    x: Math.cos(ang) * spread,
    rise: -(40 + (i % 4) * 22), // initial upward pop
    fall: 260 + (i % 5) * 70, // then gravity downward
    size: 7 + (i % 4) * 2,
    round: i % 3 === 0,
    color: COLORS[i % COLORS.length],
    rot: (i % 2 === 0 ? 1 : -1) * (200 + (i % 5) * 80)
  };
});

const Piece = ({ trigger, p }: { trigger: number; p: (typeof PIECES)[number] }) => {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = 0;
    t.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) });
  }, [trigger, t]);

  const style = useAnimatedStyle(() => {
    // Parabolic toss: pop up, then accelerate down (t² ≈ gravity).
    const y = p.rise * (1 - t.value) + p.fall * t.value * t.value;
    return {
      opacity: t.value < 0.82 ? 1 : 1 - (t.value - 0.82) / 0.18,
      transform: [
        { translateX: p.x * Math.min(1, t.value * 1.4) },
        { translateY: y },
        { rotate: `${p.rot * t.value}deg` },
        { scale: 0.5 + 0.5 * Math.min(1, t.value * 3) }
      ]
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: p.size,
          height: p.round ? p.size : p.size * 1.7,
          borderRadius: p.round ? p.size : 2,
          backgroundColor: p.color
        },
        style
      ]}
    />
  );
};

// One-shot colorful confetti burst from center. Re-fires when `trigger` changes;
// renders nothing when reduced-motion is on.
export const Confetti = ({ trigger }: { trigger: number }) => {
  const reduceMotion = useReducedMotion();
  if (reduceMotion || !trigger) {
    return null;
  }
  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", zIndex: 60 }}
    >
      {PIECES.map((p, i) => (
        <Piece key={`${trigger}-${i}`} trigger={trigger} p={p} />
      ))}
    </View>
  );
};
