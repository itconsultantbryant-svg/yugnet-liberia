import type { Metadata } from "next";
import { Sora, Source_Sans_3 } from "next/font/google";
import { brand } from "@/lib/brand";
import { getSeoSettings } from "@/lib/cms-server";
import "./globals.css";

/** CMS + training pages need the DB at request time, not during `next build`. */
export const dynamic = "force-dynamic";

const display = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = Source_Sans_3({
  variable: "--font-source",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: {
      default: seo.siteTitle,
      template: `%s | ${brand.name}`,
    },
    description: seo.siteDescription,
    keywords: seo.keywords,
    icons: {
      icon: brand.logo.src,
      apple: brand.logo.src,
    },
    openGraph: {
      title: seo.siteTitle,
      description: seo.siteDescription,
      images: [seo.ogImage || brand.logo.src],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
