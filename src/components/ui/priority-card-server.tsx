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
        <div className="flex flex-col items-center justify-center rounded-xl border border-magneta-100 bg-success-bg py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-success-bg">
            <span className="text-2xl">🎉</span>
          </div>
          <p className="text-sm font-bold text-ink">No critical issues found!</p>
          <p className="mt-1 text-xs text-ink-3">Your site looks healthy. We&apos;ll keep monitoring and alert you if anything changes.</p>
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
        <div className="rounded-xl border border-danger bg-danger-bg p-6 text-center">
          <p className="font-bold text-ink">Out of credits</p>
          <p className="mt-1 text-sm text-ink-3">Upgrade your plan to run more audits. <a href="/dashboard/billing" className="font-medium text-magneta-600 hover:underline">View plans</a></p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-magneta-100 bg-canvas py-12 text-center">
        <p className="text-sm text-ink-3">Could not load priorities. <a href="/dashboard/audit" className="font-medium text-magneta-600 hover:underline">Run an audit</a></p>
      </div>
    );
  }
}
