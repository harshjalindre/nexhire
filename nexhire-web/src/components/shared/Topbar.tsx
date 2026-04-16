import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { useAuthStore } from "@/stores/authStore";

interface TopbarProps { onMenuClick: () => void; }

export function Topbar({ onMenuClick }: TopbarProps) {
  const { tenant } = useAuthStore();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-lg px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}><Menu className="h-5 w-5" /></Button>
      <div className="relative flex-1 max-w-md hidden md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search anything..." className="pl-9 bg-muted/50 border-0 focus-visible:ring-1" />
      </div>
      <div className="flex-1" />
      {tenant && (<div className="hidden sm:flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1"><div className="h-2 w-2 rounded-full bg-primary animate-pulse" /><span className="text-xs font-medium text-primary">{tenant.name}</span></div>)}
      <NotificationBell />
      <ThemeToggle />
    </header>
  );
}
