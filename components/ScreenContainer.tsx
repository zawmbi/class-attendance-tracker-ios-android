import { PropsWithChildren } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppPalette } from "@/theme/useAppPalette";

interface ScreenContainerProps extends PropsWithChildren {
  scroll?: boolean;
  /** Max content width. Defaults to 460 (phone). Pass a larger value for iPad multi-column layouts. */
  maxWidth?: number;
}

// Width ≥ 900 = tablet/landscape. The left sidebar inset is applied by the Tabs
// sceneStyle (tab scenes only), so here we just widen content + padding.
const TABLET_BREAKPOINT = 900;

export const ScreenContainer = ({ children, scroll = true, maxWidth = 460 }: ScreenContainerProps) => {
  const activePalette = useAppPalette();
  const { width } = useWindowDimensions();
  const wide = width >= TABLET_BREAKPOINT;

  const content = (
    <View style={{ paddingHorizontal: wide ? 36 : 20, paddingTop: wide ? 28 : 12, paddingBottom: wide ? 48 : 128 }}>
      <View style={{ width: "100%", maxWidth, alignSelf: "center" }}>{children}</View>
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
