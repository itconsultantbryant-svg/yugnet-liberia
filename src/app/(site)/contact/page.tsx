import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${brand.name} about partnerships, volunteering, programs, or donations.`,
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Contact"
        description={`Reach the ${brand.name} team about partnerships, volunteering, media, or program support.`}
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              We would love to hear from you
            </h2>
            <p className="mt-3 text-muted">
              For professional development courses and student accounts, please use the
              Training Hub — enrollment and login live there.
            </p>
            <dl className="mt-8 space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-brand">Organization</dt>
                <dd className="text-muted">{brand.legalName}</dd>
              </div>
              <div>
                <dt className="font-semibold text-brand">Address</dt>
                <dd className="text-muted">{brand.contact.address}</dd>
              </div>
              <div>
                <dt className="font-semibold text-brand">Email</dt>
                <dd className="text-muted">
                  <a href={`mailto:${brand.contact.email}`} className="hover:text-brand">
                    {brand.contact.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-brand">Phone</dt>
                <dd className="text-muted">{brand.contact.phone}</dd>
              </div>
              <div>
                <dt className="font-semibold text-brand">Social</dt>
                <dd className="mt-1 flex flex-wrap gap-3">
                  {brand.social.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand hover:underline"
                    >
                      {s.label}
                    </a>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
          <ContactForm />
        </div>
      </Section>
    </>
  );
}
