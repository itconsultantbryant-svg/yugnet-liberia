"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { brand } from "@/lib/brand";

const presets = [10, 25, 50, 100, 250];

export default function DonatePage() {
  const [amount, setAmount] = useState(50);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function selectAmount(value: number) {
    setAmount(value);
    setCustom("");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Payment gateway arrives in a later phase — capture intent via contact for now
    void fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || "Donor",
        email: email || brand.contact.email,
        message: `Donation interest: $${custom || amount} USD in support of ${brand.name} youth programs.`,
      }),
    }).finally(() => setSent(true));
  }

  return (
    <>
      <PageHero
        eyebrow="Give"
        title="Donate"
        description="Fuel mentorship, community programs, and youth leadership across Liberia. Every gift advances Recruit · Mentor · Empower · Lead."
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              Support kids and youth by raising valuable opportunity
            </h2>
            <p className="mt-4 text-muted">
              Donations help YUGNet-Liberia run Leadership Labs, Mentorship Circles,
              community action weekends, and SDG school clubs — with young people at
              the center of design and delivery.
            </p>
            <ul className="mt-6 space-y-3 text-muted">
              {[
                "Sponsor a mentorship cohort seat",
                "Fund community project materials",
                "Support facilitator transport and venues",
                "Underwrite scholarship pathways into Training Hub courses",
              ].map((line) => (
                <li key={line} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-flag-red" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-line bg-white p-6 shadow-[0_16px_40px_rgba(0,61,34,0.08)] sm:p-8"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
              Custom donate now
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => selectAmount(p)}
                  className={`rounded-md px-4 py-2.5 text-sm font-bold ${
                    !custom && amount === p
                      ? "bg-flag-red text-white"
                      : "border border-line bg-surface text-ink hover:border-brand"
                  }`}
                >
                  ${p}
                </button>
              ))}
            </div>
            <label className="mt-4 block text-sm font-semibold">
              <span className="mb-1 block">Other amount (USD)</span>
              <input
                type="number"
                min={1}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Enter amount"
                className="w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
              />
            </label>
            <label className="mt-3 block text-sm font-semibold">
              <span className="mb-1 block">Your name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
              />
            </label>
            <label className="mt-3 block text-sm font-semibold">
              <span className="mb-1 block">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
              />
            </label>
            <Button type="submit" className="mt-5 w-full !bg-flag-red hover:!bg-[#9a0826]">
              Donate ${custom || amount}
            </Button>
            {sent ? (
              <p className="mt-3 text-sm text-brand">
                Thank you — we received your donation interest and will follow up with
                payment instructions.
              </p>
            ) : (
              <p className="mt-3 text-xs text-muted">
                Online payment gateway arrives in a later phase. This form notifies our
                team so we can complete your gift securely.
              </p>
            )}
          </form>
        </div>
      </Section>
    </>
  );
}
