import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { useAuthStore } from "@/stores/authStore";
import { NAV_ITEMS, type Role } from "@/lib/constants";

// #23 — Working search: navigates to matching pages
function TopbarSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const items = useMemo(() => (user?.role ? NAV_ITEMS[user.role as Role] || [] : []), [user]);
  const results = useMemo(() => query.length > 0 ? items.filter(i => i.label.toLowerCase().includes(query.toLowerCase())) : [], [query, items]);

  return (
    <div className="relative flex-1 max-w-md hidden md:block">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input placeholder="Search pages..." className="pl-9 bg-muted/50 border-0 focus-visible:ring-1" value={query} onChange={(e) => { setQuery(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 200)} />
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-popover border rounded-lg shadow-lg z-50 py-1">
          {results.map(r => (
            <button key={r.path} className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2" onClick={() => { navigate(r.path); setQuery(""); setOpen(false); }}>
              <r.icon className="h-4 w-4 text-muted-foreground" />{r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface TopbarProps { onMenuClick: () => void; }

export function Topbar({ onMenuClick }: TopbarProps) {
  const { tenant } = useAuthStore();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-lg px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}><Menu className="h-5 w-5" /></Button>
      <TopbarSearch />
      <div className="flex-1" />
      {tenant && (<div className="hidden sm:flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1"><div className="h-2 w-2 rounded-full bg-primary animate-pulse" /><span className="text-xs font-medium text-primary">{tenant.name}</span></div>)}
      <NotificationBell />
      <ThemeToggle />
    </header>
  );
}
