import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { events } from "@/lib/org-content";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming YUGNet-Liberia events, summits, and community gatherings.",
};

export default function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Gather with us"
        title="Events"
        description="Summits, open houses, and school tours that deepen youth engagement and partnership."
      />
      <Section>
        <SectionHeading
          title="Event schedule"
          description="Join YUGNet-Liberia in person — venues and times listed below."
        />
        <div className="space-y-6">
          {events.map((event) => {
            const d = new Date(event.date);
            return (
              <article
                id={event.slug}
                key={event.slug}
                className="scroll-mt-28 flex flex-col gap-4 overflow-hidden rounded-2xl border border-line bg-white sm:flex-row"
              >
                <div className="flex min-w-[7rem] flex-col items-center justify-center bg-brand-deep px-6 py-8 text-white">
                  <p className="font-display text-4xl font-bold leading-none">{d.getDate()}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-brand-leaf">
                    {d.toLocaleString("en", { month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-wide text-brand">
                    {event.time} · {event.venue}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-ink">{event.title}</h2>
                  <p className="mt-3 text-muted">{event.summary}</p>
                </div>
              </article>
            );
          })}
        </div>
      </Section>
    </>
  );
}
