import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Task } from "../models/Task.js";
import { createTaskSchema, taskQuerySchema, updateTaskSchema } from "../validators/task.js";

type AuthenticatedRequest = Request & { user?: { id: string } };
function getUserId(req: AuthenticatedRequest): string | null {
  const id = req.user?.id;
  return id && mongoose.isValidObjectId(id) ? id : null;
}
export async function listTasks(req: AuthenticatedRequest, res: Response) {
  const owner = getUserId(req);
  if (!owner) return res.status(401).json({ message: "Authentication is required." });
  const parsed = taskQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ message: "Invalid task query.", issues: parsed.error.issues });
  const { page, limit, q, status, priority, archived, sort, order } = parsed.data;
  const filter: Record<string, unknown> = { creator: new mongoose.Types.ObjectId(owner), isArchived: archived === "true" };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (q) filter.$or = [
    { title: { $regex: escapeRegex(q), $options: "i" } },
    { description: { $regex: escapeRegex(q), $options: "i" } },
    { labels: { $regex: escapeRegex(q), $options: "i" } }
  ];
  const [data, total] = await Promise.all([
    Task.find(filter).sort({ [sort]: order === "asc" ? 1 : -1, _id: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    Task.countDocuments(filter)
  ]);
  return res.json({ data, page, limit, total, pages: Math.ceil(total / limit) });
}
export async function createTask(req: AuthenticatedRequest, res: Response) {
  const owner = getUserId(req);
  if (!owner) return res.status(401).json({ message: "Authentication is required." });
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid task data.", issues: parsed.error.issues });
  const task = await Task.create({ ...parsed.data, creator: new mongoose.Types.ObjectId(owner) });
  return res.status(201).json({ data: task });
}
export async function getTask(req: AuthenticatedRequest, res: Response) {
  const owner = getUserId(req);
  if (!owner) return res.status(401).json({ message: "Authentication is required." });
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid task ID." });
  const task = await Task.findOne({ _id: req.params.id, creator: owner }).lean();
  if (!task) return res.status(404).json({ message: "Task not found." });
  return res.json({ data: task });
}
export async function updateTask(req: AuthenticatedRequest, res: Response) {
  const owner = getUserId(req);
  if (!owner) return res.status(401).json({ message: "Authentication is required." });
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid task ID." });
  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid task data.", issues: parsed.error.issues });
  const updates = { ...parsed.data } as Record<string, unknown>;
  if (updates.status === "completed") updates.completedAt = new Date();
  if (updates.status && updates.status !== "completed") updates.completedAt = null;
  const task = await Task.findOneAndUpdate({ _id: req.params.id, creator: owner }, { $set: updates }, { new: true, runValidators: true });
  if (!task) return res.status(404).json({ message: "Task not found." });
  return res.json({ data: task });
}
export async function deleteTask(req: AuthenticatedRequest, res: Response) {
  const owner = getUserId(req);
  if (!owner) return res.status(401).json({ message: "Authentication is required." });
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid task ID." });
  const task = await Task.findOneAndDelete({ _id: req.params.id, creator: owner });
  if (!task) return res.status(404).json({ message: "Task not found." });
  return res.status(204).send();
}
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
