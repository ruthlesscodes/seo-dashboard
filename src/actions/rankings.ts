"use server";

import { auth } from "@/lib/auth";
import { rankingsApi } from "@/lib/api-client";

export async function checkRankings(body: {
  keywords: string[];
  domain: string;
  region?: string;
}) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return rankingsApi.check(session.user.seoApiKey, body);
}

export async function getGlobalRankings(body: {
  keyword: string;
  domain: string;
  regions: string[];
}) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return rankingsApi.global(session.user.seoApiKey, body);
}

export async function getSerpFeatures(body: { keywords: string[] }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return rankingsApi.serpFeatures(session.user.seoApiKey, body);
}

export async function getSerpSnapshot(body: { keyword: string; domain?: string; region?: string }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return rankingsApi.serpSnapshot(session.user.seoApiKey, body);
}
