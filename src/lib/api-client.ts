// SEO Agent API Client - wraps all backend endpoints
// Used by Server Actions to call the backend API

const API_URL = process.env.SEO_API_URL || process.env.NEXT_PUBLIC_SEO_API_URL || "http://localhost:4200";

type RequestOpts = {
  apiKey: string;
  body?: Record<string, unknown>;
  method?: "GET" | "POST";
  params?: Record<string, string>;
  timeoutMs?: number;
};

export async function apiRequest<T = unknown>(
  endpoint: string,
  opts: RequestOpts
): Promise<T> {
  let url = API_URL + endpoint;
  if (opts.params) url += "?" + new URLSearchParams(opts.params).toString();

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? 60_000
  );

  try {
    const res = await fetch(url, {
      method: opts.method || "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": opts.apiKey,
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
      signal: controller.signal,
    });

    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.message || data.error || "API error");
      err.status = res.status;
      err.code = data.error;
      throw err;
    }
    return data as T;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// ---- Auth ----
export const authApi = {
  register: (body: { name: string; domain: string; email: string }) =>
    apiRequest("/api/auth/register", { apiKey: "", body: body as any }),
  usage: (apiKey: string) =>
    apiRequest("/api/auth/usage", { apiKey, method: "GET" }),
};

// ---- Keywords ----
export const keywordsApi = {
  search: (apiKey: string, body: { keywords: string[]; domain: string; country?: string }) =>
    apiRequest("/api/keywords/search", { apiKey, body: body as any }),
  cluster: (apiKey: string, body: { keywords: string[] }) =>
    apiRequest("/api/keywords/cluster", { apiKey, body: body as any }),
  suggest: (apiKey: string, body: { topic: string; count?: number }) =>
    apiRequest("/api/keywords/suggest", { apiKey, body: body as any }),
};

// ---- Rankings ----
export const rankingsApi = {
  check: (apiKey: string, body: { keywords: string[]; domain: string; region?: string }) =>
    apiRequest("/api/rankings/check", { apiKey, body: body as any }),
  global: (apiKey: string, body: { keyword: string; domain: string; regions: string[] }) =>
    apiRequest("/api/rankings/global", { apiKey, body: body as any }),
  serpFeatures: (apiKey: string, body: { keywords: string[] }) =>
    apiRequest("/api/rankings/serp-features", { apiKey, body: body as any }),
  serpSnapshot: (apiKey: string, body: { keyword: string; domain?: string; region?: string }) =>
    apiRequest("/api/rankings/serp-snapshot", { apiKey, body: body as any }),
};

// ---- Competitors ----
export const competitorsApi = {
  crawl: (apiKey: string, body: { domain: string; maxPages?: number }) =>
    apiRequest("/api/competitors/crawl", { apiKey, body: body as any, timeoutMs: 120_000 }),
  scrape: (apiKey: string, body: { url: string }) =>
    apiRequest("/api/competitors/scrape", { apiKey, body: body as any }),
  scrapeInteractive: (apiKey: string, body: { url: string }) =>
    apiRequest("/api/competitors/scrape-interactive", { apiKey, body: body as any, timeoutMs: 60_000 }),
  compare: (apiKey: string, body: { keyword: string; domain: string; competitorDomain: string }) =>
    apiRequest("/api/competitors/compare", { apiKey, body: body as any }),
  brand: (apiKey: string, body: { url: string }) =>
    apiRequest("/api/competitors/brand", { apiKey, body: body as any }),
};

// ---- Search ----
export const searchApi = {
  news: (apiKey: string, body: { query: string; limit?: number }) =>
    apiRequest("/api/search/news", { apiKey, body: body as any }),
  github: (apiKey: string, body: { query: string }) =>
    apiRequest("/api/search/github", { apiKey, body: body as any }),
  research: (apiKey: string, body: { query: string; depth?: string }) =>
    apiRequest("/api/search/research", { apiKey, body: body as any, timeoutMs: 120_000 }),
};

// ---- Brand ----
export const brandApi = {
  mentions: (apiKey: string, body: { brand: string; limit?: number }) =>
    apiRequest("/api/brand/mentions", { apiKey, body: body as any }),
  images: (apiKey: string, body: { query: string }) =>
    apiRequest("/api/brand/images", { apiKey, body: body as any }),
};

// ---- Content ----
export const contentApi = {
  generate: (apiKey: string, body: { keyword: string; segment?: string }) =>
    apiRequest("/api/content/generate", { apiKey, body: body as any, timeoutMs: 60_000 }),
  brief: (apiKey: string, body: { keyword: string }) =>
    apiRequest("/api/content/brief", { apiKey, body: body as any }),
  refresh: (apiKey: string, body: { url: string; keyword: string }) =>
    apiRequest("/api/content/refresh", { apiKey, body: body as any }),
  trending: (apiKey: string, body: { topic: string; timeRange?: string }) =>
    apiRequest("/api/content/trending", { apiKey, body: body as any }),
};

// ---- Monitor ----
export const monitorApi = {
  watch: (apiKey: string, body: { url: string; label?: string; frequency?: string }) =>
    apiRequest("/api/monitor/watch", { apiKey, body: body as any }),
  check: (apiKey: string, body?: { urls?: string[] }) =>
    apiRequest("/api/monitor/check", { apiKey, body: (body || {}) as any }),
  changes: (apiKey: string, params?: Record<string, string>) =>
    apiRequest("/api/monitor/changes", { apiKey, method: "GET", params }),
  diff: (apiKey: string, body: { url: string }) =>
    apiRequest("/api/monitor/diff", { apiKey, body: body as any }),
  pricing: (apiKey: string, body: { url: string }) =>
    apiRequest("/api/monitor/pricing", { apiKey, body: body as any }),
  decay: (apiKey: string, body: { domain: string }) =>
    apiRequest("/api/monitor/decay", { apiKey, body: body as any }),
};

// ---- Audit ----
export const auditApi = {
  technical: (apiKey: string, body: { url?: string; domain?: string; maxPages?: number }) =>
    apiRequest("/api/audit/technical", { apiKey, body: body as any, timeoutMs: 120_000 }),
  batch: (apiKey: string, body: { urls: string[] }) =>
    apiRequest("/api/audit/batch", { apiKey, body: body as any, timeoutMs: 60_000 }),
  internalLinks: (apiKey: string, body: { domain: string }) =>
    apiRequest("/api/audit/internal-links", { apiKey, body: body as any, timeoutMs: 180_000 }),
  screenshot: (apiKey: string, body: { url: string }) =>
    apiRequest("/api/audit/screenshot", { apiKey, body: body as any }),
  lighthouse: (apiKey: string, body: { url: string; strategy?: "mobile" | "desktop" }) =>
    apiRequest("/api/audit/lighthouse", { apiKey, body: body as any, timeoutMs: 90_000 }),
  agent: (apiKey: string, body: { domain: string }) =>
    apiRequest("/api/audit/agent", { apiKey, body: body as any, timeoutMs: 120_000 }),
  history: (apiKey: string, params?: { limit?: string; domain?: string }) =>
    apiRequest("/api/audit/history", { apiKey, method: "GET", params: params as any }),
  runDetails: (apiKey: string, runId: string) =>
    apiRequest("/api/audit/runs/" + runId, { apiKey, method: "GET" }),
};

// ---- GEO / AEO ----
export const geoApi = {
  brandMonitor: (apiKey: string, body: { brand: string; competitors?: string[] }) =>
    apiRequest("/api/geo/brand-monitor", { apiKey, body: body as any }),
  readability: (apiKey: string, body: { url?: string; domain?: string }) =>
    apiRequest("/api/geo/readability", { apiKey, body: body as any }),
  llmstxt: (apiKey: string, body: { domain: string }) =>
    apiRequest("/api/geo/llmstxt", { apiKey, body: body as any }),
  optimize: (apiKey: string, body: { domain: string; brand: string; keywords: string[] }) =>
    apiRequest("/api/geo/optimize", { apiKey, body: body as any }),
};

// ---- Intelligence ----
export const intelligenceApi = {
  analyze: (apiKey: string, body: { domain: string; keywords: string[] }) =>
    apiRequest("/api/intelligence/analyze", { apiKey, body: body as any }),
  gaps: (apiKey: string, body: { domain: string; competitorDomain: string; keywords: string[] }) =>
    apiRequest("/api/intelligence/gaps", { apiKey, body: body as any }),
  agent: (apiKey: string, body: { prompt: string }) =>
    apiRequest("/api/intelligence/agent", { apiKey, body: body as any, timeoutMs: 120_000 }),
  research: (apiKey: string, body: { topic: string }) =>
    apiRequest("/api/intelligence/research", { apiKey, body: body as any }),
  batch: (apiKey: string, body: { domain: string; keywords: string[]; competitorDomains?: string[] }) =>
    apiRequest("/api/intelligence/batch", { apiKey, body: body as any, timeoutMs: 180_000 }),
};

// ---- Domain ----
export const domainApi = {
  map: (apiKey: string, body: { url: string }) =>
    apiRequest("/api/domain/map", { apiKey, body: body as any }),
  sitemap: (apiKey: string, body: { url: string }) =>
    apiRequest("/api/domain/sitemap", { apiKey, body: body as any }),
  structure: (apiKey: string, body: { url: string }) =>
    apiRequest("/api/domain/structure", { apiKey, body: body as any }),
};

// ---- Pipeline ----
export const pipelineApi = {
  run: (apiKey: string, body: { domain: string; keywords: string[] }) =>
    apiRequest("/api/pipeline/run", { apiKey, body: body as any }),
  status: (apiKey: string, jobId: string) =>
    apiRequest("/api/pipeline/" + jobId, { apiKey, method: "GET" }),
};

// ---- Billing ----
export const billingApi = {
  plans: (apiKey: string) =>
    apiRequest("/api/billing/plans", { apiKey, method: "GET" }),
  upgrade: (apiKey: string, body: { plan: string }) =>
    apiRequest("/api/billing/upgrade", { apiKey, body: body as any }),
  portal: (apiKey: string) =>
    apiRequest("/api/billing/portal", { apiKey, method: "GET" }),
};

// ---- Webhooks ----
export const webhooksApi = {
  configure: (apiKey: string, body: { url: string; events?: string[] }) =>
    apiRequest("/api/webhooks/configure", { apiKey, body: body as any }),
};
