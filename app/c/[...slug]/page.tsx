import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryFilters } from "@/components/CategoryFilters";
import { Pagination } from "@/components/Pagination";
import { ProductGrid } from "@/components/ProductGrid";
import { Card } from "@/components/ui/Card";
import {
  getCategoryByPath,
  getCategoryProducts,
  getRootCategorySections,
} from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    brand?: string;
    size?: string;
    color?: string;
    price?: string;
  }>;
};

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const category = await getCategoryByPath(slug);
  if (!category) {
    notFound();
  }

  if (!category.parentId) {
    const sections = await getRootCategorySections(category.id);
    const rootPath = `/c/${slug.join("/")}`;

    return (
      <main className="shell section-gap stack">
        <div className="row spread middle category-head">
          <div>
            <p className="eyebrow">Department</p>
            <h1>{category.name}</h1>
            <p className="muted">Browse every category in {category.name}</p>
          </div>
        </div>

        {sections.map((section) => (
          <section key={section.id} className="card stack root-section">
            <div className="row spread middle">
              <h2>{section.name}</h2>
              <Link href={`${rootPath}/${section.slug}`} className="button ghost">
                View all {section.name}
              </Link>
            </div>

            {section.children.length > 0 ? (
              <div className="chip-wrap">
                {section.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`${rootPath}/${section.slug}/${child.slug}`}
                    className="ui-chip"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            ) : null}

            {section.products.length > 0 ? (
              <ProductGrid products={section.products} />
            ) : (
              <p className="muted">No products in this section yet.</p>
            )}
          </section>
        ))}
      </main>
    );
  }

  const data = await getCategoryProducts({
    categoryId: category.id,
    page: query.page,
    sort: query.sort,
    brand: query.brand,
    size: query.size,
    color: query.color,
    price: query.price,
  });

  const categoryLinks = await prisma.category.findMany({
    where: {
      parentId: category.parentId ?? category.id,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  const basePath = `/c/${slug.join("/")}`;

  return (
    <main className="shell section-gap">
      <div className="row spread middle category-head">
        <div>
          <p className="eyebrow">Category</p>
          <h1>{category.name}</h1>
          <p className="muted">{data.total} products</p>
        </div>
      </div>

      <div className="catalog-layout nike-catalog-layout">
        <CategoryFilters
          basePath={basePath}
          current={{
            sort: query.sort,
            brand: query.brand,
            size: query.size,
            color: query.color,
            price: query.price,
          }}
          brands={data.brands}
          sizes={data.sizes}
          colors={data.colors}
          categories={categoryLinks.map((item) => ({
            label: item.name,
            href:
              item.parentId === category.parentId
                ? `/c/${slug.slice(0, -1).join("/")}/${item.slug}`
                : `/c/${slug.join("/")}/${item.slug}`,
          }))}
        />

        <section className="stack">
          <Card className="catalog-sort-bar desktop-only">
            <div className="row spread middle">
              <p className="muted">
                Showing {Math.min(data.pageSize, data.products.length)} products
              </p>
              <p className="muted">Sort: {query.sort ?? "new"}</p>
            </div>
          </Card>

          <ProductGrid products={data.products} />
          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            basePath={basePath}
            searchParams={{
              sort: query.sort,
              brand: query.brand,
              size: query.size,
              color: query.color,
              price: query.price,
            }}
          />
        </section>
      </div>
    </main>
  );
}
