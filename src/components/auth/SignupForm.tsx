"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { brand } from "@/lib/brand";

type CourseOption = {
  id: string;
  slug: string;
  title: string;
  level: string;
  schedule: string | null;
  price: number;
};

const inputClass =
  "w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand";

export function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const preselected = params.get("course")?.trim() || "";

  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(
    preselected ? [preselected] : [],
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/courses?published=1");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return;
      setCourses(
        (data.courses ?? []).map(
          (c: {
            id: string;
            slug: string;
            title: string;
            level: string;
            schedule: string | null;
            price: number;
          }) => ({
            id: c.id,
            slug: c.slug,
            title: c.title,
            level: c.level,
            schedule: c.schedule,
            price: c.price,
          }),
        ),
      );
    })();
  }, []);

  useEffect(() => {
    if (preselected && !selectedSlugs.includes(preselected)) {
      setSelectedSlugs((s) => [...s, preselected]);
    }
  }, [preselected, selectedSlugs]);

  const selectedCourses = useMemo(
    () => courses.filter((c) => selectedSlugs.includes(c.slug)),
    [courses, selectedSlugs],
  );

  function toggleCourse(slug: string) {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) {
      if (!form.name.trim() || !form.email.trim() || form.password.length < 8) {
        setError("Please complete your account details.");
        return;
      }
      setError(null);
      setStep(2);
      return;
    }

    if (!selectedSlugs.length) {
      setError("Select at least one course to enroll.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
        }),
      });
      const signupData = await signupRes.json();
      if (!signupRes.ok) {
        setError(signupData.error ?? "Signup failed");
        return;
      }

      // Attach optional student profile fields + enrollments
      const enrollRes = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlugs: selectedSlugs,
          address: form.address || undefined,
        }),
      });
      const enrollData = await enrollRes.json().catch(() => ({}));
      if (!enrollRes.ok) {
        setError(enrollData.error ?? "Account created, but enrollment failed.");
        router.push("/student");
        return;
      }

      router.push("/student");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-2xl flex-col px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo size="lg" href="/training" />
        <h1 className="mt-5 font-display text-3xl font-bold text-ink">
          Enroll in Training
        </h1>
        <p className="mt-2 max-w-md text-muted">
          Create your {brand.shortName} student account and select course(s) to enroll.
        </p>
        <div className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          <span className={step === 1 ? "text-brand" : "text-muted"}>1 · Account</span>
          <span className="text-muted">→</span>
          <span className={step === 2 ? "text-brand" : "text-muted"}>2 · Courses</span>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-flag-red/30 bg-flag-red/10 px-3 py-2 text-sm text-flag-red">
          {error}
        </p>
      )}

      <form
        onSubmit={onSubmit}
        className="space-y-4 bg-white p-6 shadow-[0_0_0_1px_var(--brand-line)] sm:p-8"
      >
        {step === 1 && (
          <>
            {(
              [
                ["name", "Full name", "text", true],
                ["email", "Email", "email", true],
                ["phone", "Phone", "tel", false],
                ["password", "Password (min 8 characters)", "password", true],
                ["address", "Address (optional)", "text", false],
              ] as const
            ).map(([key, label, type, required]) => (
              <div key={key}>
                <label htmlFor={key} className="mb-1 block text-sm font-semibold text-ink">
                  {label}
                </label>
                <input
                  id={key}
                  name={key}
                  type={type}
                  required={required}
                  minLength={key === "password" ? 8 : undefined}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className={inputClass}
                />
              </div>
            ))}
            <Button type="submit" className="w-full">
              Continue to course selection
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm text-muted">
              Choose one or more published courses. You can add more later from the catalog.
            </p>
            <div className="max-h-80 space-y-2 overflow-y-auto border border-line p-3">
              {courses.map((course) => {
                const checked = selectedSlugs.includes(course.slug);
                return (
                  <label
                    key={course.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-md px-3 py-3 ${
                      checked ? "bg-brand-mist" : "hover:bg-surface"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCourse(course.slug)}
                      className="mt-1 accent-[var(--brand-green)]"
                    />
                    <span>
                      <span className="block font-semibold text-ink">{course.title}</span>
                      <span className="text-xs text-muted">
                        {course.level}
                        {course.schedule ? ` · ${course.schedule}` : ""}
                        {" · "}
                        {course.price > 0 ? `$${course.price.toFixed(2)}` : "Free"}
                      </span>
                    </span>
                  </label>
                );
              })}
              {!courses.length && (
                <p className="text-sm text-muted">No published courses available yet.</p>
              )}
            </div>

            {selectedCourses.length > 0 && (
              <p className="text-sm text-brand">
                Selected: {selectedCourses.map((c) => c.title).join(", ")}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setError(null);
                  setStep(1);
                }}
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={pending}>
                {pending ? "Creating account…" : "Create account & enroll"}
              </Button>
            </div>
          </>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already registered?{" "}
        <Link
          href="/training/login"
          className="font-semibold text-brand hover:underline"
        >
          Sign in
        </Link>
      </p>
    </section>
  );
}
