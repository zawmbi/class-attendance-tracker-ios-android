import "@/global.css";
// Side-effect import: registers the background geofencing task at startup.
import "@/services/geofencing";

import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import {
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold
} from "@expo-google-fonts/fraunces";
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold
} from "@expo-google-fonts/outfit";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";

import { AnimatedSplash } from "@/components/AnimatedSplash";
import { IapProvider } from "@/components/IapProvider";
import { UpgradeModal } from "@/components/UpgradeModal";
import { getPalette } from "@/theme";
import { useResolvedThemeMode } from "@/theme/useAppPalette";

// Hold the native splash until the animated intro has actually painted, so the
// two don't cross-fade through a bare frame. AnimatedSplash hides it on mount.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden / unavailable — nothing to hold.
});

// Body/UI default font (Outfit). Hero numerals + rank names opt into the
// Fraunces display serif via the `font-display` class.
const BODY_FONT = "Outfit_400Regular";

const applyGlobalTypography = () => {
  const textStyle = { fontFamily: BODY_FONT };
  const TextComponent = Text as typeof Text & {
    defaultProps?: {
      style?: unknown;
    };
  };
  const TextInputComponent = TextInput as typeof TextInput & {
    defaultProps?: {
      style?: unknown;
    };
  };

  TextComponent.defaultProps = TextComponent.defaultProps ?? {};
  TextComponent.defaultProps.style = [textStyle, TextComponent.defaultProps.style];
  TextInputComponent.defaultProps = TextInputComponent.defaultProps ?? {};
  TextInputComponent.defaultProps.style = [textStyle, TextInputComponent.defaultProps.style];
};

export default function RootLayout() {
  const resolvedMode = useResolvedThemeMode();
  const activePalette = getPalette(resolvedMode);
  const [loaded, error] = useFonts({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    // Studio credit on the intro only. Subset to the glyphs in "Zawmbi
    // Productions" — the full Gamja Flower ships all of Hangul at 12.6 MB.
    GamjaFlower_400Regular: require("@/assets/fonts/GamjaFlower-Subset.ttf")
  });

  // Cold-launch intro. Plays once per app start, over the app, then fades.
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    applyGlobalTypography();
  }, []);

  // Safety net: AnimatedSplash normally drops the native splash on layout. If
  // fonts neither load nor error, it would never mount and the splash would sit
  // there forever — so release it regardless after a few seconds.
  useEffect(() => {
    const bail = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 5000);
    return () => clearTimeout(bail);
  }, []);

  if (!loaded && !error) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: activePalette.background }}>
        <ActivityIndicator size="large" color={activePalette.primary} />
      </View>
    );
  }

  return (
    <IapProvider>
      <StatusBar style={resolvedMode === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: activePalette.background
          }
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="premium" options={{ presentation: "modal" }} />
        <Stack.Screen name="achievements" />
        <Stack.Screen name="dashboard/customize" />
        <Stack.Screen name="class/new" />
        <Stack.Screen name="class/edit/[id]" />
        <Stack.Screen name="class/[id]/record" />
        <Stack.Screen name="class/[id]" />
      </Stack>
      <UpgradeModal />
      {/* Last child so it covers the stack. iOS can't animate the native launch
          screen (it's a static storyboard), so the intro plays here once JS is
          ready and fades into the app. */}
      {introDone ? null : <AnimatedSplash onDone={() => setIntroDone(true)} />}
    </IapProvider>
  );
}
