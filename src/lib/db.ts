import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function makePrisma() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrisma() {
  const existing = globalForPrisma.prisma;
  // After `prisma generate`, a running dev server may still hold a stale singleton
  // missing newer models (e.g. course, instructor).
  if (
    existing &&
    "course" in existing &&
    "instructor" in existing &&
    "student" in existing &&
    "enrollment" in existing
  ) {
    return existing;
  }
  const client = makePrisma();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getPrisma();
