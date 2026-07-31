import type { ExpoConfig } from "expo/config";

const getGoogleIosUrlScheme = () => {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "";
  if (!clientId) {
    return "com.googleusercontent.apps.missing-google-ios-client-id";
  }

  const suffix = clientId.replace(".apps.googleusercontent.com", "");
  return `com.googleusercontent.apps.${suffix}`;
};

const config: ExpoConfig = {
  name: "Attendize",
  slug: "attendance-tracker-app",
  scheme: "attendance-tracker",
  version: "1.0.0",
  orientation: "portrait",
  // "automatic" is required for the in-app "System" theme option to work at
  // all: pinned to "light", useColorScheme() always reports light and the
  // preference silently does nothing. See theme/useAppPalette.ts.
  userInterfaceStyle: "automatic",
  assetBundlePatterns: ["**/*"],
  experiments: {
    typedRoutes: true
  },
  plugins: [
    [
      // Build iOS pods as static frameworks. Required so Swift pods pulled in by
      // Google Sign-In (AppCheckCore) can integrate alongside non-modular pods
      // (GoogleUtilities, RecaptchaInterop) — otherwise `pod install` fails on a
      // clean machine (EAS) with "Swift pods cannot be integrated as static libraries".
      "expo-build-properties",
      {
        ios: { useFrameworks: "static" }
      }
    ],
    "expo-router",
    "expo-font",
    [
      // Bare background — the logo is deliberately a 1x1 transparent pixel.
      //
      // iOS can't animate the launch screen, so this static screen is only the
      // ground the animated intro draws onto (components/AnimatedSplash).
      // Showing the real icon here made it appear and then vanish a beat before
      // the intro started drawing its own mark.
      //
      // Omitting `image` entirely does NOT work: the plugin then emits a
      // storyboard with an empty <subviews/> but dangling constraints, and
      // falls back to systemBackgroundColor — i.e. a white launch screen.
      "expo-splash-screen",
      {
        image: "./assets/splash-empty.png",
        imageWidth: 1,
        backgroundColor: "#0F2820",
        dark: { image: "./assets/splash-empty.png", backgroundColor: "#0F2820" }
      }
    ],
    "expo-notifications",
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "Attendize uses your location in the background to remind you to check in when you arrive at class. You can turn this off anytime.",
        locationWhenInUsePermission:
          "Attendize reminds you when you're near class. You can turn this off anytime.",
        isAndroidBackgroundLocationEnabled: true
      }
    ],
    "expo-web-browser",
    "expo-apple-authentication",
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme: getGoogleIosUrlScheme()
      }
    ],
    "@bacons/apple-targets",
    "./plugins/withFmtConstevalFix"
  ],
  // Flat PNG for Android + fallback slots. iOS uses the Icon Composer
  // "liquid glass" .icon below (must be a string path to the .icon folder).
  icon: "./assets/icon/attendize-glass-1024.png",
  ios: {
    icon: "./assets/attendize-glass.icon",
    supportsTablet: true,
    usesAppleSignIn: true,
    appleTeamId: "ZQUQB39QGN",
    bundleIdentifier: "com.attendancetrackerappsorganization.attendancetrackerapp",
    googleServicesFile: "./GoogleService-Info.plist",
    entitlements: {
      "com.apple.security.application-groups": ["group.com.attendancetrackerappsorganization.attendancetrackerapp"]
    },
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      // Deliberately NO UIBackgroundModes: ["location"]. The only location
      // feature is geofencing (services/geofencing.ts) — region monitoring,
      // which iOS wakes the app for even when terminated, without the
      // background mode. Declaring it got the app rejected under guideline
      // 2.5.4 ("no features that require persistent location"). expo-location
      // force-set allowsBackgroundLocationUpdates for geofencing, which throws
      // without this key; patches/expo-location+19.0.8.patch makes it
      // conditional. Don't re-add this key without re-reading that patch.
      NSLocationWhenInUseUsageDescription:
        "Attendize reminds you when you're near class. You can turn this off anytime.",
      NSLocationAlwaysAndWhenInUseUsageDescription:
        "Attendize uses your location in the background to remind you to check in when you arrive at class. You can turn this off anytime."
    }
  },
  android: {
    package: "com.attendancetrackerappsorganization.attendancetrackerapp",
    googleServicesFile: "./google-services.json",
    adaptiveIcon: {
      backgroundColor: "#0F2820",
      foregroundImage: "./assets/icon/attendize-glass-1024.png"
    }
  },
  extra: {
    router: {},
    eas: {
      projectId: "3870d774-eded-4c01-909c-8795c2dc001c"
    }
  },
  owner: "attendancetrackerapps-organization"
};

export default config;
