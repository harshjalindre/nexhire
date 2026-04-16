import { useState, useMemo } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, Pencil, Trash2, Building2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useTenants, useCreateTenant, useUpdateTenant, useDeleteTenant } from "@/features/tenants/hooks/useTenants";
import { tenantFormSchema, type TenantFormData } from "@/features/tenants/schemas/tenant.schema";
import { SkeletonCardGrid } from "@/components/shared/Skeletons";
import type { TenantDetail } from "@/types/tenant.types";

export default function TenantManagement() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TenantDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TenantDetail | null>(null);

  const { data, isLoading } = useTenants();
  const createMutation = useCreateTenant();
  const updateMutation = useUpdateTenant();
  const deleteMutation = useDeleteTenant();

  const tenants = data?.data || [];
  const debouncedSearch = useDebounce(search);
  const filtered = useMemo(() => tenants.filter((t) => t.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || t.code.toLowerCase().includes(debouncedSearch.toLowerCase())), [tenants, debouncedSearch]);

  const form = useForm<TenantFormData>({ resolver: zodResolver(tenantFormSchema) });

  const openCreate = () => { setEditing(null); form.reset({ name: "", code: "", adminEmail: "", tier: "basic" }); setFormOpen(true); };
  const openEdit = (t: TenantDetail) => { setEditing(t); form.reset({ name: t.name, code: t.code, adminEmail: t.adminEmail || "", tier: (t.tier as "basic" | "premium" | "enterprise") || "basic" }); setFormOpen(true); };

  const onSubmit = form.handleSubmit(async (data) => {
    if (editing) { await updateMutation.mutateAsync({ id: editing.id, ...data } as any); }
    else { await createMutation.mutateAsync(data as any); }
    setFormOpen(false);
  });

  const onDelete = async () => { if (deleteTarget) { await deleteMutation.mutateAsync(deleteTarget.id); setDeleteTarget(null); } };

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <FadeIn><PageHeader title="Tenant Management" description="Manage colleges and institutions on the platform" actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Tenant</Button>} /></FadeIn>
      <FadeIn delay={0.1}><div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search tenants..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div></FadeIn>

      {isLoading ? (<SkeletonCardGrid count={6} />
      ) : filtered.length === 0 ? (<EmptyState icon={Building2} title="No tenants found" description="Get started by adding your first college" actionLabel="Add Tenant" onAction={openCreate} />
      ) : (<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((tenant, i) => (
        <FadeIn key={tenant.id} delay={i * 0.05}><Card className="group"><CardContent className="p-6">
          <div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">{tenant.code.slice(0, 2)}</div><div><h3 className="font-semibold">{tenant.name}</h3><p className="text-xs text-muted-foreground">{tenant.code}</p></div></div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(tenant)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(tenant)}><Trash2 className="h-3.5 w-3.5" /></Button></div></div>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground"><span>{tenant.studentsCount} students</span><span>{tenant.drivesCount} drives</span></div>
          <div className="mt-3 flex items-center justify-between"><Badge variant={tenant.status === "active" ? "success" : "secondary"}>{tenant.status}</Badge><Badge variant="outline">{tenant.tier}</Badge></div>
        </CardContent></Card></FadeIn>
      ))}</div>)}

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editing ? "Edit Tenant" : "Add Tenant"}</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2"><Label>College Name</Label><Input {...form.register("name")} placeholder="e.g. MIT Pune" />{form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}</div>
            <div className="space-y-2"><Label>Code</Label><Input {...form.register("code")} placeholder="e.g. MIT2024" disabled={!!editing} />{form.formState.errors.code && <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>}</div>
            <div className="space-y-2"><Label>Admin Email</Label><Input {...form.register("adminEmail")} placeholder="admin@college.edu" type="email" />{form.formState.errors.adminEmail && <p className="text-xs text-destructive">{form.formState.errors.adminEmail.message}</p>}</div>
            <div className="space-y-2"><Label>Tier</Label><select {...form.register("tier")} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="basic">Basic</option><option value="premium">Premium</option><option value="enterprise">Enterprise</option></select></div>
            <DialogFooter><Button variant="outline" type="button" onClick={() => setFormOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)} title="Delete Tenant" description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`} onConfirm={onDelete} loading={deleteMutation.isPending} />
    </div>
  );
}
