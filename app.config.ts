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
    "expo-notifications",
    "expo-web-browser",
    "expo-apple-authentication",
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme: getGoogleIosUrlScheme()
      }
    ],
    "./plugins/withFmtConstevalFix"
  ],
  icon: "./assets/icon/attendize-icon-1024.png",
  ios: {
    supportsTablet: true,
    usesAppleSignIn: true,
    bundleIdentifier: "com.attendancetrackerappsorganization.attendancetrackerapp",
    googleServicesFile: "./GoogleService-Info.plist",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSLocationWhenInUseUsageDescription:
        "Attendize reminds you when you're near class. You can turn this off anytime."
    }
  },
  android: {
    package: "com.attendancetrackerappsorganization.attendancetrackerapp",
    googleServicesFile: "./google-services.json",
    adaptiveIcon: {
      backgroundColor: "#0F2820",
      foregroundImage: "./assets/icon/attendize-icon-1024.png"
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
