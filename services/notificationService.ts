import { Platform } from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

import { AttendanceSettings, ClassModel, Weekday } from "@/utils/types";
import { formatTimeLabel, getNextSession } from "@/utils/date";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

const ANDROID_CHANNEL_ID = "reminders";

// expo-notifications weekday is 1-indexed starting Sunday.
const EXPO_WEEKDAY: Record<Weekday, number> = {
  Sunday: 1,
  Monday: 2,
  Tuesday: 3,
  Wednesday: 4,
  Thursday: 5,
  Friday: 6,
  Saturday: 7
};

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map((part) => Number(part));
  return (h || 0) * 60 + (m || 0);
};

const ensureAndroidChannel = async () => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: "Class reminders",
      importance: Notifications.AndroidImportance.DEFAULT
    });
  }
};

// Weekly-repeating local notification at a given weekday + minutes-into-day.
const scheduleWeekly = (weekday: number, minutesIntoDay: number, title: string, body: string) =>
  Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday,
      hour: Math.floor(minutesIntoDay / 60),
      minute: minutesIntoDay % 60,
      channelId: ANDROID_CHANNEL_ID
    }
  });

export const requestNotificationPermissions = async () => {
  const current = await Notifications.getPermissionsAsync();

  if (current.granted) {
    return current;
  }

  return Notifications.requestPermissionsAsync();
};

export const requestLocationPermissions = async () => Location.requestForegroundPermissionsAsync();

export const scheduleClassReminder = async (classItem: ClassModel, settings: AttendanceSettings) => {
  const nextSession = getNextSession(classItem.schedule);

  if (!nextSession) {
    return null;
  }

  const triggerDate = new Date(nextSession.startsAt);
  triggerDate.setMinutes(triggerDate.getMinutes() - settings.reminderMinutesBefore);

  if (triggerDate <= new Date()) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: classItem.name,
      body: `Class starts at ${nextSession.entry.startTime}. Check in on time and protect your streak.`
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate
    }
  });
};

export const scheduleRiskAlert = async (classItem: ClassModel, percentage: number) =>
  Notifications.scheduleNotificationAsync({
    content: {
      title: "Attendance risk alert",
      body: `${classItem.name} is currently at ${percentage}%. A quick check-in plan could help.`
    },
    trigger: null
  });

/**
 * Cancels all scheduled local notifications and re-creates weekly repeats from
 * the current schedule + settings. Idempotent — safe to call on every change.
 * Returns the number of notifications scheduled (0 if reminders are off or
 * permission hasn't been granted; we never auto-prompt here).
 */
export const syncScheduledReminders = async (classes: ClassModel[], settings: AttendanceSettings) => {
  const preClassOn = settings.reminderMinutesBefore > 0;
  const postClassOn = settings.missedCheckInDelayMinutes > 0;

  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!preClassOn && !postClassOn) {
    return 0;
  }

  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) {
    return 0;
  }

  await ensureAndroidChannel();

  let scheduled = 0;
  for (const classItem of classes) {
    for (const entry of classItem.schedule) {
      const weekday = EXPO_WEEKDAY[entry.day];

      if (preClassOn) {
        const at = toMinutes(entry.startTime) - settings.reminderMinutesBefore;
        if (at >= 0) {
          await scheduleWeekly(
            weekday,
            at,
            classItem.name,
            `Starts at ${formatTimeLabel(entry.startTime)}. Check in on time and protect your streak.`
          );
          scheduled += 1;
        }
      }

      if (postClassOn) {
        const at = toMinutes(entry.endTime) + settings.missedCheckInDelayMinutes;
        if (at < 24 * 60) {
          await scheduleWeekly(
            weekday,
            at,
            `Did you make it to ${classItem.name}?`,
            "Tap to log today's attendance before it slips your mind."
          );
          scheduled += 1;
        }
      }
    }
  }

  return scheduled;
};

export const buildLocationReminderSummary = async (settings: AttendanceSettings) => {
  if (!settings.locationRemindersEnabled) {
    return "Location reminders are currently off.";
  }

  const permission = await Location.getForegroundPermissionsAsync();

  return permission.granted
    ? "Location reminders are enabled and ready."
    : "Location reminders need foreground location permission.";
};
