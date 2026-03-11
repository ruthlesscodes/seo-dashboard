"use server";

import { auth } from "@/lib/auth";
import { pipelineApi } from "@/lib/api-client";

export async function runPipeline(body: { domain: string; keywords: string[] }) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return pipelineApi.run(session.user.seoApiKey, body);
}

export async function getPipelineStatus(jobId: string) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");
  return pipelineApi.status(session.user.seoApiKey, jobId);
}
