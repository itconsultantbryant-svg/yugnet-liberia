import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import { brand } from "@/lib/brand";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Training Hub",
  description:
    "YUGNet-Liberia professional development courses, lecturers, enrollment, and certificate verification.",
};

const hubs = [
  {
    href: "/training/courses",
    title: "Courses",
    copy: "Browse the catalog, filter by category, and enroll online.",
  },
  {
    href: "/training/lecturers",
    title: "Our Lecturers",
    copy: "Meet the instructors who deliver mentorship and coursework.",
  },
  {
    href: "/training/verify",
    title: "Verify Certificate",
    copy: "Confirm a certificate with full name and certificate ID.",
  },
  {
    href: "/training/signup",
    title: "Student Signup",
    copy: "Create a student account to enroll and access your dashboard.",
  },
  {
    href: "/training/login",
    title: "Login",
    copy: "Sign in to Admin, Instructor, or Student portals.",
  },
] as const;

export default async function TrainingHomePage() {
  const { courseCount, lecturerCount } = await (async () => {
    try {
      const [courses, lecturers] = await Promise.all([
        prisma.course.count({ where: { status: "PUBLISHED" } }),
        prisma.instructor.count({ where: { published: true } }),
      ]);
      return { courseCount: courses, lecturerCount: lecturers };
    } catch {
      return { courseCount: 0, lecturerCount: 0 };
    }
  })();

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-brand-deep text-white">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `url(${brand.logo.src})`,
            backgroundSize: "min(70vw, 480px)",
            backgroundPosition: "right -5% center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-20">
          <div className="max-w-xl animate-rise">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-leaf">
              Professional development
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
              Training Hub
            </h1>
            <p className="mt-4 text-lg text-white/80">
              Courses, lecturers, enrollment, login, and verifiable certificates —
              all student and portal access lives here (not on the main organization site).
            </p>
            <p className="mt-3 text-sm text-white/70">
              {courseCount} published course{courseCount === 1 ? "" : "s"} ·{" "}
              {lecturerCount} lecturer{lecturerCount === 1 ? "" : "s"}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink
                href="/training/courses"
                className="!bg-white !text-brand hover:!bg-brand-mist"
              >
                Enroll Now
              </ButtonLink>
              <ButtonLink
                href="/training/signup"
                variant="secondary"
                className="!border-white/35 !bg-transparent !text-white hover:!bg-white/10"
              >
                Create student account
              </ButtonLink>
              <ButtonLink
                href="/training/login"
                variant="secondary"
                className="!border-white/35 !bg-transparent !text-white hover:!bg-white/10"
              >
                Login
              </ButtonLink>
            </div>
          </div>
          <Logo size="lg" href={false} className="animate-logo self-start sm:self-center" />
        </div>
      </section>

      <Section>
        <SectionHeading
          eyebrow="Start here"
          title="Everything for professional growth"
          description="Signup, login, and enrollment are available only in this Training Hub. The main website focuses on YUGNet-Liberia programs, impact, and partnerships."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hubs.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group border-t-2 border-brand bg-white p-6 transition hover:bg-brand-mist/50"
            >
              <h3 className="font-display text-xl font-bold text-ink group-hover:text-brand">
                {item.title}
              </h3>
              <p className="mt-2 text-muted">{item.copy}</p>
            </a>
          ))}
        </div>
      </Section>
    </>
  );
}
