import { PropsWithChildren, useEffect, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppPalette } from "@/theme/useAppPalette";

interface SheetProps extends PropsWithChildren {
  open: boolean;
  onClose: () => void;
}

// Bottom sheet — radius sheet, rises with ease-out, dim backdrop, grab handle.
export const Sheet = ({ open, onClose, children }: SheetProps) => {
  const palette = useAppPalette();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(open);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (open) {
      setMounted(true);
      progress.value = reduceMotion ? 1 : withTiming(1, { duration: 240, easing: Easing.bezier(0.22, 1, 0.36, 1) });
    } else if (mounted) {
      progress.value = reduceMotion
        ? 0
        : withTiming(0, { duration: 200, easing: Easing.bezier(0.22, 1, 0.36, 1) }, (finished) => {
            if (finished) {
              // toggled back on the JS thread to unmount once hidden
            }
          });
      // unmount slightly after the exit animation
      const timer = setTimeout(() => setMounted(false), reduceMotion ? 0 : 220);
      return () => clearTimeout(timer);
    }
  }, [open, reduceMotion, progress, mounted]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - progress.value) * 480 }] }));

  if (!mounted) {
    return null;
  }

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Animated.View style={[{ position: "absolute", inset: 0, backgroundColor: "rgba(20,30,25,0.4)" }, backdropStyle]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Dismiss" />
        </Animated.View>
        <Animated.View
          style={[
            {
              backgroundColor: palette.card,
              borderTopLeftRadius: 34,
              borderTopRightRadius: 34,
              paddingHorizontal: 20,
              paddingTop: 14,
              paddingBottom: Math.max(insets.bottom, 16) + 20,
              shadowColor: palette.forestDeep,
              shadowOpacity: 0.28,
              shadowRadius: 32,
              shadowOffset: { width: 0, height: -8 },
              elevation: 24
            },
            sheetStyle
          ]}
        >
          <View style={{ width: 38, height: 5, borderRadius: 100, backgroundColor: palette.hairline, alignSelf: "center", marginBottom: 14 }} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};
