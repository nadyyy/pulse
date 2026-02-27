export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function clamp(min: number, value: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export function parseIntParam(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}
