import { router } from "expo-router";
import { Pressable, Switch, Text, View } from "react-native";

import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useUserStore } from "@/store/userStore";
import { appConfig } from "@/theme";
import { useAppPalette } from "@/theme/useAppPalette";

const chipClassName = "mr-2 rounded-full px-4 py-2.5";

const SettingRow = ({
  label,
  helper,
  value,
  onChange,
  palette,
  thumbColor,
  trackColor
}: {
  label: string;
  helper: string;
  value: boolean;
  onChange: (value: boolean) => void;
  palette: ReturnType<typeof useAppPalette>;
  thumbColor: string;
  trackColor: { true: string; false: string };
}) => (
  <View className="flex-row items-center justify-between py-3">
    <View className="flex-1 pr-4">
      <Text className="text-base" style={{ color: palette.ink }}>
        {label}
      </Text>
      <Text className="mt-1 text-sm leading-5" style={{ color: palette.muted }}>
        {helper}
      </Text>
    </View>
    <Switch value={value} onValueChange={onChange} trackColor={trackColor} thumbColor={thumbColor} />
  </View>
);

export const SettingsScreen = () => {
  const palette = useAppPalette();
  const { settings, updateSettings } = useAttendanceStore();
  const { isPremium, preferredTheme, themeMode, userName, userEmail, setTheme, setThemeMode, signOut, openUpgradeModal } =
    useUserStore();

  const switchTrackColor = { true: palette.primary, false: palette.border };
  const switchThumbColor = themeMode === "dark" ? palette.ink : "#FFFFFF";

  const cardStyle = {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border
  } as const;

  const chipStyle = (active: boolean, inactiveColor: string = palette.background) =>
    ({
      backgroundColor: active ? palette.primary : inactiveColor,
      borderWidth: active ? 0 : 1,
      borderColor: palette.border
    }) as const;

  return (
    <ScreenContainer>
      <SectionHeader title="Settings" />

      <View className="mb-6 rounded-card p-5" style={cardStyle}>
        <Text className="font-serif text-xl" style={{ color: palette.primary }}>
          Account
        </Text>
        <Text className="mt-3 text-base" style={{ color: palette.ink }}>
          {userName || "Not signed in"}
        </Text>
        <Text className="mt-1 text-sm" style={{ color: palette.muted }}>
          {userEmail || "Use the auth screen to sign in."}
        </Text>
        <Pressable
          className="mt-5 items-center rounded-[22px] px-4 py-3"
          style={{ backgroundColor: palette.background, borderWidth: 1, borderColor: palette.border }}
          onPress={signOut}
        >
          <Text style={{ color: palette.primary }}>Sign Out</Text>
        </Pressable>
      </View>

      <Pressable className="mb-6 rounded-card p-5" style={cardStyle} onPress={() => router.push("/premium" as never)}>
        <Text className="text-xs uppercase tracking-[1.5px]" style={{ color: palette.muted }}>
          {isPremium ? "Premium Active" : "Premium"}
        </Text>
        <Text className="mt-3 font-serif text-xl" style={{ color: palette.primary }}>
          {isPremium ? "View everything included" : "See what premium unlocks"}
        </Text>
        <Text className="mt-2 text-sm leading-6" style={{ color: palette.muted }}>
          {isPremium
            ? "Review your premium features, from syllabus import to predictive attendance planning."
            : "Explore predictive insights, syllabus scanning, advanced reminders, and the rest of the monthly plan."}
        </Text>
        <Text className="mt-4 text-sm" style={{ color: palette.primary }}>
          Open premium page ›
        </Text>
      </Pressable>

      <View className="mb-6 rounded-card p-5" style={cardStyle}>
        <Text className="font-serif text-xl" style={{ color: palette.primary }}>
          App Defaults
        </Text>
        <Text className="mt-2 text-sm leading-6" style={{ color: palette.muted }}>
          Choose the rhythm and rules new classes should start with.
        </Text>

        <Text className="mt-5 text-sm" style={{ color: palette.muted }}>
          Appearance
        </Text>
        <View className="mt-3 flex-row gap-3">
          {(["light", "dark"] as const).map((mode) => {
            const active = themeMode === mode;
            return (
              <Pressable key={mode} className="flex-1 rounded-[22px] px-4 py-4" style={chipStyle(active)} onPress={() => setThemeMode(mode)}>
                <Text className="text-center capitalize" style={{ color: active ? palette.background : palette.primary }}>
                  {mode}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mt-5 text-sm" style={{ color: palette.muted }}>
          Default term
        </Text>
        <View className="mt-3 flex-row flex-wrap">
          {appConfig.academicTermOptions.map((term) => (
            <Pressable key={term} className={chipClassName} style={chipStyle(settings.defaultTermType === term)} onPress={() => updateSettings({ defaultTermType: term })}>
              <Text className="capitalize" style={{ color: settings.defaultTermType === term ? palette.background : palette.primary }}>
                {term}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text className="mt-5 text-sm" style={{ color: palette.muted }}>
          Default course length
        </Text>
        <View className="mt-3 flex-row flex-wrap">
          {appConfig.courseLengthOptions.map((weeks) => (
            <Pressable key={weeks} className={chipClassName} style={chipStyle(settings.defaultCourseLengthWeeks === weeks)} onPress={() => updateSettings({ defaultCourseLengthWeeks: weeks })}>
              <Text style={{ color: settings.defaultCourseLengthWeeks === weeks ? palette.background : palette.primary }}>
                {weeks} wk
              </Text>
            </Pressable>
          ))}
        </View>

        <Text className="mt-5 text-sm" style={{ color: palette.muted }}>
          Risk thresholds
        </Text>
        <View className="mt-3 flex-row flex-wrap">
          {[75, 80, 85].map((value) => (
            <Pressable
              key={`warning-${value}`}
              className={chipClassName}
              style={chipStyle(settings.riskThresholds.warning === value)}
              disabled={settings.attendanceRulesLocked}
              onPress={() => updateSettings({ riskThresholds: { ...settings.riskThresholds, warning: value } })}
            >
              <Text style={{ color: settings.riskThresholds.warning === value ? palette.background : palette.primary }}>
                Warn {value}%
              </Text>
            </Pressable>
          ))}
          {[55, 60, 65].map((value) => (
            <Pressable
              key={`critical-${value}`}
              className={chipClassName}
              style={chipStyle(settings.riskThresholds.critical === value, palette.surface)}
              disabled={settings.attendanceRulesLocked}
              onPress={() => updateSettings({ riskThresholds: { ...settings.riskThresholds, critical: value } })}
            >
              <Text style={{ color: settings.riskThresholds.critical === value ? palette.background : palette.primary }}>
                Crit {value}%
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-3">
          <SettingRow
            label="Lock attendance rules"
            helper="Prevent accidental changes once your semester rules are set."
            value={settings.attendanceRulesLocked}
            onChange={(value) => updateSettings({ attendanceRulesLocked: value })}
            palette={palette}
            thumbColor={switchThumbColor}
            trackColor={switchTrackColor}
          />
        </View>
      </View>

      <View className="mb-6 rounded-card p-5" style={cardStyle}>
        <Text className="font-serif text-xl" style={{ color: palette.primary }}>
          Reminders & Support
        </Text>
        <Text className="mt-2 text-sm leading-6" style={{ color: palette.muted }}>
          Keep prompts gentle and useful instead of constant.
        </Text>

        <Text className="mt-5 text-sm" style={{ color: palette.muted }}>
          Before class
        </Text>
        <View className="mt-3 flex-row flex-wrap">
          {appConfig.reminderOptions.map((minutes) => (
            <Pressable key={minutes} className={chipClassName} style={chipStyle(settings.reminderMinutesBefore === minutes)} onPress={() => updateSettings({ reminderMinutesBefore: minutes })}>
              <Text style={{ color: settings.reminderMinutesBefore === minutes ? palette.background : palette.primary }}>
                {minutes === 0 ? "None" : `${minutes} min`}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text className="mt-5 text-sm" style={{ color: palette.muted }}>
          Missed check-in follow-up
        </Text>
        <View className="mt-3 flex-row flex-wrap">
          {appConfig.missedCheckInOptions.map((minutes) => (
            <Pressable key={minutes} className={chipClassName} style={chipStyle(settings.missedCheckInDelayMinutes === minutes)} onPress={() => updateSettings({ missedCheckInDelayMinutes: minutes })}>
              <Text style={{ color: settings.missedCheckInDelayMinutes === minutes ? palette.background : palette.primary }}>
                {minutes === 0 ? "None" : `${minutes} min`}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-3">
          <SettingRow
            label="Location-based reminders"
            helper="Optional nudges when you are near class."
            value={settings.locationRemindersEnabled}
            onChange={(value) => updateSettings({ locationRemindersEnabled: value })}
            palette={palette}
            thumbColor={switchThumbColor}
            trackColor={switchTrackColor}
          />
          <SettingRow
            label="Momentum card"
            helper="Keep the positive streak card on the dashboard."
            value={settings.incentiveSystemEnabled}
            onChange={(value) => updateSettings({ incentiveSystemEnabled: value })}
            palette={palette}
            thumbColor={switchThumbColor}
            trackColor={switchTrackColor}
          />
          <SettingRow
            label="Motivation messages"
            helper="Supportive notes with a realistic, non-judgmental tone."
            value={settings.motivationMessagesEnabled}
            onChange={(value) => updateSettings({ motivationMessagesEnabled: value })}
            palette={palette}
            thumbColor={switchThumbColor}
            trackColor={switchTrackColor}
          />
          <SettingRow
            label="Daily motivation"
            helper="Optional morning encouragement."
            value={settings.dailyMotivationNotificationsEnabled}
            onChange={(value) => updateSettings({ dailyMotivationNotificationsEnabled: value })}
            palette={palette}
            thumbColor={switchThumbColor}
            trackColor={switchTrackColor}
          />
          <SettingRow
            label="Weekly motivation"
            helper="A gentle weekly summary and reset message."
            value={settings.weeklyMotivationNotificationsEnabled}
            onChange={(value) => updateSettings({ weeklyMotivationNotificationsEnabled: value })}
            palette={palette}
            thumbColor={switchThumbColor}
            trackColor={switchTrackColor}
          />
          <SettingRow
            label="Advanced reminders"
            helper="Leave-time alerts, persistent nudges, and smarter timing."
            value={settings.advancedRemindersEnabled && isPremium}
            onChange={(value) => {
              if (!isPremium) {
                openUpgradeModal("advanced_reminders");
                return;
              }
              updateSettings({ advancedRemindersEnabled: value });
            }}
            palette={palette}
            thumbColor={switchThumbColor}
            trackColor={switchTrackColor}
          />
        </View>
      </View>

      <View className="mb-6 rounded-card p-5" style={cardStyle}>
        <Text className="font-serif text-xl" style={{ color: palette.primary }}>
          Themes
        </Text>
        <Text className="mt-2 text-sm leading-6" style={{ color: palette.muted }}>
          Earthy presets keep the app calm while giving it your own rhythm.
        </Text>
        <View className="mt-4">
          {appConfig.earthyThemes.map((theme) => (
            <Pressable
              key={theme.id}
              className="mb-3 rounded-2xl px-4 py-4"
              style={{
                backgroundColor: palette.background,
                borderWidth: 1,
                borderColor: preferredTheme === theme.id ? palette.primary : palette.border
              }}
              onPress={() => {
                if (!isPremium) {
                  openUpgradeModal("theme_customization");
                  return;
                }
                setTheme(theme.id);
              }}
            >
              <Text className="font-serif text-lg" style={{ color: palette.primary }}>
                {theme.name}
              </Text>
              <Text className="mt-1 text-sm" style={{ color: palette.muted }}>
                {theme.description}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {!isPremium ? (
        <View className="mt-2">
          <PremiumFeatureCard
            title="Premium calm tools"
            description="Unlock predictive simulations, advanced reminders, behavioral insights, and full earthy theme customization with a monthly subscription."
            onPress={() => openUpgradeModal("theme_customization")}
          />
        </View>
      ) : null}
    </ScreenContainer>
  );
};
