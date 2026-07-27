import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "flag";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-deep shadow-[0_10px_24px_rgba(10,92,50,0.28)]",
  secondary:
    "bg-white text-brand border border-brand/25 hover:border-brand hover:bg-brand-mist",
  ghost: "bg-transparent text-brand hover:bg-brand-mist",
  flag: "bg-flag-blue text-white hover:bg-[#001f52]",
};

type Common = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
};

export function ButtonLink({
  href,
  children,
  className = "",
  variant = "primary",
}: Common & { href: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold tracking-wide transition duration-200 ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Button({
  children,
  className = "",
  variant = "primary",
  type = "button",
  disabled,
  ...rest
}: Common &
  ButtonHTMLAttributes<HTMLButtonElement> & { type?: "button" | "submit" }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold tracking-wide transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
