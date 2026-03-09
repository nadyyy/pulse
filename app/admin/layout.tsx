import Link from "next/link";
import { PermissionKey } from "@prisma/client";

import { logoutAction } from "@/app/actions/auth";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const isElevated = user.role === "OWNER" || user.role === "ADMIN";
  const permissions = new Set(user.permissions.map((permission) => permission.key));
  const canReadProducts = isElevated || permissions.has(PermissionKey.PRODUCTS_READ);
  const canManageCategories = isElevated || permissions.has(PermissionKey.CATEGORIES_WRITE);
  const canReadOrders = isElevated || permissions.has(PermissionKey.ORDERS_READ);
  const canManageUsers = isElevated || permissions.has(PermissionKey.USERS_MANAGE);

  return (
    <main className="shell section-gap admin-shell">
      <aside className="admin-nav card stack">
        <h2>Admin</h2>
        <p className="muted">{user.email}</p>
        <nav className="admin-nav-links">
          <Link href="/admin" className="admin-nav-link">
            Overview
          </Link>
          {canReadProducts ? (
            <Link href="/admin/products" className="admin-nav-link">
              Products
            </Link>
          ) : null}
          {canManageCategories ? (
            <Link href="/admin/categories" className="admin-nav-link">
              Categories
            </Link>
          ) : null}
          {canReadOrders ? (
            <Link href="/admin/orders" className="admin-nav-link">
              Orders
            </Link>
          ) : null}
          {canManageUsers ? (
            <Link href="/admin/users" className="admin-nav-link">
              Users
            </Link>
          ) : null}
        </nav>
        <form action={logoutAction}>
          <button type="submit" className="button ghost">
            Log out
          </button>
        </form>
      </aside>
      <section className="admin-main">{children}</section>
    </main>
  );
}
