"use server";

import { auth } from "@/lib/auth";
import { competitorsApi } from "@/lib/api-client";

export async function crawlCompetitor(body: { domain: string; maxPages?: number }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return competitorsApi.crawl(session.user.seoApiKey, body);
}

export async function scrapeCompetitor(body: { url: string }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return competitorsApi.scrape(session.user.seoApiKey, body);
}

export async function scrapeInteractiveCompetitor(body: { url: string }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return competitorsApi.scrapeInteractive(session.user.seoApiKey, body);
}

export async function compareCompetitor(body: {
  keyword: string;
  domain: string;
  competitorDomain: string;
}) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return competitorsApi.compare(session.user.seoApiKey, body);
}

export async function getCompetitorBrand(body: { url: string }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return competitorsApi.brand(session.user.seoApiKey, body);
}
