import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Student Dashboard",
};

export default async function StudentDashboardPage() {
  const session = await getSession();
  const student = session
    ? await prisma.student.findUnique({
        where: { userId: session.id },
        select: { id: true },
      })
    : null;

  const enrollments = student
    ? await prisma.enrollment.findMany({
        where: { studentId: student.id, status: "ACTIVE" },
        orderBy: { enrolledDate: "desc" },
        include: {
          course: {
            include: { category: true },
          },
        },
      })
    : [];

  return (
    <div>
      <div className="mb-8 flex items-start gap-4">
        <Logo size="md" href={false} />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Student</p>
          <h1 className="font-display text-3xl font-bold text-ink">
            Welcome{session ? `, ${session.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            Your enrolled courses appear here. Grades, attendance, certificates, and
            online classes unlock in later phases.
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <ButtonLink href="/training/courses">Browse courses</ButtonLink>
        <ButtonLink href="/training/signup" variant="secondary">
          Enroll in another course
        </ButtonLink>
      </div>

      <h2 className="font-display text-xl font-bold text-ink">My courses</h2>
      {enrollments.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          You are not enrolled in any courses yet.{" "}
          <Link href="/training/courses" className="font-semibold text-brand hover:underline">
            Explore the catalog
          </Link>
          .
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {enrollments.map((e) => (
            <article
              key={e.id}
              className="border-l-4 border-brand bg-white px-4 py-4 shadow-[0_0_0_1px_var(--brand-line)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-brand">
                    {e.course.level}
                    {e.course.category ? ` · ${e.course.category.name}` : ""}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold text-ink">
                    <Link
                      href={`/training/courses/${e.course.slug}`}
                      className="hover:text-brand"
                    >
                      {e.course.title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    Enrolled {new Date(e.enrolledDate).toLocaleDateString()} · {e.status}
                    {e.course.schedule ? ` · ${e.course.schedule}` : ""}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
