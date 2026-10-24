import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const here = dirname(fileURLToPath(import.meta.url));
const candidateRoots = [resolve(here, "../../../"), resolve(here, "../../../../"), resolve(process.cwd()), resolve(process.cwd(), "..")];
const rootEnv = candidateRoots.map(root => resolve(root, ".env")).find(path => existsSync(path));
if (rootEnv) dotenv.config({ path: rootEnv, override: false });

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/taskflow"),
  JWT_SECRET: z.string().min(32).default("development_only_replace_this_secret_before_use_123456"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  COOKIE_SECRET: z.string().min(32).default("development_only_replace_this_cookie_secret_123456"),
  EMAIL_PROVIDER: z.enum(["disabled", "smtp"]).default("disabled"),
  UPLOAD_PROVIDER: z.enum(["local"]).default("local"),
  UPLOAD_DIRECTORY: z.string().default("uploads"),
  MAX_FILE_SIZE_MB: z.coerce.number().int().min(1).max(50).default(5)
}).superRefine((value, context) => {
  if (value.NODE_ENV === "production" && (value.JWT_SECRET.startsWith("development_only") || value.COOKIE_SECRET.startsWith("development_only"))) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Production requires strong JWT_SECRET and COOKIE_SECRET values." });
  }
});
const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; ");
  throw new Error(`Invalid environment configuration: ${details}`);
}
export const env = parsed.data;
export const repositoryRoot = rootEnv ? dirname(rootEnv) : resolve(here, "../../../");
