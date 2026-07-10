// Route protection (Task 1). Runs on the Edge runtime, so it uses the
// jose-based verifyToken from lib/auth/jwt.js rather than jsonwebtoken.
//
// /admin is listed here for when Task 4's admin panel lands; it isn't
// built yet, but gating it from day one avoids a forgotten security gap
// later.

import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/auth/jwt";

const PROTECTED_PREFIXES = ["/account"];
const ADMIN_PREFIXES = ["/admin"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
  const isProtectedRoute = PROTECTED_PREFIXES.some((p) =>
    pathname.startsWith(p)
  );

  if (!isAdminRoute && !isProtectedRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = await verifyToken(token);

  if (!payload) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};