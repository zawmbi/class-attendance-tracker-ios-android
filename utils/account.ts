import AsyncStorage from "@react-native-async-storage/async-storage";

import { authService } from "@/services/authService";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useGamificationStore } from "@/store/gamificationStore";
import { useUserStore } from "@/store/userStore";

// AsyncStorage keys backing each persisted zustand store.
const PERSIST_KEYS = [
  "attendance-user-storage",
  "attendance-gamification-storage",
  "attendance-tracker-storage"
];

// Permanently deletes the user's account and erases all on-device data.
// Order: remove the Firebase account first (so a failure aborts before we wipe
// local data), then reset in-memory state, then clear persisted storage.
// Resetting userStore flips `isAuthenticated` to false, which the root layout
// uses to redirect back to the auth screen.
export const deleteAccountAndWipe = async (): Promise<void> => {
  await authService.deleteAccount();

  useAttendanceStore.getState().reset();
  useGamificationStore.getState().reset();
  useUserStore.getState().reset();

  await AsyncStorage.multiRemove(PERSIST_KEYS);
};
