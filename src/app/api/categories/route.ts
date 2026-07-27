import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { revalidateTrainingPaths, slugify } from "@/lib/training";

export async function GET() {
  const categories = await prisma.courseCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { courses: true } } },
  });
  return NextResponse.json({
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      courseCount: c._count.courses,
    })),
  });
}

const createSchema = z.object({
  name: z.string().min(2),
});

export async function POST(req: Request) {
  const { session, error } = await requirePermission("courses.create");
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const name = parsed.data.name.trim();
  const slug = slugify(name);
  const exists = await prisma.courseCategory.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
  if (exists) {
    return NextResponse.json({ error: "Category already exists" }, { status: 409 });
  }

  const category = await prisma.courseCategory.create({
    data: { name, slug },
  });

  await writeAuditLog({
    userId: session!.id,
    action: "create",
    entity: "CourseCategory",
    entityId: category.id,
    after: category,
  });
  revalidateTrainingPaths();

  return NextResponse.json({ category }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { session, error } = await requirePermission("courses.delete");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const before = await prisma.courseCategory.findUnique({
    where: { id },
    include: { _count: { select: { courses: true } } },
  });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (before._count.courses > 0) {
    return NextResponse.json(
      { error: "Reassign courses before deleting category" },
      { status: 400 },
    );
  }

  await prisma.courseCategory.delete({ where: { id } });
  await writeAuditLog({
    userId: session!.id,
    action: "delete",
    entity: "CourseCategory",
    entityId: id,
    before,
  });
  revalidateTrainingPaths();
  return NextResponse.json({ ok: true });
}
