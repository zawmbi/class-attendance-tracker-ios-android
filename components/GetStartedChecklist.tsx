import { Href, Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { useAppPalette } from "@/theme/useAppPalette";

export interface ChecklistStep {
  key: string;
  label: string;
  hint: string;
  done: boolean;
  href: Href;
}

// First-run "Get started" card. Each step reflects real app state (has a class,
// has checked in, has opened the forecast) and routes to the relevant screen.
export const GetStartedChecklist = ({
  steps,
  onDismiss
}: {
  steps: ChecklistStep[];
  onDismiss: () => void;
}) => {
  const palette = useAppPalette();
  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  return (
    <View
      className="overflow-hidden rounded-[22px] p-4"
      style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}
    >
      <View className="mb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-[12px] tracking-[1.5px]" style={{ color: palette.goldDeep, fontFamily: "Outfit_800ExtraBold" }}>
            GET STARTED
          </Text>
          <Text className="text-[18px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
            {allDone ? "You're all set" : `${doneCount} of ${steps.length} done`}
          </Text>
        </View>
        <Pressable
          onPress={onDismiss}
          accessibilityLabel="Dismiss get started"
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: palette.paper2 }}
        >
          <Icon name="close" size={16} color={palette.ink3} />
        </Pressable>
      </View>

      <View className="gap-2">
        {steps.map((step, i) => {
          const row = (
            <View
              className="flex-row items-center gap-3 rounded-[14px] px-3 py-3"
              style={{ backgroundColor: palette.paper2, opacity: step.done ? 0.65 : 1 }}
            >
              <View
                className="h-7 w-7 items-center justify-center rounded-full"
                style={{ backgroundColor: step.done ? palette.present : palette.forestSoft }}
              >
                {step.done ? (
                  <Icon name="present" size={15} color="#fff" stroke={3} />
                ) : (
                  <Text style={{ color: palette.forest, fontFamily: "Outfit_800ExtraBold", fontSize: 13 }}>{i + 1}</Text>
                )}
              </View>
              <View className="flex-1">
                <Text
                  className="text-[15px]"
                  style={{ color: palette.ink, fontFamily: "Outfit_700Bold", textDecorationLine: step.done ? "line-through" : "none" }}
                >
                  {step.label}
                </Text>
                <Text className="text-[12.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_500Medium" }}>
                  {step.hint}
                </Text>
              </View>
              {step.done ? null : <Icon name="chevron" size={17} color={palette.ink3} stroke={2} />}
            </View>
          );

          return step.done ? (
            <View key={step.key}>{row}</View>
          ) : (
            <Link key={step.key} href={step.href} asChild>
              <Pressable>{row}</Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
};
