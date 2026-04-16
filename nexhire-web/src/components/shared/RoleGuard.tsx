import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import type { Role } from "@/lib/constants";
interface RoleGuardProps { allowedRoles: Role[]; children: React.ReactNode; }
export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated || !user) return <Navigate to="/auth/login" replace />;
  if (!allowedRoles.includes(user.role as Role)) return (
    <div className="flex h-[60vh] items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2><p className="text-muted-foreground">You don't have permission to view this page.</p></div></div>
  );
  return <>{children}</>;
}
