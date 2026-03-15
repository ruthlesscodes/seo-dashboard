"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Play, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { runPipeline, getPipelineStatus } from "@/actions/pipeline";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type JobStatus = "pending" | "active" | "completed" | "failed";

const STATUS_ICON: Record<JobStatus, any> = {
  pending: Clock,
  active: RefreshCw,
  completed: CheckCircle2,
  failed: XCircle,
};

const STATUS_COLOR: Record<JobStatus, string> = {
  pending: "text-ink-2",
  active: "animate-spin text-meridian-600",
  completed: "text-success",
  failed: "text-danger",
};

export default function PipelinePage() {
  const { data: session } = useSession();
  const domain = (session?.user as { seoDomain?: string })?.seoDomain ?? "";

  const [loading, setLoading] = useState(false);
  const [runDomain, setRunDomain] = useState(domain);
  const [keywordsInput, setKeywordsInput] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [jobData, setJobData] = useState<any>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { if (domain) setRunDomain(domain); }, [domain]);

  useEffect(() => {
    if (!jobId || jobStatus === "completed" || jobStatus === "failed") {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(async () => {
      try {
        const res = await getPipelineStatus(jobId) as any;
        const data = res?.data ?? res;
        const state: JobStatus = data?.status ?? data?.state ?? "active";
        setJobStatus(state);
        setJobData(data);
        if (state === "completed" || state === "failed") {
          clearInterval(pollRef.current!);
          toast[state === "completed" ? "success" : "error"](
            state === "completed" ? "Pipeline complete!" : "Pipeline failed"
          );
        }
      } catch {
        // Keep polling
      }
    }, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [jobId, jobStatus]);

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    const keywords = keywordsInput.split(",").map((k) => k.trim()).filter(Boolean);
    if (!runDomain.trim() || !keywords.length) {
      toast.error("Enter domain and at least one keyword"); return;
    }
    setLoading(true);
    setJobId(null); setJobStatus(null); setJobData(null);
    try {
      const res = await runPipeline({
        domain: runDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""),
        keywords,
      }) as any;
      const data = res?.data ?? res;
      const id = data?.jobId ?? data?.id;
      if (!id) {
        setJobData(data);
        setJobStatus("completed");
        toast.success("Pipeline complete");
        return;
      }
      setJobId(id);
      setJobStatus("pending");
      toast.success("Pipeline started — polling for status…");
    } catch (err: any) {
      toast.error(err?.message ?? "Pipeline failed to start");
    } finally {
      setLoading(false);
    }
  }

  const StatusIcon = jobStatus ? STATUS_ICON[jobStatus] : null;

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Pipeline</h1>
        <p className="text-ink-2">Run the full SEO pipeline — audits, rankings, content, and recommendations in one job</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Run Full Pipeline</CardTitle>
          <p className="text-sm text-ink-2">Kicks off a background job that runs all audit and ranking checks</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleRun} className="flex flex-wrap gap-4">
            <div className="min-w-[180px] flex-1 space-y-2">
              <Label>Domain</Label>
              <Input placeholder="yourdomain.com" value={runDomain} onChange={(e) => setRunDomain(e.target.value)} disabled={loading} />
            </div>
            <div className="min-w-[240px] flex-1 space-y-2">
              <Label>Target keywords (comma-separated)</Label>
              <Input placeholder="seo tool, rank tracker" value={keywordsInput} onChange={(e) => setKeywordsInput(e.target.value)} disabled={loading} />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading || jobStatus === "active" || jobStatus === "pending"} className="gap-2">
                <Play className="h-4 w-4" />
                {loading ? "Starting…" : "Run Pipeline"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {jobStatus && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              {StatusIcon && <StatusIcon className={`h-5 w-5 ${STATUS_COLOR[jobStatus]}`} />}
              <CardTitle className="capitalize">{jobStatus}</CardTitle>
              {jobId && <Badge variant="outline" className="font-mono text-xs">{jobId}</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            {(jobStatus === "pending" || jobStatus === "active") && (
              <p className="animate-pulse text-sm text-ink-2">Running pipeline… checking every 4s. Takes 1–3 minutes.</p>
            )}
            {jobStatus === "completed" && jobData && (
              <div className="space-y-4">
                {(jobData.auditScore != null || jobData.avgPosition != null) && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {jobData.auditScore != null && (
                      <div className="rounded-lg border border-meridian-100 border-l-4 border-l-meridian-400 bg-white p-3 text-center">
                        <p className="text-xl font-bold text-ink">{jobData.auditScore}</p>
                        <p className="text-xs font-medium text-ink-2">Audit Score</p>
                      </div>
                    )}
                    {jobData.avgPosition != null && (
                      <div className="rounded-lg border border-meridian-100 border-l-4 border-l-meridian-400 bg-white p-3 text-center">
                        <p className="text-xl font-bold text-ink">{jobData.avgPosition}</p>
                        <p className="text-xs font-medium text-ink-2">Avg Position</p>
                      </div>
                    )}
                    {jobData.issuesFound != null && (
                      <div className="rounded-lg border border-meridian-100 border-l-4 border-l-meridian-400 bg-white p-3 text-center">
                        <p className="text-xl font-bold text-ink">{jobData.issuesFound}</p>
                        <p className="text-xs font-medium text-ink-2">Issues</p>
                      </div>
                    )}
                    {jobData.creditsUsed != null && (
                      <div className="rounded-lg border border-meridian-100 border-l-4 border-l-meridian-400 bg-white p-3 text-center">
                        <p className="text-xl font-bold text-ink">{jobData.creditsUsed}</p>
                        <p className="text-xs font-medium text-ink-2">Credits</p>
                      </div>
                    )}
                  </div>
                )}
                {jobData.recommendations?.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-medium">Recommendations</h3>
                    <div className="space-y-2">
                      {jobData.recommendations.map((r: any, i: number) => (
                        <div key={i} className="rounded-lg border border-meridian-100 border-l-4 border-l-meridian-400 bg-white p-3">
                          <Badge variant={r.priority === "critical" ? "destructive" : "outline"} className="mb-1">{r.priority}</Badge>
                          <p className="text-sm font-medium text-ink">{r.title ?? r.action}</p>
                          {r.description && <p className="text-sm text-ink-2">{r.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!jobData.auditScore && !jobData.recommendations && (
                  <pre className="max-h-[400px] overflow-auto rounded-lg border border-meridian-100 bg-canvas p-4 text-xs">
                    {JSON.stringify(jobData, null, 2)}
                  </pre>
                )}
              </div>
            )}
            {jobStatus === "failed" && (
              <p className="text-sm text-danger">{jobData?.error ?? jobData?.failedReason ?? "Pipeline failed."}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
