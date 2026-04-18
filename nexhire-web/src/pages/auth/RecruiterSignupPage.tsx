import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Briefcase, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";

export default function RecruiterSignupPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", collegeCode: "", companyName: "", designation: "", phone: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password || !form.collegeCode) { setError("Name, email, password, and college code are required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError("Invalid email format"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await api.post("/auth/register-recruiter", form);
      setAuth(res.data.token, res.data.user, res.data.tenant);
      navigate("/recruiter");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"><Briefcase className="h-6 w-6 text-primary" /></div>
          <CardTitle className="text-2xl">Recruiter Registration</CardTitle>
          <p className="text-muted-foreground text-sm">Join a college's placement portal to post drives and hire talent</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Full Name *</Label><Input value={form.name} onChange={set("name")} placeholder="John Doe" /></div>
              <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={set("email")} placeholder="recruiter@company.com" /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Password *</Label><Input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" /></div>
              <div className="space-y-2"><Label>College Code *</Label><Input value={form.collegeCode} onChange={(e) => setForm({ ...form, collegeCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })} placeholder="MIT2024" maxLength={10} /><p className="text-xs text-muted-foreground">Get this from the placement cell</p></div>
            </div>
            <hr className="my-2" />
            <p className="text-xs text-muted-foreground font-medium">Company Details (optional — can be updated later)</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Company Name</Label><Input value={form.companyName} onChange={set("companyName")} placeholder="Google India" /></div>
              <div className="space-y-2"><Label>Designation</Label><Input value={form.designation} onChange={set("designation")} placeholder="HR Manager" /></div>
            </div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" /></div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : <>Register as Recruiter <ArrowRight className="h-4 w-4 ml-2" /></>}
            </Button>
            <p className="text-center text-sm text-muted-foreground">Already have an account? <Link to="/auth/login" className="text-primary font-medium hover:underline">Sign in</Link></p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
