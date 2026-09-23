import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session-cookie";
import { prisma } from "@/lib/prisma";

/**
 * Proxy defaults to the Node.js runtime as of Next.js 16, so it's safe to hit the DB
 * here directly. This is still only a gate, not the sole guard — Server Functions
 * (Server Actions) bypass the matcher below when called from an unmatched route, so
 * every /api/admin/* handler and the (protected) layout also call requireAdmin().
 *
 * APP_ROLE splits this one codebase into two deployable processes: a "public"
 * instance (the storefront) that must never serve /backoffice even if whatever sits
 * in front of it is misconfigured, and a "backoffice" instance — meant to run behind
 * a firewall/VPN, never exposed to the public internet — that serves nothing else.
 * Leave APP_ROLE unset for a single all-in-one process (the local dev default).
 *
 * /api/uploads is exempt from that split: admin-uploaded images need to render both
 * in the backoffice's own preview thumbnails and on the public site, so it's treated
 * as a shared asset route reachable from either instance regardless of APP_ROLE.
 */
const APP_ROLE = process.env.APP_ROLE;

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isBackofficeRoute = pathname.startsWith("/backoffice") || pathname.startsWith("/api/admin");
  const isSharedAsset = pathname.startsWith("/api/uploads");

  if (APP_ROLE === "public" && isBackofficeRoute) {
    return new NextResponse(null, { status: 404 });
  }
  if (APP_ROLE === "backoffice" && !isBackofficeRoute && !isSharedAsset) {
    return new NextResponse(null, { status: 404 });
  }
  if (!isBackofficeRoute) {
    return NextResponse.next();
  }

  if (pathname === "/backoffice/login") {
    return NextResponse.next();
  }

  const sessionId = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = sessionId
    ? await prisma.session.findUnique({ where: { id: sessionId }, include: { user: true } })
    : null;

  const isValidAdmin =
    session !== null && session.expiresAt > new Date() && session.user.isAdmin;

  if (!isValidAdmin) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/backoffice/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
