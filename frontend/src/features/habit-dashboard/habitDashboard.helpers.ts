import type { Habit } from "./habitDashboard.types";

export const toDateKey = (date: Date): string => date.toISOString().slice(0, 10);

export const todayDateKey = (): string => toDateKey(new Date());

export const yesterdayDateKey = (): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 1);

  return toDateKey(date);
};

export const formatDate = (dateKey: string): string => {
  const [year, month, day] = dateKey.split("-");

  return `${day}.${month}.${year}`;
};

export const getCheckinCount = (habit: Habit | null, date: string): number => {
  return habit?.checkins.find((checkin) => checkin.date === date)?.count || 0;
};

export const getCompletedTodayCount = (habits: Habit[]): number => {
  const today = todayDateKey();

  return habits.filter((habit) => getCheckinCount(habit, today) > 0).length;
};

export const getTodayCompletionRate = (habits: Habit[]): number => {
  if (habits.length === 0) {
    return 0;
  }

  return Math.round((getCompletedTodayCount(habits) / habits.length) * 100);
};
