import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/brand";

type LogoProps = {
  /** Pass `false` to render the mark without a link. */
  href?: string | false;
  size?: "sm" | "md" | "lg" | "hero";
  priority?: boolean;
  className?: string;
  showWordmark?: boolean;
};

const sizes = {
  sm: { box: "h-11 w-11", img: 44 },
  md: { box: "h-14 w-14", img: 56 },
  lg: { box: "h-[4.5rem] w-[4.5rem]", img: 72 },
  hero: { box: "h-[min(72vw,22rem)] w-[min(72vw,22rem)]", img: 360 },
} as const;

export function Logo({
  href = "/",
  size = "md",
  priority = false,
  className = "",
  showWordmark = false,
}: LogoProps) {
  const dim = sizes[size];
  const mark = (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span
        className={`relative ${dim.box} shrink-0 overflow-hidden rounded-full bg-white shadow-[0_0_0_2px_rgba(10,92,50,0.12)]`}
      >
        <Image
          src={brand.logo.src}
          alt={brand.logo.alt}
          width={dim.img}
          height={dim.img}
          priority={priority}
          className="h-full w-full object-cover"
        />
      </span>
      {showWordmark && (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl">
            {brand.name}
          </span>
          <span className="hidden text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-brand sm:block">
            {brand.tagline}
          </span>
        </span>
      )}
    </span>
  );

  if (href === false) return mark;

  return (
    <Link
      href={href || "/"}
      className="group inline-flex focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
      aria-label={`${brand.name} home`}
    >
      {mark}
    </Link>
  );
}

/** Full circular emblem for hero / splash usage */
export function LogoHero({ className = "" }: { className?: string }) {
  return (
    <div className={`relative animate-logo animate-drift ${className}`}>
      <div className="absolute inset-[-6%] rounded-full bg-[radial-gradient(circle,rgba(26,154,60,0.22),transparent_65%)]" />
      <div className="relative overflow-hidden rounded-full shadow-[0_24px_60px_rgba(0,61,34,0.28)] ring-4 ring-white/80">
        <Image
          src={brand.logo.src}
          alt={brand.logo.alt}
          width={420}
          height={420}
          priority
          className="h-auto w-full max-w-[min(72vw,22rem)] object-cover"
        />
      </div>
    </div>
  );
}
