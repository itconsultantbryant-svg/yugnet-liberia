import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  status: z.enum(["NEW", "READ", "ARCHIVED"]),
});

export async function PATCH(req: Request, { params }: Params) {
  const { session, error } = await requirePermission("content.manage");
  if (error) return error;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const before = await prisma.contactSubmission.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const submission = await prisma.contactSubmission.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  await writeAuditLog({
    userId: session!.id,
    action: "update",
    entity: "ContactSubmission",
    entityId: id,
    before,
    after: submission,
  });

  return NextResponse.json({ submission });
}
