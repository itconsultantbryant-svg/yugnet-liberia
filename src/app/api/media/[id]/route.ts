import { unlink } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const { session, error } = await requirePermission("content.manage");
  if (error) return error;
  const { id } = await params;

  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await unlink(path.join(process.cwd(), "public", asset.url.replace(/^\//, "")));
  } catch {
    // file may already be missing
  }

  await prisma.mediaAsset.delete({ where: { id } });
  await writeAuditLog({
    userId: session!.id,
    action: "delete",
    entity: "MediaAsset",
    entityId: id,
    before: asset,
  });

  return NextResponse.json({ ok: true });
}
