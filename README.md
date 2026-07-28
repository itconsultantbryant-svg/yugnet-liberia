# YUGNet-Liberia

Website & Professional Development Training Platform for **YUGNet-Liberia**.

## Brand

Logo source: `assets/yug-net_liberia.jpg` (copied to `public/brand/logo.jpg`).

Palette derived from the emblem:

| Token | Hex | Use |
|---|---|---|
| Brand green | `#0a5c32` | Primary actions, nav active, accents |
| Deep green | `#003d22` | Footer, hero, portal sidebar |
| Leaf green | `#1a9a3c` | Highlights, tagline |
| Ink | `#0c120e` | Body text |
| Flag red / blue | `#bf0a30` / `#002868` | Accent rules (Liberian flag) |

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- PostgreSQL (Prisma) — required for production and local
- Public site + Training hub + Admin / Instructor / Student portals

## Develop

```bash
cp .env.example .env
# Set DATABASE_URL to local Postgres and AUTH_SECRET
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy (Vercel frontend + Render backend)

See **[DEPLOY.md](./DEPLOY.md)** for the full checklist.

Summary:

| Layer | Host | Role |
|---|---|---|
| Frontend | **Vercel** (`fra1`) | Pages + same-origin proxy of `/api` & `/uploads` |
| Backend | **Render** (`frankfurt`) | API, auth, Postgres, upload disk |
| DB | Render Postgres | Shared by both via `DATABASE_URL` |

Same-origin proxying is intentional so Lonestar and Orange mobile clients are not blocked by cross-site cookies/CORS.

Blueprint: `render.yaml` · Vercel: `vercel.json`

## Phase status

- **Phase 1:** Design system, public pages, Training hub shell, portal scaffolds
- **Phase 2:** Roles, permissions, auth, user management, audit log
- **Phase 3:** Website CMS — pages/sections, media, testimonials, contact inbox, SEO
- **Phase 4:** Training courses, categories, instructors (Admin + public catalog)
- **Phase 5:** Public Training Hub enrollment — signup/login under `/training`, multi-step enroll, student dashboard
- **Phase 6 (current):** Admin students & enrollment management (roster, manual enroll, status)
- **Next:** Phase 7 — Grades, attendance, or certificates (per product roadmap)

### Demo accounts (after `npm run db:seed`)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@yugnet.lr` | `Admin123!` |
| Instructor | `instructor@yugnet.lr` | `Teach123!` |
| Student | `student@yugnet.lr` | `Learn123!` |

```bash
npm run db:deploy    # apply migrations (prod & local)
npm run db:seed      # seed roles/permissions/demo users + CMS defaults
npm run dev
```

Admin CMS: `/admin/website` (requires `content.manage`).

### Public site vs Training Hub

- **Organization site:** About, Programs, Projects, News, Events, Gallery, Resources, Partners, Careers, Contact, Donate — impact & partnerships focused.
- **Training Hub (`/training`):** courses, lecturers, verify, **signup / login / enroll** (auth CTAs only here).
