import { auth } from "@/lib/auth";
import { PriorityCardServer } from "@/components/ui/priority-card-server";

export default async function PrioritiesPage() {
  const session = await auth();
  const domain = (session?.user as { seoDomain?: string })?.seoDomain ?? "";

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Your fix list</h1>
          <p className="mt-1 text-base text-ink-2">Every issue on {domain || "your site"}, ranked by impact. Fix from top to bottom.</p>
        </div>

        <div className="rounded-xl border border-meridian-100 bg-success-bg p-4">
          <p className="text-sm text-ink-2">
            <span className="font-bold text-success">How this works:</span> Each card below is a real issue found on your site. Click to expand for a step-by-step fix guide written in plain English. Once you&apos;ve made the fix, click &quot;I fixed this — check again&quot; and we&apos;ll rescan to confirm and update your score.
          </p>
        </div>

        {domain ? <PriorityCardServer domain={domain} limit={0} /> : (
          <div className="rounded-xl border border-dashed border-meridian-100 bg-canvas p-8 text-center">
            <p className="text-sm text-ink-3">Set your domain in <a href="/dashboard/settings" className="font-medium text-meridian-600 hover:underline">Settings</a> to see your priorities.</p>
          </div>
        )}
      </div>
    </div>
  );
}
