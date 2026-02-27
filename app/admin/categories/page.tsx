import { CategoryGroup } from "@prisma/client";

import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/actions/admin";
import { STOREFRONT_GROUPS } from "@/lib/admin-categories";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminCategoriesPage() {
  await requirePermission("CATEGORIES_WRITE");

  const categories = await prisma.category.findMany({
    where: {
      group: {
        in: STOREFRONT_GROUPS,
      },
    },
    orderBy: [{ group: "asc" }, { parentId: "asc" }, { sortOrder: "asc" }],
    include: {
      parent: true,
    },
  });

  return (
    <div className="stack">
      <h1>Categories</h1>
      <form action={createCategoryAction} className="card stack">
        <h2>Create Category</h2>
        <div className="grid-2">
          <label className="field">
            <span>Name</span>
            <input name="name" required />
          </label>
          <label className="field">
            <span>Group</span>
            <select name="group" required>
              {Object.values(CategoryGroup)
                .filter((group) => STOREFRONT_GROUPS.includes(group))
                .map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
                ))}
            </select>
          </label>
          <label className="field">
            <span>Parent</span>
            <select name="parentId" defaultValue="">
              <option value="">(root)</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.group} / {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Sort Order</span>
            <input type="number" name="sortOrder" defaultValue={0} />
          </label>
        </div>
        <button className="button" type="submit">
          Create
        </button>
      </form>

      {categories.map((category) => (
        <article key={category.id} className="card">
          <form action={updateCategoryAction} className="row wrap-end">
            <input type="hidden" name="id" value={category.id} />
            <input name="name" defaultValue={category.name} required />
            <input type="number" name="sortOrder" defaultValue={category.sortOrder} />
            <span className="muted">{category.group}</span>
            <span className="muted">Parent: {category.parent?.name ?? "root"}</span>
            <button type="submit" className="button ghost">
              Save
            </button>
            <button
              formAction={deleteCategoryAction}
              type="submit"
              className="button danger"
            >
              Delete
            </button>
          </form>
        </article>
      ))}
    </div>
  );
}
