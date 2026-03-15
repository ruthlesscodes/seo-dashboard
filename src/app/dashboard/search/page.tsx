"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Newspaper, Github, BookOpen } from "lucide-react";
import { searchNews, searchGithub, searchResearch } from "@/actions/search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SearchPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [newsQuery, setNewsQuery] = useState("");
  const [newsResult, setNewsResult] = useState<any>(null);
  const [githubQuery, setGithubQuery] = useState("");
  const [githubResult, setGithubResult] = useState<any>(null);
  const [researchQuery, setResearchQuery] = useState("");
  const [researchResult, setResearchResult] = useState<any>(null);

  async function handleNews(e: React.FormEvent) {
    e.preventDefault();
    if (!newsQuery.trim()) { toast.error("Enter a query"); return; }
    setLoading("news"); setNewsResult(null);
    try {
      const res = await searchNews({ query: newsQuery.trim() }) as any;
      setNewsResult(res?.data ?? res);
      toast.success("News search complete");
    } catch (err: any) { toast.error(err?.message ?? "News search failed"); }
    finally { setLoading(null); }
  }

  async function handleGithub(e: React.FormEvent) {
    e.preventDefault();
    if (!githubQuery.trim()) { toast.error("Enter a query"); return; }
    setLoading("github"); setGithubResult(null);
    try {
      const res = await searchGithub({ query: githubQuery.trim() }) as any;
      setGithubResult(res?.data ?? res);
      toast.success("GitHub search complete");
    } catch (err: any) { toast.error(err?.message ?? "GitHub search failed"); }
    finally { setLoading(null); }
  }

  async function handleResearch(e: React.FormEvent) {
    e.preventDefault();
    if (!researchQuery.trim()) { toast.error("Enter a query"); return; }
    setLoading("research"); setResearchResult(null);
    try {
      const res = await searchResearch({ query: researchQuery.trim() }) as any;
      setResearchResult(res?.data ?? res);
      toast.success("Research search complete");
    } catch (err: any) { toast.error(err?.message ?? "Research search failed"); }
    finally { setLoading(null); }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Search</h1>
        <p className="text-ink-2">News, GitHub, and research search</p>
      </div>

      <Tabs defaultValue="news" className="space-y-4">
        <TabsList className="bg-meridian-50">
          <TabsTrigger value="news" className="gap-2">
            <Newspaper className="h-4 w-4" /> News
          </TabsTrigger>
          <TabsTrigger value="github" className="gap-2">
            <Github className="h-4 w-4" /> GitHub
          </TabsTrigger>
          <TabsTrigger value="research" className="gap-2">
            <BookOpen className="h-4 w-4" /> Research
          </TabsTrigger>
        </TabsList>

        <TabsContent value="news">
          <Card>
            <CardHeader>
              <CardTitle>News Search</CardTitle>
              <p className="text-sm text-ink-2">Search news articles by query</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleNews} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Query</Label>
                  <Input placeholder="e.g. SEO trends 2024" value={newsQuery} onChange={(e) => setNewsQuery(e.target.value)} disabled={!!loading} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={!!loading}>{loading === "news" ? "Searching…" : "Search News"}</Button>
                </div>
              </form>
              {newsResult && (
                <pre className="max-h-[400px] overflow-auto rounded-lg border border-meridian-100 bg-canvas p-4 text-xs whitespace-pre-wrap">
                  {typeof newsResult === "string" ? newsResult : JSON.stringify(newsResult, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="github">
          <Card>
            <CardHeader>
              <CardTitle>GitHub Search</CardTitle>
              <p className="text-sm text-ink-2">Search GitHub repositories</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleGithub} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Query</Label>
                  <Input placeholder="e.g. seo crawler" value={githubQuery} onChange={(e) => setGithubQuery(e.target.value)} disabled={!!loading} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={!!loading}>{loading === "github" ? "Searching…" : "Search GitHub"}</Button>
                </div>
              </form>
              {githubResult && (
                <pre className="max-h-[400px] overflow-auto rounded-lg border border-meridian-100 bg-canvas p-4 text-xs whitespace-pre-wrap">
                  {typeof githubResult === "string" ? githubResult : JSON.stringify(githubResult, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="research">
          <Card>
            <CardHeader>
              <CardTitle>Research Search</CardTitle>
              <p className="text-sm text-ink-2">Deep research search</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleResearch} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Query</Label>
                  <Input placeholder="e.g. content marketing best practices" value={researchQuery} onChange={(e) => setResearchQuery(e.target.value)} disabled={!!loading} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={!!loading}>{loading === "research" ? "Searching…" : "Search Research"}</Button>
                </div>
              </form>
              {researchResult && (
                <pre className="max-h-[400px] overflow-auto rounded-lg border border-meridian-100 bg-canvas p-4 text-xs whitespace-pre-wrap">
                  {typeof researchResult === "string" ? researchResult : JSON.stringify(researchResult, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
