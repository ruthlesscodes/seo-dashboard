"use server";

import { auth } from "@/lib/auth";
import { domainApi } from "@/lib/api-client";

export async function mapDomain(body: { url: string }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return domainApi.map(session.user.seoApiKey, body);
}

export async function getSitemap(body: { url: string }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return domainApi.sitemap(session.user.seoApiKey, body);
}

export async function getDomainStructure(body: { url: string }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return domainApi.structure(session.user.seoApiKey, body);
}
