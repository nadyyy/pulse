"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";

type Variant = {
  id: string;
  size: string | null;
  color: string | null;
  stock: number;
  priceCents: number;
  compareAtCents: number | null;
};

export function ProductBuyBox({
  variants,
  addAction,
}: {
  variants: Variant[];
  addAction: (formData: FormData) => Promise<void>;
}) {
  const sizes = useMemo(
    () =>
      Array.from(
        new Set(variants.map((variant) => variant.size).filter(Boolean)),
      ) as string[],
    [variants],
  );
  const colors = useMemo(
    () =>
      Array.from(
        new Set(variants.map((variant) => variant.color).filter(Boolean)),
      ) as string[],
    [variants],
  );

  const [size, setSize] = useState<string | null>(sizes[0] ?? null);
  const [color, setColor] = useState<string | null>(colors[0] ?? null);

  const selected =
    variants.find((variant) => {
      const sizeMatch = size ? variant.size === size : true;
      const colorMatch = color ? variant.color === color : true;
      return sizeMatch && colorMatch;
    }) ?? variants[0];

  return (
    <aside className="buy-box">
      <p className="price-lg">{formatCurrency(selected.priceCents)}</p>
      {selected.compareAtCents ? (
        <p className="muted strike">{formatCurrency(selected.compareAtCents)}</p>
      ) : null}

      {sizes.length > 0 ? (
        <section className="stack">
          <h3>Select size</h3>
          <div className="chip-wrap">
            {sizes.map((value) => (
              <Chip key={value} active={size === value} onClick={() => setSize(value)}>
                {value}
              </Chip>
            ))}
          </div>
        </section>
      ) : null}

      {colors.length > 0 ? (
        <section className="stack">
          <h3>Select color</h3>
          <div className="chip-wrap">
            {colors.map((value) => (
              <Chip key={value} active={color === value} onClick={() => setColor(value)}>
                {value}
              </Chip>
            ))}
          </div>
        </section>
      ) : null}

      <form action={addAction} className="stack">
        <input type="hidden" name="variantId" value={selected.id} />
        <label className="field">
          <span>Qty</span>
          <Input type="number" name="qty" defaultValue={1} min={1} max={10} />
        </label>
        <Button type="submit" size="lg">
          Add to cart
        </Button>
        <p className="muted">{selected.stock} in stock</p>
      </form>
    </aside>
  );
}
