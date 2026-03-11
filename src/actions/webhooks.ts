"use server";

import { auth } from "@/lib/auth";
import { webhooksApi } from "@/lib/api-client";

export async function configureWebhook(body: { url: string; events?: string[] }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return webhooksApi.configure(session.user.seoApiKey, body);
}
