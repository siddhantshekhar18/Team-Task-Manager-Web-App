import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(3, "Project name must be at least 3 characters"),
  description: z.string().trim().max(500).optional(),
  members: z.array(z.string()).optional()
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(3).optional(),
  description: z.string().trim().max(500).optional()
});

export const addProjectMemberSchema = z.object({
  memberEmail: z.email("Invalid email address").transform((value) => value.toLowerCase().trim())
});
