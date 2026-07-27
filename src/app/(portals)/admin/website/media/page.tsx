"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { WebsiteSubNav } from "@/components/admin/WebsiteSubNav";
import { Button } from "@/components/ui/Button";

type Media = {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  alt: string | null;
  createdAt: string;
};

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [alt, setAlt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function load() {
    const res = await fetch("/api/media");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load media");
      return;
    }
    setMedia(data.media);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    if (!fileInput.files?.[0]) return;

    setUploading(true);
    setError(null);
    const body = new FormData();
    body.append("file", fileInput.files[0]);
    body.append("alt", alt);

    const res = await fetch("/api/media", { method: "POST", body });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setError(data.error ?? "Upload failed");
      return;
    }
    setAlt("");
    form.reset();
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this file?")) return;
    const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Delete failed");
      return;
    }
    await load();
  }

  return (
    <div>
      <WebsiteSubNav />
      <h1 className="font-display text-3xl font-bold text-ink">Media Library</h1>
      <p className="mt-2 text-muted">Upload images (and PDFs) for use across the site.</p>

      {error && (
        <p className="mt-4 rounded-md border border-flag-red/30 bg-flag-red/10 px-3 py-2 text-sm text-flag-red">
          {error}
        </p>
      )}

      <form
        onSubmit={onUpload}
        className="mt-6 flex flex-col gap-3 bg-white p-5 shadow-[0_0_0_1px_var(--brand-line)] sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="mb-1 block text-sm font-semibold" htmlFor="file">
            File
          </label>
          <input id="file" name="file" type="file" required accept="image/*,application/pdf" />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-sm font-semibold" htmlFor="alt">
            Alt text
          </label>
          <input
            id="alt"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
          />
        </div>
        <Button type="submit" disabled={uploading}>
          {uploading ? "Uploading…" : "Upload"}
        </Button>
      </form>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {media.map((item) => (
          <article key={item.id} className="overflow-hidden bg-white shadow-[0_0_0_1px_var(--brand-line)]">
            {item.mimeType.startsWith("image/") ? (
              <div className="relative h-40 bg-brand-mist">
                <Image src={item.url} alt={item.alt || item.originalName} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center bg-brand-mist text-sm font-semibold text-brand">
                PDF
              </div>
            )}
            <div className="space-y-2 p-4">
              <p className="truncate text-sm font-semibold text-ink">{item.originalName}</p>
              <p className="truncate text-xs text-muted">{item.url}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-xs font-semibold text-brand hover:underline"
                  onClick={() => void navigator.clipboard.writeText(item.url)}
                >
                  Copy URL
                </button>
                <button
                  type="button"
                  className="text-xs font-semibold text-flag-red hover:underline"
                  onClick={() => void remove(item.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
