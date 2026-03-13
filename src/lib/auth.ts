// NextAuth v5 Configuration — login via SEO Agent API (API owns the database)
// Credentials provider calls API /api/auth/login; JWT strategy; session includes seoApiKey, seoOrgId, seoPlan, seoDomain

import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { CredentialsSignin } from "next-auth";
import { authApi } from "@/lib/api-client";

export const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new CredentialsSignin("Email and password are required");
        }
        const email = (credentials.email as string).trim().toLowerCase();
        try {
          const res = await authApi.login({ email, password: credentials.password as string });
          const raw = res as Record<string, unknown>;
          const data = (raw.data as Record<string, unknown>) ?? raw;
          const apiKey = (data.apiKey ?? data.api_key ?? data.seoApiKey ?? raw.apiKey ?? raw.api_key ?? raw.seoApiKey) as string | undefined;
          const orgId = (data.orgId ?? data.org_id ?? data.seoOrgId ?? raw.orgId ?? raw.org_id ?? raw.seoOrgId) as string | undefined;
          const user = (data.user ?? raw.user) as { id?: string; email?: string; name?: string } | undefined;
          if (!apiKey) throw new CredentialsSignin("Invalid credentials");
          return {
            id: (user?.id ?? data.email ?? raw.email ?? email) as string,
            email: (user?.email ?? data.email ?? raw.email ?? email) as string,
            name: (user?.name ?? data.name ?? raw.name ?? undefined) as string | undefined,
            image: undefined,
            seoApiKey: apiKey,
            seoOrgId: orgId,
            seoPlan: (data.plan ?? raw.plan ?? "FREE") as string,
            seoDomain: (data.domain ?? raw.domain ?? undefined) as string | undefined,
          };
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Invalid credentials";
          throw new CredentialsSignin(msg);
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.seoApiKey = (user as { seoApiKey?: string }).seoApiKey;
        token.seoOrgId = (user as { seoOrgId?: string }).seoOrgId;
        token.seoPlan = (user as { seoPlan?: string }).seoPlan ?? "FREE";
        token.seoDomain = (user as { seoDomain?: string }).seoDomain;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { seoApiKey?: string }).seoApiKey = token.seoApiKey as string | undefined;
        (session.user as { seoOrgId?: string }).seoOrgId = token.seoOrgId as string | undefined;
        (session.user as { seoPlan?: string }).seoPlan = (token.seoPlan as string) ?? "FREE";
        (session.user as { seoDomain?: string }).seoDomain = token.seoDomain as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: { strategy: "jwt" },
};

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth(authConfig);

/** Use auth() for server-side session. For compatibility, authOptions = authConfig. */
export const authOptions = authConfig;
