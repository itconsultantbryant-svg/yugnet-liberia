import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePermission, requireSession } from "@/lib/api-auth";
import { hasAnyPermission, hasPermission } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { notifyAdmins } from "@/lib/cms-server";
import { GRADE_STATUSES, gradeInclude } from "@/lib/grades";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  score: z.number().min(0).optional(),
  comment: z.string().nullable().optional(),
  status: z.enum(GRADE_STATUSES).optional(),
  returnNote: z.string().nullable().optional(),
});

export async function PATCH(req: Request, ctx: Ctx) {
  const { session, error } = await requireSession();
  if (error) return error;
  if (!hasAnyPermission(session, ["grades.approve", "grades.submit"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid grade update", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const before = await prisma.grade.findUnique({
    where: { id },
    include: { component: true, student: { include: { user: true } }, course: true },
  });
  if (!before) {
    return NextResponse.json({ error: "Grade not found" }, { status: 404 });
  }

  const canApprove = hasPermission(session, "grades.approve");
  const nextStatus = parsed.data.status;

  if (nextStatus === "APPROVED" && !canApprove) {
    return NextResponse.json({ error: "Only admins can approve grades" }, { status: 403 });
  }
  if (nextStatus === "RETURNED" && !canApprove) {
    return NextResponse.json({ error: "Only admins can return grades" }, { status: 403 });
  }

  if (parsed.data.score !== undefined && parsed.data.score > before.component.maxScore) {
    return NextResponse.json(
      { error: `Score cannot exceed max ${before.component.maxScore}` },
      { status: 400 },
    );
  }

  const grade = await prisma.grade.update({
    where: { id },
    data: {
      ...(parsed.data.score !== undefined ? { score: parsed.data.score } : {}),
      ...(parsed.data.comment !== undefined
        ? { comment: parsed.data.comment?.trim() || null }
        : {}),
      ...(parsed.data.returnNote !== undefined
        ? { returnNote: parsed.data.returnNote?.trim() || null }
        : {}),
      ...(nextStatus
        ? {
            status: nextStatus,
            ...(nextStatus === "APPROVED"
              ? {
                  approvedById: session!.id,
                  approvedAt: new Date(),
                  returnNote: null,
                }
              : {}),
            ...(nextStatus === "SUBMITTED"
              ? {
                  submittedById: session!.id,
                  submittedAt: new Date(),
                  approvedById: null,
                  approvedAt: null,
                }
              : {}),
            ...(nextStatus === "RETURNED"
              ? { approvedById: session!.id, approvedAt: new Date() }
              : {}),
          }
        : {}),
    },
    include: gradeInclude,
  });

  await writeAuditLog({
    userId: session!.id,
    action: "update",
    entity: "Grade",
    entityId: id,
    before: { status: before.status, score: before.score },
    after: { status: grade.status, score: grade.score },
  });

  if (grade.status === "APPROVED") {
    await prisma.notification.create({
      data: {
        userId: before.student.userId,
        type: "grade",
        message: `Grade approved: ${before.course.title} · ${before.component.name}`,
        link: "/student",
      },
    });
  }

  if (grade.status === "RETURNED") {
    await notifyAdmins(
      `Grade returned: ${before.student.user.name} · ${before.course.title}`,
      "/admin/training/grades?pending=1",
    );
  }

  return NextResponse.json({ grade });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { session, error } = await requirePermission("grades.approve");
  if (error) return error;

  const { id } = await ctx.params;
  const before = await prisma.grade.findUnique({ where: { id } });
  if (!before) {
    return NextResponse.json({ error: "Grade not found" }, { status: 404 });
  }

  await prisma.grade.delete({ where: { id } });
  await writeAuditLog({
    userId: session!.id,
    action: "delete",
    entity: "Grade",
    entityId: id,
    before: { status: before.status, score: before.score, componentId: before.componentId },
  });

  return NextResponse.json({ ok: true });
}
