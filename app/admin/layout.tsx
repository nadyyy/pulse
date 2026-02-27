import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <main className="shell section-gap admin-shell">
      <aside className="admin-nav card stack">
        <h2>Admin</h2>
        <p className="muted">{user.email}</p>
        <nav className="admin-nav-links">
          <Link href="/admin" className="admin-nav-link">
            Overview
          </Link>
          <Link href="/admin/products" className="admin-nav-link">
            Products
          </Link>
          <Link href="/admin/categories" className="admin-nav-link">
            Categories
          </Link>
          <Link href="/admin/orders" className="admin-nav-link">
            Orders
          </Link>
          <Link href="/admin/users" className="admin-nav-link">
            Users
          </Link>
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
