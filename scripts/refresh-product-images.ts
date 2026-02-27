import { PrismaClient } from "@prisma/client";

import {
  audienceFromTitle,
  parseLegacyProductPath,
  productPhotoByAudience,
} from "../lib/curated-images";

const prisma = new PrismaClient();

async function main() {
  const images = await prisma.productImage.findMany({
    select: {
      id: true,
      url: true,
      sortOrder: true,
      product: {
        select: {
          title: true,
        },
      },
    },
    orderBy: [{ productId: "asc" }, { sortOrder: "asc" }],
  });

  let updated = 0;

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    const legacy = parseLegacyProductPath(image.url);
    const audience = audienceFromTitle(image.product.title);
    const type: "shoe" | "apparel" =
      legacy?.type ??
      (image.product.title.match(
        /\b(tee|hoodie|jogger|legging|short|pant|jacket|bra|skort|top|shirt)\b/i,
      )
        ? "apparel"
        : "shoe");
    const sourceIndex = legacy ? legacy.index : index + image.sortOrder;
    const nextUrl = productPhotoByAudience(audience, type, sourceIndex);

    if (nextUrl === image.url) {
      continue;
    }

    await prisma.productImage.update({
      where: { id: image.id },
      data: {
        url: nextUrl,
      },
    });
    updated += 1;
  }

  console.log(`Updated ${updated} product images.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
