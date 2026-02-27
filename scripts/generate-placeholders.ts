import fs from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

type ProductKind = "shoe" | "apparel";

type Palette = {
  bgA: string;
  bgB: string;
  surface: string;
  accent: string;
  detail: string;
};

type Job = {
  filename: string;
  label: string;
  kind: ProductKind;
  palette: Palette;
};

const OUTPUT_DIR = path.join(process.cwd(), "public", "products");
const FORCE = process.argv.includes("--force");
const WIDTH = 1024;
const HEIGHT = 1024;

const SHOE_PALETTES: Palette[] = [
  {
    bgA: "#f7fafc",
    bgB: "#e8edf5",
    surface: "#ffffff",
    accent: "#2f3c53",
    detail: "#6b7c94",
  },
  {
    bgA: "#f7f4f2",
    bgB: "#ebe4df",
    surface: "#ffffff",
    accent: "#49372f",
    detail: "#8a6f62",
  },
  {
    bgA: "#eef6f2",
    bgB: "#dfebe6",
    surface: "#fbfffd",
    accent: "#23483d",
    detail: "#5f8b7d",
  },
  {
    bgA: "#f6f2fa",
    bgB: "#e9e3f3",
    surface: "#ffffff",
    accent: "#392f5e",
    detail: "#7c6aa6",
  },
  {
    bgA: "#f9f5ed",
    bgB: "#efe6d7",
    surface: "#fffcf6",
    accent: "#5c4028",
    detail: "#a07d5f",
  },
];

const APPAREL_PALETTES: Palette[] = [
  {
    bgA: "#f3f6fb",
    bgB: "#e5eaf2",
    surface: "#fdfefe",
    accent: "#1f2f49",
    detail: "#61708b",
  },
  {
    bgA: "#f7f4f6",
    bgB: "#ece4e9",
    surface: "#ffffff",
    accent: "#4b2b3b",
    detail: "#856174",
  },
  {
    bgA: "#f1f8f7",
    bgB: "#dfece8",
    surface: "#fcfffe",
    accent: "#1f4a40",
    detail: "#5e8a7f",
  },
  {
    bgA: "#f9f7f2",
    bgB: "#efe9de",
    surface: "#fffefb",
    accent: "#4d3f2a",
    detail: "#8c7a60",
  },
];

function pad(index: number): string {
  return String(index).padStart(3, "0");
}

function paletteFor(kind: ProductKind, index: number): Palette {
  const source = kind === "shoe" ? SHOE_PALETTES : APPAREL_PALETTES;
  return source[index % source.length];
}

function jobs(): Job[] {
  const output: Job[] = [];

  for (let i = 1; i <= 60; i += 1) {
    output.push({
      filename: `shoe-${pad(i)}.png`,
      label: `Pulse Runner ${pad(i)}`,
      kind: "shoe",
      palette: paletteFor("shoe", i),
    });
  }

  for (let i = 1; i <= 20; i += 1) {
    output.push({
      filename: `apparel-${pad(i)}.png`,
      label: `Pulse Layer ${pad(i)}`,
      kind: "apparel",
      palette: paletteFor("apparel", i),
    });
  }

  return output;
}

function artForShoe(palette: Palette): string {
  return `
    <ellipse cx="512" cy="760" rx="300" ry="70" fill="#000" fill-opacity="0.12" />

    <path d="M186 652 C270 540 435 470 612 516 L774 562 C833 579 878 625 892 688 L226 688 C197 688 174 674 186 652 Z"
      fill="${palette.surface}" stroke="#d6dce6" stroke-width="5" />

    <path d="M244 608 C333 525 487 494 626 534 L760 574 C796 585 822 607 833 633 L271 633 C244 633 232 626 244 608 Z"
      fill="${palette.accent}" fill-opacity="0.92" />

    <rect x="234" y="674" width="670" height="42" rx="20" fill="#ffffff" stroke="#dbe2eb" stroke-width="4" />
    <rect x="274" y="686" width="590" height="16" rx="8" fill="#e8edf4" />

    <path d="M348 579 H657" stroke="#f8fbff" stroke-opacity="0.86" stroke-width="10" stroke-linecap="round" />
    <path d="M374 606 H679" stroke="#f8fbff" stroke-opacity="0.65" stroke-width="8" stroke-linecap="round" />

    <path d="M544 558 C607 546 666 564 711 602" stroke="${palette.detail}" stroke-width="14" stroke-linecap="round" fill="none" />
  `;
}

function artForApparel(palette: Palette): string {
  return `
    <ellipse cx="512" cy="770" rx="250" ry="66" fill="#000" fill-opacity="0.1" />

    <path d="M308 302 L399 224 H625 L716 302 L675 402 L610 356 V764 H414 V356 L349 402 Z"
      fill="${palette.surface}" stroke="#d8dde6" stroke-width="5" />

    <path d="M332 324 L403 255 H621 L692 324 L661 382 L609 344 V745 H415 V344 L363 382 Z"
      fill="${palette.accent}" fill-opacity="0.9" />

    <path d="M460 252 Q512 305 564 252" stroke="#e8edf4" stroke-width="14" fill="none" stroke-linecap="round" />
    <rect x="442" y="414" width="140" height="30" rx="15" fill="#f8fbff" fill-opacity="0.84" />
    <rect x="430" y="470" width="164" height="18" rx="9" fill="#f8fbff" fill-opacity="0.62" />
    <rect x="454" y="525" width="116" height="18" rx="9" fill="#f8fbff" fill-opacity="0.62" />

    <path d="M403 255 L363 332" stroke="${palette.detail}" stroke-opacity="0.5" stroke-width="8" />
    <path d="M621 255 L661 332" stroke="${palette.detail}" stroke-opacity="0.5" stroke-width="8" />
  `;
}

function svgTemplate(job: Job): Buffer {
  const safeLabel = job.label
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const art = job.kind === "shoe" ? artForShoe(job.palette) : artForApparel(job.palette);

  const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${job.palette.bgA}" />
      <stop offset="100%" stop-color="${job.palette.bgB}" />
    </linearGradient>
  </defs>

  <rect width="100%" height="100%" fill="url(#bg)" />

  <circle cx="154" cy="140" r="98" fill="#fff" fill-opacity="0.25" />
  <circle cx="902" cy="162" r="120" fill="#fff" fill-opacity="0.17" />
  <circle cx="872" cy="880" r="138" fill="#fff" fill-opacity="0.14" />

  <g>
    ${art}
  </g>

  <rect x="52" y="52" width="292" height="66" rx="33" fill="#ffffff" fill-opacity="0.65" />
  <text x="198" y="95" text-anchor="middle" font-size="27" font-family="Avenir Next, Arial, sans-serif" fill="#2b3442" font-weight="700">
    ${safeLabel}
  </text>

  <text x="972" y="974" text-anchor="end" font-size="29" font-family="Avenir Next, Arial, sans-serif" fill="#2a3342" fill-opacity="0.4" font-weight="700">
    PULSE
  </text>
</svg>`;

  return Buffer.from(svg.trim());
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function shouldSkip(filepath: string): Promise<boolean> {
  if (FORCE) {
    return false;
  }

  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}

async function createImage(job: Job): Promise<void> {
  const filepath = path.join(OUTPUT_DIR, job.filename);

  if (await shouldSkip(filepath)) {
    return;
  }

  const svg = svgTemplate(job);
  await sharp(svg).png({ compressionLevel: 9 }).toFile(filepath);
}

async function main(): Promise<void> {
  await ensureDir();

  const allJobs = jobs();
  await Promise.all(allJobs.map((job) => createImage(job)));

  const mode = FORCE ? "with --force" : "without --force";
  console.log(`Generated placeholders ${mode} in ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
