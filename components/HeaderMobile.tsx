"use client";

import type { Category } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";

import { logoutAction } from "@/app/actions/auth";
import { Drawer } from "@/components/ui/Drawer";

type CategoryTree = Category & {
  children: Array<Category & { children: Category[] }>;
};

export function HeaderMobile({
  roots,
  loggedIn,
  canAccessAdmin,
  cartQty,
}: {
  roots: CategoryTree[];
  loggedIn: boolean;
  canAccessAdmin: boolean;
  cartQty: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="mobile-only ui-icon-btn"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        ☰
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Shop">
        <nav className="stack">
          {roots.map((root) => (
            <div key={root.id} className="stack">
              <Link
                href={`/c/${root.slug}`}
                onClick={() => setOpen(false)}
                className="mobile-root-link"
              >
                {root.name}
              </Link>
              <div className="stack mobile-sub-links">
                {root.children.map((column) => (
                  <Link
                    key={column.id}
                    href={`/c/${root.slug}/${column.slug}`}
                    onClick={() => setOpen(false)}
                  >
                    {column.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <hr />
          <Link href="/cart" onClick={() => setOpen(false)}>
            Cart ({cartQty})
          </Link>
          {canAccessAdmin ? (
            <Link href="/admin" onClick={() => setOpen(false)}>
              Admin
            </Link>
          ) : null}
          {loggedIn ? (
            <form action={logoutAction}>
              <button
                type="submit"
                className="mobile-drawer-action"
                onClick={() => setOpen(false)}
              >
                Log out
              </button>
            </form>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)}>
              Login
            </Link>
          )}
        </nav>
      </Drawer>
    </>
  );
}
