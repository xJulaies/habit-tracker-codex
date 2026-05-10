import { BarChart3, CalendarCheck2, ListChecks } from "lucide-react";
import { MAX_HABITS } from "../habitDashboard.constants";
import {
  getCompletedTodayCount,
  getTodayCompletionRate,
} from "../habitDashboard.helpers";
import type { Habit } from "../habitDashboard.types";
import { MetricCard } from "./MetricCard";

type DashboardOverviewProps = {
  habits: Habit[];
  selectedSuccessRate: number;
};

export function DashboardOverview({
  habits,
  selectedSuccessRate,
}: DashboardOverviewProps) {
  const completedToday = getCompletedTodayCount(habits);

  return (
    <section className="overview-grid">
      <MetricCard
        icon={CalendarCheck2}
        label="Heute"
        value={`${completedToday}/${habits.length || 0}`}
        hint={`${getTodayCompletionRate(habits)}% Tagesfortschritt`}
      />
      <MetricCard
        icon={BarChart3}
        label="Auswahl"
        value={`${selectedSuccessRate}%`}
        hint="Erfolgsrate"
      />
      <MetricCard
        icon={ListChecks}
        label="Slots"
        value={`${habits.length}/${MAX_HABITS}`}
        hint="MVP-Limit"
      />
    </section>
  );
}
