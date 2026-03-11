"use server";

import { auth } from "@/lib/auth";
import { auditApi } from "@/lib/api-client";

export async function runTechnicalAudit(body: {
  url?: string;
  domain?: string;
  maxPages?: number;
}) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return auditApi.technical(session.user.seoApiKey, body);
}

export async function runLighthouseAudit(body: {
  url: string;
  strategy?: "mobile" | "desktop";
}) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return auditApi.lighthouse(session.user.seoApiKey, body);
}

export async function runAgentAudit(body: { domain: string }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return auditApi.agent(session.user.seoApiKey, body);
}

export async function getAuditHistory(params?: { limit?: string; domain?: string }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return auditApi.history(session.user.seoApiKey, params);
}

export async function getAuditRunDetails(runId: string) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return auditApi.runDetails(session.user.seoApiKey, runId);
}
