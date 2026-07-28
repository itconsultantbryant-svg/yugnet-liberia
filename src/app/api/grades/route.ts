import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePermission, requireSession } from "@/lib/api-auth";
import { hasAnyPermission, hasPermission } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { notifyAdmins } from "@/lib/cms-server";
import { GRADE_STATUSES, gradeInclude } from "@/lib/grades";

export async function GET(req: Request) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const studentId = searchParams.get("studentId");
  const status = searchParams.get("status");
  const pending = searchParams.get("pending") === "1";

  const isStudentOnly =
    hasPermission(session, "grades.view_own") &&
    !hasAnyPermission(session, ["grades.approve", "grades.submit", "portal.admin"]);

  if (isStudentOnly) {
    const student = await prisma.student.findUnique({ where: { userId: session!.id } });
    if (!student) return NextResponse.json({ grades: [] });
    const grades = await prisma.grade.findMany({
      where: { studentId: student.id, status: "APPROVED" },
      include: gradeInclude,
      orderBy: [{ courseId: "asc" }, { updatedAt: "desc" }],
    });
    return NextResponse.json({ grades });
  }

  if (!hasAnyPermission(session, ["grades.approve", "grades.submit", "portal.admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const grades = await prisma.grade.findMany({
    where: {
      ...(courseId ? { courseId } : {}),
      ...(studentId ? { studentId } : {}),
      ...(pending ? { status: "SUBMITTED" } : status ? { status } : {}),
    },
    include: gradeInclude,
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json({ grades });
}

const createSchema = z.object({
  studentId: z.string().min(1),
  courseId: z.string().min(1),
  componentId: z.string().min(1),
  score: z.number().min(0),
  comment: z.string().optional(),
  status: z.enum(GRADE_STATUSES).optional(),
});

export async function POST(req: Request) {
  const { session, error } = await requireSession();
  if (error) return error;
  if (!hasAnyPermission(session, ["grades.approve", "grades.submit"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid grade payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const component = await prisma.gradeComponent.findUnique({
    where: { id: parsed.data.componentId },
    include: { template: true },
  });
  if (!component || component.template.courseId !== parsed.data.courseId) {
    return NextResponse.json({ error: "Component does not belong to course" }, { status: 400 });
  }

  if (parsed.data.score > component.maxScore) {
    return NextResponse.json(
      { error: `Score cannot exceed max ${component.maxScore}` },
      { status: 400 },
    );
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: parsed.data.studentId,
        courseId: parsed.data.courseId,
      },
    },
  });
  if (!enrollment || enrollment.status === "WITHDRAWN") {
    return NextResponse.json({ error: "Student is not enrolled in this course" }, { status: 400 });
  }

  const canApprove = hasPermission(session, "grades.approve");
  let status = parsed.data.status ?? (canApprove ? "APPROVED" : "SUBMITTED");
  // Instructors submitting without approve → SUBMITTED
  if (!canApprove && status === "APPROVED") status = "SUBMITTED";

  const grade = await prisma.grade.upsert({
    where: {
      studentId_componentId: {
        studentId: parsed.data.studentId,
        componentId: parsed.data.componentId,
      },
    },
    update: {
      score: parsed.data.score,
      maxScore: component.maxScore,
      comment: parsed.data.comment?.trim() || null,
      status,
      submittedById: session!.id,
      submittedAt: new Date(),
      ...(status === "APPROVED"
        ? { approvedById: session!.id, approvedAt: new Date(), returnNote: null }
        : {}),
      ...(status === "SUBMITTED" ? { approvedById: null, approvedAt: null } : {}),
    },
    create: {
      studentId: parsed.data.studentId,
      courseId: parsed.data.courseId,
      componentId: parsed.data.componentId,
      score: parsed.data.score,
      maxScore: component.maxScore,
      comment: parsed.data.comment?.trim() || null,
      status,
      submittedById: session!.id,
      submittedAt: new Date(),
      ...(status === "APPROVED"
        ? { approvedById: session!.id, approvedAt: new Date() }
        : {}),
    },
    include: gradeInclude,
  });

  await writeAuditLog({
    userId: session!.id,
    action: "upsert",
    entity: "Grade",
    entityId: grade.id,
    after: { status: grade.status, score: grade.score, componentId: grade.componentId },
  });

  if (status === "SUBMITTED") {
    await notifyAdmins(
      `Grade submitted for approval: ${grade.student.user.name} · ${grade.course.title} · ${grade.component.name}`,
      "/admin/training/grades?pending=1",
    );
  }

  return NextResponse.json({ grade }, { status: 201 });
}
