import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";

import { AttendanceRecord, AttendanceSettings, AttendanceStatus, ClassModel, Weekday } from "@/utils/types";

export const GEOFENCE_TASK = "attendize-class-geofence";
// Same key zustand-persist writes to (store/attendanceStore.ts). The background
// task reads/writes it directly since it has no access to the live store.
const STORE_KEY = "attendance-tracker-storage";
const DEFAULT_RADIUS_METERS = 120;
const LATE_GRACE_MINUTES = 10;

const WEEKDAY_BY_INDEX: Weekday[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type PersistedStore = {
  state?: { classes?: ClassModel[]; records?: AttendanceRecord[]; settings?: Partial<AttendanceSettings> };
};

const notify = (title: string, body: string) =>
  Notifications.scheduleNotificationAsync({ content: { title, body }, trigger: null });

const minutesOf = (time: string) => {
  const [h, m] = time.split(":").map((p) => Number(p));
  return (h || 0) * 60 + (m || 0);
};

// Defined at module scope so it's registered as early as the module is imported
// (see the side-effect import in app/_layout.tsx). Runs headless in the
// background, so all data comes from / goes to AsyncStorage.
TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }) => {
  if (error) return;
  const { eventType, region } = (data ?? {}) as {
    eventType?: Location.GeofencingEventType;
    region?: Location.LocationRegion;
  };
  if (eventType !== Location.GeofencingEventType.Enter || !region?.identifier) return;

  try {
    const raw = await AsyncStorage.getItem(STORE_KEY);
    const blob: PersistedStore = raw ? JSON.parse(raw) : {};
    const state = blob.state ?? {};
    const classes = state.classes ?? [];
    const records = state.records ?? [];
    const settings = state.settings ?? {};

    const classItem = classes.find((c) => c.id === region.identifier);
    const name = classItem?.name ?? "your class";

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const weekday = WEEKDAY_BY_INDEX[now.getDay()];
    const entry = classItem?.schedule?.find((s) => s.day === weekday);

    // Auto check-in: log presence on arrival (Premium opt-in).
    if (settings.autoCheckInEnabled && classItem && entry) {
      const alreadyLogged = records.some((r) => r.classId === classItem.id && r.date === today);
      if (alreadyLogged) {
        await notify(`You're at ${name}`, "Already logged for today — you're all set.");
        return;
      }
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const status: AttendanceStatus = nowMinutes <= minutesOf(entry.startTime) + LATE_GRACE_MINUTES ? "present" : "late";
      const newRecord: AttendanceRecord = {
        id: `record-${Date.now()}`,
        classId: classItem.id,
        date: today,
        status,
        notes: "Auto check-in"
      };
      blob.state = { ...state, records: [newRecord, ...records] };
      await AsyncStorage.setItem(STORE_KEY, JSON.stringify(blob));
      await notify(
        `✓ Checked in to ${name}`,
        status === "late" ? "Marked late — you arrived after class started." : "Marked present. Nice work."
      );
      return;
    }

    // Default: just nudge.
    await notify(`You're near ${name}`, "Looks like you've arrived — tap to check in.");
  } catch {
    // Swallow — a failed background event shouldn't crash the task.
  }
});

/** Foreground + background location permission, needed for geofencing/region monitoring. */
export const requestGeofencePermissions = async () => {
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (!foreground.granted) return false;
  const background = await Location.requestBackgroundPermissionsAsync();
  return background.granted;
};

/**
 * Starts/stops geofencing to match the current classes + settings. Idempotent.
 * Returns the number of regions being monitored (0 if disabled or no coords).
 */
export const syncGeofences = async (classes: ClassModel[], settings: AttendanceSettings) => {
  const alreadyRunning = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK).catch(() => false);

  const regionsSource = settings.locationRemindersEnabled
    ? classes.filter((c) => typeof c.latitude === "number" && typeof c.longitude === "number")
    : [];

  if (regionsSource.length === 0) {
    if (alreadyRunning) {
      await Location.stopGeofencingAsync(GEOFENCE_TASK).catch(() => {});
    }
    return 0;
  }

  const background = await Location.getBackgroundPermissionsAsync().catch(() => null);
  if (!background?.granted) {
    return 0;
  }

  const regions: Location.LocationRegion[] = regionsSource.map((c) => ({
    identifier: c.id,
    latitude: c.latitude as number,
    longitude: c.longitude as number,
    radius: DEFAULT_RADIUS_METERS,
    notifyOnEnter: true,
    notifyOnExit: false
  }));

  await Location.startGeofencingAsync(GEOFENCE_TASK, regions);
  return regions.length;
};
