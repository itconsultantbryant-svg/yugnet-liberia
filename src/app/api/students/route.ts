import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { hashPassword } from "@/lib/auth";
import { notifyAdmins } from "@/lib/cms-server";
import { studentInclude } from "@/lib/students";

export async function GET(req: Request) {
  const { error } = await requirePermission("students.view");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const courseId = searchParams.get("courseId");

  const students = await prisma.student.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { user: { name: { contains: q, mode: "insensitive" } } },
              { user: { email: { contains: q, mode: "insensitive" } } },
              { address: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(courseId
        ? { enrollments: { some: { courseId, status: { not: "WITHDRAWN" } } } }
        : {}),
    },
    include: studentInclude,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ students });
}

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8).optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  courseIds: z.array(z.string().min(1)).optional(),
});

/** Admin creates a student account (+ optional course enrollments). */
export async function POST(req: Request) {
  const { session, error } = await requirePermission("students.edit");
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid student payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const studentRole = await prisma.role.findUnique({ where: { name: "Student" } });
  if (!studentRole) {
    return NextResponse.json({ error: "Student role not seeded" }, { status: 500 });
  }

  const generatedPassword = `Welcome${Math.random().toString(36).slice(2, 8)}!`;
  const password = parsed.data.password?.trim() || generatedPassword;
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name.trim(),
      email,
      phone: parsed.data.phone?.trim() || null,
      passwordHash,
      roleId: studentRole.id,
      status: "ACTIVE",
      studentProfile: {
        create: {
          address: parsed.data.address?.trim() || null,
          dateOfBirth: parsed.data.dateOfBirth?.trim() || null,
        },
      },
    },
    include: { studentProfile: true },
  });

  const student = user.studentProfile!;
  let enrolledCount = 0;

  if (parsed.data.courseIds?.length) {
    const courses = await prisma.course.findMany({
      where: { id: { in: parsed.data.courseIds } },
      select: { id: true, title: true, slug: true },
    });
    for (const course of courses) {
      const enrollment = await prisma.enrollment.upsert({
        where: {
          studentId_courseId: { studentId: student.id, courseId: course.id },
        },
        update: { status: "ACTIVE", source: "ADMIN" },
        create: {
          studentId: student.id,
          courseId: course.id,
          source: "ADMIN",
          status: "ACTIVE",
        },
      });
      enrolledCount += 1;
      await writeAuditLog({
        userId: session!.id,
        action: "enroll",
        entity: "Enrollment",
        entityId: enrollment.id,
        after: { course: course.slug, source: "ADMIN", studentId: student.id },
      });
    }
  }

  await writeAuditLog({
    userId: session!.id,
    action: "create",
    entity: "Student",
    entityId: student.id,
    after: { email, name: user.name },
  });

  await notifyAdmins(`Student created: ${user.name}`, "/admin/training/students");

  const full = await prisma.student.findUnique({
    where: { id: student.id },
    include: studentInclude,
  });

  return NextResponse.json(
    {
      student: full,
      temporaryPassword: parsed.data.password ? undefined : password,
      enrolled: enrolledCount,
    },
    { status: 201 },
  );
}
