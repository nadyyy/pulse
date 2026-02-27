"use server";

import { CategoryGroup, OrderStatus, PermissionKey, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  hashPassword,
  requirePermission,
  requireProductEditor,
  requireUsersManage,
} from "@/lib/auth";
import { saveUploadedProductImage } from "@/lib/admin-uploads";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import {
  parseFormInt,
  parseFormString,
  parseOptionalFormString,
  productSchema,
  variantSchema,
} from "@/lib/validation";

export async function createCategoryAction(formData: FormData): Promise<void> {
  await requirePermission(PermissionKey.CATEGORIES_WRITE);

  const name = parseFormString(formData.get("name"));
  const group = parseFormString(formData.get("group"));
  const parentId = parseOptionalFormString(formData.get("parentId"));
  const sortOrder = parseFormInt(formData.get("sortOrder"), 0);
  if (!name || !Object.values(CategoryGroup).includes(group as CategoryGroup)) {
    return;
  }

  await prisma.category.create({
    data: {
      name,
      slug: slugify(name),
      group: group as CategoryGroup,
      sortOrder,
      parentId,
    },
  });

  revalidatePath("/admin/categories");
}

export async function updateCategoryAction(formData: FormData): Promise<void> {
  await requirePermission(PermissionKey.CATEGORIES_WRITE);

  const id = parseFormString(formData.get("id"));
  const name = parseFormString(formData.get("name"));
  const sortOrder = parseFormInt(formData.get("sortOrder"), 0);
  if (!id || !name) {
    return;
  }

  await prisma.category.update({
    where: { id },
    data: {
      name,
      slug: slugify(name),
      sortOrder,
    },
  });

  revalidatePath("/admin/categories");
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await requirePermission(PermissionKey.CATEGORIES_WRITE);

  const id = parseFormString(formData.get("id"));
  if (!id) {
    return;
  }

  await prisma.category.deleteMany({
    where: { id },
  });

  revalidatePath("/admin/categories");
}

export async function createProductAction(formData: FormData): Promise<void> {
  await requireProductEditor();

  const parsed = productSchema.safeParse({
    title: parseFormString(formData.get("title")),
    slug: slugify(parseFormString(formData.get("title"))),
    description: parseFormString(formData.get("description")),
    brand: parseFormString(formData.get("brand")),
    active: parseFormString(formData.get("active")) === "on",
  });

  if (!parsed.success) {
    return;
  }

  const defaultPriceCents = Math.max(
    1000,
    parseFormInt(formData.get("priceCents"), 12000),
  );
  const defaultStock = Math.max(0, parseFormInt(formData.get("stock"), 5));
  const imageFile = formData.get("imageFile");
  const imageUrl = parseOptionalFormString(formData.get("imageUrl"));
  const imageAlt = parseOptionalFormString(formData.get("imageAlt"));
  const categoryIds = formData.getAll("categoryIds").map((entry) => String(entry));

  const created = await prisma.product.create({
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      brand: parsed.data.brand,
      active: parsed.data.active,
      variants: {
        create: {
          sku: `${parsed.data.slug.toUpperCase()}-BASE`,
          priceCents: defaultPriceCents,
          stock: defaultStock,
        },
      },
      categories: {
        create: categoryIds.map((categoryId) => ({
          categoryId,
        })),
      },
    },
  });

  const uploadedImageUrl = await saveUploadedProductImage(imageFile, created.slug);
  const resolvedImageUrl = uploadedImageUrl ?? imageUrl;

  if (resolvedImageUrl) {
    await prisma.productImage.create({
      data: {
        productId: created.id,
        url: resolvedImageUrl,
        alt: imageAlt ?? `${created.title} image 1`,
        sortOrder: 0,
      },
    });
  }

  revalidatePath("/admin/products");
}

export async function updateProductAction(formData: FormData): Promise<void> {
  await requireProductEditor();

  const productId = parseFormString(formData.get("productId"));
  if (!productId) {
    return;
  }

  const parsed = productSchema.safeParse({
    title: parseFormString(formData.get("title")),
    slug: parseFormString(formData.get("slug")),
    description: parseFormString(formData.get("description")),
    brand: parseFormString(formData.get("brand")),
    active: parseFormString(formData.get("active")) === "on",
  });

  if (!parsed.success) {
    return;
  }

  const categoryIds = formData.getAll("categoryIds").map((entry) => String(entry));

  await prisma.product.update({
    where: { id: productId },
    data: {
      title: parsed.data.title,
      slug: slugify(parsed.data.slug),
      description: parsed.data.description,
      brand: parsed.data.brand,
      active: parsed.data.active,
      categories: {
        deleteMany: {},
        create: categoryIds.map((categoryId) => ({
          categoryId,
        })),
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireProductEditor();

  const productId = parseFormString(formData.get("productId"));
  if (!productId) {
    return;
  }

  await prisma.product.deleteMany({
    where: { id: productId },
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function createVariantAction(formData: FormData): Promise<void> {
  await requireProductEditor();

  const productId = parseFormString(formData.get("productId"));
  if (!productId) {
    return;
  }

  const payload = {
    sku: parseFormString(formData.get("sku")),
    size: parseOptionalFormString(formData.get("size")),
    color: parseOptionalFormString(formData.get("color")),
    priceCents: parseFormInt(formData.get("priceCents"), 0),
    compareAtCents: parseOptionalFormString(formData.get("compareAtCents"))
      ? parseFormInt(formData.get("compareAtCents"), 0)
      : null,
    stock: parseFormInt(formData.get("stock"), 0),
  };

  const parsed = variantSchema.safeParse(payload);
  if (!parsed.success) {
    return;
  }

  await prisma.variant.create({
    data: {
      productId,
      ...parsed.data,
    },
  });

  revalidatePath(`/admin/products/${productId}`);
}

export async function updateVariantAction(formData: FormData): Promise<void> {
  await requireProductEditor();

  const variantId = parseFormString(formData.get("variantId"));
  const productId = parseFormString(formData.get("productId"));
  if (!variantId || !productId) {
    return;
  }

  const payload = {
    sku: parseFormString(formData.get("sku")),
    size: parseOptionalFormString(formData.get("size")),
    color: parseOptionalFormString(formData.get("color")),
    priceCents: parseFormInt(formData.get("priceCents"), 0),
    compareAtCents: parseOptionalFormString(formData.get("compareAtCents"))
      ? parseFormInt(formData.get("compareAtCents"), 0)
      : null,
    stock: parseFormInt(formData.get("stock"), 0),
  };

  const parsed = variantSchema.safeParse(payload);
  if (!parsed.success) {
    return;
  }

  await prisma.variant.update({
    where: { id: variantId },
    data: parsed.data,
  });

  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteVariantAction(formData: FormData): Promise<void> {
  await requireProductEditor();

  const variantId = parseFormString(formData.get("variantId"));
  const productId = parseFormString(formData.get("productId"));
  if (!variantId || !productId) {
    return;
  }

  await prisma.variant.deleteMany({
    where: { id: variantId },
  });

  revalidatePath(`/admin/products/${productId}`);
}

export async function createImageAction(formData: FormData): Promise<void> {
  await requireProductEditor();

  const productId = parseFormString(formData.get("productId"));
  const uploadedFile = formData.get("imageFile");
  const fallbackUrl = parseOptionalFormString(formData.get("url"));
  const alt = parseOptionalFormString(formData.get("alt"));
  const sortOrder = parseFormInt(formData.get("sortOrder"), 0);
  if (!productId) {
    return;
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true, title: true, _count: { select: { images: true } } },
  });

  if (!product) {
    return;
  }

  const uploadedUrl = await saveUploadedProductImage(uploadedFile, product.slug);
  const resolvedUrl = uploadedUrl ?? fallbackUrl;

  if (!resolvedUrl) {
    return;
  }

  await prisma.productImage.create({
    data: {
      productId,
      url: resolvedUrl,
      alt: alt ?? `${product.title} image ${sortOrder + 1}`,
      sortOrder: Number.isNaN(sortOrder) ? product._count.images : sortOrder,
    },
  });

  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteImageAction(formData: FormData): Promise<void> {
  await requireProductEditor();

  const imageId = parseFormString(formData.get("imageId"));
  const productId = parseFormString(formData.get("productId"));
  if (!imageId || !productId) {
    return;
  }

  await prisma.productImage.deleteMany({
    where: { id: imageId },
  });

  revalidatePath(`/admin/products/${productId}`);
}

export async function setVariantStockAction(formData: FormData): Promise<void> {
  await requireProductEditor();

  const variantId = parseFormString(formData.get("variantId"));
  const productId = parseFormString(formData.get("productId"));
  const stock = Math.max(0, parseFormInt(formData.get("nextStock"), 0));
  if (!variantId || !productId) {
    return;
  }

  await prisma.variant.update({
    where: { id: variantId },
    data: {
      stock,
    },
  });

  revalidatePath(`/admin/products/${productId}`);
}

export async function createStaffUserAction(formData: FormData): Promise<void> {
  const actor = await requireUsersManage();

  const email = parseFormString(formData.get("email"));
  const password = parseFormString(formData.get("password"));
  const roleRaw = parseFormString(formData.get("role"));

  if (!email || password.length < 8) {
    return;
  }

  const role =
    roleRaw === "ADMIN"
      ? UserRole.ADMIN
      : roleRaw === "STAFF"
        ? UserRole.STAFF
        : UserRole.CUSTOMER;

  if (actor.role === UserRole.STAFF && role !== UserRole.CUSTOMER) {
    return;
  }

  if (role === UserRole.ADMIN && actor.role !== UserRole.OWNER) {
    return;
  }

  const created = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      role,
    },
  });

  const permissionValues = formData
    .getAll("permissions")
    .map((value) => String(value))
    .filter((value): value is PermissionKey =>
      Object.values(PermissionKey).includes(value as PermissionKey),
    );

  if (permissionValues.length > 0) {
    await prisma.staffPermission.createMany({
      data: permissionValues.map((key) => ({
        userId: created.id,
        key,
      })),
      skipDuplicates: true,
    });
  }

  revalidatePath("/admin/users");
}

export async function updateUserPermissionsAction(formData: FormData): Promise<void> {
  const actor = await requireUsersManage();

  const userId = parseFormString(formData.get("userId"));
  if (!userId) {
    return;
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!target || target.role !== UserRole.STAFF || actor.role === UserRole.STAFF) {
    return;
  }

  const selected = formData
    .getAll("permissions")
    .map((value) => String(value))
    .filter((value): value is PermissionKey =>
      Object.values(PermissionKey).includes(value as PermissionKey),
    );

  await prisma.staffPermission.deleteMany({
    where: { userId },
  });

  if (selected.length > 0) {
    await prisma.staffPermission.createMany({
      data: selected.map((key) => ({
        userId,
        key,
      })),
    });
  }

  revalidatePath("/admin/users");
}

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  await requirePermission(PermissionKey.ORDERS_WRITE);

  const orderId = parseFormString(formData.get("orderId"));
  const statusRaw = parseFormString(formData.get("status"));
  const allowedStatuses: OrderStatus[] = [
    OrderStatus.PLACED,
    OrderStatus.FULFILLED,
    OrderStatus.CANCELLED,
  ];

  if (!orderId || !allowedStatuses.includes(statusRaw as OrderStatus)) {
    return;
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: statusRaw as OrderStatus,
    },
  });

  revalidatePath("/admin/orders");
}
