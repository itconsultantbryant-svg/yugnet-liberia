"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Can } from "@/components/auth/AuthProvider";

type Role = {
  id: string;
  name: string;
  permissionIds: string[];
};

type Permission = {
  id: string;
  key: string;
  module: string;
  action: string;
  description: string | null;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  role: { id: string; name: string };
  overrides: { permissionKey: string; granted: boolean }[];
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    roleId: "",
  });
  const [overrideMap, setOverrideMap] = useState<Record<string, boolean | null>>({});

  async function load() {
    const [u, r, p] = await Promise.all([
      fetch("/api/users").then((res) => res.json()),
      fetch("/api/roles").then((res) => res.json()),
      fetch("/api/permissions").then((res) => res.json()),
    ]);
    if (u.error || r.error || p.error) {
      setError(u.error || r.error || p.error);
      return;
    }
    setUsers(u.users);
    setRoles(r.roles);
    setPermissions(p.permissions);
    if (!form.roleId && r.roles[0]) {
      setForm((f) => ({ ...f, roleId: r.roles[0].id }));
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === form.roleId),
    [roles, form.roleId],
  );

  const rolePermSet = useMemo(
    () => new Set(selectedRole?.permissionIds ?? []),
    [selectedRole],
  );

  function effectiveGranted(permissionId: string) {
    const override = overrideMap[permissionId];
    if (override === true) return true;
    if (override === false) return false;
    return rolePermSet.has(permissionId);
  }

  function toggleOverride(permissionId: string) {
    const roleHas = rolePermSet.has(permissionId);
    const current = effectiveGranted(permissionId);
    const next = !current;
    setOverrideMap((map) => {
      const copy = { ...map };
      if (next === roleHas) delete copy[permissionId];
      else copy[permissionId] = next;
      return copy;
    });
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const permissionOverrides = Object.entries(overrideMap)
      .filter(([, granted]) => granted !== null && granted !== undefined)
      .map(([permissionId, granted]) => ({ permissionId, granted: Boolean(granted) }));

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        phone: form.phone || undefined,
        permissionOverrides,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to create user");
      return;
    }
    setForm({ name: "", email: "", phone: "", password: "", roleId: form.roleId });
    setOverrideMap({});
    await load();
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Users</h1>
        <p className="mt-2 text-muted">
          Create users with a role and optional permission overrides. Changes take
          effect on the next request without requiring re-login.
        </p>
      </div>

      {error && (
        <p className="rounded-md border border-flag-red/30 bg-flag-red/10 px-3 py-2 text-sm text-flag-red">
          {error}
        </p>
      )}

      <Can permission="users.manage">
        <form
          onSubmit={createUser}
          className="space-y-4 border-t-2 border-brand bg-white p-6"
        >
          <h2 className="font-display text-xl font-bold text-ink">Create user</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["name", "Full name", "text"],
                ["email", "Email", "email"],
                ["phone", "Phone", "tel"],
                ["password", "Temporary password", "password"],
              ] as const
            ).map(([key, label, type]) => (
              <div key={key}>
                <label className="mb-1 block text-sm font-semibold" htmlFor={key}>
                  {label}
                </label>
                <input
                  id={key}
                  type={type}
                  required={key !== "phone"}
                  minLength={key === "password" ? 8 : undefined}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-semibold" htmlFor="roleId">
                Role
              </label>
              <select
                id="roleId"
                value={form.roleId}
                onChange={(e) => {
                  setForm((f) => ({ ...f, roleId: e.target.value }));
                  setOverrideMap({});
                }}
                className="w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-ink">
              Permission checklist (defaults from role — toggle to override)
            </p>
            <div className="grid max-h-64 gap-2 overflow-y-auto border border-line p-3 sm:grid-cols-2">
              {permissions.map((p) => {
                const checked = effectiveGranted(p.id);
                const overridden = overrideMap[p.id] !== undefined;
                return (
                  <label
                    key={p.id}
                    className="flex items-start gap-2 text-sm text-ink"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOverride(p.id)}
                      className="mt-1 accent-[var(--brand-green)]"
                    />
                    <span>
                      <span className="font-semibold">{p.key}</span>
                      {overridden && (
                        <span className="ml-2 text-xs font-bold uppercase text-flag-red">
                          override
                        </span>
                      )}
                      <span className="block text-xs text-muted">{p.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Creating…" : "Create user"}
          </Button>
        </form>
      </Can>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Email</th>
              <th className="py-2 pr-3">Role</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2">Overrides</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line/70">
                <td className="py-3 pr-3 font-semibold text-ink">{u.name}</td>
                <td className="py-3 pr-3 text-muted">{u.email}</td>
                <td className="py-3 pr-3">{u.role.name}</td>
                <td className="py-3 pr-3">{u.status}</td>
                <td className="py-3 text-muted">
                  {u.overrides.length
                    ? u.overrides
                        .map((o) => `${o.granted ? "+" : "-"}${o.permissionKey}`)
                        .join(", ")
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
