"use server";

import { revalidatePath } from "next/cache";

import { getOrCreateCart } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { isTrustedActionOrigin } from "@/lib/request-security";
import { clamp } from "@/lib/utils";
import { parseFormInt, parseFormString } from "@/lib/validation";

export async function addToCartAction(formData: FormData): Promise<void> {
  if (!(await isTrustedActionOrigin())) {
    return;
  }

  const variantId = parseFormString(formData.get("variantId"));
  const qty = clamp(1, parseFormInt(formData.get("qty"), 1), 10);
  if (!variantId) {
    return;
  }

  const cart = await getOrCreateCart();

  const existing = await prisma.cart.findUnique({
    where: { id: cart.id },
    select: {
      items: {
        where: { variantId },
        select: { id: true, qty: true },
        take: 1,
      },
    },
  });
  const existingItem = existing?.items[0];

  if (existingItem) {
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: {
          update: {
            where: { id: existingItem.id },
            data: {
              qty: clamp(1, existingItem.qty + qty, 20),
            },
          },
        },
      },
    });
  } else {
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: {
          create: {
            variantId,
            qty,
          },
        },
      },
    });
  }

  revalidatePath("/cart");
}

export async function updateCartItemQtyAction(formData: FormData): Promise<void> {
  if (!(await isTrustedActionOrigin())) {
    return;
  }

  const itemId = parseFormString(formData.get("itemId"));
  const qty = clamp(1, parseFormInt(formData.get("qty"), 1), 20);
  if (!itemId) {
    return;
  }

  const cart = await getOrCreateCart();

  await prisma.cart.update({
    where: { id: cart.id },
    data: {
      items: {
        updateMany: {
          where: { id: itemId },
          data: { qty },
        },
      },
    },
  });

  revalidatePath("/cart");
}

export async function removeCartItemAction(formData: FormData): Promise<void> {
  if (!(await isTrustedActionOrigin())) {
    return;
  }

  const itemId = parseFormString(formData.get("itemId"));
  if (!itemId) {
    return;
  }

  const cart = await getOrCreateCart();

  await prisma.cart.update({
    where: { id: cart.id },
    data: {
      items: {
        deleteMany: {
          id: itemId,
        },
      },
    },
  });

  revalidatePath("/cart");
}
