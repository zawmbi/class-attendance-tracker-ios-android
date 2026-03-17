import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

import { AttendanceSettings, ClassModel } from "@/utils/types";
import { getNextSession } from "@/utils/date";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
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

export const buildLocationReminderSummary = async (settings: AttendanceSettings) => {
  if (!settings.locationRemindersEnabled) {
    return "Location reminders are currently off.";
  }

  const permission = await Location.getForegroundPermissionsAsync();

  return permission.granted
    ? "Location reminders are enabled and ready."
    : "Location reminders need foreground location permission.";
};
