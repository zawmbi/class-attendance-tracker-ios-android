import { PropsWithChildren, ReactNode, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Icon, IconName } from "@/components/Icon";
import { Segmented } from "@/components/attenza/Segmented";
import { Sheet } from "@/components/attenza/Sheet";
import { Toggle } from "@/components/attenza/Toggle";
import { FormInput } from "@/components/FormField";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useUserStore } from "@/store/userStore";
import { appConfig } from "@/theme";
import { useAppPalette } from "@/theme/useAppPalette";
import { deleteAccountAndWipe } from "@/utils/account";
import { getGamificationProfile } from "@/utils/gamification";

const Group = ({ header, footer, children }: PropsWithChildren<{ header?: string; footer?: string }>) => {
  const palette = useAppPalette();
  return (
    <View className="mb-5">
      {header ? (
        <Text className="mb-2 ml-1 text-[12.5px] tracking-[0.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
          {header.toUpperCase()}
        </Text>
      ) : null}
      <View className="overflow-hidden rounded-[18px]" style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}>
        {children}
      </View>
      {footer ? (
        <Text className="ml-1 mt-2 text-[12.5px] leading-[17px]" style={{ color: palette.ink3, fontFamily: "Outfit_500Medium" }}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
};

const Row = ({
  icon,
  iconBg,
  title,
  detail,
  right,
  onPress,
  first,
  danger
}: {
  icon: IconName;
  iconBg: string;
  title: string;
  detail?: string;
  right?: ReactNode;
  onPress?: () => void;
  first?: boolean;
  danger?: boolean;
}) => {
  const palette = useAppPalette();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center gap-3 px-3.5 py-3"
      style={first ? undefined : { borderTopWidth: 1, borderTopColor: palette.hairline }}
    >
      <View className="h-8 w-8 items-center justify-center rounded-[9px]" style={{ backgroundColor: iconBg }}>
        <Icon name={icon} size={18} color="#fff" stroke={2} />
      </View>
      <Text className="flex-1 text-[15.5px]" style={{ color: danger ? palette.absent : palette.ink, fontFamily: "Outfit_600SemiBold" }}>
        {title}
      </Text>
      {detail ? (
        <Text className="text-[14px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
          {detail}
        </Text>
      ) : null}
      {right}
      {onPress && !right ? <Icon name="chevron" size={17} color={palette.ink3} stroke={2} /> : null}
    </Pressable>
  );
};

const ChipRow = ({ label, options, value, onSelect, render, first }: {
  label: string;
  options: readonly (string | number)[];
  value: string | number;
  onSelect: (v: never) => void;
  render?: (v: string | number) => string;
  first?: boolean;
}) => {
  const palette = useAppPalette();
  return (
    <View className="px-3.5 py-3" style={first ? undefined : { borderTopColor: palette.hairline, borderTopWidth: StyleSheet.hairlineWidth * 4 }}>
      <Text className="mb-2 text-[12.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((opt) => {
          const on = opt === value;
          return (
            <Pressable
              key={String(opt)}
              onPress={() => onSelect(opt as never)}
              className="rounded-full px-3.5 py-2"
              style={{ backgroundColor: on ? palette.forest : palette.paper2, borderWidth: on ? 0 : 1, borderColor: palette.hairline }}
            >
              <Text className="text-[13px]" style={{ color: on ? "#fff" : palette.ink2, fontFamily: "Outfit_700Bold" }}>
                {render ? render(opt) : String(opt)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export const SettingsScreen = () => {
  const palette = useAppPalette();
  const router = useRouter();
  const { classes, records, settings, updateSettings, loadSampleData, reset: clearData } = useAttendanceStore();
  const { themeMode, userName, setThemeMode, setUserName, signOut, resetOnboarding, isDev, isPremium } = useUserStore();
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  const openNameEdit = () => {
    setNameDraft(userName);
    setEditingName(true);
  };
  const saveName = () => {
    const trimmed = nameDraft.trim();
    if (trimmed) {
      setUserName(trimmed);
    }
    setEditingName(false);
  };

  const handleLoadSample = () => {
    Alert.alert(
      "Load sample data?",
      "This replaces your current classes and records with the demo set so you can explore a populated app.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Load demo", onPress: () => loadSampleData() }
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      "Start fresh?",
      "This removes all your classes and records and restarts the get-started flow — as if it were a brand-new account. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear data",
          style: "destructive",
          onPress: () => {
            clearData();
            resetOnboarding();
          }
        }
      ]
    );
  };
  const profile = useMemo(() => getGamificationProfile(classes, records, settings), [classes, records, settings]);
  const initial = (userName || "A").trim().charAt(0).toUpperCase();

  const confirmDeleteAccount = () => {
    Alert.alert(
      "Delete account?",
      "This permanently deletes your account and erases all your classes, records, and progress on this device. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete account",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccountAndWipe();
            } catch (error) {
              const message =
                error instanceof Error && /requires-recent-login/.test(error.message)
                  ? "For your security, please sign out and sign back in, then delete your account."
                  : "We couldn't delete your account right now. Please try again.";
              Alert.alert("Couldn't delete account", message);
            }
          }
        }
      ]
    );
  };

  return (
    <ScreenContainer wideMaxWidth={720}>
      <Text className="mb-4 text-[32px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
        Settings
      </Text>

      {/* Profile */}
      <Pressable onPress={openNameEdit} className="mb-4 flex-row items-center gap-3.5 px-1">
        <View
          className="h-[62px] w-[62px] items-center justify-center rounded-full"
          style={{ backgroundColor: palette.forest, shadowColor: palette.forestDeep, shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}
        >
          <Text style={{ color: "#fff", fontFamily: "Outfit_800ExtraBold", fontSize: 26 }}>{initial}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-[20px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
            {userName || "Your account"}
          </Text>
          <Text className="text-[14px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
            {profile.rank.title} · Level {profile.level}
          </Text>
        </View>
        <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}>
          <Icon name="edit" size={17} color={palette.ink2} stroke={2} />
        </View>
      </Pressable>

      {/* Premium */}
      <Group header="Subscription" footer={isPremium ? "Manage or cancel anytime in your App Store account settings." : undefined}>
        <Row
          icon="crown"
          iconBg={palette.goldDeep}
          title={isPremium ? "Attendize Premium" : "Upgrade to Premium"}
          detail={isPremium ? "Active" : undefined}
          onPress={() => router.push("/premium")}
          first
        />
      </Group>

      {/* Appearance */}
      <Group header="Appearance">
        <View className="flex-row items-center gap-3 px-3.5 py-3">
          <View className="h-8 w-8 items-center justify-center rounded-[9px]" style={{ backgroundColor: palette.moss }}>
            <Icon name="today" size={18} color="#fff" stroke={2} />
          </View>
          <Text className="flex-1 text-[15.5px]" style={{ color: palette.ink, fontFamily: "Outfit_600SemiBold" }}>
            Theme
          </Text>
          <View style={{ width: 132 }}>
            <Segmented options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} value={themeMode} onChange={(v) => setThemeMode(v as "light" | "dark")} />
          </View>
        </View>
      </Group>

      {/* Reminders */}
      <Group header="Reminders">
        <ChipRow
          first
          label="REMIND BEFORE CLASS"
          options={appConfig.reminderOptions}
          value={settings.reminderMinutesBefore}
          onSelect={(v) => updateSettings({ reminderMinutesBefore: v })}
          render={(v) => (v === 0 ? "Off" : `${v} min`)}
        />
        <ToggleRow icon="bell" iconBg={palette.late} title="Motivation messages" value={settings.motivationMessagesEnabled} onChange={(v) => updateSettings({ motivationMessagesEnabled: v })} />
        <ToggleRow icon="sparkles" iconBg={palette.moss} title="Daily motivation" value={settings.dailyMotivationNotificationsEnabled} onChange={(v) => updateSettings({ dailyMotivationNotificationsEnabled: v })} />
        <ToggleRow icon="calendar" iconBg={palette.excused} title="Weekly summary" value={settings.weeklyMotivationNotificationsEnabled} onChange={(v) => updateSettings({ weeklyMotivationNotificationsEnabled: v })} />
        <ToggleRow
          icon="bolt"
          iconBg={palette.goldDeep}
          title="Advanced reminders"
          value={settings.advancedRemindersEnabled}
          onChange={(v) => updateSettings({ advancedRemindersEnabled: v })}
        />
      </Group>

      {/* Defaults */}
      <Group header="New class defaults" footer="Applied to classes you add from now on.">
        <View className="px-3.5 pt-3">
          <Text className="mb-2 text-[12.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
            DEFAULT TERM
          </Text>
          <View className="flex-row flex-wrap gap-2 pb-1">
            {appConfig.academicTermOptions.map((term) => {
              const on = settings.defaultTermType === term;
              return (
                <Pressable key={term} onPress={() => updateSettings({ defaultTermType: term })} className="rounded-full px-3.5 py-2" style={{ backgroundColor: on ? palette.forest : palette.paper2, borderWidth: on ? 0 : 1, borderColor: palette.hairline }}>
                  <Text className="text-[13px] capitalize" style={{ color: on ? "#fff" : palette.ink2, fontFamily: "Outfit_700Bold" }}>
                    {term}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <ChipRow
          label="COURSE LENGTH"
          options={appConfig.courseLengthOptions}
          value={settings.defaultCourseLengthWeeks}
          onSelect={(v) => updateSettings({ defaultCourseLengthWeeks: v })}
          render={(v) => `${v} wk`}
        />
        <ToggleRow icon="lock" iconBg={palette.ink2} title="Lock attendance rules" value={settings.attendanceRulesLocked} onChange={(v) => updateSettings({ attendanceRulesLocked: v })} />
      </Group>

      {/* General */}
      <Group header="General">
        <Row icon="book" iconBg={palette.ink2} title="Help & feedback" onPress={() => {}} first />
        <Row icon="laurel" iconBg={palette.goldDeep} title="About Attendize" detail="v1.0" />
      </Group>

      {isDev ? (
        <Group header="Demo & data (dev)" footer="Only visible on the dev login. Switch between the demo set and a clean start to test both new-user and populated states.">
          <Row icon="sparkles" iconBg={palette.goldDeep} title="Load sample data" onPress={handleLoadSample} first />
          <Row icon="trash" iconBg={palette.absent} title="Clear all data & start fresh" danger onPress={handleClearData} />
        </Group>
      ) : null}

      <Group footer="Signs you out of this device.">
        <Row icon="back" iconBg={palette.absent} title="Sign out" danger onPress={signOut} first />
      </Group>

      <Group footer="Permanently deletes your account and all data. This can't be undone.">
        <Row icon="close" iconBg={palette.absent} title="Delete account" danger onPress={confirmDeleteAccount} first />
      </Group>

      <Sheet open={editingName} onClose={() => setEditingName(false)}>
        <Text className="text-[13px] tracking-[0.5px]" style={{ color: palette.goldDeep, fontFamily: "Outfit_800ExtraBold" }}>
          DISPLAY NAME
        </Text>
        <Text className="mb-4 mt-0.5 text-[19px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
          Edit your nickname
        </Text>
        <FormInput
          value={nameDraft}
          onChangeText={setNameDraft}
          placeholder="Your name"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={saveName}
          maxLength={40}
        />
        <Pressable onPress={saveName} className="mt-4 items-center rounded-[16px] py-3.5" style={{ backgroundColor: palette.forest }}>
          <Text className="text-[16px]" style={{ color: palette.onGradient, fontFamily: "Outfit_800ExtraBold" }}>
            Save
          </Text>
        </Pressable>
      </Sheet>
    </ScreenContainer>
  );
};

const ToggleRow = ({ icon, iconBg, title, value, onChange }: { icon: IconName; iconBg: string; title: string; value: boolean; onChange: (v: boolean) => void }) => {
  const palette = useAppPalette();
  return (
    <View className="flex-row items-center gap-3 px-3.5 py-3" style={{ borderTopWidth: StyleSheet.hairlineWidth * 4, borderTopColor: palette.hairline }}>
      <View className="h-8 w-8 items-center justify-center rounded-[9px]" style={{ backgroundColor: iconBg }}>
        <Icon name={icon} size={18} color="#fff" stroke={2} />
      </View>
      <Text className="flex-1 text-[15.5px]" style={{ color: palette.ink, fontFamily: "Outfit_600SemiBold" }}>
        {title}
      </Text>
      <Toggle value={value} onChange={onChange} />
    </View>
  );
};
