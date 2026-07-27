import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildSessionUser,
  createSessionToken,
  hashPassword,
  setSessionCookie,
} from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid signup data", details: parsed.error.flatten() }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const studentRole = await prisma.role.findUnique({ where: { name: "Student" } });
  if (!studentRole) {
    return NextResponse.json({ error: "Student role not seeded" }, { status: 500 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name.trim(),
      email,
      phone: parsed.data.phone?.trim() || null,
      passwordHash,
      roleId: studentRole.id,
    },
  });

  const sessionUser = await buildSessionUser(user.id);
  if (!sessionUser) {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }

  const token = await createSessionToken(sessionUser);
  await setSessionCookie(token);
  await writeAuditLog({
    userId: user.id,
    action: "signup",
    entity: "User",
    entityId: user.id,
    after: { email: user.email, role: "Student" },
  });

  return NextResponse.json({ user: sessionUser }, { status: 201 });
}
