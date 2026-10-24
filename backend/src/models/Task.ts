import { Schema, model, type InferSchemaType } from "mongoose";
const checklistItemSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  completed: { type: Boolean, default: false }
}, { _id: true });
const taskSchema = new Schema({
  title: { type: String, required: true, trim: true, minlength: 1, maxlength: 140 },
  description: { type: String, default: "", maxlength: 5000 },
  creator: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  assignee: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
  workspace: { type: Schema.Types.ObjectId, ref: "Workspace", default: null, index: true },
  project: { type: Schema.Types.ObjectId, ref: "Project", default: null, index: true },
  status: { type: String, enum: ["backlog", "todo", "in_progress", "in_review", "completed", "cancelled"], default: "todo", index: true },
  priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium", index: true },
  labels: { type: [String], default: [] },
  dueDate: { type: Date, default: null, index: true },
  startDate: { type: Date, default: null },
  estimatedMinutes: { type: Number, min: 0, max: 525600, default: null },
  actualMinutes: { type: Number, min: 0, max: 525600, default: 0 },
  checklist: { type: [checklistItemSchema], default: [] },
  isArchived: { type: Boolean, default: false, index: true },
  completedAt: { type: Date, default: null },
  recurrence: { type: Schema.Types.Mixed, default: null }
}, { timestamps: true, optimisticConcurrency: true });
taskSchema.index({ creator: 1, isArchived: 1, status: 1, dueDate: 1 });
taskSchema.index({ workspace: 1, project: 1, status: 1, updatedAt: -1 });
export type TaskDocument = InferSchemaType<typeof taskSchema>;
export const Task = model("Task", taskSchema);
