import { TStatusCode } from "../types/errorTypes";

export const createAnswer = (
  status: TStatusCode,
  message: string,
  data: unknown[],
) => {
  return { status, message, data };
};
