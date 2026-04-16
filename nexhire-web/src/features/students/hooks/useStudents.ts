import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Student, StudentFilters } from "@/types/student.types";
import type { PaginatedResponse } from "@/types/common.types";

export function useStudents(filters?: StudentFilters) { return useQuery({ queryKey: ["students", filters], queryFn: async () => { const res = await api.get<PaginatedResponse<Student>>("/students", { params: filters }); return res.data; } }); }
export function useStudentDetail(id: string) { return useQuery({ queryKey: ["students", id], queryFn: async () => { const res = await api.get<Student>(`/students/${id}`); return res.data; }, enabled: !!id }); }
