import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, User, BookOpen, Code } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile, useUpdateProfile } from "@/features/profile/hooks/useProfile";
import { SkeletonProfile } from "@/components/shared/Skeletons";
import { BRANCHES } from "@/lib/constants";

const profileSchema = z.object({ name: z.string().min(2), branch: z.string().min(1), year: z.number().min(1).max(5), cgpa: z.number().min(0).max(10), backlogs: z.number().min(0).int(), skills: z.string() });
type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const form = useForm<ProfileFormData>({ resolver: zodResolver(profileSchema), values: profile ? { name: profile.name, branch: profile.branch, year: profile.year, cgpa: profile.cgpa, backlogs: profile.backlogs, skills: profile.skills.join(", ") } : undefined });
  const onSubmit = form.handleSubmit((data) => { updateProfile.mutate({ ...data, skills: data.skills.split(",").map(s => s.trim()).filter(Boolean) }); });

  if (isLoading) return <div className="space-y-6"><FadeIn><PageHeader title="My Profile" description="Build a strong profile to stand out to recruiters" /></FadeIn><SkeletonProfile /></div>;

  return (
    <div className="space-y-6">
      <FadeIn><PageHeader title="My Profile" description="Build a strong profile to stand out to recruiters" actions={<Button onClick={onSubmit} disabled={updateProfile.isPending}><Save className="h-4 w-4 mr-2" />{updateProfile.isPending ? "Saving..." : "Save Profile"}</Button>} /></FadeIn>
      <FadeIn delay={0.05}><Card className="border-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10"><CardContent className="p-5"><div className="flex items-center justify-between gap-4"><div><h3 className="font-semibold">Profile Strength</h3><p className="text-sm text-muted-foreground">Complete all sections for best results</p></div><div className="flex items-center gap-3"><Progress value={profile?.profileCompletion || 0} className="h-3 w-32" /><span className="text-lg font-bold text-primary">{profile?.profileCompletion || 0}%</span></div></div></CardContent></Card></FadeIn>
      <FadeIn delay={0.1}><Tabs defaultValue="personal">
        <TabsList><TabsTrigger value="personal"><User className="h-3.5 w-3.5 mr-1.5" />Personal</TabsTrigger><TabsTrigger value="academic"><BookOpen className="h-3.5 w-3.5 mr-1.5" />Academic</TabsTrigger><TabsTrigger value="skills"><Code className="h-3.5 w-3.5 mr-1.5" />Skills</TabsTrigger></TabsList>
        <TabsContent value="personal" className="mt-4"><Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5" />Personal Information</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid sm:grid-cols-2 gap-4"><div className="space-y-2"><Label>Full Name</Label><Input {...form.register("name")} placeholder="Your full name" /></div><div className="space-y-2"><Label>Email</Label><Input value={profile?.email || ""} disabled className="bg-muted" /></div></div></CardContent></Card></TabsContent>
        <TabsContent value="academic" className="mt-4"><Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><BookOpen className="h-5 w-5" />Academic Details</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid sm:grid-cols-2 gap-4"><div className="space-y-2"><Label>Branch</Label><select {...form.register("branch")} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="">Select branch</option>{BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}</select></div><div className="space-y-2"><Label>Year</Label><Input type="number" {...form.register("year", { valueAsNumber: true })} /></div><div className="space-y-2"><Label>CGPA</Label><Input type="number" step="0.01" {...form.register("cgpa", { valueAsNumber: true })} /></div><div className="space-y-2"><Label>Active Backlogs</Label><Input type="number" {...form.register("backlogs", { valueAsNumber: true })} /></div></div></CardContent></Card></TabsContent>
        <TabsContent value="skills" className="mt-4"><Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><Code className="h-5 w-5" />Skills & Technologies</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label>Skills (comma-separated)</Label><Input {...form.register("skills")} placeholder="React, TypeScript, Node.js, Python..." /><p className="text-xs text-muted-foreground">Tip: Add skills relevant to your target roles</p></div>{profile?.skills && profile.skills.length > 0 && <div className="flex flex-wrap gap-2 mt-2">{profile.skills.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}</div>}</CardContent></Card></TabsContent>
      </Tabs></FadeIn>
    </div>
  );
}
