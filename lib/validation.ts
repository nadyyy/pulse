import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(128),
});

export const productSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().min(2).max(220),
  description: z.string().min(10).max(4000),
  brand: z.string().min(2).max(100),
  active: z.boolean(),
});

export const variantSchema = z.object({
  sku: z.string().min(3).max(120),
  size: z.string().max(24).optional(),
  color: z.string().max(40).optional(),
  priceCents: z.number().int().nonnegative(),
  compareAtCents: z.number().int().nonnegative().nullable(),
  stock: z.number().int().nonnegative(),
});

export const checkoutSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z.string().min(7).max(24),
  city: z.string().min(2).max(80),
  address: z.string().min(4).max(220),
});

export function parseFormString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export function parseOptionalFormString(
  value: FormDataEntryValue | null,
): string | undefined {
  const parsed = parseFormString(value);
  return parsed.length === 0 ? undefined : parsed;
}

export function parseFormInt(value: FormDataEntryValue | null, fallback = 0): number {
  const raw = typeof value === "string" ? value : "";
  const n = Number.parseInt(raw, 10);
  return Number.isNaN(n) ? fallback : n;
}
