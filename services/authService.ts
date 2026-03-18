import { AuthProvider } from "@/utils/types";

interface AuthResult {
  provider: AuthProvider;
  userName: string;
  userEmail: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  async signUpWithEmail(name: string, email: string): Promise<AuthResult> {
    await delay(350);
    return { provider: "email", userName: name || "New Student", userEmail: email };
  },
  async signInWithEmail(email: string): Promise<AuthResult> {
    await delay(300);
    return { provider: "email", userName: email.split("@")[0] || "Student", userEmail: email };
  },
  async signInWithProvider(provider: Exclude<AuthProvider, "email">): Promise<AuthResult> {
    await delay(300);
    const names = {
      google: "Google Student",
      facebook: "Facebook Student",
      apple: "Apple Student"
    } as const;
    return {
      provider,
      userName: names[provider],
      userEmail: `${provider}@attendance.app`
    };
  }
};
