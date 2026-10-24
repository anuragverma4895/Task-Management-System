import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Activity } from "../models/Activity.js";

type UserRequest = Request & { user?: { id: string } };

export async function listActivity(req: UserRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId || !mongoose.isValidObjectId(userId)) return res.status(401).json({ message: "Please sign in to continue." });
    const limitValue = Number(req.query.limit ?? 50);
    const limit = Number.isInteger(limitValue) ? Math.max(1, Math.min(100, limitValue)) : 50;
    const data = await Activity.find({ user: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1, _id: -1 }).limit(limit).lean();
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
}
