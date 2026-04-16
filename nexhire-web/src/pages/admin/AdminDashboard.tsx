import { Building2, GraduationCap, Briefcase, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { FadeIn } from "@/components/animations/FadeIn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  return (
    <div className="space-y-6">
      <FadeIn><PageHeader title={`Welcome back, ${user?.name || "Admin"} 👋`} description="Here's an overview of the NexHire platform" /></FadeIn>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[{ title: "Total Tenants", value: "48", change: 12, icon: Building2, trend: "up" as const }, { title: "Total Students", value: "12,847", change: 8, icon: GraduationCap, trend: "up" as const }, { title: "Active Drives", value: "156", change: 23, icon: Briefcase, trend: "up" as const }, { title: "Placement Rate", value: "78%", change: 5, icon: TrendingUp, trend: "up" as const }].map((stat, i) => (<FadeIn key={stat.title} delay={i * 0.1}><StatCard {...stat} /></FadeIn>))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn delay={0.3}><Card><CardHeader><CardTitle className="text-lg">Recent Activity</CardTitle></CardHeader><CardContent><div className="space-y-4">
          {[{ action: "New tenant registered", detail: "IIT Bombay - IITB2024", time: "2 hours ago" }, { action: "Drive completed", detail: "Google SDE Internship at MIT", time: "5 hours ago" }, { action: "Bulk upload completed", detail: "3,200 students at VIT Pune", time: "1 day ago" }, { action: "New company onboarded", detail: "Amazon Web Services", time: "2 days ago" }].map((item, i) => (
            <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0"><div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" /><div><p className="text-sm font-medium">{item.action}</p><p className="text-xs text-muted-foreground">{item.detail}</p><p className="text-xs text-muted-foreground mt-0.5">{item.time}</p></div></div>
          ))}</div></CardContent></Card></FadeIn>
        <FadeIn delay={0.4}><Card><CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-2">
          {[{ label: "Add Tenant", desc: "Register a new college", icon: "🏫" }, { label: "View Reports", desc: "Platform analytics", icon: "📊" }, { label: "Manage Users", desc: "User administration", icon: "👥" }, { label: "System Settings", desc: "Configure platform", icon: "⚙️" }].map((action) => (
            <button key={action.label} className="flex items-center gap-3 rounded-lg border p-3 text-left hover:bg-accent transition-colors"><span className="text-2xl">{action.icon}</span><div><p className="text-sm font-medium">{action.label}</p><p className="text-xs text-muted-foreground">{action.desc}</p></div></button>
          ))}</div></CardContent></Card></FadeIn>
      </div>
    </div>
  );
}
