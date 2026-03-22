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
  name: "Attendance Tracker",
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
    "expo-notifications",
    "expo-web-browser",
    "expo-apple-authentication",
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme: getGoogleIosUrlScheme()
      }
    ]
  ],
  icon: "./AppLogo.png",
  ios: {
    supportsTablet: true,
    usesAppleSignIn: true,
    bundleIdentifier: "com.attendancetrackerappsorganization.attendancetrackerapp",
    googleServicesFile: "./GoogleService-Info.plist",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false
    }
  },
  android: {
    package: "com.attendancetrackerappsorganization.attendancetrackerapp",
    googleServicesFile: "./google-services.json",
    adaptiveIcon: {
      backgroundColor: "#F5F1E8",
      foregroundImage: "./AppLogo.png"
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
