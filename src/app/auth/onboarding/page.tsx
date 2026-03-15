"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { runTechnicalAudit } from "@/actions/audit";
import { prioritiseIssues } from "@/lib/fix-guides";
import { CheckCircle2, ChevronRight, Loader2, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

type Step = "domain" | "scanning" | "reveal";

const DIFFICULTY_LABEL: Record<string, string> = { easy: "5 min fix", medium: "30 min fix", hard: "1–2 hr fix" };
const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "bg-success-bg text-success border-success/30",
  medium: "bg-warning-bg text-warning border-warning/30",
  hard: "bg-danger-bg text-danger border-danger/30",
};
const IMPACT_COLOR: Record<string, string> = { high: "#A32D2D", medium: "#BA7517", low: "#7A94B0" };

const SCAN_STEPS = [
  "Crawling your pages…",
  "Checking meta tags…",
  "Analysing headings…",
  "Testing page speed…",
  "Checking mobile friendliness…",
  "Auditing internal links…",
  "Scanning images…",
  "Analysing content quality…",
  "Compiling results…",
];

function ScoreArc({ score }: { score: number }) {
  const size = 200;
  const strokeWidth = 14;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = 210;
  const sweep = 240;
  const endAngle = startAngle + sweep * (score / 100);

  function polar(angle: number, radius = r) {
    const a = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  }

  function arcPath(from: number, to: number) {
    const s = polar(from);
    const e = polar(to);
    const largeArc = to - from > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  const color = score >= 80 ? "#1D9E75" : score >= 50 ? "#BA7517" : "#A32D2D";
  const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 50 ? "D" : "F";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        <path d={arcPath(startAngle, startAngle + sweep)} fill="none" stroke="#E6F1FB" strokeWidth={strokeWidth} strokeLinecap="round" />
        <path d={arcPath(startAngle, endAngle)} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" className="transition-all duration-[1.5s] ease-out" style={{ filter: `drop-shadow(0 0 8px ${color}40)` }} />
      </svg>
      <div className="relative z-10 text-center">
        <div className="text-6xl font-extrabold tabular-nums tracking-tight" style={{ color }}>{score}</div>
        <div className="text-sm font-medium text-ink-3">out of 100</div>
        <div className="mt-1 inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold" style={{ background: `${color}18`, color, borderColor: `${color}40` }}>Grade {grade}</div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState<Step>("domain");
  const [domain, setDomain] = useState((session?.user as { seoDomain?: string })?.seoDomain ?? "");
  const [scanIndex, setScanIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [priorities, setPriorities] = useState<any[]>([]);
  const [totalIssues, setTotalIssues] = useState(0);
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (step !== "scanning") return;
    const interval = setInterval(() => setScanIndex((i) => Math.min(i + 1, SCAN_STEPS.length - 1)), 1400);
    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    if (step === "reveal") {
      const t = setTimeout(() => setRevealed(true), 300);
      return () => clearTimeout(t);
    }
  }, [step]);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    const clean = domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!clean) { setError("Please enter your domain"); return; }
    setError("");
    setStep("scanning");
    setScanIndex(0);

    try {
      const res = await runTechnicalAudit({ domain: clean, maxPages: 10 }) as any;
      const data = res?.data ?? res;
      const rawIssues = data?.issues ?? data?.pages?.flatMap((p: any) => p.issues ?? []) ?? [];
      const auditScore = data?.score ?? Math.max(0, 100 - rawIssues.length * 4);
      const top = prioritiseIssues(rawIssues, 3);

      setScore(auditScore);
      setPriorities(top);
      setTotalIssues(rawIssues.length);
      setStep("reveal");
    } catch (err: any) {
      setError(err?.message ?? "Scan failed. Please check your domain and try again.");
      setStep("domain");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-lg animate-fade-up">
        {step === "domain" && (
          <div className="rounded-xl border border-meridian-100 bg-white p-8 shadow-sm">
            <div className="mb-8">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-meridian-50">
                <Zap className="h-5 w-5 text-meridian-600" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-ink">Let&apos;s see where you stand.</h1>
              <p className="mt-2 text-base text-ink-2">Enter your domain and we&apos;ll run a full SEO scan in under 60 seconds — then show you exactly what to fix first.</p>
            </div>

            <form onSubmit={handleScan} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Your website domain</label>
                <div className="flex items-center gap-2 rounded-xl border border-meridian-100 bg-canvas px-4">
                  <span className="text-sm text-ink-4">https://</span>
                  <input
                    type="text"
                    placeholder="yourdomain.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="flex-1 bg-transparent py-3 text-base text-ink outline-none placeholder:text-ink-4"
                    autoFocus
                  />
                </div>
                {error && <p className="mt-2 flex items-center gap-1.5 text-sm text-danger"><AlertCircle className="h-4 w-4 shrink-0" /> {error}</p>}
              </div>

              <Button type="submit" className="group w-full py-3.5 text-base">
                Scan my site <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-ink-3">Free scan · No credit card · Results in ~60 seconds</p>
          </div>
        )}

        {step === "scanning" && (
          <div className="rounded-xl border border-meridian-100 bg-white p-8 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-meridian-50">
              <Loader2 className="h-10 w-10 animate-spin text-meridian-600" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-ink">Scanning {domain}…</h2>
            <p className="mt-2 text-sm text-ink-2">This takes about 60 seconds. Don&apos;t close this page.</p>

            <div className="mt-8 space-y-2 text-left">
              {SCAN_STEPS.map((s, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all duration-500 ${i <= scanIndex ? "opacity-100" : "opacity-25"} ${i === scanIndex ? "translate-x-1 bg-meridian-50" : ""}`}
                >
                  {i < scanIndex ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> : i === scanIndex ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-meridian-600" /> : <div className="h-4 w-4 shrink-0 rounded-full border border-meridian-200" />}
                  <span className={`text-sm ${i <= scanIndex ? "text-ink" : "text-ink-3"}`}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "reveal" && (
          <div className="overflow-hidden rounded-xl border border-meridian-100 bg-white">
            <div className="border-b border-meridian-100 bg-success-bg/30 px-8 py-8 text-center">
              <p className="mb-2 text-sm font-medium text-ink-2">Your SEO Score for {domain}</p>
              <div className="mx-auto transition-all duration-500 ease-out" style={{ opacity: revealed ? 1 : 0, transform: revealed ? "scale(1)" : "scale(0.8)" }}>
                <ScoreArc score={revealed ? score : 0} />
              </div>
              <p className="mt-3 text-sm text-ink-2" style={{ opacity: revealed ? 1 : 0, transition: "opacity 0.5s ease 0.8s" }}>{totalIssues} issue{totalIssues !== 1 ? "s" : ""} found across your site</p>
            </div>

            <div className="px-6 pb-6">
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">Your top {priorities.length} priorities</h3>

              <div className="space-y-2">
                {priorities.map((p, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-meridian-100 bg-canvas p-4 transition-all duration-500"
                    style={{ opacity: revealed ? 1 : 0, transform: revealed ? "translateY(0)" : "translateY(12px)", transitionDelay: revealed ? `${600 + i * 150}ms` : "0ms" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: `${IMPACT_COLOR[p.guide?.impact ?? "medium"]}20`, color: IMPACT_COLOR[p.guide?.impact ?? "medium"], border: `1px solid ${IMPACT_COLOR[p.guide?.impact ?? "medium"]}40` }}>{i + 1}</div>
                        <div>
                          <p className="text-sm font-bold text-ink">{p.guide?.title ?? p.type}</p>
                          <p className="mt-0.5 text-xs text-ink-3">{p.guide?.why?.slice(0, 80)}…</p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLOR[p.guide?.difficulty ?? "medium"]}`}>{DIFFICULTY_LABEL[p.guide?.difficulty ?? "medium"]}</span>
                    </div>
                  </div>
                ))}

                {priorities.length === 0 && (
                  <div className="rounded-xl border border-meridian-100 bg-success-bg p-6 text-center">
                    <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-success" />
                    <p className="font-bold text-ink">No critical issues found!</p>
                    <p className="mt-1 text-sm text-ink-2">Your site is in great shape. We&apos;ll monitor it and alert you if anything changes.</p>
                  </div>
                )}
              </div>

              <Button onClick={() => router.push("/dashboard")} className="mt-4 w-full py-3.5 text-base" style={{ opacity: revealed ? 1 : 0, transition: "opacity 0.5s ease 1.2s" }}>
                Go to my dashboard <ChevronRight className="h-4 w-4" />
              </Button>

              <p className="mt-3 text-center text-xs text-ink-3">We&apos;ll monitor your site daily and send a weekly progress report</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
