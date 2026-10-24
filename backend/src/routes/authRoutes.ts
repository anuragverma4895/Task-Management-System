import { Router } from "express";
import rateLimit from "express-rate-limit";
import { currentUser, signIn, signOut, signUp } from "../controllers/authController.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const authRoutes = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-7", legacyHeaders: false, message: { message: "Too many sign-in attempts. Please try again later." } });
authRoutes.post("/signup", authLimiter, signUp);
authRoutes.post("/login", authLimiter, signIn);
authRoutes.get("/me", requireAuth, currentUser);
authRoutes.post("/logout", requireAuth, signOut);
