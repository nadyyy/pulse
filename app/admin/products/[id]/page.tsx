import Image from "next/image";
import { notFound } from "next/navigation";

import {
  createImageAction,
  createVariantAction,
  deleteImageAction,
  deleteProductAction,
  deleteVariantAction,
  setVariantStockAction,
  updateProductAction,
  updateVariantAction,
} from "@/app/actions/admin";
import { getAdminAssignableCategories } from "@/lib/admin-categories";
import { requirePermission } from "@/lib/auth";
import { resolveProductImageUrl } from "@/lib/product-images";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminProductDetailPage({ params }: PageProps) {
  const user = await requirePermission("PRODUCTS_READ");
  const canWrite =
    user.role === "OWNER" ||
    user.role === "ADMIN" ||
    user.permissions.some((permission) => permission.key === "PRODUCTS_WRITE");

  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          orderBy: {
            sku: "asc",
          },
        },
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        categories: true,
      },
    }),
    getAdminAssignableCategories(),
  ]);

  if (!product) {
    notFound();
  }

  const selectedCategoryIds = new Set(product.categories.map((row) => row.categoryId));

  return (
    <div className="stack">
      <h1>Manage Product</h1>

      <form action={updateProductAction} className="card stack">
        <input type="hidden" name="productId" value={product.id} />
        <div className="grid-2">
          <label className="field">
            <span>Title</span>
            <input
              name="title"
              defaultValue={product.title}
              required
              disabled={!canWrite}
            />
          </label>
          <label className="field">
            <span>Slug</span>
            <input
              name="slug"
              defaultValue={product.slug}
              required
              disabled={!canWrite}
            />
          </label>
          <label className="field">
            <span>Brand</span>
            <input
              name="brand"
              defaultValue={product.brand}
              required
              disabled={!canWrite}
            />
          </label>
          <label className="row">
            <input
              type="checkbox"
              name="active"
              defaultChecked={product.active}
              disabled={!canWrite}
            />
            <span>Active</span>
          </label>
          <label className="field grid-span-2">
            <span>Description</span>
            <textarea
              name="description"
              defaultValue={product.description}
              rows={4}
              required
              disabled={!canWrite}
            />
          </label>
        </div>

        <div className="checkbox-grid">
          {categories.map((category) => (
            <label key={category.id} className="row">
              <input
                type="checkbox"
                name="categoryIds"
                value={category.id}
                defaultChecked={selectedCategoryIds.has(category.id)}
                disabled={!canWrite}
              />
              <span>{category.label}</span>
            </label>
          ))}
        </div>

        <button className="button" type="submit" disabled={!canWrite}>
          Save Product
        </button>
      </form>

      {canWrite ? (
        <form action={deleteProductAction} className="card stack">
          <input type="hidden" name="productId" value={product.id} />
          <button type="submit" className="button danger">
            Delete Product
          </button>
        </form>
      ) : null}

      <section className="card stack">
        <h2>Variants</h2>
        {product.variants.map((variant) => (
          <form
            key={variant.id}
            action={updateVariantAction}
            className="row wrap-end variant-form"
          >
            <input type="hidden" name="variantId" value={variant.id} />
            <input type="hidden" name="productId" value={product.id} />
            <input name="sku" defaultValue={variant.sku} required disabled={!canWrite} />
            <input
              name="size"
              defaultValue={variant.size ?? ""}
              placeholder="Size"
              disabled={!canWrite}
            />
            <input
              name="color"
              defaultValue={variant.color ?? ""}
              placeholder="Color"
              disabled={!canWrite}
            />
            <input
              type="number"
              name="priceCents"
              defaultValue={variant.priceCents}
              placeholder="Price"
              disabled={!canWrite}
            />
            <input
              type="number"
              name="compareAtCents"
              defaultValue={variant.compareAtCents ?? ""}
              placeholder="Compare"
              disabled={!canWrite}
            />
            <input
              type="number"
              name="stock"
              defaultValue={variant.stock}
              placeholder="Stock"
              disabled={!canWrite}
            />
            <button type="submit" className="button ghost" disabled={!canWrite}>
              Save
            </button>
            <input
              type="hidden"
              name="nextStock"
              value={variant.stock > 0 ? 0 : 10}
            />
            <button
              formAction={setVariantStockAction}
              type="submit"
              className="button ghost"
              disabled={!canWrite}
            >
              {variant.stock > 0 ? "Sold Out" : "Restock 10"}
            </button>
            <button
              formAction={deleteVariantAction}
              type="submit"
              className="button danger"
              disabled={!canWrite}
            >
              Delete
            </button>
          </form>
        ))}

        <form action={createVariantAction} className="row wrap-end variant-form">
          <input type="hidden" name="productId" value={product.id} />
          <input name="sku" placeholder="SKU" required disabled={!canWrite} />
          <input name="size" placeholder="Size" disabled={!canWrite} />
          <input name="color" placeholder="Color" disabled={!canWrite} />
          <input
            type="number"
            name="priceCents"
            placeholder="Price cents"
            required
            disabled={!canWrite}
          />
          <input
            type="number"
            name="compareAtCents"
            placeholder="Compare cents"
            disabled={!canWrite}
          />
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            required
            disabled={!canWrite}
          />
          <button type="submit" className="button" disabled={!canWrite}>
            Add Variant
          </button>
        </form>
      </section>

      <section className="card stack">
        <h2>Images</h2>
        <div className="admin-image-grid">
          {product.images.map((image) => (
            <article key={image.id} className="stack">
              <Image
                src={resolveProductImageUrl(image.url)}
                alt={image.alt}
                width={260}
                height={260}
              />
              <p className="muted">{image.alt}</p>
              <form action={deleteImageAction}>
                <input type="hidden" name="imageId" value={image.id} />
                <input type="hidden" name="productId" value={product.id} />
                <button type="submit" className="button danger" disabled={!canWrite}>
                  Remove
                </button>
              </form>
            </article>
          ))}
        </div>

        <form action={createImageAction} className="stack">
          <input type="hidden" name="productId" value={product.id} />
          <label className="field">
            <span>Upload Image</span>
            <input
              type="file"
              name="imageFile"
              accept="image/*"
              capture="environment"
              required
              disabled={!canWrite}
            />
          </label>
          <div className="grid-2">
            <label className="field">
              <span>Alt text (optional)</span>
              <input name="alt" placeholder="Product image" disabled={!canWrite} />
            </label>
            <label className="field">
              <span>Sort Order</span>
              <input type="number" name="sortOrder" defaultValue={product.images.length} disabled={!canWrite} />
            </label>
          </div>
          <button type="submit" className="button" disabled={!canWrite}>
            Add Image
          </button>
        </form>
      </section>
    </div>
  );
}
