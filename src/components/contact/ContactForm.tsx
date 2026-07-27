"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus("error");
      setError(data.error ?? "Could not send message");
      return;
    }
    setStatus("ok");
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 bg-white p-6 shadow-[0_0_0_1px_var(--brand-line)] sm:p-8"
    >
      {(
        [
          ["name", "Full name", "text"],
          ["email", "Email", "email"],
        ] as const
      ).map(([key, label, type]) => (
        <div key={key}>
          <label htmlFor={key} className="mb-1 block text-sm font-semibold text-ink">
            {label}
          </label>
          <input
            id={key}
            name={key}
            type={type}
            required
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
          />
        </div>
      ))}
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-semibold text-ink">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          minLength={10}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className="w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
        />
      </div>
      {error && <p className="text-sm text-flag-red">{error}</p>}
      {status === "ok" && (
        <p className="text-sm text-brand">Message sent. We will get back to you soon.</p>
      )}
      <Button type="submit" className="w-full sm:w-auto" disabled={status === "saving"}>
        {status === "saving" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
