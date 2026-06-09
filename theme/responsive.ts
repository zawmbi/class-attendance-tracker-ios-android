import { useWindowDimensions } from "react-native";

// Width at/above which we switch to the tablet layout (sidebar nav + wider,
// multi-column content). 768 = classic iPad point-width, so iPads get the
// tablet treatment in portrait too; phones stay below it.
export const TABLET_BREAKPOINT = 768;

/** True when the current window is tablet-width (iPad / large landscape). */
export const useIsWide = () => useWindowDimensions().width >= TABLET_BREAKPOINT;
