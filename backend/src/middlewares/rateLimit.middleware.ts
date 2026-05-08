import { NextFunction, Request, Response } from "express";
import { createError } from "../lib/errorhandling/createError";

type TRateLimitOptions = {
  maxRequests: number;
  windowMs: number;
};

type TRateLimitEntry = {
  count: number;
  resetAt: number;
};

const getClientKey = (req: Request): string => {
  return (
    req.ip ||
    req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
};

export const createRateLimitMiddleware = ({
  maxRequests,
  windowMs,
}: TRateLimitOptions) => {
  const requestsByClient = new Map<string, TRateLimitEntry>();

  return (req: Request, _res: Response, next: NextFunction) => {
    const now = Date.now();
    const clientKey = getClientKey(req);
    const currentEntry = requestsByClient.get(clientKey);

    if (!currentEntry || currentEntry.resetAt <= now) {
      requestsByClient.set(clientKey, {
        count: 1,
        resetAt: now + windowMs,
      });

      return next();
    }

    if (currentEntry.count >= maxRequests) {
      return next(createError(429, "Too many requests"));
    }

    currentEntry.count += 1;
    requestsByClient.set(clientKey, currentEntry);

    return next();
  };
};

export const habitRateLimit = createRateLimitMiddleware({
  maxRequests: 120,
  windowMs: 60_000,
});
