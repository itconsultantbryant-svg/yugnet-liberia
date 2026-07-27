"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { brand, publicNav } from "@/lib/brand";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/more") {
    return [
      "/gallery",
      "/resources",
      "/partners",
      "/careers",
      "/training",
    ].some((p) => pathname === p || pathname.startsWith(`${p}/`));
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Charitics-style top utility bar */}
      <div className="hidden border-b border-white/10 bg-brand-deep text-white sm:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 text-xs sm:px-6">
          <p className="font-semibold tracking-wide text-white/80">
            {brand.tagline}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-white/60">Follow us</span>
            <div className="flex items-center gap-3">
              {brand.social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-white/80 transition hover:text-brand-leaf"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-line bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo size="md" showWordmark priority className="min-w-0" />

          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary">
            {publicNav.map((item) => {
              if ("children" in item && item.children) {
                return (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => setMoreOpen(true)}
                    onMouseLeave={() => setMoreOpen(false)}
                  >
                    <button
                      type="button"
                      className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                        isActive(pathname, item.href)
                          ? "bg-brand-mist text-brand"
                          : "text-ink/80 hover:bg-brand-mist/70 hover:text-brand"
                      }`}
                      aria-expanded={moreOpen}
                    >
                      {item.label}
                    </button>
                    {moreOpen && (
                      <div className="absolute left-0 top-full z-50 min-w-[12rem] rounded-md border border-line bg-white py-2 shadow-lg">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 text-sm font-semibold text-ink hover:bg-brand-mist hover:text-brand"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-brand-mist text-brand"
                      : "text-ink/80 hover:bg-brand-mist/70 hover:text-brand"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 xl:flex">
            <ButtonLink href="/donate" className="!bg-flag-red !py-2 hover:!bg-[#9a0826]">
              Donate
            </ButtonLink>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line text-brand xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              {open ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <div id="mobile-nav" className="border-t border-line bg-white px-4 py-4 xl:hidden">
            <nav className="flex flex-col gap-1" aria-label="Mobile primary">
              {publicNav.flatMap((item) => {
                if ("children" in item && item.children) {
                  return item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpen(false)}
                      className={`rounded-md px-3 py-3 text-base font-semibold ${
                        isActive(pathname, child.href)
                          ? "bg-brand-mist text-brand"
                          : "text-ink"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ));
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-md px-3 py-3 text-base font-semibold ${
                      isActive(pathname, item.href)
                        ? "bg-brand-mist text-brand"
                        : "text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4">
              <ButtonLink
                href="/donate"
                className="w-full !bg-flag-red hover:!bg-[#9a0826]"
              >
                Donate
              </ButtonLink>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
