import { z } from "zod";

const statusSchema = z.enum(["todo", "in-progress", "done"]);
const prioritySchema = z.enum(["low", "medium", "high"]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z.string().trim().max(1000).optional(),
  projectId: z.string().min(1, "Project is required"),
  assigneeId: z.string().min(1, "Assignee is required").optional(),
  status: statusSchema.optional(),
  priority: prioritySchema.optional(),
  dueDate: z.coerce.date()
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(3).optional(),
  description: z.string().trim().max(1000).optional(),
  assigneeId: z.string().optional(),
  status: statusSchema.optional(),
  priority: prioritySchema.optional(),
  dueDate: z.coerce.date().optional()
});

export const taskQuerySchema = z.object({
  projectId: z.string().optional(),
  status: statusSchema.optional(),
  assignedToMe: z.enum(["true", "false"]).optional()
});
