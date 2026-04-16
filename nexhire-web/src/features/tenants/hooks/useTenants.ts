import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { TenantDetail } from "@/types/tenant.types";
import type { PaginatedResponse } from "@/types/common.types";

export function useTenants() { return useQuery({ queryKey: ["tenants"], queryFn: async () => { const res = await api.get<PaginatedResponse<TenantDetail>>("/tenants"); return res.data; } }); }
export function useCreateTenant() { const qc = useQueryClient(); return useMutation({ mutationFn: async (data: Partial<TenantDetail>) => { const res = await api.post<TenantDetail>("/tenants", data); return res.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: ["tenants"] }) }); }
export function useUpdateTenant() { const qc = useQueryClient(); return useMutation({ mutationFn: async ({ id, ...data }: Partial<TenantDetail> & { id: string }) => { const res = await api.put<TenantDetail>(`/tenants/${id}`, data); return res.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: ["tenants"] }) }); }
export function useDeleteTenant() { const qc = useQueryClient(); return useMutation({ mutationFn: async (id: string) => { await api.delete(`/tenants/${id}`); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["tenants"] }) }); }
