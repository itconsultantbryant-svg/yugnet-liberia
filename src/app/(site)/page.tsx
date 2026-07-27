import { LogoHero } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import { brand } from "@/lib/brand";
import {
  events,
  homeAbout,
  impactStats,
  newsItems,
  programs,
  projects,
} from "@/lib/org-content";
import { getPublishedTestimonials } from "@/lib/cms-server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const testimonials = await getPublishedTestimonials();

  return (
    <>
      {/* Hero — one composition, brand first (Charitics-inspired NGO layout) */}
      <section className="relative min-h-[calc(100svh-7rem)] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(115deg, rgba(0,61,34,0.94) 0%, rgba(10,92,50,0.82) 48%, rgba(0,40,104,0.55) 100%),
              url(${brand.logo.src})
            `,
            backgroundSize: "cover, min(88vw, 680px)",
            backgroundPosition: "center, 112% 35%",
            backgroundRepeat: "no-repeat, no-repeat",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_15%,rgba(26,154,60,0.28),transparent_45%)]" />

        <div className="relative mx-auto grid min-h-[calc(100svh-7rem)] max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="text-white">
            <p className="animate-rise text-xs font-bold uppercase tracking-[0.28em] text-brand-leaf">
              Change Liberia together
            </p>
            <h1 className="animate-rise-delay mt-4 font-display text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-[4.25rem]">
              {brand.name}
            </h1>
            <p className="animate-rise-delay-2 mt-5 max-w-lg text-lg text-white/85 sm:text-xl">
              For the youth and causes you care about — recruiting, mentoring,
              empowering, and leading the next generation of changemakers.
            </p>
            <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
              <ButtonLink
                href="/donate"
                className="!bg-flag-red hover:!bg-[#9a0826]"
              >
                Donate now
              </ButtonLink>
              <ButtonLink
                href="/about"
                variant="secondary"
                className="!border-white/40 !bg-transparent !text-white hover:!bg-white/10"
              >
                Discover our story
              </ButtonLink>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <LogoHero />
          </div>
        </div>
      </section>

      {/* Impact strip — below first viewport */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {impactStats.map((stat) => (
            <div key={stat.label} className="text-center lg:text-left">
              <p className="font-display text-3xl font-bold text-brand">{stat.value}</p>
              <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* About teaser */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">
              {homeAbout.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
              {homeAbout.title}
            </h2>
            <p className="mt-4 text-muted">{homeAbout.body}</p>
            <ButtonLink href="/about" className="mt-6">
              Explore more
            </ButtonLink>
          </div>
          <div className="relative overflow-hidden rounded-[1.5rem] bg-brand-deep p-8 text-white shadow-[0_24px_50px_rgba(0,61,34,0.25)]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-leaf">
              Our mandate
            </p>
            <ul className="mt-6 space-y-4">
              {["Recruit", "Mentor", "Empower", "Lead"].map((item, i) => (
                <li key={item} className="flex items-center gap-4 border-b border-white/15 pb-4 last:border-0">
                  <span className="font-display text-2xl font-bold text-brand-leaf">
                    0{i + 1}
                  </span>
                  <span className="font-display text-xl font-semibold">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Programs / causes */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading
            eyebrow="Help & support us"
            title="Programs that inspire better futures"
            description="Community-rooted work across leadership, mentorship, empowerment, and SDG advocacy."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programs.slice(0, 6).map((program) => (
              <article
                key={program.slug}
                className="group overflow-hidden rounded-2xl border border-line bg-surface transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,61,34,0.12)]"
              >
                <div className="h-2 bg-gradient-to-r from-brand via-brand-leaf to-flag-blue" />
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-ink group-hover:text-brand">
                    {program.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted">{program.summary}</p>
                  <Link
                    href={"href" in program && program.href ? program.href : `/programs#${program.slug}`}
                    className="mt-5 inline-block text-sm font-bold text-brand hover:underline"
                  >
                    Learn more
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10">
            <ButtonLink href="/programs" variant="secondary">
              View all programs
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Donate CTA band */}
      <section className="relative overflow-hidden bg-brand-deep py-16 text-white sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(26,154,60,0.35),transparent_40%)]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-leaf">
            Donate now
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold sm:text-4xl">
            Support Liberian youth by fueling mentorship and opportunity
          </h2>
          <p className="mt-4 max-w-xl text-white/80">
            Your gift helps recruit youth, run community programs, and expand
            pathways that recruit, mentor, empower, and lead.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/donate" className="!bg-flag-red hover:!bg-[#9a0826]">
              Make a donation
            </ButtonLink>
            <ButtonLink
              href="/partners"
              variant="secondary"
              className="!border-white/35 !bg-transparent !text-white hover:!bg-white/10"
            >
              Partner with us
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Projects preview */}
      <Section>
        <SectionHeading
          eyebrow="Impact in action"
          title="Featured projects"
          description="Selected initiatives showing how YUGNet-Liberia turns programs into community outcomes."
        />
        <div className="space-y-6">
          {projects.slice(0, 3).map((project, i) => (
            <article
              key={project.slug}
              className="grid gap-4 rounded-2xl border border-line bg-white p-6 sm:grid-cols-[4rem_1fr_auto] sm:items-center"
            >
              <p className="font-display text-3xl font-bold text-brand/35">
                {String(i + 1).padStart(2, "0")}
              </p>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand">
                  {project.status} · {project.location}
                </p>
                <h3 className="mt-1 font-display text-xl font-bold text-ink">
                  {project.title}
                </h3>
                <p className="mt-2 text-muted">{project.summary}</p>
              </div>
              <Link
                href={`/projects#${project.slug}`}
                className="text-sm font-bold text-brand hover:underline"
              >
                Project details
              </Link>
            </article>
          ))}
        </div>
      </Section>

      {/* Events */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading
            eyebrow="Upcoming events"
            title="Gather with YUGNet-Liberia"
            description="Summits, open houses, and school tours that deepen youth engagement."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {events.map((event) => {
              const d = new Date(event.date);
              return (
                <article
                  key={event.slug}
                  className="overflow-hidden rounded-2xl border border-line bg-surface"
                >
                  <div className="flex items-center gap-4 bg-brand-deep px-5 py-4 text-white">
                    <div className="text-center">
                      <p className="font-display text-2xl font-bold leading-none">
                        {d.getDate()}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-brand-leaf">
                        {d.toLocaleString("en", { month: "short" })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/70">{event.time}</p>
                      <p className="text-sm font-semibold">{event.venue}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-ink">
                      {event.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted">{event.summary}</p>
                    <Link
                      href={`/events#${event.slug}`}
                      className="mt-4 inline-block text-sm font-bold text-brand hover:underline"
                    >
                      Event details
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="mt-10">
            <ButtonLink href="/events" variant="secondary">
              Explore more events
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Volunteer / join */}
      <Section>
        <div className="grid gap-10 rounded-[2rem] bg-brand-mist p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">
              Join us
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
              Why we need you as a volunteer or partner
            </h2>
            <p className="mt-4 text-muted">
              Help companies, congregations, schools, and communities develop
              powerful youth engagement — from mentorship hours to sponsored cohorts.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/careers">Volunteer & careers</ButtonLink>
              <ButtonLink href="/partners" variant="secondary">
                Partner with YUGNet
              </ButtonLink>
            </div>
          </div>
          <ul className="space-y-4">
            {[
              {
                t: "Recognition and fulfillment",
                d: "Serve alongside youth making tangible change in Liberian communities.",
              },
              {
                t: "Skills that multiply",
                d: "Share your expertise — leadership, digital skills, project design — where it matters.",
              },
              {
                t: "Be part of a community",
                d: "Join a network of mentors, facilitators, and partners committed to the SDGs.",
              },
            ].map((item) => (
              <li key={item.t} className="rounded-xl border border-line bg-white p-5">
                <p className="font-display text-lg font-bold text-ink">{item.t}</p>
                <p className="mt-1 text-sm text-muted">{item.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="border-y border-line bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <SectionHeading
              eyebrow="Testimonials"
              title="What people say about YUGNet-Liberia"
              description="Voices from graduates, mentors, and community partners."
            />
            <div className="grid gap-6 md:grid-cols-2">
              {testimonials.slice(0, 4).map((t) => (
                <blockquote
                  key={t.id}
                  className="rounded-2xl border border-line bg-surface p-6"
                >
                  <p className="text-lg text-ink">&ldquo;{t.quote}&rdquo;</p>
                  <footer className="mt-4 text-sm">
                    <span className="font-semibold text-brand">{t.name}</span>
                    {t.role && <span className="text-muted"> · {t.role}</span>}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* News */}
      <Section>
        <SectionHeading
          eyebrow="Latest stories"
          title="News from our work"
          description="Updates on programs, partnerships, and youth impact across Liberia."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {newsItems.map((item) => (
            <article
              key={item.slug}
              className="overflow-hidden rounded-2xl border border-line bg-white"
            >
              <div className="h-36 bg-gradient-to-br from-brand-deep via-brand to-flag-blue/80" />
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-brand">
                  {item.category} ·{" "}
                  {new Date(item.date).toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <h3 className="mt-2 font-display text-lg font-bold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted">{item.excerpt}</p>
                <Link
                  href={`/news#${item.slug}`}
                  className="mt-4 inline-block text-sm font-bold text-brand hover:underline"
                >
                  Read more
                </Link>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-10">
          <ButtonLink href="/news" variant="secondary">
            View all news
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
