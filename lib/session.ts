import { cookies } from "next/headers";

const CART_SESSION_COOKIE = "cart_session_id";

export async function getCartSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_SESSION_COOKIE)?.value ?? null;
}

export async function ensureCartSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_SESSION_COOKIE)?.value;

  if (existing) {
    return existing;
  }

  const created = crypto.randomUUID();
  cookieStore.set(CART_SESSION_COOKIE, created, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return created;
}
