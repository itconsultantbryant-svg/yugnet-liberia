#!/usr/bin/env bash
# Render start entrypoint — migrate then boot Next.js.
set -euo pipefail

redact_url() {
  # postgresql://user:password@host/db → postgresql://user:***@host/db
  echo "$1" | sed -E 's#(postgres(ql)?://[^:/]+:)[^@]+@#\1***@#'
}

normalize_db_url() {
  local raw="$1"
  # Trim whitespace and surrounding quotes (common Render paste mistake)
  raw="$(printf '%s' "$raw" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")"

  # If someone pasted a psql CLI invocation, extract the URL argument
  if [[ "$raw" == psql\ * ]]; then
    raw="$(printf '%s' "$raw" | sed -E "s/^psql[[:space:]]+'?//; s/'?[[:space:]]*$//")"
  fi

  printf '%s' "$raw"
}

if [[ -n "${DATABASE_URL_EXTERNAL:-}" ]]; then
  export DATABASE_URL="$(normalize_db_url "$DATABASE_URL_EXTERNAL")"
  echo "Using DATABASE_URL_EXTERNAL → $(redact_url "$DATABASE_URL")"
elif [[ -n "${DATABASE_URL:-}" ]]; then
  export DATABASE_URL="$(normalize_db_url "$DATABASE_URL")"
  echo "Using DATABASE_URL → $(redact_url "$DATABASE_URL")"
else
  echo "ERROR: DATABASE_URL is not set."
  exit 1
fi

case "$DATABASE_URL" in
  postgresql://*|postgres://*)
    ;;
  *)
    cat <<EOF
ERROR: DATABASE_URL must start with postgresql:// or postgres://
Got: $(redact_url "$DATABASE_URL")

In Render → Postgres → Connect, copy **External Database URL** exactly.
Example shape:
  postgresql://yugnet:PASSWORD@dpg-XXXX.REGION-postgres.render.com/yugnet

Do NOT paste only the hostname, the PSQL command, or values wrapped in extra quotes.
EOF
    exit 1
    ;;
esac

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

Prisma migrate failed.

If you saw P1012: DATABASE_URL_EXTERNAL is not a full URL — re-copy External Database URL.
If you saw P1001: host unreachable — use External URL, same region, DB Available.

Render Dashboard checklist:
1. Postgres → Connect → External Database URL (starts with postgresql://)
2. Web service → Environment → DATABASE_URL_EXTERNAL = that full URL
3. Postgres status = Available
4. Manual Deploy → Deploy latest commit
EOF
  exit 1
fi

echo "Starting Next.js…"
exec npm run start
