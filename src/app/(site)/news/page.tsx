import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { newsItems } from "@/lib/org-content";

export const metadata: Metadata = {
  title: "News",
  description: "News and stories from YUGNet-Liberia programs and partnerships.",
};

export default function NewsPage() {
  return (
    <>
      <PageHero
        eyebrow="Stories & updates"
        title="News"
        description="Program milestones, partner briefings, and community moments from across Liberia."
      />
      <Section>
        <SectionHeading
          title="Latest from YUGNet-Liberia"
          description="Shareable stories that strengthen our online presence and celebrate youth impact."
        />
        <div className="space-y-8">
          {newsItems.map((item) => (
            <article
              id={item.slug}
              key={item.slug}
              className="scroll-mt-28 grid gap-4 border-b border-line pb-8 sm:grid-cols-[8rem_1fr]"
            >
              <time className="text-sm font-semibold text-brand">
                {new Date(item.date).toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted">
                  {item.category}
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-ink">{item.title}</h2>
                <p className="mt-3 text-muted">{item.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
