import { useMemo, useState } from "react";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { RiskBadge } from "@/components/RiskBadge";
import { Sheet } from "@/components/attenza/Sheet";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAttendanceStore } from "@/store/attendanceStore";
import { appConfig } from "@/theme";
import { useAppPalette } from "@/theme/useAppPalette";
import { getAttendanceSummary } from "@/utils/attendance";
import { formatTimeLabel } from "@/utils/date";
import { ClassModel, PriorityLevel } from "@/utils/types";

const DAY_ABBR: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun"
};

const PRIORITY_LABEL: Record<PriorityLevel, string> = { low: "Low", medium: "Medium", high: "High" };
const lateChipLabel = (weight: number) => (weight >= 1 ? "Full" : weight <= 0 ? "Absent" : `${Math.round(weight * 100)}%`);

const scheduleSummary = (classItem: ClassModel) => {
  if (!classItem.schedule.length) return "No meeting times";
  const days = classItem.schedule.map((s) => DAY_ABBR[s.day] ?? s.day).join("·");
  const start = classItem.schedule[0]?.startTime;
  return start ? `${days} · ${formatTimeLabel(start)}` : days;
};

// Compact, scannable row — color tile + identity + live % + risk. Tapping opens
// the quick-edit sheet; heavy editing lives in the full editor.
const CourseRow = ({ classItem, onPress }: { classItem: ClassModel; onPress: () => void }) => {
  const palette = useAppPalette();
  const records = useAttendanceStore((s) => s.records);
  const settings = useAttendanceStore((s) => s.settings);
  const canceledDates = useAttendanceStore((s) => s.canceledDates);
  const summary = useMemo(
    () => getAttendanceSummary(classItem, records, settings, canceledDates),
    [classItem, records, settings, canceledDates]
  );

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-[18px] p-3"
      style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}
    >
      <View className="h-11 w-11 items-center justify-center rounded-[13px]" style={{ backgroundColor: classItem.color }}>
        <Text style={{ color: "#fff", fontFamily: "Outfit_800ExtraBold", fontSize: 19 }}>
          {classItem.name.trim().charAt(0).toUpperCase() || "?"}
        </Text>
      </View>
      <View className="flex-1 pr-1">
        <Text numberOfLines={1} className="text-[16.5px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
          {classItem.name}
        </Text>
        <Text numberOfLines={1} className="mt-0.5 text-[12.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_500Medium" }}>
          {classItem.sectionLabel ? `${classItem.sectionLabel} · ` : ""}
          {scheduleSummary(classItem)}
        </Text>
      </View>
      <View className="items-end gap-1">
        <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 19, color: classItem.color, fontVariant: ["tabular-nums"] }}>
          {summary.percentage}%
        </Text>
        <RiskBadge risk={summary.risk} />
      </View>
    </Pressable>
  );
};

// Focused editor for the cheap traits, mirroring the calendar's day sheet.
const QuickEditSheet = ({ classItem, onClose }: { classItem: ClassModel; onClose: () => void }) => {
  const palette = useAppPalette();
  const settings = useAttendanceStore((s) => s.settings);
  const { updateClass, updateClassColor, updateClassPriority } = useAttendanceStore();
  const lateWeight = classItem.lateCreditWeight ?? settings.lateCreditWeight;

  const go = (path: string) => {
    onClose();
    router.push(path as never);
  };

  const Label = ({ children }: { children: string }) => (
    <Text className="mb-2 mt-4 text-[12px] tracking-[0.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
      {children}
    </Text>
  );

  return (
    <>
      {/* Identity */}
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-[14px]" style={{ backgroundColor: classItem.color }}>
          <Text style={{ color: "#fff", fontFamily: "Outfit_800ExtraBold", fontSize: 21 }}>
            {classItem.name.trim().charAt(0).toUpperCase() || "?"}
          </Text>
        </View>
        <View className="flex-1">
          <Text numberOfLines={1} className="text-[19px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
            {classItem.name}
          </Text>
          <Text numberOfLines={1} className="text-[12.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_500Medium" }}>
            {classItem.sectionLabel ? `${classItem.sectionLabel} · ` : ""}
            {scheduleSummary(classItem)}
          </Text>
        </View>
      </View>

      <Label>PRIORITY</Label>
      <View className="flex-row gap-2">
        {appConfig.priorityOptions.map((level) => {
          const on = classItem.priority === level;
          return (
            <Pressable
              key={level}
              onPress={() => updateClassPriority(classItem.id, level)}
              className="flex-1 items-center rounded-[11px] py-2.5"
              style={{ backgroundColor: on ? palette.forest : palette.paper2, borderWidth: on ? 0 : 1, borderColor: palette.hairline }}
            >
              <Text className="text-[13px]" style={{ color: on ? "#fff" : palette.ink2, fontFamily: "Outfit_700Bold" }}>
                {PRIORITY_LABEL[level]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Label>LATE ARRIVALS COUNT AS</Label>
      <View className="flex-row gap-2">
        {appConfig.lateCreditOptions.map((weight) => {
          const on = lateWeight === weight;
          return (
            <Pressable
              key={weight}
              onPress={() => updateClass(classItem.id, { lateCreditWeight: weight })}
              className="flex-1 items-center rounded-[11px] py-2.5"
              style={{ backgroundColor: on ? palette.forest : palette.paper2, borderWidth: on ? 0 : 1, borderColor: palette.hairline }}
            >
              <Text className="text-[12.5px]" style={{ color: on ? "#fff" : palette.ink2, fontFamily: "Outfit_700Bold" }}>
                {lateChipLabel(weight)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Label>COLOR</Label>
      <View className="flex-row flex-wrap gap-2.5">
        {appConfig.classColorOptions.map((option) => (
          <Pressable
            key={option}
            onPress={() => updateClassColor(classItem.id, option)}
            className="h-8 w-8 rounded-full"
            style={{ backgroundColor: option, borderWidth: 3, borderColor: classItem.color === option ? palette.ink : "transparent" }}
          />
        ))}
      </View>

      <View className="mt-5 flex-row gap-2.5">
        <Pressable
          onPress={() => go(`/class/${classItem.id}`)}
          className="flex-1 items-center rounded-[16px] py-3.5"
          style={{ backgroundColor: palette.paper2, borderWidth: 1, borderColor: palette.hairline }}
        >
          <Text className="text-[15px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
            Open course
          </Text>
        </Pressable>
        <Pressable onPress={() => go(`/class/edit/${classItem.id}`)} className="flex-1 items-center rounded-[16px] py-3.5" style={{ backgroundColor: palette.forest }}>
          <Text className="text-[15px]" style={{ color: palette.onGradient, fontFamily: "Outfit_800ExtraBold" }}>
            Edit all details
          </Text>
        </Pressable>
      </View>
    </>
  );
};

export const CoursesScreen = () => {
  const palette = useAppPalette();
  const classes = useAttendanceStore((state) => state.classes);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sorted = useMemo(() => [...classes].sort((a, b) => a.name.localeCompare(b.name)), [classes]);
  const active = classes.find((c) => c.id === activeId) ?? null;

  return (
    <ScreenContainer wideMaxWidth={720}>
      <View className="mb-4">
        <Text className="text-[32px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
          Courses
        </Text>
        <Text className="mt-0.5 text-[13.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_500Medium" }}>
          {classes.length === 0
            ? "Add a course to start tracking"
            : `${classes.length} ${classes.length === 1 ? "course" : "courses"} — tap to manage`}
        </Text>
      </View>

      {sorted.length === 0 ? (
        <View className="items-center rounded-[18px] px-5 py-10" style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}>
          <View className="h-12 w-12 items-center justify-center rounded-[14px]" style={{ backgroundColor: palette.forestSoft }}>
            <Icon name="book" size={26} color={palette.forest} stroke={2} />
          </View>
          <Text className="mt-3 text-center text-[16px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
            No courses yet
          </Text>
          <Text className="mt-1 text-center text-[13.5px] leading-[19px]" style={{ color: palette.ink3, fontFamily: "Outfit_500Medium" }}>
            Add your courses to manage their schedule, attendance rules, color and priority here.
          </Text>
        </View>
      ) : (
        <View className="gap-2.5">
          {sorted.map((classItem) => (
            <CourseRow key={classItem.id} classItem={classItem} onPress={() => setActiveId(classItem.id)} />
          ))}
        </View>
      )}

      <Pressable
        onPress={() => router.push("/class/new")}
        className="mt-4 flex-row items-center justify-center gap-2 rounded-[16px] py-3.5"
        style={{ backgroundColor: palette.forest }}
      >
        <Icon name="plus" size={20} color="#fff" stroke={2.4} />
        <Text className="text-[16px]" style={{ color: "#fff", fontFamily: "Outfit_800ExtraBold" }}>
          Add course
        </Text>
      </Pressable>

      <Sheet open={active !== null} onClose={() => setActiveId(null)}>
        {active ? <QuickEditSheet classItem={active} onClose={() => setActiveId(null)} /> : null}
      </Sheet>
    </ScreenContainer>
  );
};
