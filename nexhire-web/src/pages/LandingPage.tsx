import { Link } from "react-router-dom";
import { GraduationCap, Building2, Briefcase, Shield, BarChart3, Zap, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  { icon: Building2, title: "Multi-Tenant", desc: "Each college gets its own isolated workspace with custom branding" },
  { icon: Briefcase, title: "Drive Management", desc: "Create, manage, and track placement drives with eligibility checks" },
  { icon: GraduationCap, title: "Student Profiles", desc: "Complete profiles with skills, CGPA, resume uploads, and matching" },
  { icon: BarChart3, title: "Analytics", desc: "Real-time dashboards with placement stats and exportable reports" },
  { icon: Shield, title: "Role-Based Access", desc: "Super Admin, College Admin, Student — each with tailored dashboards" },
  { icon: Zap, title: "Smart Matching", desc: "Auto-match students to drives using weighted scoring algorithms" },
];

const plans = [
  { name: "Basic", price: "Free", features: ["100 students", "5 active drives", "Email support"], popular: false },
  { name: "Premium", price: "₹4,999/mo", features: ["1,000 students", "Unlimited drives", "CSV export", "Bulk import", "Priority support"], popular: true },
  { name: "Enterprise", price: "₹14,999/mo", features: ["Unlimited students", "Unlimited drives", "API access", "Smart matching", "Dedicated support"], popular: false },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2"><GraduationCap className="h-7 w-7 text-primary" /><span className="text-xl font-bold">NexHire</span></div>
          <div className="flex items-center gap-3">
            <Link to="/auth/login"><Button variant="ghost">Login</Button></Link>
            <Link to="/auth/signup/recruiter"><Button variant="outline">I'm a Recruiter</Button></Link>
            <Link to="/auth/signup/tenant"><Button>Register College <ArrowRight className="h-4 w-4 ml-1" /></Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="text-sm px-4 py-1">🎓 Built for Campus Placements</Badge>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">Digitize Your Campus <span className="text-primary">Placement Process</span></h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">NexHire is a multi-tenant SaaS platform that automates the entire placement lifecycle — from drive creation to offer letters.</p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link to="/auth/signup/tenant"><Button size="lg" className="h-12 px-8 text-base">Get Started Free <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
            <Link to="/auth/login"><Button size="lg" variant="outline" className="h-12 px-8 text-base">Sign In</Button></Link>
          </div>
          <p className="text-sm text-muted-foreground">No credit card required · Free for up to 100 students</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(f => (
              <Card key={f.title} className="hover:shadow-lg transition-shadow"><CardContent className="p-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><f.icon className="h-5 w-5 text-primary" /></div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </CardContent></Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-center text-muted-foreground mb-12">Start free, upgrade as you grow</p>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(p => (
              <Card key={p.name} className={`relative ${p.popular ? "border-primary shadow-lg scale-105" : ""}`}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge className="bg-primary">Most Popular</Badge></div>}
                <CardContent className="p-6 text-center space-y-4">
                  <h3 className="font-semibold text-lg">{p.name}</h3>
                  <div><span className="text-3xl font-bold">{p.price}</span></div>
                  <ul className="space-y-2 text-left">
                    {p.features.map(f => <li key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-green-500" />{f}</li>)}
                  </ul>
                  <Link to="/auth/signup/tenant"><Button className="w-full" variant={p.popular ? "default" : "outline"}>Get Started</Button></Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /><span className="font-semibold">NexHire</span></div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} NexHire. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
