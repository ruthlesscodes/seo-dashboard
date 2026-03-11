"use server";

import { auth } from "@/lib/auth";
import { auditApi } from "@/lib/api-client";
import { prioritiseIssues } from "@/lib/fix-guides";

export async function getTopPriorities(domain: string, limit = 3) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");

  const res = await auditApi.technical(session.user.seoApiKey, {
    domain: domain.replace(/^https?:\/\//, "").replace(/\/$/, ""),
    maxPages: 10,
  }) as any;

  const data = res?.data ?? res;
  const rawIssues = data?.issues ?? data?.pages?.flatMap((p: any) => p.issues ?? []) ?? [];
  const score: number = data?.score ?? 0;
  const priorities = prioritiseIssues(rawIssues, limit);

  return { score, priorities, totalIssues: rawIssues.length };
}

export async function recheckIssue(domain: string, issueType: string) {
  const session = await auth();
  if (!session?.user?.seoApiKey) throw new Error("Not authenticated");

  const res = await auditApi.technical(session.user.seoApiKey, {
    domain: domain.replace(/^https?:\/\//, "").replace(/\/$/, ""),
    maxPages: 5,
  }) as any;

  const data = res?.data ?? res;
  const rawIssues = data?.issues ?? data?.pages?.flatMap((p: any) => p.issues ?? []) ?? [];
  const normalised = issueType.toLowerCase().replace(/_/g, "-");
  const stillExists = rawIssues.some(
    (i: any) => i.type?.toLowerCase().replace(/_/g, "-") === normalised
  );

  return {
    fixed: !stillExists,
    newScore: data?.score ?? 0,
    message: stillExists
      ? "Issue still detected. Double-check the fix and try again."
      : "Issue resolved! Your SEO score has been updated.",
  };
}
