import { productPhotoFromLegacyPath } from "@/lib/curated-images";

export function resolveProductImageUrl(url: string): string {
  return productPhotoFromLegacyPath(url) ?? url;
}
