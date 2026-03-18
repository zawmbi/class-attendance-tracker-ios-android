import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";

import { FormField, FormInput } from "@/components/FormField";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { authService } from "@/services/authService";
import { useUserStore } from "@/store/userStore";
import { useAppPalette } from "@/theme/useAppPalette";

export const AuthScreen = () => {
  const palette = useAppPalette();
  const signIn = useUserStore((state) => state.signIn);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");

  const handleEmail = async () => {
    const result =
      mode === "signup" ? await authService.signUpWithEmail(name, email) : await authService.signInWithEmail(email);
    signIn(result.provider, result.userName, result.userEmail);
    router.replace("/(tabs)/dashboard");
  };

  const handleProvider = async (provider: "google" | "facebook" | "apple") => {
    const result = await authService.signInWithProvider(provider);
    signIn(result.provider, result.userName, result.userEmail);
    router.replace("/(tabs)/dashboard");
  };

  return (
    <ScreenContainer>
      <SectionHeader title="Welcome" subtitle="Sign in to keep your attendance, classes, and themes with you." centered />

      <View
        className="mb-6 flex-row rounded-full p-1.5"
        style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
      >
        {(["login", "signup"] as const).map((option) => {
          const active = option === mode;
          return (
            <Pressable
              key={option}
              className="flex-1 rounded-full px-4 py-3"
              style={{ backgroundColor: active ? palette.primary : "transparent" }}
              onPress={() => setMode(option)}
            >
              <Text className="text-center capitalize" style={{ color: active ? palette.background : palette.primary }}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {mode === "signup" ? (
        <FormField label="Name">
          <FormInput value={name} onChangeText={setName} placeholder="Your name" />
        </FormField>
      ) : null}

      <FormField label="Email">
        <FormInput value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" />
      </FormField>

      <Pressable
        className="mb-4 items-center rounded-[24px] px-5 py-4"
        style={{ backgroundColor: palette.primary }}
        onPress={handleEmail}
      >
        <Text className="font-serif text-[20px]" style={{ color: palette.background }}>
          {mode === "signup" ? "Create Account" : "Log In"}
        </Text>
      </Pressable>

      <View
        className="rounded-[30px] px-5 py-5"
        style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
      >
        <Text className="text-center text-[11px] uppercase tracking-[1.8px]" style={{ color: palette.muted }}>
          Continue with
        </Text>
        <View className="mt-4 gap-3">
          {(["google", "facebook", "apple"] as const).map((provider) => (
            <Pressable
              key={provider}
              className="items-center rounded-[22px] px-4 py-4"
              style={{ backgroundColor: palette.background, borderWidth: 1, borderColor: palette.border }}
              onPress={() => handleProvider(provider)}
            >
              <Text className="capitalize" style={{ color: palette.primary }}>
                Continue with {provider}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
};
