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
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";

import { IapProvider } from "@/components/IapProvider";
import { UpgradeModal } from "@/components/UpgradeModal";
import { getPalette } from "@/theme";
import { useResolvedThemeMode } from "@/theme/useAppPalette";

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
    Outfit_800ExtraBold
  });

  useEffect(() => {
    applyGlobalTypography();
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
    </IapProvider>
  );
}
