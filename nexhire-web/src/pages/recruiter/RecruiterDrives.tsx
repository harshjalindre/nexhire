import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Briefcase, Plus, Search, Users, Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonListRows } from "@/components/shared/Skeletons";
import { Pagination } from "@/components/shared/Pagination";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api";

export default function RecruiterDrives() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["recruiter-drives", debouncedSearch, status, page],
    queryFn: () => api.get("/recruiter/drives", { params: { search: debouncedSearch, status, page, limit: 10 } }).then(r => r.data),
  });

  const drives = data?.data || [];

  return (
    <div className="space-y-6">
      <FadeIn><PageHeader title="My Drives" description="Manage your placement drives and track applicants">
        <Button onClick={() => navigate("/recruiter/drives/new")}><Plus className="h-4 w-4 mr-2" />New Drive</Button>
      </PageHeader></FadeIn>

      <FadeIn delay={0.1}>
        <Tabs defaultValue="all" onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="active">Active</TabsTrigger><TabsTrigger value="draft">Draft</TabsTrigger><TabsTrigger value="closed">Closed</TabsTrigger></TabsList>
            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search drives..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
          </div>
        </Tabs>
      </FadeIn>

      {isLoading ? <SkeletonListRows count={5} /> : drives.length === 0 ? (
        <EmptyState icon={Briefcase} title="No drives yet" description="Post your first drive to start receiving applications" action={<Button onClick={() => navigate("/recruiter/drives/new")}><Plus className="h-4 w-4 mr-2" />Create Drive</Button>} />
      ) : (<>
        <div className="grid gap-3">{drives.map((drive: any, i: number) => (
          <FadeIn key={drive.id} delay={i * 0.03}>
            <Card className="hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0"><Briefcase className="h-5 w-5" /></div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{drive.title}</p>
                      <p className="text-xs text-muted-foreground">{drive.companyName} · {drive.companyIndustry}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="text-center"><p className="text-xs text-muted-foreground">Package</p><p className="font-medium text-xs">₹{drive.packageLpa} LPA</p></div>
                    <div className="text-center"><p className="text-xs text-muted-foreground">Deadline</p><p className="font-medium text-xs">{formatDate(drive.endDate)}</p></div>
                    <Badge variant="outline" className="gap-1"><Users className="h-3 w-3" />{drive.applicationsCount}</Badge>
                    <Badge variant={drive.status === "active" ? "default" : "secondary"}>{drive.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/recruiter/drives/${drive.id}/applicants`)}><Eye className="h-3 w-3 mr-1" />Review</Button>
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
