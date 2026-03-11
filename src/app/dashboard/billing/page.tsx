"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle2, Zap, Rocket, Star } from "lucide-react";
import { getPlans, upgradePlan } from "@/actions/billing";
import { getUsage } from "@/actions/auth";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PLAN_ICONS: Record<string, any> = { FREE: Star, STARTER: Zap, GROWTH: Rocket };
const PLAN_COLORS: Record<string, string> = {
  FREE: "border-border",
  STARTER: "border-blue-500",
  GROWTH: "border-primary/50",
};

const STATIC_PLANS = [
  {
    name: "FREE", price: 0,
    features: ["100 credits/month", "Technical audits", "Keyword search", "Monitor 3 URLs"],
  },
  {
    name: "STARTER", price: 29,
    features: ["1,000 credits/month", "All FREE features", "Rankings tracker", "Content generation", "Monitor 20 URLs"],
  },
  {
    name: "GROWTH", price: 99,
    features: ["5,000 credits/month", "All STARTER features", "Lighthouse + Core Web Vitals", "AI Agent audits", "Competitor analysis", "GEO / AEO tools", "Google Search Console", "Unlimited monitoring"],
  },
];

export default function BillingPage() {
  const { data: session } = useSession();
  const currentPlan = (session?.user as { seoPlan?: string })?.seoPlan ?? "FREE";

  const [plans, setPlans] = useState<any[]>([]);
  const [usage, setUsage] = useState<any>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getPlans(), getUsage()])
      .then(([p, u]) => {
        const arr = Array.isArray(p) ? p : (p as any)?.data ?? [];
        if (arr.length) setPlans(arr);
        setUsage(u);
      })
      .catch(() => {});
  }, []);

  async function handleUpgrade(plan: string) {
    if (plan === currentPlan) return;
    setUpgrading(plan);
    try {
      const res = await upgradePlan({ plan }) as any;
      const url = res?.url ?? res?.data?.url;
      if (url) { window.location.href = url; return; }
      toast.success(`Upgraded to ${plan}`);
    } catch (err: any) {
      toast.error(err?.message ?? "Upgrade failed");
    } finally {
      setUpgrading(null);
    }
  }

  const creditsRemaining = usage?.credits?.remaining ?? usage?.meta?.creditsRemaining ?? 0;
  const fallbackLimit = usage?.meta ? (usage.meta.creditsUsed ?? 0) + creditsRemaining : 0;
  const creditsLimit = usage?.credits?.limit ?? (fallbackLimit || 100);
  const creditsUsed      = creditsLimit > 0 ? creditsLimit - creditsRemaining : 0;
  const displayPlans     = plans.length > 0 ? plans : STATIC_PLANS;

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">Manage your plan and credits</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Current Usage</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Plan</span>
            <Badge>{currentPlan}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Credits used this month</span>
            <span className="font-mono text-sm">{creditsUsed} / {creditsLimit || "—"}</span>
          </div>
          {creditsLimit > 0 && (
            <div className="h-2 w-full overflow-hidden rounded-[6px] bg-muted">
              <div
                className="h-full bg-primary transition-[width] duration-700"
                style={{ width: `${Math.min(100, (creditsUsed / creditsLimit) * 100)}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {displayPlans.map((plan: any) => {
          const isCurrent = plan.name === currentPlan;
          const Icon = PLAN_ICONS[plan.name] ?? Star;
          const features: string[] = Array.isArray(plan.features)
            ? plan.features
            : Object.keys(plan.features ?? {}).filter((k) => plan.features[k]);

          return (
            <Card
              key={plan.name}
              className={cn("relative flex flex-col", PLAN_COLORS[plan.name] ?? "border-border", isCurrent && "ring-2 ring-primary")}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Current plan</Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle>{plan.name}</CardTitle>
                </div>
                <p className="text-3xl font-bold">
                  {plan.price === 0 ? "Free" : `$${plan.price}`}
                  {plan.price > 0 && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <ul className="space-y-2 text-sm">
                  {features.map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-2">
                  <Button
                    className="w-full"
                    variant={isCurrent ? "outline" : "default"}
                    disabled={isCurrent || upgrading !== null}
                    onClick={() => handleUpgrade(plan.name)}
                  >
                    {upgrading === plan.name ? "Redirecting…" : isCurrent ? "Current plan" : `Upgrade to ${plan.name}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
