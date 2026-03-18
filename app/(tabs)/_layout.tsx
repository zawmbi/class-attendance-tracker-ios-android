import { ReactElement } from "react";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Redirect, Tabs } from "expo-router";
import { Pressable, View } from "react-native";
import Svg, { Circle, Line, Path, Polyline, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUserStore } from "@/store/userStore";
import { useAppPalette } from "@/theme/useAppPalette";

const HomeIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Path d="M3.6 8.7L10 3.8l6.4 4.9v7a1.3 1.3 0 0 1-1.3 1.3h-2.8v-4.6H7.7V17H4.9a1.3 1.3 0 0 1-1.3-1.3v-7Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
  </Svg>
);

const CheckIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Circle cx="10" cy="10" r="7.2" stroke={color} strokeWidth="1.8" />
    <Polyline points="6.6 10.2 8.9 12.5 13.5 7.9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CalendarIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Rect x="3.2" y="4.6" width="13.6" height="12.2" rx="2" stroke={color} strokeWidth="1.8" />
    <Line x1="3.8" y1="8" x2="16.2" y2="8" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Line x1="6.5" y1="3.1" x2="6.5" y2="6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Line x1="13.5" y1="3.1" x2="13.5" y2="6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

const ChartIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Line x1="4" y1="16" x2="16" y2="16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Rect x="5" y="10.5" width="2.4" height="5.5" rx="1" fill={color} />
    <Rect x="8.8" y="7.5" width="2.4" height="8.5" rx="1" fill={color} />
    <Rect x="12.6" y="4.5" width="2.4" height="11.5" rx="1" fill={color} />
  </Svg>
);

const GearIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Circle cx="10" cy="10" r="2.6" stroke={color} strokeWidth="1.8" />
    <Path d="M10 3.2v1.5M10 15.3v1.5M16.8 10h-1.5M4.7 10H3.2M14.8 5.2l-1 1M6.2 13.8l-1 1M14.8 14.8l-1-1M6.2 6.2l-1-1" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

const icons: Record<string, (props: { color: string }) => ReactElement> = {
  dashboard: HomeIcon,
  "check-in": CheckIcon,
  calendar: CalendarIcon,
  analytics: ChartIcon,
  settings: GearIcon
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const palette = useAppPalette();
  const dockHeight = Math.max(insets.bottom, 10) + 62;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: dockHeight,
          backgroundColor: palette.background,
        }}
      />
      <View
        style={{
          marginLeft: 22,
          marginRight: 22,
          marginBottom: Math.max(insets.bottom, 10),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: palette.surface,
          borderRadius: 32,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: palette.border,
          paddingHorizontal: 10,
          paddingVertical: 9,
          shadowColor: palette.primary,
          shadowOpacity: 0.08,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8
        }}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];
          const Icon = icons[route.name];

          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 12,
                marginHorizontal: 2
              }}
            >
              {Icon ? <Icon color={isFocused ? palette.primary : palette.muted} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const palette = useAppPalette();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: palette.background
        }
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Home" }} />
      <Tabs.Screen name="check-in" options={{ title: "Check-In" }} />
      <Tabs.Screen name="calendar" options={{ title: "Calendar" }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics" }} />
      <Tabs.Screen name="insights" options={{ title: "Insights", href: null }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
