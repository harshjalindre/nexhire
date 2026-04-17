import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap, Building2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";

export default function TenantSignupPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ collegeName: "", collegeCode: "", adminName: "", adminEmail: "", password: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.collegeName || !form.collegeCode || !form.adminName || !form.adminEmail || !form.password) { setError("All fields are required"); return; }
    if (form.collegeName.length < 2 || form.collegeName.length > 100) { setError("College name must be 2-100 characters"); return; }
    if (form.collegeCode.length < 3 || form.collegeCode.length > 10) { setError("College code must be 3-10 characters"); return; }
    if (!/^[A-Z0-9]+$/.test(form.collegeCode)) { setError("College code must be uppercase letters and numbers only"); return; }
    if (form.adminName.length < 2 || form.adminName.length > 100) { setError("Name must be 2-100 characters"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail)) { setError("Invalid email format"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await api.post("/auth/register-tenant", form);
      setAuth(res.data.token, res.data.user, res.data.tenant);
      navigate("/college");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"><Building2 className="h-6 w-6 text-primary" /></div>
          <CardTitle className="text-2xl">Register Your College</CardTitle>
          <p className="text-muted-foreground text-sm">Create your campus placement portal in 60 seconds</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>College Name</Label><Input value={form.collegeName} onChange={e => setForm({ ...form, collegeName: e.target.value })} placeholder="MIT Pune" /></div>
              <div className="space-y-2"><Label>College Code</Label><Input value={form.collegeCode} onChange={e => setForm({ ...form, collegeCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })} placeholder="MIT2024" maxLength={10} /><p className="text-xs text-muted-foreground">Unique code for your college</p></div>
            </div>
            <div className="space-y-2"><Label>Your Name</Label><Input value={form.adminName} onChange={e => setForm({ ...form, adminName: e.target.value })} placeholder="Dr. Sharma" /></div>
            <div className="space-y-2"><Label>Admin Email</Label><Input type="email" value={form.adminEmail} onChange={e => setForm({ ...form, adminEmail: e.target.value })} placeholder="admin@college.edu" /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : <>Create Portal <ArrowRight className="h-4 w-4 ml-2" /></>}
            </Button>
            <p className="text-center text-sm text-muted-foreground">Already registered? <Link to="/auth/login" className="text-primary font-medium hover:underline">Sign in</Link></p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
