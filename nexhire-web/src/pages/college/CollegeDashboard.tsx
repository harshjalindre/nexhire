import { GraduationCap, Briefcase, Building2, FileCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { FadeIn } from "@/components/animations/FadeIn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";

export default function CollegeDashboard() {
  const { user, tenant } = useAuthStore();
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <FadeIn><Card className="overflow-hidden border-0 gradient-primary text-white"><CardContent className="p-6 sm:p-8"><div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"><div><h1 className="text-2xl font-bold">Welcome back, {user?.name}! 👋</h1><p className="text-white/80 mt-1">{tenant?.name} - Placement Portal</p></div><Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0" onClick={() => navigate("/college/drives")}>Manage Drives</Button></div></CardContent></Card></FadeIn>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[{ title: "Total Students", value: "1,234", change: 5, icon: GraduationCap, trend: "up" as const }, { title: "Active Drives", value: "12", change: 33, icon: Briefcase, trend: "up" as const }, { title: "Companies", value: "45", change: 10, icon: Building2, trend: "up" as const }, { title: "Applications", value: "3,456", change: 18, icon: FileCheck, trend: "up" as const }].map((stat, i) => (<FadeIn key={stat.title} delay={i * 0.1}><StatCard {...stat} /></FadeIn>))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn delay={0.3}><Card><CardHeader className="flex-row items-center justify-between"><CardTitle className="text-lg">Upcoming Drives</CardTitle><Button variant="ghost" size="sm" onClick={() => navigate("/college/drives")}>View All</Button></CardHeader><CardContent><div className="space-y-3">
          {[{ company: "Google", role: "SDE Intern", date: "Apr 20, 2026", apps: 145, status: "active" }, { company: "Microsoft", role: "PM Intern", date: "Apr 25, 2026", apps: 89, status: "active" }, { company: "Amazon", role: "SDE Full-time", date: "May 1, 2026", apps: 0, status: "draft" }].map((drive) => (
            <div key={drive.company} className="flex items-center gap-4 rounded-lg border p-3 hover:bg-accent/50 transition-colors cursor-pointer"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary text-sm">{drive.company[0]}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{drive.company} - {drive.role}</p><p className="text-xs text-muted-foreground">{drive.date} • {drive.apps} applications</p></div><Badge variant={drive.status === "active" ? "success" : "secondary"}>{drive.status}</Badge></div>
          ))}</div></CardContent></Card></FadeIn>
        <FadeIn delay={0.4}><Card><CardHeader><CardTitle className="text-lg">Recent Applications</CardTitle></CardHeader><CardContent><div className="space-y-3">
          {[{ student: "Priya Sharma", drive: "Google SDE", status: "shortlisted", time: "2h ago" }, { student: "Rahul Kumar", drive: "Microsoft PM", status: "applied", time: "4h ago" }, { student: "Ananya Patel", drive: "Google SDE", status: "interview", time: "6h ago" }, { student: "Vikram Singh", drive: "Amazon SDE", status: "offered", time: "1d ago" }].map((app) => (
            <div key={app.student} className="flex items-center gap-3 pb-3 border-b last:border-0 last:pb-0"><div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{app.student.split(" ").map(n => n[0]).join("")}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium">{app.student}</p><p className="text-xs text-muted-foreground">{app.drive} • {app.time}</p></div><Badge variant={app.status === "offered" ? "success" : app.status === "interview" ? "warning" : "secondary"} className="text-[10px]">{app.status}</Badge></div>
          ))}</div></CardContent></Card></FadeIn>
      </div>
    </div>
  );
}
