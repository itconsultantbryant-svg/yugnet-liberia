import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession, hasAnyPermission } from "@/lib/auth";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasAnyPermission(session, ["roles.manage", "users.manage"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const roles = await prisma.role.findMany({
    orderBy: { name: "asc" },
    include: {
      permissions: { include: { permission: true } },
      _count: { select: { users: true } },
    },
  });

  return NextResponse.json({
    roles: roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      isSystem: r.isSystem,
      userCount: r._count.users,
      permissionKeys: r.permissions.map((p) => p.permission.key),
      permissionIds: r.permissions.map((p) => p.permissionId),
    })),
  });
}

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).default([]),
});

export async function POST(req: Request) {
  const { session, error } = await requirePermission("roles.manage");
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid role data", details: parsed.error.flatten() }, { status: 400 });
  }

  const exists = await prisma.role.findUnique({
    where: { name: parsed.data.name.trim() },
  });
  if (exists) {
    return NextResponse.json({ error: "Role name already exists" }, { status: 409 });
  }

  const role = await prisma.role.create({
    data: {
      name: parsed.data.name.trim(),
      description: parsed.data.description?.trim() || null,
      permissions: {
        create: parsed.data.permissionIds.map((permissionId) => ({ permissionId })),
      },
    },
    include: { permissions: true },
  });

  await writeAuditLog({
    userId: session!.id,
    action: "create",
    entity: "Role",
    entityId: role.id,
    after: role,
  });

  return NextResponse.json({ role }, { status: 201 });
}
