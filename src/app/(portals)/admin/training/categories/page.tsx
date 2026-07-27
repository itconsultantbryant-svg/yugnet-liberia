"use client";

import { useEffect, useState } from "react";
import { TrainingSubNav } from "@/components/admin/TrainingSubNav";
import { Button } from "@/components/ui/Button";

type Category = { id: string; name: string; slug: string; courseCount: number };

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Create failed");
      return;
    }
    setName("");
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete category?")) return;
    const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Delete failed");
      return;
    }
    await load();
  }

  return (
    <div>
      <TrainingSubNav />
      <h1 className="font-display text-3xl font-bold text-ink">Course Categories</h1>
      <p className="mt-2 text-muted">Used to filter the public course catalog.</p>

      {error && (
        <p className="mt-4 rounded-md border border-flag-red/30 bg-flag-red/10 px-3 py-2 text-sm text-flag-red">
          {error}
        </p>
      )}

      <form onSubmit={create} className="mt-6 flex flex-col gap-3 bg-white p-5 shadow-[0_0_0_1px_var(--brand-line)] sm:flex-row sm:items-end">
        <label className="flex-1 text-sm font-semibold">
          <span className="mb-1 block">Category name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
          />
        </label>
        <Button type="submit">Add category</Button>
      </form>

      <ul className="mt-8 space-y-2">
        {categories.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-3"
          >
            <div>
              <p className="font-semibold text-ink">{c.name}</p>
              <p className="text-xs text-muted">
                {c.slug} · {c.courseCount} course{c.courseCount === 1 ? "" : "s"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void remove(c.id)}
              className="text-xs font-semibold text-flag-red hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
