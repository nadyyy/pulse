import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";

const DEV_FALLBACK_PEPPER = "dev-only-auth-pepper-change-me";
let warnedMissingPepper = false;

function getSecurityPepper(): string {
  const pepper = process.env.AUTH_PEPPER?.trim();
  if (pepper) {
    return pepper;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_PEPPER is required in production.");
  }

  if (!warnedMissingPepper) {
    warnedMissingPepper = true;
    console.warn("AUTH_PEPPER is not set. Using insecure development fallback.");
  }

  return DEV_FALLBACK_PEPPER;
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function hashEmail(value: string): string {
  return createHmac("sha256", getSecurityPepper())
    .update(normalizeEmail(value))
    .digest("hex");
}

export function hashIdentifier(value: string): string {
  return createHmac("sha256", getSecurityPepper())
    .update(value.trim().toLowerCase())
    .digest("hex");
}

export function createOpaqueToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function signValue(value: string): string {
  return createHmac("sha256", getSecurityPepper()).update(value).digest("base64url");
}

export function encodeSignedValue(value: string): string {
  return `${value}.${signValue(value)}`;
}

export function verifySignedValue(raw: string): string | null {
  const split = raw.lastIndexOf(".");
  if (split < 1 || split === raw.length - 1) {
    return null;
  }

  const value = raw.slice(0, split);
  const signature = raw.slice(split + 1);
  const expected = signValue(value);

  try {
    const valid = timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    return valid ? value : null;
  } catch {
    return null;
  }
}

