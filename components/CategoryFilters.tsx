"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Drawer } from "@/components/ui/Drawer";
import { Chip } from "@/components/ui/Chip";
import { Select } from "@/components/ui/Input";

const PRICE_RANGES = [
  { label: "$0 - $80", value: "0-8000" },
  { label: "$80 - $140", value: "8000-14000" },
  { label: "$140+", value: "14000-999999" },
];

type Query = {
  sort?: string;
  brand?: string;
  size?: string;
  color?: string;
  price?: string;
};

function queryHref(basePath: string, query: Query): string {
  const url = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (!value) {
      continue;
    }
    url.set(key, value);
  }
  const built = url.toString();
  return built.length > 0 ? `${basePath}?${built}` : basePath;
}

function FilterBody({
  basePath,
  current,
  brands,
  sizes,
  colors,
  categories,
  onNavigate,
}: {
  basePath: string;
  current: Query;
  brands: string[];
  sizes: string[];
  colors: string[];
  categories: { label: string; href: string }[];
  onNavigate: () => void;
}) {
  const sortValue = current.sort ?? "new";

  return (
    <div className="stack">
      <section className="stack">
        <h4>Sort</h4>
        <Select
          defaultValue={sortValue}
          onChange={(event) => {
            window.location.href = queryHref(basePath, {
              ...current,
              sort: event.target.value,
            });
          }}
        >
          <option value="new">Newest</option>
          <option value="price_asc">Price low to high</option>
          <option value="price_desc">Price high to low</option>
          <option value="best">Best sellers</option>
        </Select>
      </section>

      <section className="stack">
        <h4>Category</h4>
        <div className="chip-wrap">
          {categories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="ui-chip"
              onClick={onNavigate}
            >
              {category.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="stack">
        <h4>Price</h4>
        <div className="chip-wrap">
          {PRICE_RANGES.map((range) => (
            <Link
              key={range.value}
              href={queryHref(basePath, {
                ...current,
                price: current.price === range.value ? undefined : range.value,
              })}
              className={
                current.price === range.value ? "ui-chip ui-chip-active" : "ui-chip"
              }
              onClick={onNavigate}
            >
              {range.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="stack">
        <h4>Size</h4>
        <div className="chip-wrap">
          {sizes.slice(0, 18).map((size) => (
            <Link
              key={size}
              href={queryHref(basePath, {
                ...current,
                size: current.size === size ? undefined : size,
              })}
              className={current.size === size ? "ui-chip ui-chip-active" : "ui-chip"}
              onClick={onNavigate}
            >
              {size}
            </Link>
          ))}
        </div>
      </section>

      <section className="stack">
        <h4>Color</h4>
        <div className="chip-wrap">
          {colors.slice(0, 14).map((color) => (
            <Link
              key={color}
              href={queryHref(basePath, {
                ...current,
                color: current.color === color ? undefined : color,
              })}
              className={current.color === color ? "ui-chip ui-chip-active" : "ui-chip"}
              onClick={onNavigate}
            >
              {color}
            </Link>
          ))}
        </div>
      </section>

      <section className="stack">
        <h4>Brand</h4>
        <div className="chip-wrap">
          {brands.slice(0, 10).map((brand) => (
            <Link
              key={brand}
              href={queryHref(basePath, {
                ...current,
                brand: current.brand === brand ? undefined : brand,
              })}
              className={current.brand === brand ? "ui-chip ui-chip-active" : "ui-chip"}
              onClick={onNavigate}
            >
              {brand}
            </Link>
          ))}
        </div>
      </section>

      <Link
        href={basePath}
        className="ui-btn ui-btn-ghost ui-btn-md"
        onClick={onNavigate}
      >
        Clear Filters
      </Link>
    </div>
  );
}

export function CategoryFilters({
  basePath,
  current,
  brands,
  sizes,
  colors,
  categories,
}: {
  basePath: string;
  current: Query;
  brands: string[];
  sizes: string[];
  colors: string[];
  categories: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);

  const selectedCount = useMemo(
    () =>
      [current.brand, current.size, current.color, current.price].filter(Boolean).length,
    [current.brand, current.color, current.price, current.size],
  );

  return (
    <>
      <div className="catalog-toolbar mobile-only">
        <button
          type="button"
          className="ui-btn ui-btn-ghost ui-btn-sm"
          onClick={() => setOpen(true)}
        >
          Filters {selectedCount > 0 ? `(${selectedCount})` : ""}
        </button>
        <Chip active>{current.sort === "new" ? "Newest" : "Sorted"}</Chip>
      </div>

      <aside className="filters desktop-only">
        <FilterBody
          basePath={basePath}
          current={current}
          brands={brands}
          sizes={sizes}
          colors={colors}
          categories={categories}
          onNavigate={() => null}
        />
      </aside>

      <Drawer open={open} onClose={() => setOpen(false)} title="Filters">
        <FilterBody
          basePath={basePath}
          current={current}
          brands={brands}
          sizes={sizes}
          colors={colors}
          categories={categories}
          onNavigate={() => setOpen(false)}
        />
      </Drawer>
    </>
  );
}
