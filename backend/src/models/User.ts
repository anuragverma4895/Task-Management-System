import { Schema, model, type InferSchemaType } from "mongoose";
const userSchema = new Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  emailVerifiedAt: { type: Date, default: null },
  preferences: {
    theme: { type: String, enum: ["light", "dark", "system"], default: "light" },
    defaultTaskView: { type: String, enum: ["list", "kanban", "calendar"], default: "list" },
    notificationsEnabled: { type: Boolean, default: true }
  }
}, { timestamps: true });
export type UserDocument = InferSchemaType<typeof userSchema>;
export const User = model("User", userSchema);
