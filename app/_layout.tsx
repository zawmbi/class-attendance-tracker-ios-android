import "@/global.css";

import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";

import { UpgradeModal } from "@/components/UpgradeModal";
import { palette } from "@/theme";

const applyGlobalTypography = () => {
  const textStyle = { fontFamily: "Alice", color: palette.ink };
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
  const [loaded] = useFonts({
    Alice: require("../Alice/Alice-Regular.ttf")
  });

  useEffect(() => {
    applyGlobalTypography();
  }, []);

  if (!loaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: palette.background
          }
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="class/[id]" />
      </Stack>
      <UpgradeModal />
    </>
  );
}
