import { AuthProvider } from "@/components/auth/AuthProvider";
import { PortalShell } from "@/components/layout/PortalShell";
import { requirePortalAccess } from "@/lib/portal-guard";

const nav = [
  { href: "/student", label: "Dashboard" },
  { href: "/student/courses", label: "My Courses", permission: "courses.view" as const },
  { href: "/student/grades", label: "Grades", permission: "grades.view_own" as const },
  { href: "/student/attendance", label: "Attendance", permission: "attendance.view_own" as const },
  { href: "/student/classes", label: "Online Classes", permission: "classes.join" as const },
  { href: "/student/certificates", label: "Certificates" },
  { href: "/student/profile", label: "Profile" },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePortalAccess("portal.student");

  return (
    <AuthProvider initialUser={session}>
      <PortalShell role="Student" nav={nav}>
        {children}
      </PortalShell>
    </AuthProvider>
  );
}
