import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Student } from "@/types/student.types";

export function useProfile() { return useQuery({ queryKey: ["profile"], queryFn: async () => { const res = await api.get<Student>("/profile"); return res.data; } }); }
export function useUpdateProfile() { const qc = useQueryClient(); return useMutation({ mutationFn: async (data: Partial<Student>) => { const res = await api.put<Student>("/profile", data); return res.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }) }); }
export function useUploadResume() { const qc = useQueryClient(); return useMutation({ mutationFn: async (file: File) => { const formData = new FormData(); formData.append("resume", file); const res = await api.post("/profile/resume", formData, { headers: { "Content-Type": "multipart/form-data" } }); return res.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }) }); }
