import { Router, type RequestHandler } from "express";
import { createTask, deleteTask, getTask, listTasks, updateTask } from "../controllers/taskController.js";

export const taskRoutes = Router();
const asyncHandler = (handler: RequestHandler): RequestHandler => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

taskRoutes.get("/", asyncHandler(listTasks));
taskRoutes.post("/", asyncHandler(createTask));
taskRoutes.get("/:id", asyncHandler(getTask));
taskRoutes.patch("/:id", asyncHandler(updateTask));
taskRoutes.delete("/:id", asyncHandler(deleteTask));
