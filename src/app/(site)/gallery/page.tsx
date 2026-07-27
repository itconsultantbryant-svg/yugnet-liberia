import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { brand } from "@/lib/brand";
import { galleryAlbums } from "@/lib/org-content";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from YUGNet-Liberia programs, events, and community impact.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Moments"
        title="Gallery"
        description="A visual window into recruitment drives, mentorship circles, community action, and celebrations."
      />
      <Section>
        <SectionHeading
          title="From the field"
          description="Placeholder albums — replace with photos from the Media Library as they are uploaded."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryAlbums.map((album, i) => (
            <figure
              key={album.title}
              className="overflow-hidden rounded-2xl border border-line bg-white"
            >
              <div
                className="flex aspect-[4/3] items-end p-5 text-white"
                style={{
                  backgroundImage: `
                    linear-gradient(160deg, rgba(0,61,34,0.55), rgba(10,92,50,0.85)),
                    url(${brand.logo.src})
                  `,
                  backgroundSize: "cover, 140%",
                  backgroundPosition: `center, ${20 + i * 12}% ${30 + i * 8}%`,
                }}
              >
                <figcaption>
                  <p className="font-display text-lg font-bold">{album.title}</p>
                  <p className="mt-1 text-sm text-white/80">{album.caption}</p>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </Section>
    </>
  );
}
