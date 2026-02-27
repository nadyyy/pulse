import Link from "next/link";

import { createProductAction } from "@/app/actions/admin";
import { getAdminAssignableCategories } from "@/lib/admin-categories";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  const user = await requirePermission("PRODUCTS_READ");
  const canWrite =
    user.role === "OWNER" ||
    user.role === "ADMIN" ||
    user.permissions.some((permission) => permission.key === "PRODUCTS_WRITE");

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        variants: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    getAdminAssignableCategories(),
  ]);

  return (
    <div className="stack">
      <h1>Products</h1>
      {canWrite ? (
        <form action={createProductAction} className="card stack" encType="multipart/form-data">
          <h2>Create Product</h2>
          <p className="muted">
            Add core details, choose categories, and upload a product photo from your
            device.
          </p>
          <div className="grid-2">
            <label className="field">
              <span>Title</span>
              <input name="title" required />
            </label>
            <label className="field">
              <span>Brand</span>
              <input name="brand" required defaultValue="Nike" />
            </label>
            <label className="field grid-span-2">
              <span>Description</span>
              <textarea name="description" rows={3} required />
            </label>
            <label className="field">
              <span>Default Price (cents)</span>
              <input
                type="number"
                name="priceCents"
                min={1000}
                defaultValue={12000}
                required
              />
            </label>
            <label className="field">
              <span>Default Stock</span>
              <input type="number" name="stock" min={0} defaultValue={15} required />
            </label>
            <label className="field grid-span-2">
              <span>Product Image (optional)</span>
              <input
                type="file"
                name="imageFile"
                accept="image/*"
                capture="environment"
              />
              <small className="muted">Choose a file or take a photo on mobile.</small>
            </label>
            <label className="field">
              <span>Initial Image Alt (optional)</span>
              <input name="imageAlt" placeholder="Product image alt text" />
            </label>
          </div>
          <label className="field">
            <span>Categories</span>
            <div className="checkbox-grid">
              {categories.map((category) => (
                <label key={category.id} className="row">
                  <input type="checkbox" name="categoryIds" value={category.id} />
                  <span>{category.label}</span>
                </label>
              ))}
            </div>
          </label>
          <label className="row">
            <input type="checkbox" name="active" defaultChecked />
            <span>Active</span>
          </label>
          <button type="submit" className="button">
            Create
          </button>
        </form>
      ) : (
        <article className="card">
          <p className="muted">
            Read-only access: PRODUCTS_WRITE permission required to edit.
          </p>
        </article>
      )}

      <section className="stack">
        {products.map((product) => (
          <article key={product.id} className="card row spread middle">
            <div>
              <h3>{product.title}</h3>
              <p className="muted">
                {product.brand} · {product.active ? "Active" : "Inactive"} ·{" "}
                {product.variants.length} variants
              </p>
            </div>
            <Link className="button ghost" href={`/admin/products/${product.id}`}>
              Manage
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
