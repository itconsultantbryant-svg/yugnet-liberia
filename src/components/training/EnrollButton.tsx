"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function EnrollButton({
  courseSlug,
  className = "",
}: {
  courseSlug: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function enroll() {
    setPending(true);
    setError(null);
    setMessage(null);

    // Check session
    const me = await fetch("/api/auth/me", { cache: "no-store" });
    if (!me.ok) {
      router.push(`/training/signup?course=${encodeURIComponent(courseSlug)}`);
      return;
    }

    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseSlugs: [courseSlug] }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);

    if (res.status === 401 || res.status === 403) {
      router.push(`/training/signup?course=${encodeURIComponent(courseSlug)}`);
      return;
    }
    if (!res.ok) {
      setError(data.error ?? "Enrollment failed");
      return;
    }

    setMessage("Enrolled! Opening your dashboard…");
    router.push("/student");
    router.refresh();
  }

  return (
    <div className={className}>
      <Button type="button" className="w-full" disabled={pending} onClick={() => void enroll()}>
        {pending ? "Enrolling…" : "Enroll Now"}
      </Button>
      {error && <p className="mt-2 text-xs text-flag-red">{error}</p>}
      {message && <p className="mt-2 text-xs text-brand">{message}</p>}
      <p className="mt-3 text-xs text-muted">
        New here?{" "}
        <Link
          href={`/training/signup?course=${encodeURIComponent(courseSlug)}`}
          className="font-semibold text-brand hover:underline"
        >
          Create a student account
        </Link>
      </p>
    </div>
  );
}
