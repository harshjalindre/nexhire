import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Briefcase, Users, CheckCircle, TrendingUp, XCircle, UserCheck, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FadeIn } from "@/components/animations/FadeIn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkeletonStatCards, SkeletonDashboardCards } from "@/components/shared/Skeletons";
import { api } from "@/lib/api";

function useRecruiterDashboard() {
  return useQuery({ queryKey: ["recruiter-dashboard"], queryFn: () => api.get("/recruiter/dashboard").then(r => r.data) });
}

const statusColor: Record<string, string> = { applied: "bg-blue-100 text-blue-700", shortlisted: "bg-amber-100 text-amber-700", selected: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };

export default function RecruiterDashboard() {
  const { data, isLoading } = useRecruiterDashboard();
  const navigate = useNavigate();
  const stats = data?.stats;

  const statCards = stats ? [
    { label: "Total Drives", value: stats.totalDrives, icon: Briefcase, color: "text-blue-500" },
    { label: "Applications", value: stats.totalApplications, icon: Users, color: "text-green-500" },
    { label: "Shortlisted", value: stats.shortlisted, icon: UserCheck, color: "text-amber-500" },
    { label: "Selected", value: stats.selected, icon: CheckCircle, color: "text-emerald-500" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-500" },
    { label: "Conversion", value: `${stats.conversionRate}%`, icon: TrendingUp, color: "text-purple-500" },
  ] : [];

  return (
    <div className="space-y-6">
      <FadeIn><PageHeader title="Recruiter Dashboard" description="Manage your drives and review candidates">
        <Button onClick={() => navigate("/recruiter/drives/new")}><Briefcase className="h-4 w-4 mr-2" />Post New Drive</Button>
      </PageHeader></FadeIn>

      {isLoading ? <SkeletonStatCards /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.05}>
              <Card><CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold mt-1">{s.value}</p></div><s.icon className={`h-5 w-5 ${s.color}`} /></div></CardContent></Card>
            </FadeIn>
          ))}
        </div>
      )}

      {isLoading ? <SkeletonDashboardCards /> : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Drives */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">Your Drives</CardTitle><Button variant="ghost" size="sm" onClick={() => navigate("/recruiter/drives")}>View All <ArrowRight className="h-3 w-3 ml-1" /></Button></CardHeader>
            <CardContent className="space-y-3">
              {(data?.recentDrives || []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No drives yet. Post your first drive!</p>
              ) : (data?.recentDrives || []).map((d: any) => (
                <div key={d.id} className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate(`/recruiter/drives/${d.id}/applicants`)}>
                  <div><p className="font-medium text-sm">{d.title}</p><p className="text-xs text-muted-foreground">{d.companyName}</p></div>
                  <div className="flex items-center gap-2"><Badge variant="outline">{d.applicationsCount} apps</Badge><Badge variant={d.status === "active" ? "default" : "secondary"}>{d.status}</Badge></div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pipeline */}
          <Card>
            <CardHeader><CardTitle className="text-base">Hiring Pipeline</CardTitle></CardHeader>
            <CardContent>
              {(data?.pipeline || []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No applications yet</p>
              ) : (
                <div className="space-y-3">
                  {(data?.pipeline || []).map((p: any) => (
                    <div key={p.status} className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[p.status] || "bg-muted"}`}>{p.status}</span>
                      <div className="flex-1 bg-muted rounded-full h-3"><div className="h-3 rounded-full bg-primary transition-all" style={{ width: `${stats && stats.totalApplications > 0 ? Math.round((p.count / stats.totalApplications) * 100) : 0}%` }} /></div>
                      <span className="text-sm font-medium w-8 text-right">{p.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
