import { Briefcase, FileCheck, Trophy, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { FadeIn } from "@/components/animations/FadeIn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/stores/authStore";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <FadeIn><PageHeader title={`Hey, ${user?.name?.split(" ")[0]}! 🎯`} description="Track your placement journey" /></FadeIn>
      <FadeIn delay={0.05}><Card className="border-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10"><CardContent className="p-5"><div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"><div><h3 className="font-semibold">Complete Your Profile</h3><p className="text-sm text-muted-foreground">A complete profile increases your chances by 3x</p></div><div className="flex items-center gap-3 w-full sm:w-auto"><Progress value={65} className="h-2 w-32" /><span className="text-sm font-bold text-primary">65%</span><Button size="sm" variant="outline" onClick={() => navigate("/student/profile")}>Complete</Button></div></div></CardContent></Card></FadeIn>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[{ title: "Applications", value: "8", icon: FileCheck, change: 25, trend: "up" as const }, { title: "Interviews", value: "3", icon: Clock, change: 50, trend: "up" as const }, { title: "Offers", value: "1", icon: Trophy, change: 100, trend: "up" as const }, { title: "Active Drives", value: "12", icon: Briefcase }].map((stat, i) => (<FadeIn key={stat.title} delay={i * 0.1}><StatCard {...stat} /></FadeIn>))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn delay={0.3}><Card><CardHeader className="flex-row items-center justify-between"><CardTitle className="text-lg">Upcoming Drives</CardTitle><Button variant="ghost" size="sm" onClick={() => navigate("/student/drives")}>View All</Button></CardHeader><CardContent><div className="space-y-3">
          {[{ company: "Google", role: "SDE Intern", pkg: "₹25 LPA", deadline: "Apr 20", eligible: true }, { company: "Microsoft", role: "PM Intern", pkg: "₹22 LPA", deadline: "Apr 25", eligible: true }, { company: "Startup X", role: "Full Stack", pkg: "₹12 LPA", deadline: "May 3", eligible: false }].map(drive => (
            <div key={drive.company} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors cursor-pointer"><div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">{drive.company[0]}</div><div className="flex-1"><p className="text-sm font-medium">{drive.company} - {drive.role}</p><p className="text-xs text-muted-foreground">{drive.pkg} • Deadline: {drive.deadline}</p></div><Badge variant={drive.eligible ? "success" : "destructive"} className="text-[10px]">{drive.eligible ? "Eligible" : "Not Eligible"}</Badge></div>
          ))}</div></CardContent></Card></FadeIn>
        <FadeIn delay={0.4}><Card><CardHeader className="flex-row items-center justify-between"><CardTitle className="text-lg">Application Status</CardTitle><Button variant="ghost" size="sm" onClick={() => navigate("/student/applications")}>View All</Button></CardHeader><CardContent><div className="space-y-4">
          {[{ company: "Google", role: "SDE Intern", status: "Interview", color: "bg-amber-500" }, { company: "Amazon", role: "SDE I", status: "Shortlisted", color: "bg-blue-500" }, { company: "Flipkart", role: "Backend", status: "Offered", color: "bg-emerald-500" }, { company: "Paytm", role: "Full Stack", status: "Applied", color: "bg-gray-400" }].map(app => (
            <div key={app.company} className="flex items-center gap-3"><div className={`h-3 w-3 rounded-full ${app.color} shrink-0`} /><div className="flex-1 min-w-0"><p className="text-sm font-medium">{app.company} - {app.role}</p></div><span className="text-xs font-medium text-muted-foreground">{app.status}</span></div>
          ))}</div></CardContent></Card></FadeIn>
      </div>
    </div>
  );
}
