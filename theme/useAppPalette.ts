import { getPalette } from "@/theme";
import { useUserStore } from "@/store/userStore";

export const useAppPalette = () => {
  const themeMode = useUserStore((state) => state.themeMode);
  return getPalette(themeMode);
};
