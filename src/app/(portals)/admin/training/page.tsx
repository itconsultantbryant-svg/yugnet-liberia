import Link from "next/link";
import { TrainingSubNav } from "@/components/admin/TrainingSubNav";
import { prisma } from "@/lib/db";

export default async function TrainingOverviewPage() {
  const [courses, published, instructors, categories, students, activeEnrollments] =
    await Promise.all([
      prisma.course.count(),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.instructor.count(),
      prisma.courseCategory.count(),
      prisma.student.count(),
      prisma.enrollment.count({ where: { status: "ACTIVE" } }),
    ]);

  const cards = [
    {
      href: "/admin/training/courses",
      label: "Courses",
      value: courses,
      hint: `${published} published`,
    },
    {
      href: "/admin/training/instructors",
      label: "Instructors",
      value: instructors,
      hint: "Directory profiles",
    },
    {
      href: "/admin/training/categories",
      label: "Categories",
      value: categories,
      hint: "Catalog filters",
    },
    {
      href: "/admin/training/students",
      label: "Students",
      value: students,
      hint: `${activeEnrollments} active enrollments`,
    },
  ] as const;

  return (
    <div>
      <TrainingSubNav />
      <h1 className="font-display text-3xl font-bold text-ink">Training Management</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Manage the course catalog, lecturers, and student enrollments. Publishing updates the
        public Training pages immediately.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="border-t-2 border-brand bg-white p-5 transition hover:bg-brand-mist/40"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-muted">{card.label}</p>
            <p className="mt-1 font-display text-3xl font-bold text-ink">{card.value}</p>
            <p className="mt-1 text-xs text-brand">{card.hint}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/training/students"
          className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
        >
          Manage students
        </Link>
        <Link
          href="/admin/training/courses"
          className="rounded-md border border-brand/25 bg-white px-4 py-2.5 text-sm font-semibold text-brand hover:bg-brand-mist"
        >
          Add / edit courses
        </Link>
        <Link
          href="/training/courses"
          className="rounded-md border border-brand/25 bg-white px-4 py-2.5 text-sm font-semibold text-brand hover:bg-brand-mist"
        >
          View public catalog
        </Link>
      </div>
    </div>
  );
}
