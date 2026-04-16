import { useState, useMemo } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, Globe, Mail, Pencil, Trash2, Building2 } from "lucide-react";
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
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from "@/features/companies/hooks/useCompanies";
import { companyFormSchema, type CompanyFormData } from "@/features/companies/schemas/company.schema";
import { SkeletonCardGrid } from "@/components/shared/Skeletons";
import type { Company } from "@/types/company.types";

export default function CompanyManagement() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

  const { data, isLoading } = useCompanies();
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();
  const deleteMutation = useDeleteCompany();

  const companies = data?.data || [];
  const debouncedSearch = useDebounce(search);
  const filtered = useMemo(() => companies.filter(c => c.name.toLowerCase().includes(debouncedSearch.toLowerCase())), [companies, debouncedSearch]);

  const form = useForm<CompanyFormData>({ resolver: zodResolver(companyFormSchema) });

  const openCreate = () => { setEditing(null); form.reset({ name: "", industry: "", website: "", description: "", contact: { name: "", email: "", phone: "" } }); setFormOpen(true); };
  const openEdit = (c: Company) => { setEditing(c); form.reset({ name: c.name, industry: c.industry, website: c.website || "", description: c.description || "", contact: c.contact }); setFormOpen(true); };

  const onSubmit = form.handleSubmit(async (data) => {
    if (editing) { await updateMutation.mutateAsync({ id: editing.id, ...data } as any); }
    else { await createMutation.mutateAsync(data as any); }
    setFormOpen(false);
  });

  const onDelete = async () => { if (deleteTarget) { await deleteMutation.mutateAsync(deleteTarget.id); setDeleteTarget(null); } };
  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <FadeIn><PageHeader title="Company Management" description="Manage companies and employer partnerships" actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Company</Button>} /></FadeIn>
      <FadeIn delay={0.1}><div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search companies..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div></FadeIn>

      {isLoading ? (<SkeletonCardGrid count={6} />
      ) : filtered.length === 0 ? (<EmptyState icon={Building2} title="No companies found" description="Add companies to start creating drives" actionLabel="Add Company" onAction={openCreate} />
      ) : (<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((company, i) => (
        <FadeIn key={company.id} delay={i * 0.05}><Card className="group hover:shadow-lg transition-all"><CardContent className="p-5">
          <div className="flex items-start justify-between mb-4"><div className="flex items-center gap-3"><div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">{company.name[0]}</div><div><h3 className="font-semibold">{company.name}</h3><Badge variant="outline" className="text-[10px] mt-0.5">{company.industry}</Badge></div></div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(company)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(company)}><Trash2 className="h-3.5 w-3.5" /></Button></div></div>
          <div className="space-y-2 text-sm text-muted-foreground"><div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /><span className="truncate">{company.contact.email}</span></div>{company.website && <div className="flex items-center gap-2"><Globe className="h-3.5 w-3.5" /><span className="truncate">{company.website}</span></div>}</div>
          <div className="mt-3 pt-3 border-t"><span className="text-xs text-muted-foreground">{company.drivesCount} drives conducted</span></div>
        </CardContent></Card></FadeIn>
      ))}</div>)}

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? "Edit Company" : "Add Company"}</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Company Name</Label><Input {...form.register("name")} placeholder="e.g. Google" />{form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}</div>
              <div className="space-y-2"><Label>Industry</Label><Input {...form.register("industry")} placeholder="e.g. Technology" />{form.formState.errors.industry && <p className="text-xs text-destructive">{form.formState.errors.industry.message}</p>}</div>
            </div>
            <div className="space-y-2"><Label>Website</Label><Input {...form.register("website")} placeholder="https://example.com" /></div>
            <div className="space-y-2"><Label>Description</Label><Input {...form.register("description")} placeholder="Brief description..." /></div>
            <h4 className="text-sm font-semibold pt-2 border-t">Contact Person</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Contact Name</Label><Input {...form.register("contact.name")} placeholder="John Doe" />{form.formState.errors.contact?.name && <p className="text-xs text-destructive">{form.formState.errors.contact.name.message}</p>}</div>
              <div className="space-y-2"><Label>Contact Email</Label><Input {...form.register("contact.email")} placeholder="john@company.com" type="email" />{form.formState.errors.contact?.email && <p className="text-xs text-destructive">{form.formState.errors.contact.email.message}</p>}</div>
            </div>
            <div className="space-y-2"><Label>Phone (optional)</Label><Input {...form.register("contact.phone")} placeholder="+91 98765 43210" /></div>
            <DialogFooter><Button variant="outline" type="button" onClick={() => setFormOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)} title="Delete Company" description={`Are you sure you want to delete "${deleteTarget?.name}"? All associated drives will also be removed.`} onConfirm={onDelete} loading={deleteMutation.isPending} />
    </div>
  );
}
