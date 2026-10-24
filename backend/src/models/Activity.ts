import { Schema, model } from "mongoose";

const activitySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  task: { type: Schema.Types.ObjectId, ref: "Task", default: null },
  action: { type: String, enum: ["created", "updated", "status_changed", "completed", "deleted"], required: true },
  taskTitle: { type: String, required: true, trim: true, maxlength: 140 },
  summary: { type: String, required: true, maxlength: 240 }
}, { timestamps: true });

activitySchema.index({ user: 1, createdAt: -1 });
export const Activity = model("Activity", activitySchema);
