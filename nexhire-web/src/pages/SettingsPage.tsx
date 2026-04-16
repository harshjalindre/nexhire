import { User, Bell, Shield } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FadeIn } from "@/components/animations/FadeIn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/authStore";

export default function SettingsPage() {
  const { user } = useAuthStore();
  return (
    <div className="space-y-6">
      <FadeIn><PageHeader title="Settings" description="Manage your account preferences" /></FadeIn>
      <div className="grid gap-6 max-w-2xl">
        <FadeIn delay={0.1}><Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5" />Account</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid sm:grid-cols-2 gap-4"><div className="space-y-2"><Label>Name</Label><Input defaultValue={user?.name || ""} /></div><div className="space-y-2"><Label>Email</Label><Input defaultValue={user?.email || ""} disabled className="bg-muted" /></div></div><Separator /><Button variant="outline" size="sm">Update Profile</Button></CardContent></Card></FadeIn>
        <FadeIn delay={0.2}><Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5" />Security</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label>Current Password</Label><Input type="password" placeholder="••••••••" /></div><div className="grid sm:grid-cols-2 gap-4"><div className="space-y-2"><Label>New Password</Label><Input type="password" placeholder="••••••••" /></div><div className="space-y-2"><Label>Confirm Password</Label><Input type="password" placeholder="••••••••" /></div></div><Button variant="outline" size="sm">Change Password</Button></CardContent></Card></FadeIn>
        <FadeIn delay={0.3}><Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5" />Notifications</CardTitle></CardHeader><CardContent><div className="space-y-3">{[{ label: "Email Notifications", desc: "Receive updates via email" }, { label: "Drive Alerts", desc: "Get notified about new drives" }, { label: "Application Updates", desc: "Track your application status" }].map(pref => (<div key={pref.label} className="flex items-center justify-between rounded-lg border p-3"><div><p className="text-sm font-medium">{pref.label}</p><p className="text-xs text-muted-foreground">{pref.desc}</p></div><input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary" /></div>))}</div></CardContent></Card></FadeIn>
      </div>
    </div>
  );
}
