import { createReadStream, existsSync, statSync } from "fs";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function uploadRoot() {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
}

function contentTypeFor(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".svg": "image/svg+xml",
  };
  return map[ext] || "application/octet-stream";
}

/** Serves media from UPLOAD_DIR (Render persistent disk) or public/uploads. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const parts = (await ctx.params).path ?? [];
  if (!parts.length || parts.some((p) => p.includes("..") || p.includes("/") || p.includes("\\"))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(uploadRoot(), ...parts);
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const nodeStream = createReadStream(filePath);
  const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream;

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": contentTypeFor(filePath),
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
