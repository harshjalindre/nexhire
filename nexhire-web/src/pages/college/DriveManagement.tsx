import { useState } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, Filter, Calendar, IndianRupee, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useDrives, useCreateDrive, useUpdateDrive, useDeleteDrive } from "@/features/drives/hooks/useDrives";
import { useCompanies } from "@/features/companies/hooks/useCompanies";
import { driveFormSchema, type DriveFormData } from "@/features/drives/schemas/drive.schema";
import { SkeletonCardGrid } from "@/components/shared/Skeletons";
import { Pagination } from "@/components/shared/Pagination";
import { formatDate } from "@/lib/utils";
import { BRANCHES } from "@/lib/constants";
import type { Drive } from "@/types/drive.types";

export default function DriveManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Drive | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Drive | null>(null);

  const debouncedSearch = useDebounce(search);
  const { data, isLoading } = useDrives({ status: statusFilter === "all" ? undefined : statusFilter, search: debouncedSearch, page, limit: 9 });
  const { data: companiesData } = useCompanies();
  const createMutation = useCreateDrive();
  const updateMutation = useUpdateDrive();
  const deleteMutation = useDeleteDrive();

  const drives = data?.data || [];
  const companies = companiesData?.data || [];
  const statusColors: Record<string, "success" | "warning" | "secondary" | "destructive"> = { active: "success", draft: "secondary", closed: "warning", completed: "destructive" };

  const form = useForm<DriveFormData>({ resolver: zodResolver(driveFormSchema) });
  const openCreate = () => { setEditing(null); form.reset({ title: "", companyId: "", description: "", branches: [], minCgpa: 7, maxBacklogs: 0, packageLpa: 10, startDate: "", endDate: "", status: "draft" }); setFormOpen(true); };
  const openEdit = (d: Drive) => { setEditing(d); form.reset({ title: d.title, companyId: d.companyId, description: d.description, branches: d.branches, minCgpa: d.minCgpa, maxBacklogs: d.maxBacklogs, packageLpa: d.packageLpa, startDate: d.startDate?.slice(0, 10), endDate: d.endDate?.slice(0, 10), status: d.status as any }); setFormOpen(true); };

  const onSubmit = form.handleSubmit(async (data) => {
    if (editing) { await updateMutation.mutateAsync({ id: editing.id, ...data } as any); }
    else { await createMutation.mutateAsync(data as any); }
    setFormOpen(false);
  });
  const onDelete = async () => { if (deleteTarget) { await deleteMutation.mutateAsync(deleteTarget.id); setDeleteTarget(null); } };
  const saving = createMutation.isPending || updateMutation.isPending;

  const [branchInput, setBranchInput] = useState("");
  const watchBranches = form.watch("branches") || [];
  const addBranch = (b: string) => { if (b && !watchBranches.includes(b)) form.setValue("branches", [...watchBranches, b]); setBranchInput(""); };
  const removeBranch = (b: string) => form.setValue("branches", watchBranches.filter((x: string) => x !== b));

  return (
    <div className="space-y-6">
      <FadeIn><PageHeader title="Drive Management" description="Create and manage placement drives" actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Create Drive</Button>} /></FadeIn>
      <FadeIn delay={0.1}>
        <Tabs defaultValue="all" onValueChange={setStatusFilter}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="active">Active</TabsTrigger><TabsTrigger value="draft">Draft</TabsTrigger><TabsTrigger value="closed">Closed</TabsTrigger></TabsList>
            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search drives..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          </div>
          <TabsContent value={statusFilter} className="mt-4">
            {isLoading ? (<SkeletonCardGrid count={6} />
            ) : drives.length === 0 ? (<EmptyState icon={Filter} title="No drives found" description="Create your first placement drive" actionLabel="Create Drive" onAction={openCreate} />
            ) : (<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{drives.map((drive, i) => (
              <FadeIn key={drive.id} delay={i * 0.05}><Card className="group hover:shadow-lg transition-all"><CardContent className="p-5">
                <div className="flex items-start justify-between mb-3"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">{drive.companyName?.[0]}</div><div><h3 className="font-semibold text-sm">{drive.title}</h3><p className="text-xs text-muted-foreground">{drive.companyName}</p></div></div>
                  <div className="flex items-center gap-1"><Badge variant={statusColors[drive.status] || "secondary"}>{drive.status}</Badge><Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => openEdit(drive)}><Pencil className="h-3 w-3" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => setDeleteTarget(drive)}><Trash2 className="h-3 w-3" /></Button></div></div>
                <div className="flex flex-wrap gap-1.5 mb-3">{(drive.branches || []).slice(0, 3).map((b: string) => <Badge key={b} variant="outline" className="text-[10px]">{b}</Badge>)}{(drive.branches || []).length > 3 && <Badge variant="outline" className="text-[10px]">+{drive.branches.length - 3}</Badge>}</div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />{drive.packageLpa} LPA</span><span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(drive.endDate)}</span></div>
                <div className="mt-3 pt-3 border-t flex items-center justify-between"><span className="text-xs text-muted-foreground">{drive.applicationsCount} apps</span><span className="text-xs text-muted-foreground">CGPA ≥ {drive.minCgpa}</span></div>
              </CardContent></Card></FadeIn>
            ))}</div>)}
          </TabsContent>
        </Tabs>
        <Pagination page={page} totalPages={data?.totalPages || 1} total={data?.total} pageSize={9} onPageChange={(p) => setPage(p)} />
      </FadeIn>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? "Edit Drive" : "Create Drive"}</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Title</Label><Input {...form.register("title")} placeholder="SDE Intern 2026" /></div>
              <div className="space-y-2"><Label>Company</Label><select {...form.register("companyId")} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="">Select company</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Input {...form.register("description")} placeholder="Drive description..." /></div>
            <div className="space-y-2"><Label>Branches</Label><div className="flex gap-2"><select value={branchInput} onChange={(e) => { addBranch(e.target.value); }} className="flex h-10 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="">Add branch...</option>{BRANCHES.filter(b => !watchBranches.includes(b)).map(b => <option key={b} value={b}>{b}</option>)}</select></div><div className="flex flex-wrap gap-1.5 mt-1">{watchBranches.map((b: string) => <Badge key={b} variant="secondary" className="cursor-pointer" onClick={() => removeBranch(b)}>{b} ×</Badge>)}</div></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Min CGPA</Label><Input type="number" step="0.1" {...form.register("minCgpa", { valueAsNumber: true })} /></div>
              <div className="space-y-2"><Label>Max Backlogs</Label><Input type="number" {...form.register("maxBacklogs", { valueAsNumber: true })} /></div>
              <div className="space-y-2"><Label>Package (LPA)</Label><Input type="number" step="0.5" {...form.register("packageLpa", { valueAsNumber: true })} /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Start Date</Label><Input type="date" {...form.register("startDate")} /></div>
              <div className="space-y-2"><Label>End Date</Label><Input type="date" {...form.register("endDate")} /></div>
            </div>
            <div className="space-y-2"><Label>Status</Label><select {...form.register("status")} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="draft">Draft</option><option value="active">Active</option><option value="closed">Closed</option></select></div>
            <DialogFooter><Button variant="outline" type="button" onClick={() => setFormOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)} title="Delete Drive" description={`Delete "${deleteTarget?.title}"? All applications will be lost.`} onConfirm={onDelete} loading={deleteMutation.isPending} />
    </div>
  );
}
