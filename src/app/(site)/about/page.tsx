import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { brand } from "@/lib/brand";
import { aboutHighlights } from "@/lib/org-content";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${brand.name} — our mission to recruit, mentor, empower, and lead Liberian youth.`,
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Who we are"
        title={`About ${brand.name}`}
        description="We unite youth and professionals across Liberia with mentorship, community programs, and leadership pathways aligned to sustainable development."
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">Our story</h2>
            <p className="mt-4 text-muted">
              {brand.legalName} exists to close the gap between ambition and opportunity.
              Through recruitment, mentoring relationships, community action, and
              professional development, we help learners turn potential into lasting impact.
            </p>
            <p className="mt-4 text-muted">
              Our emblem — a globe cradled by hands with a living sprout — reflects
              stewardship of people and planet. The Liberian flag at our wordmark
              anchors us at home while the SDG ring reminds us we serve goals larger
              than ourselves.
            </p>
            <ul className="mt-6 space-y-3">
              {aboutHighlights.map((line) => (
                <li key={line} className="flex gap-3 text-muted">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-leaf" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border-l-4 border-brand bg-white p-8 shadow-[0_12px_40px_rgba(0,61,34,0.08)]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Mission</p>
            <p className="mt-3 font-display text-xl font-semibold text-ink">
              {brand.tagline}
            </p>
            <p className="mt-4 text-muted">
              Equip Liberian youth and professionals with the knowledge, networks,
              and character to lead positive change in their communities and careers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/programs">Our programs</ButtonLink>
              <ButtonLink href="/donate" variant="secondary">
                Support the mission
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
