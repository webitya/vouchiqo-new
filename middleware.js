/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Vouchiqo Next.js Edge-Compatible Route Guard Middleware
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Runs on Next.js Edge Runtime.
 * Intercepts unauthenticated navigation to protected dashboard namespaces
 * and immediately redirects to login without rendering server-side component shells.
 */

import { NextResponse } from "next/server";
import { isProtectedRoute, ROUTES } from "./utils/routes";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ── Step 1: Check session token cookie presence ──────────────────────────
  const hasSessionCookie =
    request.cookies.has("better-auth.session_token") ||
    request.cookies.has("__Secure-better-auth.session_token");

  // ── Step 2: Unauthenticated user accessing protected route ─────────────
  if (!hasSessionCookie) {
    if (isProtectedRoute(pathname)) {
      const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── Step 3: Authenticated user — allow request to proceed ──────────────
  return NextResponse.next();
}

export default middleware;

export const config = {
  matcher: [
    // Protected dashboard namespaces
    "/admin/:path*",
    "/merchant/:path*",
    "/customer/:path*",
    "/profile",
    "/profile/:path*",
  ],
};
