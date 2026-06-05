import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

import { Icon, IconName } from "@/components/Icon";
import { darkPalette as d } from "@/theme";

const FEATURES: { icon: IconName; title: string; sub: string; route?: string }[] = [
  { icon: "chart", title: "Forecast & grade-aware projections", sub: "See exactly how each class will finish", route: "/(tabs)/analytics" },
  { icon: "grid", title: "Buffer & streak at a glance", sub: "Always know how many classes you can miss" },
  { icon: "sparkles", title: "Unlimited classes & history", sub: "Track your whole schedule" },
  { icon: "flame", title: "Streak protection", sub: "Keep your momentum through breaks & days off" }
];

export const PremiumScreen = () => {
  const router = useRouter();

  return (
    <View className="flex-1" style={{ backgroundColor: d.paper }}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="premBg" cx="50%" cy="0%" r="120%">
            <Stop offset="0" stopColor="#243F35" />
            <Stop offset="0.6" stopColor={d.paper} />
            <Stop offset="1" stopColor={d.paper} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#premBg)" />
      </Svg>

      <SafeAreaView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          <View className="flex-row justify-end pt-1">
            <Pressable
              accessibilityLabel="Close"
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <Icon name="close" size={20} color="#fff" />
            </Pressable>
          </View>

          {/* Hero */}
          <View className="items-center pt-2">
            <View
              className="mb-4 h-[78px] w-[78px] items-center justify-center rounded-[22px]"
              style={{ backgroundColor: d.gold, shadowColor: d.goldDeep, shadowOpacity: 0.5, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 6 }}
            >
              <Icon name="crown" size={42} color="#fff" stroke={1.9} />
            </View>
            <Text className="text-[13px] tracking-[2px]" style={{ color: d.gold, fontFamily: "Outfit_800ExtraBold" }}>
              WHAT'S INCLUDED
            </Text>
            <Text className="mt-1.5 text-center text-[32px] leading-[36px]" style={{ color: "#fff", fontFamily: "Fraunces_600SemiBold" }}>
              Never miss the mark
            </Text>
            <Text className="mt-2.5 text-center text-[15.5px]" style={{ color: d.ink2, fontFamily: "Outfit_500Medium" }}>
              Everything you need to finish every class on track — all included, free.
            </Text>
          </View>

          {/* Features */}
          <View className="mt-6 gap-2.5">
            {FEATURES.map((f) => {
              const tappable = !!f.route;
              return (
                <Pressable
                  key={f.title}
                  disabled={!tappable}
                  onPress={() => f.route && router.push(f.route as never)}
                  className="flex-row items-center gap-3 rounded-[22px] p-3.5"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderWidth: tappable ? 1 : 0.5,
                    borderColor: tappable ? d.gold : "rgba(255,255,255,0.1)"
                  }}
                >
                  <View className="h-10 w-10 items-center justify-center rounded-[11px]" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                    <Icon name={f.icon} size={22} color={d.gold} stroke={2} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[15.5px]" style={{ color: "#fff", fontFamily: "Outfit_700Bold" }}>
                      {f.title}
                    </Text>
                    <Text className="text-[13px]" style={{ color: d.ink3, fontFamily: "Outfit_500Medium" }}>
                      {f.sub}
                    </Text>
                  </View>
                  {tappable ? (
                    <View className="flex-row items-center gap-0.5">
                      <Text className="text-[12.5px]" style={{ color: d.gold, fontFamily: "Outfit_800ExtraBold" }}>
                        Preview
                      </Text>
                      <Icon name="chevron" size={13} color={d.gold} stroke={2.4} />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          {/* Done */}
          <Pressable
            onPress={() => router.back()}
            className="mt-7 items-center rounded-[22px] py-4"
            style={{ backgroundColor: d.gold, shadowColor: d.goldDeep, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 5 }}
          >
            <Text style={{ color: "#3a2a06", fontFamily: "Outfit_800ExtraBold", fontSize: 17 }}>Done</Text>
          </Pressable>
          <Text className="mt-3 text-center text-[13px]" style={{ color: d.ink3, fontFamily: "Outfit_600SemiBold" }}>
            All features are included for everyone.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
