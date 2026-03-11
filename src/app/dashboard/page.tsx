import Link from "next/link";
import { TrendingUp, ShieldCheck, Eye, FileText, Search } from "lucide-react";
import { auth } from "@/lib/auth";
import { getUsage } from "@/actions/auth";
import { getMonitorChanges } from "@/actions/monitor";
import { MetricCard } from "@/components/ui/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RankChart } from "@/components/charts/rank-chart";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  const apiKey = (session?.user as { seoApiKey?: string })?.seoApiKey;
  const domain = (session?.user as { seoDomain?: string })?.seoDomain ?? "";

  let creditsRemaining = 0;
  let creditsLimit = 100;
  let changeCount = 0;

  try {
    if (apiKey) {
      const usage = (await getUsage()) as any;
      if (usage?.credits) {
        creditsRemaining = usage.credits.remaining ?? 0;
        creditsLimit = usage.credits.limit ?? 100;
      } else if (usage?.meta) {
        creditsRemaining = usage.meta.creditsRemaining ?? 0;
        creditsLimit = (usage.meta.creditsUsed ?? 0) + creditsRemaining;
      }
      const changes = await getMonitorChanges();
      const changeData = Array.isArray(changes) ? changes : (changes as any)?.data ?? [];
      changeCount = changeData.length;
    }
  } catch {
    // Use defaults
  }

  const quickActions = [
    { label: "Check Rankings", href: "/dashboard/rankings", icon: TrendingUp },
    { label: "Run Audit", href: "/dashboard/audit", icon: ShieldCheck },
    { label: "Monitor Changes", href: "/dashboard/monitor", icon: Eye },
    { label: "Generate Content", href: "/dashboard/content", icon: FileText },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your SEO performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Keywords Tracked" value="—" icon={<Search className="h-4 w-4" />} staggerIndex={0} />
        <MetricCard label="Average Position" value="—" icon={<TrendingUp className="h-4 w-4" />} staggerIndex={1} />
        <MetricCard
          label="Credits Remaining"
          value={`${creditsRemaining} / ${creditsLimit}`}
          staggerIndex={2}
        />
        <MetricCard label="Monitor Alerts" value={changeCount} icon={<Eye className="h-4 w-4" />} staggerIndex={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rank Changes</CardTitle>
            <p className="text-sm text-muted-foreground">
              Position trends for top keywords (last 30 days)
            </p>
          </CardHeader>
          <CardContent>
            <RankChart domain={domain} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <p className="text-sm text-muted-foreground">
              Latest updates from Monitor, Audit, Content
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent activity yet. Run your first check to see updates here.
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 font-display text-lg font-semibold">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className={cn(
                  "flex items-center gap-3 rounded-[6px] border border-border bg-card p-4",
                  "transition-[border-color,box-shadow] duration-150 hover:border-primary/40 hover:shadow-[0_0_0_1px_hsl(38_92%_52%_/_0.2)] active:scale-[0.98]"
                )}
              >
                <div className="rounded-[6px] bg-primary/20 p-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
