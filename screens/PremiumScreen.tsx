import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { useUserStore } from "@/store/userStore";
import { useAppPalette } from "@/theme/useAppPalette";

const featureGroups = [
  {
    title: "See trouble before it hits",
    description: "Predictive insights turn attendance history into a calmer plan for the rest of the term.",
    items: [
      "What your percentage looks like if you miss the next class",
      "How many absences you can still afford safely",
      "Which class matters most to attend next"
    ]
  },
  {
    title: "Set up classes faster",
    description: "Premium import tools reduce the setup work that usually keeps people from tracking consistently.",
    items: [
      "Paste syllabus text and auto-fill class details",
      "Import multiple syllabi into separate classes at once",
      "Pull attendance rules, meeting times, and term defaults into the editor"
    ]
  },
  {
    title: "Get smarter support",
    description: "The app shifts from simple logging to active support around your real routine.",
    items: [
      "Advanced reminders with gentler follow-ups",
      "Behavior and trend insights across classes",
      "Premium theme customization for a calmer workspace"
    ]
  }
];

export const PremiumScreen = () => {
  const palette = useAppPalette();
  const { isPremium, openUpgradeModal } = useUserStore();

  return (
    <ScreenContainer>
      <Pressable
        className="mb-5 self-start rounded-full px-4 py-2.5"
        style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
        onPress={() => router.back()}
      >
        <Text className="text-sm" style={{ color: palette.muted }}>
          ‹ Back
        </Text>
      </Pressable>

      <View
        className="mb-6 overflow-hidden rounded-[34px] px-6 py-7"
        style={{ backgroundColor: palette.primary }}
      >
        <Text className="text-xs uppercase tracking-[1.8px]" style={{ color: `${palette.background}CC` }}>
          Premium
        </Text>
        <Text className="mt-3 font-serif text-[34px] leading-[40px]" style={{ color: palette.background }}>
          A calmer plan for attendance, not just a logbook.
        </Text>
        <Text className="mt-3 text-sm leading-6" style={{ color: `${palette.background}D9` }}>
          Premium adds forecasting, syllabus import, smarter reminders, and deeper class-by-class guidance so the app can help before attendance becomes stressful.
        </Text>

        <View className="mt-5 flex-row flex-wrap gap-2">
          {["Predictive insights", "Syllabus scan", "Advanced reminders", "Custom themes"].map((label) => (
            <View
              key={label}
              className="rounded-full px-3 py-2"
              style={{ backgroundColor: `${palette.background}1F`, borderWidth: 1, borderColor: `${palette.background}26` }}
            >
              <Text className="text-xs uppercase tracking-[1.4px]" style={{ color: palette.background }}>
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <SectionHeader
        title={isPremium ? "Everything Included" : "What You Get"}
        subtitle={
          isPremium
            ? "Your account already has Premium unlocked."
            : "One monthly plan unlocks the app's planning and setup tools."
        }
      />

      <View className="gap-4">
        {featureGroups.map((group) => (
          <View
            key={group.title}
            className="rounded-[28px] px-5 py-5"
            style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
          >
            <Text className="font-serif text-[24px]" style={{ color: palette.primary }}>
              {group.title}
            </Text>
            <Text className="mt-2 text-sm leading-6" style={{ color: palette.muted }}>
              {group.description}
            </Text>
            <View className="mt-4 gap-3">
              {group.items.map((item) => (
                <View key={item} className="flex-row">
                  <Text className="mr-3 text-base" style={{ color: palette.primary }}>
                    •
                  </Text>
                  <Text className="flex-1 text-sm leading-6" style={{ color: palette.ink }}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View
        className="mt-6 rounded-[30px] px-5 py-6"
        style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
      >
        <Text className="font-serif text-[26px]" style={{ color: palette.primary }}>
          {isPremium ? "Premium is active" : "Monthly subscription"}
        </Text>
        <Text className="mt-2 text-sm leading-6" style={{ color: palette.muted }}>
          {isPremium
            ? "You already have access to every premium feature in the app."
            : "Unlock every premium feature with one plan, including future premium tools added to this experience."}
        </Text>

        <Pressable
          className="mt-5 items-center rounded-[24px] px-5 py-4"
          style={{ backgroundColor: isPremium ? palette.background : palette.primary, borderWidth: isPremium ? 1 : 0, borderColor: palette.border }}
          onPress={() => {
            if (!isPremium) {
              openUpgradeModal("syllabus_import");
            }
          }}
        >
          <Text style={{ color: isPremium ? palette.primary : palette.background }}>
            {isPremium ? "Premium unlocked" : "Start monthly plan"}
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
};
