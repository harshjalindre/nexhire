import { useState } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Search, Filter, Calendar, IndianRupee, Clock, LayoutGrid, List, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useDrives, useApplyToDrive } from "@/features/drives/hooks/useDrives";
import { SkeletonCardGrid, SkeletonListRows } from "@/components/shared/Skeletons";
import { Pagination } from "@/components/shared/Pagination";
import { formatDate } from "@/lib/utils";

// #24 — Per-drive apply button so only the clicked one shows loading
function ApplyButton({ driveId, viewMode }: { driveId: string; viewMode: string }) {
  const applyMutation = useApplyToDrive();
  return (
    <Button size={viewMode === "list" ? "sm" : "default"} className={viewMode === "grid" ? "w-full" : ""} onClick={() => applyMutation.mutate(driveId)} disabled={applyMutation.isPending}>
      {applyMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Applying...</> : "Apply Now"}
    </Button>
  );
}

export default function DriveListingPage() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);
  const { data, isLoading } = useDrives({ search: debouncedSearch, status: "active", page, limit: 9 });
  const drives = data?.data || [];
  return (
    <div className="space-y-6">
      <FadeIn><PageHeader title="Available Drives" description="Explore and apply to placement opportunities" /></FadeIn>
      <FadeIn delay={0.1}><div className="flex flex-col sm:flex-row items-start sm:items-center gap-4"><div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search companies or roles..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div><div className="flex items-center gap-2"><Button variant="outline" size="icon" onClick={() => setViewMode("grid")} className={viewMode === "grid" ? "bg-accent" : ""}><LayoutGrid className="h-4 w-4" /></Button><Button variant="outline" size="icon" onClick={() => setViewMode("list")} className={viewMode === "list" ? "bg-accent" : ""}><List className="h-4 w-4" /></Button></div></div></FadeIn>
      {isLoading ? (viewMode === "grid" ? <SkeletonCardGrid count={6} /> : <SkeletonListRows count={5} />
      ) : drives.length === 0 ? (<EmptyState icon={Filter} title="No drives available" description="Check back later for new placement opportunities" />
      ) : (<>
        <div className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "grid gap-3"}>{drives.map((drive, i) => (
          <FadeIn key={drive.id} delay={i * 0.05}><Card className="group hover:shadow-lg transition-all overflow-hidden"><CardContent className={viewMode === "list" ? "p-4 flex items-center gap-4" : "p-5"}>
            <div className={`flex items-center gap-3 ${viewMode === "list" ? "flex-1" : "mb-4"}`}><div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-lg shrink-0">{drive.companyName[0]}</div><div className="min-w-0"><h3 className="font-semibold truncate">{drive.title}</h3><p className="text-sm text-muted-foreground">{drive.companyName}</p></div></div>
            {viewMode === "grid" && (<><div className="flex flex-wrap gap-1.5 mb-3">{drive.branches.slice(0, 3).map(b => <Badge key={b} variant="outline" className="text-[10px]">{b}</Badge>)}</div><div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-4"><span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />{drive.packageLpa} LPA</span><span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(drive.endDate)}</span><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{drive.rounds.length} rounds</span><span>CGPA ≥ {drive.minCgpa}</span></div></>)}
            <ApplyButton driveId={drive.id} viewMode={viewMode} />
          </CardContent></Card></FadeIn>
        ))}</div>
        <Pagination page={page} totalPages={data?.totalPages || 1} total={data?.total} pageSize={9} onPageChange={setPage} />
      </>)}
    </div>
  );
}
