import "@/global.css";

import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";

import { UpgradeModal } from "@/components/UpgradeModal";
import { useUserStore } from "@/store/userStore";
import { getPalette } from "@/theme";

const applyGlobalTypography = () => {
  const textStyle = { fontFamily: "Alice" };
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
  const themeMode = useUserStore((state) => state.themeMode);
  const activePalette = getPalette(themeMode);
  const [loaded] = useFonts({
    Alice: require("../Alice/Alice-Regular.ttf")
  });

  useEffect(() => {
    applyGlobalTypography();
  }, []);

  if (!loaded) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: activePalette.background }}>
        <ActivityIndicator size="large" color={activePalette.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={themeMode === "dark" ? "light" : "dark"} />
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
        <Stack.Screen name="premium" />
        <Stack.Screen name="dashboard/customize" />
        <Stack.Screen name="class/new" />
        <Stack.Screen name="class/edit/[id]" />
        <Stack.Screen name="class/[id]/record" />
        <Stack.Screen name="class/[id]" />
      </Stack>
      <UpgradeModal />
    </>
  );
}
