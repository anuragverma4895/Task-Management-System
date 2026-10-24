import { createHash } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { Session } from "../models/Session.js";

export type AuthenticatedRequest = Request & { user?: { id: string } };

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.taskflow_session as string | undefined;
    if (!token || token.length > 200) return res.status(401).json({ message: "Please sign in to continue." });
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const session = await Session.findOne({ tokenHash, expiresAt: { $gt: new Date() } }).select("+tokenHash").lean();
    if (!session || !mongoose.isValidObjectId(session.user)) {
      res.clearCookie("taskflow_session", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
      return res.status(401).json({ message: "Your session has expired. Please sign in again." });
    }
    req.user = { id: String(session.user) };
    return next();
  } catch (error) {
    return next(error);
  }
}
