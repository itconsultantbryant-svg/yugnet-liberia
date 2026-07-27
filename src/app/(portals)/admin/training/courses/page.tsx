"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TrainingSubNav } from "@/components/admin/TrainingSubNav";
import { Button } from "@/components/ui/Button";

type Category = { id: string; name: string };
type Instructor = { id: string; name: string };
type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  syllabus: string;
  flyerImage: string | null;
  price: number;
  duration: string | null;
  schedule: string | null;
  level: string;
  capacity: number | null;
  prerequisites: string | null;
  status: string;
  categoryId: string | null;
  category: Category | null;
  instructors: { instructor: Instructor }[];
};

const inputClass =
  "w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand";

const emptyForm = {
  title: "",
  description: "",
  syllabus: "",
  flyerImage: "",
  price: "0",
  duration: "",
  schedule: "",
  level: "Foundational",
  capacity: "",
  prerequisites: "",
  status: "DRAFT",
  categoryId: "",
  instructorIds: [] as string[],
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "DRAFT" | "PUBLISHED">("ALL");

  async function load() {
    const [c, cat, ins] = await Promise.all([
      fetch("/api/courses").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/instructors").then((r) => r.json()),
    ]);
    if (c.error) setError(c.error);
    else setCourses(c.courses ?? []);
    setCategories(cat.categories ?? []);
    setInstructors(ins.instructors ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  const visible = useMemo(
    () => courses.filter((c) => (filter === "ALL" ? true : c.status === filter)),
    [courses, filter],
  );

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage(null);
    setError(null);
  }

  function startEdit(course: Course) {
    setEditingId(course.id);
    setForm({
      title: course.title,
      description: course.description,
      syllabus: course.syllabus,
      flyerImage: course.flyerImage ?? "",
      price: String(course.price ?? 0),
      duration: course.duration ?? "",
      schedule: course.schedule ?? "",
      level: course.level,
      capacity: course.capacity != null ? String(course.capacity) : "",
      prerequisites: course.prerequisites ?? "",
      status: course.status,
      categoryId: course.categoryId ?? "",
      instructorIds: course.instructors.map((i) => i.instructor.id),
    });
    setMessage(null);
    setError(null);
  }

  function toggleInstructor(id: string) {
    setForm((f) => ({
      ...f,
      instructorIds: f.instructorIds.includes(id)
        ? f.instructorIds.filter((x) => x !== id)
        : [...f.instructorIds, id],
    }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload = {
      title: form.title,
      description: form.description,
      syllabus: form.syllabus,
      flyerImage: form.flyerImage || null,
      price: Number(form.price) || 0,
      duration: form.duration || null,
      schedule: form.schedule || null,
      level: form.level,
      capacity: form.capacity ? Number(form.capacity) : null,
      prerequisites: form.prerequisites || null,
      status: form.status as "DRAFT" | "PUBLISHED",
      categoryId: form.categoryId || null,
      instructorIds: form.instructorIds,
    };

    const res = await fetch(editingId ? `/api/courses/${editingId}` : "/api/courses", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    setMessage(editingId ? "Course updated — public catalog revalidated." : "Course created.");
    setEditingId(data.course.id);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this course?")) return;
    const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Delete failed");
      return;
    }
    if (editingId === id) startCreate();
    await load();
  }

  const editingSlug = courses.find((c) => c.id === editingId)?.slug;

  return (
    <div>
      <TrainingSubNav />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Courses</h1>
          <p className="mt-2 text-muted">
            Create, edit, and publish courses. Published courses appear on the public catalog instantly.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={startCreate}>
          New course
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
        <div>
          <div className="mb-3 flex gap-2">
            {(["ALL", "PUBLISHED", "DRAFT"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  filter === f ? "bg-brand text-white" : "bg-white text-muted"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {visible.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => startEdit(course)}
                className={`w-full rounded-md border px-4 py-3 text-left ${
                  editingId === course.id
                    ? "border-brand bg-brand-mist"
                    : "border-line bg-white hover:bg-brand-mist/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-ink">{course.title}</p>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide ${
                      course.status === "PUBLISHED" ? "text-brand" : "text-muted"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {course.category?.name ?? "Uncategorized"} · {course.level}
                </p>
              </button>
            ))}
            {!visible.length && (
              <p className="text-sm text-muted">No courses yet. Create one on the right.</p>
            )}
          </div>
        </div>

        <form onSubmit={save} className="space-y-3 bg-white p-5 shadow-[0_0_0_1px_var(--brand-line)]">
          <h2 className="font-display text-xl font-bold text-ink">
            {editingId ? "Edit course" : "Add new course"}
          </h2>

          <label className="block text-sm font-semibold">
            <span className="mb-1 block">Title</span>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-semibold">
            <span className="mb-1 block">Description</span>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-semibold">
            <span className="mb-1 block">Syllabus</span>
            <textarea
              rows={4}
              value={form.syllabus}
              onChange={(e) => setForm((f) => ({ ...f, syllabus: e.target.value }))}
              className={inputClass}
              placeholder="Week-by-week outline…"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              <span className="mb-1 block">Category</span>
              <select
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                className={inputClass}
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              <span className="mb-1 block">Level</span>
              <select
                value={form.level}
                onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                className={inputClass}
              >
                {["Foundational", "Intermediate", "Advanced"].map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              <span className="mb-1 block">Duration</span>
              <input
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                className={inputClass}
                placeholder="6 weeks"
              />
            </label>
            <label className="block text-sm font-semibold">
              <span className="mb-1 block">Schedule</span>
              <input
                value={form.schedule}
                onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))}
                className={inputClass}
                placeholder="Evenings · Hybrid"
              />
            </label>
            <label className="block text-sm font-semibold">
              <span className="mb-1 block">Price (USD)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-semibold">
              <span className="mb-1 block">Capacity</span>
              <input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                className={inputClass}
              />
            </label>
          </div>

          <label className="block text-sm font-semibold">
            <span className="mb-1 block">Flyer image URL</span>
            <input
              value={form.flyerImage}
              onChange={(e) => setForm((f) => ({ ...f, flyerImage: e.target.value }))}
              className={inputClass}
              placeholder="/uploads/… or Media Library URL"
            />
          </label>
          <label className="block text-sm font-semibold">
            <span className="mb-1 block">Prerequisites</span>
            <input
              value={form.prerequisites}
              onChange={(e) => setForm((f) => ({ ...f, prerequisites: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-semibold">
            <span className="mb-1 block">Status</span>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className={inputClass}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </label>

          <div>
            <p className="mb-2 text-sm font-semibold">Assigned instructors</p>
            <div className="grid max-h-40 gap-2 overflow-y-auto border border-line p-3 sm:grid-cols-2">
              {instructors.map((ins) => (
                <label key={ins.id} className="flex items-center gap-2 text-sm font-normal">
                  <input
                    type="checkbox"
                    checked={form.instructorIds.includes(ins.id)}
                    onChange={() => toggleInstructor(ins.id)}
                    className="accent-[var(--brand-green)]"
                  />
                  {ins.name}
                </label>
              ))}
              {!instructors.length && (
                <p className="text-xs text-muted">
                  No instructors yet.{" "}
                  <Link href="/admin/training/instructors" className="text-brand underline">
                    Add some
                  </Link>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save changes" : "Create course"}
            </Button>
            {editingId && editingSlug && (
              <Link
                href={`/training/courses/${editingSlug}`}
                className="inline-flex items-center rounded-md border border-brand/25 px-4 py-3 text-sm font-semibold text-brand hover:bg-brand-mist"
              >
                View public page
              </Link>
            )}
            {editingId && (
              <button
                type="button"
                onClick={() => void remove(editingId)}
                className="rounded-md px-4 py-3 text-sm font-semibold text-flag-red hover:bg-flag-red/10"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
