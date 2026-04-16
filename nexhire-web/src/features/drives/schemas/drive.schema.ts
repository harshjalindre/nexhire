import { z } from "zod";
export const driveFormSchema = z.object({ title: z.string().min(3), companyId: z.string().min(1), description: z.string().min(10), branches: z.array(z.string()).min(1), minCgpa: z.number().min(0).max(10), maxBacklogs: z.number().min(0).int(), packageLpa: z.number().min(0), startDate: z.string().min(1), endDate: z.string().min(1), status: z.enum(["draft", "active", "closed", "completed"]) });
export type DriveFormData = z.infer<typeof driveFormSchema>;
