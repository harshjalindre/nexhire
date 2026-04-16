import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Application } from "@/types/application.types";
import type { PaginatedResponse } from "@/types/common.types";

export function useApplications(filters?: { status?: string }) { return useQuery({ queryKey: ["applications", filters], queryFn: async () => { const res = await api.get<PaginatedResponse<Application>>("/applications", { params: filters }); return res.data; } }); }
export function useWithdrawApplication() { const qc = useQueryClient(); return useMutation({ mutationFn: async (id: string) => { await api.post(`/applications/${id}/withdraw`); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }) }); }
