"use server";

import { auth } from "@/lib/auth";
import { keywordsApi } from "@/lib/api-client";

export async function searchKeywords(body: {
  keywords: string[];
  domain: string;
  country?: string;
}) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return keywordsApi.search(session.user.seoApiKey, body);
}

export async function clusterKeywords(body: { keywords: string[] }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return keywordsApi.cluster(session.user.seoApiKey, body);
}

export async function suggestKeywords(body: { topic: string; count?: number }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return keywordsApi.suggest(session.user.seoApiKey, body);
}
