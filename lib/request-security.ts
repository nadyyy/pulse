import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { hashEmail, hashIdentifier, normalizeEmail } from "@/lib/crypto-security";

type AuthRateScope = "login" | "register";

function envNumber(name: string, fallback: number): number {
  const raw = Number(process.env[name] ?? fallback);
  if (!Number.isFinite(raw) || raw <= 0) {
    return fallback;
  }
  return Math.floor(raw);
}

const WINDOW_MS = envNumber("AUTH_RATE_LIMIT_WINDOW_MS", 10 * 60 * 1000);
const MAX_ATTEMPTS = envNumber("AUTH_RATE_LIMIT_MAX_ATTEMPTS", 8);
const BLOCK_MS = envNumber("AUTH_RATE_LIMIT_BLOCK_MS", 30 * 60 * 1000);

function authLimitKey(scope: AuthRateScope, type: "email" | "ip", value: string): string {
  const digest = type === "email" ? hashEmail(value) : hashIdentifier(value);
  return `auth:${scope}:${type}:${digest}`;
}

export async function getRequestIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const real = h.get("x-real-ip")?.trim();
  if (real) {
    return real;
  }

  return "unknown";
}

export async function isTrustedActionOrigin(): Promise<boolean> {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("x-forwarded-host") ?? h.get("host");

  if (!origin || !host) {
    return true;
  }

  try {
    const originUrl = new URL(origin);
    if (originUrl.host !== host) {
      return false;
    }

    if (process.env.NODE_ENV === "production" && originUrl.protocol !== "https:") {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function getAuthRateLimitState(scope: AuthRateScope, email: string): Promise<{
  keys: string[];
  retryAfterSeconds: number;
}> {
  const normalizedEmail = normalizeEmail(email);
  const ip = await getRequestIp();
  const keys = [authLimitKey(scope, "email", normalizedEmail), authLimitKey(scope, "ip", ip)];

  const rows = await prisma.authRateLimit.findMany({
    where: {
      id: {
        in: keys,
      },
    },
  });

  const now = Date.now();
  let retryAfterSeconds = 0;

  for (const row of rows) {
    if (row.blockedUntil && row.blockedUntil.getTime() > now) {
      const retry = Math.ceil((row.blockedUntil.getTime() - now) / 1000);
      retryAfterSeconds = Math.max(retryAfterSeconds, retry);
    }
  }

  return { keys, retryAfterSeconds };
}

export async function recordAuthFailure(keys: string[]): Promise<void> {
  const now = new Date();
  const windowBoundary = now.getTime() - WINDOW_MS;

  await prisma.$transaction(async (tx) => {
    for (const key of keys) {
      const existing = await tx.authRateLimit.findUnique({
        where: { id: key },
      });

      if (!existing) {
        await tx.authRateLimit.create({
          data: {
            id: key,
            failCount: 1,
            windowStart: now,
          },
        });
        continue;
      }

      if (existing.windowStart.getTime() <= windowBoundary) {
        await tx.authRateLimit.update({
          where: { id: key },
          data: {
            failCount: 1,
            windowStart: now,
            blockedUntil: null,
          },
        });
        continue;
      }

      const nextCount = existing.failCount + 1;
      const shouldBlock = nextCount >= MAX_ATTEMPTS;

      await tx.authRateLimit.update({
        where: { id: key },
        data: {
          failCount: nextCount,
          blockedUntil: shouldBlock ? new Date(now.getTime() + BLOCK_MS) : existing.blockedUntil,
        },
      });
    }
  });
}

export async function clearAuthFailures(keys: string[]): Promise<void> {
  if (keys.length === 0) {
    return;
  }

  await prisma.authRateLimit.deleteMany({
    where: {
      id: {
        in: keys,
      },
    },
  });
}
