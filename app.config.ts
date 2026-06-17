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
  userInterfaceStyle: "light",
  assetBundlePatterns: ["**/*"],
  experiments: {
    typedRoutes: true
  },
  plugins: [
    "expo-router",
    "expo-font",
    [
      "expo-splash-screen",
      {
        image: "./assets/icon/attendize-glass-1024.png",
        imageWidth: 180,
        backgroundColor: "#0F2820",
        dark: { image: "./assets/icon/attendize-glass-1024.png", backgroundColor: "#0F2820" }
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
    // Adds StoreKit (iOS) + Play Billing permission (Android) for in-app
    // subscriptions. Requires a dev/production build — not available in Expo Go.
    "react-native-iap",
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
      UIBackgroundModes: ["location"],
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
