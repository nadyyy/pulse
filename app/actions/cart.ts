"use server";

import { revalidatePath } from "next/cache";

import { getOrCreateCart } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { clamp } from "@/lib/utils";
import { parseFormInt, parseFormString } from "@/lib/validation";

export async function addToCartAction(formData: FormData): Promise<void> {
  const variantId = parseFormString(formData.get("variantId"));
  const qty = clamp(1, parseFormInt(formData.get("qty"), 1), 10);
  if (!variantId) {
    return;
  }

  const cart = await getOrCreateCart();

  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      variantId,
    },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: {
        qty: clamp(1, existing.qty + qty, 20),
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId,
        qty,
      },
    });
  }

  revalidatePath("/cart");
}

export async function updateCartItemQtyAction(formData: FormData): Promise<void> {
  const itemId = parseFormString(formData.get("itemId"));
  const qty = clamp(1, parseFormInt(formData.get("qty"), 1), 20);
  if (!itemId) {
    return;
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { qty },
  });

  revalidatePath("/cart");
}

export async function removeCartItemAction(formData: FormData): Promise<void> {
  const itemId = parseFormString(formData.get("itemId"));
  if (!itemId) {
    return;
  }

  await prisma.cartItem.deleteMany({
    where: { id: itemId },
  });

  revalidatePath("/cart");
}
