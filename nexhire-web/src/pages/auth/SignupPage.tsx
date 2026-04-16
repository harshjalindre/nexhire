import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ArrowLeft, Building2, User, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { signupSchema, type SignupFormData } from "@/features/auth/schemas/auth.schema";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { FadeIn } from "@/components/animations/FadeIn";

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const { signup } = useAuth();
  const form = useForm<SignupFormData>({ resolver: zodResolver(signupSchema), defaultValues: { collegeCode: "", name: "", email: "", password: "", confirmPassword: "", role: "student" } });
  const onSubmit = form.handleSubmit((data) => signup.mutate(data));

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
          <p className="text-muted-foreground">Join NexHire and kickstart your career</p>
        </div>
        <div className="flex items-center gap-2 mt-4">{[1, 2].map((s) => (<div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />))}</div>
      </FadeIn>
      <FadeIn delay={0.1}>
        <Card className="border-0 shadow-xl shadow-black/5">
          <form onSubmit={onSubmit}>
            <CardContent className="pt-6 space-y-4">
              {step === 1 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>College Code</Label>
                    <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="e.g. MIT2024" className="pl-10" {...form.register("collegeCode")} /></div>
                    {form.formState.errors.collegeCode && <p className="text-xs text-destructive">{form.formState.errors.collegeCode.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>I am a</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["student", "college_admin"] as const).map((role) => (
                        <button key={role} type="button" onClick={() => form.setValue("role", role)} className={`rounded-lg border-2 p-4 text-center transition-all ${form.watch("role") === role ? "border-primary bg-primary/5" : "border-muted hover:border-primary/30"}`}>
                          <p className="font-medium text-sm">{role === "student" ? "🎓 Student" : "🏫 College Admin"}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button type="button" className="w-full" size="lg" onClick={async () => { const valid = await form.trigger("collegeCode"); if (valid) setStep(2); }}>Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)} className="mb-2"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
                  <div className="space-y-2"><Label>Full Name</Label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="John Doe" className="pl-10" {...form.register("name")} /></div>{form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}</div>
                  <div className="space-y-2"><Label>Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="email" placeholder="you@example.com" className="pl-10" {...form.register("email")} /></div>{form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Password</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="password" placeholder="••••••••" className="pl-10" {...form.register("password")} /></div>{form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}</div>
                    <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" placeholder="••••••••" {...form.register("confirmPassword")} />{form.formState.errors.confirmPassword && <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>}</div>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={signup.isPending}>{signup.isPending ? "Creating account..." : "Create Account"}</Button>
                  {signup.isError && <p className="text-sm text-destructive text-center">Something went wrong. Please try again.</p>}
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-center pb-6"><p className="text-sm text-muted-foreground">Already have an account?{" "}<Link to="/auth/login" className="font-medium text-primary hover:underline">Sign in</Link></p></CardFooter>
          </form>
        </Card>
      </FadeIn>
    </div>
  );
}
