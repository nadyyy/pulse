import Link from "next/link";

type FiltersProps = {
  basePath: string;
  current: {
    sort?: string;
    brand?: string;
    size?: string;
    color?: string;
  };
  brands: string[];
  sizes: string[];
  colors: string[];
};

function href(
  basePath: string,
  current: FiltersProps["current"],
  patch: Partial<FiltersProps["current"]>,
): string {
  const query = new URLSearchParams();
  const merged = { ...current, ...patch };

  for (const [key, value] of Object.entries(merged)) {
    if (!value) {
      continue;
    }
    query.set(key, value);
  }

  return `${basePath}?${query.toString()}`;
}

function chip(
  label: string,
  value: string,
  key: keyof FiltersProps["current"],
  basePath: string,
  current: FiltersProps["current"],
  reactKey?: string,
) {
  const active = current[key] === value;
  return (
    <Link
      key={reactKey}
      className={`chip ${active ? "chip-active" : ""}`}
      href={href(basePath, current, { [key]: active ? undefined : value })}
    >
      {label}
    </Link>
  );
}

export function Filters({ basePath, current, brands, sizes, colors }: FiltersProps) {
  return (
    <aside className="filters">
      <h3>Filters</h3>
      <section>
        <h4>Sort</h4>
        <div className="chip-wrap">
          {chip("Newest", "new", "sort", basePath, current)}
          {chip("Price", "price_asc", "sort", basePath, current)}
        </div>
      </section>
      <section>
        <h4>Brand</h4>
        <div className="chip-wrap">
          {brands.map((brand) =>
            chip(brand, brand, "brand", basePath, current, `brand-${brand}`),
          )}
        </div>
      </section>
      <section>
        <h4>Size</h4>
        <div className="chip-wrap">
          {sizes.map((size) =>
            chip(size, size, "size", basePath, current, `size-${size}`),
          )}
        </div>
      </section>
      <section>
        <h4>Color</h4>
        <div className="chip-wrap">
          {colors.map((color) =>
            chip(color, color, "color", basePath, current, `color-${color}`),
          )}
        </div>
      </section>
      <Link className="button ghost" href={basePath}>
        Clear
      </Link>
    </aside>
  );
}
