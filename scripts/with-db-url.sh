#!/usr/bin/env bash
# Export a usable DATABASE_URL (prefer EXTERNAL) then run the given command.
set -euo pipefail

raw="${DATABASE_URL_EXTERNAL:-${DATABASE_URL:-}}"
raw="$(printf '%s' "$raw" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")"

if [[ -z "$raw" ]]; then
  echo "ERROR: Set DATABASE_URL_EXTERNAL (preferred) or DATABASE_URL."
  exit 1
fi

case "$raw" in
  postgresql://*|postgres://*) ;;
  *)
    echo "ERROR: Database URL must start with postgresql:// or postgres://"
    echo "Got: ${raw:0:32}…"
    exit 1
    ;;
esac

if [[ "$raw" == *render.com* && "$raw" != *sslmode=* ]]; then
  if [[ "$raw" == *"?"* ]]; then
    raw="${raw}&sslmode=require"
  else
    raw="${raw}?sslmode=require"
  fi
fi

export DATABASE_URL="$raw"
exec "$@"
