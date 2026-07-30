import { useMemo, useState } from "react";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Segmented } from "@/components/attenza/Segmented";
import { Sheet } from "@/components/attenza/Sheet";
import { Toggle } from "@/components/attenza/Toggle";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useAppPalette } from "@/theme/useAppPalette";
import { useIsWide } from "@/theme/responsive";
import { deriveClass, riskTone } from "@/utils/attenza";
import { addDays, formatLongDate, formatTimeLabel, getMonthLabel, toDateKey } from "@/utils/date";
import { AttendanceStatus, Weekday } from "@/utils/types";

const WEEK: { short: Weekday; letter: string }[] = [
  { short: "Monday", letter: "M" },
  { short: "Tuesday", letter: "T" },
  { short: "Wednesday", letter: "W" },
  { short: "Thursday", letter: "T" },
  { short: "Friday", letter: "F" }
];

// getDay() (0 = Sunday) → Weekday, matching the Sunday-first month grid.
const WEEKDAY_BY_INDEX: Weekday[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const STATUS_OPTIONS: AttendanceStatus[] = ["present", "late", "absent", "excused"];
const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  excused: "Excused"
};

// Match record date keys produced elsewhere (markAttendance uses toISOString slice).
const iso = (date: Date) => toDateKey(date);

const termLabel = (now: Date) => {
  const m = now.getMonth();
  const season = m <= 4 ? "Spring" : m <= 7 ? "Summer" : "Fall";
  return `${season} ${now.getFullYear()}`;
};

export const CalendarScreen = () => {
  const palette = useAppPalette();
  const wide = useIsWide();
  const { classes, records, settings, canceledDates, setAttendanceForDate, clearAttendanceForDate, toggleCanceledDate } =
    useAttendanceStore();
  const [view, setView] = useState("Week");
  const [selected, setSelected] = useState<Weekday>("Monday");
  const now = new Date();
  const todayIso = iso(now);

  // Month view navigates independently of "today".
  const [monthCursor, setMonthCursor] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const statusColor = (status: AttendanceStatus) =>
    ({ present: palette.present, late: palette.late, absent: palette.absent, excused: palette.excused }[status]);
  const statusSoft = (status: AttendanceStatus) =>
    ({ present: palette.presentSoft, late: palette.lateSoft, absent: palette.absentSoft, excused: palette.excusedSoft }[status]);

  // Monday-anchored dates for this week's chips (number + ISO key).
  const weekDates = useMemo(() => {
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return WEEK.map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return { num: d.getDate(), key: iso(d) };
    });
  }, [now]);

  const derivedById = useMemo(() => {
    const map = new Map<string, ReturnType<typeof deriveClass>>();
    classes.forEach((c) => map.set(c.id, deriveClass(c, records, settings, canceledDates)));
    return map;
  }, [classes, records, settings, canceledDates]);

  const classesOnWeekday = (day: Weekday) =>
    classes
      .filter((c) => c.schedule.some((s) => s.day === day))
      .map((c) => ({ classItem: c, entry: c.schedule.find((s) => s.day === day)! }))
      .sort((a, b) => a.entry.startTime.localeCompare(b.entry.startTime));

  const recordFor = (classId: string, date: string) =>
    records.find((r) => r.classId === classId && r.date === date);

  const inTerm = (date: string) => {
    if (settings.termStartDate && date < settings.termStartDate) return false;
    if (settings.termEndDate && date > settings.termEndDate) return false;
    return true;
  };

  // 6-week (42-cell) Sunday-anchored grid for the cursor month.
  const monthGrid = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const first = new Date(year, month, 1);
    const gridStart = addDays(first, -first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const date = addDays(gridStart, i);
      const key = iso(date);
      const weekday = WEEKDAY_BY_INDEX[date.getDay()];
      const sessions = classes
        .filter((c) => c.schedule.some((s) => s.day === weekday))
        .map((c) => {
          const entry = c.schedule.find((s) => s.day === weekday)!;
          const record = records.find((r) => r.classId === c.id && r.date === key);
          return { id: c.id, name: c.name, color: c.color, time: entry.startTime, status: record?.status ?? null };
        })
        .sort((a, b) => a.time.localeCompare(b.time));
      return {
        key,
        date,
        dayNumber: date.getDate(),
        inMonth: date.getMonth() === month,
        canceled: canceledDates.includes(key),
        sessions
      };
    });
  }, [monthCursor, classes, records, canceledDates]);

  const monthCells = monthGrid; // alias for readability below
  const overall = classes.length
    ? Math.round([...derivedById.values()].reduce((s, c) => s + c.pct, 0) / classes.length)
    : 100;

  // Logged/missed/holiday tallies for the month currently in view.
  const monthStats = useMemo(() => {
    const prefix = `${monthCursor.getFullYear()}-${String(monthCursor.getMonth() + 1).padStart(2, "0")}`;
    const inMonth = records.filter((r) => r.date.startsWith(prefix));
    return {
      attended: inMonth.filter((r) => r.status === "present" || r.status === "late").length,
      missed: inMonth.filter((r) => r.status === "absent").length,
      holidays: canceledDates.filter((d) => d.startsWith(prefix)).length
    };
  }, [records, monthCursor, canceledDates]);

  // How many of this week's sessions have been logged.
  const weekStats = useMemo(() => {
    let total = 0;
    let logged = 0;
    WEEK.forEach((d, i) => {
      classesOnWeekday(d.short).forEach(({ classItem }) => {
        total += 1;
        if (records.some((r) => r.classId === classItem.id && r.date === weekDates[i].key)) logged += 1;
      });
    });
    return { total, logged };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes, records, weekDates]);
  const termWeeks =
    settings.termStartDate && settings.termEndDate
      ? Math.max(1, Math.round((new Date(settings.termEndDate).getTime() - new Date(settings.termStartDate).getTime()) / (7 * 864e5)))
      : classes.reduce((m, c) => Math.max(m, c.courseLengthWeeks), 0);

  const editingClasses = editingDate
    ? classesOnWeekday(WEEKDAY_BY_INDEX[new Date(`${editingDate}T00:00:00`).getDay()])
    : [];
  const editingCanceled = editingDate ? canceledDates.includes(editingDate) : false;

  const shiftMonth = (delta: number) =>
    setMonthCursor((cur) => new Date(cur.getFullYear(), cur.getMonth() + delta, 1));

  return (
    <ScreenContainer wideMaxWidth={1040}>
      <View className="mb-4">
        <Text className="text-[13px] tracking-[1.5px]" style={{ color: palette.goldDeep, fontFamily: "Outfit_800ExtraBold" }}>
          {termLabel(now).toUpperCase()}
        </Text>
        <Text className="text-[32px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
          Calendar
        </Text>
      </View>

      <Segmented options={["Week", "Month", "Semester"]} value={view} onChange={setView} />

      {view === "Week" ? (
        <View className="mt-4">
          <View className="flex-row gap-2">
            {WEEK.map((d, i) => {
              const on = d.short === selected;
              const dots = classesOnWeekday(d.short).slice(0, 3);
              return (
                <Pressable
                  key={d.short}
                  onPress={() => setSelected(d.short)}
                  className="flex-1 items-center gap-2 rounded-[16px] pb-2.5 pt-3"
                  style={{
                    backgroundColor: on ? palette.forest : palette.card,
                    borderWidth: on ? 0 : 1,
                    borderColor: palette.hairline
                  }}
                >
                  <Text className="text-[11.5px]" style={{ color: on ? "rgba(255,255,255,0.8)" : palette.ink3, fontFamily: "Outfit_700Bold" }}>
                    {d.letter}
                  </Text>
                  <Text className="text-[18px]" style={{ color: on ? "#fff" : palette.ink, fontFamily: "Outfit_800ExtraBold", fontVariant: ["tabular-nums"] }}>
                    {weekDates[i].num}
                  </Text>
                  <View className="h-1.5 flex-row gap-[3px]">
                    {dots.map(({ classItem }) => {
                      const rec = records.find((r) => r.classId === classItem.id && r.date === weekDates[i].key);
                      return (
                        <View
                          key={classItem.id}
                          className="h-[5px] w-[5px] rounded-full"
                          style={{
                            backgroundColor: on ? "rgba(255,255,255,0.85)" : rec ? statusColor(rec.status) : classItem.color,
                            opacity: on || rec ? 1 : 0.5
                          }}
                        />
                      );
                    })}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {weekStats.total > 0 ? (
            <View className="mt-3 flex-row items-center justify-between rounded-[14px] px-3.5 py-2.5" style={{ backgroundColor: palette.paper2 }}>
              <Text className="text-[12px] tracking-[0.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
                THIS WEEK
              </Text>
              <Text className="text-[13px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
                {weekStats.logged} of {weekStats.total} logged
              </Text>
            </View>
          ) : null}

          <View className="mt-4 gap-2.5">
            {classesOnWeekday(selected).length === 0 ? (
              <View className="items-center px-5 py-10">
                <View className="mb-3.5 h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: palette.paper2 }}>
                  <Icon name="today" size={30} color={palette.ink3} stroke={1.8} />
                </View>
                <Text className="text-[17px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
                  No classes
                </Text>
                <Text className="mt-0.5 text-[14px]" style={{ color: palette.ink3, fontFamily: "Outfit_500Medium" }}>
                  {classes.length === 0 ? "Add a course to fill your week." : `Enjoy your free ${selected}.`}
                </Text>
                {classes.length === 0 ? (
                  <Link href="/class/new" asChild>
                    <Pressable
                      className="mt-4 flex-row items-center gap-2 rounded-full px-5 py-2.5"
                      style={{ backgroundColor: palette.forestSoft, borderWidth: 1, borderColor: palette.hairline }}
                    >
                      <Icon name="plus" size={17} color={palette.forest} stroke={2.4} />
                      <Text style={{ color: palette.forest, fontFamily: "Outfit_700Bold", fontSize: 13.5 }}>Add a course</Text>
                    </Pressable>
                  </Link>
                ) : null}
              </View>
            ) : (
              classesOnWeekday(selected).map(({ classItem: c, entry }) => {
                const d = derivedById.get(c.id)!;
                return (
                  <Link key={c.id} href={`/class/${c.id}`} asChild>
                    <Pressable
                      className="flex-row items-center gap-3 rounded-[18px] p-3.5"
                      style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}
                    >
                      <Text numberOfLines={1} className="w-[72px] text-[12.5px]" style={{ color: palette.ink2, fontFamily: "Outfit_800ExtraBold" }}>
                        {formatTimeLabel(entry.startTime)}
                      </Text>
                      <View className="h-9 w-1 rounded-full" style={{ backgroundColor: c.color }} />
                      <View className="flex-1">
                        <Text numberOfLines={1} className="text-[15.5px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
                          {c.name}
                        </Text>
                        <Text className="text-[13px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
                          Room {c.room}
                        </Text>
                      </View>
                      <Text style={{ color: riskTone(d.risk, palette), fontFamily: "Outfit_800ExtraBold", fontSize: 14, fontVariant: ["tabular-nums"] }}>
                        {d.pct}%
                      </Text>
                    </Pressable>
                  </Link>
                );
              })
            )}
          </View>
        </View>
      ) : null}

      {view === "Month" ? (
        <View className="mt-4 rounded-[22px] p-4" style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}>
          <View className="mb-3 flex-row items-center justify-between">
            <Pressable onPress={() => shiftMonth(-1)} hitSlop={10} className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: palette.paper2 }}>
              <Icon name="back" size={18} color={palette.ink2} stroke={2} />
            </Pressable>
            <Text className="text-[20px]" style={{ color: palette.ink, fontFamily: "Fraunces_600SemiBold" }}>
              {getMonthLabel(monthCursor)}
            </Text>
            <Pressable onPress={() => shiftMonth(1)} hitSlop={10} className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: palette.paper2 }}>
              <View style={{ transform: [{ rotate: "180deg" }] }}>
                <Icon name="back" size={18} color={palette.ink2} stroke={2} />
              </View>
            </Pressable>
          </View>
          <View className="flex-row">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <Text key={i} className="flex-1 text-center text-[11px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
                {d}
              </Text>
            ))}
          </View>
          <View className="mt-1.5 flex-row flex-wrap">
            {monthCells.map((cell) => {
              const editable = cell.inMonth && inTerm(cell.key);
              const isToday = cell.key === todayIso;
              return (
                <View key={cell.key} style={{ width: `${100 / 7}%`, padding: wide ? 4 : 3 }}>
                  <Pressable
                    disabled={!editable}
                    onPress={() => setEditingDate(cell.key)}
                    className="overflow-hidden rounded-[10px]"
                    style={{
                      aspectRatio: 1,
                      backgroundColor: !cell.inMonth ? "transparent" : isToday ? palette.forestSoft : palette.paper2,
                      borderWidth: isToday ? 1.5 : 0,
                      borderColor: palette.forest,
                      opacity: cell.inMonth && !editable ? 0.4 : 1,
                      padding: wide ? 6 : 0,
                      alignItems: wide ? "stretch" : "center",
                      justifyContent: wide ? "flex-start" : "center"
                    }}
                  >
                    {!cell.inMonth ? null : wide ? (
                      <>
                        <Text
                          className="mb-1 text-[12.5px]"
                          style={{
                            alignSelf: "flex-start",
                            color: isToday ? palette.forest : palette.ink2,
                            fontFamily: isToday ? "Outfit_800ExtraBold" : "Outfit_700Bold",
                            fontVariant: ["tabular-nums"]
                          }}
                        >
                          {cell.dayNumber}
                        </Text>
                        {cell.canceled ? (
                          <View className="self-start rounded-[6px] px-1.5 py-0.5" style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}>
                            <Text numberOfLines={1} className="text-[10.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
                              Holiday
                            </Text>
                          </View>
                        ) : (
                          <>
                            {cell.sessions.slice(0, 3).map((s) => (
                              <View
                                key={s.id}
                                className="mb-1 rounded-[6px] px-1.5 py-1"
                                style={{ backgroundColor: s.status ? statusSoft(s.status) : palette.card, borderLeftWidth: 3, borderLeftColor: s.color }}
                              >
                                <Text numberOfLines={1} className="text-[10.5px]" style={{ color: palette.ink2, fontFamily: "Outfit_600SemiBold" }}>
                                  {s.name}
                                </Text>
                              </View>
                            ))}
                            {cell.sessions.length > 3 ? (
                              <Text className="ml-0.5 text-[10px]" style={{ color: palette.ink3, fontFamily: "Outfit_700Bold" }}>
                                +{cell.sessions.length - 3} more
                              </Text>
                            ) : null}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <Text
                          className="text-[12.5px]"
                          style={{
                            color: isToday ? palette.forest : palette.ink2,
                            fontFamily: isToday ? "Outfit_800ExtraBold" : "Outfit_700Bold",
                            fontVariant: ["tabular-nums"]
                          }}
                        >
                          {cell.dayNumber}
                        </Text>
                        {cell.canceled ? (
                          <View className="mt-0.5 h-[5px] w-3 rounded-full" style={{ backgroundColor: palette.ink3 }} />
                        ) : cell.sessions.length > 0 ? (
                          <View className="mt-0.5 h-[6px] flex-row gap-[3px]">
                            {cell.sessions.slice(0, 3).map((s) => (
                              <View
                                key={s.id}
                                className="h-[5px] w-[5px] rounded-full"
                                style={{ backgroundColor: s.status ? statusColor(s.status) : s.color, opacity: s.status ? 1 : 0.45 }}
                              />
                            ))}
                          </View>
                        ) : (
                          <View className="mt-0.5 h-[6px]" />
                        )}
                      </>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>
          <View className="mt-3 flex-row flex-wrap gap-x-3.5 gap-y-1.5 pt-3" style={{ borderTopWidth: 1, borderTopColor: palette.hairline }}>
            {STATUS_OPTIONS.map((s) => (
              <View key={s} className="flex-row items-center gap-1.5">
                <View className="h-[7px] w-[7px] rounded-full" style={{ backgroundColor: statusColor(s) }} />
                <Text className="text-[11.5px] capitalize" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
                  {s}
                </Text>
              </View>
            ))}
            <Text className="text-[11.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_500Medium" }}>
              Tap a day to log or mark a holiday
            </Text>
          </View>
        </View>
      ) : null}

      {view === "Semester" ? (
        <View className="mt-4 gap-3">
          <View className="flex-row gap-3 rounded-[22px] p-4" style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline }}>
            {([
              [String(termWeeks || 16), "weeks"],
              [String(classes.length), "classes"],
              [`${overall}%`, "overall"]
            ] as const).map(([v, l]) => (
              <View key={l} className="flex-1 items-center">
                <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 28, color: palette.forest, fontVariant: ["tabular-nums"] }}>{v}</Text>
                <Text className="text-[12px]" style={{ color: palette.ink3, fontFamily: "Outfit_600SemiBold" }}>
                  {l}
                </Text>
              </View>
            ))}
          </View>
          <View className="rounded-[22px] p-4" style={{ backgroundColor: palette.goldSoft, borderWidth: 1, borderColor: palette.hairline }}>
            <View className="mb-1.5 flex-row items-center gap-2">
              <Icon name="target" size={18} color={palette.goldDeep} stroke={2} />
              <Text className="text-[14.5px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
                Finals stretch
              </Text>
            </View>
            <Text className="text-[14.5px] leading-[21px]" style={{ color: palette.ink2, fontFamily: "Outfit_500Medium" }}>
              Keep your current pace through the rest of term and you&apos;ll finish on track. Steady check-ins protect your buffer.
            </Text>
          </View>
        </View>
      ) : null}

      {/* Day editor */}
      <Sheet open={editingDate !== null} onClose={() => setEditingDate(null)}>
        {editingDate ? (
          <>
            <Text className="text-[13px] tracking-[0.5px]" style={{ color: palette.goldDeep, fontFamily: "Outfit_800ExtraBold" }}>
              {editingCanceled ? "HOLIDAY" : "LOG ATTENDANCE"}
            </Text>
            <Text className="mb-3 mt-0.5 text-[19px]" style={{ color: palette.ink, fontFamily: "Outfit_800ExtraBold" }}>
              {formatLongDate(editingDate)}
            </Text>

            <View className="mb-3 flex-row items-center gap-3 rounded-[14px] px-3.5 py-3" style={{ backgroundColor: palette.paper2 }}>
              <View className="h-8 w-8 items-center justify-center rounded-[9px]" style={{ backgroundColor: palette.ink3 }}>
                <Icon name="close" size={17} color="#fff" stroke={2} />
              </View>
              <View className="flex-1">
                <Text className="text-[15px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
                  No class (holiday)
                </Text>
                <Text className="text-[12px]" style={{ color: palette.ink3, fontFamily: "Outfit_500Medium" }}>
                  Skips the day so it doesn&apos;t count against you.
                </Text>
              </View>
              <Toggle value={editingCanceled} onChange={() => toggleCanceledDate(editingDate)} />
            </View>

            {editingCanceled ? (
              <Text className="px-1 py-2 text-[13.5px] leading-[19px]" style={{ color: palette.ink3, fontFamily: "Outfit_500Medium" }}>
                This day is marked as a holiday. Turn it off to log attendance for the classes below.
              </Text>
            ) : editingClasses.length === 0 ? (
              <Text className="px-1 py-2 text-[13.5px]" style={{ color: palette.ink3, fontFamily: "Outfit_500Medium" }}>
                No classes scheduled on this day.
              </Text>
            ) : (
              <View className="gap-2.5">
                {editingClasses.map(({ classItem, entry }) => {
                  const rec = recordFor(classItem.id, editingDate);
                  return (
                    <View key={classItem.id} className="rounded-[14px] p-3" style={{ backgroundColor: palette.paper2 }}>
                      <View className="mb-2.5 flex-row items-center gap-2.5">
                        <View className="h-8 w-1 rounded-full" style={{ backgroundColor: classItem.color }} />
                        <View className="flex-1">
                          <Text numberOfLines={1} className="text-[15px]" style={{ color: palette.ink, fontFamily: "Outfit_700Bold" }}>
                            {classItem.name}
                          </Text>
                          <Text className="text-[12px]" style={{ color: palette.ink3, fontFamily: "Outfit_500Medium" }}>
                            {formatTimeLabel(entry.startTime)}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row gap-2">
                        {STATUS_OPTIONS.map((s) => {
                          const on = rec?.status === s;
                          return (
                            <Pressable
                              key={s}
                              onPress={() => setAttendanceForDate(classItem.id, editingDate, s)}
                              className="flex-1 items-center rounded-[10px] px-1 py-2.5"
                              style={{ backgroundColor: on ? statusColor(s) : palette.card, borderWidth: on ? 0 : 1, borderColor: palette.hairline }}
                            >
                              <Text numberOfLines={1} className="text-[13px]" style={{ color: on ? "#fff" : palette.ink2, fontFamily: "Outfit_700Bold" }}>
                                {STATUS_LABEL[s]}
                              </Text>
                            </Pressable>
                          );
                        })}
                        <Pressable
                          onPress={() => clearAttendanceForDate(classItem.id, editingDate)}
                          disabled={!rec}
                          className="items-center justify-center rounded-[10px] px-3"
                          style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.hairline, opacity: rec ? 1 : 0.4 }}
                        >
                          <Icon name="close" size={15} color={palette.ink2} stroke={2.2} />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <Pressable onPress={() => setEditingDate(null)} className="mt-4 items-center rounded-[16px] py-3.5" style={{ backgroundColor: palette.forest }}>
              <Text className="text-[16px]" style={{ color: palette.onGradient, fontFamily: "Outfit_800ExtraBold" }}>
                Done
              </Text>
            </Pressable>
          </>
        ) : null}
      </Sheet>
    </ScreenContainer>
  );
};
