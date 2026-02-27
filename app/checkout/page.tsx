import Link from "next/link";

import { checkoutAction } from "@/app/actions/checkout";
import { ConfirmOrderButton } from "@/components/ConfirmOrderButton";
import { cartTotals, getCartForRequest } from "@/lib/cart";
import { formatCurrency } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{ error?: string; success?: string; ref?: string }>;
};

export default async function CheckoutPage({ searchParams }: PageProps) {
  const [params, cart] = await Promise.all([searchParams, getCartForRequest()]);

  const totals = cartTotals(cart);

  return (
    <main className="shell section-gap">
      <h1>Checkout</h1>
      {params.success ? (
        <div className="card stack">
          <h2>Thank you for your order.</h2>
          <p>
            Your order was placed successfully and your cart is now empty.
          </p>
          {params.ref ? <p>Order reference: <code>{params.ref}</code></p> : null}
          <Link href="/" className="button">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="checkout-layout">
          <form action={checkoutAction} className="card stack">
            <h2>Delivery Details</h2>
            {params.error ? <p className="error">{params.error}</p> : null}
            <label className="field">
              <span>Full name</span>
              <input name="fullName" required />
            </label>
            <label className="field">
              <span>Phone number</span>
              <input name="phone" type="tel" required />
            </label>
            <label className="field">
              <span>City</span>
              <input name="city" required />
            </label>
            <label className="field">
              <span>Address</span>
              <input name="address" required />
            </label>
            <ConfirmOrderButton className="button" />
          </form>

          <aside className="card stack order-box">
            <h2>Summary</h2>
            <p className="row spread">
              <span>Items</span>
              <span>{cart.items.length}</span>
            </p>
            <p className="row spread">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotalCents)}</span>
            </p>
            <p className="row spread">
              <span>Shipping</span>
              <span>{formatCurrency(totals.shippingCents)}</span>
            </p>
            <p className="row spread">
              <span>Tax</span>
              <span>{formatCurrency(totals.taxCents)}</span>
            </p>
            <p className="row spread total-row">
              <span>Total</span>
              <span>{formatCurrency(totals.totalCents)}</span>
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
