/**
 * Prefer DATABASE_URL_EXTERNAL on Render when Internal host is unreachable
 * (cross-region / Shell sessions that still have the private dpg-…-a URL).
 */
export function resolveDatabaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  let url = (env.DATABASE_URL_EXTERNAL || env.DATABASE_URL || "").trim();
  if (!url) return undefined;

  // Strip accidental wrapping quotes from dashboard paste
  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1).trim();
  }

  if (url.startsWith("psql ")) {
    url = url.replace(/^psql\s+'?/, "").replace(/'?$/, "").trim();
  }

  if (
    url.includes("render.com") &&
    !url.includes("sslmode=") &&
    (url.startsWith("postgresql://") || url.startsWith("postgres://"))
  ) {
    url += url.includes("?") ? "&sslmode=require" : "?sslmode=require";
  }

  return url;
}

/** Mutates process.env.DATABASE_URL when an External URL is available. */
export function applyDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string | undefined {
  const resolved = resolveDatabaseUrl(env);
  if (resolved) {
    env.DATABASE_URL = resolved;
  }
  return resolved;
}
