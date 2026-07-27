import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/db";

export async function GET() {
  const { error } = await requirePermission("content.manage");
  if (error) return error;

  const media = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: { select: { name: true, email: true } } },
  });
  return NextResponse.json({ media });
}

export async function POST(req: Request) {
  const { session, error } = await requirePermission("content.manage");
  if (error) return error;

  const form = await req.formData();
  const file = form.get("file");
  const alt = String(form.get("alt") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Max file size is 5MB" }, { status: 400 });
  }
  if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only images and PDFs are allowed" }, { status: 400 });
  }

  const ext = path.extname(file.name) || (file.type === "application/pdf" ? ".pdf" : ".bin");
  const safeBase = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const filename = `${Date.now()}-${safeBase}${ext.startsWith(".") ? "" : ext}`;
  // Render mounts a persistent disk here in production (see render.yaml).
  const uploadDir =
    process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  const publicBase = (process.env.UPLOAD_PUBLIC_PATH || "/uploads").replace(/\/$/, "");
  const url = `${publicBase}/${filename}`;
  const asset = await prisma.mediaAsset.create({
    data: {
      filename,
      originalName: file.name,
      url,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      alt: alt || null,
      uploadedById: session!.id,
    },
  });

  await writeAuditLog({
    userId: session!.id,
    action: "create",
    entity: "MediaAsset",
    entityId: asset.id,
    after: asset,
  });

  return NextResponse.json({ media: asset }, { status: 201 });
}
