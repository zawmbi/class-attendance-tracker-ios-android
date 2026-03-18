import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { FormField, FormInput } from "@/components/FormField";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useAppPalette } from "@/theme/useAppPalette";
import { AttendanceStatus } from "@/utils/types";

export const AddRecordScreen = ({ classId }: { classId: string }) => {
  const palette = useAppPalette();
  const { classes, addRecord } = useAttendanceStore();
  const classItem = classes.find((item) => item.id === classId);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<AttendanceStatus>("present");
  const [notes, setNotes] = useState("");

  if (!classItem) {
    return (
      <ScreenContainer>
        <Text style={{ color: palette.primary }}>Class not found.</Text>
      </ScreenContainer>
    );
  }

  const handleSave = () => {
    if (!date.trim()) {
      Alert.alert("Missing date", "Add a date in YYYY-MM-DD format.");
      return;
    }

    addRecord({
      id: `record-${Date.now()}`,
      classId,
      date,
      status,
      notes: notes.trim()
    });

    router.replace(`/class/${classId}`);
  };

  return (
    <ScreenContainer>
      <Link href={`/class/${classId}`} asChild>
        <Pressable
          className="mb-5 self-start rounded-full px-4 py-2.5"
          style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
        >
          <Text className="text-sm" style={{ color: palette.muted }}>
            ‹ Back
          </Text>
        </Pressable>
      </Link>

      <SectionHeader title="Add Attendance" subtitle={`Record a session for ${classItem.name}.`} />

      <FormField label="Date" helper="Use YYYY-MM-DD">
        <FormInput value={date} onChangeText={setDate} placeholder="2026-03-17" />
      </FormField>

      <FormField label="Status">
        <View className="flex-row flex-wrap">
          {(["present", "late", "absent", "excused"] as AttendanceStatus[]).map((option) => {
            const active = status === option;
            return (
              <Pressable
                key={option}
                className="mb-3 mr-2 rounded-full px-4 py-3"
                style={{
                  backgroundColor: active ? palette.primary : palette.surface,
                  borderWidth: active ? 0 : 1,
                  borderColor: palette.border
                }}
                onPress={() => setStatus(option)}
              >
                <Text className="capitalize" style={{ color: active ? palette.background : palette.primary }}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </FormField>

      <FormField label="Notes">
        <FormInput
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional note"
          style={{ minHeight: 112 }}
        />
      </FormField>

      <Pressable className="items-center rounded-[24px] px-5 py-4" style={{ backgroundColor: palette.primary }} onPress={handleSave}>
        <Text className="font-serif text-[20px]" style={{ color: palette.background }}>
          Save Record
        </Text>
      </Pressable>
    </ScreenContainer>
  );
};
