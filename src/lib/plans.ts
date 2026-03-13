// Feature gating aligned with backend PLAN_LIMITS feature strings

const FREE_FEATURES = ["search", "track", "map", "sitemap"];

const STARTER_FEATURES = [
  ...FREE_FEATURES,
  "crawl", "analyze", "blog",
  "screenshot", "news",
  "audit.technical", "audit.lighthouse",
  "monitor.check", "monitor.diff",
];

const GROWTH_FEATURES = [
  ...STARTER_FEATURES,
  "cluster", "refresh", "pipeline",
  "audit.batch", "audit.internal-links",
  "monitor.pricing", "monitor.decay",
  "rankings.global", "rankings.serp-features",
  "trending", "brand.mentions",
  "geo.readability", "geo.llmstxt",
];

const SCALE_FEATURES = [
  ...GROWTH_FEATURES,
  "agent", "audit.agent",
  "intelligence.agent", "intelligence.batch",
  "webhooks", "actions",
  "geo.brand-monitor", "geo.optimize",
  "competitors.brand", "brand.images",
  "domain.structure",
  "serp-snapshot",
];

const PLAN_FEATURES: Record<string, string[]> = {
  FREE: FREE_FEATURES,
  STARTER: STARTER_FEATURES,
  GROWTH: GROWTH_FEATURES,
  SCALE: SCALE_FEATURES,
  ENTERPRISE: ["*"],
};

const PLAN_RANK: Record<string, number> = {
  FREE: 0,
  STARTER: 1,
  GROWTH: 2,
  SCALE: 3,
  ENTERPRISE: 4,
};

export const VALID_PLANS = ["FREE", "STARTER", "GROWTH", "SCALE", "ENTERPRISE"] as const;
export type Plan = (typeof VALID_PLANS)[number];

/** Check if a plan includes a specific feature string (matches backend checkFeature logic). */
export function hasFeatureAccess(userPlan: string, feature: string): boolean {
  const plan = VALID_PLANS.includes(userPlan as Plan) ? userPlan : "FREE";
  const features = PLAN_FEATURES[plan] || PLAN_FEATURES.FREE;
  return features.includes("*") || features.includes(feature);
}

/** Simple tier comparison — check if user plan is at or above a required plan tier. */
export function hasFeature(userPlan: string, requiredPlan: string): boolean {
  return (PLAN_RANK[userPlan] || 0) >= (PLAN_RANK[requiredPlan] || 0);
}

/** Normalize plan string to a valid Plan value. */
export function normalizePlan(plan: string | null | undefined): Plan {
  if (!plan) return "FREE";
  const upper = plan.toUpperCase();
  return VALID_PLANS.includes(upper as Plan) ? (upper as Plan) : "FREE";
}
