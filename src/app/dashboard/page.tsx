import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUsage } from "@/actions/auth";
import { getMonitorChanges } from "@/actions/monitor";
import { getAuditHistory } from "@/actions/audit";
import { ChevronRight, Eye, AlertCircle, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { PriorityCardServer } from "@/components/ui/priority-card-server";

function scoreGrade(s: number) {
  if (s >= 80) return { grade: "A", label: "Excellent", color: "#1D9E75" };
  if (s >= 60) return { grade: "B", label: "Good", color: "#185FA5" };
  if (s >= 40) return { grade: "C", label: "Fair", color: "#BA7517" };
  return { grade: "D", label: "Critical", color: "#A32D2D" };
}

export default async function DashboardPage() {
  const session = await auth();
  const apiKey = (session?.user as { seoApiKey?: string })?.seoApiKey;
  const domain = (session?.user as { seoDomain?: string })?.seoDomain ?? "";
  const userName = session?.user?.name?.split(" ")[0] ?? "there";

  let score = 0;
  let creditsRemaining = 0;
  let creditsLimit = 100;
  let changeCount = 0;
  let lastAuditDate: string | null = null;
  let recentChanges: any[] = [];

  try {
    if (apiKey) {
      const [usage, changes, history] = await Promise.allSettled([
        getUsage(),
        getMonitorChanges(),
        getAuditHistory({ limit: "1", domain }),
      ]);

      if (usage.status === "fulfilled") {
        const u = usage.value as any;
        creditsRemaining = u?.credits?.remaining ?? u?.meta?.creditsRemaining ?? 0;
        const computed = creditsRemaining + (u?.meta?.creditsUsed ?? 0);
        creditsLimit = u?.credits?.limit ?? (computed > 0 ? computed : 100);
      }

      if (changes.status === "fulfilled") {
        const d = Array.isArray(changes.value) ? changes.value : (changes.value as any)?.data ?? [];
        recentChanges = d.slice(0, 3);
        changeCount = d.length;
      }

      if (history.status === "fulfilled") {
        const h = history.value as any;
        const rows = Array.isArray(h) ? h : h?.data ?? h?.history ?? [];
        if (rows[0]) {
          score = rows[0].score ?? rows[0].summary?.score ?? 0;
          lastAuditDate = rows[0].createdAt ?? null;
        }
      }
    }
  } catch {}

  const { grade, label, color } = scoreGrade(score);
  const creditPct = creditsLimit > 0 ? Math.round((creditsRemaining / creditsLimit) * 100) : 0;

  return (
    <div className="min-h-full animate-fade-up">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Page header */}
        <div className="mb-6">
          <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-meridian-400">Overview</div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Hey {userName} 👋</h1>
          <p className="mt-1 text-sm text-ink-2">
            {domain ? `Here&apos;s what&apos;s happening with ${domain}` : "Here&apos;s your SEO overview"}
          </p>
        </div>

        {/* Metric cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-meridian-100 bg-white p-5 sm:col-span-2">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">SEO Score</p>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-6xl font-extrabold tabular-nums tracking-tight" style={{ color }}>{score || "—"}</div>
                <div className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold" style={{
                  background: score >= 80 ? "#E1F5EE" : score >= 60 ? "#E6F1FB" : score >= 40 ? "#FAEEDA" : "#FCEBEB",
                  color,
                  border: `1px solid ${color}40`,
                }}>
                  {score ? `Grade ${grade} · ${label}` : "Run your first audit"}
                </div>
              </div>
              <div className="flex-1">
                <div className="relative h-2.5 overflow-hidden rounded-full bg-meridian-100">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${score}%`, background: color }}
                  />
                </div>
                <div className="mt-3 flex justify-between text-xs text-ink-3"><span>0</span><span>50</span><span>100</span></div>
                {lastAuditDate && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-ink-3">
                    <Clock className="h-3 w-3" />
                    Last checked {new Date(lastAuditDate).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </p>
                )}
              </div>
            </div>
            {!score && (
              <Link
                href="/dashboard/audit"
                className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-meridian-600 py-3 text-sm font-bold text-white transition-colors hover:bg-meridian-800"
              >
                Run my first audit <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex-1 rounded-xl border border-meridian-100 bg-canvas p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">Credits</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-ink">{creditsRemaining}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-meridian-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${creditPct}%`, background: creditPct > 30 ? "#1D9E75" : "#A32D2D" }}
                />
              </div>
              <p className="mt-1 text-xs text-ink-3">remaining this month</p>
            </div>
            <div className="flex-1 rounded-xl border border-meridian-100 bg-canvas p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">Monitor Alerts</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight" style={{ color: changeCount > 0 ? "#BA7517" : undefined }}>
                {changeCount}
              </p>
              <p className="mt-1 text-xs text-ink-3">{changeCount > 0 ? "changes detected" : "no recent changes"}</p>
            </div>
          </div>
        </div>

        {/* Priorities */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-ink">Your priorities right now</h2>
              <p className="text-sm text-ink-2">Fix these first — biggest impact, easiest wins</p>
            </div>
            <Link
              href="/dashboard/priorities"
              className="flex items-center gap-1 rounded-lg border border-meridian-100 bg-meridian-50 px-3 py-1.5 text-sm font-bold text-meridian-600 transition-colors hover:bg-meridian-100"
            >
              See all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {domain ? (
            <PriorityCardServer domain={domain} limit={3} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-meridian-100 bg-canvas py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-meridian-50">
                <AlertCircle className="h-6 w-6 text-meridian-600" />
              </div>
              <p className="text-sm font-bold text-ink">No domain set</p>
              <p className="mt-1 text-xs text-ink-3">Go to <Link href="/dashboard/settings" className="font-medium text-meridian-600 hover:underline">Settings</Link> to add your domain.</p>
            </div>
          )}
        </div>

        {/* Monitor alerts */}
        {recentChanges.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-extrabold tracking-tight text-ink">Monitor alerts</h2>
              <Link href="/dashboard/monitor" className="flex items-center gap-1 text-sm text-ink-3 transition-colors hover:text-ink-2">
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-2">
              {recentChanges.map((c: any, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-meridian-100 bg-white px-4 py-3"
                >
                  <Eye className="h-4 w-4 shrink-0 text-warning" />
                  <span className="flex-1 truncate text-sm text-ink-2">{c.url}</span>
                  <span className="text-xs text-ink-3">{c.changeType ?? "changed"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div>
          <h2 className="mb-3 text-lg font-extrabold tracking-tight text-ink">Other tools</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Rankings", desc: "Check keyword positions", href: "/dashboard/rankings", icon: TrendingUp },
              { label: "Content Studio", desc: "Generate SEO content", href: "/dashboard/content", icon: CheckCircle2 },
              { label: "Competitors", desc: "Benchmark vs rivals", href: "/dashboard/competitors", icon: Eye },
            ].map(({ label, desc, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-xl border border-meridian-100 bg-white px-4 py-3.5 transition-colors hover:border-meridian-200 hover:bg-canvas"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-meridian-50">
                  <Icon className="h-4 w-4 text-meridian-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-ink">{label}</p>
                  <p className="text-xs text-ink-3">{desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
