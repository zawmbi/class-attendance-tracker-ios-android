import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  signInWithCredential,
  signOut,
  updateProfile,
  UserCredential
} from "firebase/auth";

import { auth } from "./firebase";

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
  }
};
