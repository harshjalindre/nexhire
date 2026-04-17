import { useQuery } from "@tanstack/react-query";
import { Briefcase, Users, CheckCircle, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FadeIn } from "@/components/animations/FadeIn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonStatCards, SkeletonDashboardCards } from "@/components/shared/Skeletons";
import { api } from "@/lib/api";

function useRecruiterStats() {
  return useQuery({ queryKey: ["recruiter-dashboard"], queryFn: () => api.get("/analytics/dashboard").then(r => r.data) });
}

export default function RecruiterDashboard() {
  const { data, isLoading } = useRecruiterStats();
  const stats = data?.stats;

  const statCards = stats ? [
    { label: "Active Drives", value: stats.activeDrives, icon: Briefcase, color: "text-blue-500" },
    { label: "Total Applications", value: stats.totalApplications, icon: Users, color: "text-green-500" },
    { label: "Students Placed", value: stats.placedStudents, icon: CheckCircle, color: "text-purple-500" },
    { label: "Placement Rate", value: `${stats.placementRate}%`, icon: TrendingUp, color: "text-amber-500" },
  ] : [];

  return (
    <div className="space-y-6">
      <FadeIn><PageHeader title="Recruiter Dashboard" description="Track your drives and candidates" /></FadeIn>

      {isLoading ? <SkeletonStatCards /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.05}>
              <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-2xl font-bold mt-1">{s.value}</p></div><div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}><s.icon className="h-5 w-5" /></div></div></CardContent></Card>
            </FadeIn>
          ))}
        </div>
      )}

      {isLoading ? <SkeletonDashboardCards /> : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Recent Drives</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(data?.recentDrives || []).map((d: any) => (
                <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div><p className="font-medium text-sm">{d.title}</p><p className="text-xs text-muted-foreground">{d.companyName}</p></div>
                  <div className="flex items-center gap-2"><Badge variant="outline">{d.applicationsCount} apps</Badge><Badge variant={d.status === "active" ? "success" : "secondary"}>{d.status}</Badge></div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Top Companies</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(data?.topCompanies || []).map((c: any) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3"><div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">{c.name[0]}</div><div><p className="font-medium text-sm">{c.name}</p><p className="text-xs text-muted-foreground">{c.industry}</p></div></div>
                  <Badge variant="outline">{c.drivesCount} drives</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
