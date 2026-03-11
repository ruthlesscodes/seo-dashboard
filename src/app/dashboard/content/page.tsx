"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileText, FileSearch, RefreshCw, TrendingUp } from "lucide-react";
import { generateContent, getContentBrief, refreshContent, getTrendingContent } from "@/actions/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ContentPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [genKeyword, setGenKeyword] = useState("");
  const [genResult, setGenResult] = useState<any>(null);

  const [briefKeyword, setBriefKeyword] = useState("");
  const [briefResult, setBriefResult] = useState<string | null>(null);

  const [refreshUrl, setRefreshUrl] = useState("");
  const [refreshKeyword, setRefreshKeyword] = useState("");
  const [refreshResult, setRefreshResult] = useState<any>(null);

  const [trendingTopic, setTrendingTopic] = useState("");
  const [trendingResult, setTrendingResult] = useState<any>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!genKeyword.trim()) {
      toast.error("Enter a keyword");
      return;
    }
    setLoading("generate");
    setGenResult(null);
    try {
      const res = await generateContent({ keyword: genKeyword.trim() });
      const data = (res as any)?.data ?? res;
      setGenResult(data);
      toast.success("Content generated");
    } catch (err: any) {
      toast.error(err?.message ?? "Generation failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleBrief(e: React.FormEvent) {
    e.preventDefault();
    if (!briefKeyword.trim()) {
      toast.error("Enter a keyword");
      return;
    }
    setLoading("brief");
    setBriefResult(null);
    try {
      const res = await getContentBrief({ keyword: briefKeyword.trim() });
      const data = (res as any)?.data ?? res;
      setBriefResult(
        typeof data === "string" ? data : JSON.stringify(data, null, 2)
      );
      toast.success("Brief generated");
    } catch (err: any) {
      toast.error(err?.message ?? "Brief failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleTrending(e: React.FormEvent) {
    e.preventDefault();
    if (!trendingTopic.trim()) {
      toast.error("Enter a topic");
      return;
    }
    setLoading("trending");
    setTrendingResult(null);
    try {
      const res = await getTrendingContent({ topic: trendingTopic.trim() });
      const data = (res as any)?.data ?? res;
      setTrendingResult(data);
      toast.success("Trending topics loaded");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to load trending");
    } finally {
      setLoading(null);
    }
  }

  async function handleRefresh(e: React.FormEvent) {
    e.preventDefault();
    if (!refreshUrl.trim() || !refreshKeyword.trim()) {
      toast.error("Enter URL and keyword");
      return;
    }
    setLoading("refresh");
    setRefreshResult(null);
    try {
      const res = await refreshContent({
        url: refreshUrl.trim(),
        keyword: refreshKeyword.trim(),
      });
      const data = (res as any)?.data ?? res;
      setRefreshResult(data);
      toast.success("Refresh complete");
    } catch (err: any) {
      toast.error(err?.message ?? "Refresh failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Content Studio</h1>
        <p className="text-muted-foreground">
          Generate articles, briefs, and refresh existing content
        </p>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="generate" className="gap-2">
            <FileText className="h-4 w-4" /> Generate
          </TabsTrigger>
          <TabsTrigger value="brief" className="gap-2">
            <FileSearch className="h-4 w-4" /> Content Brief
          </TabsTrigger>
          <TabsTrigger value="refresh" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </TabsTrigger>
          <TabsTrigger value="trending" className="gap-2">
            <TrendingUp className="h-4 w-4" /> Trending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generate Article</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter a keyword to generate SEO-optimized content
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleGenerate} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Keyword</Label>
                  <Input
                    placeholder="e.g. best running shoes 2024"
                    value={genKeyword}
                    onChange={(e) => setGenKeyword(e.target.value)}
                    disabled={loading !== null}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={loading !== null}>
                    {loading === "generate" ? "Generating…" : "Generate Article"}
                  </Button>
                </div>
              </form>
              {genResult && (
                <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
                  <pre className="whitespace-pre-wrap text-sm">
                    {typeof genResult === "string"
                      ? genResult
                      : genResult.content ?? genResult.markdown ?? JSON.stringify(genResult, null, 2)}
                  </pre>
                  {(genResult.wordCount ?? genResult.word_count) && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {genResult.wordCount ?? genResult.word_count} words
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brief">
          <Card>
            <CardHeader>
              <CardTitle>Content Brief</CardTitle>
              <p className="text-sm text-muted-foreground">
                Get a structured brief with outline and keywords
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleBrief} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Keyword</Label>
                  <Input
                    placeholder="e.g. how to start a blog"
                    value={briefKeyword}
                    onChange={(e) => setBriefKeyword(e.target.value)}
                    disabled={loading !== null}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={loading !== null}>
                    {loading === "brief" ? "Generating…" : "Get Brief"}
                  </Button>
                </div>
              </form>
              {briefResult && (
                <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
                  <pre className="whitespace-pre-wrap text-sm">{briefResult}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refresh">
          <Card>
            <CardHeader>
              <CardTitle>Refresh Content</CardTitle>
              <p className="text-sm text-muted-foreground">
                Analyze existing content vs current SERP
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleRefresh} className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] space-y-2">
                  <Label>URL</Label>
                  <Input
                    placeholder="https://example.com/article"
                    value={refreshUrl}
                    onChange={(e) => setRefreshUrl(e.target.value)}
                    disabled={loading !== null}
                  />
                </div>
                <div className="flex-1 min-w-[200px] space-y-2">
                  <Label>Target keyword</Label>
                  <Input
                    placeholder="primary keyword"
                    value={refreshKeyword}
                    onChange={(e) => setRefreshKeyword(e.target.value)}
                    disabled={loading !== null}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={loading !== null}>
                    {loading === "refresh" ? "Analyzing…" : "Refresh"}
                  </Button>
                </div>
              </form>
              {refreshResult && (
                <div className="mt-4 space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                  {(refreshResult.score ?? refreshResult.issues) && (
                    <>
                      {refreshResult.score != null && (
                        <p className="font-medium">Score: {refreshResult.score}</p>
                      )}
                      {refreshResult.issues?.length > 0 && (
                        <ul className="list-disc space-y-1 pl-4 text-sm">
                          {refreshResult.issues.map((i: any, j: number) => (
                            <li key={j}>{i.description ?? i}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                  {!refreshResult.score && !refreshResult.issues?.length && (
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(refreshResult, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending">
          <Card>
            <CardHeader>
              <CardTitle>Trending Topics</CardTitle>
              <p className="text-sm text-muted-foreground">
                Discover trending topics and content ideas
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleTrending} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Topic</Label>
                  <Input
                    placeholder="e.g. AI SEO tools"
                    value={trendingTopic}
                    onChange={(e) => setTrendingTopic(e.target.value)}
                    disabled={loading !== null}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={loading !== null}>
                    {loading === "trending" ? "Loading…" : "Get Trending"}
                  </Button>
                </div>
              </form>
              {trendingResult && (
                <div className="mt-4 max-h-[400px] overflow-auto rounded-lg border border-border bg-muted/30 p-4">
                  <pre className="whitespace-pre-wrap text-sm">
                    {Array.isArray(trendingResult)
                      ? trendingResult.map((t: any) => t.title ?? t.name ?? t).join("\n")
                      : typeof trendingResult === "string"
                        ? trendingResult
                        : JSON.stringify(trendingResult, null, 2)}
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
