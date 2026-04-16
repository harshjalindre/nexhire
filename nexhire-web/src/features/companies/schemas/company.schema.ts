import { z } from "zod";
export const companyFormSchema = z.object({ name: z.string().min(2), industry: z.string().min(1), website: z.string().url().optional().or(z.literal("")), description: z.string().optional(), contact: z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().optional() }) });
export type CompanyFormData = z.infer<typeof companyFormSchema>;
