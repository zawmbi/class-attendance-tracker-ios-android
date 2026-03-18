import { Modal, Pressable, Text, View } from "react-native";

import { cardStyles } from "@/theme";
import { useUserStore } from "@/store/userStore";
import { useAppPalette } from "@/theme/useAppPalette";
import { UpgradeTrigger } from "@/utils/types";

const copyByReason: Record<UpgradeTrigger, { title: string; body: string }> = {
  analytics: {
    title: "Premium predictive insights",
    body: "See future attendance scenarios, class-by-class priority suggestions, and behavioral patterns before they become stressful."
  },
  risk_alert: {
    title: "Stay ahead of attendance risk",
    body: "Premium projections help you see how many classes you can still miss safely and what next week could look like."
  },
  consistent_use: {
    title: "Build on your consistency",
    body: "You've been showing up for several days. Premium adds smart reminders, future simulations, and theme customization."
  },
  theme_customization: {
    title: "Customize your calm workspace",
    body: "Unlock earthy premium themes and deeper UI personalization without affecting your tracking data."
  },
  advanced_reminders: {
    title: "Smarter reminders",
    body: "Premium adds leave-time reminders, persistent follow-ups, and adaptive timing around your routines."
  }
};

export const UpgradeModal = () => {
  const palette = useAppPalette();
  const { upgradePrompt, closeUpgradeModal, upgradeToPremium, markPromptSeen } = useUserStore();

  if (!upgradePrompt) {
    return null;
  }

  const copy = copyByReason[upgradePrompt];

  return (
    <Modal animationType="fade" transparent visible onRequestClose={closeUpgradeModal}>
      <View className="flex-1 justify-end">
        <View className="absolute inset-0" style={{ backgroundColor: `${palette.primary}22` }} />
        <View className="px-4 pb-8">
          <View className="self-center h-1.5 w-12 rounded-full" style={{ backgroundColor: `${palette.primary}33` }} />
          <View className="mt-3 w-full rounded-[32px] px-6 py-7" style={[cardStyles, { maxWidth: 460, alignSelf: "center", backgroundColor: palette.background, borderColor: palette.border, borderWidth: 1 }]}>
            <Text className="text-center text-xs uppercase tracking-[1.5px]" style={{ color: palette.muted }}>Monthly subscription</Text>
            <Text className="mt-3 text-center font-serif text-[30px]" style={{ color: palette.primary }}>{copy.title}</Text>
            <Text className="mt-3 text-center text-sm leading-6" style={{ color: palette.muted }}>{copy.body}</Text>
            <View className="mt-5 rounded-[22px] p-4" style={{ backgroundColor: palette.surface }}>
              <Text className="text-center text-sm leading-6" style={{ color: palette.ink }}>
                Includes predictive attendance engine, behavioral insights, advanced reminders, and theme customization.
              </Text>
              <Text className="mt-2 text-center text-xs uppercase tracking-[1.4px]" style={{ color: palette.muted }}>
                billed monthly
              </Text>
            </View>
            <View className="mt-6 gap-3">
              <Pressable className="rounded-full px-4 py-4" style={{ backgroundColor: palette.primary }} onPress={upgradeToPremium}>
                <Text className="text-center" style={{ color: palette.background }}>Start monthly plan</Text>
              </Pressable>
              <Pressable
                className="rounded-full px-4 py-4"
                style={{ borderWidth: 1, borderColor: palette.border }}
                onPress={() => {
                  markPromptSeen(upgradePrompt);
                  closeUpgradeModal();
                }}
              >
                <Text className="text-center" style={{ color: palette.primary }}>Maybe later</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
