import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";

import { FormField, FormInput } from "@/components/FormField";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { authConfig, hasGoogleAuthConfig } from "@/services/authConfig";
import { authService } from "@/services/authService";
import { useUserStore } from "@/store/userStore";
import { useAppPalette } from "@/theme/useAppPalette";

const titleCase = (provider: "google" | "apple") => `${provider[0].toUpperCase()}${provider.slice(1)}`;

const isExpoGo = Constants.appOwnership === "expo";

const getGoogleSignin = () => {
  if (isExpoGo) {
    return null;
  }

  try {
    return require("@react-native-google-signin/google-signin").GoogleSignin as {
      configure: (options: { iosClientId?: string; webClientId?: string; offlineAccess?: boolean }) => void;
      hasPlayServices: (options: { showPlayServicesUpdateDialog: boolean }) => Promise<boolean>;
      signIn: () => Promise<{ type: "success"; data: { idToken: string | null } } | { type: "cancelled"; data: null }>;
    };
  } catch {
    return null;
  }
};

export const AuthScreen = () => {
  const palette = useAppPalette();
  const signIn = useUserStore((state) => state.signIn);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [pendingProvider, setPendingProvider] = useState<"email" | "google" | "apple" | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(Platform.OS === "ios");

  const completeSignIn = (provider: "email" | "google" | "apple", userName: string, userEmail: string) => {
    signIn(provider, userName, userEmail);
    router.replace("/(tabs)/dashboard");
  };

  useEffect(() => {
    AppleAuthentication.isAvailableAsync()
      .then(setAppleAvailable)
      .catch(() => setAppleAvailable(false));
  }, []);

  useEffect(() => {
    const googleSignin = getGoogleSignin();
    if (!googleSignin) {
      return;
    }

    googleSignin.configure(
      Platform.OS === "ios"
        ? {
            iosClientId: authConfig.google.iosClientId || undefined,
            offlineAccess: false
          }
        : {
            webClientId: authConfig.google.webClientId || undefined,
            offlineAccess: false
          }
    );
  }, []);

  const handleEmail = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing info", "Enter both your email and password.");
      return;
    }

    try {
      setPendingProvider("email");
      const result =
        mode === "signup"
          ? await authService.signUpWithEmail(name, email, password)
          : await authService.signInWithEmail(email, password);

      completeSignIn(result.provider, result.userName, result.userEmail);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in right now.";
      Alert.alert(mode === "signup" ? "Couldn’t create account" : "Couldn’t log in", message);
    } finally {
      setPendingProvider(null);
    }
  };

  const handleProvider = async (provider: "google" | "apple") => {
    try {
      if (provider === "google") {
        if (!hasGoogleAuthConfig()) {
          Alert.alert(
            "Google sign-in needs client IDs",
            "Add your EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID, and EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID values, then restart Expo."
          );
          return;
        }

        const googleSignin = getGoogleSignin();
        if (!googleSignin) {
          Alert.alert(
            "Google sign-in needs a development build",
            "Expo Go doesn't include the native Google module. Build and open the app as a development build to test Google sign-in."
          );
          return;
        }

        setPendingProvider("google");
        if (Platform.OS === "android") {
          await googleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        }
        const response = await googleSignin.signIn();
        if (response.type === "cancelled") {
          setPendingProvider(null);
          return;
        }
        const idToken = response.data.idToken;
        if (!idToken) {
          throw new Error("Google did not return an ID token.");
        }
        const result = await authService.signInWithGoogleIdToken(idToken);
        completeSignIn(result.provider, result.userName, result.userEmail);
        return;
      }

      if (!appleAvailable) {
        Alert.alert("Apple sign-in isn't available here", "Apple sign-in works on supported Apple devices and builds.");
        return;
      }

      setPendingProvider("apple");
      const rawNonce = Crypto.randomUUID();
      const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
        nonce: hashedNonce
      });

      if (!credential.identityToken) {
        throw new Error("Apple did not return an identity token.");
      }

      const fullName = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(" ").trim();
      const result = await authService.signInWithAppleToken({
        idToken: credential.identityToken,
        rawNonce,
        fullName
      });

      completeSignIn(result.provider, result.userName, result.userEmail);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : `Unable to sign in with ${titleCase(provider)} right now.`;
      Alert.alert(`${titleCase(provider)} sign-in failed`, message);
      setPendingProvider(null);
    }
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

      <FormField label="Password">
        <FormInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          autoCapitalize="none"
        />
      </FormField>

      <Pressable
        className="mb-4 items-center rounded-[24px] px-5 py-4"
        style={{ backgroundColor: palette.primary }}
        onPress={handleEmail}
        disabled={pendingProvider !== null}
      >
        <Text className="font-serif text-[20px]" style={{ color: palette.background }}>
          {pendingProvider === "email" ? "Working..." : mode === "signup" ? "Create Account" : "Log In"}
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
          {(["google", "apple"] as const).map((provider) => (
            <Pressable
              key={provider}
              className="items-center rounded-[22px] px-4 py-4"
              style={{ backgroundColor: palette.background, borderWidth: 1, borderColor: palette.border }}
              onPress={() => handleProvider(provider)}
              disabled={pendingProvider !== null}
            >
              <Text className="capitalize" style={{ color: palette.primary }}>
                {pendingProvider === provider ? `Opening ${titleCase(provider)}...` : `Continue with ${provider}`}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
};
