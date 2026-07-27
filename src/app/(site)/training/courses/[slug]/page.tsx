import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnrollButton } from "@/components/training/EnrollButton";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { prisma } from "@/lib/db";
import { courseInclude } from "@/lib/training";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const course = await prisma.course.findFirst({
    where: { slug, status: "PUBLISHED" },
  });
  if (!course) return { title: "Course" };
  return { title: course.title, description: course.description };
}

export default async function CourseDetailPage({ params }: Params) {
  const { slug } = await params;
  const course = await prisma.course.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: courseInclude,
  });
  if (!course) notFound();

  return (
    <>
      <PageHero
        eyebrow={course.category?.name ?? "Course"}
        title={course.title}
        description={course.description}
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-8">
            {course.flyerImage && (
              <div className="relative aspect-[16/9] overflow-hidden bg-brand-mist">
                <Image
                  src={course.flyerImage}
                  alt={`${course.title} flyer`}
                  fill
                  className="object-cover"
                  unoptimized={course.flyerImage.startsWith("/uploads")}
                />
              </div>
            )}
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">Syllabus</h2>
              <p className="mt-3 whitespace-pre-wrap text-muted">
                {course.syllabus || "Syllabus details will be shared after enrollment."}
              </p>
            </div>
            {course.prerequisites && (
              <div>
                <h2 className="font-display text-xl font-bold text-ink">Prerequisites</h2>
                <p className="mt-2 text-muted">{course.prerequisites}</p>
              </div>
            )}
            {course.instructors.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-bold text-ink">Instructors</h2>
                <ul className="mt-3 space-y-2">
                  {course.instructors.map((ci) => (
                    <li key={ci.instructorId}>
                      <Link
                        href={`/training/lecturers/${ci.instructorId}`}
                        className="font-semibold text-brand hover:underline"
                      >
                        {ci.instructor.name}
                      </Link>
                      {ci.instructor.specialties && (
                        <span className="text-sm text-muted"> — {ci.instructor.specialties}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="h-fit border-t-2 border-brand bg-white p-6">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-semibold text-brand">Level</dt>
                <dd className="text-ink">{course.level}</dd>
              </div>
              {course.duration && (
                <div>
                  <dt className="font-semibold text-brand">Duration</dt>
                  <dd className="text-ink">{course.duration}</dd>
                </div>
              )}
              {course.schedule && (
                <div>
                  <dt className="font-semibold text-brand">Schedule</dt>
                  <dd className="text-ink">{course.schedule}</dd>
                </div>
              )}
              {course.capacity != null && (
                <div>
                  <dt className="font-semibold text-brand">Capacity</dt>
                  <dd className="text-ink">{course.capacity} seats</dd>
                </div>
              )}
              <div>
                <dt className="font-semibold text-brand">Price</dt>
                <dd className="font-display text-2xl font-bold text-ink">
                  {course.price > 0 ? `$${course.price.toFixed(2)}` : "Free"}
                </dd>
              </div>
            </dl>
            <EnrollButton courseSlug={course.slug} className="mt-6" />
          </aside>
        </div>
      </Section>
    </>
  );
}
