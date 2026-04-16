import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Company } from "@/types/company.types";
import type { PaginatedResponse } from "@/types/common.types";

export function useCompanies() { return useQuery({ queryKey: ["companies"], queryFn: async () => { const res = await api.get<PaginatedResponse<Company>>("/companies"); return res.data; } }); }
export function useCreateCompany() { const qc = useQueryClient(); return useMutation({ mutationFn: async (data: Partial<Company>) => { const res = await api.post<Company>("/companies", data); return res.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }) }); }
export function useUpdateCompany() { const qc = useQueryClient(); return useMutation({ mutationFn: async ({ id, ...data }: Partial<Company> & { id: string }) => { const res = await api.put<Company>(`/companies/${id}`, data); return res.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }) }); }
export function useDeleteCompany() { const qc = useQueryClient(); return useMutation({ mutationFn: async (id: string) => { await api.delete(`/companies/${id}`); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }) }); }
