import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/shared/Sidebar";
import { Topbar } from "@/components/shared/Topbar";
import { CookieConsent } from "@/components/shared/CookieConsent";
import { useAuthStore } from "@/stores/authStore";

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  return (
    <div className="min-h-screen bg-background">
      {mobileOpen && <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <div className="hidden lg:block"><Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} /></div>
      {mobileOpen && <div className="fixed inset-y-0 left-0 z-50 lg:hidden"><Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} /></div>}
      <div className={cn("transition-all duration-300", collapsed ? "lg:ml-[68px]" : "lg:ml-64")}>
        <Topbar onMenuClick={() => setMobileOpen(!mobileOpen)} />
        <main className="p-4 lg:p-6 min-h-[calc(100vh-4rem)]"><div className="mx-auto max-w-7xl"><Outlet /></div></main>
      </div>
      <CookieConsent />
    </div>
  );
}
