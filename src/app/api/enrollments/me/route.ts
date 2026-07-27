import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/api-auth";

export async function GET() {
  const { session, error } = await requirePermission("portal.student");
  if (error) return error;

  const student = await prisma.student.findUnique({
    where: { userId: session!.id },
    select: { id: true },
  });
  if (!student) {
    return NextResponse.json({ enrollments: [] });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: student.id, status: "ACTIVE" },
    orderBy: { enrolledDate: "desc" },
    include: {
      course: {
        include: { category: true, instructors: { include: { instructor: true } } },
      },
    },
  });

  return NextResponse.json({
    enrollments: enrollments.map((e) => ({
      id: e.id,
      enrolledDate: e.enrolledDate,
      status: e.status,
      course: {
        id: e.course.id,
        slug: e.course.slug,
        title: e.course.title,
        level: e.course.level,
        schedule: e.course.schedule,
        duration: e.course.duration,
        price: e.course.price,
        flyerImage: e.course.flyerImage,
        category: e.course.category,
        instructors: e.course.instructors.map((ci) => ({
          instructorId: ci.instructorId,
          name: ci.instructor.name,
          specialties: ci.instructor.specialties,
        })),
      },
    })),
  });
}

