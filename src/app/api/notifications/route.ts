import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  const notifications = await prisma.notification.findMany({
    where: { userId: session!.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const unread = notifications.filter((n) => !n.read).length;
  return NextResponse.json({ notifications, unread });
}

export async function PATCH(req: Request) {
  const { session, error } = await requireSession();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  if (body.all) {
    await prisma.notification.updateMany({
      where: { userId: session!.id, read: false },
      data: { read: true },
    });
  } else if (typeof body.id === "string") {
    await prisma.notification.updateMany({
      where: { id: body.id, userId: session!.id },
      data: { read: true },
    });
  }

  return NextResponse.json({ ok: true });
}
