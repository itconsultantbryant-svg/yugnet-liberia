import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { notifyAdmins } from "@/lib/cms-server";

const postSchema = z.object({
  courseSlugs: z.array(z.string().min(1)).min(1),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

export async function POST(req: Request) {
  const { session, error } = await requirePermission("students.enroll");
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
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
    "/admin/training",
  );

  return NextResponse.json({ ok: true, created });
}
