"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, CheckCircle2, Loader2, Zap, AlertTriangle, Copy, Check } from "lucide-react";
import { recheckIssue } from "@/actions/priorities";
import type { FixGuide } from "@/lib/fix-guides";

const DIFFICULTY_CONFIG = {
  easy: { label: "Easy fix", color: "text-success", bg: "bg-success-bg", border: "border-success/30" },
  medium: { label: "Medium", color: "text-warning", bg: "bg-warning-bg", border: "border-warning/30" },
  hard: { label: "Advanced", color: "text-danger", bg: "bg-danger-bg", border: "border-danger/30" },
};

const IMPACT_CONFIG = {
  high: { label: "High impact", color: "#A32D2D" },
  medium: { label: "Medium impact", color: "#BA7517" },
  low: { label: "Low impact", color: "#7A94B0" },
};

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="relative mt-2 overflow-hidden rounded-xl border border-meridian-100 bg-meridian-50 p-4">
      <button onClick={handleCopy} className="absolute right-2 top-2 flex items-center gap-1 rounded-md border border-meridian-100 bg-white px-2 py-1 text-xs font-medium text-ink-2 transition-colors hover:bg-canvas">
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="overflow-x-auto pr-16 font-mono text-xs text-ink-2">{code}</pre>
    </div>
  );
}

export function PriorityCardClient({
  priority,
  index,
  domain,
}: {
  priority: { type: string; severity: string; guide: FixGuide; url?: string };
  index: number;
  domain: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [done, setDone] = useState(false);
  const [checking, setChecking] = useState(false);
  const { guide } = priority;
  const difficulty = DIFFICULTY_CONFIG[guide.difficulty];
  const impact = IMPACT_CONFIG[guide.impact];

  async function handleMarkDone() {
    setChecking(true);
    try {
      const result = await recheckIssue(domain, priority.type);
      if (result.fixed) {
        setDone(true);
        toast.success(result.message, { duration: 5000 });
      } else {
        toast.error(result.message, { duration: 5000 });
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Couldn't re-check. Try again.");
    } finally {
      setChecking(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-meridian-100 bg-success-bg px-5 py-4">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink-3 line-through">{guide.title}</p>
          <p className="text-xs font-medium text-success">Fixed! Score updated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-meridian-100 border-l-4 bg-white transition-all duration-200" style={{ borderLeftColor: impact.color }}>
      <button className="flex w-full items-start gap-4 px-5 py-4 text-left" onClick={() => setExpanded(!expanded)}>
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: `${impact.color}18`, color: impact.color, border: `1px solid ${impact.color}40` }}>
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-sm font-bold text-ink">{guide.title}</span>
          <p className="mt-0.5 text-xs text-ink-3">{guide.why.length > 90 ? guide.why.slice(0, 90) + "…" : guide.why}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold ${difficulty.bg} ${difficulty.color} ${difficulty.border}`}>
              <Zap className="h-2.5 w-2.5" /> {difficulty.label}
            </span>
            <span className="text-xs text-ink-3">{guide.timeEstimate}</span>
            <span className="flex items-center gap-1 text-xs" style={{ color: impact.color }}>
              <AlertTriangle className="h-3 w-3" /> {impact.label}
            </span>
          </div>
        </div>
        <div className="mt-1 shrink-0 text-ink-3">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-meridian-100 px-5 pb-5 pt-0">
          <div className="mt-4 rounded-xl border border-meridian-100 bg-canvas p-4">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">Why this matters</p>
            <p className="text-sm leading-relaxed text-ink-2">{guide.why}</p>
          </div>
          <div className="mt-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">How to fix it — step by step</p>
            <div className="space-y-4">
              {guide.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-success/30 bg-success-bg text-xs font-bold text-success">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-ink">{step.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-2">{step.detail}</p>
                    {step.code && <CodeBlock code={step.code} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {guide.proTip && (
            <div className="mt-4 rounded-xl border border-warning/30 bg-warning-bg p-4">
              <p className="mb-1 text-xs font-bold text-warning">💡 Pro tip</p>
              <p className="text-sm leading-relaxed text-ink-2">{guide.proTip}</p>
            </div>
          )}
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handleMarkDone}
              disabled={checking}
              className="flex items-center gap-2 rounded-lg bg-meridian-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-meridian-800 disabled:opacity-70"
            >
              {checking ? <><Loader2 className="h-4 w-4 animate-spin" /> Checking…</> : <><CheckCircle2 className="h-4 w-4" /> I fixed this — check again</>}
            </button>
            <p className="text-xs text-ink-3">We&apos;ll re-scan and update your score</p>
          </div>
        </div>
      )}
    </div>
  );
}
