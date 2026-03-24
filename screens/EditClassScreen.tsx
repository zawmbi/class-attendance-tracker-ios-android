import { Link, router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { FormField, FormInput } from "@/components/FormField";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useUserStore } from "@/store/userStore";
import { appConfig } from "@/theme";
import { useAppPalette } from "@/theme/useAppPalette";
import { formatEditableTime, parseTimeInput } from "@/utils/date";
import { draftToClassPayload, parseSyllabusText } from "@/utils/syllabus";
import { AcademicTermType, AttendanceType, PriorityLevel, SyllabusImportDraft, Weekday } from "@/utils/types";

const weekdays: Weekday[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface EditClassScreenProps {
  classId?: string;
}

export const EditClassScreen = ({ classId }: EditClassScreenProps) => {
  const palette = useAppPalette();
  const { classes, settings, addClass, updateClass, deleteClass } = useAttendanceStore();
  const { isPremium, openUpgradeModal } = useUserStore();
  const existing = classes.find((item) => item.id === classId);
  const [name, setName] = useState(existing?.name ?? "");
  const [linkedGroup, setLinkedGroup] = useState(existing?.linkedGroup ?? "");
  const [sectionLabel, setSectionLabel] = useState(existing?.sectionLabel ?? "");
  const [professor, setProfessor] = useState(existing?.professor ?? "");
  const [ta, setTa] = useState(existing?.ta ?? "");
  const [location, setLocation] = useState(existing?.location ?? "");
  const [room, setRoom] = useState(existing?.room ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [startTime, setStartTime] = useState(formatEditableTime(existing?.schedule[0]?.startTime ?? "09:00"));
  const [endTime, setEndTime] = useState(formatEditableTime(existing?.schedule[0]?.endTime ?? "10:15"));
  const [selectedDays, setSelectedDays] = useState<Weekday[]>(existing?.schedule.map((item) => item.day) ?? ["Monday"]);
  const [attendanceType, setAttendanceType] = useState<AttendanceType>(existing?.attendanceType ?? "percentage");
  const [termType, setTermType] = useState<AcademicTermType>(existing?.termType ?? settings.defaultTermType);
  const [courseLengthWeeks, setCourseLengthWeeks] = useState(String(existing?.courseLengthWeeks ?? settings.defaultCourseLengthWeeks));
  const [requiredAttendance, setRequiredAttendance] = useState(String(existing?.requiredAttendance ?? 80));
  const [excusedAllowance, setExcusedAllowance] = useState(String(existing?.excusedAllowance ?? 2));
  const [hoursPerWeek, setHoursPerWeek] = useState(String(existing?.hoursPerWeek ?? 3));
  const [priority, setPriority] = useState<PriorityLevel>(existing?.priority ?? "medium");
  const [color, setColor] = useState(existing?.color ?? appConfig.classColorOptions[0]);
  const [syllabusText, setSyllabusText] = useState("");
  const [drafts, setDrafts] = useState<SyllabusImportDraft[]>([]);

  const canSave = useMemo(() => name.trim().length > 0 && selectedDays.length > 0, [name, selectedDays]);

  const toggleDay = (day: Weekday) => {
    setSelectedDays((current) => (current.includes(day) ? current.filter((item) => item !== day) : [...current, day]));
  };

  const applyDraftToForm = (draft: SyllabusImportDraft) => {
    setName(draft.name);
    setLinkedGroup(draft.linkedGroup);
    setSectionLabel(draft.sectionLabel);
    setProfessor(draft.professor);
    setTa(draft.ta);
    setLocation(draft.location);
    setRoom(draft.room);
    setNotes(draft.notes);
    setAttendanceType(draft.attendanceType);
    setTermType(draft.termType);
    setCourseLengthWeeks(String(draft.courseLengthWeeks));
    setRequiredAttendance(String(draft.requiredAttendance));
    setExcusedAllowance(String(draft.excusedAllowance));
    setHoursPerWeek(String(draft.hoursPerWeek));

    if (draft.schedule.length > 0) {
      setSelectedDays(draft.schedule.map((item) => item.day));
      setStartTime(formatEditableTime(draft.schedule[0].startTime));
      setEndTime(formatEditableTime(draft.schedule[0].endTime));
    }
  };

  const handleParseSyllabus = () => {
    if (!syllabusText.trim()) {
      Alert.alert("Paste a syllabus first", "Add syllabus text or OCR text before scanning.");
      return;
    }

    const parsedDrafts = parseSyllabusText(syllabusText);
    if (!parsedDrafts.length) {
      Alert.alert("Nothing matched yet", "Try pasting the course title, meeting schedule, and attendance policy lines.");
      return;
    }

    setDrafts(parsedDrafts);
  };

  const handleImportAllDrafts = () => {
    if (existing || drafts.length === 0) {
      return;
    }

    drafts.forEach((draft, index) => {
      addClass(
        draftToClassPayload(draft, {
          id: `class-${Date.now()}-${index}`,
          color: appConfig.classColorOptions[index % appConfig.classColorOptions.length],
          priority
        })
      );
    });

    Alert.alert("Classes imported", `${drafts.length} classes were created from your syllabus text.`);
    router.replace("/(tabs)/dashboard");
  };

  const handleSave = () => {
    if (!canSave) {
      Alert.alert("Missing info", "Add a class name and at least one schedule day.");
      return;
    }

    const normalizedStartTime = parseTimeInput(startTime);
    const normalizedEndTime = parseTimeInput(endTime);

    if (!normalizedStartTime || !normalizedEndTime) {
      Alert.alert("Invalid time", "Use a normal typed time like 9:30 AM or 1:15 PM.");
      return;
    }

    const payload = {
      id: existing?.id ?? `class-${Date.now()}`,
      name: name.trim(),
      linkedGroup: linkedGroup.trim(),
      sectionLabel: sectionLabel.trim(),
      professor: professor.trim(),
      ta: ta.trim(),
      location: location.trim(),
      room: room.trim(),
      schedule: selectedDays.map((day) => ({
        day,
        startTime: normalizedStartTime,
        endTime: normalizedEndTime
      })),
      attendanceType,
      termType,
      courseLengthWeeks: Number(courseLengthWeeks) || settings.defaultCourseLengthWeeks,
      requiredAttendance: Number(requiredAttendance) || 0,
      excusedAllowance: Number(excusedAllowance) || 0,
      hoursPerWeek: Number(hoursPerWeek) || 0,
      color,
      priority,
      notes: notes.trim()
    };

    if (existing) {
      updateClass(existing.id, payload);
      router.replace(`/class/${existing.id}`);
      return;
    }

    addClass(payload);
    router.replace(`/class/${payload.id}`);
  };

  const handleDelete = () => {
    if (!existing) {
      return;
    }

    Alert.alert("Delete class?", "This removes the class and its attendance history from the app.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteClass(existing.id);
          router.replace("/(tabs)/dashboard");
        }
      }
    ]);
  };

  const getChipStyle = (active: boolean) => ({
    backgroundColor: active ? palette.primary : palette.surface,
    borderWidth: active ? 0 : 1,
    borderColor: palette.border
  });

  return (
    <ScreenContainer>
      <Link href={existing ? `/class/${existing.id}` : "/(tabs)/dashboard"} asChild>
        <Pressable
          className="mb-5 self-start rounded-full px-4 py-2.5"
          style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
        >
          <Text className="text-sm" style={{ color: palette.muted }}>
            ‹ Back
          </Text>
        </Pressable>
      </Link>

      <SectionHeader title={existing ? "Edit Class" : "New Class"} subtitle="Add your real class details directly in the app." />

      <View
        className="mb-6 rounded-[28px] px-5 py-5"
        style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }}
      >
        <Text className="font-serif text-[24px]" style={{ color: palette.primary }}>
          Premium syllabus scan
        </Text>
        <Text className="mt-2 text-sm leading-6" style={{ color: palette.muted }}>
          Paste syllabus text or OCR output to auto-fill class details. On new classes, you can also import multiple syllabi at once.
        </Text>

        {isPremium ? (
          <>
            <FormField
              label="Syllabus text"
              helper={
                existing
                  ? "Paste one syllabus to update this class."
                  : "Separate multiple syllabi with --- or paste several Course:/Syllabus sections together."
              }
            >
              <FormInput
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                value={syllabusText}
                onChangeText={(value) => {
                  setSyllabusText(value);
                  setDrafts([]);
                }}
                placeholder={`Course: Biology 101
Instructor: Dr. Rivera
Schedule: Tue/Thu 9:30 AM - 10:45 AM
Attendance: 80% required, 2 excused absences...`}
                style={{ minHeight: 176 }}
              />
            </FormField>

            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 items-center rounded-[22px] px-4 py-4"
                style={{ backgroundColor: palette.primary }}
                onPress={handleParseSyllabus}
              >
                <Text style={{ color: palette.background }}>Scan syllabus</Text>
              </Pressable>
              {drafts.length > 1 && !existing ? (
                <Pressable
                  className="flex-1 items-center rounded-[22px] px-4 py-4"
                  style={{ backgroundColor: palette.background, borderWidth: 1, borderColor: palette.border }}
                  onPress={handleImportAllDrafts}
                >
                  <Text style={{ color: palette.primary }}>Import all</Text>
                </Pressable>
              ) : null}
            </View>

            {drafts.length > 0 ? (
              <View className="mt-4 gap-3">
                {drafts.map((draft, index) => (
                  <View
                    key={`${draft.name}-${index}`}
                    className="rounded-[24px] px-4 py-4"
                    style={{ backgroundColor: palette.background, borderWidth: 1, borderColor: palette.border }}
                  >
                    <Text className="font-serif text-[20px]" style={{ color: palette.primary }}>
                      {draft.name}
                    </Text>
                    <Text className="mt-2 text-sm leading-6" style={{ color: palette.muted }}>
                      {draft.professor ? `${draft.professor} • ` : ""}
                      {draft.schedule.length > 0
                        ? `${draft.schedule.map((item) => item.day.slice(0, 3)).join(", ")} ${formatEditableTime(
                            draft.schedule[0].startTime
                          )} - ${formatEditableTime(draft.schedule[0].endTime)}`
                        : "No schedule detected yet"}
                    </Text>
                    <Text className="mt-2 text-sm leading-6" style={{ color: palette.muted }}>
                      {draft.requiredAttendance}% required • {draft.excusedAllowance} excused • about {draft.estimatedSessions} sessions
                      {draft.attendanceType !== "optional"
                        ? ` • about ${draft.allowedAbsencesEstimate} safe absences`
                        : " • optional attendance"}
                    </Text>
                    {draft.notes ? (
                      <Text className="mt-2 text-sm leading-6" style={{ color: palette.ink }}>
                        {draft.notes}
                      </Text>
                    ) : null}
                    <Pressable
                      className="mt-3 self-start rounded-full px-4 py-3"
                      style={{ backgroundColor: palette.primary }}
                      onPress={() => applyDraftToForm(draft)}
                    >
                      <Text style={{ color: palette.background }}>
                        {existing ? "Apply to this class" : drafts.length > 1 ? "Fill editor with this one" : "Use these details"}
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        ) : (
          <View className="mt-4 rounded-[24px] px-4 py-4" style={{ backgroundColor: palette.background }}>
            <Text className="text-sm leading-6" style={{ color: palette.muted }}>
              Premium can pull course name, instructor, meeting schedule, attendance policy, excused absence limits, and course length from pasted syllabus text.
            </Text>
            <Pressable
              className="mt-4 self-start rounded-full px-4 py-3"
              style={{ backgroundColor: palette.primary }}
              onPress={() => openUpgradeModal("syllabus_import")}
            >
              <Text style={{ color: palette.background }}>Unlock syllabus scan</Text>
            </Pressable>
          </View>
        )}
      </View>

      <FormField label="Class name">
        <FormInput value={name} onChangeText={setName} placeholder="Biology 101" />
      </FormField>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormField label="Linked group" helper="Use the same value for lecture/lab pairs, like BIOS 210">
            <FormInput value={linkedGroup} onChangeText={setLinkedGroup} placeholder="BIOS 210" />
          </FormField>
        </View>
        <View className="flex-1">
          <FormField label="Section label">
            <FormInput value={sectionLabel} onChangeText={setSectionLabel} placeholder="Lecture, Lab, TA" />
          </FormField>
        </View>
      </View>

      <FormField label="Professor">
        <FormInput value={professor} onChangeText={setProfessor} placeholder="Dr. Rivera" />
      </FormField>

      <FormField label="TA section / TA">
        <FormInput value={ta} onChangeText={setTa} placeholder="Jamie Chen or Section A" />
      </FormField>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormField label="Location">
            <FormInput value={location} onChangeText={setLocation} placeholder="Science Hall" />
          </FormField>
        </View>
        <View className="w-[120px]">
          <FormField label="Room">
            <FormInput value={room} onChangeText={setRoom} placeholder="204" />
          </FormField>
        </View>
      </View>

      <FormField label="Days">
        <View className="flex-row flex-wrap">
          {weekdays.map((day) => {
            const active = selectedDays.includes(day);
            return (
              <Pressable key={day} className="mb-3 mr-2 rounded-full px-4 py-3" style={getChipStyle(active)} onPress={() => toggleDay(day)}>
                <Text style={{ color: active ? palette.background : palette.primary }}>{day.slice(0, 3)}</Text>
              </Pressable>
            );
          })}
        </View>
      </FormField>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormField label="Start time" helper="Type times like 9:30 AM">
            <FormInput value={startTime} onChangeText={setStartTime} placeholder="9:30 AM" />
          </FormField>
        </View>
        <View className="flex-1">
          <FormField label="End time">
            <FormInput value={endTime} onChangeText={setEndTime} placeholder="10:15 AM" />
          </FormField>
        </View>
      </View>

      <FormField label="Attendance type">
        <View className="flex-row flex-wrap">
          {appConfig.attendanceTypeOptions.map((option) => {
            const active = attendanceType === option;
            return (
              <Pressable key={option} className="mb-3 mr-2 rounded-full px-4 py-3" style={getChipStyle(active)} onPress={() => setAttendanceType(option)}>
                <Text className="capitalize" style={{ color: active ? palette.background : palette.primary }}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </FormField>

      <FormField label="Academic term">
        <View className="flex-row flex-wrap">
          {appConfig.academicTermOptions.map((option) => {
            const active = termType === option;
            return (
              <Pressable key={option} className="mb-3 mr-2 rounded-full px-4 py-3" style={getChipStyle(active)} onPress={() => setTermType(option)}>
                <Text className="capitalize" style={{ color: active ? palette.background : palette.primary }}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </FormField>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormField label="Course length">
            <View className="flex-row flex-wrap">
              {appConfig.courseLengthOptions.map((option) => {
                const active = Number(courseLengthWeeks) === option;
                return (
                  <Pressable
                    key={option}
                    className="mb-3 mr-2 rounded-full px-4 py-3"
                    style={getChipStyle(active)}
                    onPress={() => setCourseLengthWeeks(String(option))}
                  >
                    <Text style={{ color: active ? palette.background : palette.primary }}>{option} wk</Text>
                  </Pressable>
                );
              })}
            </View>
          </FormField>
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormField label="Required attendance">
            <FormInput keyboardType="numeric" value={requiredAttendance} onChangeText={setRequiredAttendance} placeholder="80" />
          </FormField>
        </View>
        <View className="flex-1">
          <FormField label="Excused allowed">
            <FormInput keyboardType="numeric" value={excusedAllowance} onChangeText={setExcusedAllowance} placeholder="2" />
          </FormField>
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormField label="Hours">
            <FormInput keyboardType="numeric" value={hoursPerWeek} onChangeText={setHoursPerWeek} placeholder="3" />
          </FormField>
        </View>
        <View className="flex-1" />
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormField label="Priority">
            <View className="flex-row flex-wrap">
              {appConfig.priorityOptions.map((option) => {
                const active = priority === option;
                return (
                  <Pressable key={option} className="mb-3 mr-2 rounded-full px-4 py-3" style={getChipStyle(active)} onPress={() => setPriority(option)}>
                    <Text className="capitalize" style={{ color: active ? palette.background : palette.primary }}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </FormField>
        </View>
      </View>

      <FormField label="Color">
        <View className="flex-row flex-wrap">
          {appConfig.classColorOptions.map((option) => (
            <Pressable
              key={option}
              className="mb-3 mr-3 h-11 w-11 rounded-full border-2"
              style={{ backgroundColor: option, borderColor: color === option ? palette.ink : palette.background }}
              onPress={() => setColor(option)}
            />
          ))}
        </View>
      </FormField>

      <FormField label="Notes">
        <FormInput
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={notes}
          onChangeText={setNotes}
          placeholder="Any reminder or attendance policy note"
          style={{ minHeight: 112 }}
        />
      </FormField>

      <Pressable
        className="mb-3 items-center rounded-[24px] px-5 py-4"
        style={{ backgroundColor: canSave ? palette.primary : `${palette.muted}55` }}
        onPress={handleSave}
      >
        <Text className="font-serif text-[20px]" style={{ color: canSave ? palette.background : palette.muted }}>
          {existing ? "Save Changes" : "Create Class"}
        </Text>
      </Pressable>

      {existing ? (
        <Pressable
          className="items-center rounded-[24px] px-5 py-4"
          style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
          onPress={handleDelete}
        >
          <Text style={{ color: palette.critical }}>Delete Class</Text>
        </Pressable>
      ) : null}
    </ScreenContainer>
  );
};
