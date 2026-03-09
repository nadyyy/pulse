"use server";

import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { hashEmail, normalizeEmail } from "@/lib/crypto-security";
import { prisma } from "@/lib/prisma";
import {
  clearAuthFailures,
  getAuthRateLimitState,
  isTrustedActionOrigin,
  recordAuthFailure,
} from "@/lib/request-security";
import { credentialsSchema, parseFormString, strongPasswordSchema } from "@/lib/validation";

function encodeError(message: string): string {
  return encodeURIComponent(message);
}

function isBootstrapAdminEmail(email: string): boolean {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_BOOTSTRAP_ADMIN !== "true") {
    return false;
  }

  const raw = process.env.BOOTSTRAP_ADMIN_EMAILS ?? "";
  const emails = raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return emails.includes(email);
}

export async function registerAction(formData: FormData): Promise<void> {
  if (!(await isTrustedActionOrigin())) {
    redirect(`/register?error=${encodeError("Security check failed")}`);
  }

  const parsed = credentialsSchema.safeParse({
    email: parseFormString(formData.get("email")),
    password: parseFormString(formData.get("password")),
  });

  if (!parsed.success) {
    redirect(`/register?error=${encodeError("Invalid email or password")}`);
  }

  const email = normalizeEmail(parsed.data.email);
  const emailHash = hashEmail(email);

  if (!strongPasswordSchema.safeParse(parsed.data.password).success) {
    redirect(
      `/register?error=${encodeError(
        "Password must be at least 10 chars and include upper, lower, and number",
      )}`,
    );
  }

  const registerRateLimit = await getAuthRateLimitState("register", email);
  if (registerRateLimit.retryAfterSeconds > 0) {
    redirect(
      `/register?error=${encodeError(
        `Too many attempts. Try again in ${registerRateLimit.retryAfterSeconds}s`,
      )}`,
    );
  }

  const existing = await prisma.user.findUnique({
    where: { emailHash },
    select: { id: true, emailHash: true, email: true },
  });

  if (existing) {
    await recordAuthFailure(registerRateLimit.keys);
    redirect(`/register?error=${encodeError("Email already registered")}`);
  }

  const legacyMatch = await prisma.user.findFirst({
    where: {
      email: email,
    },
    select: { id: true },
  });
  if (legacyMatch) {
    await recordAuthFailure(registerRateLimit.keys);
    redirect(`/register?error=${encodeError("Email already registered")}`);
  }

  const user = await prisma.user.create({
    data: {
      email,
      emailHash,
      passwordHash: await hashPassword(parsed.data.password),
      role: isBootstrapAdminEmail(email)
        ? UserRole.ADMIN
        : UserRole.CUSTOMER,
    },
  });

  await clearAuthFailures(registerRateLimit.keys);
  await createSession(user.id);
  redirect("/");
}

export async function loginAction(formData: FormData): Promise<void> {
  if (!(await isTrustedActionOrigin())) {
    redirect(`/login?error=${encodeError("Security check failed")}`);
  }

  const parsed = credentialsSchema.safeParse({
    email: parseFormString(formData.get("email")),
    password: parseFormString(formData.get("password")),
  });

  if (!parsed.success) {
    redirect(`/login?error=${encodeError("Invalid credentials")}`);
  }

  const email = normalizeEmail(parsed.data.email);
  const emailHash = hashEmail(email);
  const loginRateLimit = await getAuthRateLimitState("login", email);
  if (loginRateLimit.retryAfterSeconds > 0) {
    redirect(
      `/login?error=${encodeError(
        `Too many attempts. Try again in ${loginRateLimit.retryAfterSeconds}s`,
      )}`,
    );
  }

  let user = await prisma.user.findUnique({
    where: { emailHash },
  });

  if (!user) {
    user = await prisma.user.findFirst({
      where: { email },
    });
  }

  if (!user) {
    await recordAuthFailure(loginRateLimit.keys);
    redirect(`/login?error=${encodeError("Invalid credentials")}`);
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    await recordAuthFailure(loginRateLimit.keys);
    redirect(`/login?error=${encodeError("Invalid credentials")}`);
  }

  if (user.emailHash !== emailHash || user.email !== email) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        emailHash,
      },
    });
  }

  if (isBootstrapAdminEmail(email) && user.role === UserRole.CUSTOMER) {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: UserRole.ADMIN },
    });
  }

  await clearAuthFailures(loginRateLimit.keys);
  await destroySession();
  await createSession(user.id);

  const next = parseFormString(formData.get("next"));
  if (next.startsWith("/") && !next.startsWith("//")) {
    redirect(next);
  }

  redirect("/");
}

export async function logoutAction(): Promise<void> {
  if (!(await isTrustedActionOrigin())) {
    redirect("/");
  }

  await destroySession();
  redirect("/");
}
