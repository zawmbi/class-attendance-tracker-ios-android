import { PropsWithChildren, ReactNode } from "react";
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
  /**
   * Optional row (e.g. Back / Cancel / Save buttons) pinned above the scroll
   * content so it stays reachable no matter how far the user has scrolled.
   * Shares the same horizontal padding and max-width as the body.
   */
  header?: ReactNode;
}

// On tablet width the left sidebar inset is applied by the Tabs sceneStyle (tab
// scenes only), so here we just widen content + padding.
export const ScreenContainer = ({ children, scroll = true, maxWidth = 460, wideMaxWidth, header }: ScreenContainerProps) => {
  const activePalette = useAppPalette();
  const wide = useIsWide();
  const effectiveMaxWidth = wide && wideMaxWidth ? wideMaxWidth : maxWidth;
  const hasHeader = header != null;

  const content = (
    <View
      style={{
        paddingHorizontal: wide ? 36 : 20,
        // The sticky header already supplies the top inset when present.
        paddingTop: hasHeader ? 4 : wide ? 28 : 12,
        paddingBottom: wide ? 48 : 128,
      }}
    >
      <View style={{ width: "100%", maxWidth: effectiveMaxWidth, alignSelf: "center" }}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: activePalette.background }}>
      {hasHeader && (
        <View
          style={{
            paddingHorizontal: wide ? 36 : 20,
            paddingTop: wide ? 28 : 12,
            paddingBottom: 8,
            backgroundColor: activePalette.background,
          }}
        >
          <View style={{ width: "100%", maxWidth: effectiveMaxWidth, alignSelf: "center" }}>{header}</View>
        </View>
      )}
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
