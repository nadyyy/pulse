import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/ProductGrid";
import { LinkButton } from "@/components/ui/Button";
import { getBestSellers, getMegaMenuRoots } from "@/lib/catalog";
import { HERO_MODEL_IMAGES, ROOT_CATEGORY_MODEL_IMAGES } from "@/lib/curated-images";
import { resolveProductImageUrl } from "@/lib/product-images";

export default async function HomePage() {
  const [bestSellers, roots] = await Promise.all([
    getBestSellers(12),
    getMegaMenuRoots(),
  ]);

  return (
    <main>
      <section className="hero hero-nike">
        <div className="hero-bg" />
        <div className="hero-content shell">
          <div className="stack hero-copy reveal-up">
            <p className="eyebrow">NEW SEASON ARRIVALS</p>
            <h1>Quality you can feel, styles that last.</h1>
            <p>
              Find men, women, and kids styles for everyday wear, sport, and
              essentials, with fast checkout and easy browsing.
            </p>
            <div className="row">
              <LinkButton href="/c/men" size="lg" className="hero-cta hero-cta-primary">
                Shop New
              </LinkButton>
              <LinkButton
                href="/c/women"
                size="lg"
                variant="ghost"
                className="hero-cta hero-cta-outline"
              >
                Shop Shoes
              </LinkButton>
            </div>
          </div>
          <div className="hero-image-grid reveal-up delay-1">
            <Image
              src={HERO_MODEL_IMAGES.men}
              alt="Men model in sportswear"
              width={850}
              height={850}
              priority
            />
            <Image
              src={HERO_MODEL_IMAGES.women}
              alt="Women model in sportswear"
              width={850}
              height={850}
            />
          </div>
        </div>
      </section>

      <section className="shell section-gap stack reveal-up delay-2">
        <div className="row spread middle">
          <h2>Featured Categories</h2>
          <Link href="/c/men">View all</Link>
        </div>
        <div className="featured-cats premium-grid">
          {roots.map((root, index) => (
            <Link key={root.id} href={`/c/${root.slug}`} className="featured-cat-card">
              <Image
                src={
                  ROOT_CATEGORY_MODEL_IMAGES[root.slug as keyof typeof ROOT_CATEGORY_MODEL_IMAGES] ??
                  resolveProductImageUrl(
                    index % 2 === 0
                      ? "/products/shoe-002.png"
                      : "/products/apparel-002.png",
                  )
                }
                alt={root.name}
                width={560}
                height={560}
              />
              <span>{root.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="shell section-gap stack reveal-up delay-3">
        <div className="row spread middle">
          <h2>Best Sellers</h2>
          <Link href="/c/sale">Shop deals</Link>
        </div>
        <div className="snap-row">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} className="snap-card" />
          ))}
        </div>
      </section>
    </main>
  );
}
