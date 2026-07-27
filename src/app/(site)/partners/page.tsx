import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { partners } from "@/lib/org-content";

export const metadata: Metadata = {
  title: "Partners",
  description: "Partner with YUGNet-Liberia to expand youth opportunity across Liberia.",
};

export default function PartnersPage() {
  return (
    <>
      <PageHero
        eyebrow="Collaboration"
        title="Partners"
        description="Schools, faith networks, NGOs, and private-sector mentors who help us recruit, mentor, empower, and lead."
      />
      <Section>
        <SectionHeading
          title="Who we work with"
          description="Partnerships unlock venues, mentors, sponsorships, and co-delivered programs."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {partners.map((p) => (
            <article key={p.name} className="rounded-2xl border border-line bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-brand">{p.role}</p>
              <h2 className="mt-2 font-display text-xl font-bold text-ink">{p.name}</h2>
              <p className="mt-3 text-muted">{p.summary}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 rounded-2xl bg-brand-mist p-8">
          <h3 className="font-display text-2xl font-bold text-ink">Become a partner</h3>
          <p className="mt-2 max-w-2xl text-muted">
            Sponsor a cohort, host a workshop, or second mentors to Mentorship Circles.
            Tell us how your organization wants to invest in Liberian youth.
          </p>
          <ButtonLink href="/contact" className="mt-6">
            Start a conversation
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
