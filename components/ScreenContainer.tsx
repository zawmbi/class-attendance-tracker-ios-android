import { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppPalette } from "@/theme/useAppPalette";

interface ScreenContainerProps extends PropsWithChildren {
  scroll?: boolean;
}

export const ScreenContainer = ({ children, scroll = true }: ScreenContainerProps) => {
  const activePalette = useAppPalette();
  const content = (
    <View className="px-5 pb-32 pt-3">
      <View style={{ width: "100%", maxWidth: 460, alignSelf: "center" }}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: activePalette.background }}>
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 0 }}
          scrollIndicatorInsets={{ bottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
};
