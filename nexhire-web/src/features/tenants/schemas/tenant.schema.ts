import { z } from "zod";
export const tenantFormSchema = z.object({ name: z.string().min(3), code: z.string().min(3).max(10).regex(/^[A-Z0-9]+$/), adminEmail: z.string().email(), tier: z.enum(["basic", "premium", "enterprise"]) });
export type TenantFormData = z.infer<typeof tenantFormSchema>;
