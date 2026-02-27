import { notFound } from "next/navigation";

import { addToCartAction } from "@/app/actions/cart";
import { ProductBuyBox } from "@/components/ProductBuyBox";
import { ProductGallery } from "@/components/ProductGallery";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getProductBySlug } from "@/lib/catalog";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product || !product.active) {
    notFound();
  }

  return (
    <main className="shell section-gap stack">
      <div className="product-layout nike-product-layout">
        <ProductGallery images={product.images} productTitle={product.title} />

        <div className="stack sticky-stack">
          <p className="muted">{product.brand}</p>
          <h1>{product.title}</h1>
          <div className="row">
            <Badge>New</Badge>
            <Badge>{product.variants.length} variants</Badge>
          </div>
          <ProductBuyBox variants={product.variants} addAction={addToCartAction} />
        </div>
      </div>

      <section className="stack">
        <details className="accordion">
          <summary>Details</summary>
          <Card>
            <p>{product.description}</p>
          </Card>
        </details>
        <details className="accordion">
          <summary>Shipping</summary>
          <Card>
            <p>
              Standard shipping 3-5 business days. Express options available at checkout.
            </p>
          </Card>
        </details>
        <details className="accordion">
          <summary>Returns</summary>
          <Card>
            <p>
              30-day returns for unworn items. Start returns from your account dashboard.
            </p>
          </Card>
        </details>
      </section>
    </main>
  );
}
