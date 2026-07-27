import { redirect } from "next/navigation";
import { getSession, hasPermission } from "@/lib/auth";
import type { PermissionKey } from "@/lib/permissions";

export async function requirePortalAccess(permission: PermissionKey) {
  const session = await getSession();
  if (!session) redirect("/training/login");
  if (!hasPermission(session, permission))
    redirect("/training/login?error=forbidden");
  return session;
}
