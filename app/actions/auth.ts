"use server";

import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { credentialsSchema, parseFormString } from "@/lib/validation";

function encodeError(message: string): string {
  return encodeURIComponent(message);
}

function isBootstrapAdminEmail(email: string): boolean {
  const raw = process.env.BOOTSTRAP_ADMIN_EMAILS ?? "admin@demo.com";
  const emails = raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return emails.includes(email);
}

export async function registerAction(formData: FormData): Promise<void> {
  const parsed = credentialsSchema.safeParse({
    email: parseFormString(formData.get("email")),
    password: parseFormString(formData.get("password")),
  });

  if (!parsed.success) {
    redirect(`/register?error=${encodeError("Invalid email or password")}`);
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existing) {
    redirect(`/register?error=${encodeError("Email already registered")}`);
  }

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      role: isBootstrapAdminEmail(parsed.data.email)
        ? UserRole.ADMIN
        : UserRole.CUSTOMER,
    },
  });

  await createSession(user.id);
  redirect("/");
}

export async function loginAction(formData: FormData): Promise<void> {
  const parsed = credentialsSchema.safeParse({
    email: parseFormString(formData.get("email")),
    password: parseFormString(formData.get("password")),
  });

  if (!parsed.success) {
    redirect(`/login?error=${encodeError("Invalid credentials")}`);
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (!user) {
    redirect(`/login?error=${encodeError("Invalid credentials")}`);
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    redirect(`/login?error=${encodeError("Invalid credentials")}`);
  }

  if (isBootstrapAdminEmail(user.email) && user.role === UserRole.CUSTOMER) {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: UserRole.ADMIN },
    });
  }

  await createSession(user.id);

  const next = parseFormString(formData.get("next"));
  if (next.startsWith("/") && !next.startsWith("//")) {
    redirect(next);
  }

  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
