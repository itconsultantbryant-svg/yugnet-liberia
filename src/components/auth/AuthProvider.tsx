"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { PermissionKey } from "@/lib/permissions";

export type ClientUser = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  permissions: PermissionKey[];
};

type AuthContextValue = {
  user: ClientUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  can: (permission: PermissionKey | PermissionKey[]) => boolean;
  canAny: (permissions: PermissionKey[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  initialUser = null,
  children,
}: {
  initialUser?: ClientUser | null;
  children: ReactNode;
}) {
  const [user, setUser] = useState<ClientUser | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialUser) void refresh();
    const id = window.setInterval(() => void refresh(), 30_000);
    return () => window.clearInterval(id);
  }, [initialUser, refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/training/login";
  }, []);

  const can = useCallback(
    (permission: PermissionKey | PermissionKey[]) => {
      if (!user) return false;
      const needed = Array.isArray(permission) ? permission : [permission];
      return needed.every((p) => user.permissions.includes(p));
    },
    [user],
  );

  const canAny = useCallback(
    (permissions: PermissionKey[]) => {
      if (!user) return false;
      return permissions.some((p) => user.permissions.includes(p));
    },
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout, can, canAny }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Hide children unless the user has the required permission(s). */
export function Can({
  permission,
  any,
  children,
  fallback = null,
}: {
  permission?: PermissionKey | PermissionKey[];
  any?: PermissionKey[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { can, canAny, loading } = useAuth();
  if (loading) return null;
  const allowed = any ? canAny(any) : permission ? can(permission) : false;
  return <>{allowed ? children : fallback}</>;
}
