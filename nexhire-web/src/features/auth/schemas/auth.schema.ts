import { z } from "zod";
export const loginSchema = z.object({ collegeCode: z.string().min(3, "College code must be at least 3 characters").max(10), email: z.string().email("Invalid email address"), password: z.string().min(6, "Password must be at least 6 characters") });
export const signupSchema = z.object({ collegeCode: z.string().min(3).max(10), name: z.string().min(2, "Name must be at least 2 characters"), email: z.string().email("Invalid email address"), password: z.string().min(8, "Password must be at least 8 characters"), confirmPassword: z.string(), role: z.enum(["college_admin", "student"]) }).refine((data) => data.password === data.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
