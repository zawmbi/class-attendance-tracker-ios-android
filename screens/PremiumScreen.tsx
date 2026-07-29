import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

import { Icon, IconName } from "@/components/Icon";
import { useIap } from "@/components/IapProvider";
import { PREMIUM_ANNUAL_ID, PREMIUM_MONTHLY_ID, PREMIUM_SEMIANNUAL_ID, PremiumPeriod, PremiumPlan } from "@/services/iap";
import { useUserStore } from "@/store/userStore";
import { darkPalette as d } from "@/theme";

// Everything Premium unlocks — applies to every plan below.
const FEATURES: { icon: IconName; title: string; sub: string }[] = [
  { icon: "chart", title: "End-of-term forecasting", sub: "Grade-aware projections show exactly how each course will finish." },
  { icon: "target", title: "What-if simulator & goal planner", sub: "See how many sessions you can miss and still hit your target." },
  { icon: "grid", title: "Deep insights & patterns", sub: "Weekday, time-of-day, punctuality and streak analytics." },
  { icon: "sparkles", title: "Syllabus scanning", sub: "Auto-fill a course's schedule and attendance policy from pasted text." },
  { icon: "bell", title: "Advanced reminders", sub: "Leave-time nudges and smarter, configurable attendance alerts." },
  { icon: "flame", title: "Premium themes", sub: "Unlock the full set of app themes and accent colors." },
  { icon: "inbox", title: "Cloud backup & sync", sub: "Back up your data and keep it in sync across all your devices." }
];

// The three duration tiers. Prices here are the marketing fallback shown when
// the store's localized price isn't available (e.g. dev / Expo Go); in
// production the live App Store / Play price label overrides `price`.
const TIERS: {
  period: PremiumPeriod;
  sku: string;
  title: string;
  price: string;
  perMonth: string;
  billed: string;
  badge: string | null;
}[] = [
  { period: "month", sku: PREMIUM_MONTHLY_ID, title: "Monthly", price: "$3.99", perMonth: "$3.99 / mo", billed: "Billed monthly", badge: null },
  { period: "6month", sku: PREMIUM_SEMIANNUAL_ID, title: "6 Months", price: "$17.99", perMonth: "$3.00 / mo", billed: "Billed every 6 months", badge: "SAVE 25%" },
  { period: "year", sku: PREMIUM_ANNUAL_ID, title: "12 Months", price: "$29.99", perMonth: "$2.50 / mo", billed: "Billed yearly", badge: "BEST VALUE · SAVE 37%" }
];

// Apple's standard EULA (use your own Terms of Use URL if you have one).
const TERMS_URL = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";
// TODO: replace with your hosted privacy policy URL.
const PRIVACY_URL = "https://lindascomputing.xyz/class-attendance-tracker-ios-android/";
const MANAGE_URL =
  Platform.OS === "ios" ? "https://apps.apple.com/account/subscriptions" : "https://play.google.com/store/account/subscriptions";

const billedLabel = (p: PremiumPeriod) => (p === "year" ? "yearly" : p === "6month" ? "every 6 months" : "monthly");

export const PremiumScreen = () => {
  const router = useRouter();
  const isPremium = useUserStore((s) => s.isPremium);
  const { plans, available, purchasing, restoring, purchase, restore, diagnostic } = useIap();
  const [selectedPeriod, setSelectedPeriod] = useState<PremiumPeriod>("year");

  // The store plan that matches the selected tier (needed to actually purchase).
  const planFor = (period: PremiumPeriod): PremiumPlan | undefined => plans.find((p) => p.period === period);
  const selectedPlan = planFor(selectedPeriod);
  const canPurchase = available && !!selectedPlan;

  const handlePurchase = async () => {
    if (!selectedPlan) {
      return;
    }
    try {
      await purchase(selectedPlan);
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
              {isPremium ? "You're all set" : "Finish every course on track"}
            </Text>
            <Text className="mt-2.5 text-center text-[15.5px]" style={{ color: d.ink2, fontFamily: "Outfit_500Medium" }}>
              {isPremium
                ? "Your Premium subscription is active. Thanks for the support!"
                : "Start with 2 weeks free. Cancel anytime — you keep Premium for the full two weeks even if you cancel right away."}
            </Text>
          </View>

          {/* Features */}
          <Text className="mb-2.5 mt-7 text-[12px] tracking-[1.5px]" style={{ color: d.gold, fontFamily: "Outfit_800ExtraBold" }}>
            EVERYTHING IN PREMIUM
          </Text>
          <View className="gap-2.5">
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
                  <Text className="text-[13px] leading-[18px]" style={{ color: d.ink3, fontFamily: "Outfit_500Medium" }}>
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
          ) : (
            <>
              {/* Pick a plan — all three tiers unlock everything above */}
              <Text className="mb-2.5 mt-7 text-[12px] tracking-[1.5px]" style={{ color: d.gold, fontFamily: "Outfit_800ExtraBold" }}>
                CHOOSE YOUR PLAN
              </Text>
              <View className="gap-2.5">
                {TIERS.map((tier) => {
                  const active = selectedPeriod === tier.period;
                  // Prefer the live, localized store price when we have it.
                  const priceLabel = planFor(tier.period)?.priceLabel || tier.price;
                  return (
                    <Pressable
                      key={tier.sku}
                      onPress={() => setSelectedPeriod(tier.period)}
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
                        <View className="flex-row flex-wrap items-center gap-2">
                          <Text className="text-[16px]" style={{ color: "#fff", fontFamily: "Outfit_800ExtraBold" }}>
                            {tier.title}
                          </Text>
                          {tier.badge ? (
                            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: d.gold }}>
                              <Text className="text-[10px] tracking-[0.5px]" style={{ color: "#3a2a06", fontFamily: "Outfit_800ExtraBold" }}>
                                {tier.badge}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <Text className="text-[13px]" style={{ color: d.ink3, fontFamily: "Outfit_500Medium" }}>
                          {tier.billed} · {tier.perMonth}
                        </Text>
                      </View>
                      <Text className="text-[16px]" style={{ color: "#fff", fontFamily: "Outfit_800ExtraBold" }}>
                        {priceLabel}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Free-trial reassurance */}
              <View
                className="mt-4 flex-row items-start gap-2.5 rounded-[18px] p-3.5"
                style={{ backgroundColor: "rgba(224,165,61,0.12)", borderWidth: 0.5, borderColor: "rgba(224,165,61,0.35)" }}
              >
                <Icon name="sparkles" size={18} color={d.gold} stroke={2} />
                <Text className="flex-1 text-[13px] leading-[18px]" style={{ color: d.ink2, fontFamily: "Outfit_600SemiBold" }}>
                  2 weeks free, then {planFor(selectedPeriod)?.priceLabel || TIERS.find((t) => t.period === selectedPeriod)?.price}{" "}
                  billed {billedLabel(selectedPeriod)}. Cancel anytime in the first two weeks and you keep Premium for all 14 days at no charge.
                </Text>
              </View>

              {/* Start trial / Subscribe */}
              <Pressable
                onPress={handlePurchase}
                disabled={!canPurchase || purchasing !== null}
                className="mt-5 items-center rounded-[22px] py-4"
                style={{ backgroundColor: d.gold, opacity: !canPurchase || purchasing !== null ? 0.6 : 1, shadowColor: d.goldDeep, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 5 }}
              >
                {purchasing !== null ? (
                  <ActivityIndicator color="#3a2a06" />
                ) : (
                  <Text style={{ color: "#3a2a06", fontFamily: "Outfit_800ExtraBold", fontSize: 17 }}>
                    Start 2-week free trial
                  </Text>
                )}
              </Pressable>

              {!canPurchase ? (
                <Text className="mt-3 text-center text-[12.5px] leading-[18px]" style={{ color: d.ink3, fontFamily: "Outfit_500Medium" }}>
                  Subscriptions aren't available here. Open the app from TestFlight or the App Store to start your free trial.
                </Text>
              ) : null}

              {/* Dev-only: the real reason the paywall is unusable. Stripped from
                  release builds, so users only ever see the friendly copy above. */}
              {__DEV__ && diagnostic ? (
                <Text
                  selectable
                  className="mt-3 text-[11px] leading-[16px]"
                  style={{ color: d.ink3, fontFamily: "Outfit_500Medium", opacity: 0.85 }}
                >
                  {`IAP debug — ${diagnostic}`}
                </Text>
              ) : null}

              <Pressable onPress={handleRestore} className="mt-3 items-center py-2" disabled={restoring}>
                <Text className="text-[14px]" style={{ color: d.gold, fontFamily: "Outfit_700Bold" }}>
                  {restoring ? "Restoring…" : "Restore purchases"}
                </Text>
              </Pressable>

              {/* Auto-renewable subscription disclosure (required by Apple). */}
              <Text className="mt-5 text-center text-[11.5px] leading-[17px]" style={{ color: d.ink3, fontFamily: "Outfit_500Medium" }}>
                After the 2-week free trial, payment is charged to your {Platform.OS === "ios" ? "Apple ID" : "Google"} account
                and the subscription renews automatically unless it's canceled at least 24 hours before the end of the current
                period. Your account is charged for renewal within 24 hours before the period ends. Manage or cancel anytime in
                your account settings.
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
