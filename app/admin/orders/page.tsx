import { OrderStatus } from "@prisma/client";

import { updateOrderStatusAction } from "@/app/actions/admin";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

const ADMIN_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PLACED,
  OrderStatus.FULFILLED,
  OrderStatus.CANCELLED,
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  DRAFT: "Draft",
  PLACED: "Placed",
  PAID: "Paid",
  FULFILLED: "Fulfilled",
  CANCELLED: "Canceled",
};

function shortOrderRef(orderId: string): string {
  return orderId.slice(-8).toUpperCase();
}

function readAddress(value: unknown): {
  fullName: string;
  phone: string;
  city: string;
  address: string;
} {
  if (!value || typeof value !== "object") {
    return { fullName: "-", phone: "-", city: "-", address: "-" };
  }

  const obj = value as Record<string, unknown>;

  return {
    fullName: typeof obj.fullName === "string" ? obj.fullName : "-",
    phone: typeof obj.phone === "string" ? obj.phone : "-",
    city: typeof obj.city === "string" ? obj.city : "-",
    address:
      typeof obj.address === "string"
        ? obj.address
        : typeof obj.line1 === "string"
          ? obj.line1
          : "-",
  };
}

export default async function AdminOrdersPage() {
  await requirePermission("ORDERS_READ");

  const orders = await prisma.order.findMany({
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 150,
  });

  const currentOrders = orders.filter((order) => order.status !== OrderStatus.FULFILLED);
  const pastOrders = orders.filter((order) => order.status === OrderStatus.FULFILLED);

  return (
    <div className="stack">
      <h1>Orders</h1>

      <section className="stack">
        <h2>Current Orders</h2>
        {currentOrders.length === 0 ? (
          <article className="card">
            <p className="muted">No current orders.</p>
          </article>
        ) : (
          currentOrders.map((order) => {
            const address = readAddress(order.addressJson);
            return (
              <article key={order.id} className="card stack order-admin-card">
                <div className="row spread middle">
                  <div>
                    <h3>Order #{shortOrderRef(order.id)}</h3>
                    <p className="muted">{order.email}</p>
                    <p className="muted">{new Date(order.createdAt).toLocaleString()}</p>
                    <p className="muted">Status: {STATUS_LABEL[order.status]}</p>
                  </div>
                  <p>{formatCurrency(order.totalCents)}</p>
                </div>

                <div className="order-admin-address">
                  <p>
                    <strong>{address.fullName}</strong> · {address.phone}
                  </p>
                  <p className="muted">
                    {address.address}, {address.city}
                  </p>
                </div>

                <div className="order-admin-items">
                  <h4>Items</h4>
                  <ul>
                    {order.items.map((item) => (
                      <li key={item.id}>
                        <span>
                          {item.titleSnapshot} x{item.qty}
                        </span>
                        <span>{formatCurrency(item.qty * item.priceCentsSnapshot)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <form action={updateOrderStatusAction} className="row wrap-end">
                  <input type="hidden" name="orderId" value={order.id} />
                  <label className="field">
                    <span>Update status</span>
                    <select name="status" defaultValue={order.status}>
                      {ADMIN_ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABEL[status]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="button ghost" type="submit">
                    Save Status
                  </button>
                </form>
              </article>
            );
          })
        )}
      </section>

      <section className="stack">
        <h2>Past Orders</h2>
        {pastOrders.length === 0 ? (
          <article className="card">
            <p className="muted">No fulfilled orders yet.</p>
          </article>
        ) : (
          pastOrders.map((order) => (
            <article key={order.id} className="card stack order-admin-card">
              <div className="row spread middle">
                <div>
                  <h3>Order #{shortOrderRef(order.id)}</h3>
                  <p className="muted">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <p>{formatCurrency(order.totalCents)}</p>
              </div>
              <ul className="order-admin-past-list">
                {order.items.map((item) => (
                  <li key={item.id}>
                    <span>
                      {item.titleSnapshot} x{item.qty}
                    </span>
                    <span>{formatCurrency(item.qty * item.priceCentsSnapshot)}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

