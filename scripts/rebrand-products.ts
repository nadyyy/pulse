import { CategoryGroup, PrismaClient } from "@prisma/client";

import { slugify } from "../lib/utils";

type AudienceRoot = "men" | "women" | "kids";

type ProductTemplate = {
  brand: string;
  model: string;
  description: string;
};

const prisma = new PrismaClient();

const AUDIENCE_LABEL: Record<AudienceRoot, string> = {
  men: "Men's",
  women: "Women's",
  kids: "Kids'",
};

const SHOE_COLORWAYS = [
  "Black/White",
  "Triple White",
  "Navy/Volt",
  "Grey/Blue",
  "Bone/Sand",
  "Crimson/White",
  "Olive/Black",
  "Ice Blue",
  "Rose/Coral",
  "Carbon/Red",
] as const;

const APPAREL_COLORWAYS = [
  "Black",
  "Heather Grey",
  "Midnight Navy",
  "Stone",
  "Olive",
  "University Red",
  "Sky Blue",
  "Bone",
] as const;

const SHOE_TEMPLATES: Record<AudienceRoot, readonly ProductTemplate[]> = {
  men: [
    {
      brand: "Nike",
      model: "Air Zoom Pegasus 41",
      description:
        "Daily running shoe with breathable mesh, responsive foam cushioning, and confident road traction.",
    },
    {
      brand: "adidas",
      model: "Ultraboost Light",
      description:
        "Energy-return running profile with soft heel comfort and durable outsole grip for city miles.",
    },
    {
      brand: "New Balance",
      model: "1906R",
      description:
        "Lifestyle runner inspired by archival performance silhouettes with premium support and stability.",
    },
    {
      brand: "ASICS",
      model: "GEL-Kayano 31",
      description:
        "Stability running platform with plush GEL cushioning and smooth transition for long-distance comfort.",
    },
    {
      brand: "PUMA",
      model: "Deviate NITRO 3",
      description:
        "Lightweight trainer with energetic NITRO foam and propulsive ride for tempo sessions.",
    },
    {
      brand: "Jordan",
      model: "Tatum 2",
      description:
        "Court-ready basketball sneaker with lateral containment and responsive cushioning.",
    },
  ],
  women: [
    {
      brand: "Nike",
      model: "Vomero 17",
      description:
        "Soft and cushioned running favorite designed for high-mileage comfort and smooth landings.",
    },
    {
      brand: "adidas",
      model: "Adizero SL2",
      description:
        "Fast-feel running silhouette with lightweight ride and breathable upper for daily training.",
    },
    {
      brand: "New Balance",
      model: "Fresh Foam X 1080v13",
      description:
        "Plush all-around trainer with soft underfoot feel and reliable everyday versatility.",
    },
    {
      brand: "ASICS",
      model: "GEL-Nimbus 26",
      description:
        "Premium cushioning model for comfort-focused road running and recovery days.",
    },
    {
      brand: "PUMA",
      model: "Velocity NITRO 3",
      description:
        "Balanced trainer offering responsive cushioning, breathable comfort, and easy transitions.",
    },
    {
      brand: "On",
      model: "Cloud 5",
      description:
        "Minimal lifestyle-performance hybrid with cushioned landings and easy slip-on feel.",
    },
  ],
  kids: [
    {
      brand: "Nike",
      model: "Revolution 7",
      description:
        "Everyday kids running shoe with lightweight support and durable outsole grip for active play.",
    },
    {
      brand: "adidas",
      model: "Duramo SL",
      description:
        "Comfortable kids trainer with breathable construction and cushioned step-in feel.",
    },
    {
      brand: "New Balance",
      model: "574",
      description:
        "Classic kids sneaker with sturdy construction and easy all-day comfort for school and weekends.",
    },
    {
      brand: "PUMA",
      model: "RS-X",
      description:
        "Chunky lifestyle sneaker design with playful style and comfortable cushioning.",
    },
    {
      brand: "Jordan",
      model: "Air Jordan 1 Low SE",
      description:
        "Kids basketball-inspired favorite with premium look and reliable everyday durability.",
    },
    {
      brand: "Vans",
      model: "Old Skool V",
      description:
        "Easy-on low-top kids classic with grippy outsole and iconic side-stripe look.",
    },
  ],
};

const APPAREL_TEMPLATES: Record<AudienceRoot, readonly ProductTemplate[]> = {
  men: [
    {
      brand: "Nike",
      model: "Dri-FIT Legend Tee",
      description:
        "Moisture-wicking training tee built for breathable comfort in gym and everyday sessions.",
    },
    {
      brand: "adidas",
      model: "Tiro 24 Track Pants",
      description:
        "Slim athletic pants with lightweight stretch fabric and clean sport styling.",
    },
    {
      brand: "PUMA",
      model: "Essentials Fleece Hoodie",
      description:
        "Soft fleece pullover delivering everyday warmth with a classic athletic fit.",
    },
    {
      brand: "Under Armour",
      model: "Tech 2.0 Short Sleeve",
      description:
        "Quick-dry performance top with smooth hand-feel and unrestricted movement.",
    },
    {
      brand: "New Balance",
      model: "Athletics French Terry Jogger",
      description:
        "Relaxed jogger built for warmups, commute, and off-duty comfort.",
    },
  ],
  women: [
    {
      brand: "Nike",
      model: "One High-Waisted Leggings",
      description:
        "Supportive everyday leggings with sweat-wicking stretch and secure high-rise fit.",
    },
    {
      brand: "adidas",
      model: "Own The Run Tee",
      description:
        "Breathable run-ready top designed for comfort through daily miles.",
    },
    {
      brand: "PUMA",
      model: "Studio Foundation Bra",
      description:
        "Low-impact training essential with soft support and flexible movement.",
    },
    {
      brand: "Under Armour",
      model: "HeatGear Compression Top",
      description:
        "Close-fit performance layer that stays cool and dry during intense sessions.",
    },
    {
      brand: "ASICS",
      model: "Court Skort",
      description:
        "Court-focused piece balancing stretch mobility, coverage, and lightweight breathability.",
    },
  ],
  kids: [
    {
      brand: "Nike",
      model: "Sportswear Club Fleece Hoodie",
      description:
        "Soft fleece kids hoodie for school, practice, and cooler days outdoors.",
    },
    {
      brand: "adidas",
      model: "Future Icons Tee",
      description:
        "Comfortable everyday t-shirt with sporty styling and lightweight cotton feel.",
    },
    {
      brand: "PUMA",
      model: "Essentials Logo Set",
      description:
        "Easy matching top-and-bottom set built for active everyday movement.",
    },
    {
      brand: "Under Armour",
      model: "Rival Fleece Joggers",
      description:
        "Warm and durable joggers with relaxed athletic fit for all-day comfort.",
    },
    {
      brand: "Reebok",
      model: "Graphic Training Tee",
      description:
        "Lightweight kids training tee made for play, practice, and weekend wear.",
    },
  ],
};

const APPAREL_SLUG_HINTS = [
  "clothing",
  "tops",
  "hoodies",
  "jackets",
  "pants",
  "leggings",
  "shorts",
  "dresses",
  "bras",
  "underwear",
  "socks",
  "sets",
  "swimwear",
  "joggers",
];

function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length];
}

function detectAudience(groups: CategoryGroup[], index: number): AudienceRoot {
  if (groups.includes(CategoryGroup.MEN)) {
    return "men";
  }
  if (groups.includes(CategoryGroup.WOMEN)) {
    return "women";
  }
  if (groups.includes(CategoryGroup.KIDS)) {
    return "kids";
  }

  return pick(["men", "women", "kids"] as const, index);
}

function detectProductType(slugs: string[], firstImageUrl: string | undefined): "shoe" | "apparel" {
  if (firstImageUrl?.includes("/products/apparel-")) {
    return "apparel";
  }
  if (firstImageUrl?.includes("/products/shoe-")) {
    return "shoe";
  }

  if (slugs.some((slug) => APPAREL_SLUG_HINTS.some((hint) => slug.includes(hint)))) {
    return "apparel";
  }

  return "shoe";
}

async function main() {
  const products = await prisma.product.findMany({
    include: {
      categories: {
        include: {
          category: {
            select: {
              group: true,
              slug: true,
            },
          },
        },
      },
      images: {
        select: {
          id: true,
          url: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const usedSlugs = new Set(products.map((product) => product.slug));
  const counters: Record<string, number> = {};

  for (let index = 0; index < products.length; index += 1) {
    const product = products[index];
    const groups = product.categories.map((row) => row.category.group);
    const slugs = product.categories.map((row) => row.category.slug);
    const audience = detectAudience(groups, index);
    const type = detectProductType(slugs, product.images[0]?.url);
    const key = `${type}-${audience}`;
    const current = counters[key] ?? 0;
    counters[key] = current + 1;

    const template =
      type === "apparel"
        ? pick(APPAREL_TEMPLATES[audience], current)
        : pick(SHOE_TEMPLATES[audience], current);
    const colorway =
      type === "apparel"
        ? pick(APPAREL_COLORWAYS, index)
        : pick(SHOE_COLORWAYS, index);
    const title = `${template.brand} ${template.model} ${AUDIENCE_LABEL[audience]} (${colorway})`;

    usedSlugs.delete(product.slug);
    const baseSlug = slugify(`${template.brand}-${template.model}-${audience}-${current + 1}`);
    let nextSlug = baseSlug;
    let suffix = 2;
    while (usedSlugs.has(nextSlug)) {
      nextSlug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
    usedSlugs.add(nextSlug);

    await prisma.$transaction([
      prisma.product.update({
        where: { id: product.id },
        data: {
          title,
          brand: template.brand,
          slug: nextSlug,
          description: template.description,
        },
      }),
      prisma.productImage.updateMany({
        where: { productId: product.id },
        data: {
          alt: `${title} image`,
        },
      }),
    ]);
  }

  console.log(`Updated ${products.length} products with realistic brand names.`);
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
