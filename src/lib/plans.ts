const PLAN_RANK: Record<string, number> = { FREE: 0, STARTER: 1, GROWTH: 2, SCALE: 3, ENTERPRISE: 4 };
export function hasFeature(userPlan: string, requiredPlan: string): boolean {
  return (PLAN_RANK[userPlan] || 0) >= (PLAN_RANK[requiredPlan] || 0);
}
