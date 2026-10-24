import pino from "pino";
import { env } from "../config/env.js";
const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  redact: { paths: ["req.headers.authorization", "req.headers.cookie", "*.password", "*.token", "*.secret"], censor: "[REDACTED]" }
});
export default logger;
