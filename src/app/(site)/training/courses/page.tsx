import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { prisma } from "@/lib/db";
import { courseInclude } from "@/lib/training";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Courses",
  description: "Browse YUGNet-Liberia professional development courses.",
};

type SearchParams = Promise<{ category?: string; level?: string; q?: string }>;

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const categories = await prisma.courseCategory.findMany({ orderBy: { name: "asc" } });

  const where: {
    status: string;
    categoryId?: string;
    level?: string;
    OR?: { title?: { contains: string }; description?: { contains: string } }[];
  } = { status: "PUBLISHED" };

  if (params.category) {
    const cat = categories.find((c) => c.slug === params.category || c.id === params.category);
    if (cat) where.categoryId = cat.id;
  }
  if (params.level) where.level = params.level;
  if (params.q?.trim()) {
    where.OR = [
      { title: { contains: params.q.trim() } },
      { description: { contains: params.q.trim() } },
    ];
  }

  const courses = await prisma.course.findMany({
    where,
    include: courseInclude,
    orderBy: { updatedAt: "desc" },
  });

  const levels = ["Foundational", "Intermediate", "Advanced"];

  return (
    <>
      <PageHero
        eyebrow="Catalog"
        title="Courses"
        description="Explore professional development courses. The catalog updates live when Admin publishes changes."
      />
      <Section>
        <SectionHeading
          title="Featured offerings"
          description={
            courses.length
              ? `${courses.length} published course${courses.length === 1 ? "" : "s"}`
              : "No published courses yet — check back soon."
          }
        />

        <form className="mb-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end" method="get">
          <label className="text-sm font-semibold">
            <span className="mb-1 block text-muted">Search</span>
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Keyword…"
              className="w-full rounded-md border border-line bg-white px-3 py-2.5 outline-none focus:border-brand sm:w-48"
            />
          </label>
          <label className="text-sm font-semibold">
            <span className="mb-1 block text-muted">Category</span>
            <select
              name="category"
              defaultValue={params.category ?? ""}
              className="w-full rounded-md border border-line bg-white px-3 py-2.5 outline-none focus:border-brand sm:w-44"
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            <span className="mb-1 block text-muted">Level</span>
            <select
              name="level"
              defaultValue={params.level ?? ""}
              className="w-full rounded-md border border-line bg-white px-3 py-2.5 outline-none focus:border-brand sm:w-40"
            >
              <option value="">All</option>
              {levels.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
          >
            Filter
          </button>
        </form>

        <div className="space-y-6">
          {courses.map((course) => (
            <article
              key={course.id}
              className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                  {course.level}
                  {course.schedule ? ` · ${course.schedule}` : ""}
                  {course.category ? ` · ${course.category.name}` : ""}
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold text-ink">
                  <Link href={`/training/courses/${course.slug}`} className="hover:text-brand">
                    {course.title}
                  </Link>
                </h3>
                <p className="mt-2 max-w-xl text-muted">{course.description}</p>
                {course.instructors.length > 0 && (
                  <p className="mt-2 text-xs text-muted">
                    Instructors:{" "}
                    {course.instructors.map((ci) => ci.instructor.name).join(", ")}
                  </p>
                )}
              </div>
              <ButtonLink href={`/training/courses/${course.slug}`}>View & Enroll</ButtonLink>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
