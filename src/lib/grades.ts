import type { Prisma } from "@prisma/client";

export const GRADE_STATUSES = ["DRAFT", "SUBMITTED", "APPROVED", "RETURNED"] as const;
export type GradeStatus = (typeof GRADE_STATUSES)[number];

export const gradeInclude = {
  student: {
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  },
  course: { select: { id: true, title: true, slug: true } },
  component: {
    select: { id: true, name: true, weight: true, maxScore: true, sortOrder: true },
  },
  submittedBy: { select: { id: true, name: true } },
  approvedBy: { select: { id: true, name: true } },
} satisfies Prisma.GradeInclude;

export const templateInclude = {
  course: { select: { id: true, title: true, slug: true, status: true } },
  components: { orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.GradeTemplateInclude;

/** Weighted course total from a set of component grades (same course). */
export function computeWeightedTotal(
  grades: { score: number; maxScore: number; component: { weight: number } }[],
) {
  if (!grades.length) return null;
  let weighted = 0;
  let weightSum = 0;
  for (const g of grades) {
    const pct = g.maxScore > 0 ? (g.score / g.maxScore) * 100 : 0;
    weighted += pct * (g.component.weight / 100);
    weightSum += g.component.weight;
  }
  return {
    percent: Math.round(weighted * 10) / 10,
    weightCovered: weightSum,
  };
}
