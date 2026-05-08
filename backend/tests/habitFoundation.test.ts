import { describe, expect, it } from "vitest";
import {
  DEFAULT_HABIT_COLOR,
  HABIT_COLORS,
  HabitModel,
} from "../src/features/habit/habit.model";
import { createHabitSchema } from "../src/features/habit/habit.zodSchema";
import {
  formatDateDisplay,
  getCalendarWeekRange,
  isAllowedCheckinDate,
  toDateKey,
} from "../src/features/habit/habitDate.helpers";

describe("habit foundation", () => {
  it("validates and normalizes a daily habit create payload", () => {
    const result = createHabitSchema.parse({
      title: "  Morning walk  ",
      description: "  20 minutes  ",
      category: "  Health  ",
      plan: "daily",
    });

    expect(result).toEqual({
      title: "Morning walk",
      description: "20 minutes",
      category: "Health",
      plan: "daily",
      color: DEFAULT_HABIT_COLOR,
    });
  });

  it("keeps text fields as plain stored text", () => {
    const result = createHabitSchema.parse({
      title: " <script>alert('x')</script> ",
      description: "Use & improve",
      category: "\"Health\"",
      plan: "daily",
    });

    expect(result).toEqual({
      title: "<script>alert('x')</script>",
      description: "Use & improve",
      category: "\"Health\"",
      plan: "daily",
      color: DEFAULT_HABIT_COLOR,
    });
  });

  it("validates and normalizes a weekly habit create payload", () => {
    const result = createHabitSchema.parse({
      title: "Read",
      description: "",
      category: "Learning",
      plan: "weekly",
      weeklyTarget: 10,
      color: HABIT_COLORS[3],
    });

    if (result.plan !== "weekly") {
      throw new Error("Expected weekly habit");
    }

    expect(result.weeklyTarget).toBe(10);
    expect(result.color).toBe(HABIT_COLORS[3]);
  });

  it("rejects invalid plan and weekly target combinations", () => {
    expect(() =>
      createHabitSchema.parse({
        title: "Run",
        category: "Health",
        plan: "daily",
        weeklyTarget: 3,
      }),
    ).toThrow();

    expect(() =>
      createHabitSchema.parse({
        title: "Run",
        category: "Health",
        plan: "weekly",
      }),
    ).toThrow();

    expect(() =>
      createHabitSchema.parse({
        title: "Run",
        category: "Health",
        plan: "weekly",
        weeklyTarget: 15,
      }),
    ).toThrow();
  });

  it("uses strict text limits and allowed colors", () => {
    expect(() =>
      createHabitSchema.parse({
        title: "",
        category: "Health",
        plan: "daily",
      }),
    ).toThrow();

    expect(() =>
      createHabitSchema.parse({
        title: "A".repeat(81),
        category: "Health",
        plan: "daily",
      }),
    ).toThrow();

    expect(() =>
      createHabitSchema.parse({
        title: "Run",
        category: "   ",
        plan: "daily",
      }),
    ).toThrow();

    expect(() =>
      createHabitSchema.parse({
        title: "Run",
        category: "Health",
        plan: "daily",
        color: "not-a-color",
      }),
    ).toThrow();
  });

  it("defines a mongoose habit model with defaults", async () => {
    const habit = new HabitModel({
      userId: "user_123",
      title: "Run",
      category: "Health",
      plan: "daily",
    });

    await expect(habit.validate()).resolves.toBeUndefined();
    expect(habit.color).toBe(DEFAULT_HABIT_COLOR);
    expect(habit.checkins).toEqual([]);
  });

  it("rejects invalid mongoose weekly target combinations", async () => {
    const dailyHabit = new HabitModel({
      userId: "user_123",
      title: "Run",
      category: "Health",
      plan: "daily",
      weeklyTarget: 3,
    });

    const weeklyHabit = new HabitModel({
      userId: "user_123",
      title: "Run",
      category: "Health",
      plan: "weekly",
    });

    await expect(dailyHabit.validate()).rejects.toThrow();
    await expect(weeklyHabit.validate()).rejects.toThrow();
  });

  it("formats internal and display date keys", () => {
    const date = new Date(Date.UTC(2026, 4, 7));

    expect(toDateKey(date)).toBe("2026-05-07");
    expect(formatDateDisplay("2026-05-07")).toBe("07.05.2026");
    expect(() => formatDateDisplay("07.05.2026")).toThrow();
    expect(() => formatDateDisplay("2026-02-31")).toThrow();
  });

  it("calculates monday to sunday calendar week ranges", () => {
    expect(getCalendarWeekRange("2026-05-07")).toEqual({
      startDate: "2026-05-04",
      endDate: "2026-05-10",
    });

    expect(getCalendarWeekRange("2026-05-10")).toEqual({
      startDate: "2026-05-04",
      endDate: "2026-05-10",
    });
  });

  it("allows check-ins only for today and yesterday", () => {
    const today = new Date(Date.UTC(2026, 4, 7));

    expect(isAllowedCheckinDate("2026-05-07", today)).toBe(true);
    expect(isAllowedCheckinDate("2026-05-06", today)).toBe(true);
    expect(isAllowedCheckinDate("2026-05-05", today)).toBe(false);
    expect(isAllowedCheckinDate("2026-05-08", today)).toBe(false);
  });

  it("rejects daily mongoose checkins with a count greater than one", async () => {
    const habit = new HabitModel({
      userId: "user_123",
      title: "Run",
      category: "Health",
      plan: "daily",
      checkins: [
        {
          date: "2026-05-07",
          count: 2,
        },
      ],
    });

    await expect(habit.validate()).rejects.toThrow();
  });
});
