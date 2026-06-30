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
    if (name.trim()) {
      await updateProfile(credential.user, { displayName: name.trim() });
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
