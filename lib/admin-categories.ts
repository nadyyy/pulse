import { CategoryGroup } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const STOREFRONT_GROUPS: CategoryGroup[] = [
  CategoryGroup.MEN,
  CategoryGroup.WOMEN,
  CategoryGroup.KIDS,
  CategoryGroup.SPORT,
  CategoryGroup.SALE,
];

export type AdminCategoryOption = {
  id: string;
  group: CategoryGroup;
  label: string;
};

export async function getAdminAssignableCategories(): Promise<AdminCategoryOption[]> {
  const categories = await prisma.category.findMany({
    where: {
      group: {
        in: STOREFRONT_GROUPS,
      },
    },
    include: {
      parent: {
        select: {
          name: true,
          parent: {
            select: {
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          children: true,
        },
      },
    },
    orderBy: [{ group: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  const leafCategories = categories.filter(
    (category) => category.parentId && category._count.children === 0,
  );

  const source = leafCategories.length > 0
    ? leafCategories
    : categories.filter((category) => category.parentId);

  return source.map((category) => {
    const parts = [
      category.group,
      category.parent?.parent?.name,
      category.parent?.name,
      category.name,
    ].filter((part): part is string => Boolean(part));

    return {
      id: category.id,
      group: category.group,
      label: parts.join(" / "),
    };
  });
}

