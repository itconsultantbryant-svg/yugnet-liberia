import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { revalidatePublicPaths } from "@/lib/cms-server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.string().nullable().optional(),
  quote: z.string().min(8).optional(),
  photoUrl: z.string().nullable().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const { session, error } = await requirePermission("content.manage");
  if (error) return error;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }

  const before = await prisma.testimonial.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const testimonial = await prisma.testimonial.update({
    where: { id },
    data: parsed.data,
  });

  await writeAuditLog({
    userId: session!.id,
    action: "update",
    entity: "Testimonial",
    entityId: id,
    before,
    after: testimonial,
  });
  revalidatePublicPaths("home");

  return NextResponse.json({ testimonial });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { session, error } = await requirePermission("content.manage");
  if (error) return error;
  const { id } = await params;

  const before = await prisma.testimonial.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.testimonial.delete({ where: { id } });
  await writeAuditLog({
    userId: session!.id,
    action: "delete",
    entity: "Testimonial",
    entityId: id,
    before,
  });
  revalidatePublicPaths("home");

  return NextResponse.json({ ok: true });
}
