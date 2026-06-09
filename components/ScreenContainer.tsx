import { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppPalette } from "@/theme/useAppPalette";
import { useIsWide } from "@/theme/responsive";

interface ScreenContainerProps extends PropsWithChildren {
  scroll?: boolean;
  /** Max content width on phones. Defaults to 460. */
  maxWidth?: number;
  /** Max content width on tablet-width screens. Falls back to `maxWidth` when unset. */
  wideMaxWidth?: number;
}

// On tablet width the left sidebar inset is applied by the Tabs sceneStyle (tab
// scenes only), so here we just widen content + padding.
export const ScreenContainer = ({ children, scroll = true, maxWidth = 460, wideMaxWidth }: ScreenContainerProps) => {
  const activePalette = useAppPalette();
  const wide = useIsWide();
  const effectiveMaxWidth = wide && wideMaxWidth ? wideMaxWidth : maxWidth;

  const content = (
    <View style={{ paddingHorizontal: wide ? 36 : 20, paddingTop: wide ? 28 : 12, paddingBottom: wide ? 48 : 128 }}>
      <View style={{ width: "100%", maxWidth: effectiveMaxWidth, alignSelf: "center" }}>{children}</View>
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
