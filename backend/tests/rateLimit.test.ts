import { describe, expect, it, vi } from "vitest";
import { createRateLimitMiddleware } from "../src/middlewares/rateLimit.middleware";

describe("rate limit middleware", () => {
  it("allows requests until the configured limit is reached", () => {
    const middleware = createRateLimitMiddleware({
      maxRequests: 2,
      windowMs: 60_000,
    });
    const next = vi.fn();
    const req = {
      ip: "127.0.0.1",
      headers: {},
      socket: { remoteAddress: "127.0.0.1" },
    };
    const res = {};

    middleware(req as never, res as never, next);
    middleware(req as never, res as never, next);
    middleware(req as never, res as never, next);

    expect(next).toHaveBeenNthCalledWith(1);
    expect(next).toHaveBeenNthCalledWith(2);
    expect(next.mock.calls[2][0]).toMatchObject({
      status: 429,
      message: "Too many requests",
    });
  });
});
