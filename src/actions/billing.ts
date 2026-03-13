"use server";

import { auth } from "@/lib/auth";
import { billingApi } from "@/lib/api-client";

export async function getPlans() {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return billingApi.plans(session.user.seoApiKey);
}

export async function upgradePlan(body: { plan: string }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return billingApi.upgrade(session.user.seoApiKey, body);
}

export async function getBillingPortalUrl() {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return billingApi.portal(session.user.seoApiKey);
}
