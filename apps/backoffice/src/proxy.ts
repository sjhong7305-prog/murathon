import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@muraton/db";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session-cookie";

/**
 * Proxy defaults to the Node.js runtime as of Next.js 16, so it's safe to hit the DB
 * here directly. This is only a gate, not the sole guard — Server Functions (Server
 * Actions) bypass the matcher when called from an unmatched route, so the (protected)
 * layout and every action also call requireAdmin().
 *
 * This app is meant to run behind a firewall/VPN, never exposed to the public internet.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/backoffice", req.url));
  }
  // Hero images are referenced by the same relative URL on both apps, so previews need them unauthenticated
  // just like the storefront does.
  if (pathname === "/backoffice/login" || pathname.startsWith("/api/uploads/")) {
    return NextResponse.next();
  }

  const sessionId = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = sessionId
    ? await prisma.session.findUnique({ where: { id: sessionId }, include: { user: true } })
    : null;

  const isValidAdmin =
    session !== null && session.expiresAt > new Date() && session.user.isAdmin;

  if (!isValidAdmin) {
    return NextResponse.redirect(new URL("/backoffice/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png).*)"],
};
