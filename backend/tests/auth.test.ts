import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";

beforeAll(() => {
  process.env.NODE_ENV = "test";
});

describe("TaskFlow API access control", () => {
  it("exposes a health endpoint without requiring a session", async () => {
    const response = await request((await import("../src/app.js")).app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("rejects task access when the visitor is not signed in", async () => {
    const { app } = await import("../src/app.js");
    const response = await request(app).get("/api/tasks");
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/sign in|authentication/i);
  });

  it("rejects the current-user endpoint without a session", async () => {
    const { app } = await import("../src/app.js");
    const response = await request(app).get("/api/auth/me");
    expect(response.status).toBe(401);
  });
});
