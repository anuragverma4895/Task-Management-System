import { z } from "zod";
export const taskStatusSchema = z.enum(["backlog", "todo", "in_progress", "in_review", "completed", "cancelled"]);
export const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);
export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(140),
  description: z.string().max(5000).optional().default(""),
  status: taskStatusSchema.optional().default("todo"),
  priority: taskPrioritySchema.optional().default("medium"),
  dueDate: z.string().datetime().nullable().optional(),
  project: z.string().regex(/^[a-f\d]{24}$/i).nullable().optional(),
  workspace: z.string().regex(/^[a-f\d]{24}$/i).nullable().optional(),
  labels: z.array(z.string().trim().min(1).max(40)).max(20).optional().default([])
}).strict();
export const updateTaskSchema = createTaskSchema.partial().strict();
export const taskQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(120).optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  archived: z.enum(["true", "false"]).default("false"),
  sort: z.enum(["title", "createdAt", "updatedAt", "dueDate", "priority", "status"]).default("updatedAt"),
  order: z.enum(["asc", "desc"]).default("desc")
}).strict();
