import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "avif", "gif"]);

function sanitizeSegment(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-");
}

function resolveExtension(file: File): string {
  const byMime = MIME_TO_EXT[file.type];
  if (byMime) {
    return byMime;
  }

  const extFromName = path.extname(file.name).toLowerCase().replace(".", "");
  if (ALLOWED_EXTENSIONS.has(extFromName)) {
    return extFromName;
  }

  return "jpg";
}

export async function saveUploadedProductImage(
  file: FormDataEntryValue | null,
  productSlug: string,
): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    return null;
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return null;
  }

  const ext = resolveExtension(file);
  const safeSlug = sanitizeSegment(productSlug) || "product";
  const filename = `${safeSlug}-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(uploadsDir, { recursive: true });

  const outputPath = path.join(uploadsDir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(outputPath, bytes);

  return `/uploads/products/${filename}`;
}

