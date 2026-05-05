import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address").transform((value) => value.toLowerCase().trim()),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "member"]).optional()
});

export const loginSchema = z.object({
  email: z.email("Invalid email address").transform((value) => value.toLowerCase().trim()),
  password: z.string().min(1, "Password is required")
});
