import { useMemo, useState } from "react";
import { Link, useRouter } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";

import { Icon, IconName } from "@/components/Icon";
import { BufferGauge } from "@/components/attenza/BufferGauge";
import { Sheet } from "@/components/attenza/Sheet";
import { StatusPill, AttenzaStatus } from "@/components/attenza/StatusPill";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useAppPalette } from "@/theme/useAppPalette";
import { getClassRecords } from "@/utils/attendance";
import { deriveClass, RISK_META, riskTone } from "@/utils/attenza";
import { formatTimeLabel } from "@/utils/date";

const shortDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(iso));

const EDIT_OPTIONS: { status: AttenzaStatus; icon: IconName; label: string }[] = [
  { status: "present", icon: "present", label: "Present" },
  { status: "late", icon: "late", label: "Late" },
  { status: "absent", icon: "absent", label: "Absent" }
];

export const ClassDetailScreen = ({ classId }: { classId: string }) => {
  const palette = useAppPalette();
  const router = useRouter();
  const { classes, records, settings, updateRecordStatus, deleteClass } = useAttendanceStore();
  const classItem = classes.find((item) => item.id === classId);
  const [editId, setEditId] = useState<string | null>(null);

  const derived = useMemo(
    () => (classItem ? deriveClass(classItem, records, settings) : null),
    [classItem, records, settings]
  );
  const history = useMemo(() => (classItem ? getClassRecords(records, classItem.id) : []), [classItem, records]);

  if (!classItem || !derived) {
    return (
      <ScreenContainer wideMaxWidth={720}>
        <Text className="text-[22px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
          Class not found
        </Text>
      </ScreenContainer>
    );
  }

  const tone = riskTone(derived.risk, palette);
  const finalIfPerfect =
    derived.semTotal > 0
      ? Math.round(((derived.present + derived.late + derived.remaining) / derived.semTotal) * 100)
      : derived.pct;
  const days = Array.from(new Set(classItem.schedule.map((s) => s.day.slice(0, 3)))).join(" · ");
  const timeLabel = formatTimeLabel(classItem.schedule[0]?.startTime ?? "09:00");
  const editing = history.find((r) => r.id === editId);

  const confirmDelete = () => {
    Alert.alert(
      "Delete class?",
      `This permanently removes "${classItem.name}" and all of its attendance history. This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteClass(classItem.id);
            router.back();
          }
        }
      ]
    );
  };

  return (
    <ScreenContainer wideMaxWidth={880}>
      {/* Back + edit */}
      <View className="mb-2 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-1 py-1"
          accessibilityLabel="Back"
        >
          <Icon name="back" size={21} color={palette.forest} stroke={2.2} />
          <Text className="text-[16px]" style={{ color: palette.forest, fontFamily: "Outfit_700Bold" }}>
            Today
          </Text>
        </Pressable>
        <Link href={`/class/edit/${classItem.id}`} asChild>
          <Pressable
            accessibilityLabel="Edit class"
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}
          >
            <Icon name="edit" size={20} color={palette.ink2} />
          </Pressable>
        </Link>
      </View>

      {/* Header */}
      <View className="mb-4">
        <View className="mb-1 flex-row items-center gap-2">
          <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: classItem.color }} />
          <Text className="text-[13px] tracking-[0.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_800ExtraBold" }}>
            {(classItem.sectionLabel || "Section").toUpperCase()} · {classItem.room}
          </Text>
        </View>
        <Text className="text-[28px] leading-[32px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
          {classItem.name}
        </Text>
        <Text className="mt-1 text-[14px]" style={{ color: palette.ink2, fontFamily: "Outfit_600SemiBold" }}>
          {[classItem.professor, days, timeLabel].filter(Boolean).join(" · ")}
        </Text>
      </View>

      {/* Hero: % + buffer gauge */}
      <View
        className="mb-3 flex-row items-center rounded-[22px] p-4"
        style={{
          backgroundColor: palette.card,
          borderWidth: 1,
          borderColor: palette.hairline,
          shadowColor: palette.forestDeep,
          shadowOpacity: 0.1,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 3
        }}
      >
        <View className="flex-1 items-center">
          <View className="flex-row items-end">
            <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 54, lineHeight: 54, color: tone, fontVariant: ["tabular-nums"] }}>
              {derived.pct}
            </Text>
            <Text style={{ fontFamily: "Fraunces_500Medium", fontSize: 24, color: palette.ink3, marginBottom: 6 }}>%</Text>
          </View>
          <Text className="text-[13px]" style={{ color: palette.ink2, fontFamily: "Outfit_700Bold" }}>
            attendance
          </Text>
          <View
            className="mt-2 flex-row items-center gap-1.5 rounded-full px-2.5 py-1.5"
            style={{ backgroundColor: `${tone}22` }}
          >
            <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tone }} />
            <Text className="text-[12.5px]" style={{ color: tone, fontFamily: "Outfit_800ExtraBold" }}>
              {RISK_META[derived.risk].label}
            </Text>
          </View>
          <Text className="mt-1.5 text-[12px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
            Target {derived.target}%
          </Text>
        </View>
        <View style={{ width: 1, alignSelf: "stretch", backgroundColor: palette.hairline, marginVertical: 4 }} />
        <View className="flex-1 items-center">
          <BufferGauge canMiss={derived.buffer} total={derived.allowed} size={124} label="more you can miss" />
        </View>
      </View>

      {/* Counts */}
      <View className="mb-3 flex-row gap-2.5">
        {([
          ["present", derived.present, "Present", palette.present],
          ["late", derived.late, "Late", palette.late],
          ["absent", derived.absent, "Absent", palette.absent]
        ] as const).map(([icon, value, label, c]) => (
          <View
            key={label}
            className="flex-1 items-center rounded-[18px] py-3"
            style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}
          >
            <Icon name={icon as IconName} size={20} color={c} stroke={2} />
            <Text className="mt-1 text-[22px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold", fontVariant: ["tabular-nums"] }}>
              {value}
            </Text>
            <Text className="text-[11.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* Projection */}
      <View className="mb-4 rounded-[22px] p-4" style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}>
        <View className="mb-2 flex-row items-center gap-2">
          <Icon name="chart" size={19} color={palette.forest} stroke={2} />
          <Text className="text-[14.5px]" style={{ color: palette.forest, fontFamily: "Outfit_800ExtraBold" }}>
            Projection
          </Text>
        </View>
        <Text className="text-[15px] leading-[22px]" style={{ color: palette.ink, fontFamily: "Outfit_500Medium" }}>
          {derived.remaining} classes left this term. Attend them all and you finish at{" "}
          <Text style={{ fontFamily: "Outfit_800ExtraBold" }}>{finalIfPerfect}%</Text>.{" "}
          {derived.buffer > 0
            ? `You can still miss ${derived.buffer} and stay above your ${derived.target}% target.`
            : "You're at your limit — every remaining class counts."}
        </Text>
      </View>

      {/* History */}
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-[22px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
          History
        </Text>
        <Link href={`/class/${classItem.id}/record`} asChild>
          <Pressable
            className="flex-row items-center gap-1 rounded-full px-3 py-1.5"
            style={{ backgroundColor: palette.forestSoft }}
          >
            <Icon name="plus" size={15} color={palette.forest} stroke={2.4} />
            <Text style={{ color: palette.forest, fontFamily: "Outfit_700Bold", fontSize: 12.5 }}>Add record</Text>
          </Pressable>
        </Link>
      </View>

      {history.length > 0 ? (
        <View className="overflow-hidden rounded-[22px]" style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}>
          {history.map((record, i) => (
            <Pressable
              key={record.id}
              onPress={() => setEditId(record.id)}
              className="flex-row items-center justify-between px-4 py-3"
              style={i > 0 ? { borderTopWidth: 1, borderTopColor: palette.hairline } : undefined}
            >
              <Text className="text-[15px]" style={{ color: palette.ink, fontFamily: "Outfit_600SemiBold" }}>
                {shortDate(record.date)}
              </Text>
              <View className="flex-row items-center gap-2">
                <StatusPill status={record.status as AttenzaStatus} size="sm" />
                <Icon name="chevron" size={15} color={palette.ink3} stroke={2} />
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View className="items-center rounded-[22px] px-5 py-7" style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}>
          <Icon name="inbox" size={26} color={palette.ink3} />
          <Text className="mt-2 text-center text-[14px]" style={{ color: palette.ink2, fontFamily: "Outfit_500Medium" }}>
            No sessions logged yet.
          </Text>
        </View>
      )}

      {/* Delete class */}
      <Pressable
        onPress={confirmDelete}
        className="mt-5 flex-row items-center justify-center gap-2 rounded-[18px] py-3.5"
        style={{ borderWidth: 1, borderColor: `${palette.absent}55` }}
      >
        <Icon name="trash" size={18} color={palette.absent} stroke={2} />
        <Text style={{ color: palette.absent, fontFamily: "Outfit_700Bold", fontSize: 14.5 }}>Delete class</Text>
      </Pressable>

      {/* Edit sheet */}
      <Sheet open={editId !== null} onClose={() => setEditId(null)}>
        {editing ? (
          <View>
            <Text className="text-[13px] tracking-[0.5px]" style={{ color: palette.goldDeep, fontFamily: "Outfit_800ExtraBold" }}>
              {shortDate(editing.date).toUpperCase()}
            </Text>
            <Text className="mb-4 mt-0.5 text-[19px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
              Edit attendance
            </Text>
            <View className="flex-row gap-2.5">
              {EDIT_OPTIONS.map(({ status, icon, label }) => {
                const on = editing.status === status;
                const c = status === "present" ? palette.present : status === "late" ? palette.late : palette.absent;
                const soft = status === "present" ? palette.presentSoft : status === "late" ? palette.lateSoft : palette.absentSoft;
                return (
                  <Pressable
                    key={status}
                    onPress={() => {
                      updateRecordStatus(editing.id, status);
                      setEditId(null);
                    }}
                    className="flex-1 items-center gap-1.5 rounded-[16px] py-4"
                    style={{ borderWidth: on ? 2 : 1.5, borderColor: on ? c : palette.hairline, backgroundColor: on ? soft : palette.card2 }}
                  >
                    <Icon name={icon} size={26} color={on ? c : palette.ink3} stroke={2} label={label} />
                    <Text className="text-[13px]" style={{ color: on ? c : palette.ink2, fontFamily: "Outfit_800ExtraBold" }}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              onPress={() => {
                updateRecordStatus(editing.id, editing.status === "excused" ? editing.originalStatus ?? "absent" : "excused");
                setEditId(null);
              }}
              className="mt-3 items-center rounded-[16px] py-3"
              style={{ backgroundColor: editing.status === "excused" ? palette.excusedSoft : palette.card2, borderWidth: 1, borderColor: palette.hairline }}
            >
              <Text className="text-[13.5px]" style={{ color: palette.excused, fontFamily: "Outfit_700Bold" }}>
                {editing.status === "excused" ? "Restore previous status" : "Mark as excused"}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View />
        )}
      </Sheet>
    </ScreenContainer>
  );
};
