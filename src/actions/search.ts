"use server";

import { auth } from "@/lib/auth";
import { searchApi } from "@/lib/api-client";

export async function searchNews(body: { query: string; limit?: number }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return searchApi.news(session.user.seoApiKey, body);
}

export async function searchGithub(body: { query: string }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return searchApi.github(session.user.seoApiKey, body);
}

export async function searchResearch(body: { query: string; depth?: string }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return searchApi.research(session.user.seoApiKey, body);
}
