"use client";

import { useEffect, useState } from "react";

type Log = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
  before: unknown;
  after: unknown;
};

export default function AuditPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/audit?take=100");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load audit log");
        return;
      }
      setLogs(data.logs);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Audit Log</h1>
        <p className="mt-2 text-muted">
          Administrative actions on users, roles, and authentication events.
        </p>
      </div>

      {error && (
        <p className="rounded-md border border-flag-red/30 bg-flag-red/10 px-3 py-2 text-sm text-flag-red">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {logs.map((log) => (
          <article
            key={log.id}
            className="border-l-4 border-brand bg-white px-4 py-3 text-sm"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold text-ink">
                {log.action} · {log.entity}
                {log.entityId ? ` · ${log.entityId.slice(0, 8)}…` : ""}
              </p>
              <time className="text-xs text-muted">
                {new Date(log.createdAt).toLocaleString()}
              </time>
            </div>
            <p className="mt-1 text-muted">
              {log.user ? `${log.user.name} (${log.user.email})` : "System"}
            </p>
          </article>
        ))}
        {!logs.length && !error && (
          <p className="text-sm text-muted">No audit events yet.</p>
        )}
      </div>
    </div>
  );
}
