import { NextResponse } from "next/server";
import { getSession, hasPermission, type SessionUser } from "@/lib/auth";
import type { PermissionKey } from "@/lib/permissions";

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    return { session: null as SessionUser | null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}

export async function requirePermission(permission: PermissionKey | PermissionKey[]) {
  const { session, error } = await requireSession();
  if (error) return { session: null as SessionUser | null, error };
  if (!hasPermission(session, permission)) {
    return {
      session,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { session, error: null };
}
