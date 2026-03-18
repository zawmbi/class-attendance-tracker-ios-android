import { useLocalSearchParams } from "expo-router";

import { AddRecordScreen } from "@/screens/AddRecordScreen";

export default function AddRecordRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AddRecordScreen classId={id} />;
}
