import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { DEFAULT_SEO } from "@/lib/cms";
import { revalidatePublicPaths } from "@/lib/cms-server";
import { prisma } from "@/lib/db";

export async function GET() {
  const { error } = await requirePermission("content.manage");
  if (error) return error;

  const row = await prisma.siteSetting.findUnique({ where: { key: "seo" } });
  let seo = { ...DEFAULT_SEO };
  if (row) {
    try {
      seo = { ...DEFAULT_SEO, ...JSON.parse(row.valueJson) };
    } catch {
      // keep defaults
    }
  }
  return NextResponse.json({ seo });
}

const putSchema = z.object({
  siteTitle: z.string().min(2),
  siteDescription: z.string().min(8),
  keywords: z.string().optional(),
  ogImage: z.string().optional(),
});

export async function PUT(req: Request) {
  const { session, error } = await requirePermission("content.manage");
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid SEO settings" }, { status: 400 });
  }

  const before = await prisma.siteSetting.findUnique({ where: { key: "seo" } });
  const valueJson = JSON.stringify({ ...DEFAULT_SEO, ...parsed.data });

  const setting = await prisma.siteSetting.upsert({
    where: { key: "seo" },
    create: { key: "seo", valueJson },
    update: { valueJson },
  });

  await writeAuditLog({
    userId: session!.id,
    action: before ? "update" : "create",
    entity: "SiteSetting",
    entityId: setting.id,
    before,
    after: setting,
  });

  revalidatePublicPaths();
  return NextResponse.json({ seo: JSON.parse(setting.valueJson) });
}
