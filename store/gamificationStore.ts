import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface GamificationState {
  // Achievement ids the user has already seen celebrated. Anything unlocked but
  // not in this list is surfaced as "new" until acknowledged.
  acknowledgedAchievements: string[];
  acknowledgeAchievements: (ids: string[]) => void;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set) => ({
      acknowledgedAchievements: [],
      acknowledgeAchievements: (ids) =>
        set((state) => {
          const next = new Set(state.acknowledgedAchievements);
          let changed = false;
          for (const id of ids) {
            if (!next.has(id)) {
              next.add(id);
              changed = true;
            }
          }
          return changed ? { acknowledgedAchievements: Array.from(next) } : state;
        })
    }),
    {
      name: "attendance-gamification-storage",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
