import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { prisma } from "@/lib/db";
import { instructorInclude } from "@/lib/training";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Lecturers",
  description: "Meet YUGNet-Liberia instructors and mentors.",
};

export default async function LecturersPage() {
  let instructors: Awaited<
    ReturnType<typeof prisma.instructor.findMany<{ include: typeof instructorInclude }>>
  > = [];
  try {
    instructors = await prisma.instructor.findMany({
      where: { published: true },
      include: instructorInclude,
      orderBy: { name: "asc" },
    });
  } catch {
    instructors = [];
  }

  return (
    <>
      <PageHero
        eyebrow="Faculty"
        title="Our Lecturers"
        description="Meet the mentors and instructors who deliver YUGNet-Liberia professional development programs."
      />
      <Section>
        <SectionHeading
          title="Lecturer directory"
          description={
            instructors.length
              ? "Published instructor profiles — updates appear here when Admin saves changes."
              : "Instructor profiles will appear here once published by Admin."
          }
        />
        <div className="grid gap-6 md:grid-cols-2">
          {instructors.map((person) => (
            <article key={person.id} className="border-l-4 border-brand bg-white p-6">
              <h3 className="font-display text-xl font-bold text-ink">
                <Link href={`/training/lecturers/${person.id}`} className="hover:text-brand">
                  {person.name}
                </Link>
              </h3>
              {person.specialties && (
                <p className="mt-1 text-sm font-semibold text-brand">{person.specialties}</p>
              )}
              {person.credentials && (
                <p className="mt-1 text-xs text-muted">{person.credentials}</p>
              )}
              <p className="mt-3 line-clamp-3 text-muted">
                {person.bio || "Bio coming soon."}
              </p>
              {person.courses.length > 0 && (
                <p className="mt-3 text-xs text-muted">
                  Courses:{" "}
                  {person.courses
                    .filter((c) => c.course.status === "PUBLISHED")
                    .map((c) => c.course.title)
                    .join(", ") || "—"}
                </p>
              )}
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
