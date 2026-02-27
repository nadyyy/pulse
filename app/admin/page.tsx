import { PermissionKey } from "@prisma/client";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const user = await requireAdmin();

  const [productCount, orderCount, userCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
  ]);

  const perms = user.permissions.map((permission) => permission.key);
  const canWriteProducts =
    user.role === "OWNER" ||
    user.role === "ADMIN" ||
    perms.includes(PermissionKey.PRODUCTS_WRITE);

  return (
    <div className="stack">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <article className="card">
          <p className="eyebrow">Products</p>
          <h2>{productCount}</h2>
        </article>
        <article className="card">
          <p className="eyebrow">Orders</p>
          <h2>{orderCount}</h2>
        </article>
        <article className="card">
          <p className="eyebrow">Users</p>
          <h2>{userCount}</h2>
        </article>
      </div>
      <article className="card stack">
        <h2>Access</h2>
        <p>
          Role: <strong>{user.role}</strong>
        </p>
        <p>
          Permissions:{" "}
          {perms.length > 0
            ? perms.join(", ")
            : user.role === "STAFF"
              ? "None"
              : "All by role"}
        </p>
        <p>{canWriteProducts ? "You can edit products." : "Read-only product access."}</p>
      </article>
    </div>
  );
}
