import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUsage } from "@/actions/auth";
import { getMonitorChanges } from "@/actions/monitor";
import { getAuditHistory } from "@/actions/audit";
import { ChevronRight, Eye, AlertCircle, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { PriorityCardServer } from "@/components/ui/priority-card-server";

function scoreGrade(s: number) {
  if (s >= 90) return { grade: "A", label: "Excellent", color: "#10b981" };
  if (s >= 80) return { grade: "B", label: "Good", color: "#34d399" };
  if (s >= 70) return { grade: "C", label: "Average", color: "#f59e0b" };
  if (s >= 50) return { grade: "D", label: "Needs work", color: "#f97316" };
  return { grade: "F", label: "Critical issues", color: "#ef4444" };
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
    <div className="min-h-full" style={{ background: "radial-gradient(ellipse 60% 40% at 50% -10%, rgba(16,185,129,0.07) 0%, transparent 60%)", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-black" style={{ color: "#fff", fontFamily: "'DM Serif Display', Georgia, serif", letterSpacing: "-0.02em" }}>Hey {userName} 👋</h1>
          <p className="mt-1 text-base" style={{ color: "rgba(255,255,255,0.45)" }}>{domain ? `Here's what's happening with ${domain}` : "Here's your SEO overview"}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>SEO Score</p>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-7xl font-black tabular-nums" style={{ color, fontFamily: "'DM Serif Display', Georgia, serif", lineHeight: 1 }}>{score || "—"}</div>
                <div className="mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-bold" style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>{score ? `Grade ${grade} · ${label}` : "Run your first audit"}</div>
              </div>
              <div className="flex-1">
                <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}80, ${color})`, boxShadow: `0 0 12px ${color}50` }} />
                </div>
                <div className="mt-3 flex justify-between text-xs" style={{ color: "rgba(255,255,255,0.3)" }}><span>0</span><span>50</span><span>100</span></div>
                {lastAuditDate && <p className="mt-2 flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}><Clock className="h-3 w-3" />Last checked {new Date(lastAuditDate).toLocaleDateString("en", { month: "short", day: "numeric" })}</p>}
              </div>
            </div>
            {!score && (
              <Link href="/dashboard/audit" className="mt-4 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold" style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", boxShadow: "0 4px 20px rgba(16,185,129,0.25)" }}>
                Run my first audit <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex-1 rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>Credits</p>
              <p className="mt-1 text-2xl font-bold" style={{ color: "#fff" }}>{creditsRemaining}</p>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full" style={{ width: `${creditPct}%`, background: creditPct > 30 ? "#10b981" : "#ef4444" }} />
              </div>
              <p className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>remaining this month</p>
            </div>
            <div className="flex-1 rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>Monitor Alerts</p>
              <p className="mt-1 text-2xl font-bold" style={{ color: changeCount > 0 ? "#f59e0b" : "#fff" }}>{changeCount}</p>
              <p className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{changeCount > 0 ? "changes detected" : "no recent changes"}</p>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold" style={{ color: "#fff" }}>Your priorities right now</h2>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Fix these first — biggest impact, easiest wins</p>
            </div>
            <Link href="/dashboard/priorities" className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors" style={{ color: "#10b981", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>See all <ChevronRight className="h-3.5 w-3.5" /></Link>
          </div>

          {domain ? <PriorityCardServer domain={domain} limit={3} /> : (
            <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}>
              <AlertCircle className="mx-auto mb-2 h-8 w-8" style={{ color: "rgba(255,255,255,0.2)" }} />
              <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>No domain set. Go to <Link href="/dashboard/settings" style={{ color: "#10b981" }}>Settings</Link> to add your domain.</p>
            </div>
          )}
        </div>

        {recentChanges.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: "#fff" }}>Monitor alerts</h2>
              <Link href="/dashboard/monitor" className="flex items-center gap-1 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>View all <ChevronRight className="h-3.5 w-3.5" /></Link>
            </div>
            <div className="space-y-2">
              {recentChanges.map((c: any, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <Eye className="h-4 w-4 shrink-0" style={{ color: "#f59e0b" }} />
                  <span className="flex-1 truncate text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{c.url}</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{c.changeType ?? "changed"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="mb-3 text-lg font-bold" style={{ color: "#fff" }}>Other tools</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Rankings", desc: "Check keyword positions", href: "/dashboard/rankings", icon: TrendingUp },
              { label: "Content Studio", desc: "Generate SEO content", href: "/dashboard/content", icon: CheckCircle2 },
              { label: "Competitors", desc: "Benchmark vs rivals", href: "/dashboard/competitors", icon: Eye },
            ].map(({ label, desc, href, icon: Icon }) => (
              <Link key={href} href={href} className="group flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(255,255,255,0.06)" }}><Icon className="h-4 w-4" style={{ color: "rgba(255,255,255,0.5)" }} /></div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#fff" }}>{label}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{desc}</p>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" style={{ color: "rgba(255,255,255,0.3)" }} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
