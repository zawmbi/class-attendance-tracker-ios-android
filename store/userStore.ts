import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { AuthProvider, DashboardWidget, ThemeMode, ThemePreset, UpgradeTrigger, UserProfile } from "@/utils/types";

// Canonical widget set + default order. Used to migrate persisted orders that
// predate newer widgets (e.g. the trophy case) so nothing silently disappears.
export const DASHBOARD_WIDGETS: DashboardWidget[] = [
  "actions",
  "momentum",
  "trophies",
  "motivation",
  "today",
  "more_classes"
];

interface UserState extends UserProfile {
  openUpgradeModal: (reason: UpgradeTrigger) => void;
  closeUpgradeModal: () => void;
  // Sets the premium entitlement. Driven by the real subscription state
  // (purchase / restore) in IapProvider — never granted for free.
  setPremium: (active: boolean) => void;
  setTheme: (theme: ThemePreset) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setDashboardWidgetOrder: (order: DashboardWidget[]) => void;
  moveDashboardWidget: (widget: DashboardWidget, direction: "up" | "down") => void;
  signIn: (provider: AuthProvider, userName: string, userEmail: string) => void;
  setUserName: (userName: string) => void;
  // True only for the hidden dev/review login; gates demo & data tooling.
  isDev: boolean;
  setIsDev: (isDev: boolean) => void;
  signOut: () => void;
  reset: () => void;
  // First-run onboarding: false until the user finishes the get-started flow.
  onboarded: boolean;
  completeOnboarding: () => void;
  // Drives the third get-started step; set the first time the forecast is opened.
  viewedForecast: boolean;
  markForecastViewed: () => void;
  // Replays the first-run experience (used by "Start fresh" in Settings).
  resetOnboarding: () => void;
  markPromptSeen: (reason: UpgradeTrigger) => void;
}

// Initial profile/data fields, reused by reset() on account deletion.
const initialUserState = {
  // Premium starts locked; it's unlocked only by an active paid subscription
  // (granted via IapProvider after a real purchase or restore).
  isPremium: false,
  preferredTheme: "fern" as ThemePreset,
  themeMode: "light" as ThemeMode,
  isAuthenticated: false,
  authProvider: null as AuthProvider | null,
  userName: "",
  userEmail: "",
  dashboardWidgetOrder: [...DASHBOARD_WIDGETS],
  usageDays: 6,
  consistencyDays: 4,
  upgradePrompt: null as UpgradeTrigger | null,
  seenUpgradePrompts: [] as UpgradeTrigger[],
  onboarded: false,
  viewedForecast: false,
  isDev: false
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...initialUserState,
      openUpgradeModal: (reason) =>
        set((state) => ({
          upgradePrompt: state.seenUpgradePrompts.includes(reason) ? state.upgradePrompt : reason
        })),
      closeUpgradeModal: () => set({ upgradePrompt: null }),
      setPremium: (active) => set({ isPremium: active }),
      setTheme: (theme) => set({ preferredTheme: theme }),
      setThemeMode: (mode) => set({ themeMode: mode }),
      setDashboardWidgetOrder: (order) => set({ dashboardWidgetOrder: order }),
      moveDashboardWidget: (widget, direction) =>
        set((state) => {
          const order = [...state.dashboardWidgetOrder];
          const index = order.indexOf(widget);
          if (index === -1) return state;
          const target = direction === "up" ? index - 1 : index + 1;
          if (target < 0 || target >= order.length) return state;
          [order[index], order[target]] = [order[target], order[index]];
          return { dashboardWidgetOrder: order };
        }),
      signIn: (provider, userName, userEmail) =>
        set({
          isAuthenticated: true,
          authProvider: provider,
          userName,
          userEmail
        }),
      setUserName: (userName) => set({ userName }),
      setIsDev: (isDev) => set({ isDev }),
      signOut: () =>
        set({
          isAuthenticated: false,
          authProvider: null,
          userName: "",
          userEmail: "",
          isDev: false
        }),
      // Wipes the profile back to a fresh-install state (used by account deletion).
      reset: () => set({ ...initialUserState }),
      completeOnboarding: () => set({ onboarded: true }),
      markForecastViewed: () => set({ viewedForecast: true }),
      resetOnboarding: () => set({ onboarded: false, viewedForecast: false }),
      markPromptSeen: (reason) =>
        set((state) => ({
          seenUpgradePrompts: state.seenUpgradePrompts.includes(reason)
            ? state.seenUpgradePrompts
            : [...state.seenUpgradePrompts, reason]
        }))
    }),
    {
      name: "attendance-user-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Bump when changing persisted shape/semantics so migrate() runs.
      version: 1,
      migrate: (persisted, version) => {
        const state = persisted as Partial<UserProfile> | undefined;
        if (state && version < 1) {
          // Earlier builds granted "premium" to everyone for free. Reset it so
          // the paid subscription is the only source of truth; IapProvider's
          // restore() re-grants it on launch to anyone who actually purchased.
          state.isPremium = false;
        }
        return state as UserState;
      }
    }
  )
);
