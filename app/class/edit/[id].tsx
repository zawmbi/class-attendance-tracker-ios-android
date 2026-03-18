import { useLocalSearchParams } from "expo-router";

import { EditClassScreen } from "@/screens/EditClassScreen";

export default function EditClassRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditClassScreen classId={id} />;
}
