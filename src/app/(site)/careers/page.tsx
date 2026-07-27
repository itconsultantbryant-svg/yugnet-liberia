import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { careers } from "@/lib/org-content";

export const metadata: Metadata = {
  title: "Careers",
  description: "Careers, internships, and volunteer roles with YUGNet-Liberia.",
};

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Join the team"
        title="Careers & volunteering"
        description="Full-time roles, internships, and volunteer facilitator opportunities advancing youth opportunity in Liberia."
      />
      <Section>
        <SectionHeading
          title="Open opportunities"
          description="Apply by contacting us with your CV and a short note about how you want to serve."
        />
        <div className="space-y-4">
          {careers.map((role) => (
            <article
              key={role.title}
              className="rounded-2xl border border-line bg-white p-6 sm:flex sm:items-start sm:justify-between sm:gap-6"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand">
                  {role.type} · {role.location}
                </p>
                <h2 className="mt-1 font-display text-xl font-bold text-ink">{role.title}</h2>
                <p className="mt-2 text-muted">{role.summary}</p>
              </div>
              <ButtonLink href="/contact" variant="secondary" className="mt-4 shrink-0 sm:mt-0">
                Apply / inquire
              </ButtonLink>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
