"use server";

import { auth } from "@/lib/auth";
import { geoApi } from "@/lib/api-client";

export async function getBrandMonitor(body: { brand: string; competitors?: string[] }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return geoApi.brandMonitor(session.user.seoApiKey, body);
}

export async function getReadability(body: { url?: string; domain?: string }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return geoApi.readability(session.user.seoApiKey, body);
}

export async function getLlmstxt(body: { domain: string }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return geoApi.llmstxt(session.user.seoApiKey, body);
}

export async function getGeoOptimize(body: { domain: string; brand: string; keywords: string[] }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return geoApi.optimize(session.user.seoApiKey, body);
}
