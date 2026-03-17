import { Pressable, Switch, Text, View } from "react-native";

import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { useUserStore } from "@/store/userStore";
import { appConfig } from "@/theme";
import { useAttendanceStore } from "@/store/attendanceStore";
import { PriorityLevel } from "@/utils/types";

const chipClassName = "mr-2 rounded-full border border-border px-4 py-2";

export const SettingsScreen = () => {
  const {
    classes,
    settings,
    updateClassColor,
    updateClassPriority,
    updateRequiredAttendance,
    updateSettings
  } = useAttendanceStore();
  const { isPremium, preferredTheme, setTheme, openUpgradeModal } = useUserStore();

  return (
    <ScreenContainer>
      <SectionHeader title="Settings" subtitle="Reminders, class rules, priorities, and gentle motivation." />

      <View className="mb-6 rounded-card border border-border bg-surface p-5">
        <Text className="font-serif text-xl text-primary">Reminders</Text>
        <Text className="mt-2 text-sm text-muted">Choose when prompts arrive before class starts.</Text>
        <View className="mt-4 flex-row flex-wrap">
          {appConfig.reminderOptions.map((minutes) => (
            <Pressable
              key={minutes}
              className={`${chipClassName} ${settings.reminderMinutesBefore === minutes ? "bg-primary" : "bg-background"}`}
              onPress={() => updateSettings({ reminderMinutesBefore: minutes })}
            >
              <Text className={settings.reminderMinutesBefore === minutes ? "text-background" : "text-primary"}>
                {minutes} min
              </Text>
            </Pressable>
          ))}
        </View>
        <Text className="mt-5 text-sm text-muted">Missed check-in reminder</Text>
        <View className="mt-3 flex-row flex-wrap">
          {appConfig.missedCheckInOptions.map((minutes) => (
            <Pressable
              key={minutes}
              className={`${chipClassName} ${
                settings.missedCheckInDelayMinutes === minutes ? "bg-primary" : "bg-background"
              }`}
              onPress={() => updateSettings({ missedCheckInDelayMinutes: minutes })}
            >
              <Text className={settings.missedCheckInDelayMinutes === minutes ? "text-background" : "text-primary"}>
                {minutes} min
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="mb-6 rounded-card border border-border bg-surface p-5">
        <Text className="font-serif text-xl text-primary">Alerts & incentives</Text>
        <View className="mt-4 flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-base text-ink">Location-based reminders</Text>
            <Text className="mt-1 text-sm text-muted">Optional nudges when you are near class.</Text>
          </View>
          <Switch
            value={settings.locationRemindersEnabled}
            onValueChange={(value) => updateSettings({ locationRemindersEnabled: value })}
            trackColor={{ true: "#2F5D50", false: "#D9D0C1" }}
          />
        </View>
        <View className="mt-5 flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-base text-ink">Incentive system</Text>
            <Text className="mt-1 text-sm text-muted">Positive reinforcement messages and streak feedback.</Text>
          </View>
          <Switch
            value={settings.incentiveSystemEnabled}
            onValueChange={(value) => updateSettings({ incentiveSystemEnabled: value })}
            trackColor={{ true: "#2F5D50", false: "#D9D0C1" }}
          />
        </View>
        <View className="mt-5 flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-base text-ink">Motivation messages</Text>
            <Text className="mt-1 text-sm text-muted">Supportive insights with realistic, non-judgmental tone.</Text>
          </View>
          <Switch
            value={settings.motivationMessagesEnabled}
            onValueChange={(value) => updateSettings({ motivationMessagesEnabled: value })}
            trackColor={{ true: "#2F5D50", false: "#D9D0C1" }}
          />
        </View>
        <View className="mt-5 flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-base text-ink">Daily motivation notifications</Text>
            <Text className="mt-1 text-sm text-muted">Optional morning encouragement.</Text>
          </View>
          <Switch
            value={settings.dailyMotivationNotificationsEnabled}
            onValueChange={(value) => updateSettings({ dailyMotivationNotificationsEnabled: value })}
            trackColor={{ true: "#2F5D50", false: "#D9D0C1" }}
          />
        </View>
        <View className="mt-5 flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-base text-ink">Weekly motivation notifications</Text>
            <Text className="mt-1 text-sm text-muted">A gentle weekly summary and reset message.</Text>
          </View>
          <Switch
            value={settings.weeklyMotivationNotificationsEnabled}
            onValueChange={(value) => updateSettings({ weeklyMotivationNotificationsEnabled: value })}
            trackColor={{ true: "#2F5D50", false: "#D9D0C1" }}
          />
        </View>
      </View>

      <View className="mb-6 rounded-card border border-border bg-surface p-5">
        <Text className="font-serif text-xl text-primary">Reminder intelligence</Text>
        <View className="mt-4 flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-base text-ink">Advanced reminders</Text>
            <Text className="mt-1 text-sm text-muted">Leave-time alerts, persistent nudges, and timing adjustments.</Text>
          </View>
          <Switch
            value={settings.advancedRemindersEnabled && isPremium}
            onValueChange={(value) => {
              if (!isPremium) {
                openUpgradeModal("advanced_reminders");
                return;
              }

              updateSettings({ advancedRemindersEnabled: value });
            }}
            trackColor={{ true: "#2F5D50", false: "#D9D0C1" }}
          />
        </View>
      </View>

      <View className="mb-6 rounded-card border border-border bg-surface p-5">
        <Text className="font-serif text-xl text-primary">Attendance rules</Text>
        <Text className="mt-2 text-sm text-muted">Tune how quickly the app moves classes into warning or critical states.</Text>
        <Text className="mt-4 text-sm text-muted">Warning threshold</Text>
        <View className="mt-3 flex-row flex-wrap">
          {[75, 80, 85].map((value) => (
            <Pressable
              key={value}
              className={`${chipClassName} ${settings.riskThresholds.warning === value ? "bg-primary" : "bg-background"}`}
              disabled={settings.attendanceRulesLocked}
              onPress={() =>
                updateSettings({
                  riskThresholds: {
                    ...settings.riskThresholds,
                    warning: value
                  }
                })
              }
            >
              <Text className={settings.riskThresholds.warning === value ? "text-background" : "text-primary"}>
                {value}%
              </Text>
            </Pressable>
          ))}
        </View>
        <Text className="mt-5 text-sm text-muted">Critical threshold</Text>
        <View className="mt-3 flex-row flex-wrap">
          {[55, 60, 65].map((value) => (
            <Pressable
              key={value}
              className={`${chipClassName} ${settings.riskThresholds.critical === value ? "bg-primary" : "bg-background"}`}
              disabled={settings.attendanceRulesLocked}
              onPress={() =>
                updateSettings({
                  riskThresholds: {
                    ...settings.riskThresholds,
                    critical: value
                  }
                })
              }
            >
              <Text className={settings.riskThresholds.critical === value ? "text-background" : "text-primary"}>
                {value}%
              </Text>
            </Pressable>
          ))}
        </View>
        <View className="mt-5 flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-base text-ink">Lock attendance rules</Text>
            <Text className="mt-1 text-sm text-muted">Prevent accidental changes once your semester rules are set.</Text>
          </View>
          <Switch
            value={settings.attendanceRulesLocked}
            onValueChange={(value) => updateSettings({ attendanceRulesLocked: value })}
            trackColor={{ true: "#2F5D50", false: "#D9D0C1" }}
          />
        </View>
      </View>

      <View className="mb-6 rounded-card border border-border bg-surface p-5">
        <Text className="font-serif text-xl text-primary">Themes</Text>
        <Text className="mt-2 text-sm text-muted">Earthy presets keep the app calm while giving it your own rhythm.</Text>
        <View className="mt-4">
          {appConfig.earthyThemes.map((theme) => (
            <Pressable
              key={theme.id}
              className={`mb-3 rounded-2xl border px-4 py-4 ${
                preferredTheme === theme.id ? "border-primary bg-background" : "border-border bg-background"
              }`}
              onPress={() => {
                if (!isPremium) {
                  openUpgradeModal("theme_customization");
                  return;
                }

                setTheme(theme.id);
              }}
            >
              <Text className="font-serif text-lg text-primary">{theme.name}</Text>
              <Text className="mt-1 text-sm text-muted">{theme.description}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="rounded-card border border-border bg-surface p-5">
        <Text className="font-serif text-xl text-primary">Class preferences</Text>
        <View className="mt-4">
          {classes.map((classItem) => (
            <View key={classItem.id} className="mb-5 rounded-2xl bg-background p-4">
              <Text className="font-serif text-lg text-primary">{classItem.name}</Text>
              <Text className="mt-1 text-sm text-muted">Priority</Text>
              <View className="mt-3 flex-row flex-wrap">
                {appConfig.priorityOptions.map((priority) => (
                  <Pressable
                    key={priority}
                    className={`${chipClassName} ${classItem.priority === priority ? "bg-primary" : "bg-surface"}`}
                    onPress={() => updateClassPriority(classItem.id, priority as PriorityLevel)}
                  >
                    <Text className={classItem.priority === priority ? "text-background capitalize" : "text-primary capitalize"}>
                      {priority}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text className="mt-4 text-sm text-muted">Required attendance</Text>
              <View className="mt-3 flex-row flex-wrap">
                {[60, 70, 75, 80, 85, 90].map((value) => (
                  <Pressable
                    key={value}
                    className={`${chipClassName} ${classItem.requiredAttendance === value ? "bg-primary" : "bg-surface"}`}
                    disabled={settings.attendanceRulesLocked}
                    onPress={() => updateRequiredAttendance(classItem.id, value)}
                  >
                    <Text className={classItem.requiredAttendance === value ? "text-background" : "text-primary"}>
                      {value}%
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text className="mt-4 text-sm text-muted">Class color</Text>
              <View className="mt-3 flex-row flex-wrap">
                {appConfig.classColorOptions.map((color) => (
                  <Pressable
                    key={color}
                    className="mr-3 h-10 w-10 rounded-full border-2"
                    style={{
                      backgroundColor: color,
                      borderColor: classItem.color === color ? "#1F352E" : "#F5F1E8"
                    }}
                    onPress={() => updateClassColor(classItem.id, color)}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>

      {!isPremium ? (
        <View className="mt-6">
          <PremiumFeatureCard
            title="Premium calm tools"
            description="Unlock predictive simulations, advanced reminders, behavioral insights, and full earthy theme customization with a one-time purchase."
            onPress={() => openUpgradeModal("theme_customization")}
          />
        </View>
      ) : null}
    </ScreenContainer>
  );
};
