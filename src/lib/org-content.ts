import { brand } from "@/lib/brand";

/** Canonical YUGNet-Liberia public content (org site — not Training LMS). */

export const impactStats = [
  { value: "2,500+", label: "Youth reached" },
  { value: "45+", label: "Community programs" },
  { value: "30+", label: "Partner organizations" },
  { value: "17", label: "SDG alignments" },
] as const;

export const programs = [
  {
    slug: "youth-recruitment",
    title: "Youth Recruitment & Leadership",
    summary:
      "Identifying and welcoming motivated Liberian youth into pathways of service, skills, and civic leadership.",
    body: "Through outreach in schools, communities, and faith networks, YUGNet-Liberia recruits young people ready to grow — then walks with them through mentorship and leadership practice aligned to our Recruit · Mentor · Empower · Lead mandate.",
  },
  {
    slug: "mentorship",
    title: "Mentorship Circles",
    summary:
      "Pairing learners with experienced guides who invest in character, craft, and career clarity.",
    body: "Mentorship Circles connect youth with professionals and community leaders. Sessions focus on goal-setting, values, soft skills, and navigating opportunities in Liberia’s evolving economy.",
  },
  {
    slug: "community-empowerment",
    title: "Community Empowerment",
    summary:
      "Local action projects that strengthen neighborhoods while building youth agency and teamwork.",
    body: "From sanitation drives to peer education and peacebuilding dialogues, our community empowerment work turns learning into visible local impact — always with youth at the center of design and delivery.",
  },
  {
    slug: "sdg-advocacy",
    title: "SDG Awareness & Advocacy",
    summary:
      "Educating communities on the Sustainable Development Goals and mobilizing youth as SDG champions.",
    body: "Our emblem’s SDG ring is more than branding. We run workshops, campaigns, and school clubs that help Liberians connect global goals to local realities — climate, education, gender equality, and decent work.",
  },
  {
    slug: "professional-development",
    title: "Professional Development Training",
    summary:
      "Structured courses for workplace readiness, leadership, and digital skills — hosted in our Training Hub.",
    body: "Beyond community programs, YUGNet-Liberia offers professional development courses with enrollment, attendance, and certification. Explore the dedicated Training Hub for catalogs, lecturers, and student accounts.",
    href: "/training",
  },
] as const;

export const projects = [
  {
    slug: "monrovia-youth-leadership-lab",
    title: "Monrovia Youth Leadership Lab",
    location: "Montserrado County",
    status: "Active",
    summary:
      "A multi-cohort leadership lab equipping urban youth to design and run community micro-initiatives.",
  },
  {
    slug: "girls-in-stem-mentor-network",
    title: "Girls in STEM Mentor Network",
    location: "Monrovia & surrounds",
    status: "Active",
    summary:
      "Mentorship and exposure visits connecting young women with STEM professionals and learning pathways.",
  },
  {
    slug: "peace-and-civic-dialogues",
    title: "Peace & Civic Dialogues",
    location: "Multi-county",
    status: "Completed",
    summary:
      "Facilitated youth dialogues on peacebuilding, civic responsibility, and inclusive community decision-making.",
  },
  {
    slug: "green-schools-campaign",
    title: "Green Schools Campaign",
    location: "Selected partner schools",
    status: "Active",
    summary:
      "Tree planting, waste education, and climate clubs that make environmental stewardship tangible for students.",
  },
] as const;

export const newsItems = [
  {
    slug: "leadership-lab-cohort-3",
    title: "Leadership Lab Cohort 3 graduates in Monrovia",
    date: "2026-06-12",
    category: "Programs",
    excerpt:
      "Thirty young leaders completed a six-week intensive on team leadership, project design, and community accountability.",
  },
  {
    slug: "partner-briefing-sdg-education",
    title: "Partner briefing: advancing SDG 4 with school clubs",
    date: "2026-05-28",
    category: "Partners",
    excerpt:
      "YUGNet-Liberia hosted education partners to share progress on quality education clubs and youth facilitator training.",
  },
  {
    slug: "volunteer-weekend-paynesville",
    title: "Volunteer weekend strengthens Paynesville clean-up drive",
    date: "2026-04-19",
    category: "Community",
    excerpt:
      "Youth volunteers and local leaders joined a sanitation and awareness weekend reaching hundreds of households.",
  },
] as const;

export const events = [
  {
    slug: "youth-summit-2026",
    title: "YUGNet Youth Summit 2026",
    date: "2026-08-15",
    time: "09:00 AM",
    venue: "Monrovia, Liberia",
    summary:
      "A one-day gathering of youth leaders, mentors, and partners to share impact stories and set shared priorities.",
  },
  {
    slug: "mentorship-open-house",
    title: "Mentorship Open House",
    date: "2026-09-05",
    time: "04:00 PM",
    venue: "YUGNet Community Hub",
    summary:
      "Meet mentors, learn how Mentorship Circles work, and register interest for the next placement cycle.",
  },
  {
    slug: "sdg-school-tour",
    title: "SDG School Tour — Kickoff",
    date: "2026-09-20",
    time: "10:00 AM",
    venue: "Partner schools, Montserrado",
    summary:
      "Launch visit introducing SDG club toolkits and peer-educator training to partner secondary schools.",
  },
] as const;

export const resources = [
  {
    title: "YUGNet Mentorship Guide (PDF)",
    type: "Guide",
    summary: "Practical outline for mentors and mentees in YUGNet Mentorship Circles.",
  },
  {
    title: "SDG Youth Club Starter Kit",
    type: "Toolkit",
    summary: "Session ideas, roles, and activity cards for school-based SDG clubs.",
  },
  {
    title: "Community Project Planning Worksheet",
    type: "Worksheet",
    summary: "A simple planning sheet youth teams use to design local micro-initiatives.",
  },
  {
    title: "Partner Engagement Brief",
    type: "Brief",
    summary: "How organizations can sponsor cohorts, host workshops, or co-deliver programs.",
  },
] as const;

export const partners = [
  {
    name: "Community Faith Networks",
    role: "Outreach & venues",
    summary: "Congregations and youth fellowships that help us recruit and host safe gathering spaces.",
  },
  {
    name: "Secondary School Partners",
    role: "Education access",
    summary: "Schools hosting leadership clubs, SDG awareness sessions, and mentorship referrals.",
  },
  {
    name: "Local NGOs & CSOs",
    role: "Program collaboration",
    summary: "Civil society partners co-delivering peacebuilding, livelihoods, and health education activities.",
  },
  {
    name: "Private Sector Mentors",
    role: "Skills & careers",
    summary: "Professionals volunteering time as mentors and guest facilitators for workplace readiness.",
  },
] as const;

export const careers = [
  {
    title: "Program Coordinator (Youth Engagement)",
    type: "Full-time",
    location: "Monrovia",
    summary:
      "Coordinate recruitment, cohort logistics, and partner communication across Mentorship Circles and Leadership Lab.",
  },
  {
    title: "Communications & Storytelling Intern",
    type: "Internship",
    location: "Monrovia / Hybrid",
    summary:
      "Capture impact stories, support social media, and help maintain the news and gallery pipelines.",
  },
  {
    title: "Volunteer Facilitator — Community Workshops",
    type: "Volunteer",
    location: "Multi-county",
    summary:
      "Facilitate weekend workshops on leadership, civic participation, and SDG awareness with youth groups.",
  },
] as const;

export const galleryAlbums = [
  {
    title: "Leadership Lab in session",
    caption: "Cohort discussions and team challenges in Monrovia.",
  },
  {
    title: "Community clean-up weekend",
    caption: "Youth volunteers serving alongside local leaders.",
  },
  {
    title: "Mentorship circle meetup",
    caption: "Mentors and mentees setting goals together.",
  },
  {
    title: "SDG awareness workshop",
    caption: "Students exploring the 17 goals through interactive stations.",
  },
  {
    title: "Partner appreciation gathering",
    caption: "Recognizing organizations investing in Liberian youth.",
  },
  {
    title: "Graduation & celebration",
    caption: "Families and facilitators celebrating learner milestones.",
  },
] as const;

export const aboutHighlights = [
  "Youth-centered programming rooted in Liberian communities",
  "Mentorship that builds character and practical skill",
  "Partnerships that unlock opportunity without leaving youth behind",
  "Alignment with the UN Sustainable Development Goals",
] as const;

export const homeAbout = {
  eyebrow: "About us",
  title: "Helping each other can make Liberia stronger",
  body: `${brand.legalName} exists to close the gap between ambition and opportunity. We recruit youth, walk with them through mentorship, empower them with skills and community action, and prepare them to lead lasting change.`,
};
