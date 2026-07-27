import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Liveness + DB check for Render health probes and network monitoring. */
export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      service: "yugnet-liberia",
      role: process.env.RENDER ? "backend" : process.env.VERCEL ? "frontend" : "local",
      db: "up",
      latencyMs: Date.now() - started,
      time: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        service: "yugnet-liberia",
        db: "down",
        error: err instanceof Error ? err.message : "db_error",
        latencyMs: Date.now() - started,
        time: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
