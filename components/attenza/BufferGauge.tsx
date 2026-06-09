import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { useAppPalette } from "@/theme/useAppPalette";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

interface BufferGaugeProps {
  canMiss?: number;
  total?: number;
  label?: string;
  size?: number;
}

// Signature object — the "absence buffer" as a 270° fuel gauge.
export const BufferGauge = ({
  canMiss = 0,
  total = 1,
  label = "classes you can still miss",
  size = 200
}: BufferGaugeProps) => {
  const palette = useAppPalette();
  const reduceMotion = useReducedMotion();
  const ratio = total ? Math.max(0, Math.min(1, canMiss / total)) : 0;
  const tone = canMiss <= 0 ? palette.riskDanger : canMiss <= 1 ? palette.late : palette.present;

  const A = Math.PI * 1.25;
  const span = Math.PI * 1.5; // 270°
  const R = size / 2 - 16;
  const cx = size / 2;
  const cy = size / 2;
  const pt = (ang: number): [number, number] => [cx + R * Math.cos(ang), cy + R * Math.sin(ang)];
  const arc = (frac: number) => {
    const [x0, y0] = pt(A);
    const [x1, y1] = pt(A + span * frac);
    return `M ${x0} ${y0} A ${R} ${R} 0 ${frac > 0.5 ? 1 : 0} 1 ${x1} ${y1}`;
  };

  const fullArcLength = R * span;
  const progress = useSharedValue(reduceMotion ? ratio : 0);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = ratio;
    } else {
      progress.value = withTiming(ratio, { duration: 900, easing: EASE_OUT });
    }
  }, [progress, ratio, reduceMotion]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: fullArcLength * (1 - progress.value)
  }));

  const height = size * 0.82;

  return (
    <View style={{ width: size, height }}>
      <Svg width={size} height={height}>
        <Defs>
          <LinearGradient id="bufferGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={palette.forest} />
            <Stop offset="1" stopColor={tone} />
          </LinearGradient>
        </Defs>
        <Path d={arc(1)} fill="none" stroke={palette.hairline} strokeWidth={13} strokeLinecap="round" />
        <AnimatedPath
          d={arc(1)}
          fill="none"
          stroke="url(#bufferGrad)"
          strokeWidth={13}
          strokeLinecap="round"
          strokeDasharray={fullArcLength}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={{ position: "absolute", inset: 0, top: size * 0.06, alignItems: "center", justifyContent: "center" }}>
        <Text
          style={{
            fontFamily: "Fraunces_600SemiBold",
            fontSize: size * 0.32,
            lineHeight: size * 0.32,
            color: tone,
            fontVariant: ["tabular-nums"]
          }}
        >
          {canMiss}
        </Text>
        <Text
          style={{
            fontFamily: "Outfit_600SemiBold",
            fontSize: size * 0.07,
            color: palette.ink2,
            maxWidth: size * 0.62,
            textAlign: "center",
            lineHeight: size * 0.085,
            marginTop: 4
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
};
