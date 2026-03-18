import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { AuthProvider, DashboardWidget, ThemeMode, ThemePreset, UpgradeTrigger, UserProfile } from "@/utils/types";

interface UserState extends UserProfile {
  openUpgradeModal: (reason: UpgradeTrigger) => void;
  closeUpgradeModal: () => void;
  upgradeToPremium: () => void;
  setTheme: (theme: ThemePreset) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setDashboardWidgetOrder: (order: DashboardWidget[]) => void;
  moveDashboardWidget: (widget: DashboardWidget, direction: "up" | "down") => void;
  signIn: (provider: AuthProvider, userName: string, userEmail: string) => void;
  signOut: () => void;
  markPromptSeen: (reason: UpgradeTrigger) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isPremium: false,
      preferredTheme: "fern",
      themeMode: "light",
      isAuthenticated: false,
      authProvider: null,
      userName: "",
      userEmail: "",
      dashboardWidgetOrder: ["actions", "momentum", "motivation", "today", "more_classes"],
      usageDays: 6,
      consistencyDays: 4,
      upgradePrompt: null,
      seenUpgradePrompts: [],
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
      signOut: () =>
        set({
          isAuthenticated: false,
          authProvider: null,
          userName: "",
          userEmail: ""
        }),
      markPromptSeen: (reason) =>
        set((state) => ({
          seenUpgradePrompts: state.seenUpgradePrompts.includes(reason)
            ? state.seenUpgradePrompts
            : [...state.seenUpgradePrompts, reason]
        }))
    }),
    {
      name: "attendance-user-storage",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
