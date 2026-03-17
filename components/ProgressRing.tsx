import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

import { palette } from "@/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  value: number;
  label: string;
  size?: number;
}

export const ProgressRing = ({ value, label, size = 148 }: ProgressRingProps) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(value / 100, { duration: 850 });
  }, [progress, value]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value)
  }));

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={palette.border}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={palette.primary}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          fill="transparent"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View className="absolute items-center">
        <Text className="font-serif text-3xl text-primary">{value}%</Text>
        <Text className="mt-1 text-sm text-muted">{label}</Text>
      </View>
    </View>
  );
};
