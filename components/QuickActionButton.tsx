import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { useAppPalette } from "@/theme/useAppPalette";

interface QuickActionButtonProps {
  label: string;
  tone: "present" | "late" | "absent";
  onPress: () => void;
  active?: boolean;
  celebrate?: boolean;
}

const burstParticles = [
  { x: -84, y: -44, color: "#5E8A75", size: 10 },
  { x: -42, y: -82, color: "#7EA18E", size: 8 },
  { x: 0, y: -92, color: "#2F5D50", size: 9 },
  { x: 44, y: -80, color: "#8AAE9A", size: 8 },
  { x: 86, y: -42, color: "#4C7A5D", size: 10 },
  { x: -92, y: 12, color: "#A3B18A", size: 8 },
  { x: 92, y: 14, color: "#6F9B84", size: 8 },
  { x: -58, y: 72, color: "#4F7D67", size: 7 },
  { x: 58, y: 72, color: "#89AB97", size: 7 }
];

const BurstParticle = ({
  x,
  y,
  color,
  size,
  burst
}: {
  x: number;
  y: number;
  color: string;
  size: number;
  burst: SharedValue<number>;
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - burst.value,
    transform: [
      { translateX: burst.value * x },
      { translateY: burst.value * y },
      { scale: 0.65 + burst.value * 0.55 }
    ]
  }));

  return (
    <Animated.View
      className="absolute rounded-full"
      style={[{ backgroundColor: color, width: size, height: size }, animatedStyle]}
    />
  );
};

export const QuickActionButton = ({
  label,
  tone,
  onPress,
  active = false,
  celebrate = false
}: QuickActionButtonProps) => {
  const palette = useAppPalette();
  const burst = useSharedValue(0);
  const pulse = useSharedValue(1);

  const backgroundColor =
    tone === "present" ? palette.primary : tone === "late" ? "#C8905D" : "#BE6656";
  const textColor = palette.background;

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }]
  }));

  useEffect(() => {
    pulse.value = withSpring(active ? 0.97 : 1, {
      damping: 14,
      stiffness: 180
    });
  }, [active, pulse]);

  useEffect(() => {
    if (!celebrate) {
      return;
    }

    pulse.value = withSequence(
      withTiming(0.94, { duration: 90 }),
      withSpring(active ? 0.97 : 1.02, { damping: 10, stiffness: 210 }),
      withSpring(active ? 0.97 : 1, { damping: 12, stiffness: 190 })
    );
    burst.value = 0;
    burst.value = withTiming(1, { duration: 780 });
  }, [active, burst, celebrate, pulse]);

  return (
    <Animated.View className="flex-1 items-center justify-center" style={buttonAnimatedStyle}>
      {tone === "present" && celebrate ? (
        <View pointerEvents="none" className="absolute items-center justify-center">
          {burstParticles.map((piece, index) => (
            <BurstParticle
              key={`${piece.color}-${index}`}
              x={piece.x}
              y={piece.y}
              color={piece.color}
              size={piece.size}
              burst={burst}
            />
          ))}
        </View>
      ) : null}

      <Pressable
        className="min-h-[88px] w-full items-center justify-center rounded-[24px] px-3 py-4"
        style={{
          backgroundColor,
          borderWidth: active ? 2 : 0,
          borderColor: active ? `${palette.background}CC` : "transparent",
          shadowColor: active ? backgroundColor : palette.ink,
          shadowOpacity: active ? 0.16 : 0.08,
          shadowRadius: active ? 16 : 10,
          shadowOffset: { width: 0, height: active ? 10 : 6 },
          elevation: active ? 8 : 4
        }}
        onPress={onPress}
      >
        {active ? (
          <View
            className="absolute right-3 top-3 h-3 w-3 rounded-full"
            style={{ backgroundColor: textColor, opacity: 0.95 }}
          />
        ) : null}

        <Text className="font-serif text-[20px]" style={{ color: textColor }}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};
