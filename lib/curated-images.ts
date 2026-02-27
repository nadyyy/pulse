export type RootSlug = "men" | "women" | "kids" | "sport" | "sale";
export type AudienceSlug = "men" | "women" | "kids";

export const HERO_MODEL_IMAGES: Record<"men" | "women", string> = {
  men: "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=1400&q=80",
  women:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80",
};

export const ROOT_CATEGORY_MODEL_IMAGES: Record<RootSlug, string> = {
  men: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1200&q=80",
  women:
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
  kids: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1200&q=80",
  sport:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
  sale: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
};

export const PRODUCT_PHOTO_POOLS: Record<
  AudienceSlug,
  {
    shoe: readonly string[];
    apparel: readonly string[];
  }
> = {
  men: {
    shoe: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1200&q=80",
    ],
    apparel: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506629905607-bb5b0f7d4a07?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  women: {
    shoe: [
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80",
    ],
    apparel: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  kids: {
    shoe: [
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1200&q=80",
    ],
    apparel: [
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&q=80",
    ],
  },
};

export const SHOE_PRODUCT_IMAGES: readonly string[] = Array.from(
  new Set([
    ...PRODUCT_PHOTO_POOLS.men.shoe,
    ...PRODUCT_PHOTO_POOLS.women.shoe,
    ...PRODUCT_PHOTO_POOLS.kids.shoe,
  ]),
);

export const APPAREL_PRODUCT_IMAGES: readonly string[] = Array.from(
  new Set([
    ...PRODUCT_PHOTO_POOLS.men.apparel,
    ...PRODUCT_PHOTO_POOLS.women.apparel,
    ...PRODUCT_PHOTO_POOLS.kids.apparel,
  ]),
);

function mod(index: number, length: number): number {
  return ((index % length) + length) % length;
}

export function pickByIndex<T>(values: readonly T[], index: number): T {
  return values[mod(index, values.length)];
}

export function audienceFromTitle(title: string): AudienceSlug {
  const lower = title.toLowerCase();
  if (lower.includes("women")) {
    return "women";
  }
  if (lower.includes("kids")) {
    return "kids";
  }
  return "men";
}

export function productPhotoByType(type: "shoe" | "apparel", index: number): string {
  const pool = PRODUCT_PHOTO_POOLS.men[type];
  return pickByIndex(pool, index);
}

export function productPhotoByAudience(
  audience: AudienceSlug,
  type: "shoe" | "apparel",
  index: number,
): string {
  return pickByIndex(PRODUCT_PHOTO_POOLS[audience][type], index);
}

export function parseLegacyProductPath(
  url: string,
): { type: "shoe" | "apparel"; index: number } | null {
  const shoeMatch = url.match(/\/products\/shoe-(\d{3})\.png$/);
  if (shoeMatch) {
    const value = Number.parseInt(shoeMatch[1], 10);
    if (!Number.isNaN(value)) {
      return { type: "shoe", index: value - 1 };
    }
  }

  const apparelMatch = url.match(/\/products\/apparel-(\d{3})\.png$/);
  if (apparelMatch) {
    const value = Number.parseInt(apparelMatch[1], 10);
    if (!Number.isNaN(value)) {
      return { type: "apparel", index: value - 1 };
    }
  }

  return null;
}

export function productPhotoFromLegacyPath(url: string): string | null {
  const parsed = parseLegacyProductPath(url);
  return parsed ? productPhotoByType(parsed.type, parsed.index) : null;
}
