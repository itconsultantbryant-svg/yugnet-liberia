"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type Permission = {
  id: string;
  key: string;
  module: string;
  description: string | null;
};

type Role = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  userCount: number;
  permissionIds: string[];
  permissionKeys: string[];
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const [r, p] = await Promise.all([
      fetch("/api/roles").then((res) => res.json()),
      fetch("/api/permissions").then((res) => res.json()),
    ]);
    if (r.error || p.error) {
      setError(r.error || p.error);
      return;
    }
    setRoles(r.roles);
    setPermissions(p.permissions);
    if (!selectedId && r.roles[0]) {
      selectRole(r.roles[0]);
    } else if (selectedId) {
      const current = r.roles.find((role: Role) => role.id === selectedId);
      if (current) selectRole(current);
    }
  }

  function selectRole(role: Role) {
    setSelectedId(role.id);
    setName(role.name);
    setDescription(role.description ?? "");
    setSelectedPerms(role.permissionIds);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function togglePerm(id: string) {
    setSelectedPerms((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function saveRole() {
    setError(null);
    setMessage(null);
    if (!selectedId) return;
    const res = await fetch(`/api/roles/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        permissionIds: selectedPerms,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    setMessage("Role updated. Affected users will see new permissions immediately.");
    await load();
  }

  async function createRole() {
    setError(null);
    setMessage(null);
    const res = await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Custom Role",
        description: "Custom permission set",
        permissionIds: [],
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Create failed");
      return;
    }
    await load();
    selectRole({
      id: data.role.id,
      name: data.role.name,
      description: data.role.description,
      isSystem: false,
      userCount: 0,
      permissionIds: [],
      permissionKeys: [],
    });
  }

  const modules = [...new Set(permissions.map((p) => p.module))];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Roles & Permissions</h1>
          <p className="mt-2 text-muted">
            Assign module-scoped permissions to roles. System roles can be edited but not deleted.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => void createRole()}>
          New custom role
        </Button>
      </div>

      {error && (
        <p className="rounded-md border border-flag-red/30 bg-flag-red/10 px-3 py-2 text-sm text-flag-red">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-md border border-brand/30 bg-brand-mist px-3 py-2 text-sm text-brand">
          {message}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="space-y-2">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => selectRole(role)}
              className={`w-full rounded-md px-3 py-3 text-left text-sm font-semibold ${
                selectedId === role.id
                  ? "bg-brand text-white"
                  : "bg-white text-ink hover:bg-brand-mist"
              }`}
            >
              {role.name}
              <span className="mt-1 block text-xs font-normal opacity-80">
                {role.userCount} users · {role.permissionKeys.length} perms
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-4 bg-white p-6 shadow-[0_0_0_1px_var(--brand-line)]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold" htmlFor="roleName">
                Role name
              </label>
              <input
                id="roleName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold" htmlFor="roleDesc">
                Description
              </label>
              <input
                id="roleDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="space-y-4">
            {modules.map((module) => (
              <div key={module}>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand">
                  {module}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {permissions
                    .filter((p) => p.module === module)
                    .map((p) => (
                      <label key={p.id} className="flex items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedPerms.includes(p.id)}
                          onChange={() => togglePerm(p.id)}
                          className="mt-1 accent-[var(--brand-green)]"
                        />
                        <span>
                          <span className="font-semibold">{p.key}</span>
                          <span className="block text-xs text-muted">{p.description}</span>
                        </span>
                      </label>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <Button type="button" onClick={() => void saveRole()}>
            Save role matrix
          </Button>
        </div>
      </div>
    </div>
  );
}
