"use server";

import { OrderStatus } from "@prisma/client";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { cartTotals, getOrCreateCart } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { isTrustedActionOrigin } from "@/lib/request-security";
import { checkoutSchema, parseFormString } from "@/lib/validation";

export async function checkoutAction(formData: FormData): Promise<void> {
  if (!(await isTrustedActionOrigin())) {
    redirect("/checkout?error=Security%20check%20failed");
  }

  const parsed = checkoutSchema.safeParse({
    fullName: parseFormString(formData.get("fullName")),
    phone: parseFormString(formData.get("phone")),
    city: parseFormString(formData.get("city")),
    address: parseFormString(formData.get("address")),
  });

  if (!parsed.success) {
    redirect("/checkout?error=Please%20complete%20all%20fields");
  }

  const [user, cart] = await Promise.all([getCurrentUser(), getOrCreateCart()]);

  if (cart.items.length === 0) {
    redirect("/cart");
  }

  const totals = cartTotals(cart);
  const orderEmail = user?.email ?? `guest+${Date.now()}@pulse.local`;

  const order = await prisma.order.create({
    data: {
      userId: user?.id,
      email: orderEmail,
      status: OrderStatus.PLACED,
      subtotalCents: totals.subtotalCents,
      shippingCents: totals.shippingCents,
      taxCents: totals.taxCents,
      totalCents: totals.totalCents,
      addressJson: {
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        city: parsed.data.city,
        address: parsed.data.address,
      },
      items: {
        create: cart.items.map((item) => ({
          variantId: item.variantId,
          titleSnapshot: item.variant.product.title,
          priceCentsSnapshot: item.variant.priceCents,
          qty: item.qty,
        })),
      },
    },
  });

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });

  const orderRef = order.id.slice(-8).toUpperCase();
  redirect(`/checkout?success=1&ref=${orderRef}`);
}
