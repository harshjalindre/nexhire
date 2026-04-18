import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, XCircle, UserCheck, FileText, Mail, Download, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkeletonListRows } from "@/components/shared/Skeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { toast } from "sonner";
import { api } from "@/lib/api";

const statusStyles: Record<string, string> = { applied: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300", shortlisted: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300", selected: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" };

export default function ApplicantReview() {
  const { driveId } = useParams<{ driveId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ["applicants", driveId, statusFilter, page],
    queryFn: () => api.get(`/recruiter/drives/${driveId}/applicants`, { params: { status: statusFilter, page, limit: 10 } }).then(r => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/recruiter/applications/${id}`, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["applicants"] }); queryClient.invalidateQueries({ queryKey: ["recruiter"] }); toast.success("Status updated"); },
  });

  const bulkUpdate = useMutation({
    mutationFn: (status: string) => api.patch("/recruiter/applications/bulk", { applicationIds: [...selected], status }),
    onSuccess: (_, status) => { queryClient.invalidateQueries({ queryKey: ["applicants"] }); setSelected(new Set()); toast.success(`${selected.size} applicants ${status}`); },
  });

  const toggleSelect = (id: string) => { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); };
  const toggleAll = () => { if (!data?.data) return; selected.size === data.data.length ? setSelected(new Set()) : setSelected(new Set(data.data.map((a: any) => a.id))); };

  const applicants = data?.data || [];

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center gap-3 mb-2"><Button variant="ghost" size="icon" onClick={() => navigate("/recruiter/drives")}><ArrowLeft className="h-4 w-4" /></Button></div>
        <PageHeader title={data?.drive?.title || "Drive Applicants"} description={`Review and manage candidates · ${data?.total || 0} total applicants`} />
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Tabs defaultValue="all" onValueChange={(v) => { setStatusFilter(v); setPage(1); setSelected(new Set()); }}>
            <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="applied">Applied</TabsTrigger><TabsTrigger value="shortlisted">Shortlisted</TabsTrigger><TabsTrigger value="selected">Selected</TabsTrigger><TabsTrigger value="rejected">Rejected</TabsTrigger></TabsList>
          </Tabs>
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{selected.size} selected</span>
              <Button size="sm" variant="outline" onClick={() => bulkUpdate.mutate("shortlisted")} disabled={bulkUpdate.isPending}><UserCheck className="h-3 w-3 mr-1" />Shortlist</Button>
              <Button size="sm" onClick={() => bulkUpdate.mutate("selected")} disabled={bulkUpdate.isPending}><CheckCircle className="h-3 w-3 mr-1" />Select</Button>
              <Button size="sm" variant="destructive" onClick={() => bulkUpdate.mutate("rejected")} disabled={bulkUpdate.isPending}><XCircle className="h-3 w-3 mr-1" />Reject</Button>
            </div>
          )}
        </div>
      </FadeIn>

      {isLoading ? <SkeletonListRows count={5} /> : applicants.length === 0 ? (
        <EmptyState icon={FileText} title="No applicants" description={statusFilter === "all" ? "No one has applied to this drive yet" : `No ${statusFilter} applicants`} />
      ) : (<>
        {/* Select all */}
        <div className="flex items-center gap-2 px-1"><input type="checkbox" checked={selected.size === applicants.length && applicants.length > 0} onChange={toggleAll} className="rounded" /><span className="text-xs text-muted-foreground">Select all on this page</span></div>

        <div className="grid gap-3">{applicants.map((app: any, i: number) => (
          <FadeIn key={app.id} delay={i * 0.03}>
            <Card className={`transition-all ${selected.has(app.id) ? "ring-2 ring-primary" : "hover:shadow-md"}`}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <input type="checkbox" checked={selected.has(app.id)} onChange={() => toggleSelect(app.id)} className="rounded shrink-0" />
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">{app.student.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}</div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{app.student.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{app.student.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div><span className="text-muted-foreground">Branch:</span> <span className="font-medium">{app.student.branch}</span></div>
                    <div><span className="text-muted-foreground">CGPA:</span> <span className="font-medium">{app.student.cgpa}</span></div>
                    <div><span className="text-muted-foreground">Year:</span> <span className="font-medium">{app.student.year}</span></div>
                    <div><span className="text-muted-foreground">Backlogs:</span> <span className="font-medium">{app.student.backlogs}</span></div>
                    {app.student.resumeUrl && <a href={app.student.resumeUrl} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="ghost" className="h-7 text-xs"><Download className="h-3 w-3 mr-1" />Resume</Button></a>}
                    <Badge className={statusStyles[app.status] || ""}>{app.status}</Badge>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {app.status !== "shortlisted" && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus.mutate({ id: app.id, status: "shortlisted" })} disabled={updateStatus.isPending}><UserCheck className="h-3 w-3" /></Button>}
                    {app.status !== "selected" && <Button size="sm" className="h-7 text-xs" onClick={() => updateStatus.mutate({ id: app.id, status: "selected" })} disabled={updateStatus.isPending}><CheckCircle className="h-3 w-3" /></Button>}
                    {app.status !== "rejected" && <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => updateStatus.mutate({ id: app.id, status: "rejected" })} disabled={updateStatus.isPending}><XCircle className="h-3 w-3" /></Button>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ))}</div>
        <Pagination page={page} totalPages={data?.totalPages || 1} total={data?.total} pageSize={10} onPageChange={setPage} />
      </>)}
    </div>
  );
}
