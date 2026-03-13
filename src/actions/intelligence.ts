"use server";

import { auth } from "@/lib/auth";
import { intelligenceApi } from "@/lib/api-client";

export async function analyzeIntelligence(body: {
  domain: string;
  keywords: string[];
}) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return intelligenceApi.analyze(session.user.seoApiKey, body);
}

export async function getGapAnalysis(body: {
  domain: string;
  competitorDomain: string;
  keywords: string[];
}) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return intelligenceApi.gaps(session.user.seoApiKey, body);
}

export async function runIntelligenceAgent(body: { prompt: string }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return intelligenceApi.agent(session.user.seoApiKey, body);
}

export async function runIntelligenceResearch(body: { topic: string }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return intelligenceApi.research(session.user.seoApiKey, body);
}

export async function runIntelligenceBatch(body: {
  prompts: { topic: string; depth?: "shallow" | "deep" }[];
  model?: string;
}) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return intelligenceApi.batch(session.user.seoApiKey, body);
}
