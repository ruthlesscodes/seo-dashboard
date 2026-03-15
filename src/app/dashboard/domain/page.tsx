"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Map, FileText, Network } from "lucide-react";
import { mapDomain, getSitemap, getDomainStructure } from "@/actions/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DomainPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [mapUrl, setMapUrl] = useState("");
  const [mapResult, setMapResult] = useState<any>(null);
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [sitemapResult, setSitemapResult] = useState<any>(null);
  const [structureUrl, setStructureUrl] = useState("");
  const [structureResult, setStructureResult] = useState<any>(null);

  async function handleMap(e: React.FormEvent) {
    e.preventDefault();
    if (!mapUrl.trim()) { toast.error("Enter a URL"); return; }
    setLoading("map"); setMapResult(null);
    try {
      const res = await mapDomain({ url: mapUrl.trim() }) as any;
      setMapResult(res?.data ?? res);
      toast.success("Site map complete");
    } catch (err: any) { toast.error(err?.message ?? "Map failed"); }
    finally { setLoading(null); }
  }

  async function handleSitemap(e: React.FormEvent) {
    e.preventDefault();
    if (!sitemapUrl.trim()) { toast.error("Enter a URL"); return; }
    setLoading("sitemap"); setSitemapResult(null);
    try {
      const res = await getSitemap({ url: sitemapUrl.trim() }) as any;
      setSitemapResult(res?.data ?? res);
      toast.success("Sitemap generated");
    } catch (err: any) { toast.error(err?.message ?? "Sitemap failed"); }
    finally { setLoading(null); }
  }

  async function handleStructure(e: React.FormEvent) {
    e.preventDefault();
    if (!structureUrl.trim()) { toast.error("Enter a URL"); return; }
    setLoading("structure"); setStructureResult(null);
    try {
      const res = await getDomainStructure({ url: structureUrl.trim() }) as any;
      setStructureResult(res?.data ?? res);
      toast.success("Structure analysis complete");
    } catch (err: any) { toast.error(err?.message ?? "Structure failed"); }
    finally { setLoading(null); }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Domain</h1>
        <p className="text-ink-2">Site structure, sitemap, and domain analysis</p>
      </div>

      <Tabs defaultValue="map" className="space-y-4">
        <TabsList className="bg-meridian-50">
          <TabsTrigger value="map" className="gap-2">
            <Map className="h-4 w-4" /> Site Map
          </TabsTrigger>
          <TabsTrigger value="sitemap" className="gap-2">
            <FileText className="h-4 w-4" /> Sitemap
          </TabsTrigger>
          <TabsTrigger value="structure" className="gap-2">
            <Network className="h-4 w-4" /> Structure
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Site Structure Map</CardTitle>
              <p className="text-sm text-ink-2">Map site structure and links</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleMap} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>URL</Label>
                  <Input placeholder="https://example.com" value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} disabled={!!loading} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={!!loading}>{loading === "map" ? "Mapping…" : "Map Site"}</Button>
                </div>
              </form>
              {mapResult && (
                <pre className="mt-4 max-h-[400px] overflow-auto rounded-lg border border-meridian-100 bg-canvas p-4 text-xs whitespace-pre-wrap">
                  {typeof mapResult === "string" ? mapResult : JSON.stringify(mapResult, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sitemap">
          <Card>
            <CardHeader>
              <CardTitle>Sitemap Generation</CardTitle>
              <p className="text-sm text-ink-2">Generate XML sitemap for your domain</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSitemap} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>URL</Label>
                  <Input placeholder="https://example.com" value={sitemapUrl} onChange={(e) => setSitemapUrl(e.target.value)} disabled={!!loading} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={!!loading}>{loading === "sitemap" ? "Generating…" : "Generate Sitemap"}</Button>
                </div>
              </form>
              {sitemapResult && (
                <pre className="mt-4 max-h-[400px] overflow-auto rounded-lg border border-meridian-100 bg-canvas p-4 text-xs whitespace-pre-wrap">
                  {typeof sitemapResult === "string" ? sitemapResult : JSON.stringify(sitemapResult, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure">
          <Card>
            <CardHeader>
              <CardTitle>Domain Structure Analysis</CardTitle>
              <p className="text-sm text-ink-2">Analyze domain structure and hierarchy</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleStructure} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>URL</Label>
                  <Input placeholder="https://example.com" value={structureUrl} onChange={(e) => setStructureUrl(e.target.value)} disabled={!!loading} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={!!loading}>{loading === "structure" ? "Analyzing…" : "Analyze"}</Button>
                </div>
              </form>
              {structureResult && (
                <pre className="mt-4 max-h-[400px] overflow-auto rounded-lg border border-meridian-100 bg-canvas p-4 text-xs whitespace-pre-wrap">
                  {typeof structureResult === "string" ? structureResult : JSON.stringify(structureResult, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
