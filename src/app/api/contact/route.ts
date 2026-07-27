import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit";
import { notifyAdmins } from "@/lib/cms-server";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function GET() {
  const { error } = await requirePermission("content.manage");
  if (error) return error;

  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ submissions });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid contact form" }, { status: 400 });
  }

  const submission = await prisma.contactSubmission.create({
    data: {
      name: parsed.data.name.trim(),
      email: parsed.data.email.toLowerCase().trim(),
      message: parsed.data.message.trim(),
    },
  });

  await notifyAdmins(
    `New contact message from ${submission.name}`,
    "/admin/website/contact",
  );
  await writeAuditLog({
    action: "create",
    entity: "ContactSubmission",
    entityId: submission.id,
    after: { name: submission.name, email: submission.email },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
