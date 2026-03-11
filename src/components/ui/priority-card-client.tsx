"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ChevronDown, ChevronRight, CheckCircle2, Loader2,
  Zap, AlertTriangle, Copy, Check
} from "lucide-react";
import { recheckIssue } from "@/actions/priorities";
import type { FixGuide } from "@/lib/fix-guides";

const DIFFICULTY_CONFIG = {
  easy:   { label: "Easy fix", color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.2)" },
  medium: { label: "Medium",   color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)" },
  hard:   { label: "Advanced", color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.2)" },
};

const IMPACT_CONFIG = {
  high:   { label: "High impact",   color: "#ef4444" },
  medium: { label: "Medium impact", color: "#f59e0b" },
  low:    { label: "Low impact",    color: "#6b7280" },
};

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="relative mt-2 rounded-xl overflow-hidden"
      style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors"
        style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="overflow-x-auto p-4 text-xs" style={{ color: "#a5f3c0", fontFamily: "monospace" }}>
        {code}
      </pre>
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
      <div
        className="flex items-center gap-3 rounded-2xl px-5 py-4"
        style={{
          background: "rgba(16,185,129,0.06)",
          border: "1px solid rgba(16,185,129,0.2)",
        }}
      >
        <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: "#10b981" }} />
        <div className="flex-1">
          <p className="font-semibold text-sm line-through" style={{ color: "rgba(255,255,255,0.5)" }}>
            {guide.title}
          </p>
          <p className="text-xs" style={{ color: "#10b981" }}>Fixed! Score updated.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: expanded ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.04)",
        border: expanded ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <button
        className="flex w-full items-start gap-4 px-5 py-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
          style={{
            background: `${impact.color}18`,
            color: impact.color,
            border: `1px solid ${impact.color}30`,
          }}
        >
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sm" style={{ color: "#fff" }}>{guide.title}</span>
          </div>
          <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            {guide.why.length > 90 ? guide.why.slice(0, 90) + "…" : guide.why}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ background: difficulty.bg, color: difficulty.color, border: `1px solid ${difficulty.border}` }}
            >
              <Zap className="h-2.5 w-2.5" /> {difficulty.label}
            </span>
            <span className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              {guide.timeEstimate}
            </span>
            <span className="flex items-center gap-1 text-xs" style={{ color: impact.color }}>
              <AlertTriangle className="h-3 w-3" /> {impact.label}
            </span>
          </div>
        </div>

        <div className="shrink-0 mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t px-5 pb-5" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>Why this matters</p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{guide.why}</p>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
              How to fix it — step by step
            </p>
            <div className="space-y-4">
              {guide.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold mt-0.5"
                    style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: "#fff" }}>{step.title}</p>
                    <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{step.detail}</p>
                    {step.code && <CodeBlock code={step.code} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {guide.proTip && (
            <div
              className="mt-4 rounded-xl p-4"
              style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: "#fbbf24" }}>💡 Pro tip</p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>{guide.proTip}</p>
            </div>
          )}

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handleMarkDone}
              disabled={checking}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#fff",
                boxShadow: "0 4px 16px rgba(16,185,129,0.25)",
                opacity: checking ? 0.7 : 1,
              }}
            >
              {checking ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Checking…</>
              ) : (
                <><CheckCircle2 className="h-4 w-4" /> I fixed this — check again</>
              )}
            </button>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              We&apos;ll re-scan and update your score
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
