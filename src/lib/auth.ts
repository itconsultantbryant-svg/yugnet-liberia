import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  type PermissionKey,
} from "@/lib/permissions";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  permissions: PermissionKey[];
};

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({
    sub: user.id,
    name: user.name,
    email: user.email,
    roleId: user.roleId,
    roleName: user.roleName,
    permissions: user.permissions,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function readSessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub || typeof payload.email !== "string") return null;
    return {
      id: payload.sub,
      name: String(payload.name ?? ""),
      email: payload.email,
      roleId: String(payload.roleId ?? ""),
      roleName: String(payload.roleName ?? ""),
      permissions: Array.isArray(payload.permissions)
        ? (payload.permissions as PermissionKey[])
        : [],
    };
  } catch {
    return null;
  }
}

export async function resolveUserPermissions(userId: string): Promise<PermissionKey[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: { include: { permissions: { include: { permission: true } } } },
      permissionOverrides: { include: { permission: true } },
    },
  });
  if (!user || user.status !== "ACTIVE") return [];

  const set = new Set<string>(
    user.role.permissions.map((rp) => rp.permission.key),
  );

  for (const override of user.permissionOverrides) {
    if (override.granted) set.add(override.permission.key);
    else set.delete(override.permission.key);
  }

  return [...set] as PermissionKey[];
}

export async function buildSessionUser(userId: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
  if (!user || user.status !== "ACTIVE") return null;
  const permissions = await resolveUserPermissions(user.id);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roleId: user.roleId,
    roleName: user.role.name,
    permissions,
  };
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  const sameSite = (process.env.COOKIE_SAMESITE ?? "lax").toLowerCase() as
    | "lax"
    | "strict"
    | "none";
  const secure =
    process.env.COOKIE_SECURE === "true" ||
    (process.env.COOKIE_SECURE !== "false" && process.env.NODE_ENV === "production");

  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite,
    secure: sameSite === "none" ? true : secure,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete({
    name: SESSION_COOKIE,
    path: "/",
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const cached = await readSessionToken(token);
  if (!cached) return null;

  // Re-resolve permissions so role changes apply without re-login
  const fresh = await buildSessionUser(cached.id);
  return fresh;
}

export function hasPermission(
  user: SessionUser | null | undefined,
  permission: PermissionKey | PermissionKey[],
) {
  if (!user) return false;
  const needed = Array.isArray(permission) ? permission : [permission];
  return needed.every((p) => user.permissions.includes(p));
}

export function hasAnyPermission(
  user: SessionUser | null | undefined,
  permissions: PermissionKey[],
) {
  if (!user) return false;
  return permissions.some((p) => user.permissions.includes(p));
}
