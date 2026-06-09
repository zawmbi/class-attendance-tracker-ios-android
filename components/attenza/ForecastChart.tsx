import { View } from "react-native";
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from "react-native-svg";

import { useAppPalette } from "@/theme/useAppPalette";

interface ForecastChartProps {
  history: number[];
  projected: number;
  target: number;
  height?: number;
}

// Solid history line + gradient area, dashed gold projection toward `projected`,
// and a dashed target line. Scales 55–100%.
export const ForecastChart = ({ history, projected, target, height = 130 }: ForecastChartProps) => {
  const palette = useAppPalette();
  const W = 320;
  const H = height;
  const pad = 10;
  const min = 55;
  const max = 100;
  const hist = history.length >= 2 ? history : [target, target];
  const n = hist.length + 3;
  const x = (i: number) => pad + (i / (n - 1)) * (W - pad * 2);
  const y = (v: number) => H - pad - ((Math.max(min, Math.min(max, v)) - min) / (max - min)) * (H - pad * 2);

  const histPts = hist.map((v, i) => [x(i), y(v)] as const);
  const last = hist[hist.length - 1];
  const projPts = [0, 1, 2, 3].map((k) => [x(hist.length - 1 + k), y(last + (projected - last) * (k / 3))] as const);
  const line = (pts: readonly (readonly [number, number])[]) =>
    pts.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const targetY = y(target);

  return (
    <View>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <LinearGradient id="fcFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={palette.forest} stopOpacity={0.18} />
            <Stop offset="1" stopColor={palette.forest} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Line x1={pad} y1={targetY} x2={W - pad} y2={targetY} stroke={palette.goldDeep} strokeWidth={1.5} strokeDasharray="2 4" opacity={0.7} />
        <Path d={`${line(histPts)} L ${histPts[histPts.length - 1][0]} ${H - pad} L ${histPts[0][0]} ${H - pad} Z`} fill="url(#fcFill)" />
        <Path d={line(histPts)} fill="none" stroke={palette.forest} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <Path d={line(projPts)} fill="none" stroke={palette.goldDeep} strokeWidth={2.5} strokeDasharray="3 4" strokeLinecap="round" />
        <Circle cx={histPts[histPts.length - 1][0]} cy={histPts[histPts.length - 1][1]} r={3.2} fill={palette.forest} />
        <Circle cx={projPts[projPts.length - 1][0]} cy={projPts[projPts.length - 1][1]} r={4} fill={palette.goldDeep} />
      </Svg>
    </View>
  );
};
