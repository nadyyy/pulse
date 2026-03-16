import type { Category, Prisma, Product, ProductImage, Variant } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { parseIntParam } from "@/lib/utils";

const PAGE_SIZE = 15;

export type ProductCardData = Product & {
  images: ProductImage[];
  variants: Variant[];
};

export type RootCategorySection = {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
  products: ProductCardData[];
};

export type MegaMenuRoot = Prisma.CategoryGetPayload<{
  include: {
    children: {
      include: {
        children: true;
      };
    };
  };
}>;

function saleScopeToTargetGroup(scope: string): Category["group"] | null {
  const normalized = ` ${scope.toLowerCase().replace(/[^a-z]+/g, " ")} `;

  if (normalized.includes(" women ")) {
    return "WOMEN";
  }

  if (normalized.includes(" men ")) {
    return "MEN";
  }

  if (normalized.includes(" kids ")) {
    return "KIDS";
  }

  return null;
}

export async function getMegaMenuRoots(): Promise<MegaMenuRoot[]> {
  return prisma.category.findMany({
    where: {
      parentId: null,
      slug: {
        in: ["men", "women", "kids", "sport", "sale"],
      },
    },
    include: {
      children: {
        orderBy: {
          sortOrder: "asc",
        },
        include: {
          children: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
}

export async function getCategoryByPath(slugs: string[]): Promise<Category | null> {
  if (slugs.length === 0) {
    return null;
  }

  let parentId: string | null = null;
  let found: Category | null = null;

  for (const slug of slugs) {
    found = await prisma.category.findFirst({
      where: {
        slug,
        parentId,
      },
    });

    if (!found) {
      return null;
    }

    parentId = found.id;
  }

  return found;
}

async function collectCategoryTreeIds(id: string): Promise<string[]> {
  const categories = await prisma.category.findMany({
    select: { id: true, parentId: true },
  });

  const childMap = new Map<string, string[]>();
  for (const category of categories) {
    if (!category.parentId) {
      continue;
    }
    const arr = childMap.get(category.parentId) ?? [];
    arr.push(category.id);
    childMap.set(category.parentId, arr);
  }

  const ids: string[] = [];
  const queue: string[] = [id];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }
    ids.push(current);
    const children = childMap.get(current) ?? [];
    for (const child of children) {
      queue.push(child);
    }
  }

  return ids;
}

async function getRootCategory(categoryId: string): Promise<{
  id: string;
  group: Category["group"];
} | null> {
  let current: { id: string; parentId: string | null; group: Category["group"] } | null =
    await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, parentId: true, group: true },
    });

  if (!current) {
    return null;
  }

  while (true) {
    if (!current.parentId) {
      break;
    }

    const parent: {
      id: string;
      parentId: string | null;
      group: Category["group"];
    } | null = await prisma.category.findUnique({
      where: { id: current.parentId },
      select: { id: true, parentId: true, group: true },
    });

    if (!parent) {
      break;
    }

    current = parent;
  }

  return {
    id: current.id,
    group: current.group,
  };
}

export async function getCategoryProducts(input: {
  categoryId: string;
  page?: string;
  sort?: string;
  brand?: string;
  size?: string;
  color?: string;
  price?: string;
}) {
  const page = Math.max(1, parseIntParam(input.page, 1));
  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
    select: { group: true, slug: true, name: true },
  });

  if (!category) {
    return {
      page,
      pageSize: PAGE_SIZE,
      total: 0,
      products: [],
      brands: [],
      sizes: [],
      colors: [],
    };
  }

  const categoryIds = await collectCategoryTreeIds(input.categoryId);
  const isSaleCategory = category.group === "SALE";

  const scopeWhere: Prisma.ProductWhereInput = {
    active: true,
  };

  if (isSaleCategory) {
    const scopeKey = `${category.slug} ${category.name}`;
    const targetGroup = saleScopeToTargetGroup(scopeKey);

    if (targetGroup) {
      scopeWhere.categories = {
        some: {
          category: {
            group: targetGroup,
          },
        },
      };
    }
  } else {
    scopeWhere.categories = {
      some: {
        categoryId: {
          in: categoryIds,
        },
      },
    };
  }

  const where: Prisma.ProductWhereInput = {
    ...scopeWhere,
  };

  if (input.brand) {
    where.brand = input.brand;
  }

  const variantFilter: Prisma.VariantWhereInput = {
    ...(isSaleCategory ? { compareAtCents: { not: null } } : {}),
    ...(input.size ? { size: input.size } : {}),
    ...(input.color ? { color: input.color } : {}),
  };

  if (input.price) {
    const [minRaw, maxRaw] = input.price.split("-");
    const min = Number.parseInt(minRaw, 10);
    const max = Number.parseInt(maxRaw, 10);
    if (!Number.isNaN(min) && !Number.isNaN(max)) {
      variantFilter.priceCents = { gte: min, lte: max };
    }
  }

  if (Object.keys(variantFilter).length > 0) {
    where.variants = { some: variantFilter };
  }

  const total = await prisma.product.count({ where });

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    input.sort === "new" || input.sort === "best"
      ? [{ createdAt: "desc" }]
      : input.sort === "price_desc"
        ? [{ title: "desc" }]
        : input.sort === "price_asc"
          ? [{ title: "asc" }]
          : [{ createdAt: "desc" }];

  const products = await prisma.product.findMany({
    where,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 2 },
      variants: { orderBy: { priceCents: "asc" } },
    },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    orderBy,
  });

  // Some leaf categories in the seed taxonomy have sparse/no direct product links.
  // For page 1 without explicit filters, backfill from the same department to show a usable catalog.
  const shouldBackfill =
    page === 1 &&
    !input.brand &&
    !input.size &&
    !input.color &&
    !input.price &&
    products.length < PAGE_SIZE;

  let displayProducts = products;
  if (shouldBackfill) {
    const excludeIds = products.map((product) => product.id);
    const root = await getRootCategory(input.categoryId);

    const variantFallbackFilter: Prisma.VariantWhereInput = {
      ...(isSaleCategory ? { compareAtCents: { not: null } } : {}),
    };

    const departmentFallbackWhere: Prisma.ProductWhereInput = {
      active: true,
      ...(root
        ? {
            categories: {
              some: {
                category: {
                  group: root.group,
                },
              },
            },
          }
        : {}),
      ...(Object.keys(variantFallbackFilter).length > 0
        ? { variants: { some: variantFallbackFilter } }
        : {}),
      ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
    };

    const supplemental = await prisma.product.findMany({
      where: departmentFallbackWhere,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 2 },
        variants: { orderBy: { priceCents: "asc" } },
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE - products.length,
    });

    displayProducts = [...products, ...supplemental];
  }

  const [brandsRaw, sizesRaw, colorsRaw] = await Promise.all([
    prisma.product.findMany({
      where: scopeWhere,
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
    prisma.variant.findMany({
      where: {
        size: { not: null },
        ...(isSaleCategory ? { compareAtCents: { not: null } } : {}),
        product: scopeWhere,
      },
      select: { size: true },
      distinct: ["size"],
      orderBy: { size: "asc" },
    }),
    prisma.variant.findMany({
      where: {
        color: { not: null },
        ...(isSaleCategory ? { compareAtCents: { not: null } } : {}),
        product: scopeWhere,
      },
      select: { color: true },
      distinct: ["color"],
      orderBy: { color: "asc" },
    }),
  ]);

  return {
    page,
    pageSize: PAGE_SIZE,
    total: Math.max(total, displayProducts.length),
    products: displayProducts,
    brands: brandsRaw.map((row) => row.brand),
    sizes: sizesRaw
      .map((row) => row.size)
      .filter((value): value is string => Boolean(value)),
    colors: colorsRaw
      .map((row) => row.color)
      .filter((value): value is string => Boolean(value)),
  };
}

export async function getRootCategorySections(
  rootCategoryId: string,
): Promise<RootCategorySection[]> {
  const root = await prisma.category.findUnique({
    where: { id: rootCategoryId },
    include: {
      children: {
        orderBy: { sortOrder: "asc" },
        include: {
          children: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  if (!root) {
    return [];
  }

  const sections = await Promise.all(
    root.children.map(async (section) => {
      const ids = await collectCategoryTreeIds(section.id);
      const saleScope = `${section.slug} ${section.name}`;
      const saleTargetGroup = saleScopeToTargetGroup(saleScope);

      const productWhere: Prisma.ProductWhereInput =
        root.group === "SALE"
          ? {
              active: true,
              ...(saleTargetGroup
                ? {
                    categories: {
                      some: {
                        category: {
                          group: saleTargetGroup,
                        },
                      },
                    },
                  }
                : {}),
              variants: {
                some: {
                  compareAtCents: {
                    not: null,
                  },
                },
              },
            }
          : {
              active: true,
              categories: {
                some: {
                  categoryId: {
                    in: ids,
                  },
                },
              },
            };

      const products = await prisma.product.findMany({
        where: productWhere,
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 2 },
          variants: { orderBy: { priceCents: "asc" } },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 15,
      });

      return {
        id: section.id,
        name: section.name,
        slug: section.slug,
        children: section.children.map((child) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
        })),
        products,
      };
    }),
  );

  return sections.filter(
    (section) => section.children.length > 0 || section.products.length > 0,
  );
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      variants: {
        orderBy: [{ priceCents: "asc" }, { size: "asc" }],
      },
      categories: {
        include: {
          category: true,
        },
      },
    },
  });
}

export async function getBestSellers(limit = 8) {
  return prisma.product.findMany({
    where: { active: true },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 2 },
      variants: { orderBy: { priceCents: "asc" } },
    },
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });
}
