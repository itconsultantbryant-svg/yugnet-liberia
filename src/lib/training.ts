import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function getTrainingStats() {
  try {
    const [courseCount, lecturerCount] = await Promise.all([
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.instructor.count({ where: { published: true } }),
    ]);
    return { courseCount, lecturerCount };
  } catch {
    return { courseCount: 0, lecturerCount: 0 };
  }
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function revalidateTrainingPaths() {
  revalidatePath("/training");
  revalidatePath("/training/courses");
  revalidatePath("/training/lecturers");
  // detail pages use dynamic segments — revalidate parent tree
  revalidatePath("/training/courses", "layout");
  revalidatePath("/training/lecturers", "layout");
}

export const courseInclude = {
  category: true,
  instructors: {
    include: {
      instructor: true,
    },
  },
} as const;

export const instructorInclude = {
  courses: {
    include: {
      course: {
        include: { category: true },
      },
    },
  },
  user: { select: { id: true, name: true, email: true } },
} as const;
