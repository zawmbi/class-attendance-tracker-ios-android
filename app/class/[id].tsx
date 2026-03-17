import { useLocalSearchParams } from "expo-router";

import { ClassDetailScreen } from "@/screens/ClassDetailScreen";

export default function ClassDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <ClassDetailScreen classId={id} />;
}
