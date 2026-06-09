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
  upgradeToPremium: () => void;
  setTheme: (theme: ThemePreset) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setDashboardWidgetOrder: (order: DashboardWidget[]) => void;
  moveDashboardWidget: (widget: DashboardWidget, direction: "up" | "down") => void;
  signIn: (provider: AuthProvider, userName: string, userEmail: string) => void;
  setUserName: (userName: string) => void;
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
  isPremium: true,
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
  viewedForecast: false
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // All features are free (no in-app purchases). Premium is always on.
      ...initialUserState,
      openUpgradeModal: (reason) =>
        set((state) => ({
          upgradePrompt: state.seenUpgradePrompts.includes(reason) ? state.upgradePrompt : reason
        })),
      closeUpgradeModal: () => set({ upgradePrompt: null }),
      upgradeToPremium: () => set({ isPremium: true, upgradePrompt: null }),
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
      signOut: () =>
        set({
          isAuthenticated: false,
          authProvider: null,
          userName: "",
          userEmail: ""
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
      // Force premium on for any install that predates the free-for-all switch,
      // so no purchase/gated UI is ever shown.
      onRehydrateStorage: () => (state) => {
        if (state && !state.isPremium) {
          state.isPremium = true;
        }
      }
    }
  )
);
