"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { runTechnicalAudit } from "@/actions/audit";
import { prioritiseIssues } from "@/lib/fix-guides";
import { CheckCircle2, ChevronRight, Loader2, AlertCircle, Zap } from "lucide-react";

type Step = "domain" | "scanning" | "reveal";

const DIFFICULTY_LABEL: Record<string, string> = { easy: "5 min fix", medium: "30 min fix", hard: "1–2 hr fix" };
const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  hard: "bg-red-500/15 text-red-400 border-red-500/20",
};
const IMPACT_COLOR: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#6b7280" };

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

  const color = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 50 ? "D" : "F";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        <path d={arcPath(startAngle, startAngle + sweep)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} strokeLinecap="round" />
        <path d={arcPath(startAngle, endAngle)} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${color}80)`, transition: "all 1.5s cubic-bezier(0.16, 1, 0.3, 1)" }} />
      </svg>
      <div className="relative z-10 text-center">
        <div className="text-6xl font-black tabular-nums" style={{ color, fontFamily: "'DM Serif Display', Georgia, serif" }}>{score}</div>
        <div className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>out of 100</div>
        <div className="mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-bold" style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>Grade {grade}</div>
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(16,185,129,0.12) 0%, transparent 60%), #050a12", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div className="pointer-events-none fixed inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      <div className="relative w-full max-w-lg">
        {step === "domain" && (
          <div className="rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}>
            <div className="mb-8">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                <Zap className="h-5 w-5" style={{ color: "#10b981" }} />
              </div>
              <h1 className="text-3xl font-black" style={{ color: "#fff", fontFamily: "'DM Serif Display', Georgia, serif", letterSpacing: "-0.02em" }}>Let&apos;s see where you stand.</h1>
              <p className="mt-2 text-base" style={{ color: "rgba(255,255,255,0.5)" }}>Enter your domain and we&apos;ll run a full SEO scan in under 60 seconds — then show you exactly what to fix first.</p>
            </div>

            <form onSubmit={handleScan} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Your website domain</label>
                <div className="flex gap-2">
                  <div className="flex flex-1 items-center gap-2 rounded-xl px-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>https://</span>
                    <input type="text" placeholder="yourdomain.com" value={domain} onChange={(e) => setDomain(e.target.value)} className="flex-1 bg-transparent py-3 text-base outline-none" style={{ color: "#fff", caretColor: "#10b981" }} autoFocus />
                  </div>
                </div>
                {error && <p className="mt-2 flex items-center gap-1.5 text-sm" style={{ color: "#ef4444" }}><AlertCircle className="h-4 w-4 shrink-0" /> {error}</p>}
              </div>

              <button type="submit" className="group flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-semibold transition-all" style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", boxShadow: "0 4px 24px rgba(16,185,129,0.3)" }}>
                Scan my site <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>

            <p className="mt-4 text-center text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>Free scan · No credit card · Results in ~60 seconds</p>
          </div>
        )}

        {step === "scanning" && (
          <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}>
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full" style={{ background: "rgba(16,185,129,0.1)", border: "2px solid rgba(16,185,129,0.2)" }}>
              <Loader2 className="h-10 w-10 animate-spin" style={{ color: "#10b981" }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: "#fff", fontFamily: "'DM Serif Display', Georgia, serif" }}>Scanning {domain}…</h2>
            <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>This takes about 60 seconds. Don&apos;t close this page.</p>

            <div className="mt-8 space-y-2 text-left">
              {SCAN_STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all duration-500" style={{ opacity: i <= scanIndex ? 1 : 0.25, background: i === scanIndex ? "rgba(16,185,129,0.08)" : "transparent", transform: i === scanIndex ? "translateX(4px)" : "translateX(0)" }}>
                  {i < scanIndex ? <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#10b981" }} /> : i === scanIndex ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" style={{ color: "#10b981" }} /> : <div className="h-4 w-4 shrink-0 rounded-full" style={{ border: "1px solid rgba(255,255,255,0.15)" }} />}
                  <span className="text-sm" style={{ color: i <= scanIndex ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)" }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "reveal" && (
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}>
            <div className="px-8 py-8 text-center" style={{ background: "linear-gradient(to bottom, rgba(16,185,129,0.06), transparent)" }}>
              <p className="mb-2 text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>Your SEO Score for {domain}</p>
              <div className="mx-auto" style={{ opacity: revealed ? 1 : 0, transform: revealed ? "scale(1)" : "scale(0.8)", transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                <ScoreArc score={revealed ? score : 0} />
              </div>
              <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.5)", opacity: revealed ? 1 : 0, transition: "opacity 0.5s ease 0.8s" }}>{totalIssues} issue{totalIssues !== 1 ? "s" : ""} found across your site</p>
            </div>

            <div className="px-6 pb-6">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>Your top {priorities.length} priorities</h3>

              <div className="space-y-2">
                {priorities.map((p, i) => (
                  <div key={i} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", opacity: revealed ? 1 : 0, transform: revealed ? "translateY(0)" : "translateY(12px)", transition: `all 0.5s ease ${0.6 + i * 0.15}s` }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: `${IMPACT_COLOR[p.guide?.impact ?? "medium"]}20`, color: IMPACT_COLOR[p.guide?.impact ?? "medium"], border: `1px solid ${IMPACT_COLOR[p.guide?.impact ?? "medium"]}30` }}>{i + 1}</div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "#fff" }}>{p.guide?.title ?? p.type}</p>
                          <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{p.guide?.why?.slice(0, 80)}…</p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLOR[p.guide?.difficulty ?? "medium"]}`}>{DIFFICULTY_LABEL[p.guide?.difficulty ?? "medium"]}</span>
                    </div>
                  </div>
                ))}

                {priorities.length === 0 && (
                  <div className="rounded-xl p-6 text-center">
                    <CheckCircle2 className="mx-auto mb-2 h-8 w-8" style={{ color: "#10b981" }} />
                    <p className="font-medium" style={{ color: "#fff" }}>No critical issues found!</p>
                    <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Your site is in great shape. We&apos;ll monitor it and alert you if anything changes.</p>
                  </div>
                )}
              </div>

              <button onClick={() => router.push("/dashboard")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-semibold transition-all" style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", boxShadow: "0 4px 24px rgba(16,185,129,0.3)", opacity: revealed ? 1 : 0, transition: "opacity 0.5s ease 1.2s" }}>
                Go to my dashboard <ChevronRight className="h-4 w-4" />
              </button>

              <p className="mt-3 text-center text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>We&apos;ll monitor your site daily and send a weekly progress report</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
