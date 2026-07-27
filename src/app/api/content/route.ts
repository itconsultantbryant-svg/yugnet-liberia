import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { getSession } from "@/lib/auth";
import { CMS_SECTIONS, parseContent } from "@/lib/cms";
import { notifyAdmins, revalidatePublicPaths } from "@/lib/cms-server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page");

  const session = await getSession();
  const isAdmin = session?.permissions.includes("content.manage");

  if (page) {
    const defs = CMS_SECTIONS.filter((s) => s.page === page);
    const rows = await prisma.contentBlock.findMany({ where: { page } });
    const byKey = Object.fromEntries(rows.map((r) => [r.sectionKey, r]));
    return NextResponse.json({
      sections: defs.map((def) => ({
        ...def,
        id: byKey[def.sectionKey]?.id ?? null,
        content: parseContent(byKey[def.sectionKey]?.contentJson, def.defaults),
        updatedAt: byKey[def.sectionKey]?.updatedAt ?? null,
      })),
    });
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.contentBlock.findMany({ orderBy: [{ page: "asc" }, { sectionKey: "asc" }] });
  const byKey = Object.fromEntries(rows.map((r) => [`${r.page}:${r.sectionKey}`, r]));

  return NextResponse.json({
    sections: CMS_SECTIONS.map((def) => ({
      ...def,
      id: byKey[`${def.page}:${def.sectionKey}`]?.id ?? null,
      content: parseContent(byKey[`${def.page}:${def.sectionKey}`]?.contentJson, def.defaults),
      updatedAt: byKey[`${def.page}:${def.sectionKey}`]?.updatedAt ?? null,
    })),
  });
}

const putSchema = z.object({
  page: z.string().min(1),
  sectionKey: z.string().min(1),
  content: z.record(z.string(), z.string()),
});

export async function PUT(req: Request) {
  const { session, error } = await requirePermission("content.manage");
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid content payload" }, { status: 400 });
  }

  const def = CMS_SECTIONS.find(
    (s) => s.page === parsed.data.page && s.sectionKey === parsed.data.sectionKey,
  );
  if (!def) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }

  const before = await prisma.contentBlock.findUnique({
    where: {
      page_sectionKey: { page: parsed.data.page, sectionKey: parsed.data.sectionKey },
    },
  });

  const block = await prisma.contentBlock.upsert({
    where: {
      page_sectionKey: { page: parsed.data.page, sectionKey: parsed.data.sectionKey },
    },
    create: {
      page: parsed.data.page,
      sectionKey: parsed.data.sectionKey,
      label: def.label,
      contentJson: JSON.stringify({ ...def.defaults, ...parsed.data.content }),
    },
    update: {
      label: def.label,
      contentJson: JSON.stringify({ ...def.defaults, ...parsed.data.content }),
    },
  });

  await writeAuditLog({
    userId: session!.id,
    action: before ? "update" : "create",
    entity: "ContentBlock",
    entityId: block.id,
    before,
    after: block,
  });

  revalidatePublicPaths(parsed.data.page);
  await notifyAdmins(`Content updated: ${def.label}`, "/admin/website/pages");

  return NextResponse.json({ block, content: JSON.parse(block.contentJson) });
}
