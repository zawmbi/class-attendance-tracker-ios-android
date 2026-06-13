import { PropsWithChildren, useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

import { useAppPalette } from "@/theme/useAppPalette";

interface SheetProps extends PropsWithChildren {
  open: boolean;
  onClose: () => void;
}

// Centered popup — a card that scales + fades in over a dim backdrop. Content
// scrolls if it's taller than the screen, and the card lifts above the keyboard.
export const Sheet = ({ open, onClose, children }: SheetProps) => {
  const palette = useAppPalette();
  const reduceMotion = useReducedMotion();
  const { height } = useWindowDimensions();
  const [mounted, setMounted] = useState(open);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (open) {
      setMounted(true);
      progress.value = reduceMotion ? 1 : withTiming(1, { duration: 200, easing: Easing.bezier(0.22, 1, 0.36, 1) });
    } else if (mounted) {
      progress.value = reduceMotion ? 0 : withTiming(0, { duration: 170, easing: Easing.bezier(0.22, 1, 0.36, 1) });
      const timer = setTimeout(() => setMounted(false), reduceMotion ? 0 : 190);
      return () => clearTimeout(timer);
    }
  }, [open, reduceMotion, progress, mounted]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.93 + 0.07 * progress.value }]
  }));

  if (!mounted) {
    return null;
  }

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[{ position: "absolute", inset: 0, backgroundColor: "rgba(20,30,25,0.45)" }, backdropStyle]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Dismiss" />
      </Animated.View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        pointerEvents="box-none"
        style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}
      >
        <Animated.View
          style={[
            {
              width: "100%",
              maxWidth: 460,
              maxHeight: height * 0.86,
              backgroundColor: palette.card,
              borderRadius: 28,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: palette.hairline,
              shadowColor: palette.forestDeep,
              shadowOpacity: 0.3,
              shadowRadius: 40,
              shadowOffset: { width: 0, height: 16 },
              elevation: 24
            },
            cardStyle
          ]}
        >
          <ScrollView
            contentContainerStyle={{ padding: 22 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
