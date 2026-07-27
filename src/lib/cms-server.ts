import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { CMS_SECTIONS, DEFAULT_SEO, parseContent, pagePathFor, type ContentMap } from "@/lib/cms";

/**
 * CMS reads must never throw during `next build`.
 * Render (and Vercel) cannot reach Render Postgres over the private hostname
 * at build time — only at runtime.
 */
export async function getPageContent(page: string) {
  const defs = CMS_SECTIONS.filter((s) => s.page === page);
  try {
    const rows = await prisma.contentBlock.findMany({ where: { page } });
    const byKey = Object.fromEntries(rows.map((r) => [r.sectionKey, r]));
    const sections: Record<string, ContentMap> = {};
    for (const def of defs) {
      sections[def.sectionKey] = parseContent(
        byKey[def.sectionKey]?.contentJson,
        def.defaults,
      );
    }
    return sections;
  } catch {
    const sections: Record<string, ContentMap> = {};
    for (const def of defs) {
      sections[def.sectionKey] = { ...def.defaults };
    }
    return sections;
  }
}

export async function getSectionContent(page: string, sectionKey: string): Promise<ContentMap> {
  const def = CMS_SECTIONS.find((s) => s.page === page && s.sectionKey === sectionKey);
  const fallback = def?.defaults ?? {};
  try {
    const row = await prisma.contentBlock.findUnique({
      where: { page_sectionKey: { page, sectionKey } },
    });
    return parseContent(row?.contentJson, fallback);
  } catch {
    return { ...fallback };
  }
}

export async function getSeoSettings() {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "seo" } });
    if (!row) return { ...DEFAULT_SEO };
    return { ...DEFAULT_SEO, ...(JSON.parse(row.valueJson) as typeof DEFAULT_SEO) };
  } catch {
    return { ...DEFAULT_SEO };
  }
}

export async function getPublishedTestimonials() {
  try {
    return await prisma.testimonial.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    return [];
  }
}

export function revalidatePublicPaths(page?: string) {
  if (page) {
    revalidatePath(pagePathFor(page));
  } else {
    for (const p of ["home", "about", "services", "portfolio", "contact"]) {
      revalidatePath(pagePathFor(p));
    }
  }
  revalidatePath("/");
}

export async function notifyAdmins(message: string, link?: string) {
  try {
    const admins = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        role: { permissions: { some: { permission: { key: "content.manage" } } } },
      },
      select: { id: true },
    });
    if (!admins.length) return;
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        type: "content",
        message,
        link: link ?? null,
      })),
    });
  } catch {
    // Non-fatal — never break a write path over notifications
  }
}
