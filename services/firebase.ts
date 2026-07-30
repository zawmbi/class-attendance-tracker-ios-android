import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, initializeAuth, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBY3SogSIMYRchonfUShYkNvUKGC4JDOAI",
  authDomain: "attendize-93f67.firebaseapp.com",
  projectId: "attendize-93f67",
  storageBucket: "attendize-93f67.firebasestorage.app",
  messagingSenderId: "928649175841",
  appId: "1:928649175841:web:8819adcd042eb526e0d460",
  measurementId: "G-R9RCQCKXEE"
};

// getApps() guard so Fast Refresh doesn't try to re-initialize the app.
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/**
 * Auth MUST be created with AsyncStorage persistence.
 *
 * Plain getAuth() on React Native falls back to in-memory persistence, so the
 * Firebase session evaporates on every cold start. The app's own zustand store
 * still says "signed in", which makes it worse than an obvious logout: anything
 * reading auth.currentUser silently no-ops against a null user — cloud
 * backup/restore (services/syncService.ts) and, critically, account deletion
 * (services/authService.ts), which has to actually remove the Firestore doc to
 * match the published privacy policy.
 *
 * getReactNativePersistence is only present in the RN build of @firebase/auth,
 * which Metro resolves for `firebase/auth`; it isn't in the web typings, hence
 * the require + cast.
 */
const getRNPersistence = () =>
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  (require("firebase/auth") as { getReactNativePersistence: (s: unknown) => unknown })
    .getReactNativePersistence;

const createAuth = (): Auth => {
  try {
    return initializeAuth(app, {
      persistence: getRNPersistence()(AsyncStorage) as never
    });
  } catch {
    // Already initialized (duplicate import / Fast Refresh) — reuse it.
    return getAuth(app);
  }
};

export const auth = createAuth();
// Backing store for Premium cloud backup/sync (see services/syncService.ts).
// Requires Cloud Firestore to be enabled in the Firebase console with rules
// that scope each user to their own /users/{uid} document.
export const db = getFirestore(app);
