import type { Prisma } from "@prisma/client";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureCartSessionId, getCartSessionId } from "@/lib/session";

const cartInclude = {
  items: {
    include: {
      variant: {
        include: {
          product: {
            include: {
              images: {
                orderBy: {
                  sortOrder: "asc",
                },
                take: 1,
              },
            },
          },
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  },
} satisfies Prisma.CartInclude;

export type CartWithItems = Prisma.CartGetPayload<{
  include: typeof cartInclude;
}>;

function emptyCart(sessionId: string, userId?: string | null): CartWithItems {
  return {
    id: "ephemeral-cart",
    sessionId,
    userId: userId ?? null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    items: [],
  };
}

export async function getCartForRequest(): Promise<CartWithItems> {
  const [sessionId, user] = await Promise.all([getCartSessionId(), getCurrentUser()]);

  if (!sessionId) {
    if (user) {
      const userCart = await prisma.cart.findFirst({
        where: { userId: user.id },
        include: cartInclude,
        orderBy: { updatedAt: "desc" },
      });
      if (userCart) {
        return userCart;
      }
    }
    return emptyCart("no-session", user?.id);
  }

  const cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: cartInclude,
  });

  return cart ?? emptyCart(sessionId, user?.id);
}

export async function getOrCreateCart(): Promise<CartWithItems> {
  const sessionId = await ensureCartSessionId();
  const user = await getCurrentUser();

  let cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: cartInclude,
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        sessionId,
        userId: user?.id,
      },
      include: cartInclude,
    });
  } else if (user && !cart.userId) {
    cart = await prisma.cart.update({
      where: { id: cart.id },
      data: { userId: user.id },
      include: cartInclude,
    });
  }

  return cart;
}

export function cartTotals(cart: CartWithItems) {
  const subtotalCents = cart.items.reduce((sum, item) => {
    return sum + item.qty * item.variant.priceCents;
  }, 0);

  const shippingCents = subtotalCents === 0 ? 0 : 1200;
  const taxCents = Math.round(subtotalCents * 0.08);
  const totalCents = subtotalCents + shippingCents + taxCents;

  return {
    subtotalCents,
    shippingCents,
    taxCents,
    totalCents,
  };
}
