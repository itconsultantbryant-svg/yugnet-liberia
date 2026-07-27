import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession, hasAnyPermission } from "@/lib/auth";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { notifyAdmins } from "@/lib/cms-server";
import { prisma } from "@/lib/db";
import { courseInclude, revalidateTrainingPaths, slugify } from "@/lib/training";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const publishedOnly = searchParams.get("published") === "1";
  const category = searchParams.get("category");
  const level = searchParams.get("level");
  const q = searchParams.get("q")?.trim();

  const session = await getSession();
  const canManage = session && hasAnyPermission(session, [
    "courses.view",
    "courses.create",
    "courses.edit",
    "courses.delete",
  ]);

  const where: Record<string, unknown> = {};
  if (publishedOnly || !canManage) {
    where.status = "PUBLISHED";
  } else if (searchParams.get("status")) {
    where.status = searchParams.get("status");
  }
  if (category) where.categoryId = category;
  if (level) where.level = level;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const courses = await prisma.course.findMany({
    where,
    include: courseInclude,
    orderBy: [{ updatedAt: "desc" }],
  });

  return NextResponse.json({ courses });
}

const createSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  description: z.string().min(10),
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

export async function POST(req: Request) {
  const { session, error } = await requirePermission("courses.create");
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid course data", details: parsed.error.flatten() }, { status: 400 });
  }

  let slug = slugify(parsed.data.slug || parsed.data.title);
  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const course = await prisma.course.create({
    data: {
      title: parsed.data.title.trim(),
      slug,
      categoryId: parsed.data.categoryId ?? null,
      description: parsed.data.description.trim(),
      syllabus: parsed.data.syllabus?.trim() || "",
      flyerImage: parsed.data.flyerImage ?? null,
      price: parsed.data.price ?? 0,
      duration: parsed.data.duration ?? null,
      schedule: parsed.data.schedule ?? null,
      level: parsed.data.level || "Foundational",
      capacity: parsed.data.capacity ?? null,
      prerequisites: parsed.data.prerequisites ?? null,
      status: parsed.data.status ?? "DRAFT",
      instructors: parsed.data.instructorIds?.length
        ? {
            create: parsed.data.instructorIds.map((instructorId) => ({ instructorId })),
          }
        : undefined,
    },
    include: courseInclude,
  });

  await writeAuditLog({
    userId: session!.id,
    action: "create",
    entity: "Course",
    entityId: course.id,
    after: course,
  });

  revalidateTrainingPaths();
  if (course.status === "PUBLISHED") {
    await notifyAdmins(`Course published: ${course.title}`, "/admin/training/courses");
  }

  return NextResponse.json({ course }, { status: 201 });
}
