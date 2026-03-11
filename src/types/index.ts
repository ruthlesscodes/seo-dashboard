export type Plan = "FREE" | "STARTER" | "GROWTH" | "SCALE" | "ENTERPRISE";

export type ApiMeta = {
  creditsUsed: number;
  creditsRemaining: number;
  plan: Plan;
};

export type KeywordResult = {
  keyword: string;
  position: number | null;
  url: string | null;
  opportunityScore: number;
};

export type RankPosition = {
  keyword: string;
  position: number | null;
  previousPosition?: number | null;
  change?: number;
  url: string | null;
  region: string;
};

export type SerpFeatures = {
  keyword: string;
  featuredSnippet: boolean;
  aiOverview: boolean;
  paa: boolean;
};

export type MonitoredUrl = {
  id: string;
  url: string;
  label: string | null;
  checkFrequency: string;
  isActive: boolean;
  lastCheckedAt: string | null;
  lastChangeAt: string | null;
};

export type ChangeEvent = {
  id: string;
  changeStatus: string;
  changeType: string | null;
  diff: string | null;
  detectedAt: string;
};

export type AuditIssue = {
  type: string;
  severity: "critical" | "warning" | "info";
  description: string;
  recommendation: string;
};

export type AuditResult = {
  score: number;
  issues: AuditIssue[];
  summary: { critical: number; warnings: number; info: number };
};

export type GeoScore = {
  score: number;
  breakdown: Record<string, number>;
  recommendations: { category: string; description: string }[];
};

export type BlogDraft = {
  id: string;
  title: string;
  targetKeyword: string;
  content: string;
  wordCount: number;
  status: string;
};

export type UsageData = {
  plan: Plan;
  credits: { used: number; limit: number; remaining: number };
  breakdown: { operation: string; calls: number; credits: number }[];
};

export type PipelineJob = {
  id: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  startedAt: string;
  completedAt?: string;
};
