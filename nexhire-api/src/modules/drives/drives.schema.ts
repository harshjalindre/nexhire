import { z } from "zod";
// #20 — Input length validation
export const createDriveSchema = z.object({ title: z.string().min(3).max(200), companyId: z.string().uuid(), description: z.string().min(10).max(2000), branches: z.array(z.string().max(50)).min(1).max(20), minCgpa: z.number().min(0).max(10), maxBacklogs: z.number().int().min(0).max(50), packageLpa: z.number().min(0).max(999), startDate: z.string(), endDate: z.string(), rounds: z.array(z.object({ name: z.string().max(100), type: z.enum(["aptitude", "technical", "hr", "group_discussion", "coding"]), description: z.string().max(500).optional() })).max(10).optional(), status: z.enum(["draft", "active"]).default("draft") });
export const updateDriveSchema = createDriveSchema.partial();
export type CreateDriveInput = z.infer<typeof createDriveSchema>;
export type UpdateDriveInput = z.infer<typeof updateDriveSchema>;
