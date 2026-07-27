"use client";

import { useEffect, useState } from "react";
import { WebsiteSubNav } from "@/components/admin/WebsiteSubNav";
import { Button } from "@/components/ui/Button";

type Seo = {
  siteTitle: string;
  siteDescription: string;
  keywords: string;
  ogImage: string;
};

export default function SeoAdminPage() {
  const [seo, setSeo] = useState<Seo>({
    siteTitle: "",
    siteDescription: "",
    keywords: "",
    ogImage: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/seo");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load SEO");
        return;
      }
      setSeo(data.seo);
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/seo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(seo),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    setSeo(data.seo);
    setMessage("SEO settings saved and site revalidated.");
  }

  return (
    <div>
      <WebsiteSubNav />
      <h1 className="font-display text-3xl font-bold text-ink">SEO Settings</h1>
      <p className="mt-2 text-muted">Default metadata for the public site.</p>

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

      <form onSubmit={save} className="mt-6 max-w-2xl space-y-4 bg-white p-6 shadow-[0_0_0_1px_var(--brand-line)]">
        {(
          [
            ["siteTitle", "Site title"],
            ["siteDescription", "Site description"],
            ["keywords", "Keywords"],
            ["ogImage", "Open Graph image URL"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label className="mb-1 block text-sm font-semibold" htmlFor={key}>
              {label}
            </label>
            {key === "siteDescription" ? (
              <textarea
                id={key}
                rows={3}
                value={seo[key]}
                onChange={(e) => setSeo((s) => ({ ...s, [key]: e.target.value }))}
                className="w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
              />
            ) : (
              <input
                id={key}
                value={seo[key]}
                onChange={(e) => setSeo((s) => ({ ...s, [key]: e.target.value }))}
                className="w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
              />
            )}
          </div>
        ))}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save SEO"}
        </Button>
      </form>
    </div>
  );
}
