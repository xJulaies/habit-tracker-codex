import type { HabitColor, HabitFormState } from "./habitDashboard.types";

export const MAX_HABITS = 5;

export const habitColors: HabitColor[] = [
  "gray",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "blue",
  "indigo",
  "violet",
  "purple",
  "pink",
  "rose",
];

export const habitAccentByColor: Record<HabitColor, string> = {
  gray: "#9ca3af",
  red: "#f87171",
  orange: "#fb923c",
  amber: "#f59e0b",
  yellow: "#eab308",
  lime: "#a3e635",
  green: "#22c55e",
  emerald: "#10b981",
  teal: "#14b8a6",
  cyan: "#22d3ee",
  blue: "#60a5fa",
  indigo: "#818cf8",
  violet: "#a78bfa",
  purple: "#c084fc",
  pink: "#f472b6",
  rose: "#fb7185",
};

export const initialHabitForm: HabitFormState = {
  title: "",
  description: "",
  category: "",
  plan: "daily",
  weeklyTarget: 3,
  color: "gray",
};
