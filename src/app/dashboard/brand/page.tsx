"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MessageSquare, Image as ImageIcon } from "lucide-react";
import { getBrandMentions, getBrandImages } from "@/actions/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BrandPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const [mentionsBrand, setMentionsBrand] = useState("");
  const [mentionsResult, setMentionsResult] = useState<any>(null);

  const [imagesQuery, setImagesQuery] = useState("");
  const [imagesResult, setImagesResult] = useState<any>(null);

  async function handleMentions(e: React.FormEvent) {
    e.preventDefault();
    if (!mentionsBrand.trim()) { toast.error("Enter brand name"); return; }
    setLoading("mentions"); setMentionsResult(null);
    try {
      const res = await getBrandMentions({ brand: mentionsBrand.trim() }) as any;
      setMentionsResult(res?.data ?? res);
      toast.success("Brand mentions loaded");
    } catch (err: any) { toast.error(err?.message ?? "Failed"); }
    finally { setLoading(null); }
  }

  async function handleImages(e: React.FormEvent) {
    e.preventDefault();
    if (!imagesQuery.trim()) { toast.error("Enter search query"); return; }
    setLoading("images"); setImagesResult(null);
    try {
      const res = await getBrandImages({ query: imagesQuery.trim() }) as any;
      setImagesResult(res?.data ?? res);
      toast.success("Brand images loaded");
    } catch (err: any) { toast.error(err?.message ?? "Failed"); }
    finally { setLoading(null); }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Brand</h1>
        <p className="text-muted-foreground">Brand mentions and image search</p>
      </div>

      <Tabs defaultValue="mentions" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="mentions" className="gap-2">
            <MessageSquare className="h-4 w-4" /> Mentions
          </TabsTrigger>
          <TabsTrigger value="images" className="gap-2">
            <ImageIcon className="h-4 w-4" /> Images
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mentions">
          <Card>
            <CardHeader>
              <CardTitle>Brand Mentions</CardTitle>
              <p className="text-sm text-muted-foreground">Find where your brand is mentioned online</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleMentions} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Brand name</Label>
                  <Input placeholder="Your Brand" value={mentionsBrand} onChange={(e) => setMentionsBrand(e.target.value)} disabled={!!loading} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={!!loading}>{loading === "mentions" ? "Searching…" : "Search Mentions"}</Button>
                </div>
              </form>
              {mentionsResult && (
                <div className="mt-4 max-h-[400px] overflow-auto rounded-lg border border-border bg-muted/30 p-4">
                  <pre className="whitespace-pre-wrap text-xs">
                    {typeof mentionsResult === "string" ? mentionsResult : JSON.stringify(mentionsResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Brand Image Search</CardTitle>
              <p className="text-sm text-muted-foreground">Search for brand-related images</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleImages} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Query</Label>
                  <Input placeholder="e.g. brand logo, product images" value={imagesQuery} onChange={(e) => setImagesQuery(e.target.value)} disabled={!!loading} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={!!loading}>{loading === "images" ? "Searching…" : "Search Images"}</Button>
                </div>
              </form>
              {imagesResult && (
                <div className="mt-4 max-h-[400px] overflow-auto rounded-lg border border-border bg-muted/30 p-4">
                  <pre className="whitespace-pre-wrap text-xs">
                    {typeof imagesResult === "string" ? imagesResult : JSON.stringify(imagesResult, null, 2)}
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
