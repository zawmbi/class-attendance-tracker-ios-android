import { Redirect } from "expo-router";
import { useUserStore } from "@/store/userStore";

export default function Index() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  return <Redirect href={isAuthenticated ? "/(tabs)/dashboard" : "/auth"} />;
}
