import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { getSession } from "@/lib/auth";
import { revalidatePublicPaths } from "@/lib/cms-server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const publishedOnly = searchParams.get("published") === "1";
  const session = await getSession();
  const canManage = session?.permissions.includes("content.manage");

  if (publishedOnly || !canManage) {
    const testimonials = await prisma.testimonial.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ testimonials });
  }

  const { error } = await requirePermission("content.manage");
  if (error) return error;

  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ testimonials });
}

const createSchema = z.object({
  name: z.string().min(2),
  role: z.string().optional(),
  quote: z.string().min(8),
  photoUrl: z.string().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function POST(req: Request) {
  const { session, error } = await requirePermission("content.manage");
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid testimonial" }, { status: 400 });
  }

  const testimonial = await prisma.testimonial.create({
    data: {
      name: parsed.data.name.trim(),
      role: parsed.data.role?.trim() || null,
      quote: parsed.data.quote.trim(),
      photoUrl: parsed.data.photoUrl || null,
      published: parsed.data.published ?? true,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  });

  await writeAuditLog({
    userId: session!.id,
    action: "create",
    entity: "Testimonial",
    entityId: testimonial.id,
    after: testimonial,
  });
  revalidatePublicPaths("home");

  return NextResponse.json({ testimonial }, { status: 201 });
}
