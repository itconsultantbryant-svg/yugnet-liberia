import type { Prisma } from "@prisma/client";

export const studentInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      role: { select: { name: true } },
    },
  },
  enrollments: {
    orderBy: { enrolledDate: "desc" as const },
    include: {
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          level: true,
        },
      },
    },
  },
} satisfies Prisma.StudentInclude;

export type StudentWithDetails = Prisma.StudentGetPayload<{
  include: typeof studentInclude;
}>;
