export const authConfig = {
  google: {
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "",
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "",
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? ""
  }
};

export const hasGoogleAuthConfig = () =>
  Boolean(authConfig.google.webClientId || authConfig.google.iosClientId || authConfig.google.androidClientId);
