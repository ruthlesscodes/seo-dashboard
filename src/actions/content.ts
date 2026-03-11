"use server";

import { auth } from "@/lib/auth";
import { contentApi } from "@/lib/api-client";

export async function generateContent(body: { keyword: string; segment?: string }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return contentApi.generate(session.user.seoApiKey, body);
}

export async function getContentBrief(body: { keyword: string }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return contentApi.brief(session.user.seoApiKey, body);
}

export async function refreshContent(body: { url: string; keyword: string }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return contentApi.refresh(session.user.seoApiKey, body);
}

export async function getTrendingContent(body: { topic: string; timeRange?: string }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return contentApi.trending(session.user.seoApiKey, body);
}
