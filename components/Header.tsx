import Link from "next/link";
import Image from "next/image";

import { logoutAction } from "@/app/actions/auth";
import { canAccessAdminPanel, getCurrentUser } from "@/lib/auth";
import { getCartForRequest } from "@/lib/cart";
import { getMegaMenuRoots } from "@/lib/catalog";

import { HeaderMobile } from "./HeaderMobile";
import { MegaMenu } from "./MegaMenu";
import { Badge } from "./ui/Badge";

export async function Header() {
  const [roots, user, cart] = await Promise.all([
    getMegaMenuRoots(),
    getCurrentUser(),
    getCartForRequest(),
  ]);

  const cartQty = cart.items.reduce((sum, item) => sum + item.qty, 0);
  const canAccessAdmin = canAccessAdminPanel(user);

  return (
    <header className="site-header">
      <div className="top-strip">Members: free shipping on eligible orders over $120</div>
      <div className="header-shell">
        <div className="header-left">
          <HeaderMobile
            roots={roots}
            loggedIn={Boolean(user)}
            canAccessAdmin={canAccessAdmin}
            cartQty={cartQty}
          />
          <Link className="logo" href="/">
            <Image
              src="/pulse-logo.png"
              alt="Pulse logo"
              width={30}
              height={30}
              className="logo-mark"
              priority
            />
            <span className="logo-word">PULSE</span>
          </Link>
        </div>

        <div className="header-desktop-nav">
          <MegaMenu roots={roots} />
        </div>

        <nav className="header-actions" aria-label="Account actions">
          <Link href="/cart" className="header-action-link">
            Cart <Badge>{cartQty}</Badge>
          </Link>
          {canAccessAdmin ? (
            <Link href="/admin" className="header-action-link">
              Admin
            </Link>
          ) : null}
          {user ? (
            <form action={logoutAction}>
              <button type="submit" className="header-action-link header-action-button">
                Log out
              </button>
            </form>
          ) : (
            <Link href="/login" className="header-action-link">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
