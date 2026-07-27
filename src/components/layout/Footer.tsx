import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { brand, footerEngage, footerExplore } from "@/lib/brand";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-brand-deep text-white">
      <div className="border-b border-white/10 bg-brand">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="font-display text-2xl font-bold">Join the movement</p>
            <p className="mt-1 text-sm text-white/85">
              Partner, volunteer, or donate to expand youth opportunity across Liberia.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/donate"
              className="rounded-md bg-flag-red px-5 py-3 text-sm font-semibold text-white hover:bg-[#9a0826]"
            >
              Donate now
            </Link>
            <Link
              href="/partners"
              className="rounded-md border border-white/35 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Become a partner
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Logo
            size="lg"
            href="/"
            className="[&_span.relative]:ring-2 [&_span.relative]:ring-white/30"
          />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80">
            {brand.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {brand.social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold uppercase tracking-wide text-brand-leaf hover:text-white"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-white/90">
            Explore
          </h3>
          <ul className="mt-4 space-y-2">
            {footerExplore.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-white/75 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-white/90">
            Engage
          </h3>
          <ul className="mt-4 space-y-2">
            {footerEngage.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-white/75 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-white/90">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-white/75">
            <li>{brand.contact.address}</li>
            <li>
              <a href={`mailto:${brand.contact.email}`} className="hover:text-white">
                {brand.contact.email}
              </a>
            </li>
            <li>
              <a href={`tel:${brand.contact.phone.replace(/\s/g, "")}`} className="hover:text-white">
                {brand.contact.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {year} {brand.name}. All rights reserved.
          </p>
          <p>Youth · Community · Sustainable Development · Liberia</p>
        </div>
      </div>
    </footer>
  );
}
