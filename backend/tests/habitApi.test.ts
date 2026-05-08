import type { RequestHandler } from "express";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authUserIdMock = vi.hoisted(() => ({ value: "user_123" as string | null }));
const saveMock = vi.hoisted(() => vi.fn());
const countDocumentsMock = vi.hoisted(() => vi.fn());
const quotaCreateMock = vi.hoisted(() => vi.fn());
const quotaFindOneAndUpdateMock = vi.hoisted(() => vi.fn());
const quotaUpdateOneMock = vi.hoisted(() => vi.fn());
const findMock = vi.hoisted(() => vi.fn());
const findOneMock = vi.hoisted(() => vi.fn());
const findOneAndUpdateMock = vi.hoisted(() => vi.fn());
const findOneAndDeleteMock = vi.hoisted(() => vi.fn());
const sortMock = vi.hoisted(() => vi.fn());
const validHabitId = "507f1f77bcf86cd799439011";
const todayDateKey = new Date().toISOString().slice(0, 10);
const yesterdayDateKey = new Date(Date.now() - 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);
const habitModelConstructorMock = vi.hoisted(() =>
  vi.fn(function HabitModelMock(this: { save?: typeof saveMock }, payload) {
    Object.assign(this, payload);
    this.save = saveMock;
  }),
);

vi.mock("@clerk/express", () => {
  return {
    clerkMiddleware: vi.fn(
      (): RequestHandler => (_req, _res, next) => next(),
    ),
    getAuth: vi.fn(() => ({ userId: authUserIdMock.value })),
  };
});

vi.mock("../src/features/habit/habit.model", () => {
  return {
    DEFAULT_HABIT_COLOR: "gray",
    HABIT_COLORS: [
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
    ],
    HabitModel: Object.assign(habitModelConstructorMock, {
      countDocuments: countDocumentsMock,
      find: findMock,
      findOne: findOneMock,
      findOneAndUpdate: findOneAndUpdateMock,
      findOneAndDelete: findOneAndDeleteMock,
    }),
    HabitQuotaModel: {
      create: quotaCreateMock,
      findOneAndUpdate: quotaFindOneAndUpdateMock,
      updateOne: quotaUpdateOneMock,
    },
  };
});

describe("habit API create and list", () => {
  beforeEach(() => {
    vi.resetModules();
    authUserIdMock.value = "user_123";
    saveMock.mockReset();
    countDocumentsMock.mockReset();
    quotaCreateMock.mockReset();
    quotaFindOneAndUpdateMock.mockReset();
    quotaUpdateOneMock.mockReset();
    findMock.mockReset();
    findOneMock.mockReset();
    findOneAndUpdateMock.mockReset();
    findOneAndDeleteMock.mockReset();
    sortMock.mockReset();
    habitModelConstructorMock.mockReset();
    countDocumentsMock.mockResolvedValue(0);
    quotaCreateMock.mockResolvedValue({ userId: "user_123", count: 1 });
    quotaFindOneAndUpdateMock.mockResolvedValue({ userId: "user_123", count: 1 });
    quotaUpdateOneMock.mockResolvedValue({ modifiedCount: 1 });
    sortMock.mockResolvedValue([]);
    findMock.mockReturnValue({ sort: sortMock });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("rejects unauthenticated habit creation", async () => {
    authUserIdMock.value = null;
    const { app } = await import("../src/app");

    const response = await request(app).post("/api/habits").send({
      title: "Run",
      category: "Health",
      plan: "daily",
    });

    expect(response.status).toBe(401);
    expect(habitModelConstructorMock).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated habit listing", async () => {
    authUserIdMock.value = null;
    const { app } = await import("../src/app");

    const response = await request(app).get("/api/habits");

    expect(response.status).toBe(401);
    expect(findMock).not.toHaveBeenCalled();
  });

  it("returns validation errors for invalid create payloads", async () => {
    const { app } = await import("../src/app");

    const response = await request(app).post("/api/habits").send({
      title: "",
      category: "Health",
      plan: "daily",
    });

    expect(response.status).toBe(400);
    expect(habitModelConstructorMock).not.toHaveBeenCalled();
  });

  it("rejects habit creation when the user reached the MVP habit limit", async () => {
    quotaFindOneAndUpdateMock.mockResolvedValue(null);
    countDocumentsMock.mockResolvedValue(5);
    const { app } = await import("../src/app");

    const response = await request(app).post("/api/habits").send({
      title: "Run",
      category: "Health",
      plan: "daily",
    });

    expect(response.status).toBe(400);
    expect(countDocumentsMock).toHaveBeenCalledWith({ userId: "user_123" });
    expect(quotaCreateMock).not.toHaveBeenCalled();
    expect(habitModelConstructorMock).not.toHaveBeenCalled();
    expect(saveMock).not.toHaveBeenCalled();
  });

  it("creates a habit for the authenticated user", async () => {
    const createdHabit = {
      _id: "habit_123",
      userId: "user_123",
      title: "Run",
      description: "",
      category: "Health",
      plan: "daily",
      color: "gray",
      checkins: [],
    };
    saveMock.mockResolvedValue(createdHabit);
    const { app } = await import("../src/app");

    const response = await request(app).post("/api/habits").send({
      title: "  Run  ",
      category: "  Health  ",
      plan: "daily",
    });

    expect(response.status).toBe(201);
    expect(quotaFindOneAndUpdateMock).toHaveBeenCalledWith(
      { userId: "user_123", count: { $lt: 5 } },
      { $inc: { count: 1 } },
      { new: true },
    );
    expect(countDocumentsMock).not.toHaveBeenCalled();
    expect(habitModelConstructorMock).toHaveBeenCalledWith({
      userId: "user_123",
      title: "Run",
      description: "",
      category: "Health",
      plan: "daily",
      color: "gray",
    });
    expect(response.body).toEqual({
      status: 201,
      message: "Habit created",
      data: [createdHabit],
    });
  });

  it("initializes the atomic habit quota when no quota document exists", async () => {
    const createdHabit = {
      _id: "habit_123",
      userId: "user_123",
      title: "Run",
      description: "",
      category: "Health",
      plan: "daily",
      color: "gray",
      checkins: [],
    };
    quotaFindOneAndUpdateMock.mockResolvedValue(null);
    countDocumentsMock.mockResolvedValue(2);
    saveMock.mockResolvedValue(createdHabit);
    const { app } = await import("../src/app");

    const response = await request(app).post("/api/habits").send({
      title: "Run",
      category: "Health",
      plan: "daily",
    });

    expect(response.status).toBe(201);
    expect(quotaCreateMock).toHaveBeenCalledWith({
      userId: "user_123",
      count: 3,
    });
  });

  it("releases a reserved habit quota when habit creation fails", async () => {
    saveMock.mockRejectedValue(new Error("save failed"));
    const { app } = await import("../src/app");

    const response = await request(app).post("/api/habits").send({
      title: "Run",
      category: "Health",
      plan: "daily",
    });

    expect(response.status).toBe(500);
    expect(quotaUpdateOneMock).toHaveBeenCalledWith(
      { userId: "user_123", count: { $gt: 0 } },
      { $inc: { count: -1 } },
    );
  });

  it("lists habits for the authenticated user newest first", async () => {
    const habits = [
      { _id: "habit_2", title: "Read" },
      { _id: "habit_1", title: "Run" },
    ];
    sortMock.mockResolvedValue(habits);
    const { app } = await import("../src/app");

    const response = await request(app).get("/api/habits");

    expect(response.status).toBe(200);
    expect(findMock).toHaveBeenCalledWith({ userId: "user_123" });
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(response.body).toEqual({
      status: 200,
      message: "Habits found",
      data: habits,
    });
  });

  it("rejects unauthenticated habit detail requests", async () => {
    authUserIdMock.value = null;
    const { app } = await import("../src/app");

    const response = await request(app).get(`/api/habits/${validHabitId}`);

    expect(response.status).toBe(401);
    expect(findOneMock).not.toHaveBeenCalled();
  });

  it("returns 404 when reading a habit with an invalid habit id", async () => {
    const { app } = await import("../src/app");

    const response = await request(app).get("/api/habits/not-an-id");

    expect(response.status).toBe(404);
    expect(findOneMock).not.toHaveBeenCalled();
  });

  it("returns 404 when reading a missing or foreign habit", async () => {
    findOneMock.mockResolvedValue(null);
    const { app } = await import("../src/app");

    const response = await request(app).get(`/api/habits/${validHabitId}`);

    expect(response.status).toBe(404);
    expect(findOneMock).toHaveBeenCalledWith({
      _id: validHabitId,
      userId: "user_123",
    });
  });

  it("returns one habit for the authenticated user", async () => {
    const habit = {
      _id: validHabitId,
      userId: "user_123",
      title: "Run",
      plan: "daily",
    };
    findOneMock.mockResolvedValue(habit);
    const { app } = await import("../src/app");

    const response = await request(app).get(`/api/habits/${validHabitId}`);

    expect(response.status).toBe(200);
    expect(findOneMock).toHaveBeenCalledWith({
      _id: validHabitId,
      userId: "user_123",
    });
    expect(response.body).toEqual({
      status: 200,
      message: "Habit found",
      data: [habit],
    });
  });

  it("returns a generic message for unexpected server errors", async () => {
    sortMock.mockRejectedValue(new Error("database secret detail"));
    const { app } = await import("../src/app");

    const response = await request(app).get("/api/habits");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: 500,
      message: "Server Error",
      data: [],
    });
  });

  it("rejects unauthenticated habit updates", async () => {
    authUserIdMock.value = null;
    const { app } = await import("../src/app");

    const response = await request(app).patch(`/api/habits/${validHabitId}`).send({
      title: "Updated",
    });

    expect(response.status).toBe(401);
    expect(findOneAndUpdateMock).not.toHaveBeenCalled();
  });

  it("rejects empty habit updates", async () => {
    const { app } = await import("../src/app");

    const response = await request(app).patch(`/api/habits/${validHabitId}`).send({});

    expect(response.status).toBe(400);
    expect(findOneAndUpdateMock).not.toHaveBeenCalled();
  });

  it("rejects habit updates with forbidden fields", async () => {
    const { app } = await import("../src/app");

    const response = await request(app).patch(`/api/habits/${validHabitId}`).send({
      plan: "weekly",
      weeklyTarget: 3,
    });

    expect(response.status).toBe(400);
    expect(findOneAndUpdateMock).not.toHaveBeenCalled();
  });

  it("returns 404 when updating a missing or foreign habit", async () => {
    findOneAndUpdateMock.mockResolvedValue(null);
    const { app } = await import("../src/app");

    const response = await request(app).patch(`/api/habits/${validHabitId}`).send({
      title: "Updated",
    });

    expect(response.status).toBe(404);
    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { _id: validHabitId, userId: "user_123" },
      { title: "Updated" },
      { new: true, runValidators: true },
    );
  });

  it("returns 404 when updating with an invalid habit id", async () => {
    const { app } = await import("../src/app");

    const response = await request(app).patch("/api/habits/not-an-id").send({
      title: "Updated",
    });

    expect(response.status).toBe(404);
    expect(findOneAndUpdateMock).not.toHaveBeenCalled();
  });

  it("updates editable habit fields", async () => {
    const updatedHabit = {
      _id: "habit_123",
      title: "Updated",
      description: "Better habit",
      category: "Health",
      color: "blue",
    };
    findOneAndUpdateMock.mockResolvedValue(updatedHabit);
    const { app } = await import("../src/app");

    const response = await request(app).patch(`/api/habits/${validHabitId}`).send({
      title: "  Updated  ",
      description: "  Better habit  ",
      category: "  Health  ",
      color: "blue",
    });

    expect(response.status).toBe(200);
    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { _id: validHabitId, userId: "user_123" },
      {
        title: "Updated",
        description: "Better habit",
        category: "Health",
        color: "blue",
      },
      { new: true, runValidators: true },
    );
    expect(response.body).toEqual({
      status: 200,
      message: "Habit updated",
      data: [updatedHabit],
    });
  });

  it("rejects unauthenticated habit deletion", async () => {
    authUserIdMock.value = null;
    const { app } = await import("../src/app");

    const response = await request(app).delete(`/api/habits/${validHabitId}`);

    expect(response.status).toBe(401);
    expect(findOneAndDeleteMock).not.toHaveBeenCalled();
  });

  it("returns 404 when deleting a missing or foreign habit", async () => {
    findOneAndDeleteMock.mockResolvedValue(null);
    const { app } = await import("../src/app");

    const response = await request(app).delete(`/api/habits/${validHabitId}`);

    expect(response.status).toBe(404);
    expect(findOneAndDeleteMock).toHaveBeenCalledWith({
      _id: validHabitId,
      userId: "user_123",
    });
    expect(quotaUpdateOneMock).not.toHaveBeenCalled();
  });

  it("returns 404 when deleting with an invalid habit id", async () => {
    const { app } = await import("../src/app");

    const response = await request(app).delete("/api/habits/not-an-id");

    expect(response.status).toBe(404);
    expect(findOneAndDeleteMock).not.toHaveBeenCalled();
  });

  it("deletes a habit", async () => {
    const deletedHabit = {
      _id: "habit_123",
      title: "Run",
    };
    findOneAndDeleteMock.mockResolvedValue(deletedHabit);
    const { app } = await import("../src/app");

    const response = await request(app).delete(`/api/habits/${validHabitId}`);

    expect(response.status).toBe(200);
    expect(quotaUpdateOneMock).toHaveBeenCalledWith(
      { userId: "user_123", count: { $gt: 0 } },
      { $inc: { count: -1 } },
    );
    expect(response.body).toEqual({
      status: 200,
      message: "Habit deleted",
      data: [deletedHabit],
    });
  });

  it("rejects unauthenticated habit check-ins", async () => {
    authUserIdMock.value = null;
    const { app } = await import("../src/app");

    const response = await request(app)
      .put(`/api/habits/${validHabitId}/checkins/${todayDateKey}`)
      .send({ count: 1 });

    expect(response.status).toBe(401);
    expect(findOneMock).not.toHaveBeenCalled();
  });

  it("rejects habit check-ins for invalid dates", async () => {
    const { app } = await import("../src/app");

    const response = await request(app)
      .put(`/api/habits/${validHabitId}/checkins/2026-02-31`)
      .send({ count: 1 });

    expect(response.status).toBe(400);
    expect(findOneMock).not.toHaveBeenCalled();
  });

  it("rejects habit check-ins outside today and yesterday", async () => {
    const { app } = await import("../src/app");

    const response = await request(app)
      .put(`/api/habits/${validHabitId}/checkins/2099-01-01`)
      .send({ count: 1 });

    expect(response.status).toBe(400);
    expect(findOneMock).not.toHaveBeenCalled();
  });

  it("returns 404 when checking in a missing or foreign habit", async () => {
    findOneMock.mockResolvedValue(null);
    const { app } = await import("../src/app");

    const response = await request(app)
      .put(`/api/habits/${validHabitId}/checkins/${todayDateKey}`)
      .send({ count: 1 });

    expect(response.status).toBe(404);
    expect(findOneMock).toHaveBeenCalledWith({
      _id: validHabitId,
      userId: "user_123",
    });
    expect(findOneAndUpdateMock).not.toHaveBeenCalled();
  });

  it("rejects daily habit check-ins above count 1", async () => {
    const habit = {
      plan: "daily",
      checkins: [],
      save: saveMock,
    };
    findOneMock.mockResolvedValue(habit);
    const { app } = await import("../src/app");

    const response = await request(app)
      .put(`/api/habits/${validHabitId}/checkins/${todayDateKey}`)
      .send({ count: 2 });

    expect(response.status).toBe(400);
    expect(findOneAndUpdateMock).not.toHaveBeenCalled();
    expect(saveMock).not.toHaveBeenCalled();
  });

  it("creates a habit check-in", async () => {
    const savedHabit = {
      _id: validHabitId,
      plan: "weekly",
      checkins: [{ date: todayDateKey, count: 3 }],
    };
    const habit = { plan: "weekly" };
    findOneMock.mockResolvedValue(habit);
    findOneAndUpdateMock.mockResolvedValueOnce(null).mockResolvedValueOnce(savedHabit);
    const { app } = await import("../src/app");

    const response = await request(app)
      .put(`/api/habits/${validHabitId}/checkins/${todayDateKey}`)
      .send({ count: 3 });

    expect(response.status).toBe(200);
    expect(findOneAndUpdateMock).toHaveBeenNthCalledWith(
      1,
      {
        _id: validHabitId,
        userId: "user_123",
        "checkins.date": todayDateKey,
      },
      {
        $set: {
          "checkins.$.count": 3,
          "checkins.$.updatedAt": expect.any(Date),
        },
      },
      { new: true, runValidators: true },
    );
    expect(findOneAndUpdateMock).toHaveBeenNthCalledWith(
      2,
      {
        _id: validHabitId,
        userId: "user_123",
        checkins: { $not: { $elemMatch: { date: todayDateKey } } },
      },
      {
        $push: {
          checkins: {
            date: todayDateKey,
            count: 3,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        },
      },
      { new: true, runValidators: true },
    );
    expect(saveMock).not.toHaveBeenCalled();
    expect(response.body).toEqual({
      status: 200,
      message: "Habit check-in updated",
      data: [savedHabit],
    });
  });

  it("updates an existing habit check-in", async () => {
    const updatedHabit = {
      _id: validHabitId,
      plan: "weekly",
      checkins: [{ date: todayDateKey, count: 4 }],
    };
    const habit = { plan: "weekly" };
    findOneMock.mockResolvedValue(habit);
    findOneAndUpdateMock.mockResolvedValue(updatedHabit);
    const { app } = await import("../src/app");

    const response = await request(app)
      .put(`/api/habits/${validHabitId}/checkins/${todayDateKey}`)
      .send({ count: 4 });

    expect(response.status).toBe(200);
    expect(findOneAndUpdateMock).toHaveBeenCalledOnce();
    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      {
        _id: validHabitId,
        userId: "user_123",
        "checkins.date": todayDateKey,
      },
      {
        $set: {
          "checkins.$.count": 4,
          "checkins.$.updatedAt": expect.any(Date),
        },
      },
      { new: true, runValidators: true },
    );
    expect(saveMock).not.toHaveBeenCalled();
    expect(response.body).toEqual({
      status: 200,
      message: "Habit check-in updated",
      data: [updatedHabit],
    });
  });

  it("rejects unauthenticated habit check-in deletion", async () => {
    authUserIdMock.value = null;
    const { app } = await import("../src/app");

    const response = await request(app).delete(
      `/api/habits/${validHabitId}/checkins/${todayDateKey}`,
    );

    expect(response.status).toBe(401);
    expect(findOneMock).not.toHaveBeenCalled();
  });

  it("deletes a habit check-in", async () => {
    const savedHabit = {
      plan: "weekly",
      checkins: [{ date: "2026-01-01", count: 1 }],
    };
    findOneAndUpdateMock.mockResolvedValue(savedHabit);
    const { app } = await import("../src/app");

    const response = await request(app).delete(
      `/api/habits/${validHabitId}/checkins/${todayDateKey}`,
    );

    expect(response.status).toBe(200);
    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { _id: validHabitId, userId: "user_123" },
      { $pull: { checkins: { date: todayDateKey } } },
      { new: true, runValidators: true },
    );
    expect(saveMock).not.toHaveBeenCalled();
    expect(response.body).toEqual({
      status: 200,
      message: "Habit check-in deleted",
      data: [savedHabit],
    });
  });

  it("rejects unauthenticated habit stats", async () => {
    authUserIdMock.value = null;
    const { app } = await import("../src/app");

    const response = await request(app).get(`/api/habits/${validHabitId}/stats`);

    expect(response.status).toBe(401);
    expect(findOneMock).not.toHaveBeenCalled();
  });

  it("returns 404 when reading stats for an invalid habit id", async () => {
    const { app } = await import("../src/app");

    const response = await request(app).get("/api/habits/not-an-id/stats");

    expect(response.status).toBe(404);
    expect(findOneMock).not.toHaveBeenCalled();
  });

  it("returns 404 when reading stats for a missing or foreign habit", async () => {
    findOneMock.mockResolvedValue(null);
    const { app } = await import("../src/app");

    const response = await request(app).get(`/api/habits/${validHabitId}/stats`);

    expect(response.status).toBe(404);
    expect(findOneMock).toHaveBeenCalledWith({
      _id: validHabitId,
      userId: "user_123",
    });
  });

  it("returns daily habit stats", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${todayDateKey}T12:00:00.000Z`));
    findOneMock.mockResolvedValue({
      _id: validHabitId,
      plan: "daily",
      createdAt: new Date(`${yesterdayDateKey}T00:00:00.000Z`),
      checkins: [
        { date: todayDateKey, count: 1 },
        { date: yesterdayDateKey, count: 1 },
      ],
    });
    const { app } = await import("../src/app");

    const response = await request(app).get(`/api/habits/${validHabitId}/stats`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 200,
      message: "Habit stats found",
      data: [
        {
          habitId: validHabitId,
          plan: "daily",
          current: {
            type: "daily",
            date: todayDateKey,
            count: 1,
            completed: true,
            streak: 2,
          },
          totals: {
            totalCheckins: 2,
            checkedInDays: 2,
            successRate: 100,
          },
        },
      ],
    });
  });

  it("returns weekly habit stats", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${todayDateKey}T12:00:00.000Z`));
    findOneMock.mockResolvedValue({
      _id: validHabitId,
      plan: "weekly",
      weeklyTarget: 4,
      createdAt: new Date(`${todayDateKey}T00:00:00.000Z`),
      checkins: [
        { date: todayDateKey, count: 2 },
        { date: yesterdayDateKey, count: 1 },
      ],
    });
    const { getCalendarWeekRange } = await import(
      "../src/features/habit/habitDate.helpers"
    );
    const weekRange = getCalendarWeekRange(todayDateKey);
    const { app } = await import("../src/app");

    const response = await request(app).get(`/api/habits/${validHabitId}/stats`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 200,
      message: "Habit stats found",
      data: [
        {
          habitId: validHabitId,
          plan: "weekly",
          current: {
            type: "weekly",
            startDate: weekRange.startDate,
            endDate: weekRange.endDate,
            count: 3,
            target: 4,
            remaining: 1,
            completed: false,
          },
          totals: {
            totalCheckins: 3,
            checkedInDays: 2,
            successRate: 75,
          },
        },
      ],
    });
  });
});
