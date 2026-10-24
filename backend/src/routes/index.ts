import { Router } from "express";
import { taskRoutes } from "./taskRoutes.js";
export const apiRoutes = Router();
apiRoutes.use("/tasks", taskRoutes);
