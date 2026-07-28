import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { studentInclude } from "@/lib/students";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { error } = await requirePermission("students.view");
  if (error) return error;

  const { id } = await ctx.params;
  const student = await prisma.student.findUnique({
    where: { id },
    include: studentInclude,
  });
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }
  return NextResponse.json({ student });
}

const patchSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
  address: z.string().nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  idDocumentUrl: z.string().nullable().optional(),
  profileImageUrl: z.string().nullable().optional(),
});

export async function PATCH(req: Request, ctx: Ctx) {
  const { session, error } = await requirePermission("students.edit");
  if (error) return error;

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid update payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const before = await prisma.student.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!before) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const data = parsed.data;
  await prisma.user.update({
    where: { id: before.userId },
    data: {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.phone !== undefined ? { phone: data.phone?.trim() || null } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    },
  });

  const student = await prisma.student.update({
    where: { id },
    data: {
      ...(data.address !== undefined ? { address: data.address?.trim() || null } : {}),
      ...(data.dateOfBirth !== undefined
        ? { dateOfBirth: data.dateOfBirth?.trim() || null }
        : {}),
      ...(data.idDocumentUrl !== undefined
        ? { idDocumentUrl: data.idDocumentUrl?.trim() || null }
        : {}),
      ...(data.profileImageUrl !== undefined
        ? { profileImageUrl: data.profileImageUrl?.trim() || null }
        : {}),
    },
    include: studentInclude,
  });

  await writeAuditLog({
    userId: session!.id,
    action: "update",
    entity: "Student",
    entityId: id,
    before: {
      name: before.user.name,
      phone: before.user.phone,
      status: before.user.status,
      address: before.address,
    },
    after: {
      name: student.user.name,
      phone: student.user.phone,
      status: student.user.status,
      address: student.address,
    },
  });

  return NextResponse.json({ student });
}
