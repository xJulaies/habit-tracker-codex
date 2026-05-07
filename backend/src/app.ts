import express, { json, NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { createAnswer } from "./lib/errorhandling/createAnswer";
import { createError, TCreateError } from "./lib/errorhandling/createError";
import { settings } from "./config/settings";
import { clerkAuthMiddleware } from "./middlewares/clerkAuth.middleware";

export const app = express();

app.use(clerkAuthMiddleware);
app.use(helmet());
app.use(json());
app.use(
  cors({
    origin: settings.FRONTEND_URL,
    credentials: true,
  }),
);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "API works",
  });
});

app.use((_req, _res, next) => {
  return next(createError(404, "Not here, not found"));
});

app.use(
  (err: TCreateError, _req: Request, res: Response, _next: NextFunction) => {
    return res
      .status(err.status || 500)
      .json(createAnswer(err.status || 500, err.message || "Server Error", []));
  },
);
