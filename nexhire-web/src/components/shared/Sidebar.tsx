import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { useAuthStore } from "@/stores/authStore";
import { NAV_ITEMS, type Role } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";

interface SidebarProps { collapsed: boolean; onToggle: () => void; }

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const navItems = user ? NAV_ITEMS[user.role as Role] || [] : [];
  const handleLogout = () => { clearAuth(); navigate("/auth/login"); };

  return (
    <aside className={cn("fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-card transition-all duration-300", collapsed ? "w-[68px]" : "w-64")}>
      <div className="flex h-16 items-center justify-between px-4">
        <Logo size="sm" showText={!collapsed} />
        <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 rounded-full hidden lg:flex">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === "/admin" || item.path === "/college" || item.path === "/student"}
            className={({ isActive }) => cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground", collapsed && "justify-center px-2")}>
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      <Separator />
      <div className={cn("p-3", collapsed ? "flex flex-col items-center gap-2" : "")}>
        {user && (
          <div className={cn("flex items-center gap-3 rounded-lg p-2", collapsed && "flex-col")}>
            <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback></Avatar>
            {!collapsed && (<div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{user.name}</p><p className="text-xs text-muted-foreground truncate">{user.email}</p></div>)}
          </div>
        )}
        <Button variant="ghost" size={collapsed ? "icon" : "sm"} onClick={handleLogout} className={cn("text-muted-foreground hover:text-destructive", !collapsed && "w-full justify-start gap-2 mt-1")}>
          <LogOut className="h-4 w-4" />{!collapsed && "Logout"}
        </Button>
      </div>
    </aside>
  );
}
