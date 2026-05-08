import { NextFunction, Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { ZodError } from "zod";
import { createAnswer } from "../../lib/errorhandling/createAnswer";
import { createError } from "../../lib/errorhandling/createError";
import { TAuthenticatedRequest } from "../../middlewares/requireAuth.middleware";
import {
  getCalendarWeekRange,
  isAllowedCheckinDate,
  toDateKey,
} from "./habitDate.helpers";
import {
  HabitModel,
  HabitQuotaModel,
  THabitCheckin,
  THabitDocument,
} from "./habit.model";
import {
  createHabitSchema,
  habitCheckinCountSchema,
  updateHabitSchema,
} from "./habit.zodSchema";

const MAX_HABITS_PER_USER = 5;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getAuthUserId = (req: Request): string => {
  return (req as TAuthenticatedRequest).authUserId;
};

const isValidHabitId = (habitId: string | undefined): habitId is string => {
  return typeof habitId === "string" && isValidObjectId(habitId);
};

const getHabitId = (req: Request): string | undefined => {
  const { habitId } = req.params;

  return typeof habitId === "string" ? habitId : undefined;
};

const getCheckinDate = (req: Request): string | undefined => {
  const { date } = req.params;

  return typeof date === "string" ? date : undefined;
};

const isValidAllowedCheckinDate = (date: string | undefined): date is string => {
  if (typeof date !== "string") {
    return false;
  }

  try {
    return isAllowedCheckinDate(date);
  } catch {
    return false;
  }
};

const getDateKeyWithOffset = (dateKey: string, offsetDays: number): string => {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);

  return toDateKey(date);
};

const getDaysBetween = (startDateKey: string, endDateKey: string): number => {
  const start = new Date(`${startDateKey}T00:00:00.000Z`).getTime();
  const end = new Date(`${endDateKey}T00:00:00.000Z`).getTime();

  return Math.floor((end - start) / MS_PER_DAY);
};

const getCheckinCountsByDate = (
  checkins: THabitCheckin[],
): Map<string, number> => {
  return checkins.reduce((countsByDate, checkin) => {
    const currentCount = countsByDate.get(checkin.date) || 0;
    countsByDate.set(checkin.date, currentCount + checkin.count);

    return countsByDate;
  }, new Map<string, number>());
};

const getSuccessRate = (completed: number, target: number): number => {
  if (target <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((completed / target) * 100));
};

const getDailyStreak = (
  countsByDate: Map<string, number>,
  todayDateKey: string,
): number => {
  let streak = 0;
  let currentDateKey = todayDateKey;

  while ((countsByDate.get(currentDateKey) || 0) > 0) {
    streak += 1;
    currentDateKey = getDateKeyWithOffset(currentDateKey, -1);
  }

  return streak;
};

const getHabitStats = (habit: THabitDocument) => {
  const todayDateKey = toDateKey(new Date());
  const countsByDate = getCheckinCountsByDate(habit.checkins);
  const totalCheckins = [...countsByDate.values()].reduce(
    (total, count) => total + count,
    0,
  );
  const checkedInDays = [...countsByDate.values()].filter((count) => count > 0)
    .length;

  if (habit.plan === "daily") {
    const todayCount = countsByDate.get(todayDateKey) || 0;
    const trackedDays = Math.max(
      1,
      getDaysBetween(toDateKey(habit.createdAt), todayDateKey) + 1,
    );

    return {
      habitId: String(habit._id),
      plan: habit.plan,
      current: {
        type: "daily",
        date: todayDateKey,
        count: todayCount,
        completed: todayCount > 0,
        streak: getDailyStreak(countsByDate, todayDateKey),
      },
      totals: {
        totalCheckins,
        checkedInDays,
        successRate: getSuccessRate(checkedInDays, trackedDays),
      },
    };
  }

  const weekRange = getCalendarWeekRange(todayDateKey);
  const weeklyTarget = habit.weeklyTarget || 1;
  const currentWeekCount = [...countsByDate.entries()].reduce(
    (total, [date, count]) => {
      if (date >= weekRange.startDate && date <= weekRange.endDate) {
        return total + count;
      }

      return total;
    },
    0,
  );
  const elapsedWeeks = Math.max(
    1,
    Math.ceil((getDaysBetween(toDateKey(habit.createdAt), todayDateKey) + 1) / 7),
  );
  const totalTarget = elapsedWeeks * weeklyTarget;

  return {
    habitId: String(habit._id),
    plan: habit.plan,
    current: {
      type: "weekly",
      startDate: weekRange.startDate,
      endDate: weekRange.endDate,
      count: currentWeekCount,
      target: weeklyTarget,
      remaining: Math.max(weeklyTarget - currentWeekCount, 0),
      completed: currentWeekCount >= weeklyTarget,
    },
    totals: {
      totalCheckins,
      checkedInDays,
      successRate: getSuccessRate(totalCheckins, totalTarget),
    },
  };
};

const reserveHabitSlot = async (userId: string): Promise<boolean> => {
  const quota = await HabitQuotaModel.findOneAndUpdate(
    { userId, count: { $lt: MAX_HABITS_PER_USER } },
    { $inc: { count: 1 } },
    { new: true },
  );

  if (quota) {
    return true;
  }

  const existingHabitCount = await HabitModel.countDocuments({ userId });

  if (existingHabitCount >= MAX_HABITS_PER_USER) {
    return false;
  }

  try {
    await HabitQuotaModel.create({
      userId,
      count: existingHabitCount + 1,
    });

    return true;
  } catch {
    const retriedQuota = await HabitQuotaModel.findOneAndUpdate(
      { userId, count: { $lt: MAX_HABITS_PER_USER } },
      { $inc: { count: 1 } },
      { new: true },
    );

    return Boolean(retriedQuota);
  }
};

const releaseHabitSlot = async (userId: string): Promise<void> => {
  await HabitQuotaModel.updateOne(
    { userId, count: { $gt: 0 } },
    { $inc: { count: -1 } },
  );
};

export const createHabit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUserId = getAuthUserId(req);
    const habitData = createHabitSchema.parse(req.body);
    const hasReservedHabitSlot = await reserveHabitSlot(authUserId);

    if (!hasReservedHabitSlot) {
      return next(createError(400, "Habit limit reached"));
    }

    const habit = new HabitModel({
      userId: authUserId,
      ...habitData,
    });
    let createdHabit: THabitDocument;

    try {
      createdHabit = await habit.save();
    } catch (error) {
      await releaseHabitSlot(authUserId);
      throw error;
    }

    return res
      .status(201)
      .json(createAnswer(201, "Habit created", [createdHabit]));
  } catch (error) {
    if (error instanceof ZodError) {
      return next(createError(400, "Invalid habit data"));
    }

    return next(error);
  }
};

export const getHabits = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUserId = getAuthUserId(req);
    const habits = await HabitModel.find({ userId: authUserId }).sort({
      createdAt: -1,
    });

    return res.status(200).json(createAnswer(200, "Habits found", habits));
  } catch (error) {
    return next(error);
  }
};

export const getHabit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUserId = getAuthUserId(req);
    const habitId = getHabitId(req);

    if (!isValidHabitId(habitId)) {
      return next(createError(404, "Habit not found"));
    }

    const habit = await HabitModel.findOne({
      _id: habitId,
      userId: authUserId,
    });

    if (!habit) {
      return next(createError(404, "Habit not found"));
    }

    return res.status(200).json(createAnswer(200, "Habit found", [habit]));
  } catch (error) {
    return next(error);
  }
};

export const updateHabit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUserId = getAuthUserId(req);
    const habitId = getHabitId(req);

    if (!isValidHabitId(habitId)) {
      return next(createError(404, "Habit not found"));
    }

    const habitData = updateHabitSchema.parse(req.body);
    const updatedHabit = await HabitModel.findOneAndUpdate(
      { _id: habitId, userId: authUserId },
      habitData,
      { new: true, runValidators: true },
    );

    if (!updatedHabit) {
      return next(createError(404, "Habit not found"));
    }

    return res
      .status(200)
      .json(createAnswer(200, "Habit updated", [updatedHabit]));
  } catch (error) {
    if (error instanceof ZodError) {
      return next(createError(400, "Invalid habit data"));
    }

    return next(error);
  }
};

export const deleteHabit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUserId = getAuthUserId(req);
    const habitId = getHabitId(req);

    if (!isValidHabitId(habitId)) {
      return next(createError(404, "Habit not found"));
    }

    const deletedHabit = await HabitModel.findOneAndDelete({
      _id: habitId,
      userId: authUserId,
    });

    if (!deletedHabit) {
      return next(createError(404, "Habit not found"));
    }

    await releaseHabitSlot(authUserId);

    return res
      .status(200)
      .json(createAnswer(200, "Habit deleted", [deletedHabit]));
  } catch (error) {
    return next(error);
  }
};

export const getHabitStatsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUserId = getAuthUserId(req);
    const habitId = getHabitId(req);

    if (!isValidHabitId(habitId)) {
      return next(createError(404, "Habit not found"));
    }

    const habit = await HabitModel.findOne({
      _id: habitId,
      userId: authUserId,
    });

    if (!habit) {
      return next(createError(404, "Habit not found"));
    }

    return res
      .status(200)
      .json(createAnswer(200, "Habit stats found", [getHabitStats(habit)]));
  } catch (error) {
    return next(error);
  }
};

export const upsertHabitCheckin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUserId = getAuthUserId(req);
    const habitId = getHabitId(req);
    const checkinDate = getCheckinDate(req);

    if (!isValidHabitId(habitId)) {
      return next(createError(404, "Habit not found"));
    }

    if (!isValidAllowedCheckinDate(checkinDate)) {
      return next(createError(400, "Invalid check-in date"));
    }

    const { count } = habitCheckinCountSchema.parse(req.body);
    const habit = await HabitModel.findOne({
      _id: habitId,
      userId: authUserId,
    });

    if (!habit) {
      return next(createError(404, "Habit not found"));
    }

    if (habit.plan === "daily" && count > 1) {
      return next(createError(400, "Invalid check-in count"));
    }

    const now = new Date();
    const updateExistingCheckin = () =>
      HabitModel.findOneAndUpdate(
        {
          _id: habitId,
          userId: authUserId,
          "checkins.date": checkinDate,
        },
        {
          $set: {
            "checkins.$.count": count,
            "checkins.$.updatedAt": now,
          },
        },
        { new: true, runValidators: true },
      );
    const createCheckin = () =>
      HabitModel.findOneAndUpdate(
        {
          _id: habitId,
          userId: authUserId,
          checkins: { $not: { $elemMatch: { date: checkinDate } } },
        },
        {
          $push: {
            checkins: {
              date: checkinDate,
              count,
              createdAt: now,
              updatedAt: now,
            },
          },
        },
        { new: true, runValidators: true },
      );

    const updatedExistingHabit = await updateExistingCheckin();
    const updatedHabit =
      updatedExistingHabit ||
      (await createCheckin()) ||
      (await updateExistingCheckin());

    if (!updatedHabit) {
      return next(createError(404, "Habit not found"));
    }

    return res
      .status(200)
      .json(createAnswer(200, "Habit check-in updated", [updatedHabit]));
  } catch (error) {
    if (error instanceof ZodError) {
      return next(createError(400, "Invalid check-in data"));
    }

    return next(error);
  }
};

export const deleteHabitCheckin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authUserId = getAuthUserId(req);
    const habitId = getHabitId(req);
    const checkinDate = getCheckinDate(req);

    if (!isValidHabitId(habitId)) {
      return next(createError(404, "Habit not found"));
    }

    if (!isValidAllowedCheckinDate(checkinDate)) {
      return next(createError(400, "Invalid check-in date"));
    }

    const updatedHabit = await HabitModel.findOneAndUpdate(
      { _id: habitId, userId: authUserId },
      { $pull: { checkins: { date: checkinDate } } },
      { new: true, runValidators: true },
    );

    if (!updatedHabit) {
      return next(createError(404, "Habit not found"));
    }

    return res
      .status(200)
      .json(createAnswer(200, "Habit check-in deleted", [updatedHabit]));
  } catch (error) {
    return next(error);
  }
};
