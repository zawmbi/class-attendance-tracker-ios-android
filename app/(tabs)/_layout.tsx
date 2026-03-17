import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { palette } from "@/theme";

const labels: Record<string, string> = {
  dashboard: "Dashboard",
  "check-in": "Check-In",
  analytics: "Analytics",
  insights: "Insights",
  settings: "Settings"
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
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
          marginLeft: 16,
          marginRight: 16,
          marginBottom: Math.max(insets.bottom, 10),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: palette.surface,
          borderRadius: 30,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: palette.border,
          paddingHorizontal: 8,
          paddingVertical: 8,
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
          const label = labels[route.name] ?? options.title ?? route.name;

          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                paddingVertical: 12,
                marginHorizontal: 3,
                backgroundColor: isFocused ? palette.primary : "transparent"
              }}
            >
              <Text
                style={{
                  fontFamily: "Alice",
                  fontSize: 12,
                  color: isFocused ? palette.background : palette.muted
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
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
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="check-in" options={{ title: "Check-In" }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics" }} />
      <Tabs.Screen name="insights" options={{ title: "Insights" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
