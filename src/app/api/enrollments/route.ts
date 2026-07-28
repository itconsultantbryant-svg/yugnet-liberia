import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePermission, requireSession } from "@/lib/api-auth";
import { hasAnyPermission } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { notifyAdmins } from "@/lib/cms-server";

const enrollmentInclude = {
  student: {
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  },
  course: {
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      level: true,
      schedule: true,
    },
  },
};

/** Admin / instructor roster. Students use /api/enrollments/me. */
export async function GET(req: Request) {
  const { error } = await requirePermission("students.view");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const studentId = searchParams.get("studentId");
  const status = searchParams.get("status");

  const enrollments = await prisma.enrollment.findMany({
    where: {
      ...(courseId ? { courseId } : {}),
      ...(studentId ? { studentId } : {}),
      ...(status ? { status } : {}),
    },
    include: enrollmentInclude,
    orderBy: { enrolledDate: "desc" },
  });

  return NextResponse.json({ enrollments });
}

const selfEnrollSchema = z.object({
  courseSlugs: z.array(z.string().min(1)).min(1),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

const adminEnrollSchema = z.object({
  studentId: z.string().min(1),
  courseIds: z.array(z.string().min(1)).min(1),
  status: z.enum(["ACTIVE", "COMPLETED", "WITHDRAWN"]).optional(),
});

function isEnrollmentStaff(session: NonNullable<Awaited<ReturnType<typeof requireSession>>["session"]>) {
  return hasAnyPermission(session, ["students.view", "students.edit", "portal.admin"]);
}

/**
 * POST supports:
 * - Self-enroll: { courseSlugs }
 * - Admin enroll: { studentId, courseIds } (staff only)
 */
export async function POST(req: Request) {
  const { session, error } = await requirePermission("students.enroll");
  if (error) return error;

  const body = await req.json().catch(() => null);

  const adminParsed = adminEnrollSchema.safeParse(body);
  if (adminParsed.success) {
    if (!isEnrollmentStaff(session)) {
      return NextResponse.json(
        { error: "Use courseSlugs for self-enrollment" },
        { status: 400 },
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: adminParsed.data.studentId },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const courses = await prisma.course.findMany({
      where: { id: { in: adminParsed.data.courseIds } },
      select: { id: true, slug: true, title: true },
    });
    if (!courses.length) {
      return NextResponse.json({ error: "No matching courses" }, { status: 400 });
    }

    const status = adminParsed.data.status ?? "ACTIVE";
    const created = [];
    for (const course of courses) {
      const enrollment = await prisma.enrollment.upsert({
        where: {
          studentId_courseId: {
            studentId: student.id,
            courseId: course.id,
          },
        },
        update: { status, source: "ADMIN" },
        create: {
          studentId: student.id,
          courseId: course.id,
          source: "ADMIN",
          status,
        },
        include: enrollmentInclude,
      });
      created.push(enrollment);
      await writeAuditLog({
        userId: session!.id,
        action: "enroll",
        entity: "Enrollment",
        entityId: enrollment.id,
        after: {
          course: course.slug,
          source: "ADMIN",
          studentId: student.id,
          status,
        },
      });
    }

    await notifyAdmins(
      `Admin enrolled ${student.user.name} in ${courses.map((c) => c.title).join(", ")}`,
      "/admin/training/students",
    );

    return NextResponse.json({ ok: true, enrollments: created });
  }

  const parsed = selfEnrollSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid enrollment payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const profileData = {
    address: parsed.data.address?.trim() || null,
    dateOfBirth: parsed.data.dateOfBirth?.trim() || null,
  };

  const student = await prisma.student.upsert({
    where: { userId: session!.id },
    update: {
      ...(profileData.address ? { address: profileData.address } : {}),
      ...(profileData.dateOfBirth ? { dateOfBirth: profileData.dateOfBirth } : {}),
    },
    create: {
      userId: session!.id,
      address: profileData.address,
      dateOfBirth: profileData.dateOfBirth,
    },
  });

  const courses = await prisma.course.findMany({
    where: { slug: { in: parsed.data.courseSlugs }, status: "PUBLISHED" },
    select: { id: true, slug: true, title: true },
  });

  const foundSlugs = new Set(courses.map((c) => c.slug));
  const missing = parsed.data.courseSlugs.filter((s) => !foundSlugs.has(s));
  if (missing.length) {
    return NextResponse.json(
      { error: "Some courses are not available", missing },
      { status: 400 },
    );
  }

  const created = [];
  for (const course of courses) {
    const enrollment = await prisma.enrollment.upsert({
      where: {
        studentId_courseId: { studentId: student.id, courseId: course.id },
      },
      update: {},
      create: {
        studentId: student.id,
        courseId: course.id,
        source: "SELF",
        status: "ACTIVE",
      },
      select: { id: true, courseId: true },
    });

    created.push(enrollment);

    await writeAuditLog({
      userId: session!.id,
      action: "enroll",
      entity: "Enrollment",
      entityId: enrollment.id,
      after: { course: course.slug, source: "SELF" },
    });
  }

  await notifyAdmins(
    `${session!.name} enrolled in ${courses.map((c) => c.title).join(", ")}`,
    "/admin/training/students",
  );

  return NextResponse.json({ ok: true, created });
}
