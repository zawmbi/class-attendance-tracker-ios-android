import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { ClassCard } from "@/components/ClassCard";
import { IncentiveBanner } from "@/components/IncentiveBanner";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { getAttendanceSummary, getIncentiveMessage } from "@/utils/attendance";
import { isClassToday } from "@/utils/date";
import { useAttendanceStore } from "@/store/attendanceStore";
import { getMotivationInsights } from "@/utils/motivation";

export const DashboardScreen = () => {
  const { classes, records, settings } = useAttendanceStore();
  const todaysClasses = classes.filter((classItem) => isClassToday(classItem.schedule));
  const strongestStreak = classes.reduce((best, classItem) => {
    const summary = getAttendanceSummary(classItem, records, settings);
    return summary.streak > best ? summary.streak : best;
  }, 0);
  const motivationInsights = getMotivationInsights(classes, records, settings);
  const topInsight = motivationInsights[0];
  const averageAttendance = Math.round(
    classes.reduce((sum, classItem) => sum + getAttendanceSummary(classItem, records, settings).percentage, 0) /
      Math.max(classes.length, 1)
  );

  return (
    <ScreenContainer>
      <SectionHeader
        title="Attendance"
        subtitle="Centered, simple, and focused on what to do next."
        centered
      />

      <View className="mb-6 rounded-[34px] border border-border bg-surface px-6 py-7" style={{ ...{ shadowColor: "#2F5D50", shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 4 } }}>
        <Text className="text-center text-[11px] uppercase tracking-[2px] text-muted">Overview</Text>
        <Text className="mt-3 text-center font-serif text-[54px] leading-[58px] text-primary">{averageAttendance}%</Text>
        <Text className="mt-2 text-center text-sm leading-6 text-muted">Current semester attendance average</Text>
        <View className="mt-6 flex-row gap-3">
          <Link href="/(tabs)/check-in" asChild>
            <Pressable className="flex-1 items-center justify-center rounded-[24px] bg-primary px-4 py-4">
              <Text className="font-serif text-[18px] text-background">Check In</Text>
            </Pressable>
          </Link>
          <Link href="/(tabs)/insights" asChild>
            <Pressable className="flex-1 items-center justify-center rounded-[24px] bg-background px-4 py-4">
              <Text className="font-serif text-[18px] text-primary">Insights</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      {settings.incentiveSystemEnabled ? (
        <IncentiveBanner streak={strongestStreak} message={getIncentiveMessage(strongestStreak)} />
      ) : null}

      {settings.motivationMessagesEnabled && topInsight ? (
        <View className="mb-6 rounded-[28px] bg-background px-5 py-5">
          <Text className="text-center text-[11px] uppercase tracking-[1.8px] text-muted">{topInsight.title}</Text>
          <Text className="mt-3 text-center text-sm leading-6 text-ink">{topInsight.message}</Text>
        </View>
      ) : null}

      <SectionHeader title="Today" subtitle={todaysClasses.length > 0 ? "Classes scheduled for today." : "Nothing scheduled today."} centered />
      {todaysClasses.length > 0 ? (
        todaysClasses.map((classItem, index) => (
          <ClassCard
            key={classItem.id}
            classItem={classItem}
            records={records}
            settings={settings}
            index={index}
          />
        ))
      ) : (
        <View className="mb-8 items-center rounded-card border border-dashed border-border px-5 py-6">
          <Text className="max-w-[280px] text-center text-muted">Use Quick Check-In to record any ad-hoc attendance today.</Text>
        </View>
      )}

      <SectionHeader title="All Classes" subtitle="Tap any card to open the full class view." centered />
      {classes.map((classItem, index) => (
        <ClassCard
          key={classItem.id}
          classItem={classItem}
          records={records}
          settings={settings}
          index={index}
        />
      ))}
    </ScreenContainer>
  );
};
