"use client";

import { useEffect, useState } from "react";
import { WebsiteSubNav } from "@/components/admin/WebsiteSubNav";

type Submission = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
};

export default function ContactAdminPage() {
  const [items, setItems] = useState<Submission[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/contact");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load");
      return;
    }
    setItems(data.submissions);
  }

  useEffect(() => {
    void load();
  }, []);

  async function setStatus(id: string, status: string) {
    await fetch(`/api/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  return (
    <div>
      <WebsiteSubNav />
      <h1 className="font-display text-3xl font-bold text-ink">Contact Submissions</h1>
      <p className="mt-2 text-muted">Messages from the public contact form.</p>

      {error && (
        <p className="mt-4 rounded-md border border-flag-red/30 bg-flag-red/10 px-3 py-2 text-sm text-flag-red">
          {error}
        </p>
      )}

      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <article key={item.id} className="bg-white p-5 shadow-[0_0_0_1px_var(--brand-line)]">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold text-ink">
                {item.name} · <span className="font-normal text-muted">{item.email}</span>
              </p>
              <span className="text-xs font-bold uppercase tracking-wide text-brand">
                {item.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">{new Date(item.createdAt).toLocaleString()}</p>
            <p className="mt-3 whitespace-pre-wrap text-muted">{item.message}</p>
            <div className="mt-3 flex gap-3 text-xs font-semibold">
              <button type="button" className="text-brand hover:underline" onClick={() => void setStatus(item.id, "READ")}>
                Mark read
              </button>
              <button type="button" className="text-muted hover:underline" onClick={() => void setStatus(item.id, "ARCHIVED")}>
                Archive
              </button>
            </div>
          </article>
        ))}
        {!items.length && !error && (
          <p className="text-sm text-muted">No submissions yet.</p>
        )}
      </div>
    </div>
  );
}
