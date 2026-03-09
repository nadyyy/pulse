"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Category } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { ROOT_CATEGORY_MODEL_IMAGES, pickByIndex } from "@/lib/curated-images";
import { resolveProductImageUrl } from "@/lib/product-images";

type CategoryTree = Category & {
  children: Array<Category & { children: Category[] }>;
};

const LABELS: Record<string, string> = {
  men: "Men",
  women: "Women",
  kids: "Kids",
  sport: "Sport",
  sale: "Sale",
};

const MAX_ITEMS_PER_COLUMN = 6;

const FEATURE_TILES: Record<
  string,
  { title: string; href: string; image: string; blurb: string }[]
> = {
  men: [
    {
      title: "Men Running",
      href: "/c/men/shoes/running",
      image: ROOT_CATEGORY_MODEL_IMAGES.men,
      blurb: "Lightweight daily trainers",
    },
    {
      title: "Men Essentials",
      href: "/c/men/clothing/tops-and-t-shirts",
      image:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80",
      blurb: "Performance tees and layers",
    },
  ],
  women: [
    {
      title: "Women Running",
      href: "/c/women/shoes/running",
      image: ROOT_CATEGORY_MODEL_IMAGES.women,
      blurb: "Energy return for long runs",
    },
    {
      title: "Women Training",
      href: "/c/women/clothing/leggings",
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
      blurb: "Flexible studio-to-street fits",
    },
  ],
  kids: [
    {
      title: "Kids Best Sellers",
      href: "/c/kids/big-kids/shoes/lifestyle",
      image: ROOT_CATEGORY_MODEL_IMAGES.kids,
      blurb: "Easy-on comfort and grip",
    },
    {
      title: "Kids Sets",
      href: "/c/kids/little-kids/clothing/sets",
      image:
        "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1200&q=80",
      blurb: "Ready-made outfit kits",
    },
  ],
  sport: [
    {
      title: "Basketball Picks",
      href: "/c/sport/basketball",
      image: resolveProductImageUrl("/products/shoe-022.png"),
      blurb: "Court traction and support",
    },
    {
      title: "Gym Essentials",
      href: "/c/sport/training-and-gym",
      image: resolveProductImageUrl("/products/apparel-015.png"),
      blurb: "Breathable training staples",
    },
  ],
  sale: [
    {
      title: "Women Sale",
      href: "/c/sale/women-sale",
      image: resolveProductImageUrl("/products/apparel-004.png"),
      blurb: "Markdowns on top styles",
    },
    {
      title: "Men Sale",
      href: "/c/sale/men-sale",
      image: resolveProductImageUrl("/products/shoe-031.png"),
      blurb: "Discounted sneakers and gear",
    },
  ],
};

function columnThumb(slug: string, index: number): string {
  const fallback = resolveProductImageUrl(
    index % 2 === 0 ? "/products/shoe-001.png" : "/products/apparel-001.png",
  );

  const listByRoot: Partial<Record<string, readonly string[]>> = {
    men: [
      ROOT_CATEGORY_MODEL_IMAGES.men,
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1492447216082-4726bf2a9284?auto=format&fit=crop&w=600&q=80",
    ],
    women: [
      ROOT_CATEGORY_MODEL_IMAGES.women,
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
    ],
    kids: [
      ROOT_CATEGORY_MODEL_IMAGES.kids,
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=600&q=80",
    ],
    sport: [
      ROOT_CATEGORY_MODEL_IMAGES.sport,
      "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80",
    ],
    sale: [
      ROOT_CATEGORY_MODEL_IMAGES.sale,
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=600&q=80",
    ],
  };

  const pool = listByRoot[slug];
  if (!pool || pool.length === 0) {
    return fallback;
  }
  return pickByIndex(pool, index);
}

function categoryHref(...segments: string[]): string {
  return `/c/${segments.join("/")}`;
}

export function MegaMenu({ roots }: { roots: CategoryTree[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeRoot = useMemo(
    () => roots.find((root) => root.id === openId) ?? null,
    [openId, roots],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenId(null);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpenId(null);
    }, 420);
  }

  return (
    <div
      ref={wrapperRef}
      className="mega-wrap"
      onMouseEnter={clearCloseTimer}
      onMouseLeave={scheduleClose}
      onBlur={(event) => {
        if (!wrapperRef.current?.contains(event.relatedTarget as Node | null)) {
          scheduleClose();
        }
      }}
    >
      <ul className="nav-roots" role="menubar" aria-label="Shop categories">
        {roots.map((root) => {
          const active = root.id === openId;

          return (
            <li
              key={root.id}
              className="nav-root-item"
              role="none"
              onMouseEnter={() => {
                clearCloseTimer();
                setOpenId(root.id);
              }}
            >
              <Link
                href={categoryHref(root.slug)}
                role="menuitem"
                className={active ? "nav-link nav-link-active" : "nav-link"}
                aria-expanded={active}
                aria-controls={`mega-${root.id}`}
                onFocus={() => setOpenId(root.id)}
                onBlur={scheduleClose}
                onMouseEnter={() => {
                  clearCloseTimer();
                  setOpenId(root.id);
                }}
                onClick={() => setOpenId(null)}
              >
                {LABELS[root.slug] ?? root.name}
              </Link>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {activeRoot ? (
          <motion.div
            id={`mega-${activeRoot.id}`}
            className="mega-panel"
            onMouseEnter={clearCloseTimer}
            onMouseLeave={scheduleClose}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="mega-panel-top">
              <Link href={categoryHref(activeRoot.slug)} className="mega-root-link">
                Shop All {LABELS[activeRoot.slug] ?? activeRoot.name}
              </Link>
            </div>
            <div className="mega-content">
              <div className="mega-columns">
                {activeRoot.children.map((column, index) => (
                  <section key={column.id}>
                    <h4>
                      <Link
                        href={categoryHref(activeRoot.slug, column.slug)}
                        className="mega-column-link"
                      >
                        <Image
                          src={columnThumb(activeRoot.slug, index)}
                          alt={column.name}
                          width={64}
                          height={64}
                          className="mega-column-thumb"
                        />
                        <span>{column.name}</span>
                      </Link>
                    </h4>
                    <ul>
                      {column.children.slice(0, MAX_ITEMS_PER_COLUMN).map((item) => (
                        <li key={item.id}>
                          <Link
                            href={categoryHref(activeRoot.slug, column.slug, item.slug)}
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                      {column.children.length > MAX_ITEMS_PER_COLUMN ? (
                        <li>
                          <Link
                            href={categoryHref(activeRoot.slug, column.slug)}
                            className="mega-view-all"
                          >
                            View all
                          </Link>
                        </li>
                      ) : null}
                    </ul>
                  </section>
                ))}
              </div>

              <aside className="mega-feature-rail">
                {(FEATURE_TILES[activeRoot.slug] ?? []).map((tile) => (
                  <Link key={tile.href} href={tile.href} className="mega-feature-card">
                    <Image
                      src={tile.image}
                      alt={tile.title}
                      width={520}
                      height={360}
                      className="mega-feature-image"
                    />
                    <div className="mega-feature-copy">
                      <p>{tile.title}</p>
                      <span>{tile.blurb}</span>
                    </div>
                  </Link>
                ))}
              </aside>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
