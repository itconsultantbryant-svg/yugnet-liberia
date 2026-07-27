"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Can, useAuth } from "@/components/auth/AuthProvider";
import { brand } from "@/lib/brand";
import type { PermissionKey } from "@/lib/permissions";

export type PortalNavItem = {
  href: string;
  label: string;
  permission?: PermissionKey | PermissionKey[];
};

type Notification = {
  id: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

function breadcrumbFromPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((part, i) => ({
    label: part.replace(/-/g, " "),
    href: "/" + parts.slice(0, i + 1).join("/"),
  }));
}

export function PortalShell({
  role,
  nav,
  children,
}: {
  role: "Admin" | "Instructor" | "Student";
  nav: PortalNavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout, can } = useAuth();
  const [openNotifs, setOpenNotifs] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const visibleNav = nav.filter((item) =>
    item.permission ? can(item.permission) : true,
  );
  const crumbs = breadcrumbFromPath(pathname);

  async function loadNotifications() {
    const res = await fetch("/api/notifications", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setNotifications(data.notifications ?? []);
    setUnread(data.unread ?? 0);
  }

  useEffect(() => {
    void loadNotifications();
    const id = window.setInterval(() => void loadNotifications(), 20_000);
    return () => window.clearInterval(id);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    await loadNotifications();
  }

  return (
    <div className="flex min-h-full bg-surface">
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-line bg-brand-deep text-white md:flex">
        <div className="border-b border-white/10 px-4 py-5">
          <Logo size="sm" href="/" className="[&_img]:brightness-105" />
          <p className="mt-3 font-display text-sm font-bold">{brand.name}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-brand-leaf">{role} Portal</p>
          {user && <p className="mt-2 truncate text-xs text-white/70">{user.name}</p>}
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label={`${role} sidebar`}>
          {visibleNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full rounded-md bg-white/10 px-3 py-2 text-left text-sm font-semibold text-white hover:bg-white/15"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex items-center gap-3 md:hidden">
              <Logo size="sm" href="/" />
              <span className="font-display text-sm font-bold text-ink">{role}</span>
            </div>
            <nav className="hidden min-w-0 items-center gap-1 text-sm capitalize text-muted md:flex" aria-label="Breadcrumb">
              {crumbs.map((c, i) => (
                <span key={c.href} className="flex items-center gap-1">
                  {i > 0 && <span aria-hidden>/</span>}
                  <Link
                    href={c.href}
                    className={i === crumbs.length - 1 ? "font-semibold text-ink" : "hover:text-brand"}
                  >
                    {c.label}
                  </Link>
                </span>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Can permission="portal.admin">
              <Link href="/admin" className="hidden text-xs font-semibold text-brand hover:underline sm:inline">
                Admin
              </Link>
            </Can>
            <Link href="/" className="text-sm font-semibold text-brand hover:underline">
              Public site
            </Link>

            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => {
                  setOpenNotifs((v) => !v);
                  setOpenProfile(false);
                }}
                className="relative rounded-md border border-line px-2.5 py-1.5 text-sm font-semibold text-ink hover:bg-brand-mist"
              >
                Bell
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-flag-red px-1 text-[10px] text-white">
                    {unread}
                  </span>
                )}
              </button>
              {openNotifs && (
                <div className="absolute right-0 z-20 mt-2 w-80 rounded-md border border-line bg-white p-2 shadow-lg">
                  <div className="mb-2 flex items-center justify-between px-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-brand">Notifications</p>
                    <button type="button" className="text-xs text-muted hover:text-brand" onClick={() => void markAllRead()}>
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 space-y-1 overflow-y-auto">
                    {notifications.map((n) => (
                      <Link
                        key={n.id}
                        href={n.link || "#"}
                        onClick={() => setOpenNotifs(false)}
                        className={`block rounded-md px-2 py-2 text-sm ${n.read ? "text-muted" : "bg-brand-mist/60 text-ink"}`}
                      >
                        {n.message}
                      </Link>
                    ))}
                    {!notifications.length && (
                      <p className="px-2 py-3 text-xs text-muted">No notifications yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setOpenProfile((v) => !v);
                  setOpenNotifs(false);
                }}
                className="rounded-md border border-line px-2.5 py-1.5 text-sm font-semibold text-ink hover:bg-brand-mist"
              >
                {user?.name?.split(" ")[0] ?? "Profile"}
              </button>
              {openProfile && (
                <div className="absolute right-0 z-20 mt-2 w-52 rounded-md border border-line bg-white p-2 shadow-lg">
                  <p className="px-2 py-1 text-xs text-muted">{user?.email}</p>
                  <p className="px-2 pb-2 text-xs font-semibold text-brand">{user?.roleName}</p>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="w-full rounded-md px-2 py-2 text-left text-sm font-semibold text-ink hover:bg-brand-mist"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <nav
          className="flex gap-1 overflow-x-auto border-b border-line bg-white px-3 py-2 md:hidden"
          aria-label={`${role} mobile nav`}
        >
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md bg-brand-mist px-3 py-2 text-xs font-semibold text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
