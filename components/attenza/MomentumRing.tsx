import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Stop } from "react-native-svg";

import { Icon } from "@/components/Icon";
import { useAppPalette } from "@/theme/useAppPalette";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

interface MomentumRingProps {
  size?: number;
  level?: number;
  xp?: number;
  xpMax?: number;
  streak?: number;
  rank?: string;
  animate?: boolean;
}

// Signature object — fuses XP progress (ring), rank + level (core), streak (badge).
export const MomentumRing = ({
  size = 168,
  level = 1,
  xp = 0,
  xpMax = 100,
  streak = 0,
  rank = "Freshman",
  animate = true
}: MomentumRingProps) => {
  const palette = useAppPalette();
  const reduceMotion = useReducedMotion();
  const stroke = size * 0.085;
  const r = (size - stroke) / 2 - 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, xpMax > 0 ? xp / xpMax : 0));
  const draw = useSharedValue(animate && !reduceMotion ? 0 : pct);

  useEffect(() => {
    if (animate && !reduceMotion) {
      draw.value = withTiming(pct, { duration: 1100, easing: EASE_OUT });
    } else {
      draw.value = pct;
    }
  }, [draw, pct, animate, reduceMotion]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: c * (1 - draw.value)
  }));

  const coreR = r - stroke / 2 - 3;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={palette.gold} />
            <Stop offset="0.55" stopColor={palette.goldDeep} />
            <Stop offset="1" stopColor={palette.forest} />
          </LinearGradient>
          <RadialGradient id="coreGrad" cx="38%" cy="32%" r="75%">
            <Stop offset="0" stopColor={palette.card2} />
            <Stop offset="1" stopColor={palette.paper2} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={palette.hairline} strokeWidth={stroke} />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <Circle cx={size / 2} cy={size / 2} r={coreR} fill="url(#coreGrad)" />
        <Circle cx={size / 2} cy={size / 2} r={coreR} fill="none" stroke={palette.hairline} strokeWidth={1} />
      </Svg>

      <View style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}>
        <Text
          style={{
            fontFamily: "Outfit_700Bold",
            fontSize: size * 0.07,
            letterSpacing: size * 0.07 * 0.08,
            textTransform: "uppercase",
            color: palette.forest
          }}
        >
          {rank}
        </Text>
        <Text
          style={{
            fontFamily: "Fraunces_600SemiBold",
            fontSize: size * 0.34,
            lineHeight: size * 0.34,
            color: palette.ink,
            marginTop: size * 0.01,
            fontVariant: ["tabular-nums"]
          }}
        >
          {level}
        </Text>
        <Text
          style={{
            fontFamily: "Outfit_600SemiBold",
            fontSize: size * 0.066,
            color: palette.ink3,
            marginTop: size * 0.015,
            fontVariant: ["tabular-nums"]
          }}
        >
          {xp}/{xpMax} XP
        </Text>
      </View>

      <View
        style={{
          position: "absolute",
          top: -2,
          right: -2,
          flexDirection: "row",
          alignItems: "center",
          gap: 3,
          paddingVertical: 5,
          paddingLeft: 8,
          paddingRight: 11,
          borderRadius: 9999,
          backgroundColor: palette.gold,
          shadowColor: palette.goldDeep,
          shadowOpacity: 0.45,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 4
        }}
      >
        <Icon name="flame" size={size * 0.15} color="#fff" stroke={2.2} filled />
        <Text style={{ fontFamily: "Outfit_800ExtraBold", fontSize: size * 0.1, color: "#fff", fontVariant: ["tabular-nums"] }}>
          {streak}
        </Text>
      </View>
    </View>
  );
};
