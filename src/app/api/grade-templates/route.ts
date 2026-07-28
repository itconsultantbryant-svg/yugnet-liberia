import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePermission, requireSession } from "@/lib/api-auth";
import { hasAnyPermission } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { templateInclude } from "@/lib/grades";

export async function GET(req: Request) {
  const { session, error } = await requireSession();
  if (error) return error;
  if (!hasAnyPermission(session, ["courses.view", "grades.approve", "grades.submit"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  const templates = await prisma.gradeTemplate.findMany({
    where: courseId ? { courseId } : undefined,
    include: templateInclude,
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ templates });
}

const componentSchema = z.object({
  name: z.string().min(1),
  weight: z.number().min(0).max(100),
  maxScore: z.number().positive().default(100),
  sortOrder: z.number().int().optional(),
});

const upsertSchema = z.object({
  courseId: z.string().min(1),
  name: z.string().min(1).optional(),
  components: z.array(componentSchema).min(1),
});

/** Create or replace a course grade template (Admin). */
export async function POST(req: Request) {
  const { session, error } = await requirePermission("grades.approve");
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid template payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const weightSum = parsed.data.components.reduce((s, c) => s + c.weight, 0);
  if (Math.abs(weightSum - 100) > 0.01) {
    return NextResponse.json(
      { error: `Component weights must total 100 (currently ${weightSum})` },
      { status: 400 },
    );
  }

  const course = await prisma.course.findUnique({ where: { id: parsed.data.courseId } });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const existing = await prisma.gradeTemplate.findUnique({
    where: { courseId: parsed.data.courseId },
  });

  const template = await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.gradeComponent.deleteMany({ where: { templateId: existing.id } });
      return tx.gradeTemplate.update({
        where: { id: existing.id },
        data: {
          name: parsed.data.name?.trim() || existing.name,
          components: {
            create: parsed.data.components.map((c, i) => ({
              name: c.name.trim(),
              weight: c.weight,
              maxScore: c.maxScore,
              sortOrder: c.sortOrder ?? i,
            })),
          },
        },
        include: templateInclude,
      });
    }

    return tx.gradeTemplate.create({
      data: {
        courseId: parsed.data.courseId,
        name: parsed.data.name?.trim() || `${course.title} grading`,
        components: {
          create: parsed.data.components.map((c, i) => ({
            name: c.name.trim(),
            weight: c.weight,
            maxScore: c.maxScore,
            sortOrder: c.sortOrder ?? i,
          })),
        },
      },
      include: templateInclude,
    });
  });

  await writeAuditLog({
    userId: session!.id,
    action: existing ? "update" : "create",
    entity: "GradeTemplate",
    entityId: template.id,
    after: { courseId: template.courseId, components: template.components.length },
  });

  return NextResponse.json({ template }, { status: existing ? 200 : 201 });
}
