import { prisma } from "@/lib/db";

export async function writeAuditLog(input: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      userId: input.userId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      before: input.before == null ? null : JSON.stringify(input.before),
      after: input.after == null ? null : JSON.stringify(input.after),
    },
  });
}
