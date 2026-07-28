import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

const modules = [
  { href: "/admin/website", label: "Website Management", blurb: "Pages, media, testimonials, contact, SEO" },
  { href: "/admin/users", label: "Users", blurb: "Create users, assign roles & overrides" },
  { href: "/admin/roles", label: "Roles & Permissions", blurb: "Edit the permission matrix" },
  { href: "/admin/audit", label: "Audit Log", blurb: "Who did what, when" },
  { href: "/admin/training", label: "Training Management", blurb: "Courses, instructors, students & enrollments" },
] as const;

export default async function AdminDashboardPage() {
  const session = await getSession();
  const [contacts, unread] = await Promise.all([
    prisma.contactSubmission.count({ where: { status: "NEW" } }),
    session
      ? prisma.notification.count({ where: { userId: session.id, read: false } })
      : Promise.resolve(0),
  ]);

  return (
    <div>
      <div className="mb-8 flex items-start gap-4">
        <Logo size="md" href={false} />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Admin</p>
          <h1 className="font-display text-3xl font-bold text-ink">
            Welcome{session ? `, ${session.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            Phase 6 student management is live — roster, manual enroll, and status updates under Training.
          </p>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="border-t-2 border-brand bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">New contact messages</p>
          <p className="mt-1 font-display text-3xl font-bold text-ink">{contacts}</p>
          <Link href="/admin/website/contact" className="mt-2 inline-block text-sm font-semibold text-brand hover:underline">
            Review inbox
          </Link>
        </div>
        <div className="border-t-2 border-brand bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Unread notifications</p>
          <p className="mt-1 font-display text-3xl font-bold text-ink">{unread}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="border-t-2 border-brand bg-white p-5 transition hover:bg-brand-mist/40"
          >
            <p className="font-semibold text-ink">{m.label}</p>
            <p className="mt-1 text-xs text-muted">{m.blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
