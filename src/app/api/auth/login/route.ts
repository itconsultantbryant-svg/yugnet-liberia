import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildSessionUser,
  createSessionToken,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials payload" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const sessionUser = await buildSessionUser(user.id);
  if (!sessionUser) {
    return NextResponse.json({ error: "Account inactive" }, { status: 403 });
  }

  const token = await createSessionToken(sessionUser);
  await setSessionCookie(token);
  await writeAuditLog({
    userId: user.id,
    action: "login",
    entity: "User",
    entityId: user.id,
  });

  return NextResponse.json({ user: sessionUser });
}
