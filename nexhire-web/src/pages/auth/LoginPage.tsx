import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Building2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { loginSchema, type LoginFormData } from "@/features/auth/schemas/auth.schema";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { FadeIn } from "@/components/animations/FadeIn";

export default function LoginPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { collegeCode: "", email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((data) => login.mutate(data));

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your NexHire account</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card className="border-0 shadow-xl shadow-black/5">
          <form onSubmit={onSubmit}>
            <CardContent className="pt-6 space-y-4">
              {step === 1 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="collegeCode">College Code</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="collegeCode" placeholder="e.g. MIT2024" className="pl-10" {...form.register("collegeCode")} />
                    </div>
                    {form.formState.errors.collegeCode && (
                      <p className="text-xs text-destructive">{form.formState.errors.collegeCode.message}</p>
                    )}
                  </div>
                  <Button type="button" className="w-full" size="lg" onClick={async () => {
                    const valid = await form.trigger("collegeCode");
                    if (valid) setStep(2);
                  }}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="font-medium text-primary">{form.getValues("collegeCode")}</span>
                    <button type="button" onClick={() => setStep(1)} className="ml-auto text-xs text-primary hover:underline">Change</button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="you@example.com" className="pl-10" {...form.register("email")} />
                    </div>
                    {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10" {...form.register("password")} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={login.isPending}>
                    {login.isPending ? "Signing in..." : "Sign In"}
                  </Button>
                  {login.isError && <p className="text-sm text-destructive text-center">Invalid credentials. Please try again.</p>}
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-center pb-6">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/auth/signup" className="font-medium text-primary hover:underline">Sign up</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </FadeIn>
    </div>
  );
}
