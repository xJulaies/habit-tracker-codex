import { z } from "zod";
import { DEFAULT_HABIT_COLOR, HABIT_COLORS } from "./habit.model";

const sanitizedString = (maxLength: number, minLength = 0) =>
  z
    .string()
    .trim()
    .pipe(z.string().min(minLength).max(maxLength));

const titleSchema = sanitizedString(80, 1);
const descriptionSchema = sanitizedString(300).default("");
const categorySchema = sanitizedString(40, 1);
const habitColorSchema = z.enum(HABIT_COLORS);
const createColorSchema = habitColorSchema.default(DEFAULT_HABIT_COLOR);

const dailyHabitCreateSchema = z
  .object({
    title: titleSchema,
    description: descriptionSchema,
    category: categorySchema,
    plan: z.literal("daily"),
    color: createColorSchema,
  })
  .strict();

const weeklyHabitCreateSchema = z
  .object({
    title: titleSchema,
    description: descriptionSchema,
    category: categorySchema,
    plan: z.literal("weekly"),
    weeklyTarget: z.number().int().min(1).max(14),
    color: createColorSchema,
  })
  .strict();

export const createHabitSchema = z.discriminatedUnion("plan", [
  dailyHabitCreateSchema,
  weeklyHabitCreateSchema,
]);

export const updateHabitSchema = z
  .object({
    title: titleSchema.optional(),
    description: sanitizedString(300).optional(),
    category: categorySchema.optional(),
    color: habitColorSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0);

export const habitCheckinCountSchema = z
  .object({
    count: z.number().int().min(0).max(14),
  })
  .strict();

export type TCreateHabitInput = z.infer<typeof createHabitSchema>;
export type TUpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type THabitCheckinCountInput = z.infer<typeof habitCheckinCountSchema>;
