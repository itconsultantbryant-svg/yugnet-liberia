"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrainingSubNav } from "@/components/admin/TrainingSubNav";
import { Button } from "@/components/ui/Button";

type Course = { id: string; title: string; status: string };
type Instructor = {
  id: string;
  name: string;
  email: string | null;
  bio: string;
  photo: string | null;
  credentials: string | null;
  specialties: string | null;
  published: boolean;
  courses: { course: Course }[];
};

const inputClass =
  "w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand";

const emptyForm = {
  name: "",
  email: "",
  bio: "",
  photo: "",
  credentials: "",
  specialties: "",
  published: true,
  courseIds: [] as string[],
};

export default function InstructorsAdminPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [ins, c] = await Promise.all([
      fetch("/api/instructors").then((r) => r.json()),
      fetch("/api/courses").then((r) => r.json()),
    ]);
    if (ins.error) setError(ins.error);
    else setInstructors(ins.instructors ?? []);
    setCourses(c.courses ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage(null);
    setError(null);
  }

  function startEdit(ins: Instructor) {
    setEditingId(ins.id);
    setForm({
      name: ins.name,
      email: ins.email ?? "",
      bio: ins.bio,
      photo: ins.photo ?? "",
      credentials: ins.credentials ?? "",
      specialties: ins.specialties ?? "",
      published: ins.published,
      courseIds: ins.courses.map((c) => c.course.id),
    });
  }

  function toggleCourse(id: string) {
    setForm((f) => ({
      ...f,
      courseIds: f.courseIds.includes(id)
        ? f.courseIds.filter((x) => x !== id)
        : [...f.courseIds, id],
    }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const payload = {
      name: form.name,
      email: form.email || null,
      bio: form.bio,
      photo: form.photo || null,
      credentials: form.credentials || null,
      specialties: form.specialties || null,
      published: form.published,
      courseIds: form.courseIds,
    };
    const res = await fetch(
      editingId ? `/api/instructors/${editingId}` : "/api/instructors",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    setMessage("Instructor saved — lecturers directory revalidated.");
    setEditingId(data.instructor.id);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete instructor?")) return;
    const res = await fetch(`/api/instructors/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Delete failed");
      return;
    }
    if (editingId === id) startCreate();
    await load();
  }

  return (
    <div>
      <TrainingSubNav />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Instructors</h1>
          <p className="mt-2 text-muted">
            Manage lecturer profiles and assign them to courses.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={startCreate}>
          New instructor
        </Button>
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-flag-red/30 bg-flag-red/10 px-3 py-2 text-sm text-flag-red">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-4 rounded-md border border-brand/30 bg-brand-mist px-3 py-2 text-sm text-brand">
          {message}
        </p>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <div className="space-y-2">
          {instructors.map((ins) => (
            <button
              key={ins.id}
              type="button"
              onClick={() => startEdit(ins)}
              className={`w-full rounded-md border px-4 py-3 text-left ${
                editingId === ins.id
                  ? "border-brand bg-brand-mist"
                  : "border-line bg-white hover:bg-brand-mist/40"
              }`}
            >
              <div className="flex justify-between gap-2">
                <p className="font-semibold text-ink">{ins.name}</p>
                <span className={`text-[10px] font-bold uppercase ${ins.published ? "text-brand" : "text-muted"}`}>
                  {ins.published ? "Published" : "Hidden"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {ins.specialties || "No specialties"} · {ins.courses.length} course
                {ins.courses.length === 1 ? "" : "s"}
              </p>
            </button>
          ))}
          {!instructors.length && (
            <p className="text-sm text-muted">No instructors yet.</p>
          )}
        </div>

        <form onSubmit={save} className="space-y-3 bg-white p-5 shadow-[0_0_0_1px_var(--brand-line)]">
          <h2 className="font-display text-xl font-bold text-ink">
            {editingId ? "Edit instructor" : "Add instructor"}
          </h2>
          <label className="block text-sm font-semibold">
            <span className="mb-1 block">Name</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-semibold">
            <span className="mb-1 block">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-semibold">
            <span className="mb-1 block">Bio</span>
            <textarea
              rows={4}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-semibold">
            <span className="mb-1 block">Credentials</span>
            <input
              value={form.credentials}
              onChange={(e) => setForm((f) => ({ ...f, credentials: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-semibold">
            <span className="mb-1 block">Specialties</span>
            <input
              value={form.specialties}
              onChange={(e) => setForm((f) => ({ ...f, specialties: e.target.value }))}
              className={inputClass}
              placeholder="Leadership, Digital skills…"
            />
          </label>
          <label className="block text-sm font-semibold">
            <span className="mb-1 block">Photo URL</span>
            <input
              value={form.photo}
              onChange={(e) => setForm((f) => ({ ...f, photo: e.target.value }))}
              className={inputClass}
              placeholder="/uploads/…"
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
              className="accent-[var(--brand-green)]"
            />
            Published on Our Lecturers
          </label>

          <div>
            <p className="mb-2 text-sm font-semibold">Assigned courses</p>
            <div className="grid max-h-40 gap-2 overflow-y-auto border border-line p-3 sm:grid-cols-2">
              {courses.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm font-normal">
                  <input
                    type="checkbox"
                    checked={form.courseIds.includes(c.id)}
                    onChange={() => toggleCourse(c.id)}
                    className="accent-[var(--brand-green)]"
                  />
                  <span>
                    {c.title}
                    <span className="ml-1 text-xs text-muted">({c.status})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save changes" : "Create instructor"}
            </Button>
            {editingId && (
              <>
                <Link
                  href={`/training/lecturers/${editingId}`}
                  className="inline-flex items-center rounded-md border border-brand/25 px-4 py-3 text-sm font-semibold text-brand hover:bg-brand-mist"
                >
                  View public profile
                </Link>
                <button
                  type="button"
                  onClick={() => void remove(editingId)}
                  className="rounded-md px-4 py-3 text-sm font-semibold text-flag-red hover:bg-flag-red/10"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
