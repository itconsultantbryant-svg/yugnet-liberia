import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/api-auth";
import { getSession, hasPermission } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { instructorInclude, revalidateTrainingPaths } from "@/lib/training";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  const canManage = session && hasPermission(session, "instructors.manage");

  const instructor = await prisma.instructor.findFirst({
    where: {
      id,
      ...(canManage ? {} : { published: true }),
    },
    include: instructorInclude,
  });

  if (!instructor) {
    return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
  }

  return NextResponse.json({ instructor });
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().nullable().optional(),
  bio: z.string().optional(),
  photo: z.string().nullable().optional(),
  credentials: z.string().nullable().optional(),
  specialties: z.string().nullable().optional(),
  published: z.boolean().optional(),
  userId: z.string().nullable().optional(),
  courseIds: z.array(z.string()).optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const { session, error } = await requirePermission("instructors.manage");
  if (error) return error;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update", details: parsed.error.flatten() }, { status: 400 });
  }

  const before = await prisma.instructor.findUnique({
    where: { id },
    include: { courses: true },
  });
  if (!before) {
    return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
  }

  if (parsed.data.courseIds) {
    await prisma.courseInstructor.deleteMany({ where: { instructorId: id } });
    if (parsed.data.courseIds.length) {
      await prisma.courseInstructor.createMany({
        data: parsed.data.courseIds.map((courseId) => ({
          courseId,
          instructorId: id,
        })),
      });
    }
  }

  const instructor = await prisma.instructor.update({
    where: { id },
    data: {
      name: parsed.data.name?.trim(),
      email: parsed.data.email,
      bio: parsed.data.bio,
      photo: parsed.data.photo,
      credentials: parsed.data.credentials,
      specialties: parsed.data.specialties,
      published: parsed.data.published,
      userId: parsed.data.userId,
    },
    include: instructorInclude,
  });

  await writeAuditLog({
    userId: session!.id,
    action: "update",
    entity: "Instructor",
    entityId: id,
    before,
    after: instructor,
  });
  revalidateTrainingPaths();

  return NextResponse.json({ instructor });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { session, error } = await requirePermission("instructors.manage");
  if (error) return error;
  const { id } = await params;

  const before = await prisma.instructor.findUnique({ where: { id } });
  if (!before) {
    return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
  }

  await prisma.instructor.delete({ where: { id } });
  await writeAuditLog({
    userId: session!.id,
    action: "delete",
    entity: "Instructor",
    entityId: id,
    before,
  });
  revalidateTrainingPaths();

  return NextResponse.json({ ok: true });
}
