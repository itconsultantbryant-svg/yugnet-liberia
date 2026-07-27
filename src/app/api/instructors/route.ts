import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/api-auth";
import { getSession, hasPermission } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { notifyAdmins } from "@/lib/cms-server";
import { prisma } from "@/lib/db";
import { instructorInclude, revalidateTrainingPaths } from "@/lib/training";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const publishedOnly = searchParams.get("published") === "1";
  const session = await getSession();
  const canManage = session && hasPermission(session, "instructors.manage");

  const instructors = await prisma.instructor.findMany({
    where: publishedOnly || !canManage ? { published: true } : undefined,
    include: instructorInclude,
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ instructors });
}

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().nullable(),
  bio: z.string().optional(),
  photo: z.string().nullable().optional(),
  credentials: z.string().nullable().optional(),
  specialties: z.string().nullable().optional(),
  published: z.boolean().optional(),
  userId: z.string().nullable().optional(),
  courseIds: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  const { session, error } = await requirePermission("instructors.manage");
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid instructor data", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.userId) {
    const linked = await prisma.instructor.findUnique({ where: { userId: parsed.data.userId } });
    if (linked) {
      return NextResponse.json({ error: "User already linked to an instructor" }, { status: 409 });
    }
  }

  const instructor = await prisma.instructor.create({
    data: {
      name: parsed.data.name.trim(),
      email: parsed.data.email?.trim() || null,
      bio: parsed.data.bio?.trim() || "",
      photo: parsed.data.photo ?? null,
      credentials: parsed.data.credentials ?? null,
      specialties: parsed.data.specialties ?? null,
      published: parsed.data.published ?? true,
      userId: parsed.data.userId ?? null,
      courses: parsed.data.courseIds?.length
        ? {
            create: parsed.data.courseIds.map((courseId) => ({ courseId })),
          }
        : undefined,
    },
    include: instructorInclude,
  });

  await writeAuditLog({
    userId: session!.id,
    action: "create",
    entity: "Instructor",
    entityId: instructor.id,
    after: instructor,
  });
  revalidateTrainingPaths();
  if (instructor.published) {
    await notifyAdmins(`Instructor added: ${instructor.name}`, "/training/lecturers");
  }

  return NextResponse.json({ instructor }, { status: 201 });
}
