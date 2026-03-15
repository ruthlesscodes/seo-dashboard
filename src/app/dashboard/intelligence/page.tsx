"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Brain, GitMerge, Bot, Search, Layers } from "lucide-react";
import { analyzeIntelligence, getGapAnalysis, runIntelligenceAgent, runIntelligenceResearch, runIntelligenceBatch } from "@/actions/intelligence";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function IntelligencePage() {
  const [loading, setLoading] = useState<string | null>(null);

  const [analyzeDomain, setAnalyzeDomain] = useState("");
  const [analyzeKeywords, setAnalyzeKeywords] = useState("");
  const [analyzeResult, setAnalyzeResult] = useState<any>(null);

  const [gapDomain, setGapDomain] = useState("");
  const [gapCompetitor, setGapCompetitor] = useState("");
  const [gapKeywords, setGapKeywords] = useState("");
  const [gapResult, setGapResult] = useState<any>(null);

  const [agentPrompt, setAgentPrompt] = useState("");
  const [agentResult, setAgentResult] = useState<any>(null);

  const [researchTopic, setResearchTopic] = useState("");
  const [researchResult, setResearchResult] = useState<any>(null);

  const [batchKeywords, setBatchKeywords] = useState("");
  const [batchResult, setBatchResult] = useState<any>(null);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    const keywords = analyzeKeywords.split(",").map((k) => k.trim()).filter(Boolean);
    if (!analyzeDomain.trim() || !keywords.length) { toast.error("Enter domain and at least one keyword"); return; }
    setLoading("analyze"); setAnalyzeResult(null);
    try {
      const res = await analyzeIntelligence({
        domain: analyzeDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""),
        keywords,
      }) as any;
      setAnalyzeResult(res?.data ?? res);
      toast.success("Analysis complete");
    } catch (err: any) {
      toast.error(err?.message ?? "Analysis failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleGap(e: React.FormEvent) {
    e.preventDefault();
    const keywords = gapKeywords.split(",").map((k) => k.trim()).filter(Boolean);
    if (!gapDomain.trim() || !gapCompetitor.trim() || !keywords.length) {
      toast.error("Fill in all fields"); return;
    }
    setLoading("gap"); setGapResult(null);
    try {
      const res = await getGapAnalysis({
        domain: gapDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""),
        competitorDomain: gapCompetitor.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""),
        keywords,
      }) as any;
      setGapResult(res?.data ?? res);
      toast.success("Gap analysis complete");
    } catch (err: any) {
      toast.error(err?.message ?? "Gap analysis failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleAgent(e: React.FormEvent) {
    e.preventDefault();
    if (!agentPrompt.trim()) { toast.error("Enter a prompt"); return; }
    setLoading("agent"); setAgentResult(null);
    try {
      const res = await runIntelligenceAgent({ prompt: agentPrompt.trim() }) as any;
      setAgentResult(res?.data ?? res);
      toast.success("Agent analysis complete");
    } catch (err: any) { toast.error(err?.message ?? "Agent failed"); }
    finally { setLoading(null); }
  }

  async function handleResearch(e: React.FormEvent) {
    e.preventDefault();
    if (!researchTopic.trim()) { toast.error("Enter a topic"); return; }
    setLoading("research"); setResearchResult(null);
    try {
      const res = await runIntelligenceResearch({ topic: researchTopic.trim() }) as any;
      setResearchResult(res?.data ?? res);
      toast.success("Research complete");
    } catch (err: any) { toast.error(err?.message ?? "Research failed"); }
    finally { setLoading(null); }
  }

  async function handleBatch(e: React.FormEvent) {
    e.preventDefault();
    const keywords = batchKeywords.split(",").map((k) => k.trim()).filter(Boolean);
    if (!keywords.length) { toast.error("Enter at least one keyword/topic"); return; }
    setLoading("batch"); setBatchResult(null);
    try {
      const prompts = keywords.map((k) => ({ topic: k }));
      const res = await runIntelligenceBatch({ prompts }) as any;
      setBatchResult(res?.data ?? res);
      toast.success("Batch analysis complete");
    } catch (err: any) { toast.error(err?.message ?? "Batch failed"); }
    finally { setLoading(null); }
  }

  function renderInsights(data: any) {
    if (!data) return null;
    const insights = data.insights ?? data.analysis ?? data.results ?? null;
    if (!insights) {
      return (
        <pre className="max-h-[400px] overflow-auto rounded-lg border border-meridian-100 bg-canvas p-4 text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
    }
    if (typeof insights === "string") {
      return <p className="whitespace-pre-wrap text-sm text-ink-2">{insights}</p>;
    }
    if (Array.isArray(insights)) {
      return (
        <div className="space-y-2">
          {insights.map((item: any, i: number) => (
            <div key={i} className="rounded-lg border border-meridian-100 bg-canvas p-3">
              <div className="mb-1 flex items-center gap-2">
                {item.priority && (
                  <Badge variant={item.priority === "high" ? "destructive" : item.priority === "medium" ? "medium" : "outline"}>
                    {item.priority}
                  </Badge>
                )}
                <span className="text-sm font-medium">{item.title ?? item.topic ?? item.keyword ?? `Insight ${i + 1}`}</span>
              </div>
              {item.description && <p className="text-sm text-ink-2">{item.description}</p>}
              {item.recommendation && <p className="mt-1 text-sm text-primary">{item.recommendation}</p>}
            </div>
          ))}
        </div>
      );
    }
    return (
      <pre className="max-h-[400px] overflow-auto rounded-lg border border-meridian-100 bg-canvas p-4 text-xs">
        {JSON.stringify(insights, null, 2)}
      </pre>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Intelligence</h1>
        <p className="text-ink-2">Deep SEO analysis, content gaps, and strategic recommendations</p>
      </div>

      <Tabs defaultValue="analyze" className="space-y-4">
        <TabsList className="bg-meridian-50">
          <TabsTrigger value="analyze" className="gap-2">
            <Brain className="h-4 w-4" /> Domain Analysis
          </TabsTrigger>
          <TabsTrigger value="gaps" className="gap-2">
            <GitMerge className="h-4 w-4" /> Gap Analysis
          </TabsTrigger>
          <TabsTrigger value="agent" className="gap-2">
            <Bot className="h-4 w-4" /> AI Agent
          </TabsTrigger>
          <TabsTrigger value="research" className="gap-2">
            <Search className="h-4 w-4" /> Research
          </TabsTrigger>
          <TabsTrigger value="batch" className="gap-2">
            <Layers className="h-4 w-4" /> Batch
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyze">
          <Card>
            <CardHeader>
              <CardTitle>Domain Intelligence</CardTitle>
              <p className="text-sm text-ink-2">Full SEO signal analysis for your domain and target keywords</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAnalyze} className="flex flex-wrap gap-4">
                <div className="min-w-[180px] flex-1 space-y-2">
                  <Label>Domain</Label>
                  <Input placeholder="yourdomain.com" value={analyzeDomain} onChange={(e) => setAnalyzeDomain(e.target.value)} disabled={!!loading} />
                </div>
                <div className="min-w-[200px] flex-1 space-y-2">
                  <Label>Keywords (comma-separated)</Label>
                  <Input placeholder="seo tool, rank tracker, keyword research" value={analyzeKeywords} onChange={(e) => setAnalyzeKeywords(e.target.value)} disabled={!!loading} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={!!loading}>
                    {loading === "analyze" ? "Analyzing…" : "Analyze"}
                  </Button>
                </div>
              </form>

              {analyzeResult && (
                <div className="mt-4 space-y-4">
                  {(analyzeResult.domainAuthority != null || analyzeResult.organicTraffic != null || analyzeResult.backlinks != null) && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {analyzeResult.domainAuthority != null && (
                        <div className="rounded-lg border border-meridian-100 bg-canvas p-3 text-center">
                          <p className="text-xl font-bold">{analyzeResult.domainAuthority}</p>
                          <p className="text-xs text-ink-2">Domain Authority</p>
                        </div>
                      )}
                      {analyzeResult.organicTraffic != null && (
                        <div className="rounded-lg border border-meridian-100 bg-canvas p-3 text-center">
                          <p className="text-xl font-bold">{analyzeResult.organicTraffic.toLocaleString()}</p>
                          <p className="text-xs text-ink-2">Est. Organic Traffic</p>
                        </div>
                      )}
                      {analyzeResult.backlinks != null && (
                        <div className="rounded-lg border border-meridian-100 bg-canvas p-3 text-center">
                          <p className="text-xl font-bold">{analyzeResult.backlinks.toLocaleString()}</p>
                          <p className="text-xs text-ink-2">Backlinks</p>
                        </div>
                      )}
                    </div>
                  )}
                  {renderInsights(analyzeResult)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaps">
          <Card>
            <CardHeader>
              <CardTitle>Content Gap Analysis</CardTitle>
              <p className="text-sm text-ink-2">Find keyword and content opportunities your competitor ranks for that you don&apos;t</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleGap} className="flex flex-wrap gap-4">
                <div className="min-w-[160px] flex-1 space-y-2">
                  <Label>Your domain</Label>
                  <Input placeholder="yourdomain.com" value={gapDomain} onChange={(e) => setGapDomain(e.target.value)} disabled={!!loading} />
                </div>
                <div className="min-w-[160px] flex-1 space-y-2">
                  <Label>Competitor domain</Label>
                  <Input placeholder="competitor.com" value={gapCompetitor} onChange={(e) => setGapCompetitor(e.target.value)} disabled={!!loading} />
                </div>
                <div className="min-w-[200px] flex-1 space-y-2">
                  <Label>Seed keywords (comma-separated)</Label>
                  <Input placeholder="keyword 1, keyword 2" value={gapKeywords} onChange={(e) => setGapKeywords(e.target.value)} disabled={!!loading} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={!!loading}>
                    {loading === "gap" ? "Analyzing…" : "Find Gaps"}
                  </Button>
                </div>
              </form>

              {gapResult && (
                <div className="mt-4 space-y-4">
                  {(gapResult.gaps ?? gapResult.keywords ?? []).length > 0 && (
                    <div>
                      <h3 className="mb-2 font-medium">Keyword Gaps</h3>
                      <div className="overflow-x-auto rounded-lg border border-meridian-100">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-meridian-100 bg-meridian-50">
                              <th className="px-4 py-3 text-left font-medium">Keyword</th>
                              <th className="px-4 py-3 text-left font-medium">Competitor Rank</th>
                              <th className="px-4 py-3 text-left font-medium">Your Rank</th>
                              <th className="px-4 py-3 text-left font-medium">Opportunity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(gapResult.gaps ?? gapResult.keywords).map((g: any, i: number) => (
                              <tr key={i} className="border-b border-meridian-100 last:border-0">
                                <td className="px-4 py-2 font-medium">{g.keyword ?? g.term ?? g.key}</td>
                                <td className="px-4 py-2 font-mono">{g.competitorRank ?? g.competitor ?? "—"}</td>
                                <td className="px-4 py-2 font-mono">{g.yourRank ?? g.yours ?? "Not ranking"}</td>
                                <td className="px-4 py-2">
                                  <Badge variant={g.opportunity === "high" ? "destructive" : g.opportunity === "medium" ? "medium" : "outline"}>
                                    {g.opportunity ?? "—"}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {gapResult.recommendations?.length > 0 && (
                    <div>
                      <h3 className="mb-2 font-medium">Recommendations</h3>
                      <ul className="list-disc space-y-1 pl-5 text-sm text-ink-2">
                        {gapResult.recommendations.map((r: any, i: number) => (
                          <li key={i}>{typeof r === "string" ? r : r.description ?? r.text}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!gapResult.gaps && !gapResult.keywords && !gapResult.recommendations && (
                    <pre className="max-h-[400px] overflow-auto rounded-lg border border-meridian-100 bg-canvas p-4 text-xs">
                      {JSON.stringify(gapResult, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agent">
          <Card>
            <CardHeader>
              <CardTitle>AI Agent Analysis</CardTitle>
              <p className="text-sm text-ink-2">Agent-based SEO analysis from a natural language prompt</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAgent} className="space-y-4">
                <div className="space-y-2">
                  <Label>Prompt</Label>
                  <Input placeholder="e.g. Analyze my competitor example.com for keyword X" value={agentPrompt} onChange={(e) => setAgentPrompt(e.target.value)} disabled={!!loading} className="h-12" />
                </div>
                <Button type="submit" disabled={!!loading}>{loading === "agent" ? "Analyzing…" : "Run Agent"}</Button>
              </form>
              {agentResult && (
                <div className="mt-4 max-h-[400px] overflow-auto rounded-lg border border-meridian-100 bg-canvas p-4">
                  <pre className="whitespace-pre-wrap text-xs">{typeof agentResult === "string" ? agentResult : JSON.stringify(agentResult, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="research">
          <Card>
            <CardHeader>
              <CardTitle>Research Analysis</CardTitle>
              <p className="text-sm text-ink-2">Deep research on a topic for content strategy</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleResearch} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Topic</Label>
                  <Input placeholder="e.g. voice search SEO 2024" value={researchTopic} onChange={(e) => setResearchTopic(e.target.value)} disabled={!!loading} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={!!loading}>{loading === "research" ? "Researching…" : "Run Research"}</Button>
                </div>
              </form>
              {researchResult && (
                <div className="mt-4 max-h-[400px] overflow-auto rounded-lg border border-meridian-100 bg-canvas p-4">
                  <pre className="whitespace-pre-wrap text-xs">{typeof researchResult === "string" ? researchResult : JSON.stringify(researchResult, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>Batch Analysis</CardTitle>
              <p className="text-sm text-ink-2">Run batch research across multiple topics. For domain-specific analysis use the <strong>Domain Analysis</strong> tab, or <strong>Gap Analysis</strong> for competitor comparisons.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleBatch} className="flex flex-wrap gap-4">
                <div className="min-w-[200px] flex-1 space-y-2">
                  <Label>Topics (comma-separated)</Label>
                  <Input placeholder="topic 1, topic 2" value={batchKeywords} onChange={(e) => setBatchKeywords(e.target.value)} disabled={!!loading} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={!!loading}>{loading === "batch" ? "Analyzing…" : "Run Batch"}</Button>
                </div>
              </form>
              {batchResult && (
                <div className="mt-4 max-h-[400px] overflow-auto rounded-lg border border-meridian-100 bg-canvas p-4">
                  <pre className="whitespace-pre-wrap text-xs">{typeof batchResult === "string" ? batchResult : JSON.stringify(batchResult, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
