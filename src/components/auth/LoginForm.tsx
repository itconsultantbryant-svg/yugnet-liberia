"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { Button, ButtonLink } from "@/components/ui/Button";
import { brand } from "@/lib/brand";
import type { PermissionKey } from "@/lib/permissions";

function portalFor(permissions: PermissionKey[]) {
  if (permissions.includes("portal.admin")) return "/admin";
  if (permissions.includes("portal.instructor")) return "/instructor";
  if (permissions.includes("portal.student")) return "/student";
  return "/training";
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const forbidden = params.get("error") === "forbidden";
  const next = params.get("next");

  const hint = useMemo(() => {
    if (forbidden) return "You do not have access to that portal.";
    return null;
  }, [forbidden]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      const dest = next || portalFor(data.user.permissions);
      router.push(dest);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo size="lg" href="/training" />
        <h1 className="mt-5 font-display text-3xl font-bold text-ink">Welcome back</h1>
        <p className="mt-2 text-muted">
          Sign in to your {brand.shortName} Admin, Instructor, or Student portal.
        </p>
      </div>

      {(error || hint) && (
        <p className="mb-4 rounded-md border border-flag-red/30 bg-flag-red/10 px-3 py-2 text-sm text-flag-red">
          {error || hint}
        </p>
      )}

      <form
        onSubmit={onSubmit}
        className="space-y-4 bg-white p-6 shadow-[0_0_0_1px_var(--brand-line)] sm:p-8"
      >
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-semibold text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-semibold text-ink">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
        <p className="text-center text-xs text-muted">
          Demo: student@yugnet.lr / Learn123!
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New student?{" "}
        <ButtonLink
          href="/training/signup"
          variant="ghost"
          className="!inline !px-1 !py-0"
        >
          Create an account
        </ButtonLink>
      </p>
    </section>
  );
}
