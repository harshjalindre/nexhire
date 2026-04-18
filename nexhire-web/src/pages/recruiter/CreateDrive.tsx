import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/lib/api";

const BRANCHES = ["Computer Science", "Information Technology", "Electronics", "Electrical", "Mechanical", "Civil", "Chemical", "Biotech"];

export default function CreateDrive() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "", description: "", branches: [] as string[], minCgpa: "6", maxBacklogs: "0",
    packageLpa: "", startDate: "", endDate: "", status: "draft",
  });

  const mutation = useMutation({
    mutationFn: (data: typeof form) => api.post("/recruiter/drives", { ...data, minCgpa: Number(data.minCgpa), maxBacklogs: Number(data.maxBacklogs), packageLpa: Number(data.packageLpa), branches: data.branches }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["recruiter"] }); toast.success("Drive created!"); navigate("/recruiter/drives"); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create drive"),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });
  const toggleBranch = (b: string) => setForm({ ...form, branches: form.branches.includes(b) ? form.branches.filter(x => x !== b) : [...form.branches, b] });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.packageLpa || !form.startDate || !form.endDate) { toast.error("Fill all required fields"); return; }
    if (form.branches.length === 0) { toast.error("Select at least one branch"); return; }
    mutation.mutate(form);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <FadeIn>
        <div className="flex items-center gap-3 mb-2"><Button variant="ghost" size="icon" onClick={() => navigate("/recruiter/drives")}><ArrowLeft className="h-4 w-4" /></Button></div>
        <PageHeader title="Post New Drive" description="Create a placement drive for your company" />
      </FadeIn>
      <FadeIn delay={0.1}>
        <Card>
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2"><Label>Job Title *</Label><Input value={form.title} onChange={set("title")} placeholder="Software Engineer Intern" /></div>
              <div className="space-y-2"><Label>Description *</Label><textarea className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm" value={form.description} onChange={set("description") as any} placeholder="Role details, requirements, etc." /></div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Package (LPA) *</Label><Input type="number" step="0.1" value={form.packageLpa} onChange={set("packageLpa")} placeholder="6.5" /></div>
                <div className="space-y-2"><Label>Min CGPA</Label><Input type="number" step="0.1" min="0" max="10" value={form.minCgpa} onChange={set("minCgpa")} /></div>
                <div className="space-y-2"><Label>Max Backlogs</Label><Input type="number" min="0" value={form.maxBacklogs} onChange={set("maxBacklogs")} /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Start Date *</Label><Input type="date" value={form.startDate} onChange={set("startDate")} /></div>
                <div className="space-y-2"><Label>End Date *</Label><Input type="date" value={form.endDate} onChange={set("endDate")} /></div>
              </div>
              <div className="space-y-2">
                <Label>Eligible Branches *</Label>
                <div className="flex flex-wrap gap-2">{BRANCHES.map(b => (
                  <button key={b} type="button" onClick={() => toggleBranch(b)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.branches.includes(b) ? "bg-primary text-primary-foreground border-primary" : "bg-muted hover:bg-muted/80"}`}>{b}</button>
                ))}</div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={mutation.isPending} onClick={() => setForm({ ...form, status: "active" })}>
                  {mutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : <><Plus className="h-4 w-4 mr-2" />Publish Drive</>}
                </Button>
                <Button type="submit" variant="outline" disabled={mutation.isPending} onClick={() => setForm({ ...form, status: "draft" })}>Save as Draft</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
