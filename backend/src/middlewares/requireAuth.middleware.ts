import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import { createError } from "../lib/errorhandling/createError";

export type TAuthenticatedRequest = Request & {
  authUserId: string;
};

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  let userId: string | null | undefined;

  try {
    userId = getAuth(req).userId;
  } catch (error) {
    return next(error);
  }

  if (!userId) {
    return next(createError(401, "Unauthorized"));
  }

  (req as TAuthenticatedRequest).authUserId = userId;

  return next();
};
