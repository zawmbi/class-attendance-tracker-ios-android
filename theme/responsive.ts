import { useWindowDimensions } from "react-native";

// Width at/above which we show the sidebar nav + wider, padded content.
// 768 = classic iPad point-width, so iPads get the tablet chrome in portrait
// too; phones stay below it.
export const TABLET_BREAKPOINT = 768;

// Width at/above which content may use a true MULTI-COLUMN layout (e.g. the
// dashboard's hero + side column). Higher than TABLET_BREAKPOINT because the
// 248px sidebar eats into the usable width — below this, splitting into columns
// squeezes each one too narrow (text wraps a few chars per line). Only wide
// landscape iPads clear it; portrait iPads stay single-column.
export const TWO_COLUMN_BREAKPOINT = 1180;

/** True when the current window is tablet-width (sidebar nav shown). */
export const useIsWide = () => useWindowDimensions().width >= TABLET_BREAKPOINT;

/** True when there's enough width for a multi-column content layout. */
export const useIsTwoColumn = () => useWindowDimensions().width >= TWO_COLUMN_BREAKPOINT;
