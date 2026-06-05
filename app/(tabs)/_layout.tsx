import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Redirect, Tabs, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

import { Icon, IconName } from "@/components/Icon";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useUserStore } from "@/store/userStore";
import { useAppPalette } from "@/theme/useAppPalette";
import { useIsWide } from "@/theme/responsive";
import { getGamificationProfile } from "@/utils/gamification";

// Tab bar IA from the handoff: Today · Calendar · [Check-In FAB] · Insights · Trophy.
type Slot =
  | { kind: "tab"; route: string; icon: IconName; label: string }
  | { kind: "fab" }
  | { kind: "push"; href: string; icon: IconName; label: string };

const BOTTOM_SLOTS: Slot[] = [
  { kind: "tab", route: "dashboard", icon: "today", label: "Today" },
  { kind: "tab", route: "calendar", icon: "calendar", label: "Calendar" },
  { kind: "fab" },
  { kind: "tab", route: "insights", icon: "insights", label: "Insights" },
  { kind: "push", href: "/achievements", icon: "trophy", label: "Trophy" }
];

// iPad sidebar nav: Today · Insights · Forecast · Calendar · Trophy.
type SideItem =
  | { kind: "tab"; route: string; icon: IconName; label: string; tone?: "gold" }
  | { kind: "push"; href: string; icon: IconName; label: string };

const SIDE_ITEMS: SideItem[] = [
  { kind: "tab", route: "dashboard", icon: "today", label: "Today" },
  { kind: "tab", route: "insights", icon: "insights", label: "Insights" },
  { kind: "tab", route: "analytics", icon: "chart", label: "Forecast", tone: "gold" },
  { kind: "tab", route: "calendar", icon: "calendar", label: "Calendar" },
  { kind: "push", href: "/achievements", icon: "trophy", label: "Trophy" }
];

function LogoMark({ palette }: { palette: ReturnType<typeof useAppPalette> }) {
  return (
    <Svg width={38} height={38}>
      <Defs>
        <LinearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={palette.forest} />
          <Stop offset="1" stopColor={palette.forestDeep} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="38" height="38" rx="11" fill="url(#logoGrad)" />
      <Path d="M12 19.5l4 4 8-8.6" fill="none" stroke={palette.gold} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" transform="translate(0.5 0)" />
    </Svg>
  );
}

function Sidebar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const palette = useAppPalette();
  const router = useRouter();
  const isPremium = useUserStore((s) => s.isPremium);
  const userName = useUserStore((s) => s.userName);
  const { classes, records, settings } = useAttendanceStore();
  const profile = useMemo(() => getGamificationProfile(classes, records, settings), [classes, records, settings]);
  const activeRoute = state.routes[state.index]?.name;
  const initial = (userName || "A").trim().charAt(0).toUpperCase();
  const firstName = userName ? userName.split(" ")[0] : "Student";

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        width: 248,
        backgroundColor: palette.card,
        borderRightWidth: 1,
        borderRightColor: palette.hairline,
        paddingTop: insets.top + 26,
        paddingBottom: insets.bottom + 16,
        paddingHorizontal: 18
      }}
    >
      {/* Logo */}
      <View className="mb-6 flex-row items-center gap-3 px-2">
        <LogoMark palette={palette} />
        <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 24, color: palette.ink }}>Attendize</Text>
      </View>

      {/* Nav */}
      <View className="gap-1">
        {SIDE_ITEMS.map((item) => {
          const active = item.kind === "tab" && activeRoute === item.route;
          const isGold = item.kind === "tab" && item.tone === "gold";
          const tint = active ? (isGold ? palette.goldDeep : palette.forest) : palette.ink3;
          const bg = active ? (isGold ? palette.goldSoft : palette.forestSoft) : "transparent";
          return (
            <Pressable
              key={item.kind === "tab" ? item.route : item.href}
              onPress={() => (item.kind === "tab" ? navigation.navigate(item.route as never) : router.push(item.href as never))}
              className="flex-row items-center gap-3 rounded-[16px] px-3.5 py-3"
              style={{ backgroundColor: bg }}
            >
              <Icon name={item.icon} size={24} color={tint} filled={active} />
              <Text style={{ fontFamily: "Outfit_700Bold", fontSize: 16, color: active ? tint : palette.ink2 }}>{item.label}</Text>
              {isGold ? (
                <View style={{ marginLeft: "auto" }}>
                  <Icon name={isPremium ? "sparkles" : "lock"} size={15} color={palette.goldDeep} stroke={2.2} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {/* Check in */}
      <Pressable
        onPress={() => navigation.navigate("check-in" as never)}
        className="mt-4 flex-row items-center justify-center gap-2 overflow-hidden rounded-[16px] py-3.5"
        style={{ shadowColor: palette.forestDeep, shadowOpacity: 0.3, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 5 }}
      >
        <Svg style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} width="100%" height="100%">
          <Defs>
            <LinearGradient id="sideCheckGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={palette.forest} />
              <Stop offset="1" stopColor={palette.forestDeep} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#sideCheckGrad)" />
        </Svg>
        <Icon name="checkin" size={22} color="#fff" stroke={2} />
        <Text style={{ fontFamily: "Outfit_800ExtraBold", fontSize: 16, color: "#fff" }}>Check in</Text>
      </Pressable>

      {/* Add class */}
      <Pressable
        onPress={() => router.push("/class/new" as never)}
        className="mt-2.5 flex-row items-center justify-center gap-2 rounded-[16px] py-3"
        style={{ backgroundColor: palette.forestSoft, borderWidth: 1, borderColor: palette.hairline }}
      >
        <Icon name="plus" size={20} color={palette.forest} stroke={2.4} />
        <Text style={{ fontFamily: "Outfit_800ExtraBold", fontSize: 15, color: palette.forest }}>Add class</Text>
      </Pressable>

      <View className="flex-1" />

      {/* Profile */}
      <Pressable onPress={() => navigation.navigate("settings" as never)} className="flex-row items-center gap-3 px-2 py-2.5">
        <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: palette.forest }}>
          <Text style={{ color: "#fff", fontFamily: "Outfit_700Bold", fontSize: 17 }}>{initial}</Text>
        </View>
        <View>
          <Text style={{ fontFamily: "Outfit_700Bold", fontSize: 15, color: palette.ink }}>{firstName}</Text>
          <Text style={{ fontFamily: "Outfit_600SemiBold", fontSize: 12.5, color: palette.ink3 }}>{profile.rank.title}</Text>
        </View>
      </Pressable>
    </View>
  );
}

function BottomBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const palette = useAppPalette();
  const router = useRouter();
  const dockHeight = Math.max(insets.bottom, 10) + 70;
  const activeRoute = state.routes[state.index]?.name;

  return (
    <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
      <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: dockHeight, backgroundColor: palette.background }} />
      <View
        style={{
          marginHorizontal: 16,
          marginBottom: Math.max(insets.bottom, 10),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
          backgroundColor: palette.card,
          borderRadius: 28,
          borderWidth: 1,
          borderColor: palette.hairline,
          paddingHorizontal: 10,
          shadowColor: palette.forestDeep,
          shadowOpacity: 0.16,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 12 },
          elevation: 10
        }}
      >
        {BOTTOM_SLOTS.map((slot) => {
          if (slot.kind === "fab") {
            return (
              <Pressable
                key="fab"
                accessibilityLabel="Check in"
                onPress={() => navigation.navigate("check-in" as never)}
                style={{
                  width: 60,
                  height: 60,
                  marginTop: -26,
                  borderRadius: 9999,
                  borderWidth: 3.5,
                  borderColor: palette.background,
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: palette.forestDeep,
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 8
                }}
              >
                <Svg width={60} height={60} style={{ position: "absolute" }}>
                  <Defs>
                    <LinearGradient id="fabGrad" x1="0" y1="0" x2="1" y2="1">
                      <Stop offset="0" stopColor={palette.forest} />
                      <Stop offset="1" stopColor={palette.forestDeep} />
                    </LinearGradient>
                  </Defs>
                  <Rect x="0" y="0" width="60" height="60" fill="url(#fabGrad)" />
                </Svg>
                <Icon name="checkin" size={30} color="#fff" stroke={2} />
              </Pressable>
            );
          }

          const isActive = slot.kind === "tab" && activeRoute === slot.route;
          const tint = isActive ? palette.forest : palette.ink3;
          return (
            <Pressable
              key={slot.kind === "tab" ? slot.route : slot.href}
              accessibilityLabel={slot.label}
              onPress={() => (slot.kind === "tab" ? navigation.navigate(slot.route as never) : router.push(slot.href as never))}
              style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 3, paddingVertical: 6 }}
            >
              <Icon name={slot.icon} size={25} color={tint} filled={isActive} stroke={isActive ? 1.9 : 1.75} />
              <Text style={{ fontSize: 10.5, color: tint, fontFamily: isActive ? "Outfit_800ExtraBold" : "Outfit_600SemiBold" }}>
                {slot.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ResponsiveTabBar(props: BottomTabBarProps) {
  const wide = useIsWide();
  return wide ? <Sidebar {...props} /> : <BottomBar {...props} />;
}

export default function TabsLayout() {
  const palette = useAppPalette();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const wide = useIsWide();

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      tabBar={(props) => <ResponsiveTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: palette.background, paddingLeft: wide ? 248 : 0 }
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Today" }} />
      <Tabs.Screen name="calendar" options={{ title: "Calendar" }} />
      <Tabs.Screen name="check-in" options={{ title: "Check-In" }} />
      <Tabs.Screen name="insights" options={{ title: "Insights" }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics", href: null }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", href: null }} />
    </Tabs>
  );
}
