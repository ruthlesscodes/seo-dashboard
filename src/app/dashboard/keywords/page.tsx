"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Search, Layers, Lightbulb } from "lucide-react";
import { searchKeywords, clusterKeywords, suggestKeywords } from "@/actions/keywords";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const REGIONS = [
  { value: "us", label: "US" },
  { value: "ph", label: "PH" },
  { value: "ng", label: "NG" },
  { value: "uk", label: "UK" },
  { value: "au", label: "AU" },
];

function opportunityVariant(score: number) {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export default function KeywordsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [searchKeywordsInput, setSearchKeywordsInput] = useState("");
  const [searchDomain, setSearchDomain] = useState("");
  const [searchRegion, setSearchRegion] = useState("us");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [clusterInput, setClusterInput] = useState("");
  const [clusterResults, setClusterResults] = useState<any[]>([]);

  const [suggestTopic, setSuggestTopic] = useState("");
  const [suggestCount, setSuggestCount] = useState(10);
  const [suggestResults, setSuggestResults] = useState<any[]>([]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const keywords = searchKeywordsInput
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    if (!keywords.length || !searchDomain.trim()) {
      toast.error("Enter keywords and domain");
      return;
    }
    setLoading("search");
    try {
      const res = await searchKeywords({
        keywords,
        domain: searchDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""),
        country: searchRegion,
      });
      const data = Array.isArray(res) ? res : (res as any)?.data ?? (res as any)?.results ?? [];
      setSearchResults(Array.isArray(data) ? data : []);
      toast.success(`Found ${Array.isArray(data) ? data.length : 0} results`);
    } catch (err: any) {
      toast.error(err?.message ?? "Search failed");
      setSearchResults([]);
    } finally {
      setLoading(null);
    }
  }

  async function handleCluster(e: React.FormEvent) {
    e.preventDefault();
    const keywords = clusterInput
      .split(/[\n,]/)
      .map((k) => k.trim())
      .filter(Boolean);
    if (!keywords.length) {
      toast.error("Enter keywords");
      return;
    }
    setLoading("cluster");
    try {
      const res = await clusterKeywords({ keywords });
      const data = Array.isArray(res) ? res : (res as any)?.data ?? (res as any)?.clusters ?? [];
      setClusterResults(Array.isArray(data) ? data : []);
      toast.success("Clustered");
    } catch (err: any) {
      toast.error(err?.message ?? "Cluster failed");
      setClusterResults([]);
    } finally {
      setLoading(null);
    }
  }

  async function handleSuggest(e: React.FormEvent) {
    e.preventDefault();
    if (!suggestTopic.trim()) {
      toast.error("Enter a topic");
      return;
    }
    setLoading("suggest");
    try {
      const res = await suggestKeywords({ topic: suggestTopic.trim(), count: suggestCount });
      const data = Array.isArray(res) ? res : (res as any)?.data ?? (res as any)?.suggestions ?? [];
      setSuggestResults(Array.isArray(data) ? data : []);
      toast.success(`Got ${Array.isArray(data) ? data.length : 0} suggestions`);
    } catch (err: any) {
      toast.error(err?.message ?? "Suggest failed");
      setSuggestResults([]);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Keywords</h1>
        <p className="text-muted-foreground">
          Search, cluster, and discover keyword opportunities
        </p>
      </div>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="search" className="gap-2">
            <Search className="h-4 w-4" /> Search
          </TabsTrigger>
          <TabsTrigger value="cluster" className="gap-2">
            <Layers className="h-4 w-4" /> Cluster
          </TabsTrigger>
          <TabsTrigger value="suggest" className="gap-2">
            <Lightbulb className="h-4 w-4" /> Suggest
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Search Rankings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter comma-separated keywords and domain to check positions
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] space-y-2">
                  <Label>Keywords</Label>
                  <Input
                    placeholder="keyword 1, keyword 2, ..."
                    value={searchKeywordsInput}
                    onChange={(e) => setSearchKeywordsInput(e.target.value)}
                    disabled={loading !== null}
                  />
                </div>
                <div className="w-48 space-y-2">
                  <Label>Domain</Label>
                  <Input
                    placeholder="example.com"
                    value={searchDomain}
                    onChange={(e) => setSearchDomain(e.target.value)}
                    disabled={loading !== null}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label>Region</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={searchRegion}
                    onChange={(e) => setSearchRegion(e.target.value)}
                    disabled={loading !== null}
                  >
                    {REGIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={loading !== null}>
                    {loading === "search" ? "Searching…" : "Search Rankings"}
                  </Button>
                </div>
              </form>
              {searchResults.length > 0 && (
                <div className="mt-4 overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium">Keyword</th>
                        <th className="px-4 py-3 text-left font-medium">Position</th>
                        <th className="px-4 py-3 text-left font-medium">URL</th>
                        <th className="px-4 py-3 text-left font-medium">Opportunity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((row: any, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-4 py-2 font-medium">{row.keyword ?? row.key}</td>
                          <td className="px-4 py-2 font-mono">
                            {row.position ?? row.rank ?? "—"}
                          </td>
                          <td className="max-w-[200px] truncate px-4 py-2 font-mono text-muted-foreground">
                            {row.url ?? "—"}
                          </td>
                          <td className="px-4 py-2">
                            <Badge
                              variant={
                                opportunityVariant(
                                  row.opportunityScore ?? row.opportunity ?? 0
                                ) as "high" | "medium" | "low"
                              }
                            >
                              {row.opportunityScore ?? row.opportunity ?? 0}%
                            </Badge>
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

        <TabsContent value="cluster">
          <Card>
            <CardHeader>
              <CardTitle>Cluster by Intent</CardTitle>
              <p className="text-sm text-muted-foreground">
                Paste keywords (comma or newline) to group by search intent
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleCluster} className="space-y-4">
                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <textarea
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="keyword 1&#10;keyword 2&#10;..."
                    value={clusterInput}
                    onChange={(e) => setClusterInput(e.target.value)}
                    disabled={loading !== null}
                  />
                </div>
                <Button type="submit" disabled={loading !== null}>
                  {loading === "cluster" ? "Clustering…" : "Cluster by Intent"}
                </Button>
              </form>
              {clusterResults.length > 0 && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {clusterResults.map((cluster: any, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border bg-card p-4"
                    >
                      <Badge className="mb-2">
                        {cluster.intent ?? cluster.type ?? "Cluster"}
                      </Badge>
                      {cluster.suggestedPillarTopic && (
                        <p className="mb-2 text-xs text-muted-foreground">
                          Pillar: {cluster.suggestedPillarTopic}
                        </p>
                      )}
                      <ul className="space-y-1 text-sm">
                        {(cluster.keywords ?? cluster.terms ?? []).slice(0, 5).map(
                          (k: string, j: number) => (
                            <li key={j} className="truncate">
                              {k}
                            </li>
                          )
                        )}
                        {(cluster.keywords ?? cluster.terms ?? []).length > 5 && (
                          <li className="text-muted-foreground">
                            +{(cluster.keywords ?? cluster.terms).length - 5} more
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggest">
          <Card>
            <CardHeader>
              <CardTitle>Get Suggestions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter a topic to discover related keyword opportunities
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSuggest} className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] space-y-2">
                  <Label>Topic / seed keyword</Label>
                  <Input
                    placeholder="e.g. remote work tips"
                    value={suggestTopic}
                    onChange={(e) => setSuggestTopic(e.target.value)}
                    disabled={loading !== null}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label>Count</Label>
                  <Input
                    type="number"
                    min={5}
                    max={50}
                    value={suggestCount}
                    onChange={(e) => setSuggestCount(parseInt(e.target.value, 10) || 10)}
                    disabled={loading !== null}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={loading !== null}>
                    {loading === "suggest" ? "Loading…" : "Get Suggestions"}
                  </Button>
                </div>
              </form>
              {suggestResults.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {suggestResults.map((s: any, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                    >
                      <span className="font-medium">{s.keyword ?? s.term ?? s}</span>
                      <div className="flex gap-1">
                        {(s.difficulty || s.intent) && (
                          <Badge
                            variant={
                              (s.difficulty === "easy" || s.difficulty === "low"
                                ? "easy"
                                : s.difficulty === "hard" || s.difficulty === "high"
                                ? "hard"
                                : "medium") as "easy" | "medium" | "hard"
                            }
                          >
                            {s.difficulty ?? s.intent ?? ""}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
