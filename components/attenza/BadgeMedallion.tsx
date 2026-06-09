import { Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { Icon, IconName } from "@/components/Icon";
import { useAppPalette } from "@/theme/useAppPalette";
import { AchievementTier } from "@/utils/gamification";

interface BadgeMedallionProps {
  /** Emoji glyph to show (preferred). Falls back to `icon` if omitted. */
  emoji?: string;
  icon?: IconName;
  /** Tier sets the medallion's metal color. Defaults to gold. */
  tier?: AchievementTier;
  size?: number;
  unlocked?: boolean;
}

// Light→deep gradient per metal, so gold/silver/bronze badges read as distinct
// rarities instead of one flat gold.
const TIER_GRADIENT: Record<AchievementTier, [string, string]> = {
  gold: ["#F1D074", "#C68F2A"],
  silver: ["#D2DBD6", "#8C988F"],
  bronze: ["#DDA471", "#9C6233"]
};

const TIER_GLOW: Record<AchievementTier, string> = {
  gold: "#C68F2A",
  silver: "#8C988F",
  bronze: "#9C6233"
};

let gradSeed = 0;

// A minted-coin medallion: tier gradient disc + soft white rim highlight + a
// glow in the tier color when unlocked; muted disc with a dimmed glyph / lock
// when still locked.
export const BadgeMedallion = ({ emoji, icon, tier = "gold", size = 62, unlocked = true }: BadgeMedallionProps) => {
  const palette = useAppPalette();
  const gradId = `badge-${(gradSeed += 1)}`;
  const [from, to] = TIER_GRADIENT[tier];

  if (!unlocked) {
    return (
      <View
        className="items-center justify-center rounded-full"
        style={{ width: size, height: size, backgroundColor: palette.hairline }}
      >
        {emoji ? (
          <Text style={{ fontSize: size * 0.46, opacity: 0.32 }}>{emoji}</Text>
        ) : (
          <Icon name={icon ?? "lock"} size={size * 0.42} color={palette.ink3} stroke={2} />
        )}
      </View>
    );
  }

  return (
    <View
      className="items-center justify-center overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        shadowColor: TIER_GLOW[tier],
        shadowOpacity: 0.5,
        shadowRadius: size * 0.24,
        shadowOffset: { width: 0, height: size * 0.1 },
        elevation: 5
      }}
    >
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="0.85" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={size} height={size} fill={`url(#${gradId})`} />
      </Svg>
      {/* soft minted rim */}
      <View
        style={{
          position: "absolute",
          top: size * 0.07,
          left: size * 0.07,
          right: size * 0.07,
          bottom: size * 0.07,
          borderRadius: size,
          borderWidth: Math.max(1, size * 0.03),
          borderColor: "rgba(255,255,255,0.28)"
        }}
      />
      {emoji ? (
        <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
      ) : (
        <Icon name={icon ?? "trophy"} size={size * 0.46} color="#fff" stroke={2} />
      )}
    </View>
  );
};
