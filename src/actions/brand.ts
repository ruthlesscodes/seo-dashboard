"use server";

import { auth } from "@/lib/auth";
import { brandApi } from "@/lib/api-client";

export async function getBrandMentions(body: { brand: string; limit?: number }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return brandApi.mentions(session.user.seoApiKey, body);
}

export async function getBrandImages(body: { brand: string; limit?: number }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return brandApi.images(session.user.seoApiKey, body);
}
