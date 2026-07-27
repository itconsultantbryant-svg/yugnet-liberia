import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { applyCorsHeaders, corsPreflight } from "@/lib/cors";
import { SESSION_COOKIE } from "@/lib/permissions";

const PORTALS = ["/admin", "/instructor", "/student"];

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

/**
 * When API_BACKEND_URL is set (Vercel frontend), proxy /api and /uploads
 * to the Render backend so browsers stay on one HTTPS origin.
 * Same-origin traffic is more reliable on Lonestar and Orange mobile networks
 * than cross-site cookies + CORS.
 */
function rewriteToBackend(req: NextRequest): NextResponse | null {
  const backend = process.env.API_BACKEND_URL?.replace(/\/$/, "");
  if (!backend) return null;

  const { pathname } = req.nextUrl;
  const shouldProxy =
    pathname.startsWith("/api/") || pathname.startsWith("/uploads/");
  if (!shouldProxy) return null;

  const target = new URL(`${pathname}${req.nextUrl.search}`, backend);
  return NextResponse.rewrite(target);
}

export async function proxy(req: NextRequest) {
  const rewritten = rewriteToBackend(req);
  if (rewritten) return rewritten;

  const { pathname } = req.nextUrl;

  // Direct API access on Render (CORS for allowlisted frontends)
  if (pathname.startsWith("/api/")) {
    if (req.method === "OPTIONS") {
      return corsPreflight(req);
    }
    const res = NextResponse.next();
    return applyCorsHeaders(req, res);
  }

  const isPortal = PORTALS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!isPortal) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const loginUrl = new URL("/training/login", req.url);
  loginUrl.searchParams.set("next", pathname);

  if (!token) return NextResponse.redirect(loginUrl);

  const key = secretKey();
  if (!key) return NextResponse.redirect(loginUrl);

  try {
    await jwtVerify(token, key);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/instructor/:path*",
    "/student/:path*",
    "/api/:path*",
    "/uploads/:path*",
  ],
};
