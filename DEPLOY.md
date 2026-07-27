# Deploy: Vercel (frontend) + Render (backend)

YUGNet-Liberia is prepared for a **split deploy** tuned for Liberian mobile networks (Lonestar, Orange, and others).

## Architecture

```
Browser (Lonestar / Orange / Wi‑Fi)
        │
        │  HTTPS — single origin (recommended)
        ▼
 Vercel  ─────────── pages, RSC, static assets
   │
   │  middleware rewrite /api/* and /uploads/*
   ▼
 Render  ─────────── API routes, auth cookies, media disk
   │
   ▼
 Postgres (Render)
```

**Why this shape for Lonestar / Orange**

- Browsers talk only to the **Vercel hostname** (your custom domain). No cross-site cookies.
- Cross-origin `SameSite=None` + CORS often fails or is flaky on mobile browsers and captive portals.
- Cold starts on free Render instances exceed typical mobile timeouts — use **Starter** (or cron keepalive).
- Frankfurt (`fra1` / Render `frankfurt`) is a reasonable path from West Africa vs US-only regions.

## 1. Render (backend + database)

1. Push this repo to GitHub.
2. In [Render](https://dashboard.render.com) → **New** → **Blueprint** → select the repo (`render.yaml`).
3. **Existing services do not auto-update from `render.yaml`.** In the service → **Settings**, set:

| Setting | Value |
|---|---|
| Branch | `main` |
| Build Command | `npm ci --include=dev && npx prisma generate && npm run build` |
| Start Command | `npx prisma migrate deploy && npm run start` |
| Health Check Path | `/api/health` |

   Then **Manual Deploy** → **Deploy latest commit** (must show commit `b5ccf85` or newer — not `38cdb16`).

4. Set these env vars when prompted (`sync: false`):

| Variable | Example |
|---|---|
| `CORS_ORIGINS` | `https://www.your-domain.lr,https://your-app.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | `https://www.your-domain.lr` |
| Cron `HEALTH_URL` | `https://yugnet-api.onrender.com/api/health` |

5. After first deploy succeeds, seed once (Render Shell or one-off job):

```bash
npm run db:seed
```

6. Confirm health:

```bash
curl -fsS https://yugnet-api.onrender.com/api/health
```

Copy the service URL (e.g. `https://yugnet-api.onrender.com`) and the generated `AUTH_SECRET`.

**Persistent uploads:** disk mounts at `/var/data/uploads` (`UPLOAD_DIR`). Files are served at `/uploads/...`.

## 2. Vercel (frontend)

1. Import the same GitHub repo in [Vercel](https://vercel.com).
2. Framework: Next.js. Region: **Frankfurt (`fra1`)** — already in `vercel.json`.
3. Environment variables:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://www.your-domain.lr` (or your `*.vercel.app` URL) |
| `API_BACKEND_URL` | `https://yugnet-api.onrender.com` (**no trailing slash**) |
| `AUTH_SECRET` | **Same value as Render** |
| `DATABASE_URL` | **Same Postgres URL as Render** (Server Components still query the DB) |
| `COOKIE_SAMESITE` | `lax` |
| `COOKIE_SECURE` | `true` |

4. Deploy. Login/signup should hit `/api/...` on the Vercel host; middleware proxies to Render.

5. Optional custom domain on Vercel (`www.your-domain.lr`). Point DNS A/CNAME per Vercel instructions. Prefer **your own domain** over raw `*.onrender.com` / `*.vercel.app` for trust and ISP caching behavior.

## 3. Network checklist (Lonestar & Orange)

- [ ] Users open **only** the Vercel/custom domain (never ask them to use the Render URL in a browser).
- [ ] `API_BACKEND_URL` set on Vercel so `/api` and `/uploads` proxy same-origin.
- [ ] Render plan is **Starter+** (or keepalive cron every ~10 minutes).
- [ ] `curl` health from a Lonestar/Orange phone or hotspot: `https://your-frontend/api/health`.
- [ ] HTTPS only (`COOKIE_SECURE=true`).
- [ ] Avoid requiring IPv6-only endpoints; both Vercel and Render provide IPv4.
- [ ] After deploy, test login + enroll on a Lonestar SIM and an Orange SIM.

## 4. Local development

PostgreSQL is required (SQLite migrations are archived under `prisma/migrations_sqlite_archive/`).

```bash
# Homebrew Postgres (already common on macOS) or:
# docker compose up -d

createdb yugnet   # once
cp .env.example .env
# set DATABASE_URL=postgresql://USER@localhost:5432/yugnet?schema=public
# set AUTH_SECRET=...

npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Do **not** set `API_BACKEND_URL` locally — the Next.js app serves its own API.

## 5. One-time seed & demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@yugnet.lr` | `Admin123!` |
| Instructor | `instructor@yugnet.lr` | `Teach123!` |
| Student | `student@yugnet.lr` | `Learn123!` |

Change these passwords after the first production seed.

## 6. Troubleshooting

| Symptom | Likely cause |
|---|---|
| `/api/health` 503 | `DATABASE_URL` wrong or Postgres not ready |
| Login works on Wi‑Fi, fails on Lonestar | Hitting Render URL cross-origin, or free-tier cold start |
| 401 after login on Vercel | `AUTH_SECRET` mismatch between Vercel and Render |
| Uploads 404 | Disk not mounted / `UPLOAD_DIR` unset on Render |
| Portal redirect loop | Cookie not set (`COOKIE_SECURE` on http) or proxy not forwarding `Set-Cookie` |

Same-origin bridging is implemented in `src/proxy.ts` (Next.js 16 Proxy). Set `API_BACKEND_URL` only on **Vercel**.

If external rewrite does not forward cookies in your Next.js version, keep a **single** public hostname on Render until you add an explicit Node reverse proxy.
