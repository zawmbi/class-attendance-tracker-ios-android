import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

import { Icon, IconName } from "@/components/Icon";
import { useIap } from "@/components/IapProvider";
import { PremiumPlan } from "@/services/iap";
import { useUserStore } from "@/store/userStore";
import { darkPalette as d } from "@/theme";

const FEATURES: { icon: IconName; title: string; sub: string }[] = [
  { icon: "chart", title: "Forecast & grade-aware projections", sub: "See exactly how each class will finish" },
  { icon: "grid", title: "Behavioral insights & patterns", sub: "Weekday, time-of-day, and consistency analytics" },
  { icon: "sparkles", title: "Syllabus scanning", sub: "Auto-fill classes from pasted syllabus text" },
  { icon: "flame", title: "Advanced reminders & themes", sub: "Leave-time nudges and premium theme customization" }
];

// Apple's standard EULA (use your own Terms of Use URL if you have one).
const TERMS_URL = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";
// TODO: replace with your hosted privacy policy URL.
const PRIVACY_URL = "https://lindascomputing.xyz/class-attendance-tracker-ios-android/";
const MANAGE_URL =
  Platform.OS === "ios" ? "https://apps.apple.com/account/subscriptions" : "https://play.google.com/store/account/subscriptions";

export const PremiumScreen = () => {
  const router = useRouter();
  const isPremium = useUserStore((s) => s.isPremium);
  const { plans, loadingPlans, available, purchasing, restoring, purchase, restore } = useIap();
  const [selectedSku, setSelectedSku] = useState<string | null>(null);

  const selected =
    plans.find((p) => p.sku === selectedSku) ?? plans.find((p) => p.period === "year") ?? plans[0] ?? null;

  const handlePurchase = async () => {
    if (!selected) {
      return;
    }
    try {
      await purchase(selected);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      Alert.alert("Purchase incomplete", message);
    }
  };

  const handleRestore = async () => {
    try {
      const active = await restore();
      Alert.alert(
        active ? "Purchases restored" : "Nothing to restore",
        active
          ? "Your Premium subscription is active again."
          : "We couldn't find an active subscription on this account."
      );
    } catch {
      Alert.alert("Restore failed", "We couldn't reach the store. Please try again.");
    }
  };

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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, width: "100%", maxWidth: 640, alignSelf: "center" }}>
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
              ATTENDIZE PREMIUM
            </Text>
            <Text className="mt-1.5 text-center text-[32px] leading-[36px]" style={{ color: "#fff", fontFamily: "Fraunces_600SemiBold" }}>
              {isPremium ? "You're all set" : "Never miss the mark"}
            </Text>
            <Text className="mt-2.5 text-center text-[15.5px]" style={{ color: d.ink2, fontFamily: "Outfit_500Medium" }}>
              {isPremium
                ? "Your Premium subscription is active. Thanks for the support!"
                : "Unlock forecasting, deep insights, and smart reminders to finish every class on track."}
            </Text>
          </View>

          {/* Features */}
          <View className="mt-6 gap-2.5">
            {FEATURES.map((f) => (
              <View
                key={f.title}
                className="flex-row items-center gap-3 rounded-[22px] p-3.5"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.1)" }}
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
              </View>
            ))}
          </View>

          {isPremium ? (
            <>
              <Pressable
                onPress={() => Linking.openURL(MANAGE_URL)}
                className="mt-7 items-center rounded-[22px] py-4"
                style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}
              >
                <Text style={{ color: "#fff", fontFamily: "Outfit_700Bold", fontSize: 15 }}>Manage subscription</Text>
              </Pressable>
              <Pressable
                onPress={() => router.back()}
                className="mt-3 items-center rounded-[22px] py-4"
                style={{ backgroundColor: d.gold }}
              >
                <Text style={{ color: "#3a2a06", fontFamily: "Outfit_800ExtraBold", fontSize: 17 }}>Done</Text>
              </Pressable>
            </>
          ) : loadingPlans ? (
            <View className="mt-8 items-center">
              <ActivityIndicator color={d.gold} />
            </View>
          ) : !available || plans.length === 0 ? (
            <View className="mt-7 rounded-[22px] p-4" style={{ backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.1)" }}>
              <Text className="text-center text-[14px] leading-6" style={{ color: d.ink2, fontFamily: "Outfit_600SemiBold" }}>
                Subscriptions aren't available here. Open the app from TestFlight or the App Store to subscribe.
              </Text>
              <Pressable onPress={handleRestore} className="mt-4 items-center py-2" disabled={restoring}>
                <Text className="text-[14px]" style={{ color: d.gold, fontFamily: "Outfit_700Bold" }}>
                  {restoring ? "Restoring…" : "Restore purchases"}
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              {/* Plan picker */}
              <View className="mt-6 gap-2.5">
                {plans.map((plan) => {
                  const active = selected?.sku === plan.sku;
                  return (
                    <Pressable
                      key={plan.sku}
                      onPress={() => setSelectedSku(plan.sku)}
                      className="flex-row items-center gap-3 rounded-[22px] p-4"
                      style={{
                        backgroundColor: active ? "rgba(224,165,61,0.14)" : "rgba(255,255,255,0.06)",
                        borderWidth: active ? 1.5 : 0.5,
                        borderColor: active ? d.gold : "rgba(255,255,255,0.12)"
                      }}
                    >
                      <View
                        className="h-6 w-6 items-center justify-center rounded-full"
                        style={{ borderWidth: 2, borderColor: active ? d.gold : "rgba(255,255,255,0.3)" }}
                      >
                        {active ? <View className="h-3 w-3 rounded-full" style={{ backgroundColor: d.gold }} /> : null}
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-[16px]" style={{ color: "#fff", fontFamily: "Outfit_800ExtraBold" }}>
                            {plan.title}
                          </Text>
                          {plan.period === "year" ? (
                            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: d.gold }}>
                              <Text className="text-[10px] tracking-[0.5px]" style={{ color: "#3a2a06", fontFamily: "Outfit_800ExtraBold" }}>
                                BEST VALUE
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <Text className="text-[13px]" style={{ color: d.ink3, fontFamily: "Outfit_500Medium" }}>
                          Billed {plan.period === "year" ? "yearly" : "monthly"}, auto-renewing
                        </Text>
                      </View>
                      <Text className="text-[16px]" style={{ color: "#fff", fontFamily: "Outfit_800ExtraBold" }}>
                        {plan.priceLabel ? `${plan.priceLabel}/${plan.period === "year" ? "yr" : "mo"}` : "—"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Subscribe */}
              <Pressable
                onPress={handlePurchase}
                disabled={!selected || purchasing !== null}
                className="mt-6 items-center rounded-[22px] py-4"
                style={{ backgroundColor: d.gold, opacity: purchasing !== null ? 0.7 : 1, shadowColor: d.goldDeep, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 5 }}
              >
                {purchasing !== null ? (
                  <ActivityIndicator color="#3a2a06" />
                ) : (
                  <Text style={{ color: "#3a2a06", fontFamily: "Outfit_800ExtraBold", fontSize: 17 }}>
                    {selected?.period === "year" ? "Subscribe yearly" : "Subscribe monthly"}
                  </Text>
                )}
              </Pressable>

              <Pressable onPress={handleRestore} className="mt-3 items-center py-2" disabled={restoring}>
                <Text className="text-[14px]" style={{ color: d.gold, fontFamily: "Outfit_700Bold" }}>
                  {restoring ? "Restoring…" : "Restore purchases"}
                </Text>
              </Pressable>

              {/* Auto-renewable subscription disclosure (required by Apple). */}
              <Text className="mt-5 text-center text-[11.5px] leading-[17px]" style={{ color: d.ink3, fontFamily: "Outfit_500Medium" }}>
                Payment is charged to your {Platform.OS === "ios" ? "Apple ID" : "Google"} account at confirmation of
                purchase. The subscription renews automatically unless it's canceled at least 24 hours before the end of
                the current period. Your account is charged for renewal within 24 hours before the period ends. Manage or
                cancel anytime in your account settings.
              </Text>
              <View className="mt-3 flex-row items-center justify-center gap-4">
                <Pressable onPress={() => Linking.openURL(TERMS_URL)}>
                  <Text className="text-[12px]" style={{ color: d.ink2, fontFamily: "Outfit_700Bold", textDecorationLine: "underline" }}>
                    Terms of Use
                  </Text>
                </Pressable>
                <Pressable onPress={() => Linking.openURL(PRIVACY_URL)}>
                  <Text className="text-[12px]" style={{ color: d.ink2, fontFamily: "Outfit_700Bold", textDecorationLine: "underline" }}>
                    Privacy Policy
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
