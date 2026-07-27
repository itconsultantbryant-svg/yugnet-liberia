import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Verify Certificate",
};

export default function VerifyCertificatePage() {
  return (
    <>
      <PageHero
        eyebrow="Authenticity"
        title="Verify Your Certificate"
        description="Confirm a YUGNet-Liberia certificate using the graduate’s full name and certificate ID."
      />
      <Section>
        <form className="mx-auto max-w-lg space-y-4 bg-white p-6 shadow-[0_0_0_1px_var(--brand-line)] sm:p-8">
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-semibold text-ink">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              required
              placeholder="As printed on the certificate"
              className="w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
            />
          </div>
          <div>
            <label htmlFor="certId" className="mb-1 block text-sm font-semibold text-ink">
              Certificate / ID number
            </label>
            <input
              id="certId"
              name="certId"
              required
              placeholder="e.g. YUG-2026-00041"
              className="w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
            />
          </div>
          <Button type="submit" className="w-full">
            Verify certificate
          </Button>
          <p className="text-xs text-muted">
            Live verification against issued certificates ships in Phase 8. Lookups
            will be logged for audit.
          </p>
        </form>
      </Section>
    </>
  );
}
