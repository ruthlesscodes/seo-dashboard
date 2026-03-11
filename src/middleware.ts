import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight auth check for Edge - no Prisma/bcrypt. Dashboard layout does full auth.
const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = SESSION_COOKIES.some((name) => !!req.cookies.get(name)?.value);

  if (pathname === "/" || pathname === "") return NextResponse.next();

  const authPaths = ["/auth/login", "/auth/register"];
  const isAuthPath = authPaths.some((p) => pathname.startsWith(p));

  if (isAuthPath && hasSession && !pathname.startsWith("/auth/onboarding")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const protectedPaths = ["/dashboard", "/auth/onboarding"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
