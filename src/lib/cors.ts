import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Origins allowed to call the Render API directly (browser CORS).
 * Prefer same-origin Vercel→Render proxy so Lonestar/Orange clients
 * never make cross-origin credentialed requests.
 */
export function allowedOrigins(): string[] {
  const raw =
    process.env.CORS_ORIGINS ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  return raw
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

export function resolveCorsOrigin(req: NextRequest | Request): string | null {
  const origin = req.headers.get("origin");
  if (!origin) return null;
  const allowed = allowedOrigins();
  if (allowed.includes("*")) return origin;
  if (allowed.includes(origin)) return origin;
  return null;
}

export function applyCorsHeaders(
  req: NextRequest | Request,
  res: NextResponse,
): NextResponse {
  const origin = resolveCorsOrigin(req);
  if (origin) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Vary", "Origin");
  }
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );
  res.headers.set("Access-Control-Max-Age", "86400");
  return res;
}

export function corsPreflight(req: NextRequest): NextResponse {
  const res = new NextResponse(null, { status: 204 });
  return applyCorsHeaders(req, res);
}
