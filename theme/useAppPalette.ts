import { useColorScheme } from "react-native";

import { getPalette } from "@/theme";
import { useUserStore } from "@/store/userStore";

/**
 * The concrete light/dark scheme to render, collapsing the "system" preference
 * into whatever the OS currently reports.
 *
 * Note this only tracks the OS while app.config.ts sets
 * `userInterfaceStyle: "automatic"` — pinning it to "light" makes
 * useColorScheme() always answer "light" regardless of the device setting.
 */
export const useResolvedThemeMode = (): "light" | "dark" => {
  const themeMode = useUserStore((state) => state.themeMode);
  // null/undefined while the OS value is still resolving — fall back to light
  // rather than flashing dark.
  const systemScheme = useColorScheme() ?? "light";
  return themeMode === "system" ? systemScheme : themeMode;
};

export const useAppPalette = () => getPalette(useResolvedThemeMode());
