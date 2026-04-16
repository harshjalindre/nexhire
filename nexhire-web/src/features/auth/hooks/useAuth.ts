import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { queryClient } from "@/lib/queryClient";
import { getRoleDashboardPath } from "@/lib/utils";
import type { LoginRequest, LoginResponse, SignupRequest, SignupResponse } from "@/types/auth.types";

export function useAuth() {
  const navigate = useNavigate();
  const { setAuth, clearAuth } = useAuthStore();
  const login = useMutation({
    mutationFn: async (data: LoginRequest) => { const res = await api.post<LoginResponse>("/auth/login", data); return res.data; },
    onSuccess: (data) => { setAuth(data.user, data.token, data.tenant); navigate(getRoleDashboardPath(data.user.role)); },
  });
  const signup = useMutation({
    mutationFn: async (data: SignupRequest) => { const res = await api.post<SignupResponse>("/auth/signup", data); return res.data; },
    onSuccess: (data) => { setAuth(data.user, data.token, data.tenant); navigate(getRoleDashboardPath(data.user.role)); },
  });
  const logout = () => { clearAuth(); queryClient.clear(); navigate("/auth/login"); };
  return { login, signup, logout };
}
