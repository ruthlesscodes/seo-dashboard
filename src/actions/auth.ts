"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { authApi } from "@/lib/api-client";
import { prisma } from "@/lib/prisma";

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const domain = formData.get("domain") as string;

  if (!name?.trim() || !email?.trim() || !password?.trim() || !domain?.trim()) {
    return { error: "All fields are required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  try {
    const res = await authApi.register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      domain: domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""),
    });

    const data = res as { seoApiKey?: string; seoOrgId?: string; orgId?: string; apiKey?: string };
    const seoApiKey = data.seoApiKey ?? data.apiKey;
    const seoOrgId = data.seoOrgId ?? data.orgId;

    if (!seoApiKey) {
      return { error: "API registration failed. Please try again." };
    }

    const hashedPassword = await hash(password, 12);

    await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        seoApiKey,
        seoOrgId: seoOrgId ?? null,
        seoPlan: (data as { plan?: string }).plan ?? "FREE",
        seoDomain: domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""),
      },
    });

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: result.error };
    }

    redirect("/auth/onboarding");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Registration failed";
    return { error: msg };
  }
}

export async function getUsage() {
  const session = await auth();
  if (!session?.user?.seoApiKey) return null;
  return authApi.usage(session.user.seoApiKey);
}
