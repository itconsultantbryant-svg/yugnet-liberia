import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { programs } from "@/lib/org-content";

export const metadata: Metadata = {
  title: "Programs",
  description: "YUGNet-Liberia programs for youth recruitment, mentorship, empowerment, and SDG advocacy.",
};

export default function ProgramsPage() {
  return (
    <>
      <PageHero
        eyebrow="What we do"
        title="Programs"
        description="From mentorship circles to community empowerment and SDG advocacy — every program reflects Recruit · Mentor · Empower · Lead."
      />
      <Section>
        <SectionHeading
          title="Pathways that move youth forward"
          description="Explore how YUGNet-Liberia engages young people and communities across Liberia."
        />
        <div className="space-y-10">
          {programs.map((program, i) => (
            <article
              id={program.slug}
              key={program.slug}
              className="scroll-mt-28 grid gap-4 border-b border-line pb-10 lg:grid-cols-[5rem_1fr]"
            >
              <p className="font-display text-4xl font-bold text-brand/30">
                {String(i + 1).padStart(2, "0")}
              </p>
              <div>
                <h2 className="font-display text-2xl font-bold text-ink">{program.title}</h2>
                <p className="mt-2 font-semibold text-brand">{program.summary}</p>
                <p className="mt-3 max-w-3xl text-muted">{program.body}</p>
                {"href" in program && program.href && (
                  <Link
                    href={program.href}
                    className="mt-4 inline-block text-sm font-bold text-brand hover:underline"
                  >
                    Open Training Hub →
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
