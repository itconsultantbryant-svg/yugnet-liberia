import { AuthProvider } from "@/components/auth/AuthProvider";
import { PortalShell } from "@/components/layout/PortalShell";
import { requirePortalAccess } from "@/lib/portal-guard";

const nav = [
  { href: "/instructor", label: "Dashboard" },
  { href: "/instructor/courses", label: "My Courses", permission: "courses.view" as const },
  { href: "/instructor/attendance", label: "Attendance", permission: "attendance.mark" as const },
  { href: "/instructor/grades", label: "Grades", permission: "grades.submit" as const },
  { href: "/instructor/classes", label: "Online Classes", permission: "classes.schedule" as const },
  { href: "/instructor/profile", label: "Profile" },
];

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requirePortalAccess("portal.instructor");

  return (
    <AuthProvider initialUser={session}>
      <PortalShell role="Instructor" nav={nav}>
        {children}
      </PortalShell>
    </AuthProvider>
  );
}
