import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { resources } from "@/lib/org-content";

export const metadata: Metadata = {
  title: "Resources",
  description: "Guides, toolkits, and briefs from YUGNet-Liberia.",
};

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Knowledge"
        title="Resources"
        description="Practical materials for mentors, youth clubs, partners, and community facilitators."
      />
      <Section>
        <SectionHeading
          title="Download & share"
          description="File links can be connected to Media Library uploads from the Admin CMS."
        />
        <div className="space-y-4">
          {resources.map((item) => (
            <article
              key={item.title}
              className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand">
                  {item.type}
                </p>
                <h2 className="mt-1 font-display text-xl font-bold text-ink">{item.title}</h2>
                <p className="mt-2 text-muted">{item.summary}</p>
              </div>
              <span className="text-sm font-semibold text-muted">Coming soon</span>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
