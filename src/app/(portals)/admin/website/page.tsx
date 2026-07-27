import Link from "next/link";
import { WebsiteSubNav } from "@/components/admin/WebsiteSubNav";

const cards = [
  {
    href: "/admin/website/pages",
    title: "Pages & Sections",
    blurb: "Edit hero copy and section text across public pages.",
  },
  {
    href: "/admin/website/media",
    title: "Media Library",
    blurb: "Upload and manage images used site-wide.",
  },
  {
    href: "/admin/website/testimonials",
    title: "Testimonials",
    blurb: "Publish success stories that appear on the public site.",
  },
  {
    href: "/admin/website/contact",
    title: "Contact Submissions",
    blurb: "Review messages from the public contact form.",
  },
  {
    href: "/admin/website/seo",
    title: "SEO Settings",
    blurb: "Site title, description, keywords, and social image.",
  },
] as const;

export default function WebsiteOverviewPage() {
  return (
    <div>
      <WebsiteSubNav />
      <h1 className="font-display text-3xl font-bold text-ink">Website Management</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Edit public content here. Saves revalidate the live site immediately — no deploy required.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="border-t-2 border-brand bg-white p-5 transition hover:bg-brand-mist/40"
          >
            <p className="font-semibold text-ink">{card.title}</p>
            <p className="mt-1 text-sm text-muted">{card.blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
