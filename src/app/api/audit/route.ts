import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { error } = await requirePermission("audit.view");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const take = Math.min(Number(searchParams.get("take") ?? 50), 200);

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({
    logs: logs.map((l) => ({
      ...l,
      before: l.before ? JSON.parse(l.before) : null,
      after: l.after ? JSON.parse(l.after) : null,
    })),
  });
}
