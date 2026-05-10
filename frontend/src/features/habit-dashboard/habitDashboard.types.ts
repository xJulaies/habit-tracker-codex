export type HabitColor =
  | "gray"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "pink"
  | "rose";

export type HabitPlan = "daily" | "weekly";

export type HabitCheckin = {
  date: string;
  count: number;
};

export type Habit = {
  _id: string;
  title: string;
  description: string;
  category: string;
  plan: HabitPlan;
  weeklyTarget?: number;
  color: HabitColor;
  checkins: HabitCheckin[];
};

export type HabitTotals = {
  totalCheckins: number;
  checkedInDays: number;
  successRate: number;
};

export type HabitStats =
  | {
      habitId: string;
      plan: "daily";
      current: {
        type: "daily";
        date: string;
        count: number;
        completed: boolean;
        streak: number;
      };
      totals: HabitTotals;
    }
  | {
      habitId: string;
      plan: "weekly";
      current: {
        type: "weekly";
        startDate: string;
        endDate: string;
        count: number;
        target: number;
        remaining: number;
        completed: boolean;
      };
      totals: HabitTotals;
    };

export type ApiAnswer<T> = {
  status: number;
  message: string;
  data: T[];
};

export type HabitFormState = {
  title: string;
  description: string;
  category: string;
  plan: HabitPlan;
  weeklyTarget: number;
  color: HabitColor;
};

export type MobileDashboardTab = "home" | "create" | "profile";
