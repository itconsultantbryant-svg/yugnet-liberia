"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/website", label: "Overview" },
  { href: "/admin/website/pages", label: "Pages & Sections" },
  { href: "/admin/website/media", label: "Media Library" },
  { href: "/admin/website/testimonials", label: "Testimonials" },
  { href: "/admin/website/contact", label: "Contact Submissions" },
  { href: "/admin/website/seo", label: "SEO Settings" },
];

export function WebsiteSubNav() {
  const pathname = usePathname();

  return (
    <nav
      className="mb-8 flex gap-1 overflow-x-auto border-b border-line pb-2"
      aria-label="Website management"
    >
      {links.map((link) => {
        const active =
          link.href === "/admin/website"
            ? pathname === link.href
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold ${
              active ? "bg-brand text-white" : "text-muted hover:bg-brand-mist hover:text-brand"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
