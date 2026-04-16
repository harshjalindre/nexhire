import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Drive, DriveFilters } from "@/types/drive.types";
import type { PaginatedResponse } from "@/types/common.types";

export function useDrives(filters?: DriveFilters) { return useQuery({ queryKey: ["drives", filters], queryFn: async () => { const res = await api.get<PaginatedResponse<Drive>>("/drives", { params: filters }); return res.data; } }); }
export function useDrive(id: string) { return useQuery({ queryKey: ["drives", id], queryFn: async () => { const res = await api.get<Drive>(`/drives/${id}`); return res.data; }, enabled: !!id }); }
export function useCreateDrive() { const qc = useQueryClient(); return useMutation({ mutationFn: async (data: Partial<Drive>) => { const res = await api.post<Drive>("/drives", data); return res.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: ["drives"] }) }); }
export function useUpdateDrive() { const qc = useQueryClient(); return useMutation({ mutationFn: async ({ id, ...data }: Partial<Drive> & { id: string }) => { const res = await api.put<Drive>(`/drives/${id}`, data); return res.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: ["drives"] }) }); }
export function useDeleteDrive() { const qc = useQueryClient(); return useMutation({ mutationFn: async (id: string) => { await api.delete(`/drives/${id}`); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["drives"] }) }); }
export function useApplyToDrive() { const qc = useQueryClient(); return useMutation({ mutationFn: async (driveId: string) => { const res = await api.post(`/drives/${driveId}/apply`); return res.data; }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["drives"] }); qc.invalidateQueries({ queryKey: ["applications"] }); } }); }
