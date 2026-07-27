import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const { error } = await requirePermission("users.manage");
  if (error) return error;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      role: true,
      permissionOverrides: { include: { permission: true } },
    },
  });

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      status: u.status,
      role: u.role,
      overrides: u.permissionOverrides.map((o) => ({
        permissionKey: o.permission.key,
        granted: o.granted,
      })),
      createdAt: u.createdAt,
    })),
  });
}

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  roleId: z.string().min(1),
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

export async function POST(req: Request) {
  const { session, error } = await requirePermission("users.manage");
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid user data", details: parsed.error.flatten() }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const role = await prisma.role.findUnique({ where: { id: parsed.data.roleId } });
  if (!role) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name.trim(),
      email,
      phone: parsed.data.phone?.trim() || null,
      passwordHash,
      roleId: role.id,
      status: parsed.data.status ?? "ACTIVE",
      permissionOverrides: parsed.data.permissionOverrides?.length
        ? {
            create: parsed.data.permissionOverrides.map((o) => ({
              permissionId: o.permissionId,
              granted: o.granted,
            })),
          }
        : undefined,
    },
    include: { role: true, permissionOverrides: true },
  });

  await writeAuditLog({
    userId: session!.id,
    action: "create",
    entity: "User",
    entityId: user.id,
    after: {
      email: user.email,
      roleId: user.roleId,
      overrides: user.permissionOverrides,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
