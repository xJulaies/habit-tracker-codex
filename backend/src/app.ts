import express, { json, NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { createAnswer } from "./lib/errorhandling/createAnswer";
import { createError, TCreateError } from "./lib/errorhandling/createError";
import { settings } from "./config/settings";
import { clerkAuthMiddleware } from "./middlewares/clerkAuth.middleware";
import { habitRoute } from "./features/habit/habit.route";
import { habitRateLimit } from "./middlewares/rateLimit.middleware";

export const app = express();

app.use(
  cors({
    origin: settings.FRONTEND_URLS,
    credentials: true,
  }),
);
app.use(clerkAuthMiddleware);
app.use(helmet());
app.use(json());

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "API works",
  });
});

app.use("/api/habits", habitRateLimit, habitRoute);

app.use((_req, _res, next) => {
  return next(createError(404, "Not here, not found"));
});

app.use(
  (err: TCreateError, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    const message = status >= 500 ? "Server Error" : err.message;

    if (status >= 500) {
      console.error("Unhandled server error:", err);
    }

    return res
      .status(status)
      .json(createAnswer(status, message || "Server Error", []));
  },
);
