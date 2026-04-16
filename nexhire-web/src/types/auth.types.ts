export interface User { id: string; name: string; email: string; role: "super_admin" | "college_admin" | "student"; avatar?: string; tenantId: string; }
export interface Tenant { id: string; name: string; code: string; logo?: string; }
export interface LoginRequest { collegeCode: string; email: string; password: string; }
export interface LoginResponse { user: User; token: string; tenant: Tenant; }
export interface SignupRequest { collegeCode: string; name: string; email: string; password: string; role: "college_admin" | "student"; }
export interface SignupResponse { user: User; token: string; tenant: Tenant; }
