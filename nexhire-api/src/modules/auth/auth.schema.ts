import { z } from "zod";
export const loginSchema = z.object({ collegeCode: z.string().min(3).max(10), email: z.string().email(), password: z.string().min(6) });
export const signupSchema = z.object({ collegeCode: z.string().min(3).max(10), name: z.string().min(2), email: z.string().email(), password: z.string().min(8), role: z.enum(["college_admin", "student"]) });
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
