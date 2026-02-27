import Link from "next/link";

import { addToCartAction } from "@/app/actions/cart";
import { resolveProductImageUrl } from "@/lib/product-images";
import { formatCurrency } from "@/lib/utils";

import { SmartImage } from "./SmartImage";
import { Button } from "./ui/Button";

export type ProductGridItem = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  images: { id?: string; url: string; alt: string }[];
  variants: { id: string; priceCents: number }[];
};

export function ProductCard({
  product,
  className,
}: {
  product: ProductGridItem;
  className?: string;
}) {
  const imageA = product.images[0];
  const minPrice = product.variants[0]?.priceCents ?? 0;
  const quickVariantId = product.variants[0]?.id;
  const productImageSources = product.images
    .map((image) => resolveProductImageUrl(image.url))
    .filter((value) => value.trim().length > 0);
  const primarySource = productImageSources[0] ?? "/products/shoe-001.png";
  const fallbackSources = [...productImageSources.slice(1), "/products/shoe-001.png"];

  return (
    <article className={`product-card ${className ?? ""}`.trim()}>
      <Link href={`/p/${product.slug}`} className="product-media-link">
        <div className="image-wrap image-hover-swap">
          <SmartImage
            src={primarySource}
            alt={imageA?.alt ?? product.title}
            width={780}
            height={780}
            className="image-primary"
            fallbackSources={fallbackSources}
          />
        </div>
      </Link>

      <div className="product-meta">
        <h3 className="product-title">{product.title}</h3>
        <div className="product-meta-bottom">
          <p className="muted product-brand">{product.brand}</p>
          <p className="product-price">{formatCurrency(minPrice)}</p>
        </div>
      </div>

      {quickVariantId ? (
        <form action={addToCartAction} className="product-quick">
          <input type="hidden" name="variantId" value={quickVariantId} />
          <input type="hidden" name="qty" value="1" />
          <Button size="sm" variant="ghost" className="quick-add-btn">
            Quick Add
          </Button>
        </form>
      ) : null}
    </article>
  );
}

export function ProductGrid({ products }: { products: ProductGridItem[] }) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
