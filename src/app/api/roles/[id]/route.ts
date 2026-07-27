import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  permissionIds: z.array(z.string()).optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const { session, error } = await requirePermission("roles.manage");
  if (error) return error;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update", details: parsed.error.flatten() }, { status: 400 });
  }

  const before = await prisma.role.findUnique({
    where: { id },
    include: { permissions: true },
  });
  if (!before) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  if (parsed.data.permissionIds) {
    await prisma.rolePermission.deleteMany({ where: { roleId: id } });
    if (parsed.data.permissionIds.length) {
      await prisma.rolePermission.createMany({
        data: parsed.data.permissionIds.map((permissionId) => ({
          roleId: id,
          permissionId,
        })),
      });
    }
  }

  const role = await prisma.role.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description:
        parsed.data.description === undefined ? undefined : parsed.data.description,
    },
    include: { permissions: { include: { permission: true } } },
  });

  await writeAuditLog({
    userId: session!.id,
    action: "update",
    entity: "Role",
    entityId: id,
    before,
    after: role,
  });

  return NextResponse.json({ role });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { session, error } = await requirePermission("roles.manage");
  if (error) return error;
  const { id } = await params;

  const before = await prisma.role.findUnique({
    where: { id },
    include: { _count: { select: { users: true } } },
  });
  if (!before) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }
  if (before.isSystem) {
    return NextResponse.json({ error: "System roles cannot be deleted" }, { status: 400 });
  }
  if (before._count.users > 0) {
    return NextResponse.json({ error: "Reassign users before deleting this role" }, { status: 400 });
  }

  await prisma.role.delete({ where: { id } });
  await writeAuditLog({
    userId: session!.id,
    action: "delete",
    entity: "Role",
    entityId: id,
    before,
  });

  return NextResponse.json({ ok: true });
}
