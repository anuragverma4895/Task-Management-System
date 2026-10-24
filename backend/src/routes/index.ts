import { Router, type RequestHandler } from "express";
import { listActivity } from "../controllers/activityController.js";
import { taskRoutes } from "./taskRoutes.js";

export const apiRoutes = Router();
const asyncHandler = (handler: RequestHandler): RequestHandler => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
apiRoutes.use("/tasks", taskRoutes);
apiRoutes.get("/activity", asyncHandler(listActivity));
