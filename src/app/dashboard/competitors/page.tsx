"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Globe, GitCompare, FileText, Zap, Megaphone } from "lucide-react";
import { crawlCompetitor, compareCompetitor, scrapeCompetitor, scrapeInteractiveCompetitor, getCompetitorBrand } from "@/actions/competitors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function CompetitorsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const [crawlDomain, setCrawlDomain] = useState("");
  const [crawlMaxPages, setCrawlMaxPages] = useState(20);
  const [crawlResult, setCrawlResult] = useState<any>(null);

  const [compareKeyword, setCompareKeyword] = useState("");
  const [compareDomain, setCompareDomain] = useState("");
  const [compareCompetitorDomain, setCompareCompetitorDomain] = useState("");
  const [compareResult, setCompareResult] = useState<any>(null);

  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapeResult, setScrapeResult] = useState<any>(null);

  const [scrapeInteractiveUrl, setScrapeInteractiveUrl] = useState("");
  const [scrapeInteractiveResult, setScrapeInteractiveResult] = useState<any>(null);

  const [brandUrl, setBrandUrl] = useState("");
  const [brandResult, setBrandResult] = useState<any>(null);

  async function handleCrawl(e: React.FormEvent) {
    e.preventDefault();
    if (!crawlDomain.trim()) { toast.error("Enter a domain"); return; }
    setLoading("crawl"); setCrawlResult(null);
    try {
      const res = await crawlCompetitor({
        domain: crawlDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""),
        maxPages: crawlMaxPages,
      }) as any;
      setCrawlResult(res?.data ?? res);
      toast.success("Competitor crawl complete");
    } catch (err: any) {
      toast.error(err?.message ?? "Crawl failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleCompare(e: React.FormEvent) {
    e.preventDefault();
    if (!compareKeyword.trim() || !compareDomain.trim() || !compareCompetitorDomain.trim()) {
      toast.error("Fill in all fields"); return;
    }
    setLoading("compare"); setCompareResult(null);
    try {
      const res = await compareCompetitor({
        keyword: compareKeyword.trim(),
        domain: compareDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""),
        competitorDomain: compareCompetitorDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""),
      }) as any;
      setCompareResult(res?.data ?? res);
      toast.success("Comparison complete");
    } catch (err: any) {
      toast.error(err?.message ?? "Comparison failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleScrape(e: React.FormEvent) {
    e.preventDefault();
    if (!scrapeUrl.trim()) { toast.error("Enter a URL"); return; }
    setLoading("scrape"); setScrapeResult(null);
    try {
      const res = await scrapeCompetitor({ url: scrapeUrl.trim() }) as any;
      setScrapeResult(res?.data ?? res);
      toast.success("Scrape complete");
    } catch (err: any) { toast.error(err?.message ?? "Scrape failed"); }
    finally { setLoading(null); }
  }

  async function handleScrapeInteractive(e: React.FormEvent) {
    e.preventDefault();
    if (!scrapeInteractiveUrl.trim()) { toast.error("Enter a URL"); return; }
    setLoading("scrapeInteractive"); setScrapeInteractiveResult(null);
    try {
      const res = await scrapeInteractiveCompetitor({ url: scrapeInteractiveUrl.trim() }) as any;
      setScrapeInteractiveResult(res?.data ?? res);
      toast.success("Interactive scrape complete");
    } catch (err: any) { toast.error(err?.message ?? "Scrape failed"); }
    finally { setLoading(null); }
  }

  async function handleBrand(e: React.FormEvent) {
    e.preventDefault();
    if (!brandUrl.trim()) { toast.error("Enter a URL"); return; }
    setLoading("brand"); setBrandResult(null);
    try {
      const res = await getCompetitorBrand({ url: brandUrl.trim() }) as any;
      setBrandResult(res?.data ?? res);
      toast.success("Brand analysis complete");
    } catch (err: any) { toast.error(err?.message ?? "Brand analysis failed"); }
    finally { setLoading(null); }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Competitors</h1>
        <p className="text-muted-foreground">Crawl and benchmark competitor sites</p>
      </div>

      <Tabs defaultValue="crawl" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="crawl" className="gap-2">
            <Globe className="h-4 w-4" /> Crawl Competitor
          </TabsTrigger>
          <TabsTrigger value="compare" className="gap-2">
            <GitCompare className="h-4 w-4" /> Head-to-Head
          </TabsTrigger>
          <TabsTrigger value="scrape" className="gap-2">
            <FileText className="h-4 w-4" /> Scrape
          </TabsTrigger>
          <TabsTrigger value="scrapeInteractive" className="gap-2">
            <Zap className="h-4 w-4" /> Scrape (JS)
          </TabsTrigger>
          <TabsTrigger value="brand" className="gap-2">
            <Megaphone className="h-4 w-4" /> Brand
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crawl">
          <Card>
            <CardHeader>
              <CardTitle>Crawl Competitor Domain</CardTitle>
              <p className="text-sm text-muted-foreground">Extract pages, content structure, and SEO signals from a competitor</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleCrawl} className="flex flex-wrap gap-4">
                <div className="min-w-[200px] flex-1 space-y-2">
                  <Label>Competitor domain</Label>
                  <Input placeholder="competitor.com" value={crawlDomain} onChange={(e) => setCrawlDomain(e.target.value)} disabled={!!loading} />
                </div>
                <div className="w-32 space-y-2">
                  <Label>Max pages</Label>
                  <Input type="number" min={1} max={200} value={crawlMaxPages} onChange={(e) => setCrawlMaxPages(parseInt(e.target.value) || 20)} disabled={!!loading} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={!!loading}>
                    {loading === "crawl" ? "Crawling…" : "Crawl Competitor"}
                  </Button>
                </div>
              </form>

              {crawlResult && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: "Pages Found", value: crawlResult.pageCount ?? crawlResult.pages?.length ?? "—" },
                      { label: "Avg Word Count", value: crawlResult.avgWordCount ?? "—" },
                      { label: "Internal Links", value: crawlResult.internalLinkCount ?? "—" },
                      { label: "Unique Keywords", value: crawlResult.uniqueKeywords ?? "—" },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-[6px] border border-border bg-muted/30 p-3 text-center">
                        <p className="text-xl font-bold">{value}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>

                  {crawlResult.pages?.length > 0 && (
                    <div>
                      <h3 className="mb-2 font-medium">Top Pages ({crawlResult.pages.length})</h3>
                      <div className="overflow-x-auto rounded-[6px] border border-border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border bg-muted/50">
                              <th className="px-4 py-3 text-left font-medium">URL</th>
                              <th className="px-4 py-3 text-left font-medium">Title</th>
                              <th className="px-4 py-3 text-left font-medium">Words</th>
                            </tr>
                          </thead>
                          <tbody>
                            {crawlResult.pages.slice(0, 20).map((p: any, i: number) => (
                              <tr key={i} className="border-b border-border last:border-0">
                                <td className="max-w-[200px] truncate px-4 py-2 font-mono text-xs text-muted-foreground">{p.url}</td>
                                <td className="max-w-[200px] truncate px-4 py-2">{p.title ?? "—"}</td>
                                <td className="px-4 py-2">{p.wordCount ?? "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {!crawlResult.pages && (
                    <pre className="max-h-[300px] overflow-auto rounded-[6px] border border-border bg-muted/30 p-4 text-xs">
                      {JSON.stringify(crawlResult, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compare">
          <Card>
            <CardHeader>
              <CardTitle>Head-to-Head Comparison</CardTitle>
              <p className="text-sm text-muted-foreground">Compare your site vs a competitor for a specific keyword</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleCompare} className="flex flex-wrap gap-4">
                <div className="min-w-[160px] flex-1 space-y-2">
                  <Label>Keyword</Label>
                  <Input placeholder="e.g. project management tool" value={compareKeyword} onChange={(e) => setCompareKeyword(e.target.value)} disabled={!!loading} />
                </div>
                <div className="min-w-[160px] flex-1 space-y-2">
                  <Label>Your domain</Label>
                  <Input placeholder="yourdomain.com" value={compareDomain} onChange={(e) => setCompareDomain(e.target.value)} disabled={!!loading} />
                </div>
                <div className="min-w-[160px] flex-1 space-y-2">
                  <Label>Competitor domain</Label>
                  <Input placeholder="competitor.com" value={compareCompetitorDomain} onChange={(e) => setCompareCompetitorDomain(e.target.value)} disabled={!!loading} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={!!loading}>
                    {loading === "compare" ? "Comparing…" : "Compare"}
                  </Button>
                </div>
              </form>

              {compareResult && (
                <div className="mt-4 space-y-4">
                  {(compareResult.yourScore != null || compareResult.competitorScore != null) && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-[6px] border border-blue-500/30 bg-blue-500/5 p-4 text-center">
                        <p className="mb-1 text-xs text-muted-foreground">Your site</p>
                        <p className="text-3xl font-bold text-blue-500">{compareResult.yourScore ?? "—"}</p>
                      </div>
                      <div className="rounded-[6px] border border-red-500/30 bg-red-500/5 p-4 text-center">
                        <p className="mb-1 text-xs text-muted-foreground">Competitor</p>
                        <p className="text-3xl font-bold text-red-500">{compareResult.competitorScore ?? "—"}</p>
                      </div>
                    </div>
                  )}

                  {compareResult.gaps?.length > 0 && (
                    <div>
                      <h3 className="mb-2 font-medium">Content Gaps</h3>
                      <div className="space-y-2">
                        {compareResult.gaps.map((gap: any, i: number) => (
                          <div key={i} className="rounded-[6px] border border-border bg-muted/30 p-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{gap.type ?? "gap"}</Badge>
                              <span className="text-sm font-medium">{gap.topic ?? gap.keyword ?? gap.title}</span>
                            </div>
                            {gap.description && <p className="mt-1 text-sm text-muted-foreground">{gap.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {compareResult.recommendations?.length > 0 && (
                    <div>
                      <h3 className="mb-2 font-medium">Recommendations</h3>
                      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {compareResult.recommendations.map((r: any, i: number) => (
                          <li key={i}>{typeof r === "string" ? r : r.description ?? r.text}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!compareResult.gaps && !compareResult.recommendations && (
                    <pre className="max-h-[300px] overflow-auto rounded-[6px] border border-border bg-muted/30 p-4 text-xs">
                      {JSON.stringify(compareResult, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scrape">
          <Card>
            <CardHeader>
              <CardTitle>Scrape Page</CardTitle>
              <p className="text-sm text-muted-foreground">Extract content from a competitor URL</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleScrape} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>URL</Label>
                  <Input placeholder="https://competitor.com/page" value={scrapeUrl} onChange={(e) => setScrapeUrl(e.target.value)} disabled={!!loading} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={!!loading}>{loading === "scrape" ? "Scraping…" : "Scrape"}</Button>
                </div>
              </form>
              {scrapeResult && (
                <pre className="mt-4 max-h-[400px] overflow-auto rounded-lg border border-border bg-muted/30 p-4 text-xs whitespace-pre-wrap">
                  {typeof scrapeResult === "string" ? scrapeResult : JSON.stringify(scrapeResult, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scrapeInteractive">
          <Card>
            <CardHeader>
              <CardTitle>Scrape (JS/Interactive)</CardTitle>
              <p className="text-sm text-muted-foreground">Scrape with JavaScript rendering for SPAs</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleScrapeInteractive} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>URL</Label>
                  <Input placeholder="https://competitor.com/page" value={scrapeInteractiveUrl} onChange={(e) => setScrapeInteractiveUrl(e.target.value)} disabled={!!loading} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={!!loading}>{loading === "scrapeInteractive" ? "Scraping…" : "Scrape"}</Button>
                </div>
              </form>
              {scrapeInteractiveResult && (
                <pre className="mt-4 max-h-[400px] overflow-auto rounded-lg border border-border bg-muted/30 p-4 text-xs whitespace-pre-wrap">
                  {typeof scrapeInteractiveResult === "string" ? scrapeInteractiveResult : JSON.stringify(scrapeInteractiveResult, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brand">
          <Card>
            <CardHeader>
              <CardTitle>Competitor Brand Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">Analyze competitor brand presence</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleBrand} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Competitor URL</Label>
                  <Input placeholder="https://competitor.com" value={brandUrl} onChange={(e) => setBrandUrl(e.target.value)} disabled={!!loading} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={!!loading}>{loading === "brand" ? "Analyzing…" : "Analyze Brand"}</Button>
                </div>
              </form>
              {brandResult && (
                <pre className="mt-4 max-h-[400px] overflow-auto rounded-lg border border-border bg-muted/30 p-4 text-xs whitespace-pre-wrap">
                  {typeof brandResult === "string" ? brandResult : JSON.stringify(brandResult, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
