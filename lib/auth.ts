import type { PermissionKey, User, UserRole } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "session_token";
const SESSION_DAYS = 14;

export type AuthUser = User & { permissions: { key: PermissionKey }[] };
type PermissionInput = PermissionKey | `${PermissionKey}`;

function sessionExpiryDate(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
  return expiresAt;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function createSession(userId: string): Promise<void> {
  const id = crypto.randomUUID();
  const expiresAt = sessionExpiryDate();

  await prisma.session.create({
    data: {
      id,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { id: token } });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { id: token },
    include: {
      user: {
        include: {
          permissions: {
            select: {
              key: true,
            },
          },
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.deleteMany({ where: { id: session.id } });
    }
    return null;
  }

  return session.user;
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

function hasAdminRole(role: UserRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canAccessAdminPanel(user: AuthUser | null): boolean {
  if (!user) {
    return false;
  }
  return (
    hasAdminRole(user.role) || (user.role === "STAFF" && user.permissions.length > 0)
  );
}

function hasPermission(user: AuthUser, key: PermissionInput): boolean {
  if (hasAdminRole(user.role)) {
    return true;
  }
  return user.permissions.some((permission) => permission.key === key);
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireUser();
  if (!canAccessAdminPanel(user)) {
    redirect("/");
  }

  return user;
}

export async function requirePermission(key: PermissionInput): Promise<AuthUser> {
  const user = await requireAdmin();
  if (!hasPermission(user, key)) {
    redirect("/admin");
  }
  return user;
}

export async function requireProductEditor(): Promise<AuthUser> {
  const user = await requireAdmin();
  if (hasAdminRole(user.role)) {
    return user;
  }

  const allowed = user.permissions.some(
    (permission) => permission.key === "PRODUCTS_WRITE",
  );
  if (!allowed) {
    redirect("/admin");
  }

  return user;
}

export async function requireUsersManage(): Promise<AuthUser> {
  const user = await requireAdmin();
  if (user.role === "OWNER") {
    return user;
  }

  const allowed = user.permissions.some(
    (permission) => permission.key === "USERS_MANAGE",
  );
  if (!allowed) {
    redirect("/admin");
  }

  return user;
}
