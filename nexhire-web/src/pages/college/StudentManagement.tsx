import { useState } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Search, Download, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStudents } from "@/features/students/hooks/useStudents";
import { SkeletonListRows } from "@/components/shared/Skeletons";

export default function StudentManagement() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const { data, isLoading } = useStudents({ search: debouncedSearch });
  const students = data?.data || [];
  const statusColors: Record<string, "success" | "secondary" | "warning"> = { placed: "success", unplaced: "secondary", opted_out: "warning" };
  return (
    <div className="space-y-6">
      <FadeIn><PageHeader title="Student Management" description="View and manage registered students" actions={<Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export CSV</Button>} /></FadeIn>
      <FadeIn delay={0.1}><div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search students..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div></FadeIn>
      {isLoading ? (<SkeletonListRows count={5} />
      ) : students.length === 0 ? (<EmptyState icon={GraduationCap} title="No students found" description="Students will appear here after they register" />
      ) : (<div className="grid gap-3">{students.map((student, i) => (
        <FadeIn key={student.id} delay={i * 0.03}><Card className="hover:shadow-md transition-all"><CardContent className="p-4"><div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0"><div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">{student.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</div><div className="min-w-0"><p className="font-medium truncate">{student.name}</p><p className="text-xs text-muted-foreground truncate">{student.email}</p></div></div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm"><div><span className="text-muted-foreground text-xs">Branch:</span><p className="font-medium text-xs">{student.branch}</p></div><div><span className="text-muted-foreground text-xs">CGPA:</span><p className="font-medium text-xs">{student.cgpa}</p></div><div className="w-24"><span className="text-muted-foreground text-xs">Profile</span><Progress value={student.profileCompletion} className="h-1.5 mt-1" /></div><Badge variant={statusColors[student.placementStatus] || "secondary"} className="text-[10px]">{student.placementStatus.replace("_", " ")}</Badge></div>
        </div></CardContent></Card></FadeIn>
      ))}</div>)}
    </div>
  );
}
