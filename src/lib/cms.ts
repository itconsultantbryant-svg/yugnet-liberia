import { brand } from "@/lib/brand";

export type ContentMap = Record<string, string>;

export type CmsSectionDef = {
  page: string;
  sectionKey: string;
  label: string;
  fields: { key: string; label: string; multiline?: boolean }[];
  defaults: ContentMap;
};

export const CMS_SECTIONS: CmsSectionDef[] = [
  {
    page: "home",
    sectionKey: "hero",
    label: "Home · Hero",
    fields: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Title" },
      { key: "subtitle", label: "Subtitle", multiline: true },
      { key: "ctaPrimary", label: "Primary CTA label" },
      { key: "ctaSecondary", label: "Secondary CTA label" },
    ],
    defaults: {
      eyebrow: "Youth United for Global Network",
      title: brand.name,
      subtitle:
        "For the youth and causes you care about — recruiting, mentoring, empowering, and leading Liberian changemakers.",
      ctaPrimary: "Donate now",
      ctaSecondary: "Discover our story",
    },
  },
  {
    page: "home",
    sectionKey: "pillars",
    label: "Home · Mandate intro",
    fields: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Title" },
      { key: "description", label: "Description", multiline: true },
    ],
    defaults: {
      eyebrow: "Our mandate",
      title: "Four commitments that shape every program",
      description:
        "Drawn from our emblem — a globe held in caring hands, rooted in Liberian identity and global goals.",
    },
  },
  {
    page: "home",
    sectionKey: "training",
    label: "Home · Training callout",
    fields: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Title" },
      { key: "description", label: "Description", multiline: true },
      { key: "cta", label: "CTA label" },
    ],
    defaults: {
      eyebrow: "Professional development",
      title: "Training that opens doors",
      description:
        "Browse courses, meet lecturers, enroll online, and verify certificates — all under one Training hub.",
      cta: "View Courses",
    },
  },
  {
    page: "home",
    sectionKey: "closing",
    label: "Home · Closing CTA",
    fields: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Title", multiline: true },
      { key: "ctaPrimary", label: "Primary CTA" },
      { key: "ctaSecondary", label: "Secondary CTA" },
    ],
    defaults: {
      eyebrow: "Ready to grow?",
      title: "Partner, volunteer, or donate to expand youth opportunity.",
      ctaPrimary: "Donate",
      ctaSecondary: "Become a partner",
    },
  },
  {
    page: "about",
    sectionKey: "hero",
    label: "About · Hero",
    fields: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Title" },
      { key: "description", label: "Description", multiline: true },
    ],
    defaults: {
      eyebrow: "Who we are",
      title: `About ${brand.name}`,
      description:
        "We unite youth and professionals across Liberia with mentorship, skills training, and leadership pathways aligned to sustainable development.",
    },
  },
  {
    page: "about",
    sectionKey: "story",
    label: "About · Story & Mission",
    fields: [
      { key: "storyTitle", label: "Story title" },
      { key: "storyBody", label: "Story body", multiline: true },
      { key: "storyBody2", label: "Story body (continued)", multiline: true },
      { key: "missionLabel", label: "Mission label" },
      { key: "missionTitle", label: "Mission title" },
      { key: "missionBody", label: "Mission body", multiline: true },
    ],
    defaults: {
      storyTitle: "Our story",
      storyBody: `${brand.name} exists to close the gap between ambition and opportunity. Through recruitment, mentoring relationships, professional development courses, and community leadership, we help learners turn potential into lasting impact.`,
      storyBody2:
        "Our emblem — a globe cradled by hands with a living sprout — reflects stewardship of people and planet. The Liberian flag at our wordmark anchors us at home while the SDG ring reminds us we serve goals larger than ourselves.",
      missionLabel: "Mission",
      missionTitle: brand.tagline,
      missionBody:
        "Equip Liberian youth and professionals with the knowledge, networks, and character to lead positive change in their communities and careers.",
    },
  },
  {
    page: "services",
    sectionKey: "hero",
    label: "Services · Hero",
    fields: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Title" },
      { key: "description", label: "Description", multiline: true },
    ],
    defaults: {
      eyebrow: "What we offer",
      title: "Services",
      description:
        "From open enrollment courses to organizational training, every offering reflects our commitment to growth with integrity.",
    },
  },
  {
    page: "portfolio",
    sectionKey: "hero",
    label: "Portfolio · Hero",
    fields: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Title" },
      { key: "description", label: "Description", multiline: true },
    ],
    defaults: {
      eyebrow: "Impact in action",
      title: "Portfolio",
      description:
        "Selected programs and partnerships that show how YUGNet-Liberia turns training into community outcomes.",
    },
  },
  {
    page: "contact",
    sectionKey: "hero",
    label: "Contact · Hero",
    fields: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Title" },
      { key: "description", label: "Description", multiline: true },
    ],
    defaults: {
      eyebrow: "Get in touch",
      title: "Contact",
      description: `Reach the ${brand.name} team about partnerships, training, or enrollment support.`,
    },
  },
];

export const DEFAULT_SEO = {
  siteTitle: `${brand.name} | ${brand.tagline}`,
  siteDescription: brand.description,
  keywords: "YUGNet, Liberia, training, mentorship, professional development, youth",
  ogImage: brand.logo.src,
};

export function parseContent(json: string | null | undefined, fallback: ContentMap): ContentMap {
  if (!json) return { ...fallback };
  try {
    return { ...fallback, ...(JSON.parse(json) as ContentMap) };
  } catch {
    return { ...fallback };
  }
}

export function pagePathFor(page: string) {
  if (page === "home") return "/";
  return `/${page}`;
}
