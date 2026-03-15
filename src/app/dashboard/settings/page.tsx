"use client";

import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Globe, Link2, Copy, Check, ExternalLink, Webhook } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { configureWebhook } from "@/actions/webhooks";

export default function SettingsPage() {
  const { data: session } = useSession();

  const apiKey = (session?.user as { seoApiKey?: string })?.seoApiKey ?? "";
  const orgId  = (session?.user as { seoOrgId?: string })?.seoOrgId ?? "";
  const plan   = (session?.user as { seoPlan?: string })?.seoPlan ?? "FREE";
  const domain = (session?.user as { seoDomain?: string })?.seoDomain ?? "";

  const [copied, setCopied] = useState<string | null>(null);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookLoading, setWebhookLoading] = useState(false);

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(null), 2000);
    });
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_SEO_API_URL || "https://your-api.up.railway.app";
  const gscConnectUrl = `${apiBaseUrl}/api/auth/gsc/connect?apiKey=${encodeURIComponent(apiKey)}`;

  async function handleConfigureWebhook(e: React.FormEvent) {
    e.preventDefault();
    if (!webhookUrl.trim()) {
      toast.error("Enter webhook URL");
      return;
    }
    setWebhookLoading(true);
    try {
      await configureWebhook({ url: webhookUrl.trim(), events: ["pipeline.completed", "monitor.changed", "ranking.dropped", "audit.completed"] });
      toast.success("Webhook configured");
    } catch (err: any) {
      toast.error(err?.message ?? "Webhook configuration failed");
    } finally {
      setWebhookLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Settings</h1>
        <p className="text-ink-2">Account and integration configuration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" /> Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={session?.user?.name ?? ""} readOnly className="bg-canvas" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={session?.user?.email ?? ""} readOnly className="bg-canvas" />
            </div>
            <div className="space-y-2">
              <Label>Domain</Label>
              <Input value={domain} readOnly className="bg-canvas" />
            </div>
            <div className="space-y-2">
              <Label>Plan</Label>
              <div className="flex h-10 items-center">
                <Badge>{plan}</Badge>
                {plan !== "GROWTH" && (
                  <a href="/dashboard/billing" className="ml-3 text-sm text-primary hover:underline">
                    Upgrade →
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" /> API Key
          </CardTitle>
          <p className="text-sm text-ink-2">Use this key to authenticate direct API calls</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={apiKeyVisible ? "text" : "password"}
                value={apiKey}
                readOnly
                className="bg-canvas font-mono pr-10"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => setApiKeyVisible((v) => !v)}>
              {apiKeyVisible ? "Hide" : "Show"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(apiKey, "apiKey")}
              className="gap-1"
            >
              {copied === "apiKey" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              Copy
            </Button>
          </div>
          {orgId && (
            <p className="text-xs text-ink-2">
              Org ID: <span className="font-mono">{orgId}</span>
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-4 w-4" /> Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-meridian-100 bg-canvas p-4">
            <div>
              <p className="font-medium">Google Search Console</p>
              <p className="text-sm text-ink-2">
                Import real keyword impressions, clicks, and ranking drops
              </p>
              {plan === "FREE" && (
                <p className="mt-1 text-xs text-amber-500">STARTER plan or higher required</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {plan === "FREE" ? (
                <Button variant="outline" size="sm" asChild>
                  <a href="/dashboard/billing">Upgrade to connect</a>
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    window.open(gscConnectUrl, "_blank", "width=600,height=700");
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  Connect Google Search Console
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-4 w-4" /> Webhooks
          </CardTitle>
          <p className="text-sm text-ink-2">
            Receive events when audits complete, rankings change, or pipeline jobs finish
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleConfigureWebhook} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[280px] space-y-2">
              <Label>Webhook URL</Label>
              <Input
                placeholder="https://your-server.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                disabled={webhookLoading}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={webhookLoading}>
                {webhookLoading ? "Configuring…" : "Configure Webhook"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-ink-2">
            Integrate the SEO API directly into your own apps. Authenticate using your API key above in the <code className="rounded bg-meridian-100 px-1 py-0.5 font-mono text-xs">x-api-key</code> header.
          </p>
          <div className="overflow-x-auto rounded-lg bg-meridian-50 p-4 font-mono text-xs">
            {`curl -X POST ${apiBaseUrl}/api/audit/technical \\
  -H "x-api-key: ${apiKeyVisible ? apiKey : "YOUR_API_KEY"}" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com"}'`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
