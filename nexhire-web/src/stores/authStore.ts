import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Tenant } from "@/types/auth.types";

interface AuthState {
  user: User | null; token: string | null; tenant: Tenant | null; isAuthenticated: boolean;
  setAuth: (user: User, token: string, tenant: Tenant) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, token: null, tenant: null, isAuthenticated: false,
      setAuth: (user, token, tenant) => set({ user, token, tenant, isAuthenticated: true }),
      clearAuth: () => set({ user: null, token: null, tenant: null, isAuthenticated: false }),
    }),
    { name: "nexhire-auth" }
  )
);
