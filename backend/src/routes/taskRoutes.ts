import { Router } from "express";
import { createTask, deleteTask, getTask, listTasks, updateTask } from "../controllers/taskController.js";
export const taskRoutes = Router();
// Do not mount publicly until a real authentication middleware is implemented.
taskRoutes.get("/", listTasks);
taskRoutes.post("/", createTask);
taskRoutes.get("/:id", getTask);
taskRoutes.patch("/:id", updateTask);
taskRoutes.delete("/:id", deleteTask);
