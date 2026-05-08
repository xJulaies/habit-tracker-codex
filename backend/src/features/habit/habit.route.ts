import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.middleware";
import {
  createHabit,
  deleteHabitCheckin,
  deleteHabit,
  getHabit,
  getHabits,
  getHabitStatsController,
  updateHabit,
  upsertHabitCheckin,
} from "./habit.controller";

export const habitRoute = Router();

habitRoute.get("/", requireAuth, getHabits);
habitRoute.post("/", requireAuth, createHabit);
habitRoute.get("/:habitId/stats", requireAuth, getHabitStatsController);
habitRoute.get("/:habitId", requireAuth, getHabit);
habitRoute.patch("/:habitId", requireAuth, updateHabit);
habitRoute.delete("/:habitId", requireAuth, deleteHabit);
habitRoute.put("/:habitId/checkins/:date", requireAuth, upsertHabitCheckin);
habitRoute.delete("/:habitId/checkins/:date", requireAuth, deleteHabitCheckin);
