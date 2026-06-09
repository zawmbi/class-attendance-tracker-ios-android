import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Platform, Pressable, Text, View } from "react-native";

import { FormField, FormInput } from "@/components/FormField";
import { ScreenContainer } from "@/components/ScreenContainer";
import { authConfig, hasGoogleAuthConfig } from "@/services/authConfig";
import { authService } from "@/services/authService";
import { useUserStore } from "@/store/userStore";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useAppPalette } from "@/theme/useAppPalette";

const titleCase = (provider: "google" | "apple") => `${provider[0].toUpperCase()}${provider.slice(1)}`;

const isExpoGo = Constants.appOwnership === "expo";

// Social sign-in is hidden until Google/Apple auth is fully configured for
// release. Email + guest ("Skip for now") remain available.
const SOCIAL_AUTH_ENABLED = false;

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
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);
  const loadSampleData = useAttendanceStore((state) => state.loadSampleData);
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

  // Lets you explore the whole app (with sample classes + records) without
  // creating an account — handy for testing and first-run previews. Loads the
  // demo data and skips onboarding so the app looks populated immediately.
  const handleGuest = () => {
    loadSampleData();
    completeOnboarding();
    completeSignIn("email", "Guest", "guest@demo.app");
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

  const busy = pendingProvider !== null;

  return (
    <ScreenContainer>
      <View className="items-center pt-8">
        <View
          className="h-[84px] w-[84px] items-center justify-center rounded-[26px]"
          style={{
            backgroundColor: palette.surface,
            borderWidth: 1,
            borderColor: palette.border,
            shadowColor: palette.primary,
            shadowOpacity: 0.12,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 }
          }}
        >
          <Image source={require("../AppLogo.png")} style={{ width: 54, height: 54, resizeMode: "contain" }} />
        </View>
        <Text className="mt-5 font-serif text-[36px] leading-[40px]" style={{ color: palette.primary }}>
          Attendize
        </Text>
        <Text className="mt-2 max-w-[320px] text-center text-sm leading-6" style={{ color: palette.muted }}>
          Track classes, protect your streak, and keep everything in one calm place.
        </Text>
      </View>

      <View
        className="mt-9 flex-row rounded-full p-1.5"
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
              <Text
                className="text-center text-[15px] capitalize"
                style={{ color: active ? palette.background : palette.muted }}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-6">
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
      </View>

      <Pressable
        className="mt-1 items-center rounded-[24px] px-5 py-4"
        style={{
          backgroundColor: palette.primary,
          opacity: busy ? 0.7 : 1,
          shadowColor: palette.primary,
          shadowOpacity: 0.22,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 10 }
        }}
        onPress={handleEmail}
        disabled={busy}
      >
        <Text className="font-serif text-[20px]" style={{ color: palette.background }}>
          {pendingProvider === "email" ? "Working..." : mode === "signup" ? "Create Account" : "Log In"}
        </Text>
      </Pressable>

      <Pressable
        className="mt-3 items-center rounded-[24px] px-5 py-4"
        style={{ borderWidth: 1.5, borderColor: palette.primary, opacity: busy ? 0.6 : 1 }}
        onPress={handleGuest}
        disabled={busy}
      >
        <Text className="text-[15px]" style={{ color: palette.primary }}>
          Skip for now — explore the demo →
        </Text>
      </Pressable>

      {SOCIAL_AUTH_ENABLED ? (
        <>
          <View className="my-6 flex-row items-center">
            <View className="h-px flex-1" style={{ backgroundColor: palette.border }} />
            <Text className="mx-3 text-[11px] uppercase tracking-[1.5px]" style={{ color: palette.muted }}>
              or continue with
            </Text>
            <View className="h-px flex-1" style={{ backgroundColor: palette.border }} />
          </View>

          <View className="gap-3">
            {appleAvailable ? (
              <Pressable
                className="flex-row items-center justify-center rounded-[24px] px-4 py-4"
                style={{ backgroundColor: palette.ink, opacity: busy ? 0.6 : 1 }}
                onPress={() => handleProvider("apple")}
                disabled={busy}
              >
                <Text className="text-[16px]" style={{ color: palette.background }}>
                  {pendingProvider === "apple" ? "Opening Apple..." : "Continue with Apple"}
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              className="flex-row items-center justify-center rounded-[24px] px-4 py-4"
              style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, opacity: busy ? 0.6 : 1 }}
              onPress={() => handleProvider("google")}
              disabled={busy}
            >
              <Text className="text-[16px]" style={{ color: palette.primary }}>
                {pendingProvider === "google" ? "Opening Google..." : "Continue with Google"}
              </Text>
            </Pressable>
          </View>
        </>
      ) : null}

      <Text className="mt-6 text-center text-xs leading-5" style={{ color: palette.muted }}>
        Demo mode loads sample classes so you can look around. Your real data stays private to you.
      </Text>
    </ScreenContainer>
  );
};
