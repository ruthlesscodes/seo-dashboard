"use server";

import { auth } from "@/lib/auth";
import { monitorApi } from "@/lib/api-client";

export async function watchUrl(body: {
  url: string;
  label?: string;
  frequency?: string;
}) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return monitorApi.watch(session.user.seoApiKey, body);
}

export async function checkMonitor(body?: { urls?: string[] }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return monitorApi.check(session.user.seoApiKey, body);
}

export async function getMonitorChanges(params?: Record<string, string>) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return monitorApi.changes(session.user.seoApiKey, params);
}

export async function getMonitorDiff(url: string) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return monitorApi.diff(session.user.seoApiKey, { url });
}

export async function getMonitorPricing(url: string) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return monitorApi.pricing(session.user.seoApiKey, { url });
}

export async function getMonitorDecay(domain: string) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return monitorApi.decay(session.user.seoApiKey, { domain });
}
