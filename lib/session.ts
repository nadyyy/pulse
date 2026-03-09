import { cookies } from "next/headers";

import {
  createOpaqueToken,
  encodeSignedValue,
  verifySignedValue,
} from "@/lib/crypto-security";

const CART_SESSION_COOKIE = "cart_session_id";

export async function getCartSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_SESSION_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  const verified = verifySignedValue(raw);
  if (verified) {
    return verified;
  }

  // Backward compatibility for pre-signed cookies in local/dev environments.
  if (/^[a-zA-Z0-9_-]{12,}$/.test(raw)) {
    return raw;
  }

  return null;
}

export async function ensureCartSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existingRaw = cookieStore.get(CART_SESSION_COOKIE)?.value;
  if (existingRaw) {
    const existingVerified = verifySignedValue(existingRaw);
    if (existingVerified) {
      return existingVerified;
    }

    if (/^[a-zA-Z0-9_-]{12,}$/.test(existingRaw)) {
      cookieStore.set(CART_SESSION_COOKIE, encodeSignedValue(existingRaw), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return existingRaw;
    }
  }

  const created = createOpaqueToken();
  cookieStore.set(CART_SESSION_COOKIE, encodeSignedValue(created), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return created;
}
