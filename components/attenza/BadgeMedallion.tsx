import { View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { Icon, IconName } from "@/components/Icon";
import { useAppPalette } from "@/theme/useAppPalette";

interface BadgeMedallionProps {
  icon: IconName;
  size?: number;
  unlocked?: boolean;
}

let gradSeed = 0;

// Solid gold gradient (gold → gold-deep) disc with a white icon + soft gold
// glow when unlocked; sunken hairline disc with a lock glyph when locked.
export const BadgeMedallion = ({ icon, size = 62, unlocked = true }: BadgeMedallionProps) => {
  const palette = useAppPalette();
  const gradId = `badgeGold-${(gradSeed += 1)}`;

  if (!unlocked) {
    return (
      <View
        className="items-center justify-center rounded-full"
        style={{ width: size, height: size, backgroundColor: palette.hairline }}
      >
        <Icon name="lock" size={size * 0.42} color={palette.ink3} stroke={2} />
      </View>
    );
  }

  return (
    <View
      className="items-center justify-center overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        shadowColor: palette.goldDeep,
        shadowOpacity: 0.45,
        shadowRadius: size * 0.22,
        shadowOffset: { width: 0, height: size * 0.1 },
        elevation: 5
      }}
    >
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={palette.gold} />
            <Stop offset="1" stopColor={palette.goldDeep} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={size} height={size} fill={`url(#${gradId})`} />
      </Svg>
      <Icon name={icon} size={size * 0.46} color="#fff" stroke={2} />
    </View>
  );
};
