import { PermissionKey, PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

import { hashEmail, normalizeEmail } from "../lib/crypto-security";
import { productPhotoByAudience } from "../lib/curated-images";
import { slugify } from "../lib/utils";

type TaxonomyNode = {
  name: string;
  children?: readonly TaxonomyNode[];
};

const prisma = new PrismaClient();

const taxonomy = {
  women: {
    group: "WOMEN",
    children: [
      {
        name: "New & Featured",
        children: [
          "New Arrivals",
          "Best Sellers",
          "Latest Drops",
          "Member Exclusives",
          "Sale",
        ].map((name) => ({ name })),
      },
      {
        name: "Shoes",
        children: [
          "All Shoes",
          "Lifestyle",
          "Running",
          "Training & Gym",
          "Basketball",
          "Walking",
          "Soccer",
          "Tennis",
          "Sandals & Slides",
        ].map((name) => ({ name })),
      },
      {
        name: "Clothing",
        children: [
          "All Clothing",
          "Tops & T-Shirts",
          "Hoodies & Sweatshirts",
          "Jackets & Vests",
          "Pants",
          "Leggings",
          "Shorts",
          "Dresses & Skirts",
          "Bras",
          "Underwear",
          "Socks",
          "Matching Sets",
          "Swimwear",
        ].map((name) => ({ name })),
      },
      {
        name: "Accessories",
        children: [
          "Bags & Backpacks",
          "Hats & Headwear",
          "Sunglasses",
          "Gloves",
          "Belts",
          "Water Bottles",
        ].map((name) => ({ name })),
      },
    ],
  },
  men: {
    group: "MEN",
    children: [
      {
        name: "New & Featured",
        children: [
          "New Arrivals",
          "Best Sellers",
          "Latest Drops",
          "Member Exclusives",
          "Sale",
        ].map((name) => ({ name })),
      },
      {
        name: "Shoes",
        children: [
          "All Shoes",
          "Lifestyle",
          "Running",
          "Training & Gym",
          "Basketball",
          "Walking",
          "Soccer",
          "Tennis",
          "Sandals & Slides",
        ].map((name) => ({ name })),
      },
      {
        name: "Clothing",
        children: [
          "All Clothing",
          "Tops & T-Shirts",
          "Hoodies & Sweatshirts",
          "Jackets & Vests",
          "Pants",
          "Joggers",
          "Shorts",
          "Underwear",
          "Socks",
          "Matching Sets",
        ].map((name) => ({ name })),
      },
      {
        name: "Accessories",
        children: [
          "Bags & Backpacks",
          "Hats & Headwear",
          "Sunglasses",
          "Gloves",
          "Belts",
          "Water Bottles",
        ].map((name) => ({ name })),
      },
    ],
  },
  kids: {
    group: "KIDS",
    children: [
      {
        name: "Big Kids",
        children: [
          {
            name: "Shoes",
            children: [
              "All Shoes",
              "Lifestyle",
              "Running",
              "Basketball",
              "Soccer",
              "Sandals & Slides",
            ].map((name) => ({ name })),
          },
          {
            name: "Clothing",
            children: [
              "All Clothing",
              "Tops",
              "Hoodies",
              "Jackets",
              "Pants & Leggings",
              "Shorts",
              "Sets",
              "Socks",
            ].map((name) => ({ name })),
          },
          {
            name: "Accessories",
            children: ["Bags", "Hats & Headwear"].map((name) => ({ name })),
          },
        ],
      },
      {
        name: "Little Kids",
        children: [
          {
            name: "Shoes",
            children: [
              "All Shoes",
              "Lifestyle",
              "Running",
              "Basketball",
              "Soccer",
              "Sandals & Slides",
            ].map((name) => ({ name })),
          },
          {
            name: "Clothing",
            children: [
              "All Clothing",
              "Tops",
              "Hoodies",
              "Jackets",
              "Pants & Leggings",
              "Shorts",
              "Sets",
              "Socks",
            ].map((name) => ({ name })),
          },
          {
            name: "Accessories",
            children: ["Bags", "Hats & Headwear"].map((name) => ({ name })),
          },
        ],
      },
      {
        name: "Baby & Toddler",
        children: [
          {
            name: "Shoes",
            children: [
              "All Shoes",
              "Lifestyle",
              "Running",
              "Basketball",
              "Soccer",
              "Sandals & Slides",
            ].map((name) => ({ name })),
          },
          {
            name: "Clothing",
            children: [
              "All Clothing",
              "Tops",
              "Hoodies",
              "Jackets",
              "Pants & Leggings",
              "Shorts",
              "Sets",
              "Socks",
            ].map((name) => ({ name })),
          },
          {
            name: "Accessories",
            children: ["Bags", "Hats & Headwear"].map((name) => ({ name })),
          },
        ],
      },
    ],
  },
  sport: {
    group: "SPORT",
    children: [
      "Running",
      "Training & Gym",
      "Basketball",
      "Soccer",
      "Tennis",
      "Golf",
      "Outdoor",
    ].map((name) => ({ name })),
  },
  sale: {
    group: "SALE",
    children: ["Men Sale", "Women Sale", "Kids Sale"].map((name) => ({ name })),
  },
} as const;

function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createSku(base: string, index: number): string {
  return `${base}-${String(index).padStart(4, "0")}`;
}

type AudienceRoot = "men" | "women" | "kids";

type ProductTemplate = {
  brand: string;
  model: string;
  description: string;
};

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
    {
      brand: "Under Armour",
      model: "Curry 11",
      description:
        "Explosive hoops design built for quick cuts, strong grip, and all-game comfort.",
    },
    {
      brand: "Reebok",
      model: "Nano X4",
      description:
        "Cross-training shoe balancing stability and flexibility for gym and conditioning workouts.",
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
      brand: "HOKA",
      model: "Clifton 9",
      description:
        "Lightweight high-cushion runner for everyday miles with smooth rocker geometry.",
    },
    {
      brand: "On",
      model: "Cloud 5",
      description:
        "Minimal lifestyle-performance hybrid with cushioned landings and easy slip-on feel.",
    },
    {
      brand: "Jordan",
      model: "Air Jordan 1 Low",
      description:
        "Iconic low-top sneaker style blending classic heritage details and day-long wearability.",
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
      brand: "ASICS",
      model: "GT-1000 13 GS",
      description:
        "Supportive youth running option with stability-focused cushioning and secure fit.",
    },
    {
      brand: "Jordan",
      model: "Air Jordan 1 Low SE",
      description:
        "Kids basketball-inspired favorite with premium look and reliable everyday durability.",
    },
    {
      brand: "Converse",
      model: "Chuck Taylor All Star",
      description:
        "Timeless youth sneaker with versatile styling and durable canvas upper.",
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
    {
      brand: "Reebok",
      model: "Training Woven Jacket",
      description:
        "Lightweight training layer for changing weather and active daily wear.",
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
      brand: "New Balance",
      model: "Impact Run Tight",
      description:
        "Performance running tight with body-hugging support and smooth stride comfort.",
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
    {
      brand: "Converse",
      model: "Star Chevron Hoodie",
      description:
        "Casual fleece hoodie with iconic logo styling and comfortable fit.",
    },
  ],
};

async function createTree(params: {
  group: "MEN" | "WOMEN" | "KIDS" | "SPORT" | "SALE";
  rootName: string;
  nodes: readonly TaxonomyNode[];
  map: Map<string, string>;
}) {
  const rootSlug = slugify(params.rootName);
  const root = await prisma.category.create({
    data: {
      name: params.rootName,
      slug: rootSlug,
      group: params.group,
      sortOrder: ["men", "women", "kids", "sport", "sale"].indexOf(rootSlug),
    },
  });

  params.map.set(rootSlug, root.id);

  async function createChildren(
    parentId: string,
    parentPath: string,
    nodes: readonly TaxonomyNode[],
  ) {
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      const slug = slugify(node.name);
      const row = await prisma.category.create({
        data: {
          name: node.name,
          slug,
          group: params.group,
          parentId,
          sortOrder: i,
        },
      });

      const path = `${parentPath}/${slug}`;
      params.map.set(path, row.id);

      if (node.children && node.children.length > 0) {
        await createChildren(row.id, path, node.children);
      }
    }
  }

  await createChildren(root.id, rootSlug, params.nodes);
}

async function seedUsers() {
  const demoPassword = process.env.SEED_DEMO_PASSWORD ?? "DemoPass#2026";
  const rawCost = Number(process.env.PASSWORD_HASH_COST ?? 12);
  const cost =
    Number.isFinite(rawCost) && rawCost >= 10 && rawCost <= 15
      ? Math.floor(rawCost)
      : 12;
  const ownerEmail = normalizeEmail("owner@demo.com");
  const adminEmail = normalizeEmail("admin@demo.com");
  const staffEmail = normalizeEmail("staff@demo.com");
  const employeeEmail = normalizeEmail("employee@demo.com");

  const ownerPasswordHash = await bcrypt.hash(demoPassword, cost);
  const adminPasswordHash = await bcrypt.hash(demoPassword, cost);
  const staffPasswordHash = await bcrypt.hash(demoPassword, cost);
  const employeePasswordHash = await bcrypt.hash(demoPassword, cost);

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {
      emailHash: hashEmail(ownerEmail),
      role: UserRole.OWNER,
      passwordHash: ownerPasswordHash,
    },
    create: {
      email: ownerEmail,
      emailHash: hashEmail(ownerEmail),
      passwordHash: ownerPasswordHash,
      role: UserRole.OWNER,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: staffEmail },
    update: {
      emailHash: hashEmail(staffEmail),
      role: UserRole.STAFF,
      passwordHash: staffPasswordHash,
    },
    create: {
      email: staffEmail,
      emailHash: hashEmail(staffEmail),
      passwordHash: staffPasswordHash,
      role: UserRole.STAFF,
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: employeeEmail },
    update: {
      emailHash: hashEmail(employeeEmail),
      role: UserRole.STAFF,
      passwordHash: employeePasswordHash,
    },
    create: {
      email: employeeEmail,
      emailHash: hashEmail(employeeEmail),
      passwordHash: employeePasswordHash,
      role: UserRole.STAFF,
    },
  });

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      emailHash: hashEmail(adminEmail),
      role: UserRole.ADMIN,
      passwordHash: adminPasswordHash,
    },
    create: {
      email: adminEmail,
      emailHash: hashEmail(adminEmail),
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
    },
  });

  await prisma.staffPermission.deleteMany({
    where: { userId: staff.id },
  });

  await prisma.staffPermission.create({
    data: {
      userId: staff.id,
      key: PermissionKey.PRODUCTS_READ,
    },
  });

  await prisma.staffPermission.deleteMany({
    where: { userId: employee.id },
  });

  await prisma.staffPermission.createMany({
    data: [
      {
        userId: employee.id,
        key: PermissionKey.PRODUCTS_READ,
      },
      {
        userId: employee.id,
        key: PermissionKey.ORDERS_READ,
      },
    ],
    skipDuplicates: true,
  });

  return { owner, staff, employee };
}

async function seedProducts(pathMap: Map<string, string>) {
  const shoeRoots: AudienceRoot[] = ["men", "women", "kids"];
  const apparelRoots: AudienceRoot[] = ["men", "women", "kids"];

  const shoeSizes = Array.from({ length: 11 }, (_, idx) => String(36 + idx));
  const apparelSizes = ["S", "M", "L", "XL"];

  const sportPaths = [
    "sport/running",
    "sport/training-and-gym",
    "sport/basketball",
    "sport/soccer",
    "sport/tennis",
  ];

  let skuIndex = 1;

  for (let i = 1; i <= 60; i += 1) {
    const root = pick(shoeRoots, i - 1);
    const template = pick(SHOE_TEMPLATES[root], i - 1);
    const colorway = pick(SHOE_COLORWAYS, i - 1);
    const title = `${template.brand} ${template.model} ${AUDIENCE_LABEL[root]} (${colorway})`;
    const shoePath =
      root === "kids"
        ? `${root}/${pick(["big-kids", "little-kids", "baby-and-toddler"], i - 1)}/shoes/${pick(
            ["lifestyle", "running", "basketball", "soccer", "sandals-and-slides"],
            i - 1,
          )}`
        : `${root}/shoes/${pick(
            [
              "lifestyle",
              "running",
              "training-and-gym",
              "basketball",
              "soccer",
              "tennis",
              "walking",
            ],
            i - 1,
          )}`;

    const categoryIds = [
      pathMap.get(shoePath),
      pathMap.get(pick(sportPaths, i - 1)),
    ].filter((value): value is string => Boolean(value));

    const product = await prisma.product.create({
      data: {
        title,
        slug: slugify(`${template.brand}-${template.model}-${root}-${i}`),
        description: template.description,
        brand: template.brand,
        active: true,
        categories: {
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
    });

    const colorCount = 2 + (i % 3);
    const colors = Array.from({ length: colorCount }, (_, index) =>
      pick(SHOE_COLORWAYS, i + index),
    );

    const variants = colors.flatMap((color) =>
      shoeSizes.map((size) => ({
        productId: product.id,
        sku: createSku(`SH-${String(i).padStart(3, "0")}`, skuIndex++),
        size,
        color,
        priceCents: 11000 + (i % 12) * 500,
        compareAtCents: i % 3 === 0 ? 14000 + (i % 9) * 500 : null,
        stock: randomInt(2, 30),
      })),
    );

    await prisma.variant.createMany({ data: variants });

    const imageCount = 1 + (i % 3);
    const images = Array.from({ length: imageCount }, (_, index) => {
      const imageNumber = ((i + index - 1) % 60) + 1;
      return {
        productId: product.id,
        url: productPhotoByAudience(root, "shoe", imageNumber - 1),
        alt: `${product.title} image ${index + 1}`,
        sortOrder: index,
      };
    });

    await prisma.productImage.createMany({ data: images });
  }

  for (let i = 1; i <= 20; i += 1) {
    const root = pick(apparelRoots, i - 1);
    const template = pick(APPAREL_TEMPLATES[root], i - 1);
    const colorway = pick(APPAREL_COLORWAYS, i - 1);
    const title = `${template.brand} ${template.model} ${AUDIENCE_LABEL[root]} (${colorway})`;
    const clothingPath =
      root === "kids"
        ? `${root}/${pick(["big-kids", "little-kids", "baby-and-toddler"], i - 1)}/clothing/${pick(
            ["tops", "hoodies", "jackets", "pants-and-leggings", "shorts", "sets"],
            i - 1,
          )}`
        : `${root}/clothing/${pick(
            [
              "tops-and-t-shirts",
              "hoodies-and-sweatshirts",
              "jackets-and-vests",
              root === "women" ? "leggings" : "joggers",
              "shorts",
              "matching-sets",
            ],
            i - 1,
          )}`;

    const categoryId = pathMap.get(clothingPath);
    if (!categoryId) {
      continue;
    }

    const product = await prisma.product.create({
      data: {
        title,
        slug: slugify(`${template.brand}-${template.model}-${root}-${i}`),
        description: template.description,
        brand: template.brand,
        active: true,
        categories: {
          create: [{ categoryId }],
        },
      },
    });

    const colorCount = 2 + (i % 3);
    const colors = Array.from({ length: colorCount }, (_, index) =>
      pick(APPAREL_COLORWAYS, i + index),
    );

    const variants = colors.flatMap((color) =>
      apparelSizes.map((size) => ({
        productId: product.id,
        sku: createSku(`AP-${String(i).padStart(3, "0")}`, skuIndex++),
        size,
        color,
        priceCents: 4500 + (i % 8) * 350,
        compareAtCents: i % 2 === 0 ? 6800 + (i % 5) * 300 : null,
        stock: randomInt(4, 45),
      })),
    );

    await prisma.variant.createMany({ data: variants });

    const imageCount = 1 + (i % 3);
    const images = Array.from({ length: imageCount }, (_, index) => {
      const imageNumber = ((i + index - 1) % 20) + 1;
      return {
        productId: product.id,
        url: productPhotoByAudience(root, "apparel", imageNumber - 1),
        alt: `${product.title} image ${index + 1}`,
        sortOrder: index,
      };
    });

    await prisma.productImage.createMany({ data: images });
  }
}

async function resetData() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.staffPermission.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
}

async function seedTaxonomy() {
  const pathMap = new Map<string, string>();

  await createTree({
    group: "MEN",
    rootName: "Men",
    nodes: taxonomy.men.children,
    map: pathMap,
  });
  await createTree({
    group: "WOMEN",
    rootName: "Women",
    nodes: taxonomy.women.children,
    map: pathMap,
  });
  await createTree({
    group: "KIDS",
    rootName: "Kids",
    nodes: taxonomy.kids.children,
    map: pathMap,
  });
  await createTree({
    group: "SPORT",
    rootName: "Sport",
    nodes: taxonomy.sport.children,
    map: pathMap,
  });
  await createTree({
    group: "SALE",
    rootName: "Sale",
    nodes: taxonomy.sale.children,
    map: pathMap,
  });

  return pathMap;
}

async function main() {
  await resetData();
  await seedUsers();

  const pathMap = await seedTaxonomy();
  await seedProducts(pathMap);
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
