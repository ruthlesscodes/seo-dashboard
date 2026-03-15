"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { getReadability, getLlmstxt, getBrandMonitor, getGeoOptimize } from "@/actions/geo";
import { hasFeature } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreRing } from "@/components/ui/score-ring";
import { BookOpen, FileCode, Shield, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GeoPage() {
  const { data: session } = useSession();
  const plan = (session?.user as { seoPlan?: string })?.seoPlan ?? "FREE";
  const canUseReadability = hasFeature(plan, "GROWTH");
  const canUseLlmstxt = hasFeature(plan, "GROWTH");
  const canUseGeo = hasFeature(plan, "GROWTH");

  const [loading, setLoading] = useState<string | null>(null);
  const [readabilityUrl, setReadabilityUrl] = useState("");
  const [readabilityResult, setReadabilityResult] = useState<any>(null);

  const [llmstxtDomain, setLlmstxtDomain] = useState("");
  const [llmstxtResult, setLlmstxtResult] = useState<string | null>(null);

  const [brandName, setBrandName] = useState("");
  const [brandCompetitors, setBrandCompetitors] = useState("");
  const [brandResult, setBrandResult] = useState<any>(null);

  const [optimizeDomain, setOptimizeDomain] = useState("");
  const [optimizeBrand, setOptimizeBrand] = useState("");
  const [optimizeKeywords, setOptimizeKeywords] = useState("");
  const [optimizeResult, setOptimizeResult] = useState<any>(null);

  async function handleReadability(e: React.FormEvent) {
    e.preventDefault();
    if (!readabilityUrl.trim()) {
      toast.error("Enter a URL");
      return;
    }
    setLoading("readability");
    setReadabilityResult(null);
    try {
      const res = await getReadability({
        url: readabilityUrl.trim(),
      });
      const data = (res as any)?.data ?? res;
      setReadabilityResult(data);
      toast.success("Readability analyzed");
    } catch (err: any) {
      toast.error(err?.message ?? "Analysis failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleLlmstxt(e: React.FormEvent) {
    e.preventDefault();
    if (!llmstxtDomain.trim()) {
      toast.error("Enter a domain");
      return;
    }
    setLoading("llmstxt");
    setLlmstxtResult(null);
    try {
      const res = await getLlmstxt({
        domain: llmstxtDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""),
      });
      const data = (res as any)?.data ?? res;
      setLlmstxtResult(
        typeof data === "string" ? data : data?.content ?? JSON.stringify(data, null, 2)
      );
      toast.success("llms.txt generated");
    } catch (err: any) {
      toast.error(err?.message ?? "Generation failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleBrandMonitor(e: React.FormEvent) {
    e.preventDefault();
    if (!brandName.trim()) {
      toast.error("Enter brand name");
      return;
    }
    setLoading("brand");
    setBrandResult(null);
    try {
      const competitors = brandCompetitors.split(",").map((c) => c.trim()).filter(Boolean);
      const res = await getBrandMonitor({ brand: brandName.trim(), competitors: competitors.length ? competitors : undefined });
      setBrandResult((res as any)?.data ?? res);
      toast.success("Brand monitoring data loaded");
    } catch (err: any) {
      toast.error(err?.message ?? "Brand monitor failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleOptimize(e: React.FormEvent) {
    e.preventDefault();
    const keywords = optimizeKeywords.split(",").map((k) => k.trim()).filter(Boolean);
    if (!optimizeDomain.trim() || !optimizeBrand.trim() || !keywords.length) {
      toast.error("Fill domain, brand, and keywords");
      return;
    }
    setLoading("optimize");
    setOptimizeResult(null);
    try {
      const res = await getGeoOptimize({
        domain: optimizeDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""),
        brand: optimizeBrand.trim(),
        keywords,
      });
      setOptimizeResult((res as any)?.data ?? res);
      toast.success("Citation optimization complete");
    } catch (err: any) {
      toast.error(err?.message ?? "Optimization failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">GEO / AEO</h1>
        <p className="text-ink-2">
          Generative Engine Optimization and llms.txt
        </p>
      </div>

      <Tabs defaultValue="readability" className="space-y-4">
        <TabsList className="bg-meridian-50">
          <TabsTrigger value="readability" className="gap-2">
            <BookOpen className="h-4 w-4" /> Readability {!canUseReadability && "(GROWTH+)"}
          </TabsTrigger>
          <TabsTrigger value="llmstxt" className="gap-2">
            <FileCode className="h-4 w-4" /> llms.txt {!canUseLlmstxt && "(GROWTH+)"}
          </TabsTrigger>
          <TabsTrigger value="brand" className="gap-2">
            <Shield className="h-4 w-4" /> Brand Monitor {!canUseGeo && "(GROWTH+)"}
          </TabsTrigger>
          <TabsTrigger value="optimize" className="gap-2">
            <Target className="h-4 w-4" /> Citation Optimize {!canUseGeo && "(GROWTH+)"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="readability">
          <Card className={cn(!canUseReadability && "relative")}>
            {!canUseReadability && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
                <div className="text-center">
                  <p className="font-medium">Upgrade to GROWTH to unlock</p>
                  <p className="text-sm text-ink-2">Readability Score</p>
                  <Button className="mt-2" asChild>
                    <a href="/dashboard/billing">Upgrade</a>
                  </Button>
                </div>
              </div>
            )}
            <CardHeader>
              <CardTitle>Readability Score</CardTitle>
              <p className="text-sm text-ink-2">
                Analyze content clarity for AI/LLM consumption
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleReadability} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>URL</Label>
                  <Input
                    placeholder="https://example.com/page"
                    value={readabilityUrl}
                    onChange={(e) => setReadabilityUrl(e.target.value)}
                    disabled={loading !== null || !canUseReadability}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="submit"
                    disabled={loading !== null || !canUseReadability}
                  >
                    {loading === "readability" ? "Analyzing…" : "Analyze"}
                  </Button>
                </div>
              </form>
              {readabilityResult && (
                <div className="mt-4 flex flex-col gap-4">
                  <ScoreRing
                    score={readabilityResult.score ?? 0}
                    size={100}
                  />
                  {readabilityResult.breakdown && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {Object.entries(readabilityResult.breakdown).map(
                        ([k, v]) => (
                          <div
                            key={k}
                            className="flex justify-between rounded-md border border-meridian-100 px-3 py-2"
                          >
                            <span className="text-sm">{k}</span>
                            <span className="font-mono text-sm">{String(v)}</span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                  {readabilityResult.recommendations?.length > 0 && (
                    <ul className="list-disc space-y-1 pl-4 text-sm">
                      {readabilityResult.recommendations.map((r: any, i: number) => (
                        <li key={i}>{r.description ?? r}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="llmstxt">
          <Card className={cn(!canUseLlmstxt && "relative")}>
            {!canUseLlmstxt && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
                <div className="text-center">
                  <p className="font-medium">Upgrade to GROWTH to unlock</p>
                  <p className="text-sm text-ink-2">llms.txt Generator</p>
                  <Button className="mt-2" asChild>
                    <a href="/dashboard/billing">Upgrade</a>
                  </Button>
                </div>
              </div>
            )}
            <CardHeader>
              <CardTitle>llms.txt Generator</CardTitle>
              <p className="text-sm text-ink-2">
                Generate llms.txt and llms-full.txt for your domain. Add to your site root at /llms.txt
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLlmstxt} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Domain</Label>
                  <Input
                    placeholder="example.com"
                    value={llmstxtDomain}
                    onChange={(e) => setLlmstxtDomain(e.target.value)}
                    disabled={loading !== null || !canUseLlmstxt}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="submit"
                    disabled={loading !== null || !canUseLlmstxt}
                  >
                    {loading === "llmstxt" ? "Generating…" : "Generate"}
                  </Button>
                </div>
              </form>
              {llmstxtResult && (
                <div className="mt-4 space-y-2">
                  <pre className="max-h-[400px] overflow-auto rounded-lg border border-meridian-100 bg-canvas p-4 font-mono text-xs">
                    {llmstxtResult}
                  </pre>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(llmstxtResult);
                        toast.success("Copied to clipboard");
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brand">
          <Card className={cn(!canUseGeo && "relative")}>
            {!canUseGeo && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
                <div className="text-center">
                  <p className="font-medium">Upgrade to GROWTH to unlock</p>
                  <p className="text-sm text-ink-2">Brand monitoring</p>
                  <Button className="mt-2" asChild><a href="/dashboard/billing">Upgrade</a></Button>
                </div>
              </div>
            )}
            <CardHeader>
              <CardTitle>Brand Monitor</CardTitle>
              <p className="text-sm text-ink-2">Track brand presence across search and AI engines</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleBrandMonitor} className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] space-y-2">
                  <Label>Brand name</Label>
                  <Input placeholder="Your Brand" value={brandName} onChange={(e) => setBrandName(e.target.value)} disabled={loading !== null || !canUseGeo} />
                </div>
                <div className="flex-1 min-w-[200px] space-y-2">
                  <Label>Competitors (comma-separated)</Label>
                  <Input placeholder="Competitor A, Competitor B" value={brandCompetitors} onChange={(e) => setBrandCompetitors(e.target.value)} disabled={loading !== null || !canUseGeo} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={loading !== null || !canUseGeo}>{loading === "brand" ? "Checking…" : "Monitor"}</Button>
                </div>
              </form>
              {brandResult && (
                <div className="mt-4 max-h-[400px] overflow-auto rounded-lg border border-meridian-100 bg-canvas p-4">
                  <pre className="whitespace-pre-wrap text-xs">{typeof brandResult === "string" ? brandResult : JSON.stringify(brandResult, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimize">
          <Card className={cn(!canUseGeo && "relative")}>
            {!canUseGeo && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
                <div className="text-center">
                  <p className="font-medium">Upgrade to GROWTH to unlock</p>
                  <p className="text-sm text-ink-2">Citation optimization</p>
                  <Button className="mt-2" asChild><a href="/dashboard/billing">Upgrade</a></Button>
                </div>
              </div>
            )}
            <CardHeader>
              <CardTitle>Citation Optimization</CardTitle>
              <p className="text-sm text-ink-2">Optimize how AI and search engines cite your brand</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleOptimize} className="flex flex-wrap gap-4">
                <div className="min-w-[160px] flex-1 space-y-2">
                  <Label>Domain</Label>
                  <Input placeholder="example.com" value={optimizeDomain} onChange={(e) => setOptimizeDomain(e.target.value)} disabled={loading !== null || !canUseGeo} />
                </div>
                <div className="min-w-[120px] space-y-2">
                  <Label>Brand</Label>
                  <Input placeholder="Brand Name" value={optimizeBrand} onChange={(e) => setOptimizeBrand(e.target.value)} disabled={loading !== null || !canUseGeo} />
                </div>
                <div className="min-w-[200px] flex-1 space-y-2">
                  <Label>Keywords (comma-separated)</Label>
                  <Input placeholder="keyword 1, keyword 2" value={optimizeKeywords} onChange={(e) => setOptimizeKeywords(e.target.value)} disabled={loading !== null || !canUseGeo} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={loading !== null || !canUseGeo}>{loading === "optimize" ? "Optimizing…" : "Optimize"}</Button>
                </div>
              </form>
              {optimizeResult && (
                <div className="mt-4 max-h-[400px] overflow-auto rounded-lg border border-meridian-100 bg-canvas p-4">
                  <pre className="whitespace-pre-wrap text-xs">{typeof optimizeResult === "string" ? optimizeResult : JSON.stringify(optimizeResult, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
