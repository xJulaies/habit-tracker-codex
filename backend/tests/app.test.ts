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

  it("allows localhost frontend origins for CORS", async () => {
    const { app } = await import("../src/app");

    const localhostResponse = await request(app)
      .options("/api/habits")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "GET");
    const loopbackResponse = await request(app)
      .options("/api/habits")
      .set("Origin", "http://127.0.0.1:5173")
      .set("Access-Control-Request-Method", "GET");

    expect(localhostResponse.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
    expect(loopbackResponse.headers["access-control-allow-origin"]).toBe(
      "http://127.0.0.1:5173",
    );
  });

  it("does not allow unknown origins for CORS", async () => {
    const { app } = await import("../src/app");

    const response = await request(app)
      .options("/api/habits")
      .set("Origin", "https://example.com")
      .set("Access-Control-Request-Method", "GET");

    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
