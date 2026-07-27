import { AuthProvider } from "@/components/auth/AuthProvider";
import { PortalShell } from "@/components/layout/PortalShell";
import { requirePortalAccess } from "@/lib/portal-guard";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/website", label: "Website Management", permission: "content.manage" as const },
  { href: "/admin/training", label: "Training Management", permission: "courses.view" as const },
  { href: "/admin/users", label: "Users", permission: "users.manage" as const },
  { href: "/admin/roles", label: "Roles & Permissions", permission: "roles.manage" as const },
  { href: "/admin/audit", label: "Audit Log", permission: "audit.view" as const },
  { href: "/admin/settings", label: "System Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePortalAccess("portal.admin");

  return (
    <AuthProvider initialUser={session}>
      <PortalShell role="Admin" nav={nav}>
        {children}
      </PortalShell>
    </AuthProvider>
  );
}
