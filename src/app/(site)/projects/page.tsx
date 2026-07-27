import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { projects } from "@/lib/org-content";

export const metadata: Metadata = {
  title: "Projects",
  description: "Featured YUGNet-Liberia projects and community initiatives.",
};

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        eyebrow="Impact in action"
        title="Projects"
        description="Selected initiatives that show how YUGNet-Liberia turns programs into community outcomes."
      />
      <Section>
        <SectionHeading
          title="Active and completed work"
          description="From leadership labs to green schools — projects grounded in Liberian communities."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <article
              id={project.slug}
              key={project.slug}
              className="scroll-mt-28 overflow-hidden rounded-2xl border border-line bg-white"
            >
              <div className="h-2 bg-gradient-to-r from-brand to-brand-leaf" />
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-wide text-brand">
                  {project.status} · {project.location}
                </p>
                <h2 className="mt-2 font-display text-xl font-bold text-ink">
                  {project.title}
                </h2>
                <p className="mt-3 text-muted">{project.summary}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
