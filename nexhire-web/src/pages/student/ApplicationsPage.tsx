import { useState } from "react";
import { FileCheck, XCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { FadeIn } from "@/components/animations/FadeIn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApplications, useWithdrawApplication } from "@/features/applications/hooks/useApplications";
import { SkeletonListRows } from "@/components/shared/Skeletons";
import { formatDate } from "@/lib/utils";
import type { ApplicationStatus } from "@/types/application.types";

const statusConfig: Record<ApplicationStatus, { variant: "default" | "secondary" | "success" | "warning" | "destructive"; label: string }> = {
  applied: { variant: "secondary", label: "Applied" }, shortlisted: { variant: "default", label: "Shortlisted" },
  interview: { variant: "warning", label: "Interview" }, offered: { variant: "success", label: "Offered 🎉" },
  rejected: { variant: "destructive", label: "Rejected" }, withdrawn: { variant: "secondary", label: "Withdrawn" },
};

export default function ApplicationsPage() {
  const [tab, setTab] = useState("all");
  const { data, isLoading } = useApplications(tab === "all" ? undefined : { status: tab });
  const withdrawMutation = useWithdrawApplication();
  const applications = data?.data || [];
  return (
    <div className="space-y-6">
      <FadeIn><PageHeader title="My Applications" description="Track your application progress" /></FadeIn>
      <FadeIn delay={0.1}><Tabs defaultValue="all" onValueChange={setTab}>
        <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="applied">Applied</TabsTrigger><TabsTrigger value="shortlisted">Shortlisted</TabsTrigger><TabsTrigger value="interview">Interview</TabsTrigger><TabsTrigger value="offered">Offered</TabsTrigger></TabsList>
        <TabsContent value={tab} className="mt-4">
          {isLoading ? (<SkeletonListRows count={4} />
          ) : applications.length === 0 ? (<EmptyState icon={FileCheck} title="No applications yet" description="Start applying to drives to see your applications here" />
          ) : (<div className="space-y-3">{applications.map((app, i) => (
            <FadeIn key={app.id} delay={i * 0.05}><Card className="hover:shadow-md transition-all"><CardContent className="p-4"><div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0"><div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">{app.companyName[0]}</div><div className="min-w-0"><h3 className="font-semibold truncate">{app.driveTitle}</h3><p className="text-sm text-muted-foreground">{app.companyName} • {app.packageLpa} LPA</p><p className="text-xs text-muted-foreground mt-0.5">Applied {formatDate(app.appliedAt)}</p></div></div>
              <div className="flex items-center gap-1.5 flex-wrap">{app.roundStatuses.map((round, ri) => (<div key={round.roundId} className="flex items-center gap-1"><div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${round.status === "passed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200" : round.status === "failed" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200" : round.status === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200" : "bg-muted text-muted-foreground"}`} title={round.roundName}>{ri + 1}</div>{ri < app.roundStatuses.length - 1 && <div className="w-3 h-0.5 bg-muted" />}</div>))}</div>
              <div className="flex items-center gap-2"><Badge variant={statusConfig[app.status]?.variant || "secondary"}>{statusConfig[app.status]?.label || app.status}</Badge>{app.status === "applied" && (<Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => withdrawMutation.mutate(app.id)}><XCircle className="h-4 w-4" /></Button>)}</div>
            </div></CardContent></Card></FadeIn>
          ))}</div>)}
        </TabsContent>
      </Tabs></FadeIn>
    </div>
  );
}
