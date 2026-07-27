import type { ReactNode } from "react";

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 ${className}`}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-10 max-w-2xl">
      {eyebrow && (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-brand">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">{title}</h2>
      {description && (
        <p className="mt-3 text-base text-muted sm:text-lg">{description}</p>
      )}
    </div>
  );
}
