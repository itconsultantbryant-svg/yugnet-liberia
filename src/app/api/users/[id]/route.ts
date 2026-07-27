import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { session, error } = await requirePermission("users.manage");
  if (error) return error;
  const { id } = await params;

  const schema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().nullable().optional(),
    roleId: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
    permissionOverrides: z
      .array(
        z.object({
          permissionId: z.string(),
          granted: z.boolean(),
        }),
      )
      .optional(),
  });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update", details: parsed.error.flatten() }, { status: 400 });
  }

  const before = await prisma.user.findUnique({
    where: { id },
    include: { permissionOverrides: true },
  });
  if (!before) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (parsed.data.permissionOverrides) {
    await prisma.userPermissionOverride.deleteMany({ where: { userId: id } });
    if (parsed.data.permissionOverrides.length) {
      await prisma.userPermissionOverride.createMany({
        data: parsed.data.permissionOverrides.map((o) => ({
          userId: id,
          permissionId: o.permissionId,
          granted: o.granted,
        })),
      });
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone === undefined ? undefined : parsed.data.phone,
      roleId: parsed.data.roleId,
      status: parsed.data.status,
    },
    include: {
      role: true,
      permissionOverrides: { include: { permission: true } },
    },
  });

  await writeAuditLog({
    userId: session!.id,
    action: "update",
    entity: "User",
    entityId: id,
    before,
    after: user,
  });

  return NextResponse.json({ user });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { session, error } = await requirePermission("users.manage");
  if (error) return error;
  const { id } = await params;

  if (session!.id === id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  const before = await prisma.user.findUnique({ where: { id } });
  if (!before) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.user.delete({ where: { id } });
  await writeAuditLog({
    userId: session!.id,
    action: "delete",
    entity: "User",
    entityId: id,
    before,
  });

  return NextResponse.json({ ok: true });
}
