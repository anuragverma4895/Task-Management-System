import { createHash, randomBytes } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { env } from "../config/env.js";
import { Session } from "../models/Session.js";
import { User } from "../models/User.js";

const credentialsSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
  password: z.string().min(8).max(128)
}).strict();

const SESSION_DAYS = 7;
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000
};

function issueSession(res: Response, userId: string) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  return Session.create({
    user: userId,
    tokenHash,
    expiresAt: new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  }).then(() => res.cookie("taskflow_session", token, cookieOptions));
}

function publicUser(user: { _id: unknown; name: string; email: string; preferences?: unknown }) {
  return { id: String(user._id), name: user.name, email: user.email, preferences: user.preferences ?? {} };
}

export async function signUp(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = credentialsSchema.extend({ name: z.string().trim().min(2).max(80) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Enter your name, a valid email, and a password with at least 8 characters.", issues: parsed.error.issues });
    const { name, email, password } = parsed.data;
    const existing = await User.findOne({ email }).select("_id").lean();
    if (existing) return res.status(409).json({ message: "An account with this email already exists. Please sign in." });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    await issueSession(res, String(user._id));
    return res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists. Please sign in." });
    }
    return next(error);
  }
}

export async function signIn(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = credentialsSchema.omit({ name: true }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Enter a valid email and password." });
    const { email, password } = parsed.data;
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }
    await issueSession(res, String(user._id));
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function currentUser(req: Request & { user?: { id: string } }, res: Response, next: NextFunction) {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Please sign in to continue." });
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(401).json({ message: "Account not found. Please sign in again." });
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function signOut(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.taskflow_session as string | undefined;
    if (token) {
      const tokenHash = createHash("sha256").update(token).digest("hex");
      await Session.deleteOne({ tokenHash });
    }
    res.clearCookie("taskflow_session", { ...cookieOptions, maxAge: undefined });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
