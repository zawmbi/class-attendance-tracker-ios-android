import {
  createUserWithEmailAndPassword,
  deleteUser,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  signInWithCredential,
  signOut,
  updateProfile,
  UserCredential
} from "firebase/auth";

import { deleteDoc, doc } from "firebase/firestore";

import { auth, db } from "./firebase";

// Firebase surfaces things like `Firebase: Error (auth/operation-not-allowed).`,
// which tells a user nothing and tells us nothing either. Map the codes we can
// actually act on; anything unrecognised keeps its raw message so it's still
// diagnosable from a bug report.
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "That email already has an account. Try logging in instead.",
  "auth/invalid-email": "That doesn't look like a valid email address.",
  "auth/missing-password": "Enter a password.",
  "auth/weak-password": "Passwords need to be at least 6 characters.",
  "auth/wrong-password": "That email and password don't match.",
  "auth/invalid-credential": "That email and password don't match.",
  "auth/user-not-found": "No account found for that email.",
  "auth/user-disabled": "That account has been disabled.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
  "auth/network-request-failed": "Couldn't reach the server. Check your connection and try again.",
  // Configuration problems — the user can't fix these, so say so plainly rather
  // than implying they typed something wrong.
  "auth/operation-not-allowed": "Email sign-up isn't switched on for this app yet. Please let us know.",
  "auth/invalid-api-key": "The app is misconfigured and can't sign in. Please let us know.",
  "auth/api-key-not-valid": "The app is misconfigured and can't sign in. Please let us know.",
  "auth/configuration-not-found": "Sign-in isn't fully configured for this app yet. Please let us know."
};

export const describeAuthError = (error: unknown): string => {
  const code = typeof error === "object" && error !== null ? (error as { code?: string }).code : undefined;
  if (code && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
};

export interface AuthResult {
  credential: UserCredential;
  provider: "email" | "google" | "apple";
  userName: string;
  userEmail: string;
}

const getUserName = (credential: UserCredential, fallbackName?: string) =>
  fallbackName?.trim() || credential.user.displayName || credential.user.email?.split("@")[0] || "Student";

const buildAuthResult = (
  credential: UserCredential,
  provider: "email" | "google" | "apple",
  fallbackName?: string,
  fallbackEmail?: string
): AuthResult => ({
  credential,
  provider,
  userName: getUserName(credential, fallbackName),
  userEmail: credential.user.email || fallbackEmail || ""
});

export const authService = {
  signUpWithEmail: async (name: string, email: string, password: string): Promise<AuthResult> => {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);

    // The account exists from here on. Setting the display name is cosmetic — it
    // must NOT be able to fail the sign-up, or a transient error leaves the user
    // with a real Firebase account but an error on screen, and their retry then
    // fails as "email already in use" with no way forward. The name is passed
    // through to buildAuthResult regardless, so the app still shows it.
    if (name.trim()) {
      try {
        await updateProfile(credential.user, { displayName: name.trim() });
      } catch {
        // Non-fatal — carry on with the account we just created.
      }
    }

    return buildAuthResult(credential, "email", name, email.trim());
  },

  signInWithEmail: async (email: string, password: string): Promise<AuthResult> => {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);

    return buildAuthResult(credential, "email", undefined, email.trim());
  },

  signInWithGoogleIdToken: async (idToken: string): Promise<AuthResult> => {
    const credential = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
    return buildAuthResult(credential, "google");
  },

  signInWithAppleToken: async ({
    idToken,
    rawNonce,
    fullName
  }: {
    idToken: string;
    rawNonce: string;
    fullName?: string;
  }): Promise<AuthResult> => {
    const provider = new OAuthProvider("apple.com");
    const providerCredential = provider.credential({
      idToken,
      rawNonce
    });
    const credential = await signInWithCredential(auth, providerCredential);
    const parsedFullName = fullName?.trim();

    if (parsedFullName && !credential.user.displayName) {
      await updateProfile(credential.user, { displayName: parsedFullName });
    }

    return buildAuthResult(credential, "apple", parsedFullName);
  },

  signInWithProvider: async (provider: "google" | "apple"): Promise<AuthResult> => {
    throw new Error(`${provider} sign-in requires the matching OAuth flow first.`);
  },

  logOut: async (): Promise<void> => {
    await signOut(auth);
  },

  // Permanently deletes the signed-in Firebase user and their cloud backup
  // (App Store Guideline 5.1.1(v) requires in-app account deletion to remove the
  // user's data, not just the login). No-op for guest/demo sessions that never
  // created a Firebase account.
  deleteAccount: async (): Promise<void> => {
    const current = auth.currentUser;
    if (current) {
      // Delete the Firestore backup first, while still authenticated — security
      // rules only let a user delete their own doc, and removing the auth user
      // first would revoke that permission and orphan the data. Tolerate the
      // doc being absent (user never enabled cloud backup).
      try {
        await deleteDoc(doc(db, "users", current.uid));
      } catch {
        // No cloud backup to remove — proceed with account deletion.
      }
      await deleteUser(current);
    }
  }
};
