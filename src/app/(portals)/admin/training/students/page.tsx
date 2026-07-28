"use client";

import { useEffect, useMemo, useState } from "react";
import { TrainingSubNav } from "@/components/admin/TrainingSubNav";
import { Button } from "@/components/ui/Button";

type Course = { id: string; title: string; status: string; slug: string };
type Enrollment = {
  id: string;
  status: string;
  source: string;
  enrolledDate: string;
  course: { id: string; title: string; slug: string; status: string; level: string };
};
type Student = {
  id: string;
  address: string | null;
  dateOfBirth: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    status: string;
  };
  enrollments: Enrollment[];
};

const inputClass =
  "w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  address: "",
  dateOfBirth: "",
  status: "ACTIVE",
  courseIds: [] as string[],
};

export default function StudentsAdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load(q = query, courseId = courseFilter) {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (courseId) params.set("courseId", courseId);
    const [sRes, cRes] = await Promise.all([
      fetch(`/api/students?${params}`),
      fetch("/api/courses"),
    ]);
    const sData = await sRes.json();
    const cData = await cRes.json();
    if (!sRes.ok) setError(sData.error ?? "Failed to load students");
    else {
      setError(null);
      setStudents(sData.students ?? []);
    }
    setCourses(cData.courses ?? []);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = useMemo(
    () => students.find((s) => s.id === selectedId) ?? null,
    [students, selectedId],
  );

  function startCreate() {
    setMode("create");
    setSelectedId(null);
    setForm(emptyForm);
    setMessage(null);
    setError(null);
  }

  function startEdit(student: Student) {
    setMode("edit");
    setSelectedId(student.id);
    setForm({
      name: student.user.name,
      email: student.user.email,
      phone: student.user.phone ?? "",
      password: "",
      address: student.address ?? "",
      dateOfBirth: student.dateOfBirth ?? "",
      status: student.user.status,
      courseIds: student.enrollments
        .filter((e) => e.status !== "WITHDRAWN")
        .map((e) => e.course.id),
    });
    setMessage(null);
    setError(null);
  }

  function toggleCourse(id: string) {
    setForm((f) => ({
      ...f,
      courseIds: f.courseIds.includes(id)
        ? f.courseIds.filter((x) => x !== id)
        : [...f.courseIds, id],
    }));
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    if (mode === "create") {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password || undefined,
          address: form.address || undefined,
          dateOfBirth: form.dateOfBirth || undefined,
          courseIds: form.courseIds,
        }),
      });
      const data = await res.json();
      setSaving(false);
      if (!res.ok) {
        setError(data.error ?? "Create failed");
        return;
      }
      const temp = data.temporaryPassword
        ? ` Temporary password: ${data.temporaryPassword}`
        : "";
      setMessage(`Student created.${temp}`);
      setMode("edit");
      setSelectedId(data.student.id);
      await load();
      return;
    }

    if (!selectedId) return;

    const res = await fetch(`/api/students/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone || null,
        status: form.status,
        address: form.address || null,
        dateOfBirth: form.dateOfBirth || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setSaving(false);
      setError(data.error ?? "Update failed");
      return;
    }

    // Sync enrollments: enroll newly checked courses
    const currentActive = new Set(
      (selected?.enrollments ?? [])
        .filter((e) => e.status !== "WITHDRAWN")
        .map((e) => e.course.id),
    );
    const nextIds = new Set(form.courseIds);
    const toEnroll = [...nextIds].filter((id) => !currentActive.has(id));
    const toWithdraw = [...currentActive].filter((id) => !nextIds.has(id));

    if (toEnroll.length) {
      const enrollRes = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selectedId, courseIds: toEnroll }),
      });
      const enrollData = await enrollRes.json();
      if (!enrollRes.ok) {
        setSaving(false);
        setError(enrollData.error ?? "Profile saved, but enrollment failed");
        await load();
        return;
      }
    }

    for (const courseId of toWithdraw) {
      const enrollment = selected?.enrollments.find(
        (e) => e.course.id === courseId && e.status !== "WITHDRAWN",
      );
      if (!enrollment) continue;
      await fetch(`/api/enrollments/${enrollment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "WITHDRAWN" }),
      });
    }

    setSaving(false);
    setMessage("Student updated.");
    await load();
  }

  async function setEnrollmentStatus(enrollmentId: string, status: string) {
    setError(null);
    const res = await fetch(`/api/enrollments/${enrollmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Status update failed");
      return;
    }
    setMessage(`Enrollment marked ${status}.`);
    await load();
  }

  return (
    <div>
      <TrainingSubNav />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Students</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Roster, profiles, and manual enrollment. Self-enrolled students appear here after
            signup.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={startCreate}>
          New student
        </Button>
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-flag-red/30 bg-flag-red/10 px-3 py-2 text-sm text-flag-red">
          {error}
        </p>
      )}
      {message && (
        <p className="mb-4 rounded-md border border-brand/25 bg-brand-mist px-3 py-2 text-sm text-brand">
          {message}
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or email"
          className={`${inputClass} max-w-xs`}
        />
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className={`${inputClass} max-w-xs`}
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void load(query, courseFilter)}
        >
          Filter
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <div className="space-y-2">
          {students.map((student) => {
            const activeCount = student.enrollments.filter(
              (e) => e.status === "ACTIVE",
            ).length;
            const active = student.id === selectedId;
            return (
              <button
                key={student.id}
                type="button"
                onClick={() => startEdit(student)}
                className={`w-full border-l-4 px-4 py-3 text-left transition ${
                  active
                    ? "border-brand bg-brand-mist"
                    : "border-transparent bg-white shadow-[0_0_0_1px_var(--brand-line)] hover:bg-surface"
                }`}
              >
                <p className="font-semibold text-ink">{student.user.name}</p>
                <p className="text-xs text-muted">
                  {student.user.email} · {student.user.status} · {activeCount} active
                  course{activeCount === 1 ? "" : "s"}
                </p>
              </button>
            );
          })}
          {!students.length && (
            <p className="text-sm text-muted">No students match this filter.</p>
          )}
        </div>

        <form
          onSubmit={(e) => void saveProfile(e)}
          className="space-y-4 bg-white p-5 shadow-[0_0_0_1px_var(--brand-line)]"
        >
          <h2 className="font-display text-xl font-bold text-ink">
            {mode === "create" ? "Create student" : "Edit student"}
          </h2>

          {(
            [
              ["name", "Full name", "text", true],
              ["email", "Email", "email", mode === "create"],
              ["phone", "Phone", "tel", false],
              ["address", "Address", "text", false],
              ["dateOfBirth", "Date of birth", "text", false],
            ] as const
          ).map(([key, label, type, required]) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-semibold text-ink">{label}</label>
              <input
                type={type}
                required={required}
                disabled={key === "email" && mode === "edit"}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className={inputClass}
              />
            </div>
          ))}

          {mode === "create" && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-ink">
                Password (optional — auto-generated if blank)
              </label>
              <input
                type="text"
                minLength={8}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className={inputClass}
              />
            </div>
          )}

          {mode === "edit" && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-ink">Account status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className={inputClass}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Course enrollments</p>
            <div className="max-h-48 space-y-1 overflow-y-auto border border-line p-2">
              {courses.map((course) => (
                <label
                  key={course.id}
                  className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 hover:bg-surface"
                >
                  <input
                    type="checkbox"
                    checked={form.courseIds.includes(course.id)}
                    onChange={() => toggleCourse(course.id)}
                    className="mt-1 accent-[var(--brand-green)]"
                  />
                  <span className="text-sm">
                    <span className="font-semibold text-ink">{course.title}</span>
                    <span className="text-xs text-muted"> · {course.status}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Saving…" : mode === "create" ? "Create & enroll" : "Save changes"}
          </Button>

          {mode === "edit" && selected && (
            <div className="border-t border-line pt-4">
              <p className="mb-2 text-sm font-semibold text-ink">Enrollment history</p>
              <ul className="space-y-2">
                {selected.enrollments.map((e) => (
                  <li
                    key={e.id}
                    className="flex flex-wrap items-center justify-between gap-2 text-sm"
                  >
                    <span>
                      {e.course.title}{" "}
                      <span className="text-xs text-muted">
                        · {e.status} · {e.source} ·{" "}
                        {new Date(e.enrolledDate).toLocaleDateString()}
                      </span>
                    </span>
                    <span className="flex gap-1">
                      {e.status !== "ACTIVE" && (
                        <button
                          type="button"
                          className="text-xs font-semibold text-brand hover:underline"
                          onClick={() => void setEnrollmentStatus(e.id, "ACTIVE")}
                        >
                          Activate
                        </button>
                      )}
                      {e.status !== "COMPLETED" && (
                        <button
                          type="button"
                          className="text-xs font-semibold text-brand hover:underline"
                          onClick={() => void setEnrollmentStatus(e.id, "COMPLETED")}
                        >
                          Complete
                        </button>
                      )}
                      {e.status !== "WITHDRAWN" && (
                        <button
                          type="button"
                          className="text-xs font-semibold text-flag-red hover:underline"
                          onClick={() => void setEnrollmentStatus(e.id, "WITHDRAWN")}
                        >
                          Withdraw
                        </button>
                      )}
                    </span>
                  </li>
                ))}
                {!selected.enrollments.length && (
                  <li className="text-xs text-muted">No enrollments yet.</li>
                )}
              </ul>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
