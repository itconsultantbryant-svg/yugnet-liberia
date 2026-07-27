"use client";

import { useEffect, useMemo, useState } from "react";
import { WebsiteSubNav } from "@/components/admin/WebsiteSubNav";
import { Button } from "@/components/ui/Button";

type Section = {
  page: string;
  sectionKey: string;
  label: string;
  fields: { key: string; label: string; multiline?: boolean }[];
  content: Record<string, string>;
  updatedAt: string | null;
};

export default function PagesEditorPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/content");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load content");
      return;
    }
    setSections(data.sections);
    if (!selected && data.sections[0]) {
      const first = data.sections[0];
      setSelected(`${first.page}:${first.sectionKey}`);
      setDraft(first.content);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = useMemo(
    () => sections.find((s) => `${s.page}:${s.sectionKey}` === selected) ?? null,
    [sections, selected],
  );

  function selectSection(section: Section) {
    setSelected(`${section.page}:${section.sectionKey}`);
    setDraft(section.content);
    setMessage(null);
    setError(null);
  }

  async function save() {
    if (!current) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: current.page,
        sectionKey: current.sectionKey,
        content: draft,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    setMessage("Saved — public page revalidated.");
    await load();
  }

  const pages = [...new Set(sections.map((s) => s.page))];

  return (
    <div>
      <WebsiteSubNav />
      <h1 className="font-display text-3xl font-bold text-ink">Pages & Sections</h1>
      <p className="mt-2 text-muted">
        Edit content blocks used by the public site. Changes appear live after save.
      </p>

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

      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="space-y-4">
          {pages.map((page) => (
            <div key={page}>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand">
                {page}
              </p>
              <div className="space-y-1">
                {sections
                  .filter((s) => s.page === page)
                  .map((section) => {
                    const id = `${section.page}:${section.sectionKey}`;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => selectSection(section)}
                        className={`w-full rounded-md px-3 py-2.5 text-left text-sm font-semibold ${
                          selected === id
                            ? "bg-brand text-white"
                            : "bg-white text-ink hover:bg-brand-mist"
                        }`}
                      >
                        {section.label.replace(/^[^·]+·\s*/, "")}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {current && (
          <div className="space-y-4 bg-white p-6 shadow-[0_0_0_1px_var(--brand-line)]">
            <div>
              <h2 className="font-display text-xl font-bold text-ink">{current.label}</h2>
              {current.updatedAt && (
                <p className="text-xs text-muted">
                  Last updated {new Date(current.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
            {current.fields.map((field) => (
              <div key={field.key}>
                <label className="mb-1 block text-sm font-semibold" htmlFor={field.key}>
                  {field.label}
                </label>
                {field.multiline ? (
                  <textarea
                    id={field.key}
                    rows={4}
                    value={draft[field.key] ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [field.key]: e.target.value }))
                    }
                    className="w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
                  />
                ) : (
                  <input
                    id={field.key}
                    value={draft[field.key] ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [field.key]: e.target.value }))
                    }
                    className="w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
                  />
                )}
              </div>
            ))}
            <Button type="button" onClick={() => void save()} disabled={saving}>
              {saving ? "Saving…" : "Save section"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
