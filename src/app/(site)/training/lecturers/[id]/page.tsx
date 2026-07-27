import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { prisma } from "@/lib/db";
import { instructorInclude } from "@/lib/training";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const instructor = await prisma.instructor.findFirst({
    where: { id, published: true },
  });
  if (!instructor) return { title: "Lecturer" };
  return { title: instructor.name, description: instructor.bio || undefined };
}

export default async function LecturerProfilePage({ params }: Params) {
  const { id } = await params;
  const instructor = await prisma.instructor.findFirst({
    where: { id, published: true },
    include: instructorInclude,
  });
  if (!instructor) notFound();

  const publishedCourses = instructor.courses.filter((c) => c.course.status === "PUBLISHED");

  return (
    <>
      <PageHero
        eyebrow="Lecturer"
        title={instructor.name}
        description={instructor.specialties || instructor.credentials || "YUGNet-Liberia faculty"}
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">About</h2>
            <p className="mt-3 whitespace-pre-wrap text-muted">
              {instructor.bio || "Biography will be added soon."}
            </p>
            {instructor.credentials && (
              <>
                <h3 className="mt-8 font-display text-xl font-bold text-ink">Credentials</h3>
                <p className="mt-2 text-muted">{instructor.credentials}</p>
              </>
            )}
          </div>
          <aside className="h-fit border-t-2 border-brand bg-white p-6">
            <h3 className="font-display text-lg font-bold text-ink">Teaching</h3>
            {publishedCourses.length ? (
              <ul className="mt-3 space-y-2">
                {publishedCourses.map((c) => (
                  <li key={c.courseId}>
                    <Link
                      href={`/training/courses/${c.course.slug}`}
                      className="font-semibold text-brand hover:underline"
                    >
                      {c.course.title}
                    </Link>
                    {c.course.category && (
                      <span className="block text-xs text-muted">{c.course.category.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">No published courses assigned yet.</p>
            )}
          </aside>
        </div>
      </Section>
    </>
  );
}
