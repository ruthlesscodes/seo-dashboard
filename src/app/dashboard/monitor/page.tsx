"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Eye, List, ChevronDown, ChevronRight, GitCompare, DollarSign, TrendingDown } from "lucide-react";
import { watchUrl, checkMonitor, getMonitorChanges, getMonitorDiff, getMonitorPricing, getMonitorDecay } from "@/actions/monitor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiffViewer } from "@/components/ui/diff-viewer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function MonitorPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [watchUrlInput, setWatchUrlInput] = useState("");
  const [watchLabel, setWatchLabel] = useState("");
  const [watchFrequency, setWatchFrequency] = useState("daily");
  const [watchedUrls, setWatchedUrls] = useState<any[]>([]);
  const [changes, setChanges] = useState<any[]>([]);
  const [expandedChange, setExpandedChange] = useState<string | null>(null);

  const [diffUrl, setDiffUrl] = useState("");
  const [diffResult, setDiffResult] = useState<any>(null);

  const [pricingUrl, setPricingUrl] = useState("");
  const [pricingResult, setPricingResult] = useState<any>(null);

  const [decayDomain, setDecayDomain] = useState("");
  const [decayResult, setDecayResult] = useState<any>(null);

  async function loadChanges() {
    try {
      const res = await getMonitorChanges();
      const data = Array.isArray(res) ? res : (res as any)?.data ?? (res as any)?.changes ?? [];
      setChanges(Array.isArray(data) ? data : []);
    } catch {
      setChanges([]);
    }
  }

  useEffect(() => {
    loadChanges();
  }, []);

  async function handleWatchUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!watchUrlInput.trim()) {
      toast.error("Enter a URL");
      return;
    }
    setLoading("watch");
    try {
      await watchUrl({
        url: watchUrlInput.trim(),
        label: watchLabel.trim() || undefined,
        frequency: watchFrequency,
      });
      toast.success("URL added to watch list");
      setWatchUrlInput("");
      setWatchLabel("");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to watch URL");
    } finally {
      setLoading(null);
    }
  }

  async function handleDiff(e: React.FormEvent) {
    e.preventDefault();
    if (!diffUrl.trim()) { toast.error("Enter a URL"); return; }
    setLoading("diff"); setDiffResult(null);
    try {
      const res = await getMonitorDiff(diffUrl.trim());
      setDiffResult((res as any)?.data ?? res);
      toast.success("Diff loaded");
    } catch (err: any) { toast.error(err?.message ?? "Diff failed"); }
    finally { setLoading(null); }
  }

  async function handlePricing(e: React.FormEvent) {
    e.preventDefault();
    if (!pricingUrl.trim()) { toast.error("Enter a URL"); return; }
    setLoading("pricing"); setPricingResult(null);
    try {
      const res = await getMonitorPricing(pricingUrl.trim());
      setPricingResult((res as any)?.data ?? res);
      toast.success("Pricing check complete");
    } catch (err: any) { toast.error(err?.message ?? "Pricing check failed"); }
    finally { setLoading(null); }
  }

  async function handleDecay(e: React.FormEvent) {
    e.preventDefault();
    if (!decayDomain.trim()) { toast.error("Enter a domain"); return; }
    setLoading("decay"); setDecayResult(null);
    try {
      const res = await getMonitorDecay(decayDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""));
      setDecayResult((res as any)?.data ?? res);
      toast.success("Decay analysis complete");
    } catch (err: any) { toast.error(err?.message ?? "Decay analysis failed"); }
    finally { setLoading(null); }
  }

  async function handleCheckAll() {
    setLoading("check");
    try {
      await checkMonitor();
      toast.success("Check initiated");
      loadChanges();
    } catch (err: any) {
      toast.error(err?.message ?? "Check failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Monitor</h1>
        <p className="text-ink-2">
          Watch URLs and track changes over time
        </p>
      </div>

      <Tabs defaultValue="watch" className="space-y-4">
        <TabsList className="bg-meridian-50">
          <TabsTrigger value="watch" className="gap-2">
            <Eye className="h-4 w-4" /> Watch List
          </TabsTrigger>
          <TabsTrigger value="changes" className="gap-2">
            <List className="h-4 w-4" /> Changes Feed
          </TabsTrigger>
          <TabsTrigger value="diff" className="gap-2">
            <GitCompare className="h-4 w-4" /> Content Diff
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-2">
            <DollarSign className="h-4 w-4" /> Pricing
          </TabsTrigger>
          <TabsTrigger value="decay" className="gap-2">
            <TrendingDown className="h-4 w-4" /> Decay
          </TabsTrigger>
        </TabsList>

        <TabsContent value="watch">
          <Card>
            <CardHeader>
              <CardTitle>Watched URLs</CardTitle>
              <p className="text-sm text-ink-2">
                Add URLs to monitor for changes
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleWatchUrl} className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] space-y-2">
                  <Label>URL</Label>
                  <Input
                    placeholder="https://example.com/page"
                    value={watchUrlInput}
                    onChange={(e) => setWatchUrlInput(e.target.value)}
                    disabled={loading !== null}
                  />
                </div>
                <div className="w-40 space-y-2">
                  <Label>Label</Label>
                  <Input
                    placeholder="Homepage"
                    value={watchLabel}
                    onChange={(e) => setWatchLabel(e.target.value)}
                    disabled={loading !== null}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label>Frequency</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={watchFrequency}
                    onChange={(e) => setWatchFrequency(e.target.value)}
                    disabled={loading !== null}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <Button type="submit" disabled={loading !== null}>
                    {loading === "watch" ? "Adding…" : "Watch URL"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCheckAll}
                    disabled={loading !== null}
                  >
                    {loading === "check" ? "Checking…" : "Check All"}
                  </Button>
                </div>
              </form>
              {watchedUrls.length === 0 && (
                <p className="text-sm text-ink-2">
                  No URLs watched yet. Add one above.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changes">
          <Card>
            <CardHeader>
              <CardTitle>Changes Feed</CardTitle>
              <p className="text-sm text-ink-2">
                Detected changes across monitored URLs
              </p>
            </CardHeader>
            <CardContent>
              {changes.length === 0 ? (
                <p className="text-sm text-ink-2">
                  No changes detected yet. Add URLs and run a check.
                </p>
              ) : (
                <div className="space-y-2">
                  {changes.map((c: any) => {
                    const id = c.id ?? c.url ?? JSON.stringify(c);
                    const isExpanded = expandedChange === id;
                    return (
                      <div
                        key={id}
                        className="rounded-lg border border-meridian-100 bg-white"
                      >
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-4 py-3 text-left"
                          onClick={() =>
                            setExpandedChange(isExpanded ? null : id)
                          }
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <span className="flex-1 truncate font-mono text-sm">
                            {c.url ?? "—"}
                          </span>
                          <Badge variant="outline">
                            {c.changeType ?? c.changeStatus ?? "changed"}
                          </Badge>
                          <span className="text-xs text-ink-2">
                            {c.detectedAt
                              ? new Date(c.detectedAt).toLocaleDateString()
                              : ""}
                          </span>
                        </button>
                        {isExpanded && (
                          <div className="border-t border-meridian-100 px-4 py-3">
                            <p className="mb-2 text-xs text-ink-2">
                              Change type: {c.changeType ?? c.changeStatus ?? "—"}
                            </p>
                            <DiffViewer diff={c.diff ?? null} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diff">
          <Card>
            <CardHeader>
              <CardTitle>Content Diff</CardTitle>
              <p className="text-sm text-ink-2">Compare current content with last snapshot</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleDiff} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>URL</Label>
                  <Input placeholder="https://example.com/page" value={diffUrl} onChange={(e) => setDiffUrl(e.target.value)} disabled={loading !== null} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={loading !== null}>{loading === "diff" ? "Loading…" : "Get Diff"}</Button>
                </div>
              </form>
              {diffResult && (
                <div className="mt-4">
                  <DiffViewer diff={typeof diffResult === "string" ? diffResult : diffResult?.diff ?? JSON.stringify(diffResult)} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Change Detection</CardTitle>
              <p className="text-sm text-ink-2">Detect pricing changes on a monitored page</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handlePricing} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>URL</Label>
                  <Input placeholder="https://example.com/pricing" value={pricingUrl} onChange={(e) => setPricingUrl(e.target.value)} disabled={loading !== null} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={loading !== null}>{loading === "pricing" ? "Checking…" : "Check Pricing"}</Button>
                </div>
              </form>
              {pricingResult && (
                <pre className="mt-4 max-h-[400px] overflow-auto rounded-lg border border-meridian-100 bg-canvas p-4 text-xs whitespace-pre-wrap">
                  {typeof pricingResult === "string" ? pricingResult : JSON.stringify(pricingResult, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decay">
          <Card>
            <CardHeader>
              <CardTitle>Decay / Decline Detection</CardTitle>
              <p className="text-sm text-ink-2">Detect ranking or visibility decay for a domain</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleDecay} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Domain</Label>
                  <Input placeholder="example.com" value={decayDomain} onChange={(e) => setDecayDomain(e.target.value)} disabled={loading !== null} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={loading !== null}>{loading === "decay" ? "Analyzing…" : "Check Decay"}</Button>
                </div>
              </form>
              {decayResult && (
                <pre className="mt-4 max-h-[400px] overflow-auto rounded-lg border border-meridian-100 bg-canvas p-4 text-xs whitespace-pre-wrap">
                  {typeof decayResult === "string" ? decayResult : JSON.stringify(decayResult, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
