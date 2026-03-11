// NextAuth v5 Configuration — see CURSOR.md Section 4.4
// Credentials + Google OAuth, JWT strategy, session includes seoApiKey, seoOrgId, seoPlan, seoDomain

import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user?.password) return null;
        const { compare } = await import("bcryptjs");
        const valid = await compare(credentials.password as string, user.password);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          seoApiKey: user.seoApiKey ?? undefined,
          seoOrgId: user.seoOrgId ?? undefined,
          seoPlan: user.seoPlan ?? "FREE",
          seoDomain: user.seoDomain ?? undefined,
        };
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
        return token;
      }
      const sub = token.sub as string | undefined;
      if (sub && !token.seoApiKey) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: sub },
            select: { seoApiKey: true, seoOrgId: true, seoPlan: true, seoDomain: true },
          });
          if (dbUser) {
            token.seoApiKey = dbUser.seoApiKey ?? undefined;
            token.seoOrgId = dbUser.seoOrgId ?? undefined;
            token.seoPlan = dbUser.seoPlan ?? "FREE";
            token.seoDomain = dbUser.seoDomain ?? undefined;
          }
        } catch {
          // DB unavailable (e.g. preview / no DATABASE_URL); keep token as-is
        }
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
