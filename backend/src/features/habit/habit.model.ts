import { HydratedDocument, model, Schema, SchemaDefinition } from "mongoose";

export const HABIT_COLORS = [
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
] as const;

export const DEFAULT_HABIT_COLOR = "gray";

export type THabitColor = (typeof HABIT_COLORS)[number];
export type THabitPlan = "daily" | "weekly";

export type THabitCheckin = {
  date: string;
  count: number;
  createdAt: Date;
  updatedAt: Date;
};

export type THabit = {
  userId: string;
  title: string;
  description: string;
  category: string;
  plan: THabitPlan;
  weeklyTarget: number | undefined;
  color: THabitColor;
  checkins: THabitCheckin[];
  createdAt: Date;
  updatedAt: Date;
};

export type THabitQuota = {
  userId: string;
  count: number;
  createdAt: Date;
  updatedAt: Date;
};

export type THabitDocument = HydratedDocument<THabit>;

const habitCheckinSchema = new Schema<THabitCheckin>(
  {
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    count: {
      type: Number,
      required: true,
      min: 0,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { _id: false },
);

const habitSchema = new Schema<THabit>(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },
    plan: {
      type: String,
      enum: ["daily", "weekly"],
      required: true,
    },
    weeklyTarget: {
      type: Number,
      required(this: THabit): boolean {
        return this.plan === "weekly";
      },
      min: 1,
      max: 14,
      validate: [
        {
          validator(this: THabit): boolean {
            return this.plan !== "weekly" || typeof this.weeklyTarget === "number";
          },
          message: "weeklyTarget is required for weekly habits",
        },
        {
          validator(this: THabit): boolean {
            return this.plan !== "daily" || this.weeklyTarget === undefined;
          },
          message: "weeklyTarget is not allowed for daily habits",
        },
      ],
    },
    color: {
      type: String,
      enum: HABIT_COLORS,
      required: true,
      default: DEFAULT_HABIT_COLOR,
    },
    checkins: {
      type: [habitCheckinSchema],
      default: [],
    },
  } as SchemaDefinition<THabit>,
  { timestamps: true },
);

habitSchema.index({ userId: 1, createdAt: -1 });

habitSchema.pre("validate", function validateDailyCheckins() {
  if (
    this.plan === "daily" &&
    this.checkins.some((checkin: THabitCheckin) => checkin.count > 1)
  ) {
    this.invalidate("checkins", "Daily habits allow a maximum count of 1");
  }
});

export const HabitModel = model<THabit>("Habit", habitSchema);

const habitQuotaSchema = new Schema<THabitQuota>(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    count: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  { timestamps: true },
);

export const HabitQuotaModel = model<THabitQuota>(
  "HabitQuota",
  habitQuotaSchema,
);
