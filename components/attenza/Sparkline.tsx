import { View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { useAppPalette } from "@/theme/useAppPalette";

interface SparklineProps {
  data?: number[];
  width?: number;
  height?: number;
  tone?: string;
  fill?: boolean;
}

export const Sparkline = ({ data = [], width = 120, height = 40, tone, fill = true }: SparklineProps) => {
  const palette = useAppPalette();
  const stroke = tone ?? palette.forest;
  if (data.length < 2) {
    return <View style={{ width, height }} />;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((d, i) => [(i / (data.length - 1)) * width, height - ((d - min) / rng) * (height - 6) - 3]);
  const line = pts.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={stroke} stopOpacity={0.24} />
          <Stop offset="1" stopColor={stroke} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {fill ? <Path d={`${line} L ${width} ${height} L 0 ${height} Z`} fill="url(#sparkFill)" stroke="none" /> : null}
      <Path d={line} fill="none" stroke={stroke} strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={last[0]} cy={last[1]} r={3.2} fill={stroke} />
    </Svg>
  );
};
