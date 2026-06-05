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

interface MeterProps {
  value?: number; // 0..1
  tone?: string;
  height?: number;
}

export const Meter = ({ value = 0, tone, height = 8 }: MeterProps) => {
  const palette = useAppPalette();
  const reduceMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(1, value));
  const fill = useSharedValue(reduceMotion ? clamped : 0);

  useEffect(() => {
    fill.value = reduceMotion ? clamped : withTiming(clamped, { duration: 900, easing: Easing.bezier(0.22, 1, 0.36, 1) });
  }, [fill, clamped, reduceMotion]);

  const style = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));

  return (
    <View style={{ height, borderRadius: 9999, backgroundColor: palette.hairline, overflow: "hidden" }}>
      <Animated.View style={[{ height: "100%", borderRadius: 9999, backgroundColor: tone ?? palette.forest }, style]} />
    </View>
  );
};
