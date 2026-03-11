import { auth } from "@/lib/auth";
import { PriorityCardServer } from "@/components/ui/priority-card-server";

export default async function PrioritiesPage() {
  const session = await auth();
  const domain = (session?.user as { seoDomain?: string })?.seoDomain ?? "";

  return (
    <div className="min-h-full" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-black" style={{ color: "#fff", fontFamily: "'DM Serif Display', Georgia, serif", letterSpacing: "-0.02em" }}>Your fix list</h1>
          <p className="mt-1 text-base" style={{ color: "rgba(255,255,255,0.45)" }}>Every issue on {domain || "your site"}, ranked by impact. Fix from top to bottom.</p>
        </div>

        <div className="rounded-2xl p-4" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            <span style={{ color: "#10b981", fontWeight: 600 }}>How this works:</span> Each card below is a real issue found on your site. Click to expand for a step-by-step fix guide written in plain English. Once you&apos;ve made the fix, click &quot;I fixed this — check again&quot; and we&apos;ll rescan to confirm and update your score.
          </p>
        </div>

        {domain ? <PriorityCardServer domain={domain} limit={0} /> : (
          <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Set your domain in <a href="/dashboard/settings" style={{ color: "#10b981" }}>Settings</a> to see your priorities.</p>
          </div>
        )}
      </div>
    </div>
  );
}
