import { createServer } from "node:http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import logger from "./utils/logger.js";
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: env.FRONTEND_URL, credentials: true }, transports: ["websocket", "polling"] });
io.use((_socket, next) => next(new Error("Socket authentication is not implemented yet.")));

async function start() {
  if (env.NODE_ENV !== "test") await connectDatabase();
  httpServer.listen(env.PORT, () => logger.info({ port: env.PORT }, "TaskFlow API started"));
}
async function shutdown(signal: string) {
  logger.info({ signal }, "Shutting down");
  io.close();
  httpServer.close(async () => {
    if (env.NODE_ENV !== "test") await disconnectDatabase();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
start().catch(error => {
  logger.fatal({ err: error }, "Server startup failed");
  process.exit(1);
});
