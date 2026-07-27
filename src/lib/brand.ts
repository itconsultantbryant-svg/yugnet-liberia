/** Brand tokens derived from the YUGNet-Liberia logo. */
export const brand = {
  name: "YUGNet-Liberia",
  shortName: "YUGNet",
  legalName: "Youth United for Global Network — Liberia",
  tagline: "Recruit · Mentor · Empower · Lead",
  description:
    "YUGNet-Liberia recruits, mentors, empowers, and leads Liberian youth through community programs, partnerships, and sustainable development action.",
  contact: {
    email: "info@yugnetliberia.org",
    phone: "+231 000 000 000",
    address: "Monrovia, Liberia",
  },
  logo: {
    full: "/brand/logo-full.jpg",
    src: "/brand/logo.jpg",
    alt: "YUGNet-Liberia logo — globe, hands, and Liberian flag with SDG ring",
  },
  social: [
    { label: "Facebook", href: "https://facebook.com", icon: "facebook" },
    { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
    { label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
    { label: "X", href: "https://x.com", icon: "x" },
    { label: "YouTube", href: "https://youtube.com", icon: "youtube" },
  ],
  colors: {
    green: "#0a5c32",
    greenDeep: "#003d22",
    greenLeaf: "#1a9a3c",
    greenMist: "#e8f2ec",
    ink: "#0c120e",
    flagRed: "#bf0a30",
    flagBlue: "#002868",
    white: "#ffffff",
    surface: "#f2f6f3",
  },
} as const;

/** Primary public sitemap — organization presence (no auth/enroll here). */
export const publicNav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/projects", label: "Projects" },
  { href: "/news", label: "News" },
  { href: "/events", label: "Events" },
  {
    href: "/more",
    label: "More",
    children: [
      { href: "/gallery", label: "Gallery" },
      { href: "/resources", label: "Resources" },
      { href: "/partners", label: "Partners" },
      { href: "/careers", label: "Careers" },
      { href: "/training", label: "Training Hub" },
    ],
  },
  { href: "/contact", label: "Contact" },
] as const;

export const footerExplore = [
  { href: "/about", label: "About Us" },
  { href: "/programs", label: "Programs" },
  { href: "/projects", label: "Projects" },
  { href: "/news", label: "News" },
  { href: "/events", label: "Events" },
  { href: "/donate", label: "Donate" },
] as const;

export const footerEngage = [
  { href: "/partners", label: "Partners" },
  { href: "/careers", label: "Careers" },
  { href: "/resources", label: "Resources" },
  { href: "/gallery", label: "Gallery" },
  { href: "/training", label: "Training Hub" },
  { href: "/contact", label: "Contact" },
] as const;

/** Training-only navigation (auth & enrollment live here). */
export const trainingNav = [
  { href: "/training", label: "Overview" },
  { href: "/training/courses", label: "Courses" },
  { href: "/training/lecturers", label: "Our Lecturers" },
  { href: "/training/verify", label: "Verify Certificate" },
  { href: "/training/faqs", label: "FAQs" },
  { href: "/training/signup", label: "Signup" },
  { href: "/training/login", label: "Login" },
] as const;
