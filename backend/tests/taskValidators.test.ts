import { describe, expect, it } from "vitest";
import { createTaskSchema, taskQuerySchema, updateTaskSchema } from "../src/validators/task.js";
describe("task validation schemas", () => {
  it("trims title and applies safe defaults", () => {
    const parsed = createTaskSchema.parse({ title: "  Write README  " });
    expect(parsed.title).toBe("Write README");
    expect(parsed.status).toBe("todo");
    expect(parsed.priority).toBe("medium");
    expect(parsed.labels).toEqual([]);
  });
  it("rejects blank titles", () => expect(createTaskSchema.safeParse({ title: "   " }).success).toBe(false));
  it("rejects invalid statuses and client-provided owner fields", () => {
    expect(createTaskSchema.safeParse({ title: "Test", status: "done" }).success).toBe(false);
    expect(createTaskSchema.safeParse({ title: "Test", creator: "another-user" }).success).toBe(false);
  });
  it("limits pagination to 100 items", () => {
    expect(taskQuerySchema.safeParse({ limit: "500" }).success).toBe(false);
    expect(taskQuerySchema.parse({ page: "2" }).page).toBe(2);
  });
  it("accepts partial updates but rejects unknown fields", () => {
    expect(updateTaskSchema.safeParse({}).success).toBe(true);
    expect(updateTaskSchema.safeParse({ isAdmin: true }).success).toBe(false);
  });
});
