import { auth } from "@/lib/auth";
import { auditApi } from "@/lib/api-client";
import { prioritiseIssues } from "@/lib/fix-guides";
import { PriorityCardClient } from "./priority-card-client";

export async function PriorityCardServer({
  domain,
  limit = 3,
}: {
  domain: string;
  limit?: number;
}) {
  const session = await auth();
  const apiKey = (session?.user as { seoApiKey?: string })?.seoApiKey;

  if (!apiKey) return null;

  try {
    const res = await auditApi.technical(apiKey, {
      domain: domain.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      maxPages: 10,
    }) as any;

    const data = res?.data ?? res;
    const rawIssues = data?.issues ?? data?.pages?.flatMap((p: any) => p.issues ?? []) ?? [];
    const priorities = prioritiseIssues(rawIssues, limit > 0 ? limit : rawIssues.length);

    if (priorities.length === 0) {
      return (
        <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "rgba(16,185,129,0.1)" }}>
            <span className="text-2xl">🎉</span>
          </div>
          <p className="font-semibold" style={{ color: "#fff" }}>No critical issues found!</p>
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Your site looks healthy. We will keep monitoring and alert you if anything changes.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {priorities.map((priority, i) => (
          <PriorityCardClient key={`${priority.type}-${i}`} priority={priority} index={i} domain={domain} />
        ))}
      </div>
    );
  } catch (err: any) {
    if (err?.status === 402 || err?.code === "INSUFFICIENT_CREDITS") {
      return (
        <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <p className="font-medium" style={{ color: "#fff" }}>Out of credits</p>
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Upgrade your plan to run more audits. <a href="/dashboard/billing" style={{ color: "#10b981" }}>View plans</a></p>
        </div>
      );
    }
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Could not load priorities. <a href="/dashboard/audit" style={{ color: "#10b981" }}>Run an audit</a></p>
      </div>
    );
  }
}
