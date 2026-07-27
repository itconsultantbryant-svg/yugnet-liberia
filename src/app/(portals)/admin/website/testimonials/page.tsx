"use client";

import { useEffect, useState } from "react";
import { WebsiteSubNav } from "@/components/admin/WebsiteSubNav";
import { Button } from "@/components/ui/Button";

type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  published: boolean;
  sortOrder: number;
};

export default function TestimonialsAdminPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [form, setForm] = useState({ name: "", role: "", quote: "" });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/testimonials");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load");
      return;
    }
    setItems(data.testimonials);
  }

  useEffect(() => {
    void load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Create failed");
      return;
    }
    setForm({ name: "", role: "", quote: "" });
    await load();
  }

  async function toggle(item: Testimonial) {
    await fetch(`/api/testimonials/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !item.published }),
    });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete testimonial?")) return;
    await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <WebsiteSubNav />
      <h1 className="font-display text-3xl font-bold text-ink">Testimonials</h1>
      <p className="mt-2 text-muted">Published quotes appear on the public home page.</p>

      {error && (
        <p className="mt-4 rounded-md border border-flag-red/30 bg-flag-red/10 px-3 py-2 text-sm text-flag-red">
          {error}
        </p>
      )}

      <form onSubmit={create} className="mt-6 space-y-3 bg-white p-5 shadow-[0_0_0_1px_var(--brand-line)]">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
          />
          <input
            placeholder="Role / title"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            className="rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
          />
        </div>
        <textarea
          required
          rows={3}
          placeholder="Quote"
          value={form.quote}
          onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
          className="w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
        />
        <Button type="submit">Add testimonial</Button>
      </form>

      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <article key={item.id} className="border-l-4 border-brand bg-white p-4">
            <p className="font-semibold text-ink">{item.name}</p>
            {item.role && <p className="text-xs text-brand">{item.role}</p>}
            <p className="mt-2 text-muted">&ldquo;{item.quote}&rdquo;</p>
            <div className="mt-3 flex gap-3 text-xs font-semibold">
              <button type="button" className="text-brand hover:underline" onClick={() => void toggle(item)}>
                {item.published ? "Unpublish" : "Publish"}
              </button>
              <button type="button" className="text-flag-red hover:underline" onClick={() => void remove(item.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
