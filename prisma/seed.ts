import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CMS_SECTIONS, DEFAULT_SEO } from "../src/lib/cms";
import { PERMISSIONS, ROLE_DEFAULTS } from "../src/lib/permissions";

const prisma = new PrismaClient();

async function main() {
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: {
        module: perm.module,
        action: perm.action,
        description: perm.description,
      },
      create: {
        key: perm.key,
        module: perm.module,
        action: perm.action,
        description: perm.description,
      },
    });
  }

  const allPerms = await prisma.permission.findMany();
  const byKey = Object.fromEntries(allPerms.map((p) => [p.key, p.id]));

  for (const [roleName, keys] of Object.entries(ROLE_DEFAULTS)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {
        description: `${roleName} default role`,
        isSystem: true,
      },
      create: {
        name: roleName,
        description: `${roleName} default role`,
        isSystem: true,
      },
    });

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: keys.map((key) => ({
        roleId: role.id,
        permissionId: byKey[key],
      })),
    });
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: "Admin" } });
  const instructorRole = await prisma.role.findUniqueOrThrow({
    where: { name: "Instructor" },
  });
  const studentRole = await prisma.role.findUniqueOrThrow({ where: { name: "Student" } });

  const users = [
    {
      email: "admin@yugnet.lr",
      name: "System Admin",
      roleId: adminRole.id,
      password: "Admin123!",
    },
    {
      email: "instructor@yugnet.lr",
      name: "Demo Instructor",
      roleId: instructorRole.id,
      password: "Teach123!",
    },
    {
      email: "student@yugnet.lr",
      name: "Demo Student",
      roleId: studentRole.id,
      password: "Learn123!",
    },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        roleId: u.roleId,
        passwordHash,
        status: "ACTIVE",
      },
      create: {
        email: u.email,
        name: u.name,
        roleId: u.roleId,
        passwordHash,
        status: "ACTIVE",
      },
    });
  }

  for (const section of CMS_SECTIONS) {
    await prisma.contentBlock.upsert({
      where: {
        page_sectionKey: { page: section.page, sectionKey: section.sectionKey },
      },
      update: {},
      create: {
        page: section.page,
        sectionKey: section.sectionKey,
        label: section.label,
        contentJson: JSON.stringify(section.defaults),
      },
    });
  }

  await prisma.siteSetting.upsert({
    where: { key: "seo" },
    update: {},
    create: { key: "seo", valueJson: JSON.stringify(DEFAULT_SEO) },
  });

  const testimonialCount = await prisma.testimonial.count();
  if (testimonialCount === 0) {
    await prisma.testimonial.createMany({
      data: [
        {
          name: "Grace K.",
          role: "Leadership Foundations graduate",
          quote:
            "YUGNet mentorship gave me clarity and confidence to lead in my community.",
          published: true,
          sortOrder: 1,
        },
        {
          name: "James T.",
          role: "Digital Skills cohort",
          quote:
            "Practical training that connected directly to opportunities at work.",
          published: true,
          sortOrder: 2,
        },
      ],
    });
  }

  // Phase 4 — categories, instructors, courses
  const categorySeeds = [
    { name: "Leadership", slug: "leadership" },
    { name: "Digital Skills", slug: "digital-skills" },
    { name: "Project Management", slug: "project-management" },
  ];
  for (const cat of categorySeeds) {
    await prisma.courseCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
  }

  const instructorUser = await prisma.user.findUnique({
    where: { email: "instructor@yugnet.lr" },
  });

  const instructorA = await prisma.instructor.upsert({
    where: { userId: instructorUser!.id },
    update: {
      name: "Demo Instructor",
      email: "instructor@yugnet.lr",
      bio: "Experienced facilitator focused on youth leadership and workplace readiness across Liberia.",
      credentials: "M.Ed. · Certified Professional Trainer",
      specialties: "Leadership, Mentorship",
      published: true,
    },
    create: {
      userId: instructorUser!.id,
      name: "Demo Instructor",
      email: "instructor@yugnet.lr",
      bio: "Experienced facilitator focused on youth leadership and workplace readiness across Liberia.",
      credentials: "M.Ed. · Certified Professional Trainer",
      specialties: "Leadership, Mentorship",
      published: true,
    },
  });

  let instructorB = await prisma.instructor.findFirst({
    where: { email: "amina@yugnet.lr" },
  });
  if (!instructorB) {
    instructorB = await prisma.instructor.create({
      data: {
        name: "Amina Kollie",
        email: "amina@yugnet.lr",
        bio: "Digital skills coach helping professionals adopt practical workplace tools.",
        credentials: "BSc Information Systems",
        specialties: "Digital workplace, Communication",
        published: true,
      },
    });
  }

  const leadership = await prisma.courseCategory.findUniqueOrThrow({
    where: { slug: "leadership" },
  });
  const digital = await prisma.courseCategory.findUniqueOrThrow({
    where: { slug: "digital-skills" },
  });
  const projects = await prisma.courseCategory.findUniqueOrThrow({
    where: { slug: "project-management" },
  });

  const courseSeeds = [
    {
      title: "Leadership Foundations",
      slug: "leadership-foundations",
      categoryId: leadership.id,
      description:
        "Core habits of leading teams and community initiatives with integrity.",
      syllabus:
        "Week 1: Self-leadership\nWeek 2: Communication\nWeek 3: Team dynamics\nWeek 4: Conflict & care\nWeek 5: Vision casting\nWeek 6: Capstone",
      level: "Foundational",
      duration: "6 weeks",
      schedule: "Evenings · Hybrid",
      price: 0,
      capacity: 30,
      status: "PUBLISHED",
      instructorIds: [instructorA.id],
    },
    {
      title: "Digital Workplace Skills",
      slug: "digital-workplace-skills",
      categoryId: digital.id,
      description:
        "Practical digital tools for communication, collaboration, and delivery.",
      syllabus:
        "Week 1: Productivity basics\nWeek 2: Documents & collaboration\nWeek 3: Presentations\nWeek 4: Capstone project",
      level: "Intermediate",
      duration: "4 weeks",
      schedule: "Weekends",
      price: 50,
      capacity: 25,
      status: "PUBLISHED",
      instructorIds: [instructorB.id],
    },
    {
      title: "Project Management Essentials",
      slug: "project-management-essentials",
      categoryId: projects.id,
      description:
        "Plan, track, and close projects with clear milestones and accountability.",
      syllabus:
        "Week 1: Initiation\nWeek 2: Planning\nWeek 3–6: Execution rhythms\nWeek 7: Monitoring\nWeek 8: Closeout",
      level: "Intermediate",
      duration: "8 weeks",
      schedule: "Hybrid",
      price: 75,
      capacity: 20,
      status: "PUBLISHED",
      instructorIds: [instructorA.id, instructorB.id],
    },
  ];

  const courseBySlug: Record<string, string> = {};
  for (const seed of courseSeeds) {
    const { instructorIds, ...data } = seed;
    const course = await prisma.course.upsert({
      where: { slug: data.slug },
      update: {
        title: data.title,
        categoryId: data.categoryId,
        description: data.description,
        syllabus: data.syllabus,
        level: data.level,
        duration: data.duration,
        schedule: data.schedule,
        price: data.price,
        capacity: data.capacity,
        status: data.status,
      },
      create: data,
    });
    courseBySlug[course.slug] = course.id;
    await prisma.courseInstructor.deleteMany({ where: { courseId: course.id } });
    await prisma.courseInstructor.createMany({
      data: instructorIds.map((instructorId) => ({
        courseId: course.id,
        instructorId,
      })),
    });
  }

  // Phase 5 — demo student profile + sample enrollment
  const demoStudentUser = await prisma.user.findUniqueOrThrow({
    where: { email: "student@yugnet.lr" },
  });
  const demoStudent = await prisma.student.upsert({
    where: { userId: demoStudentUser.id },
    update: { address: "Monrovia, Liberia" },
    create: {
      userId: demoStudentUser.id,
      address: "Monrovia, Liberia",
    },
  });
  await prisma.enrollment.upsert({
    where: {
      studentId_courseId: {
        studentId: demoStudent.id,
        courseId: courseBySlug["leadership-foundations"],
      },
    },
    update: { status: "ACTIVE", source: "ADMIN" },
    create: {
      studentId: demoStudent.id,
      courseId: courseBySlug["leadership-foundations"],
      status: "ACTIVE",
      source: "ADMIN",
    },
  });

  console.log("Seed complete.");
  console.log("Demo accounts:");
  for (const u of users) {
    console.log(`  ${u.email} / ${u.password} (${u.email.split("@")[0]})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
