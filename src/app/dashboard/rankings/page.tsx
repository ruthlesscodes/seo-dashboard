"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { TrendingUp, Globe, Zap, Camera } from "lucide-react";
import { useSession } from "next-auth/react";
import { checkRankings, getGlobalRankings, getSerpFeatures, getSerpSnapshot } from "@/actions/rankings";
import { searchKeywords } from "@/actions/keywords";
import { hasFeature } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const REGIONS = ["US", "PH", "NG", "UK", "AU", "CA", "DE"];

export default function RankingsPage() {
  const { data: session } = useSession();
  const plan = (session?.user as { seoPlan?: string })?.seoPlan ?? "FREE";
  const domain = (session?.user as { seoDomain?: string })?.seoDomain ?? "";

  const [loading, setLoading] = useState<string | null>(null);
  const [positionResults, setPositionResults] = useState<any[]>([]);
  const [positionKeywords, setPositionKeywords] = useState("");
  const [positionDomain, setPositionDomain] = useState(domain);

  const [globalKeyword, setGlobalKeyword] = useState("");
  const [globalRegions, setGlobalRegions] = useState<string[]>(["US"]);
  const [globalResults, setGlobalResults] = useState<any[]>([]);

  const [serpKeywords, setSerpKeywords] = useState("");
  const [serpResults, setSerpResults] = useState<any[]>([]);

  const [snapshotKeyword, setSnapshotKeyword] = useState("");
  const [snapshotDomain, setSnapshotDomain] = useState(domain);
  const [snapshotResult, setSnapshotResult] = useState<any>(null);

  useEffect(() => {
    setPositionDomain(domain);
  }, [domain]);

  async function handleCheckPositions(e: React.FormEvent) {
    e.preventDefault();
    const keywords = positionKeywords.split(",").map((k) => k.trim()).filter(Boolean);
    if (!keywords.length || !positionDomain.trim()) {
      toast.error("Enter keywords and domain");
      return;
    }
    setLoading("positions");
    try {
      const res = await checkRankings({
        keywords,
        domain: positionDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""),
      });
      const data = Array.isArray(res) ? res : (res as any)?.data ?? (res as any)?.results ?? [];
      setPositionResults(Array.isArray(data) ? data : []);
      toast.success("Rankings checked");
    } catch (err: any) {
      toast.error(err?.message ?? "Check failed");
      setPositionResults([]);
    } finally {
      setLoading(null);
    }
  }

  async function handleGlobalCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!globalKeyword.trim() || !domain || globalRegions.length === 0) {
      toast.error("Select keyword and at least one region");
      return;
    }
    setLoading("global");
    try {
      const res = await getGlobalRankings({
        keyword: globalKeyword.trim(),
        domain: domain.replace(/^https?:\/\//, "").replace(/\/$/, ""),
        regions: globalRegions,
      });
      const data = Array.isArray(res) ? res : (res as any)?.data ?? (res as any)?.results ?? [];
      setGlobalResults(Array.isArray(data) ? data : []);
      toast.success("Global check complete");
    } catch (err: any) {
      toast.error(err?.message ?? "Global check failed");
      setGlobalResults([]);
    } finally {
      setLoading(null);
    }
  }

  async function handleSerpCheck(e: React.FormEvent) {
    e.preventDefault();
    const keywords = serpKeywords.split(",").map((k) => k.trim()).filter(Boolean);
    if (!keywords.length) {
      toast.error("Enter keywords");
      return;
    }
    setLoading("serp");
    try {
      const res = await getSerpFeatures({ keywords });
      const data = Array.isArray(res) ? res : (res as any)?.data ?? (res as any)?.results ?? [];
      setSerpResults(Array.isArray(data) ? data : []);
      toast.success("SERP features checked");
    } catch (err: any) {
      toast.error(err?.message ?? "SERP check failed");
      setSerpResults([]);
    } finally {
      setLoading(null);
    }
  }

  async function handleSerpSnapshot(e: React.FormEvent) {
    e.preventDefault();
    if (!snapshotKeyword.trim()) {
      toast.error("Enter a keyword");
      return;
    }
    setLoading("snapshot");
    setSnapshotResult(null);
    try {
      const res = await getSerpSnapshot({
        keyword: snapshotKeyword.trim(),
      });
      setSnapshotResult((res as any)?.data ?? res);
      toast.success("SERP snapshot complete");
    } catch (err: any) {
      toast.error(err?.message ?? "Snapshot failed");
    } finally {
      setLoading(null);
    }
  }

  function renderChange(change: number | undefined) {
    if (change == null) return <span className="text-muted-foreground">—</span>;
    if (change > 0)
      return <span className="text-rank-up">↑ {change}</span>;
    if (change < 0)
      return <span className="text-rank-down">↓ {Math.abs(change)}</span>;
    return <span className="text-muted-foreground">—</span>;
  }

  const canUseGlobal = hasFeature(plan, "GROWTH");
  const canUseSerp = hasFeature(plan, "GROWTH");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rankings</h1>
        <p className="text-muted-foreground">
          Track keyword positions across regions
        </p>
      </div>

      <Tabs defaultValue="positions" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="positions" className="gap-2">
            <TrendingUp className="h-4 w-4" /> Position Tracker
          </TabsTrigger>
          <TabsTrigger value="global" className="gap-2">
            <Globe className="h-4 w-4" /> Global {!canUseGlobal && "(GROWTH+)"}
          </TabsTrigger>
          <TabsTrigger value="serp" className="gap-2">
            <Zap className="h-4 w-4" /> SERP Features {!canUseSerp && "(GROWTH+)"}
          </TabsTrigger>
          <TabsTrigger value="snapshot" className="gap-2">
            <Camera className="h-4 w-4" /> SERP Snapshot
          </TabsTrigger>
        </TabsList>

        <TabsContent value="positions">
          <Card>
            <CardHeader>
              <CardTitle>Position Tracker</CardTitle>
              <p className="text-sm text-muted-foreground">
                Check current rankings for your keywords
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleCheckPositions} className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] space-y-2">
                  <Label>Keywords</Label>
                  <Input
                    placeholder="keyword 1, keyword 2, ..."
                    value={positionKeywords}
                    onChange={(e) => setPositionKeywords(e.target.value)}
                    disabled={loading !== null}
                  />
                </div>
                <div className="w-48 space-y-2">
                  <Label>Domain</Label>
                  <Input
                    placeholder="example.com"
                    value={positionDomain}
                    onChange={(e) => setPositionDomain(e.target.value)}
                    disabled={loading !== null}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={loading !== null}>
                    {loading === "positions" ? "Checking…" : "Refresh All"}
                  </Button>
                </div>
              </form>
              {positionResults.length > 0 && (
                <div className="mt-4 overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium">Keyword</th>
                        <th className="px-4 py-3 text-left font-medium">Current</th>
                        <th className="px-4 py-3 text-left font-medium">Previous</th>
                        <th className="px-4 py-3 text-left font-medium">Change</th>
                        <th className="px-4 py-3 text-left font-medium">URL</th>
                        <th className="px-4 py-3 text-left font-medium">Region</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positionResults.map((row: any, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-4 py-2 font-medium">{row.keyword ?? row.key}</td>
                          <td className="px-4 py-2 font-mono">{row.position ?? row.current ?? "—"}</td>
                          <td className="px-4 py-2 font-mono">{row.previousPosition ?? row.previous ?? "—"}</td>
                          <td className="px-4 py-2">
                            {renderChange(row.change ?? row.delta)}
                          </td>
                          <td className="max-w-[180px] truncate px-4 py-2 font-mono text-muted-foreground">
                            {row.url ?? "—"}
                          </td>
                          <td className="px-4 py-2">{row.region ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="global">
          <Card className={cn(!canUseGlobal && "relative")}>
            {!canUseGlobal && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
                <div className="text-center">
                  <p className="font-medium">Upgrade to GROWTH to unlock</p>
                  <p className="text-sm text-muted-foreground">Global rankings</p>
                  <Button className="mt-2" asChild>
                    <a href="/dashboard/billing">Upgrade</a>
                  </Button>
                </div>
              </div>
            )}
            <CardHeader>
              <CardTitle>Global Rankings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Check positions across multiple regions
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleGlobalCheck} className="space-y-4">
                <div className="space-y-2">
                  <Label>Keyword</Label>
                  <Input
                    placeholder="e.g. best laptop"
                    value={globalKeyword}
                    onChange={(e) => setGlobalKeyword(e.target.value)}
                    disabled={loading !== null || !canUseGlobal}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Regions</Label>
                  <div className="flex flex-wrap gap-2">
                    {REGIONS.map((r) => (
                      <label
                        key={r}
                        className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2"
                      >
                        <input
                          type="checkbox"
                          checked={globalRegions.includes(r)}
                          onChange={(e) =>
                            setGlobalRegions((prev) =>
                              e.target.checked ? [...prev, r] : prev.filter((x) => x !== r)
                            )
                          }
                          disabled={!canUseGlobal}
                        />
                        {r}
                      </label>
                    ))}
                  </div>
                </div>
                <Button type="submit" disabled={loading !== null || !canUseGlobal}>
                  {loading === "global" ? "Checking…" : "Check Global"}
                </Button>
              </form>
              {globalResults.length > 0 && (
                <div className="mt-4 overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium">Region</th>
                        <th className="px-4 py-3 text-left font-medium">Position</th>
                        <th className="px-4 py-3 text-left font-medium">URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {globalResults.map((row: any, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-4 py-2">{row.region ?? row.country ?? "—"}</td>
                          <td className="px-4 py-2 font-mono">{row.position ?? row.rank ?? "—"}</td>
                          <td className="max-w-[200px] truncate px-4 py-2 font-mono text-muted-foreground">
                            {row.url ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="serp">
          <Card className={cn(!canUseSerp && "relative")}>
            {!canUseSerp && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
                <div className="text-center">
                  <p className="font-medium">Upgrade to GROWTH to unlock</p>
                  <p className="text-sm text-muted-foreground">SERP Features</p>
                  <Button className="mt-2" asChild>
                    <a href="/dashboard/billing">Upgrade</a>
                  </Button>
                </div>
              </div>
            )}
            <CardHeader>
              <CardTitle>SERP Features</CardTitle>
              <p className="text-sm text-muted-foreground">
                See which SERP features appear for each keyword
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSerpCheck} className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] space-y-2">
                  <Label>Keywords</Label>
                  <Input
                    placeholder="keyword 1, keyword 2, ..."
                    value={serpKeywords}
                    onChange={(e) => setSerpKeywords(e.target.value)}
                    disabled={loading !== null || !canUseSerp}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={loading !== null || !canUseSerp}>
                    {loading === "serp" ? "Checking…" : "Check SERP Features"}
                  </Button>
                </div>
              </form>
              {serpResults.length > 0 && (
                <div className="mt-4 overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium">Keyword</th>
                        <th className="px-4 py-3 text-left font-medium">Featured Snippet</th>
                        <th className="px-4 py-3 text-left font-medium">AI Overview</th>
                        <th className="px-4 py-3 text-left font-medium">PAA</th>
                        <th className="px-4 py-3 text-left font-medium">Images</th>
                        <th className="px-4 py-3 text-left font-medium">Video</th>
                        <th className="px-4 py-3 text-left font-medium">Local</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serpResults.map((row: any, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-4 py-2 font-medium">{row.keyword ?? row.key}</td>
                          {["featuredSnippet", "aiOverview", "paa", "images", "video", "local"].map(
                            (col) => (
                              <td key={col} className="px-4 py-2">
                                {row[col] === true ? (
                                  <span className="text-rank-up">✓</span>
                                ) : row[col] === false ? (
                                  <span className="text-muted-foreground">✗</span>
                                ) : (
                                  "—"
                                )}
                              </td>
                            )
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="snapshot">
          <Card>
            <CardHeader>
              <CardTitle>SERP Snapshot</CardTitle>
              <p className="text-sm text-muted-foreground">
                Full SERP snapshot for a keyword (organic results, snippets, PAA, etc.)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSerpSnapshot} className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] space-y-2">
                  <Label>Keyword</Label>
                  <Input
                    placeholder="e.g. best seo tool"
                    value={snapshotKeyword}
                    onChange={(e) => setSnapshotKeyword(e.target.value)}
                    disabled={loading !== null}
                  />
                </div>
                <div className="w-48 space-y-2">
                  <Label>Domain (optional)</Label>
                  <Input
                    placeholder="example.com"
                    value={snapshotDomain}
                    onChange={(e) => setSnapshotDomain(e.target.value)}
                    disabled={loading !== null}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={loading !== null}>
                    {loading === "snapshot" ? "Fetching…" : "Get Snapshot"}
                  </Button>
                </div>
              </form>
              {snapshotResult && (
                <div className="mt-4 max-h-[500px] overflow-auto rounded-lg border border-border bg-muted/20 p-4">
                  <pre className="whitespace-pre-wrap text-xs">
                    {typeof snapshotResult === "string"
                      ? snapshotResult
                      : JSON.stringify(snapshotResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
