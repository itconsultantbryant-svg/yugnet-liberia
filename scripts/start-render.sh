#!/usr/bin/env bash
# Render start entrypoint — migrate then boot Next.js.
set -euo pipefail

if [[ -n "${DATABASE_URL_EXTERNAL:-}" ]]; then
  export DATABASE_URL="$DATABASE_URL_EXTERNAL"
  echo "Using DATABASE_URL_EXTERNAL (cross-region / public Postgres URL)."
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not set."
  exit 1
fi

# External Render hosts require SSL.
case "$DATABASE_URL" in
  *render.com*)
    if [[ "$DATABASE_URL" != *"sslmode="* ]]; then
      if [[ "$DATABASE_URL" == *"?"* ]]; then
        export DATABASE_URL="${DATABASE_URL}&sslmode=require"
      else
        export DATABASE_URL="${DATABASE_URL}?sslmode=require"
      fi
    fi
    ;;
esac

echo "Running prisma migrate deploy…"
if ! npx prisma migrate deploy; then
  cat <<'EOF'

Prisma could not reach Postgres (P1001 is common here).

Fix in Render Dashboard:
1. Open your Postgres instance → Connect
2. Copy the External Database URL (host ends with .render.com)
3. Web service → Environment → set:
     DATABASE_URL_EXTERNAL = <paste External URL>
   OR replace DATABASE_URL with that External URL
4. Ensure the DB is Available (not suspended)
5. Prefer the same region for Web + Postgres (e.g. both Frankfurt)
6. Manual Deploy → Deploy latest commit

EOF
  exit 1
fi

echo "Starting Next.js…"
exec npm run start
