"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Gauge, Bot, History, Layers, Link2, Camera } from "lucide-react";
import { runTechnicalAudit, runLighthouseAudit, runAgentAudit, getAuditHistory, runBatchAudit, runInternalLinksAudit, takeScreenshot } from "@/actions/audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreRing } from "@/components/ui/score-ring";
import { Badge } from "@/components/ui/badge";

// ─── Helpers ──────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 90) return "text-green-500";
  if (score >= 50) return "text-amber-500";
  return "text-destructive";
}

function ScoreBox({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-[6px] border border-border bg-muted/30 px-4 py-3">
      <span className={`text-2xl font-bold ${scoreColor(score)}`}>{score}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function CwvRow({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  if (value == null) return null;
  return (
    <div className="flex justify-between rounded-[6px] border border-border px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium">{Math.round(value)}{unit}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────

export default function AuditPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const [auditUrl, setAuditUrl] = useState("");
  const [auditDomain, setAuditDomain] = useState("");
  const [maxPages, setMaxPages] = useState(10);
  const [auditMode, setAuditMode] = useState<"url" | "domain">("url");
  const [technicalResult, setTechnicalResult] = useState<any>(null);

  const [lighthouseUrl, setLighthouseUrl] = useState("");
  const [lighthouseMobile, setLighthouseMobile] = useState(true);
  const [lighthouseResult, setLighthouseResult] = useState<any>(null);

  const [agentDomain, setAgentDomain] = useState("");
  const [agentResult, setAgentResult] = useState<any>(null);

  const [batchUrls, setBatchUrls] = useState("");
  const [batchResult, setBatchResult] = useState<any>(null);

  const [internalLinksDomain, setInternalLinksDomain] = useState("");
  const [internalLinksResult, setInternalLinksResult] = useState<any>(null);

  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [screenshotResult, setScreenshotResult] = useState<any>(null);

  const [history, setHistory] = useState<any[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  async function handleTechnical(e: React.FormEvent) {
    e.preventDefault();
    if (auditMode === "url" && !auditUrl.trim()) { toast.error("Enter a URL"); return; }
    if (auditMode === "domain" && !auditDomain.trim()) { toast.error("Enter a domain"); return; }
    setLoading("technical"); setTechnicalResult(null);
    try {
      const res = await runTechnicalAudit(
        auditMode === "url"
          ? { url: auditUrl.trim() }
          : { domain: auditDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""), maxPages }
      ) as any;
      const data = res?.data ?? res;
      const issues = data?.issues ?? data?.pages?.flatMap((p: any) => p.issues ?? []) ?? [];
      const critical = issues.filter((i: any) => i.severity === "critical").length;
      const warnings = issues.filter((i: any) => i.severity === "warning").length;
      const info = issues.filter((i: any) => i.severity === "info" || i.severity === "info").length;
      setTechnicalResult({
        score: data?.score ?? 0,
        summary: data?.summary ?? { critical, warnings, info },
        issues,
      });
      toast.success("Audit complete");
    } catch (err: any) {
      toast.error(err?.message ?? "Audit failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleLighthouse(e: React.FormEvent) {
    e.preventDefault();
    if (!lighthouseUrl.trim()) { toast.error("Enter a URL"); return; }
    setLoading("lighthouse"); setLighthouseResult(null);
    try {
      const res = await runLighthouseAudit({ url: lighthouseUrl.trim(), mobile: lighthouseMobile }) as any;
      setLighthouseResult(res?.data ?? res);
      toast.success("Lighthouse audit complete");
    } catch (err: any) {
      toast.error(err?.message ?? "Lighthouse failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleAgent(e: React.FormEvent) {
    e.preventDefault();
    if (!agentDomain.trim()) { toast.error("Enter a domain"); return; }
    setLoading("agent"); setAgentResult(null);
    try {
      const res = await runAgentAudit({ domain: agentDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "") }) as any;
      setAgentResult(res?.data ?? res);
      toast.success("Agent audit complete");
    } catch (err: any) {
      toast.error(err?.message ?? "Agent audit failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleBatchAudit(e: React.FormEvent) {
    e.preventDefault();
    const urls = batchUrls.split("\n").map((u) => u.trim()).filter(Boolean);
    if (!urls.length) { toast.error("Enter at least one URL"); return; }
    setLoading("batch"); setBatchResult(null);
    try {
      const res = await runBatchAudit({ urls }) as any;
      setBatchResult(res?.data ?? res);
      toast.success(`Batch audit started for ${urls.length} URLs`);
    } catch (err: any) {
      toast.error(err?.message ?? "Batch audit failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleInternalLinks(e: React.FormEvent) {
    e.preventDefault();
    if (!internalLinksDomain.trim()) { toast.error("Enter a domain"); return; }
    setLoading("internal-links"); setInternalLinksResult(null);
    try {
      const res = await runInternalLinksAudit({
        domain: internalLinksDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""),
      }) as any;
      setInternalLinksResult(res?.data ?? res);
      toast.success("Internal links audit complete");
    } catch (err: any) {
      toast.error(err?.message ?? "Internal links audit failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleScreenshot(e: React.FormEvent) {
    e.preventDefault();
    if (!screenshotUrl.trim()) { toast.error("Enter a URL"); return; }
    setLoading("screenshot"); setScreenshotResult(null);
    try {
      const res = await takeScreenshot({ url: screenshotUrl.trim() }) as any;
      setScreenshotResult(res?.data ?? res);
      toast.success("Screenshot captured");
    } catch (err: any) {
      toast.error(err?.message ?? "Screenshot failed");
    } finally {
      setLoading(null);
    }
  }

  async function loadHistory() {
    if (historyLoaded) return;
    try {
      const res = await getAuditHistory({ limit: "20" }) as any;
      const rows = Array.isArray(res) ? res : res?.data ?? res?.history ?? [];
      setHistory(rows);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoaded(true);
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Audit</h1>
        <p className="text-muted-foreground">Technical SEO, Core Web Vitals, and AI-powered audits</p>
      </div>

      <Tabs defaultValue="technical" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="technical" className="gap-2">
            <ShieldCheck className="h-4 w-4" /> Technical
          </TabsTrigger>
          <TabsTrigger value="lighthouse" className="gap-2">
            <Gauge className="h-4 w-4" /> Lighthouse
          </TabsTrigger>
          <TabsTrigger value="agent" className="gap-2">
            <Bot className="h-4 w-4" /> AI Agent
          </TabsTrigger>
          <TabsTrigger value="batch" className="gap-2">
            <Layers className="h-4 w-4" /> Batch
          </TabsTrigger>
          <TabsTrigger value="internal-links" className="gap-2">
            <Link2 className="h-4 w-4" /> Internal Links
          </TabsTrigger>
          <TabsTrigger value="screenshot" className="gap-2">
            <Camera className="h-4 w-4" /> Screenshot
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2" onClick={loadHistory}>
            <History className="h-4 w-4" /> History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="technical">
          <Card>
            <CardHeader>
              <CardTitle>Technical SEO Audit</CardTitle>
              <p className="text-sm text-muted-foreground">Crawl a URL or full domain for on-page issues</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                {(["url", "domain"] as const).map((m) => (
                  <label key={m} className="flex cursor-pointer items-center gap-2 capitalize">
                    <input type="radio" name="auditMode" checked={auditMode === m} onChange={() => setAuditMode(m)} />
                    {m === "url" ? "Single URL" : "Full Domain"}
                  </label>
                ))}
              </div>
              <form onSubmit={handleTechnical} className="flex flex-wrap gap-4">
                {auditMode === "url" ? (
                  <div className="min-w-[280px] flex-1 space-y-2">
                    <Label>URL</Label>
                    <Input placeholder="https://example.com/page" value={auditUrl} onChange={(e) => setAuditUrl(e.target.value)} disabled={!!loading} />
                  </div>
                ) : (
                  <>
                    <div className="min-w-[200px] flex-1 space-y-2">
                      <Label>Domain</Label>
                      <Input placeholder="example.com" value={auditDomain} onChange={(e) => setAuditDomain(e.target.value)} disabled={!!loading} />
                    </div>
                    <div className="w-28 space-y-2">
                      <Label>Max pages</Label>
                      <Input type="number" min={1} max={100} value={maxPages} onChange={(e) => setMaxPages(parseInt(e.target.value) || 10)} disabled={!!loading} />
                    </div>
                  </>
                )}
                <div className="flex items-end">
                  <Button type="submit" disabled={!!loading}>
                    {loading === "technical" ? "Running…" : "Run Audit"}
                  </Button>
                </div>
              </form>

              {technicalResult && (
                <div className="mt-4 space-y-6">
                  <div className="flex items-center gap-6">
                    <ScoreRing score={technicalResult.score} />
                    {technicalResult.summary && (
                      <div className="flex gap-4">
                        <div><p className="text-2xl font-bold text-destructive">{technicalResult.summary.critical ?? 0}</p><p className="text-xs text-muted-foreground">Critical</p></div>
                        <div><p className="text-2xl font-bold text-amber-500">{technicalResult.summary.warnings ?? 0}</p><p className="text-xs text-muted-foreground">Warnings</p></div>
                        <div><p className="text-2xl font-bold text-blue-500">{technicalResult.summary.info ?? 0}</p><p className="text-xs text-muted-foreground">Info</p></div>
                      </div>
                    )}
                  </div>
                  {technicalResult.issues?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Issues</h3>
                      {technicalResult.issues.map((issue: any, i: number) => (
                        <div key={i} className="rounded-[6px] border border-border bg-muted/30 p-3">
                          <div className="flex items-center gap-2">
                            <Badge variant={issue.severity === "critical" ? "destructive" : issue.severity === "warning" ? "medium" : "outline"}>
                              {issue.severity ?? issue.type}
                            </Badge>
                            <span className="font-medium">{issue.type ?? issue.title ?? "Issue"}</span>
                          </div>
                          {issue.description && <p className="mt-2 text-sm text-muted-foreground">{issue.description}</p>}
                          {issue.recommendation && <p className="mt-1 text-sm text-primary">{issue.recommendation}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lighthouse">
          <Card>
            <CardHeader>
              <CardTitle>Lighthouse / Core Web Vitals</CardTitle>
              <p className="text-sm text-muted-foreground">Performance, SEO, Accessibility scores via Google PageSpeed Insights</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLighthouse} className="flex flex-wrap gap-4">
                <div className="min-w-[280px] flex-1 space-y-2">
                  <Label>URL</Label>
                  <Input placeholder="https://example.com" value={lighthouseUrl} onChange={(e) => setLighthouseUrl(e.target.value)} disabled={!!loading} />
                </div>
                <div className="w-36 space-y-2">
                  <Label>Strategy</Label>
                  <select
                    className="flex h-10 w-full rounded-[6px] border border-input bg-background px-3 py-2 text-sm"
                    value={lighthouseMobile ? "mobile" : "desktop"}
                    onChange={(e) => setLighthouseMobile(e.target.value === "mobile")}
                    disabled={!!loading}
                  >
                    <option value="mobile">Mobile</option>
                    <option value="desktop">Desktop</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={!!loading}>
                    {loading === "lighthouse" ? "Running…" : "Run Lighthouse"}
                  </Button>
                </div>
              </form>

              {lighthouseResult && (
                <div className="mt-4 space-y-6">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <ScoreBox label="Performance" score={lighthouseResult.scores?.performance ?? 0} />
                    <ScoreBox label="SEO" score={lighthouseResult.scores?.seo ?? 0} />
                    <ScoreBox label="Accessibility" score={lighthouseResult.scores?.accessibility ?? 0} />
                    <ScoreBox label="Best Practices" score={lighthouseResult.scores?.bestPractices ?? 0} />
                  </div>

                  {lighthouseResult.cwv && (
                    <div>
                      <h3 className="mb-2 font-medium">Core Web Vitals</h3>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <CwvRow label="LCP – Largest Contentful Paint" value={lighthouseResult.cwv.lcp} unit="ms" />
                        <CwvRow label="FCP – First Contentful Paint" value={lighthouseResult.cwv.fcp} unit="ms" />
                        <CwvRow label="TBT – Total Blocking Time" value={lighthouseResult.cwv.tbt} unit="ms" />
                        <CwvRow label="TTFB – Time to First Byte" value={lighthouseResult.cwv.ttfb} unit="ms" />
                        {lighthouseResult.cwv.cls != null && (
                          <div className="flex justify-between rounded-[6px] border border-border px-3 py-2 text-sm">
                            <span className="text-muted-foreground">CLS – Cumulative Layout Shift</span>
                            <span className="font-mono font-medium">{lighthouseResult.cwv.cls?.toFixed(3)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {lighthouseResult.fieldData?.overallCategory && (
                    <div className="rounded-[6px] border border-border bg-muted/30 p-3">
                      <p className="text-sm font-medium">Real User Data (Chrome UX Report)</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Overall: <span className="font-medium capitalize">{lighthouseResult.fieldData.overallCategory.toLowerCase().replace(/_/g, " ")}</span>
                      </p>
                    </div>
                  )}

                  {lighthouseResult.seoIssues?.length > 0 && (
                    <div>
                      <h3 className="mb-2 font-medium">SEO Issues ({lighthouseResult.seoIssues.length})</h3>
                      <div className="space-y-2">
                        {lighthouseResult.seoIssues.map((issue: any, i: number) => (
                          <div key={i} className="rounded-[6px] border border-border bg-muted/30 p-3">
                            <div className="flex items-center gap-2">
                              <Badge variant={issue.severity === "critical" ? "destructive" : "medium"}>
                                {issue.severity}
                              </Badge>
                              <span className="text-sm font-medium">{issue.title}</span>
                            </div>
                            {issue.displayValue && <p className="mt-1 text-xs text-muted-foreground">{issue.displayValue}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {lighthouseResult.opportunities?.length > 0 && (
                    <div>
                      <h3 className="mb-2 font-medium">Performance Opportunities</h3>
                      <div className="space-y-2">
                        {lighthouseResult.opportunities.map((opp: any, i: number) => (
                          <div key={i} className="flex items-center justify-between rounded-[6px] border border-border bg-muted/30 px-3 py-2">
                            <span className="text-sm">{opp.title}</span>
                            <span className="font-mono text-xs text-amber-500">−{opp.savingsMs ?? opp.savings ?? "?"}ms</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agent">
          <Card>
            <CardHeader>
              <CardTitle>AI Agent Audit</CardTitle>
              <p className="text-sm text-muted-foreground">
                DeerFlow multi-agent analysis — Technical, Lighthouse, Search Console, Competitors, and prioritised recommendations in one pass
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAgent} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Domain</Label>
                  <Input placeholder="example.com" value={agentDomain} onChange={(e) => setAgentDomain(e.target.value)} disabled={!!loading} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={!!loading}>
                    {loading === "agent" ? "Running agents…" : "Run Full AI Audit"}
                  </Button>
                </div>
              </form>
              {loading === "agent" && (
                <div className="animate-pulse rounded-[6px] border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  Running 5 agents in parallel… this takes 30–90 seconds.
                </div>
              )}
              {agentResult && (
                <div className="mt-4 space-y-4">
                  {agentResult.summary && (
                    <div className="rounded-[6px] border border-border bg-muted/30 p-4">
                      <h3 className="mb-2 font-medium">Summary</h3>
                      <p className="text-sm text-muted-foreground">{agentResult.summary}</p>
                    </div>
                  )}
                  {agentResult.recommendations?.length > 0 && (
                    <div>
                      <h3 className="mb-2 font-medium">Prioritised Recommendations</h3>
                      <div className="space-y-2">
                        {agentResult.recommendations.map((rec: any, i: number) => (
                          <div key={i} className="rounded-[6px] border border-border bg-muted/30 p-3">
                            <div className="flex items-center gap-2">
                              <Badge variant={rec.priority === "critical" ? "destructive" : rec.priority === "high" ? "medium" : "outline"}>
                                {rec.priority ?? "medium"}
                              </Badge>
                              <span className="text-sm font-medium">{rec.title ?? rec.action}</span>
                            </div>
                            {rec.description && <p className="mt-1 text-sm text-muted-foreground">{rec.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {!agentResult.summary && !agentResult.recommendations && (
                    <pre className="max-h-[400px] overflow-auto rounded-[6px] border border-border bg-muted/30 p-4 text-xs">
                      {JSON.stringify(agentResult, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>Batch Audit</CardTitle>
              <p className="text-sm text-muted-foreground">Audit multiple URLs in parallel (one per line)</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleBatchAudit} className="space-y-4">
                <div className="space-y-2">
                  <Label>URLs (one per line)</Label>
                  <textarea
                    className="flex min-h-[120px] w-full rounded-[6px] border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder={"https://example.com/page-1\nhttps://example.com/page-2\nhttps://example.com/page-3"}
                    value={batchUrls}
                    onChange={(e) => setBatchUrls(e.target.value)}
                    disabled={!!loading}
                  />
                </div>
                <Button type="submit" disabled={!!loading}>
                  {loading === "batch" ? "Running…" : `Audit ${batchUrls.split("\n").filter((u) => u.trim()).length || 0} URLs`}
                </Button>
              </form>
              {batchResult && (
                <div className="mt-4 max-h-[400px] overflow-auto rounded-[6px] border border-border bg-muted/30 p-4">
                  <pre className="whitespace-pre-wrap text-xs">
                    {typeof batchResult === "string" ? batchResult : JSON.stringify(batchResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="internal-links">
          <Card>
            <CardHeader>
              <CardTitle>Internal Links Audit</CardTitle>
              <p className="text-sm text-muted-foreground">Find orphaned pages, hub pages, and internal linking issues</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleInternalLinks} className="flex gap-4">
                <div className="min-w-[280px] flex-1 space-y-2">
                  <Label>Domain</Label>
                  <Input placeholder="example.com" value={internalLinksDomain} onChange={(e) => setInternalLinksDomain(e.target.value)} disabled={!!loading} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={!!loading}>
                    {loading === "internal-links" ? "Analyzing…" : "Audit Links"}
                  </Button>
                </div>
              </form>
              {internalLinksResult && (
                <div className="mt-4 space-y-4">
                  {(internalLinksResult.totalPages != null || internalLinksResult.orphaned) && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {internalLinksResult.totalPages != null && (
                        <div className="rounded-[6px] border border-border bg-muted/30 p-3 text-center">
                          <p className="text-xl font-bold">{internalLinksResult.totalPages}</p>
                          <p className="text-xs text-muted-foreground">Total Pages</p>
                        </div>
                      )}
                      {internalLinksResult.orphaned && (
                        <div className="rounded-[6px] border border-border bg-muted/30 p-3 text-center">
                          <p className="text-xl font-bold text-amber-500">{internalLinksResult.orphaned.length}</p>
                          <p className="text-xs text-muted-foreground">Orphaned Pages</p>
                        </div>
                      )}
                      {internalLinksResult.hubPages != null && (
                        <div className="rounded-[6px] border border-border bg-muted/30 p-3 text-center">
                          <p className="text-xl font-bold text-green-500">{internalLinksResult.hubPages}</p>
                          <p className="text-xs text-muted-foreground">Hub Pages</p>
                        </div>
                      )}
                    </div>
                  )}
                  {internalLinksResult.orphaned?.length > 0 && (
                    <div>
                      <h3 className="mb-2 font-medium">Orphaned Pages</h3>
                      <ul className="max-h-[200px] overflow-auto space-y-1 rounded-[6px] border border-border bg-muted/30 p-3">
                        {internalLinksResult.orphaned.map((url: string, i: number) => (
                          <li key={i} className="truncate font-mono text-xs text-muted-foreground">{url}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {internalLinksResult.analysis && (
                    <div className="max-h-[300px] overflow-auto rounded-[6px] border border-border bg-muted/30 p-4">
                      <pre className="whitespace-pre-wrap text-xs">
                        {typeof internalLinksResult.analysis === "string" ? internalLinksResult.analysis : JSON.stringify(internalLinksResult.analysis, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screenshot">
          <Card>
            <CardHeader>
              <CardTitle>Page Screenshot</CardTitle>
              <p className="text-sm text-muted-foreground">Capture a full-page screenshot of any URL</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleScreenshot} className="flex gap-4">
                <div className="min-w-[280px] flex-1 space-y-2">
                  <Label>URL</Label>
                  <Input placeholder="https://example.com" value={screenshotUrl} onChange={(e) => setScreenshotUrl(e.target.value)} disabled={!!loading} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={!!loading}>
                    {loading === "screenshot" ? "Capturing…" : "Take Screenshot"}
                  </Button>
                </div>
              </form>
              {screenshotResult && (
                <div className="mt-4">
                  {(screenshotResult.screenshot || screenshotResult.base64) ? (
                    <div className="overflow-auto rounded-[6px] border border-border">
                      <img
                        src={screenshotResult.screenshot || `data:image/png;base64,${screenshotResult.base64}`}
                        alt="Page screenshot"
                        className="w-full"
                      />
                    </div>
                  ) : (
                    <div className="max-h-[400px] overflow-auto rounded-[6px] border border-border bg-muted/30 p-4">
                      <pre className="whitespace-pre-wrap text-xs">
                        {JSON.stringify(screenshotResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Audit History</CardTitle>
              <p className="text-sm text-muted-foreground">Past audits for your organisation</p>
            </CardHeader>
            <CardContent>
              {!historyLoaded ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No audits yet. Run one above.</p>
              ) : (
                <div className="overflow-x-auto rounded-[6px] border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium">Type</th>
                        <th className="px-4 py-3 text-left font-medium">Target</th>
                        <th className="px-4 py-3 text-left font-medium">Score</th>
                        <th className="px-4 py-3 text-left font-medium">Issues</th>
                        <th className="px-4 py-3 text-left font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((row: any, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-4 py-2 capitalize">{row.type ?? "technical"}</td>
                          <td className="max-w-[200px] truncate px-4 py-2 font-mono text-muted-foreground">{row.domain ?? row.url ?? "—"}</td>
                          <td className="px-4 py-2 font-mono">{row.score ?? row.summary?.score ?? "—"}</td>
                          <td className="px-4 py-2">{row.issuesFound != null ? row.issuesFound : row.summary ? (row.summary.critical ?? 0) + (row.summary.warnings ?? 0) : "—"}</td>
                          <td className="px-4 py-2 text-muted-foreground">{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
