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
  mobile?: boolean;
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

export async function runBatchAudit(body: { urls: string[] }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return auditApi.batch(session.user.seoApiKey, body);
}

export async function runInternalLinksAudit(body: { domain: string }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return auditApi.internalLinks(session.user.seoApiKey, body);
}

export async function takeScreenshot(body: { url: string }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return auditApi.screenshot(session.user.seoApiKey, body);
}
