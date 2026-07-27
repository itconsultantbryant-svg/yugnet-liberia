import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/api-auth";
import { getSession, hasAnyPermission } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { notifyAdmins } from "@/lib/cms-server";
import { prisma } from "@/lib/db";
import { courseInclude, revalidateTrainingPaths, slugify } from "@/lib/training";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  const canManage = session && hasAnyPermission(session, ["courses.view", "courses.edit"]);

  const course = await prisma.course.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      ...(canManage ? {} : { status: "PUBLISHED" }),
    },
    include: courseInclude,
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  return NextResponse.json({ course });
}

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  slug: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  description: z.string().min(10).optional(),
  syllabus: z.string().optional(),
  flyerImage: z.string().nullable().optional(),
  price: z.number().min(0).optional(),
  duration: z.string().nullable().optional(),
  schedule: z.string().nullable().optional(),
  level: z.string().optional(),
  capacity: z.number().int().positive().nullable().optional(),
  prerequisites: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  instructorIds: z.array(z.string()).optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const { session, error } = await requirePermission("courses.edit");
  if (error) return error;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update", details: parsed.error.flatten() }, { status: 400 });
  }

  const before = await prisma.course.findUnique({
    where: { id },
    include: { instructors: true },
  });
  if (!before) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (parsed.data.instructorIds) {
    await prisma.courseInstructor.deleteMany({ where: { courseId: id } });
    if (parsed.data.instructorIds.length) {
      await prisma.courseInstructor.createMany({
        data: parsed.data.instructorIds.map((instructorId) => ({
          courseId: id,
          instructorId,
        })),
      });
    }
  }

  let slug = parsed.data.slug ? slugify(parsed.data.slug) : undefined;
  if (slug && slug !== before.slug) {
    const clash = await prisma.course.findUnique({ where: { slug } });
    if (clash) slug = `${slug}-${Date.now().toString(36)}`;
  }

  const course = await prisma.course.update({
    where: { id },
    data: {
      title: parsed.data.title?.trim(),
      slug,
      categoryId: parsed.data.categoryId,
      description: parsed.data.description?.trim(),
      syllabus: parsed.data.syllabus,
      flyerImage: parsed.data.flyerImage,
      price: parsed.data.price,
      duration: parsed.data.duration,
      schedule: parsed.data.schedule,
      level: parsed.data.level,
      capacity: parsed.data.capacity,
      prerequisites: parsed.data.prerequisites,
      status: parsed.data.status,
    },
    include: courseInclude,
  });

  await writeAuditLog({
    userId: session!.id,
    action: "update",
    entity: "Course",
    entityId: id,
    before,
    after: course,
  });

  revalidateTrainingPaths();
  if (before.status !== "PUBLISHED" && course.status === "PUBLISHED") {
    await notifyAdmins(`Course published: ${course.title}`, `/training/courses/${course.slug}`);
  }

  return NextResponse.json({ course });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { session, error } = await requirePermission("courses.delete");
  if (error) return error;
  const { id } = await params;

  const before = await prisma.course.findUnique({ where: { id } });
  if (!before) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  await prisma.course.delete({ where: { id } });
  await writeAuditLog({
    userId: session!.id,
    action: "delete",
    entity: "Course",
    entityId: id,
    before,
  });
  revalidateTrainingPaths();

  return NextResponse.json({ ok: true });
}
