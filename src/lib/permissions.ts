/** Granular permission keys used across API + UI gating. */
export const PERMISSIONS = [
  { key: "content.manage", module: "content", action: "manage", description: "Manage website content" },
  { key: "courses.create", module: "courses", action: "create", description: "Create courses" },
  { key: "courses.edit", module: "courses", action: "edit", description: "Edit courses" },
  { key: "courses.delete", module: "courses", action: "delete", description: "Delete courses" },
  { key: "courses.view", module: "courses", action: "view", description: "View courses" },
  { key: "instructors.manage", module: "instructors", action: "manage", description: "Manage instructors" },
  { key: "students.enroll", module: "students", action: "enroll", description: "Enroll students" },
  { key: "students.edit", module: "students", action: "edit", description: "Edit student records" },
  { key: "students.view", module: "students", action: "view", description: "View student roster" },
  { key: "grades.submit", module: "grades", action: "submit", description: "Submit grades" },
  { key: "grades.approve", module: "grades", action: "approve", description: "Approve grades" },
  { key: "grades.view_own", module: "grades", action: "view_own", description: "View own grades" },
  { key: "attendance.mark", module: "attendance", action: "mark", description: "Mark attendance" },
  { key: "attendance.view", module: "attendance", action: "view", description: "View attendance records" },
  { key: "attendance.view_own", module: "attendance", action: "view_own", description: "View own attendance" },
  { key: "certificates.issue", module: "certificates", action: "issue", description: "Issue certificates" },
  { key: "certificates.verify", module: "certificates", action: "verify", description: "Verify certificates" },
  { key: "classes.schedule", module: "classes", action: "schedule", description: "Schedule online classes" },
  { key: "classes.join", module: "classes", action: "join", description: "Join online classes" },
  { key: "users.manage", module: "users", action: "manage", description: "Manage users" },
  { key: "roles.manage", module: "roles", action: "manage", description: "Manage roles & permissions" },
  { key: "audit.view", module: "audit", action: "view", description: "View audit log" },
  { key: "portal.admin", module: "portal", action: "admin", description: "Access Admin portal" },
  { key: "portal.instructor", module: "portal", action: "instructor", description: "Access Instructor portal" },
  { key: "portal.student", module: "portal", action: "student", description: "Access Student portal" },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];

export const ROLE_DEFAULTS: Record<string, PermissionKey[]> = {
  Admin: PERMISSIONS.map((p) => p.key),
  Instructor: [
    "courses.view",
    "students.view",
    "grades.submit",
    "attendance.mark",
    "attendance.view",
    "certificates.verify",
    "classes.schedule",
    "classes.join",
    "portal.instructor",
  ],
  Student: [
    "courses.view",
    "students.enroll",
    "grades.view_own",
    "attendance.view_own",
    "certificates.verify",
    "classes.join",
    "portal.student",
  ],
};

export const SESSION_COOKIE = "yugnet_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours
