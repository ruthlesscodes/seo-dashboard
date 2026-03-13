"use server";

import { auth, signIn } from "@/lib/auth";
import { CredentialsSignin } from "next-auth";
import { authApi } from "@/lib/api-client";

export async function loginAction(email: string, password: string) {
  if (!email?.trim() || !password) {
    return { error: "Email and password are required" };
  }
  const emailClean = email.trim().toLowerCase();
  try {
    const result = await signIn("credentials", {
      email: emailClean,
      password,
      redirect: false,
    });
    if (result?.error) {
      return { error: result.error === "CredentialsSignin" ? "Invalid credentials" : result.error };
    }
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof CredentialsSignin && err.message) {
      return { error: err.message };
    }
    const msg = err instanceof Error ? err.message : "Something went wrong";
    return { error: msg };
  }
}

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

  const domainClean = domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const emailClean = email.trim().toLowerCase();

  try {
    await authApi.register({
      name: name.trim(),
      email: emailClean,
      password,
      domain: domainClean,
    });

    const result = await signIn("credentials", {
      email: emailClean,
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
