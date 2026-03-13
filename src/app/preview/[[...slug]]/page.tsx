import Link from "next/link";
import { TrendingUp, ShieldCheck, Eye, FileText, Search } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RankChart } from "@/components/charts/rank-chart";
import { cn } from "@/lib/utils";

export default async function PreviewSlugPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolved = await params;
  const slug = Array.isArray(resolved?.slug) ? resolved.slug : [];
  const isHome = slug.length === 0;
  const first = slug[0];
  const name = first ? first.charAt(0).toUpperCase() + first.slice(1).replace(/-/g, " ") : "Page";

  if (isHome) {
    const quickActions = [
      { label: "Check Rankings", href: "/preview/rankings", icon: TrendingUp },
      { label: "Run Audit", href: "/preview/audit", icon: ShieldCheck },
      { label: "Monitor Changes", href: "/preview/monitor", icon: Eye },
      { label: "Generate Content", href: "/preview/content", icon: FileText },
    ];
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">Dashboard</h1>
            <p className="text-sm text-ink-2">Overview of your SEO performance (preview)</p>
          </div>
          <Link href="/auth/login" className="text-xs text-ink-3 underline hover:text-ink">
            Sign in to use
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Keywords Tracked" value="—" icon={<Search className="h-4 w-4" />} staggerIndex={0} />
          <MetricCard label="Average Position" value="—" icon={<TrendingUp className="h-4 w-4" />} staggerIndex={1} />
          <MetricCard label="Credits Remaining" value="42 / 100" staggerIndex={2} />
          <MetricCard label="Monitor Alerts" value={3} icon={<Eye className="h-4 w-4" />} staggerIndex={3} />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Rank Changes</CardTitle>
              <p className="text-sm text-ink-2">Position trends for top keywords (last 30 days)</p>
            </CardHeader>
            <CardContent>
              <RankChart domain="example.com" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <p className="text-sm text-ink-2">Latest updates from Monitor, Audit, Content</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ink-2">No recent activity yet. Run your first check to see updates here.</p>
            </CardContent>
          </Card>
        </div>
        <div>
          <h2 className="mb-4 text-lg font-bold text-ink">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
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
                  <span className="font-medium text-ink">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">{name}</h1>
        <p className="text-sm text-ink-2">Preview — sign in to use this page</p>
      </div>
      <div className="rounded-xl border border-magneta-100 bg-white p-8 text-center text-ink-2">
        <p>This is a preview of the page layout.</p>
        <Link href="/preview" className="mt-4 inline-block text-sm text-primary hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
