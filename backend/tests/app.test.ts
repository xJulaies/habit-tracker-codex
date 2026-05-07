import type { RequestHandler } from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

const clerkMiddlewareMock = vi.hoisted(() => vi.fn());

vi.mock("@clerk/express", () => {
  return {
    clerkMiddleware: clerkMiddlewareMock.mockImplementation(
      (): RequestHandler => (_req, _res, next) => next(),
    ),
  };
});

describe("app", () => {
  it("uses Clerk middleware", async () => {
    await import("../src/app");

    expect(clerkMiddlewareMock).toHaveBeenCalledOnce();
  });

  it("answers the root route", async () => {
    const { app } = await import("../src/app");

    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      message: "API works",
    });
  });
});
