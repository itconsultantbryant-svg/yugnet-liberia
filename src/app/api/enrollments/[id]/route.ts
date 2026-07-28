import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/api-auth";
import { hasAnyPermission } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED", "WITHDRAWN"]),
});

export async function PATCH(req: Request, ctx: Ctx) {
  const { session, error } = await requirePermission("students.enroll");
  if (error) return error;
  if (!hasAnyPermission(session, ["students.view", "students.edit", "portal.admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid status update", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const before = await prisma.enrollment.findUnique({ where: { id } });
  if (!before) {
    return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
  }

  const enrollment = await prisma.enrollment.update({
    where: { id },
    data: { status: parsed.data.status },
    include: {
      course: { select: { slug: true, title: true } },
      student: { include: { user: { select: { name: true, email: true } } } },
    },
  });

  await writeAuditLog({
    userId: session!.id,
    action: "update",
    entity: "Enrollment",
    entityId: id,
    before: { status: before.status },
    after: { status: enrollment.status, course: enrollment.course.slug },
  });

  return NextResponse.json({ enrollment });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { session, error } = await requirePermission("students.edit");
  if (error) return error;

  const { id } = await ctx.params;
  const before = await prisma.enrollment.findUnique({
    where: { id },
    include: { course: { select: { slug: true } } },
  });
  if (!before) {
    return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
  }

  const enrollment = await prisma.enrollment.update({
    where: { id },
    data: { status: "WITHDRAWN" },
  });

  await writeAuditLog({
    userId: session!.id,
    action: "withdraw",
    entity: "Enrollment",
    entityId: id,
    before: { status: before.status },
    after: { status: "WITHDRAWN", course: before.course.slug },
  });

  return NextResponse.json({ enrollment });
}
