import { PropsWithChildren, useMemo, useState } from "react";
import { router } from "expo-router";
import { Alert, Pressable, Text, TextInput, TextInputProps, View } from "react-native";
import * as Location from "expo-location";

import { Icon } from "@/components/Icon";
import { Segmented } from "@/components/attenza/Segmented";
import { Slider } from "@/components/attenza/Slider";
import { Stepper } from "@/components/attenza/Stepper";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useUserStore } from "@/store/userStore";
import { appConfig } from "@/theme";
import { useAppPalette } from "@/theme/useAppPalette";
import { formatEditableTime, parseTimeInput } from "@/utils/date";
import { draftToClassPayload, parseSyllabusText } from "@/utils/syllabus";
import { AcademicTermType, AttendanceType, PriorityLevel, SyllabusImportDraft, Weekday } from "@/utils/types";

const WEEKDAYS: Weekday[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Short chip label for a late-credit weight (1 = present, 0 = absent).
const lateChipLabel = (weight: number) => (weight >= 1 ? "Full" : weight <= 0 ? "Absent" : `${Math.round(weight * 100)}%`);
const latePolicySentence = (weight: number) =>
  weight >= 1
    ? "A late check-in counts the same as being present."
    : weight <= 0
      ? "A late check-in counts as a full absence."
      : `A late check-in counts as ${Math.round(weight * 100)}% of a present session (a ${100 - Math.round(weight * 100)}% penalty).`;

const Group = ({ header, footer, children }: PropsWithChildren<{ header?: string; footer?: string }>) => {
  const palette = useAppPalette();
  return (
    <View className="mb-5">
      {header ? (
        <Text className="mb-2 ml-1 text-[12.5px] tracking-[0.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
          {header.toUpperCase()}
        </Text>
      ) : null}
      <View className="overflow-hidden rounded-[18px]" style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}>
        {children}
      </View>
      {footer ? (
        <Text className="ml-1 mt-2 text-[12.5px] leading-[17px]" style={{ color: palette.ink3, fontFamily: "Outfit_500Medium" }}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
};

const Field = ({ label, first, ...props }: { label: string; first?: boolean } & TextInputProps) => {
  const palette = useAppPalette();
  return (
    <View className="px-3.5 py-2.5" style={first ? undefined : { borderTopWidth: 1, borderTopColor: palette.hairline }}>
      <Text className="text-[12px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
        {label}
      </Text>
      <TextInput
        placeholderTextColor={palette.ink3}
        style={{ marginTop: 2, fontSize: 16, color: palette.ink, fontFamily: "Outfit_600SemiBold", paddingVertical: 2 }}
        {...props}
      />
    </View>
  );
};

interface EditClassScreenProps {
  classId?: string;
}

export const EditClassScreen = ({ classId }: EditClassScreenProps) => {
  const palette = useAppPalette();
  const { classes, settings, addClass, updateClass, deleteClass } = useAttendanceStore();
  const { isPremium, openUpgradeModal } = useUserStore();
  const existing = classes.find((item) => item.id === classId);

  const [name, setName] = useState(existing?.name ?? "");
  const [sectionLabel, setSectionLabel] = useState(existing?.sectionLabel ?? "");
  const [professor, setProfessor] = useState(existing?.professor ?? "");
  const [ta, setTa] = useState(existing?.ta ?? "");
  const [location, setLocation] = useState(existing?.location ?? "");
  const [room, setRoom] = useState(existing?.room ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [startTime, setStartTime] = useState(formatEditableTime(existing?.schedule[0]?.startTime ?? "09:00"));
  const [endTime, setEndTime] = useState(formatEditableTime(existing?.schedule[0]?.endTime ?? "10:15"));
  const [selectedDays, setSelectedDays] = useState<Weekday[]>(existing?.schedule.map((item) => item.day) ?? ["Monday", "Wednesday"]);
  const [attendanceType, setAttendanceType] = useState<AttendanceType>(existing?.attendanceType ?? "percentage");
  const [termType, setTermType] = useState<AcademicTermType>(existing?.termType ?? settings.defaultTermType);
  const [courseLengthWeeks, setCourseLengthWeeks] = useState(existing?.courseLengthWeeks ?? settings.defaultCourseLengthWeeks);
  const [requiredAttendance, setRequiredAttendance] = useState(existing?.requiredAttendance ?? 80);
  const [excusedAllowance, setExcusedAllowance] = useState(existing?.excusedAllowance ?? 2);
  const [lateCreditWeight, setLateCreditWeight] = useState(existing?.lateCreditWeight ?? settings.lateCreditWeight);
  const [priority, setPriority] = useState<PriorityLevel>(existing?.priority ?? "medium");
  const [color, setColor] = useState(existing?.color ?? appConfig.classColorOptions[0]);
  const [latitude, setLatitude] = useState<number | undefined>(existing?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(existing?.longitude);
  const [capturingLocation, setCapturingLocation] = useState(false);
  const [syllabusText, setSyllabusText] = useState("");
  const [drafts, setDrafts] = useState<SyllabusImportDraft[]>([]);

  const canSave = useMemo(() => name.trim().length > 0 && selectedDays.length > 0, [name, selectedDays]);
  const toggleDay = (day: Weekday) => setSelectedDays((cur) => (cur.includes(day) ? cur.filter((d) => d !== day) : [...cur, day]));

  const applyDraftToForm = (draft: SyllabusImportDraft) => {
    setName(draft.name);
    setSectionLabel(draft.sectionLabel);
    setProfessor(draft.professor);
    setTa(draft.ta);
    setLocation(draft.location);
    setRoom(draft.room);
    setNotes(draft.notes);
    setAttendanceType(draft.attendanceType);
    setTermType(draft.termType);
    setCourseLengthWeeks(draft.courseLengthWeeks);
    setRequiredAttendance(draft.requiredAttendance);
    setExcusedAllowance(draft.excusedAllowance);
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
    const parsed = parseSyllabusText(syllabusText);
    if (!parsed.length) {
      Alert.alert("Nothing matched yet", "Try pasting the course title, meeting schedule, and attendance policy lines.");
      return;
    }
    setDrafts(parsed);
  };

  const handleImportAllDrafts = () => {
    if (existing || drafts.length === 0) return;
    drafts.forEach((draft, index) => {
      addClass(
        draftToClassPayload(draft, {
          id: `class-${Date.now()}-${index}`,
          color: appConfig.classColorOptions[index % appConfig.classColorOptions.length],
          priority
        })
      );
    });
    Alert.alert("Courses imported", `${drafts.length} courses were created from your syllabus text.`);
    router.replace("/(tabs)/dashboard");
  };

  const captureLocation = async () => {
    setCapturingLocation(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Location needed", "Allow location access to pin this course to a place.");
        return;
      }
      // Highest accuracy → precise GPS coordinates when the user grants iOS
      // "Precise" location (they can keep it approximate if they prefer).
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
    } catch {
      Alert.alert("Couldn't get location", "Please try again in a moment.");
    } finally {
      setCapturingLocation(false);
    }
  };

  const handleSave = () => {
    if (!canSave) {
      Alert.alert("Missing info", "Add a course name and at least one schedule day.");
      return;
    }
    const normalizedStart = parseTimeInput(startTime);
    const normalizedEnd = parseTimeInput(endTime);
    if (!normalizedStart || !normalizedEnd) {
      Alert.alert("Invalid time", "Use a normal typed time like 9:30 AM or 1:15 PM.");
      return;
    }
    const payload = {
      id: existing?.id ?? `class-${Date.now()}`,
      name: name.trim(),
      linkedGroup: existing?.linkedGroup ?? "",
      sectionLabel: sectionLabel.trim(),
      professor: professor.trim(),
      ta: ta.trim(),
      location: location.trim(),
      room: room.trim(),
      schedule: selectedDays.map((day) => ({ day, startTime: normalizedStart, endTime: normalizedEnd })),
      attendanceType,
      termType,
      courseLengthWeeks,
      requiredAttendance,
      excusedAllowance,
      lateCreditWeight,
      latitude,
      longitude,
      hoursPerWeek: existing?.hoursPerWeek ?? 3,
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
    if (!existing) return;
    Alert.alert("Delete course?", "This removes the course and its attendance history from the app.", [
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

  return (
    <ScreenContainer
      wideMaxWidth={720}
      header={
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-[16px]" style={{ color: palette.ink2, fontFamily: "Outfit_600SemiBold" }}>
              Cancel
            </Text>
          </Pressable>
          <Pressable onPress={handleSave} disabled={!canSave}>
            <Text className="text-[16px]" style={{ color: canSave ? palette.forest : palette.ink3, fontFamily: "Outfit_800ExtraBold" }}>
              Save
            </Text>
          </Pressable>
        </View>
      }
    >
      <Text className="mb-4 text-[32px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
        {existing ? "Edit Course" : "New Course"}
      </Text>

      {/* Syllabus scan (premium) */}
      <Group header="Syllabus scan" footer="Premium pulls name, schedule, attendance policy and more from pasted syllabus text.">
        {isPremium ? (
          <View className="p-3.5">
            <TextInput
              multiline
              textAlignVertical="top"
              value={syllabusText}
              onChangeText={(v) => {
                setSyllabusText(v);
                setDrafts([]);
              }}
              placeholder={"Course: Biology 101\nInstructor: Dr. Rivera\nSchedule: Tue/Thu 9:30–10:45\nAttendance: 80% required, 2 excused"}
              placeholderTextColor={palette.ink3}
              style={{ minHeight: 110, borderRadius: 14, borderWidth: 1, borderColor: palette.hairline, backgroundColor: palette.card2, padding: 12, color: palette.ink, fontFamily: "Outfit_500Medium", fontSize: 14.5 }}
            />
            <View className="mt-3 flex-row gap-2.5">
              <Pressable onPress={handleParseSyllabus} className="flex-1 items-center rounded-[14px] py-3" style={{ backgroundColor: palette.forest }}>
                <Text style={{ color: "#fff", fontFamily: "Outfit_800ExtraBold", fontSize: 14.5 }}>Scan syllabus</Text>
              </Pressable>
              {drafts.length > 1 && !existing ? (
                <Pressable onPress={handleImportAllDrafts} className="flex-1 items-center rounded-[14px] py-3" style={{ backgroundColor: palette.card2, borderWidth: 1, borderColor: palette.hairline }}>
                  <Text style={{ color: palette.forest, fontFamily: "Outfit_800ExtraBold", fontSize: 14.5 }}>Import all</Text>
                </Pressable>
              ) : null}
            </View>
            {drafts.map((draft, index) => (
              <Pressable
                key={`${draft.name}-${index}`}
                onPress={() => applyDraftToForm(draft)}
                className="mt-2.5 rounded-[14px] p-3"
                style={{ backgroundColor: palette.card2, borderWidth: 1, borderColor: palette.hairline }}
              >
                <Text className="text-[15px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
                  {draft.name}
                </Text>
                <Text className="mt-0.5 text-[12.5px]" style={{ color: palette.ink2, fontFamily: "Outfit_500Medium" }}>
                  {draft.requiredAttendance}% required · {draft.excusedAllowance} excused · ~{draft.estimatedSessions} sessions
                </Text>
                <Text className="mt-1.5 text-[12.5px]" style={{ color: palette.forest, fontFamily: "Outfit_800ExtraBold" }}>
                  {existing ? "Apply to this course" : "Fill editor with this one"}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Pressable onPress={() => openUpgradeModal("syllabus_import")} className="flex-row items-center gap-3 p-3.5">
            <View className="h-9 w-9 items-center justify-center rounded-[10px]" style={{ backgroundColor: palette.goldSoft }}>
              <Icon name="sparkles" size={20} color={palette.goldDeep} stroke={2} />
            </View>
            <Text className="flex-1 text-[14.5px]" style={{ color: palette.ink2, fontFamily: "Outfit_600SemiBold" }}>
              Auto-fill from a syllabus with Premium
            </Text>
            <Icon name="lock" size={18} color={palette.goldDeep} stroke={2} />
          </Pressable>
        )}
      </Group>

      {/* Details */}
      <Group header="Details">
        <Field first label="Course name" value={name} onChangeText={setName} placeholder="e.g. Organic Chemistry" />
        <Field label="Course code / section" value={sectionLabel} onChangeText={setSectionLabel} placeholder="e.g. CHEM 210" />
        <Field label="Professor" value={professor} onChangeText={setProfessor} placeholder="Dr. Rivera" />
        <Field label="TA / section" value={ta} onChangeText={setTa} placeholder="Jamie Chen" />
        <Field label="Location" value={location} onChangeText={setLocation} placeholder="Science Hall" />
        <Field label="Room" value={room} onChangeText={setRoom} placeholder="204" />
      </Group>

      {/* Schedule */}
      <Group header="Schedule">
        <View className="px-3.5 pt-3">
          <Text className="mb-2 text-[12px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
            DAYS
          </Text>
          <View className="flex-row gap-2 pb-1">
            {WEEKDAYS.slice(0, 5).map((day) => {
              const on = selectedDays.includes(day);
              return (
                <Pressable
                  key={day}
                  onPress={() => toggleDay(day)}
                  className="flex-1 items-center rounded-[11px] py-2.5"
                  style={{ backgroundColor: on ? palette.forest : palette.paper2 }}
                >
                  <Text className="text-[13px]" style={{ color: on ? "#fff" : palette.ink2, fontFamily: "Outfit_700Bold" }}>
                    {day[0]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View className="flex-row">
          <View className="flex-1">
            <Field label="Start time" value={startTime} onChangeText={setStartTime} placeholder="9:30 AM" />
          </View>
          <View className="flex-1" style={{ borderLeftWidth: 1, borderLeftColor: palette.hairline }}>
            <Field label="End time" value={endTime} onChangeText={setEndTime} placeholder="10:45 AM" />
          </View>
        </View>
      </Group>

      {/* Attendance requirement */}
      <Group header="Attendance requirement">
        <View className="px-3.5 pt-3">
          <Segmented
            options={[{ value: "percentage", label: "Percentage" }, { value: "optional", label: "Optional" }]}
            value={attendanceType === "optional" ? "optional" : "percentage"}
            onChange={(v) => setAttendanceType(v as AttendanceType)}
          />
        </View>
        {attendanceType !== "optional" ? (
          <View className="px-3.5 pb-3 pt-3">
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="text-[13px]" style={{ color: palette.ink2, fontFamily: "Outfit_700Bold" }}>
                Minimum attendance
              </Text>
              <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 22, color: palette.forest, fontVariant: ["tabular-nums"] }}>
                {requiredAttendance}%
              </Text>
            </View>
            <Slider value={requiredAttendance} onChange={setRequiredAttendance} min={50} max={100} tone={palette.forest} />
            <View className="flex-row justify-between">
              <Text className="text-[12px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
                50%
              </Text>
              <Text className="text-[12px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
                100%
              </Text>
            </View>
          </View>
        ) : (
          <View className="px-3.5 py-3" style={{ borderTopWidth: 1, borderTopColor: palette.hairline }}>
            <Text className="text-[13.5px]" style={{ color: palette.ink2, fontFamily: "Outfit_500Medium" }}>
              Attendance is optional — sessions won&apos;t count against a target.
            </Text>
          </View>
        )}
      </Group>

      {/* Late arrivals */}
      <Group header="Late arrivals" footer={latePolicySentence(lateCreditWeight)}>
        <View className="px-3.5 pt-3 pb-3.5">
          <Text className="mb-2 text-[12px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
            A LATE CHECK-IN COUNTS AS
          </Text>
          <View className="flex-row gap-2">
            {appConfig.lateCreditOptions.map((weight) => {
              const on = lateCreditWeight === weight;
              return (
                <Pressable
                  key={weight}
                  onPress={() => setLateCreditWeight(weight)}
                  className="flex-1 items-center rounded-[11px] py-2.5"
                  style={{ backgroundColor: on ? palette.forest : palette.paper2, borderWidth: on ? 0 : 1, borderColor: palette.hairline }}
                >
                  <Text className="text-[13px]" style={{ color: on ? "#fff" : palette.ink2, fontFamily: "Outfit_700Bold" }}>
                    {lateChipLabel(weight)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Group>

      <Group header="Excused absences" footer="Absences that don't count against you (illness, approved leave).">
        <View className="px-3.5 py-3.5">
          <Stepper label="Allowed this term" value={excusedAllowance} onChange={setExcusedAllowance} min={0} max={15} />
        </View>
      </Group>

      {/* Term / length */}
      <Group header="Term">
        <View className="px-3.5 pt-3">
          <Text className="mb-2 text-[12px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
            TYPE
          </Text>
          <View className="flex-row flex-wrap gap-2 pb-1">
            {appConfig.academicTermOptions.map((t) => {
              const on = termType === t;
              return (
                <Pressable key={t} onPress={() => setTermType(t)} className="rounded-full px-3.5 py-2" style={{ backgroundColor: on ? palette.forest : palette.paper2, borderWidth: on ? 0 : 1, borderColor: palette.hairline }}>
                  <Text className="text-[13px] capitalize" style={{ color: on ? "#fff" : palette.ink2, fontFamily: "Outfit_700Bold" }}>
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View className="px-3.5 py-3" style={{ borderTopWidth: 1, borderTopColor: palette.hairline }}>
          <Text className="mb-2 text-[12px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
            LENGTH
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {appConfig.courseLengthOptions.map((w) => {
              const on = courseLengthWeeks === w;
              return (
                <Pressable key={w} onPress={() => setCourseLengthWeeks(w)} className="rounded-full px-3.5 py-2" style={{ backgroundColor: on ? palette.forest : palette.paper2, borderWidth: on ? 0 : 1, borderColor: palette.hairline }}>
                  <Text className="text-[13px]" style={{ color: on ? "#fff" : palette.ink2, fontFamily: "Outfit_700Bold" }}>
                    {w} wk
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Group>

      {/* Color */}
      <Group header="Color">
        <View className="flex-row flex-wrap gap-3 p-4">
          {appConfig.classColorOptions.map((option) => (
            <Pressable
              key={option}
              onPress={() => setColor(option)}
              className="h-9 w-9 rounded-full"
              style={{ backgroundColor: option, borderWidth: 3, borderColor: color === option ? palette.ink : "transparent" }}
            />
          ))}
        </View>
      </Group>

      {/* Location reminder */}
      <Group header="Location reminder" footer="Pin this course to a place to get a check-in nudge when you arrive. Turn on Location reminders in Settings to activate it.">
        {latitude != null && longitude != null ? (
          <View className="flex-row items-center gap-3 px-3.5 py-3">
            <View className="h-8 w-8 items-center justify-center rounded-[9px]" style={{ backgroundColor: palette.forestSoft }}>
              <Icon name="target" size={18} color={palette.forest} stroke={2} />
            </View>
            <View className="flex-1">
              <Text className="text-[15px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
                Location pinned
              </Text>
              <Text className="text-[12.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_500Medium" }}>
                {latitude.toFixed(5)}, {longitude.toFixed(5)}
              </Text>
            </View>
            <Pressable onPress={() => { setLatitude(undefined); setLongitude(undefined); }} hitSlop={8}>
              <Text className="text-[14px]" style={{ color: palette.absent, fontFamily: "Outfit_700Bold" }}>
                Clear
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={captureLocation} disabled={capturingLocation} className="flex-row items-center gap-3 px-3.5 py-3">
            <View className="h-8 w-8 items-center justify-center rounded-[9px]" style={{ backgroundColor: palette.forestSoft }}>
              <Icon name="target" size={18} color={palette.forest} stroke={2} />
            </View>
            <Text className="flex-1 text-[15.5px]" style={{ color: palette.ink, fontFamily: "Outfit_600SemiBold" }}>
              {capturingLocation ? "Getting location…" : "Use my current location"}
            </Text>
            <Icon name="chevron" size={17} color={palette.ink3} stroke={2} />
          </Pressable>
        )}
      </Group>

      {/* Notes */}
      <Group header="Notes">
        <View className="p-3.5">
          <TextInput
            multiline
            textAlignVertical="top"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any reminder or attendance policy note"
            placeholderTextColor={palette.ink3}
            style={{ minHeight: 80, color: palette.ink, fontFamily: "Outfit_500Medium", fontSize: 15 }}
          />
        </View>
      </Group>

      {existing ? (
        <Group>
          <Pressable onPress={handleDelete} className="flex-row items-center gap-3 px-3.5 py-3">
            <View className="h-8 w-8 items-center justify-center rounded-[9px]" style={{ backgroundColor: palette.absent }}>
              <Icon name="trash" size={18} color="#fff" stroke={2} />
            </View>
            <Text className="text-[15.5px]" style={{ color: palette.absent, fontFamily: "Outfit_700Bold" }}>
              Delete class
            </Text>
          </Pressable>
        </Group>
      ) : null}
    </ScreenContainer>
  );
};
