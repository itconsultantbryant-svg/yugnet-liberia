"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/training", label: "Overview" },
  { href: "/admin/training/courses", label: "Courses" },
  { href: "/admin/training/categories", label: "Categories" },
  { href: "/admin/training/instructors", label: "Instructors" },
  { href: "/admin/training/students", label: "Students" },
];

export function TrainingSubNav() {
  const pathname = usePathname();

  return (
    <nav
      className="mb-8 flex gap-1 overflow-x-auto border-b border-line pb-2"
      aria-label="Training management"
    >
      {links.map((link) => {
        const active =
          link.href === "/admin/training"
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
