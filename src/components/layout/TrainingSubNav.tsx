"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { trainingNav } from "@/lib/brand";

export function TrainingSubNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-line bg-white/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">
          Training Hub · courses, enrollment & student access
        </p>
        <nav className="flex gap-1 overflow-x-auto pb-1" aria-label="Training">
          {trainingNav.map((item) => {
            const active =
              item.href === "/training"
                ? pathname === "/training"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            const isAuth =
              item.href === "/training/login" ||
              item.href === "/training/signup";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-brand text-white"
                    : isAuth
                      ? "border border-brand/25 text-brand hover:bg-brand-mist"
                      : "text-muted hover:bg-brand-mist hover:text-brand"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/training/courses"
            className="ml-auto whitespace-nowrap rounded-md bg-flag-red px-3 py-2 text-sm font-semibold text-white hover:bg-[#9a0826]"
          >
            Enroll Now
          </Link>
        </nav>
      </div>
    </div>
  );
}
