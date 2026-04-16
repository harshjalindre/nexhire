import { z } from "zod";
export const createDriveSchema = z.object({ title: z.string().min(3), companyId: z.string().uuid(), description: z.string().min(10), branches: z.array(z.string()).min(1), minCgpa: z.number().min(0).max(10), maxBacklogs: z.number().int().min(0), packageLpa: z.number().min(0), startDate: z.string(), endDate: z.string(), rounds: z.array(z.object({ name: z.string(), type: z.enum(["aptitude", "technical", "hr", "group_discussion", "coding"]), description: z.string().optional() })).optional(), status: z.enum(["draft", "active"]).default("draft") });
export const updateDriveSchema = createDriveSchema.partial();
export type CreateDriveInput = z.infer<typeof createDriveSchema>;
export type UpdateDriveInput = z.infer<typeof updateDriveSchema>;
