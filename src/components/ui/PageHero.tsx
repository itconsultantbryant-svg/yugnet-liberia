import { Logo } from "@/components/brand/Logo";

export function PageHero({
  title,
  description,
  eyebrow,
}: {
  title: string;
  description: string;
  eyebrow?: string;
}) {
  return (
    <div className="relative overflow-hidden border-b border-line bg-brand-deep text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 85% 20%, rgba(26,154,60,0.45), transparent 40%), radial-gradient(circle at 10% 80%, rgba(191,10,48,0.2), transparent 35%)",
        }}
      />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-16">
        <div className="max-w-xl animate-rise">
          {eyebrow && (
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-brand-leaf">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base text-white/80 sm:text-lg">{description}</p>
          <div className="flag-rule mt-6 max-w-[10rem]" aria-hidden />
        </div>
        <div className="shrink-0 self-start sm:self-center">
          <Logo size="lg" href={false} className="brightness-110" />
        </div>
      </div>
    </div>
  );
}
