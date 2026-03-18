import { ReactElement, useEffect, useState } from "react";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import Svg, { Circle, Line, Path } from "react-native-svg";

import { ClassCard } from "@/components/ClassCard";
import { IncentiveBanner } from "@/components/IncentiveBanner";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { useAttendanceStore } from "@/store/attendanceStore";
import { useUserStore } from "@/store/userStore";
import { useAppPalette } from "@/theme/useAppPalette";
import { getAttendanceSummary, getIncentiveMessage } from "@/utils/attendance";
import { isClassToday } from "@/utils/date";
import { getMotivationInsights } from "@/utils/motivation";
import { DashboardWidget } from "@/utils/types";

const ToolbarIconButton = ({
  children,
  active = false
}: {
  children: ReactElement;
  active?: boolean;
}) => {
  const palette = useAppPalette();

  return (
    <View
      className="h-12 w-12 items-center justify-center rounded-full"
      style={{
        backgroundColor: active ? palette.primary : palette.surface,
        borderWidth: 1,
        borderColor: active ? palette.primary : palette.border
      }}
    >
      {children}
    </View>
  );
};

const ReorderIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
    <Circle cx="4" cy="4" r="1.4" fill={color} />
    <Circle cx="4" cy="9" r="1.4" fill={color} />
    <Circle cx="4" cy="14" r="1.4" fill={color} />
    <Line x1="8" y1="4" x2="14" y2="4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Line x1="8" y1="9" x2="14" y2="9" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Line x1="8" y1="14" x2="14" y2="14" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

const MoveButton = ({
  direction,
  disabled,
  onPress
}: {
  direction: "up" | "down";
  disabled: boolean;
  onPress: () => void;
}) => {
  const palette = useAppPalette();

  return (
    <Pressable
      className="h-9 w-9 items-center justify-center rounded-full"
      style={{
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
        opacity: disabled ? 0.35 : 1
      }}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={{ color: palette.primary, fontSize: 16 }}>{direction === "up" ? "↑" : "↓"}</Text>
    </Pressable>
  );
};

const WidgetShell = ({
  editing,
  index,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  children
}: {
  editing: boolean;
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  children: ReactElement;
}) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (editing) {
      const start = index % 2 === 0 ? -0.35 : 0.35;
      rotation.value = start;
      rotation.value = withRepeat(withTiming(start * -1, { duration: 185 }), -1, true);
      return;
    }

    rotation.value = withTiming(0, { duration: 160 });
  }, [editing, index, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }]
  }));

  return (
    <Animated.View className="mb-6" style={animatedStyle}>
      {editing ? (
        <View className="absolute right-3 top-3 z-10 flex-row gap-2">
          <MoveButton direction="up" disabled={!canMoveUp} onPress={onMoveUp} />
          <MoveButton direction="down" disabled={!canMoveDown} onPress={onMoveDown} />
        </View>
      ) : null}
      {children}
    </Animated.View>
  );
};

export const DashboardScreen = () => {
  const palette = useAppPalette();
  const { classes, records, settings } = useAttendanceStore();
  const { dashboardWidgetOrder, moveDashboardWidget } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);

  const todaysClasses = classes.filter((classItem) => isClassToday(classItem.schedule));
  const strongestStreak = classes.reduce((best, classItem) => {
    const summary = getAttendanceSummary(classItem, records, settings);
    return summary.streak > best ? summary.streak : best;
  }, 0);
  const motivationInsights = getMotivationInsights(classes, records, settings);
  const topInsight = motivationInsights[0];
  const shouldHideMotivationCard =
    settings.incentiveSystemEnabled && topInsight?.tone === "streak";
  const otherClasses = classes.filter((classItem) => !todaysClasses.some((todayClass) => todayClass.id === classItem.id));

  const widgets: Record<DashboardWidget, ReactElement | null> = {
    actions: (
      <View key="actions" className="flex-row gap-3">
        <Link href="/(tabs)/check-in" asChild>
          <Pressable className="flex-1 items-center justify-center rounded-[24px] px-4 py-4" style={{ backgroundColor: palette.primary }}>
            <Text className="font-serif text-[18px]" style={{ color: palette.background }}>
              Check In
            </Text>
          </Pressable>
        </Link>
        <Link href="/class/new" asChild>
          <Pressable
            className="flex-1 items-center justify-center rounded-[24px] px-4 py-4"
            style={{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}
          >
            <Text className="font-serif text-[18px]" style={{ color: palette.primary }}>
              Add Class
            </Text>
          </Pressable>
        </Link>
      </View>
    ),
    momentum: settings.incentiveSystemEnabled ? (
      <View key="momentum">
        <IncentiveBanner streak={strongestStreak} message={getIncentiveMessage(strongestStreak)} />
      </View>
    ) : null,
    motivation:
      settings.motivationMessagesEnabled && topInsight && !shouldHideMotivationCard ? (
        <View
          key="motivation"
          className="rounded-[28px] px-5 py-5"
          style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1 }}
        >
          <Text className="text-center text-[11px] uppercase tracking-[1.8px]" style={{ color: palette.muted }}>
            {topInsight.title}
          </Text>
          <Text className="mt-3 text-center text-sm leading-6" style={{ color: palette.ink }}>
            {topInsight.message}
          </Text>
        </View>
      ) : null,
    today: (
      <View key="today">
        <SectionHeader
          title="Today"
          subtitle={todaysClasses.length > 0 ? "Classes scheduled for today." : "Nothing scheduled today."}
          centered
        />
        {todaysClasses.length > 0 ? (
          todaysClasses.length === 1 ? (
            <ClassCard classItem={todaysClasses[0]} records={records} settings={settings} index={0} />
          ) : (
            <View className="mb-4 flex-row flex-wrap justify-between">
              {todaysClasses.map((classItem, index) => (
                <View key={classItem.id} style={{ width: "48.5%" }}>
                  <ClassCard classItem={classItem} records={records} settings={settings} index={index} compact />
                </View>
              ))}
            </View>
          )
        ) : (
          <View className="mb-2 items-center rounded-card border border-dashed px-5 py-6" style={{ borderColor: palette.border }}>
            <Text className="max-w-[280px] text-center" style={{ color: palette.muted }}>
              Use Quick Check-In to record any ad-hoc attendance today.
            </Text>
          </View>
        )}
      </View>
    ),
    more_classes: otherClasses.length > 0 ? (
      <View key="more_classes">
        <SectionHeader title="More Classes" subtitle="A condensed view with the same key details." centered />
        <View className="flex-row flex-wrap justify-between">
          {otherClasses.map((classItem, index) => (
            <View key={classItem.id} style={{ width: "48.5%" }}>
              <ClassCard classItem={classItem} records={records} settings={settings} index={index} compact />
            </View>
          ))}
        </View>
      </View>
    ) : null
  };

  const visibleWidgetOrder = dashboardWidgetOrder.filter((widget) => widgets[widget]);

  return (
    <ScreenContainer>
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable onPress={() => setIsEditing((current) => !current)}>
          <ToolbarIconButton active={isEditing}>
            <ReorderIcon color={isEditing ? palette.background : palette.primary} />
          </ToolbarIconButton>
        </Pressable>
      </View>

      <SectionHeader
        title="Attendance"
        subtitle={
          isEditing
            ? "Edit mode is on. Use the arrows on each card to reshape your dashboard."
            : "Today first, with everything else tucked into a calmer grid."
        }
        centered
      />

      {visibleWidgetOrder.map((widget, index) => (
        <WidgetShell
          key={widget}
          editing={isEditing}
          index={index}
          canMoveUp={index > 0}
          canMoveDown={index < visibleWidgetOrder.length - 1}
          onMoveUp={() => moveDashboardWidget(widget, "up")}
          onMoveDown={() => moveDashboardWidget(widget, "down")}
        >
          <View>{widgets[widget]}</View>
        </WidgetShell>
      ))}
    </ScreenContainer>
  );
};
