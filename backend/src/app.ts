import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import logger from "./utils/logger.js";
import { authRoutes } from "./routes/authRoutes.js";
import { apiRoutes } from "./routes/index.js";
import { requireAuth } from "./middleware/requireAuth.js";

export const app = express();
app.disable("x-powered-by");
app.set("trust proxy", env.NODE_ENV === "production" ? 1 : false);
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-CSRF-Token"]
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser(env.COOKIE_SECRET));
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => logger.info({ method: req.method, path: req.originalUrl, statusCode: res.statusCode, responseTimeMs: Date.now() - startedAt }, "HTTP request"));
  next();
});

app.get("/api/health", (_req, res) => res.status(200).json({
  status: "ok",
  service: "taskflow-api",
  timestamp: new Date().toISOString()
}));
app.use("/api/auth", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false
}), authRoutes);
app.use("/api", requireAuth, apiRoutes);
app.use((_req, res) => res.status(404).json({ message: "Route not found." }));

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  logger.error({ err: error }, "Unhandled request error");
  res.status(500).json({ message: "An unexpected server error occurred." });
};
app.use(errorHandler);
