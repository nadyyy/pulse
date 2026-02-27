import Link from "next/link";

import { removeCartItemAction, updateCartItemQtyAction } from "@/app/actions/cart";
import { SmartImage } from "@/components/SmartImage";
import { cartTotals, getCartForRequest, type CartWithItems } from "@/lib/cart";
import { resolveProductImageUrl } from "@/lib/product-images";
import { formatCurrency } from "@/lib/utils";

export default async function CartPage() {
  const cart = await getCartForRequest();
  const totals = cartTotals(cart);

  return (
    <main className="shell section-gap">
      <h1>Cart</h1>
      {cart.items.length === 0 ? (
        <div className="card stack">
          <p>Your bag is empty.</p>
          <Link href="/c/men" className="button">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="stack cart-items">
            {cart.items.map((item: CartWithItems["items"][number]) => {
              const image = item.variant.product.images[0];
              const productImageSources = item.variant.product.images
                .map((entry) => resolveProductImageUrl(entry.url))
                .filter((value) => value.trim().length > 0);
              const primarySource = productImageSources[0] ?? "/products/shoe-001.png";
              const fallbackSources = [...productImageSources.slice(1), "/products/shoe-001.png"];
              return (
                <article key={item.id} className="cart-item">
                  <SmartImage
                    src={primarySource}
                    alt={image?.alt ?? item.variant.product.title}
                    width={180}
                    height={180}
                    fallbackSources={fallbackSources}
                  />
                  <div className="stack">
                    <h3>{item.variant.product.title}</h3>
                    <p className="muted">
                      {item.variant.color ?? "Core"} / {item.variant.size ?? "One Size"}
                    </p>
                    <p>{formatCurrency(item.variant.priceCents)}</p>
                    <div className="row cart-actions">
                      <form action={updateCartItemQtyAction} className="row cart-update-form">
                        <input type="hidden" name="itemId" value={item.id} />
                        <input
                          type="number"
                          name="qty"
                          defaultValue={item.qty}
                          min={1}
                          max={20}
                          className="cart-qty-input"
                        />
                        <button type="submit" className="button ghost cart-btn">
                          Update
                        </button>
                      </form>
                      <form action={removeCartItemAction}>
                        <input type="hidden" name="itemId" value={item.id} />
                        <button type="submit" className="button danger cart-btn">
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="card stack order-box">
            <h2>Order Summary</h2>
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
            <Link href="/checkout" className="button">
              Checkout
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
