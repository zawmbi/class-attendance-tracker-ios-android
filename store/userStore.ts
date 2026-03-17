import { create } from "zustand";

import { ThemePreset, UpgradeTrigger, UserProfile } from "@/utils/types";

interface UserState extends UserProfile {
  openUpgradeModal: (reason: UpgradeTrigger) => void;
  closeUpgradeModal: () => void;
  upgradeToPremium: () => void;
  setTheme: (theme: ThemePreset) => void;
  markPromptSeen: (reason: UpgradeTrigger) => void;
}

export const useUserStore = create<UserState>((set) => ({
  isPremium: false,
  preferredTheme: "fern",
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
  markPromptSeen: (reason) =>
    set((state) => ({
      seenUpgradePrompts: state.seenUpgradePrompts.includes(reason)
        ? state.seenUpgradePrompts
        : [...state.seenUpgradePrompts, reason]
    }))
}));
