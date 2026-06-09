import { useRef, useState } from "react";
import { PanResponder, View } from "react-native";

import { useAppPalette } from "@/theme/useAppPalette";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  tone?: string;
}

// Lightweight drag slider (PanResponder, no native dep). Maps touch x → value.
export const Slider = ({ value, onChange, min = 0, max = 100, step = 1, tone }: SliderProps) => {
  const palette = useAppPalette();
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);
  const accent = tone ?? palette.forest;

  const toValue = (x: number) => {
    const w = widthRef.current || 1;
    const ratio = Math.max(0, Math.min(1, x / w));
    const raw = min + ratio * (max - min);
    return Math.round(raw / step) * step;
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => onChange(toValue(e.nativeEvent.locationX)),
      onPanResponderMove: (e) => onChange(toValue(e.nativeEvent.locationX))
    })
  ).current;

  const ratio = max > min ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0;

  return (
    <View
      {...responder.panHandlers}
      onLayout={(e) => {
        widthRef.current = e.nativeEvent.layout.width;
        setWidth(e.nativeEvent.layout.width);
      }}
      style={{ height: 32, justifyContent: "center" }}
    >
      <View style={{ height: 6, borderRadius: 999, backgroundColor: palette.hairline }}>
        <View style={{ width: ratio * width, height: 6, borderRadius: 999, backgroundColor: accent }} />
      </View>
      <View
        style={{
          position: "absolute",
          left: Math.max(0, ratio * width - 11),
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: "#fff",
          borderWidth: 2,
          borderColor: accent,
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3
        }}
      />
    </View>
  );
};
