import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, CreditCard, Sparkles, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

interface Plan { id: string; name: string; price: number; priceDisplay: string; features: string[]; }

function usePlans() { return useQuery({ queryKey: ["plans"], queryFn: () => api.get("/billing/plans").then(r => r.data) }); }
function useSubscription() { return useQuery({ queryKey: ["subscription"], queryFn: () => api.get("/billing/subscription").then(r => r.data) }); }

export default function BillingPage() {
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const queryClient = useQueryClient();
  const { data: plansData } = usePlans();
  const { data: subData } = useSubscription();
  const plans: Plan[] = plansData?.plans || [];
  const currentTier = subData?.tenant?.tier || "basic";

  const payMutation = useMutation({
    mutationFn: async (planId: string) => {
      const checkout = await api.post("/billing/checkout", { planId });
      const result = await api.post(`/billing/pay/${checkout.data.orderId}`, { planId, cardLast4: cardNumber.slice(-4) });
      return result.data;
    },
    onSuccess: () => {
      setPaymentSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });

  return (
    <div className="space-y-6">
      <FadeIn><PageHeader title="Billing & Plans" description="Manage your subscription and upgrade your plan" /></FadeIn>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan, i) => {
          const isCurrent = plan.id === currentTier;
          const isPopular = plan.id === "premium";
          return (
            <FadeIn key={plan.id} delay={i * 0.1}>
              <Card className={`relative ${isPopular ? "border-primary shadow-lg" : ""} ${isCurrent ? "ring-2 ring-primary" : ""}`}>
                {isPopular && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge className="bg-primary text-primary-foreground gap-1"><Sparkles className="h-3 w-3" />Popular</Badge></div>}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="mt-2"><span className="text-3xl font-bold">{plan.price === 0 ? "Free" : `₹${plan.price.toLocaleString()}`}</span>{plan.price > 0 && <span className="text-muted-foreground text-sm">/month</span>}</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2.5">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /><span>{f}</span></li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <Button className="w-full" variant="outline" disabled><Check className="h-4 w-4 mr-2" />Current Plan</Button>
                  ) : (
                    <Button className="w-full" variant={isPopular ? "default" : "outline"} onClick={() => { setCheckoutPlan(plan); setPaymentSuccess(false); }}>{plan.price === 0 ? "Downgrade" : "Upgrade"}</Button>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          );
        })}
      </div>

      {/* Checkout Dialog */}
      <Dialog open={!!checkoutPlan} onOpenChange={(open) => !open && setCheckoutPlan(null)}>
        <DialogContent className="max-w-md">
          {paymentSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto"><Check className="h-8 w-8 text-green-600 dark:text-green-300" /></div>
              <h3 className="text-xl font-semibold">Payment Successful!</h3>
              <p className="text-muted-foreground">You've been upgraded to <strong>{checkoutPlan?.name}</strong>.</p>
              <Button onClick={() => setCheckoutPlan(null)}>Done</Button>
            </div>
          ) : (
            <>
              <DialogHeader><DialogTitle><CreditCard className="h-5 w-5 inline mr-2" />Checkout — {checkoutPlan?.name}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between"><span className="font-medium">{checkoutPlan?.name} Plan</span><span className="text-lg font-bold">{checkoutPlan?.priceDisplay}</span></div>
                <div className="space-y-2"><Label>Card Number</Label><Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Expiry</Label><Input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" /></div>
                  <div className="space-y-2"><Label>CVC</Label><Input value={cvc} onChange={(e) => setCvc(e.target.value)} placeholder="123" /></div>
                </div>
                <p className="text-xs text-muted-foreground text-center">🔒 This is a simulated payment. No real charges will be made.</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCheckoutPlan(null)}>Cancel</Button>
                <Button onClick={() => payMutation.mutate(checkoutPlan!.id)} disabled={payMutation.isPending}>
                  {payMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</> : `Pay ${checkoutPlan?.priceDisplay}`}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
