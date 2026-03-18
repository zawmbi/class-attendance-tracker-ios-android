import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useAppPalette } from "@/theme/useAppPalette";
import { getMonthCells, getSemesterMonths, getWeekSessions } from "@/utils/calendar";
import { getMonthLabel } from "@/utils/date";

type CalendarMode = "week" | "month" | "semester";

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const CalendarScreen = () => {
  const palette = useAppPalette();
  const { classes } = useAttendanceStore();
  const [mode, setMode] = useState<CalendarMode>("week");
  const now = new Date();
  const weekSessions = useMemo(() => getWeekSessions(classes, now), [classes, now]);
  const monthCells = useMemo(() => getMonthCells(classes, now), [classes, now]);
  const semesterMonths = useMemo(() => getSemesterMonths(classes, now), [classes, now]);

  return (
    <ScreenContainer>
      <SectionHeader title="Calendar" subtitle="Weekly, monthly, and semester rhythm for all your classes." centered />

      <View
        className="mb-6 flex-row rounded-full p-1.5"
        style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
      >
        {(["week", "month", "semester"] as CalendarMode[]).map((option) => {
          const active = option === mode;
          return (
            <Pressable
              key={option}
              className="flex-1 rounded-full px-4 py-3"
              style={{ backgroundColor: active ? palette.primary : "transparent" }}
              onPress={() => setMode(option)}
            >
              <Text className="text-center capitalize" style={{ color: active ? palette.background : palette.primary }}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {mode === "week" ? (
        <View>
          {weekSessions.map((session) => (
            <View
              key={session.key}
              className="mb-4 rounded-[28px] px-5 py-5"
              style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                  <Text className="font-serif text-[26px]" style={{ color: palette.primary }}>
                    {session.sectionLabel ? `${session.className} • ${session.sectionLabel}` : session.className}
                  </Text>
                  <Text className="mt-2 text-sm" style={{ color: palette.muted }}>
                    {session.locationLabel}
                  </Text>
                </View>
                <View className="h-4 w-4 rounded-full" style={{ backgroundColor: session.color }} />
              </View>
              <Text className="mt-4 text-sm" style={{ color: palette.ink }}>
                {session.dayLabel} • {session.startLabel} - {session.endLabel}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {mode === "month" ? (
        <View
          className="rounded-[32px] px-5 py-5"
          style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
        >
          <Text className="text-center font-serif text-[28px]" style={{ color: palette.primary }}>
            {getMonthLabel(now)}
          </Text>
          <View className="mt-5 flex-row justify-between">
            {weekdayLabels.map((label) => (
              <Text key={label} className="w-[13.5%] text-center text-[11px] uppercase tracking-[1.4px]" style={{ color: palette.muted }}>
                {label}
              </Text>
            ))}
          </View>
          <View className="mt-4 flex-row flex-wrap justify-between">
            {monthCells.map((cell) => (
              <View
                key={cell.key}
                className="mb-3 h-[72px] w-[13.5%] rounded-[18px] px-1.5 py-2"
                style={{ backgroundColor: cell.inMonth ? palette.background : "transparent" }}
              >
                <Text className="text-center text-sm" style={{ color: cell.inMonth ? palette.primary : `${palette.muted}66` }}>
                  {cell.dayNumber}
                </Text>
                <View className="mt-2 items-center">
                  {cell.sessions.map((session) => (
                    <View
                      key={`${cell.key}-${session.id}`}
                      className="mb-1 h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: session.color }}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {mode === "semester" ? (
        <View>
          {semesterMonths.map((month) => (
            <View
              key={month.key}
              className="mb-5 rounded-[30px] px-5 py-5"
              style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
            >
              <Text className="font-serif text-[26px]" style={{ color: palette.primary }}>
                {month.label}
              </Text>
              <View className="mt-4 flex-row flex-wrap">
                {month.cells.map((cell) => (
                  <View
                    key={cell.key}
                    className="mb-2 mr-2 h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: palette.background }}
                  >
                    {cell.sessions.length > 0 ? (
                      <View className="flex-row flex-wrap items-center justify-center">
                        {cell.sessions.map((session) => (
                          <View
                            key={`${cell.key}-${session.id}`}
                            className="m-[1px] h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: session.color }}
                          />
                        ))}
                      </View>
                    ) : (
                      <Text className="text-[10px]" style={{ color: palette.muted }}>
                        {cell.dayNumber}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </ScreenContainer>
  );
};
